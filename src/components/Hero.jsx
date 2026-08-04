import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import HeroSparkles from './HeroSparkles';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

// Two rows scrolling in opposite directions — the skills that matter for a
// UX/UI designer today: core craft + the modern differentiators (AI-native
// design, design engineering, systems, product strategy).
const marqueeRow1 = [
  { text: 'UX Design' },
  { text: 'Interaction Design', accent: true },
  { text: 'Product Thinking' },
  { text: 'AI-Native Design', accent: true },
  { text: 'Design Systems' },
  { text: 'User Research' },
  { text: 'Rapid Prototyping', accent: true },
];

const marqueeRow2 = [
  { text: 'Product Strategy', accent: true },
  { text: 'Visual Design' },
  { text: 'Motion Design' },
  { text: 'Claude Code', accent: true },
  { text: 'Vibe Coding' },
  { text: 'Usability Testing' },
  { text: 'Design Engineering', accent: true },
];

// Hero role line cycles through these (in order) with a GSAP crossfade.
const HERO_ROLES = ['Product Designer', 'Product Builder', 'Problem Solver'];

const Hero = () => {
  const { content, editMode } = useEdit();

  const heroRef     = useRef(null);

  const metaRef   = useRef(null);
  const nameRef   = useRef(null);
  const roleRef   = useRef(null);
  const descRef   = useRef(null);
  const roleLineRef = useRef(null);
  const roleWordRef = useRef(null);
  const roleAnimatedOnce = useRef(false);
  const [roleIndex, setRoleIndex] = useState(0);

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
          { scaleX: 0, transformOrigin: 'center center' },
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

  // Rotate the role word on an interval: "break" the current word's letters
  // apart (scatter + rotate + blur, random order), then advance the index — the
  // effect below drops the next word's letters into place.
  useEffect(() => {
    const el = roleWordRef.current;
    if (!el) return undefined;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alive = true;
    const advance = () => { if (alive) setRoleIndex((i) => (i + 1) % HERO_ROLES.length); };
    const id = setInterval(() => {
      const chars = el.querySelectorAll('.hero-role-char');
      if (!chars.length) return;
      if (reduce) { advance(); return; }
      gsap.to(chars, {
        opacity: 0,
        y: () => gsap.utils.random(-70, 70),
        x: () => gsap.utils.random(-32, 32),
        rotation: () => gsap.utils.random(-70, 70),
        filter: 'blur(6px)',
        duration: 0.5,
        ease: 'power2.in',
        stagger: { each: 0.03, from: 'random' },
        onComplete: advance,
      });
    }, 2800);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Drop the next word's letters into place whenever the role changes — skip the
  // first mount, since the intro timeline already reveals the role.
  useEffect(() => {
    if (!roleAnimatedOnce.current) { roleAnimatedOnce.current = true; return; }
    const el = roleWordRef.current;
    if (!el) return;
    const chars = el.querySelectorAll('.hero-role-char');
    if (!chars.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { gsap.set(chars, { opacity: 1, x: 0, y: 0, rotation: 0, filter: 'blur(0px)' }); return; }
    gsap.fromTo(chars,
      { opacity: 0, y: () => gsap.utils.random(34, 84), rotation: () => gsap.utils.random(-45, 45), filter: 'blur(6px)' },
      { opacity: 1, y: 0, x: 0, rotation: 0, filter: 'blur(0px)', duration: 0.62, ease: 'back.out(1.7)', stagger: { each: 0.035, from: 'start' } }
    );
  }, [roleIndex]);

  return (
    <section
      className={`hero ${editMode ? 'edit-mode-active' : ''}`}
      id="home"
      ref={heroRef}
    >
      {/* Background — clean dot-grid + minimal orbs + interactive sparkles */}
      <div className="hero-background">
        <div className="hero-grid" />
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="gradient-orb orb-4" />
        <div className="gradient-orb orb-5" />
        <div className="gradient-orb orb-6" />
        <HeroSparkles />
      </div>

      {/* Centered single-column layout */}
      <div className="hero-container">
        <div className="hero-content">

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
              <span className="hero-role-word" ref={roleWordRef} aria-label={HERO_ROLES[roleIndex]}>
                {Array.from(HERO_ROLES[roleIndex]).map((ch, i) => (
                  <span key={i} className="hero-role-char" aria-hidden="true">
                    {ch === ' ' ? ' ' : ch}
                  </span>
                ))}
              </span>
              <span className="hero-role-line" ref={roleLineRef} />
            </span>
          </div>

          <p className="hero-desc" ref={descRef}>{descText}</p>
        </div>
      </div>

      {/* ── Transparent marquee — two rows, opposite directions ── */}
      <div className="hero-marquee" aria-hidden="true">
        <div className="hero-marquee-row hero-marquee-row--fwd">
          {[...marqueeRow1, ...marqueeRow1].map((item, i) => (
            <span
              key={i}
              className={`hero-marquee-item${item.accent ? ' hero-marquee-item--accent' : ''}`}
            >
              {item.text}
              <span className="hero-marquee-sep" />
            </span>
          ))}
        </div>
        <div className="hero-marquee-row hero-marquee-row--rev">
          {[...marqueeRow2, ...marqueeRow2].map((item, i) => (
            <span
              key={i}
              className={`hero-marquee-item${item.accent ? ' hero-marquee-item--accent' : ''}`}
            >
              {item.text}
              <span className="hero-marquee-sep" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
