# Clinical Scanning
Workflow — extracted text

Source: `src/data/case-studies/itero-scan-workflow.json` — 30 slides.
Each field shows its JSON path id in [brackets]. Reviewers: judge the prose,
and judge whether each slide uses the RIGHT template (see `_slide-templates.md`).
Fields marked (read-only) are factual data and cannot be auto-edited.
**Images carry real content (quotes, UI, data). READ the listed image files**
(Read tool, visual) before judging or editing — do not write `[FILL IN: quote]`
for something an image already shows. Use **Available unused fields** to add
structured fields (e.g. `metaItems`, `headlineMetric`) instead of cramming that
data into prose.

## ⚠ Cross-slide duplication check
These prose fragments appear on more than one slide (high overlap). The same
content should not live on two slides — merge or cut. (Image-vs-text repeats are
NOT caught here — read the images to find those.)

- **78% overlap** — `[slides.7.image]` (slide 7) ↔ `[slides.25.image]` (slide 25)
  - slide 7: "/case-studies/itero-scan-workflow/img-t2to0gdcf0.png"
  - slide 25: "/case-studies/itero-scan-workflow/img-5ljyfdsz90.png"
- **58% overlap** — `[slides.2.highlight]` (slide 2) ↔ `[slides.4.highlight]` (slide 4)
  - slide 2: "At 37 million cases a year, even one unnecessary popup per case is not a small problem."
  - slide 4: "At 37 million cases a year, one unnecessary popup per case adds up fast."

## ⚠ Repeated facts (same stat on 2+ slides)
State each stat ONCE unless a deliberate tease (e.g. a cover headline metric also
shown in outcomes). Otherwise the repeat reads as padding — pick one home, cut the rest.

- **"37 million"** appears on slides 2, 4

---
## Slide 0 — type: intro
_Words on screen: **65** · budget ~75_

- **title**  `[slides.0.title]`
  Clinical Scanning
  Workflow

- **description**  `[slides.0.description]`
  The patient is in the chair. The scanner is ready. The system isn't.
  iTero is a digital intraoral scanner used chairside during live patient appointments. I redesigned Align Technology's RX, Scan, and View workflow into one continuous system.

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  Align Technology

- **focusLabel**  `[slides.0.focusLabel]`
  Focus

- **focus**  `[slides.0.focus]`
  Clinical UX System

- **label**  `[slides.0.metaItems.0.label]`
  Role

- **value**  `[slides.0.metaItems.0.value]`
  Product Designer

- **label**  `[slides.0.metaItems.1.label]`
  Timeline

- **value**  `[slides.0.metaItems.1.value]`
  3 months 

- **label**  `[slides.0.metaItems.2.label]`
  Team

- **value**  `[slides.0.metaItems.2.value]`
  1 PM · 4 engineers

- **label**  `[slides.0.metaItems.3.label]`
  Tools

