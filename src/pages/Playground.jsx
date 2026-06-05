import { useRef, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEdit } from '../context/EditContext';
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

  const handleBlur = () => {
    const el = ref.current;
    if (!el) return;
    const next = multiline ? el.innerText : el.innerText.replace(/\n/g, ' ');
    if (next !== value) onChange(next);
  };
  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
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
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
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

const PlaygroundProject = ({ project, index, total, editMode, onUpdate, onRemove, onMove, fallbackCtaUrl }) => {
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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Left rail — sticky title */}
      <div className="pg-project-rail">
        <Editable
          value={project.title}
          onChange={(v) => set({ title: v })}
          tag="h2"
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
            <a className="pg-cta" href={ctaUrl} target="_blank" rel="noopener noreferrer">
              <span>{cta.label}</span>
              <span className="pg-cta-arrow" aria-hidden="true">→</span>
            </a>
          )
        )}

        {editMode && (
          <div className="pg-project-controls">
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
            <Media media={hero} className="pg-hero-media" />
            {!hero?.src && !editMode ? null : null}
            {!hero?.src && editMode && <div className="pg-slot-empty">Hero image / video</div>}
            {editMode && (
              <div className="pg-hero-edit">
                <MediaUploader media={hero} onChange={(m) => set({ hero: m })} label="hero" />
              </div>
            )}
          </div>
        )}

        {/* Gallery — 2-column masonry of images / videos */}
        {(gallery.length > 0 || editMode) && (
          <>
            <div className="pg-gallery">
              {gallery.map((m, gi) => (
                <div className="pg-gallery-item" key={m.id || gi}>
                  <Media media={m} className="pg-gallery-media" />
                  {!m.src && editMode && <div className="pg-slot-empty pg-slot-empty--gallery">{m.type === 'video' ? 'Video' : 'Image'}</div>}
                  {editMode && (
                    <div className="pg-gallery-edit">
                      <div className="pg-gallery-tools">
                        <button type="button" className="pg-ctrl" onClick={() => moveGallery(m.id, -1)} disabled={gi === 0} title="Earlier">←</button>
                        <button type="button" className="pg-ctrl" onClick={() => moveGallery(m.id, 1)} disabled={gi === gallery.length - 1} title="Later">→</button>
                        <button type="button" className="pg-ctrl pg-ctrl--danger" onClick={() => removeGallery(m.id)} title="Remove">✕</button>
                      </div>
                      <MediaUploader media={m} onChange={(media) => updateGallery(m.id, media)} label="" />
                    </div>
                  )}
                </div>
              ))}
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

  return (
    <div className="playground-page">
      <div className="playground-container">
        <motion.header
          className="playground-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <Editable
            value={playground.sectionLabel}
            onChange={(v) => updateContent('playground', 'sectionLabel', v)}
            className="playground-label"
            placeholder="Playground"
          />
          <Editable
            value={playground.sectionTitle}
            onChange={(v) => updateContent('playground', 'sectionTitle', v)}
            tag="h1"
            className="playground-title"
            placeholder="Experiments & side bets"
          />
          <Editable
            value={playground.intro}
            onChange={(v) => updateContent('playground', 'intro', v)}
            tag="p"
            className="playground-intro"
            multiline
            placeholder="A line or two framing why these exist…"
          />
        </motion.header>

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
    </div>
  );
};

export default Playground;
