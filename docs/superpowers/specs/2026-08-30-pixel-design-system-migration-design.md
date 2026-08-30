# Pixel design system migration — design spec

**Date:** 2026-08-30
**Branch:** `pixel-theme`
**Status:** Approved design, pending implementation plan

## Goal

Transition the **entire portfolio site** to the pixel design system that currently
lives as a separate, read-only Vite entry (`src/themes/pixel/` + `pixel.html`).
After the migration there is **one app** — the existing `App.jsx` shell — presenting
the pixel design across every surface, with **all editing preserved** (article block
editor, project cards, about, CV) and **the case-study slide deck untouched** (it keeps
its own fixed 1920×1080 canvas design system and is reached from the article).

## Decisions (locked)

1. **Consolidate in place.** Keep `App.jsx` / BrowserRouter / `EditContext` /
   IndexedDB persistence / `ScrollToTop` / the slide deck all wired. Change only the
   presentation layer.
2. **Light-only.** Drop dark mode; remove the theme toggle.
3. **CV: restyle template, keep editor + PDF export.**
4. **Re-add inline editing** to the pixel Home and About surfaces (they are display-only
   in the pixel app today).
5. **Slides are out of scope** — visually unchanged is the #1 correctness constraint.

## Current state (verified)

- **Default app** (`index.html` → `src/App.jsx`, BrowserRouter): home, about, playground,
  case-study **article** (long-form, block-based, fully editable — `src/pages/CaseStudyArticle.jsx`),
  case-study **slides** (`src/pages/CaseStudy.jsx`, fixed canvas), **CV builder**
  (`src/pages/CVBuilder.jsx`, public + editor + PDF, ~1200 lines), presenter view, docs,
  design-system, agents-hub. Wrapped by `ThemeProvider` (main.jsx) + `EditProvider` (App.jsx).
  All editing + persistence + the slides live here.
  - Routes: `/`, `/about`, `/playground`, `/project/:projectId`, `/present/:projectId`,
    `/docs/slides`, `/cv`, `/design-system`, `/agents-hub`.
  - Article ↔ slides: **P** opens the deck (`?view=slides`), **A/Esc** returns
    (`src/pages/CaseStudy.jsx:2207-2260`).
- **Pixel app** (`pixel.html` → `src/themes/pixel/main.jsx`, HashRouter): self-contained,
  **read-only**. Pages: Index, CaseStudy (prose article reader), About, Playground, Type,
  Scaffold, Compare. Engines: `heat-field`, `dither-plate`, `card-mosaic`, `foot-city`,
  `pixel-type`, `noise`, `ramp`, `motifs`, `pointer`, `useHeatField`. Tokens:
  `src/themes/pixel/tokens.css`. **No edit mode, no CV, no slides.** Deliberately does not
  mount `ThemeProvider`/`EditProvider` so its `:root` tokens survive. ~5,300 lines, 40 files.

## Two theming collisions the audit found (must resolve)

Both stem from the fact that the pixel app avoided them by not mounting the providers.
Consolidating in place means mounting the providers, so we resolve them directly:

1. **`EditContext` inline `:root` injection** (`src/context/EditContext.jsx:484-488`):
   sets `--font-display`, `--font-body`, `--color-accent` (and `--spacing-section`,
   `--container-max-width`) as inline styles. Inline beats any stylesheet, so it would
   clobber pixel Sneak/heat.
   → **Fix:** stop injecting `--font-display`/`--font-body`/`--color-accent`; remove the
   live font/accent/spacing controls from the edit panel. Keep all content editing.
2. **`ThemeContext` owns `data-theme`** (`src/context/ThemeContext.jsx:26`).
   → **Fix:** lock to light; remove the toggle UI. Keep the provider mounted (reversible).

## Architecture

### 4a. Token foundation

- Add **Sneak** `@font-face` globally (woff2 already in `public/fonts/Sneak-Regular.woff2`,
  `Sneak-Medium.woff2`). Stack degrades `Sneak → Neue Haas Unica → Switzer → Helvetica Neue`.
  Drop the Google fonts referenced in `pixel.html` (vestigial).
- Add a global pixel token layer (adapted from `src/themes/pixel/tokens.css`), imported
  **after** `src/index.css` so its values win. It:
  - **redefines** the 6 high-traffic semantic colour tokens — `--color-accent`,
    `--color-text`, `--color-text-muted`, `--color-border`, `--color-bg`,
    `--color-bg-secondary` — to pixel values (heat ramp + ink/paper). Per the audit these
    carry 96% of colour references, so this re-skins most of the site from one file.
  - **redefines** `--font-display`, `--font-body`, and the `--text-*` scale to pixel type
    (display `clamp(56px,11.5vw,168px)` / `-.035em` / `.92`; body `clamp(16px,1.1vw,19px)` /
    `-.015em` / `1.55`; `--measure: 62ch`; utility 11px uppercase `.09em`).
  - **adds** pixel-only tokens: `--cell` (9px, single geometry source), the heat ramp
    (`--heat-1..5`, `--blue`/`--yellow`/`--red`/`--neon`), `--ink`, `--bg`, `--rule`,
    `--rule-faint`, `--grid`, `--maxw` (1176px), `--gutter` (56/28px), `--radius` (2px),
    `--fade-*` per page.

