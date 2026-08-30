import { RAMP, makeThresholds, quantise } from './ramp.js';
import { MOTIFS } from './motifs.js';

/* ═══════════════════════════════════════════════════════════════════════
   DITHER PLATE
   ═══════════════════════════════════════════════════════════════════════

   The same quantiser as the hero field, applied to an arbitrary element
   instead of the viewport — so thumbnails, figures and the portrait belong
   to the hero rather than sitting next to it.

   mountPlate(canvasEl) → { destroy(), setHeat(0..1) }

   Read from data attributes on the canvas:
     data-cell      cell size in px            (default: the --cell token)
     data-seed      threshold + motif seed     (default 1)
     data-motif     procedural field name      (default 'flow')
     data-src       image URL — takes priority over the motif
     data-contrast  contrast multiplier        (default 1)
     data-invert    present/"true" to invert

   Two rules carried over from the hero, for the same reasons:
   - Thresholds are STATIC per resize. Never regenerate them per frame.
   - Cells paint at (x*cell+1, y*cell+1, cell-1, cell-1) so the 1px gutter
     lands on the background rule.

   Plates throttle to 20fps, separately from the hero's 30 — a thumbnail does
   not need the hero's cadence, and eight of them do.
   ═══════════════════════════════════════════════════════════════════════ */

const FRAME_MS = 1000 / 20;
const DPR_CAP = 2;
const HOVER_GAIN = 0.55;      // how far hover pushes the ramp up
const HOVER_EASE = 0.18;      // per-frame approach to target
const IMAGE_ANIM = 0.10;      // gentle drift so image plates aren't frozen
/* Plates need a FINER cell than the hero: at the hero's 9px a 240px thumbnail
   is only 27x20 samples, which cannot resolve a face or a UI. Derived from
   --cell rather than being its own token, so the Cell L/M/S control still
   drives everything from one source of truth. */
const PLATE_CELL_RATIO = 0.45;

const readCellToken = () => {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
  const base = Number.isFinite(v) && v > 0 ? v : 9;
  return Math.max(3, Math.round(base * PLATE_CELL_RATIO));
};

