# Visual redesign — audit + plan (Step 1)

Inspiration: itsoffbrand.com (studied for layout rhythm, type scale, spacing,
motion feel, nav behaviour, and the scroll-following 3D orb). This document is
the Step 1 deliverable: what exists, what must not change, what the new system
is, and how each later step lands. Nothing visual has been built yet.

Branch: `redesign/offbrand-inspired`. Original design: tag `pre-redesign-backup`
/ branch `backup/original-design`. Rollback: `REDESIGN_ROLLBACK.md`.

---

## 1. What the reference actually does (measured, not guessed)

Pulled from the live site's stylesheet, markup and scripts.

| Axis | Reference | Takeaway for us |
|---|---|---|
| Type | One geometric sans ("Ataero"), weight 400 everywhere. h1 `5em` / line-height `1` / `-0.03em`, uppercase. h2 `3–3.5em`. Body line-height `1.4`. | Personality comes from **scale and tightness**, not from mixing families or weights. |
| Palette | Bg cream `#fffce1` / `#e5e4e0`; ink `#1d1d1d` / `#0e100f`; three pops (yellow `#facb0e`, pink `#f06ba8`, cyan `#78bae6`) used only in small chips/hovers. | High-contrast neutral canvas, **one or two saturated moments per screen**. |
| Spacing | Full-bleed stacked sections, very tall vertical rhythm, content in a centred max-width. | A single `--section-y` rhythm, generous gutters. |
| Radii | `.625em` (10px) cards, `6.25em`/`100vw` pill buttons, `.4rem` small. | 10 / 16 / pill. |
| Motion | Lenis smooth scroll; `transform .6s cubic-bezier(.165,.84,.44,1)` (out-quart) on hovers; a playful `.4s cubic-bezier(.68,-.55,.265,1.55)` (back-out) on buttons; loader with %. | Two easings, four durations. One orchestrated intro, restraint elsewhere. |
| Nav | Sticky bar: logo left, 5 links + pill CTA right; social icons; full-screen mobile menu. | Ours already has this shape — restyle, don't rebuild. |
| Orb | Three.js, `MeshPhysicalMaterial` (transmission/glass, iridescence, env-map) + simplex-noise displacement (`noiseAmplitude/Frequency/Speed` uniforms); `position/radius/scale` targets **lerped** from scroll; decorative outline rings. | Same mechanics, **original material**: our own shader, our own colours (no glass/env-map copy). |

---

## 2. Audit — what exists

### 2.1 Site-level surfaces (in scope for the redesign)

| Area | Files | Notes |
|---|---|---|
| Global tokens + resets | `src/index.css` (531 l.) | 2-layer tokens (primitives → semantic), light/dark, fluid type + spacing. **No shadow, z-index or easing tokens exist.** |
| App shell | `src/App.jsx`, `src/App.css` | `Navigation` → `<main>` routes → `Footer` (not on /about, /playground) → `EditPanel`. `ScrollToTop` on route change. Global reduced-motion kill-switch in App.css. |
| Nav | `Navigation.jsx/.css` (260/551) | `position: fixed`, z 1000, frosted bg; transparent on `/` until 24px scroll; active-link logic; full-screen framer mobile menu; theme toggle + "View CV" pill. |
| Hero | `Hero.jsx/.css` (251/507) + `HeroSparkles.jsx` (498) | Greeting, per-char name, rotating role (GSAP), description, 2-row marquee. **Canvas 2D** sparkles (no WebGL anywhere today). `HeroCanvas/HeroGridArt/HeroInlineArt` are **unmounted**. |
| Projects grid | `Projects.jsx/.css` (1999/5537) | 5 cards, all `mediaMode: template` + `cardBg: gradient` (orange → partner colour, GSAP drift). **~4,200 of 5,537 CSS lines are dormant alternate media modes.** |
| Footer | `Footer.jsx/.css` (154/306) | 4-line CTA ("How about / we do a thing / Or two, / Together"), sitemap, copyright. |
| About | `pages/About.jsx/.css` (648/1012) + `AboutRotator` | Hero title, portrait + bio, skills word-wheel, experience (edit-only). |
| Playground | `pages/Playground.jsx/.css` (747/708) | Header, sticky-rail projects, lightbox. |
| Case-study article | `pages/CaseStudyArticle.jsx/.css` (1688/2215) | 13 block renderers; own `--cs-*` tokens; fixed px type scale (98 literals). Renders inside `.case-study--article`, **its own scroll container**. |
| Buttons / toggle | `AnimatedButton.*`, `ThemeToggle.*` | Per-character roll on hover; framer spring thumb. |
| Dead (unmounted) | `Contact`, `ServicesSection`, `SplashScreen`, `HeroCanvas`, `HeroGridArt`, `HeroInlineArt` | Not restyled. Left untouched. |

