# Theme audit — Portfolio v3

Phase 0 output. **Read-only pass.** No source file was modified to produce this.

Branch: `pixel-theme` (created at `19df82e`, working tree clean at branch point).

Purpose: establish what the current design system actually is, where it is
consumed from, what would break a theme swap, and where a parallel theme can
live without editing a single existing file.

---

## 1. Colour tokens

Defined in `src/index.css`. Three layers: primitives (L1, raw values) →
semantic (L2, theme-aware) → component-level. **Consumers counted across all
74 `.css`/`.jsx`/`.js` files under `src/`, excluding `index.css` itself.**

### Layer 2 — semantic (what components actually consume)

| Token | Uses | Files |
|---|---|---|
| `--color-accent` | 777 | 23 |
| `--color-text` | 707 | 21 |
| `--color-text-muted` | 384 | 18 |
| `--color-border` | 365 | 17 |
| `--color-bg` | 346 | 18 |
| `--color-bg-secondary` | 178 | 12 |
| `--color-accent-contrast` | 34 | 10 |
| `--color-error` | 33 | 3 |
| `--color-accent-soft` | 12 | 3 |
| `--color-border-soft` | 12 | 5 |
| `--color-success` | 7 | 2 |
| `--color-accent-vivid` | 4 | 1 |
| `--color-warning` | 4 | 1 |
| `--color-error-soft` | 3 | 1 |
| `--color-success-soft` | 1 | 1 |
| `--color-warning-soft` | 1 | 1 |
| `--color-image-contain-bg` | 0 | 0 |
| `--color-accent-strong` | 0 | 0 |
| `--color-info` | 0 | 0 |
| `--color-info-soft` | 0 | 0 |

Named accent palette (project-card presets) and showcase pastels:

| Token | Uses | Files |
|---|---|---|
| `--showcase-orange` | 66 | 1 |
| `--accent-warm` | 13 | 1 |
| `--accent-violet` | 7 | 1 |
| `--showcase-lavender` | 3 | 1 |
| `--accent-cool` | 2 | 1 |
| `--showcase-pink` | 2 | 1 |
| `--accent-graphite` | 1 | 1 |
| `--showcase-lime` | 1 | 1 |

### Layer 1 — primitives

All 31 primitives report **0 direct consumers outside `index.css`** — which is
correct and by design. Layer 1 is referenced only by Layer 2, inside
`index.css`. The one exception is `--primitive-white` (5 uses, 2 files), which
is a minor layer violation but harmless.

**Consequence for theming:** the colour system has a genuine single choke
point. Six semantic tokens carry 2,757 of 2,865 total colour references (96%).
A theme that redefines those six has effectively redefined the site's colour.

---

## 2. Type tokens

| Token | Uses | Files |
|---|---|---|
| `--font-body` | 221 | 17 |
| `--font-display` | 40 | 13 |
| `--text-body` | 101 | 10 |
| `--text-body-sm` | 65 | 9 |
| `--text-caption` | 52 | 8 |
| `--text-h2` | 13 | 2 |
| `--text-h4` | 8 | 2 |
| `--text-h1` | 4 | 2 |
| `--text-h3` | 4 | 2 |
| `--text-label` | 3 | 2 |
| `--text-hero` | 2 | 2 |
| `--text-page-title` | 2 | 2 |
| `--text-subtitle` | 2 | 1 |
| `--text-display`, `--text-stat`, `--text-hero-name`, `--text-stat-value`, `--text-marquee`, `--text-section-title`, `--text-footer-cta`, `--text-nav-menu` | 1 each | 1 each |
| `--text-hero-role`, `--text-playground-title`, `--text-card-title`, `--text-eyebrow` | 0 | 0 |

Weight / leading / tracking:

| Token | Uses | Files | | Token | Uses | Files |
|---|---|---|---|---|---|---|
| `--fw-medium` | 62 | 11 | | `--lh-body` | 15 | 6 |
| `--fw-body` | 22 | 8 | | `--lh-heading` | 13 | 3 |
| `--fw-heading` | 21 | 6 | | `--lh-tight` | 3 | 2 |
| `--fw-semibold` | 12 | 7 | | `--lh-snug` | 1 | 1 |
| `--fw-bold` | 2 | 2 | | `--ls-heading` | 13 | 8 |
| | | | | `--ls-tight` | 5 | 3 |
| | | | | `--ls-meta` | 4 | 3 |
| | | | | `--ls-caps` | 4 | 3 |
| | | | | `--ls-label` | 1 | 1 |
| | | | | `--ls-wide` | 0 | 0 |

