import { useEffect, useMemo, useRef } from 'react';
import './AboutRotator.css';

// Default 20 skills (13–18 chars each) for a 2026 product/UX designer.
// Keep length consistent so the rotator stays visually balanced.
const DEFAULT_SKILLS = [
  'AI-Native Design',
  'Generative UX',
  'Agent-Based UX',
  'Prompt Engineering',
  'Product Strategy',
  'Product Thinking',
  'Design Leadership',
  'Systems Thinking',
  'Interaction Design',
  'Visual Design',
  'Motion Design',
  'Microinteractions',
  'Design Systems',
  'Design Critique',
  'Rapid Prototyping',
  'Information Design',
  'User Research',
  'Usability Testing',
  'Accessibility',
  'Spatial Design',
];

// ── Animation tuning ────────────────────────────────────────────────────
const MIN_OPACITY = 0.16;          // faded labels (most of the wheel)
const MAX_OPACITY = 0.92;          // labels crossing a readable axis read dark
const CARDINAL_RANGE = 32;         // deg — cone around each 90° axis that lights up
const LIT_THRESHOLD = 0.4;         // above this strength → accent color
// Velocity model so the wheel is ALWAYS moving:
//   • drift — constant slow idle rotation; speeds up while the cursor is over
//     the wheel (DRIFT → DRIFT_HOVER, eased).
//   • Scroll — each scroll delta adds an impulse (down = forward, up = back).
//   • Mouse — moving the cursor anywhere on the page adds an impulse (boosted
//     while hovering the wheel).
const DRIFT = 5;                   // deg/sec — idle speed
const DRIFT_HOVER = 13;            // deg/sec — idle speed while hovering the wheel
const DRIFT_EASE = 0.1;            // how fast drift eases toward its target
const SCROLL_ACTIVE_MS = 160;      // within this of a scroll event = "actively scrolling"
const SCROLL_IMPULSE = 0.2;        // deg/sec added per px of scroll delta
const MOUSE_IMPULSE = 0.16;        // deg/sec added per px of cursor movement
const MOUSE_HOVER_MULT = 1.3;      // extra mouse gain while hovering the wheel
const FRICTION = 0.9;              // per-frame velocity decay (lower = stops sooner)
const MAX_VEL = 190;               // deg/sec clamp so it never runs away

// Smoothstep — eases the emphasis falloff so labels brighten/dim with a soft
// curve instead of a hard linear ramp (animation-principles: ease, don't jerk).
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * AboutRotator — radial skills wheel, always in motion, labels always upright.
 *
 * The ring's rotation comes from idle drift + scroll + page-wide mouse motion.
 * Because the ring turns continuously, each label's flip is recomputed every
 * frame from its live world-angle: any label whose world-angle falls in
 * (90°,270°) is flipped 180° so it stays upright and reads left-to-right — no
 * upside-down or inward-reading text at any rotation. Emphasis is positional:
 * proximity to the nearest cardinal axis (0/90/180/270) drives opacity/color.
 */
