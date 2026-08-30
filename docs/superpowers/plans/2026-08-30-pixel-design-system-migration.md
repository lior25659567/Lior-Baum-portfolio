# Pixel Design System Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition the whole portfolio site to the pixel design system in place, keeping all editing and the case-study slide deck working, with the slides visually unchanged.

**Architecture:** Keep the existing `App.jsx` / BrowserRouter / `EditContext` / IndexedDB shell. Import the already-built, framework-agnostic pixel engines + presentational components from `src/themes/pixel/` into the app's routes, wrapped by a `PixelShell` layout. Re-skin the editable surfaces (article, CV, project cards, about) in place via a global pixel token layer that overrides the 6 choke-point semantic tokens. The fixed-canvas slide deck is insulated and left untouched.

**Tech Stack:** React 19, Vite 5, React Router 7 (BrowserRouter), vanilla per-component CSS, Dexie (IndexedDB), GSAP/Framer Motion, canvas engines (heat-field, dither-plate, foot-city, pixel-type).

**Spec:** `docs/superpowers/specs/2026-08-30-pixel-design-system-migration-design.md`

## Global Constraints

- **No test suite exists (SPA).** Verification is browser-driven (`superpowers:verify` / the `verify` skill) plus `npm run build` and `npm run lint`. Every task ends with a concrete browser check + a green `npm run build`.
- **Dev server:** `npm run dev` (port 5173; `predev` kills 5173 first). If a route shows "Failed to fetch dynamically imported module", hard-refresh (Cmd+Shift+R) → close tab → restart dev server.
- **Slides are OUT OF SCOPE and must not change visually.** The fixed 1920×1080 canvas system (`src/pages/CaseStudy.jsx` slide render, `CaseStudy.css` `:not(.edit-mode)` rules) is insulated in Task 1 and re-verified in Task 15.
- **Commits are LOCAL to the `pixel-theme` branch only. Never push.** Per repo convention the user pushes when ready; per-task commits are rollback checkpoints. A `backup/pre-pixel-migration` branch is created in Task 0.
- **Edit/Write tools for repo files, not shell `cat`/`sed`/`echo`.**
- **Font:** Sneak (`public/fonts/Sneak-Regular.woff2`, `Sneak-Medium.woff2`), stack `Sneak → Neue Haas Unica → Switzer → Helvetica Neue`. Only weights 400 and 500 exist — never request Light/600.
- **Design tokens (verbatim):** heat ramp `--heat-1 #1c2541`, `--heat-2 #3b5bd9`, `--heat-3 #f5c518`, `--heat-4 #e0492a`, `--heat-5 #d8ff00`; `--ink #0A0A0A`; `--bg #FFFFFF`; `--muted #8b8b8b`; `--rule rgba(10,10,10,.12)`; `--rule-faint rgba(10,10,10,.06)`; `--grid rgba(10,10,10,.022)`; `--cell 9px` (Cell S default); `--maxw 1176px`; `--gutter 56px` (28px ≤760px); `--radius 2px`. Accent maps to `--blue (#3b5bd9)`.
- **Pixel source of truth:** existing files under `src/themes/pixel/` — import them, do not fork/rewrite unless a task says so.

---

## File Structure

**Create:**
- `src/design-system/pixel-tokens.css` — global token layer + Sneak `@font-face` + semantic-token remap + slide insulation. Imported after `index.css`.
- `src/components/PixelLayout.jsx` — thin app-level wrapper around the pixel `PixelShell` for browse routes (`/`, `/about`, `/playground`, `/cv`).

**Modify:**
- `src/main.jsx` — import `pixel-tokens.css` after `index.css`.
- `src/context/ThemeContext.jsx` — lock to light.
- `src/context/EditContext.jsx:484-488` — remove inline `--font-display`/`--font-body`/`--color-accent` injection.
- `src/App.jsx` — swap browse-route elements to pixel pages wrapped in `PixelLayout`; keep `/project/:id`, `/present`, tools routes.
- `src/components/Navigation.*` → replaced in-route by pixel `PixelNav` (remove theme toggle).
- `src/pages/CaseStudyArticle.jsx` + a new/renamed article stylesheet — re-skin to pixel; inject pixel chrome in article mode only.
- `src/pages/CVBuilder.jsx` / `CVBuilder.css` — re-skin template to pixel tokens/type.
- Pixel components under `src/themes/pixel/` — route-target fixes (`/work/:slug` → `/project/:id`) and edit affordances on `Index`/`About`.

