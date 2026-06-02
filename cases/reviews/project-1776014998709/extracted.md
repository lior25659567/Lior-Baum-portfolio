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
_Words on screen: **65** · budget ~75_

- **title**  `[slides.0.title]`
  Patient Report
  Redesign

- **description**  `[slides.0.description]`
  Doctors were skipping the patient report — not because they didn't care, but because the tool gave them a blank page and no place to start. I redesigned it so the hard part is done before they open it.

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  Align Technology

- **focusLabel**  `[slides.0.focusLabel]`
  Focus

- **focus**  `[slides.0.focus]`
  Clinical Reporting UX

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
_Words on screen: **69** · budget ~75_

- **label**  `[slides.1.label]`
  The Problem

- **title**  `[slides.1.title]`
  A blank page after every appointment

- **content**  `[slides.1.content]`
  No structure, no templates, no annotation tools.

- **issuesTitle**  `[slides.1.issuesTitle]`
  Where it failed

- **issues**  `[slides.1.issues.0]`
  Sidebar locked doctor info into 25% of the screen

- **issues**  `[slides.1.issues.1]`
  No templates — every report started blank

- **issues**  `[slides.1.issues.2]`
  Raw scan images with no annotation tools

- **issues**  `[slides.1.issues.3]`
  PDF output not readable by patients

- **highlight**  `[slides.1.highlight]`
  The tool was designed around the software — not the doctor using it.

- **caption**  `[slides.1.image.0.caption]`
  Old — three-panel split, static sidebar, blank content area

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-i06atssrj0.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 2 — type: quotes
_Words on screen: **110** · budget ~110_

- **label**  `[slides.2.label]`
  User Research

- **title**  `[slides.2.title]`
  What doctors told me

- **content**  `[slides.2.content]`
  I interviewed doctors across four specialties. The same problems came up every time — and none had ever been reported, because everyone assumed it was just how the tool worked.

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
_Words on screen: **75** · budget ~100_

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

_Available unused fields (`goals` template): description, showGoalsSection, highlight, cardVariant, showNumbers_

---
## Slide 4 — type: directions
_Words on screen: **83** · budget ~90_

- **label**  `[slides.4.label]`
  Ideation

- **title**  `[slides.4.title]`
  Layout directions I explored

- **dir1Status**  `[slides.4.dir1Status]`
  rejected

- **dir1Desc**  `[slides.4.dir1Desc]`
  Collapsible sidebar — kept the three-panel layout but let doctors hide the right panel. Felt incremental. Doctors were still managing the interface instead of just writing the report.

- **dir2Status**  `[slides.4.dir2Status]`
  rejected

- **dir2Desc**  `[slides.4.dir2Desc]`
  Floating action drawer — tools and metadata in an overlay. Added interaction without solving the space problem.

- **dir3Status**  `[slides.4.dir3Status]`
  accepted

- **dir3Desc**  `[slides.4.dir3Desc]`
  Compact header bar — moved all metadata and actions into a single top strip, freeing the full canvas for the report. Solved the space problem without adding new interaction patterns.

_Available unused fields (`directions` template): dir1Image, dir2Image, dir3Image_

---
## Slide 5 — type: comparison
_Words on screen: **112** · budget ~110_

- **label**  `[slides.5.label]`
  UI Layout

- **title**  `[slides.5.title]`
  From three fixed panels to a full editing canvas

- **caption**  `[slides.5.beforeImage.0.caption]`
  Old — static three-panel split

- **caption**  `[slides.5.afterImage.0.caption]`
  New — compact header, full canvas for editing

- **beforeDescription**  `[slides.5.beforeDescription]`
  A fixed right panel locked doctor info, preview, and sharing — the editing area squeezed in the middle.

- **afterDescription**  `[slides.5.afterDescription]`
  Everything moved to the header — doctor, clinic, patient, actions inline.

- **beforeBullets**  `[slides.5.beforeBullets.0]`
  Right panel permanently occupied with static info

- **beforeBullets**  `[slides.5.beforeBullets.1]`
  Content squeezed between two fixed columns

- **beforeBullets**  `[slides.5.beforeBullets.2]`
  Share and Export buried outside the editing flow

- **afterBullets**  `[slides.5.afterBullets.0]`
  Doctor, clinic, and patient editable from the header

- **afterBullets**  `[slides.5.afterBullets.1]`
  Share and Export PDF always one click away

- **afterBullets**  `[slides.5.afterBullets.2]`
  Full screen for report content

- **highlight**  `[slides.5.highlight]`
  I moved everything into one header line — and made every action one click away.

- **beforeLabel**  `[slides.5.beforeLabel]`
  Before

