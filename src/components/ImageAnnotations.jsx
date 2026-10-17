import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  SWATCH_COLORS, DEFAULT_TEXT, DEFAULT_TEXT_W, TONE_STYLES, BOX_BORDERS, BOX_FILLS, NOTE_BGS, BOX_LABEL_STYLES, boxFillPaint, resolveColor, normalizeAnnotations, newAnnotationId,
  arrowGeometry, curvedArrowGeometry, arrowMid, straightenArrow, pointsToPath, annotationBounds,
  moveAnnotation, resizeAnnotation, draftPreview, finalizeDraft, finalizeCallout, nextMarkerNumber, clamp01,
  annotationNotes,
} from '../data/annotations';
import { CARD_ICONS } from './CardIcons';
import { widont } from '../utils/typography';
import './ImageAnnotations.css';

// ─────────────────────────────────────────────────────────────────────────
// ImageAnnotations — arrows, boxes, pen strokes and text templates drawn on
// top of an article figure's image/video.
//
//   AnnotationLayer  → read-only overlay (public view, ≥1024px only)
//   AnnotationEditor → the same overlay plus a toolbar and pointer handling
//                      (edit mode, one media entry at a time)
//
// Geometry is stored as 0–1 fractions of the media box (src/data/annotations.js);
// both components measure the box and draw in real pixels so arrowheads and
// strokes never distort.
// ─────────────────────────────────────────────────────────────────────────

// Tracks an element's rendered size so SVG can be drawn in real pixels.
const useBoxSize = (ref) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
};

// Strokes and arrowheads scale with the media width so proportions hold.
const strokeFor = (w) => Math.max(1.5, w * 0.0028);
// Arrows run a little finer than boxes and pen strokes.
const arrowStrokeFor = (w) => Math.max(1.25, w * 0.0019);

// --annot-u = 1% of the media width; text/marker sizes are multiples of it.
const unitStyle = (w) => ({ '--annot-u': `${w / 100}px` });

const BOX_BORDER_GRAY = 'var(--color-text-muted)';

const SvgShape = ({ a, W, H, sw, selected, onDown, palette }) => {
  const color = resolveColor(a.color, palette);
  const hitWidth = Math.max(12, sw * 5);
  const asw = arrowStrokeFor(W);
  let visual;
  let hit;
  if (a.kind === 'arrow' && a.cx !== undefined) {
    const g = curvedArrowGeometry(a, W, H, Math.max(8, asw * 5.5));
    visual = (
      <>
        <path d={g.d} fill="none" stroke={color} strokeWidth={asw} strokeLinecap="round" />
        <polygon points={g.head.map((p) => p.join(',')).join(' ')} fill={color} />
      </>
    );
    hit = <path className="cs-annot-hit" d={`M${a.x1 * W} ${a.y1 * H} Q${a.cx * W} ${a.cy * H} ${a.x2 * W} ${a.y2 * H}`} strokeWidth={hitWidth} />;
  } else if (a.kind === 'arrow') {
    const g = arrowGeometry(a, W, H, Math.max(8, asw * 5.5));
    visual = (
      <>
        <line x1={g.shaft.x1} y1={g.shaft.y1} x2={g.shaft.x2} y2={g.shaft.y2} stroke={color} strokeWidth={asw} strokeLinecap="round" />
        <polygon points={g.head.map((p) => p.join(',')).join(' ')} fill={color} />
      </>
    );
    hit = <line className="cs-annot-hit" x1={a.x1 * W} y1={a.y1 * H} x2={a.x2 * W} y2={a.y2 * H} strokeWidth={hitWidth} />;
  } else if (a.kind === 'box') {
    const border = a.border || 'color';
    const paint = boxFillPaint(a);
    visual = (
      <rect
        x={a.x * W} y={a.y * H} width={a.w * W} height={a.h * H} rx={sw * 2}
        fill={paint.fill}
        fillOpacity={paint.opacity}
        stroke={border === 'none' ? 'none' : border === 'gray' ? BOX_BORDER_GRAY : color}
        strokeWidth={sw}
      />
    );
    // The whole area is grabbable, so a box with no border or fill can still be selected.
    hit = <rect className="cs-annot-hit cs-annot-hit--area" x={a.x * W} y={a.y * H} width={a.w * W} height={a.h * H} strokeWidth={hitWidth} />;
  } else if (a.kind === 'pen') {
    const d = pointsToPath(a.points, W, H);
    visual = <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
    hit = <path className="cs-annot-hit" d={d} strokeWidth={hitWidth} />;
  } else {
    return null; // text + marker render as HTML (TextItem)
  }
  const b = selected ? annotationBounds(a) : null;
  const pad = sw * 3;
  return (
    <g className="cs-annot-shape" data-annot-id={a.id} onPointerDown={onDown ? (e) => onDown(e, a) : undefined}>
      {visual}
      {onDown && hit}
      {b && <rect className="cs-annot-selection" x={b.x * W - pad} y={b.y * H - pad} width={b.w * W + pad * 2} height={b.h * H + pad * 2} />}
    </g>
  );
};

