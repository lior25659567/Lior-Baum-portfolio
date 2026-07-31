import { memo, useState, useRef, useEffect } from 'react';
import { useEdit } from '../context/EditContext';

// Editable field component — module-level for stable React identity across renders.
// This prevents unmount/remount cycles that destroy input state, cursor position,
// and focus. Shared by the slide deck editor (CaseStudy.jsx) and the article
// editor (CaseStudyArticle.jsx); reads editMode from EditContext so callers get
// view/edit switching for free.
const EditableField = memo(function EditableField({ value, onChange, multiline = false, allowLineBreaks = false, className = '', placeholder = '' }) {
  const { editMode } = useEdit();
  const stringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
  const [localValue, setLocalValue] = useState(stringValue);
  const timeoutRef = useRef(null);
  const isEditingRef = useRef(false);
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
  };

  // In single-line input: Shift+Enter inserts newline (stored; view uses pre-line). In textarea with allowLineBreaks: only Shift+Enter adds newline, Enter does nothing.
  const handleKeyDown = (e) => {
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

  return isTextarea ? (
    <textarea
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
});

export default EditableField;
