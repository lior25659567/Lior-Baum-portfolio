# Clinical Scanning
Workflow — extracted text

Source: `src/data/case-studies/itero-scan-workflow.json` — 22 slides.
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
_Words on screen: **76** · budget ~75_

- **title**  `[slides.0.title]`
  Clinical Scanning
  Workflow

- **description**  `[slides.0.description]`
  The patient is in the chair. The scanner is ready. The system isn't.
  I redesigned Align Technology's RX, Scan, and View workflow into one continuous system.

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
  [ADD: your role — e.g. Lead Product Designer]

- **label**  `[slides.0.metaItems.1.label]`
  Timeline

- **value**  `[slides.0.metaItems.1.value]`
  [ADD: project timeline — e.g. 6 months · 2024]

- **label**  `[slides.0.metaItems.2.label]`
  Team

- **value**  `[slides.0.metaItems.2.value]`
  [ADD: team — e.g. 1 PM · 2 engineers · 1 researcher]

- **label**  `[slides.0.metaItems.3.label]`
  Tools

- **value**  `[slides.0.metaItems.3.value]`
  Figma · Coded prototype · Claude Code

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
_Words on screen: **72** · budget ~75_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  The system grew. The experience didn't.

- **content**  `[slides.2.content]`
  RX, Scan, and View grew independently over time — three disconnected systems dressed up as one workflow.

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

- **highlight**  `[slides.2.highlight]`
  A bad scan means rescanning — with the patient still in the chair.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-ojnudsaui8.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 3 — type: quotes
_Words on screen: **121** · budget ~110_

- **label**  `[slides.3.label]`
  User Research

- **title**  `[slides.3.title]`
  What I heard in the room

- **content**  `[slides.3.content]`
  Chair-side observations and follow-up interviews with clinicians. The same frustrations, everywhere — accepted as part of the job. [ADD: participant count and research scope — e.g. N clinicians across N sessions]

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
## Slide 4 — type: problem
_Words on screen: **69** · budget ~75_

- **label**  `[slides.4.label]`
  User Flow Mapping

- **title**  `[slides.4.title]`
  Mapping the flow before touching the design

- **content**  `[slides.4.content]`
  Before designing, I mapped the full RX→Scan→View sequence as users lived it. The friction clusters were impossible to ignore.

- **issues**  `[slides.4.issues.0]`
  RX setup blocked the clinician before any scan began

- **issues**  `[slides.4.issues.1]`
  Tool access broke the clinician's rhythm mid-scan

- **issues**  `[slides.4.issues.2]`
  No completion signal — View felt unfinished

- **issuesTitle**  `[slides.4.issuesTitle]`
  What the flow revealed

- **highlight**  `[slides.4.highlight]`
  The friction wasn't random — it lived at every phase handoff.

- **image**  `[slides.4.image]`
  /case-studies/itero-scan-workflow/img-t2to0gdcf0.png

- **imageFit**  `[slides.4.imageFit]`
  contain

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 5 — type: goals
_Words on screen: **86** · budget ~100_

- **label**  `[slides.5.label]`
  Design Goals

- **title**  `[slides.5.title]`
  Four problems. Four things to get right.

- **number** (read-only)  `[slides.5.goals.0.number]`
  1

- **title**  `[slides.5.goals.0.title]`
  Start without friction

- **description**  `[slides.5.goals.0.description]`
  Remove the setup gates that block users before scanning.

- **number** (read-only)  `[slides.5.goals.1.number]`
  2

- **title**  `[slides.5.goals.1.title]`
  Keep scanning unbroken

- **description**  `[slides.5.goals.1.description]`
  Stop the interface from interrupting the act of scanning.

- **number** (read-only)  `[slides.5.goals.2.number]`
  3

- **title**  `[slides.5.goals.2.title]`
  Make every tool self-explanatory

- **description**  `[slides.5.goals.2.description]`
  Clarity built in — not figured out over time.

- **number** (read-only)  `[slides.5.goals.3.number]`
  4

- **title**  `[slides.5.goals.3.title]`
  Make results trustworthy on first view

