# WizeCare — extracted text

Source: `src/data/case-studies/wizecare.json` — 15 slides.
Each field shows its JSON path id in [brackets]. Reviewers: judge the prose,
and judge whether each slide uses the RIGHT template (see `_slide-templates.md`).
Fields marked (read-only) are factual data and cannot be auto-edited.
**Images carry real content (quotes, UI, data). READ the listed image files**
(Read tool, visual) before judging or editing — do not write `[FILL IN: quote]`
for something an image already shows. Use **Available unused fields** to add
structured fields (e.g. `metaItems`, `headlineMetric`) instead of cramming that
data into prose.

## ⚠ Repeated facts (same stat on 2+ slides)
State each stat ONCE unless a deliberate tease (e.g. a cover headline metric also
shown in outcomes). Otherwise the repeat reads as padding — pick one home, cut the rest.

- **"80 %"** appears on slides 12, 13

---
## Slide 0 — type: intro
_Words on screen: **69** · budget ~75_

- **title**  `[slides.0.title]`
  Making everyday clinician work feel like less work

- **description**  `[slides.0.description]`
  Three everyday physiotherapist tasks — finding a patient, editing a care plan, building a protocol — fought clinicians at every turn. I rebuilt all three around one familiar pattern, so the platform saved time instead of costing it.

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  WizeCare

- **focusLabel**  `[slides.0.focusLabel]`
  Platform

- **focus**  `[slides.0.focus]`
  Desktop Dashboard (B2B SaaS)

- **label**  `[slides.0.metaItems.0.label]`
  Role

- **value**  `[slides.0.metaItems.0.value]`
  Product Designer

- **label**  `[slides.0.metaItems.1.label]`
  Timeline

- **value**  `[slides.0.metaItems.1.value]`
  12 weeks · 2024

- **label**  `[slides.0.metaItems.2.label]`
  Team

- **value**  `[slides.0.metaItems.2.value]`
  1 PM · 2 eng

- **label**  `[slides.0.metaItems.3.label]`
  Tools

- **value**  `[slides.0.metaItems.3.value]`
  Figma

_Images (READ these — content may live here):_ `public/case-studies/wizecare/img-3e9ywkzxfk.webp`, `public/case-studies/wizecare/img-4oykmxaws0.webp`, `public/case-studies/wizecare/img-ehylbk97xs.webp`

_Available unused fields (`intro` template): subtitle, logo, introHeaderMode, cta_

---
## Slide 1 — type: problem
_Words on screen: **78** · budget ~75_

- **label**  `[slides.1.label]`
  The Context

- **title**  `[slides.1.title]`
  Physiotherapists spend too much of their day fighting admin, not treating patients

- **content**  `[slides.1.content]`
  Therapists run a full day of back-to-back patients across three separate systems — exercise history, notes, billing. Hunting between screens adds up fast, and by lunch they're already behind. So they lean on years-old routines and drop any tool that adds steps.

- **highlight**  `[slides.1.highlight]`
  The system had to feel like a time-saver from day one. That made adoption — not features — the real design problem.

_Images (READ these — content may live here):_ `public/case-studies/wizecare/img-39wooi4v0w.webp`

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion_

---
## Slide 2 — type: issuesBreakdown
_Words on screen: **105** · budget ~95_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  Three places it broke down

- **description**  `[slides.2.description]`
  Across 6 clinic observations, 8 provider interviews, and 89 support tickets over 8 weeks, the same three friction points kept surfacing.

- **number** (read-only)  `[slides.2.issues.0.number]`
  1

- **title**  `[slides.2.issues.0.title]`
  Patient screen unclear

- **description**  `[slides.2.issues.0.description]`
  Patient details and care plans were buried with no hierarchy. Clinicians were "unclear how to navigate to the patient tab to view a workout session."

- **number** (read-only)  `[slides.2.issues.1.number]`
  2

- **title**  `[slides.2.issues.1.title]`
  Care plan editing too complex

- **description**  `[slides.2.issues.1.description]`
  A single edit spanned multiple screens, losing clinical context. Clinicians "couldn't see all the exercise options at once."

