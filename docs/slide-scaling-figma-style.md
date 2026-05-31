# Figma-Style Case Study Slide Scaling

## The request

Make portfolio case study slides behave like Figma/Canva slides — always look
identical no matter the screen size. No layout shifts, no reflowing content, no
breakpoints inside slides. Same slide scaled proportionally to fit the screen
width. Base canvas: **1920 × 1080**.

(Original prompt preserved verbatim in `docs/slide-scaling-figma-style.prompt.md`.)

## Backup

Pre-change state preserved on branch `backup/pre-slide-scaling`.

```bash
git switch backup/pre-slide-scaling   # to return to the pre-change state
git switch main                       # to come back to the new code
```

No case study content, images, videos, JSON, or media files were removed or
modified by this change. Only layout/scaling CSS + the scaler JS were touched.

---

## Audit of the existing system (before changes)

The repo already has a sophisticated slide-scaling system. The prompt assumed a
green-field implementation; this audit maps the prompt's spec onto what was
already in place.

| Prompt spec | Already present in repo? | Where |
|---|---|---|
| `transform: scale()` (not `zoom`) | ✅ Yes | `src/pages/CaseStudy.css:533` |
| `transform-origin: top left` | ✅ Yes | `src/pages/CaseStudy.css:534` |
| Scaling driven by JS | ✅ Yes | `src/pages/CaseStudy.jsx:1559` (`fitSlide` effect) |
| `ResizeObserver` on a container | ✅ Yes | `src/pages/CaseStudy.jsx:1639` (observes `.case-study-slides-wrapper`) |
| Container height updated alongside scale | ✅ Yes (via `data-fit-active`) | `src/pages/CaseStudy.css:547` |
| Mobile zoom mode | ✅ Yes — different mechanism | `react-zoom-pan-pinch` `TransformWrapper` around `.slide-design` (1440×810 artboard), with `showZoomHint` UI |
| Fixed `1920×1080` canvas | ❌ Partial | `.slide` is `100dvh` tall, not a fixed-aspect canvas |
| Width-driven scale-up on wide screens | ❌ Missing | `fitSlide` only scales **down** on overflow; on wide viewports content stays at natural size |
| Zero `@media` queries inside slides | ❌ ~17 queries inside `CaseStudy.css` | various |
| All slide units in `px` | ❌ ~2,970 `rem`/`em`/`vw`/`vh` occurrences | various |

### Why the existing system isn't quite "Figma-style"

- `.slide` height is `100dvh`, so on a tall window the slide stretches; on a
  short window it shrinks. The aspect ratio is whatever the browser viewport is,
  not always 16:9.
- `--fit-scale-slide` only kicks in when content **overflows**; it never scales
  **up** to make small text bigger on a 2560-wide monitor.
- The `clamp()` tokens (`--slide-pad-x`, `--slide-pad-top`, `--rhythm-*`,
  `--card-min`, etc.) and the inner `rem`/`em`/`vw`/`vh` units mean elements
  reflow subtly as the viewport changes — not the layout-frozen behavior the
  prompt asks for.

### Why a literal rewrite was rejected

A literal execution of the prompt would require:

- Removing all 17 in-slide `@media` queries (some are mixed with page-level
  rules like `touch-action` on `.case-study` and edit-mode neutralization at
  line 5442 — blind removal breaks the editor and the site-embed mode).
- Converting ~2,970 unit occurrences from `rem`/`em`/`vw`/`vh` to `px` — every
  one would need hand-checking because rem-token cascade vs px values differs.
- Replacing `--fit-scale-slide` with a new `scaleSlide(slideEl, containerEl)`
  utility, which would break the edit panel, the mobile `.slide-design`
  artboard, and the `CaseStudy.site.css` "scroll page" override mode.

The user-approved approach was **audit first, then minimal patches** — close
the real gaps without rewriting the working machinery.

---

## Chosen behavior

User chose **true Figma 1920×1080 canvas mode** (per the prompt) over keeping
the current `100dvh`-filling deck.

Tradeoff accepted:
- On viewports wider than 16:9, slides letterbox top/bottom (black bars).
- On viewports narrower than 16:9, slides letterbox left/right.
- In return, every element holds its exact 1920px-coordinate position at every
  viewport width — true Figma/Canva behavior.

## Concrete patches required to deliver Figma canvas mode

These are the **exact** changes needed. They were not applied in a single shot
because the horizontal slide-deck transform interacts with the canvas dimensions
and needs browser-verified tuning.

### Patch 1 — `src/pages/CaseStudy.css`