- **value**  `[slides.0.metaItems.3.value]`
  Figma · Claude Code

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-6s57kfmq7o.png`, `public/case-studies/itero-scan-workflow/img-morqwmjyo.png`, `public/case-studies/itero-scan-workflow/img-4gnykp544g.png`

_Available unused fields (`intro` template): subtitle, cta_

---
## Slide 1 — type: problem
_Words on screen: **68** · budget ~75_

- **label**  `[slides.1.label]`
  The System

- **title**  `[slides.1.title]`
  A system used during live patient treatment

- **content**  `[slides.1.content]`
  iTero is used chair-side. Three phases — RX, Scan, View — feed into each other. A problem in one disrupts the whole appointment.

- **issuesTitle**  `[slides.1.issuesTitle]`
  The three phases

- **issues**  `[slides.1.issues.0]`
  RX → define patient, procedure, case details

- **issues**  `[slides.1.issues.1]`
  Scan → capture a real-time 3D model

- **issues**  `[slides.1.issues.2]`
  View → validate before lab submission

- **highlight**  `[slides.1.highlight]`
  Every decision happens under time pressure — with the patient in the chair.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-wvhziz51co.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 2 — type: problem
_Words on screen: **76** · budget ~75_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  The Rx was built as a sequential form

- **content**  `[slides.2.content]`
  Sequential, popup-heavy, and rigid — it forced clinical decisions before clinicians had the information to make them.

- **issuesTitle**  `[slides.2.issuesTitle]`
  What broke

- **issues**  `[slides.2.issues.0]`
  Every tooth, material, and spec triggered a modal

- **issues**  `[slides.2.issues.1]`
  No multi-select — procedures set tooth by tooth

- **issues**  `[slides.2.issues.2]`
  Changing a procedure meant starting over

- **issues**  `[slides.2.issues.3]`
  Setup had to finish before scanning could begin

- **highlight**  `[slides.2.highlight]`
  At 37 million cases a year, even one unnecessary popup per case is not a small problem.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-ojnudsaui8.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 3 — type: issuesBreakdown
_Words on screen: **81** · budget ~95_

- **label**  `[slides.3.label]`
  Who It Affected

- **title**  `[slides.3.title]`
  The problem reached further than the chair

- **description**  `[slides.3.description]`
  Setup failures didn't stop at the clinician. Every incomplete field and blocking modal sent ripple effects downstream.

- **number** (read-only)  `[slides.3.issues.0.number]`
  1

- **title**  `[slides.3.issues.0.title]`
  Dentists

- **description**  `[slides.3.issues.0.description]`
  Every extra click was time not spent on the patient — setup friction happened chair-side, with the patient watching.

- **number** (read-only)  `[slides.3.issues.1.number]`
  2

- **title**  `[slides.3.issues.1.title]`
  Clinical staff

- **description**  `[slides.3.issues.1.description]`
  Incomplete cases and mandatory-field errors generated resubmissions — administrative work created by avoidable UI gaps.

- **number** (read-only)  `[slides.3.issues.2.number]`
  3

- **title**  `[slides.3.issues.2.title]`
  Labs

- **description**  `[slides.3.issues.2.description]`
  Received Rx data that was incomplete or unstructured for complex procedures like All-on-X and multi-phase treatments.

_Available unused fields (`issuesBreakdown` template): subtitle, cardsTitle, gridColumns, highlight, cardVariant, showNumbers_

---
## Slide 4 — type: problem
_Words on screen: **88** · budget ~75_

- **label**  `[slides.4.label]`
  Why Now

- **title**  `[slides.4.title]`
  Three signals converged at once

- **content**  `[slides.4.content]`
  3Shape, Medit, and Shining3D had already modernised their Rx flows. The iTero architecture had been patched too many times to patch again — the only path forward was a rebuild.

- **issues**  `[slides.4.issues.0]`
  Competitors had modernised — iTero's Rx flow was visibly behind

- **issues**  `[slides.4.issues.1]`
  At this scale, every extra popup per case was expensive

- **issues**  `[slides.4.issues.2]`
  The codebase couldn't absorb another patch — only a rebuild would hold

- **issuesTitle**  `[slides.4.issuesTitle]`
  The case for a rebuild

- **highlight**  `[slides.4.highlight]`
  At 37 million cases a year, one unnecessary popup per case adds up fast.

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, image, splitRatio_

---
## Slide 5 — type: quotes
_Words on screen: **103** · budget ~110_

- **label**  `[slides.5.label]`
  Research

- **title**  `[slides.5.title]`
  Six clinicians. The same three problems, every session.

- **content**  `[slides.5.content]`
  Chairside observation, then six interviews. I asked clinicians to walk through a real case — where they hesitated, what they'd change. Six interviews is a small sample; these themes held across every session.

- **text**  `[slides.5.quotes.0.text]`
  It feels like a long boring form — and I'm doing it with a patient in the chair.

- **author**  `[slides.5.quotes.0.author]`
  Restorative specialist

- **text**  `[slides.5.quotes.1.text]`
  I change the procedure multiple times before I even begin scanning.

- **author**  `[slides.5.quotes.1.author]`
  General dentist

- **text**  `[slides.5.quotes.2.text]`
  The moment I go looking for a tool, I lose my rhythm completely.

- **author**  `[slides.5.quotes.2.author]`
  Orthodontist

- **text**  `[slides.5.quotes.3.text]`
  I never fully trust the result the first time I see it.

- **author**  `[slides.5.quotes.3.author]`
  Restorative specialist

_Available unused fields (`quotes` template): gridColumns, bulletsTitle, highlight_

---
## Slide 6 — type: goals
_Words on screen: **119** · budget ~100_

- **label**  `[slides.6.label]`
  Design Goals

- **title**  `[slides.6.title]`
  Six problems to solve. Six ways to measure them.

- **number** (read-only)  `[slides.6.goals.0.number]`
  1

- **title**  `[slides.6.goals.0.title]`
  Flow alongside the scan

- **description**  `[slides.6.goals.0.description]`
  Setup should not gate the capture — Rx runs parallel, not before.

- **number** (read-only)  `[slides.6.goals.1.number]`
  2

- **title**  `[slides.6.goals.1.title]`
  Eliminate one-at-a-time configuration

- **description**  `[slides.6.goals.1.description]`
  Multi-select teeth, group materials, apply in one step.

- **number** (read-only)  `[slides.6.goals.2.number]`
  3

- **title**  `[slides.6.goals.2.title]`
  Editable at any point

- **description**  `[slides.6.goals.2.description]`
  Change procedure or material mid-workflow without restarting.

- **number** (read-only)  `[slides.6.goals.3.number]`
  4

- **title**  `[slides.6.goals.3.title]`
  Keep scanning uninterrupted

- **description**  `[slides.6.goals.3.description]`
  Tools accessible without leaving the capture context.

- **number** (read-only)  `[slides.6.goals.4.number]`
  5

- **title**  `[slides.6.goals.4.title]`
  One visual language

- **description**  `[slides.6.goals.4.description]`
  No icon memorisation, no mixed styles across tools.

- **number** (read-only)  `[slides.6.goals.5.number]`
  6

- **title**  `[slides.6.goals.5.title]`
  A clear completion signal

- **description**  `[slides.6.goals.5.description]`
  One done state in View — re-checking becomes a choice, not a reflex.

- **kpis**  `[slides.6.kpis.0]`
  Time from case open to first scan action

- **kpis**  `[slides.6.kpis.1]`
  Popup count per case submission

- **kpis**  `[slides.6.kpis.2]`
  Multi-tooth task completion rate

- **kpis**  `[slides.6.kpis.3]`
  Mid-workflow restart rate

- **kpis**  `[slides.6.kpis.4]`
  Tool interactions that exit the scan context

- **kpis**  `[slides.6.kpis.5]`
  Re-check rate per scan

- **goalsCardsTitle**  `[slides.6.goalsCardsTitle]`
  Goals

_Available unused fields (`goals` template): description, showGoalsSection, highlight, showNumbers_

---
## Slide 7 — type: problem
_Words on screen: **78** · budget ~75_

- **label**  `[slides.7.label]`
  User Flow Mapping

- **title**  `[slides.7.title]`
  Mapping the flow before touching the design

- **content**  `[slides.7.content]`
  With the goals in place, I mapped the full appointment as clinicians actually moved through it — not the designed flow, the real one. Three breakpoints emerged immediately.

- **issues**  `[slides.7.issues.0]`
  RX setup blocked the clinician before any scan began

- **issues**  `[slides.7.issues.1]`
  Tool access broke the clinician's rhythm mid-scan

- **issues**  `[slides.7.issues.2]`
  No completion signal — View felt unfinished

- **issuesTitle**  `[slides.7.issuesTitle]`
  What the flow revealed

- **highlight**  `[slides.7.highlight]`
  The friction wasn't random — it lived at every phase handoff.

- **image**  `[slides.7.image]`
  /case-studies/itero-scan-workflow/img-t2to0gdcf0.png

- **imageFit**  `[slides.7.imageFit]`
  contain

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 8 — type: problem
_Words on screen: **72** · budget ~75_

- **label**  `[slides.8.label]`
  Constraints

- **title**  `[slides.8.title]`
  What the design had to work across

- **content**  `[slides.8.content]`
  Tap targets sized for gloved hands. Nothing essential could depend on hover.

- **issues**  `[slides.8.issues.0]`
  Three surfaces: scanner hardware (Element, Lumina), MIDC desktop, and myitero.com

- **issues**  `[slides.8.issues.1]`
  Compatible with in-progress cases on the old Rx

- **issues**  `[slides.8.issues.2]`
  Feature-flagged — no persistent onboarding; learnable on first contact

- **issues**  `[slides.8.issues.3]`
  Read and demo states designed in from day one

- **issues**  `[slides.8.issues.4]`
  M&I and Labs out of scope — IA built to absorb them

- **issuesTitle**  `[slides.8.issuesTitle]`
  What each constraint demanded

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight, image, splitRatio_

---
## Slide 9 — type: problem
_Words on screen: **95** · budget ~75 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.9.label]`
  Interactive Prototype

