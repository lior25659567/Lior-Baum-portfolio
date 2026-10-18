import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AsciiField.css';

/* AsciiField — generative text-mode background for the page heroes.
   One Canvas 2D engine, three curved variants (picked per page):
     diamonds  Home     — two vertical chains of breathing diamonds flanking
                          the text (half-width follows |sin| down the page,
                          pinch dots between diamonds); the pointer bulges the
                          nearest chain toward it.
     ribbons   About    — three horizontal ribbons that undulate across the
                          full width and breathe in thickness; the pointer
                          bends the nearest ribbon toward it.
     ripples   Playground — breathing elliptical rings expanding from a slowly
                          wandering source; the pointer becomes a second source.
   Shared: glyphs come from one mirrored ramp (dense name letters at the
   edges, digits inward, punctuation at the hollow core), pre-rendered into a
   sprite sheet and blitted at 30 fps, DPR ≤ 2. Glyphs whose cell sits under a
   line of type (textSelectors) are drawn at 30% opacity — decided per
   character, so there is no gradient box. A GSAP intro grows the field in on
   mount (amplitude + alpha), skipped under prefers-reduced-motion (one static
   frame, no pointer response). Stops when the tab is hidden or the host
   scrolls out of view. Colour follows --color-text. */

// Core → edge. Index 0 is the lone pinch-point dot.
const RAMP = '·-:/+=<>!?3I254968MUABROIL';
const FPS = 30;
const FONT_PX = 13;