The type scale is **fluid-first**: nearly every `--text-*` is a `clamp()`.
The pixel theme's spec calls for a different relationship (fixed tracking
targets at `-.035em` display / `-.015em` body, `.92`/`1.06` leading, a `62ch`
measure). Those are incompatible values, not incompatible structures — the
same token *names* can carry them.

---

## 3. Blockers — hardcoded colour and font

Files that bypass the token layer. Listed as blockers per the phase brief.
**None of these are being fixed** — fixing them means editing existing files,
which this plan forbids. They are recorded so the pixel theme knows what it
cannot inherit.

| File | Hardcoded hex | Hardcoded rgba() | Hardcoded font-family |
|---|---|---|---|
| `src/pages/CaseStudy.css` | 75 | 312 | 5 |
| `src/components/Projects.css` | 43 | 136 | 2 |
| `src/pages/CVBuilder.css` | 70 | 36 | 4 |
| `src/pages/AgentsHub.css` | 19 | 10 | 1 |
| `src/pages/CaseStudyArticle.css` | 14 | 17 | 2 |
| `src/components/HeroSparkles.jsx` | 18 | 8 | — |
| `src/pages/CVBuilder.jsx` | 18 | 0 | — |
| `src/pages/SlideDocumentation.css` | 13 | 9 | — |
| `src/components/Hero.css` | 1 | 15 | — |
| `src/pages/Playground.css` | 5 | 9 | — |
| `src/pages/PresenterView.css` | 5 | 8 | 1 |
| `src/components/SplashScreen.css` | 0 | 12 | — |
| `src/components/Navigation.css` | 0 | 7 | — |
| others (14 files) | ≤5 each | ≤5 each | — |

**Verdict on the blockers.** `Projects.css` is the one that matters — 179
hardcoded colour values in the component the pixel theme's "selected work grid"
must render. `Hero.css` (16) and `Navigation.css` (7) matter next. The pixel
theme therefore **cannot reuse `Projects`, `Hero`, `Navigation`, `Footer` or
`SplashScreen` as-is** and get a correct pixel surface — it composes its own
presentational components in `src/themes/pixel/`, reading the same data.

`CaseStudy.css` / `CVBuilder.css` / `AgentsHub.css` / `SlideDocumentation.css`
/ `PresenterView.css` are out of scope entirely (slide canvas and tools), so
their counts are informational only.

---

## 4. How theming works today

Three mechanisms, stacked. The second and third are the ones that bite.

**(a) CSS custom properties, three layers** — `src/index.css`.
124 token definitions. Light is `:root`; dark is a `[data-theme="dark"]` block
at line 217 that redefines 22 semantic tokens. Clean, and the reason a second
theme is viable at all.

**(b) `ThemeContext` owns the `data-theme` attribute** —
`src/context/ThemeContext.jsx:26`.

```js
root.setAttribute('data-theme', theme);   // 'light' | 'dark'
root.style.colorScheme = theme;
localStorage.setItem('theme', theme);
```

> **COLLISION.** The pixel plan specifies scoping its tokens to
> `[data-theme="pixel"]`. That attribute is already owned by this effect and is
> rewritten on every theme change, so a third value cannot survive there.
> A same-document pixel theme would need a *different* attribute (`data-ds`).

**(c) `EditContext` injects three tokens as inline styles** —
`src/context/EditContext.jsx:484-488`.

```js
root.style.setProperty('--font-display', styles.fonts.display);
root.style.setProperty('--font-body',    styles.fonts.body);
root.style.setProperty('--color-accent', styles.colors.accent);
root.style.setProperty('--spacing-section', ...);
root.style.setProperty('--container-max-width', ...);
```

Values come from `defaultStyles` → `localStorage.siteStyles` → Dexie →
optional `home-content.json`, gated by `DS_VERSION` (`'satoshi-1'`) and
`migrateStyles()`.

> **COLLISION.** These are *inline styles on `:root`*. Inline specificity beats
> any attribute-scoped CSS rule. A same-document pixel theme would silently
> inherit Satoshi and coral for `--font-body` / `--font-display` /
> `--color-accent` no matter what its own stylesheet declared.

**(d) No Storybook.** Not installed, no `.storybook/`, nothing in
`package.json`. The in-repo equivalent is the `/design-system` route
(`src/pages/DesignSystem.jsx`, 476 lines of CSS). Phase 8's Storybook stories
have no host and must be retargeted.