Replace the existing `.slide` block (line ~398) and the view-mode
`.case-study:not(.edit-mode) .slide-inner` block (line ~513).

```css
/* New: container that owns the deck row's visible area and holds the scaled
   canvas centered inside it. flex: 0 0 100% keeps the existing horizontal
   slide-deck (slides-track transform) working unchanged. */
.case-study:not(.edit-mode) .slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  padding: 0;
  /* --slide-canvas-scale driven by JS = min(containerWidth/1920, containerHeight/1080) */
  --slide-canvas-scale: 1;
}

/* The fixed-canvas slide artboard. Always 1920×1080. Transformed to fit. */
.case-study:not(.edit-mode) .slide > .slide-inner {
  width: 1920px;
  height: 1080px;
  max-width: none;
  max-height: none;
  min-height: 0;
  transform: scale(var(--slide-canvas-scale));
  transform-origin: center center;
  flex: 0 0 auto;
}

/* Edit mode keeps the existing fluid layout unchanged. */
```

### Patch 2 — `src/pages/CaseStudy.jsx` (replace the `fitSlide` effect, line ~1552–1660)

```jsx
useEffect(() => {
  if (editMode) return; // edit mode keeps fluid layout

  const SLIDE_W = 1920;
  const SLIDE_H = 1080;

  const scaleAll = () => {
    const slides = document.querySelectorAll('.case-study-slides-wrapper .slide');
    slides.forEach((slideEl) => {
      const w = slideEl.clientWidth;
      const h = slideEl.clientHeight;
      if (!w || !h) return;
      const scale = Math.min(w / SLIDE_W, h / SLIDE_H);
      slideEl.style.setProperty('--slide-canvas-scale', String(scale));
    });
  };

  scaleAll();
  const wrapper = document.querySelector('.case-study-slides-wrapper');
  const ro = wrapper ? new ResizeObserver(scaleAll) : null;
  if (ro && wrapper) ro.observe(wrapper);
  window.addEventListener('resize', scaleAll);
  const vv = window.visualViewport;
  if (vv) vv.addEventListener('resize', scaleAll);

  return () => {
    if (ro) ro.disconnect();
    window.removeEventListener('resize', scaleAll);
    if (vv) vv.removeEventListener('resize', scaleAll);
  };
}, [editMode, project]);
```

### Patch 3 — Remove in-slide `@media` queries (optional, only when fully testing)

The in-slide `@media` queries at lines 343, 353, 367, 376, 388, 2293+, etc.,
become unnecessary once the canvas is fixed. **Do not remove them yet** —
remove them only after verifying the canvas mode works in the browser, and
remove them one at a time, checking each removal doesn't break edit mode or
the site-embed override.

### Patch 4 — Mobile (`.slide-design` artboard)

The existing `.slide-design` artboard at 1440×810 inside `react-zoom-pan-pinch`
becomes redundant with canvas mode. Recommended: keep the `TransformWrapper`
for pan/zoom on mobile but point it at `.slide > .slide-inner` (the new
1920×1080 artboard) instead of the separate `.slide-design` element. Remove
all `.slide-design`-specific CSS once verified.

---

## Why these weren't applied in one shot

- The horizontal slide-deck moves between slides via `transform: translateX(-N * 100%)` on `.slides-track`. With canvas mode, each `.slide` still occupies 100% of the deck row visually, but the artboard inside is letterboxed — needs browser verification that swipe/click navigation still feels right.
- Edit mode (`.case-study.edit-mode .slide`) has its own layout assumptions tied to fluid clamps; the patches above scope canvas mode to `:not(.edit-mode)` so edit mode is preserved, but edit-mode visual consistency with view mode needs eyeballing.
- The `CaseStudy.site.css` site-embed override mode switches the deck into a vertical scroll; canvas mode plays differently there and the site-embed override may need a sibling patch.
- Removing 17 in-slide `@media` queries safely requires testing edit mode and site-embed mode after each removal — a one-shot diff cannot verify them.

## Recommended next session

1. Apply Patches 1 + 2 only.
2. `npm run dev`, open a case study, resize 375 → 2560 — confirm slides letterbox correctly and content stays at exact 1920px-coordinate positions.
3. Test edit mode — confirm edit panel and editor still work (they should, since canvas mode is `:not(.edit-mode)` scoped).
4. Test mobile pan/zoom.
5. Test site-embed mode.
6. Only then: apply Patch 3 (media query removal) and Patch 4 (mobile cleanup) incrementally.

## Patches applied THIS SESSION

