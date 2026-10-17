// ─────────────────────────────────────────────────────────────────────────
// annotations.js — pure data helpers for image annotations on article
// figures: arrows, highlight boxes, pen strokes, text templates and
// numbered markers. Coordinates are 0–1 fractions of the rendered media
// box; src/components/ImageAnnotations.jsx converts them to pixels.
//
// No React here — unit-tested by annotations.test.mjs (node --test).
// ─────────────────────────────────────────────────────────────────────────

// `success` / `error` are SEMANTIC (positive / negative) — the image's palette
// can remap them to brand colors. `green` / `red` are FIXED and never remap.
export const COLOR_TOKENS = ['accent', 'ink', 'success', 'error', 'green', 'red', 'info', 'warning', 'white'];
// What the toolbar swatches offer (fixed colors); meaning is set with the
// Positive / Negative buttons instead.
export const SWATCH_COLORS = ['accent', 'ink', 'green', 'red', 'info', 'warning', 'white'];

const COLOR_VALUES = {
  accent: 'var(--color-accent)',
  ink: '#22211f', // fixed — stays dark on screenshots in dark theme
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  green: 'var(--color-success)',
  red: 'var(--color-error)',
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  white: '#ffffff',
};

// Per-image palette: 'semantic' (default) keeps green/red; 'brand' shows them
// in the brand chip colors — success → accent (like Accepted), error → ink
// (like the neutral Rejected chip). Stored colors never change.
export const PALETTES = ['semantic', 'brand'];
const BRAND_MAP = { success: 'accent', error: 'ink' };
export const paletteColor = (name, palette) => (palette === 'brand' ? BRAND_MAP[name] || name : name);

export const resolveColor = (name, palette) => {
  const token = paletteColor(name, palette);
  return COLOR_VALUES[token] || COLOR_VALUES.accent;
};

export const ANNOTATION_KINDS = ['arrow', 'box', 'pen', 'text', 'marker'];
export const TEXT_STYLES = ['pill', 'card', 'plain', 'note', 'positive', 'negative'];
// ✓ / ✕ labels — centred on their point so a callout arrow can start
// underneath them and emerge from whichever edge faces the target.
export const TONE_STYLES = ['positive', 'negative'];
export const DEFAULT_TEXT_W = { pill: 0.2, card: 0.26, plain: 0.22, note: 0.24, positive: 0.26, negative: 0.26 };
export const DEFAULT_TEXT = {
  pill: 'Label', card: 'Title\nA short note', plain: 'Text', note: 'Note', positive: 'Works well', negative: "Doesn't work",
};
const TONE_COLOR = { positive: 'success', negative: 'error' };
// Highlight-box looks: outline in the chosen color / gray / none, and an
// optional fill — translucent white, a gray or color tint, or (legacy)
// `tint` = a tint of the box's own color.
export const BOX_BORDERS = ['color', 'gray', 'none'];
export const BOX_FILLS = ['none', 'white', 'gray', 'accent', 'ink', 'success', 'error', 'info', 'warning', 'tint'];
const TINT_OPACITY = 0.18;
// Note look: background (white / tint of its color / none); the border is
// on unless turned off; the offset shadow is OFF unless turned on. Box text: a filled chip in the box
// color, a note-style white box, or colored text only.
export const NOTE_BGS = ['white', 'tint', 'none'];
export const BOX_LABEL_STYLES = ['filled', 'note', 'plain'];

export const boxFillPaint = (a) => {
  const fill = BOX_FILLS.includes(a.fill) ? a.fill : 'none';
  if (fill === 'none') return { fill: 'none', opacity: 1 };
  if (fill === 'white') return { fill: 'rgba(255, 255, 255, 0.6)', opacity: 1 };
  if (fill === 'gray') return { fill: 'var(--color-text-muted)', opacity: TINT_OPACITY };
  return { fill: resolveColor(fill === 'tint' ? a.color : fill), opacity: TINT_OPACITY };
};

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
export const clamp01 = (n) => Math.min(1, Math.max(0, isNum(n) ? n : 0));
export const round4 = (n) => Math.round(n * 10000) / 10000;
const frac = (n) => round4(clamp01(n));
// A curve's control point may sit past the media edge (a bulging arc).
const ctl = (n) => round4(Math.min(2, Math.max(-1, n)));
const isCentered = (a) => a.kind === 'text' && TONE_STYLES.includes(a.style);
const px = (n) => Math.round(n * 10) / 10;