- **title**  `[slides.9.title]`
  A coded prototype to test decisions before development

- **content**  `[slides.9.content]`
  Figma shows what a toolbar looks like — it can't show whether placement breaks scanning rhythm the moment a clinician reaches for a tool. I built the prototype in code before any screens so timing failures surfaced immediately.

- **bullets2Title**  `[slides.9.bullets2Title]`
  What this enabled

- **bullets2**  `[slides.9.bullets2.0]`
  Timing failures caught before any screen was locked

- **bullets2**  `[slides.9.bullets2.1]`
  Tool-reach problems visible in motion, not static frames

- **bullets2**  `[slides.9.bullets2.2]`
  A decision made in the morning, tested the same afternoon

- **highlight**  `[slides.9.highlight]`
  The toolbar placement decision could not have been made correctly from static screens.

- **caption**  `[slides.9.image.0.caption]`
  Interactive prototype built in code

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 10 — type: chapter
_Words on screen: **19** · budget ~18_

- **number** (read-only)  `[slides.10.number]`
  01

- **title**  `[slides.10.title]`
  RX

- **subtitle**  `[slides.10.subtitle]`
  Defining the patient, procedure, and case before scanning — and the setup gate I had to clear first.

---
## Slide 11 — type: problem
_Words on screen: **74** · budget ~75_

