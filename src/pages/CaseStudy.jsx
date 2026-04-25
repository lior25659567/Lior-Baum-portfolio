import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback, Component, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import AnimatedButton from '../components/AnimatedButton';
import { useEdit } from '../context/EditContext';
import { getCaseStudyData, getCaseStudyDataAsync, saveCaseStudyData, resetCaseStudyData, listSavedCaseStudies, slideTemplates, templateCategories, compressImage, defaultCaseStudies, contactDefaults } from '../data/caseStudyData';
import { slideTemplateDocs } from '../data/slideTemplateDocs';
import { IFRAME_FILES } from '../iframes';
import imageVariantManifest from '../data/case-study-image-variants.json';
import './CaseStudy.css';

// ─── Responsive media helpers ────────────────────────────────────────────
// The build pipeline emits:
//   - <name>.webp + <name>@480.webp / @960.webp siblings (see
//     scripts/generate-image-variants.mjs; availability recorded in
//     _variants.json — the only reliable source because very small images
//     skip variants to avoid upscaling).
//   - <name>.mp4 + <name>.mobile.mp4 + <name>.poster.webp (see
//     scripts/compress-videos.js; always produced for every video, so
//     paths can be derived from the source path without a manifest).
// Ad-hoc videos uploaded through the dev editor won't have the sibling
// files yet; `onError` on the rendered element hides the fallback path so
// the user still sees the underlying media.

function buildResponsiveWebp(src) {
  if (typeof src !== 'string') return null;
  const clean = src.split('?')[0].split('#')[0];
  if (!clean.toLowerCase().endsWith('.webp')) return null;
  const entry = imageVariantManifest[clean];
  if (!entry || !Array.isArray(entry.widths) || entry.widths.length < 2) return null;
  const base = clean.replace(/\.webp$/i, '');
  const full = entry.full;
  const srcset = entry.widths
    .map((w) => (w === full ? `${src} ${w}w` : `${base}@${w}.webp ${w}w`))
    .join(', ');
  return { srcSet: srcset, sizes: '(max-width: 767px) 100vw, (max-width: 1440px) 75vw, 1440px' };
}

function deriveVideoPoster(src) {
  if (typeof src !== 'string') return null;
  const m = src.match(/^(.*)\.mp4(\?.*)?$/i);
  return m ? `${m[1]}.poster.webp` : null;
}

function deriveMobileVideoSrc(src) {
  if (typeof src !== 'string') return null;
  if (/\.mobile\.mp4(\?|$)/i.test(src)) return src;
  const m = src.match(/^(.*)\.mp4(\?.*)?$/i);
  return m ? `${m[1]}.mobile.mp4${m[2] || ''}` : null;
}

// Detect mobile viewport + data-saver network for adaptive media delivery.
// Re-evaluates on resize/connection change; safe on SSR (returns false).
function useLowBandwidthMedia() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return { mobile: false, saveData: false, slow: false };
    const mq = window.matchMedia && window.matchMedia('(max-width: 767px)');
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      mobile: !!(mq && mq.matches),
      saveData: !!(conn && conn.saveData),
      slow: !!(conn && /^(slow-2g|2g|3g)$/i.test(conn.effectiveType || '')),
    };
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const update = () => setState({
      mobile: mq.matches,
      saveData: !!(conn && conn.saveData),
      slow: !!(conn && /^(slow-2g|2g|3g)$/i.test(conn.effectiveType || '')),
    });
    const onMq = () => update();
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
    if (conn && conn.addEventListener) conn.addEventListener('change', update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onMq) : mq.removeListener(onMq);
      if (conn && conn.removeEventListener) conn.removeEventListener('change', update);
    };
  }, []);
  return state;
}

// ─────────────────────────────────────────────────────────────────────────
// LazyVideo: IntersectionObserver-gated <video> with poster + metadata
// preload. Case study videos are 5–35MB each; eagerly loading them all
// bricks bandwidth. This defers the real `src` until the slide is near
// the viewport, and asks the browser to fetch metadata only (~100KB)
// instead of the whole file up front.
// ─────────────────────────────────────────────────────────────────────────
/* After the 2026-04-23 WebP conversion (commit eb4f5dc) the .png/.jpg files
   under public/case-studies/ no longer exist on disk. Users who had edited
   anything before that deploy still carry the old paths inside localStorage
   and IndexedDB; when those are loaded verbatim, every <img> 404s and we get
   broken-image icons everywhere. This walker rewrites any /case-studies/*
   URL ending in .png/.jpg/.jpeg to .webp in-place so legacy saved data
   renders against the files that actually exist. Cheap: no network, no
   disk, just string replace. Safe to run on the same object more than once
   (second pass is a no-op). Remove once we're confident no one still has
   pre-conversion data cached locally. */
function migrateCaseStudyImagePathsToWebp(node) {
  if (node == null) return node;
  if (Array.isArray(node)) return node.map(migrateCaseStudyImagePathsToWebp);
  if (typeof node === 'object') {
    // Rebuild the object so we never mutate a shared module import (JSON
    // files imported once are cached forever; mutation would leak).
    const out = {};
    for (const k of Object.keys(node)) out[k] = migrateCaseStudyImagePathsToWebp(node[k]);
    return out;
  }
  if (typeof node === 'string' && /^\/case-studies\//.test(node)) {
    return node.replace(/\.(png|jpe?g)(?=($|[?#]))/i, '.webp');
  }
  return node;
}

const LazyVideo = memo(({ src, poster, style, className, onClick, priority = 'lazy', playbackRate = 1 }) => {
  const ref = useRef(null);
  const { mobile, saveData, slow } = useLowBandwidthMedia();
  // iOS Safari allows autoplay only when the `muted` HTML *attribute* is
  // present at parse time — `el.muted = true` (what React emits from the
  // JSX `muted` prop) is not enough. Without this, videos on `.slide-problem`
  // (and every other LazyVideo) autoplay-fail silently on iPhone and the
  // user just sees the poster. A ref callback is the earliest point we
  // can force the attribute before the element is committed to the DOM.
  const setVideoRef = useCallback((el) => {
    ref.current = el;
    if (el) {
      el.muted = true;
      if (!el.hasAttribute('muted')) el.setAttribute('muted', '');
      if (!el.hasAttribute('playsinline')) el.setAttribute('playsinline', '');
    }
  }, []);
  // high = current slide (load src + preload auto)
  // nearby = ±1 slide (load src + preload metadata to warm up)
  // lazy = far slides (gate via IntersectionObserver, no preload)
  const [visible, setVisible] = useState(priority !== 'lazy');
  useEffect(() => {
    if (priority !== 'lazy') { setVisible(true); return; }
    const el = ref.current;
    if (!el || visible) return;
    // Wider rootMargin on mobile so the video starts fetching before the user
    // swipes in; on desktop 200px is enough to cover typical slide heights.
    const rootMargin = mobile ? '400px 0px' : '200px 0px';
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } });
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [visible, priority, mobile]);
  // Prefer the 720p mobile variant on phones or when Save-Data / slow
  // network is reported. `deriveMobileVideoSrc` returns the sibling path
  // generated by scripts/compress-videos.js.
  const useMobile = (mobile || saveData || slow);
  const playbackSrc = useMobile ? (deriveMobileVideoSrc(src) || src) : src;
  const effectivePoster = poster || deriveVideoPoster(src) || undefined;
  const preload = priority === 'high' ? 'auto' : 'metadata';
  // iOS Safari is fussy about autoplay even with muted + playsInline: Low
  // Power Mode, transformed ancestors (we have one — the zoom-pan-pinch
  // scaler), and timing races with the autoplay policy check can all leave
  // the video paused on its poster frame. One `play()` call on `canplay` is
  // not enough — we retry on every load milestone, whenever the element
  // becomes `visible`, and whenever it enters the viewport. Each attempt is
  // cheap (play() on a playing element is a no-op) and swallows the
  // NotAllowedError so the promise never logs.
  const tryPlay = useCallback((el) => {
    if (!el || !el.paused) return;
    el.muted = true;
    const p = el.play();
    if (p && p.catch) p.catch(() => {});
  }, []);
  // Apply playbackRate. Browsers reset playbackRate to 1 on every src change
  // and on some loop wraps, so we re-apply on visibility flips, on `loadedmetadata`,
  // and whenever the prop changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rate = Number(playbackRate) || 1;
    try { el.defaultPlaybackRate = rate; } catch {}
    try { el.playbackRate = rate; } catch {}
  }, [playbackRate, visible]);
  const handleCanPlay = useCallback((e) => {
    const el = e.currentTarget;
    const rate = Number(playbackRate) || 1;
    try { el.playbackRate = rate; } catch {}
    tryPlay(el);
  }, [tryPlay, playbackRate]);
  const handleLoadedData = useCallback((e) => {
    const el = e.currentTarget;
    const rate = Number(playbackRate) || 1;
    try { el.playbackRate = rate; } catch {}
    tryPlay(el);
  }, [tryPlay, playbackRate]);
  // Kick off playback whenever `visible` flips to true — covers the case
  // where `canplay` already fired (video was preloaded from a prior mount)
  // and won't fire again, so the existing canplay handler would never run.
  useEffect(() => {
    if (!visible) return;
    const el = ref.current;
    if (!el) return;
    tryPlay(el);
    // One more attempt on the next frame — by then React has committed the
    // current `src`, the element is in the DOM with all attributes set, and
    // iOS has had a chance to register it as on-screen.
    const raf = requestAnimationFrame(() => tryPlay(el));
    // And a viewport-entry retry, for the zoom-pan-pinch case where the
    // element is technically in the DOM + playing but iOS paused it because
    // the transform briefly put it outside the visual viewport.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) tryPlay(el); });
    }, { threshold: 0.01 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [visible, tryPlay]);
  const handleError = useCallback((e) => {
    // If the mobile variant 404s (e.g. freshly uploaded video without a
    // sibling .mobile.mp4 yet), fall back to the desktop src once.
    const el = e.currentTarget;
    if (useMobile && el && el.src && /\.mobile\.mp4(\?|$)/i.test(el.src) && src) {
      el.src = src;
    }
  }, [useMobile, src]);
  return (
    <video
      ref={setVideoRef}
      src={visible ? playbackSrc : undefined}
      poster={effectivePoster}
      preload={preload}
      autoPlay
      loop
      muted
      playsInline
      style={style}
      className={className}
      onClick={onClick}
      onCanPlay={handleCanPlay}
      onLoadedData={handleLoadedData}
      onError={handleError}
    />
  );
});

// All the Save-to-Code / Push-to-Git / Save-All / Save-Image endpoints are
// Vite dev-plugin middleware (vite-plugin-save-case-study.js). On a static
// host like Netlify they 404 into the SPA shell, which previous code tried
// to JSON.parse — producing "Unexpected token '<'" storms. Gate every
// dev-only write behind this flag.
const IS_DEV_EDITOR = (() => {
  try {
    return !!(import.meta && import.meta.env && import.meta.env.DEV);
  } catch { return false; }
})();

// Inline matchMedia hook — avoids adding another dependency.
// Returns true when the media query matches; listens for changes.
function useMediaQuery(query) {
  const getInitial = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  };
  const [matches, setMatches] = useState(getInitial);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);
  return matches;
}

// ─── Mobile slide artboard ───────────────────────────────────────────────
// Desktop-composed slides render into a fixed 1440×810 (16:9) artboard on
// phones — the reference width desktop CSS is tuned for. react-zoom-pan-pinch
// scales the artboard to fit the viewport width; pinch zooms up to 4× from
// that base. The library owns the transform — no CSS transform is stacked.
const SLIDE_DESIGN_W = 1440;
const SLIDE_DESIGN_H = 810;
const DEFAULT_FIT_SCALE = 0.26; // safe SSR default (~375px / 1440)

function computeFitScale() {
  if (typeof window === 'undefined') return DEFAULT_FIT_SCALE;
  const vw = window.innerWidth || document.documentElement.clientWidth || 375;
  return Math.max(0.05, vw / SLIDE_DESIGN_W);
}

/**
 * SlideContainer
 * ---------------
 * On mobile (≤767px) wraps a slide in a pan/zoom surface that behaves
 * like a Figma/Canva presentation: a fixed 1440×810 artboard scaled
 * uniformly to fit the viewport width, with pinch/double-tap zoom, and
 * panning constrained to the slide edges (no wandering into the dark
 * letterbox). On desktop (≥768px) this is a passthrough.
 */
