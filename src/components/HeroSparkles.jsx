import { useEffect, useRef } from 'react';

/* Magical trail for the hero background.
   A coral re-imagining of Jason Labbe's p5 "magical trail" shader — rebuilt in
   plain Canvas 2D (no p5 / WebGL) so it ships with no extra deps and respects
   our theme.
   - Moving the pointer flings glowing particles off a trail; each has its own
     mass / air-drag / colour and decays as its velocity dies, exactly like the
     original physics.
   - Overlapping glows are drawn with additive ('lighter') blending so they fuse
     into soft metaball blobs — the luminous look of the reference shader.
   - A faint ambient mote drift keeps the hero alive when the pointer is idle.
   - Honors prefers-reduced-motion (static, no rAF) and pauses when tab hidden. */
const MAX_PARTICLES = 90;
const MAX_TRAIL = 30;

const HeroSparkles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let t = 0;

    const particles = [];
    const trail = [];
    const motes = [];
    let lastEmit = null;            // last point a trail/spawn was emitted from
    let ghostLast = {};             // per-ghost previous point (intro sweep)
    // Self-demo: a ghost pointer sweeps the hero on load to show the effect is
    // interactive, then stops the instant the real pointer moves.
    let auto = !reduce;
    let autoStarted = false;
    let autoStartT = 0.6;               // t at which the current intro began
    let lastMoveT = 0;                  // t of the last real pointer move
    const IDLE_RESTART = 4;             // seconds of stillness → replay the intro
    let introFade = reduce ? 1 : 0;     // 0→1 ease-in of the whole intro
    let absorb = 0;                     // handoff pulse: cursor "swallows" the intro
    const cur = { x: 0, y: 0, vx: 0, vy: 0, has: false };

    // ── Theme-aware colour ramp (our coral / warm palette) ──────────────
    let dark = false;
    // warm coral ramp ≈ the reference's orange ramp, in brand colours
    let palette = ['#ffb38a', '#ff8a5c', '#ff6a5d', '#ff584a', '#cc3520'];
    let trailCore = '#ffd9c2'; // hot comet core
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const accent = cs.getPropertyValue('--color-accent').trim();
      const vivid = cs.getPropertyValue('--color-accent-vivid').trim();
      palette = [
        '#ffb38a',
        '#ff8a5c',
        vivid || '#ff6a5d',
        accent || '#ff584a',
        dark ? '#ff6a5d' : '#cc3520',
      ];
      trailCore = dark ? '#fff1e8' : '#ffcaab';
    };
    readTheme();

    const rand = (a, b) => a + Math.random() * (b - a);

    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    const buildMotes = () => {
      const count = Math.round(Math.min(28, Math.max(10, (width * height) / 90000)));
      motes.length = 0;
      for (let i = 0; i < count; i++) {
        motes.push({
          bx: Math.random() * width,
          by: Math.random() * height,
          r: rand(8, 22),
          depth: rand(0.3, 1),
          baseA: rand(0.05, 0.16),
          tw: rand(0.4, 1.2),
          ph: rand(0, Math.PI * 2),
          color: palette[(Math.random() * palette.length) | 0],
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildMotes();
      if (reduce) drawStatic();
    };

    // Soft radial glow — the building block of the metaball look.
    const glow = (x, y, radius, color, alpha) => {
      if (radius <= 0 || alpha <= 0) return;
      const [r, g, b] = typeof color === 'string' ? hexToRgb(color) : color;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.35, `rgba(${r},${g},${b},${alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const spawn = (x, y, dx, dy) => {
      if (particles.length >= MAX_PARTICLES) return;
      const len = Math.hypot(dx, dy) || 1;
      const speed = rand(2, 10);
      const ang = Math.atan2(dy, dx) + (rand(-25, 25) * Math.PI) / 180;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * speed * (len > 0 ? 1 : 0),
        vy: Math.sin(ang) * speed,
        mass: rand(1, 20),
        drag: rand(0.92, 0.97),
        color: palette[(Math.random() * palette.length) | 0],
      });
    };

    // Feed a pointer position into the trail + particle system (shared by the
    // real pointer and the intro ghost sweep).
    const emit = (x, y) => {
      trail.push([x, y]);
      while (trail.length > MAX_TRAIL) trail.shift();
      if (lastEmit) {
        const dx = x - lastEmit[0];
        const dy = y - lastEmit[1];
        if (Math.hypot(dx, dy) > 8) spawn(lastEmit[0], lastEmit[1], dx, dy);
      }
      lastEmit = [x, y];
    };

    // Like emit(), but each intro ghost keeps its own previous point so the
    // several sweeps spawn particles independently.
    const emitMulti = (x, y, g) => {
      trail.push([x, y]);
      while (trail.length > MAX_TRAIL) trail.shift();
      const prev = ghostLast[g.px];
      if (prev) {
        const dx = x - prev[0];
        const dy = y - prev[1];
        if (Math.hypot(dx, dy) > 8) spawn(prev[0], prev[1], dx, dy);
      }
      ghostLast[g.px] = [x, y];
    };

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      for (const m of motes) glow(m.bx, m.by, m.r, m.color, m.baseA * 0.7);
      ctx.globalCompositeOperation = 'source-over';
    }

    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);
      // Additive on dark = neon glow; source-over on light keeps colour readable.
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

      // Ease the intro in on load and decay the handoff "swallow" pulse.
      introFade += (1 - introFade) * 0.045;
      absorb *= 0.955;
      if (absorb < 0.01) absorb = 0;
      cur.vx *= 0.85;                    // cursor velocity bleeds off when still
      cur.vy *= 0.85;

      // After a long idle, replay the intro so the hero returns to its opening
      // state and re-invites the cursor.
      if (!auto && !reduce && t - lastMoveT > IDLE_RESTART) {
        auto = true;
        autoStarted = false;
        autoStartT = t;
        introFade = 0;
        ghostLast = {};
        lastEmit = null;
        // Reset to the fresh-refresh state so the next hover replays the vacuum
        // exactly like a page load — but keep the trail so it stays on the mouse.
        particles.length = 0;
        absorb = 0;
        cur.has = false;
      }

      // Intro ghost sweep — starts after the hero text settles, runs a couple
      // of gentle loops, then waits for the user. Cancelled on first real move.
      if (auto && t > autoStartT) {
        autoStarted = true;
        const a = t - autoStartT;
        // A few ghost pointers tracing offset paths → a livelier opening burst.
        // Spread across the hero so they never pile into a bright centre blob.
        const ghosts = [
          { fx: 0.30, fy: 0.90, sx: 0.22, sy: 0.40, ax: 0.16, px: 0.0, py: 0.5 },
          { fx: 0.55, fy: 1.30, sx: 0.50, sy: 0.55, ax: 0.20, px: 2.1, py: 1.4 },
          { fx: 0.80, fy: 0.70, sx: 0.78, sy: 0.44, ax: 0.16, px: 4.2, py: 3.0 },
          { fx: 0.42, fy: 1.10, sx: 0.36, sy: 0.60, ax: 0.14, px: 1.0, py: 2.4 },
          { fx: 0.68, fy: 0.55, sx: 0.64, sy: 0.34, ax: 0.18, px: 3.3, py: 0.2 },
        ];
        for (const g of ghosts) {
          emitMulti(
            width * (g.sx + g.ax * Math.sin(a * g.fx + g.px)),
            height * (g.sy + 0.10 * Math.sin(a * g.fy + g.py)),
            g,
          );
        }
        if (a > 12) { auto = false; lastEmit = null; ghostLast = {}; }
      }

      // Ambient motes — quiet life when the pointer is idle.
      for (const m of motes) {
        const tw = 0.6 + 0.4 * Math.sin(t * m.tw + m.ph);
        glow(m.bx, m.by, m.r, m.color, m.baseA * tw);
      }

      // Trail — the hot comet core that the particles peel off of.
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const k = i / MAX_TRAIL;          // 0 = oldest, ~1 = newest
        glow(p[0], p[1], 6 + k * 26, trailCore, (dark ? 0.5 : 0.28) * k * introFade);
        glow(p[0], p[1], 2 + k * 10, '#ffffff', (dark ? 0.45 : 0.22) * k * k * introFade);
      }

      // Particles — fling out, slow under drag, fade as they die.
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        // Handoff: each intro particle drifts gently toward the cursor and along
        // its heading — a soft pull, never a snap, so they ease to the pointer.
        if (absorb > 0 && cur.has) {
          const cvx = Math.max(-10, Math.min(10, cur.vx));
          const cvy = Math.max(-10, Math.min(10, cur.vy));
          const dx = cur.x - p.x;
          const dy = cur.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          // ease off only very close so they reach near the pointer, not pile up
          const near = Math.min(1, d / 45);
          p.vx += (dx / d) * 1.1 * absorb * near + cvx * 0.05 * absorb;
          p.vy += (dy / d) * 1.1 * absorb * near + cvy * 0.05 * absorb;
        }
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed < 0.1) { particles.splice(i, 1); continue; }
        // radius/alpha scale with mass*speed — capped so nothing balloons.
        const energy = Math.min(0.55, (p.mass * speed) / 100);
        const radius = 12 + energy * 90;
        const alpha = Math.min(dark ? 0.4 : 0.26, 0.05 + energy * 1.1) * introFade;
        glow(p.x, p.y, radius, p.color, alpha);
      }

      ctx.globalCompositeOperation = 'source-over';
      if (running) raf = requestAnimationFrame(render);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < -60 || y < -60 || x > width + 60 || y > height + 60) return;
      if (reduce) return;
      lastMoveT = t;
      if (cur.has) { cur.vx = x - cur.x; cur.vy = y - cur.y; }
      cur.x = x;
      cur.y = y;
      cur.has = true;
      // First real move ends the intro: turn the leftover trail points into real
      // particles so EVERYTHING on screen joins the others and streams to the
      // pointer, moving along the direction the cursor is heading.
      if (auto && autoStarted) {
        auto = false;
        lastEmit = null;
        ghostLast = {};
        for (const tp of trail) {
          if (particles.length >= MAX_PARTICLES) break;
          particles.push({
            x: tp[0],
            y: tp[1],
            vx: rand(-0.4, 0.4),
            vy: rand(-0.4, 0.4),
            mass: rand(3, 16),
            drag: rand(0.93, 0.97),
            color: palette[(Math.random() * palette.length) | 0],
          });
        }
        trail.length = 0;
        absorb = 1;
      }
      emit(x, y);
    };
    const onLeave = () => {};

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const themeObs = new MutationObserver(() => {
      readTheme();
      for (const m of motes) m.color = palette[(Math.random() * palette.length) | 0];
      if (reduce) drawStatic();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave, { passive: true });

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce && !running) { running = true; raf = requestAnimationFrame(render); }
    };
    document.addEventListener('visibilitychange', onVis);

    if (reduce) drawStatic();
    else raf = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObs.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-sparkles" aria-hidden="true" />;
};

export default HeroSparkles;
