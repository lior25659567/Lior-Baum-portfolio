---
version: alpha
name: Letters Analysis
description: An analysis of Letters' design language — an AI letter-and-transcription tool for clinicians (doctors, psychologists, allied-health practitioners). The brand reads as calm, clinical, and humane — pale sky-blue gradient panels bookend the page, body sections sit on quiet near-white surfaces, and one signature soft-blue accent (`{colors.sky}`) carries every hint of brand color. Headlines are set in the friendly rounded sans **Open Runde**; a single handwritten serif (`The Doctor`) is reserved for the "Before" handwritten-note artwork that anchors the product story. Buttons are uniformly fully-rounded pills, with a black primary pill that holds the rare moment of high contrast in an otherwise airy, low-saturation interface.

colors:
  primary: "#070709"
  on-primary: "#ffffff"
  accent: "#070709"
  sky: "#2597d0"
  sky-soft: "#c9def0"
  hero-gradient-from: "#7ea3c6"
  hero-gradient-to: "#c9deeb"
  canvas: "#ffffff"
  soft-cloud: "#f5f5f7"
  hairline: "#e4e5e7"
  ink: "#070709"
  charcoal: "#60606c"
  slate: "#868c98"
  steel: "#99a0ae"
  mute: "#8b8b8b"
  on-sky-panel: "#ffffff"
  caption-on-panel: "#d9e3ec"

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
    backgroundColor: "{colors.canvas}"
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
    backgroundColor: "{colors.canvas}"
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
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  pricing-card-featured:
    backgroundColor: "{colors.canvas}"
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
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  avatar-circle:
    backgroundColor: "{colors.soft-cloud}"
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
    backgroundColor: "{colors.sky-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: 32px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 48px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
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
  ex-pricing-tier:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
    borderColor: "{colors.hairline}"
  ex-pricing-tier-featured:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  ex-product-selector:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
    borderColor: "{colors.hairline}"
  ex-app-shell-row:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.charcoal}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 10px 12px
    activeIndicator: "{colors.primary}"
  ex-data-table-cell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 14px 16px
    headerBackground: "{colors.soft-cloud}"
    headerTypography: "{typography.eyebrow}"
    rowBorder: "{colors.hairline}"
  ex-auth-form-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 32px
    borderColor: "{colors.hairline}"
  ex-modal-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 28px
    borderColor: "{colors.hairline}"
  ex-empty-state-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.charcoal}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 64px
    borderColor: "{colors.hairline}"
    captionTypography: "{typography.body-md}"
  ex-toast:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 14px 16px
    borderColor: "{colors.hairline}"
  ex-cart-drawer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
    borderColor: "{colors.hairline}"
    headerBackground: "{colors.soft-cloud}"
---

## Overview

Letters is an AI tool that turns clinical conversations and source files into ready-to-send patient letters. The visual system is built around a single mood: **a quiet, well-lit examination room** — pale sky panels at the top and bottom of every page, generous whitespace in between, and one signature accent of `{colors.sky}` reserved for the moments that matter (the active "Add Sources" handles, the green-light feature checkmarks, the Letters wordmark in the body copy). Nothing fights for attention; the product story does.

The defining structural move is **fully-rounded pills everywhere**. Buttons, navigation tabs, source-chip handles, and even input fields all use `{rounded.pill}` — there are no rectangular CTAs anywhere on the marketing site. Cards range from `{rounded.lg}` for utility content up to `{rounded.xxl}` for the panel-sized hero/CTA bays. Type is set in **Open Runde**, a friendly geometric sans whose generous bowls and tight `letter-spacing: -3.2px` on the display sizes make hero headlines feel inviting rather than corporate. A single handwritten serif (`{typography.handwritten-note}`) appears once per page — inside the "Before" half of the before-and-after demo card — to dramatize the doctor's-handwriting problem the product solves.

Color blocks define the page rhythm: **soft sky panel → white body → soft sky panel**. The hero and the closing CTA bay both sit on the same soft sky gradient (deeper sky-blue at the top edge, easing to pale sky at the lower edge), sandwiching the white middle where features, testimonials, and specialty grids live. The pricing tier card breaks one expected pattern: instead of a colored "featured" tier with an accent border, the featured Pro card uses a **black primary CTA inside an otherwise plain white card** — emphasis comes from the button color, not from card chrome.

