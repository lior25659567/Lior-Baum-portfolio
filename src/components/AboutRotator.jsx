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

// Central minimalist mark — a "pinched plus": four arms of a cross joined
// at the center with small concave quarter-circles, giving the plus a
// subtle waist. Solid fill (no stroke) keeps the silhouette crisp at any
// size. Sits in a 100×100 viewBox.
const PetalSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M46 12 L54 12 L54 40 A6 6 0 0 0 60 46 L88 46 L88 54 L60 54 A6 6 0 0 0 54 60 L54 88 L46 88 L46 60 A6 6 0 0 0 40 54 L12 54 L12 46 L40 46 A6 6 0 0 0 46 40 Z" />
  </svg>
);

// Animation tuning constants
const MIN_OPACITY = 0.12;
const MAX_OPACITY = 1.0;
const HOVER_RANGE = 45;       // spotlight cone width in degrees
const PERIOD_MIN = 3500;       // ms — slowest "breath"
const PERIOD_MAX = 8000;       // ms — fastest "breath"
const PEAKINESS_MIN = 2.5;     // higher = briefer bright moments
const PEAKINESS_MAX = 4.5;
// Above this strength, a label is considered "selected" → accent color
const LIT_THRESHOLD = 0.45;

/**
 * AboutRotator — radial skills wheel.
 *
 * Structure (matches the reference Webflow piece 1-for-1):
 *   .abt-anim-text-rotator-wrap   outer stage, mouse listener target
 *     .abt-anim-text-rotator      the rotating ring (CSS-animated)
 *       .abt-anim-rotater-o       central 4-petal SVG (static, centered)
 *       .abt-anim-label-w         label container
 *         .abt-anim-label × 20    each spoke, rotated to its angle
 *           .text-small.caps.is-abt[.flip-text]   the visible text
 *
 * Each label is a spoke pinned at the center; the spoke has a real width
 * (50%) and `padding-left: var(--inner-radius)` pushes the text outward
 * so all labels start at the same distance from the center.
 *
 * Per-label opacity is driven by a rAF loop:
 *   • Idle: each label "breathes" on its own random sine wave so the wheel
 *     never settles into a visible pattern.
 *   • Hover: a 45° spotlight follows the cursor's angle around the wheel
 *     and lights up whichever labels are currently at that angle (computed
 *     from base-angle + the ring's live rotation matrix).
 */
const AboutRotator = ({ items }) => {
  const labels = useMemo(() => {
    const src = items?.length ? items : DEFAULT_SKILLS;
    return src.slice(0, 20);
  }, [items]);

  const wrapRef = useRef(null);
  const ringRef = useRef(null);
  const textRefs = useRef([]);
  const labelDataRef = useRef([]);
  const stateRef = useRef({ hovering: false, mouseAngle: 0 });

  // Re-roll per-label random rhythm whenever the label set changes
  useEffect(() => {
    labelDataRef.current = labels.map(() => ({
      phase: Math.random() * Math.PI * 2,
      period: PERIOD_MIN + Math.random() * (PERIOD_MAX - PERIOD_MIN),
      peakiness: PEAKINESS_MIN + Math.random() * (PEAKINESS_MAX - PEAKINESS_MIN),
    }));
  }, [labels]);

  // rAF loop — drives per-label opacity directly via refs (no React re-renders)
  useEffect(() => {
    if (!wrapRef.current || !ringRef.current) return;

    // Resolve accent color to a literal value at mount. Inline style
    // assignments bypass any chance of var() not resolving in a given
    // context, and the value caches for the lifetime of this loop.
    const root = document.documentElement;
    const accent = getComputedStyle(root).getPropertyValue('--color-accent').trim() || '#ff584a';

    // Respect user motion preference — freeze opacities at MAX so all labels
    // are readable, no spotlight, no spin.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      textRefs.current.forEach((el) => { if (el) el.style.opacity = MAX_OPACITY; });
      return;
    }

    let rafId;

    const readRingRotation = () => {
      const m = getComputedStyle(ringRef.current).transform;
      if (!m || m === 'none') return 0;
      const v = m.match(/matrix\(([^)]+)\)/);
      if (!v) return 0;
      const p = v[1].split(',').map(parseFloat);
      const r = (Math.atan2(p[1], p[0]) * 180) / Math.PI;
      return r < 0 ? r + 360 : r;
    };

    const tick = () => {
      const t = performance.now();
      const { hovering, mouseAngle } = stateRef.current;
      const ringRot = hovering ? readRingRotation() : 0;
      const data = labelDataRef.current;
      const refs = textRefs.current;
      const N = data.length;

      for (let i = 0; i < N; i++) {
        const el = refs[i];
        const d = data[i];
        if (!el || !d) continue;

        let strength; // 0..1 — drives both opacity and the lit-color toggle
        if (hovering) {
          const baseAngle = (360 / N) * i;
          let worldAngle = (baseAngle + ringRot) % 360;
          if (worldAngle < 0) worldAngle += 360;
          let diff = Math.abs(worldAngle - mouseAngle);
          if (diff > 180) diff = 360 - diff;
          strength = diff < HOVER_RANGE ? 1 - diff / HOVER_RANGE : 0;
        } else {
          const wave = Math.sin((t / d.period) * 2 * Math.PI + d.phase);
          strength = Math.pow(Math.max(0, wave), d.peakiness);
        }

        const opacity = MIN_OPACITY + strength * (MAX_OPACITY - MIN_OPACITY);
        el.style.opacity = opacity.toFixed(3);
        // Inline color = highest specificity, guaranteed to apply. We use the
        // pre-resolved hex from the design token (read at effect mount) so
        // there's zero ambiguity about var() resolution in inline styles.
        // Empty string clears the inline color and falls back to --color-text.
        el.style.color = strength > LIT_THRESHOLD ? accent : '';
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [labels.length]);

  const handleMouseMove = (e) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let a = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    if (a < 0) a += 360;
    stateRef.current = { hovering: true, mouseAngle: a };
  };

  const handleMouseLeave = () => {
    stateRef.current = { ...stateRef.current, hovering: false };
  };

  return (
    <div
      ref={wrapRef}
      className="abt-anim-text-rotator-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="list"
    >
      <div ref={ringRef} className="abt-anim-text-rotator">

        <div className="abt-anim-rotater-o">
          <div className="atb-rotator-c">
            <PetalSvg />
          </div>
        </div>

        <div className="abt-anim-label-w">
          {labels.map((label, i) => {
            const angle = (360 / labels.length) * i;
            // Bottom/left half: 144°–306° get flipped so letters stay upright
            const flip = angle >= 144 && angle <= 306;
            return (
              <div
                key={`${label}-${i}`}
                className="abt-anim-label"
                role="listitem"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  ref={(el) => { textRefs.current[i] = el; }}
                  className={`text-small caps is-abt ${flip ? 'flip-text' : ''}`}
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
