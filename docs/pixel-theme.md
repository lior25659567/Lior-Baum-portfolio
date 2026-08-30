# Pixel theme

A second design system for this portfolio, built alongside the existing one and
sharing none of it. Reachable at **`/pixel.html`** in dev; the default site is
untouched.

```bash
npx vite --config vite.pixel.config.mjs   # pixel theme at localhost:5173/
npm run dev                               # the default site at localhost:5173/
```

Both use `strictPort`, so whichever starts second fails loudly rather than
silently taking another port.

---

## Why it is a separate Vite entry

`src/themes/pixel/` plus `pixel.html` is the entire theme. Nothing outside it
was modified — no shared component, no token, no route.

That was not only tidiness. Two things in the existing app make a same-document
second theme impossible:

- **`ThemeContext` owns `data-theme`** (`src/context/ThemeContext.jsx:26`) and
  rewrites it on every theme change, so a third value cannot survive there.
- **`EditContext` injects `--font-display`, `--font-body` and `--color-accent`
  as inline styles on `:root`** (`src/context/EditContext.jsx:484-488`). Inline
  beats any stylesheet, so a themed page would silently inherit Satoshi and
  coral no matter what it declared.

A separate entry mounts neither provider, so both problems disappear rather than
being worked around, and `tokens.css` can use plain `:root`. See
`docs/theme-audit.md` for the full audit.

**Known cost:** `vite build` only emits entries listed in
`build.rollupOptions.input`. `pixel.html` is therefore absent from a production
build until one line is added to `vite.config.js` — deferred deliberately, so
`git diff main --diff-filter=MD` stays empty while the theme is being judged.

---

## The grid is one module

`--cell` (9px) is the single source of truth for geometry. The background rule,
the hero field, the Pac-Man, the Tetris blocks and the marquee type all read it,
so they cannot drift apart by a pixel.

`--cell-layout` (14px) is a **different** token for spacing — section padding,
column gutters, control offsets. The reference does the same: its `--cell:14px`
is the layout module while its hero field runs at 9. Mixing them is the most
likely way to make this look subtly wrong with no obvious cause.

Cell L/M/S = 22 / 14 / 9px, Brush L/M/S = 16 / 10 / 7. **Cell S is the default**,
which is why the field runs at 9px.

At viewports ≥2400px the default `--cell` steps up to Cell M — see *Performance*.

---

## The heat field

`heat-field.js`. Six things are load-bearing; changing any of them changes the
effect into a different effect.

1. **The dither threshold field is static.** Generated once per resize from a
   seeded xorshift. Re-randomising per frame makes the whole field sizzle — the
   single most common way to get this wrong. Measured: ~6–7% of *painted* cells
   change between consecutive frames.
2. **30fps, not 60.** Throttled explicitly. At 60 it reads as smooth video
   rather than a stepped, mechanical field.
3. **The brush is a velocity-stretched capsule**, swept from the previous
   rendered frame's position to the current one, so the tail's length *is* the
   cursor's speed. The original spec called for a stamp at a single point and an
   evenly spaced dotted trail; the live reference shows a continuous comet, and
   the brief says the live site wins. Do not "restore" the dotted behaviour.
4. **Anisotropy 0.100 in x, 0.050 in y.** The lower y frequency stretches
   features vertically, which is what produces the drips along the lower edge.
5. **Drift samples `y − driftY`, not `y + driftY`.** Adding makes the mass
   *rise*. It looks plausible either way until you correlate two frames.
6. **The canvas is fixed to the viewport; the field is masked to a band.** The
   band spacer's live document position is measured every frame, so the mass
   scrolls away with the page. The brush is deliberately *not* masked — it lives
   in viewport space and carries on past the band with no seam. Two coordinate
   spaces on one canvas; mixing them clamps the whole field to zero.

### Behaviours layered on it

| Behaviour | Trigger | Notes |
|---|---|---|
| Comet tail | cursor movement | retracts past `[data-trail-end]` |
| Brush shrink | past `[data-trail-end]` | same ramp, so size and tail retract together |
| Settle | cursor **stops** | cells re-roll ~7fps and damp over ~1s |
| Pac-Man | cursor idle 2s | direction set by which half of the page it rested in |

`[data-trail-end]` is an attribute on a section (currently the index's point-of-
view block), not a hardcoded offset — moving or resizing that section cannot
silently break the boundary.

---

## Colour

Every value was read from the reference's own source, not sampled by eye.

```
--heat-1 #1c2541   navy      --ink   #0A0A0A
--heat-2 #3b5bd9   blue      --bg    #FFFFFF
--heat-3 #f5c518   yellow    --muted #8b8b8b
--heat-4 #e0492a   red       --rule       rgba(10,10,10,.12)
--heat-5 #d8ff00   neon      --rule-faint rgba(10,10,10,.06)
                             --grid       rgba(10,10,10,.022)
```

`--grid` is deliberately a third of `--rule-faint`. Drawing the background grid
at hairline strength makes the whole page read as graph paper.

**Values that sit exactly on a ramp stop quantise solid.** `0.6 × 5 = 3.0` leaves
the dither no fraction to push around, so the Pac-Man's body is flat amber;
`0.72` lands mid-band and speckles. This is worth knowing before picking any new
constant.