- **description**  `[slides.5.goals.3.description]`
  A clear signal that the scan is done — no re-checks.

- **kpis**  `[slides.5.kpis.0]`
  Time from RX entry to first scan action

- **kpis**  `[slides.5.kpis.1]`
  Number of tool interactions mid-scan

- **kpis**  `[slides.5.kpis.2]`
  Rescan rate per case

- **kpis**  `[slides.5.kpis.3]`
  Self-reported confidence in scan result

- **goalsCardsTitle**  `[slides.5.goalsCardsTitle]`
  Goals

_Available unused fields (`goals` template): description, showGoalsSection, highlight, showNumbers_

---
## Slide 6 — type: problem
_Words on screen: **86** · budget ~75_

- **label**  `[slides.6.label]`
  Interactive Prototype

- **title**  `[slides.6.title]`
  Testing decisions before they became real

- **content**  `[slides.6.content]`
  I built an interactive prototype in code to simulate the real workflow before development started. Static screens can't capture continuous motion or tool sequencing — this could.

- **bullets2Title**  `[slides.6.bullets2Title]`
  What this enabled

- **bullets2**  `[slides.6.bullets2.0]`
  Real workflow simulation — not static screens

- **bullets2**  `[slides.6.bullets2.1]`
  Friction caught before development

- **bullets2**  `[slides.6.bullets2.2]`
  Changes tested the same day

- **highlight**  `[slides.6.highlight]`
  I caught real issues here: the exact moment a scan loses rhythm, the tool reach that breaks focus. None of that shows up on a static frame.

- **caption**  `[slides.6.image.0.caption]`
  Interactive prototype built in code

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 7 — type: chapter
_Words on screen: **19** · budget ~18_

- **number** (read-only)  `[slides.7.number]`
  01

- **title**  `[slides.7.title]`
  RX

- **subtitle**  `[slides.7.subtitle]`
  Defining the patient, procedure, and case before scanning — and the setup gate I had to clear first.

---
## Slide 8 — type: problem
_Words on screen: **74** · budget ~75_

- **label**  `[slides.8.label]`
  RX Setup — Before

- **title**  `[slides.8.title]`
  Setup blocked the scan before it could start

- **content**  `[slides.8.content]`
  The old product was a dense, multi-step form — patient and procedure gated behind a blocking modal before scanning could begin.

- **issues**  `[slides.8.issues.0]`
  Patient selection required a multi-step modal

- **issues**  `[slides.8.issues.1]`
  Procedure had to be defined upfront

- **issues**  `[slides.8.issues.2]`
  Dropdown disconnected from the dental chart

- **issuesTitle**  `[slides.8.issuesTitle]`
  Where it broke

- **highlight**  `[slides.8.highlight]`
  Every second here was a second the patient sat waiting.

- **caption**  `[slides.8.caption]`
  Old RX setup — the blocking multi-step form. (Add img-uykask3eo.webp)

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 9 — type: directions
_Words on screen: **68** · budget ~90_

- **label**  `[slides.9.label]`
  RX Setup — Exploration

- **title**  `[slides.9.title]`
  Three approaches to RX setup

- **dir1Status**  `[slides.9.dir1Status]`
  rejected

- **dir1Desc**  `[slides.9.dir1Desc]`
  A collapse/expand layout — tap to open, read, close, repeat. In practice it meant constantly reopening the same section. That friction alone killed it.

- **dir2Status**  `[slides.9.dir2Status]`
  rejected

- **dir2Desc**  `[slides.9.dir2Desc]`
  Broke setup into a step-by-step wizard — organised, but more clicks and a slower start.

- **dir3Status**  `[slides.9.dir3Status]`
  accepted