**Key Characteristics:**
- Pill-rounded everything — `{rounded.pill}` on every button, tab, input, and source-chip; `{rounded.xxl}` on the hero/CTA bays.
- Black primary CTA (`{colors.primary}`) is the only high-contrast surface in the entire system; everything else is pale.
- One accent: `{colors.sky}` carries the brand wordmark, "Add Sources" handles, and feature-row check icons — never used decoratively.
- Hero and CTA panels share the same soft sky gradient — `{colors.hero-gradient-from}` deeper at the top easing into `{colors.hero-gradient-to}` pale at the lower edge — bookending the page.
- **Open Runde** is the single brand typeface; the **handwritten serif** appears once per page in the Before/After demo card, never in UI copy.
- Specialty grid (use-case pages) is a 4-column wall of pale `{colors.sky-soft}` tiles with centered titles — distinct from the rest of the site, instantly readable.
- Page rhythm: soft-sky hero → white feature body → white pricing → soft-sky CTA → white footer.

## Colors

> Source pages: `letters.app/`, `letters.app/use-case/doctors`, `letters.app/use-case/psychologists`, `letters.app/letters`. Tokens are consistent across all four.

### Brand & Accent
- **Sky** (`{colors.sky}` — #2597d0): The single brand accent. Carries the "Letters" inline wordmark, the "Add Sources" label, the row of green-light feature check icons, and small inline glyphs in feature headings. Never used as a button background or large surface.
- **Sky Soft** (`{colors.sky-soft}` — #c9def0): The pale-blue tile color used across the specialty grid on the use-case pages (Cardiologist, Dermatology, Endocrinology…). Also borrows tone for the pricing-card panel background.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): Default page background, footer background, and the surface for testimonial cards, pricing cards, source chips, and inputs.
- **Soft Cloud** (`{colors.soft-cloud}` — #f5f5f7): The neutral card surface for the hero demo card, the three feature cards beneath the demo, and inactive ghost buttons.
- **Hero Gradient** (`{colors.hero-gradient-from}` → `{colors.hero-gradient-to}` — #7ea3c6 → #c9deeb): Top-of-page hero panel and bottom-of-page CTA bay. Vertical gradient, deeper sky-blue at the top edge easing into pale sky at the lower edge.
- **Hairline** (`{colors.hairline}` — #e4e5e7): 1px borders around inputs, dividers in the footer link columns.

### Text
- **Ink** (`{colors.ink}` — #070709): Primary heading color across all sizes — hero display, section headings, card titles. Also the primary CTA background.
- **Charcoal** (`{colors.charcoal}` — #60606c): Default body copy, nav links, footer link columns.
- **Slate** (`{colors.slate}` — #868c98): Tertiary text — captions under feature cards and secondary supporting copy.
- **Steel** (`{colors.steel}` — #99a0ae): Disabled-state text, faint metadata such as date stamps in the demo letter mockup.
- **Mute** (`{colors.mute}` — #8b8b8b): Footer micro copy and "All rights reserved" line.
- **On Primary** (`{colors.on-primary}` — #ffffff): Text on `{colors.primary}` buttons; also the hero headline color when typography sits inside the gradient panel.
- **Caption On Panel** (`{colors.caption-on-panel}` — #d9e3ec): Sub-headline / supporting copy beneath hero headlines on the gradient panels.

### Brand Gradient
- **Hero Gradient** is a soft vertical sweep — `{colors.hero-gradient-from}` at the top edge of the panel, easing into `{colors.hero-gradient-to}` at the bottom. Used identically on the top hero and the closing CTA bay; together they bookend every page in the same brand color, giving the marketing site its signature "open-window" feel.

## Typography

### Font Family
- **Open Runde** — Custom rounded geometric sans, the brand's only UI typeface. Used at every weight from Regular (400) through Medium (500), Semibold (600), and Bold (700). Generous lowercase bowls, soft terminal cuts, and very tight negative tracking on display sizes give it a warm but precise feel — informal enough to disarm a clinician at a busy desk, sharp enough to read as software.
- **The Doctor** — Handwritten serif used exclusively for the "Before" sample inside the Before/After demo card. Mimics rushed clinician's-hand cursive; never appears in UI chrome, navigation, or marketing copy.
- **Inter** — Fallback for a small number of secondary captions when Open Runde is unavailable.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-hero}` | 80px | 600 | 0.90 | -3.2px | Top-of-page hero headlines: "Patients, not paperwork", "Instant Letters" |
| `{typography.display-section}` | 44px | 600 | 1.10 | -1.76px | Major section openers: "Letters for Doctors", "Flexible pricing", "Start Your Free Trial Today" |
| `{typography.heading-lg}` | 28px | 500 | 1.20 | -0.84px | Mid-section subheads: "Your work requires lots of paperwork", "Trusted by Australian doctors" |
| `{typography.heading-md}` | 20px | 600 | 1.40 | -0.2px | Card titles: "Personalised Letters", "Edit and Rewrite Anytime", specialty tile labels |
| `{typography.heading-sm}` | 18px | 600 | 1.40 | -0.18px | Small card titles, pricing tier names ("Letters Basic", "Letters Pro") |
| `{typography.body-lg}` | 17px | 400 | 1.40 | -0.17px | Lead body copy under hero, testimonial quote text |
| `{typography.body-md}` | 16px | 400 | 1.49 | -0.16px | Default body copy, feature card descriptions, footer link text |
| `{typography.body-md-bold}` | 16px | 600 | 1.40 | -0.16px | Inline emphasis and CTA button labels |
| `{typography.caption}` | 14px | 500 | 1.50 | -0.14px | Nav links, secondary supporting copy, footer column headings |
| `{typography.micro}` | 12px | 500 | 1.20 | -0.12px | Tag chips, metadata under cards |
| `{typography.eyebrow}` | 11px | 500 | 1.09 | 0.22px | The only positive-tracking style: the "Made with love & Sydney, Australia" footer micro line |
| `{typography.handwritten-note}` | 38px | 400 | 0.90 | -0.38px | "Before" handwritten doctor's-note sample inside the demo card |
| `{typography.handwritten-caption}` | 14px | 400 | 1.40 | -0.14px | Smaller handwritten lines beneath the demo sample |

### Principles
- **One typeface, many weights.** Hierarchy is built from weight and tracking shifts, not from changing typefaces. Open Runde's wide weight range carries the entire system.
- **Tight tracking on display sizes.** `{typography.display-hero}` ships with `-3.2px` letter-spacing — heroes feel sculpted and confident, not airy.
- **The handwritten serif is a rhetorical device, not a system font.** It exists to dramatize the "Before" state of the product story. Do not adopt it for any other purpose.
- **Inline brand emphasis.** The word "Letters" inside body copy ("Letters → saves you time", "Letters → lets you look your patients in the eye") is set in `{typography.heading-lg}` weight with `{colors.sky}` — a recurring micro-flourish that doubles as inline branding.

### Note on Font Substitutes
If Open Runde is unavailable, the closest open-source substitutes are **Manrope** (similar geometry and rounded terminals) or **Nunito** (slightly softer). Both are wider than Open Runde at the same point size — reduce display sizes by ~5% and tighten letter-spacing further if substituting. The handwritten "Doctor" face has no exact open equivalent; **Caveat** at heavier weight is a workable stand-in for the demo card.

## Layout

### Spacing System
- **Base unit**: 8px
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 40px · `{spacing.section}` 64px · `{spacing.bay}` 96px
- **Card padding**: `{spacing.lg}` (24px) inside small feature cards; `{spacing.xl}` (32px) inside the hero demo card, pricing cards, and testimonial cards.
- **Section gap**: `{spacing.bay}` (96px) of vertical whitespace between major content blocks. The page breathes deliberately between every band.
- **Hero/CTA bay padding**: `{spacing.section}` (64px) of inner padding on the hero panel and closing CTA panel.

### Grid & Container
- **Max width**: ~1200px content container (the first detected breakpoint on every page is 1200px).
- **Hero**: Single full-width pale-sky panel that spans edge-to-edge; the headline column inside is centered with ~640px max measure.
- **Feature row**: 3-column grid of utility cards (`{spacing.lg}` gap), collapsing to a single column on mobile.
- **Specialty grid (use-case pages)**: 4-column tile grid of `{components.specialty-tile}`, fixed cell height ~96px, `{spacing.md}` gap.
- **Pricing**: 3-column tier layout — outer two cards plain `{components.pricing-card}`, middle card `{components.pricing-card-featured}` with the only black CTA in the row.

### Whitespace Philosophy
Whitespace is the primary grouping device. Sections never share borders, dividers, or background-color shifts within the white middle band — they are separated by `{spacing.bay}` of empty canvas alone. The two pale-sky panels (hero and closing CTA) act as the outer brackets; everything between is a single ventilated white stack.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | No shadow | Default — feature cards, footer columns, specialty tiles, hero panel itself |
| 1 | `rgba(228,229,231,0.24) 0px 1px 2px 0px` | Source chips and quiet borders around inputs and small floating elements |
| 2 | `rgba(36,36,40,0.10) 0px 1px 2px, rgba(36,36,40,0.09) 0px 3px 3px, rgba(36,36,40,0.05) 0px 6px 4px` | Pricing cards, hero demo card, testimonial cards — soft layered drop |
| 3 | `rgba(0,0,0,0.25) 0px 1px 2px 0px` | Primary CTA pill — a single firm shadow under `{components.button-primary}` |

Letters' depth philosophy is **subtraction, not addition**. Most surfaces sit flush on the canvas. When elevation is used, it is a soft, multi-stop shadow stack that reads as ambient light rather than a hard drop. The black primary button gets the only firm shadow in the system — it is the one element allowed to look "lifted."

### Decorative Depth
- **Hero gradient** (`{colors.hero-gradient-from}` → `{colors.hero-gradient-to}`) provides atmospheric depth at the top and bottom of every page without using shadow at all.
- **Soft-cloud cards** (`{colors.soft-cloud}` against `{colors.canvas}`) create gentle band separation through tonal shift, not elevation.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 6px | Inline tags, the small handwritten-letter paper edge inside the Before demo |
| `{rounded.sm}` | 16px | Small content cards, secondary surface pills |
| `{rounded.md}` | 18px | Specialty tiles, mid-density feature cards |
| `{rounded.lg}` | 24px | Feature cards, testimonial cards, before/after card |
| `{rounded.xl}` | 32px | Pricing cards, time-saved callout |
| `{rounded.xxl}` | 48px | Hero panel, closing CTA bay, hero demo container |
| `{rounded.pill}` | 100px | Every button, tab, source chip, and nav active-state |
| `{rounded.full}` | 9999px | Fully-rounded pill inputs, avatar photos in testimonials, circular icon medallions |

### Photography Geometry
- **Avatar circles** (`{rounded.full}`, ~48px) for testimonial author photos. Always cropped tight on the face.
- **In-product mock screenshots** (the "letter generation" UI shown inside the hero demo card) sit on the `{colors.soft-cloud}` panel without their own border — the panel is the frame.
- **No photographic imagery** lives in marketing chrome; the only photos are the testimonial avatars. The brand's visual weight is carried by typography, gradient, and pale tile color.

## Components

### Buttons

**`button-primary`** — The single high-contrast moment in the system: "Sign Up", "Sign Up Now", "Start 2-Week Trial", "Try Letters Now — It's Free", "Sign Up For Free".
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.body-md-bold}`, padding `{spacing.md}`, height 48px, rounded `{rounded.pill}`. A single `{components.button-primary}` shadow level lifts it slightly off the canvas.
- Pressed state lives in `button-primary-pressed` — the same `{colors.primary}` fill, conveyed by a deeper drop shadow rather than a hue shift.

**`button-secondary`** — White pill with dark text. Used for "About Letters", "About Transcribe", "Login" (inside the nav bar), and the secondary CTA on hero pages.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md-bold}`, padding `{spacing.md}`, rounded `{rounded.pill}`.

**`button-ghost`** — Soft-cloud pill used for "Start for Free" inside the basic-tier pricing card and for low-emphasis confirmations.
- Background `{colors.soft-cloud}`, text `{colors.ink}`, type `{typography.body-md-bold}`, padding `{spacing.md}`, rounded `{rounded.pill}`.

**`button-disabled`** — Greyed pill for unavailable actions.
- Background `{colors.soft-cloud}`, text `{colors.steel}`, rounded `{rounded.pill}`.

**`pill-tab`** + **`pill-tab-active`** — Used for the Annual / Monthly toggle above the pricing tier row, and for similar mode-switch chips.
- Inactive: transparent background, `{colors.charcoal}` text. Active: `{colors.primary}` background, `{colors.on-primary}` text. Both `{rounded.pill}`.

**`source-chip`** — Circular pills inside the hero demo card showing the available source-input types (camera/photo, audio/dictation, file/PDF). Each is a 40×40 white pill with an icon centered inside.
- Background `{colors.canvas}`, rounded `{rounded.pill}`, height/width 40px. Sits on the `{colors.soft-cloud}` demo panel.

### Cards & Containers

**`hero-demo-card`** — The signature anchor of the home and use-case heroes: a generous `{rounded.xxl}` `{colors.soft-cloud}` panel that frames the "Letters that are trained to sound like you 5x quicker" message, the source-chip row, and the inline before/after specimen.
- Background `{colors.soft-cloud}`, rounded `{rounded.xxl}`, padding `{spacing.xl}`.

**`feature-card`** — The three "Personalised Letters / Seamless Source Integration / Edit and Rewrite Anytime" cards beneath the demo. Each has a small inline icon, a heading, and a one-line description.
- Background `{colors.soft-cloud}`, text `{colors.ink}`, type `{typography.body-md}`, rounded `{rounded.lg}`, padding `{spacing.lg}`.

**`before-after-card`** — A two-pane card holding the handwritten "Before" sample (`{typography.handwritten-note}`) on the left and the typeset "After" letter on the right. The two panes share the white card surface and are divided by whitespace, not a rule.
- Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.lg}`.

**`time-saved-callout`** — The "Save 5+ hours a week with Letters" figure block: a large numeric headline in `{typography.display-section}` with its "a week with Letters" supporting line in `{typography.body-md}` beneath. Pale sky background.
- Background `{colors.sky-soft}`, rounded `{rounded.xl}`, padding `{spacing.xl}`.

**`pricing-card`** — Outer-tier pricing cards (Letters Basic on the left, Letters Enterprise on the right). White surface, large tier title, big price line, bulleted feature list, ghost CTA at the bottom.
- Background `{colors.canvas}`, rounded `{rounded.xl}`, padding `{spacing.xl}`.

**`pricing-card-featured`** — Centre-tier pricing card (Letters Pro). Identical chrome to the outer cards (white surface, same radius, same padding) — emphasis comes entirely from the inner CTA. The "Start 2-Week Trial" button inside this card is `{components.pricing-card-featured-cta}`, a black primary pill with "No credit card required" micro copy directly beneath.
- Background `{colors.canvas}`, rounded `{rounded.xl}`, padding `{spacing.xl}`. Differs from `{components.pricing-card}` only via the embedded `{components.pricing-card-featured-cta}`.

**`testimonial-card`** — A wide white card holding a multi-line quote in `{typography.body-lg}`, with an avatar circle and author attribution at the bottom. Used inside the "Trusted by Australian doctors" band.
- Background `{colors.canvas}`, type `{typography.body-lg}`, rounded `{rounded.lg}`, padding `{spacing.xl}`.

**`avatar-circle`** — Round 48px portrait used in testimonial cards.
- Background `{colors.soft-cloud}`, rounded `{rounded.full}`, size 48px.

**`specialty-tile`** — The 4-column grid of pale-blue tiles on the use-case pages: Cardiologist, Dermatology, Endocrinology, ENT, General Surgery, etc. Each tile is a fixed-height `{rounded.md}` panel with a centered specialty name in `{typography.heading-md}`.
- Background `{colors.sky-soft}`, text `{colors.ink}`, type `{typography.heading-md}`, rounded `{rounded.md}`, padding `{spacing.lg}`, height 96px.

**`hero-panel`** + **`cta-panel`** — Identical chrome: `{rounded.xxl}` panel filled with the `{colors.hero-gradient-from}` → `{colors.hero-gradient-to}` vertical gradient, `{spacing.section}` of inner padding, headline + subhead + primary CTA stacked center-aligned. The hero panel sits at the top of every page; the CTA panel sits above the footer with messaging like "Start Your Free Trial Today" or "Write Smarter, Not Harder".

### Inputs & Forms

**`text-input`** + **`text-input-focused`** — Pill-rounded white input used for email capture and the "Add Sources" picker.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, rounded `{rounded.pill}`, padding `{spacing.md}`, height 48px.
- Focused state shares the same chrome (no visible state change in the marketing surfaces).

### Navigation

**`nav-bar`** — Top navigation sits transparently on top of the hero panel: small Letters wordmark on the left, primary nav links centered ("Use cases", "Features", "Pricing", "Our doctors"), and a `{components.button-secondary}` "Login" + `{components.button-primary}` "Sign up" pair on the right.
- Background transparent, height 64px, padding `{spacing.lg}`. The nav reads in the hero gradient because it sits on top of the panel — it does not have its own background.

**`nav-link`** — Individual nav link.
- Background transparent, text `{colors.charcoal}`, type `{typography.body-md}`, padding `{spacing.xs}`.

**`footer`** — The footer is plain white (no panel chrome), holding a small Letters wordmark, three columns of link groups (Home page / Use Cases / Navigation / Socials / Legal), and a small "Made with love in Sydney, Australia" line at the bottom.
- Background `{colors.canvas}`, text `{colors.charcoal}`, type `{typography.caption}`, padding `{spacing.section}`.

### Signature Components

- **`hero-demo-card`** is the brand's central rhetorical artifact — it appears on the home page and on every use-case page, always with the same content shape (eyebrow tag → headline → source-chip row → Before/After specimen). Recognizing this card across pages is half of recognizing the brand.
- **`specialty-tile` grid** is the second signature: a quiet pale-blue wall of medical-specialty names that immediately communicates "this product knows your domain" without resorting to icons or photography.
- **`time-saved-callout`** is the only place numeric figures get the `{typography.display-section}` treatment — making "5 hours+" feel like a headline rather than data.

### Examples (illustrative)

> Kit-mirror demonstration surfaces. The 10 SaaS UI patterns that downstream consumers re-skin with the brand's primitive tokens — every entry references existing brand-native components via `{token.path}` syntax. These are not extracted from Letters directly; they exist to give consumers a stable target so the brand's soft-sky / cloud-rounded / black-pill language renders predictably across common product UI.

**`ex-pricing-tier`** + **`ex-pricing-tier-featured`** — Default tier reuses `pricing-card` chrome (`{colors.canvas}` surface, `{rounded.xl}` corners, `{spacing.xl}` interior) with the `button-primary` CTA. Featured tier polarity-flips: `{colors.primary}` ink surface, `{colors.on-primary}` copy, and the CTA flips to `button-secondary` (white pill) so the contrast keeps reading.

**`ex-product-selector`** — Picker chrome. Re-uses `feature-card` background language with `text-input`-style pill children for the variant inputs.

**`ex-app-shell-row`** — Sidebar nav row. Default sits on `{colors.soft-cloud}` in `{colors.charcoal}`; active state polarity-flips to `{colors.primary}` background with `{colors.on-primary}` text — the same anchor moment as the page-level `button-primary`.

**`ex-data-table-cell`** — Header sits on `{colors.soft-cloud}` using `{typography.eyebrow}` in `{colors.slate}`; body cells use `{typography.body-md}` on `{colors.canvas}`. Every row separated by a 1px `{colors.hairline}`. The whole table sits inside a `{rounded.lg}` outer frame so it still reads as part of the soft pill vocabulary.

**`ex-auth-form-card`** — Sign-in card. Re-uses `pricing-card` chrome (`{rounded.xl}`), `text-input` pill primitives, and a full-width `button-primary` submit.

**`ex-modal-card`** — Modal dialog surface. Same chrome as `feature-card` with `{spacing.xl}` interior and a `{colors.hairline}` frame; the action row holds a text-link Cancel on the left and a `button-primary` on the right.

**`ex-empty-state-card`** — Empty-state frame. Larger `{spacing.bay}` interior; outlined icon tile in `{colors.hairline}`, eyebrow chip in `{typography.eyebrow}`, declarative heading in `{typography.heading-lg}`, supporting copy in `{typography.body-md}` `{colors.charcoal}`, and a single `button-primary`.

**`ex-toast`** — Toast surface. `feature-card` chrome at `{spacing.md}` padding with a 3px accent rule on the leading edge, mono-style uppercase tag in `{typography.eyebrow}`, body copy in `{typography.caption}` `{colors.ink}`.

**`ex-cart-drawer`** — Right-edge slide-in drawer surface. A `{colors.canvas}` panel with `{rounded.lg}` corners and a `{colors.hairline}` frame; the drawer header sits on a `{colors.soft-cloud}` band, line items stack on the white body separated by `{colors.hairline}` rules, and the footer holds a total row above a full-width `button-primary` pill. (Illustrative kit-mirror surface — Letters is a subscription clinical tool with no storefront; the drawer re-skins the brand's soft-card vocabulary for consumers who need one.)

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for primary CTAs and the active-tab indicator only. It is the only high-contrast surface in the system and loses its weight if used decoratively.
- Use `{colors.sky}` only for the brand wordmark inline, the "Add Sources" handles, the green-light feature checkmarks, and small inline glyphs — never as a button background.
- Default every button, tab, input, and source chip to `{rounded.pill}`. Rectangular CTAs do not exist in this system.
- Bookend pages with the gradient hero panel at the top and the gradient CTA bay at the bottom, separated by a long ventilated white middle.
- Use `{spacing.bay}` (96px) of vertical whitespace between content sections in the white middle band — no dividers or background shifts.
- Set every UI string in **Open Runde**; rely on weight (Regular → Bold) for hierarchy, not on additional typefaces.
- Center-align hero headlines and pricing rows; let whitespace do the framing.

### Don't
- Don't introduce a second accent color. The brand reads sky-blue + black-on-white; adding a green, orange, or purple breaks the calm.
- Don't apply the handwritten serif (`{typography.handwritten-note}`) to UI copy, headings, or marketing emphasis. It belongs only inside the Before/After demo card.
- Don't add a colored border or background tint to the featured pricing card. Emphasis comes from the embedded black CTA, not from card chrome.
- Don't use rectangular buttons or sharp-corner inputs anywhere — the pill is non-negotiable.
- Don't use heavy drop shadows. Surfaces sit flush; the only firm shadow in the system is under `{components.button-primary}`.
- Don't fill the hero gradient panel with imagery or icon clutter. The pale sky is meant to read as empty headroom.
- Don't substitute pure white text on the gradient panel for headlines — use `{colors.ink}` for the headline and `{colors.caption-on-panel}` only for the supporting line beneath.

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Desktop | ≥ 1200px | 3-column feature/pricing grids, 4-column specialty tile grid, full-width nav with centered link cluster |
| Tablet | 810–1199px | 2-column specialty grid, pricing tiers may stack two-up with the featured card on its own row |
| Mobile | ≤ 809px | All grids collapse to single column; nav collapses to wordmark + condensed Sign-up button; hero panel padding reduces to `{spacing.lg}` |

### Touch Targets
All buttons use `{rounded.pill}` at 44–48px height, comfortably above the 44×44 WCAG target. Source chips inside the demo card are 40×40 — adequate for desktop pointer interaction; on mobile their pill expands to fit the full-width chip row instead of remaining a 40px circle.

### Collapsing Strategy
- **Nav** collapses to a small Letters wordmark plus a single `{components.button-primary}` Sign-up pill on mobile; secondary nav links move into a hamburger sheet.
- **Feature row** collapses from 3-up to 1-up; cards retain their `{rounded.lg}` and `{spacing.lg}` padding.
- **Specialty grid** drops from 4-up to 2-up at tablet, then 1-up on mobile, but tiles retain their fixed height so the wall reads as a stack rather than a list.
- **Pricing**: stacks vertically on mobile with the featured Pro tier in the middle position. The black CTA inside the featured card remains the visual anchor.
- **Hero gradient panel** narrows its inner padding but keeps the same gradient and `{rounded.xxl}` corner radius — the bookend feel is preserved at every viewport.

### Image Behavior
The site uses almost no photography — only small avatar circles inside testimonials and a single product mock inside the hero demo. Both are served at fixed pixel dimensions and scale with the surrounding card; no art-direction crops are needed.

## Iteration Guide

1. Focus on ONE component at a time. Most net-new work belongs as a new variant of an existing component (a new pill button, a new card surface, a new specialty-grid tile size) rather than a brand-new shape.
2. Reference component names and tokens directly (`{colors.sky}`, `{components.button-primary}`, `{rounded.pill}`) — do not paraphrase the values into hex codes inside prose.
3. Run `npx @google/design.md lint DESIGN.md` after edits — `broken-ref`, `contrast-ratio`, and `orphaned-tokens` warnings flag issues automatically.
4. Add new variants as separate component entries (`-pressed`, `-disabled`, `-focused`) — do not bury them inside prose.
5. Always default to `{typography.body-md}` for body and `{typography.heading-md}` / `{typography.heading-sm}` for emphasis. Reserve display sizes for hero/section openers only.
6. Keep `{colors.primary}` scarce — if more than one black CTA appears per viewport, neutralize one to `{components.button-secondary}` or `{components.button-ghost}`.
7. When adding a new page, preserve the page rhythm: open with the gradient hero panel, set body content on the white middle band with `{spacing.bay}` between sections, and close with the gradient CTA bay above the footer.