### 2.2 Tooling surfaces (NOT restyled — they inherit palette/fonts only)

`CaseStudy.jsx/.css` (slide deck, 9.6k/17.7k l., fixed 1920×1080 canvas system),
`PresenterView`, `SlideDocumentation`, `CVBuilder`, `DesignSystem`, `AgentsHub`,
`EditPanel`, `MediaLibraryModal`, `ImageAnnotations`.

They consume the shared semantic tokens heavily (the deck alone: `--color-accent`
×363, `--font-body` ×115, `--text-*` ×120, `--radius-*` ×40, `--transition-*` ×35).
**Therefore:** legacy token *names and values* stay as aliases; the new system
adds new names. Palette and fonts are the only shared values that change, and
the deck can be pinned (see decisions).

### 2.3 Hardcoded values to migrate (site-level CSS)

| File | colour literals | font-size literals | shadows | duration literals | radius literals |
|---|---|---|---|---|---|
| Projects.css | 184 | 60/72 | 81 | 31/94 | 77/116 |
| CaseStudyArticle.css | 27 | 98/98 | 15 | 27/30 | 49/49 |
| About.css | 4 | 23/39 | 4 | 3/12 | 7/15 |
| Playground.css | 14 | 17/20 | 3 | 0/10 | 9/17 |
| Hero.css | 16 | 7/14 | 0 | 10/10 | 6/6 |
| Navigation.css | 7 | 11/16 | 3 | 1/8 | 1/4 |
| Footer / AboutRotator / AnimatedButton / ThemeToggle / App | 0 | 10/21 | 0 | 11/17 | 4/4 |

z-index stack today: 9999 (splash, publish bar) · 3000 · 1001 (logo, hamburger) ·
1000 (nav, lightbox) · 999 (mobile menu) · 100 · 60 · 30 · 10 · 6 · 5 · 2 · 0–4 (≈150
rules in Projects media modes) · -1.

### 2.4 Two traps for Step 2 (found in code)

1. **EditContext injects tokens at runtime.** `EditContext.jsx:507-514` writes
   `--font-display`, `--font-body`, `--color-accent`, `--spacing-section`,
   `--container-max-width` inline on `<html>` from `defaultStyles` (gated by
   `DS_VERSION = 'satoshi-1'`). Changing `index.css` alone does nothing — the new
   values must also land in `defaultStyles` with a bumped `DS_VERSION`. (Light-mode
   accent is actually `#ff584a` at runtime today because of this, not `#cc3520`.)
2. **Smooth scroll is CSS today** (`html { scroll-behavior: smooth }`) and
   `ScrollToTop` toggles it. Lenis replaces it; the article keeps its own native
   scroller.

### 2.5 Content and logic freeze (must not change)

- **Routes** (`App.jsx:70-78`): `/`, `/about`, `/playground`, `/project/:projectId`,
  `/present/:projectId`, `/docs/slides`, `/cv`, `/design-system`, `/agents-hub`.
  `_redirects` / `netlify.toml` SPA rewrite.
- **Copy sources**: `src/data/home-content.json` (hero, about, projects, playground,
  footer, styles), `src/data/about-content.json`, `src/data/case-studies/*.json`
  (+ `index.js` slugs), `EditContext.defaultContent`, `Projects.defaultProjects`
  (now `src/data/homeProjects.js`).
- **Hardcoded strings**: hero marquee words + `HERO_ROLES`; nav labels (Work /
  Playground / About, edit-only Agents Hub / Docs / CV Builder / Design System),
  "View CV", "Check my CV", "LinkedIn"; footer "Get in touch", "Explore",
  "Connect", copyright line; About fallbacks + "Get in touch"; Playground
  placeholders + empty state; article "Back", contact strip, "Read case study";
  `index.html` title/meta/OG.
- **State**: `ThemeContext` (localStorage `theme`, `data-theme`, theme-color
  meta), `EditContext` (Cmd/Ctrl+E, IndexedDB/localStorage persistence,
  migrations, save/push endpoints), `devStore`.
- **Behaviour**: hero role rotation + intro; nav scroll/transparent/active/mobile
  lock; footer CTA reveal; projects grid reveal, upload/iframe/remove/reorder
  (edit); About uploads/saves; Playground lightbox keys + video IO; article P / A
  / Esc keys, presenter BroadcastChannel, seed/revert; CaseStudy deck everything.
- **Dev plumbing**: `vite-plugin-save-case-study.js` endpoints, `iframes.js`,
  `agentsHubApi.js`; only `import.meta.env.DEV` is read.
- **Tests**: 4 `node --test` files (47 passing) — keep green.

Baseline: 0 console errors on `/`, `/about`, `/playground`, `/project/wizecare`
at 1440 and 390 wide.