- **label**  `[slides.11.label]`
  RX Setup — Before

- **title**  `[slides.11.title]`
  Setup blocked the scan before it could start

- **content**  `[slides.11.content]`
  The old product was a dense, multi-step form — patient and procedure gated behind a blocking modal before scanning could begin.

- **issues**  `[slides.11.issues.0]`
  Patient selection required a multi-step modal

- **issues**  `[slides.11.issues.1]`
  Procedure had to be defined upfront

- **issues**  `[slides.11.issues.2]`
  Dropdown disconnected from the dental chart

- **issuesTitle**  `[slides.11.issuesTitle]`
  Where it broke

- **highlight**  `[slides.11.highlight]`
  Every second here was a second the patient sat waiting.

- **caption**  `[slides.11.caption]`
  Old RX setup — the blocking multi-step form. (Add img-uykask3eo.webp)

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-14ptax4ol0.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 12 — type: directions
_Words on screen: **68** · budget ~90_

- **label**  `[slides.12.label]`
  RX Setup — Exploration

- **title**  `[slides.12.title]`
  Three approaches to RX setup

- **dir1Status**  `[slides.12.dir1Status]`
  rejected

- **dir1Desc**  `[slides.12.dir1Desc]`
  Broke setup into a step-by-step wizard — organised, but more clicks and a slower start.

- **dir2Status**  `[slides.12.dir2Status]`
  rejected

- **dir2Desc**  `[slides.12.dir2Desc]`
  A collapse/expand layout — tap to open, read, close, repeat. In practice it meant constantly reopening the same section. That friction alone killed it.

- **dir3Status**  `[slides.12.dir3Status]`
  accepted

