import { RAMP, STOPS, makeThresholds, quantise } from './ramp.js';
import { getPointer } from './pointer.js';

/* ═══════════════════════════════════════════════════════════════════════
   PIXEL TYPE — headline drawn as cells, not as text
   ═══════════════════════════════════════════════════════════════════════

   The reference's technique (its `measureType`): render the string into an
   offscreen canvas AT CELL RESOLUTION, read the bitmap back, and use it as a
   mask — paint a cell only where the glyph covers it. Sampling at cell
   resolution rather than downscaling a full-res render is what keeps the
   edges crisp: one text pixel IS one cell, so glyphs snap to the grid
   instead of anti-aliasing into mush.

   MARQUEE: the line is never wrapped. It is rendered once, measured, and
   tiled modulo its own width while the offset scrolls (`mc = (so+lc)%txtW`).
   The glyphs are then sized so ONE repeat spans the page, which is what makes
   the whole sentence readable across the full width instead of a few letters
   filling the screen.

   COLOUR: follows the reference's `stampDisk` — a FIXED base colour with a
   minority of cells flickering to accents, re-rolled on a slow tick rather
   than per frame ("~18% of cells flicker to accents, retimed to ~7fps"). A
   noise field would tint whole regions and lose the even amber body.
   ═══════════════════════════════════════════════════════════════════════ */

const FRAME_MS = 1000 / 30;
const SCROLL = 11;                      // marquee speed, cells/sec
/* One repeat may run slightly past the page so the glyphs can be larger. At
   1.0 the sentence exactly fits and the type is as small as it can be; much
   above ~1.2 and too little of the sentence is on screen at once. */
const REPEAT_SPAN = 5;
const DPR_CAP = 2;

const BASE_IDX = 3;                    // amber — the body of the letterforms
const ACCENTS = [1, 2, 4, 5];          // navy, blue, red, neon
const ACCENT_RATE = 0.22;
const ACCENT_MS = 140;                 // ≈7fps re-roll

/* Type runs on the SAME cell as the hero field and the page's background grid,
   so the letterforms are built from the same squares as everything else. It
   costs glyph resolution — half the cells per letter compared with a finer
   module — which is why the block height carries the size instead. */
const TYPE_CELL_RATIO = 1;

/* The cursor brush behaves here exactly as it does over the field band: a
   radial stamp that decays, quantised through the same ramp. It paints on the
   empty ground AND heats the letterforms it passes over. */
const BRUSH_GAIN = 1.55;
const BRUSH_DECAY = 0.82;

