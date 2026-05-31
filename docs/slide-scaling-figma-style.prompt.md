# Claude Code Prompt — Figma-Style Case Study Slide Scaling

## What we're doing

I want my portfolio case study slides to behave exactly like slides in Figma or Canva — they should always look identical no matter what screen size you view them on. No layout shifts, no reflowing content, no breakpoints. Just the same slide scaled up or down proportionally to fit the screen width.

The base canvas size is **1920 × 1080px** (standard 1080p).

---

## Step 1 — Remove all breakpoints inside slides

Find every `@media` query that lives inside a case study slide component or slide-related CSS. **Delete all of them.** Slides must have zero responsive breakpoints internally. No layout changes, no font size changes, no reordering of elements at any screen width.

Do not touch `@media` queries that exist outside the slide system (navbar, page layout, etc.) — only remove them from inside slide components.

---

## Step 2 — Fix the slide canvas size

Set every slide element to a hard fixed size. No percentages, no viewport units, no min/max width:

```css
.slide {
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  /* all internal units should be plain px */
}
```

Also check all internal elements inside slides — any `font-size`, `padding`, `margin`, `gap`, `border-radius` that uses `rem`, `em`, `vw`, or `vh` must be converted to `px`. These units respond to the viewport and will break the illusion of a fixed canvas.

---

## Step 3 — Create the slide container wrapper

Every slide needs a wrapper container. This container is what fills the page width; the slide inside it gets scaled to fit:

```css
.slide-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  /* height is set dynamically by JS */
}
```

---

## Step 4 — Implement the scaling logic

```js
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

function scaleSlide(slideEl, containerEl) {
  const containerWidth = containerEl.getBoundingClientRect().width;
  const scale = containerWidth / SLIDE_WIDTH;

  slideEl.style.transform = `scale(${scale})`;
  slideEl.style.transformOrigin = 'top left';
  containerEl.style.height = `${SLIDE_HEIGHT * scale}px`;
}
```

- Use `transform: scale()` (never `zoom`)
- `transform-origin: top left`
- Update container height alongside scale

---

## Step 5 — Attach a ResizeObserver

Watch the container element (not `window`) for size changes and recalculate.

---

## Step 6 — Mobile: add a zoom toggle

On mobile (max-width: 768px), add a Fit/Zoom toggle button at bottom-right of
the container. Zoom mode uses `scale = screenWidth / 960` and makes the
container horizontally scrollable.

---

## Step 7 — Verification checklist

- [ ] No `@media` queries remain inside slide components
- [ ] All internal slide units are `px`
- [ ] `transform-origin` is `top left`
- [ ] `zoom` is not used
- [ ] ResizeObserver on the container, not `window`
- [ ] Container height updates on resize (no overlap with content below)
- [ ] Mobile zoom toggle present and functional