- **dir3Desc**  `[slides.12.dir3Desc]`
  Everything visible at once — no expanding, no steps. The full setup readable in a single view.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-1hrv6w761k.png`, `public/case-studies/itero-scan-workflow/img-14c9uopols.png`, `public/case-studies/itero-scan-workflow/img-23dgjitb5o.png`

---
## Slide 13 — type: problem
_Words on screen: **54** · budget ~75_

- **label**  `[slides.13.label]`
  RX Setup — After

- **title**  `[slides.13.title]`
  Users start scanning right away

- **content**  `[slides.13.content]`
  Users start right away — patient context fills in as they go, not as a prerequisite.

- **issues**  `[slides.13.issues.0]`
  Inline patient selection — no modal

- **issues**  `[slides.13.issues.1]`
  Patient context stays visible throughout

- **issues**  `[slides.13.issues.2]`
  Procedure selection tied to teeth structure

- **issuesTitle**  `[slides.13.issuesTitle]`
  What changed

- **caption**  `[slides.13.caption]`
  New RX setup — single-view, no blocking form. (Add vid-aouv40ns6o0.mp4)

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-oj0333hv40.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 14 — type: comparison
_Words on screen: **82** · budget ~110_

- **label**  `[slides.14.label]`
  RX Tooth Selection

- **title**  `[slides.14.title]`
  Selecting teeth should be as fast as pointing at them

- **beforeDescription**  `[slides.14.beforeDescription]`
  Every tooth needed its own modal — click, confirm, close, repeat. No overview of what you'd already done.

- **afterDescription**  `[slides.14.afterDescription]`
  Teeth selected directly on the chart — one or many at once — with procedures assigned inline.

- **beforeBullets**  `[slides.14.beforeBullets.0]`
  One blocking modal per tooth — no multi-select

- **beforeBullets**  `[slides.14.beforeBullets.1]`
  Complex cases required repetitive steps

- **afterBullets**  `[slides.14.afterBullets.0]`
  Select one or many teeth in one interaction

- **afterBullets**  `[slides.14.afterBullets.1]`
  Color-coded procedures visible on the chart

- **afterBullets**  `[slides.14.afterBullets.2]`
  Full treatment plan visible without opening anything

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-cy7ucjs8u0.png`, `public/case-studies/itero-scan-workflow/vid-6slnlvn2tb4.mp4`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 15 — type: chapter
_Words on screen: **16** · budget ~18_

- **number** (read-only)  `[slides.15.number]`
  02

- **title**  `[slides.15.title]`
  Scan

- **subtitle**  `[slides.15.subtitle]`
  Capturing a 3D model before lab submission — starting with where the tools should live.

---
## Slide 16 — type: problem
_Words on screen: **72** · budget ~75_

- **label**  `[slides.16.label]`
  Scan Toolbar — Before

- **title**  `[slides.16.title]`
  Tools scattered, with no home

- **content**  `[slides.16.content]`
  Icons built up from different eras, different styles, no shared visual language — and no consistent place to find them mid-scan.

- **issues**  `[slides.16.issues.0]`
  No shared visual language across icons

- **issues**  `[slides.16.issues.1]`
  No dedicated place for tools

- **issues**  `[slides.16.issues.2]`
  Every new feature added more scatter

- **issuesTitle**  `[slides.16.issuesTitle]`
  Where it broke

- **caption**  `[slides.16.caption]`
  Old toolbar — scattered, mixed-style icons. (Add img-c1djiu0kh0.webp — DESIGNER: confirm this image shows icon fragmentation, else supply a real old-toolbar screenshot.)

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-73988r6wpso.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 17 — type: directions
_Words on screen: **86** · budget ~90_

- **label**  `[slides.17.label]`
  Toolbar — Exploration

- **title**  `[slides.17.title]`
  I tested three placements with clinicians during live scanning

- **dir1Status**  `[slides.17.dir1Status]`
  rejected

- **dir1Desc**  `[slides.17.dir1Desc]`
  Bottom center — sat across the occlusal area, obscuring the scan detail that needed the most visual attention during capture.

- **dir2Status**  `[slides.17.dir2Status]`
  rejected

- **dir2Desc**  `[slides.17.dir2Desc]`
  Vertical right rail — consistent location, but always-visible consumed viewport space even when no tool was needed.

- **dir3Status**  `[slides.17.dir3Status]`
  accepted

