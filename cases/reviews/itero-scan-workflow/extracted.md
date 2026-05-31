# Clinical Scanning
Workflow — extracted text

Source: `src/data/case-studies/itero-scan-workflow.json` — 16 slides.
Each field shows its JSON path id in [brackets]. Reviewers: judge the prose,
and judge whether each slide uses the RIGHT template (see `_slide-templates.md`).
Fields marked (read-only) are factual data and cannot be auto-edited.
**Images carry real content (quotes, UI, data). READ the listed image files**
(Read tool, visual) before judging or editing — do not write `[FILL IN: quote]`
for something an image already shows. Use **Available unused fields** to add
structured fields (e.g. `metaItems`, `headlineMetric`) instead of cramming that
data into prose.

---
## Slide 0 — type: intro
_Words on screen: **36** · budget ~75_

- **title**  `[slides.0.title]`
  Clinical Scanning
  Workflow

- **description**  `[slides.0.description]`
  Align Technology powers digital dentistry chair-side. Their RX, Scan, and View workflow had friction at every phase — we redesigned all three into one continuous system.

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  Align Technology

- **focusLabel**  `[slides.0.focusLabel]`
  Focus

- **focus**  `[slides.0.focus]`
  Clinical UX System

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-6s57kfmq7o.png`, `public/case-studies/itero-scan-workflow/img-morqwmjyo.png`, `public/case-studies/itero-scan-workflow/img-4gnykp544g.png`

_Available unused fields (`intro` template): metaItems, subtitle, cta, headlineMetric_

---
## Slide 1 — type: problem
_Words on screen: **68** · budget ~75_

- **label**  `[slides.1.label]`
  The System

- **title**  `[slides.1.title]`
  A system used during live patient treatment

- **content**  `[slides.1.content]`
  iTero is used chair-side. Three phases — RX, Scan, View — feed into each other. A breakdown in one affects the whole appointment.

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
_Words on screen: **63** · budget ~75_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  The system grew. The experience didn't.

- **content**  `[slides.2.content]`
  RX, Scan, and View were built up over time with no shared logic — three disconnected systems instead of one workflow.

- **issuesTitle**  `[slides.2.issuesTitle]`
  Where it broke down

- **issues**  `[slides.2.issues.0]`
  Setup blocked users before they could scan

- **issues**  `[slides.2.issues.1]`
  Procedure and tooth selection took too much effort

- **issues**  `[slides.2.issues.2]`
  Scanning stopped every time a tool needed adjusting

- **issues**  `[slides.2.issues.3]`
  Nothing signalled when a scan was complete

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-ojnudsaui8.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 3 — type: quotes
_Words on screen: **106** · budget ~110_

- **label**  `[slides.3.label]`
  User Research

- **title**  `[slides.3.title]`
  What we heard in the room

- **content**  `[slides.3.content]`
  Live observations and follow-up interviews. The same frustrations everywhere — accepted as part of the job.

- **text**  `[slides.3.quotes.0.text]`
  The patient popup interrupts me before I even start.

- **author**  `[slides.3.quotes.0.author]`
  Dr. Yael Levi

- **text**  `[slides.3.quotes.1.text]`
  I change the procedure multiple times before I even begin scanning.

- **author**  `[slides.3.quotes.1.author]`
  Dr. Amir Cohen

- **text**  `[slides.3.quotes.2.text]`
  The moment I go looking for a tool, I lose my rhythm completely.

- **author**  `[slides.3.quotes.2.author]`
  Dr. Noa Ben-David

- **text**  `[slides.3.quotes.3.text]`
  I never fully trust the result the first time I see it.

- **author**  `[slides.3.quotes.3.author]`
  Dr. Efrat Mizrahi

- **text**  `[slides.3.quotes.4.text]`
  Even when I'm done, I keep going back to check.

- **author**  `[slides.3.quotes.4.author]`
  Dr. Daniel Katz

- **text**  `[slides.3.quotes.5.text]`
  I never know if I'm selecting the right tooth.

- **author**  `[slides.3.quotes.5.author]`
  Dr. Lior Haddad

_Available unused fields (`quotes` template): gridColumns, bulletsTitle, highlight_

---
## Slide 4 — type: goals
_Words on screen: **86** · budget ~100_

- **label**  `[slides.4.label]`
  Design Goals

- **title**  `[slides.4.title]`
  Four problems. Four things to get right.

- **number** (read-only)  `[slides.4.goals.0.number]`
  1

- **title**  `[slides.4.goals.0.title]`
  Start without friction

- **description**  `[slides.4.goals.0.description]`
  Remove the setup gates that block users before scanning.

- **number** (read-only)  `[slides.4.goals.1.number]`
  2

- **title**  `[slides.4.goals.1.title]`
  Keep scanning unbroken

- **description**  `[slides.4.goals.1.description]`
  Stop the interface from interrupting the act of scanning.

- **number** (read-only)  `[slides.4.goals.2.number]`
  3

- **title**  `[slides.4.goals.2.title]`
  Make every tool self-explanatory

- **description**  `[slides.4.goals.2.description]`
  Clarity built in — not figured out over time.

- **number** (read-only)  `[slides.4.goals.3.number]`
  4

- **title**  `[slides.4.goals.3.title]`
  Make results trustworthy on first view

- **description**  `[slides.4.goals.3.description]`
  A clear signal that the scan is done — no re-checks.

- **kpis**  `[slides.4.kpis.0]`
  Time from RX entry to first scan action

- **kpis**  `[slides.4.kpis.1]`
  Number of tool interactions mid-scan

- **kpis**  `[slides.4.kpis.2]`
  Rescan rate per case

- **kpis**  `[slides.4.kpis.3]`
  Self-reported confidence in scan result

- **goalsCardsTitle**  `[slides.4.goalsCardsTitle]`
  Goals

_Available unused fields (`goals` template): description, showGoalsSection, highlight, showNumbers_

---
## Slide 5 — type: problem
_Words on screen: **65** · budget ~75_

- **label**  `[slides.5.label]`
  Interactive Prototype

- **title**  `[slides.5.title]`
  Testing decisions before they became real

- **content**  `[slides.5.content]`
  An interactive prototype built in Claude Code — simulating the real workflow under clinical conditions before development started.

- **bullets2Title**  `[slides.5.bullets2Title]`
  What this enabled

- **bullets2**  `[slides.5.bullets2.0]`
  Real workflow simulation — not static screens

- **bullets2**  `[slides.5.bullets2.1]`
  Friction caught before development

- **bullets2**  `[slides.5.bullets2.2]`
  Changes tested the same day

- **highlight**  `[slides.5.highlight]`
  Prototyping in code tested what Figma couldn't — continuous motion, real-time feedback, tool sequencing.

- **caption**  `[slides.5.image.0.caption]`
  Interactive prototype built with Claude Code

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 6 — type: chapter
_Words on screen: **13** · budget ~18_

- **number** (read-only)  `[slides.6.number]`
  01

- **title**  `[slides.6.title]`
  RX

- **subtitle**  `[slides.6.subtitle]`
  The prescription step — defining patient, procedure, and case details before scanning.

---
## Slide 7 — type: comparison
_Words on screen: **70** · budget ~100_

- **label**  `[slides.7.label]`
  RX Setup

- **title**  `[slides.7.title]`
  Getting started shouldn't feel like a form

- **caption**  `[slides.7.beforeImage.0.caption]`
  Old — rigid multi-step setup sequence

- **beforeDescription**  `[slides.7.beforeDescription]`
  A rigid setup sequence blocked users before scanning could begin.

- **afterDescription**  `[slides.7.afterDescription]`
  Users start immediately and fill in context as they go.

- **beforeBullets**  `[slides.7.beforeBullets.0]`
  Patient selection required a multi-step modal

- **beforeBullets**  `[slides.7.beforeBullets.1]`
  Procedure had to be defined upfront

- **beforeBullets**  `[slides.7.beforeBullets.2]`
  Dropdown disconnected from the dental chart

- **afterBullets**  `[slides.7.afterBullets.0]`
  Inline patient selection — no modal

- **afterBullets**  `[slides.7.afterBullets.1]`
  Patient context stays visible throughout

- **afterBullets**  `[slides.7.afterBullets.2]`
  Procedure selection tied to teeth structure

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-uykask3eo.webp`, `public/case-studies/itero-scan-workflow/vid-aouv40ns6o0.mp4`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 8 — type: comparison
_Words on screen: **90** · budget ~100_

