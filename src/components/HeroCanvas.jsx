import { useRef, useEffect } from 'react';

/**
 * Interactive generative art background for Hero.
 * Floating particles + connections, reacts to mouse. Uses site primary color.
 */
export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const particleCount = Math.min(60, Math.floor((width * height) / 18000));
    const connectionDist = 140;
    const primaryR = 255;
    const primaryG = 88;
    const primaryB = 74;

    function initParticles() {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1.2 + Math.random() * 0.8,
      }));
    }

    const onResize = () => {
      setSize();
    };
    const onMove = (e) => {
      mouseRef.current.x = e.clientX / width;
      mouseRef.current.y = e.clientY / height;
    };

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const mx = mouse.x * width;
      const my = mouse.y * height;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 220 && dist > 0) {
          const force = (220 - dist) / 220;
          p.vx += (dx / dist) * force * 0.012;
          p.vy += (dy / dist) * force * 0.012;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < connectionDist) {
            const alpha = (1 - d / connectionDist) * 0.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.35)`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    setSize();
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    draw();
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
