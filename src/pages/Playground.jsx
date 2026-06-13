import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { useEdit } from '../context/EditContext';
import AnimatedButton from '../components/AnimatedButton';
import Footer from '../components/Footer';
import './Playground.css';

// Add scheme to bare URLs so `dribbble.com/...` works as an external link.
const normalizeUrl = (u) => {
  if (!u || typeof u !== 'string') return '';
  const t = u.trim();
  if (!t) return '';
  if (/^(https?:)?\/\//i.test(t) || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return `https://${t}`;
};

// ── Backward-compat: read the new project shape, falling back to the old
//    flat card fields so existing playground items still render. ──────────
const getParagraphs = (p) =>
  Array.isArray(p.paragraphs) ? p.paragraphs : [p.description ?? p.learned ?? p.context].filter(Boolean);
const getHero = (p) =>
  p.hero ||
  (p.video ? { type: 'video', src: p.video, poster: p.image || '' } : null) ||
  (p.image ? { type: 'image', src: p.image, aspect: p.aspect } : null);
const getGallery = (p) => (Array.isArray(p.gallery) ? p.gallery : []);
// How many of this item fit across a row: 1 (full), 2 (half), 3 (third).
// Migrates the old per-item `fullWidth` flag (full → 1, otherwise 2).
const itemPerRow = (m) => {
  if (m.perRow === 1 || m.perRow === 2 || m.perRow === 3) return m.perRow;
  return m.fullWidth ? 1 : 2;
};
const getLink = (p) => p.link || { url: p.url || '', label: p.linkLabel || '' };
const getCta = (p) => p.cta || { url: '', label: '' };

// ── Media helpers ─────────────────────────────────────────────────────────
const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1800;
        const maxH = 1800;
        let { width, height } = img;
        const aspect = width && height ? +(width / height).toFixed(4) : undefined;
        const scale = Math.min(1, maxW / width, maxH / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = typeof event.target.result === 'string' && event.target.result.startsWith('data:image/png');
        resolve({ type: 'image', src: isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.9), aspect });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

const readVideoFile = (file) =>
  new Promise((resolve, reject) => {
    if (file.size > 15 * 1024 * 1024) {
      alert('That clip is over 15 MB. Host it (e.g. on your CDN) and paste the URL in the “Video URL” field instead — keeps the site fast.');
      reject(new Error('too-large'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve({ type: 'video', src: e.target.result, poster: '' });
    reader.readAsDataURL(file);
  });

// Inline editable text — contentEditable, same pattern as About.
const Editable = ({ value, onChange, tag: Tag = 'span', className, multiline = false, placeholder = 'Edit…' }) => {
  const { editMode } = useEdit();
  const ref = useRef(null);

  // Keep the latest typed text + props in refs so we can commit reliably even
  // when blur never fires (navigating away, toggling edit mode off, unmount).
  const pendingRef = useRef(value);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;
  // Re-sync the pending buffer whenever the saved value changes from outside
  // (e.g. after a commit) so a later flush can't clobber it with stale text.
  useEffect(() => { pendingRef.current = value; }, [value]);

  const commit = useCallback(() => {
    if (pendingRef.current !== valueRef.current) onChangeRef.current(pendingRef.current);
  }, []);

  // Capture every keystroke/paste into the ref (no React state → no re-render,
  // so the caret never jumps mid-typing).
  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    pendingRef.current = multiline ? el.innerText : el.innerText.replace(/\n/g, ' ');
  };

  // Flush when leaving edit mode (component stays mounted, just swaps to the
  // read-only branch) and when unmounting (page navigation).
  useEffect(() => {
    if (!editMode) commit();
  }, [editMode, commit]);
  useEffect(() => () => commit(), [commit]);

  const handleBlur = () => {
    handleInput();
    commit();
  };
  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  // Paste as PLAIN TEXT — strip the source's font/color/markup so pasted
  // titles/copy inherit the site's styling instead of foreign formatting.
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const clean = multiline ? text : text.replace(/\s+/g, ' ');
    if (document.execCommand) {
      document.execCommand('insertText', false, clean);
      return;
    }
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    sel.deleteFromDocument();
    sel.getRangeAt(0).insertNode(document.createTextNode(clean));
    sel.collapseToEnd();
  };

  if (!editMode) {
    if (!value) return null;
    return <Tag className={className}>{value}</Tag>;
  }
  return (
    <Tag
      ref={ref}
      className={`${className || ''} pg-editable`}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-placeholder={placeholder}
    >
      {value}
    </Tag>
  );
};

// Play videos only while on screen — matters given the heavy-MP4 history.
const useInViewVideo = (ref, isVideo) => {
  useEffect(() => {
    if (!isVideo) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? el.play().catch(() => {}) : el.pause()),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, isVideo]);
};

// Render one media object (image or autoplaying muted video).
const Media = ({ media, className }) => {
  const ref = useRef(null);
  const isVideo = media?.type === 'video';
  useInViewVideo(ref, isVideo);
  if (!media?.src) return null;
  if (isVideo) {
    return (
      <video
        ref={ref}
        className={className}
        src={media.src}
        poster={media.poster || undefined}
        muted
        loop
        playsInline
        controls
        preload="metadata"
      />
    );
  }
  return <img className={className} src={media.src} alt="" loading="lazy" />;
};

// Edit-mode controls to set a media object: image upload, video upload, video URL, clear.
const MediaUploader = ({ media, onChange, label = 'media' }) => {
  const imgRef = useRef(null);
  const vidRef = useRef(null);

  const onImg = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onChange(await compressImage(file));
  };
  const onVid = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const m = await readVideoFile(file);
      onChange({ ...m, poster: media?.poster || '' });
    } catch { /* size-rejected */ }
  };

  return (
    <div className="pg-uploader">
      <input ref={imgRef} type="file" accept="image/*" hidden onChange={onImg} />
      <input ref={vidRef} type="file" accept="video/*" hidden onChange={onVid} />
      <button type="button" className="pg-media-btn" onClick={() => imgRef.current?.click()}>
        {media?.type === 'image' ? 'Replace image' : `Image`}
      </button>
      <button type="button" className="pg-media-btn" onClick={() => vidRef.current?.click()}>
        {media?.type === 'video' ? 'Replace video' : 'Video'}
      </button>
      <input
        type="text"
        className="pg-edit-input"
        value={media?.type === 'video' && /^https?:/i.test(media.src || '') ? media.src : ''}
        onChange={(e) => onChange({ type: 'video', src: e.target.value, poster: media?.poster || '' })}
        placeholder="…or paste a video URL"
      />
      {media?.src && (
        <button type="button" className="pg-media-btn pg-media-btn--ghost" onClick={() => onChange(null)}>
          Clear {label}
        </button>
      )}
    </div>
  );
};

