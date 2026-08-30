/* ═══════════════════════════════════════════════════════════════════════
   CARD MOSAIC — the hover reveal on work cards
   ═══════════════════════════════════════════════════════════════════════

   Reimplemented from the reference's measured behaviour. Two things make it
   what it is, and both are easy to get wrong:

   1. The blocks are sampled from THE IMAGE ITSELF — a cover-fit downsample to
      one pixel per block, drawn back as flat squares. This is NOT the heat
      ramp; the card keeps its own colours.
   2. Density is driven by distance to the NEAREST CORNER, not the centre and
      not the pointer. Corners crumble first and the decay eats inward, which
      is why the effect reads as the image coming apart rather than as a
      spotlight following the cursor.

   One shared canvas, fixed over the whole viewport, drawing only the hovered
   card. Per-card canvases would mean one rAF loop per card.
   ═══════════════════════════════════════════════════════════════════════ */

const BL = 14;                 // block size in px
const GUTTER = 1;              // painted square is BL - 1
const TICK_MS = 90;            // the twinkle re-rolls on this cadence, not per frame
const REACH = 0.62;            // corner falloff, as a fraction of min(cols, rows)
const DPR_CAP = 2;

/** Cheap deterministic hash → 0..1. Same shape the reference uses. */
const hsh = (a) => {
  const n = Math.sin(a) * 43758.5453;
  return n - Math.floor(n);
};

export function mountCardMosaic(container) {
  // Pointer devices only — there is no hover on touch, and running this there
  // would just burn battery.
  if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    return () => {};
  }
  const media = [...container.querySelectorAll('.csm img, .csm video')];
  if (!media.length) return () => {};

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:5;pointer-events:none;';
  document.body.appendChild(cv);

  const ctx = cv.getContext('2d');
  const off = document.createElement('canvas');
  const offc = off.getContext('2d', { willReadFrequently: true });

  let W = 0, H = 0, dpr = 1, target = null, rafId = 0;

  const size = () => {
    W = window.innerWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener('resize', size, { passive: true });

  const enters = [];
  media.forEach((m) => {
    const host = m.closest('.csm') || m;
    const onEnter = () => { target = m; };
    const onLeave = () => { if (target === m) target = null; };
    host.addEventListener('mouseenter', onEnter);
    host.addEventListener('mouseleave', onLeave);
    enters.push([host, onEnter, onLeave]);
  });

  const loop = (ts) => {
    rafId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    if (!target) return;

    const host = target.closest('.csm') || target.parentNode;
    const r = host.getBoundingClientRect();
    const mw = target.videoWidth || target.naturalWidth;
    const mh = target.videoHeight || target.naturalHeight;
    if (!(r.width > 0 && r.bottom > 0 && r.top < H && mw && mh)) return;

    const cols = Math.floor(r.width / BL);
    const rows = Math.floor(r.height / BL);
    if (cols < 2 || rows < 2) return;
    if (off.width !== cols || off.height !== rows) { off.width = cols; off.height = rows; }

    // Cover-fit sample of the media, measured against the VISIBLE .csm box —
    // the media element itself is scaled (1.14), so using its own box would
    // misalign every block.
    const sc = Math.max(r.width / mw, r.height / mh);
    const cw = r.width / sc, ch = r.height / sc;
    let data;
    try {
      offc.drawImage(target, (mw - cw) / 2, (mh - ch) / 2, cw, ch, 0, 0, cols, rows);
      data = offc.getImageData(0, 0, cols, rows).data;
    } catch {
      return;   // tainted canvas — skip rather than throw
    }

    // Reduced motion: hold one static arrangement rather than re-rolling.
    const step = reduceMotion ? 0 : Math.floor((ts || 0) / TICK_MS);
    const reach = Math.min(cols, rows) * REACH;
    const s = BL - GUTTER;
    const left = Math.round(r.left), top = Math.round(r.top);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        // Distance to the nearest CORNER.
        const dcx = Math.min(i, cols - 1 - i);
        const dcy = Math.min(j, rows - 1 - j);
        const d = Math.sqrt(dcx * dcx + dcy * dcy);
        let p = 1 - d / reach;
        if (p <= 0) continue;
        p *= p;                                            // densest right at the corners
        if (hsh(i * 12.9 + j * 78.2 + step * 3.1) > p) continue;   // twinkle → crumbling
        const k = (j * cols + i) * 4;
        ctx.fillStyle = `rgb(${data[k]},${data[k + 1]},${data[k + 2]})`;
        ctx.fillRect(left + i * BL, top + j * BL, s, s);
      }
    }
  };
  rafId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', size);
    enters.forEach(([host, onEnter, onLeave]) => {
      host.removeEventListener('mouseenter', onEnter);
      host.removeEventListener('mouseleave', onLeave);
    });
    cv.remove();
  };
}