/** Cheap deterministic hash → 0..1. */
const hsh = (a, b) => {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function mountPixelType(canvas, { lines = [], text = '', gap = '   ', weight = 400 } = {}) {
  const marquee = !!text;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d', { willReadFrequently: true });

  let cell = 5, W = 0, H = 0, cols = 0, rows = 0;
  let bits = null, maskCols = 0;
  let brush = new Float32Array(0), thresholds = new Float32Array(0);
  let pointerCol = -1, pointerRow = -1, pointerOn = false, testPointer = false;
  let clock = 0, scroll = 0, last = 0, acc = 0, rafId = 0, running = false;
  const buckets = Array.from({ length: RAMP.length }, () => []);

  const readCell = () => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
    const base = Number.isFinite(v) && v > 0 ? v : 9;
    return Math.max(4, Math.round(base * TYPE_CELL_RATIO));
  };
  const fontStack = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
    || 'sans-serif';

  /** Build the glyph mask at one bitmap pixel per cell. */
  const buildMask = () => {
    if (!cols || !rows) { bits = null; return; }

    if (marquee) {
      const str = text + gap;
      // Start from the block height, then shrink until ONE repeat spans the
      // page. Without this cap a long sentence at full height is several
      // screens wide and only a few letters are ever visible.
      let size = rows * 0.86;
      const span = cols * REPEAT_SPAN;
      for (let guard = 0; guard < 24; guard++) {
        mctx.font = `${weight} ${size}px ${fontStack()}`;
        const w = mctx.measureText(str).width;
        if (w <= span || size <= 4) break;
        size *= span / w;
      }
      mctx.font = `${weight} ${size}px ${fontStack()}`;
      maskCols = Math.max(1, Math.ceil(mctx.measureText(str).width));
      mask.width = maskCols;
      mask.height = rows;
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.clearRect(0, 0, maskCols, rows);
      mctx.font = `${weight} ${size}px ${fontStack()}`;
      mctx.textAlign = 'left';
      mctx.textBaseline = 'middle';
      mctx.fillStyle = '#000';
      mctx.fillText(str, 0, rows / 2);
      const data = mctx.getImageData(0, 0, maskCols, rows).data;
      bits = new Uint8Array(maskCols * rows);
      for (let i = 0, p = 3; i < bits.length; i++, p += 4) bits[i] = data[p] > 90 ? 1 : 0;
      return;
    }

    if (!lines.length) { bits = null; return; }
    mask.width = cols;
    mask.height = rows;
    maskCols = cols;
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.clearRect(0, 0, cols, rows);
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#000';

    const lh = rows / (lines.length + 0.25);
    let size = lh * 0.92;
    for (let guard = 0; guard < 24; guard++) {
      mctx.font = `${weight} ${size}px ${fontStack()}`;
      const widest = Math.max(...lines.map((l) => mctx.measureText(l).width));
      if (widest <= cols * 0.96 || size <= 4) break;
      size *= (cols * 0.96) / widest;
    }
    mctx.font = `${weight} ${size}px ${fontStack()}`;
    const y0 = rows / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((line, i) => mctx.fillText(line, cols / 2, y0 + i * lh));

    const data = mctx.getImageData(0, 0, cols, rows).data;
    bits = new Uint8Array(cols * rows);
    for (let i = 0, p = 3; i < bits.length; i++, p += 4) bits[i] = data[p] > 90 ? 1 : 0;
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cell = readCell();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / cell);
    rows = Math.ceil(H / cell);
    brush = new Float32Array(cols * rows);
    thresholds = makeThresholds(cols, rows, 0x9e37);
    buildMask();
  };

  /** Brush radius in TYPE cells, converted from the field's radius in its own
   *  (coarser) cells so the blob is the same physical size on both. */
  const brushRadius = () => {
    const cs = getComputedStyle(document.documentElement);
    const r = parseFloat(cs.getPropertyValue('--brush')) || 10;
    const fieldCell = parseFloat(cs.getPropertyValue('--cell')) || 9;
    return Math.max(2, (r * fieldCell) / cell);
  };

  const stampBrush = () => {
    samplePointer();
    for (let i = 0; i < brush.length; i++) brush[i] *= BRUSH_DECAY;
    if (!pointerOn || pointerCol < 0) return;
    const R = brushRadius();
    const minX = Math.max(0, Math.floor(pointerCol - R)), maxX = Math.min(cols - 1, Math.ceil(pointerCol + R));
    const minY = Math.max(0, Math.floor(pointerRow - R)), maxY = Math.min(rows - 1, Math.ceil(pointerRow + R));
    for (let y = minY; y <= maxY; y++) {
      const dy = y - pointerRow, row = y * cols;
      for (let x = minX; x <= maxX; x++) {
        const dx = x - pointerCol;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > R) continue;
        const v = Math.min(1, (1 - d / R) * BRUSH_GAIN);
        if (v > brush[row + x]) brush[row + x] = v;
      }
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, W, H);
    if (!bits) return;
    for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;
    const paint = cell - 1;
    const tick = Math.floor(clock / ACCENT_MS);
    stampBrush();

    for (let y = 0; y < rows; y++) {
      const row = y * cols;
      for (let x = 0; x < cols; x++) {
        // Tile the mask modulo its own width — that wrap is the marquee.
        const mx = marquee ? ((((scroll | 0) + x) % maskCols) + maskCols) % maskCols : x;
        const onGlyph = bits[y * maskCols + mx];
        const heat = brush[row + x];
        let idx = 0;

        if (onGlyph) {
          // Keyed on the MASK column, not the screen column, so the colours
          // travel with the letters instead of shimmering underneath them.
          idx = hsh(mx * 1.7 + 0.3, y * 1.1 + tick * 3.7) < ACCENT_RATE
            ? ACCENTS[(hsh(mx + tick * 2.1, y - tick * 1.3) * ACCENTS.length) | 0]
            : BASE_IDX;
          // The brush heats the letterforms it passes over — it never cools
          // them, so a glyph can only get hotter under the cursor.
          const hot = quantise(heat, thresholds[row + x]);
          if (hot > idx) idx = hot;
        } else if (heat > 0) {
          // Off the glyphs the brush paints the bare ground, exactly as it
          // does over the field band.
          idx = quantise(heat, thresholds[row + x]);
        }

        if (idx <= 0) continue;
        if (idx > STOPS) idx = STOPS;
        buckets[idx].push(x * cell + 1, y * cell + 1);
      }
    }
    for (let b = 1; b < buckets.length; b++) {
      const list = buckets[b];
      if (!list.length) continue;
      ctx.fillStyle = RAMP[b];
      for (let k = 0; k < list.length; k += 2) ctx.fillRect(list[k], list[k + 1], paint, paint);
    }
  };

  const loop = (t) => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (!last) last = t;
    acc += t - last;
    last = t;
    if (acc < FRAME_MS) return;
    const steps = Math.min(acc / FRAME_MS, 3);
    acc %= FRAME_MS;
    if (!reduceMotion) {
      clock += steps * FRAME_MS;
      if (marquee) scroll += SCROLL * ((steps * FRAME_MS) / 1000);
    }
    render();
  };

  const start = () => { if (running) return; running = true; last = 0; acc = FRAME_MS; rafId = requestAnimationFrame(loop); };
  const stop = () => { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; };

  /* Sampled from the shared pointer during render, so this canvas adds no
     pointermove handler of its own. */
  const samplePointer = () => {
    if (testPointer) return;
    const ptr = getPointer();
    const r = canvas.getBoundingClientRect();
    const inside = ptr.active
      && ptr.x >= r.left && ptr.x <= r.right && ptr.y >= r.top && ptr.y <= r.bottom;
    pointerOn = inside;
    if (!inside) return;
    pointerCol = Math.floor((ptr.x - r.left) / cell);
    pointerRow = Math.floor((ptr.y - r.top) / cell);
  };

  const ro = new ResizeObserver(() => { resize(); render(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }, { threshold: 0 });
  io.observe(canvas);

  // Webfonts land after first paint; without this the mask is built from the
  // fallback face and the glyphs are subtly wrong.
  if (document.fonts?.ready) document.fonts.ready.then(() => { buildMask(); render(); });

  resize();
  render();
  start();

  return {
    _debug: () => ({ cols, rows, cell, maskCols, lit: bits ? bits.reduce((a, b) => a + b, 0) : 0 }),
    _setPointer(x, y) {
      testPointer = true;
      const r = canvas.getBoundingClientRect();
      pointerOn = true;
      pointerCol = Math.floor((x - r.left) / cell);
      pointerRow = Math.floor((y - r.top) / cell);
    },
    destroy() { stop(); ro.disconnect(); io.disconnect(); },
  };
}
