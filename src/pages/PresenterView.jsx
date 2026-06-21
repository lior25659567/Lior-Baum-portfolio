import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseStudyDataAsync } from '../data/caseStudyData';
import { savedCaseStudies } from '../data/case-studies/index.js';
import './PresenterView.css';

// Ordered list of case-study slugs (portfolio / data-file order). Used to walk
// to the previous/next deck from the presenter.
const STUDY_SLUGS = Object.keys(savedCaseStudies);

const PresenterView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [index, setIndex] = useState(0);
  // Live notes pushed from the shared deck — shown instead of the loaded copy
  // so freshly-typed (unsaved) notes appear immediately. null ⇒ fall back to
  // the loaded deck's notes for the current slide.
  const [liveNotes, setLiveNotes] = useState(null);
  // Whether a lightbox is currently open anywhere (tracked off the channel).
  // While open, navigation is frozen and Esc closes the lightbox, not the window.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxOpenRef = useRef(false);
  useEffect(() => { lightboxOpenRef.current = lightboxOpen; }, [lightboxOpen]);
  // Timestamp of the last time a fullscreen video was dismissed. Escape that
  // exits video fullscreen must NOT also close the presenter window — we ignore
  // keys while fullscreen is active or was just exited.
  const fsExitedAtRef = useRef(0);
  useEffect(() => {
    const onFs = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fs) fsExitedAtRef.current = Date.now();
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);
  const channelRef = useRef(null);
  const frameRef = useRef(null);
  const keyHandlerRef = useRef(null);
  const indexRef = useRef(0);
  // Stable id so this window ignores the slide messages it broadcasts itself.
  // Generated on mount (kept out of render to satisfy hook purity).
  const peerId = useRef('');
  useEffect(() => {
    peerId.current = `presenter-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);

  useEffect(() => { indexRef.current = index; }, [index]);

  // Record the study being presented so the shared deck can follow even when it
  // is a hidden background tab (where the live channel message is throttled).
  // The deck reconciles to this on becoming visible. Cleared when the presenter
  // window actually closes (SPA deck-switches don't fire pagehide).
  useEffect(() => {
    const write = () => {
      try { localStorage.setItem('cs-present-study', JSON.stringify({ slug: projectId, ts: Date.now() })); } catch { /* ignore */ }
    };
    write();
    // Heartbeat: refresh the timestamp while the presenter is actually open, so
    // the audience deck can tell a LIVE presentation apart from a leftover
    // marker. The reconciler only follows a fresh marker.
    const hb = setInterval(write, 5000);
    return () => clearInterval(hb);
  }, [projectId]);
  useEffect(() => {
    const clear = () => { try { localStorage.removeItem('cs-present-study'); } catch { /* ignore */ } };
    window.addEventListener('pagehide', clear);
    // Also clear on unmount: leaving the presenter via in-app (SPA) navigation
    // doesn't fire pagehide, so without this the marker would persist and make
    // the audience deck reconcile back to the last-presented study for 30 min.
    return () => { window.removeEventListener('pagehide', clear); clear(); };
  }, []);

  // Switching case studies remounts on the same component (only the param
  // changes), so reset per-deck state to the new study's start.
  useEffect(() => {
    setIndex(0);
    setLiveNotes(null);
    setLightboxOpen(false);
  }, [projectId]);

  const deckIdx = STUDY_SLUGS.indexOf(projectId);

  // Walk to the previous/next case study. Tell the shared deck to follow via the
  // current channel, then navigate ourselves; both land on slide 0 of the new
  // deck and re-sync over the new channel.
  const goStudy = useCallback((delta) => {
    if (lightboxOpenRef.current) return; // frozen while a lightbox is zoomed
    const i = STUDY_SLUGS.indexOf(projectId);
    const ni = i + delta;
    if (i < 0 || ni < 0 || ni >= STUDY_SLUGS.length) return;
    const nextSlug = STUDY_SLUGS[ni];
    channelRef.current?.postMessage({ type: 'goto-study', slug: nextSlug, src: peerId.current });
    navigate(`/present/${nextSlug}`);
  }, [projectId, navigate]);

  // Load the deck for notes + slide count (same accessor the case study uses).
  useEffect(() => {
    let alive = true;
    getCaseStudyDataAsync(projectId).then((data) => {
      if (alive) setProject(data);
    });
    return () => { alive = false; };
  }, [projectId]);

  // Embed the real deck in follow-mode. The src is stable (derived from
  // projectId) so the iframe never reloads per slide — it mirrors the channel
  // on its own and just follows along.
  const iframeSrc = projectId ? `/project/${projectId}?follow=1` : null;

  // Bidirectional channel: receive index changes from the shared deck, and
  // (in `go`) broadcast our own navigation so the shared deck follows us.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(`cs-presenter:${projectId}`);
    channelRef.current = ch;
    ch.onmessage = (e) => {
      const msg = e.data;
      if (!msg || msg.src === peerId.current) return;
      if (msg.type === 'index' && typeof msg.index === 'number') {
        setIndex(msg.index);
        if (typeof msg.notes === 'string') setLiveNotes(msg.notes);
      } else if (msg.type === 'goto-study' && typeof msg.slug === 'string') {
        // A deck switched studies (e.g. the in-deck "Next project" link clicked
        // in the preview) — follow it so notes stay in step with the deck.
        if (msg.slug !== projectId) navigate(`/present/${msg.slug}`);
      } else if (msg.type === 'lightbox') {
        setLightboxOpen(!!msg.url);
      } else if (msg.type === 'ready') {
        // Answer a follower preview that just mounted.
        ch.postMessage({ type: 'index', index: indexRef.current, src: peerId.current });
      }
    };
    // Ask the shared deck for the current index on mount.
    ch.postMessage({ type: 'ready', src: peerId.current });
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [projectId]);

  const slides = project?.slides || [];
  const total = slides.length;
  const current = slides[index];

  // Navigate from the presenter window; drives the shared deck via the channel.
  const go = useCallback((delta) => {
    if (lightboxOpenRef.current) return; // frozen while a lightbox is zoomed
    const max = Math.max(total - 1, 0);
    const nextIdx = Math.min(Math.max(indexRef.current + delta, 0), max);
    if (nextIdx === indexRef.current) return;
    setIndex(nextIdx);
    // Fall back to loaded notes for the new slide until the shared deck
    // answers with its live notes (avoids briefly showing the old slide's).
    setLiveNotes(null);
    channelRef.current?.postMessage({ type: 'index', index: nextIdx, src: peerId.current });
  }, [total]);

  // Keyboard: arrows / space / page keys navigate; Escape closes the lightbox if
  // one is open, otherwise the window. The handler is also attached to the embed
  // iframe (via onLoad) so keys keep working after you click into the preview.
  useEffect(() => {
    const onKey = (e) => {
      // While a video is fullscreen (or Esc just exited one), let the browser /
      // video own the keys — don't close the window or navigate. Covers videos
      // fullscreened inside the preview iframe too (the top doc's fullscreen
      // element is then the iframe).
      const inFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (inFs || Date.now() - fsExitedAtRef.current < 400) return;
      if (e.key === 'Escape') {
        if (lightboxOpenRef.current) {
          // Close the synced lightbox everywhere instead of the window.
          channelRef.current?.postMessage({ type: 'lightbox', url: null, src: peerId.current });
          setLightboxOpen(false);
          return;
        }
        window.close();
        return;
      }
      if (lightboxOpenRef.current) return; // navigation frozen while zoomed
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        go(-1);
      } else if (e.key === ']') {
        e.preventDefault();
        goStudy(1); // next case study
      } else if (e.key === '[') {
        e.preventDefault();
        goStudy(-1); // previous case study
      }
    };
    keyHandlerRef.current = onKey;
    window.addEventListener('keydown', onKey);
    // Same-origin embed: attach to its window too if it's already loaded, so
    // focus inside the preview doesn't swallow navigation keys.
    let cw = null;
    try { cw = frameRef.current?.contentWindow; } catch { cw = null; }
    if (cw) { try { cw.addEventListener('keydown', onKey); } catch { /* ignore */ } }
    return () => {
      window.removeEventListener('keydown', onKey);
      try { cw?.removeEventListener('keydown', onKey); } catch { /* ignore */ }
      keyHandlerRef.current = null;
    };
  }, [go, goStudy]);

  // On the last slide, the slide "Next" button rolls over to the next case
  // study (if any) instead of dead-ending.
  const onLastSlide = total === 0 || index >= total - 1;
  const isLastDeck = deckIdx < 0 || deckIdx >= STUDY_SLUGS.length - 1;
  const nextRollsToDeck = onLastSlide && !isLastDeck;

  return (
    <div className="presenter-view">
      <div className="presenter-deckbar">
        <button
          type="button"
          className="presenter-deck-btn"
          onClick={() => goStudy(-1)}
          disabled={deckIdx <= 0}
        >
          ‹ Deck
        </button>
        <span className="presenter-deck-title">
          {project?.title || '…'}
          {STUDY_SLUGS.length > 0 && (
            <span className="presenter-deck-pos">{(deckIdx >= 0 ? deckIdx + 1 : '?')} / {STUDY_SLUGS.length}</span>
          )}
        </span>
        <button
          type="button"
          className="presenter-deck-btn"
          onClick={() => goStudy(1)}
          disabled={deckIdx < 0 || deckIdx >= STUDY_SLUGS.length - 1}
        >
          Deck ›
        </button>
      </div>
      <div className="presenter-stage">
        {iframeSrc && (
          <iframe
            ref={frameRef}
            className="presenter-slide-frame"
            src={iframeSrc}
            title="Current slide"
            allowFullScreen
            allow="fullscreen"
            onLoad={() => {
              try {
                const cw = frameRef.current?.contentWindow;
                if (cw && keyHandlerRef.current) cw.addEventListener('keydown', keyHandlerRef.current);
              } catch { /* cross-doc access can throw; ignore */ }
            }}
          />
        )}
        <div className="presenter-position">
          {project ? `${index + 1} / ${total}` : '…'}
        </div>
      </div>

      <div className="presenter-notes-body">
        {(() => {
          const notesText = liveNotes != null ? liveNotes : current?.presenterNotes;
          return notesText
            ? notesText.split('\n').map((line, i) => <p key={i} dir="auto">{line || ' '}</p>)
            : <p className="presenter-empty">(no notes for this slide)</p>;
        })()}
      </div>

      <div className="presenter-controls">
        <button type="button" className="presenter-nav-btn" onClick={() => go(-1)} disabled={index <= 0}>
          ‹ Prev
        </button>
        <span className="presenter-controls-hint">← / → slides · [ / ] case study · Esc to close</span>
        <button
          type="button"
          className="presenter-nav-btn"
          onClick={() => (onLastSlide ? goStudy(1) : go(1))}
          disabled={onLastSlide && isLastDeck}
        >
          {nextRollsToDeck ? 'Next deck ›' : 'Next ›'}
        </button>
      </div>
    </div>
  );
};

export default PresenterView;
