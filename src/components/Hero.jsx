import { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import AnimatedButton from './AnimatedButton';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

// Two rows scrolling in opposite directions
const marqueeRow1 = [
  { text: 'UX Design' },
  { text: 'Interaction Design', accent: true },
  { text: 'B2B SaaS' },
  { text: 'Clinical UX' },
  { text: 'Prototyping', accent: true },
  { text: 'User Research' },
  { text: 'Information Architecture' },
];

const marqueeRow2 = [
  { text: 'Product Strategy', accent: true },
  { text: 'Visual Design' },
  { text: 'MedTech' },
  { text: 'Figma', accent: true },
  { text: 'Design Systems' },
  { text: 'Usability Testing' },
  { text: 'Wireframing', accent: true },
];

const Hero = () => {
  const { content, editMode } = useEdit();

  const heroRef     = useRef(null);
  const cubeWrapRef = useRef(null);
  const rightColRef = useRef(null);

  const mouseTarget     = useRef({ x: 0, y: 0 });
  const mouseCurrent    = useRef({ x: 0, y: 0 });
  const parallaxTarget  = useRef({ x: 0, y: 0 });
  const parallaxCurrent = useRef({ x: 0, y: 0 });

  const metaRef   = useRef(null);
  const nameRef   = useRef(null);
  const roleRef   = useRef(null);
  const descRef   = useRef(null);
  const ctaRef    = useRef(null);
  const statsRef  = useRef(null);
  const scrollRef = useRef(null);

  const labelText = (content.hero.greeting || "Hello! I'm").trim();
  const line1Text = (content.hero.name     || 'Lior Baum').trim();
  const line2Text = (content.hero.label    || 'Product Designer').trim();
  const descText  = content.hero.description || 'Crafting digital experiences that merge clarity, precision, and human behavior.';
  const ctaText   = content.hero.ctaText   || 'View Work';
  const ctaLink   = content.hero.ctaLink   || '#projects';

  const nameTokens = Array.from(line1Text).map((char, i) => ({
    char, key: i, isSpace: char === ' ',
  }));

  useLayoutEffect(() => { ScrollTrigger.refresh(); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.12 });

      tl.fromTo(metaRef.current,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );

      const chars = nameRef.current?.querySelectorAll('.hero-char');
      if (chars?.length) {
        tl.fromTo(chars,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.72, stagger: 0.038, ease: 'power3.out' },
          '-=0.28'
        );
      }

      tl.fromTo(roleRef.current,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
        '-=0.4'
      );

      tl.fromTo(descRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );

      tl.fromTo(ctaRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.28'
      );

      const statEls = statsRef.current ? Array.from(statsRef.current.children) : [];
      if (statEls.length) {
        tl.fromTo(statEls,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power2.out' },
          '-=0.22'
        );
      }

      tl.fromTo(scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.1'
      );

      const elements = [metaRef, nameRef, roleRef, descRef, ctaRef, statsRef]
        .map(r => r.current).filter(Boolean);

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom 20%',
        onLeave: () =>
          gsap.to(elements, { y: -50, opacity: 0, duration: 0.35, stagger: 0.025, ease: 'power2.in' }),
        onEnterBack: () =>
          gsap.to(elements, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' }),
      });
    }, heroRef);

    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { clearTimeout(t); ctx.revert(); };
  }, [line1Text, line2Text, labelText]);

  // Mouse parallax — direct DOM mutations, zero React re-renders
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const MAX_ROT = 12;
    const MAX_PX  = 20;
    let raf = null;

    const onMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const nx = (e.clientX - left) / width  - 0.5;
      const ny = (e.clientY - top)  / height - 0.5;
      mouseTarget.current    = { x: nx * MAX_ROT, y: -ny * MAX_ROT };
      parallaxTarget.current = { x: nx * MAX_PX,  y: ny  * MAX_PX };
    };
    const onLeave = () => {
      mouseTarget.current = parallaxTarget.current = { x: 0, y: 0 };
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      mouseCurrent.current.x    = lerp(mouseCurrent.current.x,    mouseTarget.current.x,    0.07);
      mouseCurrent.current.y    = lerp(mouseCurrent.current.y,    mouseTarget.current.y,    0.07);
      parallaxCurrent.current.x = lerp(parallaxCurrent.current.x, parallaxTarget.current.x, 0.05);
      parallaxCurrent.current.y = lerp(parallaxCurrent.current.y, parallaxTarget.current.y, 0.05);

      const layer = cubeWrapRef.current?.querySelector('.hero-3d-mouse-layer');
      if (layer) layer.style.transform =
        `rotateY(${mouseCurrent.current.x}deg) rotateX(${mouseCurrent.current.y}deg)`;

      if (rightColRef.current) {
        const px = parallaxCurrent.current.x * 0.34;
        const py = parallaxCurrent.current.y * 0.34;
        rightColRef.current.style.transform = `translate(${px}px, ${py}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    return () => {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className={`hero ${editMode ? 'edit-mode-active' : ''}`}
      id="home"
      ref={heroRef}
    >
      {/* Background — clean dot-grid + minimal orbs only */}
      <div className="hero-background">
        <div className="hero-grid" />
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      {/* Two-column layout */}
      <div className="hero-container">

        {/* ── LEFT ── */}
        <div className="hero-left">

          <div className="hero-meta" ref={metaRef}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>Available for work</span>
            </div>
            <span className="section-label hero-greeting">{labelText}</span>
          </div>

          <h1 className="hero-name" ref={nameRef} aria-label={line1Text}>
            {nameTokens.map(({ char, key, isSpace }) =>
              isSpace ? (
                <span key={key} className="hero-name-space" aria-hidden="true">&nbsp;</span>
              ) : (
                <span key={key} className="char-clip" aria-hidden="true">
                  <span className="hero-char">{char}</span>
                </span>
              )
            )}
          </h1>

          <div className="hero-role" ref={roleRef}>
            <span className="hero-role-dash" aria-hidden="true">—</span>
            <span className="hero-role-text">{line2Text}</span>
          </div>

          <p className="hero-desc" ref={descRef}>{descText}</p>

          <div className="hero-cta" ref={ctaRef}>
            <AnimatedButton href={ctaLink} variant="primary" icon="→" className="hero-cta-btn">
              {ctaText}
            </AnimatedButton>
            <AnimatedButton href="#contact" variant="outline" icon={null} className="hero-cta-btn">
              Let's Talk
            </AnimatedButton>
          </div>

          <div className="hero-stats" ref={statsRef}>
            <div className="hero-stat">
              <span className="hero-stat-value">5+</span>
              <span className="hero-stat-label">Years</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-value">20+</span>
              <span className="hero-stat-label">Projects</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-value">B2B</span>
              <span className="hero-stat-label">SaaS · MedTech</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: 3D scene ── */}
        <div className="hero-right" ref={rightColRef} aria-hidden="true">
          <div className="hero-chip hero-chip--1">UX Research</div>
          <div className="hero-chip hero-chip--2">Figma</div>
          <div className="hero-chip hero-chip--3">Interaction Design</div>
          <div className="hero-chip hero-chip--4">Prototyping</div>

          <div className="hero-3d-wrap" ref={cubeWrapRef}>
            <div className="hero-3d-mouse-layer">
              <div className="hero-3d-scene">
                <div className="hero-3d-ring hero-3d-ring--outer" />
                <div className="hero-3d-ring hero-3d-ring--mid" />
                <div className="hero-3d-ring hero-3d-ring--inner" />
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
        </div>
      </div>

      {/* ── Marquee — two rows, opposite directions ── */}
      <div className="hero-marquee" aria-hidden="true">
        <div className="hero-marquee-row hero-marquee-row--fwd">
          {[...marqueeRow1, ...marqueeRow1].map((item, i) => (
            <span
              key={i}
              className={`hero-marquee-item${item.accent ? ' hero-marquee-item--accent' : ''}`}
            >
              <span className="hero-marquee-dot" />
              {item.text}
            </span>
          ))}
        </div>
        <div className="hero-marquee-row hero-marquee-row--rev">
          {[...marqueeRow2, ...marqueeRow2].map((item, i) => (
            <span
              key={i}
              className={`hero-marquee-item${item.accent ? ' hero-marquee-item--accent' : ''}`}
            >
              <span className="hero-marquee-dot" />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* Vertical scroll indicator */}
      <div className="hero-scroll" ref={scrollRef} aria-hidden="true">
        <span className="hero-scroll-text">scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
};

export default Hero;