- **number** (read-only)  `[slides.2.issues.2.number]`
  3

- **title**  `[slides.2.issues.2.title]`
  No protocol creation flow

- **description**  `[slides.2.issues.2.description]`
  No way to build a protocol from scratch — only rigid templates. Even experts "couldn't add new care plans to existing protocols."

_Available unused fields (`issuesBreakdown` template): subtitle, cardsTitle, highlight, cardVariant, showNumbers_

---
## Slide 3 — type: quotes
_Words on screen: **129** · budget ~110_

- **label**  `[slides.3.label]`
  Problem Discovery

- **title**  `[slides.3.title]`
  Clinicians had stopped seeing the friction — so I stopped asking and started watching

- **content**  `[slides.3.content]`
  Every therapist described the same workarounds — but treated them as just how the job works, not problems anyone could fix. Years of daily use had made the friction invisible, so I trusted what I watched them do over what they told me.

- **text**  `[slides.3.quotes.0.text]`
  "I'm unclear how to navigate to the patient tab to view a workout session."

- **author**  `[slides.3.quotes.0.author]`
  Noa Avraham, physiotherapist

- **text**  `[slides.3.quotes.1.text]`
  "I can't see all the exercise options at once, so I forget which I've already added."

- **author**  `[slides.3.quotes.1.author]`
  Tomer Shapira, physiotherapist

- **text**  `[slides.3.quotes.2.text]`
  "Despite my experience, I can't add new care plans to existing protocols."

- **author**  `[slides.3.quotes.2.author]`
  Yael Mizrahi, physiotherapist

- **highlight**  `[slides.3.highlight]`
  These weren't edge cases. They were the daily routine — which is exactly why I watched instead of asked.

_Available unused fields (`quotes` template): gridColumns, bullets, bulletsTitle, cardVariant_

---
## Slide 4 — type: goals
_Words on screen: **108** · budget ~100_

- **label**  `[slides.4.label]`
  Design Goals

- **title**  `[slides.4.title]`
  What I set out to fix — and why

- **number** (read-only)  `[slides.4.goals.0.number]`
  1

- **title**  `[slides.4.goals.0.title]`
  Simplify navigation

- **description**  `[slides.4.goals.0.description]`
  Make patient data and key actions reachable without hunting. Constraint: therapists need 6+ data points visible at a glance — I could only reorganize, not hide.

- **number** (read-only)  `[slides.4.goals.1.number]`
  2

- **title**  `[slides.4.goals.1.title]`
  Streamline care plan editing

- **description**  `[slides.4.goals.1.description]`
  Replace disconnected screens with one focused flow, while keeping custom protocols flexible without rebuilding the backend.

- **number** (read-only)  `[slides.4.goals.2.number]`
  3

- **title**  `[slides.4.goals.2.title]`
  Enable protocol creation

- **description**  `[slides.4.goals.2.description]`
  Let experts build protocols from scratch, working within the existing template architecture — no net-new data models mid-project.

- **number** (read-only)  `[slides.4.goals.3.number]`
  4

- **title**  `[slides.4.goals.3.title]`
  Reduce the learning curve

- **description**  `[slides.4.goals.3.description]`
  Make the redesign self-explanatory so adoption wouldn't require full retraining.

- **kpis**  `[slides.4.kpis.0]`
  User adoption rate

- **kpis**  `[slides.4.kpis.1]`
  Training time reduction

- **kpis**  `[slides.4.kpis.2]`
  Decrease in support requests

- **kpis**  `[slides.4.kpis.3]`
  Task completion time

- **goalsCardsTitle**  `[slides.4.goalsCardsTitle]`
  Goals

_Available unused fields (`goals` template): showGoalsSection, highlight, cardVariant, showNumbers_

---
## Slide 5 — type: chapter
_Words on screen: **13** · budget ~18_

- **number** (read-only)  `[slides.5.number]`
  01

- **title**  `[slides.5.title]`
  Patient Management

- **subtitle**  `[slides.5.subtitle]`
  Where clinicians land first — and where they got lost most.

---
## Slide 6 — type: comparison
_Words on screen: **61** · budget ~110_

