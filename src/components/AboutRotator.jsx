import { useEffect, useMemo, useRef } from 'react';
import './AboutRotator.css';

// Curated 20 — the personal, human things Lior values at work: the kind of
// environment, team and energy he wants to be part of (not a hard-skills list).
// Kept to moderate lengths so the radial wheel stays visually balanced.
export const DEFAULT_SKILLS = [
  'Good Energy',
  'Kindness',
  'Humor',
  'Teamwork',
  'Curiosity',
  'Trust',
  'Honesty',
  'Empathy',
  'Active Listening',
  'Playfulness',
  'Open Feedback',
  'Belonging',
  'Growth Mindset',
  'Generosity',
  'Patience',
  'Optimism',
  'Shared Wins',
  'Mentorship',
  'Clear Thinking',
  'Good Coffee',
];

// ── Animation tuning ────────────────────────────────────────────────────
const MIN_OPACITY = 0.16;          // faded labels (most of the wheel)
const MAX_OPACITY = 0.92;          // labels crossing a readable axis read dark
const CARDINAL_RANGE = 20;         // deg — cone around each 90° axis that lights up
const LIT_THRESHOLD = 0.6;         // above this strength → accent color (fewer lit at once)
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
const SCROLL_IMPULSE = 0.42;       // deg/sec added per px of scroll delta (scroll drives the wheel hard, both ways)
const MOUSE_IMPULSE = 0.16;        // deg/sec added per px of cursor movement
const MOUSE_HOVER_MULT = 1.3;      // extra mouse gain while hovering the wheel
const FRICTION = 0.90;             // per-frame velocity decay (higher = momentum carries longer)
const MAX_VEL = 340;               // deg/sec clamp so a fast scroll never whips the wheel

// Smoothstep — eases the emphasis falloff so labels brighten/dim with a soft
// curve instead of a hard linear ramp (animation-principles: ease, don't jerk).
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * AboutRotator — radial skills wheel, always in motion.
 *
 * The ring's rotation comes from idle drift + scroll + page-wide mouse motion.
 * Each label's orientation is FIXED per spoke (set once in JSX from its base
 * angle): lower-half spokes are flipped 180° so the word reads outward, and it
 * keeps that orientation as the ring turns — no abrupt 180° flip mid-spin.
 * Emphasis is positional: proximity to the nearest cardinal axis
 * (0/90/180/270) drives opacity/color, recomputed every frame.
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
      textRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = MAX_OPACITY;
        el.style.transform = 'rotate(0deg)';
      });
      return;
    }

    const N = labels.length;
    let rafId;
    let lastT = performance.now();
    let lastScrollY = window.scrollY;
    let lastScrollAt = -Infinity;
    let lastWheelAt = -Infinity;
    let lastMouseX = null;

    const nearestCardinalDist = (angle) => {
      const m = ((angle % 90) + 90) % 90;   // 0..90 within the nearest 90° sector
      return Math.min(m, 90 - m);            // 0..45 distance to the axis
    };

    const onScroll = () => {
      const y = window.scrollY;
      // If a wheel event just drove the velocity, don't double-count via the
      // position delta. Keyboard / scrollbar / touch scrolling (no wheel) still
      // spins the ring through this path.
      if (performance.now() - lastWheelAt > 120) {
        velRef.current += (y - lastScrollY) * SCROLL_IMPULSE;
      }
      lastScrollY = y;
      lastScrollAt = performance.now();
    };
    // Drive the ring directly off the scroll INPUT (wheel/trackpad delta), not
    // just the page position — so it spins even at the scroll boundaries, on a
    // short page, or inside a scroll container where window.scrollY won't move.
    const onWheel = (e) => {
      velRef.current += e.deltaY * SCROLL_IMPULSE;
      lastScrollAt = performance.now();
      lastWheelAt = lastScrollAt;
    };
    const onMouseMove = (e) => {
      if (lastMouseX !== null) {
        const gain = MOUSE_IMPULSE * (hoverRef.current ? MOUSE_HOVER_MULT : 1);
        velRef.current += (e.clientX - lastMouseX) * gain;
      }
      lastMouseX = e.clientX;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const tick = (now) => {
      // The ring ref can be momentarily null (a stray frame queued across a
      // mount/unmount or a labels change). Skip this frame and retry rather
      // than dereference null — the next frame self-heals once it's attached.
      const ring = ringRef.current;
      if (!ring) { rafId = requestAnimationFrame(tick); return; }

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
      ring.style.transform = `rotate(${rot}deg)`;

      const refs = textRefs.current;
      for (let i = 0; i < N; i++) {
        const el = refs[i];
        if (!el) continue;

        const baseAngle = (360 / N) * i;
        let worldAngle = (baseAngle + rot) % 360;
        if (worldAngle < 0) worldAngle += 360;

        // Orientation is FIXED per spoke (set once in JSX), so a word never
        // snaps 180° mid-spin — it keeps one orientation as the ring turns.

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
      window.removeEventListener('wheel', onWheel);
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
      {/* Center mark — a single cross at the heart of the wheel */}
      <div className="abt-anim-info">
        <svg className="abt-anim-info-mark" viewBox="0 0 162 162" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M108 88.7c-10.8 0-19.7 8.8-19.7 19.7v47.4c0 1.9-1.5 3.4-3.4 3.4h-8.6c-1.9 0-3.4-1.5-3.4-3.4v-47.4c0-10.8-8.8-19.7-19.7-19.7H6.4c-1.9 0-3.4-1.5-3.4-3.4v-8c0-1.9 1.5-3.4 3.4-3.4h46.9c10.8 0 19.7-8.8 19.6-19.7V6.4c0-1.9 1.5-3.4 3.4-3.4H85c1.9 0 3.4 1.5 3.4 3.4v47.8c0 10.8 8.8 19.7 19.7 19.7h46.6c1.9 0 3.4 1.5 3.4 3.4v8c0 1.9-1.5 3.4-3.4 3.4H108z"
          />
        </svg>
      </div>

      {/* The rotating ring — JS sets its transform every frame */}
      <div ref={ringRef} className="abt-anim-text-rotator">
        <div className="abt-anim-label-w">
          {labels.map((label, i) => {
            const angle = (360 / labels.length) * i;
            // Every word keeps the SAME orientation (no 180° flip) — the text is
            // never rotated relative to its spoke, so they all align uniformly.
            const flip = 0;
            return (
              <div
                key={`${label}-${i}`}
                className="abt-anim-label"
                role="listitem"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  ref={(el) => { textRefs.current[i] = el; }}
                  className="text-small is-abt"
                  style={{ transform: `rotate(${flip}deg)` }}
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
