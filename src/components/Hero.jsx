import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const { content, editMode } = useEdit();
  const heroRef = useRef(null);
  const cubeWrapRef = useRef(null);
  const labelRef = useRef(null);
  const introRef = useRef(null);
  const headlineRef = useRef(null);
  const [mouseRotateX, setMouseRotateX] = useState(0);
  const [mouseRotateY, setMouseRotateY] = useState(0);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  const labelText = (content.hero.greeting || "Hello! I'm").trim();
  const line1Text = (content.hero.name || 'Lior Baum').trim();
  const line2Text = (content.hero.label || 'Product Designer').trim();

  useLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    const label = labelRef.current;
    const intro = introRef.current;
    const headline = headlineRef.current;
    const elements = [label, intro, headline].filter(Boolean);

    gsap.set(elements, { y: 0, opacity: 1 });

    const ctx = gsap.context(() => {
      gsap.set(label, { y: 20, opacity: 0 });
      gsap.set(intro, { y: 28, opacity: 0 });
      gsap.set(headline, { y: 32, opacity: 0 });

      const tl = gsap.timeline();
      tl.to(label, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      tl.to(intro, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, '-=0.3');
      tl.to(headline, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.25');

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom 20%',
        onLeave: () => {
          gsap.to(elements, {
            y: -40,
            opacity: 0,
            duration: 0.35,
            stagger: 0.03,
            ease: 'power2.in',
          });
        },
        onEnterBack: () => {
          gsap.to(elements, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
        },
      });
    }, heroRef);

    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, [labelText, line1Text, line2Text]);

  // Mouse-follow: tilt cube/rings with cursor (smooth lerp)
  useEffect(() => {
    const wrap = cubeWrapRef.current;
    const hero = heroRef.current;
    if (!wrap || !hero) return;

    const maxRotate = 14;
    let rafId = null;

    const handleMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseTarget.current = { x: x * maxRotate, y: -y * maxRotate };
    };
    const handleLeave = () => {
      mouseTarget.current = { x: 0, y: 0 };
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, 0.08);
      mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, 0.08);
      setMouseRotateY(mouseCurrent.current.x);
      setMouseRotateX(mouseCurrent.current.y);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', handleLeave);
    return () => {
      hero.removeEventListener('mousemove', handleMove);
      hero.removeEventListener('mouseleave', handleLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className={`hero ${editMode ? 'edit-mode-active' : ''}`} id="home" ref={heroRef}>
      <div className="hero-background">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      {/* Text content — top center */}
      <div className="hero-center">
        <div className="hero-content">
          <div className="title-line-wrapper">
            <span className="section-label" ref={labelRef}>{labelText}</span>
          </div>
          <h1 className="hero-headline" aria-label={`${labelText} ${line1Text} ${line2Text}`}>
            <div className="title-line-wrapper">
              <div className="title-line hero-line1" ref={introRef}>
                {line1Text}
              </div>
            </div>
            <div className="title-line-wrapper">
              <div className="title-line hero-line2" ref={headlineRef}>
                <span className="serif accent">{line2Text}</span>
              </div>
            </div>
          </h1>
        </div>
      </div>

      {/* 3D cube + rings below text (mouse-interactive) */}
      <div className="hero-3d-wrap" aria-hidden="true" ref={cubeWrapRef}>
        <div
          className="hero-3d-mouse-layer"
          style={{
            transform: `rotateY(${mouseRotateY}deg) rotateX(${mouseRotateX}deg)`,
          }}
        >
          <div className="hero-3d-scene">
            <div className="hero-3d-ring hero-3d-ring--outer" />
            <div className="hero-3d-ring hero-3d-ring--mid" />
            <div className="hero-3d-cube">
              <div className="hero-3d-face hero-3d-face--front" />
              <div className="hero-3d-face hero-3d-face--back" />
              <div className="hero-3d-face hero-3d-face--right" />
              <div className="hero-3d-face hero-3d-face--left" />
              <div className="hero-3d-face hero-3d-face--top" />
              <div className="hero-3d-face hero-3d-face--bottom" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
