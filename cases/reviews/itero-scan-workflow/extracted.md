# Clinical Scanning
Workflow — extracted text

Source: `src/data/case-studies/itero-scan-workflow.json` — 29 slides.
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

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-8myvnhq20w.png`, `public/case-studies/itero-scan-workflow/img-gex5fzttfs.png`, `public/case-studies/itero-scan-workflow/img-lel5s285kg.png`, `public/case-studies/itero-scan-workflow/img-26h3mjasne8.png`

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
_Words on screen: **66** · budget ~75_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  The Rx was a form. The clinic isn't.

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
  Every popup happened with a patient watching.

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

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 5 — type: quotes
_Words on screen: **126** · budget ~110_

- **label**  `[slides.5.label]`
  Research & Discovery

- **title**  `[slides.5.title]`
  What I heard in the room

- **content**  `[slides.5.content]`
  I interviewed doctors across procedure types — restorative specialists, general dentists, orthodontists. I asked each one to walk me through a real case: where they slowed down, what they wished worked differently. Five themes came back in every session.

- **text**  `[slides.5.quotes.0.text]`
  It feels like a long boring form — and I'm doing it with a patient in the chair.

- **author**  `[slides.5.quotes.0.author]`
  Restorative Specialist

- **text**  `[slides.5.quotes.1.text]`
  I change the procedure multiple times before I even begin scanning.

- **author**  `[slides.5.quotes.1.author]`
  General Dentist

- **text**  `[slides.5.quotes.2.text]`
  There's always another popup. I just want to get to the scan.

- **author**  `[slides.5.quotes.2.author]`
  Orthodontist

- **text**  `[slides.5.quotes.3.text]`
  Every time I select a tooth, something opens. I can't see what I've already done.

- **author**  `[slides.5.quotes.3.author]`
  Restorative Specialist

- **text**  `[slides.5.quotes.4.text]`
  The moment I go looking for a tool, I lose my rhythm completely.

- **author**  `[slides.5.quotes.4.author]`
  General Dentist

_Available unused fields (`quotes` template): gridColumns, bulletsTitle, highlight_

---
## Slide 6 — type: issuesBreakdown
_Words on screen: **152** · budget ~95 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.6.label]`
  Pain Points

- **title**  `[slides.6.title]`
  Four pain points, four design moves

- **description**  `[slides.6.description.0]`
  Five themes from the interviews, clustered into four problems the redesign had to solve. Each one became a design direction.

- **number** (read-only)  `[slides.6.issues.0.number]`
  1

- **title**  `[slides.6.issues.0.title]`
  Setup blocks the scan

- **description**  `[slides.6.issues.0.description]`
  Clinicians had to finish a long, popup-heavy form before scanning could begin — with the patient watching. Fix: setup that runs alongside the scan, not before it.

- **number** (read-only)  `[slides.6.issues.1.number]`
  2

- **title**  `[slides.6.issues.1.title]`
  Procedure locked in too early

- **description**  `[slides.6.issues.1.description]`
  Clinicians often changed the procedure several times before scanning — but every change meant starting over. Fix: procedure that can be picked or swapped in one tap, before scanning starts.

- **number** (read-only)  `[slides.6.issues.2.number]`
  3

- **title**  `[slides.6.issues.2.title]`
  Tooth-by-tooth, with no visibility

- **description**  `[slides.6.issues.2.description]`
  Every tooth opened its own modal. Clinicians couldn't see what they'd already configured. Fix: multi-select directly on the dental chart, with procedures visible at a glance.

- **number** (read-only)  `[slides.6.issues.3.number]`
  4

- **title**  `[slides.6.issues.3.title]`
  Tools scattered across the screen

- **description**  `[slides.6.issues.3.description]`
  Clinicians lost their rhythm searching for tools mid-scan — no dedicated home, no shared visual language. Fix: one toolbar with one icon system.

_Available unused fields (`issuesBreakdown` template): cardsTitle, gridColumns, highlight, cardVariant, showNumbers_