**Reused as-is (imported, not modified unless noted):** all engines (`heat-field.js`, `dither-plate.js`, `card-mosaic.js`, `foot-city.js`, `pixel-type.js`, `noise.js`, `ramp.js`, `motifs.js`, `pointer.js`, `useHeatField.js`) and `PixelShell.jsx`, `HeroHead.jsx`, `WorkCarousel.jsx`, `PixelNav.jsx`, `PixelFooter.jsx`, `PixelControls.jsx`, `DitherPlate.jsx`, `PixelType.jsx` + their CSS.

**Out of scope (do not touch):** `src/pages/CaseStudy.jsx` slide render + `CaseStudy.css` `:not(.edit-mode)` canvas rules; presenter/docs/design-system/agents-hub except where a task says light-touch.

---

## Phase 0 — Foundation

### Task 0: Backup branch + baseline build

**Files:** none (git only)

- [ ] **Step 1:** Confirm on `pixel-theme`: `git rev-parse --abbrev-ref HEAD` → `pixel-theme`.
- [ ] **Step 2:** Create backup: `git branch backup/pre-pixel-migration`.
- [ ] **Step 3:** Baseline build: `npm run build`. Expected: succeeds. If it fails, STOP and report — the tree must be green before migrating.
- [ ] **Step 4:** Baseline lint: `npm run lint`. Record existing warnings (do not fix now; used as the delta baseline).

### Task 1: Global pixel token layer + Sneak fonts + slide insulation

**Files:**
- Create: `src/design-system/pixel-tokens.css`
- Modify: `src/main.jsx` (add import after `./index.css`)

**Interfaces:**
- Produces: global CSS custom properties `--heat-1..5`, `--blue/--yellow/--red/--neon`, `--cell`, `--ink`, `--bg`, `--rule*`, `--grid`, `--maxw`, `--gutter`, `--radius`, pixel type vars, and **remapped** `--color-bg/--color-text/--color-text-muted/--color-border/--color-accent/--color-bg-secondary` consumed everywhere.

- [ ] **Step 1: Read the original slide font stack.** Open `src/index.css`, find the `:root` values of `--font-display` and `--font-body` (the Satoshi-based stacks). Copy them verbatim for Step 3's insulation block.
- [ ] **Step 2: Create `src/design-system/pixel-tokens.css`** with:

```css
/* Sneak — pixel design-system typeface (weights 400, 500 only) */
@font-face { font-family:'Sneak'; src:url('/fonts/Sneak-Regular.woff2') format('woff2'); font-weight:400; font-style:normal; font-display:swap; }
@font-face { font-family:'Sneak'; src:url('/fonts/Sneak-Medium.woff2')  format('woff2'); font-weight:500; font-style:normal; font-display:swap; }

:root {
  /* heat ramp (index = heat value) */
  --heat-0:transparent; --heat-1:#1c2541; --heat-2:#3b5bd9; --heat-3:#f5c518; --heat-4:#e0492a; --heat-5:#d8ff00;
  --blue:#3b5bd9; --yellow:#f5c518; --red:#e0492a; --neon:#d8ff00; --violet:#6c4cf1;
  /* cell geometry (single source) */
  --cell:9px; --cell-layout:14px; --cell-l:22px; --cell-m:14px; --cell-s:9px;
  --brush:7; --brush-l:16; --brush-m:10; --brush-s:7;
  /* surface */
  --ink:#0A0A0A; --bg:#FFFFFF; --muted:#8b8b8b;
  --rule:rgba(10,10,10,.12); --rule-faint:rgba(10,10,10,.06); --grid:rgba(10,10,10,.022);
  /* field fade per page */
  --fade-index:.42; --fade-case:.26; --fade-about:.22; --fade-playground:.20;
  /* type */
  --font-display:'Sneak','Neue Haas Unica','Switzer','Helvetica Neue',Helvetica,Arial,sans-serif;
  --font-body:'Sneak','Neue Haas Unica','Switzer','Helvetica Neue',Helvetica,Arial,sans-serif;
  --font-mono:'SFMono-Regular',ui-monospace,Menlo,Consolas,monospace;
  --fw-light:300; --fw-regular:400; --fw-medium:500;
  --display-size:clamp(56px,11.5vw,168px); --display-ls:-.035em; --display-lh:.92;
  --heading-lh:1.06; --heading-ls:-.02em;
  --body-size:clamp(16px,1.1vw,19px); --body-lh:1.55; --body-ls:-.015em;
  --measure:62ch; --utility-size:11px; --utility-ls:.09em;
  /* geometry & motion */
  --radius:2px; --gutter:56px; --maxw:1176px; --hover-ms:300ms; --focus-ring:2px; --focus-offset:3px;
  /* semantic remap — the 6 choke-point tokens that carry 96% of colour refs */
  --color-bg:var(--bg); --color-bg-secondary:#f5f5f5;
  --color-text:var(--ink); --color-text-muted:var(--muted);
  --color-border:var(--rule); --color-border-soft:var(--rule-faint);
  --color-accent:var(--blue); --color-accent-contrast:#ffffff;
}
@media (min-width:2400px){ :root{ --cell:var(--cell-m); } }
@media (max-width:760px){ :root{ --gutter:28px; } }

/* SLIDE INSULATION — the fixed-canvas deck keeps its original fonts. */
/* Paste the exact --font-display / --font-body values read in Step 1 below. */
.case-study .slide-inner {
  --font-display: <ORIGINAL from index.css>;
  --font-body:    <ORIGINAL from index.css>;
}
```