---

## 3. Design direction

### Intent
Keep Lior's voice (coral, Satoshi, the orange→partner-colour card gradients that
already exist) and borrow the reference's **discipline**: one type family, huge
quiet headlines, flat high-contrast canvas, one living 3D element that ties the
page together as you scroll.

### Goals
- A tokenised visual layer: every colour, size, space, radius, shadow, duration,
  easing and z-index on site-level surfaces comes from one file.
- A fixed-canvas 3D blob that starts in the hero and follows the scroll through
  Home (hero → work → footer CTA), with graceful fallbacks.
- Lenis smooth scroll, one orchestrated intro, restrained reveals, meaningful
  hover states.

### Non-goals / anti-goals
- No copy, data, route or logic changes. Component props and behaviours stay.
- No restyle of the slide deck, CV builder, agents hub, docs, edit panel.
- Not a clone: no uppercase-everything, no glass/env-map orb, no yellow/pink/cyan.
- Anti-goal: landing on the "cream + serif + warm accent" template look.

### The one memorable thing
The blob. Its colour story is the **card gradient language the site already
owns**: orange `#FF8A3D` melting into a partner colour (blue / purple / green /
pink / teal). In the hero it is coral-orange → lavender; as you scroll past each
project card it borrows that card's partner colour; at the footer it settles to
coral → ink. Everything else stays flat and quiet.

---

## 4. Tokens — two options (pick one)

Both share: ink `#22211f` on `#f7f9f4` (≈15:1), dark `#ffffff` on `#0a0a0a`,
coral accent (`#cc3520` text / `#ff584a` fills), the card-gradient palette, the
same spacing / radius / motion / z-index scales. They differ in **type** and in
**how colour is spent**.

### Option A — "Coral Mono" (recommended)
- **Type**: Satoshi only. Display 500, headings 500, body 400. Sentence case.
  Display `clamp(3.5rem, 8.5vw, 7.5rem)` / line-height 0.95 / `-0.035em`.
- **Colour**: neutrals + coral as the single accent. The blob is the only place
  the gradient palette appears outside the project cards.
- **Mood**: crisp, product-led, closest to the reference's single-family
  discipline. Crimson Text is retired from site-level surfaces (it stays
  available for the deck).

### Option B — "Paper & Serif"
- **Type**: Crimson Text for display/headings (italic for the emphasis lines the
  site already uses, e.g. "that matter"), Satoshi body. Display
  `clamp(3.75rem, 9vw, 8rem)` / 1 / `-0.02em`.
- **Colour**: neutrals + coral, plus the four showcase pastels (lavender, pink,
  orange, lime) as **section washes** that the blob morphs between.
- **Mood**: editorial, warmer, keeps today's serif identity.
- **Risk** (stated plainly): serif display + warm accent drifts toward the
  generic "designer portfolio" template. Mitigated by keeping the cool-green
  off-white instead of cream and by spending colour in the blob, not in type.

### Shared scales (both options)

```
Type (fluid, desktop ceiling):  display 120 · h1 72 · h2 48 · h3 32 · lead 22 ·
                                body 17 · small 15 · caption 13
Leading:  0.95 / 1 / 1.1 / 1.25 / 1.45 / 1.6     Tracking: -0.035 / -0.02 / 0 / 0.01em
Weights:  400 / 500 / 600 / 700
Space:    4 8 12 16 24 32 48 64 96 128 160   --section-y: clamp(96px, 12vw, 192px)
          --gutter: clamp(16px, 4vw, 64px)   --container 1440 · --content 1120 · --measure 64ch
Radius:   --radius-card 10 · --radius-media 16 · --radius-panel 24 · --radius-pill 999
          (legacy --radius-sm/md/lg 8/12/16 kept as aliases)
Shadow:   --shadow-float (lavender float, light) / (black, dark) · --shadow-overlay · none at rest on cards
Motion:   --dur-1 150ms · --dur-2 300ms · --dur-3 600ms · --dur-4 1000ms
          --ease-out  cubic-bezier(.165,.84,.44,1)   --ease-inout cubic-bezier(.76,0,.24,1)
          --ease-back cubic-bezier(.34,1.56,.64,1)
Z:        --z-base 0 · --z-raised 10 · --z-sticky 100 · --z-nav 1000 · --z-overlay 1100 ·
          --z-modal 1200 · --z-toast 1300 · --z-splash 9999 ; blob canvas = 0, content = 1
```

Token file: `src/styles/tokens.css` (new), imported first by `index.css`. It
contains primitives, semantic tokens (light + dark), the new scales, and the
**legacy aliases** (`--text-*`, `--spacing-*`, `--radius-sm/md/lg`,
`--transition-*`, `--container-*`, `--w-*`, `--lh-*`, `--fw-*`, `--ls-*`) at
their current values so tooling surfaces don't move.

