import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEdit } from '../context/EditContext';

// Editable field component — module-level for stable React identity across renders.
// This prevents unmount/remount cycles that destroy input state, cursor position,
// and focus. Shared by the slide deck editor (CaseStudy.jsx) and the article
// editor (CaseStudyArticle.jsx); reads editMode from EditContext so callers get
// view/edit switching for free.
//
// `allowBold` (article prose fields only) adds a selection affordance: mark any
// text and a floating "B" appears (or press ⌘B / Ctrl+B) to wrap it in **…**,
// which Prose/<Rich> renders bold in view mode.
const EditableField = memo(function EditableField({ value, onChange, multiline = false, allowLineBreaks = false, allowBold = false, className = '', placeholder = '' }) {
  const { editMode } = useEdit();
  const stringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
  const [localValue, setLocalValue] = useState(stringValue);
  const timeoutRef = useRef(null);
  const isEditingRef = useRef(false);
  const inputRef = useRef(null);
  const [boldBtn, setBoldBtn] = useState(null); // { top, left } while a selection is active, else null
  const isTextarea = multiline || allowLineBreaks;

  // Sync local value when prop changes from outside (but not while user is actively typing)
  useEffect(() => {
    if (!isEditingRef.current) {
      const newStringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
      setLocalValue(newStringValue);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    isEditingRef.current = true;
    setLocalValue(newValue);

    // Debounce the update to parent
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
      isEditingRef.current = false;
    }, 300);
  };

  const handleBlur = () => {
    // Clear editing flag and save immediately on blur
    isEditingRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localValue !== value) {
      onChange(localValue);
    }
    setBoldBtn(null);
  };

  // Show/hide the floating Bold button based on the current text selection.
  const updateBoldBtn = useCallback(() => {
    if (!allowBold) return;
    const el = inputRef.current;
    if (!el || el.selectionStart == null || el.selectionStart === el.selectionEnd) {
      setBoldBtn(null);
      return;
    }
    const r = el.getBoundingClientRect();
    // Anchor just above the field, clamped below the fixed edit bar.
    setBoldBtn({ top: Math.max(r.top - 38, 60), left: Math.min(r.left + 4, window.innerWidth - 44) });
  }, [allowBold]);

  // Wrap (or unwrap) the current selection with ** ** — the markdown <Rich>
  // renders as <strong>. Toggles: bolding an already-bold run removes it.
  const applyBold = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    if (start == null || start === end) return;
    const v = el.value;
    const sel = v.slice(start, end);
    const before = v.slice(0, start), after = v.slice(end);
    let next, ns, ne;
    if (sel.length >= 4 && sel.startsWith('**') && sel.endsWith('**')) {
      const inner = sel.slice(2, -2); next = before + inner + after; ns = start; ne = start + inner.length;      // unwrap (selection includes the **)
    } else if (before.endsWith('**') && after.startsWith('**')) {
      next = before.slice(0, -2) + sel + after.slice(2); ns = start - 2; ne = end - 2;                            // unwrap (** just outside the selection)
    } else {
      next = before + '**' + sel + '**' + after; ns = start + 2; ne = end + 2;                                   // wrap
    }
    isEditingRef.current = true;
    setLocalValue(next);
    onChange(next);
    requestAnimationFrame(() => {
      const e2 = inputRef.current;
      if (e2) { e2.focus(); try { e2.setSelectionRange(ns, ne); } catch { /* selection out of range — ignore */ } }
      isEditingRef.current = false;
      updateBoldBtn();
    });
  }, [onChange, updateBoldBtn]);

  // In single-line input: Shift+Enter inserts newline (stored; view uses pre-line). In textarea with allowLineBreaks: only Shift+Enter adds newline, Enter does nothing.
  const handleKeyDown = (e) => {
    if (allowBold && (e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      applyBold();
      return;
    }
    if (e.key !== 'Enter') return;
    if (allowLineBreaks && !e.shiftKey) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && !multiline && !allowLineBreaks) {
      e.preventDefault();
      const newValue = localValue + '\n';
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  if (!editMode) {
    // Render with line breaks preserved. `dir="auto"` lets the browser pick
    // direction from the first strong character, so Hebrew renders RTL while
    // English stays LTR (mixed decks keep working).
    if (isTextarea || (stringValue && stringValue.includes('\n'))) {
      return <span className={className} dir="auto" style={{ whiteSpace: 'pre-line' }}>{stringValue}</span>;
    }
    return stringValue ? <span dir="auto">{stringValue}</span> : stringValue;
  }

  const selProps = allowBold
    ? { ref: inputRef, onSelect: updateBoldBtn, onMouseUp: updateBoldBtn, onKeyUp: updateBoldBtn }
    : {};

  const field = isTextarea ? (
    <textarea
      {...selProps}
      className={`editable-field ${className}`}
      dir="auto"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
    />
  ) : (
    <input
      {...selProps}
      type="text"
      className={`editable-field ${className}`}
      dir="auto"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
    />
  );

  if (!allowBold) return field;

  return (
    <>
      {field}
      {boldBtn && createPortal(
        <button
          type="button"
          className="editable-bold-btn"
          style={{ top: boldBtn.top, left: boldBtn.left }}
          // mousedown (not click) + preventDefault keeps the textarea's focus and
          // selection so applyBold can read/replace it.
          onMouseDown={(e) => { e.preventDefault(); applyBold(); }}
          title="Bold (⌘B / Ctrl+B)"
          aria-label="Bold selected text"
        >
          <strong>B</strong>
        </button>,
        document.body
      )}
    </>
  );
});

export default EditableField;