---
## Slide 7 — type: problem
_Words on screen: **97** · budget ~75 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.7.label]`
  User Flow Mapping

- **title**  `[slides.7.title]`
  What clinicians actually do — not what the product assumed

- **content**  `[slides.7.content]`
  The research surfaced what hurt. Mapping the flow showed where each complaint lived — and the friction clustered at the handoffs between phases.

- **issues**  `[slides.7.issues.0]`
  RX → Scan: setup blocked the clinician before any scan began

- **issues**  `[slides.7.issues.1]`
  Scan → View: tool access broke the clinician's rhythm mid-capture

- **issues**  `[slides.7.issues.2]`
  View → submit: no completion signal — View felt unfinished

- **issuesTitle**  `[slides.7.issuesTitle]`
  Three breakpoints — one per phase handoff

- **highlight**  `[slides.7.highlight]`
  The interviews told me what hurt. The flow told me where to fix it.

- **caption**  `[slides.7.image.0.caption]`
  Appointment flow map — three handoffs, three breakpoints

- **imageFit**  `[slides.7.imageFit]`
  contain

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-11jh7m97o0c.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 8 — type: goals
_Words on screen: **66** · budget ~100_

- **label**  `[slides.8.label]`
  Design Goals

- **title**  `[slides.8.title]`
  Goals by phase

- **number** (read-only)  `[slides.8.goals.0.number]`
  RX 1

- **title**  `[slides.8.goals.0.title]`
  Configuration in one step

- **description**  `[slides.8.goals.0.description]`
  Multi-select teeth, group materials, one interaction.

- **number** (read-only)  `[slides.8.goals.1.number]`
  RX 2

- **title**  `[slides.8.goals.1.title]`
  Less scrolling, easier to change

- **description**  `[slides.8.goals.1.description]`
  Shorter view, fewer buried menus.

- **number** (read-only)  `[slides.8.goals.2.number]`
  S&V 1

- **title**  `[slides.8.goals.2.title]`
  Scanning stays uninterrupted

- **description**  `[slides.8.goals.2.description]`
  Tools accessible without leaving the capture.

- **number** (read-only)  `[slides.8.goals.3.number]`
  S&V 2

- **title**  `[slides.8.goals.3.title]`
  One visual language

- **description**  `[slides.8.goals.3.description]`
  No icon memorisation, no mixed styles.

- **kpis**  `[slides.8.kpis.0]`
  Avg teeth per interaction

- **kpis**  `[slides.8.kpis.1]`
  Scroll depth in RX setup

- **kpis**  `[slides.8.kpis.2]`
  Blocking popups per case

- **kpis**  `[slides.8.kpis.3]`
  Time to find the right tool

- **kpis**  `[slides.8.kpis.4]`
  Tool discovery rate

- **goalsCardsTitle**  `[slides.8.goalsCardsTitle]`
  Goals

_Available unused fields (`goals` template): description, showGoalsSection, highlight, showNumbers_

---
## Slide 9 — type: issuesBreakdown
_Words on screen: **96** · budget ~95_

- **label**  `[slides.9.label]`
  Constraints

- **title**  `[slides.9.title]`
  What I kept in mind while designing

- **number** (read-only)  `[slides.9.issues.0.number]`
  1

- **title**  `[slides.9.issues.0.title]`
  Three surfaces

- **description**  `[slides.9.issues.0.description]`
  Scanner (touch-only, gloved hands), MIDC desktop, and web — hover works with a mouse, but the scanner can't rely on it.

- **number** (read-only)  `[slides.9.issues.1.number]`
  2

- **title**  `[slides.9.issues.1.title]`
  Backward compatibility

- **description**  `[slides.9.issues.1.description]`
  Old Rx stayed live for in-progress cases.

- **number** (read-only)  `[slides.9.issues.2.number]`
  3

- **title**  `[slides.9.issues.2.title]`
  Feature-flagged

- **description**  `[slides.9.issues.2.description]`
  On or off per company — learnable on first contact, every time.

- **number** (read-only)  `[slides.9.issues.3.number]`
  4

- **title**  `[slides.9.issues.3.title]`
  Read and demo states

- **description**  `[slides.9.issues.3.description]`
  Three states designed in from day one — not retrofitted.

- **description**  `[slides.9.description.0]`
  Not every constraint forced a specific decision
  but each one stayed in the back of my mind while designing, 
  shaping what felt safe to ship across all three surfaces.

_Available unused fields (`issuesBreakdown` template): cardsTitle, gridColumns, highlight, cardVariant, showNumbers_

---
## Slide 10 — type: problem
_Words on screen: **89** · budget ~75_

- **label**  `[slides.10.label]`
  Interactive Prototype

- **title**  `[slides.10.title]`
  A coded prototype to test decisions before development

- **content**  `[slides.10.content]`
  Figma shows what a screen looks like — it can't show how the workflow feels. I built the prototype in code so flow and timing problems surfaced before any screen was locked.

- **bullets2Title**  `[slides.10.bullets2Title]`
  What this enabled

- **bullets2**  `[slides.10.bullets2.0]`
  Flow problems caught before any screen was locked

- **bullets2**  `[slides.10.bullets2.1]`
  Test and adjust options live — no waiting on a new Figma file

- **bullets2**  `[slides.10.bullets2.2]`
  Faster iteration — change something, see it work, decide

- **highlight**  `[slides.10.highlight]`
  Some design decisions can only be made in motion.

- **caption**  `[slides.10.image.0.caption]`
  Interactive prototype built in code

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 11 — type: chapter
_Words on screen: **19** · budget ~18_

- **number** (read-only)  `[slides.11.number]`
  01

- **title**  `[slides.11.title]`
  RX

- **subtitle**  `[slides.11.subtitle]`
  Defining the patient, procedure, and case before scanning — and the setup gate I had to clear first.

---
## Slide 12 — type: problem
_Words on screen: **96** · budget ~75 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.12.label]`
  RX Setup — Before