- **label**  `[slides.6.label]`
  Patient Screen

- **title**  `[slides.6.title]`
  Everything a clinician needs, in one place

- **caption**  `[slides.6.beforeImage.0.caption]`
  Old — cluttered tabs, buried adherence data

- **caption**  `[slides.6.afterImage.0.caption]`
  New — dedicated patient page, clear hierarchy

- **beforeDescription**  `[slides.6.beforeDescription]`
  Cluttered tabs, no hierarchy, adherence metrics buried where no one looked.

- **afterDescription**  `[slides.6.afterDescription]`
  One dedicated page separating patient info, active plans, and progress — with adherence data where therapists look first.

- **highlight**  `[slides.6.highlight]`
  Adherence data now sits where therapists' eyes land first.

_Images (READ these — content may live here):_ `public/case-studies/wizecare/img-xu92y5bwo.webp`, `public/case-studies/wizecare/img-7qfmd98x00.webp`, `public/case-studies/wizecare/img-4chmer0xr4.webp`, `public/case-studies/wizecare/img-3e9ywkzxfk.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 7 — type: chapter
_Words on screen: **16** · budget ~18_

- **number** (read-only)  `[slides.7.number]`
  02

- **title**  `[slides.7.title]`
  Care Plan Editing

- **subtitle**  `[slides.7.subtitle]`
  The most frequent task — and the one with the most wasted steps.

---
## Slide 8 — type: comparison
_Words on screen: **93** · budget ~110_

- **label**  `[slides.8.label]`
  Care Plan Editing

- **title**  `[slides.8.title]`
  Editing a plan shouldn't need a map — so I flattened it into one screen

- **caption**  `[slides.8.beforeImage.0.caption]`
  Old — multi-screen flow, dense exercise lists

- **caption**  `[slides.8.afterImage.0.caption]`
  New — single screen, exercise cards, inline editing

- **beforeDescription**  `[slides.8.beforeDescription]`
  A single edit spanned multiple screens, pushing patient data out of view.

- **afterDescription**  `[slides.8.afterDescription]`
  One screen. Each exercise is a card you edit in place, patient details pinned throughout. In tests, clinicians stopped jumping between screens.

- **highlight**  `[slides.8.highlight]`
  I swapped pop-up windows for inline editing — "I lose context when things pop up," therapists said. Trade-off: I cut custom animations to ship on time.

_Images (READ these — content may live here):_ `public/case-studies/wizecare/img-7qfmd98x00.webp`, `public/case-studies/wizecare/img-3icuntqcc0.webp`, `public/case-studies/wizecare/img-fu77sazv3c.webp`, `public/case-studies/wizecare/img-4k0tnag9eo.webp`, `public/case-studies/wizecare/img-3e9ywkzxfk.webp`, `public/case-studies/wizecare/img-4gqtt2o900.webp`, `public/case-studies/wizecare/img-4t0xrhcg8w.webp`, `public/case-studies/wizecare/img-20olxb6bo8.webp`, `public/case-studies/wizecare/img-6yoff99cec.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 9 — type: chapter
_Words on screen: **16** · budget ~18_

- **number** (read-only)  `[slides.9.number]`
  03

- **title**  `[slides.9.title]`
  Protocol Builder

- **subtitle**  `[slides.9.subtitle]`
  Experienced physiotherapists want to build protocols — the old system gave them no way.

---
## Slide 10 — type: testimonial
_Words on screen: **32** · budget ~45_

- **label**  `[slides.10.label]`
  Early Research Insight

- **quote**  `[slides.10.quote]`
  I'd rather build my own protocols than work around predefined care plans. Every patient needs specific adjustments, and rigid templates just don't fit how I work.

- **author**  `[slides.10.author]`
  Maya Levi

- **role**  `[slides.10.role]`
  Physiotherapist

_Available unused fields (`testimonial` template): context, highlight_

---
## Slide 11 — type: comparison
_Words on screen: **96** · budget ~110_

- **label**  `[slides.11.label]`
  Protocol Builder

- **title**  `[slides.11.title]`
  Protocol Builder — why I replaced templates with a drag-and-drop Kanban