- **dir3Desc**  `[slides.17.dir3Desc]`
  Top-right corner, collapsible — the only position clinicians could reach without pulling their eyes off the model. With placement settled, the icon problem surfaced: a correctly placed toolbar with unmemorable icons was still broken.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-e18ubxd5eo.png`, `public/case-studies/itero-scan-workflow/img-aqspm4gaww.png`, `public/case-studies/itero-scan-workflow/img-59lf56vcn4.png`

---
## Slide 18 — type: problem
_Words on screen: **72** · budget ~75_

- **label**  `[slides.18.label]`
  Icon System — Problem

- **title**  `[slides.18.title]`
  Placement wasn't the only thing broken

- **content**  `[slides.18.content]`
  Once the toolbar had a home, the next problem was plain: the icons inside it were built at different times, by different teams, with no shared style or logic.

- **issuesTitle**  `[slides.18.issuesTitle]`
  What the icons lacked

- **issues**  `[slides.18.issues.0]`
  No consistent line weight or stroke style across tools

- **issues**  `[slides.18.issues.1]`
  No shared visual logic between toolbar icons and procedure icons

- **issues**  `[slides.18.issues.2]`
  Clinicians had to memorise each icon — nothing was self-explanatory

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight, image, splitRatio_

---
## Slide 19 — type: media
_Words on screen: **90** · budget ~35 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.19.label]`
  Icon System — References

- **title**  `[slides.19.title]`
  What a consistent icon system looks like in practice

- **description**  `[slides.19.description]`
  Before drawing anything, I looked at products where icon systems work — many tools in one surface, nothing requiring memorisation.

- **caption**  `[slides.19.image.0.caption]`
  [ADD: product name — the specific visual principle this product demonstrated, e.g. consistent 1.5px line weight across 30+ tools]

- **caption**  `[slides.19.image.1.caption]`
  [ADD: product name — the specific visual principle, e.g. labeled icons as default so the tool name is never hidden]

- **caption**  `[slides.19.image.2.caption]`
  [ADD: product name — the specific visual principle, e.g. tools grouped by function with one shared stroke convention]

_Available unused fields (`media` template): caption, bullets, bulletsTitle, highlight_

---
## Slide 20 — type: problem
_Words on screen: **89** · budget ~75_

- **label**  `[slides.20.label]`
  Scan Toolbar — After

- **title**  `[slides.20.title]`
  One toolbar, one visual language

- **content**  `[slides.20.content]`
  A collapsible toolbar anchored to the top-right, rebuilt with a unified icon system — consistent line weight, consistent style, labeled.

- **issues**  `[slides.20.issues.0]`
  Toolbar fixed to one corner — always findable, never in the way

- **issues**  `[slides.20.issues.1]`
  Unified icon set — each tool reads at a glance

- **issues**  `[slides.20.issues.2]`
  New tools slot in without requiring new conventions

- **issuesTitle**  `[slides.20.issuesTitle]`
  What changed

- **bullets2Title**  `[slides.20.bullets2Title]`
  Icon redesign

- **bullets2**  `[slides.20.bullets2.0]`
  Toolbar and procedure icons rebuilt as one visual system

- **bullets2**  `[slides.20.bullets2.1]`
  Consistent line weight and style across every tool

