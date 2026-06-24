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
const MAX_PARTICLES = 150;
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
    let parX = 0;                    // eased parallax offset (depth tilt)
    let parY = 0;

    const particles = [];
    const trail = [];
    const motes = [];
    const rings = [];               // expanding click shockwaves
    let lastEmit = null;            // last point a trail/spawn was emitted from
    let ghostLast = {};             // per-ghost previous point (intro sweep)
    // Self-demo: a ghost pointer sweeps the hero on load to show the effect is
    // interactive, then stops the instant the real pointer moves.
    let auto = !reduce;
    let autoStarted = false;
    let autoStartT = 0.6;               // t at which the current intro began
    let lastMoveT = 0;                  // t of the last real pointer move
    const IDLE_RESTART = 1.5;           // seconds of stillness → replay the intro
    let introFade = reduce ? 1 : 0;     // 0→1 ease-in of the whole intro
    let absorb = 0;                     // handoff pulse: cursor "swallows" the intro
    const cur = { x: 0, y: 0, vx: 0, vy: 0, has: false };

    // ── Theme-aware colour ramp — our design colour system (coral/orange) ──
    // Built off --color-accent / --color-accent-vivid so it tracks the brand
    // palette. A warm ramp from soft amber → vivid coral, with white-hot
    // sparkle cores added at render time for the twinkle.
    let dark = false;
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
        const bx = Math.random() * width;
        const by = Math.random() * height;
        motes.push({
          bx,
          by,
          mx: bx,            // live position (eased by the cursor swirl)
          my: by,
          r: rand(7, 18),    // soft ambient glow points (not sharp confetti)
          depth: rand(0.3, 1),
          baseA: rand(0.035, 0.09),
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

    // Radial glow shaped like the reference shader's inverse-distance field
    // (brightness ∝ 1/distance): a hot, near-blown-out core with a long, slow
    // falloff so neighbouring glows fuse into plasma-like metaballs rather than
    // reading as separate soft dots. Drawn additively (see render) so overlaps
    // accumulate toward white exactly like `sum(color / distance)`.
    const glow = (x, y, radius, color, alpha) => {
      if (radius <= 0 || alpha <= 0) return;
      const [r, g, b] = typeof color === 'string' ? hexToRgb(color) : color;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const c = `${r},${g},${b}`;
      grad.addColorStop(0,    `rgba(${c},${alpha})`);
      grad.addColorStop(0.04, `rgba(${c},${alpha * 0.85})`);
      grad.addColorStop(0.12, `rgba(${c},${alpha * 0.45})`);
      grad.addColorStop(0.28, `rgba(${c},${alpha * 0.20})`);
      grad.addColorStop(0.55, `rgba(${c},${alpha * 0.07})`);
      grad.addColorStop(1,    `rgba(${c},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Hot ramp for fast (high-energy) motion — biases toward white/gold.
    const HOT = ['#fff4e8', '#ffe1b0', '#ffc78f'];
    const hotColor = () => (Math.random() < 0.4 ? trailCore : HOT[(Math.random() * HOT.length) | 0]);

    const spawn = (x, y, dx, dy, energy = 0) => {
      if (particles.length >= MAX_PARTICLES) return;
      const len = Math.hypot(dx, dy) || 1;
      const speed = rand(2, 10) * (1 + energy * 1.3);
      const ang = Math.atan2(dy, dx) + (rand(-25, 25) * Math.PI) / 180;
      // Fast flicks throw hotter, heftier sparks.
      const hot = energy > 0.45 && Math.random() < energy;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * speed * (len > 0 ? 1 : 0),
        vy: Math.sin(ang) * speed,
        mass: rand(1, 20) * (1 + energy * 0.9),
        drag: rand(0.92, 0.97),
        color: hot ? hotColor() : palette[(Math.random() * palette.length) | 0],
        z: rand(0.5, 1.4),    // depth: <1 far (small/dim), >1 near (big/bright)
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
        const seg = Math.hypot(dx, dy);
        if (seg > 8) {
          // Speed-reactive: faster cursor → more sparks, hotter colour.
          const energy = Math.min(1, seg / 45);
          const n = 1 + Math.floor(energy * 3);
          for (let k = 0; k < n; k++) {
            const f = k / n;
            spawn(lastEmit[0] + dx * f, lastEmit[1] + dy * f, dx, dy, energy);
          }
        }
      }
      lastEmit = [x, y];
    };

    // Radial shockwave on click/tap — an explosion of sparks + an expanding ring.
    const burst = (x, y) => {
      const count = 28;
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) break;
        const ang = (i / count) * Math.PI * 2 + rand(-0.16, 0.16);
        const speed = rand(6, 17);
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          mass: rand(6, 22),
          drag: rand(0.9, 0.95),
          color: Math.random() < 0.5 ? hotColor() : palette[(Math.random() * palette.length) | 0],
        });
      }
      rings.push({ x, y, r: 6, a: dark ? 0.75 : 0.5 });
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

      // Eased parallax — the field tilts toward the cursor; near layers (high
      // depth) shift more than far ones, giving the cloud real volume/3D.
      const ptx = cur.has ? (cur.x - width / 2) : 0;
      const pty = cur.has ? (cur.y - height / 2) : 0;
      parX += (ptx - parX) * 0.045;
      parY += (pty - parY) * 0.045;

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

      // Motes — pulled into a swirl around the cursor, then eased home.
      const SWIRL_R = 240;
      for (const m of motes) {
        if (cur.has && !reduce) {
          const dx = cur.x - m.mx;
          const dy = cur.y - m.my;
          const d = Math.hypot(dx, dy) || 1;
          if (d < SWIRL_R) {
            const pull = (1 - d / SWIRL_R) * (0.5 + m.depth);
            // small radial draw-in + strong tangential push = orbital swirl
            m.mx += (dx / d) * pull * 0.6 + (-dy / d) * pull * 2.4;
            m.my += (dy / d) * pull * 0.6 + (dx / d) * pull * 2.4;
          }
        }
        m.mx += (m.bx - m.mx) * 0.05;   // ease back to home base
        m.my += (m.by - m.my) * 0.05;
      }

      // Constellation web — faint links between nearby motes, lit up near the cursor.
      const LINK = 175;
      for (let i = 0; i < motes.length; i++) {
        for (let j = i + 1; j < motes.length; j++) {
          const a = motes[i];
          const b = motes[j];
          const dx = b.mx - a.mx;
          const dy = b.my - a.my;
          const d = Math.hypot(dx, dy);
          if (d >= LINK) continue;
          let alpha = (1 - d / LINK) * (dark ? 0.16 : 0.1);
          if (cur.has) {
            const cd = Math.hypot(cur.x - (a.mx + b.mx) / 2, cur.y - (a.my + b.my) / 2);
            if (cd < SWIRL_R) alpha *= 1 + (1 - cd / SWIRL_R) * 2.5;
          }
          alpha *= introFade;
          if (alpha < 0.004) continue;
          const [lr, lg, lb] = hexToRgb(a.color);
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.mx, a.my);
          ctx.lineTo(b.mx, b.my);
          ctx.stroke();
        }
      }

      // Mote glows at their live (swirled) positions, offset by depth-parallax
      // and scaled by depth so near motes read larger/brighter than far ones.
      for (const m of motes) {
        const tw = 0.6 + 0.4 * Math.sin(t * m.tw + m.ph);
        const ox = -parX * m.depth * 0.06;
        const oy = -parY * m.depth * 0.06;
        glow(m.mx + ox, m.my + oy, m.r * (0.55 + m.depth), m.color, m.baseA * tw * (0.45 + m.depth * 0.75));
      }

      // Trail — the comet body. Wide, overlapping 1/r glows along the recent
      // path fuse into a continuous luminous streak (newer = brighter), just
      // like the shader's `i / distance` trail term.
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const k = i / MAX_TRAIL;          // 0 = oldest, ~1 = newest
        glow(p[0], p[1], 30 + k * 80, trailCore, (dark ? 0.18 : 0.11) * k * introFade);
      }

      // Dense head at the pointer — the brightest, tightest part of the field
      // (the freshest trail samples in the reference), brightening with speed.
      if (cur.has && !reduce) {
        const cv = Math.min(1, Math.hypot(cur.vx, cur.vy) / 24);
        const f = (0.45 + cv) * introFade;
        glow(cur.x, cur.y, 110, trailCore, (dark ? 0.12 : 0.07) * f);
        glow(cur.x, cur.y, 40, palette[0], (dark ? 0.18 : 0.11) * f);
        glow(cur.x, cur.y, 16, '#ffffff', (dark ? 0.45 : 0.26) * f);
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
        // Reach scales with mass*speed like the shader's `color/distance*mass`
        // term — wide, additive glows that fuse into plasma metaballs, with a
        // white-hot core that emerges where they overlap.
        const energy = Math.min(0.6, (p.mass * speed) / 90);
        const z = p.z || 1;          // depth: near particles bigger + brighter
        const radius = (26 + energy * 130) * z;
        const alpha = Math.min(dark ? 0.34 : 0.2, 0.05 + energy * 0.9) * introFade * (0.55 + z * 0.45);
        const ox = -parX * (z - 1) * 0.05;   // near sparks parallax-shift slightly
        const oy = -parY * (z - 1) * 0.05;
        // single coral glow per particle — no baked white core; the white-hot
        // centres emerge only where many of these additively overlap, exactly
        // like the shader's summed 1/distance field.
        glow(p.x + ox, p.y + oy, radius, p.color, alpha);
      }

      // Click shockwave rings — expand outward and fade.
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += 9;
        ring.a *= 0.93;
        if (ring.a < 0.02) { rings.splice(i, 1); continue; }
        const [rr, rg, rb] = hexToRgb(trailCore);
        ctx.strokeStyle = `rgba(${rr},${rg},${rb},${ring.a * introFade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();
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
    const onDown = (e) => {
      if (reduce) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > width || y > height) return;
      burst(x, y);
      lastMoveT = t;
    };

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
    window.addEventListener('pointerdown', onDown, { passive: true });

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
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-sparkles" aria-hidden="true" />;
};

export default HeroSparkles;
