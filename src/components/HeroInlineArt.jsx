import { useRef, useEffect } from 'react';

/**
 * Small inline generative art for Hero headline lines.
 * Particles + connections in primary color, matches site design system.
 */
const PRIMARY = { r: 255, g: 88, b: 74 };

export default function HeroInlineArt({ className = '' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    function setSize() {
      const el = canvas.parentElement || canvas;
      const rect = el.getBoundingClientRect();
      w = Math.max(56, Math.round(rect.width));
      h = Math.max(20, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = Array.from({ length: 8 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
      }));
    }

    function draw() {
      if (!canvas.isConnected) return;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      if (!particles.length) return;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < 45) {
            const alpha = (1 - d / 45) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, 0.5)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    const rafId = requestAnimationFrame(() => {
      setSize();
      draw();
    });

    const ro = new ResizeObserver(() => {
      setSize();
    });
    ro.observe(canvas.parentElement || canvas);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-inline-art ${className}`}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