### 4b. Slide insulation (critical)

The excepted slide canvas must not shift. The slide system defines its own `--slide-font-*`
scale, but before global token changes land we must verify no slide text falls back to
`--font-body`/`--font-display`. If any does, scope the pixel `--font-*` override so it does
**not** apply inside `.case-study .slide-inner` (add an explicit reset there). Verification
is part of Phase 0 and again in Phase 7.

### 4c. Engines & layout

Bring the framework-agnostic engines and `PixelShell` (background grid + fixed field canvas +
nav + footer) into the app as the layout wrapper for pixel-skinned routes. They already use
`<Link>`/`useParams`, so they work under the existing BrowserRouter. `PixelShell` mounts
inside the routed content, below the existing providers and `ScrollToTop`.

### 4d. Per-surface plan

| Surface | Plan | Editing |
|---|---|---|
| `/` Home | Swap presentation to pixel `Index` (heat-field hero + `WorkCarousel`), reading `home-content.json`. | Re-add inline editing (re-skinned project cards + hero copy). |
| `/about` | Swap to pixel `About` (portrait dither plate, bio, skills, experience) from `about-content.json`. | Re-add inline editing (re-skinned). |
| `/playground` | Swap to pixel `Playground` (live dither controls). | n/a |
| `/project/:id` **article** | **Re-skin the existing `CaseStudyArticle.jsx`** to pixel tokens + block styling (sticky section labels, 62ch measure, facts strip). | Full existing block editor preserved. |
| `/project/:id?view=slides` **slides** | **Untouched.** | Existing slide editor untouched. |
| `/cv` | Re-skin `CVBuilder` template to pixel type/tokens. | Editor + PDF/print export kept. |
| Nav / Footer | Adopt `PixelNav` + `PixelFooter` (Tetris). Remove theme toggle. | CV link / nav copy edit preserved. |
| `/present`, `/docs/slides`, `/design-system`, `/agents-hub` | Dev tooling — kept functional, light-touch (no user-facing polish). | unchanged |

Note on the article: we keep the **existing** `CaseStudyArticle.jsx` (it carries the block
editor, P/A flow, persistence) and re-skin it — we do **not** run the pixel app's read-only
reader. The pixel reader's block schema was a display subset; the editor's schema stays
authoritative. Borrow the pixel reader's visual treatment as CSS only.

## Data flow (unchanged)

Content sources stay the same: `home-content.json`, `about-content.json`,
`caseStudyData.js` (Dexie + JSON fallback), `case-studies/index.js`, image-variant manifest.
Editing → `EditContext` → IndexedDB/localStorage, unchanged except the style-injection removal.

## Risks & mitigations

1. **Slide insulation** — see 4b. Verify canvas typography untouched in Phase 0 and Phase 7.
2. **Edit-surface token bleed** — redefining tokens also restyles edit-panel / CV-editor /
   slide-edit chrome. Expect touch-ups; verify each edit surface still reads.
3. **Mobile + iOS Safari** — the pixel mobile pass covered its own pages, not the re-skinned
   editor/CV/article; iOS Safari canvas performance untested (per `docs/pixel-theme.md`).
   Dedicated QA pass in Phase 7.
4. **EditContext change is sensitive** (CLAUDE.md warning) — backup branch, targeted change,
   verify save/load and edit-mode toggle (Cmd/Ctrl+E) after.
5. **Hardcoded colours** in `Projects.css` (179), `Hero.css`, `Navigation.css` — irrelevant
   because those components are replaced by pixel components. `CVBuilder.css` hardcoded values
   are addressed by the re-skin.

## Phasing (feeds the implementation plan)

Backup branch `backup/pre-pixel-migration` at HEAD first, then:

0. **Foundation** — Sneak `@font-face` + global pixel token layer; verify slides insulated;
   `npm run build`.
1. **Contexts** — neutralize EditContext style-injection; drop dark-mode toggle; verify edit
   mode still saves.
2. **Engines + layout** — import engines + `PixelShell`; establish the pixel layout wrapper.
3. **Browse surfaces** — Home, About, Playground → pixel components with editing re-added.
4. **Chrome** — Nav + Footer → pixel.
5. **Article** — re-skin `CaseStudyArticle.jsx`; verify P/A to slides + block editing.
6. **CV** — re-skin template; verify editor + PDF export.
7. **QA** — slides untouched; edit mode + persistence across surfaces; mobile; `npm run build`.
8. **Cleanup** — retire `pixel.html` / `vite.pixel.config.mjs` (or keep `/compare`);
   remove dead default components.

## Verification

No test suite (SPA). Per the `verify` skill: `npm run dev`, drive the browser at each surface;
`npm run build` before any commit. Each phase ends green before the next begins.

## Out of scope

- The case-study slide system (`/project/:id?view=slides`, `src/pages/CaseStudy.jsx` canvas).
- Content/copy rewrites (handled by the separate case-study review pipeline).
- New features beyond the design-system transition.
