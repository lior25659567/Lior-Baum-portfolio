import { useRef, useEffect } from 'react';

const PRIMARY = { r: 255, g: 88, b: 74 };

/**
 * Sophisticated abstract generative animation for hero grid cells.
 * Flowing particles, soft trails, and subtle connections in brand color.
 */
export default function HeroGridArt({ className = '' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    function setSize() {
      const el = canvas.parentElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      w = Math.max(40, Math.round(rect.width));
      h = Math.max(40, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(14, Math.max(6, Math.floor((w * h) / 2500)));
      particlesRef.current = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      if (!canvas.isConnected) return;
      timeRef.current += 0.012;
      const t = timeRef.current;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      if (!particles.length) return;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;
        const drift = Math.sin(p.phase) * 0.15;
        p.vx += (Math.random() - 0.5) * 0.02 + drift * 0.01;
        p.vy += (Math.random() - 0.5) * 0.02 + Math.cos(p.phase) * 0.01;
        p.vx *= 0.995;
        p.vy *= 0.995;
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
          if (d < 55) {
            const alpha = (1 - d / 55) * 0.2 * (0.6 + 0.4 * Math.sin(t + i + j));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const pulse = 0.7 + 0.3 * Math.sin(t + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${0.25 + 0.15 * Math.sin(t * 0.5 + p.phase)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    const raf = requestAnimationFrame(() => {
      setSize();
      draw();
    });
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-grid-art ${className}`}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