- [ ] **Step 3:** Replace the two `<ORIGINAL …>` placeholders with the verbatim values from Step 1.
- [ ] **Step 4:** In `src/main.jsx`, add `import './design-system/pixel-tokens.css'` immediately **after** the existing `import './index.css'`.
- [ ] **Step 5: Build:** `npm run build`. Expected: succeeds.
- [ ] **Step 6: Verify (browser):** `npm run dev` → open `/`. Expected: body text now renders in Sneak; accent elements are blue (#3b5bd9), not coral. Open a case study and press **P** to enter slides → **slide typography is unchanged** (still the original serif/sans, correct sizes). If slide type changed, the insulation block selector is wrong — inspect `.slide-inner` computed `--font-body` and fix the selector before continuing.
- [ ] **Step 7: Commit:** `git add src/design-system/pixel-tokens.css src/main.jsx && git commit -m "feat(theme): global pixel token layer + Sneak fonts + slide insulation"`

---

## Phase 1 — Contexts

### Task 2: Neutralize EditContext style-injection

**Files:** Modify `src/context/EditContext.jsx` (~lines 484-488)

**Interfaces:**
- Consumes: nothing new.
- Produces: EditContext no longer writes `--font-display`/`--font-body`/`--color-accent` inline on `:root`; pixel tokens now win everywhere. Content editing (`updateContent`, `updateNestedContent`, `updateStyles`) unchanged.

- [ ] **Step 1:** Open `src/context/EditContext.jsx`, locate the effect that calls `root.style.setProperty('--font-display', …)`, `('--font-body', …)`, `('--color-accent', …)`.
- [ ] **Step 2:** Remove (or comment with a `// pixel-migration:` note) exactly those three `setProperty` calls. Leave `--spacing-section` and `--container-max-width` as they are (pixel uses `--maxw`, no conflict).
- [ ] **Step 3: Build + lint:** `npm run build && npm run lint`. Expected: build succeeds, no new lint errors.
- [ ] **Step 4: Verify (browser):** dev → toggle edit mode (**Cmd/Ctrl+E**). Expected: edit panel opens; changing text still saves (reload persists). Fonts/accent stay pixel (Sneak/blue) — the old font/accent pickers no longer change anything.
- [ ] **Step 5: Commit:** `git add src/context/EditContext.jsx && git commit -m "fix(edit): stop injecting font/accent tokens so pixel design system wins"`

### Task 3: Lock light mode, remove theme toggle

**Files:** Modify `src/context/ThemeContext.jsx`; Modify `src/components/Navigation.jsx` (remove `ThemeToggle` usage — note: Navigation is replaced wholesale in Task 8, so this step may be a no-op if Task 8 lands first; do whichever is reached first and skip the dead step).

- [ ] **Step 1:** In `src/context/ThemeContext.jsx`, force the initial + persisted theme to `'light'` (ignore any stored `'dark'`): set the state initializer to `'light'` and keep `data-theme="light"`/`colorScheme:'light'` writes. Do not delete the provider (other code reads the context).
- [ ] **Step 2:** Ensure no path can set `'dark'` (remove/short-circuit any `toggleTheme` to a no-op or to always-light).
- [ ] **Step 3: Build:** `npm run build`. Expected: succeeds.
- [ ] **Step 4: Verify (browser):** dev → reload with `localStorage.theme='dark'` preset. Expected: site renders light regardless.
- [ ] **Step 5: Commit:** `git add src/context/ThemeContext.jsx && git commit -m "feat(theme): lock site to light (pixel is light-only)"`

---

## Phase 2 — Engines + layout wrapper

### Task 4: PixelLayout wrapper

**Files:** Create `src/components/PixelLayout.jsx`

**Interfaces:**
- Consumes: `src/themes/pixel/PixelShell.jsx` (grid + fixed field canvas + nav + footer), the pixel engines it imports.
- Produces: `<PixelLayout>{children}</PixelLayout>` — renders the pixel background grid, heat field, `PixelNav`, `PixelFooter`, and slots `children` into the content region. Used by browse routes only.

- [ ] **Step 1:** Read `src/themes/pixel/PixelShell.jsx` to learn its props (nav/footer/controls, `fade`, content slot) and what data it expects.
- [ ] **Step 2:** Create `PixelLayout.jsx` (`const PixelLayout = ({ children, fade }) => …`) that renders `PixelShell` with `PixelNav` + `PixelFooter` and places `children` in the content region. Feed nav its data from `home-content.json` as `PixelNav` already does.
- [ ] **Step 3:** Confirm the pixel engines resolve their imports from the new location (they live in `src/themes/pixel/` and are imported by relative path — no move needed).
- [ ] **Step 4: Build:** `npm run build`. Expected: succeeds (component is not yet routed; this proves imports resolve under the main entry).
- [ ] **Step 5: Commit:** `git add src/components/PixelLayout.jsx && git commit -m "feat(layout): PixelLayout wrapper reusing pixel PixelShell"`

### Task 5: Reconcile pixel route targets to the app's routes

**Files:** Modify pixel components that link to `/work/:slug` (e.g. `src/themes/pixel/WorkCarousel.jsx`, `src/themes/pixel/PixelNav.jsx`, any card/link) → `/project/:id`.

**Interfaces:**
- Consumes: `src/data/case-studies/index.js` + `home-content.json` project entries (the same the main app uses).
- Produces: all pixel links resolve to existing app routes under BrowserRouter.

- [ ] **Step 1:** Grep pixel components for `/work/` and for `to=`/`href=` link targets: `grep -rn "work/\|to=\|useParams" src/themes/pixel`.
- [ ] **Step 2:** Change case-study links from `/work/${slug}` to `/project/${id}` matching the id key the main app's `Projects` uses (verify the id/slug field against `home-content.json` projects and `case-studies/index.js`). Update any `useParams()` reads correspondingly where a pixel page is reused.
- [ ] **Step 3: Build:** `npm run build`. Expected: succeeds.
- [ ] **Step 4: Commit:** `git add src/themes/pixel && git commit -m "fix(pixel): point pixel links at /project/:id app routes"`

---

## Phase 3 — Browse surfaces

### Task 6: Home → pixel Index (view mode)

**Files:** Modify `src/App.jsx` (route `/` element).

**Interfaces:**
- Consumes: `src/themes/pixel/pages/Index.jsx`, `PixelLayout`.
- Produces: `/` renders the pixel hero + `WorkCarousel` inside `PixelLayout`.

- [ ] **Step 1:** In `App.jsx`, import the pixel `Index` page + `PixelLayout`. Change the `/` route element from `<Home/>` to `<PixelLayout fade="index"><Index/></PixelLayout>`.
- [ ] **Step 2:** Confirm `Index` reads `home-content.json` (it does) — no data wiring needed.
- [ ] **Step 3: Build:** `npm run build`. Expected: succeeds.
- [ ] **Step 4: Verify (browser):** `/` shows the reactive heat-field hero + work carousel; cards link to `/project/:id`; footer Tetris present. Mouse over the hero → field reacts. Resize → no overflow.
- [ ] **Step 5: Commit:** `git add src/App.jsx && git commit -m "feat(home): render pixel Index at /"`

### Task 7: Re-add inline editing to Home (pixel Index)

**Files:** Modify `src/themes/pixel/pages/Index.jsx` (+ its subcomponents `HeroHead`, `WorkCarousel` as needed).

**Interfaces:**
- Consumes: `useEdit()` from `src/context/EditContext.jsx` — `editMode`, `updateContent`, `updateNestedContent`, `openMediaLibrary`.
- Produces: in edit mode, hero copy (greeting/name/role/description/cvLink) is `contentEditable` and project cards expose image/title/category/year/url/hidden controls, all persisting via EditContext.

- [ ] **Step 1:** Read the OLD editable components (`src/components/Hero.jsx`, `Projects.jsx`) to list the exact content paths edited and the EditContext calls used (which `updateContent`/`updateNestedContent` keys).
- [ ] **Step 2:** In `HeroHead`, when `editMode`, wrap each text node with `contentEditable`+`suppressContentEditableWarning` and `onBlur={e => updateContent(<path>, e.currentTarget.textContent)}` using the paths from Step 1.
- [ ] **Step 3:** In `WorkCarousel` cards, when `editMode`, add the card controls (image via `openMediaLibrary`, title/category/year via contentEditable, url + hidden toggle) mirroring the paths from the old `Projects.jsx`.
- [ ] **Step 4: Build + lint:** `npm run build && npm run lint`. Expected: green, no new lint errors.
- [ ] **Step 5: Verify (browser):** edit mode → edit hero name + a card title, reload → persists. View mode → controls hidden, layout intact.
- [ ] **Step 6: Commit:** `git add src/themes/pixel && git commit -m "feat(home): inline editing on pixel Index wired to EditContext"`

### Task 8: About + Playground → pixel pages

**Files:** Modify `src/App.jsx` (routes `/about`, `/playground`); Modify `src/themes/pixel/pages/About.jsx` for editing.

- [ ] **Step 1:** Point `/about` → `<PixelLayout fade="about"><About/></PixelLayout>` and `/playground` → `<PixelLayout fade="playground"><Playground/></PixelLayout>` (pixel pages).
- [ ] **Step 2:** Add inline editing to pixel `About` (bio paragraphs, skills, experience, profile image) using the content paths from the old `src/pages/About.jsx` + `about-content.json` and the `useEdit()` API (same pattern as Task 7).
- [ ] **Step 3: Build + lint:** green.
- [ ] **Step 4: Verify (browser):** `/about` renders pixel about with portrait dither plate; edit a bio line → persists. `/playground` renders live dither controls; buttons work.
- [ ] **Step 5: Commit:** `git add src/App.jsx src/themes/pixel && git commit -m "feat(about,playground): render pixel pages with about editing"`

---

## Phase 4 — Chrome

### Task 9: Nav + Footer = pixel (remove theme toggle)

**Files:** confirmed via `PixelLayout` (Task 4) using `PixelNav` + `PixelFooter`; ensure old `Navigation`/`Footer` are no longer rendered on pixel routes.

- [ ] **Step 1:** Verify browse routes render `PixelNav`/`PixelFooter` (from `PixelLayout`) and NOT the old `Navigation`/`Footer`. Remove any residual old-nav render on those routes.
- [ ] **Step 2:** Confirm `PixelNav` has no theme toggle and shows the CV link from `home-content.json` (`hero.cvLink`). Confirm nav links: Work / Playground / About / CV, plus edit-mode-only links (Agents Hub / Docs) if desired — keep those as plain links.
- [ ] **Step 3: Build:** succeeds.
- [ ] **Step 4: Verify (browser):** nav + footer consistent across `/`, `/about`, `/playground`; Tetris footer plays; no theme toggle anywhere; mobile (390px) nav hit areas ≥40px, no overflow.
- [ ] **Step 5: Commit:** `git add -A && git commit -m "feat(chrome): pixel nav + footer across browse routes"`

---

## Phase 5 — Case-study article (re-skin existing editor)

### Task 10: Article pixel chrome + tokens (view mode)

**Files:** Modify `src/pages/CaseStudyArticle.jsx`; Modify/replace its stylesheet with pixel article styles (borrow visual treatment from `src/themes/pixel/pages/CaseStudy.css`: sticky section labels, 62ch measure, facts strip, hairline rules).

**Interfaces:**
- Consumes: existing `project.article.blocks` schema (authoritative — do not change), pixel tokens, `PixelShell` field/grid pieces.
- Produces: pixel-styled article; slide mode remains untouched.

- [ ] **Step 1:** Read `src/themes/pixel/pages/CaseStudy.jsx` + `.css` for the article visual system (section grouping at eyebrow headings, sticky left label, right prose at `--measure`, facts strip, block styles for heading/paragraph/figure/quote/bullets/cards/callout/checklist/divider).
- [ ] **Step 2:** In `CaseStudyArticle.jsx`, add pixel chrome to the **article view only** (background grid + a low-fade heat field + `PixelNav`), rendered when `viewMode==='article'`. Do NOT render it in slide mode (guard on the existing viewMode/`?view=slides`).
- [ ] **Step 3:** Restyle each block renderer's className/CSS to the pixel treatment using pixel tokens (type scale, `--rule`, `--measure`, `--radius:2px`). Keep all block JSX/logic; change presentation only.
- [ ] **Step 4: Build:** succeeds.
- [ ] **Step 5: Verify (browser):** open a case study article → pixel-styled long-form read, 62ch measure, sticky labels, facts strip. Press **P** → slides open, **unchanged**. Press **A/Esc** → back to pixel article. Verify on all real studies in `case-studies/index.js`.
- [ ] **Step 6: Commit:** `git add src/pages/CaseStudyArticle.* && git commit -m "feat(article): re-skin case-study article to pixel design"`

### Task 11: Article edit affordances re-skin

**Files:** Modify `src/pages/CaseStudyArticle.jsx` (BlockShell edit controls, insert zones, add-block modal styles).

- [ ] **Step 1:** Restyle the edit affordances (block-type dropdown, move/duplicate/edit-JSON/delete buttons, insert zones, add-block modal) to pixel tokens — keep all handlers/ops wiring intact.
- [ ] **Step 2: Build + lint:** green.
- [ ] **Step 3: Verify (browser):** edit mode on an authored article → add a paragraph, move a block, upload a figure, edit text → all persist after reload. Derived-article seed bar still works. Slide edit mode still works (out of scope but must not regress).
- [ ] **Step 4: Commit:** `git add src/pages/CaseStudyArticle.jsx && git commit -m "feat(article): pixel-skin the block editor affordances"`

---

## Phase 6 — CV

### Task 12: CV template re-skin (view)

**Files:** Modify `src/pages/CVBuilder.jsx` (route element → wrap in `PixelLayout` or add pixel chrome), `src/pages/CVBuilder.css` (template visual → pixel tokens/type).

- [ ] **Step 1:** Read `CVBuilder.jsx`/`.css` to separate the **printable CV template** markup from the **editor UI** and the **PDF/print export** logic (`fontSize`, `contentWidth`, A4 pt/mm). Note the print stylesheet / `@media print` rules.
- [ ] **Step 2:** Re-skin the CV template (name/title/contact, experience, education, skills, etc.) to pixel type + tokens (`--ink`, `--rule`, Sneak, `--measure`-aware column). Keep the layout controls (columns/font size/content width/section order/visibility) functional.
- [ ] **Step 3:** Preserve print fidelity: ensure `@media print` still yields a clean A4 PDF (Sneak embeds or falls back cleanly). Test export.
- [ ] **Step 4: Build:** succeeds.
- [ ] **Step 5: Verify (browser):** `/cv` renders pixel-styled CV; editor edits persist (localStorage `portfolio_cv_builder`); **print/PDF export** produces a correct A4 document.
- [ ] **Step 6: Commit:** `git add src/pages/CVBuilder.* && git commit -m "feat(cv): re-skin CV template to pixel; keep editor + PDF"`

---

## Phase 7 — QA + cleanup

### Task 13: Tooling routes light-touch pass

**Files:** `src/App.jsx` (ensure `/present`, `/docs/slides`, `/design-system`, `/agents-hub` still resolve and render without crashing under the new token layer).

- [ ] **Step 1:** Visit each tooling route; confirm no crash and no illegible contrast from the token remap. Apply minimal fixes only (no pixel polish).
- [ ] **Step 2: Build:** succeeds.
- [ ] **Step 3: Commit (if changed):** `git add -A && git commit -m "chore(tools): keep tooling routes functional under pixel tokens"`

### Task 14: Cross-surface edit + persistence QA

**Files:** none (verification) — fixes committed against the relevant file if found.

- [ ] **Step 1:** Edit-mode sweep: toggle **Cmd/Ctrl+E**; edit hero, a project card, an about bio line, an article block, a CV field; reload each; confirm persistence (IndexedDB + localStorage).
- [ ] **Step 2:** Navigation sweep: `/` → card → `/project/:id` article → **P** slides → **A** article → back home. No dead links, no scroll jumps beyond `ScrollToTop` behavior.
- [ ] **Step 3:** Mobile sweep at 390 / 768 / 1440: home, about, playground, article, CV — no overflow; nav hit areas ≥40px; multi-image figures stack ≤760px.
- [ ] **Step 4:** Fix any issue found in the owning file; `npm run build` after each fix.
- [ ] **Step 5: Commit:** per fix, `git commit -m "fix(qa): <what>"`.

### Task 15: Slide-insulation final verification

**Files:** none (verification).

- [ ] **Step 1:** Open 2+ real case studies, press **P**, and confirm slide typography, sizes, colours, and canvas scaling are pixel-for-pixel the same as `backup/pre-pixel-migration` (compare against a second checkout/tab if needed).
- [ ] **Step 2:** Confirm the Figma-canvas scaler still fires (DevTools: `--slide-canvas-scale` present on the artboard) and slide edit mode is intact.
- [ ] **Step 3:** If any drift: fix the `.case-study .slide-inner` insulation in `pixel-tokens.css` and re-verify. Do NOT edit `CaseStudy.css` canvas rules.
- [ ] **Step 4: Commit (if changed):** `git add src/design-system/pixel-tokens.css && git commit -m "fix(slides): tighten insulation so deck is unchanged"`

### Task 16: Retire the second entry + dead components

**Files:** `pixel.html`, `vite.pixel.config.mjs`, old default presentational components no longer routed.

- [ ] **Step 1:** Decide per the user's answer: fully remove `pixel.html` + `vite.pixel.config.mjs`, or keep `/compare`. (Default: keep `pixel.html` until the user confirms, remove `vite.pixel.config.mjs` only if unused.)
- [ ] **Step 2:** Identify default components no longer imported anywhere (`git grep` each of `Hero`, `Projects`, old `Navigation`, old `Footer`, `Home`). Only remove ones with zero remaining imports. Keep anything the slide deck or tools still use.
- [ ] **Step 3: Build + lint:** green. **Verify** the full site once more.
- [ ] **Step 4: Commit:** `git add -A && git commit -m "chore: retire second Vite entry and dead default components"`

---

## Self-Review

**Spec coverage:** §Decisions 1-5 → Tasks 1-16; §4a tokens → Task 1; §4b slide insulation → Tasks 1 + 15; §4c engines/layout → Tasks 4-5; §4d per-surface → Tasks 6-13; §Contexts → Tasks 2-3; §CV → Task 12; §Risks → Tasks 1/2/14/15; §Phase 8 cleanup → Task 16. All spec sections covered.

**Placeholder scan:** The two `<ORIGINAL …>` markers in Task 1 are resolved by Task 1 Steps 1+3 (read from `index.css`, paste) — a concrete instruction, not a deferred TODO. No other placeholders.

**Type consistency:** EditContext API names (`updateContent`, `updateNestedContent`, `openMediaLibrary`, `useEdit`) used consistently in Tasks 2/7/8/11; `PixelLayout({children, fade})` signature defined in Task 4 and consumed with `fade="index|about|playground"` in Tasks 6/8. Route path `/project/:id` used consistently after Task 5.

**Note on granularity:** Tasks 7, 10, 11, 12 are the largest (edit re-add, article re-skin, editor re-skin, CV re-skin). Each is independently testable and may warrant its own sub-session; steps are scoped so a reviewer can accept/reject each on its own.