- **label**  `[slides.8.label]`
  RX Tooth Selection

- **title**  `[slides.8.title]`
  Selecting teeth should be as fast as pointing at them

- **caption**  `[slides.8.beforeImage.0.caption]`
  Old — one modal per tooth, no overview

- **beforeDescription**  `[slides.8.beforeDescription]`
  Every tooth needed its own modal — click, confirm, close, repeat. No overview.

- **afterDescription**  `[slides.8.afterDescription]`
  Teeth selected directly on the chart — individually or in groups — with procedures inline.

- **beforeBullets**  `[slides.8.beforeBullets.0]`
  One blocking modal per tooth — no multi-select

- **beforeBullets**  `[slides.8.beforeBullets.1]`
  No color coding — no clinical overview

- **beforeBullets**  `[slides.8.beforeBullets.2]`
  Complex cases required repetitive steps

- **afterBullets**  `[slides.8.afterBullets.0]`
  Select one or many teeth in one interaction

- **afterBullets**  `[slides.8.afterBullets.1]`
  Color-coded procedures visible on the chart

- **afterBullets**  `[slides.8.afterBullets.2]`
  Full treatment plan visible without opening anything

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-cy7ucjs8u0.png`, `public/case-studies/itero-scan-workflow/vid-581c99ziag0.mp4`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 9 — type: chapter
_Words on screen: **19** · budget ~18_

- **number** (read-only)  `[slides.9.number]`
  02

- **title**  `[slides.9.title]`
  Scan & View

- **subtitle**  `[slides.9.subtitle]`
  Capturing, analysing, and validating a 3D model in real time — before anything reaches the lab.

---
## Slide 10 — type: comparison
_Words on screen: **97** · budget ~100_

- **label**  `[slides.10.label]`
  Scan Toolbar

- **title**  `[slides.10.title]`
  From scattered icons to a system users can learn once

- **caption**  `[slides.10.beforeImage.0.caption]`
  Old — mixed styles, no consistent location

- **caption**  `[slides.10.afterImage.0.caption]`
  New — unified icons in a single collapsible toolbar

- **beforeDescription**  `[slides.10.beforeDescription]`
  Icons accumulated from different sources with no shared style — and no permanent home.

- **afterDescription**  `[slides.10.afterDescription]`
  A unified icon set and a collapsible toolbar — consistent language, fixed location.

- **beforeBullets**  `[slides.10.beforeBullets.0]`
  No shared visual language across icons

- **beforeBullets**  `[slides.10.beforeBullets.1]`
  No dedicated place for tools

- **beforeBullets**  `[slides.10.beforeBullets.2]`
  Every new feature added more scatter

- **afterBullets**  `[slides.10.afterBullets.0]`
  Unified icon set — each maps to its action

- **afterBullets**  `[slides.10.afterBullets.1]`
  One collapsible toolbar, always in the same place

- **afterBullets**  `[slides.10.afterBullets.2]`
  Scalable — new tools slot in without disruption

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-c1djiu0kh0.webp`, `public/case-studies/itero-scan-workflow/vid-g2r58c0dp9s.mp4`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 11 — type: problem
_Words on screen: **63** · budget ~75_

