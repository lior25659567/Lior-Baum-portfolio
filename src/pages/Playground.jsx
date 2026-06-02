import { useRef, useState, useCallback, useMemo } from 'react';
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

// Lightweight inline editable text — same contentEditable pattern the About
// page uses, kept local so Playground owns its own editing surface.
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

const PlaygroundCard = ({ item, index, editMode, onUpdate, onRemove, onMoveLeft, onMoveRight, isFirst, isLast }) => {
  const fileInputRef = useRef(null);
  const url = normalizeUrl(item.url);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress + inline as a data URL, sized for a 2× retina card thumbnail —
    // same approach as the Projects grid so the home-content JSON stays small.
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const maxH = 900;
        let { width, height } = img;
        const scale = Math.min(1, maxW / width, maxH / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const srcIsPng = typeof event.target.result === 'string' && event.target.result.startsWith('data:image/png');
        const dataUrl = srcIsPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.9);
        onUpdate(item.id, { image: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [item.id, onUpdate]);

  return (
    <motion.article
      className="pg-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Click target — only when there's somewhere to go, and never over the editor */}
      {url && !editMode && (
        <a
          className="pg-card-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.title} (opens in a new tab)`}
        />
      )}

      {/* Media */}
      <div className="pg-card-media">
        <div
          className="pg-card-image"
          style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
        />
        {!item.image && (
          <div className="pg-card-placeholder" aria-hidden="true">
            <span className="pg-card-placeholder-mark">{String(index + 1).padStart(2, '0')}</span>
          </div>
        )}
        {editMode && (
          <div className="pg-image-overlay">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
            <button type="button" className="pg-image-btn" onClick={() => fileInputRef.current?.click()}>
              {item.image ? 'Replace image' : 'Add image'}
            </button>
            {item.image && (
              <button type="button" className="pg-image-btn pg-image-btn--ghost" onClick={() => onUpdate(item.id, { image: '' })}>
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content — mirrors the home project-card content block */}
      <div className="pg-card-content">
        <Editable
          value={item.title}
          onChange={(v) => onUpdate(item.id, { title: v })}
          tag="h3"
          className="pg-card-title"
          placeholder="A title that names the outcome"
        />

        <p className="pg-card-meta">
          <span className="pg-card-role">
            <Editable
              value={item.role}
              onChange={(v) => onUpdate(item.id, { role: v })}
              placeholder="Role"
            />
          </span>
          <span className="pg-card-year">
            <Editable
              value={item.year}
              onChange={(v) => onUpdate(item.id, { year: v })}
              placeholder="Year"
            />
          </span>
        </p>

        {/* Labels — same chips as the home project cards */}
        {editMode ? (
          <div className="pg-card-labels pg-card-labels--editing">
            {(item.labels || []).map((label, i) => (
              <span key={i} className="pg-card-label pg-card-label--editing">
                <input
                  className="pg-card-label-input"
                  value={label}
                  onChange={(e) => {
                    const next = [...(item.labels || [])];
                    next[i] = e.target.value;
                    onUpdate(item.id, { labels: next });
                  }}
                  placeholder="Label"
                />
                <button
                  type="button"
                  className="pg-card-label-remove"
                  aria-label="Remove label"
                  onClick={() => onUpdate(item.id, { labels: (item.labels || []).filter((_, idx) => idx !== i) })}
                >
                  ×
                </button>
              </span>
            ))}
            {(item.labels || []).length < 3 && (
              <button
                type="button"
                className="pg-card-label-add"
                onClick={() => onUpdate(item.id, { labels: [...(item.labels || []), 'New label'] })}
              >
                + Add label
              </button>
            )}
          </div>
        ) : (
          (item.labels || []).filter(Boolean).length > 0 && (
            <div className="pg-card-labels">
              {(item.labels || []).filter(Boolean).slice(0, 3).map((label, i) => (
                <span key={i} className="pg-card-label">{label}</span>
              ))}
            </div>
          )
        )}

        <Editable
          value={item.context}
          onChange={(v) => onUpdate(item.id, { context: v })}
          tag="p"
          className="pg-card-context"
          multiline
          placeholder="One line on the situation…"
        />

        {(item.learned || editMode) && (
          <p className="pg-card-learned">
            <span className="pg-card-learned-label">Proved</span>
            <Editable
              value={item.learned}
              onChange={(v) => onUpdate(item.id, { learned: v })}
              className="pg-card-learned-text"
              multiline
              placeholder="The one thing this taught me…"
            />
          </p>
        )}

        {editMode ? (
          <div className="pg-link-edit">
            <input
              type="text"
              className="pg-link-input"
              value={item.url || ''}
              onChange={(e) => onUpdate(item.id, { url: e.target.value })}
              placeholder="Link (optional) — dribbble.com/… or live URL"
            />
            <input
              type="text"
              className="pg-link-input pg-link-input--label"
              value={item.linkLabel || ''}
              onChange={(e) => onUpdate(item.id, { linkLabel: e.target.value })}
              placeholder="Link label (e.g. View live)"
            />
          </div>
        ) : (
          url && (
            <span className="pg-card-cta">
              {item.linkLabel?.trim() || 'View'}
              <span className="pg-card-cta-arrow" aria-hidden="true">↗</span>
            </span>
          )
        )}
      </div>

      {/* Edit controls */}
      {editMode && (
        <div className="pg-card-controls">
          <button type="button" className="pg-ctrl" onClick={() => onMoveLeft(item.id)} disabled={isFirst} title="Move earlier">←</button>
          <button type="button" className="pg-ctrl" onClick={() => onMoveRight(item.id)} disabled={isLast} title="Move later">→</button>
          <button type="button" className="pg-ctrl pg-ctrl--danger" onClick={() => onRemove(item.id)} title="Remove">✕</button>
        </div>
      )}
    </motion.article>
  );
};

const Playground = () => {
  const { content, editMode, updateContent } = useEdit();
  const playground = content.playground || {};
  const items = useMemo(() => playground.items || [], [playground.items]);

  const setItems = (next) => updateContent('playground', 'items', next);
  const updateItem = (id, patch) => setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => setItems(items.filter((it) => it.id !== id));
  const addItem = () =>
    setItems([
      ...items,
      {
        id: `pg-${Date.now()}`,
        title: 'New experiment',
        context: '',
        learned: '',
        role: 'Solo',
        year: String(new Date().getFullYear()),
        labels: [],
        image: '',
        url: '',
        linkLabel: '',
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
          <div className="playground-grid">
            {items.map((item, index) => (
              <PlaygroundCard
                key={item.id}
                item={item}
                index={index}
                editMode={editMode}
                onUpdate={updateItem}
                onRemove={removeItem}
                onMoveLeft={(id) => moveItem(id, -1)}
                onMoveRight={(id) => moveItem(id, 1)}
                isFirst={index === 0}
                isLast={index === items.length - 1}
              />
            ))}

            {editMode && (
              <button type="button" className="playground-add" onClick={addItem}>
                <span className="playground-add-plus">+</span>
                <span>Add experiment</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playground;
