# Patient Report
Redesign — extracted text

Source: `src/data/case-studies/project-1776014998709.json` — 13 slides.
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
_Words on screen: **68** · budget ~75_

- **title**  `[slides.0.title]`
  Patient Report
  Redesign

- **description**  `[slides.0.description]`
  Doctors were using the patient report — the tool just couldn't keep up. Too little functionality, unclear output, a layout that pulled attention from what mattered. I had to add everything they needed without making the report harder to use.

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  Align Technology

- **focusLabel**  `[slides.0.focusLabel]`
  Focus

- **focus**  `[slides.0.focus]`
  Workflow UX · B2B SaaS

- **label**  `[slides.0.metaItems.0.label]`
  Role

- **value**  `[slides.0.metaItems.0.value]`
  Product Designer

- **label**  `[slides.0.metaItems.1.label]`
  Timeline

- **value**  `[slides.0.metaItems.1.value]`
  2025

- **label**  `[slides.0.metaItems.2.label]`
  Team

- **value**  `[slides.0.metaItems.2.value]`
  PM · Engineering · Clinical Research

- **label**  `[slides.0.metaItems.3.label]`
  Tools

- **value**  `[slides.0.metaItems.3.value]`
  Figma · Notion

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-1kpvq4sizhc.png`, `public/case-studies/project-1776014998709/img-324afqhug8.png`, `public/case-studies/project-1776014998709/img-186j8andvk.png`

_Available unused fields (`intro` template): subtitle, logo, introHeaderMode, cta, headlineMetric_

---
## Slide 1 — type: problem
_Words on screen: **75** · budget ~75_

- **label**  `[slides.1.label]`
  The Problem

- **title**  `[slides.1.title]`
  A blank page after every appointment

- **content**  `[slides.1.content]`
  Doctors were using the report — the ceiling was the problem, not adoption.

- **issuesTitle**  `[slides.1.issuesTitle]`
  Where it failed

- **issues**  `[slides.1.issues.0]`
  Sidebar locked doctor info into 25% of the screen

- **issues**  `[slides.1.issues.1]`
  No templates — every report started blank

- **issues**  `[slides.1.issues.2]`
  No modular blocks — no cost breakdown, before/after, or treatment plan

- **issues**  `[slides.1.issues.3]`
  PDF output not readable by patients

- **highlight**  `[slides.1.highlight]`
  Built around the software — not the doctor.

- **caption**  `[slides.1.image.0.caption]`
  Old UI — sidebar-locked editing, blank content area, QR-only sharing

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-i06atssrj0.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 2 — type: quotes
_Words on screen: **102** · budget ~110_

- **label**  `[slides.2.label]`
  User Research

- **title**  `[slides.2.title]`
  What doctors told me

- **content**  `[slides.2.content]`
  I interviewed doctors across four specialties. They weren't complaining about the report existing — they were working around everything it couldn't do.

- **text**  `[slides.2.quotes.0.text]`
  I just skip the report most of the time. It takes too long.

- **author**  `[slides.2.quotes.0.author]`
  Dr. A, General Practice

- **text**  `[slides.2.quotes.1.text]`
  Patients ask me to explain things the report doesn't show.

- **author**  `[slides.2.quotes.1.author]`
  Dr. B, Restorative

- **text**  `[slides.2.quotes.2.text]`
  I have no way to circle what I'm talking about on the image.

- **author**  `[slides.2.quotes.2.author]`
  Dr. C, Orthodontics

- **text**  `[slides.2.quotes.3.text]`
  Every report looks different — there's no standard starting point.

- **author**  `[slides.2.quotes.3.author]`
  Dr. D, Implantology

- **highlight**  `[slides.2.highlight]`
  These problems had gone unreported — doctors assumed it was just how the tool worked.

_Available unused fields (`quotes` template): bulletsTitle_

---
## Slide 3 — type: goals
_Words on screen: **98** · budget ~100_

- **label**  `[slides.3.label]`
  Design Goals

- **title**  `[slides.3.title]`
  What I set out to fix

- **number** (read-only)  `[slides.3.goals.0.number]`
  1

- **title**  `[slides.3.goals.0.title]`
  Give the canvas back

- **description**  `[slides.3.goals.0.description]`
  Move metadata and actions to the header — full screen for editing.

- **number** (read-only)  `[slides.3.goals.1.number]`
  2

- **title**  `[slides.3.goals.1.title]`
  Give doctors a starting point

- **description**  `[slides.3.goals.1.description]`
  Procedure templates so reports start structured, not blank.

- **number** (read-only)  `[slides.3.goals.2.number]`
  3

- **title**  `[slides.3.goals.2.title]`
  Make findings visual

- **description**  `[slides.3.goals.2.description]`
  Annotation and tooth tagging — show, don't describe.

- **number** (read-only)  `[slides.3.goals.3.number]`
  4

- **title**  `[slides.3.goals.3.title]`
  Make sharing frictionless

- **description**  `[slides.3.goals.3.description]`
  One-tap share, patient-readable, controlled access.

- **kpis**  `[slides.3.kpis.0]`
  Time to create a complete report

- **kpis**  `[slides.3.kpis.1]`
  Report completion rate

- **kpis**  `[slides.3.kpis.2]`
  Doctor-reported confidence in output

- **kpis**  `[slides.3.kpis.3]`
  Patient engagement with shared report

- **goalsCardsTitle**  `[slides.3.goalsCardsTitle]`
  Goals

- **description**  `[slides.3.description]`
  Each goal answers the same question: how do I add more without overwhelming the doctor? Everything here came from doctors — nothing assumed.

_Available unused fields (`goals` template): showGoalsSection, highlight, cardVariant, showNumbers_

---
## Slide 4 — type: problem
_Words on screen: **73** · budget ~75_

- **label**  `[slides.4.label]`
  Structure

- **title**  `[slides.4.title]`
  Mapping the flow before designing the features

- **content**  `[slides.4.content]`
  Templates, modular blocks, annotation, sharing — four features that all live inside one workflow. I mapped the full report flow before designing any of them. I needed to understand how they connect before designing or testing each piece individually. Get the structure wrong and everything built on top of it is wrong too.

- **highlight**  `[slides.4.highlight]`
  Structure first. Features second.

- **caption**  `[slides.4.image.0.caption]`
  [ASSET: user-flow map — add in edit mode]

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, splitRatio_

---
## Slide 5 — type: directions
_Words on screen: **85** · budget ~90_

- **label**  `[slides.5.label]`
  Ideation

- **title**  `[slides.5.title]`
  Two ways to edit

- **dir1Status**  `[slides.5.dir1Status]`
  rejected

- **dir1Desc**  `[slides.5.dir1Desc]`
  Edit from the sidebar. The controls sit in a side panel and the canvas is just a preview — you change one place and check another.

- **dir2Status**  `[slides.5.dir2Status]`
  accepted

- **dir2Desc**  `[slides.5.dir2Desc]`
  Edit on the content. Annotate, tag teeth, title and note each image right where it sits. The control lives on the thing it changes — no context switch.

- **description**  `[slides.5.description]`
  After the goals, I built both directions and user-tested them on the same task — same content, different model. Doctors preferred editing in place.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-1kpvq4sizhc.png`, `public/case-studies/project-1776014998709/img-1te5c1kqfg.png`

