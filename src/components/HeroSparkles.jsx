import { useEffect, useRef } from 'react';

/* Interactive sparkle field for the hero background.
   - Ambient: a field of softly twinkling sparkles that parallax with the mouse
     (move the pointer and the whole field drifts), each on its own depth.
   - Cursor: sparkles within reach lean toward the pointer and brighten, then
     spring back — natural, interruptible physics (animation-principles).
   - A short-lived sparkle trail follows the pointer for a little delight.
   - Honors prefers-reduced-motion (renders a static field, no rAF) and pauses
     when the tab is hidden. Canvas + transform/opacity only, for performance. */
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
    let stars = [];
    const trail = [];
    let raf = 0;
    let running = true;
    let t = 0;

    const target = { x: 0.5, y: 0.5, px: 0, py: 0, active: false, lx: null, ly: null };
    const smooth = { x: 0.5, y: 0.5 };

    let accent = '#cc3520';
    let neutral = 'rgba(125, 120, 110, 0.85)';
    let dark = false;
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const a = cs.getPropertyValue('--color-accent').trim();
      if (a) accent = a;
      neutral = dark ? 'rgba(255, 255, 255, 0.92)' : (cs.getPropertyValue('--color-text-muted').trim() || neutral);
    };
    readTheme();

    const rand = (a, b) => a + Math.random() * (b - a);

    const buildStars = () => {
      const count = Math.round(Math.min(72, Math.max(26, (width * height) / 26000)));
      stars = Array.from({ length: count }, () => {
        const depth = rand(0.2, 1);
        return {
          bx: Math.random() * width,
          by: Math.random() * height,
          r: rand(0.6, 2.2) * (0.6 + depth),
          depth,
          baseA: rand(0.08, 0.32) * (0.55 + depth),
          tw: rand(0.6, 1.8),
          ph: rand(0, Math.PI * 2),
          accent: Math.random() < 0.45,
        };
      });
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
      buildStars();
      if (reduce) drawStatic();
    };

    const drawDot = (x, y, r, a, color) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.shadowColor = color;
      ctx.shadowBlur = r * 3;
      ctx.fill();
    };

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      for (const s of stars) drawDot(s.bx, s.by, s.r, s.baseA, s.accent ? accent : neutral);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }

    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

      smooth.x += (target.x - smooth.x) * 0.06;
      smooth.y += (target.y - smooth.y) * 0.06;
      const ox = smooth.x - 0.5;
      const oy = smooth.y - 0.5;

      for (const s of stars) {
        let x = s.bx + ox * s.depth * 46;
        let y = s.by + oy * s.depth * 46;
        let a = s.baseA;
        if (target.active) {
          const dx = target.px - x;
          const dy = target.py - y;
          const d2 = dx * dx + dy * dy;
          const R = 150;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / R;
            x += (dx / d) * f * 18;
            y += (dy / d) * f * 18;
            a += f * 0.5;
          }
        }
        const tw = 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
        drawDot(x, y, s.r, a * tw, s.accent ? accent : neutral);
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.004;
        p.life -= p.decay;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        drawDot(p.x, p.y, p.r * p.life, p.life * 0.85, p.accent ? accent : neutral);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      if (running) raf = requestAnimationFrame(render);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < -40 || y < -40 || x > width + 40 || y > height + 40) { target.active = false; return; }
      target.active = true;
      target.x = x / width;
      target.y = y / height;
      target.px = x;
      target.py = y;
      if (reduce) return;
      const moved = Math.hypot(x - (target.lx ?? x), y - (target.ly ?? y));
      if (moved > 10 && trail.length < 64) {
        target.lx = x;
        target.ly = y;
        trail.push({
          x: x + rand(-5, 5),
          y: y + rand(-5, 5),
          vx: rand(-0.3, 0.3),
          vy: rand(-0.55, -0.1),
          r: rand(0.9, 2.5),
          life: 1,
          decay: rand(0.014, 0.03),
          accent: Math.random() < 0.6,
        });
      }
    };
    const onLeave = () => { target.active = false; };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const themeObs = new MutationObserver(() => { readTheme(); if (reduce) drawStatic(); });
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