- **caption**  `[slides.20.caption]`
  New collapsible toolbar + unified icon set. (Add vid-g2r58c0dp9s.mp4)

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-bfheykewnxs.mp4`

_Available unused fields (`textAndImage` template): conclusion_

---
## Slide 21 — type: problem
_Words on screen: **75** · budget ~75_

- **label**  `[slides.21.label]`
  Multi-scan & Compare

- **title**  `[slides.21.title]`
  Managing multiple scans and comparing them

- **content**  `[slides.21.content]`
  Multi-visit cases need more than one scan. Clinicians had to track changes between appointments. Pre- and post-treatment scans sit in tabs, with overlay and adjustable opacity.

- **bullets2Title**  `[slides.21.bullets2Title]`
  How it works

- **bullets2**  `[slides.21.bullets2.0]`
  Add scans within one session — tabs keep them organised

- **bullets2**  `[slides.21.bullets2.1]`
  Overlay scans with adjustable opacity — compare in real time

- **bullets2**  `[slides.21.bullets2.2]`
  What clinicians held in memory, now visible on screen

- **highlight**  `[slides.21.highlight]`
  Comparing two scans became visual instead of mental.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-7n89uy3l420.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 22 — type: chapter
_Words on screen: **17** · budget ~18_

- **number** (read-only)  `[slides.22.number]`
  03

- **title**  `[slides.22.title]`
  View

- **subtitle**  `[slides.22.subtitle]`
  Validating the 3D model before lab submission — and giving clinicians a clear sense of done.

---
## Slide 23 — type: problem
_Words on screen: **51** · budget ~75_

- **label**  `[slides.23.label]`
  View — Before

- **title**  `[slides.23.title]`
  No signal that the work was done

- **content**  `[slides.23.content]`
  Unlabelled icons. No hierarchy between primary and destructive actions. No completion signal. Clinicians re-checked every scan by habit — not because anything was wrong, but because nothing told them they were done.

- **highlight**  `[slides.23.highlight]`
  Re-checking is a trust symptom, not a workflow preference.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, image, splitRatio_

---
## Slide 24 — type: comparison
_Words on screen: **92** · budget ~110_

- **label**  `[slides.24.label]`
  View Tools

- **title**  `[slides.24.title]`
  From icon bars to clinical decision panels

- **beforeDescription**  `[slides.24.beforeDescription]`
  Unlabelled icon clusters with no hierarchy — every meaning memorised, nothing self-explanatory.

- **afterDescription**  `[slides.24.afterDescription]`
  Named panels with one clear primary action — the same structure across every tool, nothing to memorise.

- **beforeBullets**  `[slides.24.beforeBullets.0]`
  Unlabelled icons — meaning memorised

- **beforeBullets**  `[slides.24.beforeBullets.1]`
  No hierarchy — all actions equal weight

- **beforeBullets**  `[slides.24.beforeBullets.2]`
  Destructive actions mixed with primary

- **afterBullets**  `[slides.24.afterBullets.0]`
  Named panels with one primary CTA per tool

- **afterBullets**  `[slides.24.afterBullets.1]`
  AI detect is the default — review, not draw

- **afterBullets**  `[slides.24.afterBullets.2]`
  Destructive actions clearly separated

- **highlight**  `[slides.24.highlight]`
  Before the redesign, clinicians paused to recall what each icon meant. Named panels removed that step.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-aeiguj0sno.webp`, `public/case-studies/itero-scan-workflow/img-2x1frtk9p0.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 25 — type: problem
_Words on screen: **103** · budget ~75 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.25.label]`
  Design System

- **title**  `[slides.25.title]`
  Every component built in three states from the start

- **content**  `[slides.25.content]`
  Every pattern from the redesign became a reusable component, built in three states from the start: editable, read-only, and demo. Retrofitting read mode after the fact produces visual inconsistency — in a clinical context, that inconsistency erodes trust.

- **issuesTitle**  `[slides.25.issuesTitle]`
  What got formalised

- **issues**  `[slides.25.issues.0]`
  Input states — default, filled, disabled, error

- **issues**  `[slides.25.issues.1]`
  Button states — default, hover, pressed, disabled

- **issues**  `[slides.25.issues.2]`
  Selection controls — checkbox, indeterminate, disabled

- **issues**  `[slides.25.issues.3]`
  Progress states — uploading, processing, complete, failed

- **highlight**  `[slides.25.highlight]`
  The three-state architecture became the shared language the rest of the product was built on.

- **image**  `[slides.25.image]`
  /case-studies/itero-scan-workflow/img-5ljyfdsz90.png

- **caption**  `[slides.25.caption]`
  Design system components formalised from the redesign

- **imageFit**  `[slides.25.imageFit]`
  contain

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 26 — type: outcomes
_Words on screen: **91** · budget ~95_

- **label**  `[slides.26.label]`
  Outcomes

- **title**  `[slides.26.title]`
  What changed

- **metric** (read-only)  `[slides.26.outcomes.0.metric]`
  Faster

- **title**  `[slides.26.outcomes.0.title]`
  No blocking gate to the scan

- **description**  `[slides.26.outcomes.0.description]`
  Case open → first scan with no mandatory setup step. [ADD: setup time measurement from usability testing or post-launch analytics]