- **title**  `[slides.12.title]`
  Setup blocked the scan before it could start

- **content**  `[slides.12.content]`
  The old product was a dense, multi-step form — patient and procedure gated behind blocking modals before scanning could begin. Every change opened another popup.

- **issues**  `[slides.12.issues.0]`
  Patient selection required a multi-step modal

- **issues**  `[slides.12.issues.1]`
  Changing a procedure triggered a blocking popup every time

- **issues**  `[slides.12.issues.2]`
  Dropdown disconnected from the dental chart — no visual link to teeth

- **issues**  `[slides.12.issues.3]`
  Procedure had to be defined upfront, before any scan data existed

- **issuesTitle**  `[slides.12.issuesTitle]`
  Where it broke

- **highlight**  `[slides.12.highlight]`
  Every second here was a second the patient sat waiting.

- **caption**  `[slides.12.caption]`
  Old RX setup — the blocking multi-step form.

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 13 — type: directions
_Words on screen: **103** · budget ~90_

- **label**  `[slides.13.label]`
  RX Setup — Low-Fidelity Wireframes

- **title**  `[slides.13.title]`
  Three structures, sketched before any polish

- **dir1Status**  `[slides.13.dir1Status]`
  neutral

- **dir1Desc**  `[slides.13.dir1Desc]`
  Wizard. Step-by-step, one decision per screen. Easy to test the boundary — does step-gating help or hurt under chairside pressure?

- **dir2Status**  `[slides.13.dir2Status]`
  neutral

- **dir2Desc**  `[slides.13.dir2Desc]`
  Accordion. Everything on one screen, but collapsed by default. Open what you need, leave the rest closed.

- **dir3Status**  `[slides.13.dir3Status]`
  neutral

- **dir3Desc**  `[slides.13.dir3Desc]`
  Single view. Everything visible at once — no steps, no walls. The riskiest structurally, the simplest to use.

- **description**  `[slides.13.description]`
  Before any polish, I sketched the three structural options as wireframes — the cheapest way to ask which form model actually fit chairside use. All three got built. All three got tested with clinicians.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-10i8yr5560.png`, `public/case-studies/itero-scan-workflow/img-1qy8chgfx0.png`, `public/case-studies/itero-scan-workflow/img-3n4qli5pvc.png`

---
## Slide 14 — type: directions
_Words on screen: **67** · budget ~90_

- **label**  `[slides.14.label]`
  RX Setup — Exploration

- **title**  `[slides.14.title]`
  Three approaches — tested with clinicians on real cases

- **dir1Status**  `[slides.14.dir1Status]`
  rejected

- **dir1Desc**  `[slides.14.dir1Desc]`
  Step-by-step wizard. Organised, but clinicians felt railroaded — too rigid for chairside use.

- **dir2Status**  `[slides.14.dir2Status]`
  rejected

- **dir2Desc**  `[slides.14.dir2Desc]`
  Collapse/expand layout — tap to open, read, close, repeat. In practice, clinicians reopened the same section constantly.

- **dir3Status**  `[slides.14.dir3Status]`
  accepted

- **dir3Desc**  `[slides.14.dir3Desc]`
  Everything visible at once — no steps, no walls. Same fields, same order as before — just nothing in the way.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-1hrv6w761k.png`, `public/case-studies/itero-scan-workflow/img-14c9uopols.png`, `public/case-studies/itero-scan-workflow/img-23dgjitb5o.png`