- **afterLabel**  `[slides.5.afterLabel]`
  After

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-ih6r6wqz8g.webp`, `public/case-studies/project-1776014998709/img-1kpvq4sizhc.png`

_Available unused fields (`comparison` template): description, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 6 — type: problem
_Words on screen: **73** · budget ~75_

- **label**  `[slides.6.label]`
  Templates & Sections

- **title**  `[slides.6.title]`
  A structured starting point — built to flex

- **content**  `[slides.6.content]`
  I built five procedure templates — so doctors start with structure, not a blank page.

- **issuesTitle**  `[slides.6.issuesTitle]`
  How it works

- **issues**  `[slides.6.issues.0]`
  Five templates — General Scan, Implant, Crown Prep, Follow-up, Custom

- **issues**  `[slides.6.issues.1]`
  Each pre-loaded with sections for that procedure type

- **issues**  `[slides.6.issues.2]`
  Modular blocks: Image, Before/After, Clinical Details, Cost, Notes

- **issues**  `[slides.6.issues.3]`
  Drag to reorder, one-tap duplicate or delete

- **highlight**  `[slides.6.highlight]`
  Templates give doctors a running start. Blocks keep them in control.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/vid-fay0vqurotc.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 7 — type: problem
_Words on screen: **74** · budget ~75_

- **label**  `[slides.7.label]`
  Annotation & Tooth Chart

- **title**  `[slides.7.title]`
  From plain scan images to annotated findings

- **content**  `[slides.7.content]`
  I added two tools for one question: where exactly is the problem?

- **issuesTitle**  `[slides.7.issuesTitle]`
  How it works

- **issues**  `[slides.7.issues.0]`
  Pen, text, and color tools — annotate at full size

- **issues**  `[slides.7.issues.1]`
  Tooth chart — click to tag affected teeth, shown as numbered markers

- **issues**  `[slides.7.issues.2]`
  Findings tied to anatomy — not described in a text block

- **issues**  `[slides.7.issues.3]`
  Patients see which teeth are affected

- **highlight**  `[slides.7.highlight]`
  Show, don't describe — the principle behind both tools.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/vid-jl0tegce3qg.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 8 — type: comparison
_Words on screen: **112** · budget ~110_

- **label**  `[slides.8.label]`
  Share & Export

- **title**  `[slides.8.title]`
  From three basic buttons to a full sharing system

- **caption**  `[slides.8.beforeImage.0.caption]`
  Old — Preview, Download PDF, Share via QR

- **beforeDescription**  `[slides.8.beforeDescription]`
  Three sidebar buttons — Preview, Download PDF, Share via QR. No access control.

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
  Invite by email with ownership and access levels

- **afterBullets**  `[slides.8.afterBullets.1]`
  PIN protection for sensitive reports

- **afterBullets**  `[slides.8.afterBullets.2]`
  Multi-channel delivery — WhatsApp, WeChat, QR, copy link

- **afterBullets**  `[slides.8.afterBullets.3]`
  Privacy warning built in

- **highlight**  `[slides.8.highlight]`
  Sharing stopped being an afterthought. It became a controlled, deliberate handoff.

- **beforeLabel**  `[slides.8.beforeLabel]`
  Before

- **afterLabel**  `[slides.8.afterLabel]`
  After

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-mpp2k7l6t4.webp`, `public/case-studies/project-1776014998709/vid-47ggf6tvc0.mp4`

_Available unused fields (`comparison` template): description, beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

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
_Words on screen: **92** · budget ~95_

- **label**  `[slides.10.label]`
  Outcomes

- **title**  `[slides.10.title]`
  Early-access results.

- **metric** (read-only)  `[slides.10.outcomes.0.metric]`
  Faster

- **title**  `[slides.10.outcomes.0.title]`
  Report creation

- **description**  `[slides.10.outcomes.0.description]`
  The template system removed the blank-page barrier. Doctors in the early access group started and completed reports they would have skipped.

- **metric** (read-only)  `[slides.10.outcomes.1.metric]`
  Clearer

- **title**  `[slides.10.outcomes.1.title]`
  Clinical communication

- **description**  `[slides.10.outcomes.1.description]`
  Annotation and tooth tagging let doctors mark the exact finding instead of describing it in text — clearer for patients, faster for the doctor.

- **metric** (read-only)  `[slides.10.outcomes.2.metric]`
  Higher

- **title**  `[slides.10.outcomes.2.title]`
  Completion rate

- **description**  `[slides.10.outcomes.2.description]`
  With structure upfront, doctors who previously skipped reporting started completing it. Broader measurement is planned post-rollout.

- **metric** (read-only)  `[slides.10.outcomes.3.metric]`
  Wider

- **title**  `[slides.10.outcomes.3.title]`
  Reach per report

- **description**  `[slides.10.outcomes.3.description]`
  Multi-channel sharing — email, WhatsApp, WeChat, QR code — meant reports reached patients on the channel they actually check.

_Available unused fields (`outcomes` template): highlight_

---
## Slide 11 — type: end
_Words on screen: **18** · budget ~18_

- **title**  `[slides.11.title]`
  Thank You

- **subtitle**  `[slides.11.subtitle]`
  I make complex workflows feel obvious — a skill for any high-pressure product.

- **cta**  `[slides.11.cta]`
  Get in touch

_Available unused fields (`end` template): buttons, email, phone, linkedinUrl_

---
## Slide 12 — type: reflection
_Words on screen: **100** · budget ~100_

- **label**  `[slides.12.label]`
  Reflection

- **title**  `[slides.12.title]`
  What I'd do differently

- **whatWorked**  `[slides.12.whatWorked.0]`
  Defining KPIs before design work kept every decision tied to an outcome.

- **whatWorked**  `[slides.12.whatWorked.1]`
  The modular block system — customizable structure was the right balance.

- **whatFailed**  `[slides.12.whatFailed.0]`
  I scoped annotation too late — it triggered a full rework after the first doctor feedback round.

- **whatYoudDoDifferently**  `[slides.12.whatYoudDoDifferently.0]`
  Test the layout with actual doctors before locking it — internal reviews weren't enough.

- **whatYoudDoDifferently**  `[slides.12.whatYoudDoDifferently.1]`
  Define sharing permissions with engineering earlier — the edge cases compressed the handoff.

- **whatYouLearned**  `[slides.12.whatYouLearned]`
  Friction isn't bad UI — it's software that makes professionals manage it. Fix the default.

- **whatYouCouldntMeasure**  `[slides.12.whatYouCouldntMeasure]`
  Long-term adoption and whether templates reduced variability — needs 6+ months of data.

_Available unused fields (`reflection` template): nextIteration_