---

## 5. Recommendation — where the parallel theme lives

**Serve the pixel theme as its own Vite HTML entry, not as a route.**

```
pixel.html                    →  http://localhost:5173/pixel.html
src/themes/pixel/main.jsx     →  its own createRoot, its own router
```

Vite's dev server serves any root-level `.html` file at its own path with no
configuration. So this requires **zero edits to `index.html`, `src/main.jsx`,
`src/App.jsx` or `vite.config.js`.**

Why this beats a `/pixel` route inside `App.jsx`:

| | Separate entry | `/pixel` route |
|---|---|---|
| Existing files modified | **0** | 1 (`App.jsx`) |
| `data-theme` collision (§4b) | **cannot occur** — no `ThemeProvider` mounted | must migrate to `data-ds` |
| `EditContext` inline override (§4c) | **cannot occur** — no `EditProvider` mounted | must scope to a wrapper + redeclare 3 vars |
| Token scoping needed | none — `:root` is free in its own document | `[data-ds="pixel"]` on every rule |
| Rollback test | true by construction | requires verifying a diff |

The separate entry dissolves both collisions rather than working around them.
Pixel `tokens.css` can safely use `:root`, because it is a different document.

**Known cost, accepted and deferred.** `vite build` only emits entries listed
in `build.rollupOptions.input`, which currently defaults to `index.html` alone.
So `pixel.html` **will not appear in a production build** until one line is
added to `vite.config.js`. That edit is deferred to Phase 9, where the decision
to keep or drop the theme is made anyway. Through Phases 1–8 the theme is
evaluated in dev, and `git diff main --stat` stays free of modified files.

Note also `vite.config.js` pins `optimizeDeps.entries: ['index.html']` with
`noDiscovery: true` and an explicit `include` list. `react`, `react-dom`,
`react-dom/client` and `react-router-dom` are all already in that list, so a
second entry gets its dependencies pre-bundled with no config change in dev.

### Content sources the pixel app imports (read, never edit)

Importing a module is not editing it. The pixel app reads the same data:

- `src/data/home-content.json` — home copy
- `src/data/about-content.json` — about copy
- `src/data/caseStudyData.js` — case-study loader (Dexie + JSON fallback)
- `src/data/case-studies/index.js` — 5 studies: `design-system`,
  `itero-scan-view`, `itero-scan-workflow`, `patient-report`, `wizecare`
- `src/data/case-study-image-variants.json` — image variant manifest

No content is duplicated into `src/themes/pixel/`.

### Corrections to the plan, carried forward

1. Path is `src/themes/pixel/` throughout. Phases 2–3 of the plan say
   `src/pixel/`; the structure block says `src/themes/pixel/`. The latter wins.
2. Tokens go in `:root` inside `pixel.html`'s document, **not**
   `[data-theme="pixel"]` — see §4b.
3. Phase 8 Storybook stories become a foundations route inside the pixel app
   (`/pixel.html#/foundations`) — see §4d.
4. Phase 4's "compose your existing content" means *import the data, build new
   presentational components*. `Projects`/`Hero`/`Navigation` cannot be reused
   directly — see §3.

---

## 6. PROTECTED FILES

**Everything tracked in git at branch point is protected.** 1,903 tracked
files, 90 of them under `src/`. The rule is not a list to check against — it is
`git diff main --diff-filter=MD --name-only` returning empty.

Explicitly, and non-exhaustively, these must not be modified, renamed, moved or
deleted by any later phase:

```
index.html
vite.config.js                    (one line, Phase 9 only, by explicit decision)
vite.shared.mjs
vite-plugin-save-case-study.js
package.json
src/main.jsx
src/App.jsx
src/App.css
src/index.css                     ← the entire current design system
src/context/ThemeContext.jsx
src/context/EditContext.jsx
src/components/**                 (all 20+ components and their CSS)
src/pages/**                      (all 9 routes and their CSS)
src/data/**                       ← read-only import surface for the pixel app
src/utils/**
scripts/**
public/**
docs/slide-scaling-figma-style.md
CLAUDE.md
```

Writable by later phases — **only** these:

```
pixel.html
src/themes/pixel/**
docs/theme-audit.md               (this file)
docs/pixel-theme.md               (Phase 8)
docs/theme-decision.md            (Phase 9)
```

---

## 7. Verification for this phase

```
$ git diff main --stat
 docs/theme-audit.md | +N
```

One added file. No modified files, no deletions.