// Fullscreen image viewer. Closes on backdrop click / ✕ / Esc; ←/→ navigate.
const Lightbox = ({ items, index, onClose, onNav }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNav(-1);
      else if (e.key === 'ArrowRight') onNav(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNav]);

  const multiple = items.length > 1;

  return (
    <motion.div
      className="pg-lightbox"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button type="button" className="pg-lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      {multiple && (
        <button
          type="button"
          className="pg-lightbox-nav pg-lightbox-nav--prev"
          onClick={(e) => { e.stopPropagation(); onNav(-1); }}
          aria-label="Previous"
        >‹</button>
      )}
      <motion.img
        key={index}
        className="pg-lightbox-img"
        src={items[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
      {multiple && (
        <button
          type="button"
          className="pg-lightbox-nav pg-lightbox-nav--next"
          onClick={(e) => { e.stopPropagation(); onNav(1); }}
          aria-label="Next"
        >›</button>
      )}
      {multiple && <span className="pg-lightbox-count">{index + 1} / {items.length}</span>}
    </motion.div>
  );
};

const PlaygroundProject = ({ project, index, total, editMode, onUpdate, onRemove, onMove, onReorder, onOpenLightbox, fallbackCtaUrl }) => {
  const paragraphs = getParagraphs(project);
  const hero = getHero(project);
  const gallery = getGallery(project);
  const link = getLink(project);
  const linkUrl = normalizeUrl(link.url);
  const cta = getCta(project);
  // Per-project URL wins; otherwise fall back to the global CV link so a
  // "View my CV" CTA works without pasting the link into every project.
  const ctaUrl = normalizeUrl(cta.url) || fallbackCtaUrl;

  const set = useCallback((patch) => onUpdate(project.id, patch), [onUpdate, project.id]);

  // All zoomable images in this project (hero first, then gallery) — drives the lightbox.
  const lightboxImages = useMemo(() => {
    const arr = [];
    if (hero?.type === 'image' && hero.src) arr.push(hero.src);
    gallery.forEach((m) => { if (m.type === 'image' && m.src) arr.push(m.src); });
    return arr;
  }, [hero, gallery]);
  const openImage = (src) => {
    const i = lightboxImages.indexOf(src);
    if (i >= 0) onOpenLightbox(lightboxImages, i);
  };
  const canZoom = (m) => !editMode && m?.type === 'image' && !!m.src;

  // Paragraph ops
  const setParagraph = (i, text) => {
    const next = [...paragraphs];
    next[i] = text;
    set({ paragraphs: next });
  };
  const addParagraph = () => set({ paragraphs: [...paragraphs, ''] });
  const removeParagraph = (i) => set({ paragraphs: paragraphs.filter((_, idx) => idx !== i) });

  // Gallery ops
  const addGalleryImage = () => set({ gallery: [...gallery, { id: `m-${Date.now()}`, type: 'image', src: '', aspect: 1.3333 }] });
  const addGalleryVideo = () => set({ gallery: [...gallery, { id: `m-${Date.now()}`, type: 'video', src: '', poster: '' }] });
  const updateGallery = (id, media) =>
    set({ gallery: gallery.map((g) => (g.id === id ? (media ? { ...g, ...media } : { ...g, src: '', poster: '' }) : g)) });
  const removeGallery = (id) => set({ gallery: gallery.filter((g) => g.id !== id) });
  const moveGallery = (id, dir) => {
    const i = gallery.findIndex((g) => g.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[i], next[j]] = [next[j], next[i]];
    set({ gallery: next });
  };

  return (
    <motion.section
      className={`pg-project${editMode ? ' pg-project--editing' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
    >
      {/* Left rail — sticky title */}
      <div className="pg-project-rail">
        <Editable
          value={project.title}
          onChange={(v) => set({ title: v })}
          tag="h3"
          className="pg-project-title"
          placeholder="Project name"
        />
        <Editable
          value={project.meta}
          onChange={(v) => set({ meta: v })}
          className="pg-project-meta"
          placeholder="Year · context (optional)"
        />

        {/* Optional CTA — secondary button (e.g. "View my CV") */}
        {editMode ? (
          <div className="pg-cta-edit">
            <input
              type="text"
              className="pg-edit-input pg-edit-input--light"
              value={cta.label}
              onChange={(e) => set({ cta: { ...cta, label: e.target.value } })}
              placeholder="CTA text (e.g. View my CV)"
            />
            <input
              type="text"
              className="pg-edit-input pg-edit-input--light"
              value={cta.url}
              onChange={(e) => set({ cta: { ...cta, url: e.target.value } })}
              placeholder="CTA URL (blank = your CV link)"
            />
          </div>
        ) : (
          ctaUrl && cta.label && (
            <AnimatedButton
              href={ctaUrl}
              variant="outline"
              target="_blank"
              className="pg-cta"
            >
              {cta.label}
            </AnimatedButton>
          )
        )}

        {editMode && (
          <div className="pg-project-controls">
            <label className="pg-pos" title="Set position">
              <span className="pg-pos-label">Position</span>
              <select
                className="pg-pos-select"
                value={index}
                onChange={(e) => onReorder(project.id, Number(e.target.value))}
              >
                {Array.from({ length: total }, (_, i) => (
                  <option key={i} value={i}>{i + 1}</option>
                ))}
              </select>
            </label>
            <button type="button" className="pg-ctrl" onClick={() => onMove(project.id, -1)} disabled={index === 0} title="Move up">↑</button>
            <button type="button" className="pg-ctrl" onClick={() => onMove(project.id, 1)} disabled={index === total - 1} title="Move down">↓</button>
            <button type="button" className="pg-ctrl pg-ctrl--danger" onClick={() => onRemove(project.id)} title="Delete project">✕</button>
          </div>
        )}
      </div>

      {/* Right column — copy, hero, gallery */}
      <div className="pg-project-body">
        <div className="pg-copy">
          {paragraphs.map((text, i) => (
            <div className="pg-copy-row" key={i}>
              <Editable
                value={text}
                onChange={(v) => setParagraph(i, v)}
                tag="p"
                className="pg-copy-p"
                multiline
                placeholder="Write a paragraph…"
              />
              {editMode && paragraphs.length > 1 && (
                <button type="button" className="pg-row-remove" title="Remove paragraph" onClick={() => removeParagraph(i)}>×</button>
              )}
            </div>
          ))}

          {editMode && (
            <button type="button" className="pg-inline-add" onClick={addParagraph}>+ Add paragraph</button>
          )}

          {/* Optional link line (e.g. "Read the article on Muzli") */}
          {editMode ? (
            <div className="pg-link-edit">
              <input
                type="text"
                className="pg-edit-input pg-edit-input--light"
                value={link.label}
                onChange={(e) => set({ link: { ...link, label: e.target.value } })}
                placeholder="Link text (e.g. Read the article on Muzli)"
              />
              <input
                type="text"
                className="pg-edit-input pg-edit-input--light"
                value={link.url}
                onChange={(e) => set({ link: { ...link, url: e.target.value } })}
                placeholder="Link URL (optional)"
              />
            </div>
          ) : (
            linkUrl && link.label && (
              <p className="pg-copy-link-row">
                <a className="pg-copy-link" href={linkUrl} target="_blank" rel="noopener noreferrer">{link.label}</a>
              </p>
            )
          )}
        </div>

        {/* Hero media — full width */}
        {(hero?.src || editMode) && (
          <div className="pg-hero">
            {canZoom(hero) ? (
              <button type="button" className="pg-media-zoom" onClick={() => openImage(hero.src)} aria-label="View image">
                <Media media={hero} className="pg-hero-media" />
              </button>
            ) : (
              hero?.src && <div className="pg-media-frame"><Media media={hero} className="pg-hero-media" /></div>
            )}
            {!hero?.src && !editMode ? null : null}
            {!hero?.src && editMode && <div className="pg-slot-empty">Hero image / video</div>}
            {editMode && (
              <div className="pg-hero-edit">
                <MediaUploader media={hero} onChange={(m) => set({ hero: m })} label="hero" />
              </div>
            )}
          </div>
        )}

        {/* Gallery — grid of images / videos; each item is 1, 2, or 3 across */}
        {(gallery.length > 0 || editMode) && (
          <>
            <div className="pg-gallery">
              {gallery.map((m, gi) => {
                const perRow = itemPerRow(m);
                return (
                <div className={`pg-gallery-item pg-gallery-item--w${perRow}`} key={m.id || gi}>
                  {canZoom(m) ? (
                    <button type="button" className="pg-media-zoom" onClick={() => openImage(m.src)} aria-label="View image">
                      <Media media={m} className="pg-gallery-media" />
                    </button>
                  ) : (
                    m.src && <div className="pg-media-frame"><Media media={m} className="pg-gallery-media" /></div>
                  )}
                  {!m.src && editMode && <div className="pg-slot-empty pg-slot-empty--gallery">{m.type === 'video' ? 'Video' : 'Image'}</div>}
                  {editMode && (
                    <div className="pg-gallery-edit">
                      <div className="pg-gallery-tools">
                        <button type="button" className="pg-ctrl" onClick={() => moveGallery(m.id, -1)} disabled={gi === 0} title="Earlier">←</button>
                        <button type="button" className="pg-ctrl" onClick={() => moveGallery(m.id, 1)} disabled={gi === gallery.length - 1} title="Later">→</button>
                        <span className="pg-perrow" title="Items per row (1 = full width)">
                          {[1, 2, 3].map((n) => (
                            <button
                              key={n}
                              type="button"
                              className={`pg-ctrl${perRow === n ? ' is-active' : ''}`}
                              onClick={() => updateGallery(m.id, { perRow: n })}
                            >
                              {n}
                            </button>
                          ))}
                        </span>
                        <button type="button" className="pg-ctrl pg-ctrl--danger" onClick={() => removeGallery(m.id)} title="Remove">✕</button>
                      </div>
                      <MediaUploader media={m} onChange={(media) => updateGallery(m.id, media)} label="" />
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            {editMode && (
              <div className="pg-gallery-add">
                <button type="button" className="pg-inline-add" onClick={addGalleryImage}>+ Add image</button>
                <button type="button" className="pg-inline-add" onClick={addGalleryVideo}>+ Add video</button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
};

const Playground = () => {
  const { content, editMode, updateContent } = useEdit();
  const playground = content.playground || {};
  const items = useMemo(() => playground.items || [], [playground.items]);
  const fallbackCtaUrl = normalizeUrl(content.hero?.cvLink || '');

  // Lightbox: { items: [src…], index } or null.
  const [lightbox, setLightbox] = useState(null);
  const openLightbox = useCallback((imgs, index) => setLightbox({ items: imgs, index }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const navLightbox = useCallback(
    (dir) => setLightbox((lb) => (lb ? { ...lb, index: (lb.index + dir + lb.items.length) % lb.items.length } : lb)),
    []
  );

  const setItems = (next) => updateContent('playground', 'items', next);
  const updateItem = (id, patch) => setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => setItems(items.filter((it) => it.id !== id));
  const addItem = () =>
    setItems([
      ...items,
      {
        id: `pg-${Date.now()}`,
        title: 'New project',
        meta: '',
        paragraphs: [''],
        link: { url: '', label: '' },
        cta: { url: '', label: '' },
        hero: null,
        gallery: [],
      },
    ]);
  const moveItem = (id, dir) => {
    const i = items.findIndex((it) => it.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  // Move a project directly to a chosen position (0-based).
  const reorderItem = (id, toIndex) => {
    const i = items.findIndex((it) => it.id === id);
    if (i < 0 || toIndex < 0 || toIndex >= items.length || toIndex === i) return;
    const next = [...items];
    const [moved] = next.splice(i, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);
  };

  // Hero intro — same reveal as the About hero (page load / refresh): the
  // eyebrow blur-fades up to its muted 0.65, then the two title lines rise
  // from below their clip mask with a gentle overshoot, slightly overlapped
  // so they read as one connected motion.
  const headerRef = useRef(null);
  const labelRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(labelRef.current,
        { y: 18, opacity: 0, filter: 'blur(4px)' },
        { y: 0, opacity: 0.65, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }
      );
      if (line1Ref.current) {
        tl.fromTo(line1Ref.current,
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.35'
        );
      }
      if (line2Ref.current) {
        tl.fromTo(line2Ref.current,
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.55'
        );
      }

      // Scroll-away / scroll-back — mirrors the About hero exactly: discrete
      // in/out on threshold crossings. Scrolling past the header fades the
      // title up and out; scrolling back brings the lines to full opacity and
      // the label back to its muted 0.65.
      const lineEls = [line1Ref, line2Ref].map((r) => r.current).filter(Boolean);
      const elements = [labelRef.current, ...lineEls].filter(Boolean);
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top top',
        end: 'bottom 20%',
        onLeave: () =>
          gsap.to(elements, { y: -50, opacity: 0, duration: 0.35, stagger: 0.025, ease: 'power2.in' }),
        onEnterBack: () => {
          gsap.to(lineEls, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
          gsap.to(labelRef.current, { y: 0, opacity: 0.65, duration: 0.5, ease: 'power3.out' });
        },
      });
    }, headerRef);
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  return (
    <div className="playground-page">
      <div className="playground-container">
        <header className="playground-header" ref={headerRef}>
          <div className="title-line-wrapper">
            <span className="section-label" ref={labelRef}>
              <Editable
                value={playground.sectionLabel}
                onChange={(v) => updateContent('playground', 'sectionLabel', v)}
                placeholder="Playground"
              />
            </span>
          </div>
          <h1 className="playground-title">
            <div className="title-line-wrapper">
              <div className="title-line" ref={line1Ref}>
                <span className="sans">
                  <Editable
                    value={playground.titleSans ?? playground.sectionTitle ?? ''}
                    onChange={(v) => updateContent('playground', 'titleSans', v)}
                    placeholder="A place for experiments between"
                  />
                </span>
              </div>
            </div>
            <div className="title-line-wrapper">
              <div className="title-line" ref={line2Ref}>
                <span className="serif accent">
                  <Editable
                    value={playground.titleSerif ?? ''}
                    onChange={(v) => updateContent('playground', 'titleSerif', v)}
                    placeholder="design and code"
                  />
                </span>
              </div>
            </div>
          </h1>
        </header>

        {items.length === 0 && !editMode ? (
          <p className="playground-empty">Nothing here yet — experiments are on the way.</p>
        ) : (
          <div className="playground-projects">
            {items.map((project, index) => (
              <PlaygroundProject
                key={project.id}
                project={project}
                index={index}
                total={items.length}
                editMode={editMode}
                onUpdate={updateItem}
                onRemove={removeItem}
                onMove={moveItem}
                onReorder={reorderItem}
                onOpenLightbox={openLightbox}
                fallbackCtaUrl={fallbackCtaUrl}
              />
            ))}

            {editMode && (
              <button type="button" className="playground-add" onClick={addItem}>
                <span className="playground-add-plus">+</span>
                <span>Add project</span>
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            items={lightbox.items}
            index={lightbox.index}
            onClose={closeLightbox}
            onNav={navLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Playground;
