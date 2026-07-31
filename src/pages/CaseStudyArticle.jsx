import { Fragment, createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedCaseStudies } from '../data/case-studies/index.js';
import { contactDefaults } from '../data/caseStudyData';
import { buildResponsiveWebp, LazyVideo, pickMediaFile } from './caseStudyMedia';
import EditableField from '../components/EditableField';
import {
  hasText, clean, oneLine, listOf, isVideoSrc, normalizeMedia,
  splitBold, articleBlockCategories, deriveArticleFromSlides,
} from '../data/articleBlocks';
import './CaseStudyArticle.css';

// Lets module-level block renderers (e.g. FigureBlock) reach the media-library
// opener without threading it through every renderer's props.
const MediaLibraryContext = createContext(null);

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
  const src = clean(entry.src);
  const embed = clean(entry.embedUrl);
  const video = !embed && (entry.isVideo || isVideoSrc(src));
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!video) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video]);
  if (!src && !embed) return null;
  const resp = !video && src && !src.startsWith('data:') ? buildResponsiveWebp(src) : null;
  return (
    <div ref={ref} className="cs-article-media-entry">
      {embed ? (
        <div className="cs-article-embed">
          <iframe
            src={embed}
            title={clean(entry.caption) || 'Embedded media'}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : video ? (
        <LazyVideo src={src} priority={inView ? 'high' : 'lazy'} controls className="cs-article-media" />
      ) : (
        <img
          src={src}
          alt={clean(entry.caption) || ''}
          loading="lazy"
          decoding="async"
          className="cs-article-media"
          {...(resp ? { srcSet: resp.srcSet, sizes: FIGURE_SIZES[tier] || FIGURE_SIZES.wide } : {})}
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
          onClick={() => setIdx((idx - 1 + count) % count)}>‹</button>
        <button type="button" className="cs-article-carousel-arrow cs-article-carousel-arrow--next" aria-label="Next image"
          onClick={() => setIdx((idx + 1) % count)}>›</button>
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
      <EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline placeholder="Paragraph text — **bold** supported" />
    </p>
  ) : (
    <Prose text={block.text} />
  );

const BulletsBlock = ({ block, editing, onPatch }) => {
  const items = listOf(block.items);
  const ListTag = block.ordered ? 'ol' : 'ul';
  const setItem = (i, v) => onPatch({ items: items.map((it, j) => (j === i ? v : it)) });
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
        {items.map((item, i) => (
          <li key={i}>
            {editing ? (
              <span className="cs-article-item-row">
                <EditableField value={item} onChange={(v) => setItem(i, v)} placeholder="Bullet text" />
                <button type="button" className="cs-article-mini-btn" title="Remove item"
                  onClick={() => onPatch({ items: items.filter((_, j) => j !== i) })}>✕</button>
              </span>
            ) : (
              <Rich text={item} />
            )}
          </li>
        ))}
      </ListTag>
      {editing && (
        <div className="cs-article-item-toolbar">
          <button type="button" className="cs-article-mini-btn" onClick={() => onPatch({ items: [...items, ''] })}>+ item</button>
          <button type="button" className="cs-article-mini-btn" onClick={() => onPatch({ ordered: !block.ordered })}>
            {block.ordered ? '→ bullets' : '→ numbered'}
          </button>
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
        ? <p className="cs-article-p"><EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline placeholder="Text — **bold** supported" /></p>
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
                  <EditableField value={row.text} onChange={(v) => setItem(i, { text: v })} multiline placeholder="Text — **bold** supported" />
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

const CardsBlock = ({ block, editing, onPatch }) => {
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
        </div>
      )}
    </>
  );
};

const FigureBlock = ({ block, editing, onPatch }) => {
  const openLibrary = useContext(MediaLibraryContext);
  const media = listOf(block.media);
  const width = ['prose', 'wide', 'full'].includes(block.width) ? block.width : 'wide';
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
      <div className={visible.length > 1 ? 'cs-article-figure-grid' : 'cs-article-figure-single'}>
        {visible.map((entry, i) => (
          <div className="cs-article-figure-cell" key={i}>
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
                {media.length > 1 && (
                  <button type="button" className="cs-article-mini-btn" title="Remove entry"
                    onClick={() => onPatch({ media: media.filter((_, j) => j !== i) })}>✕</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {(visible.some((m) => hasText(m.caption)) || editing) && (
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
          {media.length > 1 && (
            <button type="button" className={`cs-article-mini-btn${isCarousel ? ' is-active' : ''}`}
              title="Cycle entries as a carousel (like the slides) instead of a grid"
              onClick={() => onPatch({ display: isCarousel ? 'grid' : 'carousel' })}>
              carousel
            </button>
          )}
        </div>
      )}
    </figure>
  );
};

const QuoteBlock = ({ block, editing, onPatch }) => (
  <blockquote className="cs-article-quote cs-article-quote--large">
    <p>
      {editing
        ? <EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline placeholder="Quote text" />
        : clean(block.text)}
    </p>
    {(hasText(block.author) || hasText(block.role) || editing) && (
      <cite>
        {editing ? (
          <>
            — <EditableField value={block.author} onChange={(v) => onPatch({ author: v })} placeholder="Author" />
            {', '}
            <EditableField value={block.role} onChange={(v) => onPatch({ role: v })} placeholder="Role" />
          </>
        ) : (
          <>— {[clean(block.author), clean(block.role)].filter(Boolean).join(', ')}</>
        )}
      </cite>
    )}
  </blockquote>
);

const CalloutBlock = ({ block, editing, onPatch }) => (
  <div className="cs-article-callout">
    {editing
      ? <p className="cs-article-p"><EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline placeholder="Callout text — **bold** supported" /></p>
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

const BlockShell = ({ block, index, total, editing, ops, flash, onFlash, children }) => {
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
        <span className="cs-article-block-type">{block.type}</span>
        <button type="button" className="cs-article-ctl-btn" title="Move up" disabled={index === 0}
          onClick={() => ops.moveArticleBlock(index, -1)}>↑</button>
        <button type="button" className="cs-article-ctl-btn" title="Move down" disabled={index === total - 1}
          onClick={() => ops.moveArticleBlock(index, 1)}>↓</button>
        <button type="button" className="cs-article-ctl-btn" title="Duplicate"
          onClick={() => onFlash(ops.duplicateArticleBlock(index))}>⧉</button>
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

const NextCaseCards = ({ projectId }) => {
  const all = Object.keys(savedCaseStudies || {});
  const idx = all.indexOf(projectId);
  const ordered = idx >= 0 ? [...all.slice(idx + 1), ...all.slice(0, idx)] : all;
  const next = ordered.filter((id) => id !== projectId).slice(0, 2);
  if (!next.length) return null;
  return (
    <section className="cs-article-next">
      <div className="cs-article-next-grid">
        {next.map((id) => {
          const data = savedCaseStudies[id] || {};
          const intro = (data.slides || []).find((s) => s.type === 'intro');
          const thumb = normalizeMedia(intro?.image).find((e) => hasText(e.src) && !e.isVideo);
          return (
            <Link className="cs-article-next-card" to={`/project/${id}`} key={id}>
              {thumb && (
                <span className="cs-article-next-thumb">
                  <img src={thumb.src} alt="" loading="lazy" decoding="async" />
                </span>
              )}
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

const CaseStudyArticle = ({ project, projectId, editMode = false, ops, openMediaLibrary }) => {
  const authored = project?.article?.blocks?.length ? project.article : null;
  const derived = useMemo(
    () => (authored ? null : deriveArticleFromSlides(project)),
    [authored, project]
  );
  const article = authored || derived;
  const editing = !!(editMode && authored && ops);
  const [pickerAt, setPickerAt] = useState(null); // index after which to insert; null = closed

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
      >
        <Renderer
          block={blk}
          editing={editing}
          onPatch={(patch) => ops && ops.updateArticleBlock(realIndex, patch)}
        />
      </BlockShell>
    );
  };

  return (
    <MediaLibraryContext.Provider value={openMediaLibrary}>
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
            <EditableField value={article?.lede} onChange={(v) => ops.updateArticle({ lede: v })} multiline placeholder="Lede / standfirst (optional)" />
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
    </article>
    </MediaLibraryContext.Provider>
  );
};

export default CaseStudyArticle;