---

## 5. Plan per step

### Step 2 — tokens
1. Create `src/styles/tokens.css`; move Layer 1/2 out of `index.css`; add the new
   scales + legacy aliases.
2. Update `EditContext.defaultStyles` (fonts, accent) + bump `DS_VERSION` so the
   runtime injection matches (trap 2.4-1).
3. Replace literals in site-level CSS with tokens (table 2.3). Projects.css: live
   rules only; dormant media modes untouched. Article: map its px scale onto the
   new type tokens, keep `--cs-*` local names.
4. Verify: build, 0 console errors, screenshots light/dark × 1440/390.

### Step 3 — components (styling + wrappers only; props/behaviour identical)
- **Nav**: fixed; transparent over the hero → frosted bar after 24px (existing
  logic). Links: ink at 60% → 100% with an underline that grows from the left
  (`--ease-out`, `--dur-2`); active = 100% + 4px dot. "View CV" pill stays
  (`AnimatedButton`). Mobile menu: display-size links, same open/close logic.
- **Buttons**: pill; primary = ink fill / bg text; secondary = 1px ink outline;
  hover swaps fill with `--ease-back --dur-2`. Focus ring = coral 2px offset.
- **Links**: underline-on-hover from left; coral only on hover/active.
- **Cards / project tiles**: keep gradient media; radius `--radius-card`; no
  shadow at rest; hover = media zoom 1.03 + `--shadow-float`. Labels sentence
  case.
- **Section headers**: display-size, left-aligned, no caps eyebrow (the
  `.section-label` stays sentence case on mobile too).
- **Footer**: the four CTA lines at display size; sitemap in two columns; hairline
  above copyright.
- **About / Playground**: same tokens; the portrait gets `--radius-media`; the
  word wheel keeps its JS.
- **Article**: type tokens + spacing; block renderers untouched.

### Step 4 — blob (new deps: `three`, `@react-three/fiber`)
- `src/components/blob/BlobCanvas.jsx` (lazy-loaded), fixed full-screen,
  `pointer-events: none`, z 0; content wrappers z 1.
- `BlobMaterial`: custom `ShaderMaterial`. Vertex: 3D simplex noise, 2 octaves,
  amplitude/frequency/speed uniforms, time + scroll-driven amplitude. Fragment:
  half-lambert key light + fill + rim (fresnel), two-colour gradient (orange →
  partner) by view-normal, fresnel-shifted hue for a hint of iridescence, blue
  noise dither. Colours come from CSS tokens read at mount + on theme change.
- Geometry: `IcosahedronGeometry(1, 64)` desktop, `(1, 32)` mobile.
- Scroll: sections declare `data-blob="hero|work|footer"` keyframes (x, y, scale,
  partner colour, amplitude). A scroll store (fed by Lenis) interpolates between
  keyframes; the frame loop `damp`s toward the target (no jank, no direct
  scroll→transform).
- Guards: `prefers-reduced-motion` → static pose, time frozen, no morph;
  `visibilitychange` → stop the loop; DPR capped at 1.5; no WebGL → CSS
  radial-gradient fallback with the same colours; article/tooling routes unmount.
- Pages: Home (hero → work → footer), About (behind the title, small), Playground
  (header). Article and deck: none.

### Step 5 — motion + polish (new dep: `lenis`)
- Lenis on `window`; drop `html { scroll-behavior: smooth }`; `ScrollToTop` uses
  `lenis.scrollTo(0, { immediate: true })`; GSAP `ScrollTrigger.update` on Lenis
  scroll; the article's own scroller stays native.
- One intro: nav + hero lines + blob scale-in, one timeline. Section reveals keep
  their triggers, unified to `--dur-3 / --ease-out`, once.
- Route transitions: short cross-fade (`AnimatePresence` around `Routes`) + blob
  pose change; respects reduced motion.
- Responsive pass at 390 / 768 / 1024 / 1440 / 1920, light + dark, keyboard focus.

Each step: `npm run build`, dev server, 0 console errors, screenshots, one commit.

---

## 6. Decisions for Lior (Step 1 gate)

1. **Token option**: A (recommended) or B.
2. **Dependencies to approve**: `three@^0.186`, `@react-three/fiber@^9.8`
   (React 19 peer), `lenis@^1.3`. No drei. (~150 kB gzip for three, lazy-loaded.)
3. **Slide deck fonts/accent**: inherit the new palette/fonts, or pin the deck to
   today's Crimson/Satoshi/coral inside `.case-study`? Recommended: pin.
4. **Article**: light token pass (recommended) or leave as-is?
5. **Dead components**: leave untouched (recommended) or delete in a separate
   cleanup commit?
