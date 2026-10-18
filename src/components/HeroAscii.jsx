import { useEffect, useRef } from 'react';

/* Generative ASCII field for the hero background.
   Two vertical chains of diamonds flank the centred hero text, like a
   text-mode wave: each chain's half-width follows |sin| along y, so it swells
   into a diamond, pinches to a single dot, and swells again. The wave drifts
   slowly and the whole chain breathes (its amplitude pulses in and out). The
   glyph in each cell comes from a mirrored ramp — dense letters at the edges
   (the name), digits inward, punctuation at the hollow core — so every row
   reads "LIORBAUM869452I3?!<>=+/:---:/+=<>!?3I254968MUABROIL", with a touch
   of per-cell jitter for texture. The pointer bulges the nearest chain toward
   it (eased), and it relaxes when the cursor rests or leaves.
   - Canvas 2D on a layer between the ambient orbs and the (parked) sparkle
     canvas; glyphs are pre-rendered into a sprite sheet and blitted, capped
     at 30 fps and DPR 2; the loop stops when the tab is hidden or the hero
     scrolls out of view.
   - The hero text column, the fixed nav band and the bottom marquee are
     erased from the field (destination-out) so the type stays crisp and
     nothing in the layout moves.
   - Honors prefers-reduced-motion: one static frame, no pointer response.
   - Colour comes from --color-text so it follows the theme. */

// Core → edge. Index 0 is the lone pinch-point dot.
const RAMP = '·-:/+=<>!?3I254968MUABROIL';
const FPS = 30;
const FONT_PX = 13;