const SlideContainer = ({ children, isMobile, transformKey, onScaleChange }) => {
  const [fitScale, setFitScale] = useState(() => (isMobile ? computeFitScale() : 1));

  useEffect(() => {
    if (!isMobile) return;
    const update = () => setFitScale(computeFitScale());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [isMobile]);

  if (!isMobile) return children;

  return (
    <TransformWrapper
      key={`${transformKey}-${fitScale.toFixed(3)}`}
      initialScale={fitScale}
      minScale={fitScale}
      maxScale={fitScale * 4}
      centerOnInit={true}
      centerZoomedOut={true}
      limitToBounds={true}
      doubleClick={{ mode: 'toggle', step: 1.8 }}
      panning={{ velocityDisabled: true }}
      wheel={{ disabled: true }}
      pinch={{ step: 5 }}
      onTransformed={(_ref, state) => onScaleChange && onScaleChange(state.scale, fitScale)}
    >
      <TransformComponent
        wrapperClass="slide-zoom-wrapper"
        contentClass="slide-canvas"
      >
        {/* Frozen 1440×810 desktop artboard — the library handles scaling. */}
        <div className="slide-design">
          {children}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
};

// Error Boundary to catch rendering errors
class SlideErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Slide Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="slide slide-error">
          <div className="slide-inner">
            <h2>Something went wrong</h2>
            <p>Error: {this.state.error?.message || 'Unknown error'}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Template Preview Component
const TemplatePreview = ({ type }) => {
  const template = slideTemplates[type];
  if (!template) return <p>No preview available</p>;

  const previewDescriptions = {
    intro: 'Intro slide with project title, description, Client/Focus info, optional logo, and square image.',
    info: 'Grid layout showing project details like client, role, duration, and deliverables.',
    media: 'Full media slide supporting images, videos, Figma embeds, and video URL embeds.',
    textAndImage: 'Split layout: text (label, title, body, bullets, optional conclusion, highlight) on the left, image on the right.',
    quotes: 'User research quotes displayed in a card grid layout.',
    goals: 'Goals with numbered items and KPI cards at the bottom.',
    stats: 'Large statistics display with values and labels in a grid.',
    outcomes: 'Results grid showing outcomes with titles and descriptions.',
    end: 'Thank you slide with CTA buttons.',
    comparison: 'Before/After comparison with two images side by side.',
    process: 'Process steps displayed horizontally with numbers and descriptions.',
    timeline: 'Vertical timeline showing project phases or events.',
    tools: 'Tools and technologies grid with names and descriptions.',
    testimonial: 'Large quote/testimonial centered on the slide.',
    issuesBreakdown: 'Issues displayed in a 2x2 grid with numbered circles. Includes conclusion box.',
    achieveGoals: 'Two-column layout with KPIs on the left and Key Metrics on the right, each with numbered items.',
    projectShowcase: 'Two-column layout with large number, title, description, tags, and optional logo on left. Full image on right.',
    imageMosaic: 'Tiled image grid background with a centered title overlay. Perfect for showing old versions, screen collections, or visual overviews.',
    chapter: 'Section divider slide with large number, title, and optional subtitle. Use to separate case study chapters.',
  };

  return (
    <div className="preview-slide">
      <div className="preview-description">
        <p>{previewDescriptions[type] || 'A customizable slide template.'}</p>
      </div>
      <div className="preview-mockup">
        <div className={`mockup-slide mockup-${type}`}>
          {type === 'intro' && (
            <div className="mockup-intro-split">
              <div className="mockup-intro-content">
                <div className="mockup-title">Project Name</div>
                <div className="mockup-text-lines">
                  <div className="line" /><div className="line short" />
                </div>
                <div className="mockup-intro-meta">
                  <div className="mockup-meta-item">
                    <span className="meta-label">Client</span>
                    <span className="meta-value">Company</span>
                  </div>
                  <div className="mockup-meta-item">
                    <span className="meta-label">Focus</span>
                    <span className="meta-value">Area</span>
                  </div>
                </div>
              </div>
              <div className="mockup-intro-image">
                <span className="mockup-img-icon">🖼</span>
              </div>
            </div>
          )}
          {type === 'info' && (
            <div className="mockup-info-grid">
              <div className="mockup-info-item"><span>Client</span><span>Company Inc.</span></div>
              <div className="mockup-info-item"><span>Role</span><span>Lead Designer</span></div>
              <div className="mockup-info-item"><span>Duration</span><span>3 Months</span></div>
              <div className="mockup-info-item"><span>Deliverables</span><span>UI/UX, Design System</span></div>
            </div>
          )}
          {(type === 'media' || type === 'image') && (
            <div className="mockup-image-slide">
              <div className="mockup-label" />
              <div className="mockup-title-sm">Visual Showcase</div>
              <div className="mockup-image large"><span className="mockup-img-icon">🖼</span></div>
              <div className="mockup-caption" />
            </div>
          )}
          {type === 'textAndImage' && (
            <div className="mockup-split">
              <div className="mockup-split-content">
                <div className="mockup-label" />
                <div className="mockup-title-sm">Heading</div>
                <div className="mockup-issues-list">
                  <div className="mockup-issue"><span>•</span><div className="line" /></div>
                  <div className="mockup-issue"><span>•</span><div className="line" /></div>
                  <div className="mockup-issue"><span>•</span><div className="line" /></div>
                </div>
                <div className="mockup-conclusion-box">Conclusion</div>
              </div>
              <div className="mockup-image"><span className="mockup-img-icon">🖼</span></div>
            </div>
          )}
          {type === 'quotes' && (
            <div className="mockup-quotes">
              <div className="mockup-quote-card">
                <span className="quote-mark">"</span>
                <div className="line" />
                <div className="mockup-quote-author" />
              </div>
              <div className="mockup-quote-card">
                <span className="quote-mark">"</span>
                <div className="line" />
                <div className="mockup-quote-author" />
              </div>
              <div className="mockup-quote-card">
                <span className="quote-mark">"</span>
                <div className="line" />
                <div className="mockup-quote-author" />
              </div>
            </div>
          )}
          {type === 'goals' && (
            <div className="mockup-goals-detailed">
              <div className="mockup-goals-list">
                <div className="mockup-goal"><span>1</span><div className="mockup-goal-content"><div className="line" /></div></div>
                <div className="mockup-goal"><span>2</span><div className="mockup-goal-content"><div className="line" /></div></div>
                <div className="mockup-goal"><span>3</span><div className="mockup-goal-content"><div className="line" /></div></div>
              </div>
              <div className="mockup-kpis">
                <div className="mockup-kpi">KPI 1</div>
                <div className="mockup-kpi">KPI 2</div>
              </div>
            </div>
          )}
          {type === 'stats' && (
            <div className="mockup-stats">
              <div className="mockup-stat"><span>85%</span><div className="line">Increase</div></div>
              <div className="mockup-stat"><span>2.5x</span><div className="line">Growth</div></div>
              <div className="mockup-stat"><span>95%</span><div className="line">Satisfaction</div></div>
            </div>
          )}
          {type === 'outcomes' && (
            <div className="mockup-outcomes">
              <div className="mockup-outcome"><span>📈</span><div className="line">Result 1</div></div>
              <div className="mockup-outcome"><span>⭐</span><div className="line">Result 2</div></div>
              <div className="mockup-outcome"><span>🎯</span><div className="line">Result 3</div></div>
              <div className="mockup-outcome"><span>💎</span><div className="line">Result 4</div></div>
            </div>
          )}
          {type === 'end' && (
            <div className="mockup-end">
              <div className="mockup-title">Thank You!</div>
              <div className="mockup-end-subtitle">Let's work together</div>
              <div className="mockup-btns">
                <div className="mockup-btn">Contact</div>
                <div className="mockup-btn outline">Portfolio</div>
              </div>
            </div>
          )}
          {type === 'comparison' && (
            <div className="mockup-comparison">
              <div className="mockup-switcher">
                <span className="mockup-tab active">Before</span>
                <span className="mockup-tab">After</span>
              </div>
              <div className="mockup-image" style={{ width: '100%' }}><span className="mockup-img-icon">📷</span></div>
            </div>
          )}
          {type === 'process' && (
            <div className="mockup-process">
              <div className="mockup-step"><span>01</span><div className="step-title">Research</div></div>
              <div className="mockup-step-arrow">→</div>
              <div className="mockup-step"><span>02</span><div className="step-title">Design</div></div>
              <div className="mockup-step-arrow">→</div>
              <div className="mockup-step"><span>03</span><div className="step-title">Test</div></div>
              <div className="mockup-step-arrow">→</div>
              <div className="mockup-step"><span>04</span><div className="step-title">Launch</div></div>
            </div>
          )}
          {type === 'timeline' && (
            <div className="mockup-timeline">
              <div className="mockup-event"><span className="event-date">Q1</span><div className="event-content">Phase 1</div></div>
              <div className="mockup-event"><span className="event-date">Q2</span><div className="event-content">Phase 2</div></div>
              <div className="mockup-event"><span className="event-date">Q3</span><div className="event-content">Phase 3</div></div>
              <div className="mockup-event"><span className="event-date">Q4</span><div className="event-content">Phase 4</div></div>
            </div>
          )}
          {type === 'testimonial' && (
            <div className="mockup-testimonial">
              <div className="mockup-big-quote">"</div>
              <div className="mockup-quote-text">This product changed everything for us...</div>
              <div className="mockup-author">— Client Name, Role</div>
            </div>
          )}
          {type === 'tools' && (
            <div className="mockup-tools">
              <div className="mockup-tool"><span>🎨</span><div>Figma</div></div>
              <div className="mockup-tool"><span>⚛️</span><div>React</div></div>
              <div className="mockup-tool"><span>📊</span><div>Analytics</div></div>
            </div>
          )}
          {type === 'issuesBreakdown' && (
            <div className="mockup-issues-breakdown">
              <div className="mockup-label" />
              <div className="mockup-title-sm">what started to break</div>
              <div className="mockup-issues-grid">
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">1</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">2</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">3</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">4</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
              </div>
              <div className="mockup-conclusion-box">Conclusion summary</div>
            </div>
          )}
          {type === 'achieveGoals' && (
            <div className="mockup-achieve-goals">
              <div className="mockup-label" />
              <div className="mockup-title-sm">What did we want to achieve?</div>
              <div className="mockup-goals-columns">
                <div className="mockup-goals-col">
                  <div className="mockup-col-title">KPIs</div>
                  <div className="mockup-goal-item"><span className="goal-num">1</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">2</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">3</span><div className="line" /></div>
                </div>
                <div className="mockup-goals-col">
                  <div className="mockup-col-title">Key metrics</div>
                  <div className="mockup-goal-item"><span className="goal-num">1</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">2</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">3</span><div className="line" /></div>
                </div>
              </div>
            </div>
          )}
          {type === 'projectShowcase' && (
            <div className="mockup-project-showcase">
              <div className="mockup-ps-info">
                <div className="mockup-ps-number">03</div>
                <div className="mockup-ps-title">Project</div>
                <div className="mockup-text-lines">
                  <div className="line" /><div className="line short" />
                </div>
                <div className="mockup-ps-tags">UX • Design</div>
                <div className="mockup-ps-logo" />
              </div>
              <div className="mockup-ps-visual">
                <div className="mockup-image"><span className="mockup-img-icon large">🖼</span></div>
              </div>
            </div>
          )}
          {type === 'imageMosaic' && (
            <div className="mockup-image-mosaic">
              <div className="mockup-mosaic-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="mockup-mosaic-tile" />
                ))}
              </div>
              <div className="mockup-mosaic-overlay">
                <div className="mockup-mosaic-title">Title</div>
              </div>
            </div>
          )}
          {type === 'chapter' && (
            <div className="mockup-chapter">
              <div className="mockup-chapter-number">01</div>
              <div className="mockup-chapter-title">Research</div>
              <div className="mockup-chapter-subtitle">Understanding the problem</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add a scheme to user-entered URLs so `google.com` navigates as an external link.
const normalizeExternalUrl = (u) => {
  if (!u || typeof u !== 'string') return '';
  const trimmed = u.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;
  return `https://${trimmed}`;
};

// Editable field component - defined outside CaseStudy for stable React identity across renders.
// This prevents unmount/remount cycles that destroy input state, cursor position, and focus.
const EditableField = memo(function EditableField({ value, onChange, multiline = false, allowLineBreaks = false, className = '', placeholder = '' }) {
  const { editMode } = useEdit();
  const stringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
  const [localValue, setLocalValue] = useState(stringValue);
  const timeoutRef = useRef(null);
  const isEditingRef = useRef(false);
  const isTextarea = multiline || allowLineBreaks;

  // Sync local value when prop changes from outside (but not while user is actively typing)
  useEffect(() => {
    if (!isEditingRef.current) {
      const newStringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
      setLocalValue(newStringValue);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    isEditingRef.current = true;
    setLocalValue(newValue);
    
    // Debounce the update to parent
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
      isEditingRef.current = false;
    }, 300);
  };
  
  const handleBlur = () => {
    // Clear editing flag and save immediately on blur
    isEditingRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  // In single-line input: Shift+Enter inserts newline (stored; view uses pre-line). In textarea with allowLineBreaks: only Shift+Enter adds newline, Enter does nothing.
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (allowLineBreaks && !e.shiftKey) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && !multiline && !allowLineBreaks) {
      e.preventDefault();
      const newValue = localValue + '\n';
      setLocalValue(newValue);
      onChange(newValue);
    }
  };
  
  if (!editMode) {
    // Render with line breaks preserved
    if (isTextarea || (stringValue && stringValue.includes('\n'))) {
      return <span className={className} style={{ whiteSpace: 'pre-line' }}>{stringValue}</span>;
    }
    return stringValue;
  }
  
  return isTextarea ? (
    <textarea
      className={`editable-field ${className}`}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
    />
  ) : (
    <input
      type="text"
      className={`editable-field ${className}`}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
    />
  );
});

// Module-level Figma URL helper (used by ComparisonSlide and CaseStudy)
const toFigmaEmbedUrlModule = (input) => {
  if (!input || typeof input !== 'string') return null;
  let trimmed = input.trim();
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) trimmed = iframeMatch[1];
  if (!/^https?:\/\/([\w-]+\.)*figma\.com\//i.test(trimmed)) return null;
  if (trimmed.includes('/embed') || trimmed.includes('embed.figma.com')) {
    if (!trimmed.includes('scaling=')) return trimmed + (trimmed.includes('?') ? '&' : '?') + 'scaling=scale-down-width';
    return trimmed;
  }
  return `https://www.figma.com/embed?embed_host=share&scaling=scale-down-width&url=${encodeURIComponent(trimmed)}`;
};

// Module-level YouTube URL helper
const toYouTubeEmbedUrl = (input) => {
  if (!input || typeof input !== 'string') return null;
  let trimmed = input.trim();
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) trimmed = iframeMatch[1];
  let videoId = null;
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) { videoId = m[1]; break; }
  }
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&playsinline=1`;
};

// Module-level raw-iframe source helper — accepts full <iframe> HTML or a path/URL.
// Why bare strings need normalization: in a React SPA, any unknown path falls back to
// index.html, so a src like "timeline.html" or "example.com" would load the portfolio
// itself inside the iframe. We rewrite:
//   - "example.com/page" / "www.site.com" → "https://example.com/page" (domain detected)
//   - bare filename "foo.html"            → "/iframes/foo.html" (convention: HTML embeds live in public/iframes/)
//   - "folder/x.pdf"                      → "/folder/x.pdf"
// Already-absolute URLs, protocol-relative "//…", and "/…" paths pass through unchanged.
const toIframeSrc = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  let src = (iframeMatch ? iframeMatch[1] : trimmed).trim();
  if (!src) return null;
  if (/^([a-z][a-z0-9+\-.]*:|\/\/)/i.test(src)) return src;
  if (src.startsWith('/')) return src;
  const firstSeg = src.split(/[/?#]/)[0];
  const looksLikeDomain = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/i.test(firstSeg);
  const isLocalFileExt = /\.(html?|pdf|php|aspx?|jsp|css|js|json|xml|txt|md|svg|png|jpe?g|gif|webp|mp4|webm|ogg|mp3|wav)$/i.test(firstSeg);
  if (looksLikeDomain && !isLocalFileExt) return 'https://' + src;
  const cleaned = src.replace(/^\.\//, '');
  if (!cleaned.includes('/')) return '/iframes/' + cleaned;
  return '/' + cleaned;
};

// Shared helper — used by ComparisonSlide and CaseStudy's getSplitStyle
const getSplitStyleModule = (slide) => {
  const ratio = slide.splitRatio || 50;
  return { gridTemplateColumns: `${ratio}fr ${100 - ratio}fr` };
};

// ─── UNIFIED SPLIT SLIDE ────────────────────────────────────────────────────
// Handles three modes, toggled in edit mode:
//   'simple'     — label + title + text/bullets + static image (problem/context/feature style)
//   'before-after' — Before/After pill toggle + per-tab description/bullets + switching image
//   'tabs'       — Multi-tab switcher (2–6 tabs) with per-tab bullets and image (problemSolution style)
//
// Type defaults:
//   'comparison'      → 'before-after'
//   'problemSolution' → 'tabs'
//   all others        → 'simple'
const ComparisonSlide = memo(function ComparisonSlide({ slide, index, slideControls, editMode, updateSlide, OptionalField, DynamicImages, DynamicBullets, DynamicContent, SplitRatioControl, SplitDragHandle, setLightboxImage, spacingStyle, titleSpacingControl }) {
  // ── mode ──
  const getDefaultMode = (s) => {
    if (s.slideMode) return s.slideMode;
    if (s.type === 'comparison') return 'before-after';
    if (s.type === 'problemSolution') return 'tabs';
    return 'simple';
  };
  const slideMode = getDefaultMode(slide);
  const setMode = (m) => updateSlide(index, { slideMode: m });
  const switcherStyle = slide.switcherStyle || 'pill'; // 'pill' | 'flat'

  // ── carousel state ──
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselImages = Array.isArray(slide.carouselImages) ? slide.carouselImages : [];
  const carouselAuto = slide.carouselAuto !== false;
  const carouselInterval = slide.carouselInterval || 4000;

  // Auto-advance carousel
  useEffect(() => {
    if (slideMode !== 'carousel' || !carouselAuto || carouselImages.length <= 1 || editMode) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselImages.length);
    }, carouselInterval);
    return () => clearInterval(timer);
  }, [slideMode, carouselAuto, carouselImages.length, carouselInterval, editMode]);

  // ── before/after state ──
  const [baActiveTab, setBaActiveTab] = useState('before');
  // Tracks whether the user has revealed the "after" view at least once on this
  // slide. Drives the one-shot "click After" affordance so returning readers
  // don't keep seeing the nudge after they already interacted.
  const [hasRevealedAfter, setHasRevealedAfter] = useState(false);
  const beforeLabel = slide.beforeLabel || 'Before';
  const afterLabel = slide.afterLabel || 'After';
  // Per-slide toggle: 'pulse' (default) shows the "click After" nudge until the
  // reader interacts; 'off' turns the nudge off entirely for this slide.
  const afterNudge = slide.afterNudge === 'off' ? 'off' : 'pulse';
  const showAfterNudge = afterNudge === 'pulse' && !hasRevealedAfter && baActiveTab === 'before';

  // ── tabs (problemSolution) state ──
  const [psEmbedInput, setPsEmbedInput] = useState({ tabIdx: null, draft: '', type: 'figma' });
  const PS_MIN = 2; const PS_MAX = 6;
  const getPsTabs = (s) => {
    if (Array.isArray(s.psTabs) && s.psTabs.length >= PS_MIN) {
      return s.psTabs.map(t => ({
        label: t.label ?? '', columnLabel: t.columnLabel ?? '',
        image: t.image ?? '', embedUrl: t.embedUrl ?? '', embedType: t.embedType ?? 'figma',
        bullets: Array.isArray(t.bullets) ? t.bullets : [], bulletsTitle: t.bulletsTitle ?? '',
      }));
    }
    return [
      { label: s.problemLabel ?? 'Problem', columnLabel: '', image: s.problemImage ?? '', embedUrl: '', embedType: 'figma', bullets: Array.isArray(s.problemBullets) ? s.problemBullets : [], bulletsTitle: s.problemBulletsTitle ?? '' },
      { label: s.solutionLabel ?? 'Solution', columnLabel: '', image: s.solutionImage ?? '', embedUrl: '', embedType: 'figma', bullets: Array.isArray(s.solutionBullets) ? s.solutionBullets : [], bulletsTitle: s.solutionBulletsTitle ?? '' },
    ];
  };
  const psTabs = getPsTabs(slide);
  const rawPsActive = slide.psActiveView;
  const psActiveView = typeof rawPsActive === 'number' && rawPsActive >= 0 && rawPsActive < psTabs.length
    ? rawPsActive : rawPsActive === 'solution' ? 1 : 0;
  const psActiveTab = psTabs[psActiveView] || psTabs[0];
  const updatePsTab = (tabIdx, updates) => {
    const next = [...psTabs]; next[tabIdx] = { ...next[tabIdx], ...updates };
    updateSlide(index, { psTabs: next });
  };
  const setPsTabCount = (count) => {
    const n = Math.min(PS_MAX, Math.max(PS_MIN, count));
    const next = [];
    for (let i = 0; i < n; i++) next.push(psTabs[i] || { label: `Tab ${i + 1}`, image: '', embedUrl: '', embedType: 'figma', bullets: [], bulletsTitle: '' });
    updateSlide(index, { psTabs: next, psActiveView: Math.min(psActiveView, n - 1) });
  };
  const updateSlideForPsTab = (idx, updates) => {
    if (idx !== index) { updateSlide(idx, updates); return; }
    const u = {};
    if (updates.problemLabel !== undefined) u.columnLabel = updates.problemLabel;
    if (updates.problemBullets !== undefined) u.bullets = updates.problemBullets;
    if (updates.problemBulletsTitle !== undefined) u.bulletsTitle = updates.problemBulletsTitle;
    if (Object.keys(u).length) updatePsTab(psActiveView, u); else updateSlide(idx, updates);
  };
  const psLabelAboveBullets = psActiveTab.columnLabel || psActiveTab.label;
  const psSlideView = { ...slide, problemLabel: psLabelAboveBullets, problemBullets: psActiveTab.bullets, problemBulletsTitle: psActiveTab.bulletsTitle };

  // ── simple-mode field mapping ──
  const t = slide.type;
  const contentField = t === 'feature' ? 'description' : 'content';
  const bulletsField = t === 'problem' ? 'issues' : (t === 'testing' ? 'layouts' : 'bullets');
  const bulletsTitleField = t === 'problem' ? 'issuesTitle' : (t === 'testing' ? 'layoutsTitle' : 'bulletsTitle');
  const bulletsLabel = t === 'problem' ? 'Issue' : (t === 'testing' ? 'Option' : 'Bullet');
  const showConclusion = t === 'problem' || t === 'testing';

  // ── right-side image source ──
  const baImageField = baActiveTab === 'before' ? 'beforeImage' : 'afterImage';

  // ── tabs: open-file helper ──
  const openFileForPsTab = (tabIdx) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*,video/mp4,video/webm,.gif';
    inp.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
    inp.onchange = async (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      const r = new FileReader();
      r.onload = async (ev) => {
        try {
          const d = ev.target?.result;
          if (f.type.startsWith('video/') || f.type === 'image/gif') { updatePsTab(tabIdx, { image: d, embedUrl: '' }); }
          else { const c = await compressImage(d); updatePsTab(tabIdx, { image: c, embedUrl: '' }); }
        } catch { updatePsTab(tabIdx, { image: ev.target?.result, embedUrl: '' }); }
        inp.remove();
      };
      r.readAsDataURL(f);
    };
    document.body.appendChild(inp); inp.click();
    setTimeout(() => { try { inp.remove(); } catch (_) {} }, 500);
  };

  return (
    <div className={`slide slide-problem slide-comparison-unified mode-${slideMode}`} style={spacingStyle}>
      {slideControls}
      {titleSpacingControl}
      {SplitRatioControl && <SplitRatioControl slide={slide} slideIndex={index} />}

      {/* ── Edit-mode: style mode picker — only for comparison / problemSolution ── */}

      <div className="slide-inner slide-split" style={getSplitStyleModule(slide)}>
        <div className="split-content">
          {/* Label + Title — always present */}
          <span className="slide-label">
            <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
          </span>
          <h2 className="problem-title">
            <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
          </h2>

          {/* ══ SIMPLE ══ */}
          {slideMode === 'simple' && (
            <>
              <DynamicContent slide={slide} slideIndex={index} field={contentField} className="problem-text-wrapper" />
              <DynamicBullets slide={slide} slideIndex={index} field={bulletsField} titleField={bulletsTitleField} className="problem-issues-wrapper" label={bulletsLabel} />
              <DynamicBullets slide={slide} slideIndex={index} field="bullets2" titleField="bullets2Title" className="problem-issues-wrapper problem-bullets-second" label="Bullet" />
              {showConclusion && (
                <OptionalField slide={slide} index={index} field="conclusion" label="Conclusion" defaultValue="Add conclusion...">
                  <p className="problem-conclusion">
                    <EditableField value={slide.conclusion} onChange={(v) => updateSlide(index, { conclusion: v })} />
                  </p>
                </OptionalField>
              )}
            </>
          )}

          {/* ══ BEFORE / AFTER ══ */}
          {slideMode === 'before-after' && (
            <>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="comparison-description-wrapper" maxParagraphs={2} optional />
              {editMode && t === 'comparison' && (
                <div className="comparison-mode-control">
                  <span className="comparison-mode-label">Style</span>
                  <button type="button" className={`comparison-mode-btn${switcherStyle !== 'flat' ? ' active' : ''}`} onClick={() => updateSlide(index, { switcherStyle: 'pill' })}>Pill</button>
                  <button type="button" className={`comparison-mode-btn${switcherStyle === 'flat' ? ' active' : ''}`} onClick={() => updateSlide(index, { switcherStyle: 'flat' })}>Flat</button>
                  <span className="comparison-mode-label comparison-mode-label--sep">Nudge</span>
                  <button type="button" className={`comparison-mode-btn${afterNudge === 'pulse' ? ' active' : ''}`} onClick={() => updateSlide(index, { afterNudge: 'pulse' })}>Pulse</button>
                  <button type="button" className={`comparison-mode-btn${afterNudge === 'off' ? ' active' : ''}`} onClick={() => updateSlide(index, { afterNudge: 'off' })}>Off</button>
                </div>
              )}
              <div
                className={switcherStyle === 'flat' ? 'comparison-switcher-flat' : 'comparison-switcher'}
                data-after-hint={showAfterNudge ? 'true' : undefined}
              >
                <button
                  type="button"
                  className={`${switcherStyle === 'flat' ? 'comparison-tab-flat' : 'comparison-tab'}${baActiveTab === 'before' ? ' active' : ''}`}
                  onClick={() => setBaActiveTab('before')}
                >
                  {beforeLabel}
                </button>
                <button
                  type="button"
                  className={`${switcherStyle === 'flat' ? 'comparison-tab-flat' : 'comparison-tab'}${baActiveTab === 'after' ? ' active' : ''}`}
                  onClick={() => { setBaActiveTab('after'); setHasRevealedAfter(true); }}
                >
                  {afterLabel}
                </button>
              </div>
              {editMode && (
                <div className="comparison-label-edit">
                  <input type="text" value={slide.beforeLabel || ''} placeholder="Before label" onChange={(e) => updateSlide(index, { beforeLabel: e.target.value || undefined })} className="comparison-label-input" />
                  <input type="text" value={slide.afterLabel || ''} placeholder="After label" onChange={(e) => updateSlide(index, { afterLabel: e.target.value || undefined })} className="comparison-label-input" />
                </div>
              )}
              <div className="comparison-panel">
                {baActiveTab === 'before' ? (
                  <>
                    <OptionalField slide={slide} index={index} field="beforeDescription" label="Before Description" defaultValue="Describe the before state..." multiline>
                      <p className="comparison-side-description"><EditableField value={slide.beforeDescription} onChange={(v) => updateSlide(index, { beforeDescription: v })} multiline /></p>
                    </OptionalField>
                    <DynamicBullets slide={slide} slideIndex={index} field="beforeBullets" titleField="beforeBulletsTitle" className="comparison-side-bullets" label="Before Point" />
                  </>
                ) : (
                  <>
                    <OptionalField slide={slide} index={index} field="afterDescription" label="After Description" defaultValue="Describe the after state..." multiline>
                      <p className="comparison-side-description"><EditableField value={slide.afterDescription} onChange={(v) => updateSlide(index, { afterDescription: v })} multiline /></p>
                    </OptionalField>
                    <DynamicBullets slide={slide} slideIndex={index} field="afterBullets" titleField="afterBulletsTitle" className="comparison-side-bullets" label="After Point" />
                  </>
                )}
              </div>
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="comparison-bullets" label="Bullet" />
            </>
          )}

          {/* ══ TABS ══ */}
          {slideMode === 'tabs' && (
            <>
              {/* Optional subtitle + paragraphs */}
              {((slide.subtitle != null && slide.subtitle !== '') || (editMode && slide.subtitle !== null)) && (
                <div className="ps-subtitle-wrapper">
                  <p className="ps-subtitle"><EditableField value={slide.subtitle || ''} onChange={(v) => updateSlide(index, { subtitle: v })} placeholder="Subtitle (optional)" /></p>
                  {editMode && <button type="button" className="remove-field-btn issues-breakdown-remove" onClick={() => updateSlide(index, { subtitle: null })}>× Remove subtitle</button>}
                </div>
              )}
              {editMode && (slide.subtitle == null || slide.subtitle === '') && (
                <button type="button" className="add-field-btn" onClick={() => updateSlide(index, { subtitle: 'Add subtitle...' })}>+ Add subtitle</button>
              )}
              {((slide.psParagraph1 != null && slide.psParagraph1 !== '') || (editMode && slide.psParagraph1 !== null)) && (
                <div className="ps-paragraph-wrapper">
                  <p className="ps-paragraph"><EditableField value={slide.psParagraph1 || ''} onChange={(v) => updateSlide(index, { psParagraph1: v })} multiline placeholder="First paragraph (optional)" /></p>
                  {editMode && <button type="button" className="remove-field-btn issues-breakdown-remove" onClick={() => updateSlide(index, { psParagraph1: null })}>× Remove paragraph</button>}
                </div>
              )}
              {editMode && (slide.psParagraph1 == null || slide.psParagraph1 === '') && (
                <button type="button" className="add-field-btn add-field-btn-sm" onClick={() => updateSlide(index, { psParagraph1: 'Add first paragraph...' })}>+ Add paragraph 1</button>
              )}
              {((slide.psParagraph2 != null && slide.psParagraph2 !== '') || (editMode && slide.psParagraph2 !== null)) && (
                <div className="ps-paragraph-wrapper">
                  <p className="ps-paragraph"><EditableField value={slide.psParagraph2 || ''} onChange={(v) => updateSlide(index, { psParagraph2: v })} multiline placeholder="Second paragraph (optional)" /></p>
                  {editMode && <button type="button" className="remove-field-btn issues-breakdown-remove" onClick={() => updateSlide(index, { psParagraph2: null })}>× Remove paragraph</button>}
                </div>
              )}
              {editMode && (slide.psParagraph2 == null || slide.psParagraph2 === '') && (
                <button type="button" className="add-field-btn add-field-btn-sm" onClick={() => updateSlide(index, { psParagraph2: 'Add second paragraph...' })}>+ Add paragraph 2</button>
              )}

              {/* Tabs row */}
              <div className="ps-tabs-and-bullets">
                <div className="ps-view-tabs-row">
                  {editMode && (
                    <div className="ps-tab-count-edit">
                      <span className="ps-tab-edit-caption">Tabs</span>
                      <div className="ps-tab-count-btns">
                        {[2, 3, 4, 5].map(n => (
                          <button key={n} type="button" className={`ps-tab-count-btn ${psTabs.length === n ? 'active' : ''}`} onClick={() => setPsTabCount(n)}>{n}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={switcherStyle === 'pill' ? 'comparison-switcher' : 'ps-view-tabs'}>
                    {psTabs.map((tab, i) => (
                      <button key={i} type="button" className={`${switcherStyle === 'pill' ? 'comparison-tab' : 'ps-tab'} ${psActiveView === i ? 'active' : ''}`} onClick={() => updateSlide(index, { psActiveView: i })}>
                        {tab.label || `Tab ${i + 1}`}
                      </button>
                    ))}
                  </div>
                  {editMode && (
                    <div className="ps-tab-titles-edit">
                      <label className="ps-tab-edit-label">
                        <span className="ps-tab-edit-caption">Tab titles</span>
                        <span className="ps-tab-edit-fields">
                          {psTabs.map((tab, i) => (
                            <input key={i} type="text" value={tab.label ?? ''} onChange={(e) => updatePsTab(i, { label: e.target.value || undefined })} placeholder={`Tab ${i + 1}`} className="ps-tab-edit-input" />
                          ))}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
                <OptionalField slide={psSlideView} index={index} field="problemLabel" label="Label above bullets" defaultValue="" updateSlideOverride={updateSlideForPsTab}>
                  <span className="ps-col-label ps-problem-label">
                    <EditableField value={psActiveTab.columnLabel ?? ''} placeholder={psActiveTab.label || `Tab ${psActiveView + 1}`} onChange={(v) => updatePsTab(psActiveView, { columnLabel: v || undefined })} />
                  </span>
                </OptionalField>
                <DynamicBullets slide={psSlideView} slideIndex={index} field="problemBullets" titleField="problemBulletsTitle" className="problem-issues-wrapper" label="Point" updateSlideOverride={updateSlideForPsTab} />
              </div>
            </>
          )}

          {/* Shared: highlight */}
          <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
            <div className="problem-highlight">
              <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
            </div>
          </OptionalField>
        </div>

        {/* ── DRAG HANDLE ── */}
        {SplitDragHandle && <SplitDragHandle slide={slide} slideIndex={index} />}

        {/* ── RIGHT SIDE ── */}
        {slideMode === 'simple' && (
          <DynamicImages slide={slide} slideIndex={index} field="image" className="split-images-wrapper" />
        )}
        {slideMode === 'before-after' && (
          <DynamicImages slide={slide} slideIndex={index} field={baImageField} className="split-images-wrapper" />
        )}
        {slideMode === 'tabs' && (
          <div className="split-images-wrapper ps-split-image-wrap">
            {psTabs.map((tab, tabIdx) => {
              const tabSrc = (tab.image && (typeof tab.image === 'string' ? tab.image : (Array.isArray(tab.image) ? tab.image[0]?.src : null))) || '';
              const tabEmbed = tab.embedUrl || '';
              return (
                <div key={tabIdx} className={`ps-split-image-panel ${psActiveView === tabIdx ? 'ps-split-image-panel-visible' : ''}`} aria-hidden={psActiveView !== tabIdx}>
                  {tabEmbed ? (
                    <div className="ps-img-wrap ps-img-contain">
                      <div className="ps-img-inner ps-embed-inner">
                        <iframe src={tabEmbed} title={tab.embedType === 'site' ? 'Site Embed' : tab.embedType === 'iframe' ? 'Embedded iframe' : 'Figma Embed'} allowFullScreen className={tab.embedType === 'site' ? 'site-embed-iframe' : tab.embedType === 'iframe' ? 'iframe-embed-iframe' : 'figma-embed-iframe'} />
                      </div>
                      {editMode && <div className="ps-img-controls"><button type="button" className="ps-remove-img" onClick={() => updatePsTab(tabIdx, { embedUrl: '', embedType: 'figma' })}>⇄ Change media</button><button type="button" className="ps-remove-img" onClick={() => updatePsTab(tabIdx, { embedUrl: '', embedType: 'figma' })}>× Remove embed</button></div>}
                    </div>
                  ) : tabSrc ? (
                    <div className="ps-img-wrap ps-img-contain">
                      <div className="ps-img-inner" onClick={() => { if (editMode) openFileForPsTab(tabIdx); else if (tabSrc && setLightboxImage) setLightboxImage(tabSrc); }}>
                        <img src={tabSrc} alt={tab.label || `Tab ${tabIdx + 1}`} style={{ objectFit: 'contain' }} />
                        {editMode && <div className="image-edit-overlay">Click to change</div>}
                      </div>
                      {editMode && <div className="ps-img-controls"><button type="button" className="ps-remove-img" onClick={() => updatePsTab(tabIdx, { image: '' })}>× Remove image</button></div>}
                    </div>
                  ) : editMode ? (
                    <div className="ps-media-type-picker">
                      {psEmbedInput.tabIdx === tabIdx ? (
                        <div className="figma-embed-input">
                          {psEmbedInput.type === 'iframe' && IFRAME_FILES.length > 0 && (
                            <select
                              className="iframe-file-picker"
                              value=""
                              onChange={(e) => {
                                const picked = e.target.value;
                                if (!picked) return;
                                const src = toIframeSrc(picked);
                                if (src) { updatePsTab(tabIdx, { embedUrl: src, embedType: 'iframe', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                              }}
                              title="Pick a file from public/iframes/"
                            >
                              <option value="">Pick from /public/iframes…</option>
                              {IFRAME_FILES.map(f => (
                                <option key={f.path} value={f.path}>{f.label}</option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            className="editable-field figma-url-input"
                            placeholder={psEmbedInput.type === 'site' ? 'Paste website URL to embed...' : psEmbedInput.type === 'iframe' ? 'Paste iframe tag, URL, or filename' : 'Paste Figma URL or <iframe> embed code...'}
                            value={psEmbedInput.draft}
                            onChange={(e) => setPsEmbedInput({ ...psEmbedInput, draft: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key !== 'Enter') return;
                              if (psEmbedInput.type === 'site') {
                                const url = psEmbedInput.draft.trim();
                                if (url && /^https?:\/\/.+/i.test(url)) { updatePsTab(tabIdx, { embedUrl: url, embedType: 'site', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                                else alert('Please enter a valid URL (starting with http:// or https://)');
                              } else if (psEmbedInput.type === 'iframe') {
                                const src = toIframeSrc(psEmbedInput.draft);
                                if (src) { updatePsTab(tabIdx, { embedUrl: src, embedType: 'iframe', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                                else alert('Please paste an <iframe> tag or a path/URL');
                              } else {
                                const converted = toFigmaEmbedUrlModule(psEmbedInput.draft);
                                if (converted) { updatePsTab(tabIdx, { embedUrl: converted, embedType: 'figma', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                                else alert('Please enter a valid Figma URL or <iframe> embed code');
                              }
                            }}
                            autoFocus
                          />
                          <button type="button" className="figma-embed-confirm" onClick={() => {
                            if (psEmbedInput.type === 'site') {
                              const url = psEmbedInput.draft.trim();
                              if (url && /^https?:\/\/.+/i.test(url)) { updatePsTab(tabIdx, { embedUrl: url, embedType: 'site', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                              else alert('Please enter a valid URL (starting with http:// or https://)');
                            } else if (psEmbedInput.type === 'iframe') {
                              const src = toIframeSrc(psEmbedInput.draft);
                              if (src) { updatePsTab(tabIdx, { embedUrl: src, embedType: 'iframe', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                              else alert('Please paste an <iframe> tag or a path/URL');
                            } else {
                              const converted = toFigmaEmbedUrlModule(psEmbedInput.draft);
                              if (converted) { updatePsTab(tabIdx, { embedUrl: converted, embedType: 'figma', image: '' }); setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' }); }
                              else alert('Please enter a valid Figma URL or <iframe> embed code');
                            }
                          }}>Embed</button>
                          <button type="button" className="figma-embed-cancel" onClick={() => setPsEmbedInput({ tabIdx: null, draft: '', type: 'figma' })}>Cancel</button>
                        </div>
                      ) : (
                        <div className="media-type-buttons">
                          <button type="button" className="media-type-btn" onClick={() => openFileForPsTab(tabIdx)}><span className="media-type-icon">+</span><span>Upload Image</span></button>
                          <button type="button" className="media-type-btn media-type-figma" onClick={() => setPsEmbedInput({ tabIdx, draft: '', type: 'figma' })}><span className="media-type-icon">◈</span><span>Embed Figma</span></button>
                          <button type="button" className="media-type-btn media-type-site" onClick={() => setPsEmbedInput({ tabIdx, draft: '', type: 'site' })}><span className="media-type-icon">⧉</span><span>Embed Site</span></button>
                          <button type="button" className="media-type-btn media-type-iframe" onClick={() => setPsEmbedInput({ tabIdx, draft: '', type: 'iframe' })}><span className="media-type-icon">⟨⟩</span><span>Embed iframe</span></button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        {slideMode === 'carousel' && (
          <div className="split-images-wrapper carousel-wrapper">
            <div className="carousel-track" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
              {carouselImages.map((img, ci) => (
                <div key={ci} className="carousel-slide">
                  {img.src ? (
                    <img
                      src={img.src}
                      alt={img.caption || `Slide ${ci + 1}`}
                      onClick={() => { if (!editMode && setLightboxImage) setLightboxImage(img.src); }}
                      style={{ cursor: editMode ? 'default' : 'pointer' }}
                    />
                  ) : (
                    <div className="carousel-placeholder" onClick={() => {
                      if (!editMode) return;
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const newImages = [...carouselImages];
                          newImages[ci] = { ...newImages[ci], src: ev.target.result };
                          updateSlide(index, { carouselImages: newImages });
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}>
                      {editMode ? 'Click to add image' : ''}
                    </div>
                  )}
                  {img.caption && <span className="carousel-caption">{img.caption}</span>}
                </div>
              ))}
            </div>
            {/* Navigation dots */}
            {carouselImages.length > 1 && (
              <div className="carousel-dots">
                {carouselImages.map((_, ci) => (
                  <button
                    key={ci}
                    className={`carousel-dot ${carouselIndex === ci ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setCarouselIndex(ci); }}
                    data-no-slide-advance="true"
                  />
                ))}
              </div>
            )}
            {/* Prev/Next arrows */}
            {carouselImages.length > 1 && (
              <>
                <button className="carousel-arrow carousel-prev" onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length); }} data-no-slide-advance="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L8 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="carousel-arrow carousel-next" onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => (prev + 1) % carouselImages.length); }} data-no-slide-advance="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4L12 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </>
            )}
            {/* Edit controls */}
            {editMode && (
              <div className="carousel-edit-controls">
                <button
                  className="carousel-add-btn"
                  onClick={() => {
                    // Multi-select upload — fill empty slots first, then
                    // append new slots. Mirrors DynamicImages.handleBulkUpload
                    // so both carousel implementations behave the same.
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.value = '';
                    input.onchange = async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      const readOne = (file) => new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onerror = () => resolve(null);
                        reader.onload = (ev) => resolve(ev.target?.result || null);
                        reader.readAsDataURL(file);
                      });
                      const dataUrls = [];
                      for (const f of files) {
                        const u = await readOne(f);
                        if (u) dataUrls.push(u);
                      }
                      if (dataUrls.length === 0) return;
                      const next = [...carouselImages];
                      let q = 0;
                      for (let i = 0; i < next.length && q < dataUrls.length; i++) {
                        if (!next[i].src) { next[i] = { ...next[i], src: dataUrls[q] }; q++; }
                      }
                      while (q < dataUrls.length) { next.push({ src: dataUrls[q], caption: '' }); q++; }
                      updateSlide(index, { carouselImages: next });
                    };
                    input.click();
                  }}
                  title="Upload one or more images"
                >+ Upload</button>
                <button
                  className="carousel-add-btn"
                  onClick={() => updateSlide(index, { carouselImages: [...carouselImages, { src: '', caption: '' }] })}
                  title="Add empty slot"
                >+ Empty</button>
                {carouselImages.length > 1 && (
                  <button className="carousel-remove-btn" onClick={() => {
                    const newImages = carouselImages.filter((_, ci) => ci !== carouselIndex);
                    setCarouselIndex(prev => Math.min(prev, newImages.length - 1));
                    updateSlide(index, { carouselImages: newImages });
                  }}>Remove Current</button>
                )}
                <label className="carousel-auto-label">
                  <input type="checkbox" checked={carouselAuto} onChange={(e) => updateSlide(index, { carouselAuto: e.target.checked })} />
                  Auto-play
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const CaseStudy = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { editMode, setEditMode, setShowPanel, content, styles } = useEdit(); // Use global edit mode from context
  const [project, setProject] = useState(() => migrateCaseStudyImagePathsToWebp(getCaseStudyData(projectId)));
  const containerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  /* Bumped in `go()` when switching to a different project. Used as the
     .slides-track key so framer-motion treats the new project's first
     slide as a fresh mount — no x-tween from the old end position. */
  const [projectNonce, setProjectNonce] = useState(0);
  /* Always-fresh mirror of currentSlide so memoized subtrees (DynamicImages)
     can compute slide-distance without having currentSlide in their deps.
     Also broadcasts a `case-study:slide-change` event so descendants
     (e.g. carousels) can react to navigation without subscribing through
     a stale closure. */
  const currentSlideRef = useRef(0);
  useEffect(() => {
    currentSlideRef.current = currentSlide;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('case-study:slide-change', { detail: { slide: currentSlide } }));
    }
  }, [currentSlide]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderMode, setBuilderMode] = useState('choose'); // 'choose' | 'form' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null); // { slides, preview }
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTwiImageControl, setActiveTwiImageControl] = useState(null);
  const [savedCaseStudiesList, setSavedCaseStudiesList] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'
  const [gitPushStatus, setGitPushStatus] = useState(null); // null | 'pushing' | 'pushed' | 'error'
  const [webpStatus, setWebpStatus] = useState(null); // null | 'running' | 'done' | 'error'
  const [webpSummary, setWebpSummary] = useState(''); // last stdout line (e.g. "converted: 4 files")
  const [compressVideosStatus, setCompressVideosStatus] = useState(null);
  const [compressVideosSummary, setCompressVideosSummary] = useState('');
  const [imgVariantsStatus, setImgVariantsStatus] = useState(null);
  const [imgVariantsSummary, setImgVariantsSummary] = useState('');
  const [showImportJSON, setShowImportJSON] = useState(false);
  const [importJSONText, setImportJSONText] = useState('');
  const [importError, setImportError] = useState('');
  const [showSlideSorter, setShowSlideSorter] = useState(true); // slide sorter panel in edit mode
  const [dragState, setDragState] = useState({ dragging: null, over: null });
  const [editSlideJSON, setEditSlideJSON] = useState(null); // { index, text, error }
  const [editFullJSON, setEditFullJSON] = useState(null); // { text, originalProject, error }
  const [cardStyle, setCardStyle] = useState(() => {
    try { return localStorage.getItem(`caseStudy_${projectId}_cardStyle`) || 'outlined'; } catch { return 'outlined'; }
  });
  const [builderStep, setBuilderStep] = useState(0);
  const [builderData, setBuilderData] = useState({
    projectName: '',
    category: '',
    year: new Date().getFullYear().toString(),
    client: '',
    role: '',
    duration: '',
    deliverables: '',
    description: '',
    context: '',
    problem: '',
    issues: ['', '', ''],
    goals: ['', '', ''],
    solution: '',
    results: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }],
    testimonial: '',
    testimonialAuthor: '',
  });
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const totalSlides = project.slides.length;
  const [slideNavVisible, setSlideNavVisible] = useState(false);
  const slideNavHideTimeoutRef = useRef(null);
  const hideSlideNavRef = useRef(null);

  // ── Mobile Figma/Canva-style scaled slide viewer ───────────────────────
  // Below 768px we render each slide inside a TransformWrapper (pinch-zoom
  // & pan) over a fixed 1440×810 design canvas. At desktop widths this is
  // a pass-through — no visual change.
  const isMobileSlide = useMediaQuery('(max-width: 767px)');
  // Tracks the active slide's library scale. Because the library's base
  // (fit-to-viewport) scale is NOT 1 on mobile (it's viewportW/1440), we
  // also track the fitScale so we can detect "zoomed in" as scale > fit.
  const currentScaleRef = useRef(1);
  const baseFitScaleRef = useRef(1);
  const [showZoomHint, setShowZoomHint] = useState(false);
  useEffect(() => {
    if (!isMobileSlide) return;
    try {
      if (localStorage.getItem('zoomHintSeen') === '1') return;
      setShowZoomHint(true);
      const t1 = setTimeout(() => setShowZoomHint(false), 2200);
      const t2 = setTimeout(() => { try { localStorage.setItem('zoomHintSeen', '1'); } catch { /* ignore */ } }, 2600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } catch { /* ignore localStorage errors */ }
  }, [isMobileSlide]);
  // Reset scale tracking when the active slide changes. The TransformWrapper
  // is keyed on currentSlide + fitScale, so it re-mounts back to fitScale.
  useEffect(() => {
    currentScaleRef.current = baseFitScaleRef.current || 1;
  }, [currentSlide]);

  // ── Goals-slide auto-shrink ──────────────────────────────────────────────
  // When a .slide-goals has more content than can fit the viewport, scale
  // the inner cards proportionally via a --fit-scale CSS var so no internal
  // scrollbar ever appears. Runs whenever the active slide or project data
  // changes; ResizeObserver handles viewport resize. No-op when content fits.
  useEffect(() => {
    const slides = document.querySelectorAll('.slide-goals');
    if (!slides.length) return;
    const apply = () => {
      slides.forEach((slideEl) => {
        const wrappers = slideEl.querySelectorAll('.goals-cards-section-wrapper, .kpis-section-wrapper');
        wrappers.forEach((w) => {
          const inner = w.querySelector('.goals-cards-section, .kpis-section');
          if (inner) inner.style.setProperty('--fit-scale', '1');
        });
        // Force reflow so we read natural (unscaled) measurements.
        void slideEl.offsetHeight;
        wrappers.forEach((w) => {
          const inner = w.querySelector('.goals-cards-section, .kpis-section');
          if (!inner) return;
          const avail = w.clientHeight;
          const needed = inner.scrollHeight;
          if (needed <= avail + 1) return;
          const scale = Math.max(0.55, (avail / needed) * 0.98);
          inner.style.setProperty('--fit-scale', String(scale));
        });
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    slides.forEach((s) => ro.observe(s));
    return () => ro.disconnect();
  }, [currentSlide, project]);

  /* Warm the browser cache for the next two slides' images when the current
     slide changes. Images go through `new Image()` (cheap); videos are too
     large to prefetch eagerly — LazyVideo still gates them on intersection.
     Only image-extension URLs are prefetched so we don't fire requests for
     iframes/embeds. */
  useEffect(() => {
    const slides = project?.slides;
    if (!slides?.length) return;
    // Skip prefetching entirely on Save-Data or 2G/3G — burning cellular
    // data for a slide the user may never reach is worse than the small
    // nav latency we avoid.
    const conn = (typeof navigator !== 'undefined'
      ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
      : null);
    if (conn && (conn.saveData || /^(slow-2g|2g|3g)$/i.test(conn.effectiveType || ''))) return;
    const isMobile = typeof window !== 'undefined'
      && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
    // On mobile, only warm 1 slide ahead; on desktop warm 2.
    const offsets = isMobile ? [1] : [1, 2];
    const targets = offsets.map((o) => currentSlide + o).filter((i) => i < slides.length);
    const urls = new Set();
    const videoSrcs = new Set();
    const collectFromItem = (item) => {
      if (!item) return;
      if (typeof item === 'string') { urls.add(item); return; }
      if (typeof item === 'object') {
        if (item.src) {
          if (item.isVideo) videoSrcs.add(item.src);
          else urls.add(item.src);
        }
        if (item.posterSrc) urls.add(item.posterSrc);
      }
    };
    const collect = (val) => {
      if (!val) return;
      if (typeof val === 'string') urls.add(val);
      else if (Array.isArray(val)) val.forEach(collectFromItem);
      else collectFromItem(val);
    };
    for (const i of targets) {
      const s = slides[i];
      if (!s) continue;
      collect(s.image);
      collect(s.imageLeft);
      collect(s.imageRight);
      collect(s.beforeImage);
      collect(s.afterImage);
      collect(s.logo);
      // Many slide types use the DynamicImages field; look there too.
      if (Array.isArray(s.dynamicImages)) collect(s.dynamicImages);
      if (Array.isArray(s.images)) collect(s.images);
    }
    // Always also warm video poster frames (tiny, high impact on perceived speed).
    for (const vsrc of videoSrcs) {
      const poster = deriveVideoPoster(vsrc);
      if (poster) urls.add(poster);
    }
    const pool = [];
    for (const url of urls) {
      if (!/\.(png|jpg|jpeg|webp|gif|avif)(\?|$)/i.test(url)) continue;
      const img = new Image();
      try { img.decoding = 'async'; } catch { /* older browsers */ }
      // Prefer the mobile width variant when available so we're not warming
      // a 1440w image we'd never actually render on a phone.
      if (isMobile) {
        const clean = url.split('?')[0];
        const entry = imageVariantManifest[clean];
        if (entry && entry.widths && entry.widths.includes(480)) {
          img.src = clean.replace(/\.webp$/i, '@480.webp');
        } else {
          img.src = url;
        }
      } else {
        img.src = url;
      }
      pool.push(img);
    }
    /* Keep references alive so the browser doesn't cancel the prefetch if
       GC fires before the response arrives. */
    return () => { pool.length = 0; };
  }, [currentSlide, project]);

  // Track if we've loaded initial data (to avoid saving on first load)
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const projectRef = useRef(project); // Keep ref to latest project for beforeunload
  
  // Update projectRef whenever project changes
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Load project data when projectId changes.
  // When preserveSlide is true (e.g. on tab visibility change), we do not reset currentSlide.
  const loadProjectData = useCallback(async (preserveSlide = false) => {
    console.log(`[loadProjectData] Loading projectId: ${projectId}`);
    hasLoadedRef.current = false; // Reset on projectId change
    
    // Check if we have a marker that data is in IndexedDB
    const hasIdbMarker = localStorage.getItem(`caseStudy_${projectId}_idb`) === 'true';
    console.log(`[loadProjectData] hasIdbMarker: ${hasIdbMarker}`);
    
    // Load sync first for immediate display (unless we know data is only in IndexedDB)
    const syncData = getCaseStudyData(projectId);
    const defaultData = defaultCaseStudies[projectId] || defaultCaseStudies['align-technology'];
    
    // Check if sync data is actually different from defaults (has real saved data)
    const syncHasData = localStorage.getItem(`caseStudy_${projectId}`) !== null;
    const hasMinimal = localStorage.getItem(`caseStudy_${projectId}_minimal`) !== null;
    console.log(`[loadProjectData] syncHasData: ${syncHasData}, hasMinimal: ${hasMinimal}`);
    
    // If localStorage has data or no IDB marker, use sync data immediately
    // Otherwise, wait for async load to avoid showing defaults
    if (!hasIdbMarker || syncHasData || hasMinimal) {
      setProject(migrateCaseStudyImagePathsToWebp(syncData));
      if (!preserveSlide) setCurrentSlide(0);
      console.log('[loadProjectData] Set project from sync data');
    } else {
      // Data is only in IndexedDB, show defaults temporarily while loading
      setProject(migrateCaseStudyImagePathsToWebp(defaultData));
      if (!preserveSlide) setCurrentSlide(0);
      console.log('[loadProjectData] Set project to defaults (waiting for IndexedDB)');
    }

    // Always try async load from IndexedDB (may have more complete data)
    try {
      const asyncData = await getCaseStudyDataAsync(projectId);
      if (asyncData) {
        // Update with the real data from IndexedDB
        setProject(migrateCaseStudyImagePathsToWebp(asyncData));
        console.log('[loadProjectData] Updated project from IndexedDB');
        // If we showed defaults initially, reset slide to 0 (unless preserving for tab return)
        if (!preserveSlide && hasIdbMarker && !syncHasData && !hasMinimal) {
          setCurrentSlide(0);
        }
      } else if (hasIdbMarker && !syncHasData && !hasMinimal) {
        // Expected data from IndexedDB but got nothing - this shouldn't happen
        console.warn('[loadProjectData] Expected IndexedDB data but got null. Marker exists but data not found.');
        // Keep defaults for now, but log the issue
      }
    } catch (e) {
      console.error('[loadProjectData] Async load failed:', e);
      // If we were expecting IndexedDB data but it failed, log it
      if (hasIdbMarker && !syncHasData && !hasMinimal) {
        console.error('[loadProjectData] Critical: Data was saved to IndexedDB but cannot be loaded. Error:', e);
      }
    }
    // Mark as loaded after async attempt
    hasLoadedRef.current = true;
  }, [projectId]);
  
  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);
  
  // Reload data when component becomes visible again (in case user navigated away and back).
  // Preserve current slide so switching tabs doesn't jump back to slide 1.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasLoadedRef.current && !editMode) {
        // Component became visible again, reload data to ensure we have latest
        // Skip reload when in edit mode to preserve user's editing state
        console.log('[visibilitychange] Component visible again, reloading data');
        loadProjectData(true); // preserveSlide = true
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadProjectData, editMode]);

  // Track previous edit mode to detect when exiting edit mode
  const prevEditModeRef = useRef(editMode);
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialProjectRef = useRef(null);
  
  // Store initial project state when entering edit mode AND save when exiting
  useEffect(() => {
    const wasEditing = prevEditModeRef.current;
    const isEditing = editMode;
    
    // Just entered edit mode - store initial state
    if (isEditing && !wasEditing) {
      initialProjectRef.current = JSON.stringify(project);
      setHasUnsavedChanges(false);
    }
    
    // Just exited edit mode - save if there are changes
    if (!isEditing && wasEditing && hasLoadedRef.current) {
      const currentState = JSON.stringify(project);
      const hasChanges = initialProjectRef.current && currentState !== initialProjectRef.current;
      
      if (hasChanges) {
        // Show saving status
        setSaveStatus('saving');
        
        // Save immediately when done editing
        const doSave = async () => {
          try {
            console.log('Saving case study data for projectId:', projectId);
            const success = await saveCaseStudyData(projectId, project);
            console.log('Save result:', success);
            if (success) {
              setSaveStatus('saved');
              setHasUnsavedChanges(false);
              // Hide status after 2 seconds
              setTimeout(() => setSaveStatus(null), 2000);
            } else {
              console.error('Save returned false');
              setSaveStatus('error');
            }
          } catch (err) {
            console.error('Failed to save:', err);
            setSaveStatus('error');
          }
        };
        
        doSave();
      } else {
        console.log('No changes detected, skipping save');
      }
    }
    
    // Update ref AFTER checking for transitions
    prevEditModeRef.current = editMode;
  }, [editMode, project, projectId]);
  
  // Track unsaved changes while editing
  useEffect(() => {
    if (editMode && hasLoadedRef.current && initialProjectRef.current) {
      const currentState = JSON.stringify(project);
      setHasUnsavedChanges(currentState !== initialProjectRef.current);
    } else if (!editMode) {
      // Clear unsaved changes flag when not editing
      setHasUnsavedChanges(false);
    }
  }, [project, editMode]);

  // Auto-save to IndexedDB while editing (debounced, every 3 seconds after a change)
  useEffect(() => {
    if (!editMode || !hasLoadedRef.current || !initialProjectRef.current) return;
    const currentState = JSON.stringify(project);
    if (currentState === initialProjectRef.current) return; // No changes

    const autoSaveTimer = setTimeout(async () => {
      try {
        console.log('[auto-save] Saving to IndexedDB...');
        const success = await saveCaseStudyData(projectId, project);
        if (success) {
          console.log('[auto-save] Saved successfully');
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 1500);
        }
      } catch (err) {
        console.warn('[auto-save] Failed:', err);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [project, editMode, projectId]);
  
  // Save before page unloads (backup save)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!(editMode || hasUnsavedChanges)) return;
      try {
        const jsonData = JSON.stringify(projectRef.current);
        const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
        if (sizeInMB < 4) {
          localStorage.setItem(`caseStudy_${projectId}`, jsonData);
          console.log('[beforeunload] Saved to localStorage');
        } else {
          // Data too large for localStorage — save minimal structure + mark for IndexedDB
          localStorage.setItem(`caseStudy_${projectId}_idb`, 'true');
          try {
            const removeMedia = (obj) => {
              if (typeof obj === 'string' && (obj.startsWith('data:image') || obj.startsWith('data:video') || obj.startsWith('data:application'))) return '';
              if (Array.isArray(obj)) return obj.map(item => removeMedia(item));
              if (obj && typeof obj === 'object') {
                const result = {};
                for (const key in obj) result[key] = removeMedia(obj[key]);
                return result;
              }
              return obj;
            };
            const minimal = removeMedia(JSON.parse(jsonData));
            const minimalJson = JSON.stringify(minimal);
            if (new Blob([minimalJson]).size / (1024 * 1024) < 2) {
              localStorage.setItem(`caseStudy_${projectId}_minimal`, minimalJson);
            }
          } catch (err) {
            console.warn('[beforeunload] Failed to save minimal version:', err);
          }
        }
        // Always fire-and-forget IndexedDB save as well (may complete before page closes)
        saveCaseStudyData(projectId, projectRef.current).catch(() => {});
      } catch (e) {
        console.error('[beforeunload] Failed to save on unload:', e);
      }
    };

    // Also listen for visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden && (editMode || hasUnsavedChanges)) {
        // Page is being hidden — save to IndexedDB (async, more reliable than beforeunload)
        saveCaseStudyData(projectId, projectRef.current).catch((err) => {
          console.warn('[visibilitychange] IndexedDB save failed:', err);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projectId, editMode, hasUnsavedChanges]);

  // Load list of saved case studies when in edit mode (so user can find their 30+ slide one)
  useEffect(() => {
    if (!editMode) return;
    let cancelled = false;
    listSavedCaseStudies().then((list) => {
      if (!cancelled) setSavedCaseStudiesList(list);
    });
    return () => { cancelled = true; };
  }, [editMode, projectId]);

  // Hide main navigation when on case study
  useEffect(() => {
    document.body.classList.add('case-study-active');
    return () => {
      document.body.classList.remove('case-study-active');
    };
  }, []);

  // Close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // Navigation handlers with proper debouncing (work in both view and edit mode)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // When exiting edit mode, blur any focused input so keyboard nav works immediately
    if (!editMode && document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

    const goToSlide = (direction) => {
      if (isScrollingRef.current) return;
      
      isScrollingRef.current = true;
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      setCurrentSlide(prev => {
        const next = prev + direction;
        if (next < 0) return 0;
        if (next >= totalSlides) return totalSlides - 1;
        return next;
      });
      
      // Lock scrolling for 400ms to prevent multiple slides (faster response)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      hideSlideNavRef.current?.();
      if (isScrollingRef.current) return;
      
      // Immediate response - no accumulation delay
      if (Math.abs(e.deltaY) > 20) {
        goToSlide(e.deltaY > 0 ? 1 : -1);
      }
    };

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(-1);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setCurrentSlide(0);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchMultiFinger = false;

    const handleTouchStart = (e) => {
      if (e.touches.length > 1) {
        touchMultiFinger = true;
        return;
      }
      touchMultiFinger = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 1) touchMultiFinger = true;
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current) return;

      // Mobile scaled viewer: arrows only. All touch gestures (single-finger
      // drag, pinch, double-tap) belong to the zoom library — no swipe-nav.
      if (isMobileSlide) {
        touchMultiFinger = false;
        return;
      }

      if (touchMultiFinger) {
        touchMultiFinger = false;
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      const timeDiff = Date.now() - touchStartTime;

      if (timeDiff < 500) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          goToSlide(diffX > 0 ? 1 : -1);
        } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
          goToSlide(diffY > 0 ? 1 : -1);
        }
      }
    };

    const handleTouchCancel = () => {
      touchMultiFinger = false;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      // Reset scrolling lock so navigation isn't stuck after editMode toggle
      isScrollingRef.current = false;
    };
  }, [totalSlides, editMode, isMobileSlide]);

  const goToSlide = useCallback((direction) => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    setCurrentSlide((prev) => {
      const next = prev + direction;
      if (next < 0) return 0;
      if (next >= totalSlides) return totalSlides - 1;
      return next;
    });
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 400);
  }, [totalSlides]);

  const showSlideNav = useCallback(() => {
    if (slideNavHideTimeoutRef.current) {
      clearTimeout(slideNavHideTimeoutRef.current);
      slideNavHideTimeoutRef.current = null;
    }
    setSlideNavVisible(true);
  }, []);

  const hideSlideNavAfterDelay = useCallback(() => {
    if (slideNavHideTimeoutRef.current) {
      clearTimeout(slideNavHideTimeoutRef.current);
    }
    slideNavHideTimeoutRef.current = setTimeout(() => {
      setSlideNavVisible(false);
      slideNavHideTimeoutRef.current = null;
    }, 1200);
  }, []);

  const hideSlideNavImmediate = useCallback(() => {
    if (slideNavHideTimeoutRef.current) {
      clearTimeout(slideNavHideTimeoutRef.current);
      slideNavHideTimeoutRef.current = null;
    }
    setSlideNavVisible(false);
  }, []);

  hideSlideNavRef.current = hideSlideNavImmediate;

  // Reveal the nav pill when the cursor moves into the bottom band of the
  // slides wrapper. Without this, after `wheel` fires `hideSlideNavImmediate`,
  // there is no way to bring the nav back without leaving and re-entering the
  // page (the bottom .slide-nav-hover-zone is intentionally pointer-events:none
  // so it doesn't eat clicks on CTAs). Threshold matches the hover zone CSS:
  // `min(42vh, 340px)` from the bottom edge.
  const handleSlideAreaMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const yFromBottom = rect.bottom - e.clientY;
    const trigger = Math.min(window.innerHeight * 0.42, 340);
    if (yFromBottom <= trigger) showSlideNav();
  }, [showSlideNav]);

  // Hide slide nav on any wheel (window listener so we always catch it)
  useEffect(() => {
    if (editMode) return;
    const onWheelHideNav = () => hideSlideNavRef.current?.();
    window.addEventListener('wheel', onWheelHideNav, { passive: true });
    return () => window.removeEventListener('wheel', onWheelHideNav, { passive: true });
  }, [editMode]);

  // Click on slide inner → advance / navigate slides (skip interactive targets).
  // Desktop: click anywhere advances to next (legacy behavior).
  // Mobile: left 30% = prev, right 30% = next, middle does nothing (so pinch/
  // double-tap don't accidentally step slides). Zoomed-in taps also no-op —
  // the library owns positional gestures.
  const handleSlideAreaClick = useCallback((e) => {
    if (editMode || totalSlides <= 1) return;
    if (e.target.closest('a, button, input, select, textarea, [contenteditable="true"], [data-no-slide-advance]')) return;
    isScrollingRef.current = false;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    if (isMobileSlide) {
      if (currentScaleRef.current > baseFitScaleRef.current * 1.05) return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 375;
      const x = e.clientX;
      if (x < vw * 0.3) goToSlide(-1);
      else if (x > vw * 0.7) goToSlide(1);
      return;
    }

    goToSlide(1);
  }, [editMode, totalSlides, goToSlide, isMobileSlide]);

  // Edit mode functions
  const updateSlide = useCallback((slideIndex, updates) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === slideIndex ? { ...slide, ...updates } : slide
      )
    }));
  }, []);

  const applyLayoutToAllSlides = useCallback((ratio) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map(slide => ({ ...slide, splitRatio: ratio }))
    }));
  }, []);

  const updateSlideItem = useCallback((slideIndex, itemKey, itemIndex, value) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => {
        if (i !== slideIndex) return slide;
        const newItems = [...slide[itemKey]];
        if (typeof newItems[itemIndex] === 'object') {
          newItems[itemIndex] = { ...newItems[itemIndex], ...value };
        } else {
          newItems[itemIndex] = value;
        }
        return { ...slide, [itemKey]: newItems };
      })
    }));
  }, []);

  const addSlide = useCallback((templateType, afterIndex) => {
    const template = { ...slideTemplates[templateType] };
    setProject(prev => ({
      ...prev,
      slides: [
        ...prev.slides.slice(0, afterIndex + 1),
        template,
        ...prev.slides.slice(afterIndex + 1)
      ]
    }));
    setShowTemplates(false);
  }, []);

  const deleteSlide = useCallback((index) => {
    if (project.slides.length <= 1) return;
    setProject(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));
    if (currentSlide >= project.slides.length - 1) {
      setCurrentSlide(prev => Math.max(0, prev - 1));
    }
  }, [project.slides.length, currentSlide]);

  const moveSlide = useCallback((fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= project.slides.length) return;
    
    setProject(prev => {
      const newSlides = [...prev.slides];
      [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];
      return { ...prev, slides: newSlides };
    });
    setCurrentSlide(toIndex);
  }, [project.slides.length]);

  // Drag-and-drop reorder for slide sorter
  const handleDragStart = useCallback((index) => {
    setDragState(prev => ({ ...prev, dragging: index }));
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    setDragState(prev => prev.over !== index ? { ...prev, over: index } : prev);
  }, []);

  const handleDragEnd = useCallback(() => {
    const { dragging, over } = dragState;
    if (dragging !== null && over !== null && dragging !== over) {
      setProject(prev => {
        const newSlides = [...prev.slides];
        const [moved] = newSlides.splice(dragging, 1);
        newSlides.splice(over, 0, moved);
        return { ...prev, slides: newSlides };
      });
      setCurrentSlide(over);
    }
    setDragState({ dragging: null, over: null });
  }, [dragState]);

  const duplicateSlide = useCallback((index) => {
    setProject(prev => {
      const clone = JSON.parse(JSON.stringify(prev.slides[index]));
      const newSlides = [...prev.slides];
      newSlides.splice(index + 1, 0, clone);
      return { ...prev, slides: newSlides };
    });
    setCurrentSlide(index + 1);
  }, []);

  // Dynamic slide block CRUD
  const addBlock = useCallback((slideIndex, blockType, afterBlockIndex) => {
    const defaults = {
      label: { type: 'label', value: 'Label' },
      title: { type: 'title', value: 'Title' },
      subtitle: { type: 'subtitle', value: 'Subtitle' },
      paragraph: { type: 'paragraph', value: 'New paragraph...' },
      bullets: { type: 'bullets', items: ['First point', 'Second point'], title: '' },
      image: { type: 'image', images: [{ src: '', caption: '', position: 'center center', size: 'large', fit: 'cover' }], gridColumns: 1 },
      stats: { type: 'stats', items: [{ value: '0', label: 'Metric', suffix: '' }], gridColumns: 3 },
      quote: { type: 'quote', text: 'Quote text...', author: 'Author' },
      divider: { type: 'divider' },
    };
    const newBlock = { ...defaults[blockType] };
    setProject(prev => {
      const newSlides = [...prev.slides];
      const slide = { ...newSlides[slideIndex] };
      const blocks = [...(slide.blocks || [])];
      const insertAt = afterBlockIndex !== undefined ? afterBlockIndex + 1 : blocks.length;
      blocks.splice(insertAt, 0, newBlock);
      slide.blocks = blocks;
      newSlides[slideIndex] = slide;
      return { ...prev, slides: newSlides };
    });
  }, []);

  const removeBlock = useCallback((slideIndex, blockIndex) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const slide = { ...newSlides[slideIndex] };
      const blocks = [...(slide.blocks || [])];
      if (blocks.length <= 1) return prev;
      blocks.splice(blockIndex, 1);
      slide.blocks = blocks;
      newSlides[slideIndex] = slide;
      return { ...prev, slides: newSlides };
    });
  }, []);

  const moveBlock = useCallback((slideIndex, blockIndex, direction) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const slide = { ...newSlides[slideIndex] };
      const blocks = [...(slide.blocks || [])];
      const toIndex = blockIndex + direction;
      if (toIndex < 0 || toIndex >= blocks.length) return prev;
      [blocks[blockIndex], blocks[toIndex]] = [blocks[toIndex], blocks[blockIndex]];
      slide.blocks = blocks;
      newSlides[slideIndex] = slide;
      return { ...prev, slides: newSlides };
    });
  }, []);

  const updateBlock = useCallback((slideIndex, blockIndex, updates) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const slide = { ...newSlides[slideIndex] };
      const blocks = [...(slide.blocks || [])];
      blocks[blockIndex] = { ...blocks[blockIndex], ...updates };
      slide.blocks = blocks;
      newSlides[slideIndex] = slide;
      return { ...prev, slides: newSlides };
    });
  }, []);

  const handleReset = useCallback(async () => {
    if (window.confirm('Reset all changes to default? This cannot be undone.')) {
      const defaultData = await resetCaseStudyData(projectId);
      setProject(migrateCaseStudyImagePathsToWebp(defaultData));
    }
  }, [projectId]);

  // ── Save to Code helpers ────────────────────────────────────────
  // Extract base64 media, save as files, replace with public paths
  const extractAndSaveMedia = useCallback(async (pid, projectData) => {
    const imageJobs = [];

    const extractMedia = (obj) => {
      if (typeof obj === 'string' && obj.startsWith('data:')) {
        const match = obj.match(/^data:([^;]+);base64,(.+)$/s);
        if (match) {
          const [, mimeType, base64data] = match;
          const rawExt = mimeType.split('/')[1] || 'bin';
          const ext = rawExt === 'svg+xml' ? 'svg' : rawExt === 'jpeg' ? 'jpg' : rawExt === 'quicktime' ? 'mov' : rawExt;
          // Hash across the full base64 string (sample every ~200 chars + include length)
          let h = 5381;
          const step = Math.max(1, Math.floor(base64data.length / 200));
          for (let i = 0; i < base64data.length; i += step) {
            h = Math.imul(h ^ base64data.charCodeAt(i), 0x9e3779b9);
          }
          const hashId = ((h >>> 0) * base64data.length).toString(36).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12).padStart(8, '0');
          const isVideo = mimeType.startsWith('video/');
          const prefix = isVideo ? 'vid' : 'img';
          const filename = `${prefix}-${hashId}.${ext}`;
          imageJobs.push({ filename, base64data, mimeType, isVideo });
          return `/case-studies/${pid}/${filename}`;
        }
      }
      if (Array.isArray(obj)) return obj.map(item => extractMedia(item));
      if (obj && typeof obj === 'object') {
        const result = {};
        for (const key in obj) result[key] = extractMedia(obj[key]);
        return result;
      }
      return obj;
    };

    const cleanData = extractMedia(JSON.parse(JSON.stringify(projectData)));

    // De-dupe by filename — content-hashed, so identical media maps to the same file
    const seen = new Set();
    const uniqueJobs = imageJobs.filter(j => {
      if (seen.has(j.filename)) return false;
      seen.add(j.filename);
      return true;
    });

    // base64 → Uint8Array (no Buffer in the browser)
    const base64ToBytes = (b64) => {
      const bin = atob(b64);
      const len = bin.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    };

    const runJob = async ({ filename, base64data, mimeType, isVideo }) => {
      // Don't even try to POST to the dev API on a static host — it would
      // hit the SPA fallback and dump a huge HTML "Page not found" per file
      // into the console. The images stay as data URLs in state/IDB instead.
      if (!IS_DEV_EDITOR) return;
      try {
        if (isVideo) {
          // Stream video as raw bytes — avoids the 50MB JSON cap and Node
          // base64-decoding on the main thread.
          const bytes = base64ToBytes(base64data);
          const qs = `projectId=${encodeURIComponent(pid)}&filename=${encodeURIComponent(filename)}`;
          const res = await fetch(`/api/save-video?${qs}`, {
            method: 'POST',
            headers: { 'Content-Type': mimeType || 'application/octet-stream' },
            body: bytes,
          });
          if (!res.ok) console.warn('[save-video] Failed for', filename, res.status);
        } else {
          const res = await fetch('/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: pid, filename, base64data }),
          });
          if (!res.ok) console.warn('[save-image] Failed for', filename, res.status);
        }
      } catch (err) {
        console.warn('[save-media] Failed for', filename, err);
      }
    };

    // Bounded concurrency — N parallel 30MB base64 parses in one Node process
    // was the #1 cause of Vite freezes. 3 is plenty for local disk I/O.
    const CONCURRENCY = 3;
    let cursor = 0;
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, uniqueJobs.length) }, async () => {
        while (cursor < uniqueJobs.length) {
          const i = cursor++;
          await runJob(uniqueJobs[i]);
        }
      })
    );

    return cleanData;
  }, []);

  // ── Save to Code (writes to source files via dev API) ──────────
  const handleSaveToCode = useCallback(async () => {
    if (!IS_DEV_EDITOR) {
      window.alert('Save to Code only works on the local dev server (npm run dev). Edits on the deployed site live in this browser only — to persist, clone the repo and run locally.');
      return;
    }
    try {
      setSaveStatus('saving-code');
      const cleanData = await extractAndSaveMedia(projectId, project);
      const res = await fetch('/api/save-case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, data: cleanData }),
      });
      // Defensive: if a misconfigured proxy returns HTML instead of JSON,
      // don't let JSON.parse explode — show the user a readable error.
      const text = await res.text();
      const result = text.trim().startsWith('{') ? JSON.parse(text) : { ok: false, error: `Server returned non-JSON (${res.status})` };
      if (result.ok) {
        setSaveStatus('saved-code');
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        setSaveStatus('error-code');
        console.error('Save to code failed:', result.error);
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus('error-code');
      console.error('Save to code failed:', err);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [project, projectId, extractAndSaveMedia]);

  // ── Save All to Code (saves every case study in one go) ────────
  const [saveAllStatus, setSaveAllStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const handleSaveAllToCode = useCallback(async () => {
    if (!IS_DEV_EDITOR) {
      window.alert('Save All only works on the local dev server (npm run dev). The deployed site can\'t write back to the repo — changes here stay in this browser session.');
      return;
    }
    setSaveAllStatus('saving');
    try {
      // Fail fast if the dev plugin is frozen — avoids queueing huge saves
      // against an unresponsive server.
      try {
        const hc = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        if (!hc.ok) throw new Error(`health ${hc.status}`);
      } catch (e) {
        console.error('[save-all] Dev server health check failed:', e);
        setSaveAllStatus('error');
        window.alert('Dev server is not responding. Try restarting `npm run dev`.');
        setTimeout(() => setSaveAllStatus(null), 3000);
        return;
      }

      // Get all saved case study IDs from IndexedDB/localStorage
      const list = await listSavedCaseStudies();
      const ids = list.map(item => item.projectId);
      // Always include the current project even if not in list
      if (!ids.includes(projectId)) ids.push(projectId);

      const results = await Promise.all(ids.map(async (pid) => {
        try {
          const data = pid === projectId ? project : await getCaseStudyDataAsync(pid);
          if (!data) return true;
          const cleanData = await extractAndSaveMedia(pid, data);
          // Stringify once so we can both size-check and reuse the body.
          // Catches the silent "JSON exceeds /api/save-case-study's 50MB cap"
          // case that otherwise surfaces as an empty-looking error.
          const bodyStr = JSON.stringify({ projectId: pid, data: cleanData });
          const bodyMB = bodyStr.length / (1024 * 1024);
          if (bodyMB > 49) {
            console.error(`[save-all] Body for ${pid} is ${bodyMB.toFixed(1)}MB — exceeds 50MB server cap. Likely an un-extracted base64 data: URL still in the JSON.`);
            return false;
          }
          const res = await fetch('/api/save-case-study', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
          });
          const text = await res.text();
          const result = text.trim().startsWith('{') ? JSON.parse(text) : { ok: false, error: `Server returned non-JSON (${res.status})` };
          if (!result.ok) {
            console.error(`[save-all] Failed for ${pid}:`, result.error);
            return false;
          }
          return true;
        } catch (err) {
          // Spell out message + stack — bare `err` prints as "{}" for plain
          // throws, and Chrome's collapsed Error view hides the stack until
          // expanded. Emit both so the failure is diagnosable from one log.
          console.error(`[save-all] Error for ${pid}:`, err && err.message, '\nname:', err && err.name, '\nstack:', err && err.stack, '\nraw:', err);
          return false;
        }
      }));
      const failed = results.filter(ok => !ok).length;
      if (failed === 0) {
        setSaveAllStatus('saved');
      } else {
        setSaveAllStatus('error');
      }
      setTimeout(() => setSaveAllStatus(null), 3000);
    } catch (err) {
      console.error('[save-all] Fatal error:', err);
      setSaveAllStatus('error');
      setTimeout(() => setSaveAllStatus(null), 3000);
    }
  }, [project, projectId, extractAndSaveMedia]);

  // ── Git push ──────────────────────────────────────────────────
  const handleGitPush = useCallback(async () => {
    if (!IS_DEV_EDITOR) {
      window.alert('Push to Git only works on the local dev server (npm run dev). Run the editor locally, then push from there.');
      return;
    }
    setGitPushStatus('pushing');
    const ctrl = new AbortController();
    // Client timeout slightly > server push timeout (180s) so server errors can surface
    const timer = setTimeout(() => ctrl.abort(), 200_000);
    try {
      const res = await fetch('/api/git-push', { method: 'POST', signal: ctrl.signal });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (data.ok) {
        setGitPushStatus('pushed');
        setTimeout(() => setGitPushStatus(null), 3000);
      } else {
        console.error('[git-push] Failed:', data.error, data);
        window.alert(`Push failed: ${data.error || 'unknown error'}`);
        setGitPushStatus('error');
        setTimeout(() => setGitPushStatus(null), 4000);
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'timed out after 200s' : (err.message || 'network error');
      console.error('[git-push] Network/abort:', err);
      window.alert(`Push failed: ${msg}`);
      setGitPushStatus('error');
      setTimeout(() => setGitPushStatus(null), 4000);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  /* Runs scripts/convert-case-study-images-to-webp.sh via the dev plugin.
     Dev-only — the API is a middleware mounted by vite-plugin-save-case-study
     which isn't present in the production bundle. Confirms first so the
     user can't click accidentally (the script DELETES originals once the
     build passes, even though it backs them up first). */
  const handleConvertImagesToWebp = useCallback(async () => {
    if (!IS_DEV_EDITOR) {
      window.alert('WebP conversion only works on the local dev server (npm run dev). Run the editor locally.');
      return;
    }
    const proceed = window.confirm(
      'Convert all PNG/JPG images under public/case-studies/ to WebP?\n\n' +
      '• Originals are backed up to backups/ before anything is deleted\n' +
      '• MP4s are not touched\n' +
      '• Production build is run first; originals are only removed if it passes\n' +
      '• Safe to run again later — already-converted images are skipped'
    );
    if (!proceed) return;
    setWebpStatus('running');
    setWebpSummary('');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 320_000);
    try {
      const res = await fetch('/api/convert-images-to-webp', { method: 'POST', signal: ctrl.signal });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (data.ok) {
        const summary = (data.stdout || '')
          .split('\n')
          .filter((l) => /converted:|webp total size:|backup total size:|already fully WebP/i.test(l))
          .map((l) => l.trim())
          .join(' · ');
        setWebpStatus('done');
        setWebpSummary(summary);
        setTimeout(() => { setWebpStatus(null); setWebpSummary(''); }, 10_000);
      } else {
        console.error('[convert-webp] Failed:', data);
        window.alert(`WebP conversion failed:\n${data.error || 'unknown error'}`);
        setWebpStatus('error');
        setTimeout(() => setWebpStatus(null), 5_000);
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'timed out after 320s' : (err.message || 'network error');
      console.error('[convert-webp] Network/abort:', err);
      window.alert(`WebP conversion failed: ${msg}`);
      setWebpStatus('error');
      setTimeout(() => setWebpStatus(null), 5_000);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  /* Runs scripts/compress-videos.js via the dev plugin. Produces desktop
     re-encodes, .mobile.mp4 variants, and .poster.webp frames. Originals
     backed up under backups/. Long timeout — preset=slow ffmpeg takes
     minutes across a full library. */
  const handleCompressVideos = useCallback(async () => {
    if (!IS_DEV_EDITOR) {
      window.alert('Video compression only works on the local dev server (npm run dev).');
      return;
    }
    const proceed = window.confirm(
      'Compress every MP4 under public/case-studies/?\n\n' +
      '• Re-encodes originals > 2 MB with H.264 CRF 28 + faststart\n' +
      '• Generates a 720p .mobile.mp4 sibling for every video\n' +
      '• Generates a .poster.webp first-frame for every video\n' +
      '• Originals are backed up before rewrite; safe to re-run'
    );
    if (!proceed) return;
    setCompressVideosStatus('running');
    setCompressVideosSummary('');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1_800_000);
    try {
      const res = await fetch('/api/compress-videos', { method: 'POST', signal: ctrl.signal });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (data.ok) {
        const summary = (data.stdout || '')
          .split('\n')
          .filter((l) => /^(desktop total|mobile variants|posters generated|failed):/i.test(l.trim()))
          .map((l) => l.trim())
          .join(' · ');
        setCompressVideosStatus('done');
        setCompressVideosSummary(summary);
        setTimeout(() => { setCompressVideosStatus(null); setCompressVideosSummary(''); }, 10_000);
      } else {
        console.error('[compress-videos] Failed:', data);
        window.alert(`Video compression failed:\n${data.error || 'unknown error'}`);
        setCompressVideosStatus('error');
        setTimeout(() => setCompressVideosStatus(null), 5_000);
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'timed out' : (err.message || 'network error');
      console.error('[compress-videos] Network/abort:', err);
      window.alert(`Video compression failed: ${msg}`);
      setCompressVideosStatus('error');
      setTimeout(() => setCompressVideosStatus(null), 5_000);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  /* Runs scripts/generate-image-variants.mjs via the dev plugin. Emits
     @480/@960 WebP siblings and rewrites src/data/case-study-image-variants.json. */
  const handleGenerateImageVariants = useCallback(async () => {
    if (!IS_DEV_EDITOR) {
      window.alert('Image variant generation only works on the local dev server (npm run dev).');
      return;
    }
    setImgVariantsStatus('running');
    setImgVariantsSummary('');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 600_000);
    try {
      const res = await fetch('/api/generate-image-variants', { method: 'POST', signal: ctrl.signal });
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (data.ok) {
        const summary = (data.stdout || '')
          .split('\n')
          .filter((l) => /^(Generated|Manifest):/i.test(l.trim()))
          .map((l) => l.trim())
          .join(' · ');
        setImgVariantsStatus('done');
        setImgVariantsSummary(summary);
        setTimeout(() => { setImgVariantsStatus(null); setImgVariantsSummary(''); }, 10_000);
      } else {
        console.error('[image-variants] Failed:', data);
        window.alert(`Image variant generation failed:\n${data.error || 'unknown error'}`);
        setImgVariantsStatus('error');
        setTimeout(() => setImgVariantsStatus(null), 5_000);
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'timed out' : (err.message || 'network error');
      console.error('[image-variants] Network/abort:', err);
      window.alert(`Image variant generation failed: ${msg}`);
      setImgVariantsStatus('error');
      setTimeout(() => setImgVariantsStatus(null), 5_000);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  // ── Copy JSON for ChatGPT ──────────────────────────────────────
  const handleCopyJSON = useCallback(() => {
    // Strip media (base64 images/videos) from the project data
    const stripMedia = (obj) => {
      if (typeof obj === 'string' && (obj.startsWith('data:image') || obj.startsWith('data:video') || obj.startsWith('data:application'))) return '';
      if (Array.isArray(obj)) return obj.map(item => stripMedia(item));
      if (obj && typeof obj === 'object') {
        const result = {};
        for (const key in obj) result[key] = stripMedia(obj[key]);
        return result;
      }
      return obj;
    };

    const strippedProject = stripMedia(JSON.parse(JSON.stringify(project)));

    // Build template reference from slideTemplates + slideTemplateDocs
    const templateRef = Object.keys(slideTemplates).map(key => {
      const template = slideTemplates[key];
      const docs = slideTemplateDocs[key];
      const entry = { type: key, fields: Object.keys(template).filter(k => k !== 'type') };
      if (docs) {
        entry.description = docs.shortDescription;
        entry.whenToUse = docs.whenToUse;
        if (docs.contentLimits) entry.contentLimits = docs.contentLimits;
        if (docs.requiredFields) entry.requiredFields = docs.requiredFields;
        if (docs.optionalFields) entry.optionalFields = docs.optionalFields;
      }
      // Include the default template shape so ChatGPT knows the exact field structure
      entry.defaultShape = template;
      return entry;
    });

    const prompt = `You are helping me create a case study presentation for my portfolio website.

## Available Slide Templates

Below are all the slide templates you can use. Each slide in the "slides" array must have a "type" field matching one of these template names, and should only use fields defined in that template's shape.

\`\`\`json
${JSON.stringify(templateRef, null, 2)}
\`\`\`

## Current Case Study JSON

Here is the current case study data (images have been stripped — leave image fields as empty strings ""):

\`\`\`json
${JSON.stringify(strippedProject, null, 2)}
\`\`\`

## Instructions

Please modify/rewrite the case study JSON above based on my instructions below. Return ONLY valid JSON — the full case study object with the same top-level structure (title, subtitle, category, year, color, slides). Each slide must use one of the template types listed above and follow its field structure exactly. Do not invent new field names.

My instructions: `;

    navigator.clipboard.writeText(prompt).then(() => {
      setSaveStatus('copied');
      setTimeout(() => setSaveStatus(null), 2000);
    }).catch(() => {
      // Fallback: open in a textarea for manual copy
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setSaveStatus('copied');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  }, [project]);

  // ── Import JSON from ChatGPT ───────────────────────────────────
  const handleImportJSON = useCallback(() => {
    setImportError('');
    try {
      // Try to extract JSON from the pasted text (handle markdown code blocks)
      let jsonText = importJSONText.trim();
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }

      const parsed = JSON.parse(jsonText);

      // Validate structure
      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        setImportError('Invalid structure: JSON must have a "slides" array.');
        return;
      }

      // Validate each slide has a type that exists in slideTemplates
      const validTypes = Object.keys(slideTemplates);
      // Also accept aliases that CaseStudy.jsx renders via textAndImage
      const typeAliases = ['problem', 'context', 'testing', 'feature'];
      const allValidTypes = [...validTypes, ...typeAliases];
      for (let i = 0; i < parsed.slides.length; i++) {
        const slide = parsed.slides[i];
        if (!slide.type) {
          setImportError(`Slide ${i + 1} is missing a "type" field.`);
          return;
        }
        if (!allValidTypes.includes(slide.type)) {
          setImportError(`Slide ${i + 1} has unknown type "${slide.type}". Valid types: ${validTypes.join(', ')}`);
          return;
        }
      }

      // Merge: keep existing images/media from current project where the new slide has empty strings
      const mergedSlides = parsed.slides.map((newSlide, i) => {
        const oldSlide = project.slides[i];
        if (!oldSlide) return newSlide;
        // Only merge media fields from old slide if new slide left them empty
        const merged = { ...newSlide };
        const mediaKeys = ['image', 'logo', 'beforeImage', 'afterImage', 'images'];
        mediaKeys.forEach(key => {
          if (key in merged && key in oldSlide) {
            if (merged[key] === '' && oldSlide[key] !== '') {
              merged[key] = oldSlide[key];
            }
            if (Array.isArray(merged[key]) && merged[key].length === 0 && Array.isArray(oldSlide[key]) && oldSlide[key].length > 0) {
              merged[key] = oldSlide[key];
            }
          }
        });
        return merged;
      });

      // Apply the imported data
      setProject(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        subtitle: parsed.subtitle || prev.subtitle,
        category: parsed.category || prev.category,
        year: parsed.year || prev.year,
        color: parsed.color || prev.color,
        slides: mergedSlides,
      }));

      setShowImportJSON(false);
      setImportJSONText('');
      setImportError('');
      setCurrentSlide(0);
    } catch (e) {
      setImportError(`JSON parse error: ${e.message}`);
    }
  }, [importJSONText, project]);

  // Case Study Builder - Generate slides from form data
  const generateFromBuilder = () => {
    const slides = [];
    const d = builderData;
    
    // Intro slide
    if (d.projectName) {
      slides.push({
        type: 'intro',
        title: d.projectName,
        subtitle: `${d.category || 'Case Study'} • ${d.year}`,
        description: d.description || '',
        image: '',
        logo: '',
      });
    }
    
    // Info slide
    if (d.client || d.role || d.duration || d.deliverables) {
      const items = [];
      if (d.client) items.push({ label: 'Client', value: d.client });
      if (d.role) items.push({ label: 'Role', value: d.role });
      if (d.duration) items.push({ label: 'Duration', value: d.duration });
      if (d.deliverables) items.push({ label: 'Deliverables', value: d.deliverables });
      slides.push({
        type: 'info',
        title: 'Project Overview',
        items,
      });
    }
    
    // Context slide
    if (d.context) {
      slides.push({
        type: 'context',
        label: 'Context',
        title: 'Understanding the environment',
        content: d.context,
        highlight: '',
        image: '',
      });
    }
    
    // Problem slide
    if (d.problem || d.issues.some(i => i)) {
      slides.push({
        type: 'problem',
        label: 'The problem',
        title: 'What needed to be solved',
        content: d.problem,
        issues: d.issues.filter(i => i),
        conclusion: '',
        image: '',
      });
    }
    
    // Goals slide
    if (d.goals.some(g => g)) {
      slides.push({
        type: 'goals',
        label: 'Goals',
        title: 'What we wanted to achieve',
        goals: d.goals.filter(g => g).map((g, i) => ({
          number: String(i + 1),
          title: g,
          description: '',
        })),
        kpis: [],
      });
    }
    
    // Solution/Text slide
    if (d.solution) {
      slides.push({
        type: 'context',
            label: 'The solution',
        title: 'How we solved it',
        content: d.solution,
      });
    }
    
    // Stats slide
    if (d.results.some(r => r.value)) {
      slides.push({
        type: 'stats',
        label: 'Results',
        title: 'Impact & Metrics',
        stats: d.results.filter(r => r.value).map(r => ({
          value: r.value,
          label: r.label,
        })),
      });
    }
    
    // Testimonial slide
    if (d.testimonial) {
      slides.push({
        type: 'testimonial',
        quote: d.testimonial,
        author: d.testimonialAuthor || 'Client',
        role: '',
      });
    }
    
    // End slide
    slides.push({
      type: 'end',
      title: 'Thank You',
      subtitle: "Let's work together",
      buttons: [
        { text: 'Get in touch', link: 'mailto:hello@example.com' },
        { text: 'View more projects', link: '/' },
      ],
    });
    
    // Update project with generated slides
    setProject(prev => ({
      ...prev,
      title: d.projectName || prev.title,
      category: d.category || prev.category,
      year: d.year || prev.year,
      slides,
    }));
    
    closeBuilder();
    setCurrentSlide(0);
  };

  // Close builder and reset all state
  const closeBuilder = () => {
    setShowBuilder(false);
    setBuilderMode('choose');
    setBuilderStep(0);
    setPasteText('');
    setParsedPreview(null);
  };

  // Text-to-slides parser — intelligently maps pasted content to the best slide templates
  const parseTextToSlides = (rawText) => {
    const text = rawText.trim();
    if (!text) return { slides: [], preview: [] };

    const lines = text.split('\n');

    // Group lines into blocks separated by empty lines
    const blocks = [];
    let currentBlock = [];
    for (const line of lines) {
      if (line.trim() === '') {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.map(l => l.trim()).filter(l => l));
          currentBlock = [];
        }
      } else {
        currentBlock.push(line);
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock.map(l => l.trim()).filter(l => l));
    }

    if (blocks.length === 0) return { slides: [], preview: [] };

    // Known info labels for key-value pair detection
    const infoLabels = ['client', 'platform', 'industry', 'role', 'duration', 'timeline', 'year', 'team', 'deliverables', 'type', 'company', 'agency', 'scope', 'period', 'sector'];

    // Regex patterns that match the START of real section headings
    // This prevents content lines like "Scan context is always visible" from matching "context"
    const headingPatterns = [
      // Background / Context
      /^background\b/i, /^context\b/i, /^overview\b/i, /^about\b/i,
      // Problem / Challenge
      /^(the\s+)?problem\b/i, /^(the\s+)?challenge\b/i, /^pain\s+point/i,
      // Research
      /^research/i, /^user\s+research/i,
      // Findings / Insights
      /^(key\s+)?finding/i, /^(key\s+)?insight/i, /^what\s+(the\s+)?research/i,
      // Goals / Success
      /^defining\s+(success|goals)/i, /^(success\s+)?goals?\b/i, /^objectives?\b/i,
      // Strategy / Approach
      /^(redesign\s+)?strategy/i, /^redesign\b/i, /^approach\b/i, /^methodology\b/i, /^framework\b/i,
      // Solution
      /^(the\s+)?solution\b/i, /^how\s+we\s+solved/i,
      // Flow / Feature sections
      /^flow\s+\d/i, /^core\s+tool/i, /^multi.scan/i,
      // Process / Timeline
      /^(the\s+)?process\b/i, /^timeline\b/i, /^how\s+we\s+got/i,
      // Testing
      /^testing\b/i, /^validation\b/i, /^usability/i,
      // Outcomes / Results
      /^outcome/i, /^result/i, /^impact\b/i, /^what\s+(improved|changed)\b/i,
      // Learnings
      /^(key\s+)?learning/i, /^(key\s+)?takeaway/i, /^lesson/i, /^what\s+this\s+project/i,
      // End
      /^thank\s+you/i, /^want\s+to\s+work/i,
      // Comparison / Review
      /^review\s+[&+]/i, /^before\s+[&+]\s+after/i, /^comparison\b/i,
    ];

    // Section heading keywords → template mapping (used in Phase 4 for confirmed sections)
    const sectionKeywords = {
      context: ['background', 'context', 'about', 'overview', 'what is'],
      users: ['users', 'who the users', 'audience', 'user profile', 'persona'],
      problem: ['problem', 'challenge', 'broke', 'breakdown', 'pain point', 'friction'],
      research: ['research', 'discovery'],
      findings: ['findings', 'insights', 'revealed', 'key findings', 'discovered'],
      goals: ['goals', 'defining success', 'objectives', 'metrics', 'kpi', 'achieve'],
      strategy: ['strategy', 'approach', 'redesign strategy', 'framework', 'methodology'],
      flow: ['flow 0', 'flow 1', 'flow 2', 'flow 3', 'flow 4', 'flow 5'],
      solution: ['solution', 'how we solved', 'resolution'],
      outcomes: ['outcomes', 'results', 'impact', 'what improved', 'what changed', 'improvements'],
      learnings: ['learnings', 'takeaways', 'reinforced', 'reflection', 'lessons', 'what this project'],
      end: ['thank you', 'thanks', 'get in touch', 'work together'],
      testing: ['testing', 'validation', 'usability test', 'experiment'],
      process: ['process', 'timeline', 'journey', 'phases', 'how we got'],
      comparison: ['before & after', 'comparison', 'transformation'],
      review: ['review &', 'review and', 'core tools', 'multi-scan', 'key feature'],
    };

    // Helpers
    const matchesKeywords = (text, keywords) => {
      const lower = text.toLowerCase();
      return keywords.some(kw => lower.includes(kw));
    };

    // Strict heading check using regex START-of-text patterns
    const isSectionHeading = (blockText) => {
      const lower = blockText.toLowerCase().trim();
      return headingPatterns.some(p => p.test(lower));
    };

    const slides = [];
    const preview = [];
    let blockIndex = 0;

    // --- Phase 1: Detect intro (first blocks are typically title + subtitle) ---
    let projectTitle = '';
    let projectDescription = '';

    if (blocks.length > 0) {
      const firstBlock = blocks[0];
      if (firstBlock.length === 1 && firstBlock[0].length < 80) {
        projectTitle = firstBlock[0];
        blockIndex = 1;
        if (blockIndex < blocks.length) {
          const nextBlock = blocks[blockIndex];
          // Check if next block is description (not an info label)
          if (nextBlock.length === 1 && nextBlock[0].length < 150 && !infoLabels.includes(nextBlock[0].replace(/:$/, '').trim().toLowerCase())) {
            projectDescription = nextBlock[0];
            blockIndex++;
          } else if (nextBlock.length >= 2 && !infoLabels.includes(nextBlock[0].replace(/:$/, '').trim().toLowerCase())) {
            projectDescription = nextBlock.join(' ');
            blockIndex++;
          }
        }
      } else if (firstBlock.length >= 2) {
        projectTitle = firstBlock[0];
        projectDescription = firstBlock.slice(1).join(' ');
        blockIndex = 1;
      }
    }

    // --- Phase 2: Detect info key-value pairs (Client → Value, Role → Value, etc.) ---
    const infoItems = [];
    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex];
      const label = block[0].replace(/:$/, '').trim();
      
      if (infoLabels.includes(label.toLowerCase())) {
        // Value is in the same block (lines after label)
        let value = block.slice(1).join(' ').trim();
        
        // If no value in same block, peek at next block
        if (!value && blockIndex + 1 < blocks.length) {
          const nextBlock = blocks[blockIndex + 1];
          // Next block should be a short value, not another label or section heading
          if (nextBlock.length <= 2 && !infoLabels.includes(nextBlock[0].replace(/:$/, '').trim().toLowerCase()) && !isSectionHeading(nextBlock.join(' '))) {
            value = nextBlock.join(' ').trim();
            blockIndex++; // consume the value block too
          }
        }
        
        if (value) {
          infoItems.push({ label, value });
          blockIndex++;
          continue;
        }
      }
      break;
    }

    // Generate intro slide
    if (projectTitle) {
      const introSlide = {
        type: 'intro',
        title: projectTitle,
        description: projectDescription,
        image: '',
        logo: '',
      };
      if (infoItems.length > 0) {
        introSlide.clientLabel = infoItems[0]?.label || 'Client';
        introSlide.client = infoItems[0]?.value || '';
        if (infoItems.length > 1) {
          introSlide.focusLabel = infoItems[1]?.label || 'Focus';
          introSlide.focus = infoItems[1]?.value || '';
        }
      }
      slides.push(introSlide);
      preview.push({ type: 'intro', label: `Intro — ${projectTitle}` });
    }

    // Generate info slide if enough key-value pairs found
    if (infoItems.length >= 2) {
      slides.push({
        type: 'info',
        title: 'Project Overview',
        items: infoItems,
      });
      preview.push({ type: 'info', label: `Project Info — ${infoItems.length} items` });
    }

    // --- Phase 3: Parse remaining content into sections ---
    // ONLY create a new section when a block matches START-of-text heading patterns
    // plus passes strict guards. Everything else is content under the current section.
    const sections = [];
    let currentSection = null;

    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex];
      const blockText = block.join(' ');
      const firstLine = block[0];
      const subtitle = block.length > 1 ? block[1] : '';
      const combinedWords = blockText.split(/\s+/).length;

      // Strict heading detection with multiple guards
      const isRecognizedHeading =
        block.length <= 2 &&              // Max 2 lines (heading + optional subtitle)
        firstLine.length < 60 &&          // First line is short
        combinedWords >= 2 &&             // At least 2 words total (avoids single-word sub-headings like "Goals", "Metrics")
        !firstLine.endsWith('.') &&       // Not a sentence
        !firstLine.endsWith(':') &&       // Not a list introducer
        !firstLine.endsWith(',') &&       // Not a partial sentence
        !firstLine.endsWith(';') &&
        !subtitle.endsWith(':') &&        // Subtitle not a list introducer (catches "The Problem\nTools were...:")
        !/^\d+[\.\)]\s/.test(firstLine) && // Not a numbered item
        isSectionHeading(blockText);       // Matches a known heading pattern at START of text

      if (isRecognizedHeading) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          heading: firstLine,
          subtitle: subtitle,
          content: [],
        };
      } else if (currentSection) {
        // Append as content to current section
        currentSection.content.push(block);
      } else {
        // No section started yet and block is not a heading - create a generic section
        currentSection = { heading: '', subtitle: '', content: [block] };
      }
      blockIndex++;
    }
    if (currentSection) sections.push(currentSection);

    // --- Phase 4: Map each section to the best slide template ---
    for (const section of sections) {
      const heading = section.heading;
      const subtitle = section.subtitle;
      const headingLower = (heading + ' ' + subtitle).toLowerCase();
      const allContent = section.content.flat();
      const contentText = allContent.join('\n');

      if (!heading && allContent.length === 0) continue;

      // Detect sub-sections (The Problem / The Process / The Solution pattern)
      const hasSubSections = allContent.some(line =>
        /^(The Problem|The Process|The Solution)$/i.test(line.trim())
      );

      // Extract numbered items, bullets, paragraphs
      const numberedItems = [];
      const bulletItems = [];
      const paragraphs = [];

      for (const block of section.content) {
        for (const line of block) {
          if (/^\d+[\.\)]\s/.test(line)) {
            numberedItems.push(line.replace(/^\d+[\.\)]\s*/, '').trim());
          } else if (/^[-•·]\s/.test(line)) {
            bulletItems.push(line.replace(/^[-•·]\s*/, '').trim());
          }
        }
        const blockText = block.join(' ');
        if (blockText.length > 60 && !/^\d+[\.\)]\s/.test(block[0]) && !/^[-•·]\s/.test(block[0])) {
          paragraphs.push(blockText);
        }
      }

      // Short standalone items (not sentences, not numbered, not bullets)
      const shortItems = allContent.filter(l =>
        l.length < 120 && l.length > 8 &&
        !/^\d+[\.\)]\s/.test(l) &&
        !/^[-•·]\s/.test(l) &&
        !l.endsWith(':') &&
        !l.endsWith('.')
      );

      // ===================== Template Mapping =====================

      // End slide (only create one)
      if (matchesKeywords(headingLower, sectionKeywords.end)) {
        if (!slides.some(s => s.type === 'end')) {
          slides.push({
            type: 'end',
            title: heading || 'Thank You',
            subtitle: subtitle || allContent.find(l => l.length > 5) || "Let's work together",
            buttons: [
              { text: 'Get in touch', link: 'mailto:hello@example.com' },
              { text: 'View more projects', link: '/' },
            ],
          });
          preview.push({ type: 'end', label: `End — ${heading || 'Thank You'}` });
        }
        continue;
      }

      // Problem / Issues
      if (matchesKeywords(headingLower, sectionKeywords.problem)) {
        // Check for numbered issues with descriptions
        const issues = [];
        let issueIdx = -1;

        for (const block of section.content) {
          for (const line of block) {
            const numberedMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
            if (numberedMatch) {
              issues.push({ title: numberedMatch[2], description: '' });
              issueIdx = issues.length - 1;
            } else if (issueIdx >= 0 && !issues[issueIdx].description && line.length > 15) {
              issues[issueIdx].description = line;
            }
          }
        }

        if (issues.length >= 2) {
          slides.push({
            type: 'issuesBreakdown',
            label: heading || 'The problem',
            title: subtitle || 'What started to break',
            issues: issues.map((issue, i) => ({
              number: String(i + 1),
              title: issue.title,
              description: issue.description,
            })),
            conclusion: paragraphs.length > 0 ? paragraphs[paragraphs.length - 1] : '',
          });
          preview.push({ type: 'issuesBreakdown', label: `Issues — ${issues.length} issues identified` });
        } else {
          const issueTexts = [...numberedItems, ...bulletItems].slice(0, 5);
          slides.push({
            type: 'problem',
            label: heading || 'The problem',
            title: subtitle || 'What needed to be solved',
            content: paragraphs[0] || contentText.slice(0, 400),
            issues: issueTexts.length > 0 ? issueTexts : [],
            conclusion: paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '',
            image: '',
            splitRatio: 50,
          });
          preview.push({ type: 'problem', label: `Problem — ${subtitle || heading}` });
        }
        continue;
      }

      // Context / Background / Users
      if (matchesKeywords(headingLower, sectionKeywords.context) || matchesKeywords(headingLower, sectionKeywords.users)) {
        slides.push({
          type: 'context',
          label: heading || 'Context',
          title: subtitle || 'Understanding the environment',
          content: paragraphs.join('\n\n') || allContent.join('\n'),
          highlight: shortItems.length > 0 ? shortItems.slice(0, 3).join('. ') : '',
          image: '',
          splitRatio: 50,
        });
        preview.push({ type: 'context', label: `Context — ${heading}${subtitle ? ': ' + subtitle : ''}` });
        continue;
      }

      // Research
      if (matchesKeywords(headingLower, sectionKeywords.research)) {
        const methods = [...bulletItems, ...shortItems].filter(i => i.length > 10);
        slides.push({
          type: 'context',
            label: heading || 'Research',
          title: subtitle || 'Understanding the problem space',
          content: paragraphs.join('\n\n') + (methods.length > 0 ? '\n\n' + methods.map(m => '• ' + m).join('\n') : ''),
        });
        preview.push({ type: 'context', label: `Research — ${heading}` });
        continue;
      }

      // Findings / Insights
      if (matchesKeywords(headingLower, sectionKeywords.findings)) {
        const items = [...bulletItems, ...shortItems, ...numberedItems].filter(i => i.length > 10);
        if (items.length >= 2) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Key findings',
            title: subtitle || 'What the research revealed',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `Findings — ${items.length} insights` });
        } else {
          slides.push({
            type: 'testimonial',
            label: heading || 'Key insight',
            quote: items[0] || paragraphs[0] || contentText.slice(0, 200),
            context: paragraphs.length > 1 ? paragraphs[1] : '',
          });
          preview.push({ type: 'testimonial', label: `Insight — ${heading}` });
        }
        continue;
      }

      // Goals (detect dual Goals + Metrics sub-sections for achieveGoals)
      if (matchesKeywords(headingLower, sectionKeywords.goals)) {
        const goalItems = [];
        const metricItems = [];
        let collecting = '';

        for (const line of allContent) {
          const lineLower = line.toLowerCase().trim();
          if (lineLower === 'goals' || lineLower === 'objectives') { collecting = 'goals'; continue; }
          if (lineLower === 'metrics' || lineLower === 'kpis' || lineLower === 'key metrics') { collecting = 'metrics'; continue; }
          if (collecting === 'goals' && line.length > 5 && line.length < 150) goalItems.push(line);
          else if (collecting === 'metrics' && line.length > 5 && line.length < 150) metricItems.push(line);
        }

        if (goalItems.length > 0 && metricItems.length > 0) {
          slides.push({
            type: 'achieveGoals',
            label: heading || 'Defining goals',
            title: subtitle || 'What did we want to achieve?',
            leftColumn: {
              title: 'Goals',
              goals: goalItems.map((g, i) => ({ number: String(i + 1), text: g })),
            },
            rightColumn: {
              title: 'Metrics',
              goals: metricItems.map((m, i) => ({ number: String(i + 1), text: m })),
            },
          });
          preview.push({ type: 'achieveGoals', label: `Goals & Metrics — ${goalItems.length + metricItems.length} items` });
        } else {
          const allGoals = [...goalItems, ...metricItems, ...bulletItems, ...numberedItems, ...shortItems].filter(g => g.length > 5);
          slides.push({
            type: 'goals',
            label: heading || 'Goals',
            title: subtitle || 'What we wanted to achieve',
            goals: allGoals.slice(0, 6).map((g, i) => ({
              number: String(i + 1),
              title: g,
              description: '',
            })),
            kpis: metricItems.length > 0 ? metricItems.slice(0, 4) : [],
          });
          preview.push({ type: 'goals', label: `Goals — ${allGoals.length} items` });
        }
        continue;
      }

      // Flow / Feature sections (Flow 01, Flow 02, etc.) or sections with Problem/Solution sub-structure
      if (matchesKeywords(headingLower, sectionKeywords.flow) || matchesKeywords(headingLower, sectionKeywords.review) || hasSubSections) {
        let problemText = '';
        let solutionText = '';
        let processText = '';
        let currentSub = '';

        for (const line of allContent) {
          const lineLower = line.toLowerCase().trim();
          if (lineLower === 'the problem' || lineLower === 'problem') { currentSub = 'problem'; continue; }
          if (lineLower === 'the process' || lineLower === 'process') { currentSub = 'process'; continue; }
          if (lineLower === 'the solution' || lineLower === 'solution') { currentSub = 'solution'; continue; }

          if (currentSub === 'problem') problemText += (problemText ? '\n' : '') + line;
          else if (currentSub === 'process') processText += (processText ? '\n' : '') + line;
          else if (currentSub === 'solution') solutionText += (solutionText ? '\n' : '') + line;
        }

        if (problemText && solutionText) {
          slides.push({
            type: 'comparison',
            slideMode: 'tabs',
            label: heading || 'Design solution',
            title: subtitle || 'Challenge & Solution',
            psTabs: [
              { label: 'Challenge', columnLabel: '', image: '', embedUrl: '', bullets: problemText.split('\n').filter(Boolean), bulletsTitle: '' },
              { label: 'Solution', columnLabel: '', image: '', embedUrl: '', bullets: solutionText.split('\n').filter(Boolean), bulletsTitle: '' },
            ],
          });
          preview.push({ type: 'comparison', label: `Flow — ${heading}` });
        } else {
          const description = paragraphs.join('\n\n') || allContent.join('\n');
          const bullets = [...bulletItems, ...shortItems].slice(0, 5);
          slides.push({
            type: 'feature',
            label: heading || 'Feature',
            title: subtitle || heading || 'Feature Highlight',
            description: description.slice(0, 500),
            image: '',
            bullets: bullets.length > 0 ? bullets : [],
            splitRatio: 50,
          });
          preview.push({ type: 'feature', label: `Feature — ${heading}` });
        }
        continue;
      }

      // Testing
      if (matchesKeywords(headingLower, sectionKeywords.testing)) {
        const options = [...bulletItems, ...numberedItems, ...shortItems];
        slides.push({
          type: 'testing',
          label: heading || 'Testing',
          title: subtitle || 'Validating the solution',
          content: paragraphs[0] || contentText.slice(0, 300),
          layouts: options.slice(0, 5),
          conclusion: paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '',
          image: '',
          splitRatio: 50,
        });
        preview.push({ type: 'testing', label: `Testing — ${heading}` });
        continue;
      }

      // Outcomes / Results
      if (matchesKeywords(headingLower, sectionKeywords.outcomes)) {
        const items = [...bulletItems, ...numberedItems, ...shortItems].filter(i => i.length > 5);
        if (items.length >= 2) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Outcomes',
            title: subtitle || 'Results & Impact',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `Outcomes — ${items.length} results` });
        } else {
          slides.push({
            type: 'context',
            label: heading || 'Outcomes',
            title: subtitle || 'Results',
            content: paragraphs.join('\n\n') || contentText,
          });
          preview.push({ type: 'context', label: `Outcomes — ${heading}` });
        }
        continue;
      }

      // Learnings / Takeaways
      if (matchesKeywords(headingLower, sectionKeywords.learnings)) {
        const items = [...bulletItems, ...numberedItems, ...shortItems].filter(i => i.length > 10);
        if (items.length >= 2) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Key learnings',
            title: subtitle || 'What we learned',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `Learnings — ${items.length} items` });
        } else {
          slides.push({
            type: 'testimonial',
            label: heading || 'Key learning',
            quote: items[0] || paragraphs[0] || allContent[0] || '',
            context: items.length > 1 ? items.slice(1).join('. ') : (paragraphs.length > 1 ? paragraphs[1] : ''),
          });
          preview.push({ type: 'testimonial', label: `Learning — ${heading}` });
        }
        continue;
      }

      // Strategy / Approach
      if (matchesKeywords(headingLower, sectionKeywords.strategy) || matchesKeywords(headingLower, sectionKeywords.solution)) {
        const items = [...bulletItems, ...shortItems].filter(i => i.length > 10);
        if (items.length >= 3) {
          slides.push({
            type: 'process',
            label: heading || 'Strategy',
            title: subtitle || 'Our Approach',
            steps: items.slice(0, 6).map((step, i) => ({
              number: String(i + 1).padStart(2, '0'),
              title: step,
              description: '',
            })),
          });
          preview.push({ type: 'process', label: `Strategy — ${items.length} steps` });
        } else {
          slides.push({
            type: 'context',
            label: heading || 'Strategy',
            title: subtitle || 'Our Approach',
            content: paragraphs.join('\n\n') || allContent.join('\n'),
          });
          preview.push({ type: 'context', label: `Strategy — ${heading}` });
        }
        continue;
      }

      // Process
      if (matchesKeywords(headingLower, sectionKeywords.process)) {
        const steps = [...numberedItems, ...bulletItems, ...shortItems].filter(i => i.length > 5);
        if (steps.length >= 2) {
          slides.push({
            type: 'process',
            label: heading || 'Process',
            title: subtitle || 'How We Got There',
            steps: steps.slice(0, 6).map((step, i) => ({
              number: String(i + 1).padStart(2, '0'),
              title: step.split(/[-—:]/)[0].trim(),
              description: step.includes('—') || step.includes(':') ? step.split(/[-—:]/)[1]?.trim() || '' : '',
            })),
          });
          preview.push({ type: 'process', label: `Process — ${steps.length} steps` });
        } else {
          slides.push({
            type: 'context',
            label: heading || 'Process',
            title: subtitle || heading,
            content: paragraphs.join('\n\n') || allContent.join('\n'),
          });
          preview.push({ type: 'context', label: `Process — ${heading}` });
        }
        continue;
      }

      // Comparison
      if (matchesKeywords(headingLower, sectionKeywords.comparison)) {
        slides.push({
          type: 'comparison',
          label: heading || 'Comparison',
          title: subtitle || 'The Transformation',
          beforeImage: '',
          afterImage: '',
          beforeLabel: 'Before',
          afterLabel: 'After',
        });
        preview.push({ type: 'comparison', label: `Comparison — ${heading}` });
        continue;
      }

      // Default fallback: pick the best fit based on content shape
      if (heading || paragraphs.length > 0 || allContent.length > 0) {
        const items = [...bulletItems, ...numberedItems, ...shortItems].filter(i => i.length > 10);

        if (items.length >= 3 && paragraphs.length <= 1) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Overview',
            title: subtitle || heading || 'Key points',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `${heading || 'Key points'} — ${items.length} items` });
        } else {
          slides.push({
            type: 'context',
            label: heading || 'Content',
            title: subtitle || heading || 'Details',
            content: (paragraphs.join('\n\n') || allContent.join('\n')).slice(0, 1000),
          });
          preview.push({ type: 'context', label: heading ? `${heading}` : 'Content' });
        }
      }
    }

    // Always ensure an end slide exists
    if (!slides.some(s => s.type === 'end')) {
      slides.push({
        type: 'end',
        title: 'Thank You',
        subtitle: "Let's work together",
        buttons: [
          { text: 'Get in touch', link: 'mailto:hello@example.com' },
          { text: 'View more projects', link: '/' },
        ],
      });
      preview.push({ type: 'end', label: 'End — Thank You' });
    }

    return { slides, preview };
  };

  // Generate slides from pasted text
  const generateFromPaste = () => {
    if (!parsedPreview || parsedPreview.slides.length === 0) return;

    const generatedSlides = parsedPreview.slides;
    const title = generatedSlides[0]?.title || 'Case Study';

    setProject(prev => ({
      ...prev,
      title,
      slides: generatedSlides,
    }));

    closeBuilder();
    setCurrentSlide(0);
  };

  // Builder steps configuration
  const builderSteps = [
    { title: 'Project Basics', fields: ['projectName', 'category', 'year', 'description'] },
    { title: 'Project Info', fields: ['client', 'role', 'duration', 'deliverables'] },
    { title: 'Context & Problem', fields: ['context', 'problem', 'issues'] },
    { title: 'Goals & Solution', fields: ['goals', 'solution'] },
    { title: 'Results', fields: ['results', 'testimonial', 'testimonialAuthor'] },
  ];

  // EditableField is now defined at module scope (above CaseStudy) for stable React identity

  // Add item to array field
  const addArrayItem = (slideIndex, field, defaultItem) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const currentArray = newSlides[slideIndex][field] || [];
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        [field]: [...currentArray, defaultItem]
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Remove item from array field
  const removeArrayItem = (slideIndex, field, itemIndex) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const currentArray = [...(newSlides[slideIndex][field] || [])];
      currentArray.splice(itemIndex, 1);
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        [field]: currentArray
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Toggle optional field visibility (useCallback for stable reference)
  const toggleField = useCallback((slideIndex, field, defaultValue = '') => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const currentValue = newSlides[slideIndex][field];
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        [field]: currentValue === undefined || currentValue === null ? defaultValue : null
      };
      return { ...prev, slides: newSlides };
    });
  }, []);

  // Optional field component with toggle (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const OptionalField = useMemo(() => ({ slide, index, field, label, defaultValue = '', multiline = false, children, updateSlideOverride }) => {
    const hasValue = slide[field] !== undefined && slide[field] !== null;
    const doUpdate = updateSlideOverride || updateSlide;
    if (!editMode && !hasValue) return null;
    
    if (editMode && !hasValue) {
      return (
        <button 
          className="add-field-btn"
          onClick={() => toggleField(index, field, defaultValue)}
        >
          + Add {label}
        </button>
      );
    }
    
    return (
      <div className="optional-field-wrapper">
        {children || (
          multiline ? (
            <p className={`field-${field}`}>
              <EditableField
                value={slide[field]}
                onChange={(v) => doUpdate(index, { [field]: v })}
                multiline
              />
            </p>
          ) : (
            <span className={`field-${field}`}>
              <EditableField
                value={slide[field]}
                onChange={(v) => doUpdate(index, { [field]: v })}
              />
            </span>
          )
        )}
        {editMode && (
          <button 
            className="remove-field-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleField(index, field);
            }}
            title={`Remove ${label}`}
          >
            ×
          </button>
        )}
      </div>
    );
  }, [editMode, toggleField, updateSlide]);

  // Array item controls component (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ArrayItemControls = useMemo(() => ({ onRemove }) => {
    if (!editMode) return null;
    return (
      <button className="remove-item-btn" onClick={onRemove} title="Remove item">×</button>
    );
  }, [editMode]);

  // Add item button component (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const AddItemButton = useMemo(() => ({ onClick, label }) => {
    if (!editMode) return null;
    return (
      <button className="add-item-btn" onClick={onClick}>
        + Add {label}
      </button>
    );
  }, [editMode]);

  // Toggle field button - shows remove button when field has value (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ToggleFieldButton = useMemo(() => ({ hasValue, onToggle, label }) => {
    if (!editMode) return null;
    return hasValue ? (
      <button className="remove-field-btn" onClick={onToggle} title={`Remove ${label}`}>
        × Remove {label}
      </button>
    ) : null;
  }, [editMode]);

  // ========== DYNAMIC CONTENT COMPONENT ==========
  // Handles single content OR array of paragraphs with add/remove (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DynamicContent = useMemo(() => ({ slide, slideIndex, field = 'content', className = '', maxParagraphs = 0, optional = false }) => {
    // Check if it's an array (paragraphs) or single string (content)
    const isArray = Array.isArray(slide[field]);
    const paragraphs = isArray ? slide[field] : (slide[field] ? [slide[field]] : []);
    
    const updateParagraph = (pIndex, value) => {
      if (isArray) {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex] = value;
        updateSlide(slideIndex, { [field]: newParagraphs });
      } else {
        updateSlide(slideIndex, { [field]: value });
      }
    };
    
    const addParagraph = () => {
      if (maxParagraphs > 0 && paragraphs.length >= maxParagraphs) return;
      const newParagraphs = isArray ? [...paragraphs, 'New paragraph...'] : [slide[field] || '', 'New paragraph...'];
      updateSlide(slideIndex, { [field]: newParagraphs });
    };
    
    const removeParagraph = (pIndex) => {
      const newParagraphs = paragraphs.filter((_, i) => i !== pIndex);
      // If removing last one and optional, set to empty array
      if (newParagraphs.length === 0 && optional) {
        updateSlide(slideIndex, { [field]: [] });
      } else if (newParagraphs.length === 0) {
        // Keep at least one if not optional
        return;
      } else {
        updateSlide(slideIndex, { [field]: newParagraphs });
      }
    };
    
    // For optional fields, show nothing if empty and not in edit mode
    if (paragraphs.length === 0 && !editMode) return null;
    
    // For optional fields in edit mode with no content, show add button
    if (paragraphs.length === 0 && editMode && optional) {
      return (
        <div className={`dynamic-content ${className}`}>
          <button className="add-paragraph-btn" onClick={addParagraph}>
            + Add Description
          </button>
        </div>
      );
    }
    
    const canAddMore = maxParagraphs === 0 || paragraphs.length < maxParagraphs;
    
    return (
      <div className={`dynamic-content ${className}`}>
        {paragraphs.map((para, pIndex) => (
          <div key={pIndex} className="dynamic-paragraph-wrapper">
            <p className="dynamic-text">
              <EditableField 
                value={para} 
                onChange={(v) => updateParagraph(pIndex, v)} 
                multiline 
              />
            </p>
            {editMode && (paragraphs.length > 1 || optional) && (
              <button 
                className="remove-paragraph-btn" 
                onClick={() => removeParagraph(pIndex)}
                title="Remove paragraph"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {editMode && canAddMore && (
          <button className="add-paragraph-btn" onClick={addParagraph}>
            + Add Paragraph {maxParagraphs > 0 ? `(${paragraphs.length}/${maxParagraphs})` : ''}
          </button>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // ========== DYNAMIC BULLETS COMPONENT ==========
  // Reusable bullet points with optional section title - can be added to any slide (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DynamicBullets = useMemo(() => ({ slide, slideIndex, field = 'bullets', titleField, className = '', maxBullets = 0, label = 'Bullet', updateSlideOverride }) => {
    const doUpdate = updateSlideOverride || updateSlide;
    // Support both string bullets and { title, text } objects for per-bullet titles
    const rawBullets = Array.isArray(slide[field]) ? slide[field] : [];
    const sectionTitle = titleField ? slide[titleField] : null;
    const hasSectionTitle = sectionTitle !== undefined && sectionTitle !== null && sectionTitle !== '';
    
    const getBulletText = (bullet) => {
      if (typeof bullet === 'object' && bullet !== null) return bullet.text || '';
      return typeof bullet === 'string' ? bullet : String(bullet || '');
    };
    
    const getBulletTitle = (bullet) => {
      if (typeof bullet === 'object' && bullet !== null) return bullet.title || '';
      return '';
    };
    
    const hasBulletTitle = (bullet) => {
      return typeof bullet === 'object' && bullet !== null && bullet.title !== undefined;
    };
    
    const updateBullet = (bIndex, value) => {
      const newBullets = [...rawBullets];
      const current = newBullets[bIndex];
      if (typeof current === 'object' && current !== null) {
        newBullets[bIndex] = { ...current, text: value };
      } else {
        newBullets[bIndex] = value;
      }
      doUpdate(slideIndex, { [field]: newBullets });
    };
    
    const updateBulletTitle = (bIndex, value) => {
      const newBullets = [...rawBullets];
      const current = newBullets[bIndex];
      if (typeof current === 'object' && current !== null) {
        newBullets[bIndex] = { ...current, title: value };
      } else {
        newBullets[bIndex] = { title: value, text: current || '' };
      }
      doUpdate(slideIndex, { [field]: newBullets });
    };
    
    const toggleBulletTitle = (bIndex) => {
      const newBullets = [...rawBullets];
      const current = newBullets[bIndex];
      if (hasBulletTitle(current)) {
        // Remove title, convert back to string
        newBullets[bIndex] = getBulletText(current);
      } else {
        // Add title, convert to object
        newBullets[bIndex] = { title: 'Title', text: getBulletText(current) };
      }
      doUpdate(slideIndex, { [field]: newBullets });
    };
    
    const addBullet = () => {
      if (maxBullets > 0 && rawBullets.length >= maxBullets) return;
      const newBullets = [...rawBullets, 'New bullet point'];
      doUpdate(slideIndex, { [field]: newBullets });
    };
    
    const removeBullet = (bIndex) => {
      const newBullets = rawBullets.filter((_, i) => i !== bIndex);
      doUpdate(slideIndex, { [field]: newBullets });
    };
    
    const toggleSectionTitle = () => {
      if (!titleField) return;
      if (hasSectionTitle) {
        doUpdate(slideIndex, { [titleField]: undefined });
      } else {
        doUpdate(slideIndex, { [titleField]: 'Section Title' });
      }
    };
    
    // If no bullets and not in edit mode, show nothing
    if (rawBullets.length === 0 && !editMode) return null;
    
    // If no bullets and in edit mode, show add button
    if (rawBullets.length === 0 && editMode) {
      return (
        <div className={`dynamic-bullets ${className}`}>
          {titleField && (
            <button className="add-section-title-btn" onClick={toggleSectionTitle}>
              + Add Bullets Title
            </button>
          )}
          <button className="add-bullet-btn" onClick={addBullet}>
            + Add {label}
          </button>
        </div>
      );
    }
    
    const canAddMore = maxBullets === 0 || rawBullets.length < maxBullets;
    const bulletStyle = slide.bulletStyle || 'accent';

    return (
      <div className={`dynamic-bullets ${className}`} data-bullet-style={bulletStyle}>
        {editMode && rawBullets.length > 0 && (
          <div className="bullet-style-control">
            <button type="button" className={`bullet-style-btn${bulletStyle === 'accent' ? ' active' : ''}`} onClick={() => doUpdate(slideIndex, { bulletStyle: 'accent' })} title="Accent square">
              <span className="bullet-style-preview accent-preview"></span>
            </button>
            <button type="button" className={`bullet-style-btn${bulletStyle === 'minimal' ? ' active' : ''}`} onClick={() => doUpdate(slideIndex, { bulletStyle: 'minimal' })} title="Minimal gray square">
              <span className="bullet-style-preview minimal-preview"></span>
            </button>
            <button type="button" className={`bullet-style-btn${bulletStyle === 'dark' ? ' active' : ''}`} onClick={() => doUpdate(slideIndex, { bulletStyle: 'dark' })} title="Dark square">
              <span className="bullet-style-preview dark-preview"></span>
            </button>
          </div>
        )}
        {/* Section Title - optional header for all bullets */}
        {hasSectionTitle && (
          <div className="bullets-section-title">
            <EditableField 
              value={sectionTitle} 
              onChange={(v) => doUpdate(slideIndex, { [titleField]: v })} 
            />
            {editMode && (
              <button 
                className="remove-section-title-btn"
                title="Remove section title"
                onClick={toggleSectionTitle}
              >×</button>
            )}
          </div>
        )}
        {editMode && titleField && !hasSectionTitle && (
          <button 
            className="add-section-title-btn"
            onClick={toggleSectionTitle}
          >
            + Add Bullets Title
          </button>
        )}
        <ul className="bullet-list">
          {rawBullets.map((bullet, bIndex) => (
            <li key={bIndex} className={hasBulletTitle(bullet) ? 'has-title' : ''}>
              {hasBulletTitle(bullet) && (
                <span className="bullet-title">
                  <EditableField 
                    value={getBulletTitle(bullet)} 
                    onChange={(v) => updateBulletTitle(bIndex, v)} 
                  />
                </span>
              )}
              <span className={hasBulletTitle(bullet) ? 'bullet-text' : ''}>
                <EditableField 
                  value={getBulletText(bullet)} 
                  onChange={(v) => updateBullet(bIndex, v)} 
                />
              </span>
              {editMode && (
                <>
                  <button 
                    className="toggle-bullet-title-btn"
                    title={hasBulletTitle(bullet) ? 'Remove bullet title' : 'Add bullet title'}
                    onClick={() => toggleBulletTitle(bIndex)}
                  >{hasBulletTitle(bullet) ? '−' : 'T'}</button>
                  <button 
                    className="remove-bullet-btn"
                    onClick={() => removeBullet(bIndex)}
                  >×</button>
                </>
              )}
            </li>
          ))}
        </ul>
        {editMode && canAddMore && (
          <button className="add-bullet-btn" onClick={addBullet}>
            + Add {label} {maxBullets > 0 ? `(${rawBullets.length}/${maxBullets})` : ''}
          </button>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // ========== FIGMA EMBED HELPER ==========
  // Accepts: Figma URL, Figma embed URL, or full <iframe> tag (extracts src)
  const toFigmaEmbedUrl = toFigmaEmbedUrlModule;

  // ========== DYNAMIC IMAGES COMPONENT ==========
  // Handles single image OR array of images with add/remove and position control (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DynamicImages = useMemo(() => ({ slide, slideIndex, field = 'image', captionField = 'caption', className = '', maxImages = 3 }) => {
    const [activePositionControl, setActivePositionControl] = useState(null);
    const [embedInputIndex, setEmbedInputIndex] = useState(null);
    const [embedDraft, setEmbedDraft] = useState('');
    const [embedInputType, setEmbedInputType] = useState('figma'); // 'figma', 'site', or 'youtube'
    
    // Check if it's an array or single string
    const isArray = Array.isArray(slide[field]);
    let images = [];
    
    if (isArray) {
      images = slide[field].map((img, i) => 
        typeof img === 'object' 
          ? { position: 'center center', size: 'large', fit: 'cover', wrapperBg: true, embedUrl: '', ...img }
          : { src: img, caption: slide.captions?.[i] || '', position: 'center center', size: 'large', fit: 'cover', wrapperBg: true, embedUrl: '' }
      );
    } else if (slide[field] || slide[`${field}EmbedUrl`]) {
      const isVideoVal = slide[`${field}IsVideo`] || false;
      const isGifVal = slide[`${field}IsGif`] || false;
      // Per-field overrides namespace as e.g. beforeImagePosition / afterImageWrapperBg.
      // Legacy 'image*' keys remain the source of truth when field === 'image' and act
      // as a fallback for new fields so existing slides keep their settings.
      const nsKey = (suffix) => field === 'image' ? `image${suffix}` : `${field}${suffix}`;
      const nsRead = (suffix, fallback) => {
        const ns = slide[nsKey(suffix)];
        if (ns !== undefined) return ns;
        const legacy = slide[`image${suffix}`];
        return legacy !== undefined ? legacy : fallback;
      };
      images = [{
        src: slide[field] || '',
        caption: slide[captionField] || '',
        isVideo: isVideoVal,
        isGif: isGifVal,
        position: nsRead('Position', 'center center'),
        size: nsRead('Size', 'large'),
        fit: nsRead('Fit', 'cover'),
        wrapperBg: nsRead('WrapperBg', true),
        embedUrl: slide[`${field}EmbedUrl`] || '',
      }];
    }
    
    // updateImage can take either (imgIndex, field, value) or (imgIndex, fieldsObject)
    const updateImage = (imgIndex, imgFieldOrObj, value) => {
      const updates = typeof imgFieldOrObj === 'object' ? imgFieldOrObj : { [imgFieldOrObj]: value };
      
      // Mutual exclusivity: setting embedUrl clears src/isVideo/isGif and vice versa
      if (updates.embedUrl !== undefined) {
        updates.src = '';
        updates.isVideo = false;
        updates.isGif = false;
        if (!updates.embedUrl) updates.embedType = '';
      } else if (updates.src !== undefined && updates.src) {
        updates.embedUrl = '';
        updates.embedType = '';
      }
      
      if (isArray) {
        const newImages = [...images];
        newImages[imgIndex] = { ...newImages[imgIndex], ...updates };
        updateSlide(slideIndex, { [field]: newImages });
      } else {
        const slideUpdates = {};
        Object.entries(updates).forEach(([key, val]) => {
          if (key === 'src') {
            slideUpdates[field] = val;
          } else if (key === 'caption') {
            slideUpdates[captionField] = val;
          } else if (key === 'position') {
            slideUpdates[field === 'image' ? 'imagePosition' : `${field}Position`] = val;
          } else if (key === 'size') {
            slideUpdates[field === 'image' ? 'imageSize' : `${field}Size`] = val;
          } else if (key === 'fit') {
            slideUpdates[field === 'image' ? 'imageFit' : `${field}Fit`] = val;
          } else if (key === 'wrapperBg') {
            slideUpdates[field === 'image' ? 'imageWrapperBg' : `${field}WrapperBg`] = val;
          } else if (key === 'isVideo') {
            slideUpdates[`${field}IsVideo`] = val;
          } else if (key === 'isGif') {
            slideUpdates[`${field}IsGif`] = val;
          } else if (key === 'embedUrl') {
            slideUpdates[`${field}EmbedUrl`] = val;
          }
        });
        updateSlide(slideIndex, slideUpdates);
      }
    };
    
    // File picker for image/video upload
    const handleDynamicImageUpload = (imgIndex) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/mp4,video/webm,.gif';
      input.value = ''; // Reset so same file can be re-selected
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const isVideo = file.type.startsWith('video/');
          const isGif = file.type === 'image/gif';
          const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
          
          // File size limits (in MB)
          const maxVideoSize = 100; // 100MB for videos
          const maxGifSize = 40; // 40MB for GIFs
          const maxImageSize = 10; // 10MB for images (will be compressed)
          const fileSizeMB = file.size / (1024 * 1024);
          
          if (isVideo && fileSizeMB > maxVideoSize) {
            alert(`Video file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxVideoSize}MB. Please use a smaller video or compress it first.`);
            return;
          }
          if (isGif && fileSizeMB > maxGifSize) {
            alert(`GIF file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxGifSize}MB. Please use a smaller GIF.`);
            return;
          }
          if (!isVideo && !isGif && !isSvg && fileSizeMB > maxImageSize) {
            alert(`Image file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxImageSize}MB.`);
            return;
          }
          
          const reader = new FileReader();
          reader.onerror = () => {
            alert('Error reading file. Please try again.');
          };
          reader.onload = async (event) => {
            try {
              const dataUrl = event.target.result;
              
              // Don't compress videos, GIFs, or SVGs — use as-is
              if (isVideo || isGif || isSvg) {
                updateImage(imgIndex, { src: dataUrl, isVideo: isVideo, isGif: isGif });
              } else {
                try {
                  const compressed = await compressImage(dataUrl);
                  updateImage(imgIndex, { src: compressed, isVideo: false });
                } catch (err) {
                  console.error('Error compressing image:', err);
                  updateImage(imgIndex, { src: dataUrl, isVideo: false });
                }
              }
            } catch (err) {
              console.error('Error processing file:', err);
              alert('Error processing file. Please try a smaller file.');
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };
    
    const addImage = () => {
      const newImages = isArray
        ? [...images, { src: '', caption: '', position: 'center center', size: 'large', embedUrl: '' }]
        : [
            { src: slide[field] || '', caption: slide[captionField] || '', position: slide.imagePosition || 'center center', size: slide.imageSize || 'large', embedUrl: slide[`${field}EmbedUrl`] || '' },
            { src: '', caption: '', position: 'center center', size: 'large', embedUrl: '' }
          ];
      updateSlide(slideIndex, { [field]: newImages });
    };

    // Bulk upload — open the file picker in multi-select mode and drop the
    // chosen files into the carousel in one shot. Empty slots are filled
    // first (so the user's existing layout isn't disturbed); any extras
    // append as new slots up to effectiveMaxImages. One updateSlide at the
    // end avoids the cascade of single-image rewrites the per-file flow
    // would otherwise produce.
    const handleBulkUpload = () => {
      const remaining = effectiveMaxImages - images.length;
      const emptySlotCount = images.filter((img) => !img.src && !img.embedUrl).length;
      const capacity = remaining + emptySlotCount;
      if (capacity <= 0) {
        alert(`Carousel is full (${images.length}/${effectiveMaxImages}).`);
        return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/mp4,video/webm,.gif';
      input.multiple = true;
      input.value = '';
      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (files.length > capacity) {
          alert(`Only ${capacity} more image${capacity === 1 ? '' : 's'} can fit. The first ${capacity} of your ${files.length} selected file${files.length === 1 ? '' : 's'} will be added.`);
        }
        const accepted = files.slice(0, capacity);

        const maxVideoSize = 100; const maxGifSize = 40; const maxImageSize = 10;
        const readFile = (file) => new Promise((resolve) => {
          const isVideo = file.type.startsWith('video/');
          const isGif = file.type === 'image/gif';
          const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
          const sizeMB = file.size / (1024 * 1024);
          if (isVideo && sizeMB > maxVideoSize) { alert(`Skipped "${file.name}" — video over ${maxVideoSize}MB.`); resolve(null); return; }
          if (isGif && sizeMB > maxGifSize) { alert(`Skipped "${file.name}" — GIF over ${maxGifSize}MB.`); resolve(null); return; }
          if (!isVideo && !isGif && !isSvg && sizeMB > maxImageSize) { alert(`Skipped "${file.name}" — image over ${maxImageSize}MB.`); resolve(null); return; }
          const reader = new FileReader();
          reader.onerror = () => { console.error('Read error', file.name); resolve(null); };
          reader.onload = async (ev) => {
            const dataUrl = ev.target?.result;
            if (!dataUrl) { resolve(null); return; }
            if (isVideo || isGif || isSvg) {
              resolve({ src: dataUrl, isVideo, isGif });
            } else {
              try { resolve({ src: await compressImage(dataUrl), isVideo: false }); }
              catch { resolve({ src: dataUrl, isVideo: false }); }
            }
          };
          reader.readAsDataURL(file);
        });

        // Read sequentially so giant videos don't all FileReader at once
        // and choke memory on weak machines.
        const loaded = [];
        for (const f of accepted) {
          const r = await readFile(f);
          if (r) loaded.push(r);
        }
        if (loaded.length === 0) return;

        // Fill empty slots first, then append. Single state write.
        const next = [...images];
        let q = 0;
        for (let i = 0; i < next.length && q < loaded.length; i++) {
          if (!next[i].src && !next[i].embedUrl) {
            next[i] = { ...next[i], ...loaded[q], embedUrl: '', embedType: undefined };
            q++;
          }
        }
        while (q < loaded.length && next.length < effectiveMaxImages) {
          next.push({ position: 'center center', size: 'large', fit: 'cover', wrapperBg: true, embedUrl: '', ...loaded[q] });
          q++;
        }
        updateSlide(slideIndex, { [field]: next });
      };
      input.click();
    };
    
    const removeImage = (imgIndex) => {
      if (images.length <= 1) return;
      const newImages = images.filter((_, i) => i !== imgIndex);
      updateSlide(slideIndex, { [field]: newImages });
    };

    // Reorder helper for the carousel thumbnail strip. Pulls the dragged
    // tile out and reinserts it at the drop target's index — the array
    // shifts naturally instead of swapping pairs, which matches what the
    // user sees when they drag a tile between two others.
    const moveImage = (from, to) => {
      if (from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return;
      const next = [...images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      updateSlide(slideIndex, { [field]: next });
      // Keep the user's selection on the moved tile so their attention
      // follows the action instead of jumping to whatever now sits at
      // the old `carouselIdx`.
      if (carouselIdx === from) setCarouselIdx(to);
      else if (from < carouselIdx && to >= carouselIdx) setCarouselIdx(carouselIdx - 1);
      else if (from > carouselIdx && to <= carouselIdx) setCarouselIdx(carouselIdx + 1);
    };
    
    // Position presets
    const positionPresets = [
      { label: '↖', value: 'left top', title: 'Top Left' },
      { label: '↑', value: 'center top', title: 'Top Center' },
      { label: '↗', value: 'right top', title: 'Top Right' },
      { label: '←', value: 'left center', title: 'Center Left' },
      { label: '•', value: 'center center', title: 'Center' },
      { label: '→', value: 'right center', title: 'Center Right' },
      { label: '↙', value: 'left bottom', title: 'Bottom Left' },
      { label: '↓', value: 'center bottom', title: 'Bottom Center' },
      { label: '↘', value: 'right bottom', title: 'Bottom Right' },
    ];
    
    const imageCount = images.length;
    const gridCols = slide.gridCols || (imageCount >= 3 ? 3 : imageCount >= 2 ? 2 : 1);
    const imageDisplayMode = slide.imageDisplayMode || 'grid';
    const effectiveMaxImages = imageDisplayMode === 'carousel' ? 10 : maxImages;

    const [carouselIdx, setCarouselIdx] = useState(0);
    const [dragSrcIdx, setDragSrcIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    // Track whether this DynamicImages' slide is the current one. The
    // auto-advance must NOT run while the slide is off-screen, otherwise
    // by the time the user reaches the slide the index has already
    // advanced past 0 and they see image 2/3/etc instead of image 1.
    // Initialized via currentSlideRef.current so the carousel that's
    // current on first render starts auto-advancing immediately.
    const [isCurrentSlide, setIsCurrentSlide] = useState(
      () => slideIndex === (currentSlideRef.current ?? 0)
    );

    // Listen for the parent's slide-change broadcast and rewind to image 1
    // whenever the user navigates away. View mode only — edit mode keeps
    // the user's selected thumb so active editing isn't disrupted.
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const onChange = (e) => {
        const nowCurrent = e?.detail?.slide === slideIndex;
        setIsCurrentSlide(nowCurrent);
        if (!nowCurrent && imageDisplayMode === 'carousel' && !editMode) {
          setCarouselIdx(0);
        }
      };
      window.addEventListener('case-study:slide-change', onChange);
      return () => window.removeEventListener('case-study:slide-change', onChange);
    }, [editMode, imageDisplayMode, slideIndex]);

    const carouselRef = useRef(null);

    // Auto-advance carousel — only when this slide is actually current,
    // so off-screen carousels don't burn through their images before the
    // user gets there.
    const carouselInterval = slide[`${field}CarouselInterval`] || 4000;
    useEffect(() => {
      if (imageDisplayMode !== 'carousel' || imageCount <= 1 || editMode) return;
      if (!isCurrentSlide) return;
      const timer = setInterval(() => {
        setCarouselIdx(prev => (prev + 1) % imageCount);
      }, carouselInterval);
      return () => clearInterval(timer);
    }, [imageDisplayMode, imageCount, editMode, carouselInterval, isCurrentSlide]);

    // Reset index if images change or mode switches away
    useEffect(() => {
      if (imageDisplayMode !== 'carousel' || carouselIdx >= imageCount) setCarouselIdx(0);
    }, [imageCount, imageDisplayMode]);

    if (images.length === 0 && !editMode) return null;

    return (
      <div className={`dynamic-images images-count-${imageCount} ${className}`}>
        {/* Layout picker — also visible at imageCount === 1 so single-image
            slides (e.g. the default problem slide) can switch into a
            carousel without first having to add a second image manually. */}
        {editMode && imageCount >= 1 && (
          <div className="dynamic-grid-control">
            <span className="dynamic-grid-label">Layout</span>
            <div className="dynamic-grid-buttons">
              {[1, 2, 3].map(cols => (
                <button
                  key={cols}
                  className={`dynamic-grid-btn ${imageDisplayMode === 'grid' && gridCols === cols ? 'active' : ''}`}
                  onClick={() => {
                    const updates = { gridCols: cols, imageDisplayMode: 'grid' };
                    const emptyImg = { src: '', caption: '', position: 'center center', size: 'large', fit: 'cover', embedUrl: '' };
                    const newImages = Array.from({ length: cols }, (_, i) => images[i] ? { ...images[i] } : { ...emptyImg });
                    updates[field] = newImages;
                    updateSlide(slideIndex, updates);
                  }}
                  title={`${cols} column${cols > 1 ? 's' : ''}`}
                >
                  {cols}
                </button>
              ))}
              <button
                className={`dynamic-grid-btn ${imageDisplayMode === 'carousel' ? 'active' : ''}`}
                onClick={() => {
                  const emptyImg = { src: '', caption: '', position: 'center center', size: 'large', fit: 'cover', embedUrl: '' };
                  const newImages = images.length >= 2 ? [...images] : [...images, ...Array.from({ length: 2 - images.length }, () => ({ ...emptyImg }))];
                  updateSlide(slideIndex, { imageDisplayMode: 'carousel', [field]: newImages });
                }}
                title="Carousel"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4L4 12l4 8M16 4l4 8-4 8" /><rect x="8" y="6" width="8" height="12" rx="1" /></svg>
              </button>
            </div>
            {imageDisplayMode === 'carousel' && (
              <>
                <div className="dynamic-grid-divider" />
                <span className="dynamic-grid-label">Fill</span>
                <div className="dynamic-grid-buttons">
                  <button
                    type="button"
                    className={`dynamic-grid-btn carousel-fit-global-btn${(slide[`${field}CarouselFit`] || 'cover') === 'cover' ? ' active' : ''}`}
                    onClick={() => updateSlide(slideIndex, { [`${field}CarouselFit`]: 'cover' })}
                    title="Fill — image crops to fill area"
                  >Fill</button>
                  <button
                    type="button"
                    className={`dynamic-grid-btn carousel-fit-global-btn${slide[`${field}CarouselFit`] === 'contain' ? ' active' : ''}`}
                    onClick={() => updateSlide(slideIndex, { [`${field}CarouselFit`]: 'contain' })}
                    title="Fit — show full image"
                  >Fit</button>
                </div>
                <div className="dynamic-grid-divider" />
                <button
                  type="button"
                  className={`dynamic-grid-btn carousel-fit-global-btn${slide[`${field}CarouselBg`] !== false ? ' active' : ''}`}
                  onClick={() => updateSlide(slideIndex, { [`${field}CarouselBg`]: slide[`${field}CarouselBg`] !== false ? false : true })}
                  title={slide[`${field}CarouselBg`] !== false ? 'Background on — click to remove' : 'Background off — click to add'}
                >BG</button>
              </>
            )}
          </div>
        )}
        {imageDisplayMode === 'carousel' && imageCount >= 2 ? (
          <>
            {editMode && (
              <div className="dynamic-carousel-settings">
                <div className="carousel-settings-row">
                  <span className="carousel-settings-label">Speed</span>
                  <input
                    type="range" min="1000" max="8000" step="500"
                    value={slide[`${field}CarouselInterval`] || 4000}
                    onChange={(e) => updateSlide(slideIndex, { [`${field}CarouselInterval`]: Number(e.target.value) })}
                    className="carousel-speed-slider"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="carousel-speed-value">{((slide[`${field}CarouselInterval`] || 4000) / 1000).toFixed(1)}s</span>
                </div>
              </div>
            )}
            <div className="dynamic-carousel" ref={carouselRef} onClick={(e) => e.stopPropagation()} data-no-slide-advance="true">
              <div className="dynamic-carousel-track" style={{ transform: `translateX(-${carouselIdx * 100}%)` }}>
                {images.map((imgData, imgIndex) => {
                  const carouselFit = slide[`${field}CarouselFit`] || 'cover';
                  const isContain = carouselFit === 'contain';
                  const carouselBg = slide[`${field}CarouselBg`] !== false;
                  const distance = Math.abs((slideIndex ?? 0) - (currentSlideRef.current ?? 0));
                  const videoPriority = distance === 0 ? 'high' : distance <= 1 ? 'nearby' : 'lazy';
                  const imgLoading = distance <= 1 ? 'eager' : 'lazy';
                  const imgFetchPriority = distance === 0 ? 'high' : distance > 2 ? 'low' : 'auto';
                  return (
                    <div key={imgIndex} className={`dynamic-carousel-slide${isContain ? ' carousel-fit-contain' : ''}${carouselBg ? ' carousel-has-bg' : ''}`}>
                      {imgData.src ? (
                        <>
                          {imgData.isVideo ? (
                            <LazyVideo src={imgData.src} poster={imgData.posterSrc} priority={videoPriority} playbackRate={imgData.playbackRate} style={{ objectFit: carouselFit, objectPosition: imgData.position || 'center center' }} />
                          ) : (
                            <img
                              src={imgData.src}
                              {...(buildResponsiveWebp(imgData.src) || {})}
                              alt={`Image ${imgIndex + 1}`}
                              loading={imgLoading}
                              decoding="async"
                              fetchpriority={imgFetchPriority}
                              style={{ objectFit: carouselFit, objectPosition: imgData.position || 'center center' }}
                              onClick={() => !editMode && setLightboxImage && setLightboxImage(imgData.src)}
                            />
                          )}
                          {editMode && (
                            <div className="carousel-slide-edit-controls">
                              <button type="button" className="carousel-slide-replace" onClick={(e) => { e.stopPropagation(); handleDynamicImageUpload(imgIndex); }} title="Replace this image"><span aria-hidden="true">↻</span> Replace</button>
                              <button type="button" className="carousel-slide-remove" onClick={(e) => { e.stopPropagation(); imageCount > 2 ? removeImage(imgIndex) : updateImage(imgIndex, 'src', ''); }} title="Remove this image"><span aria-hidden="true">✕</span> Remove</button>
                            </div>
                          )}
                        </>
                      ) : imgData.embedUrl ? (
                        <>
                          <iframe src={imgData.embedUrl} title={imgData.embedType === 'youtube' ? 'YouTube Video' : `Embed ${imgIndex + 1}`} allowFullScreen allow={imgData.embedType === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : undefined} loading={imgData.embedType === 'youtube' ? 'lazy' : undefined} className={imgData.embedType === 'youtube' ? 'youtube-embed-iframe' : imgData.embedType === 'site' ? 'site-embed-iframe' : 'figma-embed-iframe'} />
                          {editMode && (
                            <div className="carousel-slide-edit-controls">
                              <button type="button" className="carousel-slide-remove" onClick={(e) => { e.stopPropagation(); updateImage(imgIndex, { embedUrl: '' }); }} title="Remove this embed"><span aria-hidden="true">✕</span> Remove</button>
                            </div>
                          )}
                        </>
                      ) : editMode ? (
                        <div className="carousel-placeholder" onClick={() => handleDynamicImageUpload(imgIndex)}><span className="carousel-placeholder-plus" aria-hidden="true">+</span><span>Click to add image</span></div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {imageCount > 1 && !editMode && (
                <div className="carousel-dots">
                  {images.map((_, ci) => (
                    <button key={ci} className={`carousel-dot ${carouselIdx === ci ? 'active' : ''}`} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCarouselIdx(ci); }} data-no-slide-advance="true" />
                  ))}
                </div>
              )}
              {imageCount > 1 && (
                <>
                  <button className="carousel-arrow carousel-prev" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCarouselIdx(prev => (prev - 1 + imageCount) % imageCount); }} data-no-slide-advance="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L8 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className="carousel-arrow carousel-next" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCarouselIdx(prev => (prev + 1) % imageCount); }} data-no-slide-advance="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4L12 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </>
              )}
            </div>
            {/* Edit-mode thumbnail strip — clear "selected" state, click to
                switch slide, dedicated `+ Add` tile that stays visible no
                matter how many images the carousel already has. */}
            {editMode && (
              <div className="carousel-thumb-strip" onClick={(e) => e.stopPropagation()} data-no-slide-advance="true">
                {images.map((imgData, ci) => {
                  const isActive = carouselIdx === ci;
                  const isEmpty = !imgData.src && !imgData.embedUrl;
                  // The minimum is 2 — under that the carousel template
                  // collapses back to a single image. Match the slide-
                  // overlay Remove behavior: clear src/embed in place
                  // when at the minimum, drop the slot otherwise.
                  const handleRemoveSlot = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (imageCount > 2) {
                      removeImage(ci);
                      if (carouselIdx >= imageCount - 1) setCarouselIdx(Math.max(0, imageCount - 2));
                    } else {
                      updateImage(ci, { src: '', embedUrl: '', embedType: undefined, isVideo: false, isGif: false });
                    }
                  };
                  const isDragOver = dragOverIdx === ci && dragSrcIdx !== null && dragSrcIdx !== ci;
                  const isDragSrc = dragSrcIdx === ci;
                  return (
                    <div
                      key={ci}
                      className={`carousel-thumb-wrap${isActive ? ' active' : ''}${isEmpty ? ' empty' : ''}${isDragOver ? ' drag-over' : ''}${isDragSrc ? ' dragging' : ''}`}
                      draggable={imageCount > 1}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(ci));
                        setDragSrcIdx(ci);
                      }}
                      onDragOver={(e) => {
                        if (dragSrcIdx === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIdx !== ci) setDragOverIdx(ci);
                      }}
                      onDragLeave={() => { if (dragOverIdx === ci) setDragOverIdx(null); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const from = dragSrcIdx ?? Number(e.dataTransfer.getData('text/plain'));
                        if (!Number.isNaN(from) && from !== ci) moveImage(from, ci);
                        setDragSrcIdx(null);
                        setDragOverIdx(null);
                      }}
                      onDragEnd={() => { setDragSrcIdx(null); setDragOverIdx(null); }}
                    >
                      <button
                        type="button"
                        className={`carousel-thumb${isActive ? ' active' : ''}`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCarouselIdx(ci); }}
                        title={`Image ${ci + 1}${imgData.src ? '' : imgData.embedUrl ? ' (embed)' : ' (empty)'}${imageCount > 1 ? ' — drag to reorder' : ''}`}
                        data-no-slide-advance="true"
                      >
                        {imgData.src && !imgData.isVideo ? (
                          <img src={imgData.src} alt="" loading="lazy" decoding="async" />
                        ) : imgData.src && imgData.isVideo ? (
                          <span className="carousel-thumb-placeholder" aria-hidden="true">▶</span>
                        ) : imgData.embedUrl ? (
                          <span className="carousel-thumb-placeholder" aria-hidden="true">⧉</span>
                        ) : (
                          <span className="carousel-thumb-placeholder carousel-thumb-empty" aria-hidden="true">＋</span>
                        )}
                        <span className="carousel-thumb-index">{ci + 1}</span>
                      </button>
                      <button
                        type="button"
                        className="carousel-thumb-remove"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleRemoveSlot}
                        title={imageCount > 2 ? `Remove slot ${ci + 1}` : 'Clear this slot'}
                        aria-label={imageCount > 2 ? `Remove slot ${ci + 1}` : 'Clear this slot'}
                        data-no-slide-advance="true"
                      >×</button>
                    </div>
                  );
                })}
                {imageCount < effectiveMaxImages && (
                  <>
                    <button
                      type="button"
                      className="carousel-thumb carousel-thumb-add"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBulkUpload(); }}
                      title={`Upload one or more images (${imageCount}/${effectiveMaxImages})`}
                      data-no-slide-advance="true"
                    >
                      <span className="carousel-thumb-add-plus" aria-hidden="true">+</span>
                      <span className="carousel-thumb-add-label">Upload</span>
                      <span className="carousel-thumb-index carousel-thumb-index-add">{imageCount}/{effectiveMaxImages}</span>
                    </button>
                    {/* Empty-slot fallback — keeps the prior single-click
                        "add a blank slot, fill later" affordance discoverable
                        next to the bulk upload tile. */}
                    <button
                      type="button"
                      className="carousel-thumb carousel-thumb-add carousel-thumb-add-blank"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addImage(); }}
                      title="Add empty slot"
                      data-no-slide-advance="true"
                    >
                      <span className="carousel-thumb-add-plus" aria-hidden="true">+</span>
                      <span className="carousel-thumb-add-label">Empty</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
        <div className="dynamic-images-grid" style={imageCount >= 2 ? { gridTemplateColumns: `repeat(${gridCols}, 1fr)` } : undefined}>
          {images.map((imgData, imgIndex) => {
            const position = imgData.position || 'center center';
            const imgSize = imgData.size || 'large';
            const imgFit = imgData.fit || 'cover';
            const wrapperBg = imgData.wrapperBg !== undefined ? imgData.wrapperBg : true;
            
            // Size presets
            const sizePresets = [
              { label: 'S', value: 'small', title: 'Small' },
              { label: 'M', value: 'medium', title: 'Medium' },
              { label: 'L', value: 'large', title: 'Large (Full)' },
            ];
            
            // Fit presets
            const fitPresets = [
              { label: 'Fill', value: 'cover', title: 'Fill - image covers entire area (may crop)' },
              { label: 'Fit', value: 'contain', title: 'Fit - shows entire image (may have gaps)' },
            ];
            
            const isContain = imgFit === 'contain';
            // Inline styles for contain mode — only remove radius/overflow when no wrapper bg
            const wrapperContainStyle = isContain ? {
              ...(wrapperBg ? {} : { borderRadius: 0, overflow: 'visible' }),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } : {};
            const mediaContainStyle = isContain ? {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 0,
              objectPosition: position,
              objectFit: imgFit,
            } : { objectPosition: position, objectFit: imgFit };
            
            return (
              <div 
                key={imgIndex} 
                className={`dynamic-image-item img-size-${imgSize} img-fit-${imgFit}${!wrapperBg ? ' no-wrapper-bg' : ''}`}
              >
                <div 
                  className={`dynamic-image-wrapper ${!editMode && (imgData.src || imgData.embedUrl) ? 'clickable' : ''} ${imgData.embedUrl ? 'has-embed' : ''}`}
                  style={imgData.embedUrl ? {} : wrapperContainStyle}
                  onClick={() => {
                    if (imgData.embedUrl) return;
                    if (editMode && !activePositionControl) {
                      handleDynamicImageUpload(imgIndex);
                    } else if (!editMode && imgData.src) {
                      setLightboxImage(imgData.src);
                    }
                  }}
                >
                  {imgData.embedUrl ? (
                    <>
                      <iframe
                        src={imgData.embedUrl}
                        title={imgData.embedType === 'youtube' ? 'YouTube Video' : imgData.embedType === 'site' ? 'Site Embed' : imgData.embedType === 'iframe' ? 'Embedded iframe' : 'Figma Embed'}
                        allowFullScreen
                        allow={imgData.embedType === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : undefined}
                        loading={imgData.embedType === 'youtube' ? 'lazy' : undefined}
                        className={imgData.embedType === 'youtube' ? 'youtube-embed-iframe' : imgData.embedType === 'site' ? 'site-embed-iframe' : imgData.embedType === 'iframe' ? 'iframe-embed-iframe' : 'figma-embed-iframe'}
                      />
                      {editMode && embedInputIndex === imgIndex ? (
                        // Inline edit panel overlayed on the iframe — the old
                        // "Change media" wiped the embed first, which hid the
                        // iframe before you could see what you were replacing.
                        // Now the iframe stays visible while you pick the new
                        // one; Cancel leaves it untouched.
                        (() => {
                          const currentIframeOption = (embedInputType === 'iframe' && imgData.embedUrl)
                            ? imgData.embedUrl.replace(/^\//, '')
                            : '';
                          return (
                            <div className="embed-change-overlay" onClick={(e) => e.stopPropagation()}>
                              <div className="figma-embed-input embed-change-input">
                                {embedInputType === 'iframe' && IFRAME_FILES.length > 0 && (
                                  <select
                                    className="iframe-file-picker"
                                    value={currentIframeOption}
                                    onChange={(e) => {
                                      const picked = e.target.value;
                                      if (!picked) return;
                                      const src = toIframeSrc(picked);
                                      if (src) {
                                        updateImage(imgIndex, { embedUrl: src, embedType: 'iframe' });
                                        setEmbedDraft('');
                                        setEmbedInputIndex(null);
                                      }
                                    }}
                                    title="Pick a file from public/iframes/"
                                  >
                                    <option value="">Pick from /public/iframes…</option>
                                    {IFRAME_FILES.map(f => (
                                      <option key={f.path} value={f.path}>{f.label}</option>
                                    ))}
                                  </select>
                                )}
                                <input
                                  type="text"
                                  className="editable-field figma-url-input"
                                  placeholder={embedInputType === 'figma' ? "Paste Figma URL or <iframe> embed code..." : embedInputType === 'youtube' ? "Paste YouTube URL or <iframe> embed code..." : embedInputType === 'iframe' ? 'Paste iframe tag, URL, or filename' : "Paste website URL to embed..."}
                                  value={embedDraft}
                                  onChange={(e) => setEmbedDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key !== 'Enter') return;
                                    if (embedInputType === 'iframe') {
                                      const src = toIframeSrc(embedDraft);
                                      if (src) { updateImage(imgIndex, { embedUrl: src, embedType: 'iframe' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                      else alert('Please paste an <iframe> tag or a path/URL');
                                    } else if (embedInputType === 'figma') {
                                      const converted = toFigmaEmbedUrl(embedDraft);
                                      if (converted) { updateImage(imgIndex, { embedUrl: converted, embedType: 'figma' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                      else alert('Please enter a valid Figma URL or <iframe> embed code');
                                    } else if (embedInputType === 'youtube') {
                                      const converted = toYouTubeEmbedUrl(embedDraft);
                                      if (converted) { updateImage(imgIndex, { embedUrl: converted, embedType: 'youtube' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                      else alert('Please enter a valid YouTube URL or <iframe> embed code');
                                    } else {
                                      const url = embedDraft.trim();
                                      if (url && /^https?:\/\/.+/i.test(url)) { updateImage(imgIndex, { embedUrl: url, embedType: 'site' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                      else alert('Please enter a valid URL (starting with http:// or https://)');
                                    }
                                  }}
                                  autoFocus
                                />
                                <button type="button" className="figma-embed-confirm" onClick={() => {
                                  if (embedInputType === 'iframe') {
                                    const src = toIframeSrc(embedDraft);
                                    if (src) { updateImage(imgIndex, { embedUrl: src, embedType: 'iframe' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                    else alert('Please paste an <iframe> tag or a path/URL');
                                  } else if (embedInputType === 'figma') {
                                    const converted = toFigmaEmbedUrl(embedDraft);
                                    if (converted) { updateImage(imgIndex, { embedUrl: converted, embedType: 'figma' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                    else alert('Please enter a valid Figma URL or <iframe> embed code');
                                  } else if (embedInputType === 'youtube') {
                                    const converted = toYouTubeEmbedUrl(embedDraft);
                                    if (converted) { updateImage(imgIndex, { embedUrl: converted, embedType: 'youtube' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                    else alert('Please enter a valid YouTube URL or <iframe> embed code');
                                  } else {
                                    const url = embedDraft.trim();
                                    if (url && /^https?:\/\/.+/i.test(url)) { updateImage(imgIndex, { embedUrl: url, embedType: 'site' }); setEmbedDraft(''); setEmbedInputIndex(null); }
                                    else alert('Please enter a valid URL (starting with http:// or https://)');
                                  }
                                }}>Apply</button>
                                <button type="button" className="figma-embed-cancel" onClick={() => { setEmbedInputIndex(null); setEmbedDraft(''); }}>Cancel</button>
                              </div>
                            </div>
                          );
                        })()
                      ) : editMode ? (
                        <>
                          <div className="embed-edit-controls" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="embed-remove-btn embed-change-btn" onClick={() => {
                              // Open the picker with the current iframe's values
                              // pre-filled, without wiping the embed. The user
                              // can see the iframe it's replacing and can
                              // Cancel out.
                              setEmbedInputType(imgData.embedType || 'iframe');
                              setEmbedDraft(imgData.embedUrl || '');
                              setEmbedInputIndex(imgIndex);
                            }} title="Change to another media type">⇄ Change media</button>
                            <button type="button" className="embed-remove-btn" onClick={() => updateImage(imgIndex, { embedUrl: '', embedType: undefined })} title="Remove embed">× Remove</button>
                          </div>
                          <div className="media-fit-inline media-fit-inline-embed" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className={`fit-inline-btn ${imgFit === 'cover' ? 'active' : ''}`} onClick={() => updateImage(imgIndex, 'fit', 'cover')} title="Fill - iframe covers the entire area">Fill</button>
                            <button type="button" className={`fit-inline-btn ${imgFit === 'contain' ? 'active' : ''}`} onClick={() => updateImage(imgIndex, 'fit', 'contain')} title="Fit - iframe sits inside with a margin">Fit</button>
                            <span className="fit-inline-divider" />
                            <button type="button" className={`fit-inline-btn ${wrapperBg ? 'active' : ''}`} onClick={() => updateImage(imgIndex, 'wrapperBg', !wrapperBg)} title={wrapperBg ? 'Background on — click to remove' : 'Background off — click to add'}>BG</button>
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : imgData.src ? (
                    <>
                      {imgData.isVideo ? (
                        <LazyVideo
                          src={imgData.src}
                          poster={imgData.posterSrc}
                          priority={(() => {
                            const d = Math.abs((slideIndex ?? 0) - (currentSlideRef.current ?? 0));
                            return d === 0 ? 'high' : d <= 1 ? 'nearby' : 'lazy';
                          })()}
                          playbackRate={imgData.playbackRate}
                          style={mediaContainStyle}
                        />
                      ) : (
                        <img
                          src={imgData.src}
                          {...(buildResponsiveWebp(imgData.src) || {})}
                          alt={imgData.caption || `Image ${imgIndex + 1}`}
                          loading={Math.abs((slideIndex ?? 0) - (currentSlideRef.current ?? 0)) <= 1 ? 'eager' : 'lazy'}
                          decoding="async"
                          fetchpriority={(() => {
                            const d = Math.abs((slideIndex ?? 0) - (currentSlideRef.current ?? 0));
                            return d === 0 ? 'high' : d > 2 ? 'low' : 'auto';
                          })()}
                          style={mediaContainStyle}
                        />
                      )}
                      {editMode && (
                        <div className="image-edit-overlay" onClick={(e) => { e.stopPropagation(); handleDynamicImageUpload(imgIndex); }}>
                          Replace
                          {images.length === 1 && (
                            <button type="button" className="image-edit-overlay-remove" onClick={(e) => { e.stopPropagation(); updateImage(imgIndex, 'src', ''); }}>Remove</button>
                          )}
                        </div>
                      )}
                      {!editMode && !imgData.isVideo && !imgData.isGif && <div className="image-zoom-hint">🔍</div>}

                      {/* Fill / Fit control - visible for all media */}
                      {editMode && imgData.src && (
                        <div className="media-fit-inline" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`fit-inline-btn ${imgFit === 'cover' ? 'active' : ''}`}
                            onClick={() => updateImage(imgIndex, 'fit', 'cover')}
                            title="Fill - covers entire area (may crop)"
                          >
                            Fill
                          </button>
                          <button
                            type="button"
                            className={`fit-inline-btn ${imgFit === 'contain' ? 'active' : ''}`}
                            onClick={() => updateImage(imgIndex, 'fit', 'contain')}
                            title="Fit - shows entire media (may have gaps)"
                          >
                            Fit
                          </button>
                          <span className="fit-inline-divider" />
                          <button
                            type="button"
                            className={`fit-inline-btn ${wrapperBg ? 'active' : ''}`}
                            onClick={() => updateImage(imgIndex, 'wrapperBg', !wrapperBg)}
                            title={wrapperBg ? 'Background on — click to remove' : 'Background off — click to add'}
                          >
                            BG
                          </button>
                        </div>
                      )}
                      
                      {/* Image Controls Button - inside wrapper */}
                      {editMode && (
                        <div className="image-position-control">
                          <button 
                            className="position-toggle-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePositionControl(activePositionControl === imgIndex ? null : imgIndex);
                            }}
                            title="Adjust media settings"
                          >
                            ⊞
                          </button>
                        </div>
                      )}
                      
                      {/* Image Settings Panel */}
                      {editMode && activePositionControl === imgIndex && (
                        <div 
                          className="position-grid-overlay"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePositionControl(null);
                          }}
                        >
                          <div className="image-settings-panel" onClick={(e) => e.stopPropagation()}>
                            {/* Focus Position */}
                            <div className="settings-section">
                              <span className="settings-section-title">Focus Point</span>
                              <div className="position-grid-buttons">
                                {positionPresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    className={`position-btn ${position === preset.value ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'position', preset.value)}
                                    title={preset.title}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Size Control */}
                            <div className="settings-section">
                              <span className="settings-section-title">Image Size</span>
                              <div className="size-presets-row">
                                {sizePresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    className={`size-preset-btn ${imgSize === preset.value ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'size', preset.value)}
                                    title={preset.title}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Fit Control */}
                            <div className="settings-section">
                              <span className="settings-section-title">Image Fit</span>
                              <div className="fit-presets-row">
                                {fitPresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    className={`fit-preset-btn ${imgFit === preset.value ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'fit', preset.value)}
                                    title={preset.title}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Playback Speed — videos only */}
                            {imgData.isVideo && (
                              <div className="settings-section">
                                <span className="settings-section-title">Playback Speed</span>
                                <div className="size-presets-row">
                                  {[0.5, 1, 1.5, 2, 3].map((rate) => (
                                    <button
                                      key={rate}
                                      className={`size-preset-btn ${(Number(imgData.playbackRate) || 1) === rate ? 'active' : ''}`}
                                      onClick={() => updateImage(imgIndex, 'playbackRate', rate)}
                                      title={`${rate}× speed`}
                                    >
                                      {rate}×
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              className="settings-done-btn"
                              onClick={() => setActivePositionControl(null)}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : editMode ? (
                    <div className="media-type-picker">
                      {embedInputIndex === imgIndex ? (
                        <div className="figma-embed-input" onClick={(e) => e.stopPropagation()}>
                          {embedInputType === 'iframe' && IFRAME_FILES.length > 0 && (
                            <select
                              className="iframe-file-picker"
                              value=""
                              onChange={(e) => {
                                const picked = e.target.value;
                                if (!picked) return;
                                const src = toIframeSrc(picked);
                                if (src) {
                                  updateImage(imgIndex, { embedUrl: src, embedType: 'iframe' });
                                  setEmbedDraft('');
                                  setEmbedInputIndex(null);
                                }
                              }}
                              title="Pick a file from public/iframes/"
                            >
                              <option value="">Pick from /public/iframes…</option>
                              {IFRAME_FILES.map(f => (
                                <option key={f.path} value={f.path}>{f.label}</option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            className="editable-field figma-url-input"
                            placeholder={embedInputType === 'figma' ? "Paste Figma URL or <iframe> embed code..." : embedInputType === 'youtube' ? "Paste YouTube URL or <iframe> embed code..." : embedInputType === 'iframe' ? 'Paste iframe tag, URL, or filename' : "Paste website URL to embed..."}
                            value={embedDraft}
                            onChange={(e) => setEmbedDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (embedInputType === 'figma') {
                                  const converted = toFigmaEmbedUrl(embedDraft);
                                  if (converted) {
                                    updateImage(imgIndex, { embedUrl: converted });
                                    setEmbedDraft('');
                                    setEmbedInputIndex(null);
                                  } else {
                                    alert('Please enter a valid Figma URL or <iframe> embed code');
                                  }
                                } else if (embedInputType === 'youtube') {
                                  const converted = toYouTubeEmbedUrl(embedDraft);
                                  if (converted) {
                                    updateImage(imgIndex, { embedUrl: converted, embedType: 'youtube' });
                                    setEmbedDraft('');
                                    setEmbedInputIndex(null);
                                  } else {
                                    alert('Please enter a valid YouTube URL or <iframe> embed code');
                                  }
                                } else if (embedInputType === 'iframe') {
                                  const src = toIframeSrc(embedDraft);
                                  if (src) {
                                    updateImage(imgIndex, { embedUrl: src, embedType: 'iframe' });
                                    setEmbedDraft('');
                                    setEmbedInputIndex(null);
                                  } else {
                                    alert('Please paste an <iframe> tag or a path/URL');
                                  }
                                } else {
                                  const url = embedDraft.trim();
                                  if (url && /^https?:\/\/.+/i.test(url)) {
                                    updateImage(imgIndex, { embedUrl: url, embedType: 'site' });
                                    setEmbedDraft('');
                                    setEmbedInputIndex(null);
                                  } else {
                                    alert('Please enter a valid URL (starting with http:// or https://)');
                                  }
                                }
                              }
                            }}
                            autoFocus
                          />
                          <button type="button" className="figma-embed-confirm" onClick={() => {
                            if (embedInputType === 'figma') {
                              const converted = toFigmaEmbedUrl(embedDraft);
                              if (converted) {
                                updateImage(imgIndex, { embedUrl: converted });
                                setEmbedDraft('');
                                setEmbedInputIndex(null);
                              } else {
                                alert('Please enter a valid Figma URL or <iframe> embed code');
                              }
                            } else if (embedInputType === 'youtube') {
                              const converted = toYouTubeEmbedUrl(embedDraft);
                              if (converted) {
                                updateImage(imgIndex, { embedUrl: converted, embedType: 'youtube' });
                                setEmbedDraft('');
                                setEmbedInputIndex(null);
                              } else {
                                alert('Please enter a valid YouTube URL or <iframe> embed code');
                              }
                            } else if (embedInputType === 'iframe') {
                              const src = toIframeSrc(embedDraft);
                              if (src) {
                                updateImage(imgIndex, { embedUrl: src, embedType: 'iframe' });
                                setEmbedDraft('');
                                setEmbedInputIndex(null);
                              } else {
                                alert('Please paste an <iframe> tag or a path/URL');
                              }
                            } else {
                              const url = embedDraft.trim();
                              if (url && /^https?:\/\/.+/i.test(url)) {
                                updateImage(imgIndex, { embedUrl: url, embedType: 'site' });
                                setEmbedDraft('');
                                setEmbedInputIndex(null);
                              } else {
                                alert('Please enter a valid URL (starting with http:// or https://)');
                              }
                            }
                          }}>Embed</button>
                          <button type="button" className="figma-embed-cancel" onClick={() => { setEmbedInputIndex(null); setEmbedDraft(''); }}>Cancel</button>
                        </div>
                      ) : (
                        <div className="media-type-buttons">
                          <button type="button" className="media-type-btn" onClick={() => handleDynamicImageUpload(imgIndex)}>
                            <span className="media-type-icon">+</span>
                            <span>Upload Image</span>
                          </button>
                          <button type="button" className="media-type-btn media-type-figma" onClick={(e) => { e.stopPropagation(); setEmbedInputType('figma'); setEmbedInputIndex(imgIndex); setEmbedDraft(''); }}>
                            <span className="media-type-icon">◈</span>
                            <span>Embed Figma</span>
                          </button>
                          <button type="button" className="media-type-btn media-type-site" onClick={(e) => { e.stopPropagation(); setEmbedInputType('site'); setEmbedInputIndex(imgIndex); setEmbedDraft(''); }}>
                            <span className="media-type-icon">⧉</span>
                            <span>Embed Site</span>
                          </button>
                          <button type="button" className="media-type-btn media-type-youtube" onClick={(e) => { e.stopPropagation(); setEmbedInputType('youtube'); setEmbedInputIndex(imgIndex); setEmbedDraft(''); }}>
                            <span className="media-type-icon">▶</span>
                            <span>YouTube</span>
                          </button>
                          <button type="button" className="media-type-btn media-type-iframe" onClick={(e) => { e.stopPropagation(); setEmbedInputType('iframe'); setEmbedInputIndex(imgIndex); setEmbedDraft(''); }}>
                            <span className="media-type-icon">⟨⟩</span>
                            <span>Embed iframe</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="image-placeholder"></div>
                  )}
                </div>
                
                {(imgData.caption || editMode) && (
                  <div className="dynamic-image-caption-wrapper">
                    <span className="dynamic-image-caption">
                      <EditableField 
                        value={imgData.caption || ''} 
                        onChange={(v) => updateImage(imgIndex, 'caption', v)} 
                        placeholder="Add caption..."
                      />
                    </span>
                    {editMode && imgData.caption && (
                      <button 
                        className="remove-caption-btn" 
                        onClick={(e) => { e.stopPropagation(); updateImage(imgIndex, 'caption', ''); }}
                        title="Remove caption"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                {editMode && images.length > 1 && (
                  <button 
                    className="remove-dynamic-image-btn" 
                    onClick={(e) => { e.stopPropagation(); removeImage(imgIndex); }}
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        )}
        {/* Grid-mode add buttons. Mirrors the carousel strip: bulk
            upload as the primary action, blank-slot as the secondary. */}
        {editMode && images.length < effectiveMaxImages && (
          <div className="add-dynamic-image-row">
            <button
              type="button"
              className="add-dynamic-image-btn add-dynamic-image-primary"
              onClick={handleBulkUpload}
              title={`Upload one or more images (${images.length}/${effectiveMaxImages})`}
            >+ Upload ({images.length}/{effectiveMaxImages})</button>
            <button
              type="button"
              className="add-dynamic-image-btn add-dynamic-image-secondary"
              onClick={addImage}
              title="Add an empty slot"
            >+ Empty</button>
          </div>
        )}
      </div>
    );
  }, [editMode, updateSlide, toFigmaEmbedUrl]);

  // ========== SPLIT RATIO CONTROL ==========
  // Allows adjusting the width ratio between text and images in split layouts (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const SplitRatioControl = useMemo(() => ({ slide, slideIndex }) => {
    if (!editMode) return null;

    const ratio = slide.splitRatio || 50;

    const handleRatioChange = (newRatio) => {
      updateSlide(slideIndex, { splitRatio: Math.max(20, Math.min(80, newRatio)) });
    };

    const presets = [
      { label: '30/70', value: 30 },
      { label: '40/60', value: 40 },
      { label: '50/50', value: 50 },
      { label: '60/40', value: 60 },
    ];

    return (
      <div className="split-ratio-control">
        <span className="ratio-label">Layout:</span>
        <div className="ratio-presets">
          {presets.map(preset => (
            <button
              key={preset.value}
              className={`ratio-preset ${ratio === preset.value ? 'active' : ''}`}
              onClick={() => handleRatioChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <span className="ratio-value">{ratio}/{100 - ratio}</span>
      </div>
    );
  }, [editMode, updateSlide]);

  // Draggable split divider — renders between the two grid columns
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const SplitDragHandle = useMemo(() => ({ slide, slideIndex }) => {
    if (!editMode) return null;

    const handleDrag = useCallback((e) => {
      e.preventDefault();
      const slideEl = e.target.closest('.slide-split, .slide-intro-layout, .project-showcase-layout');
      if (!slideEl) return;

      const rect = slideEl.getBoundingClientRect();
      const startX = e.clientX;
      const startRatio = slide.splitRatio || 50;

      const onMove = (moveE) => {
        const dx = moveE.clientX - startX;
        const pct = (dx / rect.width) * 100;
        const newRatio = Math.round(Math.max(20, Math.min(80, startRatio + pct)));
        updateSlide(slideIndex, { splitRatio: newRatio });
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }, [slide, slideIndex]);

    return (
      <div
        className="split-drag-handle"
        onMouseDown={handleDrag}
        title="Drag to resize"
        data-no-slide-advance="true"
      >
        <div className="split-drag-line" />
        <div className="split-drag-grip">
          <span /><span /><span />
        </div>
        <div className="split-drag-line" />
      </div>
    );
  }, [editMode, updateSlide]);

  // Title Spacing Control — lets users adjust gap between title and content per slide
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const TitleSpacingControl = useMemo(() => ({ slide, slideIndex }) => {
    if (!editMode) return null;

    const spacing = slide.titleSpacing || 'default';

    const presets = [
      { label: 'Tight', value: 'tight' },
      { label: 'Default', value: 'default' },
      { label: 'Relaxed', value: 'relaxed' },
      { label: 'Loose', value: 'loose' },
    ];

    return (
      <div className="title-spacing-control">
        <span className="spacing-label">Spacing:</span>
        <div className="spacing-presets">
          {presets.map(preset => (
            <button
              key={preset.value}
              className={`spacing-preset ${spacing === preset.value ? 'active' : ''}`}
              onClick={() => updateSlide(slideIndex, { titleSpacing: preset.value })}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [editMode, updateSlide]);

  // Card variant control — per-slide card style (default / minimal / clean) + show/hide numbers
  const CardVariantControl = useMemo(() => ({ slide, slideIndex }) => {
    if (!editMode) return null;
    const variant = slide.cardVariant || 'default';
    const showNumbers = slide.showNumbers !== false;
    const cardHeight = slide.cardHeight || 'auto';
    const options = [
      { label: 'Default', value: 'default' },
      { label: 'Minimal', value: 'minimal' },
      { label: 'Clean', value: 'clean' },
      { label: 'Filled', value: 'filled' },
      { label: 'Soft', value: 'soft' },
      { label: 'Glass', value: 'glass' },
    ];
    const heightOptions = [
      { label: 'Auto', value: 'auto' },
      { label: '100%', value: '100' },
      { label: '75%', value: '75' },
      { label: '50%', value: '50' },
      { label: '25%', value: '25' },
    ];
    return (
      <div className="card-variant-control">
        <span className="spacing-label">Cards:</span>
        <div className="spacing-presets">
          {options.map(opt => (
            <button
              key={opt.value}
              className={`spacing-preset ${variant === opt.value ? 'active' : ''}`}
              onClick={() => updateSlide(slideIndex, { cardVariant: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          className={`spacing-preset ${showNumbers ? 'active' : ''}`}
          onClick={() => updateSlide(slideIndex, { showNumbers: !showNumbers })}
          title={showNumbers ? 'Hide numbers' : 'Show numbers'}
        >
          {showNumbers ? '#' : 'No #'}
        </button>
        <span className="spacing-label">Height:</span>
        <div className="spacing-presets">
          {heightOptions.map(opt => (
            <button
              key={opt.value}
              className={`spacing-preset ${cardHeight === opt.value ? 'active' : ''}`}
              onClick={() => updateSlide(slideIndex, { cardHeight: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [editMode, updateSlide]);

  // Helper to get title spacing CSS variable
  const getTitleSpacingStyle = (slide) => {
    const spacingMap = {
      tight: '0.5rem',
      default: '1rem',
      relaxed: '1.75rem',
      loose: '2.75rem',
    };
    const value = spacingMap[slide.titleSpacing] || spacingMap.default;
    return { '--slide-title-gap': value };
  };

  // Helper to get split grid style based on ratio
  const getSplitStyle = (slide) => {
    const ratio = slide.splitRatio || 50;
    return {
      gridTemplateColumns: `${ratio}fr ${100 - ratio}fr`
    };
  };

  // CTA Editor Component (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const SlideCta = useMemo(() => ({ slide, index }) => {
    const hasCta = slide.cta && (slide.cta.text || slide.cta.link);
    
    if (!editMode && !hasCta) return null;
    
    const toggleCta = () => {
      if (hasCta) {
        updateSlide(index, { cta: null });
      } else {
        updateSlide(index, { cta: { text: 'Learn More', link: '#' } });
      }
    };
    
    if (editMode && !hasCta) {
      return (
        <div className="slide-cta-editor">
          <button className="add-cta-btn" onClick={toggleCta}>
            + Add CTA Button
          </button>
        </div>
      );
    }
    
    return (
      <div className="slide-cta">
        {editMode ? (
          <div className="slide-cta-editor">
            <div className="cta-inputs">
              <input
                type="text"
                className="editable-field"
                placeholder="Button text"
                value={slide.cta?.text || ''}
                onChange={(e) => updateSlide(index, { cta: { ...slide.cta, text: e.target.value } })}
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                className="editable-field"
                placeholder="Link URL"
                value={slide.cta?.link || ''}
                onChange={(e) => updateSlide(index, { cta: { ...slide.cta, link: e.target.value } })}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <button className="remove-cta-btn" onClick={toggleCta}>×</button>
          </div>
        ) : (
          <a href={slide.cta?.link} className="slide-cta-button" target="_blank" rel="noopener noreferrer">
            {slide.cta?.text}
            <span className="cta-arrow">→</span>
          </a>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // Image/video upload handler
  const handleImageUpload = (slideIndex, field = 'image') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/mp4,video/webm,.gif,.svg,image/svg+xml';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const isVideo = file.type.startsWith('video/');
        const isGif = file.type === 'image/gif';
        const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

        // File size limits (in MB)
        const maxVideoSize = 100;
        const maxGifSize = 40;
        const maxImageSize = 10;
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (isVideo && fileSizeMB > maxVideoSize) {
          alert(`Video file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxVideoSize}MB. Please use a smaller video or compress it first.`);
          return;
        }
        if (isGif && fileSizeMB > maxGifSize) {
          alert(`GIF file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxGifSize}MB. Please use a smaller GIF.`);
          return;
        }
        if (!isVideo && !isGif && !isSvg && fileSizeMB > maxImageSize) {
          alert(`Image file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxImageSize}MB.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onerror = () => {
          alert('Error reading file. Please try again.');
        };
        reader.onload = async (event) => {
          try {
            const dataUrl = event.target.result;
            
            // Don't compress videos, GIFs, or SVGs — use as-is
            if (isVideo || isGif || isSvg) {
              updateSlide(slideIndex, { [field]: dataUrl, [`${field}IsVideo`]: isVideo, [`${field}IsGif`]: isGif });
            } else {
              try {
                const compressed = await compressImage(dataUrl);
                updateSlide(slideIndex, { [field]: compressed, [`${field}IsVideo`]: false, [`${field}IsGif`]: false });
              } catch (err) {
                console.error('Error compressing image:', err);
                updateSlide(slideIndex, { [field]: dataUrl, [`${field}IsGif`]: false });
              }
            }
          } catch (err) {
            console.error('Error processing file:', err);
            alert('Error processing file. Please try a smaller file.');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderSlide = (slide, index) => {
    const spacingStyle = getTitleSpacingStyle(slide);
    const titleSpacingControl = <TitleSpacingControl slide={slide} slideIndex={index} />;
    const slideControls = editMode && (
      <div className="slide-edit-controls">
        <button onClick={() => moveSlide(index, -1)} disabled={index === 0}>↑</button>
        <button onClick={() => moveSlide(index, 1)} disabled={index === totalSlides - 1}>↓</button>
        <button onClick={() => {
          // Strip base64 media for readability, keep a placeholder
          const stripForEdit = (obj) => {
            if (typeof obj === 'string' && obj.startsWith('data:')) return '[[MEDIA]]';
            if (Array.isArray(obj)) return obj.map(item => stripForEdit(item));
            if (obj && typeof obj === 'object') {
              const r = {};
              for (const k in obj) r[k] = stripForEdit(obj[k]);
              return r;
            }
            return obj;
          };
          setEditSlideJSON({ index, text: JSON.stringify(stripForEdit(slide), null, 2), originalSlide: slide, error: '' });
        }} className="json-edit" title="Edit slide JSON">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5a2 2 0 002 2h1" />
            <path d="M16 3h1a2 2 0 012 2v5a2 2 0 002 2 2 2 0 00-2 2v5a2 2 0 01-2 2h-1" />
          </svg>
        </button>
        <button onClick={() => deleteSlide(index)} className="delete">×</button>
        <button onClick={() => setShowTemplates(true)} className="add">+</button>
      </div>
    );

    switch (slide.type) {
      case 'intro': {
        // Support dynamic metaItems array; fall back to legacy client/focus fields
        const introMeta = slide.metaItems ?? [
          { label: slide.clientLabel || 'Client', value: slide.client || 'Client Name' },
          { label: slide.focusLabel || 'Focus',   value: slide.focus  || 'Project Focus' },
        ];
        const introHeaderMode = slide.introHeaderMode || 'both'; // 'both' = title + logo at bottom, 'logo' = logo in title position only
        const showTitle = introHeaderMode === 'both';
        const showLogoInTitlePosition = introHeaderMode === 'logo';
        const showLogoAtBottom = introHeaderMode === 'both';

        const introLogoBlock = (wrapperClass = '', imgClass = '') => (slide.logo || editMode) && (
          <div className={`intro-logo ${wrapperClass}`.trim()}>
            <div
              className={`intro-logo-img ${imgClass} ${!slide.logo ? 'intro-logo-empty' : ''}`.trim()}
              onClick={() => editMode && handleImageUpload(index, 'logo')}
              role={editMode ? 'button' : undefined}
              tabIndex={editMode ? 0 : undefined}
              onKeyDown={editMode ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageUpload(index, 'logo'); } } : undefined}
            >
              {slide.logo ? (
                <>
                  <img src={slide.logo} alt="Logo" />
                  {editMode && (
                    <span className="image-edit-overlay">Edit</span>
                  )}
                </>
              ) : (
                <span className="intro-logo-placeholder">{editMode ? 'Click to add logo' : ''}</span>
              )}
            </div>
            {editMode && slide.logo && (
              <button
                type="button"
                className="intro-remove-btn"
                onClick={(e) => { e.stopPropagation(); updateSlide(index, { logo: '' }); }}
              >
                × Remove logo
              </button>
            )}
          </div>
        );

        return (
          <div className="slide slide-intro" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-intro-layout" style={getSplitStyle(slide)}>

              {/* ── Left: content ── */}
              <div className="intro-content">

                {/* Header mode: Title + Logo (logo at bottom) | Logo only (logo in title position) */}
                {editMode && (
                  <div className="intro-header-mode-control">
                    <span className="intro-header-mode-label">Header:</span>
                    <button
                      type="button"
                      className={`intro-header-mode-btn ${introHeaderMode === 'both' ? 'active' : ''}`}
                      onClick={() => updateSlide(index, { introHeaderMode: 'both' })}
                      title="Show title with logo at bottom"
                    >
                      Title + Logo
                    </button>
                    <button
                      type="button"
                      className={`intro-header-mode-btn ${introHeaderMode === 'logo' ? 'active' : ''}`}
                      onClick={() => updateSlide(index, { introHeaderMode: 'logo' })}
                      title="Show only logo in title position"
                    >
                      Logo only
                    </button>
                  </div>
                )}

                {/* Label */}
                <OptionalField slide={slide} index={index} field="label" label="Label" defaultValue="Case study">
                  <span className="intro-label slide-label">
                    <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                  </span>
                </OptionalField>

                {/* Title (Title + Logo mode only) */}
                {showTitle && (
                  <h1 className="intro-title">
                    <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
                  </h1>
                )}

                {/* Logo + Subtitle in one group */}
                <div className="intro-logo-subtitle-group">
                  {showLogoInTitlePosition && introLogoBlock('intro-logo-in-title-position', 'intro-logo-img-title-size')}
                  <OptionalField slide={slide} index={index} field="subtitle" label="Subtitle / Tagline" defaultValue="A short tagline for this project">
                    <p className="intro-subtitle">
                      <EditableField value={slide.subtitle} onChange={(v) => updateSlide(index, { subtitle: v })} />
                    </p>
                  </OptionalField>
                  {showLogoAtBottom && introLogoBlock('intro-logo-at-bottom', '')}
                </div>

                {/* Description — body paragraph */}
                <OptionalField slide={slide} index={index} field="description" label="Description" defaultValue="Brief project description goes here.">
                  <p className="intro-description">
                    <EditableField value={slide.description} onChange={(v) => updateSlide(index, { description: v })} multiline />
                  </p>
                </OptionalField>

                {/* CTA Button — placed above meta row so it's out of the bottom nav hover zone */}
                {slide.cta ? (
                  <div className="info-cta-wrapper">
                    {editMode ? (
                      <div className="info-cta-edit-row">
                        <span className="info-cta-button info-cta-preview">
                          <EditableField
                            value={slide.cta.label}
                            onChange={(v) => updateSlide(index, { cta: { ...slide.cta, label: v } })}
                          />
                        </span>
                        <input
                          type="text"
                          className="info-cta-url-input"
                          value={slide.cta.url || ''}
                          onChange={(e) => updateSlide(index, { cta: { ...slide.cta, url: e.target.value } })}
                          placeholder="https://example.com"
                        />
                        <button
                          className="remove-item-btn"
                          onClick={() => updateSlide(index, { cta: null })}
                          title="Remove CTA"
                        >×</button>
                      </div>
                    ) : (
                      <AnimatedButton
                        href={normalizeExternalUrl(slide.cta.url) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        icon="→"
                      >
                        {slide.cta.label || 'View Project'}
                      </AnimatedButton>
                    )}
                  </div>
                ) : editMode ? (
                  <button
                    className="add-field-btn"
                    onClick={() => updateSlide(index, { cta: { label: 'View Project', url: '' } })}
                  >
                    + Add CTA Button
                  </button>
                ) : null}

                {/* Dynamic meta row */}
                <div className="intro-meta-row">
                  {introMeta.map((item, i) => (
                    <div key={i} className="intro-meta-item">
                      {editMode && (
                        <ArrayItemControls onRemove={() => {
                          const next = [...introMeta];
                          next.splice(i, 1);
                          updateSlide(index, { metaItems: next });
                        }} />
                      )}
                      <span className="intro-meta-label">
                        <EditableField
                          value={item.label}
                          onChange={(v) => {
                            const next = [...introMeta];
                            next[i] = { ...next[i], label: v };
                            updateSlide(index, { metaItems: next });
                          }}
                        />
                      </span>
                      <span className="intro-meta-value">
                        <EditableField
                          value={item.value}
                          onChange={(v) => {
                            const next = [...introMeta];
                            next[i] = { ...next[i], value: v };
                            updateSlide(index, { metaItems: next });
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
                <AddItemButton
                  onClick={() => updateSlide(index, { metaItems: [...introMeta, { label: 'Label', value: 'Value' }] })}
                  label="Meta Item"
                />

              </div>

              <SplitDragHandle slide={slide} slideIndex={index} />

              {/* ── Right: cover image ── */}
              <DynamicImages slide={slide} slideIndex={index} field="image" className="intro-images-wrapper" />

            </div>
          </div>
        );
      }
      
      case 'info':
        return (
          <div className="slide slide-info" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <OptionalField slide={slide} index={index} field="label" label="Section Label" defaultValue="Project info">
                <span className="slide-label">
                  <EditableField
                    value={slide.label}
                    onChange={(v) => updateSlide(index, { label: v })}
                  />
                </span>
              </OptionalField>
              <h2 className="info-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                  allowLineBreaks
                />
              </h2>
              {slide.items?.length > 0 && (
              <div className="info-grid">
                {slide.items.map((item, i) => (
                  <div key={i} className="info-item">
                      <span className="info-label">
                        <EditableField
                          value={item.label}
                          onChange={(v) => updateSlideItem(index, 'items', i, { ...item, label: v })}
                        />
                      </span>
                      <span className="info-value">
                        <EditableField
                          value={item.value}
                          onChange={(v) => updateSlideItem(index, 'items', i, { ...item, value: v })}
                        />
                      </span>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'items', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton
                onClick={() => addArrayItem(index, 'items', { label: 'Label', value: 'Value' })}
                label="Info Item"
              />

              {/* CTA Button — placed above bullets/highlight so it's out of the bottom nav hover zone */}
              {slide.cta ? (
                <div className="info-cta-wrapper">
                  {editMode ? (
                    <div className="info-cta-edit-row">
                      <span className="info-cta-button info-cta-preview">
                        <EditableField
                          value={slide.cta.label}
                          onChange={(v) => updateSlide(index, { cta: { ...slide.cta, label: v } })}
                        />
                      </span>
                      <input
                        type="text"
                        className="info-cta-url-input"
                        value={slide.cta.url || ''}
                        onChange={(e) => updateSlide(index, { cta: { ...slide.cta, url: e.target.value } })}
                        placeholder="https://example.com"
                      />
                      <button
                        className="remove-item-btn"
                        onClick={() => updateSlide(index, { cta: null })}
                        title="Remove CTA"
                      >×</button>
                    </div>
                  ) : (
                    <AnimatedButton
                      href={normalizeExternalUrl(slide.cta.url) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      icon="→"
                    >
                      {slide.cta.label || 'View Project'}
                    </AnimatedButton>
                  )}
                </div>
              ) : editMode ? (
                <button
                  className="add-field-btn"
                  onClick={() => updateSlide(index, { cta: { label: 'View Project', url: '' } })}
                >
                  + Add CTA Button
                </button>
              ) : null}

              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="info-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="info-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'media':
      case 'image':
        return (
          <div className="slide slide-image" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <OptionalField slide={slide} index={index} field="label" label="Label" defaultValue="Section Label">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
              </OptionalField>
              <div className="media-content">
                <OptionalField slide={slide} index={index} field="title" label="Title" defaultValue="Image Title">
                  <h2 className="image-title">
                    <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
                  </h2>
                </OptionalField>
                <DynamicImages slide={slide} slideIndex={index} field="image" captionField="caption" className="image-gallery-wrapper" />
              </div>
            </div>
          </div>
        );

      case 'projectShowcase':
        return (
          <div className="slide slide-project-showcase" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner">
              <div className="project-showcase-layout" style={getSplitStyle(slide)}>
                {/* Left Panel - Info (centered vertically when no number) */}
                <div className={`project-showcase-info${!slide.slideNumber ? ' project-showcase-info--no-number' : ''}`}>
                  {(slide.slideNumber || editMode) && (
                    <div className="project-showcase-number-wrapper">
                      {slide.slideNumber ? (
                        <div className="project-showcase-number">
                          <EditableField
                            value={slide.slideNumber}
                            onChange={(v) => updateSlide(index, { slideNumber: v })}
                          />
                        </div>
                      ) : null}
                      {editMode && (
                        <button
                          className="toggle-number-btn"
                          onClick={() => updateSlide(index, { slideNumber: slide.slideNumber ? '' : '01' })}
                        >
                          {slide.slideNumber ? '× Remove' : '+ Add Number'}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Header mode: Title only | Logo only (logo in title position) | Title + Logo */}
                  {editMode && (
                    <div className="project-showcase-header-mode">
                      <span className="project-showcase-header-mode-label">Header:</span>
                      <div className="project-showcase-header-mode-btns">
                        <button
                          type="button"
                          className={`header-mode-btn ${(slide.projectShowcaseHeader || 'both') === 'title' ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { projectShowcaseHeader: 'title' })}
                          title="Show title only"
                        >
                          Title only
                        </button>
                        <button
                          type="button"
                          className={`header-mode-btn ${(slide.projectShowcaseHeader || 'both') === 'logo' ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { projectShowcaseHeader: 'logo' })}
                          title="Show logo in title position (instead of title)"
                        >
                          Logo only
                        </button>
                        <button
                          type="button"
                          className={`header-mode-btn ${(slide.projectShowcaseHeader || 'both') === 'both' ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { projectShowcaseHeader: 'both' })}
                          title="Show title and logo (title on top, logo below)"
                        >
                          Title + Logo
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Logo in title position (when "Logo only" is selected) */}
                  {(slide.projectShowcaseHeader || 'both') === 'logo' && (slide.logo || editMode) && (
                    <div className="project-showcase-logo project-showcase-logo-in-title-position">
                      <div
                        className="project-logo-wrapper"
                        onClick={() => editMode && handleImageUpload(index, 'logo')}
                      >
                        {slide.logo ? (
                          <>
                            <img src={slide.logo} alt="Logo" />
                            {editMode && <div className="image-edit-overlay">Click to change</div>}
                          </>
                        ) : (
                          <div className="image-placeholder">{editMode ? 'Click to add logo' : ''}</div>
                        )}
                      </div>
                      {editMode && slide.logo && (
                        <button
                          type="button"
                          className="remove-logo-btn project-showcase-remove-logo"
                          onClick={(e) => { e.stopPropagation(); updateSlide(index, { logo: '' }); }}
                        >
                          × Remove logo
                        </button>
                      )}
                    </div>
                  )}
                  {((slide.projectShowcaseHeader || 'both') === 'both' || (slide.projectShowcaseHeader || 'both') === 'title') && (slide.title || editMode) && (
                    <h2 className="project-showcase-title">
                      <EditableField
                        value={slide.title}
                        onChange={(v) => updateSlide(index, { title: v })}
                        allowLineBreaks
                      />
                      {editMode && slide.title && (
                        <button
                          type="button"
                          className="remove-title-btn project-showcase-remove-title"
                          onClick={() => updateSlide(index, { title: '' })}
                          title="Remove title"
                        >
                          × Remove title
                        </button>
                      )}
                    </h2>
                  )}
                  {(slide.subtitle || editMode) && (
                    <p className="project-showcase-subtitle">
                      <EditableField
                        value={slide.subtitle || ''}
                        onChange={(v) => updateSlide(index, { subtitle: v })}
                      />
                      {editMode && (
                        <button
                          type="button"
                          className="toggle-subtitle-btn"
                          onClick={() => updateSlide(index, { subtitle: slide.subtitle ? '' : 'Add a subtitle' })}
                        >
                          {slide.subtitle ? '× Remove subtitle' : '+ Add subtitle'}
                        </button>
                      )}
                    </p>
                  )}
                  <OptionalField slide={slide} index={index} field="description" label="Description" defaultValue="Brief description of the project." multiline>
                    <p className="project-showcase-description">
                      <EditableField
                        value={slide.description}
                        onChange={(v) => updateSlide(index, { description: v })}
                        multiline
                      />
                    </p>
                  </OptionalField>
                  <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="project-showcase-bullets" label="Bullet" />
                  {(slide.tags?.length > 0 || editMode) && (
                    <div className="project-showcase-tags">
                      {(slide.tags || []).map((tag, i) => (
                        <span key={i} className="project-showcase-tag">
                          <EditableField
                            value={tag}
                            onChange={(v) => {
                              const tags = [...(slide.tags || [])];
                              tags[i] = v;
                              updateSlide(index, { tags });
                            }}
                          />
                          {editMode && slide.tags.length > 1 && (
                            <button
                              className="remove-tag-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const tags = slide.tags.filter((_, idx) => idx !== i);
                                updateSlide(index, { tags });
                              }}
                            >
                              ×
                            </button>
                          )}
                          {i < slide.tags.length - 1 && <span className="tag-separator"> • </span>}
                        </span>
                      ))}
                      {editMode && (
                        <button
                          className="add-tag-btn"
                          onClick={() => {
                            const tags = [...(slide.tags || []), 'New Tag'];
                            updateSlide(index, { tags });
                          }}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}
                  {/* Logo at bottom (when "Title + Logo" is selected) */}
                  {(slide.projectShowcaseHeader || 'both') === 'both' && (slide.logo || editMode) && (
                    <div className="project-showcase-logo">
                      <div
                        className="project-logo-wrapper"
                        onClick={() => editMode && handleImageUpload(index, 'logo')}
                      >
                        {slide.logo ? (
                          <>
                            <img src={slide.logo} alt="Logo" />
                            {editMode && <div className="image-edit-overlay">Click to change</div>}
                          </>
                        ) : (
                          <div className="image-placeholder">{editMode ? 'Click to add logo' : ''}</div>
                        )}
                      </div>
                      {editMode && slide.logo && (
                        <button
                          type="button"
                          className="remove-logo-btn project-showcase-remove-logo"
                          onClick={(e) => { e.stopPropagation(); updateSlide(index, { logo: '' }); }}
                        >
                          × Remove logo
                        </button>
                      )}
                    </div>
                  )}
                  <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                    <div className="project-showcase-highlight">
                      <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                    </div>
                  </OptionalField>
                </div>
                <SplitDragHandle slide={slide} slideIndex={index} />
                {/* Right Panel - Image with highlight-style wrapper */}
                <div className="project-showcase-visual">
                  <div className="project-showcase-image-highlight-wrapper">
                    <DynamicImages slide={slide} slideIndex={index} field="image" className="project-showcase-dynamic" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stats':
      case 'results':
        return (
          <div className={`slide slide-stats ${slide.type === 'results' ? 'results' : ''}`} key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="stats-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                  allowLineBreaks
                />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="stats-description-wrapper" maxParagraphs={3} optional />
              {editMode && (
                <div className="grid-layout-control">
                  <span className="grid-control-label">Grid Columns:</span>
                  <div className="grid-control-buttons">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        className={`grid-col-btn ${(slide.gridColumns || 3) === cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: cols })}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slide.stats?.length > 0 && (
              <div className="stats-grid" style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 3}, 1fr)` }}>
                {slide.stats.map((stat, i) => (
                  <div key={i} className="stat-item">
                    <span className="stat-value" style={{ '--color': project.color }}>
                        <EditableField
                          value={stat.value}
                          onChange={(v) => updateSlideItem(index, 'stats', i, { ...stat, value: v })}
                        />
                      {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                    </span>
                      <span className="stat-label">
                        <EditableField
                          value={stat.label}
                          onChange={(v) => updateSlideItem(index, 'stats', i, { ...stat, label: v })}
                        />
                      </span>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'stats', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'stats', { value: '0%', label: 'New metric' })}
                label="Stat"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="stats-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'context':
      case 'problem':
      case 'testing':
      case 'feature':
      case 'textAndImage':
        // Unified with comparison — ComparisonSlide handles both simple and before/after modes
        return (
          <ComparisonSlide
            key={index}
            slide={slide}
            index={index}
            slideControls={slideControls}
            editMode={editMode}
            updateSlide={updateSlide}
            OptionalField={OptionalField}
            DynamicImages={DynamicImages}
            DynamicBullets={DynamicBullets}
            DynamicContent={DynamicContent}
            SplitRatioControl={SplitRatioControl}
            SplitDragHandle={SplitDragHandle}
            setLightboxImage={setLightboxImage}
            spacingStyle={spacingStyle}
            titleSpacingControl={titleSpacingControl}
          />
        );

      case 'quotes':
        return (
          <div className="slide slide-quotes" key={index} style={spacingStyle} data-card-variant={slide.cardVariant || 'default'} data-card-height={slide.cardHeight || 'auto'}>
            {slideControls}
            {titleSpacingControl}
            <CardVariantControl slide={slide} slideIndex={index} />
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="quotes-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                  allowLineBreaks
                />
              </h2>
              <OptionalField slide={slide} index={index} field="content" label="Description" defaultValue="Add description..." multiline>
                <p className="quotes-intro">
                  <EditableField
                    value={slide.content}
                    onChange={(v) => updateSlide(index, { content: v })}
                    multiline
                  />
                </p>
              </OptionalField>
              {/* Grid Layout Control */}
              {editMode && (
                <div className="grid-layout-control">
                  <span className="grid-control-label">Grid Columns:</span>
                  <div className="grid-control-buttons">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        className={`grid-col-btn ${(slide.gridColumns || 3) === cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: cols })}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slide.quotes?.length > 0 && (
              <div className="quotes-grid" style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 3}, 1fr)` }}>
                {slide.quotes.map((quote, i) => (
                  <div key={i} className="quote-card">
                      <p className="quote-text">
                        "<EditableField
                          value={quote.text}
                          onChange={(v) => updateSlideItem(index, 'quotes', i, { ...quote, text: v })}
                        />"
                      </p>
                      <span className="quote-author">
                        <EditableField
                          value={quote.author}
                          onChange={(v) => updateSlideItem(index, 'quotes', i, { ...quote, author: v })}
                        />
                      </span>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'quotes', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'quotes', { text: 'New quote...', author: 'User Name' })}
                label="Quote"
              />
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="quotes-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="quotes-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className={`slide slide-goals ${(slide.showGoalsSection === false || slide.showKpisSection === false || !slide.goals?.length || !slide.kpis?.length) ? 'goals-single-section' : ''}`} key={index} style={spacingStyle} data-card-variant={slide.cardVariant || 'default'} data-card-height={slide.cardHeight || 'auto'}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <div className="goals-content">
                <span className="slide-label">
                  <EditableField
                    value={slide.label}
                    onChange={(v) => updateSlide(index, { label: v })}
                  />
                </span>
                <h2 className="goals-title">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                    allowLineBreaks
                  />
                </h2>
                <DynamicContent slide={slide} slideIndex={index} field="description" className="goals-description-wrapper" maxParagraphs={3} optional />
                
                {/* Grid Layout Control */}
                {editMode && (
                  <div className="grid-layout-control">
                    <span className="grid-control-label">Grid Columns:</span>
                    <div className="grid-control-buttons">
                      {[1, 2, 3, 4].map(cols => (
                        <button
                          key={cols}
                          className={`grid-col-btn ${(slide.gridColumns || 2) === cols ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { gridColumns: cols })}
                        >
                          {cols}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Goals cards section - can be removed in edit mode */}
                {slide.showGoalsSection !== false ? (
                  <div className="goals-cards-section-wrapper">
                    {editMode && (
                      <button
                        type="button"
                        className="remove-section-btn remove-goals-section-btn"
                        onClick={() => updateSlide(index, { showGoalsSection: false })}
                        title="Remove goals section"
                      >
                        ×
                      </button>
                    )}
                    <div className="goals-cards-section" data-card-variant={slide.goalsCardVariant || slide.cardVariant || 'default'}>
                      {editMode && (
                        <div className="section-variant-control">
                          <span className="grid-control-label">Goals style:</span>
                          <div className="grid-control-buttons">
                            {['default', 'minimal', 'clean', 'filled', 'soft', 'glass'].map(v => (
                              <button
                                key={v}
                                className={`grid-col-btn ${(slide.goalsCardVariant || slide.cardVariant || 'default') === v ? 'active' : ''}`}
                                onClick={() => updateSlide(index, { goalsCardVariant: v })}
                              >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {(editMode || (slide.goalsCardsTitle != null && String(slide.goalsCardsTitle).trim() !== '')) && (
                        <span className="kpis-label goals-cards-label">
                          <EditableField
                            value={slide.goalsCardsTitle ?? ''}
                            onChange={(v) => updateSlide(index, { goalsCardsTitle: v })}
                            placeholder="Goals"
                          />
                        </span>
                      )}
                      {slide.goals?.length > 0 && (
                        <div
                          className="goals-grid"
                          style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 2}, 1fr)` }}
                        >
                        {slide.goals.map((goal, i) => (
                          <div key={i} className="goal-item">
                            {slide.showNumbers !== false && <span className="goal-number">{i + 1}</span>}
                            <div className="goal-content">
                              <span className="goal-title-text">
                                <EditableField
                                  value={goal.title}
                                  onChange={(v) => updateSlideItem(index, 'goals', i, { ...goal, title: v })}
                                />
                              </span>
                              {(goal.description || editMode) && (
                                <span className="goal-description">
                                  <EditableField
                                    value={goal.description || ''}
                                    onChange={(v) => updateSlideItem(index, 'goals', i, { ...goal, description: v })}
                                  />
                                </span>
                              )}
                            </div>
                            <ArrayItemControls onRemove={() => removeArrayItem(index, 'goals', i)} />
                          </div>
                        ))}
                        </div>
                      )}
                    </div>
                    <AddItemButton
                      onClick={() => addArrayItem(index, 'goals', { number: String(slide.goals?.length + 1 || 1), title: 'New Goal', description: '' })}
                      label="Goal"
                    />
                  </div>
                ) : editMode ? (
                  <button
                    type="button"
                    className="add-section-btn add-goals-section-btn"
                    onClick={() => updateSlide(index, { showGoalsSection: true })}
                  >
                    + Add goals section
                  </button>
                ) : null}

                {/* KPIs section - can be removed in edit mode */}
                {slide.showKpisSection !== false ? (
                  <div className="kpis-section-wrapper">
                    {editMode && (
                      <button
                        type="button"
                        className="remove-section-btn remove-kpis-section-btn"
                        onClick={() => updateSlide(index, { showKpisSection: false })}
                        title="Remove KPIs section"
                      >
                        ×
                      </button>
                    )}
                    {editMode && (
                      <div className="grid-layout-control">
                        <span className="grid-control-label">KPIs grid:</span>
                        <div className="grid-control-buttons">
                          {[1, 2, 3, 4].map(cols => (
                            <button
                              key={cols}
                              className={`grid-col-btn ${(slide.kpisGridColumns ?? 3) === cols ? 'active' : ''}`}
                              onClick={() => updateSlide(index, { kpisGridColumns: cols })}
                            >
                              {cols}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {editMode && (
                      <div className="section-variant-control">
                        <span className="grid-control-label">KPIs style:</span>
                        <div className="grid-control-buttons">
                          {['default', 'minimal', 'clean', 'filled', 'soft', 'glass'].map(v => (
                            <button
                              key={v}
                              className={`grid-col-btn ${(slide.kpisCardVariant || slide.cardVariant || 'default') === v ? 'active' : ''}`}
                              onClick={() => updateSlide(index, { kpisCardVariant: v })}
                            >
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {slide.kpis?.length > 0 && (
                      <div className="kpis-section" data-card-variant={slide.kpisCardVariant || slide.cardVariant || 'default'}>
                        <span className="kpis-label">KPIs</span>
                        <div
                          className="kpis-grid"
                          style={{ ['--kpis-cols']: slide.kpisGridColumns ?? 3 }}
                        >
                          {slide.kpis.map((kpi, i) => {
                            const isObj = typeof kpi === 'object' && kpi !== null;
                            const kpiText = isObj ? kpi.text : kpi;
                            const kpiDesc = isObj ? kpi.description : '';
                            return (
                              <div key={i} className="kpi-card">
                                <EditableField
                                  value={kpiText || ''}
                                  onChange={(v) => updateSlideItem(index, 'kpis', i, isObj ? { ...kpi, text: v } : v)}
                                />
                                {(kpiDesc || editMode) && (
                                  <span className="kpi-card-desc">
                                    <EditableField
                                      value={kpiDesc || ''}
                                      onChange={(v) => {
                                        const obj = isObj ? { ...kpi, description: v } : { text: kpiText, description: v };
                                        updateSlideItem(index, 'kpis', i, obj);
                                      }}
                                      placeholder="Description (optional)"
                                    />
                                  </span>
                                )}
                                <ArrayItemControls onRemove={() => removeArrayItem(index, 'kpis', i)} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <AddItemButton
                      onClick={() => addArrayItem(index, 'kpis', 'New KPI')}
                      label="KPI"
                    />
                  </div>
                ) : editMode ? (
                  <button
                    type="button"
                    className="add-section-btn add-kpis-section-btn"
                    onClick={() => updateSlide(index, { showKpisSection: true })}
                  >
                    + Add KPIs section
                  </button>
                ) : null}
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                  <div className="goals-highlight">
                    <EditableField
                      value={slide.highlight}
                      onChange={(v) => updateSlide(index, { highlight: v })}
                      multiline
                    />
                  </div>
                </OptionalField>
              </div>
            </div>
          </div>
        );

      case 'outcomes':
        return (
          <div className="slide slide-outcomes" key={index} style={spacingStyle} data-card-variant={slide.cardVariant || 'default'} data-card-height={slide.cardHeight || 'auto'}>
            {slideControls}
            {titleSpacingControl}
            <CardVariantControl slide={slide} slideIndex={index} />
            {editMode && (
              <div className="outcomes-toggle-row">
                <label className="outcomes-toggle-label">
                  <input type="checkbox" checked={slide.showNumbers !== false} onChange={(e) => updateSlide(index, { showNumbers: e.target.checked })} />
                  Show numbers
                </label>
              </div>
            )}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="outcomes-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                  allowLineBreaks
                />
              </h2>
              {editMode && (
                <div className="grid-layout-control">
                  <span className="grid-control-label">Grid Columns:</span>
                  <div className="grid-control-buttons">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        className={`grid-col-btn ${(slide.gridColumns || 2) === cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: cols })}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slide.outcomes?.length > 0 && (
              <div className="outcomes-grid" style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 2}, 1fr)` }}>
                {slide.outcomes.map((outcome, i) => (
                  <div key={i} className="outcome-item">
                      {slide.showNumbers !== false && <div className="outcome-number">{String(i + 1).padStart(2, '0')}</div>}
                      {(outcome.metric || editMode) && (
                        <div className="outcome-metric">
                          <EditableField
                            value={outcome.metric || ''}
                            onChange={(v) => updateSlideItem(index, 'outcomes', i, { ...outcome, metric: v })}
                            placeholder="e.g. 40% or 3x"
                          />
                        </div>
                      )}
                      <h3 className="outcome-title">
                        <EditableField
                          value={outcome.title}
                          onChange={(v) => updateSlideItem(index, 'outcomes', i, { ...outcome, title: v })}
                        />
                      </h3>
                      {(outcome.description || editMode) && (
                        <p className="outcome-description">
                          <EditableField
                            value={outcome.description || ''}
                            onChange={(v) => updateSlideItem(index, 'outcomes', i, { ...outcome, description: v })}
                            multiline
                          />
                        </p>
                      )}
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'outcomes', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'outcomes', { title: 'New Outcome', description: '' })}
                label="Outcome"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="outcomes-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
            </div>
          </div>
        );
      
      case 'end':
        return (
          <div className="slide slide-end" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <div className="end-headline">
                <h2 className="end-title">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                  />
                </h2>
                <p className="end-subtitle">
                  <EditableField
                    value={slide.subtitle}
                    onChange={(v) => updateSlide(index, { subtitle: v })}
                  />
                </p>
                {(() => {
                  // Next project mirrors the home page project order, so
                  // reordering on Home automatically changes what comes next.
                  const items = content?.projects?.items || [];
                  const removedIds = content?.projects?.removedIds || [];
                  const ordered = items.filter(p => !removedIds.includes(p.id));
                  const curIdx = ordered.findIndex(p => p.id === projectId);
                  const next = ordered.length > 0
                    ? ordered[((curIdx >= 0 ? curIdx : -1) + 1 + ordered.length) % ordered.length]
                    : null;
                  // Client-side nav keeps the CaseStudy mounted so the
                  // `case-study-active` body class stays on — without it the
                  // footer would flash during the route transition.
                  //
                  // Resetting slide index + swapping in the next project's
                  // sync data before `navigate()` avoids the flash of the
                  // current project's end slide (currentSlide persists
                  // across route param changes because the component
                  // doesn't unmount).
                  const go = (to) => (e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                    e.preventDefault();
                    if (to.startsWith('/project/')) {
                      const nextId = to.slice('/project/'.length);
                      const data = getCaseStudyData(nextId);
                      if (data) setProject(migrateCaseStudyImagePathsToWebp(data));
                      /* Remount the slide track on project switch so it starts
                         at x=0 with no tween from the previous end position. */
                      setProjectNonce(n => n + 1);
                    }
                    setCurrentSlide(0);
                    navigate(to);
                  };
                  const nextHref = next ? `/project/${next.id}` : '/';
                  return (
                    <div className="end-cta-group">
                      <AnimatedButton
                        href={nextHref}
                        onClick={go(nextHref)}
                        variant="primary"
                        icon="→"
                      >
                        Next project
                      </AnimatedButton>
                      <AnimatedButton
                        href="/"
                        onClick={go('/')}
                        variant="outline"
                        icon="←"
                      >
                        Back to home
                      </AnimatedButton>
                    </div>
                  );
                })()}
              </div>
              {(() => {
                // Fallback pattern: when a slide-level contact field is undefined
                // (existing slides that predate the defaults), fall back to the
                // site-wide contactDefaults. Explicit empty string keeps the
                // "cleared → hidden" behavior, so removing a field per slide
                // still works. To add back, user sets it back to the default
                // (or any value) via the edit field.
                const effEmail = slide.email ?? contactDefaults.email;
                const effPhone = slide.phone ?? contactDefaults.phone;
                const effLinkedin = slide.linkedinUrl ?? contactDefaults.linkedinUrl;
                return (
                  <div className="end-contact-info">
                    {(effEmail || editMode) && (
                      <a href={effEmail ? `mailto:${effEmail}` : undefined} className="end-contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
                        <span className="end-contact-value">
                          <EditableField value={effEmail} onChange={(v) => updateSlide(index, { email: v })} placeholder="your@email.com" />
                        </span>
                      </a>
                    )}
                    {(effPhone || editMode) && (
                      <a href={effPhone ? `tel:${effPhone.replace(/\s/g, '')}` : undefined} className="end-contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                        <span className="end-contact-value">
                          <EditableField value={effPhone} onChange={(v) => updateSlide(index, { phone: v })} placeholder="+1 234 567 890" />
                        </span>
                      </a>
                    )}
                    {(effLinkedin || editMode) && (
                      <a href={effLinkedin || undefined} target="_blank" rel="noopener noreferrer" className="end-contact-item end-contact-linkedin">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span className="end-contact-value">
                          {/* View mode shows the clean "LinkedIn" label; edit mode
                              exposes the URL for editing. */}
                          {editMode ? (
                            <EditableField value={effLinkedin} onChange={(v) => updateSlide(index, { linkedinUrl: v })} placeholder="https://linkedin.com/in/yourname" />
                          ) : (
                            'LinkedIn'
                          )}
                        </span>
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        );

      // === NEW SLIDE TYPES ===
      
      case 'comparison':
        return (
          <ComparisonSlide
            key={index}
            slide={slide}
            index={index}
            slideControls={slideControls}
            editMode={editMode}
            updateSlide={updateSlide}
            OptionalField={OptionalField}
            DynamicImages={DynamicImages}
            DynamicBullets={DynamicBullets}
            DynamicContent={DynamicContent}
            SplitRatioControl={SplitRatioControl}
            SplitDragHandle={SplitDragHandle}
            setLightboxImage={setLightboxImage}
            spacingStyle={spacingStyle}
            titleSpacingControl={titleSpacingControl}
          />
        );

      case 'process':
        return (
          <div className="slide slide-process" key={index} style={spacingStyle} data-card-variant={slide.cardVariant || 'default'} data-card-height={slide.cardHeight || 'auto'}>
            {slideControls}
            {titleSpacingControl}
            <CardVariantControl slide={slide} slideIndex={index} />
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="process-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
              </h2>
              <div className="process-steps">
                {slide.steps?.map((step, i) => (
                  <div key={i} className="process-step">
                    {slide.showNumbers !== false && <span className="step-number">{step.number}</span>}
                    <div className="step-content">
                      <h3 className="step-title">
                        <EditableField value={step.title} onChange={(v) => updateSlideItem(index, 'steps', i, { ...step, title: v })} />
                      </h3>
                      <p className="step-description">
                        <EditableField value={step.description} onChange={(v) => updateSlideItem(index, 'steps', i, { ...step, description: v })} multiline />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <AddItemButton 
                onClick={() => addArrayItem(index, 'steps', { number: String((slide.steps?.length || 0) + 1), title: 'New Step', description: '' })}
                label="Step"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="process-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="slide slide-timeline" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="timeline-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
              </h2>
              <div className="timeline-events">
                {slide.events?.map((event, i) => (
                  <div key={i} className="timeline-event">
                    <span className="event-date">
                      <EditableField value={event.date} onChange={(v) => updateSlideItem(index, 'events', i, { ...event, date: v })} />
                    </span>
                    <div className="event-content">
                      <h3><EditableField value={event.title} onChange={(v) => updateSlideItem(index, 'events', i, { ...event, title: v })} /></h3>
                      <p><EditableField value={event.description} onChange={(v) => updateSlideItem(index, 'events', i, { ...event, description: v })} /></p>
                    </div>
                    <ArrayItemControls onRemove={() => removeArrayItem(index, 'events', i)} />
                  </div>
                ))}
              </div>
              <AddItemButton 
                onClick={() => addArrayItem(index, 'events', { date: 'Date', title: 'Event Title', description: '' })}
                label="Event"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="timeline-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="slide slide-testimonial" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <OptionalField slide={slide} index={index} field="label" label="Section Label" defaultValue="Testimonial">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
              </OptionalField>
              <blockquote className="testimonial-quote">
                "<EditableField value={slide.quote} onChange={(v) => updateSlide(index, { quote: v })} multiline />"
              </blockquote>
              <div className="testimonial-author">
                <span className="author-name">
                  <EditableField value={slide.author} onChange={(v) => updateSlide(index, { author: v })} />
                </span>
                <span className="author-role">
                  <EditableField value={slide.role} onChange={(v) => updateSlide(index, { role: v })} />
                </span>
              </div>
              <OptionalField slide={slide} index={index} field="context" label="Context" defaultValue="Add context..." multiline>
                <p className="testimonial-context">
                  <EditableField value={slide.context} onChange={(v) => updateSlide(index, { context: v })} multiline />
                </p>
              </OptionalField>
            </div>
          </div>
        );

      case 'tools':
        return (
          <div className="slide slide-tools" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="tools-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
              </h2>
              <div className="tools-grid">
                {slide.tools?.map((tool, i) => (
                  <div key={i} className="tool-item">
                    <h3><EditableField value={tool.name} onChange={(v) => updateSlideItem(index, 'tools', i, { ...tool, name: v })} /></h3>
                    <p><EditableField value={tool.description} onChange={(v) => updateSlideItem(index, 'tools', i, { ...tool, description: v })} /></p>
                    <ArrayItemControls onRemove={() => removeArrayItem(index, 'tools', i)} />
                  </div>
                ))}
              </div>
              <AddItemButton 
                onClick={() => addArrayItem(index, 'tools', { name: 'New Tool', description: 'Description' })}
                label="Tool"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="tools-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      // === ISSUES BREAKDOWN - "what started to break" style ===
      case 'issuesBreakdown':
        return (
          <div className="slide slide-issues-breakdown" key={index} style={spacingStyle} data-card-variant={slide.cardVariant || 'default'} data-card-height={slide.cardHeight || 'auto'}>
            {slideControls}
            {titleSpacingControl}
            <CardVariantControl slide={slide} slideIndex={index} />
            <div className="slide-inner">
              <div className="issues-breakdown-content">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
                <h2 className="issues-breakdown-title">
                  <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
                </h2>
                {/* Optional subtitle */}
                {(slide.subtitle != null && slide.subtitle !== '' || editMode) && (
                  <div className="issues-breakdown-subtitle-wrapper">
                    <h3 className="issues-breakdown-subtitle">
                      <EditableField value={slide.subtitle || ''} onChange={(v) => updateSlide(index, { subtitle: v })} placeholder="Subtitle (optional)" />
                    </h3>
                    {editMode && (
                      <button type="button" className="remove-field-btn issues-breakdown-remove" onClick={() => updateSlide(index, { subtitle: null })} title="Remove subtitle">× Remove subtitle</button>
                    )}
                  </div>
                )}
                {editMode && (slide.subtitle == null || slide.subtitle === '') && (
                  <button className="add-field-btn" onClick={() => updateSlide(index, { subtitle: 'Subtitle' })}>+ Add subtitle</button>
                )}
                {/* Optional paragraph / description */}
                <DynamicContent slide={slide} slideIndex={index} field="description" className="issues-breakdown-description-wrapper" maxParagraphs={3} optional />

                {/* Optional title before the cards */}
                {(slide.cardsTitle != null && slide.cardsTitle !== '' || editMode) && (
                  <div className="issues-breakdown-cards-title-wrapper">
                    <h3 className="issues-breakdown-cards-title">
                      <EditableField
                        value={slide.cardsTitle || ''}
                        onChange={(v) => updateSlide(index, { cardsTitle: v })}
                        placeholder="Title before cards (optional)"
                      />
                    </h3>
                    {editMode && (
                      <button
                        type="button"
                        className="remove-field-btn issues-breakdown-remove"
                        onClick={() => updateSlide(index, { cardsTitle: null })}
                        title="Remove title"
                      >
                        × Remove title
                      </button>
                    )}
                  </div>
                )}
                {editMode && (slide.cardsTitle == null || slide.cardsTitle === '') && (
                  <button
                    className="add-field-btn"
                    onClick={() => updateSlide(index, { cardsTitle: 'Section title' })}
                  >
                    + Add title before cards
                  </button>
                )}

                {/* Cards layout: 1–4 columns */}
                {editMode && (
                  <div className="issues-breakdown-grid-control">
                    <span className="grid-control-label">Cards layout:</span>
                    <div className="grid-control-buttons">
                      {[1, 2, 3, 4].map(cols => (
                        <button
                          key={cols}
                          type="button"
                          className={`grid-col-btn ${(slide.gridColumns || 2) === cols ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { gridColumns: cols })}
                        >
                          {cols} {cols === 1 ? 'column' : 'columns'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {slide.issues?.length > 0 && (
                  <div 
                    className="issues-breakdown-grid"
                    style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 2}, minmax(0, 1fr))` }}
                  >
                    {slide.issues.map((issue, i) => (
                      <div key={i} className="issue-breakdown-card">
                        {slide.showNumbers !== false && <div className="issue-breakdown-number">{issue.number || i + 1}</div>}
                        <div className="issue-breakdown-content">
                          <h4 className="issue-breakdown-heading">
                            <EditableField 
                              value={issue.title} 
                              onChange={(v) => updateSlideItem(index, 'issues', i, { ...issue, title: v })} 
                            />
                          </h4>
                          {(issue.description != null && issue.description !== '' || editMode) && (
                            <div className="issue-breakdown-desc-wrapper">
                              <p className="issue-breakdown-desc">
                                <EditableField 
                                  value={issue.description || ''} 
                                  onChange={(v) => updateSlideItem(index, 'issues', i, { ...issue, description: v })} 
                                  multiline
                                  placeholder="Description (optional)"
                                />
                              </p>
                              {editMode && (
                                <button
                                  type="button"
                                  className="remove-field-btn issues-breakdown-remove issues-breakdown-remove-desc"
                                  onClick={() => updateSlideItem(index, 'issues', i, { ...issue, description: null })}
                                  title="Remove description"
                                >
                                  × Remove description
                                </button>
                              )}
                            </div>
                          )}
                          {editMode && (issue.description == null || issue.description === '') && (
                            <button
                              type="button"
                              className="add-field-btn add-field-btn-sm"
                              onClick={() => updateSlideItem(index, 'issues', i, { ...issue, description: 'Add description...' })}
                            >
                              + Add description
                            </button>
                          )}
                        </div>
                        {editMode && (
                          <button
                            type="button"
                            className="remove-item-btn issue-breakdown-remove-item"
                            onClick={() => removeArrayItem(index, 'issues', i)}
                            title="Remove issue"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <AddItemButton 
                  onClick={() => addArrayItem(index, 'issues', { number: String((slide.issues?.length || 0) + 1), title: 'New issue', description: '' })}
                  label="Issue"
                />
                
                {((slide.highlight != null && slide.highlight !== '') || (editMode && slide.highlight !== null && slide.highlight !== undefined)) && (
                  <div className="issues-breakdown-highlight-wrapper">
                    <div className="issues-breakdown-highlight">
                      <EditableField value={slide.highlight || ''} onChange={(v) => updateSlide(index, { highlight: v })} multiline placeholder="Add highlighted note..." />
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        className="remove-field-btn issues-breakdown-remove"
                        onClick={() => updateSlide(index, { highlight: null })}
                        title="Remove Highlight"
                      >
                        × Remove Highlight
                      </button>
                    )}
                  </div>
                )}
                {editMode && (slide.highlight == null || slide.highlight === undefined) && (
                  <button
                    className="add-field-btn"
                    onClick={() => updateSlide(index, { highlight: 'Add highlighted note...' })}
                  >
                    + Add Highlight
                  </button>
                )}
                <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
              </div>
            </div>
          </div>
        );

      // === ACHIEVE GOALS - two-column goals layout ===
      case 'achieveGoals':
        return (
          <div className="slide slide-achieve-goals" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="achieve-goals-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="achieve-goals-description-wrapper" maxParagraphs={2} optional />
              
              <div className="achieve-goals-columns">
                {/* Left Column */}
                <div className="achieve-goals-column">
                  <h3 className="achieve-goals-column-title">
                    <EditableField 
                      value={slide.leftColumn?.title || 'KPIs'} 
                      onChange={(v) => updateSlide(index, { leftColumn: { ...slide.leftColumn, title: v } })} 
                    />
                  </h3>
                  <div className="achieve-goals-list">
                    {slide.leftColumn?.goals?.map((goal, i) => (
                      <div key={i} className="achieve-goal-item">
                        <div className="achieve-goal-number">{goal.number || i + 1}</div>
                        <div className="achieve-goal-text">
                          <EditableField 
                            value={goal.text} 
                            onChange={(v) => {
                              const newGoals = [...(slide.leftColumn?.goals || [])];
                              newGoals[i] = { ...goal, text: v };
                              updateSlide(index, { leftColumn: { ...slide.leftColumn, goals: newGoals } });
                            }} 
                          />
                        </div>
                        {editMode && (
                          <button 
                            className="remove-item-btn"
                            onClick={() => {
                              const newGoals = slide.leftColumn.goals.filter((_, idx) => idx !== i);
                              updateSlide(index, { leftColumn: { ...slide.leftColumn, goals: newGoals } });
                            }}
                          >×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <button 
                      className="add-item-btn"
                      onClick={() => {
                        const currentGoals = slide.leftColumn?.goals || [];
                        updateSlide(index, { 
                          leftColumn: { 
                            ...slide.leftColumn, 
                            goals: [...currentGoals, { number: String(currentGoals.length + 1), text: 'New goal' }] 
                          } 
                        });
                      }}
                    >+ Add Goal</button>
                  )}
                </div>
                
                {/* Right Column */}
                <div className="achieve-goals-column">
                  <h3 className="achieve-goals-column-title">
                    <EditableField 
                      value={slide.rightColumn?.title || 'Key metrics'} 
                      onChange={(v) => updateSlide(index, { rightColumn: { ...slide.rightColumn, title: v } })} 
                    />
                  </h3>
                  <div className="achieve-goals-list">
                    {slide.rightColumn?.goals?.map((goal, i) => (
                      <div key={i} className="achieve-goal-item">
                        <div className="achieve-goal-number">{goal.number || i + 1}</div>
                        <div className="achieve-goal-text">
                          <EditableField 
                            value={goal.text} 
                            onChange={(v) => {
                              const newGoals = [...(slide.rightColumn?.goals || [])];
                              newGoals[i] = { ...goal, text: v };
                              updateSlide(index, { rightColumn: { ...slide.rightColumn, goals: newGoals } });
                            }} 
                          />
                        </div>
                        {editMode && (
                          <button 
                            className="remove-item-btn"
                            onClick={() => {
                              const newGoals = slide.rightColumn.goals.filter((_, idx) => idx !== i);
                              updateSlide(index, { rightColumn: { ...slide.rightColumn, goals: newGoals } });
                            }}
                          >×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <button 
                      className="add-item-btn"
                      onClick={() => {
                        const currentGoals = slide.rightColumn?.goals || [];
                        updateSlide(index, { 
                          rightColumn: { 
                            ...slide.rightColumn, 
                            goals: [...currentGoals, { number: String(currentGoals.length + 1), text: 'New metric' }] 
                          } 
                        });
                      }}
                    >+ Add Metric</button>
                  )}
                </div>
              </div>
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="achieve-goals-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
              <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
            </div>
          </div>
        );

      // === IMAGE MOSAIC - Grid of images with centered title ===
      case 'imageMosaic': {
        const MOSAIC_TILES = 24;
        const MOSAIC_COLS = 6;
        const sourceImages = (slide.images || []).filter(img => typeof img === 'object' ? img.src : img);
        const tiles = Array.from({ length: MOSAIC_TILES }, (_, i) => {
          if (sourceImages.length === 0) return null;
          const img = sourceImages[i % sourceImages.length];
          return typeof img === 'object' ? img.src : img;
        });

        const handleMosaicAdd = () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = true;
          input.onchange = async (e) => {
            const files = Array.from(e.target.files || []);
            const current = slide.images || [];
            const newImages = [...current];
            for (const file of files) {
              const dataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.readAsDataURL(file);
              });
              try {
                const compressed = await compressImage(dataUrl);
                newImages.push({ src: compressed });
              } catch {
                newImages.push({ src: dataUrl });
              }
            }
            updateSlide(index, { images: newImages });
          };
          input.click();
        };

        const handleMosaicRemove = (imgIdx) => {
          const newImages = (slide.images || []).filter((_, i) => i !== imgIdx);
          updateSlide(index, { images: newImages });
        };

        return (
          <div className="slide slide-image-mosaic" key={index} style={spacingStyle}>
            {slideControls}
            <div className="slide-inner">
              {/* 24-tile mosaic background */}
              <div className="mosaic-tile-grid" style={{ gridTemplateColumns: `repeat(${MOSAIC_COLS}, 1fr)` }}>
                {tiles.map((src, i) => (
                  <div key={i} className="mosaic-tile">
                    {src ? (
                      <img src={src} alt="" />
                    ) : (
                      <div className="mosaic-tile-empty" />
                    )}
                  </div>
                ))}
              </div>
              {/* Centered title overlay */}
              <OptionalField slide={slide} index={index} field="title" label="Title" defaultValue="Old version">
                <div className="mosaic-overlay">
                  <div className="mosaic-title-badge">
                    <EditableField
                      value={slide.title}
                      onChange={(v) => updateSlide(index, { title: v })}
                      allowLineBreaks
                    />
                  </div>
                </div>
              </OptionalField>
              {/* Edit mode: image manager */}
              {editMode && (
                <div className="mosaic-image-manager">
                  <span className="mosaic-manager-label">Source Images ({sourceImages.length})</span>
                  <div className="mosaic-source-images">
                    {sourceImages.map((img, i) => (
                      <div key={i} className="mosaic-source-item has-image">
                        <img src={typeof img === 'object' ? img.src : img} alt="" />
                        <button className="remove-source-btn" onClick={() => handleMosaicRemove(i)}>×</button>
                      </div>
                    ))}
                    <button className="add-source-btn" onClick={handleMosaicAdd}>+ Add</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      case 'problemSolution':
        return (
          <ComparisonSlide
            key={index}
            slide={slide}
            index={index}
            slideControls={slideControls}
            editMode={editMode}
            updateSlide={updateSlide}
            OptionalField={OptionalField}
            DynamicImages={DynamicImages}
            DynamicBullets={DynamicBullets}
            DynamicContent={DynamicContent}
            SplitRatioControl={SplitRatioControl}
            SplitDragHandle={SplitDragHandle}
            setLightboxImage={setLightboxImage}
            spacingStyle={spacingStyle}
            titleSpacingControl={titleSpacingControl}
          />
        );

      case 'chapter':
        return (
          <div className="slide slide-chapter" key={index} style={spacingStyle}>
            {slideControls}
            {titleSpacingControl}
            {slide.number && (
              <span className="chapter-bg-number" aria-hidden="true">{slide.number}</span>
            )}
            <div className="slide-inner">
              <OptionalField slide={slide} index={index} field="number" label="Number" defaultValue="01">
                <div className="chapter-header">
                  <span className="chapter-number">
                    <EditableField value={slide.number} onChange={(v) => updateSlide(index, { number: v })} />
                  </span>
                </div>
              </OptionalField>
              <h1 className="chapter-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} allowLineBreaks />
              </h1>
              <OptionalField slide={slide} index={index} field="subtitle" label="Subtitle" defaultValue="Section description">
                <p className="chapter-subtitle">
                  <EditableField value={slide.subtitle} onChange={(v) => updateSlide(index, { subtitle: v })} />
                </p>
              </OptionalField>
            </div>
          </div>
        );

      default:
        return (
          <div className="slide slide-unknown" key={index}>
            {slideControls}
            <div className="slide-inner">
              <p>Unknown slide type: {slide.type}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`case-study ${editMode ? 'edit-mode' : ''}`}
      ref={containerRef}
      data-card-style={cardStyle !== 'outlined' ? cardStyle : undefined}
    >
      {/* Per-breakpoint slide padding from the edit panel. Mobile-first
          min-width cascade; same selector specificity as CaseStudy.css
          rules but injected later in document order, so these win.
          Horizontal var sets both left+right via .slide's 3-value padding
          shorthand (top | horizontal | bottom). */}
      <style>{(() => {
        /* Accept bare numbers (e.g. "120"), numbers with units (e.g. "6rem"),
           or empty. Invalid/empty → fall back to default so CSS stays valid. */
        const toCss = (raw, fallback) => {
          if (raw == null) return fallback;
          const s = String(raw).trim();
          if (!s) return fallback;
          if (/^-?\d+(\.\d+)?$/.test(s)) return `${s}px`;
          return s;
        };
        const pad = styles.spacing.slidePad || {};
        const z = (bp) => pad[bp] || {};
        const m = z('mobile'), t = z('tablet'), d = z('desktop'),
              l = z('large'),  u = z('ultrawide'), f = z('fourK');
        const rule = (x, y, xDef, yDef) => {
          const xv = toCss(x, xDef);
          const yv = toCss(y, yDef);
          return `--slide-pad-x: ${xv}; --slide-pad-top: ${yv}; --slide-pad-bottom: ${yv};`;
        };
        return `
          .case-study { ${rule(m.x, m.y, '24px',  '56px' )} }
          @media (min-width: 768px)  { .case-study { ${rule(t.x, t.y, '36px',  '48px' )} } }
          @media (min-width: 1024px) { .case-study { ${rule(d.x, d.y, '80px',  '128px')} } }
          @media (min-width: 1440px) { .case-study { ${rule(l.x, l.y, '64px',  '96px' )} } }
          @media (min-width: 1920px) { .case-study { ${rule(u.x, u.y, '128px', '120px')} } }
          @media (min-width: 2400px) { .case-study { ${rule(f.x, f.y, '144px', '128px')} } }
        `;
      })()}</style>
      {/* Edit Mode Indicator */}
      <AnimatePresence>
        {editMode && (
          <motion.div 
            className="edit-mode-bar"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <span>✏️ Edit Mode</span>
            <div className="edit-actions">
              <button className="builder-trigger" onClick={() => setShowBuilder(true)}>🚀 Build from Scratch</button>
              <button onClick={handleCopyJSON}>{saveStatus === 'copied' ? '✓ Copied!' : '📋 Copy JSON for ChatGPT'}</button>
              <button onClick={() => { setShowImportJSON(true); setImportJSONText(''); setImportError(''); }}>📥 Import JSON</button>
              <button onClick={() => {
                const stripForEdit = (obj) => {
                  if (typeof obj === 'string' && obj.startsWith('data:')) return '[[MEDIA]]';
                  if (Array.isArray(obj)) return obj.map(item => stripForEdit(item));
                  if (obj && typeof obj === 'object') {
                    const r = {};
                    for (const k in obj) r[k] = stripForEdit(obj[k]);
                    return r;
                  }
                  return obj;
                };
                setEditFullJSON({ text: JSON.stringify(stripForEdit(project), null, 2), originalProject: project, error: '' });
              }}>{'{}'} Edit Full JSON</button>
              <select
                className="card-style-select"
                value={cardStyle}
                onChange={(e) => {
                  const v = e.target.value;
                  setCardStyle(v);
                  try { localStorage.setItem(`caseStudy_${projectId}_cardStyle`, v); } catch {}
                }}
                title="Card style"
              >
                <option value="outlined">Cards: Outlined</option>
                <option value="filled">Cards: Filled</option>
                <option value="ghost">Cards: Ghost</option>
                <option value="elevated">Cards: Elevated</option>
                <option value="accent-left">Cards: Accent Left</option>
              </select>
              <select
                className="card-style-select"
                value=""
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isNaN(v)) return;
                  if (window.confirm(`Apply ${v}/${100 - v} layout to all slides? This overrides any per-slide layout you've set.`)) {
                    applyLayoutToAllSlides(v);
                  }
                }}
                title="Apply layout to all slides"
              >
                <option value="" disabled>Layout: All slides</option>
                <option value="30">All slides → 30/70</option>
                <option value="40">All slides → 40/60</option>
                <option value="50">All slides → 50/50</option>
                <option value="60">All slides → 60/40</option>
              </select>
              {IS_DEV_EDITOR && (
                <button onClick={handleSaveToCode} className={saveStatus === 'saved-code' ? 'save-code-done' : ''}>
                  {saveStatus === 'saving-code' ? 'Saving...' : saveStatus === 'saved-code' ? '✓ Saved to Code' : saveStatus === 'error-code' ? '✗ Error' : '💾 Save to Code'}
                </button>
              )}
              <button onClick={handleReset}>Reset to Default</button>
              <button onClick={() => { setEditMode(false); setShowPanel(false); }}>Done Editing</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            className="template-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowTemplates(false); setPreviewTemplate(null); }}
          >
            <motion.div 
              className={`template-modal ${previewTemplate ? 'with-preview' : ''}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="template-selector">
                <h3>Add New Slide</h3>
                <p>Click a template to preview, then add:</p>
                <div className="template-categories">
                  {Object.entries(templateCategories).map(([category, templates]) => (
                    <div key={category} className="template-category">
                      <h4 className="category-title">{category}</h4>
                      <div className="template-grid">
                        {templates.map((type) => (
                          <button 
                            key={type}
                            className={`template-btn ${previewTemplate === type ? 'active' : ''}`}
                            onClick={() => setPreviewTemplate(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="close-modal" onClick={() => { setShowTemplates(false); setPreviewTemplate(null); }}>Cancel</button>
              </div>
              
              {/* Preview Panel */}
              {previewTemplate && (
                <div className="template-preview">
                  <div className="preview-header">
                    <h4>Preview: {previewTemplate.charAt(0).toUpperCase() + previewTemplate.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                    <button 
                      className="add-template-btn"
                      onClick={() => {
                        addSlide(previewTemplate, currentSlide);
                        setPreviewTemplate(null);
                      }}
                    >
                      Add This Slide
                    </button>
                  </div>
                  <div className="preview-content">
                    <TemplatePreview type={previewTemplate} />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Study Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div 
            className="builder-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBuilder}
          >
            <motion.div 
              className={`builder-modal ${builderMode === 'paste' ? 'builder-modal--wide' : ''}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="builder-header">
                <h2>{builderMode === 'paste' ? '📝 Create from Text' : '🚀 Create Case Study'}</h2>
                <p>
                  {builderMode === 'choose' && 'Choose how you want to build your presentation'}
                  {builderMode === 'paste' && 'Paste your case study content and we\'ll pick the best slides automatically'}
                  {builderMode === 'form' && 'Fill in the information and we\'ll generate your presentation automatically'}
                </p>
                <button className="builder-close" onClick={closeBuilder}>×</button>
              </div>

              {/* Progress stepper - only in form mode */}
              {builderMode === 'form' && (
                <div className="builder-progress">
                  {builderSteps.map((step, i) => (
                    <div 
                      key={i} 
                      className={`progress-step ${i === builderStep ? 'active' : ''} ${i < builderStep ? 'completed' : ''}`}
                      onClick={() => setBuilderStep(i)}
                    >
                      <span className="step-number">{i + 1}</span>
                      <span className="step-title">{step.title}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="builder-content">

                {/* === MODE: Choose === */}
                {builderMode === 'choose' && (
                  <div className="builder-mode-select">
                    <div className="builder-mode-card" onClick={() => setBuilderMode('paste')}>
                      <div className="mode-icon">📝</div>
                      <h3>Paste Content</h3>
                      <p>Paste your full case study text and we'll automatically detect sections and create the best slides for your content</p>
                      <span className="mode-tag">Recommended</span>
                    </div>
                    <div className="builder-mode-card" onClick={() => setBuilderMode('form')}>
                      <div className="mode-icon">📋</div>
                      <h3>Step by Step</h3>
                      <p>Fill in a structured form field by field to build your case study slides one step at a time</p>
                    </div>
                  </div>
                )}

                {/* === MODE: Paste Content === */}
                {builderMode === 'paste' && (
                  <div className="builder-paste-container">
                    <div className="builder-field">
                      <label>Paste your case study content</label>
                      <textarea
                        className="builder-paste-textarea"
                        value={pasteText}
                        onChange={(e) => { setPasteText(e.target.value); setParsedPreview(null); }}
                        placeholder={`Paste your full case study text here...\n\nExample format:\n\nProject Name\nShort description of the project\n\nClient\nCompany Name\n\nRole\nYour Role\n\nBackground\nWhat is this project about?\n\nThe Problem\nWhat needed to be solved\n\n1. First issue\n2. Second issue\n\nGoals\nWhat you wanted to achieve\n\nThe Solution\nHow you solved it\n\nOutcomes\nWhat improved\n\nThank You`}
                        rows={14}
                      />
                      <div className="builder-text-stats">
                        {pasteText.trim() ? `${pasteText.split(/\s+/).filter(w => w).length} words` : 'Paste your content to get started'}
                      </div>
                    </div>

                    {parsedPreview && parsedPreview.preview.length > 0 && (
                      <div className="builder-preview">
                        <div className="builder-preview-header">
                          <h4>{parsedPreview.preview.length} slides detected</h4>
                          <span className="builder-preview-hint">You can edit any slide after generating</span>
                        </div>
                        <div className="builder-preview-list">
                          {parsedPreview.preview.map((item, i) => (
                            <div key={i} className="builder-preview-item">
                              <span className="preview-number">{String(i + 1).padStart(2, '0')}</span>
                              <span className="preview-type-badge">{item.type}</span>
                              <span className="preview-label">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* === MODE: Step-by-step Form === */}
                {builderMode === 'form' && builderStep === 0 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Project Name *</label>
                      <input
                        type="text"
                        value={builderData.projectName}
                        onChange={(e) => setBuilderData(d => ({ ...d, projectName: e.target.value }))}
                        placeholder="e.g., Mobile Banking App Redesign"
                      />
                    </div>
                    <div className="builder-row">
                      <div className="builder-field">
                        <label>Category</label>
                        <input
                          type="text"
                          value={builderData.category}
                          onChange={(e) => setBuilderData(d => ({ ...d, category: e.target.value }))}
                          placeholder="e.g., UX/UI Design"
                        />
                      </div>
                      <div className="builder-field">
                        <label>Year</label>
                        <input
                          type="text"
                          value={builderData.year}
                          onChange={(e) => setBuilderData(d => ({ ...d, year: e.target.value }))}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                    <div className="builder-field">
                      <label>Brief Description</label>
                      <textarea
                        value={builderData.description}
                        onChange={(e) => setBuilderData(d => ({ ...d, description: e.target.value }))}
                        placeholder="A short description of what this project is about..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 1 && (
                  <div className="builder-step">
                    <div className="builder-row">
                      <div className="builder-field">
                        <label>Client</label>
                        <input
                          type="text"
                          value={builderData.client}
                          onChange={(e) => setBuilderData(d => ({ ...d, client: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="builder-field">
                        <label>Your Role</label>
                        <input
                          type="text"
                          value={builderData.role}
                          onChange={(e) => setBuilderData(d => ({ ...d, role: e.target.value }))}
                          placeholder="e.g., Lead Designer"
                        />
                      </div>
                    </div>
                    <div className="builder-row">
                      <div className="builder-field">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={builderData.duration}
                          onChange={(e) => setBuilderData(d => ({ ...d, duration: e.target.value }))}
                          placeholder="e.g., 3 months"
                        />
                      </div>
                      <div className="builder-field">
                        <label>Deliverables</label>
                        <input
                          type="text"
                          value={builderData.deliverables}
                          onChange={(e) => setBuilderData(d => ({ ...d, deliverables: e.target.value }))}
                          placeholder="e.g., UI Kit, Prototypes"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 2 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Context / Background</label>
                      <textarea
                        value={builderData.context}
                        onChange={(e) => setBuilderData(d => ({ ...d, context: e.target.value }))}
                        placeholder="Describe the context and background of the project..."
                        rows={3}
                      />
                    </div>
                    <div className="builder-field">
                      <label>The Problem</label>
                      <textarea
                        value={builderData.problem}
                        onChange={(e) => setBuilderData(d => ({ ...d, problem: e.target.value }))}
                        placeholder="What problem were you trying to solve?"
                        rows={2}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Key Issues (one per line)</label>
                      {builderData.issues.map((issue, i) => (
                        <input
                          key={i}
                          type="text"
                          value={issue}
                          onChange={(e) => {
                            const newIssues = [...builderData.issues];
                            newIssues[i] = e.target.value;
                            setBuilderData(d => ({ ...d, issues: newIssues }));
                          }}
                          placeholder={`Issue ${i + 1}`}
                          style={{ marginBottom: '0.5rem' }}
                        />
                      ))}
                      <button 
                        className="builder-add-btn"
                        onClick={() => setBuilderData(d => ({ ...d, issues: [...d.issues, ''] }))}
                      >
                        + Add Issue
                      </button>
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 3 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Goals</label>
                      {builderData.goals.map((goal, i) => (
                        <input
                          key={i}
                          type="text"
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...builderData.goals];
                            newGoals[i] = e.target.value;
                            setBuilderData(d => ({ ...d, goals: newGoals }));
                          }}
                          placeholder={`Goal ${i + 1}`}
                          style={{ marginBottom: '0.5rem' }}
                        />
                      ))}
                      <button 
                        className="builder-add-btn"
                        onClick={() => setBuilderData(d => ({ ...d, goals: [...d.goals, ''] }))}
                      >
                        + Add Goal
                      </button>
                    </div>
                    <div className="builder-field">
                      <label>The Solution</label>
                      <textarea
                        value={builderData.solution}
                        onChange={(e) => setBuilderData(d => ({ ...d, solution: e.target.value }))}
                        placeholder="Describe how you solved the problem..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 4 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Results / Metrics</label>
                      {builderData.results.map((result, i) => (
                        <div key={i} className="builder-row" style={{ marginBottom: '0.5rem' }}>
                          <input
                            type="text"
                            value={result.value}
                            onChange={(e) => {
                              const newResults = [...builderData.results];
                              newResults[i] = { ...newResults[i], value: e.target.value };
                              setBuilderData(d => ({ ...d, results: newResults }));
                            }}
                            placeholder="e.g., 50%"
                            style={{ flex: '0 0 100px' }}
                          />
                          <input
                            type="text"
                            value={result.label}
                            onChange={(e) => {
                              const newResults = [...builderData.results];
                              newResults[i] = { ...newResults[i], label: e.target.value };
                              setBuilderData(d => ({ ...d, results: newResults }));
                            }}
                            placeholder="Metric description"
                          />
                        </div>
                      ))}
                      <button 
                        className="builder-add-btn"
                        onClick={() => setBuilderData(d => ({ ...d, results: [...d.results, { value: '', label: '' }] }))}
                      >
                        + Add Metric
                      </button>
                    </div>
                    <div className="builder-field">
                      <label>Client Testimonial (optional)</label>
                      <textarea
                        value={builderData.testimonial}
                        onChange={(e) => setBuilderData(d => ({ ...d, testimonial: e.target.value }))}
                        placeholder="A quote from your client..."
                        rows={2}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Testimonial Author</label>
                      <input
                        type="text"
                        value={builderData.testimonialAuthor}
                        onChange={(e) => setBuilderData(d => ({ ...d, testimonialAuthor: e.target.value }))}
                        placeholder="e.g., John Doe, CEO"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions bar */}
              {builderMode !== 'choose' && (
                <div className="builder-actions">
                  <button 
                    className="builder-btn secondary"
                    onClick={() => {
                      if (builderMode === 'paste') {
                        setParsedPreview(null);
                        setBuilderMode('choose');
                      } else if (builderStep === 0) {
                        setBuilderMode('choose');
                      } else {
                        setBuilderStep(s => Math.max(0, s - 1));
                      }
                    }}
                  >
                    ← Back
                  </button>

                  {/* Paste mode actions */}
                  {builderMode === 'paste' && !parsedPreview && (
                    <button 
                      className="builder-btn primary"
                      onClick={() => {
                        const result = parseTextToSlides(pasteText);
                        setParsedPreview(result);
                      }}
                      disabled={!pasteText.trim()}
                    >
                      Analyze Content
                    </button>
                  )}
                  {builderMode === 'paste' && parsedPreview && (
                    <div className="builder-actions-group">
                      <button 
                        className="builder-btn secondary"
                        onClick={() => setParsedPreview(null)}
                      >
                        Re-edit
                      </button>
                      <button 
                        className="builder-btn primary generate"
                        onClick={generateFromPaste}
                      >
                        ✨ Generate {parsedPreview.preview.length} Slides
                      </button>
                    </div>
                  )}

                  {/* Form mode actions */}
                  {builderMode === 'form' && builderStep < builderSteps.length - 1 && (
                    <button 
                      className="builder-btn primary"
                      onClick={() => setBuilderStep(s => s + 1)}
                    >
                      Next →
                    </button>
                  )}
                  {builderMode === 'form' && builderStep === builderSteps.length - 1 && (
                    <button 
                      className="builder-btn primary generate"
                      onClick={generateFromBuilder}
                    >
                      ✨ Generate Case Study
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Status Indicator */}
      {(saveStatus || (editMode && hasUnsavedChanges)) && (
        <div className={`save-status ${saveStatus ? `save-status-${saveStatus}` : 'save-status-unsaved'}`}>
          {saveStatus === 'saving' && '💾 Saving...'}
          {saveStatus === 'saved' && '✓ Saved'}
          {saveStatus === 'error' && '⚠ Save failed'}
          {!saveStatus && editMode && hasUnsavedChanges && '● Unsaved changes'}
        </div>
      )}

      {/* In edit mode: list saved case studies so you can find the one with 30+ slides */}
      {editMode && savedCaseStudiesList.length > 0 && (
        <div className="saved-case-studies-bar">
          <button type="button" className="saved-case-studies-toggle" onClick={() => setShowSavedList((v) => !v)} aria-expanded={showSavedList}>
            {showSavedList ? '▼' : '▶'} Find saved case studies ({savedCaseStudiesList.length})
          </button>
          {showSavedList && (
            <div className="saved-case-studies-list">
              {savedCaseStudiesList.map(({ projectId: id, slideCount }) => (
                <Link
                  key={id}
                  to={`/case-study/${id}`}
                  className={`saved-case-study-link ${id === projectId ? 'current' : ''}`}
                  onClick={() => setShowSavedList(false)}
                >
                  <span className="saved-case-study-id">{id}</span>
                  <span className="saved-case-study-slides">{slideCount} slide{slideCount !== 1 ? 's' : ''}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="case-nav">
        <Link to="/" className="nav-back-btn" title="Back to home" aria-label="Back to home">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.25 4.5 6.75 9l4.5 4.5"/></svg>
        </Link>
        <div className="nav-label-left">
          {editMode ? (
            <span className="nav-slide-label nav-slide-label--edit">
              <EditableField
                value={project.slides[currentSlide]?.label || ''}
                onChange={(v) => updateSlide(currentSlide, { label: v })}
              />
            </span>
          ) : (
            project.slides[currentSlide]?.label && (
              <span className="nav-slide-label">{project.slides[currentSlide].label}</span>
            )
          )}
        </div>
        <div className="nav-progress">
          <span className="progress-current">{String(currentSlide + 1).padStart(2, '0')}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
          </div>
          <span className="progress-total">{String(totalSlides).padStart(2, '0')}</span>
        </div>
      </div>

      <div
        className="case-study-slides-wrapper"
        onMouseEnter={showSlideNav}
        onMouseMove={handleSlideAreaMouseMove}
        onMouseLeave={hideSlideNavAfterDelay}
      >
        <div className="slides-container" onClick={handleSlideAreaClick}>
          <motion.div
            /* Keyed on projectNonce (bumped in go() on project switch) so
               the track remounts synchronously in the same React batch
               as setProject/setCurrentSlide. initial={false} skips the
               entrance tween; without it framer-motion would animate
               from its default initial into the new animate target. */
            key={projectNonce}
            className={`slides-track${isMobileSlide ? ' slides-track--mobile-scaled' : ''}`}
            initial={false}
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            {project.slides.map((slide, index) => (
              <SlideErrorBoundary key={`error-${index}`}>
                <SlideContainer
                  isMobile={isMobileSlide}
                  transformKey={`zoom-${index}-${currentSlide === index ? 'active' : 'idle'}`}
                  onScaleChange={(scale, fitScale) => {
                    if (index === currentSlide) {
                      currentScaleRef.current = scale;
                      baseFitScaleRef.current = fitScale;
                    }
                  }}
                >
                  {renderSlide(slide, index)}
                </SlideContainer>
              </SlideErrorBoundary>
            ))}
          </motion.div>
        </div>
        {isMobileSlide && showZoomHint && (
          <div className="zoom-hint" role="status" aria-live="polite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
              <path d="M8 11h6" />
              <path d="M11 8v6" />
            </svg>
            <span>Pinch or double-tap to zoom</span>
          </div>
        )}

        {!editMode && totalSlides > 1 && (
          <>
            <div
              className="slide-nav-hover-zone"
              onMouseEnter={showSlideNav}
              onMouseLeave={hideSlideNavAfterDelay}
              aria-hidden="true"
            />
            <div
              className={`slide-nav-pill ${slideNavVisible ? 'slide-nav-pill--visible' : ''}`}
              onMouseEnter={showSlideNav}
              onMouseLeave={hideSlideNavAfterDelay}
              role="group"
              aria-label="Slide navigation"
            >
            <button
              type="button"
              className="slide-nav-pill-btn"
              onClick={() => { goToSlide(-1); showSlideNav(); }}
              disabled={currentSlide === 0}
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L8 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isMobileSlide && (
              <span className="slide-nav-pill-counter" aria-live="polite">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>
            )}
            <span className="slide-nav-pill-divider" aria-hidden="true" />
            <button
              type="button"
              className="slide-nav-pill-btn"
              onClick={() => { goToSlide(1); showSlideNav(); }}
              disabled={currentSlide >= totalSlides - 1}
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4L12 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            </div>
          </>
        )}
      </div>

      {/* Slide Sorter Panel (edit mode) */}
      <AnimatePresence>
        {editMode && showSlideSorter && (
          <motion.div
            className="slide-sorter"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="slide-sorter-header">
              <span className="slide-sorter-title">Slides ({totalSlides})</span>
              <div className="slide-sorter-actions">
                {IS_DEV_EDITOR && (
                  <>
                    <button
                      className={`slide-sorter-save-all${saveAllStatus ? ` save-all-${saveAllStatus}` : ''}`}
                      onClick={handleSaveAllToCode}
                      disabled={saveAllStatus === 'saving'}
                      title="Save all case studies to code"
                    >
                      {saveAllStatus === 'saving' ? '⟳ Saving...' : saveAllStatus === 'saved' ? '✓ All Saved' : saveAllStatus === 'error' ? '⚠ Error' : '💾 Save All'}
                    </button>
                    <button
                      className={`slide-sorter-git-push${gitPushStatus ? ` git-push-${gitPushStatus}` : ''}`}
                      onClick={handleGitPush}
                      disabled={gitPushStatus === 'pushing'}
                      title="Commit & push to git"
                    >
                      {gitPushStatus === 'pushing' ? '⟳ Pushing...' : gitPushStatus === 'pushed' ? '✓ Pushed' : gitPushStatus === 'error' ? '⚠ Error' : '↑ Push to git'}
                    </button>
                    <button
                      className={`slide-sorter-webp${webpStatus ? ` webp-${webpStatus}` : ''}`}
                      onClick={handleConvertImagesToWebp}
                      disabled={webpStatus === 'running'}
                      title={webpSummary || 'Convert PNG/JPG under public/case-studies/ to WebP (MP4s untouched, originals backed up)'}
                    >
                      {webpStatus === 'running'
                        ? '⟳ Converting…'
                        : webpStatus === 'done'
                          ? (webpSummary ? `✓ ${webpSummary}` : '✓ Converted')
                          : webpStatus === 'error'
                            ? '⚠ Error'
                            : '🖼 WebP'}
                    </button>
                    <button
                      className={`slide-sorter-webp${imgVariantsStatus ? ` webp-${imgVariantsStatus}` : ''}`}
                      onClick={handleGenerateImageVariants}
                      disabled={imgVariantsStatus === 'running'}
                      title={imgVariantsSummary || 'Generate @480/@960 responsive WebP variants + manifest (safe, idempotent)'}
                    >
                      {imgVariantsStatus === 'running'
                        ? '⟳ Resizing…'
                        : imgVariantsStatus === 'done'
                          ? (imgVariantsSummary ? `✓ ${imgVariantsSummary}` : '✓ Variants')
                          : imgVariantsStatus === 'error'
                            ? '⚠ Error'
                            : '📐 Variants'}
                    </button>
                    <button
                      className={`slide-sorter-webp${compressVideosStatus ? ` webp-${compressVideosStatus}` : ''}`}
                      onClick={handleCompressVideos}
                      disabled={compressVideosStatus === 'running'}
                      title={compressVideosSummary || 'Compress MP4s + generate .mobile.mp4 + .poster.webp (long-running, originals backed up)'}
                    >
                      {compressVideosStatus === 'running'
                        ? '⟳ Encoding…'
                        : compressVideosStatus === 'done'
                          ? (compressVideosSummary ? `✓ ${compressVideosSummary}` : '✓ Videos')
                          : compressVideosStatus === 'error'
                            ? '⚠ Error'
                            : '🎬 Videos'}
                    </button>
                  </>
                )}
                <button
                  className="slide-sorter-add"
                  onClick={() => setShowTemplates(true)}
                  title="Add slide"
                >+</button>
                <button
                  className="slide-sorter-collapse"
                  onClick={() => setShowSlideSorter(false)}
                  title="Collapse"
                >▼</button>
              </div>
            </div>
            <div className="slide-sorter-track">
              {project.slides.map((slide, index) => {
                const typeLabel = (slide.type || 'unknown').replace(/([A-Z])/g, ' $1').trim();
                const isDragging = dragState.dragging === index;
                const isDragOver = dragState.over === index && dragState.dragging !== index;
                return (
                  <div
                    key={index}
                    className={`slide-sorter-thumb${currentSlide === index ? ' active' : ''}${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <div className="thumb-number">{String(index + 1).padStart(2, '0')}</div>
                    <div className="thumb-preview">
                      <div className="thumb-type">{typeLabel}</div>
                      <div className="thumb-title">{slide.title || slide.quote?.slice(0, 30) || ''}</div>
                    </div>
                    <div className="thumb-actions">
                      <button title="Move up" onClick={(e) => { e.stopPropagation(); moveSlide(index, -1); }} disabled={index === 0}>↑</button>
                      <button title="Move down" onClick={(e) => { e.stopPropagation(); moveSlide(index, 1); }} disabled={index === totalSlides - 1}>↓</button>
                      <button title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}>⧉</button>
                      <button title="Delete" className="thumb-delete" onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} disabled={totalSlides <= 1}>×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide sorter collapsed toggle */}
      {editMode && !showSlideSorter && (
        <button
          className="slide-sorter-toggle"
          onClick={() => setShowSlideSorter(true)}
          title="Show slide sorter"
        >
          ▲ Slides ({totalSlides})
        </button>
      )}

      {/* Slide JSON Editor Modal */}
      <AnimatePresence>
        {editSlideJSON && (
          <motion.div
            className="import-json-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditSlideJSON(null)}
          >
            <motion.div
              className="import-json-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="import-json-header">
                <h2>Edit Slide {editSlideJSON.index + 1} JSON</h2>
                <p>Images are shown as [[MEDIA]] — they are preserved when you apply. Edit text fields freely.</p>
                <button className="import-json-close" onClick={() => setEditSlideJSON(null)}>×</button>
              </div>
              <div className="import-json-body">
                <textarea
                  className="import-json-textarea"
                  value={editSlideJSON.text}
                  onChange={(e) => setEditSlideJSON(prev => ({ ...prev, text: e.target.value, error: '' }))}
                  rows={20}
                  spellCheck={false}
                />
                {editSlideJSON.error && <div className="import-json-error">{editSlideJSON.error}</div>}
              </div>
              <div className="import-json-actions">
                <button className="builder-btn secondary" onClick={() => setEditSlideJSON(null)}>Cancel</button>
                <button
                  className="builder-btn primary"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(editSlideJSON.text);
                      if (!parsed.type) {
                        setEditSlideJSON(prev => ({ ...prev, error: 'Slide must have a "type" field.' }));
                        return;
                      }
                      // Restore [[MEDIA]] placeholders from original slide data
                      const original = editSlideJSON.originalSlide;
                      const restoreMedia = (edited, orig) => {
                        if (edited === '[[MEDIA]]') return orig;
                        if (Array.isArray(edited)) return edited.map((item, i) => restoreMedia(item, Array.isArray(orig) ? orig[i] : undefined));
                        if (edited && typeof edited === 'object' && orig && typeof orig === 'object') {
                          const r = {};
                          for (const k in edited) r[k] = restoreMedia(edited[k], orig[k]);
                          return r;
                        }
                        return edited;
                      };
                      const restored = restoreMedia(parsed, original);
                      setProject(prev => ({
                        ...prev,
                        slides: prev.slides.map((s, i) => i === editSlideJSON.index ? restored : s)
                      }));
                      setEditSlideJSON(null);
                    } catch (e) {
                      setEditSlideJSON(prev => ({ ...prev, error: `JSON parse error: ${e.message}` }));
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Project JSON Editor Modal */}
      <AnimatePresence>
        {editFullJSON && (
          <motion.div
            className="import-json-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditFullJSON(null)}
          >
            <motion.div
              className="import-json-modal import-json-modal-full"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="import-json-header">
                <h2>Edit Full Case Study JSON</h2>
                <p>Images are shown as [[MEDIA]] — they are preserved when you apply. Edit all slides at once.</p>
                <button className="import-json-close" onClick={() => setEditFullJSON(null)}>×</button>
              </div>
              <div className="import-json-body">
                <textarea
                  className="import-json-textarea"
                  value={editFullJSON.text}
                  onChange={(e) => setEditFullJSON(prev => ({ ...prev, text: e.target.value, error: '' }))}
                  rows={30}
                  spellCheck={false}
                />
                {editFullJSON.error && <div className="import-json-error">{editFullJSON.error}</div>}
              </div>
              <div className="import-json-actions">
                <button className="builder-btn secondary" onClick={() => setEditFullJSON(null)}>Cancel</button>
                <button
                  className="builder-btn primary"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(editFullJSON.text);
                      if (!parsed.slides || !Array.isArray(parsed.slides)) {
                        setEditFullJSON(prev => ({ ...prev, error: 'JSON must have a "slides" array.' }));
                        return;
                      }
                      const original = editFullJSON.originalProject;
                      const restoreMedia = (edited, orig) => {
                        if (edited === '[[MEDIA]]') return orig;
                        if (Array.isArray(edited)) return edited.map((item, i) => restoreMedia(item, Array.isArray(orig) ? orig[i] : undefined));
                        if (edited && typeof edited === 'object' && orig && typeof orig === 'object') {
                          const r = {};
                          for (const k in edited) r[k] = restoreMedia(edited[k], orig[k]);
                          return r;
                        }
                        return edited;
                      };
                      const restored = restoreMedia(parsed, original);
                      setProject(migrateCaseStudyImagePathsToWebp(restored));
                      setEditFullJSON(null);
                    } catch (e) {
                      setEditFullJSON(prev => ({ ...prev, error: `JSON parse error: ${e.message}` }));
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import JSON Modal */}
      <AnimatePresence>
        {showImportJSON && (
          <motion.div
            className="import-json-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImportJSON(false)}
          >
            <motion.div
              className="import-json-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="import-json-header">
                <h2>📥 Import Case Study JSON</h2>
                <p>Paste the JSON that ChatGPT generated. It will replace the current slides while preserving existing images.</p>
                <button className="import-json-close" onClick={() => setShowImportJSON(false)}>×</button>
              </div>
              <div className="import-json-body">
                <textarea
                  className="import-json-textarea"
                  value={importJSONText}
                  onChange={(e) => { setImportJSONText(e.target.value); setImportError(''); }}
                  placeholder={'Paste the full JSON here...\n\n{\n  "title": "Project Name",\n  "subtitle": "...",\n  "category": "...",\n  "year": "2024",\n  "color": "#E8847C",\n  "slides": [\n    { "type": "intro", ... },\n    ...\n  ]\n}'}
                  rows={18}
                  spellCheck={false}
                />
                {importError && <div className="import-json-error">{importError}</div>}
              </div>
              <div className="import-json-actions">
                <button className="builder-btn secondary" onClick={() => setShowImportJSON(false)}>Cancel</button>
                <button className="builder-btn primary" onClick={handleImportJSON} disabled={!importJSONText.trim()}>
                  Apply JSON
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox for viewing images in full size */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>×</button>
            <motion.img 
              src={lightboxImage} 
              alt="Full size view"
              className="lightbox-image"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { TemplatePreview };
export default CaseStudy;