---

## Type

**Sneak**, by [TIGHTYPE](https://tightype.com/typefaces/sneak/) — identified from
the reference's own `@font-face` block, not guessed. Licensed, and served from
`public/fonts/`. Only 400 and 500 are declared; nothing should ask for Light.

The stack degrades `Sneak → Neue Haas Unica → Switzer → Helvetica Neue`, so it
still renders sensibly if the files are ever missing.

The reference loads **three weights only, 300/400/500**. There is no 600 — a
`600` appears in its canvas wordmark code, where the browser synthesises it.

`pixel-type.js` renders headlines *as cells*: the string goes into an offscreen
canvas **at cell resolution**, and the bitmap is used as a mask. Sampling at cell
resolution rather than downscaling a full-res render is what keeps the edges
crisp — one text pixel is one cell, so glyphs snap to the grid.

---

## Performance

Measured with the field's `_step()` hook, which drives frames deterministically.

| Viewport | Grid | Field |
|---|---|---|
| 1440×900 | 160×100 | **1.5 ms** |
| 2560×1440 | 183×103 | **1.8 ms** |
| 3840×2160 | 275×155 | **4.4 ms** |
| 1440 + 8 plates | — | **8.3 ms** |

Budget is 6ms for the field, 10ms for the whole page.

At 4K the 9px module puts >100k cells on screen and the field costs ~10ms. The
fix is the plan's own: **raise the module rather than drop frames.** `--cell`
steps up to Cell M above 2400px, cutting the count ~2.4×. The Cell control still
overrides it, because it writes `--cell` inline on the root.

Other guarantees: draw buckets are reused via `length = 0` (no per-frame
allocation — ~1MB heap growth over 120 frames, which is GC noise), the loop stops
on `visibilitychange` (0 frames while hidden) and on `IntersectionObserver`, and
DPR is capped at 2.

**One shared `pointermove` listener** for the whole theme (`pointer.js`).
Consumers sample it during their own render rather than subscribing, so adding a
canvas costs nothing at pointer rate.

---

## Accessibility

- Focus ring: 2px solid, 3px offset. **Neon** on elements that sit over dark
  media or painted cells — ink reads on paper and on the warm end of the ramp
  but not on navy.
- 21 focusable elements on the index; nothing interactive is unreachable by
  keyboard. Tetris takes arrows and space as well as the on-screen pad.
- `prefers-reduced-motion`: the field renders but does not drift, plates render
  one static frame, the Pac-Man holds its arrangement, and hover easing becomes
  instant. **Pointer stamping stays** — it is a direct response to input, not
  ambient motion.
- Every canvas is `aria-hidden` except the type marquee, which carries
  `role="img"` and the sentence as its label.

---

## Things to know before changing something

- **Interactive canvases:** `<canvas>` is a replaced element. `position: fixed;
  inset: 0` does **not** stretch it — `width: auto` resolves to the intrinsic
  300×150 and the effect renders into a tiny canvas while still looking like
  "an effect". Always set `width`/`height` explicitly.
- `tokens.css` resets `canvas { max-width: 100% }`, which silently caps any
  full-bleed canvas at its padded parent.
- A `pointer-events: none` wrapper needs every control inside it to opt back in.
- Pointer capture retargets `pointerup`, which kills `click` on buttons inside
  the captured element. This is why the carousel has no drag.
- All page sections start on one line: `--maxw` with the gutter *outside* it.
  A centred `max-width` *plus* a gutter lands one gutter inboard.

---

## Mobile

Verified at 390 / 768 / 1440 — every page renders, nothing overflows.

- **The carousel uses native scroll-snap on touch.** With no hover the arrows
  are hidden, and there is no drag (removed deliberately — it fought the card
  links and needed pointer capture). Without this the track was *completely
  unreachable* on a phone: 1600px of cards inside a 390px window with overflow
  hidden. The `transform: none !important` on `.track` is load-bearing — the
  component writes `transform` inline for the arrow path, and on touch the
  browser owns the scroll position instead.
- `--gutter` drops to 28px below 760px, matching the reference. At 56px a phone
  loses nearly a third of its width to margins.
- **Touch targets are padded, not enlarged.** 11px uppercase gives a 15px-tall
  nav link — fine under a cursor, far too small under a thumb. The hit area is
  padded to ~40px so the row still reads the same.
- The hero description is flush left below 860px; justifying five words across a
  334px column opens word gaps you could drive through.
- Multi-image case-study figures stack below 760px — three across a 334px column
  is ~103px each, below the point where a UI screenshot says anything.
- **Hover-only affordances degrade rather than break:** the card mosaic, the
  "View case study" scrim and the plate warm-up are all `(hover: hover) and
  (pointer: fine)`. Cards remain links; the game is tappable and its d-pad is
  44px.

## What is not covered
- The case-study slide system (`/project/:id` in the default theme) is out of
  scope by design — it is its own fixed-canvas design system.
- Tetris: at 9px blocks the board is 24 columns, which is playable but slow to
  clear. Line clears are rare by construction.
