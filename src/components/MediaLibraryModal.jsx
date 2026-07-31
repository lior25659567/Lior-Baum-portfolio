import { useMemo, useState, useEffect } from 'react';
import { classifyMediaItem, libraryItemRef } from '../data/mediaLibrary';
import { buildResponsiveWebp, LazyVideo, deriveVideoPoster } from '../pages/caseStudyMedia';
import './MediaLibraryModal.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
  { key: 'figma', label: 'Figma' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'embed', label: 'Other embeds' },
];

const filenameOf = (ref) => {
  if (!ref || ref.startsWith('data:')) return '';
  try { return decodeURIComponent(ref.split('?')[0].split('/').pop() || ''); } catch { return ''; }
};

const Thumb = ({ item }) => {
  const kind = classifyMediaItem(item);
  if (kind === 'video') {
    const poster = deriveVideoPoster(item.src);
    if (poster) {
      return <img className="cs-media-thumb-img" src={poster} alt="" loading="lazy" />;
    }
    return (
      <LazyVideo
        src={item.src}
        controls={false}
        priority="lazy"
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  if (kind === 'figma' || kind === 'youtube' || kind === 'embed') {
    return <div className={`cs-media-thumb-embed cs-media-thumb-embed--${kind}`}>{kind === 'figma' ? 'Figma' : kind === 'youtube' ? 'YouTube' : 'Embed'}</div>;
  }
  const responsive = buildResponsiveWebp(item.src);
  return (
    <img
      className="cs-media-thumb-img"
      src={item.src}
      srcSet={responsive?.srcSet}
      sizes={responsive?.sizes}
      alt={item.caption || ''}
      loading="lazy"
    />
  );
};

const MediaLibraryModal = ({ open, items, mode = 'pick', onPick, onRemove, onAddFile, onAddEmbed, onClose, usageCountOf }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedDraft, setEmbedDraft] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const counts = useMemo(() => {
    const c = { all: items.length, image: 0, video: 0, figma: 0, youtube: 0, embed: 0 };
    items.forEach((it) => { c[classifyMediaItem(it)] += 1; });
    return c;
  }, [items]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== 'all' && classifyMediaItem(it) !== filter) return false;
      if (!q) return true;
      const ref = libraryItemRef(it);
      return (
        (it.caption || '').toLowerCase().includes(q) ||
        filenameOf(ref).toLowerCase().includes(q) ||
        (it.embedUrl || '').toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  if (!open) return null;

  return (
    <div className="template-modal-overlay cs-media-overlay" onClick={onClose}>
      <div className="template-modal cs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cs-media-head">
          <span className="cs-media-title">Media Library</span>
          <button type="button" className="cs-media-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cs-media-filterbar">
          <div className="cs-media-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`cs-media-chip${filter === f.key ? ' is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="cs-media-chip-count">{counts[f.key] || 0}</span>
              </button>
            ))}
          </div>
          <input
            className="cs-media-search"
            type="text"
            placeholder="Search caption / filename…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="cs-media-grid">
          <div className="cs-media-add">
            <button type="button" className="cs-media-add-btn" onClick={onAddFile}>＋ Upload</button>
            {!embedOpen ? (
              <button type="button" className="cs-media-add-link" onClick={() => setEmbedOpen(true)}>or embed URL…</button>
            ) : (
              <div className="cs-media-embed-row">
                <input
                  className="cs-media-embed-input"
                  type="text"
                  autoFocus
                  placeholder="Figma / YouTube / site URL"
                  value={embedDraft}
                  onChange={(e) => setEmbedDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onAddEmbed(embedDraft.trim()); setEmbedDraft(''); setEmbedOpen(false); } }}
                />
                <button type="button" className="cs-media-embed-apply" onClick={() => { onAddEmbed(embedDraft.trim()); setEmbedDraft(''); setEmbedOpen(false); }}>Add</button>
              </div>
            )}
          </div>

          {shown.map((item) => {
            const ref = libraryItemRef(item);
            return (
              <div className={`cs-media-tile${mode === 'pick' ? ' is-pickable' : ''}`} key={item.id || ref}>
                <button
                  type="button"
                  className="cs-media-tile-body"
                  disabled={mode !== 'pick'}
                  onClick={() => mode === 'pick' && onPick(item)}
                  title={mode === 'pick' ? 'Insert this media' : ''}
                >
                  <Thumb item={item} />
                  <span className={`cs-media-badge cs-media-badge--${classifyMediaItem(item)}`}>{classifyMediaItem(item)}</span>
                  {(item.caption || filenameOf(ref)) && (
                    <span className="cs-media-caption">{item.caption || filenameOf(ref)}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="cs-media-remove"
                  title="Remove from library"
                  onClick={() => {
                    const used = usageCountOf ? usageCountOf(ref) : 0;
                    if (used > 0 && !window.confirm(`Still used on ${used} place(s). This only removes it from the library, not from the deck/article. Remove?`)) return;
                    onRemove(item);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}

          {!shown.length && <div className="cs-media-empty">No media in this filter.</div>}
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;