- Backup branch `backup/pre-slide-scaling` created at pre-change HEAD
- **Canvas mode CSS** (`src/pages/CaseStudy.css` lines ~523–620): `.slide-inner` is now a fixed 1920×1080 artboard, absolute-positioned at the safe-area center (between case-nav top overlay and slide-nav-pill bottom overlay), with `transform: scale(--slide-canvas-scale)` for fit.
- **Canvas mode JS scaler** (`src/pages/CaseStudy.jsx` lines ~1552–1620): replaces the old overflow-based `--fit-scale-slide` system. Computes `scale = min(slideWidth / 1920, (slideHeight - safe-top - safe-bottom) / 1080)` and writes `--slide-canvas-scale` on each `.slide`. ResizeObserver on the slides wrapper + visualViewport.resize listener cover all resize sources.
- **Typography system** (`src/pages/CaseStudy.css` top of file): presentation-standard 8-tier scale — display 96, title 56, h2 40, h3 28, body 24, lead 28, caption 20, meta 16 — plus leading/tracking/weight vars.
- **Canvas-mode typography overrides**: comprehensive override layer mapping all major visible text classes to the scale with explicit line-height + letter-spacing + 400/500 weights. Eyebrows at meta (16px uppercase); pull quotes at body-lg (28px).

No content (text, images, videos, JSON) was modified or removed.

## Typography class coverage (all 24 slide types)

The canvas-mode override layer maps these class families to the 8-size presentation-standard scale (1920×1080 canvas):

| Slide type | DISPLAY 96 | TITLE 56 | H2 40 | H3 28 | BODY 24 | LEAD 28 | CAPTION 20 | META 16 |
|---|---|---|---|---|---|---|---|---|
| **intro** | `intro-metric-value` | `intro-title` | — | `intro-metric-label` | `intro-subtitle`, `intro-meta-value` | `intro-description` | `intro-metric-context` | `intro-meta-label`, `intro-label` |
| **chapter** | `chapter-bg-number`, `chapter-number` | `chapter-title` | `chapter-subtitle` | — | — | — | — | — |
| **end** | — | `end-title`, `pdf-export-title` | — | — | `end-contact-value` | `end-subtitle` | — | — |
| **goals** | `goals-showcase-number` | `goals-title`, `goals-showcase-title`, `achieve-goals-title` | `goal-title` | `goal-card-title`, `kpi-title`, `achieve-goals-column-title`, `goal-title-text`, `goal-number`, `step-number` | `goal-card-description`, `kpi-description`, `goal-description`, `goal-content`, `achieve-goal-text` | `goals-showcase-description` | `goals-showcase-highlight`, `achieve-goals-highlight` | `goals-cards-label`, `kpis-label` |
| **problem** | — | `problem-title` | — | — | — | `problem-text` | `problem-highlight` | `slide-label` |
| **process** | — | `process-title` | — | `process-step-title`, `step-title`, `step-number` | `process-step-description`, `step-description`, `step-content` | — | — | `process-step-label` |
| **outcomes** | — | `outcomes-title` | — | `outcome-card-title` | `outcome-card-description` | — | — | `outcome-card-label`, `outcomes-toggle-label` |
| **stats** | `stat-value`, `stat-suffix` | `stats-title` | — | `stat-label` | — | — | `stat-context` | — |
| **tools** | — | `tools-title` | — | `tool-card-title` | `tool-card-description` | — | `tools-highlight` | `tool-card-label` |
| **timeline** | — | `timeline-title` | — | `timeline-item-title` | `timeline-item-description` | — | `timeline-highlight` | `timeline-step-label` |
| **info** | `info-metric-value` | `info-title` | — | `info-card-title`, `info-metric-label`, `info-methodology-name`, `info-phase-name` | `info-description`, `info-card-description`, `info-value`, `info-phase-desc` | `info-intro-hook` | `info-highlight`, `info-metric-context` | `info-label`, `info-methodology-eyebrow`, `info-phase-num` |
| **context** | — | `context-title` | — | — | — | `context-text` | — | — |
| **define** | — | `define-title` | `define-col-title` | `define-cluster-theme` | `define-criterion`, `criterion-metric` | `define-pov` | — | `define-constraints-label`, `define-constraint-chip` |
| **comparison** | — | `comparison-title` | — | — | `comparison-side-description` | — | — | `comparison-mode-label` |
| **feature** | — | — | — | — | — | `feature-description` | — | — |
| **ideation** | — | `ideation-title` | — | `ideation-card-name`, `ideation-chosen-name` | `ideation-tradeoffs`, `ideation-chosen-rationale` | — | — | `ideation-chosen-label`, `ideation-tradeoffs-label` |
| **impact** | `impact-headline-value`, `ratio-value` | `impact-title` | — | — | `impact-support-value` | `impact-quote p` | `impact-headline-context` | `impact-headline-label`, `impact-support-label`, `impact-label`, `ratio-label`, `impact-quote footer` |
| **iteration** | — | `iteration-title` | — | `iteration-version` | `iteration-pivot` | — | — | `iteration-pivot-label`, `iteration-version-tag`, `iteration-version-meta` |
| **media** | — | `image-title`, `video-title`, `twi-title`, `dyn-title` | — | `dyn-subtitle` | `twi-image-description`, `preview-description` | — | `image-caption`, `figure-caption`, `split-image-caption`, `carousel-caption`, `dyn-image-caption`, `dynamic-image-caption`, `twi-caption`, `wireframe-caption`, `video-caption` | — |
| **problem-bullets** | — | — | — | — | (li covered globally) | — | `bullets-section-title`, `twi-image-bullets-title` | — |
| **quotes** | — | `quotes-title` | `quote-author`, `author-name` | — | — | `quote-text` | `quotes-highlight` | — |
| **reflection** | — | `reflection-title` | — | — | `reflection-learned` | — | `reflection-footnote` | `reflection-learned-label` |
| **testimonial** | — | — | `author-name` | — | `testimonial-context` | `testimonial-quote` | — | `author-role` |
| **testing** | — | `testing-title` | — | — | — | — | `testing-highlight` | — |
| **wireframes** | — | `wireframes-title` | — | — | — | — | `wireframe-caption` | — |
| **project-showcase** | `project-showcase-number` | `project-showcase-title` | — | `project-showcase-subtitle`, `ps-subtitle` | — | `project-showcase-description` | `project-showcase-highlight` | `project-showcase-tag`, `project-showcase-header-mode-label`, `ps-col-label`, `ps-solution-label`, `showcase-desc-label` |
| **showcase** (generic) | `goals-showcase-number` | `showcase-title`, `goals-showcase-title` | — | — | — | `showcase-description`, `goals-showcase-description` | `showcase-highlight`, `goals-showcase-highlight` | — |
| **issues-breakdown** | — | `issues-breakdown-title`, `key-screens-title` | `mosaic-title-badge` | `issues-breakdown-subtitle`, `issues-breakdown-cards-title`, `issue-breakdown-heading` | `issues-breakdown-description-wrapper` | — | `issues-breakdown-highlight` | `mosaic-manager-label` |

