import { Fragment, createContext, useContext, useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedCaseStudies } from '../data/case-studies/index.js';
import { contactDefaults } from '../data/caseStudyData';
import { buildResponsiveWebp, LazyVideo, pickMediaFile } from './caseStudyMedia';
import EditableField from '../components/EditableField';
import {
  hasText, clean, oneLine, listOf, isVideoSrc, normalizeMedia,
  splitBold, articleBlockCategories, deriveArticleFromSlides, CONVERTIBLE_BLOCK_TYPES,
} from '../data/articleBlocks';
import './CaseStudyArticle.css';

// Lets module-level block renderers (e.g. FigureBlock) reach the media-library
// opener without threading it through every renderer's props.
const MediaLibraryContext = createContext(null);
// Provides onImageClick(src) → opens the shared slide lightbox. Null in edit
// mode (images carry replace controls then) so it only fires in the read view.
const LightboxContext = createContext(null);

// Readable labels for the block-type converter dropdown (block controls).
const BLOCK_TYPE_LABELS = {
  heading: 'Heading', paragraph: 'Paragraph', quote: 'Quote', callout: 'Callout',
  bullets: 'Bullets', cards: 'Cards', checklist: 'Checklist', metaGrid: 'Meta grid',
  labelRow: 'Label row', problemSolutionImpact: 'Problem · Solution · Impact', chapter: 'Chapter',
};

// ─────────────────────────────────────────────────────────────────────────
// CaseStudyArticle — the long-form reading view of a case study, and (in
// edit mode) its block-based editor.
//
// Content source: `project.article.blocks` when authored; otherwise a
// derived projection of the slides (deriveArticleFromSlides) as a public
// fallback. The two documents are fully independent once seeded.
//
// Modes:
//   view            → plain article + floating back button
//   edit + authored → block editor (inline text, add/move/duplicate/delete,
//                     figure upload) — all mutations go through `ops` which
//                     live in CaseStudy.jsx next to updateSlide, so the
//                     existing auto-save + Save-to-Code flows apply.
//   edit + derived  → read-only preview + seed bar (Seed from slides /
//                     Start blank)
// ─────────────────────────────────────────────────────────────────────────

const FIGURE_SIZES = {
  prose: '(min-width: 820px) 720px, 94vw',
  wide: '(min-width: 1240px) 1160px, 94vw',
  full: '(min-width: 1480px) 1400px, 96vw',
};

/* ── Rich text (**bold** markdown-lite) ───────────────────────────────── */

const Rich = ({ text }) => splitBold(text).map((seg, i) =>
  seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>
);

const Prose = ({ text, className = 'cs-article-p' }) => {
  if (!hasText(text)) return null;
  return clean(text)
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((para, i) => (
      <p key={i} className={className}><Rich text={para.trim()} /></p>
    ));
};

/* ── Media entry (shared by view + edit figure) ───────────────────────── */

const MediaEntry = ({ entry, tier }) => {
  const ref = useRef(null);
  const onImageClick = useContext(LightboxContext);
  const src = clean(entry.src);
  const embed = clean(entry.embedUrl);
  const video = !embed && (entry.isVideo || isVideoSrc(src));
  const [inView, setInView] = useState(false);
  // Embeds (cross-origin iframes) swallow the wheel event and trap page scroll.
  // A transparent shield intercepts the wheel so the page keeps scrolling; a
  // click activates the iframe for real interaction, and leaving re-shields it.
  const [embedActive, setEmbedActive] = useState(false);
  // Remounting the iframe (changing its key) reloads the embed from scratch, so
  // an animated embed replays from the start each time it scrolls into view.
  const [reloadKey, setReloadKey] = useState(0);
  const wasInView = useRef(false);
  useEffect(() => {
    if (!video && !embed) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        setInView(e.isIntersecting);
        if (!embed) return;
        if (e.isIntersecting && !wasInView.current) {
          setReloadKey((k) => k + 1); // scrolled into view → restart the embed
          setEmbedActive(false);      // and re-shield it for scroll
        } else if (!e.isIntersecting) {
          setEmbedActive(false);
        }
        wasInView.current = e.isIntersecting;
      }),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video, embed]);
  if (!src && !embed) return null;
  const resp = !video && src && !src.startsWith('data:') ? buildResponsiveWebp(src) : null;
  return (
    <div ref={ref} className={`cs-article-media-entry${entry.border ? ' cs-article-media-entry--bordered' : ''}${entry.border && entry.borderColor === 'cream' ? ' cs-article-media-entry--matcream' : ''}${entry.shadow === false ? ' cs-article-media-entry--noshadow' : ''}`}>
      {embed ? (
        <div className="cs-article-embed" onMouseLeave={() => setEmbedActive(false)}>
          <iframe
            key={reloadKey}
            src={embed}
            title={clean(entry.caption) || 'Embedded media'}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
          {!embedActive && (
            <button
              type="button"
              className="cs-article-embed-shield"
              aria-label="Activate embed"
              onClick={() => setEmbedActive(true)}
            />
          )}
        </div>
      ) : video ? (
        <LazyVideo src={src} priority={inView ? 'high' : 'lazy'} controls className="cs-article-media" />
      ) : (
        <img
          src={src}
          alt={clean(entry.caption) || ''}
          loading="lazy"
          decoding="async"
          className={`cs-article-media${onImageClick ? ' cs-article-media--zoom' : ''}`}
          {...(resp ? { srcSet: resp.srcSet, sizes: FIGURE_SIZES[tier] || FIGURE_SIZES.wide } : {})}
          {...(onImageClick ? {
            onClick: () => onImageClick(src),
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onImageClick(src); } },
            role: 'button',
            tabIndex: 0,
            title: 'Click to enlarge',
          } : {})}
        />
      )}
    </div>
  );
};

/* ── Carousel (mirrors the deck's carousel imageDisplayMode) ──────────── */