const DeleteChip = ({ onDelete, style }) => (
  <button
    type="button"
    className="cs-annot-del"
    title="Delete (or press Delete)"
    aria-label="Delete annotation"
    style={style}
    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
  >
    ✕
  </button>
);

const TextItem = ({ a, selected, editing, onDown, onHandleDown, onCommit, onDelete, palette }) => {
  const ref = useRef(null);
  // Entering edit: focus the contentEditable and select its text so typing replaces it.
  useEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [editing]);
  const isMarker = a.kind === 'marker';
  const isTone = !isMarker && TONE_STYLES.includes(a.style);
  const singleLine = isMarker || isTone || a.style === 'pill';
  const style = {
    left: `${a.x * 100}%`,
    top: `${a.y * 100}%`,
    '--annot-color': resolveColor(a.color, palette),
    ...(isMarker ? {} : { [singleLine ? 'maxWidth' : 'width']: `${a.w * 100}%` }),
  };
  const cls = isMarker ? 'cs-annot-marker' : `cs-annot-text cs-annot-text--${a.style}`;
  let content = a.text;
  if (editing) {
    content = (
      <div
        ref={ref}
        className="cs-annot-editable"
        contentEditable
        suppressContentEditableWarning
        onPointerDown={(e) => e.stopPropagation()}
        onBlur={(e) => onCommit(a, e.currentTarget.innerText)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape' || (e.key === 'Enter' && !(e.shiftKey && !singleLine))) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      >
        {a.text}
      </div>
    );
  } else if (!isMarker && a.style === 'card') {
    const [title, ...rest] = (a.text || '').split('\n');
    content = (
      <>
        <strong className="cs-annot-card-title">{title}</strong>
        {rest.length > 0 && <span className="cs-annot-card-body">{rest.join('\n')}</span>}
      </>
    );
  }
  return (
    <div
      className={`${cls}${selected ? ' is-selected' : ''}${editing ? ' is-editing' : ''}`}
      style={style}
      data-annot-id={a.id}
      data-color={a.color}
      data-bg={a.bg || undefined}
      data-shadow={a.shadow === true ? 'on' : undefined}
      data-border={a.border === false ? 'off' : undefined}
      onPointerDown={onDown && !editing ? (e) => onDown(e, a) : undefined}
    >
      {isTone && a.icon !== false && <span className="cs-annot-tone-icon">{CARD_ICONS[a.style === 'positive' ? 'check' : 'x']}</span>}
      {content}
      {selected && !editing && !isMarker && onHandleDown && (
        <span className="cs-annot-handle cs-annot-handle--width" onPointerDown={(e) => onHandleDown(e, a, 'width')} />
      )}
      {selected && !editing && onDelete && <DeleteChip onDelete={onDelete} />}
    </div>
  );
};

