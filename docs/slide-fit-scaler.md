# Slide Fit-Scaler — View-Mode Sizing System

This document describes the unified sizing system that prevents slides from cutting off content or showing scrollbars when the available viewport height is constrained (browser chrome, OS taskbar, devtools docked, browser zoom > 100%, small laptop screens).

## Why this exists

In view/presentation mode, multiple slide templates (info, split-content, goals, problem, comparison) used to:

- Cut off content when the viewport was short
- Show a vertical scrollbar inside `.split-content` (the text column scrolled, not the slide)
- Squeeze the image column on the info slide so the cover image got clipped
- Crop KPI cards on the goals slide

The root cause was a mix of:
1. Vertical padding/gap tokens driven by viewport **width** (`vw`) only — they ignored short heights
2. A view-mode `max-height: var(--vp-cap)` cap on `.slide-inner` plus children with `min-height: 0` that squeezed content into the cap and then introduced an inner scrollbar
3. Fixed `gap: 2rem` on the goals grid that didn't shrink with the viewport

Edit mode was unaffected (it has its own neutralizer block) and must remain so.

## The strategy: two adaptive layers

Both layers are scoped to `.case-study:not(.edit-mode)` so edit mode is untouched.

### Layer 1 — CSS (coarse)

Spacing tokens take the smaller of a `vw`-derived clamp and a `vh`-derived clamp, so they shrink on short viewports even when the window is wide:

```css
.case-study {
  --slide-pad-top:    min(clamp(56px, 6.5vw, 128px), clamp(28px, 9vh, 96px));
  --slide-pad-bottom: min(clamp(56px, 6.5vw, 128px), clamp(28px, 9vh, 96px));
  --slide-gap:        min(clamp(56px, 7vw, 144px),   clamp(24px, 8vh, 96px));
  --grid-gap:         min(clamp(16px, 2vw, 32px),    clamp(12px, 2.5vh, 28px));
}
```

Three height breakpoints add stepped reductions for very short viewports:

```css
@media (max-height: 800px) { /* 48px paddings, 48px gap */ }
@media (max-height: 600px) { /* 28px paddings, 24px gap */ }
@media (max-height: 500px) { /* 16px paddings, 16px gap — devtools/zoom territory */ }
```

View-mode also drops the `--slide-max-w` cap (`--slide-max-w: none` under `.case-study:not(.edit-mode)`) so slide content aligns horizontally with `.case-nav` — both span the full viewport width minus `--slide-pad-x`. Edit mode keeps the base `min(1920px, 100%)` cap because the editor controls were tuned against that width.

Inner overflow rules that used to introduce stray scrollbars now expose natural content height upward so the JS scaler can see it:

- `.case-study:not(.edit-mode) .split-content { overflow: visible }` — was `overflow-y: auto` (the inner-scrollbar source)
- `.case-study:not(.edit-mode) .intro-images-wrapper { overflow: visible }` — was `overflow: hidden` (clipped the cover image)
- `.case-study:not(.edit-mode) .goals-grid { overflow: visible }` — was `overflow: hidden`
- `.case-study:not(.edit-mode) .slide-comparison-unified, .comparison-side { overflow: visible; min-height: 0 }`
- `.case-study:not(.edit-mode) .comparison-switcher { flex: 0 0 auto }` (never gets scaled away)
- `.goals-grid { gap: var(--grid-gap) }` — was a fixed `gap: 2rem`

### Layer 2 — JS (fine)

A generalized fit-scaler in [src/pages/CaseStudy.jsx](../src/pages/CaseStudy.jsx) replaces the previous goals-only `--fit-scale` effect. It runs whenever the active slide, project content, or `editMode` changes, and additionally on:

- `window.resize` — window size changes
- `window.visualViewport.resize` — browser zoom changes
- `ResizeObserver` on `.case-study-slides-wrapper` — devtools docking, OS chrome show/hide
- Capture-phase `load` events on images — late image-load reflows that change `scrollHeight`

The core measurement function:

```javascript
function fitSlide(slideEl) {
  const inner = slideEl.querySelector(':scope > .slide-inner');

  // Phase 1: lift the view-mode cap so we can read natural content height
  inner.style.setProperty('--fit-scale-slide', '1');
  inner.setAttribute('data-fit-active', 'true');

  // Phase 2: measure
  const cs = getComputedStyle(slideEl);
  const avail  = slideEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const needed = inner.scrollHeight;

  // Phase 3: decide
  if (needed <= avail + 1) {
    inner.removeAttribute('data-fit-active'); // restore cap → content fills slide naturally
    runCardLevelFitPass(slideEl);             // existing per-card pass
    return;
  }

  // Doesn't fit — apply uniform scale-down (floor 0.7)
  const scale = Math.max(0.7, (avail / needed) * 0.99);
  inner.style.setProperty('--fit-scale-slide', String(scale));
  // data-fit-active stays true → cap stays lifted, transform shrinks the visual content
}
```