- **dir3Desc**  `[slides.9.dir3Desc]`
  Everything visible at once — no expanding, no steps. The full setup readable in a single view.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-9399qcjdwc.png`, `public/case-studies/itero-scan-workflow/img-6v6qayitu4.png`, `public/case-studies/itero-scan-workflow/img-e382hxcguo.png`

---
## Slide 10 — type: problem
_Words on screen: **54** · budget ~75_

- **label**  `[slides.10.label]`
  RX Setup — After

- **title**  `[slides.10.title]`
  Users start scanning right away

- **content**  `[slides.10.content]`
  Users start right away — patient context fills in as they go, not as a prerequisite.

- **issues**  `[slides.10.issues.0]`
  Inline patient selection — no modal

- **issues**  `[slides.10.issues.1]`
  Patient context stays visible throughout

- **issues**  `[slides.10.issues.2]`
  Procedure selection tied to teeth structure

- **issuesTitle**  `[slides.10.issuesTitle]`
  What changed

- **caption**  `[slides.10.caption]`
  New RX setup — single-view, no blocking form. (Add vid-aouv40ns6o0.mp4)

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 11 — type: comparison
_Words on screen: **97** · budget ~110_

- **label**  `[slides.11.label]`
  RX Tooth Selection

- **title**  `[slides.11.title]`
  Selecting teeth should be as fast as pointing at them

- **caption**  `[slides.11.beforeImage.0.caption]`
  Old — one modal per tooth, no overview

- **beforeDescription**  `[slides.11.beforeDescription]`
  Every tooth needed its own modal — click, confirm, close, repeat. No overview of what you'd already done.

- **afterDescription**  `[slides.11.afterDescription]`
  Teeth selected directly on the chart — one or many at once — with procedures assigned inline.

- **beforeBullets**  `[slides.11.beforeBullets.0]`
  One blocking modal per tooth — no multi-select

- **beforeBullets**  `[slides.11.beforeBullets.1]`
  No color coding — no clinical overview

- **beforeBullets**  `[slides.11.beforeBullets.2]`
  Complex cases required repetitive steps

- **afterBullets**  `[slides.11.afterBullets.0]`
  Select one or many teeth in one interaction

- **afterBullets**  `[slides.11.afterBullets.1]`
  Color-coded procedures visible on the chart

- **afterBullets**  `[slides.11.afterBullets.2]`
  Full treatment plan visible without opening anything

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-cy7ucjs8u0.png`, `public/case-studies/itero-scan-workflow/vid-581c99ziag0.mp4`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 12 — type: chapter
_Words on screen: **20** · budget ~18_

- **number** (read-only)  `[slides.12.number]`
  02

- **title**  `[slides.12.title]`
  Scan & View

- **subtitle**  `[slides.12.subtitle]`
  Capturing and validating a 3D model before lab submission — starting with where the tools should live.

---
## Slide 13 — type: problem
_Words on screen: **68** · budget ~75_

- **label**  `[slides.13.label]`
  Scan Toolbar — Before

- **title**  `[slides.13.title]`
  Tools scattered, with no home

- **content**  `[slides.13.content]`
  Icons built up from different sources, no shared style — and no consistent place to find them.

- **issues**  `[slides.13.issues.0]`
  No shared visual language across icons

- **issues**  `[slides.13.issues.1]`
  No dedicated place for tools

- **issues**  `[slides.13.issues.2]`
  Every new feature added more scatter

- **issuesTitle**  `[slides.13.issuesTitle]`
  Where it broke

- **caption**  `[slides.13.caption]`
  Old toolbar — scattered, mixed-style icons. (Add img-c1djiu0kh0.webp — DESIGNER: confirm this image shows icon fragmentation, else supply a real old-toolbar screenshot.)

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 14 — type: directions
_Words on screen: **90** · budget ~90_

- **label**  `[slides.14.label]`
  Toolbar — Exploration

- **title**  `[slides.14.title]`
  Where should the tools live?

- **dir1Status**  `[slides.14.dir1Status]`
  rejected

- **dir1Desc**  `[slides.14.dir1Desc]`
  A fixed left rail — always visible. In practice it ate horizontal scan space and narrowed the 3D view at the worst moment.

- **dir2Status**  `[slides.14.dir2Status]`
  rejected

- **dir2Desc**  `[slides.14.dir2Desc]`
  A top bar anchored above the viewport. Tidier than the rail, but reaching up pulled focus away from the live scan.

- **dir3Status**  `[slides.14.dir3Status]`
  accepted

