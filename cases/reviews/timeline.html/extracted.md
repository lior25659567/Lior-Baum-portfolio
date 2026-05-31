# iTero
Scan & View — extracted text

Source: `src/data/case-studies/timeline.html.json` — 32 slides.
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
_Words on screen: **19** · budget ~75_

- **title**  `[slides.0.title]`
  iTero
  Scan & View

- **description**  `[slides.0.description]`
  Redesigning a live clinical scanning experience

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  Align Technology

- **focusLabel**  `[slides.0.focusLabel]`
  Focus

- **focus**  `[slides.0.focus]`
  Clinical UX & System Design

_Available unused fields (`intro` template): metaItems, subtitle, logo, introHeaderMode, splitRatio, cta, headlineMetric_

---
## Slide 1 — type: context
_Words on screen: **51** · budget ~75_

- **label**  `[slides.1.label]`
  Background

- **title**  `[slides.1.title]`
  What is Align Technology

- **content**  `[slides.1.content]`
  Align Technology develops digital systems used by clinicians during live dental procedures.
  iTero is a real-time intraoral scanner designed for use while the patient is in the chair.

- **highlight**  `[slides.1.highlight]`
  The platform supports scanning, validation, and review within a single clinical session. Accuracy and speed are equally critical.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 2 — type: context
_Words on screen: **48** · budget ~75_

- **label**  `[slides.2.label]`
  Context

- **title**  `[slides.2.title]`
  Scanning is a high-pressure environment

- **content**  `[slides.2.content]`
  iTero is used in moments where clinicians must act quickly and confidently.

- **bullets**  `[slides.2.bullets.0]`
  The scanner is held in one hand

- **bullets**  `[slides.2.bullets.1]`
  Attention shifts between patient and screen

- **bullets**  `[slides.2.bullets.2]`
  Adjustments happen in real time

- **bullets**  `[slides.2.bullets.3]`
  Delays increase chair time

- **highlight**  `[slides.2.highlight]`
  The interface must support flow without demanding attention.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 3 — type: problem
_Words on screen: **47** · budget ~75_

- **label**  `[slides.3.label]`
  The Breakdown

- **title**  `[slides.3.title]`
  When incremental improvements stopped working

- **content**  `[slides.3.content]`
  Over time, new tools and capabilities were added.

- **issues**  `[slides.3.issues.0]`
  Additional scan types

- **issues**  `[slides.3.issues.1]`
  Expanded post-scan tools

- **issues**  `[slides.3.issues.2]`
  More review options

- **conclusion**  `[slides.3.conclusion]`
  Each feature solved a specific need. Together, they created a fragmented experience. Scanning, editing, and reviewing no longer felt like one connected process.

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, highlight, splitRatio_

---
## Slide 4 — type: context
_Words on screen: **59** · budget ~75_

- **label**  `[slides.4.label]`
  Research & Insight

- **title**  `[slides.4.title]`
  What clinicians struggled with

- **content**  `[slides.4.content]`
  From interviews and live walkthroughs, one theme repeated:
  
  This was not a usability issue in isolation. It was a structural breakdown in the overall flow.

- **highlight**  `[slides.4.highlight]`
  "I'm never fully sure where I am — scanning, editing, or reviewing."

- **bulletsTitle**  `[slides.4.bulletsTitle]`
  Key issues:

- **bullets**  `[slides.4.bullets.0]`
  Unclear system state

- **bullets**  `[slides.4.bullets.1]`
  Tools scattered across the interface

- **bullets**  `[slides.4.bullets.2]`
  Fear of making irreversible changes

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, image, splitRatio_

---
## Slide 5 — type: goals
_Words on screen: **60** · budget ~100_

- **label**  `[slides.5.label]`
  Goals & KPIs

- **title**  `[slides.5.title]`
  Defining success before redesign

- **description**  `[slides.5.description.0]`
  Before redesigning, success criteria were clearly defined.

- **number** (read-only)  `[slides.5.goals.0.number]`
  1

- **title**  `[slides.5.goals.0.title]`
  Unified Experience

- **description**  `[slides.5.goals.0.description]`
  Create a unified Scan and View experience

- **number** (read-only)  `[slides.5.goals.1.number]`
  2