---
## Slide 15 — type: problem
_Words on screen: **82** · budget ~75_

- **label**  `[slides.15.label]`
  RX Setup — After

- **title**  `[slides.15.title]`
  Setup runs alongside the scan — not before it

- **content**  `[slides.15.content]`
  Same fields, same order — just no walls between them. The setup is shorter, the menus aren't buried, and the actions that mattered most are visible at a glance.

- **issues**  `[slides.15.issues.0]`
  Single view — no modals, no popups, less scrolling

- **issues**  `[slides.15.issues.1]`
  Change procedure easily — pick or swap in one tap

- **issues**  `[slides.15.issues.2]`
  New patient created from a dedicated, always-visible entry

- **issuesTitle**  `[slides.15.issuesTitle]`
  What changed

- **caption**  `[slides.15.caption]`
  New RX setup — single-view, no blocking form, much less scrolling.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-8bpjdevrklc.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 16 — type: comparison
_Words on screen: **37** · budget ~110_

- **label**  `[slides.16.label]`
  RX Tooth Selection

- **title**  `[slides.16.title]`
  Multi-select replaced one at a time

- **beforeDescription**  `[slides.16.beforeDescription]`
  Every tooth needed its own modal — click, confirm, close, repeat. 

- **afterDescription**  `[slides.16.afterDescription]`
  Teeth selected directly on the chart — one or many at once — with procedures assigned inline.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-cy7ucjs8u0.png`, `public/case-studies/itero-scan-workflow/vid-59beoz3v2zo.webm`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle, highlight_

---
## Slide 17 — type: chapter
_Words on screen: **20** · budget ~18_

- **number** (read-only)  `[slides.17.number]`
  02

- **title**  `[slides.17.title]`
  Scan & View

- **subtitle**  `[slides.17.subtitle]`
  Capture and validation treated as one continuous phase — the clinician never leaves the screen between them.

---
## Slide 18 — type: problem
_Words on screen: **70** · budget ~75_

- **label**  `[slides.18.label]`
  Scan Toolbar — Before

- **title**  `[slides.18.title]`
  Tools scattered, with no home

- **content**  `[slides.18.content]`
  Icons built up from different eras, different styles, no shared visual language — and no consistent place to find them mid-scan.

- **issues**  `[slides.18.issues.0]`
  No shared visual language across icons

- **issues**  `[slides.18.issues.1]`
  No dedicated place for tools

- **issues**  `[slides.18.issues.2]`
  Every new feature added more scatter

- **issuesTitle**  `[slides.18.issuesTitle]`
  Where it broke

- **highlight**  `[slides.18.highlight]`
  A clinician shouldn't have to find a tool — the tool should find them.

- **caption**  `[slides.18.caption]`
  Old toolbar — scattered, mixed-style icons.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-73988r6wpso.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 19 — type: question

- **question**  `[slides.19.question]`
  How can every tool live in one place — without ever getting in the doctor's way?

- **support**  `[slides.19.support]`
  A single home tools could scale into, predictable enough that clinicians never had to look for it — and never had to fight it mid-scan.

---
## Slide 20 — type: problem
_Words on screen: **89** · budget ~75_

- **label**  `[slides.20.label]`
  Looking Outward

- **title**  `[slides.20.title]`
  How other platforms solved the same problem

- **content**  `[slides.20.content]`
  Instead of inventing something new, I looked at how other software handles tools that need to live in one place. Every platform with a lot of tools used the same pattern — a toolbar.

- **issuesTitle**  `[slides.20.issuesTitle]`
  What every platform agreed on

- **issues**  `[slides.20.issues.0]`
  One dedicated location for tools

- **issues**  `[slides.20.issues.1]`
  A pattern that scales as new tools get added

- **issues**  `[slides.20.issues.2]`
  Out of the way of the work, but always findable

- **highlight**  `[slides.20.highlight]`
  The format wasn't a guess — it's how platforms with lots of tools have always solved this.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-obuzpg5d0.jpg`, `public/case-studies/itero-scan-workflow/img-1dn290szcw.jpg`, `public/case-studies/itero-scan-workflow/img-28wrjys53s.jpg`, `public/case-studies/itero-scan-workflow/img-ubpw6k7cw.jpg`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 21 — type: directions
