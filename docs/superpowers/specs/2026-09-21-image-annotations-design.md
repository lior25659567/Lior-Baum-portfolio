# Image annotations for article figures — design

Date: 2026-09-21 · Status: approved in chat · Scope: **article view only**

## Goal

Let the designer draw on top of any article figure image or video — arrows, highlight
boxes, freehand pen, and design-system text templates — the way case-study sites
annotate screenshots with positioned text and arrows. Annotations are editable in edit
mode, persist with the case study, and render on desktop in the public article.

## Non-goals (v1)

- Slides / deck view (`CaseStudy.jsx`, `DynamicImages`) — data format allows it later.
- Carousel figures (`display: 'carousel'`) — no Annotate button, no overlay.
- Curved arrows, rotation, grouping, undo history beyond delete, z-order controls.
- Mobile rendering — hidden below 1024px.

## Behaviour

### Edit mode
- Every figure media entry with a `src` (image or video) gets an **Annotate** button in
  the existing per-entry figure tools (`.cs-article-figure-tools`). Embeds (`embedUrl`)
  are excluded — their scroll shield and iframe conflict with an overlay.
- Annotate toggles that entry into annotation mode **in place**. A floating toolbar
  appears above the media; clicking **Done** (or Esc) exits. Only one entry is in
  annotation mode at a time. While annotating, the image lightbox/zoom click is
  suppressed.
- Tools:
  1. **Select** — click to select; drag to move; handles resize text boxes and boxes;
     Delete/Backspace removes; Alt+drag duplicates.
  2. **Arrow** — press-drag-release draws a straight arrow start→end.
  3. **Box** — press-drag-release draws a rectangle outline.
  4. **Pen** — freehand; points are smoothed on release.
  5. **Text templates** — click to place:
     - `pill` — short label tag
     - `card` — callout card (bold first line = title, rest = body)
     - `marker` — numbered circle (auto-increments 1, 2, 3…)
     - `plain` — bare text
- Double-click a text/card/pill/marker to edit its text inline (`contentEditable`,
  commit on blur/Enter/Esc; Shift+Enter newline for card/plain). Double-click is
  detected from two presses within 350ms on the same item (pointer capture retargets
  native `dblclick` to the surface).
- Color swatches: `accent`, `ink`, `success`, `info`, `white` — applied to the selected
  annotation, and used for the next one drawn.

### View mode
- Overlay renders when the viewport is **≥ 1024px**; hidden below (`@media`).
- Positions are fractions of the media box, so annotations stay pinned at any width.
- Text size, stroke width, arrowheads and marker size scale with the media width: the
  overlay measures its box with a ResizeObserver, draws SVG in real pixels, and sets
  `--annot-u` (1% of the media width, px) for text sizing — so proportions match
  between 1024px and 2560px viewports. Text has a 10px floor for legibility.
- Shapes are decorative (`aria-hidden` on the SVG); text annotations are real DOM text.

## Data model

Stored on the media entry inside a figure block, alongside `src`:

```json
{
  "src": "/case-studies/privacy-center-builder/old-builder.webp",
  "annotations": [
    { "id": "a1", "kind": "arrow",  "x1": 0.42, "y1": 0.30, "x2": 0.61, "y2": 0.55, "color": "accent" },
    { "id": "a2", "kind": "text",   "style": "pill", "x": 0.65, "y": 0.52, "w": 0.18, "text": "But it was here", "color": "accent" },
    { "id": "a3", "kind": "box",    "x": 0.05, "y": 0.10, "w": 0.20, "h": 0.40, "color": "success" },
    { "id": "a4", "kind": "pen",    "points": [[0.10, 0.20], [0.12, 0.22]], "color": "ink" },
    { "id": "a5", "kind": "marker", "x": 0.30, "y": 0.40, "text": "1", "color": "accent" }
  ]
}
```

- All coordinates are 0–1 fractions of the rendered media box (clamped on write).
- `kind: "text"` carries `style` ∈ `pill | card | plain`; `w` is the box width fraction
  (height is content-driven).
- `color` is a token name: `accent` → `var(--color-accent)`, `success` →
  `var(--color-success)`, `info` → `var(--color-info)`, `ink` → `#22211f` (fixed, so it
  stays dark on screenshots in dark theme), `white` → `#ffffff`. Unknown names fall
  back to `accent`.
- Unknown `kind`s are dropped by `normalizeAnnotations`.
- Pen `points` are rounded to 4 decimals to keep the JSON small.

Persistence rides the existing article flow: `FigureBlock` → `onPatch({ media })` →
auto-save (IndexedDB) → Save to Code. `extractAndSaveMedia` only rewrites media
`src` values, and `scripts/case-study-text.mjs` does not read `article`, so neither
needs changes.

## Architecture

| Unit | Responsibility | Depends on |
|---|---|---|
| `src/data/annotations.js` | Pure helpers: `normalizeAnnotations`, `clamp01`, `newAnnotationId`, `smoothPoints`, `pointsToPath`, `arrowGeometry`, `annotationBounds`, `moveAnnotation`, `resizeAnnotation`, `draftToAnnotation`, `finalizeDraft`, `nextMarkerNumber`, `COLOR_TOKENS`, `resolveColor` | nothing |
| `src/data/annotations.test.mjs` | `node --test` unit tests for the helpers | `annotations.js` |
| `src/components/ImageAnnotations.jsx` | `AnnotationLayer` (read-only render) and `AnnotationEditor` (toolbar + pointer handling, wraps the layer) | `annotations.js` |
| `src/components/ImageAnnotations.css` | Overlay, templates, toolbar, `--annot-u` sizing, ≥1024px gate | tokens in `index.css` |
| `src/pages/CaseStudyArticle.jsx` (small edit) | `MediaEntry` wraps media in a positioned container and renders the layer/editor; `FigureBlock` adds the Annotate toggle and passes `onChange` for that entry | above |

Rendering: `MediaEntry` wraps the `<img>`/`<video>` in a `position: relative` stage;
one absolutely positioned overlay (`inset: 0`) sits on it. Arrows, boxes and pen strokes
are one `<svg>` whose viewBox equals the measured pixel size (no distortion of
arrowheads); stroke width = `max(1.5px, 0.28% of width)`. Text/pill/card/marker are
absolutely positioned HTML elements (`left/top/width` in %). Pointer math converts
client coordinates to fractions via the overlay's `getBoundingClientRect()`.

## Error handling

- Malformed or missing `annotations` → treated as `[]`; invalid items dropped by
  `normalizeAnnotations`.
- Drags that end with ~zero size (arrow/box under 1% of the box) are discarded.
- Empty text on blur deletes a text annotation.

## Testing

- Unit: `node --test src/data/annotations.test.mjs` — normalize/clamp/drop-invalid,
  smoothing keeps endpoints, arrowhead geometry, marker numbering, color fallback.
- Browser (headless Chrome via playwright-core in the scratchpad): in edit mode add one
  of each kind on a privacy-center-builder figure, reload, confirm persisted; view mode
  at 1280/1440/1920 — overlay element positions match as fractions of the image rect
  (±1%); at 390px overlay is `display: none`; no console errors.
- `npm run build` passes.
