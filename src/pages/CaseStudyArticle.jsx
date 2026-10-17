import { Fragment, createContext, useContext, useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { entranceTargets, useArticleScrollMotion, useHeroScrollMotion } from './articleMotion';
import { savedCaseStudies } from '../data/case-studies/index.js';
import { contactDefaults } from '../data/caseStudyData';
import { buildResponsiveWebp, LazyVideo, pickMediaFile } from './caseStudyMedia';
import EditableField from '../components/EditableField';
import { useEdit } from '../context/EditContext';
import { getHomeCardTone } from '../data/homeProjects';
import { AnnotationLayer, AnnotationEditor, AnnotationNotes } from '../components/ImageAnnotations';
import { CARD_ICONS, CARD_ICON_KEYS, TONE_DEFAULT_ICON } from '../components/CardIcons';
import { widont } from '../utils/typography';
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
// Tone (0–4) of this study's card on the home grid, so a media entry with the
// "card" mat paints the same orange → partner-colour gradient as that card.
const CardToneContext = createContext(null);

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
  prose: '(min-width: 1020px) 920px, 94vw',
  wide: '(min-width: 1240px) 1160px, 94vw',
  full: '(min-width: 1480px) 1400px, 96vw',
};

/* ── Rich text (**bold** markdown-lite) ───────────────────────────────── */

