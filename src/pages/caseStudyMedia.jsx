import { memo, useRef, useState, useEffect, useCallback } from 'react';
import imageVariantManifest from '../data/case-study-image-variants.json';

// ─── Responsive media helpers ────────────────────────────────────────────
// Shared by the slide deck (CaseStudy.jsx) and the article view
// (CaseStudyArticle.jsx). The build pipeline emits:
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

export function buildResponsiveWebp(src) {
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
  // `100vw` (was `75vw / 1440px`): tells the browser the image MAY occupy
  // the full viewport. On retina (DPR=2) this was already pulling the top
  // variant, so no change there. On Windows DPR=1 panels the previous
  // `75vw` advertised a smaller render size and biased the browser into
  // picking @960 — at the same physical display size that looks notably
  // softer than the @1440/@1920 retina users get. Overestimating costs
  // ~30% bandwidth on full-width slides but ends the Mac-vs-Windows
  // sharpness gap. Split layouts that actually render at ~50vw will fetch
  // a slightly larger variant than strictly needed — fine tradeoff.
  return { srcSet: srcset, sizes: '100vw' };
}

export function deriveVideoPoster(src) {
  if (typeof src !== 'string') return null;
  const m = src.match(/^(.*)\.mp4(\?.*)?$/i);
  return m ? `${m[1]}.poster.webp` : null;
}

export function deriveMobileVideoSrc(src) {
  if (typeof src !== 'string') return null;
  if (/\.mobile\.mp4(\?|$)/i.test(src)) return src;
  const m = src.match(/^(.*)\.mp4(\?.*)?$/i);
  return m ? `${m[1]}.mobile.mp4${m[2] || ''}` : null;
}

// Detect mobile viewport + data-saver network for adaptive media delivery.
// Re-evaluates on resize/connection change; safe on SSR (returns false).
export function useLowBandwidthMedia() {
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
export const LazyVideo = memo(({ src, poster, style, className, onClick, priority = 'lazy', playbackRate = 1, controls = false }) => {
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
  // Default playback speed: author-set `playbackRate` prop, else 1.5×. Viewers
  // change speed via the native player controls (the browser's speed menu).
  const effectiveRate = Number(playbackRate) || 1.5;
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
  // Only the current slide ('high') ever plays. Nearby slides preload their src
  // but stay paused on the poster so a video never starts before you're on its
  // slide (and stops when you leave).
  const tryPlay = useCallback((el) => {
    if (!el || !el.paused || priority !== 'high') return;
    el.muted = true;
    const p = el.play();
    if (p && p.catch) p.catch(() => {});
  }, [priority]);
  // Start when this slide becomes current; pause when it stops being current.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (priority === 'high') {
      tryPlay(el);
    } else {
      try { if (!el.paused) el.pause(); } catch { /* ignore */ }
    }
  }, [priority, tryPlay, visible]);
  // Apply playbackRate. Browsers reset playbackRate to 1 on every src change
  // and on some loop wraps, so we re-apply on visibility flips, on `loadedmetadata`,
  // and whenever the prop changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rate = Number(effectiveRate) || 1;
    try { el.defaultPlaybackRate = rate; } catch {}
    try { el.playbackRate = rate; } catch {}
  }, [effectiveRate, visible]);
  const handleCanPlay = useCallback((e) => {
    const el = e.currentTarget;
    const rate = Number(effectiveRate) || 1;
    try { el.playbackRate = rate; } catch {}
    tryPlay(el);
  }, [tryPlay, effectiveRate]);
  const handleLoadedData = useCallback((e) => {
    const el = e.currentTarget;
    const rate = Number(effectiveRate) || 1;
    try { el.playbackRate = rate; } catch {}
    tryPlay(el);
  }, [tryPlay, effectiveRate]);
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
      autoPlay={priority === 'high'}
      loop
      muted
      playsInline
      controls={controls}
      controlsList="nodownload"
      style={style}
      className={className}
      onClick={onClick}
      onCanPlay={handleCanPlay}
      onLoadedData={handleLoadedData}
      onError={handleError}
    />
  );
});

LazyVideo.displayName = 'LazyVideo';
