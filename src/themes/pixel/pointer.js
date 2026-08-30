/* ═══════════════════════════════════════════════════════════════════════
   POINTER — one listener for the whole theme
   ═══════════════════════════════════════════════════════════════════════

   The hero field, the marquee type and (potentially) every plate all want the
   cursor position. Each installing its own `pointermove` handler means N
   handlers firing at pointer rate — which on a page with a field plus eight
   plates is most of a frame's budget spent dispatching the same event.

   One listener writes into a shared object; everything else reads it during
   its own render. Nothing subscribes, so there is no dispatch cost at all:
   readers sample the latest value when they happen to draw.

   Installed lazily on first read and never removed — it outlives any single
   component, and a passive listener on window costs nothing when idle.
   ═══════════════════════════════════════════════════════════════════════ */

const pointer = {
  x: -1,
  y: -1,
  /** True once the pointer has been seen and has not left the window. */
  active: false,
  /** performance.now() of the last actual move — used for idle detection. */
  lastMove: 0,
};

let installed = false;

const install = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const onMove = (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    pointer.lastMove = performance.now();
  };
  const onLeave = () => { pointer.active = false; };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });
  window.addEventListener('blur', onLeave, { passive: true });
};

/** The shared, live pointer state. Read it; do not hold a copy. */
export const getPointer = () => {
  install();
  return pointer;
};

/** Test hook — drive the pointer without dispatching real events. */
export const setPointerForTest = (x, y, active = true) => {
  install();
  pointer.x = x;
  pointer.y = y;
  pointer.active = active;
  pointer.lastMove = performance.now();
};
