# Image Annotations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the designer draw arrows, highlight boxes, freehand strokes and design-system text templates on top of article figure images/videos, persisted with the case study and shown on desktop.

**Architecture:** Pure geometry/data helpers in `src/data/annotations.js` (unit-tested). A new `src/components/ImageAnnotations.jsx` exports a read-only `AnnotationLayer` and an `AnnotationEditor`; both measure the media box with a ResizeObserver and draw SVG in real pixels plus absolutely positioned HTML text. `CaseStudyArticle.jsx` wraps each figure's `<img>`/`<video>` in a positioned stage and adds an Annotate toggle to the figure tools. Data lives on the media entry as `annotations: [...]` and rides the existing auto-save / Save to Code.

**Tech Stack:** React 19, Vite, vanilla CSS, `node --test` for unit tests, playwright-core (scratchpad only) for browser checks.

**Spec:** `docs/superpowers/specs/2026-09-21-image-annotations-design.md`

## Global Constraints

- Article view only — do NOT touch `src/pages/CaseStudy.jsx`, `DynamicImages`, or slide edit mode.
- No new npm dependencies.
- Vanilla CSS in a per-component file (`ImageAnnotations.css`); const arrow function components; match surrounding naming (PascalCase component files, camelCase data modules, as the repo already does).
- Coordinates are 0–1 fractions of the media box, rounded to 4 decimals.
- Colors are token names: `accent | ink | success | info | white`; `ink` → `#22211f` (fixed).
- View-mode overlay visible only at `min-width: 1024px`; never intercepts pointer events.
- Carousel figures and embeds (`embedUrl`) get no annotations.
- **No git commits** (project CLAUDE.md: "Don't commit unless asked"). Each task ends with a checkpoint (tests/build) instead of a commit.
- Before starting: `git branch backup/pre-image-annotations` (project CLAUDE.md principle 6).

---

### Task 1: Annotation data helpers

**Files:**
- Create: `src/data/annotations.js`
- Test: `src/data/annotations.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces (all named exports):
  - `COLOR_TOKENS: string[]`, `resolveColor(name: string): string`
  - `ANNOTATION_KINDS`, `TEXT_STYLES`, `DEFAULT_TEXT_W: {pill,card,plain}`, `DEFAULT_TEXT: {pill,card,plain}`
  - `clamp01(n): number`, `round4(n): number`, `newAnnotationId(): string` (prefix `an`)
  - `normalizeAnnotations(list: unknown): Annotation[]`
  - `smoothPoints(points: [x,y][], minDist?: number): [x,y][]`
  - `pointsToPath(points, W, H): string`
  - `arrowGeometry(a, W, H, headLen): { shaft: {x1,y1,x2,y2}, head: [x,y][] }` (pixels, rounded to 0.1)
  - `annotationBounds(a): {x,y,w,h}` (fractions)
  - `moveAnnotation(a, dx, dy): Annotation`
  - `resizeAnnotation(a, handle: 'start'|'end'|'corner'|'width', x, y): Annotation`
  - `draftToAnnotation(draft): Annotation` (id `'draft'`), `finalizeDraft(draft): Annotation | null`
  - `nextMarkerNumber(list): string`

- [ ] **Step 0: Backup branch**

Run: `git branch backup/pre-image-annotations`

- [ ] **Step 1: Write the failing tests** — create `src/data/annotations.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveColor, normalizeAnnotations, smoothPoints, pointsToPath, arrowGeometry,
  annotationBounds, moveAnnotation, resizeAnnotation, finalizeDraft, nextMarkerNumber,
} from './annotations.js';

test('resolveColor maps tokens and falls back to accent', () => {
  assert.equal(resolveColor('ink'), '#22211f');
  assert.equal(resolveColor('success'), 'var(--color-success)');
  assert.equal(resolveColor('nope'), 'var(--color-accent)');
});

test('normalizeAnnotations drops invalid items and unknown kinds', () => {
  const out = normalizeAnnotations([
    { id: 'a', kind: 'arrow', x1: 0.1, y1: 0.1, x2: 0.5, y2: 0.5 },
    { id: 'b', kind: 'arrow', x1: 0.1 },
    { id: 'c', kind: 'sticker', x: 0.1, y: 0.1 },
    { id: 'd', kind: 'pen', points: [[0.1, 0.1]] },
    null,
  ]);
  assert.deepEqual(out.map((a) => a.id), ['a']);
  assert.equal(out[0].color, 'accent');
  assert.deepEqual(normalizeAnnotations('garbage'), []);
});

test('normalizeAnnotations clamps coordinates and fits boxes inside the media', () => {
  const [box] = normalizeAnnotations([{ id: 'b', kind: 'box', x: 0.9, y: -0.2, w: 0.5, h: 0.3, color: 'info' }]);
  assert.deepEqual(box, { id: 'b', kind: 'box', x: 0.9, y: 0, w: 0.1, h: 0.3, color: 'info' });
});

