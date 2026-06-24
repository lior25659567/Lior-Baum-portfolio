---
version: alpha
name: Letters (Dark)
description: The dark-adapted version of the Letters design system. The pale sky atmosphere of the light theme is deepened into a tinted midnight that still carries the brand's sky-blue DNA — never pure black. Canvas, surfaces, and panels form a four-step ladder of progressively warmer-blue darks, separated by translucent white hairlines instead of soft shadows. The primary CTA inverts: the bright black-on-white pill becomes a bright white-on-dark pill, preserving its role as the single highest-contrast surface in the system. Sky accent (`{colors.sky}`), the handwritten "Doctor" face, the pill geometry, the page rhythm of hero → body → CTA bay, and every component shape are preserved unchanged.

colors:
  primary: "#ffffff"
  on-primary: "#070709"
  accent: "#ffffff"
  sky: "#3aa9e0"
  sky-soft: "#1e3a5c"
  hero-gradient-from: "#152744"
  hero-gradient-to: "#0a1525"
  canvas: "#0a1422"
  soft-cloud: "#14223a"
  surface-raised: "#1a2b44"
  hairline: "#1f3050"
  ink: "#ffffff"
  charcoal: "#b9c2cf"
  slate: "#8d99ab"
  steel: "#6a7587"
  mute: "#5a6478"
  on-sky-panel: "#ffffff"
  caption-on-panel: "#b9c2cf"

typography:
  display-hero:
    fontFamily: Open Runde
    fontSize: 80px
    fontWeight: 600
    lineHeight: 0.90
    letterSpacing: -3.2px
  display-section:
    fontFamily: Open Runde
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.76px
  heading-lg:
    fontFamily: Open Runde
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: -0.84px
  heading-md:
    fontFamily: Open Runde
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: -0.2px
  heading-sm:
    fontFamily: Open Runde
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: -0.18px
  body-lg:
    fontFamily: Open Runde
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.17px
  body-md:
    fontFamily: Open Runde
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.49
    letterSpacing: -0.16px
  body-md-bold:
    fontFamily: Open Runde
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: -0.16px
  caption:
    fontFamily: Open Runde
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.50
    letterSpacing: -0.14px
  micro:
    fontFamily: Open Runde
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: -0.12px
  eyebrow:
    fontFamily: Open Runde
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.09
    letterSpacing: 0.22px
  handwritten-note:
    fontFamily: The Doctor
    fontSize: 38px
    fontWeight: 400
    lineHeight: 0.90
    letterSpacing: -0.38px
  handwritten-caption:
    fontFamily: The Doctor
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.14px

rounded:
  xs: 6px
  sm: 16px
  md: 18px
  lg: 24px
  xl: 32px
  xxl: 48px
  pill: 100px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 40px
  section: 64px
  bay: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md-bold}"
    rounded: "{rounded.pill}"
    padding: 16px
    height: 48px
  button-primary-pressed:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md-bold}"
    rounded: "{rounded.pill}"
    padding: 16px
    height: 48px
  button-ghost:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md-bold}"
    rounded: "{rounded.pill}"
    padding: 16px
    height: 44px
  button-disabled:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.steel}"
    rounded: "{rounded.pill}"
  pill-tab:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 8px
    height: 32px
  pill-tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
  source-chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.pill}"
    padding: 12px
    height: 40px
    width: 40px
  feature-card:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  hero-demo-card:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
    padding: 32px
  before-after-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-card:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  pricing-card-featured:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: 32px
  pricing-card-featured-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md-bold}"
    rounded: "{rounded.pill}"
    padding: 16px
    height: 48px
  testimonial-card:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  avatar-circle:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.full}"
    size: 48px
  specialty-tile:
    backgroundColor: "{colors.sky-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.md}"
    padding: 24px
    height: 96px
  time-saved-callout:
    backgroundColor: "{colors.hero-gradient-from}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: 32px
  text-input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 48px
  text-input-focused:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  nav-bar:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    height: 64px
    padding: 24px
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    typography: "{typography.body-md}"
    padding: 8px
  hero-panel:
    backgroundColor: "{colors.hero-gradient-from}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
    padding: 64px
  cta-panel:
    backgroundColor: "{colors.hero-gradient-from}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xxl}"
    padding: 64px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.charcoal}"
    typography: "{typography.caption}"
    padding: 64px