_Words on screen: **87** · budget ~90_

- **label**  `[slides.21.label]`
  Toolbar — Exploration

- **title**  `[slides.21.title]`
  Once the toolbar was the answer, the question became where to put it

- **dir1Status**  `[slides.21.dir1Status]`
  rejected

- **dir1Desc**  `[slides.21.dir1Desc]`
  Bottom center. Sat across the occlusal area — and some clinicians had to stretch to reach it depending on how they were positioned.

- **dir2Status**  `[slides.21.dir2Status]`
  rejected

- **dir2Desc**  `[slides.21.dir2Desc]`
  Vertical right rail. Always visible, but it overlapped and competed with other tools — interfering with controls clinicians already used.

- **dir3Status**  `[slides.21.dir3Status]`
  accepted

- **dir3Desc**  `[slides.21.dir3Desc]`
  Top-right corner. The only position clinicians could reach without pulling their eyes off the model — out of the scan area, out of the way.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-e18ubxd5eo.png`, `public/case-studies/itero-scan-workflow/img-aqspm4gaww.png`, `public/case-studies/itero-scan-workflow/img-59lf56vcn4.png`

---
## Slide 22 — type: problem
_Words on screen: **84** · budget ~75_

- **label**  `[slides.22.label]`
  Scan Toolbar — After

- **title**  `[slides.22.title]`
  One toolbar, one visual language

- **content**  `[slides.22.content]`
  A top-right toolbar — out of the scan area, always findable. Icons rebuilt as one system: consistent line weight, consistent style, labeled.

- **issues**  `[slides.22.issues.0]`
  Toolbar fixed to one corner — always findable

- **issues**  `[slides.22.issues.1]`
  New tools slot in without requiring new conventions

- **issuesTitle**  `[slides.22.issuesTitle]`
  What changed

- **bullets2Title**  `[slides.22.bullets2Title]`
  Icon redesign

- **bullets2**  `[slides.22.bullets2.0]`
  Toolbar and procedure icons rebuilt as one visual system

- **bullets2**  `[slides.22.bullets2.1]`
  Consistent line weight and style across every tool

- **highlight**  `[slides.22.highlight]`
  Placement and language solved together — not in sequence.

- **caption**  `[slides.22.caption]`
  New top-right toolbar + unified icon set.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-bfheykewnxs.mp4`

_Available unused fields (`textAndImage` template): conclusion_

---
## Slide 23 — type: problem
_Words on screen: **79** · budget ~75_

- **label**  `[slides.23.label]`
  Multi-scan & Compare

- **title**  `[slides.23.title]`
  Managing multiple scans and comparing them

- **content**  `[slides.23.content]`
  Complex cases need pre-treatment, treatment, and additional reference scans. Tabs scaled with the case and clinicians already knew the pattern. Overlay with adjustable opacity shows reduction prep, fit, and alignment side by side.

- **bullets2Title**  `[slides.23.bullets2Title]`
  How it works

- **bullets2**  `[slides.23.bullets2.0]`
  Tabs scale with the case — a pattern clinicians already know

- **bullets2**  `[slides.23.bullets2.1]`
  Overlay scans with adjustable opacity — see reduction prep, fit, and alignment

- **bullets2**  `[slides.23.bullets2.2]`
  What clinicians used to hold in memory, now visible on screen

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/vid-7n89uy3l420.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, conclusion_

---
## Slide 24 — type: comparison
_Words on screen: **38** · budget ~110_

- **label**  `[slides.24.label]`
  View Tools

- **title**  `[slides.24.title]`
  From icon bars to clinical decision panels

- **beforeDescription**  `[slides.24.beforeDescription]`
  Unlabelled icon clusters with no hierarchy — every meaning memorised, nothing self-explanatory.

- **afterDescription**  `[slides.24.afterDescription]`
  Named panels with one clear primary action — the same structure across every tool, nothing to memorise.

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-aeiguj0sno.webp`, `public/case-studies/itero-scan-workflow/img-2x1frtk9p0.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 25 — type: problem
_Words on screen: **65** · budget ~75_

- **label**  `[slides.25.label]`
  Design System

- **title**  `[slides.25.title]`
  Every component built in three states from the start

- **content**  `[slides.25.content]`
  Every pattern from the redesign became a reusable component — built in three states (editable, read-only, demo) and pushed to Storybook so engineering had a single source of truth.