test('normalizeAnnotations fills text and marker defaults', () => {
  const [t, m] = normalizeAnnotations([
    { id: 't', kind: 'text', x: 0.2, y: 0.3, text: 'Hi' },
    { id: 'm', kind: 'marker', x: 0.4, y: 0.4, text: '  ' },
  ]);
  assert.equal(t.style, 'pill');
  assert.equal(t.w, 0.2);
  assert.equal(m.text, '1');
});

test('smoothPoints keeps both endpoints and drops jitter', () => {
  const out = smoothPoints([[0, 0], [0.001, 0.001], [0.1, 0.1], [0.2, 0.25], [0.3, 0.3]]);
  assert.deepEqual(out[0], [0, 0]);
  assert.deepEqual(out[out.length - 1], [0.3, 0.3]);
  assert.equal(out.length, 4);
});

test('pointsToPath converts fractions to a pixel path', () => {
  assert.equal(pointsToPath([[0, 0], [0.5, 0.5], [1, 1]], 200, 100), 'M0 0 Q100 50 150 75 L200 100');
});

test('arrowGeometry stops the shaft at the head base', () => {
  const g = arrowGeometry({ x1: 0, y1: 0.5, x2: 1, y2: 0.5 }, 100, 100, 10);
  assert.deepEqual(g.shaft, { x1: 0, y1: 50, x2: 90, y2: 50 });
  assert.deepEqual(g.head, [[100, 50], [90, 55.5], [90, 44.5]]);
});

test('annotationBounds covers arrows, pens and text width', () => {
  assert.deepEqual(annotationBounds({ kind: 'arrow', x1: 0.6, y1: 0.2, x2: 0.4, y2: 0.5 }), { x: 0.4, y: 0.2, w: 0.2, h: 0.3 });
  assert.deepEqual(annotationBounds({ kind: 'pen', points: [[0.1, 0.3], [0.3, 0.1]] }), { x: 0.1, y: 0.1, w: 0.2, h: 0.2 });
  assert.deepEqual(annotationBounds({ kind: 'text', x: 0.5, y: 0.5, w: 0.2 }), { x: 0.5, y: 0.5, w: 0.2, h: 0 });
});

test('moveAnnotation clamps so the shape stays on the media', () => {
  const box = { id: 'b', kind: 'box', x: 0.7, y: 0.1, w: 0.2, h: 0.2, color: 'accent' };
  assert.deepEqual(moveAnnotation(box, 0.5, -0.5), { ...box, x: 0.8, y: 0 });
  const arrow = { id: 'a', kind: 'arrow', x1: 0.1, y1: 0.1, x2: 0.3, y2: 0.2, color: 'accent' };
  assert.deepEqual(moveAnnotation(arrow, -0.5, 0.1), { ...arrow, x1: 0, y1: 0.2, x2: 0.2, y2: 0.3 });
});

test('resizeAnnotation moves arrow ends, box corner and text width', () => {
  const arrow = { kind: 'arrow', x1: 0.1, y1: 0.1, x2: 0.3, y2: 0.3 };
  assert.deepEqual(resizeAnnotation(arrow, 'end', 0.5, 1.4), { ...arrow, x2: 0.5, y2: 1 });
  const box = { kind: 'box', x: 0.2, y: 0.2, w: 0.1, h: 0.1 };
  assert.deepEqual(resizeAnnotation(box, 'corner', 0.1, 0.6), { ...box, w: 0.01, h: 0.4 });
  const text = { kind: 'text', x: 0.5, y: 0.5, w: 0.2 };
  assert.deepEqual(resizeAnnotation(text, 'width', 0.9, 0.5), { ...text, w: 0.4 });
});

test('finalizeDraft rejects accidental clicks and normalizes real drags', () => {
  assert.equal(finalizeDraft({ kind: 'arrow', x1: 0.5, y1: 0.5, x2: 0.502, y2: 0.5, color: 'ink' }), null);
  assert.equal(finalizeDraft({ kind: 'box', x0: 0.2, y0: 0.2, x1: 0.6, y1: 0.205, color: 'ink' }), null);
  const box = finalizeDraft({ kind: 'box', x0: 0.6, y0: 0.5, x1: 0.2, y1: 0.1, color: 'ink' });
  assert.deepEqual([box.kind, box.x, box.y, box.w, box.h], ['box', 0.2, 0.1, 0.4, 0.4]);
  assert.match(box.id, /^an/);
  const pen = finalizeDraft({ kind: 'pen', points: [[0.1, 0.1], [0.2, 0.2], [0.3, 0.25]], color: 'ink' });
  assert.equal(pen.kind, 'pen');
  assert.deepEqual(pen.points[0], [0.1, 0.1]);
});

