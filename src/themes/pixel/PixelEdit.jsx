import { useRef, useState } from 'react';
import { useEdit } from '../../context/EditContext';
import './PixelEdit.css';

/* Inline editing primitives for the pixel-theme pages (Index, About).
 *
 * The pixel pages render from EditContext `content` — the same store the
 * EditPanel (Cmd+E) writes to — so panel edits and in-place edits are the same
 * data. These are the in-place half.
 *
 * Deliberately minimal: contentEditable + commit on blur, no rich text, no
 * toolbar. The slide deck (EditableField) and the article editor have their own,
 * heavier editors; this one only has to not disturb the pixel typography, so it
 * renders the SAME element in both modes and adds a hairline underline in edit
 * mode instead of swapping in an <input>.
 */

export const PixelEditable = ({
  value,
  onChange,
  tag = 'span',
  className = '',
  multiline = false,
  placeholder = 'Edit…',
}) => {
  const { editMode } = useEdit();
  const ref = useRef(null);
  // Capitalised local so JSX resolves it as a component, not an <tag> element.
  const Tag = tag;

  if (!editMode) return <Tag className={className || undefined}>{value}</Tag>;

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    // Single-line fields flatten pasted newlines; multiline keeps them but
    // collapses runs so a stray Enter can't inflate the paragraph gap.
    const next = multiline
      ? el.innerText.replace(/\n{3,}/g, '\n\n').trim()
      : el.innerText.replace(/\s*\n\s*/g, ' ').trim();
    if (next !== value) onChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { e.currentTarget.blur(); return; }
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <Tag
      ref={ref}
      className={`${className} px-editable`.trim()}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      dir="auto"
      onBlur={commit}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
    >
      {value}
    </Tag>
  );
};

/* Edit-mode-only affordances. They render nothing in view mode, so callers can
   drop them inline without guarding every call site with `editMode && …`. */
export const PixelAddBtn = ({ onClick, children }) => {
  const { editMode } = useEdit();
  if (!editMode) return null;
  return (
    <button type="button" className="px-add" onClick={onClick}>{children}</button>
  );
};

export const PixelRemoveBtn = ({ onClick, title = 'Remove' }) => {
  const { editMode } = useEdit();
  if (!editMode) return null;
  return (
    <button type="button" className="px-remove" onClick={onClick} title={title} aria-label={title}>
      ×
    </button>
  );
};

/* Save-to-code / push bar. `save` is the page's own writer (home-content.json
   or about-content.json) — the bar only owns the status machine. Mirrors the
   legacy .home-publish-bar behaviour, restyled to pixel. */
export const PixelPublishBar = ({ save }) => {
  const { editMode, gitPush } = useEdit();
  const [status, setStatus] = useState('');

  if (!editMode) return null;

  const busy = status === 'saving' || status === 'pushing';

  const run = async (mode) => {
    setStatus(mode === 'push' ? 'pushing' : 'saving');
    try {
      await save();
      if (mode === 'push') await gitPush();
      setStatus(mode === 'push' ? 'pushed' : 'saved');
      setTimeout(() => setStatus(''), 2800);
    } catch (err) {
      console.error('[PixelPublishBar]', err);
      setStatus('error');
      setTimeout(() => setStatus(''), 3200);
    }
  };

  return (
    <div className="px-publish">
      <button type="button" className="px-publish-btn" disabled={busy} onClick={() => run('save')}>
        {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : 'Save to code'}
      </button>
      <button type="button" className="px-publish-btn is-primary" disabled={busy} onClick={() => run('push')}>
        {status === 'pushing' ? 'Pushing…' : status === 'pushed' ? '✓ Pushed' : 'Push to git'}
      </button>
      {status === 'error' ? <span className="px-publish-err">Failed — check console</span> : null}
    </div>
  );
};