- **title**  `[slides.5.goals.1.title]`
  Reduce Cognitive Load

- **description**  `[slides.5.goals.1.description]`
  Reduce cognitive load during live procedures

- **number** (read-only)  `[slides.5.goals.2.number]`
  3

- **title**  `[slides.5.goals.2.title]`
  Enable Complexity

- **description**  `[slides.5.goals.2.description]`
  Enable complex workflows without confusion

- **number** (read-only)  `[slides.5.goals.3.number]`
  4

- **title**  `[slides.5.goals.3.title]`
  Scalable Structure

- **description**  `[slides.5.goals.3.description]`
  Build a scalable structure for future tools

- **kpis**  `[slides.5.kpis.0]`
  Tool selection time

- **kpis**  `[slides.5.kpis.1]`
  Overall scan duration

- **kpis**  `[slides.5.kpis.2]`
  Misclick rate

- **kpis**  `[slides.5.kpis.3]`
  Adoption of advanced features

_Available unused fields (`goals` template): goalsCardsTitle, gridColumns, showGoalsSection, kpisGridColumns, showKpisSection, highlight, cardVariant, showNumbers_

---
## Slide 6 — type: chapter
_Words on screen: **3** · budget ~18_

- **number** (read-only)  `[slides.6.number]`
  01

- **title**  `[slides.6.title]`
  Foundation

- **subtitle**  `[slides.6.subtitle]`
  Icon System

---
## Slide 7 — type: problem
_Words on screen: **36** · budget ~75_

- **label**  `[slides.7.label]`
  The Problem

- **title**  `[slides.7.title]`
  Icons that worked individually failed as a system

- **content**  `[slides.7.content]`
  As the toolset grew, icon inconsistencies became more visible.

- **issues**  `[slides.7.issues.0]`
  Mixed stroke weights

- **issues**  `[slides.7.issues.1]`
  Uneven visual balance

- **issues**  `[slides.7.issues.2]`
  Conflicting metaphors

- **conclusion**  `[slides.7.conclusion]`
  When grouped together, they created visual noise and hesitation.

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, highlight, splitRatio_

---
## Slide 8 — type: context
_Words on screen: **36** · budget ~75_

- **label**  `[slides.8.label]`
  The Solution

- **title**  `[slides.8.title]`
  Creating a scalable icon language

- **content**  `[slides.8.content]`
  The icon system was redesigned before adjusting layout.
  
  Changes included unified grid and stroke rules, balanced visual weight, and simplified metaphors.
  
  This created a visual foundation capable of scaling.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 9 — type: chapter
_Words on screen: **3** · budget ~18_

- **number** (read-only)  `[slides.9.number]`
  02

- **title**  `[slides.9.title]`
  Live Scanning

- **subtitle**  `[slides.9.subtitle]`
  Structure

---
## Slide 10 — type: problem
_Words on screen: **32** · budget ~75_

- **label**  `[slides.10.label]`
  The Problem

- **title**  `[slides.10.title]`
  Tools without a predictable structure

- **content**  `[slides.10.content]`
  Even with aligned icons, tools were problematic.

- **issues**  `[slides.10.issues.0]`
  Spread across the interface

- **issues**  `[slides.10.issues.1]`
  Difficult to reach with one hand

- **issues**  `[slides.10.issues.2]`
  Competing with the scan canvas

- **conclusion**  `[slides.10.conclusion]`
  Clinicians searched mid-scan.

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, highlight, splitRatio_

---
## Slide 11 — type: testing
_Words on screen: **20** · budget ~75_

- **label**  `[slides.11.label]`
  Exploration

- **title**  `[slides.11.title]`
  Testing toolbar positions

- **content**  `[slides.11.content]`
  Multiple toolbar layouts were tested. Each was evaluated for reachability, obstruction, and speed.

- **layouts**  `[slides.11.layouts.0]`
  Vertical

- **layouts**  `[slides.11.layouts.1]`
  Bottom

- **layouts**  `[slides.11.layouts.2]`
  Top

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 12 — type: context
_Words on screen: **33** · budget ~75_

- **label**  `[slides.12.label]`
  The Solution