test('nextMarkerNumber continues after the highest marker', () => {
  assert.equal(nextMarkerNumber([]), '1');
  assert.equal(nextMarkerNumber([
    { kind: 'marker', x: 0.1, y: 0.1, text: '2' },
    { kind: 'marker', x: 0.2, y: 0.2, text: 'A' },
    { kind: 'text', x: 0.2, y: 0.2, text: '9' },
  ]), '3');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/data/annotations.test.mjs`
Expected: FAIL — `Cannot find module .../src/data/annotations.js`

- [ ] **Step 3: Implement** — create `src/data/annotations.js`:

```js
// ─────────────────────────────────────────────────────────────────────────
// annotations.js — pure data helpers for image annotations on article
// figures: arrows, highlight boxes, pen strokes, text templates and
// numbered markers. Coordinates are 0–1 fractions of the rendered media
// box; src/components/ImageAnnotations.jsx converts them to pixels.
//
// No React here — unit-tested by annotations.test.mjs (node --test).
// ─────────────────────────────────────────────────────────────────────────

export const COLOR_TOKENS = ['accent', 'ink', 'success', 'info', 'white'];

const COLOR_VALUES = {
  accent: 'var(--color-accent)',
  ink: '#22211f', // fixed — stays dark on screenshots in dark theme
  success: 'var(--color-success)',
  info: 'var(--color-info)',
  white: '#ffffff',
};

export const resolveColor = (name) => COLOR_VALUES[name] || COLOR_VALUES.accent;

export const ANNOTATION_KINDS = ['arrow', 'box', 'pen', 'text', 'marker'];
export const TEXT_STYLES = ['pill', 'card', 'plain'];
export const DEFAULT_TEXT_W = { pill: 0.2, card: 0.26, plain: 0.22 };
export const DEFAULT_TEXT = { pill: 'Label', card: 'Title\nA short note', plain: 'Text' };

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
export const clamp01 = (n) => Math.min(1, Math.max(0, isNum(n) ? n : 0));
export const round4 = (n) => Math.round(n * 10000) / 10000;
const frac = (n) => round4(clamp01(n));
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
      return { id, kind: 'arrow', x1: frac(a.x1), y1: frac(a.y1), x2: frac(a.x2), y2: frac(a.y2), color };
    case 'box': {
      if (![a.x, a.y, a.w, a.h].every(isNum)) return null;
      const x = frac(a.x);
      const y = frac(a.y);
      return { id, kind: 'box', x, y, w: round4(Math.min(clamp01(a.w), 1 - x)), h: round4(Math.min(clamp01(a.h), 1 - y)), color };
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
      return { id, kind: 'text', style, x: frac(a.x), y: frac(a.y), w, text, color };
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

// Bounding box (fractions) — drives the dashed selection outline and keeps
// moves inside the media. Text uses its width; its height is content-driven.
export const annotationBounds = (a) => {
  if (a.kind === 'box') return { x: a.x, y: a.y, w: a.w, h: a.h };
  if (a.kind === 'text') return { x: a.x, y: a.y, w: a.w, h: 0 };
  const xs = a.kind === 'arrow' ? [a.x1, a.x2] : a.kind === 'pen' ? a.points.map((p) => p[0]) : [a.x];
  const ys = a.kind === 'arrow' ? [a.y1, a.y2] : a.kind === 'pen' ? a.points.map((p) => p[1]) : [a.y];
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
      return { ...a, x1: round4(a.x1 + mx), y1: round4(a.y1 + my), x2: round4(a.x2 + mx), y2: round4(a.y2 + my) };
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
    };
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/data/annotations.test.mjs`
Expected: PASS — 12 tests, 0 failures.

- [ ] **Step 5: Checkpoint** — `node --test src/data/mediaLibrary.test.mjs` still passes (sanity that nothing shared broke).

---

### Task 2: Read-only overlay in the article + demo annotation

**Files:**
- Create: `src/components/ImageAnnotations.jsx` (shared renderer + `AnnotationLayer`)
- Create: `src/components/ImageAnnotations.css`
- Modify: `src/pages/CaseStudyArticle.jsx` — imports (line ~1-12) and `MediaEntry` (lines ~70-160)
- Modify: `src/data/case-studies/privacy-center-builder.json` — demo annotations on block `pcb-o1-fig`, `dataVersion` 1 → 2

**Interfaces:**
- Consumes: Task 1 exports.
- Produces:
  - `AnnotationLayer({ annotations })` — named export.
  - Internal (same file, used by Task 3): `useBoxSize(ref) → {w,h}`, `unitStyle(w) → style`, `Shapes({ items, size, selectedId?, editingId?, onItemDown?, onHandleDown?, onTextCommit? })`.
  - `MediaEntry` accepts new optional props `annotating`, `onAnnotationsChange`, `onAnnotateDone` (Task 3 passes them).
  - DOM: `.cs-annot-stage` wraps media; `.cs-annot-layer` overlay; text items `.cs-annot-text--{pill|card|plain}` / `.cs-annot-marker`, each with `data-annot-id`.

- [ ] **Step 1: Create `src/components/ImageAnnotations.jsx`** (layer part — Task 3 appends the editor to this same file):

```jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { resolveColor, normalizeAnnotations, arrowGeometry, pointsToPath, annotationBounds } from '../data/annotations';
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

// --annot-u = 1% of the media width; text/marker sizes are multiples of it.
const unitStyle = (w) => ({ '--annot-u': `${w / 100}px` });

const SvgShape = ({ a, W, H, sw, selected, onDown }) => {
  const color = resolveColor(a.color);
  const hitWidth = Math.max(12, sw * 5);
  let visual;
  let hit;
  if (a.kind === 'arrow') {
    const g = arrowGeometry(a, W, H, sw * 4.5);
    visual = (
      <>
        <line x1={g.shaft.x1} y1={g.shaft.y1} x2={g.shaft.x2} y2={g.shaft.y2} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <polygon points={g.head.map((p) => p.join(',')).join(' ')} fill={color} />
      </>
    );
    hit = <line className="cs-annot-hit" x1={a.x1 * W} y1={a.y1 * H} x2={a.x2 * W} y2={a.y2 * H} strokeWidth={hitWidth} />;
  } else if (a.kind === 'box') {
    visual = <rect x={a.x * W} y={a.y * H} width={a.w * W} height={a.h * H} rx={sw * 2} fill="none" stroke={color} strokeWidth={sw} />;
    hit = <rect className="cs-annot-hit" x={a.x * W} y={a.y * H} width={a.w * W} height={a.h * H} strokeWidth={hitWidth} />;
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

const TextItem = ({ a, selected, editing, onDown, onHandleDown, onCommit }) => {
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
  const multiline = !isMarker && a.style !== 'pill';
  const style = {
    left: `${a.x * 100}%`,
    top: `${a.y * 100}%`,
    '--annot-color': resolveColor(a.color),
    ...(isMarker ? {} : { [a.style === 'pill' ? 'maxWidth' : 'width']: `${a.w * 100}%` }),
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
          if (e.key === 'Escape' || (e.key === 'Enter' && !(e.shiftKey && multiline))) {
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
      onPointerDown={onDown && !editing ? (e) => onDown(e, a) : undefined}
    >
      {content}
      {selected && !editing && !isMarker && onHandleDown && (
        <span className="cs-annot-handle cs-annot-handle--width" onPointerDown={(e) => onHandleDown(e, a, 'width')} />
      )}
    </div>
  );
};

// Everything drawn for a list of annotations: one SVG for shapes, then HTML
// text items on top. Interaction props are only passed by the editor.
const Shapes = ({ items, size, selectedId = null, editingId = null, onItemDown, onHandleDown, onTextCommit }) => {
  const { w: W, h: H } = size;
  const sw = strokeFor(W);
  return (
    <>
      <svg className="cs-annot-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {items.map((a) => (
          <SvgShape key={a.id} a={a} W={W} H={H} sw={sw} selected={a.id === selectedId} onDown={onItemDown} />
        ))}
      </svg>
      {items.filter((a) => a.kind === 'text' || a.kind === 'marker').map((a) => (
        <TextItem
          key={a.id}
          a={a}
          selected={a.id === selectedId}
          editing={a.id === editingId}
          onDown={onItemDown}
          onHandleDown={onHandleDown}
          onCommit={onTextCommit}
        />
      ))}
    </>
  );
};

export const AnnotationLayer = ({ annotations }) => {
  const ref = useRef(null);
  const size = useBoxSize(ref);
  const items = useMemo(() => normalizeAnnotations(annotations), [annotations]);
  return (
    <div ref={ref} className="cs-annot-layer" style={unitStyle(size.w)}>
      {size.w > 0 && <Shapes items={items} size={size} />}
    </div>
  );
};
```

- [ ] **Step 2: Create `src/components/ImageAnnotations.css`**:

```css
/* ─────────────────────────────────────────────────────────────────────────
   ImageAnnotations — overlay drawn on article figure media (see
   ImageAnnotations.jsx). --annot-u = 1% of the media width (set inline from
   a ResizeObserver) so text and markers scale with the image.
   ───────────────────────────────────────────────────────────────────────── */

.cs-annot-stage {
  position: relative;
}

.cs-annot-layer,
.cs-annot-editor {
  position: absolute;
  inset: 0;
}

/* Public view: desktop only, and never intercepts clicks (lightbox, video controls). */
.cs-annot-layer {
  display: none;
  pointer-events: none;
}
@media (min-width: 1024px) {
  .cs-annot-layer { display: block; }
}
/* Carousels cycle media underneath — not supported in v1. */
.cs-article-carousel-item .cs-annot-layer { display: none; }

.cs-annot-svg {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}
.cs-annot-hit {
  fill: none;
  stroke: transparent;
}
.cs-annot-selection {
  fill: none;
  stroke: var(--color-info);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}

/* ── Text templates ───────────────────────────────────────────── */
.cs-annot-text,
.cs-annot-marker {
  position: absolute;
  font-family: var(--font-body);
  font-size: max(10px, calc(var(--annot-u) * 1.3));
  line-height: 1.3;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.cs-annot-text--pill {
  width: max-content;
  padding: 0.35em 0.85em;
  border-radius: 999px;
  background: var(--annot-color);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(20, 20, 20, 0.15);
}

.cs-annot-text--card {
  padding: 0.75em 0.95em;
  border-radius: 0.6em;
  border-left: 0.3em solid var(--annot-color);
  background: #fff;
  color: #22211f;
  box-shadow: 0 6px 24px rgba(20, 20, 20, 0.14);
}
.cs-annot-card-title { display: block; font-weight: 600; }
.cs-annot-card-body { display: block; margin-top: 0.2em; opacity: 0.72; }

.cs-annot-text--plain {
  color: var(--annot-color);
  font-weight: 600;
}

.cs-annot-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.1em;
  height: 2.1em;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--annot-color);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(20, 20, 20, 0.2);
}

/* A white pill/marker needs dark text. */
.cs-annot-text--pill[data-color='white'],
.cs-annot-marker[data-color='white'] {
  color: #22211f;
}
```

- [ ] **Step 3: Wire the stage + layer into `MediaEntry`** in `src/pages/CaseStudyArticle.jsx`.

Add the import after line 7 (`import EditableField ...`):

```jsx
import { AnnotationLayer } from '../components/ImageAnnotations';
```

Change the `MediaEntry` signature (line ~70) from
`const MediaEntry = ({ entry, tier }) => {`
to
`const MediaEntry = ({ entry, tier, annotating = false, onAnnotationsChange, onAnnotateDone }) => {`

In its return, replace the `) : video ? ( <LazyVideo …/> ) : ( <img …/> )}` branch so the image/video sits in a stage with the overlay. The final non-embed branch becomes:

```jsx
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
          {!annotating && listOf(entry.annotations).length > 0 && <AnnotationLayer annotations={entry.annotations} />}
        </div>
      )}