// Read-view text never ends on a one-word line: `widont` ties the last two words.
const Rich = ({ text }) => splitBold(widont(text)).map((seg, i) =>
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

// One color scheme per image drives BOTH its Accepted/Rejected chip and its
// annotations: 'brand' (accent / ink) or 'semantic' (green / red). Unset:
// green/red when the image has annotations, brand when it only has a chip —
// each image's old default. Reads the older per-part fields too.
const mediaPalette = (entry) => {
  if (entry.palette === 'brand' || entry.palette === 'semantic') return entry.palette;
  if (entry.annotationPalette === 'brand') return 'brand';
  if (entry.chipColors === 'semantic') return 'semantic';
  return listOf(entry.annotations).length ? 'semantic' : 'brand';
};

const MediaEntry = ({ entry, tier, annotating = false, onAnnotationsChange, onAnnotateDone }) => {
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
      // 0.15, not 0.35: `inView` drives LazyVideo's priority (and therefore
      // autoplay), so a high threshold left videos paused on their poster until
      // a third of the figure was on screen — on a phone that reads as "I have
      // to tap every video". A tall figure (portrait clip + mat + caption) can
      // also cap its own max ratio below 0.35 and never fire at all.
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video, embed]);
  // "Card" mat: the gradient behind this entry is the home card's, so keep it
  // moving the same way — sway the angle and slide the stops (--ga/--g0/--g1,
  // read by .cs-article-media-entry--matcard). Same ranges as ProjectCard.
  const cardTone = useContext(CardToneContext);
  const matCard = !!entry.border && entry.borderColor === 'card';
  useEffect(() => {
    if (!matCard) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const drift = (name, min, max, unit, i) => gsap.to(el, {
      [name]: () => `${gsap.utils.random(min, max)}${unit}`,
      duration: () => gsap.utils.random(4, 7),
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
      ease: 'sine.inOut',
      delay: i * 0.4,
    });
    const ctx = gsap.context(() => {
      drift('--ga', 80, 170, 'deg', 0); // direction
      drift('--g0', 22, 52, '%', 1);   // where orange ends
      drift('--g1', 80, 108, '%', 2);  // where the second colour is full
    }, el);
    return () => ctx.revert();
  }, [matCard]);
  if (!src && !embed) return null;
  const resp = !video && src && !src.startsWith('data:') ? buildResponsiveWebp(src) : null;
  const annotPalette = mediaPalette(entry) === 'brand' ? 'brand' : undefined;
  return (
    <div ref={ref}
      className={`cs-article-media-entry${entry.border ? ' cs-article-media-entry--bordered' : ''}${entry.border && entry.borderColor === 'cream' ? ' cs-article-media-entry--matcream' : ''}${matCard ? ' cs-article-media-entry--matcard' : ''}${entry.shadow === false ? ' cs-article-media-entry--noshadow' : ''}`}
      data-card-tone={matCard ? (cardTone ?? 0) : undefined}>
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
      ) : (
        <div className="cs-annot-stage">
          {video ? (
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
          {annotating ? (
            <AnnotationEditor annotations={entry.annotations} onChange={onAnnotationsChange} onDone={onAnnotateDone} palette={annotPalette} />
          ) : (
            listOf(entry.annotations).length > 0 && <AnnotationLayer annotations={entry.annotations} palette={annotPalette} />
          )}
        </div>
      )}
      {!annotating && !embed && <AnnotationNotes annotations={entry.annotations} palette={annotPalette} />}
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

// Heading sizes = the article's fixed type scale (40/30/24/18/16). The three
// larger steps render as <h2>, the two smaller as <h3>, so picking a size
// keeps the outline sensible. Unset size falls back to the level's default.
const HEADING_SIZES = [
  { key: 'xl', label: 'Display', px: 40, level: 2 },
  { key: 'lg', label: 'H1', px: 30, level: 2 },
  { key: 'md', label: 'H2', px: 24, level: 2 },
  { key: 'sm', label: 'H3', px: 18, level: 3 },
  { key: 'xs', label: 'H4', px: 16, level: 3 },
];
const HEADING_ALIGNS = [
  { key: 'left', label: 'Left' },
  { key: 'center', label: 'Center' },
];

const HeadingBlock = ({ block, editing, onPatch }) => {
  const level = Number(block.level) === 3 ? 3 : 2;
  const size = HEADING_SIZES.find((sz) => sz.key === block.size)?.key || (level === 3 ? 'xs' : 'md');
  const align = block.align === 'center' ? 'center' : 'left';
  const Tag = level === 3 ? 'h3' : 'h2';
  const mods = `${block.size ? ` cs-article-heading--${size}` : ''}${align === 'center' ? ' cs-article-heading--center' : ''}`;
  return (
    <>
      {(hasText(block.eyebrow) || editing) && (
        <p className={`cs-article-eyebrow${align === 'center' ? ' cs-article-heading--center' : ''}`}>
          {editing
            ? <EditableField value={block.eyebrow} onChange={(v) => onPatch({ eyebrow: v })} placeholder="Eyebrow (optional)" />
            : block.eyebrow}
        </p>
      )}
      <Tag className={`${level === 3 ? 'cs-article-h3' : 'cs-article-h2'}${mods}`}>
        {editing
          ? <EditableField value={block.text} onChange={(v) => onPatch({ text: v })} multiline placeholder="Heading" />
          : widont(oneLine(block.text))}
      </Tag>
      {editing && (
        <div className="cs-article-item-toolbar cs-article-heading-toolbar">
          <span className="cs-article-seg" role="group" aria-label="Heading size">
            <span className="cs-article-seg-label">Size</span>
            {HEADING_SIZES.map((sz) => (
              <button key={sz.key} type="button" title={`${sz.label} — ${sz.px}px`}
                className={`cs-article-mini-btn${size === sz.key ? ' is-active' : ''}`}
                onClick={() => onPatch({ size: sz.key, level: sz.level })}>
                {sz.label} <span className="cs-article-heading-px">{sz.px}</span>
              </button>
            ))}
          </span>
          <span className="cs-article-seg" role="group" aria-label="Heading alignment">
            <span className="cs-article-seg-label">Align</span>
            {HEADING_ALIGNS.map((al) => (
              <button key={al.key} type="button"
                className={`cs-article-mini-btn${align === al.key ? ' is-active' : ''}`}
                onClick={() => onPatch({ align: al.key })}>
                {al.label}
              </button>
            ))}
          </span>
        </div>
      )}
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

const CARD_TONES = ['neutral', 'negative', 'positive'];
const CARD_VARIANTS = ['numbered', 'icon', 'stat', 'plain'];
const CARD_VARIANT_LABELS = { numbered: 'Numbers', icon: 'Icons', stat: 'Stats', plain: 'No badge' };
// Badge look for number chips and icons. Unset = each variant's original
// look: a filled number chip, a soft icon circle.
const BADGE_STYLES = ['filled', 'soft', 'outline', 'square', 'bare'];
// Badge color per card — the same palette for number chips and icons.
const CARD_COLORS = ['accent', 'ink', 'gray', 'success', 'error'];
const CARD_COLOR_LABELS = { accent: 'Accent', ink: 'Ink', gray: 'Gray', success: 'Green', error: 'Red' };
// Cards saved before per-card colors keep their look.
const LEGACY_ICON_COLOR = { neutral: 'gray', negative: 'accent', positive: 'success' };
const badgeColorOf = (item, tone, variant) => (CARD_COLORS.includes(item.color)
  ? item.color
  : variant === 'icon' ? LEGACY_ICON_COLOR[tone] : 'accent');

const CardIcon = ({ item, tone, color }) => {
  const key = item.icon || TONE_DEFAULT_ICON[tone];
  if (key === 'none') return null;
  return <span className={`cs-article-card-icon cs-article-badge-c--${color}`}>{CARD_ICONS[key] || CARD_ICONS.dot}</span>;
};

const CardsBlock = ({ block, editing, onPatch, onConvert }) => {
  // Which card's icon picker is open (index); -1 = none.
  const [pickerFor, setPickerFor] = useState(-1);
  const items = listOf(block.items);
  const variant = CARD_VARIANTS.includes(block.variant) ? block.variant : 'numbered';
  const badge = BADGE_STYLES.includes(block.badge) ? block.badge : (variant === 'icon' ? 'soft' : 'filled');
  const hasBadge = variant === 'numbered' || variant === 'icon';
  const cols = Math.min(Math.max(Number(block.columns) || 2, 1), 4);
  const setItem = (i, patch) => onPatch({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  // Switching Numbers ↔ Icons keeps the badge look: the current badge style and
  // each card's current color are saved explicitly, so nothing shifts.
  const switchVariant = (v) => {
    if (v === variant) return;
    const carry = hasBadge && (v === 'numbered' || v === 'icon');
    onPatch({
      variant: v,
      ...(carry ? {
        badge,
        items: items.map((it) => ({ ...it, color: badgeColorOf(it, CARD_TONES.includes(it.tone) ? it.tone : 'neutral', variant) })),
      } : {}),
    });
  };
  if (!items.length && !editing) return null;
  return (
    <>
      {(hasText(block.title) || editing) && (
        <h3 className="cs-article-h3">
          {editing
            ? <EditableField value={block.title} onChange={(v) => onPatch({ title: v })} placeholder="Cards title (optional)" />
            : widont(clean(block.title))}
        </h3>
      )}
      <div className={`cs-article-cards cs-article-cards--${variant} cs-article-cards--cols-${cols}${hasBadge ? ` cs-article-cards--badge-${badge}` : ''}`} style={{ '--cs-cards-cols': cols }}>
        {items.map((item, i) => {
          const tone = CARD_TONES.includes(item.tone) ? item.tone : 'neutral';
          const color = badgeColorOf(item, tone, variant);
          return (
            <div className={`cs-article-card cs-article-card--${tone}`} key={i}>
              {variant === 'numbered' && hasText(item.number) && (
                <span className={`cs-article-card-num cs-article-badge-c--${color}`}>
                  {editing ? <EditableField value={item.number} onChange={(v) => setItem(i, { number: v })} placeholder="1" /> : clean(item.number)}
                </span>
              )}
              {variant === 'icon' && <CardIcon item={item} tone={tone} color={color} />}
              {variant === 'stat' && (hasText(item.value) || editing) && (
                <span className="cs-article-card-value">
                  {editing ? <EditableField value={item.value} onChange={(v) => setItem(i, { value: v })} placeholder="75%" /> : clean(item.value)}
                </span>
              )}
              <div className="cs-article-card-body">
                {(hasText(item.title) || editing) && (
                  <p className="cs-article-card-title">
                    {editing ? <EditableField value={item.title} onChange={(v) => setItem(i, { title: v })} placeholder="Title" /> : widont(clean(item.title))}
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
                      <>
                        <button type="button" className={`cs-article-mini-btn${pickerFor === i ? ' is-active' : ''}`}
                          title="Choose this card's icon, or remove it"
                          onClick={() => setPickerFor(pickerFor === i ? -1 : i)}>
                          icon: {item.icon || TONE_DEFAULT_ICON[tone]} ▾
                        </button>
                      </>
                    )}
                    {hasBadge && (
                      <span className="cs-article-card-swatches" role="group" aria-label="Badge color">
                        {CARD_COLORS.map((c) => (
                          <button key={c} type="button" title={CARD_COLOR_LABELS[c]} aria-label={`${CARD_COLOR_LABELS[c]} badge`}
                            className={`cs-article-card-swatch cs-article-badge-c--${c}${color === c ? ' is-active' : ''}`}
                            onClick={() => setItem(i, { color: c })} />
                        ))}
                      </span>
                    )}
                    <button type="button" className="cs-article-mini-btn" title="Remove card"
                      onClick={() => onPatch({ items: items.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                )}
                {editing && variant === 'icon' && pickerFor === i && (
                  <div className="cs-article-icon-picker" role="listbox" aria-label="Card icon">
                    {CARD_ICON_KEYS.map((k) => (
                      <button key={k} type="button" title={k} aria-label={k}
                        className={`cs-article-icon-opt${(item.icon || TONE_DEFAULT_ICON[tone]) === k ? ' is-active' : ''}`}
                        onClick={() => { setItem(i, { icon: k }); setPickerFor(-1); }}>
                        {CARD_ICONS[k]}
                      </button>
                    ))}
                    <button type="button" title="Remove icons from every card in this block" aria-label="No icon"
                      className={`cs-article-icon-opt cs-article-icon-opt--none${item.icon === 'none' ? ' is-active' : ''}`}
                      onClick={() => { onPatch({ items: items.map((it) => ({ ...it, icon: 'none' })) }); setPickerFor(-1); }}>
                      none (all)
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <div className="cs-article-item-toolbar cs-article-cards-toolbar">
          <button type="button" className="cs-article-mini-btn"
            onClick={() => onPatch({ items: [...items, { number: String(items.length + 1), tone: 'neutral', title: '', description: '', value: '' }] })}>
            + card
          </button>
          <span className="cs-article-seg" role="group" aria-label="Card style">
            <span className="cs-article-seg-label">Style</span>
            {CARD_VARIANTS.map((v) => (
              <button key={v} type="button" className={`cs-article-mini-btn${variant === v ? ' is-active' : ''}`}
                onClick={() => switchVariant(v)}>
                {CARD_VARIANT_LABELS[v]}
              </button>
            ))}
          </span>
          {hasBadge && (
            <span className="cs-article-seg" role="group" aria-label="Badge style">
              <span className="cs-article-seg-label">Badge</span>
              {BADGE_STYLES.map((b) => (
                <button key={b} type="button" title={`${b} badge`}
                  className={`cs-article-badge-opt cs-article-cards--badge-${b}${badge === b ? ' is-active' : ''}`}
                  onClick={() => onPatch({ badge: b })}>
                  <span className="cs-article-badge-pair">
                    <span className="cs-article-card-num cs-article-badge-c--accent">1</span>
                    <span className="cs-article-card-icon cs-article-badge-c--accent">{CARD_ICONS.star}</span>
                  </span>
                  <span className="cs-article-badge-name">{b}</span>
                </button>
              ))}
            </span>
          )}
          <span className="cs-article-seg" role="group" aria-label="Columns">
            <span className="cs-article-seg-label">Columns</span>
            {[1, 2, 3, 4].map((c) => (
              <button key={c} type="button" className={`cs-article-mini-btn${cols === c ? ' is-active' : ''}`}
                onClick={() => onPatch({ columns: c })}>{c}</button>
            ))}
          </span>
          <button type="button" className="cs-article-mini-btn"
            title="Turn these cards into a bullet list — each card title becomes the bullet's bold lead-in"
            onClick={() => onConvert && onConvert('bullets')}>→ bullets</button>
        </div>
      )}
    </>
  );
};

const FigureBlock = ({ block, editing, onPatch, isHero = false }) => {
  const openLibrary = useContext(MediaLibraryContext);
  const figureCardTone = useContext(CardToneContext); // paints the "card" mat swatch
  // Which media entry (index) is in annotation mode; -1 = none. One at a time.
  const [annotatingIdx, setAnnotatingIdx] = useState(-1);
  const media = listOf(block.media);
  // The hero figure (first block) sits on the study's home-card gradient by
  // default — every study, authored or derived from slides — so a plain
  // screenshot dropped in matches its card with no setup. Only a default: an
  // entry that says border:false / another mat keeps what it says, and the
  // edit toggles write explicit values back (setEntry patches the raw media).
  const withDefaults = (m) => (isHero ? { border: true, borderColor: 'card', ...m } : m);
  const width = ['prose', 'wide', 'full'].includes(block.width) ? block.width : 'wide';
  const gridCols = Math.min(Math.max(Number(block.gridCols) || 2, 1), 6);
  const setEntry = (i, patch) => onPatch({ media: media.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const pickFromLibrary = (i) => openLibrary((item) => setEntry(i, { src: item.src || '', isVideo: !!item.isVideo, embedUrl: item.embedUrl || '' }));
  const visible = (editing ? media : media.filter((m) => hasText(m.src) || hasText(m.embedUrl))).map(withDefaults);
  if (!visible.length && !editing) return null;
  // Carousel view: cycle entries like the deck does. While editing, entries
  // stay laid out as a grid so each one remains directly manageable.
  const isCarousel = block.display === 'carousel' && visible.length > 1;
  if (isCarousel && !editing) {
    return (
      <figure className={`cs-article-figure cs-article-figure--${width}`}>
        <ArticleCarousel entries={visible} tier={width} interval={block.interval} />
        {visible.some((m) => hasText(m.caption)) && (
          <figcaption>{widont(clean(visible.find((m) => hasText(m.caption))?.caption))}</figcaption>
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
              <span className={`cs-article-figure-chip cs-article-figure-chip--${entry.status}${mediaPalette(entry) === 'semantic' ? ' cs-article-figure-chip--semantic' : ''}`}>
                {clean(entry.statusLabel) || (entry.status === 'accepted' ? 'Accepted' : 'Rejected')}
              </span>
            )}
            {(hasText(entry.src) || hasText(entry.embedUrl))
              ? <MediaEntry
                  entry={entry}
                  tier={width}
                  annotating={editing && annotatingIdx === i}
                  onAnnotationsChange={(list) => setEntry(i, { annotations: list })}
                  onAnnotateDone={() => setAnnotatingIdx(-1)}
                />
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
                {hasText(entry.src) && !hasText(entry.embedUrl) && block.display !== 'carousel' && (
                  <button type="button" className={`cs-article-mini-btn${annotatingIdx === i ? ' is-active' : ''}`}
                    title="Draw arrows, boxes, pen strokes and text on this image"
                    onClick={() => setAnnotatingIdx(annotatingIdx === i ? -1 : i)}>
                    {annotatingIdx === i ? 'done' : `annotate${listOf(entry.annotations).length ? ` (${listOf(entry.annotations).length})` : ''}`}
                  </button>
                )}
                {(entry.status || listOf(entry.annotations).length > 0) && (
                  <span className="cs-article-chip-colors" role="group" aria-label="Image colors">
                    <button type="button" className={`cs-article-mini-btn${mediaPalette(entry) === 'brand' ? ' is-active' : ''}`}
                      title="Brand colors for this image's chip and annotations — accent for accepted/positive, ink for rejected/negative"
                      onClick={() => setEntry(i, { palette: 'brand', chipColors: undefined, annotationPalette: undefined })}>
                      <span className="cs-article-chip-dot cs-article-chip-dot--brand" />
                      <span className="cs-article-chip-dot cs-article-chip-dot--ink" />
                      brand
                    </button>
                    <button type="button" className={`cs-article-mini-btn${mediaPalette(entry) === 'semantic' ? ' is-active' : ''}`}
                      title="Green / red for this image's chip and annotations"
                      onClick={() => setEntry(i, { palette: 'semantic', chipColors: undefined, annotationPalette: undefined })}>
                      <span className="cs-article-chip-dot cs-article-chip-dot--ok" />
                      <span className="cs-article-chip-dot cs-article-chip-dot--no" />
                      green/red
                    </button>
                  </span>
                )}
                <button type="button" className={`cs-article-mini-btn${entry.border ? ' is-active' : ''}`}
                  title="Toggle a framed border on this image"
                  onClick={() => setEntry(i, { border: !entry.border })}>border</button>
                {entry.border && (
                  <span className="cs-article-mat-swatches" title="Mat color">
                    {[
                      ['white', '#ffffff', 'White mat'],
                      ['cream', '#F1F0ED', 'Cream mat (#F1F0ED)'],
                      // 'card' has no flat colour — the swatch is painted by CSS
                      // with the home card's gradient (tone from data-card-tone).
                      ['card', null, "Card mat — the same orange gradient as this study's card on the home page; drop a plain screenshot on top"],
                    ].map(([key, col, label]) => (
                      <button key={key} type="button"
                        className={`cs-article-mat-swatch${key === 'card' ? ' cs-article-mat-swatch--card' : ''}${(['cream', 'card'].includes(entry.borderColor) ? entry.borderColor : 'white') === key ? ' is-active' : ''}`}
                        style={col ? { background: col } : undefined}
                        data-card-tone={key === 'card' ? (figureCardTone ?? 0) : undefined}
                        title={label}
                        aria-label={label}
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
                {entry.status && (
                  <input
                    key={`chip-text-${entry.status}`}
                    type="text"
                    className="cs-article-embed-input cs-article-chip-text"
                    aria-label="Chip text"
                    title="Chip text — leave empty for the default"
                    placeholder={entry.status === 'accepted' ? 'Accepted' : 'Rejected'}
                    defaultValue={entry.statusLabel || ''}
                    onBlur={(e) => setEntry(i, { statusLabel: e.target.value.trim() || undefined })}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  />
                )}
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
                    {hasText(entry.title) && <strong className="cs-article-figure-cell-title">{widont(clean(entry.title))}</strong>}
                    {hasText(entry.caption) && <span className="cs-article-figure-cell-desc">{widont(clean(entry.caption))}</span>}
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
            : widont(clean(visible.find((m) => hasText(m.caption))?.caption))}
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
          : widont(clean(q.text))}
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
      {editing ? <EditableField value={block.title} onChange={(v) => onPatch({ title: v })} placeholder="Chapter title" /> : widont(oneLine(block.title))}
    </h2>
    {(hasText(block.subtitle) || editing) && (
      <p className="cs-article-chapter-subtitle">
        {editing ? <EditableField value={block.subtitle} onChange={(v) => onPatch({ subtitle: v })} multiline placeholder="Subtitle (optional)" /> : widont(clean(block.subtitle))}
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

// Studies that exist and are reachable by direct link, but shouldn't be offered
// as a "read this next" suggestion. `index.js` is auto-generated, so the list
// lives here rather than in the case-study registry.
const NEXT_CARD_HIDDEN = ['wizecare'];

const NextCaseCards = ({ projectId }) => {
  const all = Object.keys(savedCaseStudies || {});
  const idx = all.indexOf(projectId);
  const ordered = idx >= 0 ? [...all.slice(idx + 1), ...all.slice(0, idx)] : all;
  const candidates = ordered.filter((id) => id !== projectId && !NEXT_CARD_HIDDEN.includes(id));
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
  // Which gradient tone this study's card has on the home grid (null = no
  // card). Read from the same saved content the home grid renders from.
  const { content: homeContent } = useEdit();
  const cardTone = useMemo(() => getHomeCardTone(homeContent, projectId), [homeContent, projectId]);
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

  // ── Open a newly-navigated case study at the top ─────────────────────────
  // The next-case cards link to another /project/:id, which only swaps the
  // route param — CaseStudy never unmounts, so `.case-study--article` keeps
  // the scrollTop it had. Since those cards sit at the very bottom, the new
  // study opened scrolled to its end. Reset on every project change.
  // ScrollToTop in App.jsx doesn't cover this: it moves the *window*, and the
  // article scrolls inside its own overflow container.
  const prevProjectIdRef = useRef(projectId);
  useLayoutEffect(() => {
    if (prevProjectIdRef.current === projectId) return;
    prevProjectIdRef.current = projectId;
    const sc = document.querySelector('.case-study--article');
    if (!sc) return;
    const toTop = () => {
      const prev = sc.style.scrollBehavior;
      sc.style.scrollBehavior = 'auto'; // never animate this jump
      sc.scrollTop = 0;
      sc.style.scrollBehavior = prev;
    };
    toTop();
    // The new study's blocks mount a tick later and can re-anchor scroll;
    // re-assert once the layout has settled.
    const raf = requestAnimationFrame(toTop);
    const timer = setTimeout(toTop, 140);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [projectId]);

  // ── GSAP entrance stagger ────────────────────────────────────────────────
  // Runs on first mount and on every project change (the next-case cards).
  // Declared AFTER the scroll-reset effect above so that, on a project switch,
  // the container is already at the top before the stagger plays — otherwise
  // the animation would run against content the viewer can't see.
  //
  // Keyed on the rendered CONTENT (title + block ids), not projectId: after a
  // next-case click the URL changes ~200ms before the new study mounts, so a
  // projectId-keyed run animated the outgoing study's nodes and the incoming
  // one appeared unanimated. The async IndexedDB copy landing with the same
  // content leaves the key unchanged, so it doesn't replay.
  //
  // Skipped in edit mode: the editor's insert zones and control pills change
  // the layout, and re-animating blocks while the designer is working is noise.
  const articleRef = useRef(null);
  const blockKey = blocks.map((b) => b.id || b.type).join(',');
  const contentKey = `${article?.title || ''}|${blockKey}`;
  useLayoutEffect(() => {
    if (editMode) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const root = articleRef.current;
    // Nothing rendered yet (data still loading) — nothing to animate.
    if (!root || !blockKey) return;
    let rafHandle = null;
    let timeoutHandle = null;
    const ctx = gsap.context(() => {
      // Shared with the scroll motion below, which leaves these alone.
      const targets = entranceTargets(root);
      if (!targets.length) return;

      // Hide immediately, before the browser paints, so nothing flashes in at
      // full opacity and then jumps back to animate.
      gsap.set(targets, {
        opacity: 0,
        y: (i) => (i === 0 ? 24 : 16),
        force3D: true,
        willChange: 'opacity, transform', // own compositor layer for the tween
      });

      // ...but only START once the main thread is free. Mounting an 85-block
      // article and decoding the hero image produces 200-330ms long tasks, and
      // GSAP ticks on rAF — a tween begun inside that window can't tick, so it
      // visibly jumps instead of easing. That was the reported lag. Idle-start
      // costs nothing perceptually: the content isn't readable until that same
      // work finishes anyway.
      // Strip the inline styles once done. A lingering transform makes the
      // element a containing block for fixed/absolute descendants, and
      // caseStudyMedia notes transformed ancestors can stall iOS autoplay on
      // videos inside. A lingering will-change pins a GPU layer for the life of
      // the page, which costs memory on phones.
      const CLEAR = 'opacity,transform,willChange';
      let settled = false;
      const play = () => {
        if (settled) return;
        settled = true;
        gsap.to(targets, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
          clearProps: CLEAR,
        });
      };
      // Hard bound. The targets are invisible until we start, so rather than
      // hold a blank article indefinitely on a slow load — or play into a busy
      // thread and stutter (the original bug) — give up on the animation and
      // just show the content. Smooth-or-nothing, never slow-and-janky.
      const revealNow = () => {
        if (settled) return;
        settled = true;
        gsap.set(targets, { clearProps: CLEAR });
      };

      // Start only once the main thread is actually delivering fast frames.
      // requestIdleCallback alone is NOT enough: on a client-side navigation
      // (home project card → study) the thread is briefly idle right after the
      // click, so rIC fires BEFORE React mounts the article — and the mount
      // then dropped a 139ms frame into the middle of the tween. Probing real
      // frame deltas covers both cases: a fresh load waits out the commit, a
      // client nav waits out the mount.
      let tries = 0, calm = 0;
      const waitForCalm = () => {
        const t0 = performance.now();
        rafHandle = requestAnimationFrame(() => {
          if (settled) return;
          // A healthy 60Hz frame is ~16.7ms; anything beyond means the thread
          // is still busy and a tween started now would skip. Require a short
          // STREAK — a single fast frame can sit in a gap between two long
          // tasks, which is exactly how a 117ms decode landed mid-tween.
          if (performance.now() - t0 <= 24) calm++; else calm = 0;
          if (calm >= 3 || ++tries >= 40) play();
          else waitForCalm();
        });
      };
      // Decoding the figures' images is the other long task that lands after
      // mount (~200ms later, ~117ms long). Let it finish before animating —
      // img.decode() resolves once the bitmap is ready, so the tween isn't
      // competing with it. Raced against a timeout so a slow/erroring image
      // can't hold the article hidden.
      const imgs = targets.flatMap((el) => Array.from(el.querySelectorAll('img'))).slice(0, 6);
      const decoded = Promise.all(imgs.map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())));
      Promise.race([decoded, new Promise((r) => setTimeout(r, 300))]).then(() => {
        if (!settled) waitForCalm();
      });
      // Hard cap on how long the article may stay hidden.
      timeoutHandle = setTimeout(revealNow, 650);
    }, articleRef);
    // revert() restores the original inline styles, so a mid-flight navigation
    // can never strand a block at opacity 0. Cancel any pending start too.
    return () => {
      if (rafHandle !== null) cancelAnimationFrame(rafHandle);
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
      ctx.revert();
    };
  }, [contentKey, blockKey, editMode]);

  // ── Scroll-in motion for everything below the fold ──────────────────────
  // Declared after the entrance stagger so its targets are already claimed.
  useArticleScrollMotion(articleRef, { enabled: !editMode, resetKey: contentKey });
  // The hero image eases away on scroll and reverses when scrolled back to.
  useHeroScrollMotion(articleRef, { enabled: !editMode, resetKey: contentKey });

  const quickAdd =(type, at) => flash(ops.addArticleBlock(type, at));

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
          isHero={heroFirst && realIndex === 0}
          onPatch={(patch) => ops && ops.updateArticleBlock(realIndex, patch)}
          onConvert={(toType) => ops && ops.convertArticleBlock(realIndex, toType)}
        />
      </BlockShell>
    );
  };

  return (
    <MediaLibraryContext.Provider value={openMediaLibrary}>
    <LightboxContext.Provider value={editMode ? null : onImageClick}>
    <CardToneContext.Provider value={cardTone}>
    <article ref={articleRef} className={`cs-article${editing ? ' cs-article--editing' : ''}`}>
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

      {/* data-hero = the hero figure's width tier (same fallback as FigureBlock),
          so the title can take more air under a full-bleed hero (CSS). */}
      <header
        className="cs-article-header"
        data-hero={heroBlock ? (['prose', 'wide', 'full'].includes(heroBlock.width) ? heroBlock.width : 'wide') : undefined}
      >
        <h1 className="cs-article-h1">
          {editing
            ? <EditableField value={article?.title} onChange={(v) => ops.updateArticle({ title: v })} multiline placeholder="Article title" />
            : widont(oneLine(article?.title) || oneLine(project?.title))}
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
    </CardToneContext.Provider>
    </LightboxContext.Provider>
    </MediaLibraryContext.Provider>
  );
};

export default CaseStudyArticle;