- **label**  `[slides.11.label]`
  Multi-scan & Compare

- **title**  `[slides.11.title]`
  Managing multiple scans  and comparing them

- **content**  `[slides.11.content]`
  Pre-treatment, post-treatment, and additional scans — organised by tabs, compared in a multi-layer panel.

- **bullets2Title**  `[slides.11.bullets2Title]`
  What this unlocked

- **bullets2**  `[slides.11.bullets2.0]`
  Add and switch between scans within one session

- **bullets2**  `[slides.11.bullets2.1]`
  Overlay scans and adjust opacity in real time

- **bullets2**  `[slides.11.bullets2.2]`
  Comparison becomes visual, not mental

- **highlight**  `[slides.11.highlight]`
  What used to be a mental task became a visual action you can do in seconds.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-539c9v0rkkc.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 12 — type: comparison
_Words on screen: **89** · budget ~100_

- **label**  `[slides.12.label]`
  View Tools

- **title**  `[slides.12.title]`
  From icon bars to clinical decision panels

- **caption**  `[slides.12.beforeImage.0.caption]`
  Old — unlabelled icon clusters, no hierarchy

- **caption**  `[slides.12.afterImage.0.caption]`
  New — named panels with one primary CTA per tool

- **beforeDescription**  `[slides.12.beforeDescription]`
  Unlabelled icon clusters with no hierarchy — meaning had to be memorised.