```

(Keep the `<img>` attributes exactly as they are today — only the wrapper and the layer line are new.)

- [ ] **Step 4: Seed the demo annotation** (Shir's original "But it was here" callout on the Option 1 image). Run from the repo root:

```bash
python3 - <<'EOF'
import json
p = 'src/data/case-studies/privacy-center-builder.json'
d = json.load(open(p))
for b in d['article']['blocks']:
    if b['id'] == 'pcb-o1-fig':
        b['media'][0]['annotations'] = [
            {"id": "an-demo-arrow", "kind": "arrow", "x1": 0.788, "y1": 0.305, "x2": 0.729, "y2": 0.252, "color": "accent"},
            {"id": "an-demo-pill", "kind": "text", "style": "pill", "x": 0.795, "y": 0.285, "w": 0.2, "text": "But it was here", "color": "accent"},
        ]
d['dataVersion'] = 2
open(p, 'w').write(json.dumps(d, indent=2, ensure_ascii=False))
EOF
node -e "JSON.parse(require('fs').readFileSync('src/data/case-studies/privacy-center-builder.json'))" && echo valid
```

Expected: `valid`. (The Option 1 image's palette FAB sits at ≈ (0.715, 0.237); the arrow tip points at it.)

- [ ] **Step 5: Verify in the browser** — `npm run dev`, then headless Chrome (playwright-core in the scratchpad) at 1440×900 in a fresh context on `/project/privacy-center-builder`: `await page.locator('.cs-article-figure', { has: page.locator('img[src*="option-1-fabs"]') }).scrollIntoViewIfNeeded()`, wait 800ms, screenshot the viewport.
Expected: a red-orange pill "But it was here" to the right of the palette button with an arrow pointing at it; `document.querySelectorAll('.cs-annot-layer').length === 1`; at 390×844 the layer's computed `display` is `none`. Adjust the seed coordinates if the arrow tip misses the button, then re-check.

- [ ] **Step 6: Checkpoint** — `npm run build` passes.

---

### Task 3: Annotation editor + Annotate toggle

**Files:**
- Modify: `src/components/ImageAnnotations.jsx` — append `AnnotationEditor` (+ `ShapeHandles`, `TOOLS`)
- Modify: `src/components/ImageAnnotations.css` — append editor styles
- Modify: `src/pages/CaseStudyArticle.jsx` — import, `MediaEntry` editor branch, `FigureBlock` (line ~500-600)

**Interfaces:**
- Consumes: Task 1 exports; Task 2 `useBoxSize`, `unitStyle`, `Shapes`.
- Produces: `AnnotationEditor({ annotations, onChange(list), onDone() })` — named export. Toolbar buttons are `.cs-article-mini-btn` with text `Select | Arrow | Box | Pen | Label | Card | Marker | Text | Delete | Done`; swatches `.cs-annot-swatch` with `aria-label="<token> color"`; the drawing surface is `.cs-annot-editor.is-tool-<tool>`. The figure tools get a button whose text starts with `annotate` (or `done` while active).

- [ ] **Step 1: Extend the import line** at the top of `ImageAnnotations.jsx` to:

```jsx
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  COLOR_TOKENS, DEFAULT_TEXT, DEFAULT_TEXT_W, resolveColor, normalizeAnnotations, newAnnotationId,
  arrowGeometry, pointsToPath, annotationBounds, moveAnnotation, resizeAnnotation,
  draftToAnnotation, finalizeDraft, nextMarkerNumber, clamp01,
} from '../data/annotations';
```

- [ ] **Step 2: Append the editor** to the end of `ImageAnnotations.jsx`:

```jsx
const TOOLS = [
  ['select', 'Select', 'Select, move and resize — Alt+drag duplicates, Delete removes'],
  ['arrow', 'Arrow', 'Drag to draw an arrow'],
  ['box', 'Box', 'Drag to draw a highlight box'],
  ['pen', 'Pen', 'Draw freehand'],
  ['pill', 'Label', 'Click to place a label pill'],
  ['card', 'Card', 'Click to place a callout card'],
  ['marker', 'Marker', 'Click to place a numbered marker'],
  ['plain', 'Text', 'Click to place plain text'],
];
const TEXT_TOOLS = ['pill', 'card', 'plain', 'marker'];
// Pointer capture retargets native dblclick to the surface, so double-click
// is detected from two presses on the same item within this window.
const DOUBLE_PRESS_MS = 350;