export function mountPlate(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const ds = canvas.dataset;

  const seed = Number(ds.seed) || 1;
  const contrast = ds.contrast !== undefined ? Number(ds.contrast) : 1;
  /* invert: 'true' | 'false' | 'auto' (default).
     AUTO is the right default because it depends on the source, not on taste:
     a light-ground UI screenshot must be inverted or its white canvas maps to
     the HOTTEST stop and the plate reads as a solid slab; a dark image must
     NOT be, or it blanks out. Deciding per-image from the actual mean removes
     the guess. */
  const invertMode = ds.invert === undefined || ds.invert === 'auto'
    ? 'auto'
    : (ds.invert === '' || ds.invert === 'true');
  const motifFn = MOTIFS[ds.motif] || MOTIFS.flow;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cell = Number(ds.cell) || readCellToken();
  let cols = 0, rows = 0, width = 0, height = 0;
  let thresholds = new Float32Array(0);
  let samples = null;           // Float32Array of image luminance, or null

  let heat = 0, heatTarget = 0;
  let t = 0, last = 0, acc = 0, rafId = 0, running = false, painted = false;

  const buckets = Array.from({ length: RAMP.length }, () => []);

  /* ── Image source ─────────────────────────────────────────────────────
     Downsample to exactly one luminance sample per cell, cover-fit. */
  const buildSamples = (img) => {
    if (!cols || !rows) return;
    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const octx = off.getContext('2d', { willReadFrequently: true });
    // Paint the ground white FIRST. Transparent source pixels otherwise come
    // back as rgb(0,0,0) with alpha 0, and a luminance pass that ignores alpha
    // reads them as solid black — a PNG/WebP with transparency would dither as
    // if it were a dark photograph.
    octx.fillStyle = '#FFFFFF';
    octx.fillRect(0, 0, cols, rows);
    const scale = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    octx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);

    let data;
    try {
      data = octx.getImageData(0, 0, cols, rows).data;
    } catch {
      // Canvas is tainted (cross-origin, or file://). Fall back to the motif
      // rather than throwing and killing the plate.
      samples = null;
      return;
    }

    const out = new Float32Array(cols * rows);
    let lo = 1, hi = 0, rawMean = 0;
    for (let i = 0, p = 0; i < out.length; i++, p += 4) {
      const lum = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
      out[i] = lum;
      rawMean += lum;
      if (lum < lo) lo = lum;
      if (lum > hi) hi = lum;
    }
    rawMean /= out.length;
    // Light source → invert, so the ground stays unpainted and the page shows
    // through. Dark source → leave it, or it blanks out.
    const invert = invertMode === 'auto' ? rawMean > 0.55 : invertMode;
    // Auto-level, in two steps.
    // 1. Stretch the actual tonal range across the ramp, so a low-contrast
    //    source does not collapse into one or two stops.
    const span = hi - lo > 0.02 ? hi - lo : 1;
    let mean = 0;
    for (let i = 0; i < out.length; i++) {
      out[i] = (out[i] - lo) / span;
      mean += out[i];
    }
    mean /= out.length;

    // 2. Gamma so the image's MEAN lands mid-ramp. A stretch alone leaves a
    //    typical photo's bulk in the upper half, which quantises almost
    //    entirely to red and chartreuse and reads as a flat hot slab rather
    //    than a picture. Centring the mean makes all five stops carry tone.
    // CLAMP the mean rather than bailing out. Guarding with `mean < 0.98 ? … : 1`
    // disables the correction exactly when it is most needed: an almost-entirely
    // light source keeps a mean near 1, gets no gamma, and then inverting wipes
    // it to a blank plate.
    const m = Math.min(0.95, Math.max(0.05, mean));
    const gamma = Math.log(0.5) / Math.log(m);

    for (let i = 0; i < out.length; i++) {
      let v = Math.pow(out[i], gamma);
      v = (v - 0.5) * contrast + 0.5;
      if (invert) v = 1 - v;
      out[i] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
    samples = out;
  };

  let image = null;
  const loadImage = () => {
    if (!ds.src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { image = img; buildSamples(img); render(); };
    img.onerror = () => { image = null; samples = null; };
    img.src = ds.src;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (!Number(ds.cell)) cell = readCellToken();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    width = w; height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    thresholds = makeThresholds(cols, rows, seed);
    if (image) buildSamples(image);
  };

  const render = () => {
    if (!cols || !rows) return;
    painted = true;
    for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;

    const paint = cell - 1;
    const warm = 1 + HOVER_GAIN * heat;

    for (let y = 0; y < rows; y++) {
      const row = y * cols;
      const v = (y + 0.5) / rows;
      for (let x = 0; x < cols; x++) {
        const i = row + x;
        let value;
        if (samples) {
          // Keep the image legible: motion is a gentle modulation, not a wash.
          value = samples[i] * (1 + Math.sin((x * 0.25) + (y * 0.18) + t) * IMAGE_ANIM);
        } else {
          value = motifFn((x + 0.5) / cols, v, t, seed);
        }
        const idx = quantise(value * warm, thresholds[i]);
        if (idx <= 0) continue;
        buckets[idx].push(x * cell + 1, y * cell + 1);
      }
    }

    ctx.clearRect(0, 0, width, height);
    for (let b = 1; b < buckets.length; b++) {
      const list = buckets[b];
      if (!list.length) continue;
      ctx.fillStyle = RAMP[b];
      for (let k = 0; k < list.length; k += 2) ctx.fillRect(list[k], list[k + 1], paint, paint);
    }
  };

  const loop = (now) => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (!last) last = now;
    const dt = now - last;
    last = now;
    acc += dt;
    if (acc < FRAME_MS) return;
    const steps = Math.min(acc / FRAME_MS, 3);
    acc %= FRAME_MS;

    const easedTo = heat + (heatTarget - heat) * (reduceMotion ? 1 : HOVER_EASE);
    const settled = Math.abs(easedTo - heat) < 0.001 && Math.abs(heatTarget - heat) < 0.001;
    heat = settled ? heatTarget : easedTo;
    if (!reduceMotion) t += 0.05 * steps;

    // Reduced motion: render one static frame and hold it, but still respond
    // to hover (that is a direct response to input, not ambient motion).
    if (reduceMotion && painted && settled) return;
    render();
  };

  const start = () => { if (running) return; running = true; last = 0; acc = FRAME_MS; rafId = requestAnimationFrame(loop); };
  const stop = () => { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; };

  /* ── Interaction ──────────────────────────────────────────────────────
     Hover and focus raise a heat value that eases toward its target and
     multiplies the field, so the plate warms up the ramp. Focus is taken
     from the nearest focusable ancestor, so a plate inside a link or button
     warms on keyboard focus too. */
  const host = canvas.closest('a, button, [tabindex]') || canvas.parentElement || canvas;
  const warmOn = () => { heatTarget = 1; start(); };
  const warmOff = () => { heatTarget = 0; };
  host.addEventListener('pointerenter', warmOn);
  host.addEventListener('pointerleave', warmOff);
  host.addEventListener('focusin', warmOn);
  host.addEventListener('focusout', warmOff);

  const io = new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) start(); else stop(); },
    { threshold: 0 }
  );
  io.observe(canvas);

  const ro = new ResizeObserver(() => { resize(); render(); });
  ro.observe(canvas);

  resize();
  loadImage();
  render();

  return {
    setHeat(v) { heatTarget = Math.max(0, Math.min(1, v)); start(); },
    _step(n = 1) { for (let k = 0; k < n; k++) { t += 0.05; heat += (heatTarget - heat) * HOVER_EASE; render(); } },
    _debug() { return { cols, rows, cell, source: samples ? 'image' : 'motif', heat }; },
    destroy() {
      stop();
      io.disconnect(); ro.disconnect();
      host.removeEventListener('pointerenter', warmOn);
      host.removeEventListener('pointerleave', warmOff);
      host.removeEventListener('focusin', warmOn);
      host.removeEventListener('focusout', warmOff);
    },
  };
}