- **title**  `[slides.12.title]`
  Defining a single home for scanning actions

- **content**  `[slides.12.content]`
  The horizontal top toolbar proved most stable.
  
  Predictable reach, minimal obstruction, and strong muscle memory.
  
  This became the structural anchor of the Scan page.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 13 — type: context
_Words on screen: **26** · budget ~75_

- **label**  `[slides.13.label]`
  The Problem

- **title**  `[slides.13.title]`
  One static toolbar couldn't support all moments

- **content**  `[slides.13.content]`
  Different clinicians had different needs.
  
  Experts wanted speed. Others wanted reassurance. Icons alone were not always sufficient.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, image, splitRatio_

---
## Slide 14 — type: context
_Words on screen: **29** · budget ~75_

- **label**  `[slides.14.label]`
  The Solution

- **title**  `[slides.14.title]`
  An adaptive toolbar for speed and clarity

- **content**  `[slides.14.content]`
  The toolbar supports two states: collapsed (icons only) and expanded (icons with labels).
  
  Clinicians can switch states without interrupting scanning.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 15 — type: chapter
_Words on screen: **5** · budget ~18_

- **number** (read-only)  `[slides.15.number]`
  03

- **title**  `[slides.15.title]`
  Clinical Tools

- **subtitle**  `[slides.15.subtitle]`
  Redesigning core interactions

---
## Slide 16 — type: problem
_Words on screen: **23** · budget ~75_

- **label**  `[slides.16.label]`
  Prep Review — Problem

- **title**  `[slides.16.title]`
  Validation felt like technical editing

- **content**  `[slides.16.content]`
  The legacy Prep Review required manual adjustments.

- **issues**  `[slides.16.issues.0]`
  Clinicians focused on correcting instead of validating

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 17 — type: context
_Words on screen: **28** · budget ~75_

- **label**  `[slides.17.label]`
  Prep Review — Solution

- **title**  `[slides.17.title]`
  Turning validation into a decision checkpoint

- **content**  `[slides.17.content]`
  Prep Review was reframed as a binary decision: Select, or Erase and Rescan.
  
  AI validates. The clinician confirms.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 18 — type: problem
_Words on screen: **25** · budget ~75_

- **label**  `[slides.18.label]`
  Margin Line — Problem

- **title**  `[slides.18.title]`
  AI existed but was not central

- **content**  `[slides.18.content]`
  AI detection was hidden behind secondary actions.

- **issues**  `[slides.18.issues.0]`
  Clinicians manually drew margins, increasing fatigue and error

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 19 — type: context
_Words on screen: **28** · budget ~75_

- **label**  `[slides.19.label]`
  Margin Line — Solution

- **title**  `[slides.19.title]`
  Making AI the primary path

- **content**  `[slides.19.content]`
  The tool was redesigned around AI-first detection.
  
  Detect as the main action. Visible tooth context. Review instead of draw.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 20 — type: problem
_Words on screen: **22** · budget ~75_

- **label**  `[slides.20.label]`
  Trim Tool — Problem

- **title**  `[slides.20.title]`
  Precision interaction under pressure

- **content**  `[slides.20.content]`
  The old Trim tool required small, precise taps.

- **issues**  `[slides.20.issues.0]`
  This increased open-mouth time and fatigue

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 21 — type: context
_Words on screen: **23** · budget ~75_

- **label**  `[slides.21.label]`
  Trim Tool — Solution

- **title**  `[slides.21.title]`
  A touch-native confirm loop

- **content**  `[slides.21.content]`
  Trim was redesigned for one-handed interaction.
  
  Large gesture trimming. Clear Confirm and Undo. Stage-based flow.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 22 — type: chapter
_Words on screen: **2** · budget ~18_

- **number** (read-only)  `[slides.22.number]`
  04

- **title**  `[slides.22.title]`
  Multi-Scan

- **subtitle**  `[slides.22.subtitle]`
  Workflows

---
## Slide 23 — type: problem
_Words on screen: **31** · budget ~75_

- **label**  `[slides.23.label]`
  The Problem

- **title**  `[slides.23.title]`
  A system built for one scan

- **content**  `[slides.23.content]`
  Real clinical cases require multiple interactions.