- **dir3Desc**  `[slides.14.dir3Desc]`
  One collapsible toolbar, fixed to one corner. Opens when needed, hides when not. I rebuilt the toolbar and procedure icons into one visual language as part of this — every tool reads at a glance.

---
## Slide 15 — type: problem
_Words on screen: **97** · budget ~75 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.15.label]`
  Scan Toolbar — After

- **title**  `[slides.15.title]`
  One toolbar, one visual language

- **content**  `[slides.15.content]`
  A unified icon set in a collapsible toolbar — one visual language, one fixed location.

- **issues**  `[slides.15.issues.0]`
  Unified icon set — each maps to its action

- **issues**  `[slides.15.issues.1]`
  One collapsible toolbar, always in the same place

- **issues**  `[slides.15.issues.2]`
  Scalable — new tools slot in without disruption

- **issuesTitle**  `[slides.15.issuesTitle]`
  What changed

- **bullets2Title**  `[slides.15.bullets2Title]`
  Icon redesign

- **bullets2**  `[slides.15.bullets2.0]`
  Toolbar and procedure icons rebuilt into one visual system

- **bullets2**  `[slides.15.bullets2.1]`
  Every tool reads at a glance — nothing to memorise

- **highlight**  `[slides.15.highlight]`
  Tools were now one tap away — comparing more than one scan was the next problem.

- **caption**  `[slides.15.caption]`
  New collapsible toolbar + unified icon set. (Add vid-g2r58c0dp9s.mp4)

_Available unused fields (`textAndImage` template): conclusion, splitRatio_

---
## Slide 16 — type: problem
_Words on screen: **72** · budget ~75_

- **label**  `[slides.16.label]`
  Multi-scan & Compare

- **title**  `[slides.16.title]`
  Managing multiple scans  and comparing them

- **content**  `[slides.16.content]`
  Pre-treatment, post-treatment, and additional scans — organised by tabs, compared in a multi-layer panel.

- **bullets2Title**  `[slides.16.bullets2Title]`
  What this unlocked

- **bullets2**  `[slides.16.bullets2.0]`
  Add and switch between scans within one session

- **bullets2**  `[slides.16.bullets2.1]`
  Overlay scans and adjust opacity in real time

- **bullets2**  `[slides.16.bullets2.2]`
  Comparison becomes visual, not mental

- **highlight**  `[slides.16.highlight]`
  What used to be a mental task — holding two scans in your head — became a visual action. Overlay, adjust opacity, compare in seconds.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-539c9v0rkkc.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 17 — type: comparison
_Words on screen: **93** · budget ~110_

- **label**  `[slides.17.label]`
  View Tools

- **title**  `[slides.17.title]`
  From icon bars to clinical decision panels

- **caption**  `[slides.17.beforeImage.0.caption]`
  Old — unlabelled icon clusters, no hierarchy

- **caption**  `[slides.17.afterImage.0.caption]`
  New — named panels with one primary CTA per tool

- **beforeDescription**  `[slides.17.beforeDescription]`
  Unlabelled icon clusters with no hierarchy — every meaning memorised, nothing self-explanatory.

- **afterDescription**  `[slides.17.afterDescription]`
  Named panels with one clear primary action — the same structure across every tool, nothing to memorise.

- **beforeBullets**  `[slides.17.beforeBullets.0]`
  Unlabelled icons — meaning memorised

- **beforeBullets**  `[slides.17.beforeBullets.1]`
  No hierarchy — all actions equal weight

- **beforeBullets**  `[slides.17.beforeBullets.2]`
  Destructive actions mixed with primary

- **afterBullets**  `[slides.17.afterBullets.0]`
  Named panels with one primary CTA per tool

- **afterBullets**  `[slides.17.afterBullets.1]`
  AI detect is the default — review, not draw

- **afterBullets**  `[slides.17.afterBullets.2]`
  Destructive actions clearly separated

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-aeiguj0sno.webp`, `public/case-studies/itero-scan-workflow/img-2x1frtk9p0.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 18 — type: outcomes
_Words on screen: **84** · budget ~95_

- **label**  `[slides.18.label]`
  Outcomes

- **title**  `[slides.18.title]`
  What changed — and what I still need to measure

- **metric** (read-only)  `[slides.18.outcomes.0.metric]`
  Faster

- **title**  `[slides.18.outcomes.0.title]`
  Time to start scanning

- **description**  `[slides.18.outcomes.0.description]`
  Setup removed — straight to scan. [ADD: real metric or post-launch quote if available]

- **metric** (read-only)  `[slides.18.outcomes.1.metric]`
  Fewer

- **title**  `[slides.18.outcomes.1.title]`
  Interruptions mid-scan

- **description**  `[slides.18.outcomes.1.description]`
  Fixed toolbar kept the rhythm. [ADD: real metric or post-launch quote if available]

- **metric** (read-only)  `[slides.18.outcomes.2.metric]`
  Clearer

- **title**  `[slides.18.outcomes.2.title]`
  Tool clarity

- **description**  `[slides.18.outcomes.2.description]`
  Named panels — each tells you what it does.

- **metric** (read-only)  `[slides.18.outcomes.3.metric]`
  Higher

- **title**  `[slides.18.outcomes.3.title]`
  Confidence in results

- **description**  `[slides.18.outcomes.3.description]`
  One primary action per tool. No reason to re-check.

- **highlight**  `[slides.18.highlight]`
  Outcomes based on prototype testing and clinician sessions. [ADD: first real metric or post-launch quote once available]

---
## Slide 19 — type: problem
_Words on screen: **75** · budget ~75_

- **label**  `[slides.19.label]`
  Lasting Impact

- **title**  `[slides.19.title]`
  The work became the system

- **content**  `[slides.19.content]`
  Redesign patterns became a design system — documented in Figma, built in code.

- **issuesTitle**  `[slides.19.issuesTitle]`
  What got formalised

- **issues**  `[slides.19.issues.0]`
  Input states — default, filled, disabled, error

- **issues**  `[slides.19.issues.1]`
  Button states — default, hover, pressed, disabled

- **issues**  `[slides.19.issues.2]`
  Selection controls — checkbox, indeterminate, disabled

- **issues**  `[slides.19.issues.3]`
  Progress states — uploading, processing, complete, failed

- **highlight**  `[slides.19.highlight]`
  These decisions became what every feature was built on.

- **image**  `[slides.19.image]`
  [ADD: design-system component image — use the original img-5pdk4g6ngg.webp]

- **caption**  `[slides.19.caption]`
  Design system components formalised from the redesign

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 20 — type: reflection
_Words on screen: **101** · budget ~100_

- **label**  `[slides.20.label]`
  Reflection

- **title**  `[slides.20.title]`
  What I'd do differently

- **whatWorked**  `[slides.20.whatWorked.0]`
  Coded prototype — timing issues static screens never surface.

- **whatWorked**  `[slides.20.whatWorked.1]`
  Mapping the full flow first — each goal had a clear owner.

- **whatFailed**  `[slides.20.whatFailed.0]`
  Toolbar test came after early designs were reviewed.

- **whatFailed**  `[slides.20.whatFailed.1]`
  [ADD: one more specific thing that didn't go as planned — a decision that needed more iteration, a constraint that changed late, a stakeholder dynamic]

- **whatYoudDoDifferently**  `[slides.20.whatYoudDoDifferently.0]`
  Journey map in front of the team in week one.

- **whatYoudDoDifferently**  `[slides.20.whatYoudDoDifferently.1]`
  [ADD: one concrete action — e.g. run the toolbar position test before wireframes, not alongside them]

- **whatYouCouldntMeasure**  `[slides.20.whatYouCouldntMeasure]`
  Based on testing. [ADD: update with real post-launch data — rescan rate, setup time, satisfaction score]

_Available unused fields (`reflection` template): whatYouLearned, nextIteration_

---
## Slide 21 — type: end
_Words on screen: **11** · budget ~18_

- **title**  `[slides.21.title]`
  Thank You

- **subtitle**  `[slides.21.subtitle]`
  One mental model. Three phases. Every clinician's rhythm intact.

_Available unused fields (`end` template): cta, buttons_