const ArticleCarousel = ({ entries, tier, interval }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = entries.length;
  useEffect(() => {
    if (paused || count < 2) return;
    const ms = Math.max(Number(interval) || 3500, 2000);
    const t = setInterval(() => setIdx((i) => (i + 1) % count), ms);
    return () => clearInterval(t);
  }, [paused, count, interval]);
  const isVideoEntry = (e) => e.isVideo || isVideoSrc(clean(e.src));
  return (
    <div
      className="cs-article-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
    >
      <div className="cs-article-carousel-frame">
        {entries.map((entry, i) => (
          <div key={i} className={`cs-article-carousel-item${i === idx ? ' is-active' : ''}`} aria-hidden={i !== idx}>
            {/* Videos only mount while active so a hidden one never autoplays. */}
            {(i === idx || !isVideoEntry(entry)) && <MediaEntry entry={entry} tier={tier} />}
          </div>
        ))}
        <button type="button" className="cs-article-carousel-arrow cs-article-carousel-arrow--prev" aria-label="Previous image"
          onClick={() => setIdx((idx - 1 + count) % count)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 6 9 12 15 18" /></svg>
        </button>
        <button type="button" className="cs-article-carousel-arrow cs-article-carousel-arrow--next" aria-label="Next image"
          onClick={() => setIdx((idx + 1) % count)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
        </button>
      </div>
      <div className="cs-article-carousel-dots" role="tablist">
        {entries.map((_, i) => (
          <button key={i} type="button" role="tab" aria-selected={i === idx}
            className={`cs-article-carousel-dot${i === idx ? ' is-active' : ''}`}
            aria-label={`Image ${i + 1} of ${count}`}
            onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
};

/* ── Block renderers ──────────────────────────────────────────────────── */

const HeadingBlock = ({ block, editing, onPatch }) => {
  const Tag = Number(block.level) === 3 ? 'h3' : 'h2';
  return (
    <>
      {(hasText(block.eyebrow) || editing) && (
        <p className="cs-article-eyebrow">
          {editing
            ? <EditableField value={block.eyebrow} onChange={(v) => onPatch({ eyebrow: v })} placeholder="Eyebrow (optional)" />
            : block.eyebrow}
        </p>
      )}
      <Tag className={Number(block.level) === 3 ? 'cs-article-h3' : 'cs-article-h2'}>
        {editing
          ? <EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline placeholder="Heading" />
          : oneLine(block.text)}
      </Tag>
    </>
  );
};

const ParagraphBlock = ({ block, editing, onPatch }) =>
  editing ? (
    <p className="cs-article-p">
      <EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline allowBold placeholder="Paragraph text — **bold** supported" />
    </p>
  ) : (
    <Prose text={block.text} />
  );

// Bullets: each item is a plain string OR { title, text }. A title renders as a
// bold lead-in ("**Title** the rest"), and maps to/from a card's title on convert.
const bulletTitle = (it) => (typeof it === 'object' && it ? (it.title || '') : '');
const bulletText = (it) => (typeof it === 'string' ? it : (it?.text || ''));

const BulletsBlock = ({ block, editing, onPatch, onConvert }) => {
  const items = listOf(block.items);
  const ListTag = block.ordered ? 'ol' : 'ul';
  // Set one field of a bullet, upgrading a plain-string item to { title, text }.
  const setField = (i, field, v) => onPatch({
    items: items.map((it, j) => {
      if (j !== i) return it;
      const obj = (typeof it === 'object' && it) ? { ...it } : { title: '', text: it || '' };
      obj[field] = v;
      return obj;
    }),
  });
  if (!editing && !items.some((it) => hasText(bulletText(it)) || hasText(bulletTitle(it)))) return null;
  return (
    <>
      {(hasText(block.title) || editing) && (
        <h3 className="cs-article-h3">
          {editing
            ? <EditableField value={block.title} onChange={(v) => onPatch({ title: v })} placeholder="List title (optional)" />
            : block.title}
        </h3>
      )}
      <ListTag className={`cs-article-list${block.ordered ? ' cs-article-list--ordered' : ''}`}>
        {items.map((item, i) => {
          const title = bulletTitle(item);
          const text = bulletText(item);
          if (!editing && !hasText(title) && !hasText(text)) return null;
          return (
            <li key={i}>
              {editing ? (
                <span className="cs-article-item-row cs-article-bullet-edit">
                  <EditableField value={title} onChange={(v) => setField(i, 'title', v)} placeholder="Title (bold)" className="cs-article-bullet-title-input" />
                  <EditableField value={text} onChange={(v) => setField(i, 'text', v)} allowBold placeholder="Bullet text" />
                  <button type="button" className="cs-article-mini-btn" title="Remove item"
                    onClick={() => onPatch({ items: items.filter((_, j) => j !== i) })}>✕</button>
                </span>
              ) : (
                <>
                  {hasText(title) && <strong className="cs-article-bullet-title">{clean(title)}</strong>}
                  {hasText(title) && hasText(text) && ' '}
                  {hasText(text) && <Rich text={text} />}
                </>
              )}
            </li>
          );
        })}
      </ListTag>
      {editing && (
        <div className="cs-article-item-toolbar">
          <button type="button" className="cs-article-mini-btn" onClick={() => onPatch({ items: [...items, { title: '', text: '' }] })}>+ item</button>
          <button type="button" className="cs-article-mini-btn" onClick={() => onPatch({ ordered: !block.ordered })}>
            {block.ordered ? '→ bullets' : '→ numbered'}
          </button>
          <button type="button" className="cs-article-mini-btn"
            title="Turn this list into cards — each bullet's bold title becomes the card title"
            onClick={() => onConvert && onConvert('cards')}>→ cards</button>
        </div>
      )}
    </>
  );
};

const MetaGridBlock = ({ block, editing, onPatch }) => {
  const items = listOf(block.items);
  const setItem = (i, patch) => onPatch({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const visible = editing ? items : items.filter((m) => hasText(m.value));
  if (!visible.length && !editing) return null;
  return (
    <>
      <div className="cs-article-meta">
        {visible.map((m, i) => (
          <div className="cs-article-meta-item" key={i}>
            <span className="cs-article-meta-label">
              {editing ? <EditableField value={m.label} onChange={(v) => setItem(i, { label: v })} placeholder="Label" /> : clean(m.label)}
            </span>
            <span className="cs-article-meta-value">
              {editing ? <EditableField value={m.value} onChange={(v) => setItem(i, { value: v })} multiline placeholder="Value" /> : clean(m.value)}
            </span>
            {editing && (
              <button type="button" className="cs-article-mini-btn cs-article-meta-remove" title="Remove"
                onClick={() => onPatch({ items: items.filter((_, j) => j !== i) })}>✕</button>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="cs-article-item-toolbar">
          <button type="button" className="cs-article-mini-btn" onClick={() => onPatch({ items: [...items, { label: '', value: '' }] })}>+ pair</button>
        </div>
      )}
    </>
  );
};

const LabelRowBlock = ({ block, editing, onPatch }) => (
  <div className="cs-article-labelrow">
    <div className="cs-article-labelrow-label">
      {editing ? <EditableField value={block.label} onChange={(v) => onPatch({ label: v })} placeholder="Label" /> : clean(block.label)}
    </div>
    <div className="cs-article-labelrow-body">
      {editing
        ? <p className="cs-article-p"><EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline allowBold placeholder="Text — **bold** supported" /></p>
        : <Prose text={block.text} />}
    </div>
  </div>
);

/* Problem · Solution · Impact — a group of labelled rows (Figma 34:296).
   Reuses the label-row grid so the label/body typography matches the deck's
   meta-label + body styles; rows are editable and can be added/removed. */
const ProblemSolutionImpactBlock = ({ block, editing, onPatch }) => {
  const items = listOf(block.items);
  const setItem = (i, patch) => onPatch({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const visible = editing ? items : items.filter((m) => hasText(m.text) || hasText(m.label));
  if (!visible.length && !editing) return null;
  return (
    <div className="cs-article-psi">
      {visible.map((row, i) => (
        <div className="cs-article-labelrow cs-article-psi-row" key={i}>
          <div className="cs-article-labelrow-label">
            {editing
              ? <EditableField value={row.label} onChange={(v) => setItem(i, { label: v })} placeholder="Label" />
              : clean(row.label)}
          </div>
          <div className="cs-article-labelrow-body">
            {editing ? (
              <>
                <p className="cs-article-p">
                  <EditableField value={row.text} onChange={(v) => setItem(i, { text: v })} multiline allowBold placeholder="Text — **bold** supported" />
                </p>
                {items.length > 1 && (
                  <div className="cs-article-item-toolbar">
                    <button type="button" className="cs-article-mini-btn" title="Remove row"
                      onClick={() => onPatch({ items: items.filter((_, j) => j !== i) })}>✕ row</button>
                  </div>
                )}
              </>
            ) : (
              <Prose text={row.text} />
            )}
          </div>
        </div>
      ))}
      {editing && (
        <div className="cs-article-item-toolbar">
          <button type="button" className="cs-article-mini-btn"
            onClick={() => onPatch({ items: [...items, { label: 'Label', text: '' }] })}>+ row</button>
        </div>
      )}
    </div>
  );
};

const TONE_ICONS = {
  negative: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  ),
  positive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  ),
  neutral: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" />
    </svg>
  ),
};

const CARD_TONES = ['neutral', 'negative', 'positive'];
const CARD_VARIANTS = ['numbered', 'icon', 'stat'];

const CardsBlock = ({ block, editing, onPatch, onConvert }) => {
  const items = listOf(block.items);
  const variant = CARD_VARIANTS.includes(block.variant) ? block.variant : 'numbered';
  const cols = Math.min(Math.max(Number(block.columns) || 2, 1), 3);
  const setItem = (i, patch) => onPatch({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  if (!items.length && !editing) return null;
  return (
    <>
      <div className={`cs-article-cards cs-article-cards--${variant}`} style={{ '--cs-cards-cols': cols }}>
        {items.map((item, i) => {
          const tone = CARD_TONES.includes(item.tone) ? item.tone : 'neutral';
          return (
            <div className={`cs-article-card cs-article-card--${tone}`} key={i}>
              {variant === 'numbered' && hasText(item.number) && (
                <span className="cs-article-card-num">
                  {editing ? <EditableField value={item.number} onChange={(v) => setItem(i, { number: v })} placeholder="1" /> : clean(item.number)}
                </span>
              )}
              {variant === 'icon' && <span className={`cs-article-card-icon cs-article-card-icon--${tone}`}>{TONE_ICONS[tone]}</span>}
              {variant === 'stat' && (hasText(item.value) || editing) && (
                <span className="cs-article-card-value">
                  {editing ? <EditableField value={item.value} onChange={(v) => setItem(i, { value: v })} placeholder="75%" /> : clean(item.value)}
                </span>
              )}
              <div className="cs-article-card-body">
                {(hasText(item.title) || editing) && (
                  <p className="cs-article-card-title">
                    {editing ? <EditableField value={item.title} onChange={(v) => setItem(i, { title: v })} placeholder="Title" /> : clean(item.title)}
                  </p>
                )}
                {(hasText(item.description) || editing) && (
                  <p className="cs-article-card-desc">
                    {editing
                      ? <EditableField value={item.description} onChange={(v) => setItem(i, { description: v })} multiline placeholder="Description" />
                      : <Rich text={clean(item.description)} />}
                  </p>
                )}
                {editing && (
                  <div className="cs-article-card-tools">
                    {variant === 'numbered' && (
                      <button type="button" className="cs-article-mini-btn"
                        title={hasText(item.number) ? 'Remove the number chip from this card' : 'Add a number chip to this card'}
                        onClick={() => setItem(i, { number: hasText(item.number) ? '' : String(i + 1) })}>
                        {hasText(item.number) ? '− number' : '+ number'}
                      </button>
                    )}
                    {variant === 'icon' && (
                      <button type="button" className="cs-article-mini-btn" title="Cycle tone"
                        onClick={() => setItem(i, { tone: CARD_TONES[(CARD_TONES.indexOf(tone) + 1) % CARD_TONES.length] })}>
                        {tone}
                      </button>
                    )}
                    <button type="button" className="cs-article-mini-btn" title="Remove card"
                      onClick={() => onPatch({ items: items.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <div className="cs-article-item-toolbar">
          <button type="button" className="cs-article-mini-btn"
            onClick={() => onPatch({ items: [...items, { number: String(items.length + 1), tone: 'neutral', title: '', description: '', value: '' }] })}>
            + card
          </button>
          <button type="button" className="cs-article-mini-btn" title="Cycle variant"
            onClick={() => onPatch({ variant: CARD_VARIANTS[(CARD_VARIANTS.indexOf(variant) + 1) % CARD_VARIANTS.length] })}>
            {variant}
          </button>
          <button type="button" className="cs-article-mini-btn" title="Columns"
            onClick={() => onPatch({ columns: (cols % 3) + 1 })}>
            {cols} col
          </button>
          <button type="button" className="cs-article-mini-btn"
            title="Turn these cards into a bullet list — each card title becomes the bullet's bold lead-in"
            onClick={() => onConvert && onConvert('bullets')}>→ bullets</button>
        </div>
      )}
    </>
  );
};

const FigureBlock = ({ block, editing, onPatch }) => {
  const openLibrary = useContext(MediaLibraryContext);
  const media = listOf(block.media);
  const width = ['prose', 'wide', 'full'].includes(block.width) ? block.width : 'wide';
  const gridCols = Math.min(Math.max(Number(block.gridCols) || 2, 1), 6);
  const setEntry = (i, patch) => onPatch({ media: media.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const pickFromLibrary = (i) => openLibrary((item) => setEntry(i, { src: item.src || '', isVideo: !!item.isVideo, embedUrl: item.embedUrl || '' }));
  const visible = editing ? media : media.filter((m) => hasText(m.src) || hasText(m.embedUrl));
  if (!visible.length && !editing) return null;
  // Carousel view: cycle entries like the deck does. While editing, entries
  // stay laid out as a grid so each one remains directly manageable.
  const isCarousel = block.display === 'carousel' && visible.length > 1;
  if (isCarousel && !editing) {
    return (
      <figure className={`cs-article-figure cs-article-figure--${width}`}>
        <ArticleCarousel entries={visible} tier={width} interval={block.interval} />
        {visible.some((m) => hasText(m.caption)) && (
          <figcaption>{clean(visible.find((m) => hasText(m.caption))?.caption)}</figcaption>
        )}
      </figure>
    );
  }
  return (
    <figure className={`cs-article-figure cs-article-figure--${width}${visible.length > 1 ? ' cs-article-figure--grid' : ''}`}>
      <div className={visible.length > 1 ? 'cs-article-figure-grid' : 'cs-article-figure-single'}
        style={visible.length > 1 ? { '--cs-figure-cols': gridCols } : undefined}>
        {visible.map((entry, i) => (
          <div className="cs-article-figure-cell" key={i}>
            {(entry.status === 'accepted' || entry.status === 'rejected') && (
              <span className={`cs-article-figure-chip cs-article-figure-chip--${entry.status}`}>
                {entry.status === 'accepted' ? 'Accepted' : 'Rejected'}
              </span>
            )}
            {(hasText(entry.src) || hasText(entry.embedUrl))
              ? <MediaEntry entry={entry} tier={width} />
              : editing && (
                <>
                  <button type="button" className="cs-article-upload-slot" onClick={() => pickMediaFile((m) => setEntry(i, m))}>
                    + Upload image / video
                  </button>
                  {openLibrary && !(hasText(entry.src) || hasText(entry.embedUrl)) && (
                    <button
                      type="button"
                      className="cs-article-mini-btn cs-article-lib-btn"
                      onClick={() => pickFromLibrary(i)}
                    >
                      ⊞ Library
                    </button>
                  )}
                </>
              )}
            {editing && (
              <div className="cs-article-figure-tools">
                <button type="button" className="cs-article-mini-btn" onClick={() => pickMediaFile((m) => setEntry(i, { ...m, embedUrl: '' }))}>upload</button>
                {openLibrary && (
                  <button type="button" className="cs-article-mini-btn" onClick={() => pickFromLibrary(i)}>
                    library
                  </button>
                )}
                <input
                  type="text"
                  className="cs-article-embed-input"
                  placeholder="or embed URL…"
                  defaultValue={entry.embedUrl || ''}
                  onBlur={(e) => setEntry(i, { embedUrl: e.target.value.trim() })}
                />
                <button type="button" className={`cs-article-mini-btn${entry.border ? ' is-active' : ''}`}
                  title="Toggle a framed border on this image"
                  onClick={() => setEntry(i, { border: !entry.border })}>border</button>
                {entry.border && (
                  <span className="cs-article-mat-swatches" title="Mat color">
                    {[['white', '#ffffff'], ['cream', '#F1F0ED']].map(([key, col]) => (
                      <button key={key} type="button"
                        className={`cs-article-mat-swatch${(entry.borderColor === 'cream' ? 'cream' : 'white') === key ? ' is-active' : ''}`}
                        style={{ background: col }}
                        title={key === 'white' ? 'White mat' : 'Cream mat (#F1F0ED)'}
                        aria-label={key === 'white' ? 'White mat' : 'Cream mat'}
                        onClick={() => setEntry(i, { borderColor: key })} />
                    ))}
                  </span>
                )}
                <button type="button" className={`cs-article-mini-btn${entry.shadow !== false ? ' is-active' : ''}`}
                  title="Toggle the drop shadow on this image"
                  onClick={() => setEntry(i, { shadow: entry.shadow === false })}>shadow</button>
                <button type="button" className={`cs-article-mini-btn${entry.status ? ` is-active cs-article-chip-btn--${entry.status}` : ''}`}
                  title="Add / toggle an Accepted–Rejected chip on this image (like the Ideation slide)"
                  onClick={() => setEntry(i, { status: entry.status === 'accepted' ? 'rejected' : (entry.status === 'rejected' ? '' : 'accepted') })}>
                  {entry.status || '+ chip'}
                </button>
                {media.length > 1 && (
                  <button type="button" className="cs-article-mini-btn" title="Remove entry"
                    onClick={() => onPatch({ media: media.filter((_, j) => j !== i) })}>✕</button>
                )}
              </div>
            )}
            {visible.length > 1 && (editing || hasText(entry.title) || hasText(entry.caption)) && (
              <div className="cs-article-figure-cell-caption">
                {editing ? (
                  <>
                    <EditableField value={entry.title || ''} onChange={(v) => setEntry(i, { title: v })} placeholder="Image title (optional)" className="cs-article-figure-cell-title" />
                    <EditableField value={entry.caption || ''} onChange={(v) => setEntry(i, { caption: v })} placeholder="Description (optional)" className="cs-article-figure-cell-desc" />
                  </>
                ) : (
                  <>
                    {hasText(entry.title) && <strong className="cs-article-figure-cell-title">{clean(entry.title)}</strong>}
                    {hasText(entry.caption) && <span className="cs-article-figure-cell-desc">{clean(entry.caption)}</span>}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {visible.length <= 1 && (hasText(media[0]?.caption) || editing) && (
        <figcaption>
          {editing
            ? <EditableField value={media[0]?.caption || ''} onChange={(v) => setEntry(0, { caption: v })} placeholder="Caption (optional)" />
            : clean(visible.find((m) => hasText(m.caption))?.caption)}
        </figcaption>
      )}
      {editing && (
        <div className="cs-article-item-toolbar">
          {['prose', 'wide', 'full'].map((w) => (
            <button key={w} type="button"
              className={`cs-article-mini-btn${w === width ? ' is-active' : ''}`}
              onClick={() => onPatch({ width: w })}>{w}</button>
          ))}
          <button type="button" className="cs-article-mini-btn"
            onClick={() => onPatch({ media: [...media, { src: '', caption: '', isVideo: false, embedUrl: '' }] })}>
            + media
          </button>
          {media.length > 1 && !isCarousel && (
            <button type="button" className="cs-article-mini-btn" title="Images per row in the grid"
              onClick={() => onPatch({ gridCols: gridCols >= 6 ? 2 : gridCols + 1 })}>
              {gridCols} / row
            </button>
          )}
          {media.length > 1 && (
            <button type="button" className={`cs-article-mini-btn${isCarousel ? ' is-active' : ''}`}
              title="Cycle entries as a carousel (like the slides) instead of a grid"
              onClick={() => onPatch({ display: isCarousel ? 'grid' : 'carousel' })}>
              carousel
            </button>
          )}
          {isCarousel && [['fast', 2000], ['med', 3500], ['slow', 6000]].map(([label, ms]) => (
            <button key={ms} type="button"
              className={`cs-article-mini-btn${(Number(block.interval) || 3500) === ms ? ' is-active' : ''}`}
              title={`Auto-advance every ${(ms / 1000).toString().replace('.0', '')}s`}
              onClick={() => onPatch({ interval: ms })}>
              {label}
            </button>
          ))}
        </div>
      )}
    </figure>
  );
};

// A quote block holds one or more quotes ({ text, author, role }). Legacy blocks
// store a single quote as top-level text/author/role — normalize to an array.
const quoteItems = (block) =>
  (Array.isArray(block.quotes) && block.quotes.length)
    ? block.quotes
    : [{ text: block.text || '', author: block.author || '', role: block.role || '' }];

const QuoteBlock = ({ block, editing, onPatch }) => {
  const isCard = block.variant === 'card';
  const items = quoteItems(block);
  const cols = Math.min(Math.max(Number(block.columns) || (items.length > 1 ? 2 : 1), 1), 3);
  const width = ['prose', 'wide', 'full'].includes(block.width) ? block.width : 'prose';
  const write = (next) => onPatch({ quotes: next });
  const setQuote = (i, patch) => write(items.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  const list = editing ? items : items.filter((q) => hasText(q.text) || hasText(q.author) || hasText(q.role));
  if (!list.length && !editing) return null;
  const useGrid = list.length > 1;

  const renderQuote = (q, i) => (
    <blockquote key={i}
      className={`cs-article-quote cs-article-quote--large cs-article-quote--w-${width}${isCard ? ' cs-article-quote--card' : ''}${isCard && block.shadow === false ? ' cs-article-quote--noshadow' : ''}`}>
      {isCard && <span className="cs-article-quote-mark" aria-hidden="true">{'“'}</span>}
      <p>
        {editing
          ? <EditableField value={q.text} onChange={(v) => setQuote(i, { text: v })} multiline placeholder="Quote text" />
          : clean(q.text)}
      </p>
      {(hasText(q.author) || hasText(q.role) || editing) && (
        <cite>
          {editing ? (
            <>
              — <EditableField value={q.author} onChange={(v) => setQuote(i, { author: v })} placeholder="Author" />
              {', '}
              <EditableField value={q.role} onChange={(v) => setQuote(i, { role: v })} placeholder="Role" />
            </>
          ) : (
            <>— {[clean(q.author), clean(q.role)].filter(Boolean).join(', ')}</>
          )}
        </cite>
      )}
      {editing && items.length > 1 && (
        <button type="button" className="cs-article-mini-btn cs-article-quote-remove" title="Remove quote"
          onClick={() => write(items.filter((_, j) => j !== i))}>✕</button>
      )}
    </blockquote>
  );

  return (
    <>
      {useGrid
        ? <div className={`cs-article-quotes-grid cs-article-quotes-grid--w-${width}`} style={{ '--cs-quote-cols': cols }}>{list.map(renderQuote)}</div>
        : list.map(renderQuote)}
      {editing && (
        <div className="cs-article-item-toolbar">
          <button type="button" className={`cs-article-mini-btn${isCard ? ' is-active' : ''}`}
            title="Show as card(s) — white rounded card + quote mark, like the slides"
            onClick={() => onPatch({ variant: isCard ? '' : 'card' })}>quote card</button>
          {isCard && (
            <button type="button" className={`cs-article-mini-btn${block.shadow !== false ? ' is-active' : ''}`}
              title="Toggle the card shadow"
              onClick={() => onPatch({ shadow: block.shadow === false })}>shadow</button>
          )}
          <button type="button" className="cs-article-mini-btn"
            onClick={() => write([...items, { text: '', author: '', role: '' }])}>+ quote</button>
          {items.length > 1 && [1, 2, 3].map((c) => (
            <button key={c} type="button" className={`cs-article-mini-btn${cols === c ? ' is-active' : ''}`}
              title={`${c} column${c > 1 ? 's' : ''} grid`}
              onClick={() => onPatch({ columns: c })}>{c} col</button>
          ))}
          {['prose', 'wide', 'full'].map((w) => (
            <button key={w} type="button" className={`cs-article-mini-btn${w === width ? ' is-active' : ''}`}
              title={`${w} width`}
              onClick={() => onPatch({ width: w })}>{w}</button>
          ))}
        </div>
      )}
    </>
  );
};

const CalloutBlock = ({ block, editing, onPatch }) => (
  <div className="cs-article-callout">
    {editing
      ? <p className="cs-article-p"><EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline allowBold placeholder="Callout text — **bold** supported" /></p>
      : <Prose text={block.text} />}
  </div>
);

const CHECKLIST_GROUPS = [
  { titleField: 'workedTitle', itemsField: 'worked', mark: 'check', defaultTitle: 'What worked' },
  { titleField: 'failedTitle', itemsField: 'failed', mark: 'cross', defaultTitle: "What didn't" },
  { titleField: 'differentlyTitle', itemsField: 'differently', mark: 'arrow', defaultTitle: "What I'd do differently" },
];

const ChecklistBlock = ({ block, editing, onPatch }) => (
  <>
    {CHECKLIST_GROUPS.map((g) => {
      const items = listOf(block[g.itemsField]);
      if (!items.length && !editing) return null;
      const setItem = (i, v) => onPatch({ [g.itemsField]: items.map((it, j) => (j === i ? v : it)) });
      return (
        <div className="cs-article-reflect-group" key={g.itemsField}>
          <h3 className="cs-article-h3">
            {editing
              ? <EditableField value={block[g.titleField] || g.defaultTitle} onChange={(v) => onPatch({ [g.titleField]: v })} />
              : clean(block[g.titleField]) || g.defaultTitle}
          </h3>
          <ul className={`cs-article-marklist cs-article-marklist--${g.mark}`}>
            {items.map((item, i) => (
              <li key={i}>
                {editing ? (
                  <span className="cs-article-item-row">
                    <EditableField value={item} onChange={(v) => setItem(i, v)} placeholder="Item" />
                    <button type="button" className="cs-article-mini-btn" title="Remove"
                      onClick={() => onPatch({ [g.itemsField]: items.filter((_, j) => j !== i) })}>✕</button>
                  </span>
                ) : (
                  <Rich text={item} />
                )}
              </li>
            ))}
          </ul>
          {editing && (
            <div className="cs-article-item-toolbar">
              <button type="button" className="cs-article-mini-btn" onClick={() => onPatch({ [g.itemsField]: [...items, ''] })}>+ item</button>
            </div>
          )}
        </div>
      );
    })}
  </>
);

const DividerBlock = () => <hr className="cs-article-hr" />;

const ChapterBlock = ({ block, editing, onPatch }) => (
  <div className="cs-article-chapter-inner">
    {(hasText(block.number) || editing) && (
      <span className="cs-article-chapter-number">
        {editing ? <EditableField value={block.number} onChange={(v) => onPatch({ number: v })} placeholder="01" /> : clean(block.number)}
      </span>
    )}
    <h2 className="cs-article-chapter-title">
      {editing ? <EditableField value={block.title} onChange={(v) => onPatch({ title: v })} placeholder="Chapter title" /> : oneLine(block.title)}
    </h2>
    {(hasText(block.subtitle) || editing) && (
      <p className="cs-article-chapter-subtitle">
        {editing ? <EditableField value={block.subtitle} onChange={(v) => onPatch({ subtitle: v })} multiline placeholder="Subtitle (optional)" /> : clean(block.subtitle)}
      </p>
    )}
  </div>
);

const BLOCK_RENDERERS = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  bullets: BulletsBlock,
  metaGrid: MetaGridBlock,
  labelRow: LabelRowBlock,
  problemSolutionImpact: ProblemSolutionImpactBlock,
  cards: CardsBlock,
  figure: FigureBlock,
  quote: QuoteBlock,
  callout: CalloutBlock,
  checklist: ChecklistBlock,
  divider: DividerBlock,
  chapter: ChapterBlock,
};

/* ── Editor chrome ────────────────────────────────────────────────────── */

const BlockShell = ({ block, index, total, editing, ops, flash, onFlash, onEditJson, children }) => {
  const shellRef = useRef(null);
  // Locating feedback: a freshly added/duplicated block scrolls into view and
  // pulses so the user always sees WHERE their new block landed.
  useEffect(() => {
    if (flash && shellRef.current) {
      shellRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [flash]);
  if (!editing) {
    return (
      <section
        className={`cs-article-block cs-article-block--${block.type}`}
        data-block-type={block.type}
        id={block.id ? `blk-${block.id}` : undefined}
      >
        {children}
      </section>
    );
  }
  const hasMedia = block.type === 'figure' && listOf(block.media).some((m) => hasText(m.src));
  return (
    <section
      ref={shellRef}
      className={`cs-article-block cs-article-block--${block.type} cs-article-block--editing${flash ? ' cs-article-block--flash' : ''}`}
      data-block-type={block.type}
      id={block.id ? `blk-${block.id}` : undefined}
    >
      <div className="cs-article-block-controls" contentEditable={false}>
        {CONVERTIBLE_BLOCK_TYPES.includes(block.type) ? (
          <select
            className="cs-article-block-type cs-article-block-typesel"
            value={block.type}
            title="Change block type (migrates the content)"
            onChange={(e) => ops.convertArticleBlock(index, e.target.value)}
          >
            {CONVERTIBLE_BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>{BLOCK_TYPE_LABELS[t] || t}</option>
            ))}
          </select>
        ) : (
          <span className="cs-article-block-type">{block.type}</span>
        )}
        <button type="button" className="cs-article-ctl-btn" title="Move up" disabled={index === 0}
          onClick={() => ops.moveArticleBlock(index, -1)}>↑</button>
        <button type="button" className="cs-article-ctl-btn" title="Move down" disabled={index === total - 1}
          onClick={() => ops.moveArticleBlock(index, 1)}>↓</button>
        <button type="button" className="cs-article-ctl-btn" title="Duplicate"
          onClick={() => onFlash(ops.duplicateArticleBlock(index))}>⧉</button>
        <button type="button" className="cs-article-ctl-btn" title="Edit this block's JSON"
          onClick={() => onEditJson(index)}>{'{ }'}</button>
        <button type="button" className="cs-article-ctl-btn cs-article-ctl-btn--danger" title="Delete block"
          onClick={() => {
            if (!hasMedia || window.confirm('Delete this media block?')) ops.removeArticleBlock(index);
          }}>✕</button>
      </div>
      {children}
    </section>
  );
};

/* Insert zone between blocks: a pulsing "+" on a hairline that expands into
   one-click chips for the common block types — media, bullets, cards etc.
   land exactly where you are, no modal, no hunting. "More…" opens the full
   categorized picker for the rest. */
const QUICK_ADD = [
  { type: 'paragraph', label: '¶ Text' },
  { type: 'heading', label: 'H Heading' },
  { type: 'figure', label: '▣ Media' },
  { type: 'bullets', label: '• Bullets' },
  { type: 'cards', label: '▤ Cards' },
  { type: 'divider', label: '— Divider' },
];

const InsertZone = ({ at, onAdd, onMore }) => (
  <div className="cs-article-insertzone" role="group" aria-label="Add a block here">
    <span className="cs-article-insertzone-line" aria-hidden="true" />
    <button type="button" className="cs-article-insertzone-dot" aria-label="Add a block here" tabIndex={-1}>+</button>
    <span className="cs-article-insertzone-chips">
      {QUICK_ADD.map((q) => (
        <button key={q.type} type="button" className="cs-article-quickchip" onClick={() => onAdd(q.type, at)}>
          {q.label}
        </button>
      ))}
      <button type="button" className="cs-article-quickchip cs-article-quickchip--more" onClick={() => onMore(at)}>
        More…
      </button>
    </span>
  </div>
);

const AddBlockModal = ({ onPick, onClose }) => (
  <div className="template-modal-overlay cs-article-picker-overlay" onClick={onClose}>
    <div className="template-modal cs-article-picker" onClick={(e) => e.stopPropagation()}>
      <div className="cs-article-picker-head">
        <span>Add block</span>
        <button type="button" className="cs-article-mini-btn" onClick={onClose}>✕</button>
      </div>
      {Object.entries(articleBlockCategories).map(([category, blocks]) => (
        <div className="cs-article-picker-group" key={category}>
          <p className="cs-article-picker-category">{category}</p>
          <div className="cs-article-picker-grid">
            {blocks.map((b) => (
              <button key={b.type} type="button" className="cs-article-picker-btn" onClick={() => onPick(b.type)}>
                <span className="cs-article-picker-label">{b.label}</span>
                <span className="cs-article-picker-hint">{b.hint}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Per-block raw JSON editor — edit one block's fields directly, then replace it.
const BlockJsonModal = ({ block, onApply, onClose }) => {
  const [text, setText] = useState(() => JSON.stringify(block, null, 2));
  const [error, setError] = useState(null);
  const apply = () => {
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { setError('Invalid JSON: ' + e.message); return; }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) { setError('Must be a JSON object.'); return; }
    if (!hasText(parsed.type)) { setError('A block needs a "type" field.'); return; }
    if (!BLOCK_RENDERERS[parsed.type]) { setError(`Unknown block type "${parsed.type}".`); return; }
    onApply({ ...parsed, id: parsed.id || block.id });
  };
  return (
    <div className="template-modal-overlay cs-article-picker-overlay" onClick={onClose}>
      <div className="template-modal cs-article-picker cs-article-json-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cs-article-picker-head">
          <span>Edit block JSON · <code>{block.type}</code></span>
          <button type="button" className="cs-article-mini-btn" onClick={onClose}>✕</button>
        </div>
        <textarea
          className="cs-article-json-textarea"
          value={text}
          spellCheck={false}
          autoFocus
          onChange={(e) => { setText(e.target.value); setError(null); }}
          onKeyDown={(e) => e.stopPropagation()}
        />
        {error && <p className="cs-article-json-error">{error}</p>}
        <div className="cs-article-json-actions">
          <button type="button" className="cs-article-seed-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="cs-article-seed-btn cs-article-seed-btn--primary" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

/* ── Floating back button (public article view) ───────────────────────── */

const BackArrow = ({ clone }) => (
  <svg
    className={`cs-article-back-arrow${clone ? ' cs-article-back-arrow--clone' : ''}`}
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
  >
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

// Reference (royshlain) back control: a small round button, transparent at
// rest, that fills in on hover. On hover the arrow slides out to the left and
// a clone slides in from the right — the same icon animation as the CV button.
const FloatingBack = () => (
  <Link to="/" className="cs-article-back" aria-label="Back to work">
    <span className="cs-article-back-icon">
      <BackArrow />
      <BackArrow clone />
    </span>
    <span className="cs-article-back-label">Back</span>
  </Link>
);

/* ── Contact strip + next-case cards (auto-appended) ──────────────────── */

const ContactStrip = ({ project }) => {
  const end = listOf(project?.slides).find((s) => s.type === 'end');
  const email = clean(end?.email) || contactDefaults.email;
  const linkedin = clean(end?.linkedinUrl) || contactDefaults.linkedinUrl;
  return (
    <section className="cs-article-end">
      {hasText(end?.title) && <h2 className="cs-article-h2">{oneLine(end.title)}</h2>}
      {hasText(end?.subtitle) && <p className="cs-article-p">{clean(end.subtitle)}</p>}
      <div className="cs-article-contact">
        {email && (
          <a className="cs-article-contact-btn" href={`mailto:${email}`}>
            {clean(end?.cta) || 'Get in touch'}
          </a>
        )}
        {linkedin && (
          <a className="cs-article-contact-link" href={linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
      </div>
    </section>
  );
};

// A next-case thumbnail: prefer the intro image, else the first non-video
// image found anywhere in the deck — so every card shows a picture, not just
// the ones whose intro slide happens to carry one.
const NEXT_THUMB_KEYS = ['image', 'images', 'beforeImage', 'afterImage', 'dir1Image', 'dir2Image', 'dir3Image', 'carouselImages', 'logo'];
const nextCaseThumb = (data) => {
  const slides = data?.slides || [];
  const pick = (s) => {
    for (const key of NEXT_THUMB_KEYS) {
      const m = normalizeMedia(s?.[key]).find((e) => hasText(e.src) && !e.isVideo);
      if (m) return m.src;
    }
    return '';
  };
  const intro = slides.find((s) => s.type === 'intro');
  return pick(intro) || slides.map(pick).find(Boolean) || '';
};

const NextCaseCards = ({ projectId }) => {
  const all = Object.keys(savedCaseStudies || {});
  const idx = all.indexOf(projectId);
  const ordered = idx >= 0 ? [...all.slice(idx + 1), ...all.slice(0, idx)] : all;
  const candidates = ordered.filter((id) => id !== projectId);
  // Prefer studies that actually have a preview image so both next-cards show a
  // picture; only fall back to image-less studies if fewer than two qualify.
  const withThumb = candidates.filter((id) => nextCaseThumb(savedCaseStudies[id] || {}));
  const next = (withThumb.length >= 2 ? withThumb : [...withThumb, ...candidates.filter((id) => !withThumb.includes(id))]).slice(0, 2);
  if (!next.length) return null;
  return (
    <section className="cs-article-next">
      <div className="cs-article-next-grid">
        {next.map((id) => {
          const data = savedCaseStudies[id] || {};
          const thumb = nextCaseThumb(data);
          return (
            <Link className="cs-article-next-card" to={`/project/${id}`} key={id}>
              <span className="cs-article-next-thumb" style={thumb ? undefined : { background: data.color || 'var(--color-bg-secondary)' }}>
                {thumb && <img src={thumb} alt="" loading="lazy" decoding="async" />}
              </span>
              <span className="cs-article-next-body">
                <span className="cs-article-next-kicker">Read case study</span>
                <span className="cs-article-next-title">{oneLine(data.title) || id}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/* ── Main component ───────────────────────────────────────────────────── */

const CaseStudyArticle = ({ project, projectId, editMode = false, ops, openMediaLibrary, onImageClick }) => {
  const authored = project?.article?.blocks?.length ? project.article : null;
  const derived = useMemo(
    () => (authored ? null : deriveArticleFromSlides(project)),
    [authored, project]
  );
  const article = authored || derived;
  const editing = !!(editMode && authored && ops);
  const [pickerAt, setPickerAt] = useState(null); // index after which to insert; null = closed
  const [jsonEditAt, setJsonEditAt] = useState(null); // block index whose raw JSON is open; null = closed

  // Entering edit mode on an un-authored article seeds it automatically so
  // everything is immediately editable — no hidden "Seed" step to discover.
  // Keyed on `project` because the async IndexedDB load REPLACES the project
  // object shortly after mount, wiping a too-early seed — so retry when the
  // data changes (capped, in case a project derives to zero blocks). A
  // deliberate "Revert to auto-generated" sets revertedRef so it doesn't
  // instantly re-fork; the seed bar takes over instead.
  const seedTriesRef = useRef(0);
  const [reverted, setReverted] = useState(false);
  useEffect(() => {
    if (!editMode || authored || !ops || reverted) return;
    if (seedTriesRef.current >= 3) return;
    seedTriesRef.current += 1;
    ops.seedArticleFromSlides();
  }, [editMode, authored, ops, project, reverted]);

  const blocks = listOf(article?.blocks);
  // A figure block at position 0 is the hero: rendered above the title.
  const heroFirst = blocks[0]?.type === 'figure';
  const heroBlock = heroFirst ? blocks[0] : null;
  const bodyBlocks = heroFirst ? blocks.slice(1) : blocks;

  // Flash = feedback for "where did my new block go": highlight + scroll.
  const [flashId, setFlashId] = useState(null);
  const flashTimerRef = useRef(null);
  const flash = (id) => {
    if (!id) return;
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlashId(id);
    flashTimerRef.current = setTimeout(() => setFlashId(null), 1600);
  };
  useEffect(() => () => { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); }, []);

  // ── Keep the scroll position across edit-mode enter/exit ─────────────────
  // Toggling edit mode adds/removes editor chrome (the accent bar, insert
  // zones, block-control pills), which changes content height — so the same
  // scrollTop lands on a DIFFERENT block and the designer loses their place on
  // "Done Editing". We continuously anchor on the block nearest the top of the
  // viewport and, when edit mode flips, re-scroll that block back to the same
  // offset so they stay put and see their change in place.
  const scrollAnchorRef = useRef(null);
  useEffect(() => {
    const sc = document.querySelector('.case-study--article');
    if (!sc) return;
    const track = () => {
      const scTop = sc.getBoundingClientRect().top;
      const blocks = sc.querySelectorAll('[id^="blk-"]');
      for (const b of blocks) {
        const r = b.getBoundingClientRect();
        if (r.bottom > scTop + 4) { scrollAnchorRef.current = { id: b.id, offset: r.top - scTop }; return; }
      }
      scrollAnchorRef.current = { id: null, top: sc.scrollTop };
    };
    track();
    sc.addEventListener('scroll', track, { passive: true });
    return () => sc.removeEventListener('scroll', track);
  }, []);

  const prevEditModeRef = useRef(editMode);
  useLayoutEffect(() => {
    if (prevEditModeRef.current === editMode) return; // only on an actual toggle
    prevEditModeRef.current = editMode;
    const a = scrollAnchorRef.current;
    const sc = document.querySelector('.case-study--article');
    if (!sc || !a) return;
    const restore = () => {
      if (a.id) {
        const el = sc.querySelector(`#${CSS.escape(a.id)}`);
        if (el) {
          const scTop = sc.getBoundingClientRect().top;
          const cur = el.getBoundingClientRect().top - scTop;
          sc.scrollTop += cur - a.offset;
          return;
        }
      }
      if (typeof a.top === 'number') sc.scrollTop = a.top;
    };
    restore();                       // before paint — no visible jump
    requestAnimationFrame(restore);  // again after chrome/media-merge reflow settles
  }, [editMode]);

  const quickAdd = (type, at) => flash(ops.addArticleBlock(type, at));

  const renderBlock = (blk, listIndex, realIndex) => {
    const Renderer = BLOCK_RENDERERS[blk.type];
    if (!Renderer) return null;
    return (
      <BlockShell
        key={blk.id || `i${realIndex}`}
        block={blk}
        index={realIndex}
        total={blocks.length}
        editing={editing}
        ops={ops}
        flash={!!blk.id && blk.id === flashId}
        onFlash={flash}
        onEditJson={setJsonEditAt}
      >
        <Renderer
          block={blk}
          editing={editing}
          onPatch={(patch) => ops && ops.updateArticleBlock(realIndex, patch)}
          onConvert={(toType) => ops && ops.convertArticleBlock(realIndex, toType)}
        />
      </BlockShell>
    );
  };

  return (
    <MediaLibraryContext.Provider value={openMediaLibrary}>
    <LightboxContext.Provider value={editMode ? null : onImageClick}>
    <article className={`cs-article${editing ? ' cs-article--editing' : ''}`}>
      {!editMode && <FloatingBack />}

      {editMode && !authored && ops && reverted && (
        <div className="cs-article-seedbar">
          <span>This article is auto-generated from the slides. Make it editable again:</span>
          <button type="button" className="cs-article-seed-btn cs-article-seed-btn--primary" onClick={ops.seedArticleFromSlides}>
            Seed from slides
          </button>
          <button type="button" className="cs-article-seed-btn" onClick={ops.startBlankArticle}>
            Start blank
          </button>
        </div>
      )}

      {heroBlock && renderBlock(heroBlock, 0, 0)}

      <header className="cs-article-header">
        <h1 className="cs-article-h1">
          {editing
            ? <EditableField value={article?.title} onChange={(v) => ops.updateArticle({ title: v })} multiline placeholder="Article title" />
            : oneLine(article?.title) || oneLine(project?.title)}
        </h1>
        {editing ? (
          <p className="cs-article-lede">
            <EditableField value={article?.lede} onChange={(v) => ops.updateArticle({ lede: v })} multiline allowBold placeholder="Lede / standfirst (optional)" />
          </p>
        ) : (
          <Prose text={article?.lede} className="cs-article-lede" />
        )}
      </header>

      {editing && <InsertZone at={heroFirst ? 0 : -1} onAdd={quickAdd} onMore={(i) => setPickerAt(i)} />}
      {bodyBlocks.map((blk, i) => {
        const realIndex = heroFirst ? i + 1 : i;
        return (
          <Fragment key={blk.id || `w${realIndex}`}>
            {renderBlock(blk, i, realIndex)}
            {editing && <InsertZone at={realIndex} onAdd={quickAdd} onMore={(idx) => setPickerAt(idx)} />}
          </Fragment>
        );
      })}

      {editing && (
        <div className="cs-article-addblock-row">
          <button type="button" className="cs-article-seed-btn" onClick={() => setPickerAt(blocks.length - 1)}>
            + Add block
          </button>
        </div>
      )}

      {editing && (
        <div className="cs-article-toolsrow">
          <span className="cs-article-toolsrow-label">Article tools</span>
          {article?.hideContact === true && (
            <button
              type="button"
              className="cs-article-mini-btn"
              title="Show the Thank You / contact section again"
              onClick={() => ops.updateArticle({ hideContact: false })}
            >
              + Show end section
            </button>
          )}
          <button
            type="button"
            className="cs-article-mini-btn"
            title="Replace all article blocks with a fresh conversion of the current slides"
            onClick={() => {
              if (window.confirm('Re-seed from slides? This replaces the whole article with a fresh conversion of the current slides.')) {
                ops.seedArticleFromSlides();
              }
            }}
          >
            ↺ Re-seed from slides
          </button>
          <button
            type="button"
            className="cs-article-mini-btn"
            title="Delete the authored article — the public page goes back to the auto-generated version"
            onClick={() => {
              if (window.confirm('Revert to the auto-generated article? Your authored article blocks will be deleted.')) {
                setReverted(true);
                ops.clearArticle();
              }
            }}
          >
            Revert to auto-generated
          </button>
        </div>
      )}

      {editing && blocks.length === 0 && (
        <div className="cs-article-emptystate">
          <p>No blocks yet.</p>
          <button type="button" className="cs-article-seed-btn cs-article-seed-btn--primary" onClick={() => setPickerAt(-1)}>Add block</button>
          <button type="button" className="cs-article-seed-btn" onClick={ops.seedArticleFromSlides}>Re-seed from slides</button>
        </div>
      )}

      {article?.hideContact !== true && (
        <div className="cs-article-end-wrap">
          <ContactStrip project={project} />
          {editing && (
            <button
              type="button"
              className="cs-article-mini-btn cs-article-end-hide"
              title="Hide the Thank You / contact section on this article"
              onClick={() => ops.updateArticle({ hideContact: true })}
            >
              ✕ Hide end section
            </button>
          )}
        </div>
      )}
      <NextCaseCards projectId={projectId} />

      {pickerAt !== null && (
        <AddBlockModal
          onPick={(type) => { flash(ops.addArticleBlock(type, pickerAt)); setPickerAt(null); }}
          onClose={() => setPickerAt(null)}
        />
      )}
      {jsonEditAt !== null && blocks[jsonEditAt] && (
        <BlockJsonModal
          block={blocks[jsonEditAt]}
          onApply={(b) => { ops.replaceArticleBlock(jsonEditAt, b); setJsonEditAt(null); }}
          onClose={() => setJsonEditAt(null)}
        />
      )}
    </article>
    </LightboxContext.Provider>
    </MediaLibraryContext.Provider>
  );
};

export default CaseStudyArticle;