- **issues**  `[slides.23.issues.0]`
  Additional scans

- **issues**  `[slides.23.issues.1]`
  Revisions

- **issues**  `[slides.23.issues.2]`
  Bite scans

- **issues**  `[slides.23.issues.3]`
  Pre and post comparison

- **conclusion**  `[slides.23.conclusion]`
  The previous structure did not support this clearly.

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, highlight, image, splitRatio_

---
## Slide 24 — type: context
_Words on screen: **23** · budget ~75_

- **label**  `[slides.24.label]`
  The Solution

- **title**  `[slides.24.title]`
  Structuring multiple scans as one session

- **content**  `[slides.24.content]`
  Multi-scan support was introduced with a clear structure.
  
  Tab-based structure. Clear scan labeling. Safe switching.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 25 — type: chapter
_Words on screen: **5** · budget ~18_

- **number** (read-only)  `[slides.25.number]`
  05

- **title**  `[slides.25.title]`
  Review Panel

- **subtitle**  `[slides.25.subtitle]`
  Control and confidence

---
## Slide 26 — type: problem
_Words on screen: **17** · budget ~75_

- **label**  `[slides.26.label]`
  The Problem

- **title**  `[slides.26.title]`
  Reviewing felt fragile

- **content**  `[slides.26.content]`
  Clinicians feared making mistakes during review.

- **issues**  `[slides.26.issues.0]`
  Accidental changes

- **issues**  `[slides.26.issues.1]`
  Losing context

- **issues**  `[slides.26.issues.2]`
  Incorrect comparisons

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, conclusion, highlight, image, splitRatio_

---
## Slide 27 — type: context
_Words on screen: **26** · budget ~75_

- **label**  `[slides.27.label]`
  The Solution

- **title**  `[slides.27.title]`
  A dedicated review panel for control

- **content**  `[slides.27.content]`
  A structured View panel allows clinicians to review with confidence.
  
  Show and hide layers. Adjust opacity. Compare safely.

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, splitRatio_

---
## Slide 28 — type: chapter
_Words on screen: **4** · budget ~18_

- **number** (read-only)  `[slides.28.number]`
  06

- **title**  `[slides.28.title]`
  Outcome

- **subtitle**  `[slides.28.subtitle]`
  Impact and reflection

---
## Slide 29 — type: outcomes
_Words on screen: **48** · budget ~95_

- **label**  `[slides.29.label]`
  Results

- **title**  `[slides.29.title]`
  From hesitation to confidence

- **title**  `[slides.29.outcomes.0.title]`
  Faster Tool Selection

- **description**  `[slides.29.outcomes.0.description]`
  Predictable placement reduced time to select tools during live scanning.

- **title**  `[slides.29.outcomes.1.title]`
  Reduced Hesitation

- **description**  `[slides.29.outcomes.1.description]`
  Clear system state eliminated guesswork during procedures.

- **title**  `[slides.29.outcomes.2.title]`
  Increased Adoption

- **description**  `[slides.29.outcomes.2.description]`
  Advanced features saw higher usage with a discoverable structure.

- **title**  `[slides.29.outcomes.3.title]`
  Safer Multi-Scan Workflows

- **description**  `[slides.29.outcomes.3.description]`
  Tab-based structure enabled confident switching between scans.

_Available unused fields (`outcomes` template): highlight, cardVariant, showNumbers_

---
## Slide 30 — type: testimonial
_Words on screen: **35** · budget ~45_

- **label**  `[slides.30.label]`
  Key Takeaway

- **quote**  `[slides.30.quote]`
  Designing for clarity under pressure

- **context**  `[slides.30.context]`
  In live clinical environments, structure reduces cognitive load, visible state builds confidence, and predictability drives adoption. Redesigning the system — not just the interface — made the difference.

_Available unused fields (`testimonial` template): author, role, highlight_

---
## Slide 31 — type: end
_Words on screen: **13** · budget ~18_

- **title**  `[slides.31.title]`
  Thank You

- **subtitle**  `[slides.31.subtitle]`
  Want to work together on your next project?

- **cta**  `[slides.31.cta]`
  Get in touch

_Available unused fields (`end` template): buttons, email, phone, linkedinUrl_