_Available unused fields (`directions` template): dir3Image_

---
## Slide 6 — type: problem
_Words on screen: **74** · budget ~75_

- **label**  `[slides.6.label]`
  Templates & Sections

- **title**  `[slides.6.title]`
  A structured starting point

- **content**  `[slides.6.content]`
  Doctors were building every report from scratch — same procedure, blank page every time. Templates fix that default. The structure is ready before they open it.

- **issuesTitle**  `[slides.6.issuesTitle]`
  How it works

- **issues**  `[slides.6.issues.0]`
  Five templates — General Scan, Implant, Crown Prep, Follow-up, Custom

- **issues**  `[slides.6.issues.1]`
  Pre-loaded with sections for that procedure

- **issues**  `[slides.6.issues.2]`
  Modular blocks: Image, Before/After, Clinical Details, Cost, Notes

- **issues**  `[slides.6.issues.3]`
  Drag to reorder, duplicate, or delete

- **highlight**  `[slides.6.highlight]`
  Templates give a running start. Blocks give control.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/vid-fay0vqurotc.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 7 — type: problem
_Words on screen: **74** · budget ~75_

- **label**  `[slides.7.label]`
  Annotation & Tooth Chart

- **title**  `[slides.7.title]`
  From plain scans to annotated findings

- **content**  `[slides.7.content]`
  Doctors were describing findings in text next to images that showed them clearly. I added two tools to close that gap — so findings are marked, not explained.

- **issuesTitle**  `[slides.7.issuesTitle]`
  How it works

- **issues**  `[slides.7.issues.0]`
  Pen, text, color — annotate at full size

- **issues**  `[slides.7.issues.1]`
  Tooth chart — click to tag affected teeth, shown as markers

- **issues**  `[slides.7.issues.2]`
  Patients see which teeth are affected

- **highlight**  `[slides.7.highlight]`
  Show, don't describe — the principle behind both.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/vid-jl0tegce3qg.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 8 — type: comparison
_Words on screen: **108** · budget ~110_

- **label**  `[slides.8.label]`
  Share & Export

- **title**  `[slides.8.title]`
  From three buttons to a full sharing system

- **beforeDescription**  `[slides.8.beforeDescription]`
  Three sidebar buttons — Preview, Download PDF, Share via QR.

- **afterDescription**  `[slides.8.afterDescription]`
  I replaced them with a full sharing modal — email invites, access permissions, PIN protection, multi-channel delivery.

- **beforeBullets**  `[slides.8.beforeBullets.0]`
  Three isolated actions with no shared logic

- **beforeBullets**  `[slides.8.beforeBullets.1]`
  QR code was the only real sharing option