- **issuesTitle**  `[slides.25.issuesTitle]`
  What got formalised

- **highlight**  `[slides.25.highlight]`
  The three-state architecture became the shared language the rest of the product was built on.

- **caption**  `[slides.25.image.0.caption]`
  Design system components formalised from the redesign

_Images (READ these — content may live here):_ `public/case-studies/itero-scan-workflow/img-5ljyfdsz90.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 26 — type: outcomes
_Words on screen: **77** · budget ~95_

- **label**  `[slides.26.label]`
  Outcomes

- **title**  `[slides.26.title]`
  Four goals, Four outcomes — what changed in measurable terms

- **metric** (read-only)  `[slides.26.outcomes.0.metric]`
  Fewer

- **title**  `[slides.26.outcomes.0.title]`
  Multi-tooth selection in one step

- **description**  `[slides.26.outcomes.0.description]`
  Select a range, apply procedure and material in one interaction.

- **metric** (read-only)  `[slides.26.outcomes.1.metric]`
  Less

- **title**  `[slides.26.outcomes.1.title]`
  Scrolling and buried menus

- **description**  `[slides.26.outcomes.1.description]`
  Shorter setup view — procedure, patient, and teeth all swappable in seconds.

- **metric** (read-only)  `[slides.26.outcomes.2.metric]`
  Smoother

- **title**  `[slides.26.outcomes.2.title]`
  Scanning stays in rhythm

- **description**  `[slides.26.outcomes.2.description]`
  Toolbar fixed in one corner — tools reachable without leaving the scan.

- **metric** (read-only)  `[slides.26.outcomes.3.metric]`
  Clearer

- **title**  `[slides.26.outcomes.3.title]`
  One visual language across every tool

- **description**  `[slides.26.outcomes.3.description]`
  Unified icon set replaced scattered styles — each tool reads at a glance.

---
## Slide 27 — type: reflection
_Words on screen: **201** · budget ~100 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.27.label]`
  Reflection

- **title**  `[slides.27.title]`
  What I took away

- **whatWorked**  `[slides.27.whatWorked.0]`
  Hands-on development — building parts of the UI myself meant faster rollout and quicker UX QA.

- **whatWorked**  `[slides.27.whatWorked.1]`
  Borrowing proven patterns — toolbar and tabs from products clinicians already use. Familiar over novel.

- **whatWorked**  `[slides.27.whatWorked.2]`
  Cross-functional negotiation — technical discussions with engineering shaped scope without degrading the experience.

- **whatFailed**  `[slides.27.whatFailed.0]`
  Jumped into design before fully learning the clinical world — had to go back to clinicians for terms and daily flow I missed.

- **whatFailed**  `[slides.27.whatFailed.1]`
  Showed the new icons individually before showing the full toolbar — clinicians rejected them in isolation, only accepted the system once they saw it together.

- **whatFailed**  `[slides.27.whatFailed.2]`
  Tooth chart took multiple rounds — making it scalable for complex cases while keeping the familiar context took longer than scoped.

- **whatYoudDoDifferently**  `[slides.27.whatYoudDoDifferently.0]`
  Spend more time with clinicians before opening Figma — understand the world first, design second.

- **whatYoudDoDifferently**  `[slides.27.whatYoudDoDifferently.1]`
  Validate systems in context, not in isolation — show the whole pattern, not the parts.

- **whatYoudDoDifferently**  `[slides.27.whatYoudDoDifferently.2]`
  Add an AI assistant to the RX — drafting notes and procedure suggestions as the clinician works.

- **whatYouCouldntMeasure**  `[slides.27.whatYouCouldntMeasure]`
  Outcomes were validated in prototype testing, not the field. Post-launch metrics still pending.

- **whatYouLearned**  `[slides.27.whatYouLearned]`
  Getting the diagnosis right before Figma shaped everything — and choosing familiar patterns made the rest of the work cheaper to ship.

- **reflectionDisplay**  `[slides.27.reflectionDisplay]`
  cards

_Available unused fields (`reflection` template): nextIteration_

---
## Slide 28 — type: end
_Words on screen: **14** · budget ~18_

- **title**  `[slides.28.title]`
  Thank You

- **subtitle**  `[slides.28.subtitle]`
  The Rx looked like a form problem. It was an architecture problem.

_Available unused fields (`end` template): cta, buttons_