- **metric** (read-only)  `[slides.26.outcomes.1.metric]`
  Fewer

- **title**  `[slides.26.outcomes.1.title]`
  Multi-tooth selection in one step

- **description**  `[slides.26.outcomes.1.description]`
  Select a range, apply material and spec in one interaction — no tooth-by-tooth modals. [ADD: multi-tooth task completion rate from testing]

- **metric** (read-only)  `[slides.26.outcomes.2.metric]`
  Clearer

- **title**  `[slides.26.outcomes.2.title]`
  Zero blocking modals on the critical path

- **description**  `[slides.26.outcomes.2.description]`
  Between case open and scan start, no popup blocks progress.

- **metric** (read-only)  `[slides.26.outcomes.3.metric]`
  Higher

- **title**  `[slides.26.outcomes.3.title]`
  Mid-workflow changes without restarts

- **description**  `[slides.26.outcomes.3.description]`
  Procedure and materials changeable at any point. [ADD: restart rate before/after from testing or analytics]

---
## Slide 27 — type: process
_Words on screen: **92** · budget ~85_

- **label**  `[slides.27.label]`
  Next Steps

- **title**  `[slides.27.title]`
  What comes next — sequenced with the PM

- **number** (read-only)  `[slides.27.steps.0.number]`
  Now

- **title**  `[slides.27.steps.0.title]`
  Smart defaults

- **description**  `[slides.27.steps.0.description]`
  Last-used materials, common shade selections, saved configurations — the interaction model is in place; the intelligence layer isn't yet.

- **number** (read-only)  `[slides.27.steps.1.number]`
  Next

- **title**  `[slides.27.steps.1.title]`
  Rx Summary & Send

- **description**  `[slides.27.steps.1.description]`
  The final phase — showing missing fields, allowing last edits, sending the case — was out of scope. It inherits every problem the new Rx flow was designed to solve.

- **number** (read-only)  `[slides.27.steps.2.number]`
  Later

- **title**  `[slides.27.steps.2.title]`
  Lab-side connection

- **description**  `[slides.27.steps.2.description]`
  The tooth chart, grouped definitions, and materials summary were designed to be extensible. When lab workflows connect to the same surface, the architecture is ready.

_Available unused fields (`process` template): highlight, cardVariant, showNumbers_

---
## Slide 28 — type: reflection
_Words on screen: **131** · budget ~100 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.28.label]`
  Reflection

- **title**  `[slides.28.title]`
  What I'd do differently

- **whatWorked**  `[slides.28.whatWorked.0]`
  A coded prototype surfaced timing failures static screens miss — the toolbar decision depended on it.

- **whatWorked**  `[slides.28.whatWorked.1]`
  Mapping the flow first made the three-phase structure obvious before any design began.

- **whatFailed**  `[slides.28.whatFailed.0]`
  Toolbar exploration ran sequentially, not constraints-first — the rejections were obvious from sketch one.

- **whatFailed**  `[slides.28.whatFailed.1]`
  Grouped materials definition came in late, compressing testing time for edge cases.

- **whatYoudDoDifferently**  `[slides.28.whatYoudDoDifferently.0]`
  Define toolbar placement constraints before generating options.

- **whatYoudDoDifferently**  `[slides.28.whatYoudDoDifferently.1]`
  Bring grouped materials into scope in week one — the highest-leverage feature, found too late.

- **whatYouCouldntMeasure**  `[slides.28.whatYouCouldntMeasure]`
  Outcomes were validated in prototype testing, not the field. [ADD: post-launch resubmission rate, setup time, and mandatory-field error rate.]

- **whatYouLearned**  `[slides.28.whatYouLearned]`
  The Rx looked like a form problem. It was an architecture problem — setup gated the scan instead of running alongside it. Getting that diagnosis right before Figma shaped everything.

_Available unused fields (`reflection` template): nextIteration_

---
## Slide 29 — type: end
_Words on screen: **13** · budget ~18_

- **title**  `[slides.29.title]`
  Thank You

- **subtitle**  `[slides.29.subtitle]`
  Three phases that were built separately now work as one appointment.

_Available unused fields (`end` template): cta, buttons_