// Resize handles for the selected SVG shape (text boxes carry their own).
const ShapeHandles = ({ a, onHandleDown }) => {
  const at = (x, y, handle) => (
    <span
      key={handle}
      className="cs-annot-handle"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      onPointerDown={(e) => onHandleDown(e, a, handle)}
    />
  );
  if (a.kind === 'arrow') return <>{at(a.x1, a.y1, 'start')}{at(a.x2, a.y2, 'end')}</>;
  if (a.kind === 'box') return at(a.x + a.w, a.y + a.h, 'corner');
  return null;
};

export const AnnotationEditor = ({ annotations, onChange, onDone }) => {
  const surfaceRef = useRef(null);
  const size = useBoxSize(surfaceRef);
  const [items, setItems] = useState(() => normalizeAnnotations(annotations));
  const itemsRef = useRef(items);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('accent');
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const dragRef = useRef(null);
  const lastPressRef = useRef({ id: null, t: 0 });
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
  }, [selectedId, commit]);

  useEffect(() => {
    const onKey = (e) => {
      if (editingId) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeSelected();
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
  }, [editingId, selectedId, removeSelected]);

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
    const d = tool === 'arrow' ? { kind: 'arrow', x1: p.x, y1: p.y, x2: p.x, y2: p.y, color }
      : tool === 'box' ? { kind: 'box', x0: p.x, y0: p.y, x1: p.x, y1: p.y, color }
        : { kind: 'pen', points: [[p.x, p.y]], color };
    draftRef.current = d;
    setDraft(d);
    setSelectedId(null);
    beginDrag(e, { mode: 'draw' });
  };

  const onItemDown = (e, a) => {
    if (tool !== 'select' || e.button !== 0) return;
    const now = Date.now();
    const last = lastPressRef.current;
    lastPressRef.current = { id: a.id, t: now };
    if ((a.kind === 'text' || a.kind === 'marker') && last.id === a.id && now - last.t < DOUBLE_PRESS_MS) {
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
    beginDrag(e, { mode: 'resize', id: a.id, handle, moved: false });
  };

  const onSurfaceMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toFrac(e);
    if (drag.mode === 'draw') {
      const d = draftRef.current;
      const next = d.kind === 'arrow' ? { ...d, x2: p.x, y2: p.y }
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
      const a = finalizeDraft(draftRef.current);
      draftRef.current = null;
      setDraft(null);
      if (a) {
        commit([...itemsRef.current, a]);
        setSelectedId(a.id);
      }
    } else if (drag.moved) {
      onChangeRef.current?.(itemsRef.current);
    }
  };

  const onTextCommit = (a, raw) => {
    setEditingId(null);
    const text = (raw || '').replace(/\n+$/, '').trim();
    commit(text
      ? itemsRef.current.map((x) => (x.id === a.id ? { ...x, text } : x))
      : itemsRef.current.filter((x) => x.id !== a.id));
    if (!text) setSelectedId(null);
  };

  const pickColor = (c) => {
    setColor(c);
    if (selectedId) commit(itemsRef.current.map((a) => (a.id === selectedId ? { ...a, color: c } : a)));
  };

  const selected = items.find((a) => a.id === selectedId) || null;
  const shown = draft ? [...items, draftToAnnotation(draft)] : items;

  return (
    <>
      <div className="cs-annot-toolbar" onPointerDown={(e) => e.stopPropagation()}>
        {TOOLS.map(([key, label, title]) => (
          <button
            key={key}
            type="button"
            title={title}
            className={`cs-article-mini-btn${tool === key ? ' is-active' : ''}`}
            onClick={() => setTool(key)}
          >
            {label}
          </button>
        ))}
        <span className="cs-annot-swatches">
          {COLOR_TOKENS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={`${c} color`}
              className={`cs-annot-swatch${(selected ? selected.color : color) === c ? ' is-active' : ''}`}
              style={{ background: resolveColor(c) }}
              onClick={() => pickColor(c)}
            />
          ))}
        </span>
        <button type="button" className="cs-article-mini-btn" disabled={!selectedId} onClick={removeSelected}>Delete</button>
        <button type="button" className="cs-article-mini-btn is-active" onClick={() => onDoneRef.current?.()}>Done</button>
      </div>
      <div
        ref={surfaceRef}
        className={`cs-annot-editor is-tool-${tool}`}
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
          />
        )}
        {selected && tool === 'select' && <ShapeHandles a={selected} onHandleDown={onHandleDown} />}
      </div>
    </>
  );
};
```

- [ ] **Step 3: Append editor styles** to `ImageAnnotations.css`:

```css
/* ── Editor (edit mode only) ─────────────────────────────────── */
.cs-annot-editor {
  z-index: 5;
  cursor: crosshair;
  touch-action: none;
  outline: 1.5px dashed var(--color-info);
  outline-offset: 2px;
}
.cs-annot-editor.is-tool-select { cursor: default; }