A double `requestAnimationFrame` before measurement ensures CSS-driven layout (fonts, grids) has settled.

The corresponding CSS:

```css
.case-study:not(.edit-mode) .slide-inner {
  max-height: var(--vp-cap);
  --fit-scale-slide: 1;
  transform: scale(var(--fit-scale-slide));
  transform-origin: top center;
  transition: transform 120ms ease-out;
  will-change: transform;
}

.case-study:not(.edit-mode) .slide-inner[data-fit-active="true"] {
  max-height: none; height: auto; min-height: 0;
}

.case-study:not(.edit-mode) .slide { overflow: hidden; }
```

When the scaler engages, the layout box of `.slide-inner` takes its natural (taller-than-viewport) height, and `transform: scale()` shrinks the visual content uniformly back into the slide. `transform-origin: top center` anchors the scaled content to the top of the slide's content area.

## Why a 0.7 floor (not 0.55)

The existing per-card `--fit-scale` on `.goals-cards-section` and `.kpis-section` floors at 0.55, but those scale individual cards — small typographic loss is acceptable. The slide-level scaler operates on the entire layout, so blur from fractional sub-pixel positioning is more visible. 0.7 is a conservative balance between preventing clipping and keeping text readable. Below 0.7, content may begin to clip — this is acceptable in extreme scenarios (devtools open at 125% zoom on a small laptop).

## No compounding transforms

When the slide-level scaler engages (slide content overflows), the secondary card-level pass on `.goals-cards-section` and `.kpis-section` is **skipped**. Otherwise both transforms would compound (e.g. 0.85 × 0.7 ≈ 0.6), producing severe blur and broken hit targets. The per-card pass only runs in the "fits at scale 1" branch of `fitSlide()`.

## Edit-mode safety

Every layout change is scoped to `.case-study:not(.edit-mode)`. Additionally:

- `.case-study.edit-mode .slide-inner` has an explicit `transform: none !important` and `--fit-scale-slide: 1` reset, in case an inline custom property lingers across a hot toggle
- The JS effect's edit-mode branch wipes `[data-fit-active]`, inline `--fit-scale-slide`, and inline `--fit-scale` on every entry into edit mode

## Affected files

- [src/pages/CaseStudy.css](../src/pages/CaseStudy.css) — token redefinitions, height breakpoints, view-mode overflow overrides, slide-level transform machinery, edit-mode neutralizer
- [src/pages/CaseStudy.jsx](../src/pages/CaseStudy.jsx) — generalized fit-scale `useEffect` (replaces the previous goals-only one)

## Debugging tips

- **A slide is still being cut off in view mode.** Check `getComputedStyle(slideInner).transform` in devtools — if it's `none` while content overflows, the JS scaler didn't run. Look for errors from the `useEffect`, or verify the `.slide` is the `currentSlide`th child of `.case-study-slides-wrapper`.
- **Content is being clipped at the bottom.** The natural scrollHeight exceeds what a 0.7 scale can fit. Either the content is genuinely too dense (scale floor reached) or the slide template added a non-shrinking element. Check whether the offending element has `min-height: 0` and `overflow: visible` in view mode.
- **Edit mode shows a weird transform.** The defensive `transform: none !important` on `.case-study.edit-mode .slide-inner` should prevent this. If it leaks, check that the `useEffect` cleanup branch ran on the mode toggle (search for `data-fit-active` in DOM).
- **Initial paint shows a flash of un-scaled (overflowing) content.** The double-rAF before measurement may not be enough on very slow devices. Consider adding a `setTimeout(schedule, 100)` fallback if QA finds a reliable repro.
- **Resizing feels janky.** The `transition: transform 120ms ease-out` smooths scale changes. If the user feels jumps, check whether the ResizeObserver is firing repeatedly (debounce within `schedule`).

## Trade-offs accepted

1. **Sub-pixel blur on fractional scale.** Mitigated by `* 0.99` margin (avoids hovering exactly at the threshold) and the 120ms transition. If text-heavy slides look fuzzy, snap the scale to nearest 0.05 in `fitSlide()`.
2. **Layout box stays at natural size when scaled.** `transform: scale()` doesn't shrink the layout box. Mitigated by `.slide { overflow: hidden }` in view mode + `max-height: none` on `[data-fit-active]`.
3. **Single fit floor (0.7).** Below this, content clips. The third height breakpoint (`max-height: 500px`) tightens spacing tokens to delay reaching the floor.