let seq = 0;
export const newAnnotationId = () =>
  `an${Date.now().toString(36)}${(seq++ % 1296).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const normalizeOne = (a) => {
  if (!a || typeof a !== 'object' || !ANNOTATION_KINDS.includes(a.kind)) return null;
  const id = typeof a.id === 'string' && a.id ? a.id : newAnnotationId();
  const color = COLOR_TOKENS.includes(a.color) ? a.color : 'accent';
  switch (a.kind) {
    case 'arrow':
      if (![a.x1, a.y1, a.x2, a.y2].every(isNum)) return null;
      return {
        id, kind: 'arrow', x1: frac(a.x1), y1: frac(a.y1), x2: frac(a.x2), y2: frac(a.y2), color,
        ...(isNum(a.cx) && isNum(a.cy) ? { cx: ctl(a.cx), cy: ctl(a.cy) } : {}),
      };
    case 'box': {
      if (![a.x, a.y, a.w, a.h].every(isNum)) return null;
      const x = frac(a.x);
      const y = frac(a.y);
      return {
        id, kind: 'box', x, y, w: round4(Math.min(clamp01(a.w), 1 - x)), h: round4(Math.min(clamp01(a.h), 1 - y)), color,
        ...(BOX_BORDERS.includes(a.border) ? { border: a.border } : {}),
        ...(BOX_FILLS.includes(a.fill) ? { fill: a.fill } : {}),
        ...(typeof a.label === 'string' && a.label.trim() ? { label: a.label } : {}),
        ...(BOX_LABEL_STYLES.includes(a.labelStyle) && a.labelStyle !== 'filled' ? { labelStyle: a.labelStyle } : {}),
      };
    }
    case 'pen': {
      const points = (Array.isArray(a.points) ? a.points : [])
        .filter((p) => Array.isArray(p) && isNum(p[0]) && isNum(p[1]))
        .map(([x, y]) => [frac(x), frac(y)]);
      return points.length < 2 ? null : { id, kind: 'pen', points, color };
    }
    case 'text': {
      if (![a.x, a.y].every(isNum)) return null;
      const style = TEXT_STYLES.includes(a.style) ? a.style : 'pill';
      const w = isNum(a.w) && a.w > 0 ? round4(Math.min(a.w, 1)) : DEFAULT_TEXT_W[style];
      const text = typeof a.text === 'string' ? a.text : '';
      return {
        id, kind: 'text', style, x: frac(a.x), y: frac(a.y), w, text, color,
        ...(TONE_STYLES.includes(style) && a.icon === false ? { icon: false } : {}),
        ...(style === 'note' && a.shadow === true ? { shadow: true } : {}),
        ...(style === 'note' && NOTE_BGS.includes(a.bg) && a.bg !== 'white' ? { bg: a.bg } : {}),
        ...(style === 'note' && a.border === false ? { border: false } : {}),
      };
    }
    default: {
      if (![a.x, a.y].every(isNum)) return null;
      const text = typeof a.text === 'string' && a.text.trim() ? a.text.trim() : '1';
      return { id, kind: 'marker', x: frac(a.x), y: frac(a.y), text, color };
    }
  }
};

// Anything malformed is dropped rather than thrown on — stored JSON may be
// hand-edited or come from an older shape.
export const normalizeAnnotations = (list) =>
  (Array.isArray(list) ? list : []).map(normalizeOne).filter(Boolean);

// Drops jitter (points closer than minDist to the last kept one), then a
// 3-point moving average that keeps both endpoints exactly.
export const smoothPoints = (points, minDist = 0.003) => {
  const src = (Array.isArray(points) ? points : []).filter((p) => Array.isArray(p) && isNum(p[0]) && isNum(p[1]));
  if (src.length < 3) return src.map(([x, y]) => [round4(x), round4(y)]);
  const kept = [src[0]];
  for (let i = 1; i < src.length - 1; i++) {
    const [lx, ly] = kept[kept.length - 1];
    if (Math.hypot(src[i][0] - lx, src[i][1] - ly) >= minDist) kept.push(src[i]);
  }
  kept.push(src[src.length - 1]);
  return kept.map((p, i) => {
    if (i === 0 || i === kept.length - 1) return [round4(p[0]), round4(p[1])];
    const a = kept[i - 1];
    const b = kept[i + 1];
    return [round4((a[0] + p[0] + b[0]) / 3), round4((a[1] + p[1] + b[1]) / 3)];
  });
};

// Pen stroke → SVG path in pixel space, with quadratic curves through the
// midpoints so a hand-drawn line reads smooth rather than faceted.
export const pointsToPath = (points, W, H) => {
  const p = points.map(([x, y]) => [px(x * W), px(y * H)]);
  if (p.length < 2) return '';
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    d += ` Q${p[i][0]} ${p[i][1]} ${px((p[i][0] + p[i + 1][0]) / 2)} ${px((p[i][1] + p[i + 1][1]) / 2)}`;
  }
  const last = p[p.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
};

// Straight arrow in pixel space. The shaft stops at the head's base so the
// round line cap never pokes through the tip.
export const arrowGeometry = (a, W, H, headLen) => {
  const x1 = a.x1 * W;
  const y1 = a.y1 * H;
  const x2 = a.x2 * W;
  const y2 = a.y2 * H;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const hl = Math.min(headLen, len * 0.6);
  const hw = hl * 0.55;
  const bx = x2 - ux * hl;
  const by = y2 - uy * hl;
  return {
    shaft: { x1: px(x1), y1: px(y1), x2: px(bx), y2: px(by) },
    head: [[px(x2), px(y2)], [px(bx - uy * hw), px(by + ux * hw)], [px(bx + uy * hw), px(by - ux * hw)]],
  };
};

const isCurved = (a) => isNum(a.cx) && isNum(a.cy); // only arrows carry cx/cy
const qPoint = (p0, c, p1, t) => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};

// Curved arrow (quadratic, control point cx/cy) in pixel space. The shaft is
// cut where the curve is headLen from the tip, and the head is aimed along
// that last stretch so it follows the bend.
export const curvedArrowGeometry = (a, W, H, headLen) => {
  const p0 = [a.x1 * W, a.y1 * H];
  const c = [a.cx * W, a.cy * H];
  const p1 = [a.x2 * W, a.y2 * H];
  const hl = Math.min(headLen, (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1) * 0.6);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const q = qPoint(p0, c, p1, mid);
    if (Math.hypot(p1[0] - q[0], p1[1] - q[1]) > hl) lo = mid; else hi = mid;
  }
  const base = qPoint(p0, c, p1, lo);
  // de Casteljau split at `lo`: the first half keeps p0 and this control point.
  const c1 = [p0[0] + (c[0] - p0[0]) * lo, p0[1] + (c[1] - p0[1]) * lo];
  const len = Math.hypot(p1[0] - base[0], p1[1] - base[1]) || 1;
  const ux = (p1[0] - base[0]) / len;
  const uy = (p1[1] - base[1]) / len;
  const hw = hl * 0.55;
  return {
    d: `M${px(p0[0])} ${px(p0[1])} Q${px(c1[0])} ${px(c1[1])} ${px(base[0])} ${px(base[1])}`,
    head: [[px(p1[0]), px(p1[1])], [px(base[0] - uy * hw), px(base[1] + ux * hw)], [px(base[0] + uy * hw), px(base[1] - ux * hw)]],
  };
};

// Default bend for the Curve tool: control point off the chord's midpoint,
// on the upper side, by `amount` of the chord length.
export const bendControl = (a, amount = 0.2) => {
  let nx = -(a.y2 - a.y1);
  let ny = a.x2 - a.x1;
  if (ny > 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; }
  return { cx: ctl((a.x1 + a.x2) / 2 + nx * amount), cy: ctl((a.y1 + a.y2) / 2 + ny * amount) };
};

// The point halfway along the arrow — where its bend handle sits.
export const arrowMid = (a) => (isCurved(a)
  ? [round4(0.25 * a.x1 + 0.5 * a.cx + 0.25 * a.x2), round4(0.25 * a.y1 + 0.5 * a.cy + 0.25 * a.y2)]
  : [round4((a.x1 + a.x2) / 2), round4((a.y1 + a.y2) / 2)]);

export const straightenArrow = (a) => {
  const { cx, cy, ...rest } = a; // eslint-disable-line no-unused-vars
  return rest;
};

// Bounding box (fractions) — drives the dashed selection outline and keeps
// moves inside the media. Text uses its width; its height is content-driven.
export const annotationBounds = (a) => {
  if (a.kind === 'box') return { x: a.x, y: a.y, w: a.w, h: a.h };
  if (isCentered(a)) return { x: round4(a.x - a.w / 2), y: a.y, w: a.w, h: 0 };
  if (a.kind === 'text') return { x: a.x, y: a.y, w: a.w, h: 0 };
  const mid = isCurved(a) ? arrowMid(a) : null;
  const xs = a.kind === 'arrow' ? [a.x1, a.x2, ...(mid ? [mid[0]] : [])] : a.kind === 'pen' ? a.points.map((p) => p[0]) : [a.x];
  const ys = a.kind === 'arrow' ? [a.y1, a.y2, ...(mid ? [mid[1]] : [])] : a.kind === 'pen' ? a.points.map((p) => p[1]) : [a.y];
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x: round4(x), y: round4(y), w: round4(Math.max(...xs) - x), h: round4(Math.max(...ys) - y) };
};

// Shifts an annotation by (dx, dy), clamped so it never leaves the media box.
export const moveAnnotation = (a, dx, dy) => {
  const b = annotationBounds(a);
  const mx = Math.min(Math.max(dx, -b.x), 1 - (b.x + b.w));
  const my = Math.min(Math.max(dy, -b.y), 1 - (b.y + b.h));
  switch (a.kind) {
    case 'arrow':
      return {
        ...a, x1: round4(a.x1 + mx), y1: round4(a.y1 + my), x2: round4(a.x2 + mx), y2: round4(a.y2 + my),
        ...(isCurved(a) ? { cx: ctl(a.cx + mx), cy: ctl(a.cy + my) } : {}),
      };
    case 'pen':
      return { ...a, points: a.points.map(([x, y]) => [round4(x + mx), round4(y + my)]) };
    default: // box, text, marker — anchored at (x, y)
      return { ...a, x: round4(a.x + mx), y: round4(a.y + my) };
  }
};

// Drag of a selection handle to pointer position (x, y).
export const resizeAnnotation = (a, handle, x, y) => {
  const cx = clamp01(x);
  const cy = clamp01(y);
  if (a.kind === 'arrow' && handle === 'start') return { ...a, x1: round4(cx), y1: round4(cy) };
  if (a.kind === 'arrow' && handle === 'end') return { ...a, x2: round4(cx), y2: round4(cy) };
  // The bend handle sits on the curve's midpoint m, so the control point is 2m − (p0 + p1) / 2.
  if (a.kind === 'arrow' && handle === 'bend') return { ...a, cx: ctl(2 * cx - (a.x1 + a.x2) / 2), cy: ctl(2 * cy - (a.y1 + a.y2) / 2) };
  if (isCentered(a) && handle === 'width') return { ...a, w: round4(Math.max(0.04, 2 * (cx - a.x))) };
  if (a.kind === 'box' && handle === 'corner') return { ...a, w: round4(Math.max(0.01, cx - a.x)), h: round4(Math.max(0.01, cy - a.y)) };
  if (a.kind === 'text' && handle === 'width') return { ...a, w: round4(Math.max(0.04, cx - a.x)) };
  return a;
};

// Live draft (while dragging) → renderable annotation. Boxes are drafted as
// two corners so the drag can go in any direction.
export const draftToAnnotation = (d) => {
  if (d.kind === 'box') {
    return {
      id: 'draft', kind: 'box', color: d.color,
      x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), w: Math.abs(d.x1 - d.x0), h: Math.abs(d.y1 - d.y0),
      ...(d.border ? { border: d.border } : {}),
      ...(d.fill ? { fill: d.fill } : {}),
    };
  }
  if (d.kind === 'arrow' && d.curved) {
    const { curved, ...rest } = d; // eslint-disable-line no-unused-vars
    return { ...rest, ...bendControl(rest), id: 'draft' };
  }
  return { ...d, id: 'draft' };
};

// Finished drag → stored annotation, or null when it's too small to be deliberate.
export const finalizeDraft = (d) => {
  if (!d) return null;
  const a = draftToAnnotation(d);
  if (a.kind === 'arrow' && Math.hypot(a.x2 - a.x1, a.y2 - a.y1) < 0.01) return null;
  if (a.kind === 'box' && (a.w < 0.01 || a.h < 0.01)) return null;
  if (a.kind === 'pen') {
    const points = smoothPoints(a.points);
    if (points.length < 2) return null;
    const b = annotationBounds({ kind: 'pen', points });
    if (Math.max(b.w, b.h) < 0.005) return null;
    return normalizeOne({ ...a, id: newAnnotationId(), points });
  }
  return normalizeOne({ ...a, id: newAnnotationId() });
};

// Numbered markers continue from the highest numeric one already placed.
export const nextMarkerNumber = (list) => {
  const nums = normalizeAnnotations(list)
    .filter((a) => a.kind === 'marker')
    .map((a) => parseInt(a.text, 10))
    .filter(Number.isFinite);
  return String(nums.length ? Math.max(...nums) + 1 : 1);
};

// ✓ / ✕ callout: press on the target, release where the note goes. A drag
// yields an arrow (tail under the label, tip on the target) plus the label;
// a plain click yields just the label. Both stay independent afterwards.
const calloutParts = (d) => {
  const color = TONE_COLOR[d.tone] || 'success';
  const style = TONE_STYLES.includes(d.tone) ? d.tone : 'positive';
  const dragged = Math.hypot(d.x2 - d.x1, d.y2 - d.y1) >= 0.02;
  const label = {
    kind: 'text', style, color, w: DEFAULT_TEXT_W[style], text: DEFAULT_TEXT[style],
    x: dragged ? d.x2 : d.x1, y: dragged ? d.y2 : d.y1,
  };
  return dragged ? [{ kind: 'arrow', x1: d.x2, y1: d.y2, x2: d.x1, y2: d.y1, color }, label] : [label];
};

export const finalizeCallout = (d) =>
  normalizeAnnotations(calloutParts(d).map((a) => ({ ...a, id: newAnnotationId() })));

// Everything to draw for an in-progress drag (callouts preview as two parts).
export const draftPreview = (d) => {
  if (d.kind === 'callout') {
    return calloutParts(d).map((a) => ({ ...a, id: a.kind === 'arrow' ? 'draft' : 'draft-label' }));
  }
  return [draftToAnnotation(d)];
};

// Readable text on an image, top-to-bottom then left-to-right — shown as a
// plain list under the image on small screens, where the overlay is hidden.
export const annotationNotes = (list, palette) => normalizeAnnotations(list)
  .filter((a) => (a.kind === 'text' && a.text.trim()) || (a.kind === 'box' && a.label))
  .sort((a, b) => a.y - b.y || a.x - b.x)
  .map((a) => ({
    id: a.id,
    text: a.kind === 'box' ? a.label : a.text,
    tone: a.kind === 'text' && TONE_STYLES.includes(a.style) ? a.style : '',
    color: paletteColor(a.color, palette),
  }));
