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

/* ── Curved arrows, tone callouts, error color ─────────────────────── */

import {
  curvedArrowGeometry, bendControl, arrowMid, straightenArrow, finalizeCallout, draftPreview,
} from './annotations.js';

test('resolveColor knows the error token', () => {
  assert.equal(resolveColor('error'), 'var(--color-error)');
});

test('normalizeAnnotations keeps an arrow bend and allows it past the edges', () => {
  const [a] = normalizeAnnotations([{ id: 'a', kind: 'arrow', x1: 0.1, y1: 0.1, x2: 0.5, y2: 0.1, cx: 0.3, cy: -0.4 }]);
  assert.equal(a.cx, 0.3);
  assert.equal(a.cy, -0.4);
  const [b] = normalizeAnnotations([{ id: 'b', kind: 'arrow', x1: 0.1, y1: 0.1, x2: 0.5, y2: 0.1, cx: 5, cy: 0.2 }]);
  assert.equal(b.cx, 2);
  const [c] = normalizeAnnotations([{ id: 'c', kind: 'arrow', x1: 0.1, y1: 0.1, x2: 0.5, y2: 0.1 }]);
  assert.equal('cx' in c, false);
});

test('normalizeAnnotations accepts positive and negative label styles', () => {
  const out = normalizeAnnotations([
    { id: 'p', kind: 'text', style: 'positive', x: 0.5, y: 0.5, text: 'Found it' },
    { id: 'n', kind: 'text', style: 'negative', x: 0.5, y: 0.5, text: 'Missed it' },
  ]);
  assert.deepEqual(out.map((a) => a.style), ['positive', 'negative']);
});

test('curvedArrowGeometry on a straight control matches the straight arrow', () => {
  const g = curvedArrowGeometry({ x1: 0, y1: 0.5, x2: 1, y2: 0.5, cx: 0.5, cy: 0.5 }, 100, 100, 10);
  assert.equal(g.d, 'M0 50 Q45 50 90 50');
  assert.deepEqual(g.head, [[100, 50], [90, 55.5], [90, 44.5]]);
});