/* Drawing tools draw over existing annotations; only Select can grab them. */
.cs-annot-editor:not(.is-tool-select) [data-annot-id],
.cs-annot-editor:not(.is-tool-select) [data-annot-id] * { pointer-events: none; }
.cs-annot-editor.is-tool-select .cs-annot-shape > * { pointer-events: visiblePainted; cursor: move; }
.cs-annot-editor.is-tool-select .cs-annot-hit { pointer-events: stroke; }
.cs-annot-editor.is-tool-select .cs-annot-text,
.cs-annot-editor.is-tool-select .cs-annot-marker { cursor: move; user-select: none; }

.cs-annot-text.is-selected,
.cs-annot-marker.is-selected {
  outline: 1.5px dashed var(--color-info);
  outline-offset: 3px;
}
.cs-annot-editable {
  min-width: 1ch;
  outline: none;
  cursor: text;
  user-select: text;
}

.cs-annot-handle {
  position: absolute;
  z-index: 2;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  background: #fff;
  border: 1.5px solid var(--color-info);
  border-radius: 2px;
  cursor: nwse-resize;
}
.cs-annot-handle--width {
  left: 100%;
  top: 50%;
  cursor: ew-resize;
}

.cs-annot-toolbar {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(20, 20, 20, 0.08);
}
.cs-annot-swatches {
  display: inline-flex;
  gap: 5px;
  padding: 0 4px;
}
.cs-annot-swatch {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
}
.cs-annot-swatch.is-active {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Wire the editor into `CaseStudyArticle.jsx`.**

Import line becomes:

```jsx
import { AnnotationLayer, AnnotationEditor } from '../components/ImageAnnotations';
```

In `MediaEntry`, replace the layer line inside `.cs-annot-stage` with:

```jsx
          {annotating ? (
            <AnnotationEditor annotations={entry.annotations} onChange={onAnnotationsChange} onDone={onAnnotateDone} />
          ) : (
            listOf(entry.annotations).length > 0 && <AnnotationLayer annotations={entry.annotations} />
          )}
```

In `FigureBlock` (line ~500), directly after `const openLibrary = useContext(MediaLibraryContext);` add:

```jsx
  // Which media entry (index) is in annotation mode; -1 = none. One at a time.
  const [annotatingIdx, setAnnotatingIdx] = useState(-1);
```

Replace the grid-path `<MediaEntry entry={entry} tier={width} />` (line ~534) with:

```jsx
              ? <MediaEntry
                  entry={entry}
                  tier={width}
                  annotating={editing && annotatingIdx === i}
                  onAnnotationsChange={(list) => setEntry(i, { annotations: list })}
                  onAnnotateDone={() => setAnnotatingIdx(-1)}
                />
```

(The carousel path's `<MediaEntry entry={entry} tier={tier} />` in `ArticleCarousel` stays unchanged.)

In the per-entry tools (`.cs-article-figure-tools`), directly before the `border` toggle button, add:

```jsx
                {hasText(entry.src) && !hasText(entry.embedUrl) && block.display !== 'carousel' && (
                  <button type="button" className={`cs-article-mini-btn${annotatingIdx === i ? ' is-active' : ''}`}
                    title="Draw arrows, boxes, pen strokes and text on this image"
                    onClick={() => setAnnotatingIdx(annotatingIdx === i ? -1 : i)}>
                    {annotatingIdx === i ? 'done' : `annotate${listOf(entry.annotations).length ? ` (${listOf(entry.annotations).length})` : ''}`}
                  </button>
                )}
```

- [ ] **Step 5: Manual smoke in the browser** — `npm run dev`, open `/project/privacy-center-builder`, run `sessionStorage.setItem('editMode','true')` in the console, reload. On the Option 1 figure click `annotate (2)`: the toolbar appears above the image, the demo pill + arrow are selectable/movable; draw an arrow, a box, a pen stroke; place a Label, Card, Marker, Text; double-click the Label to edit; Delete removes the selected one; Done exits and the layer shows the result.
Expected: all of the above work with no console errors.

- [ ] **Step 6: Checkpoint** — `node --test src/data/annotations.test.mjs` and `npm run build` pass.

---

### Task 4: End-to-end browser verification

**Files:**
- Create (scratchpad only, not in the repo): `<scratchpad>/annot-e2e.mjs`

**Interfaces:**
- Consumes: DOM contract from Tasks 2–3 (`.cs-annot-*` classes, toolbar button labels, `annotate` button text).
- Produces: pass/fail report + screenshots in `<scratchpad>/shots/`.

- [ ] **Step 1: Write the e2e script** (playwright-core already installed in the scratchpad):

```js
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5173/project/privacy-center-builder';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/fetchpriority/i.test(m.text())) errors.push(m.text()); });

// Edit mode, fresh context → loads the JSON (dataVersion 2) into IndexedDB.
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => sessionStorage.setItem('editMode', 'true'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Target the Option 2 figure (no annotations yet): the image with option-2-toolbar.
const cell = page.locator('.cs-article-figure-cell', { has: page.locator('img[src*="option-2-toolbar"]') });
await cell.scrollIntoViewIfNeeded();
await cell.getByRole('button', { name: /^annotate/ }).click();
const surface = cell.locator('.cs-annot-editor');
await surface.waitFor();
const box = await surface.boundingBox();
const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
const drag = async (tool, from, to, steps = 8) => {
  await cell.locator('.cs-annot-toolbar').getByRole('button', { name: tool, exact: true }).click();
  await page.mouse.move(...at(...from));
  await page.mouse.down();
  await page.mouse.move(...at(...to), { steps });
  await page.mouse.up();
};
await drag('Arrow', [0.6, 0.6], [0.3, 0.3]);
await drag('Box', [0.05, 0.25], [0.35, 0.4]);
await drag('Pen', [0.5, 0.8], [0.7, 0.9], 20);
const place = async (tool, pos) => {
  await cell.locator('.cs-annot-toolbar').getByRole('button', { name: tool, exact: true }).click();
  await page.mouse.click(...at(...pos));
};
await place('Label', [0.4, 0.15]);
await page.keyboard.type('Users skipped this bar');
await page.keyboard.press('Enter');
await place('Marker', [0.1, 0.2]);
await place('Card', [0.65, 0.5]);
await page.keyboard.type('Title');
await page.keyboard.press('Escape');
await cell.locator('.cs-annot-toolbar').getByRole('button', { name: 'Done', exact: true }).click();
await page.waitForTimeout(1500); // let auto-save flush to IndexedDB

const countIn = (loc) => loc.evaluate((el) => ({
  svg: el.querySelectorAll('.cs-annot-shape').length,
  html: el.querySelectorAll('.cs-annot-text, .cs-annot-marker').length,
  label: [...el.querySelectorAll('.cs-annot-text--pill')].map((n) => n.textContent).join('|'),
}));
const before = await countIn(cell.locator('.cs-annot-layer'));
console.log('after editing', before);

// Persisted across reload (IndexedDB)
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const after = await countIn(page.locator('.cs-article-figure-cell', { has: page.locator('img[src*="option-2-toolbar"]') }).locator('.cs-annot-layer'));
console.log('after reload', after);
if (after.svg !== 3 || after.html !== 3 || !after.label.includes('Users skipped this bar')) errors.push('persistence mismatch');

// View mode: proportional placement at 1280 / 1440 / 1920, hidden at 390
await page.evaluate(() => sessionStorage.setItem('editMode', 'false'));
const fracs = [];
for (const width of [1280, 1440, 1920, 390]) {
  await page.setViewportSize({ width, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const fig = page.locator('.cs-article-figure', { has: page.locator('img[src*="option-1-fabs"]') });
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const r = await fig.evaluate((el) => {
    const img = el.querySelector('img').getBoundingClientRect();
    const layer = el.querySelector('.cs-annot-layer');
    const pill = el.querySelector('.cs-annot-text--pill');
    const pr = pill ? pill.getBoundingClientRect() : null;
    return {
      display: layer ? getComputedStyle(layer).display : 'missing',
      fx: pr ? (pr.left - img.left) / img.width : null,
      fy: pr ? (pr.top - img.top) / img.height : null,
    };
  });
  console.log(width, r);
  if (width === 390) { if (r.display !== 'none') errors.push('layer visible on mobile'); }
  else fracs.push(r);
  await page.screenshot({ path: `shots/annot-${width}.png` });
}
const spread = (k) => Math.max(...fracs.map((f) => f[k])) - Math.min(...fracs.map((f) => f[k]));
if (spread('fx') > 0.01 || spread('fy') > 0.01) errors.push(`pill drifts across widths: ${spread('fx')}, ${spread('fy')}`);

console.log(errors.length ? `FAIL\n${errors.join('\n')}` : 'PASS');
await browser.close();
process.exit(errors.length ? 1 : 0);
```

- [ ] **Step 2: Run it** — with `npm run dev` running: `node <scratchpad>/annot-e2e.mjs`
Expected: `PASS`; `after reload { svg: 3, html: 3, label: 'Users skipped this bar' }`; `390 { display: 'none', … }`.

- [ ] **Step 3: Revert the e2e test's edits** — they live only in the headless browser's IndexedDB (fresh context), so the committed JSON still has only the demo annotation. Confirm: `grep -c "an-demo" src/data/case-studies/privacy-center-builder.json` → `2`, and no `Users skipped this bar` in the file.

- [ ] **Step 4: Visual check** — open `shots/annot-1440.png` and `shots/annot-1920.png`: the demo pill and arrow sit at the same spot on the Option 1 image in both.

- [ ] **Step 5: Final checkpoint** — `node --test src/data/annotations.test.mjs`, `npm run build`. Leave changes uncommitted; report files changed.