---

> This is the **dark mode** version of the Letters design system. It is fully self-contained — use this document alone when building dark-themed interfaces.

## Overview

In dark mode, Letters keeps the calm, clinical mood of the light theme but trades the pale sky panels for a quartet of deepening midnight blues. Canvas (`{colors.canvas}` — #0a1422) is a tinted dark that carries the sky-blue DNA of the brand; pure `#000000` is never used. Above the canvas sit `{colors.soft-cloud}` for cards and `{colors.surface-raised}` for elevated surfaces, with `{colors.hairline}` providing 1px separators in lieu of the soft drop shadows used in light mode.

The single biggest inversion is the primary CTA. In light mode the brand's signature high-contrast move is a **black pill on a pale canvas**; in dark mode it flips to a **white pill on a midnight canvas** — preserving the role (single highest-contrast surface, single firm shadow) while keeping the system honest about contrast direction. Every other component preserves its shape, padding, and radius unchanged: pills stay `{rounded.pill}`, hero/CTA panels stay `{rounded.xxl}`, the specialty grid stays a 4-column wall.

Sky accent shifts up one step in lightness (from #2597d0 to `{colors.sky}` #3aa9e0) so the inline brand wordmark and feature checkmarks still read crisply over the dark canvas. The handwritten "Doctor" face inside the Before/After card stays unchanged — its ivory paper background is preserved as a deliberate light island within the dark layout.

**Key Characteristics:**
- Canvas is tinted midnight (`{colors.canvas}` — #0a1422), never pure black; carries the brand's sky-blue undertone.
- Primary CTA inverts to `{colors.primary}` (white) with `{colors.on-primary}` (near-black) text — same role, mirrored values.
- Four-step surface ladder: `{colors.canvas}` → `{colors.soft-cloud}` → `{colors.surface-raised}` → `{colors.hero-gradient-from}` separates depth via tone alone.
- Sky accent shifts one step lighter to `{colors.sky}` for legibility on dark surfaces.
- Hero/CTA panels remain a deepened sky gradient: `{colors.hero-gradient-from}` (deep navy) → `{colors.hero-gradient-to}` (near-canvas).
- All radii, spacing, and typography tokens are identical to the light mode — only colors and a single shadow approach differ.
- Before/After demo card preserves its handwritten "Doctor" specimen as a deliberate light island inside the dark layout.

## Colors

### Brand & Accent
- **Sky** (`{colors.sky}` — #3aa9e0): One step lighter than light-mode sky for legibility on dark canvas. Used for the inline Letters wordmark, "Add Sources" handles, and feature-row check icons.
- **Sky Soft** (`{colors.sky-soft}` — #1e3a5c): Deepened pale-blue used for the specialty grid tiles. Reads as a moody indigo against the midnight canvas while preserving the "wall of pale tiles" rhythm of the light layout.

### Surface
- **Canvas** (`{colors.canvas}` — #0a1422): Page background and footer surface. Tinted midnight with a sky-blue undertone.
- **Soft Cloud** (`{colors.soft-cloud}` — #14223a): Card surface — feature cards, hero demo card, testimonial cards, outer pricing tiers.
- **Surface Raised** (`{colors.surface-raised}` — #1a2b44): One step warmer than soft-cloud, used for source chips, the featured pricing tier, the before/after card, secondary buttons, inputs, and avatar backgrounds.
- **Hero Gradient** (`{colors.hero-gradient-from}` → `{colors.hero-gradient-to}` — #152744 → #0a1525): Top-of-page hero panel and bottom-of-page CTA bay. Vertical sweep from a deep sky-tinted navy at the top edge into near-canvas at the bottom.
- **Hairline** (`{colors.hairline}` — #1f3050): 1px borders separating cards on dark surfaces, dividers in the footer link columns.

### Text
- **Ink** (`{colors.ink}` — #ffffff): Primary heading color. Also the primary CTA background (single highest-contrast surface in the system).
- **Charcoal** (`{colors.charcoal}` — #b9c2cf): Default body copy, nav links, footer link columns.
- **Slate** (`{colors.slate}` — #8d99ab): Tertiary text — captions under feature cards and supporting copy.
- **Steel** (`{colors.steel}` — #6a7587): Disabled-state text and faint metadata.
- **Mute** (`{colors.mute}` — #5a6478): Footer micro copy and "All rights reserved" line.
- **On Primary** (`{colors.on-primary}` — #070709): Text on `{colors.primary}` buttons. Near-black ink mirrors the light-mode flip.
- **Caption On Panel** (`{colors.caption-on-panel}` — #b9c2cf): Sub-headline copy beneath hero headlines on the gradient panels.

### Brand Gradient
- **Hero Gradient** is a vertical sweep from `{colors.hero-gradient-from}` to `{colors.hero-gradient-to}` — deep sky-tinted navy easing into near-canvas. Used identically on the top hero and the closing CTA bay; the bookend rhythm of the light theme is preserved.

## Typography

### Font Family
- **Open Runde** — Custom rounded geometric sans, the brand's only UI typeface. All weights from Regular (400) through Bold (700).
- **The Doctor** — Handwritten serif used exclusively for the "Before" sample inside the Before/After demo card. Inside dark mode this card preserves its ivory paper background as a deliberate light island.
- **Inter** — Fallback for a small number of secondary captions when Open Runde is unavailable.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-hero}` | 80px | 600 | 0.90 | -3.2px | Top-of-page hero headlines |
| `{typography.display-section}` | 44px | 600 | 1.10 | -1.76px | Major section openers |
| `{typography.heading-lg}` | 28px | 500 | 1.20 | -0.84px | Mid-section subheads |
| `{typography.heading-md}` | 20px | 600 | 1.40 | -0.2px | Card titles, specialty tile labels |
| `{typography.heading-sm}` | 18px | 600 | 1.40 | -0.18px | Small card titles, pricing tier names |
| `{typography.body-lg}` | 17px | 400 | 1.40 | -0.17px | Lead body copy, testimonial quotes |
| `{typography.body-md}` | 16px | 400 | 1.49 | -0.16px | Default body copy |
| `{typography.body-md-bold}` | 16px | 600 | 1.40 | -0.16px | Inline emphasis and CTA button labels |
| `{typography.caption}` | 14px | 500 | 1.50 | -0.14px | Nav links, supporting copy, footer columns |
| `{typography.micro}` | 12px | 500 | 1.20 | -0.12px | Tag chips, metadata |
| `{typography.eyebrow}` | 11px | 500 | 1.09 | 0.22px | Footer micro line — the only positive-tracking style |
| `{typography.handwritten-note}` | 38px | 400 | 0.90 | -0.38px | "Before" handwritten specimen inside the demo card |
| `{typography.handwritten-caption}` | 14px | 400 | 1.40 | -0.14px | Smaller handwritten lines beneath the demo sample |

### Principles
- **One typeface, many weights.** Open Runde alone carries the system; weight and tracking shifts build hierarchy.
- **Tight tracking on display sizes.** `-3.2px` letter-spacing on `{typography.display-hero}` keeps headlines sculpted on dark surfaces.
- **The handwritten serif stays a rhetorical device.** Reserved for the Before/After card; never adopted into UI chrome.
- **Inline brand emphasis** — the word "Letters" inside body copy is set in `{typography.heading-lg}` weight with `{colors.sky}`, the same micro-flourish used in light mode.

### Note on Font Substitutes
If Open Runde is unavailable, **Manrope** or **Nunito** are the closest open-source substitutes; both render slightly wider, so reduce display sizes by ~5%. **Caveat** at heavier weight is a workable stand-in for the handwritten "Doctor" face.

## Layout

### Spacing System
- **Base unit**: 8px
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 40px · `{spacing.section}` 64px · `{spacing.bay}` 96px
- **Card padding**: `{spacing.lg}` inside small feature cards; `{spacing.xl}` inside hero demo card, pricing cards, and testimonial cards.
- **Section gap**: `{spacing.bay}` (96px) between major content blocks — identical to light mode.
- **Hero/CTA bay padding**: `{spacing.section}` (64px) of inner padding.

### Grid & Container
- **Max width**: ~1200px content container.
- **Hero**: full-width pale-midnight panel, edge-to-edge; centered headline column with ~640px max measure.
- **Feature row**: 3-column grid with `{spacing.lg}` gap; collapses to 1-up on mobile.
- **Specialty grid**: 4-column tile grid of `{components.specialty-tile}` at 96px height with `{spacing.md}` gap.
- **Pricing**: 3-column tier layout — outer cards `{components.pricing-card}`, middle card `{components.pricing-card-featured}`.

### Whitespace Philosophy
Whitespace remains the primary grouping device in dark mode. Sections within the dark middle band are separated by `{spacing.bay}` of empty canvas alone — no dividers, no background-color shifts. The two midnight gradient panels (hero and closing CTA) act as the outer brackets; everything between is a single ventilated dark stack.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | No shadow / tonal step only | Default — surfaces separate via the `{colors.canvas}` → `{colors.soft-cloud}` → `{colors.surface-raised}` ladder |
| 1 | 1px `{colors.hairline}` border | Quiet separation around inputs, source chips, and feature cards on dark surfaces |
| 2 | `rgba(0,0,0,0.4) 0px 2px 8px` | Pricing cards, hero demo card, testimonial cards — deeper diffuse drop on the dark canvas |
| 3 | `rgba(0,0,0,0.5) 0px 2px 6px` | Primary CTA pill — the single firm shadow in the system, anchoring the white pill against the dark canvas |

In dark mode the system shifts more weight onto **tonal separation** (the four-step canvas → soft-cloud → surface-raised → gradient ladder) and less onto cast shadows. When shadows do appear they are darker and more diffuse than the light-mode counterparts — `rgba(0,0,0,0.4)` rather than `rgba(36,36,40,0.10)`.

### Decorative Depth
- **Hero gradient** (`{colors.hero-gradient-from}` → `{colors.hero-gradient-to}`) provides atmospheric depth at the top and bottom of every page.
- **Surface ladder** — the four progressively warmer-blue dark surfaces create gentle band separation through tonal shift, mirroring the light-mode `{colors.canvas}` → `{colors.soft-cloud}` step.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 6px | Inline tags, paper-edge inside the Before specimen |
| `{rounded.sm}` | 16px | Small content cards, secondary surface pills |
| `{rounded.md}` | 18px | Specialty tiles, mid-density feature cards |
| `{rounded.lg}` | 24px | Feature cards, testimonial cards, before/after card |
| `{rounded.xl}` | 32px | Pricing cards, time-saved callout |
| `{rounded.xxl}` | 48px | Hero panel, closing CTA bay, hero demo container |
| `{rounded.pill}` | 100px | Every button, tab, source chip, and nav active-state |
| `{rounded.full}` | 9999px | Fully-rounded pill inputs, avatar photos in testimonials, circular icon medallions |

### Photography Geometry
- **Avatar circles** (`{rounded.full}`, ~48px) for testimonial author photos. Cropped tight on the face; sit on `{colors.surface-raised}`.
- **In-product mock screenshots** retain their original light surface (a deliberate inverse island inside the dark hero demo card) — clinical screenshots remain on white paper.
- **No photographic imagery** lives in marketing chrome; the only photos are testimonial avatars.

## Components

### Buttons

**`button-primary`** — In dark mode this inverts: a bright white pill with near-black text. Used for "Sign Up", "Sign Up Now", "Start 2-Week Trial", "Try Letters Now — It's Free", "Sign Up For Free".
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.body-md-bold}`, padding `{spacing.md}`, height 48px, rounded `{rounded.pill}`. Carries the single firm shadow in the system.
- Pressed state lives in `button-primary-pressed` — the same `{colors.primary}` fill, conveyed by a deeper drop shadow rather than a hue shift.

**`button-secondary`** — Mid-tone surface pill used for nav "Login" and secondary CTAs.
- Background `{colors.surface-raised}`, text `{colors.ink}`, type `{typography.body-md-bold}`, padding `{spacing.md}`, rounded `{rounded.pill}`.

**`button-ghost`** — Soft-cloud pill used for "Start for Free" inside the basic-tier pricing card and low-emphasis confirmations.
- Background `{colors.soft-cloud}`, text `{colors.ink}`, type `{typography.body-md-bold}`, padding `{spacing.md}`, rounded `{rounded.pill}`.

**`button-disabled`** — Greyed pill for unavailable actions.
- Background `{colors.soft-cloud}`, text `{colors.steel}`, rounded `{rounded.pill}`.

**`pill-tab`** + **`pill-tab-active`** — Annual/Monthly toggle and similar mode-switch chips. Inactive: transparent background, `{colors.charcoal}` text. Active: `{colors.primary}` background, `{colors.on-primary}` text.

**`source-chip`** — Circular pills inside the hero demo card showing source-input types (camera, audio, file).
- Background `{colors.surface-raised}`, rounded `{rounded.pill}`, height/width 40px.

### Cards & Containers

**`hero-demo-card`** — Generous `{rounded.xxl}` panel framing the demo on the home and use-case heroes.
- Background `{colors.soft-cloud}`, rounded `{rounded.xxl}`, padding `{spacing.xl}`.

**`feature-card`** — The three "Personalised Letters / Seamless Source Integration / Edit and Rewrite Anytime" cards beneath the demo.
- Background `{colors.soft-cloud}`, type `{typography.body-md}`, rounded `{rounded.lg}`, padding `{spacing.lg}`.

**`before-after-card`** — Two-pane card holding the handwritten "Before" sample (`{typography.handwritten-note}`) on its preserved ivory background, paired with the typeset "After" letter on `{colors.surface-raised}`.
- Background `{colors.surface-raised}`, rounded `{rounded.lg}`, padding `{spacing.lg}`.

**`time-saved-callout`** — The "Save 5+ hours a week with Letters" figure block: a large numeric headline with its "a week with Letters" supporting line beneath.
- Background `{colors.hero-gradient-from}`, rounded `{rounded.xl}`, padding `{spacing.xl}`.

**`pricing-card`** — Outer-tier pricing cards (Letters Basic, Letters Enterprise).
- Background `{colors.soft-cloud}`, rounded `{rounded.xl}`, padding `{spacing.xl}`.

**`pricing-card-featured`** — Centre-tier pricing card (Letters Pro). Sits one step warmer than the outer tiers via `{colors.surface-raised}`, providing the only visible card-level emphasis. The embedded `{components.pricing-card-featured-cta}` carries the white primary pill.
- Background `{colors.surface-raised}`, rounded `{rounded.xl}`, padding `{spacing.xl}`.

**`testimonial-card`** — Wide soft-cloud card holding a multi-line quote, avatar circle, and author attribution.
- Background `{colors.soft-cloud}`, type `{typography.body-lg}`, rounded `{rounded.lg}`, padding `{spacing.xl}`.

**`avatar-circle`** — Round 48px portrait used in testimonial cards.
- Background `{colors.surface-raised}`, rounded `{rounded.full}`, size 48px.

**`specialty-tile`** — The 4-column grid of deepened-blue tiles on the use-case pages: Cardiologist, Dermatology, Endocrinology, ENT, etc.
- Background `{colors.sky-soft}`, text `{colors.ink}`, type `{typography.heading-md}`, rounded `{rounded.md}`, padding `{spacing.lg}`, height 96px.

**`hero-panel`** + **`cta-panel`** — Identical chrome: `{rounded.xxl}` panel filled with the `{colors.hero-gradient-from}` → `{colors.hero-gradient-to}` vertical gradient, `{spacing.section}` of inner padding.

### Inputs & Forms

**`text-input`** + **`text-input-focused`** — Pill-rounded input on `{colors.surface-raised}`.
- Background `{colors.surface-raised}`, text `{colors.ink}`, type `{typography.body-md}`, rounded `{rounded.full}`, padding `{spacing.md}`, height 48px.

### Navigation

**`nav-bar`** — Sits transparently on the hero panel: small Letters wordmark on the left, link cluster centered, `{components.button-secondary}` Login + `{components.button-primary}` Sign-up pair on the right.
- Background transparent, height 64px, padding `{spacing.lg}`.

**`nav-link`** — Individual nav link.
- Background transparent, text `{colors.charcoal}`, type `{typography.body-md}`, padding `{spacing.xs}`.

**`footer`** — Plain `{colors.canvas}` (no panel chrome) holding the wordmark, link columns, and the small "Made with love in Sydney, Australia" line.
- Background `{colors.canvas}`, text `{colors.charcoal}`, type `{typography.caption}`, padding `{spacing.section}`.

### Signature Components

- **`hero-demo-card`** remains the brand's central rhetorical artifact in dark mode — the dark canvas allows the inset white "After" letter mock to read as luminous paper.
- **`specialty-tile`** grid is the second signature: the wall of deepened-blue tiles preserves the 4-column rhythm and the "wall of names" effect of the light theme.
- **`time-saved-callout`** is the only place numeric figures get the `{typography.display-section}` treatment — making "5 hours+" feel like a headline.

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` (white pill) for primary CTAs and the active-tab indicator only. It is the single highest-contrast surface in dark mode.
- Use `{colors.sky}` only for the brand wordmark inline, "Add Sources" handles, feature checkmarks, and small inline glyphs — never as a button background.
- Default every button, tab, input, and source chip to `{rounded.pill}`.
- Bookend pages with the `{colors.hero-gradient-from}` → `{colors.hero-gradient-to}` panel at the top and the same gradient at the bottom.
- Use the four-step surface ladder (`{colors.canvas}` → `{colors.soft-cloud}` → `{colors.surface-raised}` → `{colors.hero-gradient-from}`) for depth; reach for shadows only when separating the primary CTA from its surface.
- Set every UI string in **Open Runde**; rely on weight for hierarchy, not on additional typefaces.

### Don't
- Don't use pure black (`#000000`) as canvas. Tinted midnight (`{colors.canvas}` — #0a1422) is non-negotiable.
- Don't apply the handwritten serif (`{typography.handwritten-note}`) to UI copy or headings — keep it inside the Before/After demo card.
- Don't add a colored border around the featured pricing card. Emphasis comes from the embedded white CTA and the `{colors.surface-raised}` step, not from card chrome.
- Don't use rectangular buttons or sharp-corner inputs anywhere — the pill is non-negotiable.
- Don't use heavy "glow" outlines on dark surfaces. The system reads as quiet, not neon.
- Don't fill the gradient panels with imagery or icon clutter — the deep sky is meant to read as headroom.
- Don't tint body text below `{colors.steel}` opacity-equivalent (#6a7587) outside disabled-state usage; readability in dark mode falls off quickly past that step.

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Desktop | ≥ 1200px | 3-column feature/pricing grids, 4-column specialty tile grid, full nav |
| Tablet | 810–1199px | 2-column specialty grid, pricing tiers may stack two-up |
| Mobile | ≤ 809px | All grids collapse to single column; nav reduces to wordmark + condensed Sign-up; hero panel padding reduces to `{spacing.lg}` |

### Touch Targets
All buttons use `{rounded.pill}` at 44–48px height — comfortably above the 44×44 WCAG target. Source chips inside the demo card are 40×40 on desktop and expand to fit a full-width chip row on mobile.

### Collapsing Strategy
- **Nav** collapses to a small Letters wordmark plus a single `{components.button-primary}` Sign-up pill on mobile; secondary nav links move into a sheet.
- **Feature row** collapses from 3-up to 1-up.
- **Specialty grid** drops from 4-up to 2-up at tablet, then 1-up on mobile, but tiles retain their fixed height.
- **Pricing** stacks vertically on mobile with the featured Pro tier in the middle position.
- **Hero gradient panel** narrows its inner padding but keeps the same gradient and `{rounded.xxl}` corner radius.

### Image Behavior
The site uses almost no photography in dark mode either — only avatar circles inside testimonials and a single product mock inside the hero demo card (the latter retains a light surface as a deliberate inverse island).

## Iteration Guide

1. Focus on ONE component at a time. Net-new dark-mode work belongs as a new variant of an existing component, not a new shape.
2. Reference component names and tokens directly (`{colors.sky}`, `{components.button-primary}`, `{rounded.pill}`) — do not paraphrase values into hex codes inside prose.
3. Run `npx @google/design.md lint DESIGN-DARK.md` after edits.
4. Add new variants as separate component entries (`-pressed`, `-disabled`, `-focused`).
5. Default to `{typography.body-md}` for body and `{typography.heading-md}` / `{typography.heading-sm}` for emphasis. Reserve display sizes for hero/section openers only.
6. Keep `{colors.primary}` (white pill) scarce — never more than one per viewport.
7. When introducing a new dark surface, place it on the existing four-step ladder rather than inventing a fifth tone.