test('bendControl bulges upward, arrowMid sits on the curve', () => {
  const a = { x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
  assert.deepEqual(bendControl(a), { cx: 0.5, cy: 0.3 });
  assert.deepEqual(arrowMid(a), [0.5, 0.5]);
  assert.deepEqual(arrowMid({ ...a, cx: 0.5, cy: 0.1 }), [0.5, 0.3]);
});

test('bend handle drags the curve midpoint; straightenArrow drops the bend', () => {
  const a = { kind: 'arrow', x1: 0, y1: 0.5, x2: 1, y2: 0.5 };
  const bent = resizeAnnotation(a, 'bend', 0.5, 0.3);
  assert.deepEqual([bent.cx, bent.cy], [0.5, 0.1]);
  assert.deepEqual(straightenArrow(bent), a);
});

test('moveAnnotation carries the bend with the arrow', () => {
  const a = { id: 'a', kind: 'arrow', x1: 0.2, y1: 0.5, x2: 0.6, y2: 0.5, cx: 0.4, cy: 0.3, color: 'accent' };
  const moved = moveAnnotation(a, 0.1, 0.1);
  assert.deepEqual([moved.x1, moved.x2, moved.cx, moved.cy], [0.3, 0.7, 0.5, 0.4]);
});

test('positive/negative labels are centred for bounds and width resize', () => {
  const t = { kind: 'text', style: 'positive', x: 0.5, y: 0.5, w: 0.2 };
  assert.deepEqual(annotationBounds(t), { x: 0.4, y: 0.5, w: 0.2, h: 0 });
  assert.equal(resizeAnnotation(t, 'width', 0.7, 0.5).w, 0.4);
});

test('finalizeCallout: a click makes a label, a drag adds an arrow to the target', () => {
  const click = finalizeCallout({ kind: 'callout', tone: 'negative', x1: 0.3, y1: 0.3, x2: 0.305, y2: 0.3 });
  assert.equal(click.length, 1);
  assert.deepEqual([click[0].kind, click[0].style, click[0].color], ['text', 'negative', 'error']);
  const drag = finalizeCallout({ kind: 'callout', tone: 'positive', x1: 0.2, y1: 0.2, x2: 0.6, y2: 0.5 });
  const arrow = drag.find((a) => a.kind === 'arrow');
  const label = drag.find((a) => a.kind === 'text');
  assert.deepEqual([arrow.x1, arrow.y1, arrow.x2, arrow.y2, arrow.color], [0.6, 0.5, 0.2, 0.2, 'success']);
  assert.deepEqual([label.x, label.y, label.style], [0.6, 0.5, 'positive']);
});

test('draftPreview renders a curve draft bent and a callout draft as arrow + label', () => {
  const [curve] = draftPreview({ kind: 'arrow', curved: true, x1: 0, y1: 0.5, x2: 1, y2: 0.5, color: 'ink' });
  assert.deepEqual([curve.cx, curve.cy, 'curved' in curve], [0.5, 0.3, false]);
  const call = draftPreview({ kind: 'callout', tone: 'positive', x1: 0.2, y1: 0.2, x2: 0.6, y2: 0.5 });
  assert.deepEqual(call.map((a) => a.kind), ['arrow', 'text']);
  assert.equal(new Set(call.map((a) => a.id)).size, 2);
});

/* ── Box border/fill styles, callout icon toggle ────────────────────── */

import { BOX_BORDERS, BOX_FILLS } from './annotations.js';

test('box border/fill styles are kept when valid and dropped when not', () => {
  assert.deepEqual(BOX_BORDERS, ['color', 'gray', 'none']);
  assert.deepEqual(BOX_FILLS, ['none', 'white', 'gray', 'accent', 'ink', 'success', 'error', 'info', 'warning', 'tint']);
  const [styled, plain] = normalizeAnnotations([
    { id: 's', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, border: 'gray', fill: 'tint' },
    { id: 'p', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, border: 'dotted', fill: 'plaid' },
  ]);
  assert.deepEqual([styled.border, styled.fill], ['gray', 'tint']);
  assert.equal('border' in plain, false);
  assert.equal('fill' in plain, false);
});

test('positive/negative labels can hide their icon', () => {
  const [off, on] = normalizeAnnotations([
    { id: 'a', kind: 'text', style: 'positive', x: 0.5, y: 0.5, text: 'x', icon: false },
    { id: 'b', kind: 'text', style: 'negative', x: 0.5, y: 0.5, text: 'x' },
  ]);
  assert.equal(off.icon, false);
  assert.equal('icon' in on, false);
});

/* ── Box fill colors + box text ─────────────────────────────────────── */

import { boxFillPaint } from './annotations.js';

test('warning is a color token', () => {
  assert.equal(resolveColor('warning'), 'var(--color-warning)');
});

test('boxFillPaint resolves every fill option', () => {
  assert.deepEqual(boxFillPaint({ fill: 'none', color: 'accent' }), { fill: 'none', opacity: 1 });
  assert.deepEqual(boxFillPaint({ color: 'accent' }), { fill: 'none', opacity: 1 });
  assert.equal(boxFillPaint({ fill: 'white', color: 'accent' }).fill, 'rgba(255, 255, 255, 0.6)');
  assert.deepEqual(boxFillPaint({ fill: 'success', color: 'accent' }), { fill: 'var(--color-success)', opacity: 0.18 });
  assert.deepEqual(boxFillPaint({ fill: 'tint', color: 'info' }), { fill: 'var(--color-info)', opacity: 0.18 });
  assert.equal(boxFillPaint({ fill: 'gray', color: 'accent' }).fill, 'var(--color-text-muted)');
});

test('boxes keep a text label; blank labels are dropped', () => {
  const [a, b] = normalizeAnnotations([
    { id: 'a', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, label: 'Form steps' },
    { id: 'b', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, label: '   ' },
  ]);
  assert.equal(a.label, 'Form steps');
  assert.equal('label' in b, false);
});

/* ── Note callouts + mobile notes list ──────────────────────────────── */

import { annotationNotes } from './annotations.js';

test('note is a text style with its own default width', () => {
  const [n] = normalizeAnnotations([{ id: 'n', kind: 'text', style: 'note', x: 0.1, y: 0.1, text: 'Hidden in dialogs' }]);
  assert.equal(n.style, 'note');
  assert.equal(n.w, 0.24);
});

test('annotationNotes lists readable text top-to-bottom for the mobile fallback', () => {
  const notes = annotationNotes([
    { id: 'b', kind: 'text', style: 'negative', x: 0.5, y: 0.8, text: 'Missed it' },
    { id: 'a', kind: 'text', style: 'note', x: 0.2, y: 0.1, text: 'Blended with settings', color: 'error' },
    { id: 'c', kind: 'box', x: 0.1, y: 0.4, w: 0.2, h: 0.2, label: 'Form steps' },
    { id: 'd', kind: 'arrow', x1: 0, y1: 0, x2: 0.5, y2: 0.5 },
    { id: 'e', kind: 'marker', x: 0.9, y: 0.4, text: '2' },
  ]);
  assert.deepEqual(notes.map((n) => n.text), ['Blended with settings', 'Form steps', 'Missed it']);
  assert.deepEqual(notes.map((n) => n.tone), ['', '', 'negative']);
  assert.equal(notes[0].color, 'error');
});

/* ── Note look options + box text style ─────────────────────────────── */

import { NOTE_BGS, BOX_LABEL_STYLES } from './annotations.js';

test('notes keep shadow/background/border options; defaults are omitted (shadow is OFF by default)', () => {
  assert.deepEqual(NOTE_BGS, ['white', 'tint', 'none']);
  const [custom, plain, bad, legacyOff] = normalizeAnnotations([
    { id: 'a', kind: 'text', style: 'note', x: 0.1, y: 0.1, text: 'x', shadow: true, bg: 'none', border: false },
    { id: 'b', kind: 'text', style: 'note', x: 0.1, y: 0.1, text: 'x', bg: 'white', border: true },
    { id: 'c', kind: 'text', style: 'pill', x: 0.1, y: 0.1, text: 'x', shadow: true, bg: 'none' },
    { id: 'd', kind: 'text', style: 'note', x: 0.1, y: 0.1, text: 'x', shadow: false },
  ]);
  assert.deepEqual([custom.shadow, custom.bg, custom.border], [true, 'none', false]);
  assert.deepEqual(['shadow' in plain, 'bg' in plain, 'border' in plain], [false, false, false]);
  assert.deepEqual(['shadow' in bad, 'bg' in bad], [false, false]);
  assert.equal('shadow' in legacyOff, false);
});

test('box text style is kept when not the default', () => {
  assert.deepEqual(BOX_LABEL_STYLES, ['filled', 'note', 'plain']);
  const [a, b] = normalizeAnnotations([
    { id: 'a', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, label: 'x', labelStyle: 'note' },
    { id: 'b', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, label: 'x', labelStyle: 'filled' },
  ]);
  assert.equal(a.labelStyle, 'note');
  assert.equal('labelStyle' in b, false);
});

/* ── Brand palette (maps green/red onto the brand chip colors) ───────── */

import { paletteColor } from './annotations.js';

test('brand palette maps success → accent and error → ink; others unchanged', () => {
  assert.equal(paletteColor('success', 'brand'), 'accent');
  assert.equal(paletteColor('error', 'brand'), 'ink');
  assert.equal(paletteColor('info', 'brand'), 'info');
  assert.equal(paletteColor('success'), 'success');
  assert.equal(resolveColor('error', 'brand'), '#22211f');
  assert.equal(resolveColor('success', 'brand'), 'var(--color-accent)');
  assert.equal(resolveColor('success'), 'var(--color-success)');
});

test('annotationNotes reports palette-mapped colors', () => {
  const [n] = annotationNotes([{ id: 'a', kind: 'text', style: 'note', x: 0.1, y: 0.1, text: 'Works', color: 'success' }], 'brand');
  assert.equal(n.color, 'accent');
});

/* ── Fixed green/red swatches (not remapped by the brand palette) ────── */

import { SWATCH_COLORS } from './annotations.js';

test('fixed green/red stay green/red under the brand palette; semantic ones remap', () => {
  assert.deepEqual(SWATCH_COLORS, ['accent', 'ink', 'green', 'red', 'info', 'warning', 'white']);
  assert.equal(resolveColor('green', 'brand'), 'var(--color-success)');
  assert.equal(resolveColor('red', 'brand'), 'var(--color-error)');
  assert.equal(resolveColor('success', 'brand'), 'var(--color-accent)');
  const [a] = normalizeAnnotations([{ id: 'g', kind: 'box', x: 0.1, y: 0.1, w: 0.2, h: 0.2, color: 'green' }]);
  assert.equal(a.color, 'green');
});