const HeroAscii = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hero = canvas.closest('.hero') || canvas.parentElement;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cw = 8;                        // cell width  (CSS px)
    let ch = 15;                       // cell height (CSS px)
    let grid = new Uint8Array(0);      // ramp index + 1 per cell, 0 = blank
    let sheet = null;                  // sprite sheet of ramp glyphs
    let alpha = 0.26;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    const seed = Math.random() * 100;
    const cur = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0 }; // eased pointer + presence

    const FONT = `${FONT_PX}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const ink = cs.getPropertyValue('--color-text').trim() || '#22211f';
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      alpha = dark ? 0.2 : 0.26;
      return ink;
    };

    // Pre-render every ramp glyph once at device resolution.
    const buildSheet = () => {
      const ink = readTheme();
      sheet = document.createElement('canvas');
      sheet.width = Math.ceil(cw * dpr) * RAMP.length;
      sheet.height = Math.ceil(ch * dpr);
      const sc = sheet.getContext('2d');
      sc.scale(dpr, dpr);
      sc.font = FONT;
      sc.textBaseline = 'middle';
      sc.textAlign = 'center';
      sc.fillStyle = ink;
      for (let i = 0; i < RAMP.length; i++) sc.fillText(RAMP[i], i * cw + cw / 2, ch / 2);
    };

    const resize = () => {
      const r = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(r.width));
      height = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      cw = Math.max(6, ctx.measureText('M').width);
      ch = Math.round(FONT_PX * 1.18);
      cols = Math.ceil(width / cw);
      rows = Math.ceil(height / ch);
      grid = new Uint8Array(cols * rows);
      buildSheet();
      if (reduce) draw(seed + 3);
    };

    // Deterministic per-cell jitter (−1, 0, +1) so the texture doesn't flicker.
    const jitter = (i, j) => {
      const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
      const f = h - Math.floor(h);
      return f < 0.2 ? -1 : f > 0.8 ? 1 : 0;
    };

    const narrow = () => width < 768;

    // The two chains: x as a fraction of the width, their own drift / breath.
    const chains = () => {
      const lx = narrow() ? 0.08 : 0.17;
      return [
        { x: lx, phase: 0.0, drift: 0.22, breath: 0.45 },
        { x: 1 - lx, phase: 1.9, drift: 0.19, breath: 0.38 },
      ];
    };

    // Rasterise one chain of diamonds into the grid.
    const stampChain = (c, t) => {
      const n = RAMP.length;
      const lambda = height / 2.1;                                   // ≈ two diamonds tall
      const Rbase = (narrow() ? 0.36 : 0.26) * Math.min(width, height);
      const R = Rbase * (0.7 + 0.3 * Math.sin(t * c.breath + c.phase)); // breathe in / out
      const cx0 = c.x * width;
      for (let j = 0; j < rows; j++) {
        const y = j * ch + ch / 2;
        // pointer: bulge toward the cursor near its row, fade with distance
        let cx = cx0;
        let hw = R * Math.abs(Math.sin((Math.PI * y) / lambda + t * c.drift + c.phase));
        if (cur.a > 0.01) {
          const dy = (y - cur.y) / (height * 0.22);
          const f = Math.exp(-dy * dy) * cur.a;
          const dx = cur.x - cx0;
          const near = Math.exp(-(dx * dx) / (2 * (width * 0.22) ** 2)); // only the chain the cursor is near
          hw += R * 0.6 * f * near;
          cx += dx * 0.35 * f * near;
        }
        const row = j * cols;
        if (hw < cw * 0.6) {
          // pinch point between two diamonds: a lone dot on the axis
          const i = Math.round(cx / cw);
          if (i >= 0 && i < cols) grid[row + i] = 1;
          continue;
        }
        const i0 = Math.max(0, Math.floor((cx - hw) / cw));
        const i1 = Math.min(cols - 1, Math.ceil((cx + hw) / cw));
        for (let i = i0; i <= i1; i++) {
          const x = i * cw + cw / 2;
          const u = Math.abs(x - cx) / hw;                 // 0 at the core → 1 at the edge
          if (u > 1) continue;
          let idx = 1 + Math.floor(u * (n - 1)) + jitter(i, j);
          if (idx < 1) idx = 1;
          if (idx > n - 1) idx = n - 1;
          grid[row + i] = 1 + idx;
        }
      }
    };

    // destination-out eraser: a rectangle with feathered edges + corners.
    const eraseSoftRect = (x, y, w, h, f) => {
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(x, y, w, h);
      const strip = (gx0, gy0, gx1, gy1, rx, ry, rw, rh) => {
        const g = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(rx, ry, rw, rh);
      };
      strip(x, 0, x - f, 0, x - f, y, f, h);                 // left
      strip(x + w, 0, x + w + f, 0, x + w, y, f, h);         // right
      strip(0, y, 0, y - f, x, y - f, w, f);                 // top
      strip(0, y + h, 0, y + h + f, x, y + h, w, f);         // bottom
      for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, f);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - f, cy - f, f, f);
        ctx.fillRect(cx, cy - f, f, f);
        ctx.fillRect(cx - f, cy, f, f);
        ctx.fillRect(cx, cy, f, f);
      }
    };

    const draw = (t) => {
      grid.fill(0);
      for (const c of chains()) stampChain(c, t);

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = alpha;
      const sw = Math.ceil(cw * dpr);
      const sh = Math.ceil(ch * dpr);
      for (let j = 0; j < rows; j++) {
        const row = j * cols;
        const y = j * ch;
        for (let i = 0; i < cols; i++) {
          const v = grid[row + i];
          if (!v) continue;
          ctx.drawImage(sheet, (v - 1) * sw, 0, sw, sh, i * cw, y, cw, ch);
        }
      }
      ctx.globalAlpha = 1;

      // Keep the type crisp: erase the field under the hero text column, the
      // fixed nav band and the marquee. The chains stay at the sides.
      ctx.globalCompositeOperation = 'destination-out';
      const hr = hero.getBoundingClientRect();
      const content = hero.querySelector('.hero-content');
      if (content) {
        const crc = content.getBoundingClientRect();
        const padX = narrow() ? 40 : 56;
        const padY = 40;
        eraseSoftRect(crc.left - hr.left - padX, crc.top - hr.top - padY, crc.width + padX * 2, crc.height + padY * 2, 64);
      }
      const marquee = hero.querySelector('.hero-marquee');
      if (marquee) {
        const mr = marquee.getBoundingClientRect();
        const top = mr.top - hr.top - 48;
        const g = ctx.createLinearGradient(0, top, 0, mr.top - hr.top);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = g;
        ctx.fillRect(0, top, width, height - top);
      }
      {
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const g = ctx.createLinearGradient(0, 0, 0, navH + 40);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(0.6, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, navH + 40);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const frame = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (now - last < 1000 / FPS) return;
      last = now;
      cur.x += (cur.tx - cur.x) * 0.1;
      cur.y += (cur.ty - cur.y) * 0.1;
      cur.a += (cur.ta - cur.a) * 0.06;
      draw(now / 1000 + seed);
    };

    const start = () => {
      if (reduce || running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e) => {
      if (reduce) return;
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
      cur.tx = x;
      cur.ty = y;
      cur.ta = inside ? 1 : 0;
      if (inside && cur.a < 0.01) { cur.x = x; cur.y = y; }
    };
    const onLeave = () => { cur.ta = 0; };

    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    resize();

    const themeObs = new MutationObserver(() => { buildSheet(); if (reduce) draw(seed + 3); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onVis = () => { if (document.hidden) stop(); else if (visible) start(); };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([en]) => {
      visible = !!en?.isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    }, { threshold: 0.02 });
    io.observe(hero);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    if (!reduce) start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-ascii" aria-hidden="true" />;
};

export default HeroAscii;