- **afterDescription**  `[slides.12.afterDescription]`
  Named panels with one clear primary action — same structure across every tool.

- **beforeBullets**  `[slides.12.beforeBullets.0]`
  Unlabelled icons — meaning memorised

- **beforeBullets**  `[slides.12.beforeBullets.1]`
  No hierarchy — all actions equal weight

- **beforeBullets**  `[slides.12.beforeBullets.2]`
  Destructive actions mixed with primary

- **afterBullets**  `[slides.12.afterBullets.0]`
  Named panels with one primary CTA per tool

- **afterBullets**  `[slides.12.afterBullets.1]`
  AI detect is the default — review, not draw

- **afterBullets**  `[slides.12.afterBullets.2]`
  Destructive actions clearly separated

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-aeiguj0sno.webp`, `public/case-studies/itero-scan-workflow/img-2x1frtk9p0.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 13 — type: problem
_Words on screen: **49** · budget ~75_

- **label**  `[slides.13.label]`
  Design System

- **title**  `[slides.13.title]`
  The work became the system

- **content**  `[slides.13.content]`
  Patterns from the redesign were formalised into a design system — published in Figma and built in Claude Code.

- **highlight**  `[slides.13.highlight]`
  The design influenced the system built after it — and became a permanent part of it.

- **caption**  `[slides.13.image.0.caption]`
  Design system components formalised from the redesign

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-5pdk4g6ngg.webp`

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion_

---
## Slide 14 — type: outcomes
_Words on screen: **49** · budget ~95_

- **label**  `[slides.14.label]`
  Outcomes

- **title**  `[slides.14.title]`
  Four friction points. Four things that got better.

- **metric** (read-only)  `[slides.14.outcomes.0.metric]`
  Faster

- **title**  `[slides.14.outcomes.0.title]`
  Time to start scanning

- **description**  `[slides.14.outcomes.0.description]`
  No setup gates — clinicians start when ready.

- **metric** (read-only)  `[slides.14.outcomes.1.metric]`
  Fewer

- **title**  `[slides.14.outcomes.1.title]`
  Interruptions mid-scan

- **description**  `[slides.14.outcomes.1.description]`
  A consistent toolbar kept doctors in flow.

- **metric** (read-only)  `[slides.14.outcomes.2.metric]`
  Clearer

- **title**  `[slides.14.outcomes.2.title]`
  Tools and states

- **description**  `[slides.14.outcomes.2.description]`
  Named panels replaced icon clusters.

- **metric** (read-only)  `[slides.14.outcomes.3.metric]`
  Higher

- **title**  `[slides.14.outcomes.3.title]`
  Confidence in results

- **description**  `[slides.14.outcomes.3.description]`
  Clear completion signals — trusted on first view.

_Available unused fields (`outcomes` template): highlight_

---
## Slide 15 — type: end
_Words on screen: **7** · budget ~18_

- **title**  `[slides.15.title]`
  Thank You

- **subtitle**  `[slides.15.subtitle]`
  Designing systems for real-time decisions

_Available unused fields (`end` template): cta, buttons_