- **beforeBullets**  `[slides.8.beforeBullets.2]`
  No access control

- **beforeBullets**  `[slides.8.beforeBullets.3]`
  No way to invite specific recipients

- **afterBullets**  `[slides.8.afterBullets.0]`
  Email invites with access levels

- **afterBullets**  `[slides.8.afterBullets.1]`
  PIN protection for sensitive reports

- **afterBullets**  `[slides.8.afterBullets.2]`
  Multi-channel delivery — WhatsApp, WeChat, QR, copy link

- **afterBullets**  `[slides.8.afterBullets.3]`
  Privacy warning built in

- **beforeLabel**  `[slides.8.beforeLabel]`
  Before

- **afterLabel**  `[slides.8.afterLabel]`
  After

- **description**  `[slides.8.description]`
  I replaced the three isolated buttons with a deliberate flow — delivery as part of the report, not a step after it.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-mpp2k7l6t4.webp`, `public/case-studies/project-1776014998709/vid-47ggf6tvc0.mp4`

_Available unused fields (`comparison` template): beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 9 — type: testimonial
_Words on screen: **39** · budget ~45_

- **label**  `[slides.9.label]`
  Doctor Feedback

- **quote**  `[slides.9.quote]`
  The templates actually match what I do, and everything I need is right there in front of me. 

- **author**  `[slides.9.author]`
  Dr. N. Haddad

- **role**  `[slides.9.role]`
  Orthodontist, iTero early access program

- **context**  `[slides.9.context]`
  Feedback collected during the iTero early access program, before full rollout.

_Available unused fields (`testimonial` template): highlight_

---
## Slide 10 — type: outcomes
_Words on screen: **94** · budget ~95_

- **label**  `[slides.10.label]`
  Outcomes

- **title**  `[slides.10.title]`
  Early-access results

- **metric** (read-only)  `[slides.10.outcomes.0.metric]`
  Faster

- **title**  `[slides.10.outcomes.0.title]`
  Report creation

- **description**  `[slides.10.outcomes.0.description]`
  Templates removed the blank-page barrier — doctors started from structure, not nothing, and reached a finished report faster.

- **metric** (read-only)  `[slides.10.outcomes.1.metric]`
  Clearer

- **title**  `[slides.10.outcomes.1.title]`
  Clinical communication

- **description**  `[slides.10.outcomes.1.description]`
  Doctors marked findings on the image — clearer for patients, faster for the doctor.

- **metric** (read-only)  `[slides.10.outcomes.2.metric]`
  Higher

- **title**  `[slides.10.outcomes.2.title]`
  Completion rate

- **description**  `[slides.10.outcomes.2.description]`
  The templates gave doctors a starting point. Reports came back more complete — and more detailed than the old tool allowed.

- **metric** (read-only)  `[slides.10.outcomes.3.metric]`
  Wider

- **title**  `[slides.10.outcomes.3.title]`
  Reach per report

- **description**  `[slides.10.outcomes.3.description]`
  Reports reached patients on the channel they actually check — email, WhatsApp, WeChat, or QR.

- **highlight**  `[slides.10.highlight]`
  These are early-access signals, not final measurements. Quantitative targets are defined and tracked post-rollout.

---
## Slide 11 — type: reflection
_Words on screen: **98** · budget ~100_

- **label**  `[slides.11.label]`
  Reflection

- **title**  `[slides.11.title]`
  What I'd do differently

- **whatWorked**  `[slides.11.whatWorked.0]`
  Defining KPIs before design kept every decision tied to an outcome.

- **whatWorked**  `[slides.11.whatWorked.1]`
  Modular blocks — customizable structure was the right balance.

- **whatFailed**  `[slides.11.whatFailed.0]`
  I scoped annotation too late, triggering a full rework after the first feedback round.

- **whatYoudDoDifferently**  `[slides.11.whatYoudDoDifferently.0]`
  Test with actual doctors before locking — internal reviews weren't enough.

- **whatYoudDoDifferently**  `[slides.11.whatYoudDoDifferently.1]`
  Define sharing permissions with engineering earlier — edge cases made the handoff harder.

- **whatYouLearned**  `[slides.11.whatYouLearned]`
  Friction isn't bad UI — it's software that makes professionals manage it. Fix the default.

- **whatYouCouldntMeasure**  `[slides.11.whatYouCouldntMeasure]`
  Long-term adoption and variability — needs 6+ months of data.

- **subtitle**  `[slides.11.subtitle]`
  The decisions I'd change weren't mistakes. They were sequencing problems.

_Available unused fields (`reflection` template): nextIteration_

---
## Slide 12 — type: end
_Words on screen: **14** · budget ~18_

- **title**  `[slides.12.title]`
  Thank You

- **subtitle**  `[slides.12.subtitle]`
  I fix the defaults professionals shouldn't have to manage.

- **cta**  `[slides.12.cta]`
  Get in touch

_Available unused fields (`end` template): buttons, email, phone, linkedinUrl_