const AboutRotator = ({ items }) => {
  const labels = useMemo(() => {
    const src = items?.length ? items : DEFAULT_SKILLS;
    return src.slice(0, 20);
  }, [items]);

  const ringRef = useRef(null);
  const textRefs = useRef([]);
  const rotationRef = useRef(0);     // currently-applied angle (deg)
  const velRef = useRef(0);          // extra angular velocity (deg/sec)
  const driftRef = useRef(DRIFT);    // eased idle speed (deg/sec)
  const hoverRef = useRef(false);    // cursor over the wheel?

  // rAF loop + page-wide listeners — all via refs (no React re-renders)
  useEffect(() => {
    if (!ringRef.current) return;

    // Reduced motion: no rotation — pin every label upright and readable.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      textRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = MAX_OPACITY;
        const a = (360 / labels.length) * i;
        el.style.transform = a > 90 && a < 270 ? 'rotate(180deg)' : 'rotate(0deg)';
      });
      return;
    }

    const N = labels.length;
    let rafId;
    let lastT = performance.now();
    let lastScrollY = window.scrollY;
    let lastScrollAt = -Infinity;
    let lastMouseX = null;

    const nearestCardinalDist = (angle) => {
      const m = ((angle % 90) + 90) % 90;   // 0..90 within the nearest 90° sector
      return Math.min(m, 90 - m);            // 0..45 distance to the axis
    };

    const onScroll = () => {
      const y = window.scrollY;
      velRef.current += (y - lastScrollY) * SCROLL_IMPULSE;
      lastScrollY = y;
      lastScrollAt = performance.now();
    };
    const onMouseMove = (e) => {
      if (lastMouseX !== null) {
        const gain = MOUSE_IMPULSE * (hoverRef.current ? MOUSE_HOVER_MULT : 1);
        velRef.current += (e.clientX - lastMouseX) * gain;
      }
      lastMouseX = e.clientX;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);   // clamp big gaps (tab refocus)
      lastT = now;

      // Ease the idle drift toward its target. While actively scrolling, the
      // drift fades to 0 so the scroll direction fully controls the wheel —
      // otherwise the constant forward drift would swallow a scroll-up reversal.
      const scrolling = now - lastScrollAt < SCROLL_ACTIVE_MS;
      const driftTarget = scrolling ? 0 : (hoverRef.current ? DRIFT_HOVER : DRIFT);
      driftRef.current += (driftTarget - driftRef.current) * DRIFT_EASE;

      // Decay + clamp the impulse velocity, then advance the angle.
      velRef.current *= FRICTION;
      if (velRef.current > MAX_VEL) velRef.current = MAX_VEL;
      else if (velRef.current < -MAX_VEL) velRef.current = -MAX_VEL;
      rotationRef.current += (driftRef.current + velRef.current) * dt;
      const rot = rotationRef.current;
      ringRef.current.style.transform = `rotate(${rot}deg)`;

      const refs = textRefs.current;
      for (let i = 0; i < N; i++) {
        const el = refs[i];
        if (!el) continue;

        const baseAngle = (360 / N) * i;
        let worldAngle = (baseAngle + rot) % 360;
        if (worldAngle < 0) worldAngle += 360;

        // Keep every label upright + reading left-to-right, whatever the rotation.
        el.style.transform = worldAngle > 90 && worldAngle < 270 ? 'rotate(180deg)' : 'rotate(0deg)';

        // Positional emphasis — proximity to the nearest cardinal axis, eased.
        const dCard = nearestCardinalDist(worldAngle);
        const raw = Math.max(0, 1 - dCard / CARDINAL_RANGE);
        const strength = smooth(raw);

        el.style.opacity = (MIN_OPACITY + strength * (MAX_OPACITY - MIN_OPACITY)).toFixed(3);
        // Toggle a class (not inline color) so the accent resolves via the CSS
        // cascade — reading the var with getComputedStyle is unreliable.
        el.classList.toggle('is-lit', strength > LIT_THRESHOLD);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [labels.length]);

  return (
    <div
      className="abt-anim-text-rotator-wrap"
      role="list"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
    >
      {/* Static two-line center caption */}
      <div className="abt-anim-info">
        <span className="abt-anim-info-title">Method + Tools</span>
        <span className="abt-anim-info-sub">From know-how</span>
      </div>

      {/* The rotating ring — JS sets its transform every frame */}
      <div ref={ringRef} className="abt-anim-text-rotator">
        <div className="abt-anim-label-w">
          {labels.map((label, i) => {
            const angle = (360 / labels.length) * i;
            return (
              <div
                key={`${label}-${i}`}
                className="abt-anim-label"
                role="listitem"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  ref={(el) => { textRefs.current[i] = el; }}
                  className="text-small caps is-abt"
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AboutRotator;