Plus global selectors: `h1`/`h2`/`h3`/`h4`, `p`, `li`, `strong`, `b`, `.dynamic-bullets li`.

If a class isn't in the table and isn't a standard HTML element, it's not yet in the override layer. Tell me the class name and I'll add it.

## Known gaps / follow-up work

- **In-file `rem`/`em`/`vw`/`clamp()` not removed.** ~2,970 unit occurrences remain in `CaseStudy.css`. They are *overridden in view mode* by the canvas-mode typography layer for the classes covered, so visible behavior matches the scale. But they're still in the source and would re-emerge if/when classes are added that the override layer doesn't catch. A full sweep replacing each with the appropriate scale variable is a separate multi-session refactor.
- **17 in-slide `@media` queries not removed.** Several are doing real work (mobile artboard, edit-mode neutralization, short-viewport caps). Safe removal needs per-query browser verification.
- **Edit mode unchanged.** All canvas-mode overrides are scoped to `:not(.edit-mode)` so the editor continues to use the original fluid-clamp system.
- **CaseStudy.site.css (site-embed override mode) not touched.** Site-embed scroll-page mode may interact oddly with the new canvas-mode positioning — needs verification if you use that mode.
- **Mobile `react-zoom-pan-pinch` artboard (`.slide-design`)** not yet aligned with the new canvas. The mobile UX may behave differently from desktop.

## How to test once patches are applied

```bash
npm run dev
# visit any case study, e.g. /case-study/wizecare
# resize the browser from 375px → 2560px wide
# expect: slide content scales proportionally, layout positions stay constant
# letterboxing appears top/bottom on aspect ratios wider than 16:9
# on mobile (≤768px): pinch / double-tap to zoom into the slide
```

## Rollback

If the canvas-mode patches misbehave in the browser:

```bash
git switch backup/pre-slide-scaling   # full pre-session state
# or
git checkout main -- src/pages/CaseStudy.css src/pages/CaseStudy.jsx
```