const AsciiField = ({
  variant = 'diamonds',
  hostSelector,            // element whose box/visibility we follow; default: parent
  textSelectors = [],      // lines of type the glyphs go quiet under
  bottomFadeSelector,      // element above which the field fades out (e.g. a marquee)
  fadeBottom = 0,          // or a plain fade over the last N px
  fadeNav = false,         // fade the band under the fixed nav (host starts at page top)
  intro = true,            // GSAP grow-in on mount
  className = '',
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = (hostSelector && canvas.closest(hostSelector)) || canvas.parentElement;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cw = 8;
    let ch = 15;
    let grid = new Uint8Array(0);
    let under = new Uint8Array(0);
    let cellAlpha = new Float32Array(0);   // per-glyph brightness (variants may shape it)
    let sheet = null;
    let alpha = 0.26;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    const seed = Math.random() * 100;
    const cur = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0 };
    const reveal = { v: reduce || !intro ? 1 : 0 };
    let introTween = null;

    const FONT = `${FONT_PX}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
    const narrow = () => width < 768;
    const n = RAMP.length;

    let inkColor = '#22211f';
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const ink = cs.getPropertyValue('--color-text').trim() || '#22211f';
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      alpha = dark ? 0.2 : 0.26;
      inkColor = ink;
      return ink;
    };

    const buildSheet = () => {
      const ink = readTheme();
      sheet = document.createElement('canvas');
      sheet.width = Math.ceil(cw * dpr) * n;
      sheet.height = Math.ceil(ch * dpr);
      const sc = sheet.getContext('2d');
      sc.scale(dpr, dpr);
      sc.font = FONT;
      sc.textBaseline = 'middle';
      sc.textAlign = 'center';
      sc.fillStyle = ink;
      for (let i = 0; i < n; i++) sc.fillText(RAMP[i], i * cw + cw / 2, ch / 2);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(r.width));
      height = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      cw = Math.max(6, ctx.measureText('M').width);
      ch = Math.round(FONT_PX * 1.18);
      cols = Math.ceil(width / cw);
      rows = Math.ceil(height / ch);
      grid = new Uint8Array(cols * rows);
      under = new Uint8Array(cols * rows);
      cellAlpha = new Float32Array(cols * rows);
      buildSheet();
      if (reduce) draw(seed + 3);
    };

    // Deterministic per-cell jitter (−1, 0, +1) so the texture doesn't flicker.
    const jitter = (i, j) => {
      const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
      const f = h - Math.floor(h);
      return f < 0.2 ? -1 : f > 0.8 ? 1 : 0;
    };
    const put = (i, j, u) => {
      let idx = 1 + Math.floor(Math.min(1, Math.max(0, u)) * (n - 1)) + jitter(i, j);
      if (idx < 1) idx = 1;
      if (idx > n - 1) idx = n - 1;
      grid[j * cols + i] = 1 + idx;
    };
    const dot = (i, j) => { if (i >= 0 && i < cols && j >= 0 && j < rows) grid[j * cols + i] = 1; };

    // ── Variant: diamonds (Home) ──
    const diamonds = (t) => {
      const lx = narrow() ? 0.08 : 0.17;
      const Rbase = (narrow() ? 0.36 : 0.26) * Math.min(width, height) * reveal.v;
      // Each chain has its own diamond height, breathing pace and drift
      // direction, so the two never move in lockstep.
      const chains = [
        { cx: lx * width, phase: 0.0, drift: 0.22, breath: 0.5, lambda: height / 2.1, amp: 1.0 },
        { cx: (1 - lx) * width, phase: 1.9, drift: -0.17, breath: 0.37, lambda: height / 1.7, amp: 0.92 },
      ];
      for (const c of chains) {
        // breathe between ~55% and 100% — never collapses to a thin line
        const R = Rbase * c.amp * (0.775 + 0.225 * Math.sin(t * c.breath + c.phase));
        for (let j = 0; j < rows; j++) {
          const y = j * ch + ch / 2;
          let cx = c.cx;
          let hw = R * Math.abs(Math.sin((Math.PI * y) / c.lambda + t * c.drift + c.phase));
          if (cur.a > 0.01) {
            const dy = (y - cur.y) / (height * 0.22);
            const f = Math.exp(-dy * dy) * cur.a;
            const dx = cur.x - c.cx;
            const near = Math.exp(-(dx * dx) / (2 * (width * 0.22) ** 2));
            hw += R * 0.6 * f * near;
            cx += dx * 0.35 * f * near;
          }
          if (hw < cw * 0.6) { dot(Math.round(cx / cw), j); continue; }
          const i0 = Math.max(0, Math.floor((cx - hw) / cw));
          const i1 = Math.min(cols - 1, Math.ceil((cx + hw) / cw));
          for (let i = i0; i <= i1; i++) {
            const u = Math.abs(i * cw + cw / 2 - cx) / hw;
            if (u <= 1) put(i, j, u);
          }
        }
      }
    };

    // ── Variant: ribbons (About) ──
    const ribbons = (t) => {
      const bands = [
        { y: 0.26, amp: 0.11, k: 1.0, speed: 0.32, phase: 0.0, thick: 0.085, breath: 0.55 },
        { y: 0.52, amp: 0.14, k: 0.8, speed: -0.26, phase: 2.1, thick: 0.1, breath: 0.42 },
        { y: 0.78, amp: 0.1, k: 1.25, speed: 0.22, phase: 4.0, thick: 0.08, breath: 0.5 },
      ];
      const minSide = Math.min(width, height);
      for (const b of bands) {
        const T0 = b.thick * minSide * reveal.v;
        const T = T0 * (0.55 + 0.45 * Math.sin(t * b.breath + b.phase));
        const freq = (Math.PI * 2 * b.k) / width;
        for (let i = 0; i < cols; i++) {
          const x = i * cw + cw / 2;
          let yc = b.y * height
            + b.amp * height * Math.sin(x * freq + t * b.speed + b.phase)
            + b.amp * 0.35 * height * Math.sin(x * freq * 2.3 - t * b.speed * 0.7 + b.phase * 2);
          let Tx = T;
          if (cur.a > 0.01) {
            const dx = (x - cur.x) / (width * 0.12);
            const f = Math.exp(-dx * dx) * cur.a;
            const dy = cur.y - yc;
            const near = Math.exp(-(dy * dy) / (2 * (height * 0.2) ** 2));
            yc += dy * 0.5 * f * near;
            Tx *= 1 + 0.7 * f * near;
          }
          if (Tx < ch * 0.6) { dot(i, Math.round((yc - ch / 2) / ch)); continue; }
          const j0 = Math.max(0, Math.floor((yc - Tx) / ch));
          const j1 = Math.min(rows - 1, Math.ceil((yc + Tx) / ch));
          for (let j = j0; j <= j1; j++) {
            const u = Math.abs(j * ch + ch / 2 - yc) / Tx;
            if (u <= 1) put(i, j, u);
          }
        }
      }
    };

    // ── Variant: ripples (Playground) ──
    const ripples = (t) => {
      const minSide = Math.min(width, height);
      const maxSide = Math.max(width, height);
      // Two sources (top-right, bottom-left) whose rings interfere into curved
      // lenses; ring period ≈ 7 glyph rows so each ring is a readable curve,
      // and the ring thickness (duty) breathes.
      const src = [
        {
          x: (narrow() ? 0.5 : 0.7) * width + Math.sin(t * 0.1) * 0.05 * width,
          y: 0.42 * height + Math.cos(t * 0.13) * 0.08 * height,
          lambda: Math.max(ch * 7, 0.26 * minSide),
          speed: 0.3,
          reach: (0.62 + 0.12 * Math.sin(t * 0.3)) * maxSide * reveal.v,
          duty: 0.5 + 0.25 * Math.sin(t * 0.45),
        },
        {
          x: 0.16 * width + Math.sin(t * 0.08) * 0.04 * width,
          y: 0.8 * height,
          lambda: Math.max(ch * 6, 0.22 * minSide),
          speed: -0.22,
          reach: 0.5 * maxSide * reveal.v,
          duty: 0.42 + 0.2 * Math.sin(t * 0.37 + 1.5),
        },
      ];
      if (cur.a > 0.01) {
        src.push({ x: cur.x, y: cur.y, lambda: Math.max(ch * 4, 0.12 * minSide), speed: 0.55, reach: 0.34 * minSide * cur.a, duty: 0.55 });
      }
      for (let j = 0; j < rows; j++) {
        const y = j * ch + ch / 2;
        for (let i = 0; i < cols; i++) {
          const x = i * cw + cw / 2;
          let best = null;
          for (const s of src) {
            const d = Math.hypot((x - s.x) / 1.15, y - s.y);
            if (d > s.reach) continue;
            const p = d / s.lambda - t * s.speed;
            const frac = p - Math.floor(p);
            const off = Math.abs(frac - 0.5) * 2;            // 0 ring centre → 1 between rings
            // outer rings thin out toward the reach
            const duty = s.duty * (1 - 0.35 * (d / s.reach));
            if (off > duty) continue;
            const u = off / duty;
            if (!best || d < best.d) best = { d, u };
          }
          if (best) put(i, j, best.u);
        }
      }
    };

    // ── Variant: terminal (Playground) ──
    // A terminal booting: log lines type in fast from the top, each with a
    // prompt glyph, their right edge following a wave that breathes; once the
    // screen is full the log scrolls, then settles to a slow drip with a
    // blinking block cursor. Lines near the pointer reach toward it.
    const term = { lines: [], typed: 0, lastAdd: -Infinity, t0: null, count: 0 };
    const PROMPT = RAMP.indexOf('>');
    const terminal = (t) => {
      if (term.t0 === null) term.t0 = t;
      const cr = canvas.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
      const col0 = Math.max(0, Math.floor((hr.left - cr.left) / cw)); // start at the content column
      const maxCols = Math.max(8, cols - col0 - 2);
      const maxLines = Math.max(1, rows - 1);
      // Boot: pour lines in until the screen has filled once, then a slow drip.
      const boot = term.count < maxLines;
      const addEvery = boot ? 0.03 : 0.7;
      const typeSpeed = boot ? 12 : 2;
      const makeLine = (idx) => {
        const env = 0.42 + 0.26 * Math.sin(idx * 0.42) + 0.18 * Math.sin(idx * 0.11 + t * 0.3);
        const breathe = 0.82 + 0.18 * Math.sin(t * 0.5);
        return { len: Math.max(6, Math.round(maxCols * Math.max(0.12, env) * breathe)), seed: idx * 7.31 };
      };
      if (reduce && !term.lines.length) {
        for (let k = 0; k < maxLines; k++) term.lines.push(makeLine(++term.count));
        term.typed = term.lines[term.lines.length - 1].len;
      }
      const last = term.lines[term.lines.length - 1];
      const lineDone = !last || term.typed >= last.len;
      if (!reduce) {
        if (lineDone && t - term.lastAdd >= addEvery) {
          term.lines.push(makeLine(++term.count));
          if (term.lines.length > maxLines) term.lines.shift();
          term.typed = 0;
          term.lastAdd = t;
        } else if (!lineDone) {
          term.typed = Math.min(last.len, term.typed + typeSpeed);
        }
      }
      term.lines.forEach((ln, j) => {
        if (j >= rows) return;
        const isLast = j === term.lines.length - 1;
        let L = isLast ? Math.min(ln.len, term.typed) : ln.len;
        if (cur.a > 0.01 && !isLast) {
          const dy = (j * ch + ch / 2 - cur.y) / (height * 0.16);
          const f = Math.exp(-dy * dy) * cur.a;
          const want = cur.x / cw - col0;
          if (want > L) L = Math.round(L + (want - L) * 0.6 * f);
        }
        L = Math.min(L, maxCols);
        for (let i = 0; i < L; i++) {
          const col = col0 + i;
          if (col >= cols) break;
          if (i === 0) { grid[j * cols + col] = 1 + PROMPT; continue; }
          const u = Math.abs(i / ln.len - 0.5) * 2;          // dense ends, light middle
          put(col, j, Math.min(1, u));
        }
      });
      term.cursor = last ? { col: col0 + Math.min(term.typed, last.len), row: term.lines.length - 1, typing: !lineDone } : null;
    };
    const terminalPost = (t) => {
      if (!term.cursor) return;
      const { col, row, typing } = term.cursor;
      if (row >= rows || col >= cols) return;
      if (!typing && Math.floor(t * 2) % 2 === 1) return;      // blink at 1 Hz when idle
      ctx.globalAlpha = alpha * (0.35 + 0.65 * reveal.v);
      ctx.fillStyle = inkColor;
      ctx.fillRect(col * cw + 1, row * ch + 2, cw - 2, ch - 4);
      ctx.globalAlpha = 1;
    };

    // ── Variant: matrix (Playground) ──
    // Digital rain: per-column drops fall with a bright head and a trail that
    // fades behind it; glyphs mutate as they fall. Spawning comes in waves
    // (breathes), the pointer's columns rain harder, and the intro ramps the
    // rain in from a few drops.
    const rain = { drops: [], glyphs: new Uint8Array(0), lastT: null };
    const matrix = (t) => {
      if (rain.glyphs.length !== cols * rows) {
        rain.glyphs = new Uint8Array(cols * rows);
        for (let k = 0; k < rain.glyphs.length; k++) rain.glyphs[k] = 1 + Math.floor(Math.random() * (n - 1));
        rain.drops = [];
        rain.lastT = null;
      }
      const dt = rain.lastT === null ? 1 / FPS : Math.min(0.1, t - rain.lastT);
      rain.lastT = t;
      const breathe = 0.65 + 0.35 * Math.sin(t * 0.5);
      // "wind": a density band that sweeps across the columns, so the rain
      // thickens in a moving front rather than evenly everywhere
      const wind = (c) => 0.5 + 0.5 * Math.sin((c / cols) * Math.PI * 3 - t * 0.9);
      // spawn: up to ~0.8 drops / s / column, pulsing × wind; pointer columns ×6
      const perColBase = 0.8 * breathe * (0.15 + 0.85 * reveal.v) * dt;
      const pcol = cur.a > 0.01 ? Math.round(cur.x / cw) : -999;
      for (let c = 0; c < cols; c++) {
        let p = perColBase * (0.25 + 0.75 * wind(c));
        if (Math.abs(c - pcol) <= 6) p *= 1 + 5 * cur.a * (1 - Math.abs(c - pcol) / 7);
        if (Math.random() > p) continue;
        // don't stack a new drop on a column whose last drop hasn't cleared its own tail
        let busy = false;
        for (const d of rain.drops) if (d.col === c && d.head < d.len + 2) { busy = true; break; }
        if (busy) continue;
        // mostly steady drops (≈3–5 rows/s) with the odd fast, short streak
        const streak = Math.random() < 0.28;
        rain.drops.push({
          col: c,
          head: -Math.random() * 6,
          speed: streak ? 7 + Math.random() * 4 : 2.8 + Math.random() * 2.2,
          len: streak ? 4 + Math.floor(Math.random() * 6) : 8 + Math.floor(Math.random() * 16),
        });
      }
      // advance + cull
      const speedMul = 0.85 + 0.15 * Math.sin(t * 0.33);
      for (let i = rain.drops.length - 1; i >= 0; i--) {
        const d = rain.drops[i];
        d.head += d.speed * speedMul * dt;
        if (d.head - d.len > rows + 1) rain.drops.splice(i, 1);
      }
      // mutate: a slow churn everywhere, plus the few cells just behind each
      // head keep flickering as the glyphs "settle"
      const flips = Math.max(1, Math.floor(rain.glyphs.length * 0.01));
      for (let f = 0; f < flips; f++) {
        const k = Math.floor(Math.random() * rain.glyphs.length);
        rain.glyphs[k] = 1 + Math.floor(Math.random() * (n - 1));
      }
      for (const d of rain.drops) {
        const headRow = Math.floor(d.head);
        for (let k = 0; k < 3; k++) {
          const r = headRow - k;
          if (r >= 0 && r < rows && Math.random() < 0.45) rain.glyphs[r * cols + d.col] = 1 + Math.floor(Math.random() * (n - 1));
        }
      }
      // rasterise — same weight as the other fields: no bright head, the trail
      // simply fades from the field alpha to nothing
      for (const d of rain.drops) {
        const headRow = Math.floor(d.head);
        for (let k = 0; k <= d.len; k++) {
          const r = headRow - k;
          if (r < 0 || r >= rows) continue;
          const idx = r * cols + d.col;
          const a = Math.pow(1 - k / (d.len + 1), 1.2);
          if (a <= cellAlpha[idx] && grid[idx]) continue;
          cellAlpha[idx] = a;
          grid[idx] = 1 + rain.glyphs[idx];
        }
      }
    };

    const stamp = variant === 'ribbons' ? ribbons : variant === 'ripples' ? ripples : variant === 'terminal' ? terminal : variant === 'matrix' ? matrix : diamonds;
    const post = variant === 'terminal' ? terminalPost : null;
    const alphaBoost = 1; // every variant runs at the same field alpha

    // Per-cell "under a word" mask from the text line boxes.
    const markUnder = () => {
      under.fill(0);
      if (!textSelectors.length) return;
      const cr = canvas.getBoundingClientRect();
      const mark = (b) => {
        if (!b || b.width < 2 || b.height < 2) return;
        const x0 = b.left - cr.left - 4;
        const x1 = b.right - cr.left + 4;
        const y0 = b.top - cr.top - ch * 0.75;
        const y1 = b.bottom - cr.top + ch * 0.75;
        const i0 = Math.max(0, Math.floor((x0 - cw / 2) / cw));
        const i1 = Math.min(cols - 1, Math.ceil((x1 - cw / 2) / cw));
        const j0 = Math.max(0, Math.floor((y0 - ch / 2) / ch));
        const j1 = Math.min(rows - 1, Math.ceil((y1 - ch / 2) / ch));
        for (let j = j0; j <= j1; j++) {
          const yc = j * ch + ch / 2;
          if (yc < y0 || yc > y1) continue;
          for (let i = i0; i <= i1; i++) {
            const xc = i * cw + cw / 2;
            if (xc >= x0 && xc <= x1) under[j * cols + i] = 1;
          }
        }
      };
      for (const sel of textSelectors) {
        for (const el of host.querySelectorAll(sel)) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const rects = range.getClientRects();
          if (rects.length) for (const b of rects) mark(b);
          else mark(el.getBoundingClientRect());
          range.detach?.();
        }
      }
    };

    const draw = (t) => {
      grid.fill(0);
      cellAlpha.fill(1);
      stamp(t);
      markUnder();

      ctx.clearRect(0, 0, width, height);
      const full = Math.min(0.9, alpha * alphaBoost) * (0.35 + 0.65 * reveal.v);
      ctx.globalAlpha = full;
      let curAlpha = full;
      const sw = Math.ceil(cw * dpr);
      const sh = Math.ceil(ch * dpr);
      for (let j = 0; j < rows; j++) {
        const row = j * cols;
        const y = j * ch;
        for (let i = 0; i < cols; i++) {
          const k = row + i;
          const v = grid[k];
          if (!v) continue;
          const a = full * cellAlpha[k] * (under[k] ? 0.3 : 1);
          if (a !== curAlpha) { ctx.globalAlpha = a; curAlpha = a; }
          ctx.drawImage(sheet, (v - 1) * sw, 0, sw, sh, i * cw, y, cw, ch);
        }
      }
      ctx.globalAlpha = 1;
      if (post) post(t);

      // Soft fades only (never a box): under the fixed nav, and at the bottom.
      ctx.globalCompositeOperation = 'destination-out';
      const cr = canvas.getBoundingClientRect();
      if (bottomFadeSelector) {
        const el = host.querySelector(bottomFadeSelector);
        if (el) {
          const mr = el.getBoundingClientRect();
          const top = mr.top - cr.top - 48;
          const g = ctx.createLinearGradient(0, top, 0, mr.top - cr.top);
          g.addColorStop(0, 'rgba(0,0,0,0)');
          g.addColorStop(1, 'rgba(0,0,0,1)');
          ctx.fillStyle = g;
          ctx.fillRect(0, top, width, height - top);
        }
      } else if (fadeBottom > 0) {
        const g = ctx.createLinearGradient(0, height - fadeBottom, 0, height);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = g;
        ctx.fillRect(0, height - fadeBottom, width, fadeBottom);
      }
      if (fadeNav) {
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
    const start = () => { if (reduce || running) return; running = true; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const onMove = (e) => {
      if (reduce) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
      cur.tx = x; cur.ty = y; cur.ta = inside ? 1 : 0;
      if (inside && cur.a < 0.01) { cur.x = x; cur.y = y; }
    };
    const onLeave = () => { cur.ta = 0; };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const themeObs = new MutationObserver(() => { buildSheet(); if (reduce) draw(seed + 3); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onVis = () => { if (document.hidden) stop(); else if (visible) start(); };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([en]) => {
      visible = !!en?.isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    }, { threshold: 0.02 });
    io.observe(host);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    // Intro: the field grows in (amplitude + alpha) alongside the hero's own
    // GSAP intro, then breathes on its own.
    if (!reduce && intro) {
      introTween = gsap.to(reveal, { v: 1, duration: 1.8, ease: 'power3.out', delay: 0.35 });
    }
    if (!reduce) start();

    return () => {
      stop();
      introTween?.kill();
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
    // props are static per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={`ascii-field${className ? ` ${className}` : ''}`} aria-hidden="true" />;
};

export default AsciiField;