- **caption**  `[slides.11.beforeImage.0.caption]`
  Old — no creation flow, rigid templates only

- **caption**  `[slides.11.afterImage.0.caption]`
  New — drag-and-drop Kanban builder

- **beforeDescription**  `[slides.11.beforeDescription]`
  No build-from-scratch flow — and rigid templates broke on complex cases.

- **afterDescription**  `[slides.11.afterDescription]`
  A board where therapists drag exercise cards into place — library on the left, plan on the right. Same card pattern as the editor, so there's nothing new to learn.

- **highlight**  `[slides.11.highlight]`
  One familiar card pattern across the patient view, the editor, and the builder — the spine of this redesign. A new tool that feels like one clinicians already know.

_Images (READ these — content may live here):_ `public/case-studies/wizecare/img-db2ae7syo.webp`, `public/case-studies/wizecare/img-hxjw766x2s.webp`, `public/case-studies/wizecare/img-1nmfkbclf0.webp`, `public/case-studies/wizecare/img-aklnh5dvt8.webp`

_Available unused fields (`comparison` template): description, beforeLabel, afterLabel, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 12 — type: outcomes
_Words on screen: **73** · budget ~95_

- **label**  `[slides.12.label]`
  Outcomes

- **title**  `[slides.12.title]`
  What changed: faster days, fewer mistakes, more people actually using it

- **metric** (read-only)  `[slides.12.outcomes.0.metric]`
  10–15 min

- **title**  `[slides.12.outcomes.0.title]`
  Saved per session

- **description**  `[slides.12.outcomes.0.description]`
  Navigation and task time per session dropped against the usability-test baseline — roughly 10–15 minutes back per patient.

- **metric** (read-only)  `[slides.12.outcomes.1.metric]`
  75%

- **title**  `[slides.12.outcomes.1.title]`
  Reduction in misclicks

- **description**  `[slides.12.outcomes.1.description]`
  Clearer layouts and inline editing cut prescription misclicks by ~75% in post-launch validation.

- **metric** (read-only)  `[slides.12.outcomes.2.metric]`
  80%

- **title**  `[slides.12.outcomes.2.title]`
  Former non-users now opening it every day

- **description**  `[slides.12.outcomes.2.description]`
  Clinicians who had avoided the platform now use it daily, per stakeholder report in the first month.

_Available unused fields (`outcomes` template): highlight_

---
## Slide 13 — type: reflection
_Words on screen: **103** · budget ~100_

- **label**  `[slides.13.label]`
  Reflection

- **title**  `[slides.13.title]`
  What I'd do differently

- **whatWorked**  `[slides.13.whatWorked.0]`
  Switching from interviews to direct observation surfaced friction users had stopped reporting

- **whatWorked**  `[slides.13.whatWorked.1]`
  One reusable card system unified the patient view, editor, and builder

- **whatFailed**  `[slides.13.whatFailed.0]`
  I set the error-rate baseline too late, so the misclick gain leans on post-launch numbers alone

- **whatFailed**  `[slides.13.whatFailed.1]`
  Custom exercise animations got cut to hit the sprint and never came back

- **whatYoudDoDifferently**  `[slides.13.whatYoudDoDifferently.0]`
  Capture a pre-launch baseline for every metric before the first design ships

- **whatYoudDoDifferently**  `[slides.13.whatYoudDoDifferently.1]`
  Validate the protocol builder with experts earlier, not only after the flow was built

- **whatYouCouldntMeasure**  `[slides.13.whatYouCouldntMeasure]`
  Whether the 80% adoption holds past month one. I had no long-term retention data and no clean pre-launch error-rate baseline.

_Available unused fields (`reflection` template): whatYouLearned, nextIteration_

---
## Slide 14 — type: end
_Words on screen: **14** · budget ~18_

- **title**  `[slides.14.title]`
  Thank You

- **subtitle**  `[slides.14.subtitle]`
  Designing systems that respect the people who use them.

- **cta**  `[slides.14.cta]`
  Get in touch

_Available unused fields (`end` template): buttons, email, phone, linkedinUrl_

