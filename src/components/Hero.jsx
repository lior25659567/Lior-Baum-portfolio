import { useEffect, useRef, useLayoutEffect, useState } from 'react';
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

// Rotating chip labels — each position cycles through its own pool
const chipPools = [
  ['UX Research', 'User Testing', 'Heuristic Evaluation', 'Journey Mapping', 'Interviews'],
  ['Figma', 'Prototyping', 'Wireframing', 'Design Systems', 'Framer'],
  ['Interaction Design', 'Motion Design', 'Micro-interactions', 'Visual Design', 'UI Design'],
  ['Product Strategy', 'B2B SaaS', 'MedTech', 'Clinical UX', 'Information Architecture'],
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
  const scrollRef = useRef(null);
  const chipRefs  = useRef([]);
  const roleLineRef = useRef(null);

  const labelText = (content.hero.greeting || "Hello! I'm").trim();
  const line1Text = (content.hero.name     || 'Lior Baum').trim();
  const line2Text = (content.hero.label    || 'Product Designer').trim();
  const descText  = content.hero.description || 'Crafting digital experiences that merge clarity, precision, and human behavior.';

  const nameTokens = Array.from(line1Text).map((char, i) => ({
    char, key: i, isSpace: char === ' ',
  }));

  useLayoutEffect(() => { ScrollTrigger.refresh(); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      // Greeting label — fade in with subtle blur
      tl.fromTo(metaRef.current,
        { y: 18, opacity: 0, filter: 'blur(4px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }
      );

      // Name — per-character reveal from below with elastic ease
      const chars = nameRef.current?.querySelectorAll('.hero-char');
      if (chars?.length) {
        tl.fromTo(chars,
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'back.out(1.4)' },
          '-=0.35'
        );
      }

      // Role — slide in with the dash expanding
      tl.fromTo(roleRef.current,
        { y: 24, opacity: 0, filter: 'blur(3px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
        '-=0.45'
      );

      // Role underline accent
      if (roleLineRef.current) {
        tl.fromTo(roleLineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.7, ease: 'power3.out' },
          '-=0.3'
        );
      }

      // Description — fade up
      tl.fromTo(descRef.current,
        { y: 16, opacity: 0, filter: 'blur(2px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' },
        '-=0.35'
      );

      // Chips — stagger pop in
      const chips = chipRefs.current.filter(Boolean);
      if (chips.length) {
        tl.fromTo(chips,
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(2)' },
          '-=0.4'
        );
      }

      // Scroll indicator
      tl.fromTo(scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.1'
      );

      // Scroll-away
      const elements = [metaRef, nameRef, roleRef, descRef]
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

  // Chip label cycling — each chip fades through its pool
  useEffect(() => {
    const indices = chipPools.map(() => 0);
    const interval = setInterval(() => {
      // Pick a random chip to update (not all at once — feels more organic)
      const chipIdx = Math.floor(Math.random() * chipPools.length);
      const el = chipRefs.current[chipIdx];
      if (!el) return;

      const nextIdx = (indices[chipIdx] + 1) % chipPools[chipIdx].length;
      indices[chipIdx] = nextIdx;
      const nextLabel = chipPools[chipIdx][nextIdx];

      // Crossfade: out → swap text → in
      gsap.to(el, {
        opacity: 0, y: -6, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          el.textContent = nextLabel;
          gsap.fromTo(el,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
          );
        }
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

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
            <span className="hero-role-text">
              {line2Text}
              <span className="hero-role-line" ref={roleLineRef} />
            </span>
          </div>

          <p className="hero-desc" ref={descRef}>{descText}</p>

          {/* CTA buttons and stats hidden for now */}
        </div>

        {/* ── RIGHT: 3D scene ── */}
        <div className="hero-right" ref={rightColRef} aria-hidden="true">
          {chipPools.map((pool, i) => (
            <div
              key={i}
              className={`hero-chip hero-chip--${i + 1}`}
              ref={el => chipRefs.current[i] = el}
            >
              {pool[0]}
            </div>
          ))}

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