// Text on a highlight box — a chip in the box's color, inside its top-left corner.
const BoxLabel = ({ a, editing, onDown, onCommit, palette }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [editing]);
  return (
    <div
      className={`cs-annot-boxlabel cs-annot-boxlabel--${a.labelStyle || 'filled'}${editing ? ' is-editing' : ''}`}
      data-annot-id={a.id}
      data-color={a.color}
      style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%`, maxWidth: `${a.w * 100}%`, '--annot-color': resolveColor(a.color, palette) }}
      onPointerDown={onDown && !editing ? (e) => onDown(e, a) : undefined}
    >
      {editing ? (
        <div
          ref={ref}
          className="cs-annot-editable"
          contentEditable
          suppressContentEditableWarning
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={(e) => onCommit(a, e.currentTarget.innerText)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {a.label || ''}
        </div>
      ) : a.label}
    </div>
  );
};

// Everything drawn for a list of annotations: one SVG for shapes, then HTML
// text items on top. Interaction props are only passed by the editor.
const Shapes = ({ items, size, selectedId = null, editingId = null, onItemDown, onHandleDown, onTextCommit, onDelete, palette }) => {
  const { w: W, h: H } = size;
  const sw = strokeFor(W);
  return (
    <>
      <svg className="cs-annot-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {items.map((a) => (
          <SvgShape key={a.id} a={a} W={W} H={H} sw={sw} selected={a.id === selectedId} onDown={onItemDown} palette={palette} />
        ))}
      </svg>
      {items.filter((a) => a.kind === 'box' && (a.label || a.id === editingId)).map((a) => (
        <BoxLabel key={`${a.id}-label`} a={a} editing={a.id === editingId} onDown={onItemDown} onCommit={onTextCommit} palette={palette} />
      ))}
      {items.filter((a) => a.kind === 'text' || a.kind === 'marker').map((a) => (
        <TextItem
          key={a.id}
          a={a}
          selected={a.id === selectedId}
          editing={a.id === editingId}
          onDown={onItemDown}
          onHandleDown={onHandleDown}
          onCommit={onTextCommit}
          onDelete={onDelete}
          palette={palette}
        />
      ))}
    </>
  );
};

// Small screens hide the overlay, so the text written on the image is listed
// under it instead — nothing said on an image is lost on a phone.
export const AnnotationNotes = ({ annotations, palette }) => {
  const notes = useMemo(() => annotationNotes(annotations, palette), [annotations, palette]);
  if (!notes.length) return null;
  return (
    <ul className="cs-annot-notes" data-palette={palette === 'brand' ? 'brand' : undefined}>
      {notes.map((n) => (
        <li key={n.id} className={n.tone ? `cs-annot-note--${n.tone}` : ''} style={{ '--annot-color': resolveColor(n.color) }}>
          {widont(n.text)}
        </li>
      ))}
    </ul>
  );
};

export const AnnotationLayer = ({ annotations, palette }) => {
  const ref = useRef(null);
  const size = useBoxSize(ref);
  const items = useMemo(() => normalizeAnnotations(annotations), [annotations]);
  return (
    <div ref={ref} className="cs-annot-layer" data-palette={palette === 'brand' ? 'brand' : undefined} style={unitStyle(size.w)}>
      {size.w > 0 && <Shapes items={items} size={size} palette={palette} />}
    </div>
  );
};

const ToolSvg = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// Toolbar, grouped so every option is visible at a glance: [key, label, hint, icon].
const TOOL_GROUPS = [
  ['', [
    ['select', 'Select', 'Select, drag to move, handles resize/bend — arrow keys nudge, Alt+drag duplicates, Delete removes',
      <ToolSvg key="i"><path d="M4 3l7 17 2.5-7.5L21 10z" /></ToolSvg>],
  ]],
  ['Draw', [
    ['arrow', 'Arrow', 'Drag to draw a straight arrow', <ToolSvg key="i"><path d="M5 19 19 5" /><path d="M9 5h10v10" /></ToolSvg>],
    ['curve', 'Curve', 'Drag to draw a curved arrow — drag its middle handle to change the bend',
      <ToolSvg key="i"><path d="M4 19c2-8 8-12 15-12" /><path d="m15 3 4 4-4 4" /></ToolSvg>],
    ['box', 'Box', 'Drag to draw a highlight box', <ToolSvg key="i"><rect x="4" y="6" width="16" height="12" rx="2" /></ToolSvg>],
    ['pen', 'Pen', 'Draw freehand', <ToolSvg key="i"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></ToolSvg>],
  ]],
  ['Text', [
    ['pill', 'Label', 'Click to place a label pill', <ToolSvg key="i"><rect x="3" y="8" width="18" height="8" rx="4" /></ToolSvg>],
    ['card', 'Card', 'Click to place a callout card', <ToolSvg key="i"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10M7 14h6" /></ToolSvg>],
    ['marker', 'Marker', 'Click to place a numbered marker', <ToolSvg key="i"><circle cx="12" cy="12" r="9" /><path d="M11 9l1.5-1v8" /></ToolSvg>],
    ['plain', 'Text', 'Click to place plain text', <ToolSvg key="i"><path d="M5 6V4h14v2" /><path d="M12 4v16" /><path d="M9 20h6" /></ToolSvg>],
    ['note', 'Note', 'Click to place a callout note — white box, text in the chosen color',
      <ToolSvg key="i"><rect x="3" y="5" width="16" height="12" rx="1" /><path d="M21 9v10H7" /></ToolSvg>],
  ]],
  ['Callout', [
    ['positive', 'Positive', 'Press on the target, drag to where the note goes — green ✓ label + arrow (click = label only)', CARD_ICONS.check],
    ['negative', 'Negative', 'Press on the target, drag to where the note goes — red ✕ label + arrow (click = label only)', CARD_ICONS.x],
  ]],
];
const TEXT_TOOLS = ['pill', 'card', 'plain', 'note', 'marker'];
const BOX_BORDER_LABELS = { color: 'Color', gray: 'Gray', none: 'No border' };
const TONES = [
  ['success', 'Positive', 'Positive meaning — green, or accent on a brand image (flips a ✕ label to ✓)'],
  ['error', 'Negative', 'Negative meaning — red, or ink on a brand image (flips a ✓ label to ✕)'],
];
const SWATCH_LABELS = { accent: 'Accent', ink: 'Ink', green: 'Green', red: 'Red', info: 'Blue', warning: 'Yellow', white: 'White' };
const NOTE_BG_LABELS = { white: 'White', tint: 'Tint', none: 'None' };
const BOX_LABEL_STYLE_LABELS = { filled: 'Filled', note: 'Note', plain: 'Text only' };
const BOX_FILL_LABELS = {
  none: 'None', white: 'White', gray: 'Gray', accent: 'Accent', ink: 'Ink', success: 'Green',
  error: 'Red', info: 'Blue', warning: 'Yellow', tint: 'Tint',
};
const NUDGE = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
// Pointer capture retargets native dblclick to the surface, so double-click
// is detected from two presses on the same item within this window.
const DOUBLE_PRESS_MS = 350;

// Resize handles for the selected SVG shape (text boxes carry their own).
const ShapeHandles = ({ a, onHandleDown, onDelete }) => {
  const b = annotationBounds(a);
  const chip = (
    <DeleteChip key="del" onDelete={onDelete} style={{ left: `${(b.x + b.w) * 100}%`, top: `${b.y * 100}%` }} />
  );
  const at = (x, y, handle) => (
    <span
      key={handle}
      className="cs-annot-handle"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      onPointerDown={(e) => onHandleDown(e, a, handle)}
    />
  );
  if (a.kind === 'arrow') {
    const [mx, my] = arrowMid(a);
    return (
      <>
        {at(a.x1, a.y1, 'start')}
        {at(a.x2, a.y2, 'end')}
        <span
          key="bend"
          className="cs-annot-handle cs-annot-handle--bend"
          title="Drag to bend — double-click to straighten"
          style={{ left: `${mx * 100}%`, top: `${my * 100}%` }}
          onPointerDown={(e) => onHandleDown(e, a, 'bend')}
        />
        {chip}
      </>
    );
  }
  if (a.kind === 'box') return <>{at(a.x + a.w, a.y + a.h, 'corner')}{chip}</>;
  if (a.kind === 'pen') return chip;
  return null; // text + marker render their own chip
};

export const AnnotationEditor = ({ annotations, onChange, onDone, palette }) => {
  const surfaceRef = useRef(null);
  const size = useBoxSize(surfaceRef);
  const [items, setItems] = useState(() => normalizeAnnotations(annotations));
  const itemsRef = useRef(items);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('accent');
  // Look for the next box drawn — follows whatever was last picked.
  const [boxStyle, setBoxStyle] = useState({ border: 'color', fill: 'none' });
  // Look for the next note placed — follows whatever was last picked.
  const [noteStyle, setNoteStyle] = useState({ bg: 'white', shadow: false, border: true });
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const dragRef = useRef(null);
  // Last press on an item/handle — two on the same item, same spot, within
  // DOUBLE_PRESS_MS = a double-click. Any toolbar click resets it.
  const lastPressRef = useRef({ id: null, t: 0, x: 0, y: 0 });
  const isDoublePress = (id, e) => {
    const now = Date.now();
    const last = lastPressRef.current;
    lastPressRef.current = { id, t: now, x: e.clientX, y: e.clientY };
    return last.id === id && now - last.t < DOUBLE_PRESS_MS && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 6;
  };
  // Latest callbacks without re-binding listeners (FigureBlock passes inline arrows).
  const onChangeRef = useRef(onChange);
  const onDoneRef = useRef(onDone);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    onDoneRef.current = onDone;
  });

  // preview → local only (mid-drag); commit → local + persisted via onChange.
  const preview = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);
  const commit = useCallback((next) => {
    preview(next);
    onChangeRef.current?.(next);
  }, [preview]);

  const toFrac = (e) => {
    const r = surfaceRef.current.getBoundingClientRect();
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
  };

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    commit(itemsRef.current.filter((a) => a.id !== selectedId));
    setSelectedId(null);
    setEditingId(null);
  }, [selectedId, commit]);

  const patchSelected = (patch) => {
    if (!selectedId) return;
    commit(itemsRef.current.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (editingId) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeSelected();
      } else if (NUDGE[e.key] && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 0.02 : 0.005;
        const [dx, dy] = NUDGE[e.key];
        commit(itemsRef.current.map((a) => (a.id === selectedId ? moveAnnotation(a, dx * step, dy * step) : a)));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (dragRef.current) {
          dragRef.current = null;
          draftRef.current = null;
          setDraft(null);
        } else if (selectedId) {
          setSelectedId(null);
        } else {
          onDoneRef.current?.();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingId, selectedId, removeSelected, commit]);

  const beginDrag = (e, drag) => {
    e.preventDefault();
    e.stopPropagation();
    surfaceRef.current.setPointerCapture(e.pointerId);
    dragRef.current = drag;
  };

  const placeText = (p) => {
    const raw = tool === 'marker'
      ? { id: newAnnotationId(), kind: 'marker', x: p.x, y: p.y, text: nextMarkerNumber(itemsRef.current), color }
      : {
        id: newAnnotationId(), kind: 'text', style: tool, color, y: p.y,
        x: Math.min(p.x, 1 - DEFAULT_TEXT_W[tool]), w: DEFAULT_TEXT_W[tool], text: DEFAULT_TEXT[tool],
        ...(tool === 'note' ? { bg: noteStyle.bg, shadow: noteStyle.shadow, border: noteStyle.border } : {}),
      };
    const [a] = normalizeAnnotations([raw]);
    commit([...itemsRef.current, a]);
    setSelectedId(a.id);
    setTool('select');
    if (a.kind === 'text') setEditingId(a.id);
  };

  const onSurfaceDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); // no focus change — placing text focuses its own editor
    const p = toFrac(e);
    if (tool === 'select') {
      setSelectedId(null);
      return;
    }
    if (TEXT_TOOLS.includes(tool)) {
      placeText(p);
      return;
    }
    const at0 = { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    let d;
    if (TONE_STYLES.includes(tool)) d = { kind: 'callout', tone: tool, ...at0 };
    else if (tool === 'arrow' || tool === 'curve') d = { kind: 'arrow', curved: tool === 'curve', ...at0, color };
    else if (tool === 'box') d = { kind: 'box', x0: p.x, y0: p.y, x1: p.x, y1: p.y, color, ...boxStyle };
    else d = { kind: 'pen', points: [[p.x, p.y]], color };
    draftRef.current = d;
    setDraft(d);
    setSelectedId(null);
    beginDrag(e, { mode: 'draw' });
  };

  const onItemDown = (e, a) => {
    if (tool !== 'select' || e.button !== 0) return;
    if ((a.kind === 'text' || a.kind === 'marker' || a.kind === 'box') && isDoublePress(a.id, e)) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(a.id);
      setEditingId(a.id);
      return;
    }
    let target = a;
    if (e.altKey) {
      target = { ...a, id: newAnnotationId() };
      commit([...itemsRef.current, target]);
    }
    setSelectedId(target.id);
    beginDrag(e, { mode: 'move', id: target.id, orig: target, start: toFrac(e), moved: false });
  };

  const onHandleDown = (e, a, handle) => {
    if (e.button !== 0) return;
    if (handle === 'bend' && isDoublePress(`${a.id}:${handle}`, e)) {
      e.preventDefault();
      e.stopPropagation();
      commit(itemsRef.current.map((x) => (x.id === a.id ? straightenArrow(x) : x)));
      return;
    }
    beginDrag(e, { mode: 'resize', id: a.id, handle, moved: false });
  };

  const onSurfaceMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toFrac(e);
    if (drag.mode === 'draw') {
      const d = draftRef.current;
      const next = d.kind === 'arrow' || d.kind === 'callout' ? { ...d, x2: p.x, y2: p.y }
        : d.kind === 'box' ? { ...d, x1: p.x, y1: p.y }
          : { ...d, points: [...d.points, [p.x, p.y]] };
      draftRef.current = next;
      setDraft(next);
      return;
    }
    drag.moved = true;
    preview(itemsRef.current.map((a) => {
      if (a.id !== drag.id) return a;
      return drag.mode === 'move'
        ? moveAnnotation(drag.orig, p.x - drag.start.x, p.y - drag.start.y)
        : resizeAnnotation(a, drag.handle, p.x, p.y);
    }));
  };

  const onSurfaceUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.mode === 'draw') {
      const d = draftRef.current;
      draftRef.current = null;
      setDraft(null);
      // Callouts add an arrow + label; everything else adds one shape (or nothing if tiny).
      const added = d.kind === 'callout' ? finalizeCallout(d) : [finalizeDraft(d)].filter(Boolean);
      if (!added.length) return;
      commit([...itemsRef.current, ...added]);
      // Back to Select with the new item picked, so it can be dragged right away.
      const focus = added.find((a) => a.kind === 'text') || added[0];
      setSelectedId(focus.id);
      setTool('select');
      if (focus.kind === 'text') setEditingId(focus.id);
    } else if (drag.moved) {
      onChangeRef.current?.(itemsRef.current);
    }
  };

  const onTextCommit = (a, raw) => {
    setEditingId(null);
    const text = (raw || '').replace(/\n+$/, '').trim();
    if (a.kind === 'box') {
      commit(itemsRef.current.map((x) => {
        if (x.id !== a.id) return x;
        const { label, ...rest } = x; // eslint-disable-line no-unused-vars
        return text ? { ...rest, label: text } : rest;
      }));
      return;
    }
    commit(text
      ? itemsRef.current.map((x) => (x.id === a.id ? { ...x, text } : x))
      : itemsRef.current.filter((x) => x.id !== a.id));
    if (!text) setSelectedId(null);
  };

  const pickColor = (c) => {
    setColor(c);
    if (selectedId) commit(itemsRef.current.map((a) => (a.id === selectedId ? { ...a, color: c } : a)));
  };

  // Positive / negative meaning — follows the image's palette (green/red or
  // brand). On a ✓/✕ label it also flips the label's icon and style.
  const pickTone = (c) => {
    setColor(c);
    if (!selectedId) return;
    commit(itemsRef.current.map((a) => {
      if (a.id !== selectedId) return a;
      const flip = a.kind === 'text' && TONE_STYLES.includes(a.style) ? { style: c === 'success' ? 'positive' : 'negative' } : {};
      return { ...a, color: c, ...flip };
    }));
  };

  const selected = items.find((a) => a.id === selectedId) || null;
  const selectedTone = selected && selected.kind === 'text' && TONE_STYLES.includes(selected.style);
  // Box options show while the Box tool is armed (they set the next box) or a box is selected.
  const showBoxOptions = tool === 'box' || (selected && selected.kind === 'box');
  const boxLook = selected && selected.kind === 'box'
    ? { border: selected.border || 'color', fill: selected.fill || 'none' }
    : boxStyle;
  const setBoxLook = (patch) => {
    setBoxStyle((prev) => ({ ...prev, ...patch }));
    if (selected && selected.kind === 'box') patchSelected(patch);
  };
  const selectedNote = selected && selected.kind === 'text' && selected.style === 'note';
  // Note options show while the Note tool is armed (they set the next note) or a note is selected.
  const showNoteOptions = tool === 'note' || selectedNote;
  const noteLook = selectedNote
    ? { bg: selected.bg || 'white', shadow: selected.shadow === true, border: selected.border !== false }
    : noteStyle;
  const setNoteLook = (patch) => {
    setNoteStyle((prev) => ({ ...prev, ...patch }));
    if (selectedNote) patchSelected(patch);
  };
  const shown = draft ? [...items, ...draftPreview(draft)] : items;

  return (
    <>
      <div
        className="cs-annot-toolbar"
        onPointerDown={(e) => { e.stopPropagation(); lastPressRef.current = { id: null, t: 0, x: 0, y: 0 }; }}
      >
        {TOOL_GROUPS.map(([group, tools]) => (
          <span key={group || 'select'} className="cs-annot-group">
            {group && <span className="cs-annot-group-label">{group}</span>}
            {tools.map(([key, label, title, icon]) => (
              <button
                key={key}
                type="button"
                title={title}
                className={`cs-annot-tool cs-annot-tool--${key}${tool === key ? ' is-active' : ''}`}
                onClick={() => {
                  setTool(key);
                  // Arming a tool drops the selection, so its options row sets up the NEXT item.
                  if (key !== 'select') { setSelectedId(null); setEditingId(null); }
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </span>
        ))}
        <span className="cs-annot-group-label">Meaning</span>
        <span className="cs-annot-tones" role="group" aria-label="Meaning">
          {TONES.map(([c, label, hint]) => (
            <button
              key={c}
              type="button"
              title={hint}
              className={`cs-annot-tool cs-annot-tone${(selected ? selected.color : color) === c ? ' is-active' : ''}`}
              style={{ '--tone': resolveColor(c, palette) }}
              onClick={() => pickTone(c)}
            >
              {CARD_ICONS[c === 'success' ? 'check' : 'x']}
              <span>{label}</span>
            </button>
          ))}
        </span>
        <span className="cs-annot-swatches">
          {SWATCH_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`${SWATCH_LABELS[c]} (fixed color)`}
              aria-label={`${c} color`}
              className={`cs-annot-swatch${(selected ? selected.color : color) === c ? ' is-active' : ''}`}
              style={{ background: resolveColor(c, palette) }}
              onClick={() => pickColor(c)}
            />
          ))}
        </span>
        <button type="button" className="cs-article-mini-btn" disabled={!selectedId} onClick={removeSelected}>Delete</button>
        <button type="button" className="cs-article-mini-btn is-active" onClick={() => onDoneRef.current?.()}>Done</button>
        {showBoxOptions && (
          <span className="cs-annot-context">
            <span className="cs-annot-group-label">Border</span>
            {BOX_BORDERS.map((b) => (
              <button key={b} type="button" className={`cs-annot-tool${boxLook.border === b ? ' is-active' : ''}`}
                onClick={() => setBoxLook({ border: b })}>
                {BOX_BORDER_LABELS[b]}
              </button>
            ))}
            <span className="cs-annot-group-label">Background</span>
            <span className="cs-annot-fills" role="group" aria-label="Box background">
              {BOX_FILLS.filter((f) => f !== 'tint').map((f) => {
                const paint = boxFillPaint({ fill: f, color });
                return (
                  <button key={f} type="button" title={BOX_FILL_LABELS[f]} aria-label={`${BOX_FILL_LABELS[f]} background`}
                    className={`cs-annot-fill cs-annot-fill--${f}${boxLook.fill === f ? ' is-active' : ''}`}
                    onClick={() => setBoxLook({ fill: f })}>
                    {f !== 'none' && <span style={{ background: paint.fill, opacity: f === 'white' ? 1 : 0.45 }} />}
                  </button>
                );
              })}
            </span>
            {selected && selected.kind === 'box' && (
              <>
                <span className="cs-annot-group-label">Text</span>
                <button type="button" className="cs-annot-tool" onClick={() => setEditingId(selected.id)}>
                  {selected.label ? 'Edit text' : '+ Add text'}
                </button>
                {selected.label && (
                  <button type="button" className="cs-annot-tool" onClick={() => onTextCommit(selected, '')}>Remove text</button>
                )}
                <span className="cs-annot-group-label">Text style</span>
                {BOX_LABEL_STYLES.map((ls) => (
                  <button key={ls} type="button" className={`cs-annot-tool${(selected.labelStyle || 'filled') === ls ? ' is-active' : ''}`}
                    onClick={() => patchSelected({ labelStyle: ls })}>
                    {BOX_LABEL_STYLE_LABELS[ls]}
                  </button>
                ))}
              </>
            )}
          </span>
        )}
        {showNoteOptions && (
          <span className="cs-annot-context">
            <span className="cs-annot-group-label">Note background</span>
            {NOTE_BGS.map((b) => (
              <button key={b} type="button" className={`cs-annot-tool${noteLook.bg === b ? ' is-active' : ''}`}
                onClick={() => setNoteLook({ bg: b })}>
                {NOTE_BG_LABELS[b]}
              </button>
            ))}
            <span className="cs-annot-group-label">Shadow</span>
            <button type="button" className={`cs-annot-tool${noteLook.shadow ? ' is-active' : ''}`} onClick={() => setNoteLook({ shadow: true })}>On</button>
            <button type="button" className={`cs-annot-tool${!noteLook.shadow ? ' is-active' : ''}`} onClick={() => setNoteLook({ shadow: false })}>Off</button>
            <span className="cs-annot-group-label">Border</span>
            <button type="button" className={`cs-annot-tool${noteLook.border ? ' is-active' : ''}`} onClick={() => setNoteLook({ border: true })}>On</button>
            <button type="button" className={`cs-annot-tool${!noteLook.border ? ' is-active' : ''}`} onClick={() => setNoteLook({ border: false })}>Off</button>
          </span>
        )}
        {selectedTone && (
          <span className="cs-annot-context">
            <span className="cs-annot-group-label">Icon</span>
            <button type="button" className={`cs-annot-tool${selected.icon !== false ? ' is-active' : ''}`}
              onClick={() => patchSelected({ icon: undefined })}>
              {CARD_ICONS[selected.style === 'positive' ? 'check' : 'x']}<span>Show</span>
            </button>
            <button type="button" className={`cs-annot-tool${selected.icon === false ? ' is-active' : ''}`}
              onClick={() => patchSelected({ icon: false })}>
              <span>Hide</span>
            </button>
          </span>
        )}
      </div>
      <div
        ref={surfaceRef}
        className={`cs-annot-editor is-tool-${tool}`}
        data-palette={palette === 'brand' ? 'brand' : undefined}
        style={unitStyle(size.w)}
        onPointerDown={onSurfaceDown}
        onPointerMove={onSurfaceMove}
        onPointerUp={onSurfaceUp}
        onPointerCancel={onSurfaceUp}
      >
        {size.w > 0 && (
          <Shapes
            items={shown}
            size={size}
            selectedId={selectedId}
            editingId={editingId}
            onItemDown={onItemDown}
            onHandleDown={onHandleDown}
            onTextCommit={onTextCommit}
            onDelete={tool === 'select' ? removeSelected : undefined}
            palette={palette}
          />
        )}
        {selected && tool === 'select' && <ShapeHandles a={selected} onHandleDown={onHandleDown} onDelete={removeSelected} />}
      </div>
    </>
  );
};
