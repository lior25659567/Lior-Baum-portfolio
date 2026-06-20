# Patient Report
Redesign — extracted text

Source: `src/data/case-studies/project-1776014998709.json` — 23 slides.
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
_Words on screen: **55** · budget ~75_

- **title**  `[slides.0.title]`
  Patient Report
  Redesign

- **description**  `[slides.0.description]`
  Doctors were using the patient report — the tool just couldn't keep up. I had to add everything they needed without making it harder to use.

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
  2 Months

- **label**  `[slides.0.metaItems.2.label]`
  Team

- **value**  `[slides.0.metaItems.2.value]`
  1 PM · 2 engineers

- **label**  `[slides.0.metaItems.3.label]`
  Tools

- **value**  `[slides.0.metaItems.3.value]`
  Figma · Claude code

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-zliyqeem00.png`, `public/case-studies/project-1776014998709/img-1151oh706o0.png`, `public/case-studies/project-1776014998709/img-zo6ockzt3c.png`

_Available unused fields (`intro` template): subtitle, logo, introHeaderMode, cta, headlineMetric_

---
## Slide 1 — type: problem
_Words on screen: **91** · budget ~75_

- **label**  `[slides.1.label]`
  Context

- **title**  `[slides.1.title]`
  Where the patient report lives in the workflow

- **content**  `[slides.1.content]`
  Part of the Align Oral Health Suite — the moment after the scan, when clinical findings turn into something the patient takes home.

- **issuesTitle**  `[slides.1.issuesTitle]`
  When and why it matters

- **issues**  `[slides.1.issues.0]`
  Generated chair-side — patient still in the room

- **issues**  `[slides.1.issues.1]`
  Pulls images from the iTero snapshot tool

- **issues**  `[slides.1.issues.2]`
  Read by the patient at home, without the doctor

- **issues**  `[slides.1.issues.3]`
  Often the only artifact they keep from the visit

- **highlight**  `[slides.1.highlight]`
  If the patient can't read it, the clinical work doesn't land.

- **caption**  `[slides.1.image.0.caption]`
  The report sits between the scan and the patient's decision

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-125zvm77a8g.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 2 — type: problem
_Words on screen: **80** · budget ~75_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  A blank page after every appointment

- **content**  `[slides.2.content]`
  Doctors were using the report — the ceiling was the problem, not adoption.

- **issuesTitle**  `[slides.2.issuesTitle]`
  Where it failed

- **issues**  `[slides.2.issues.0]`
  Sidebar locked doctor info into 25% of the screen

- **issues**  `[slides.2.issues.1]`
  No templates — every report started blank

- **issues**  `[slides.2.issues.2]`
  No modular blocks — no cost breakdown, before/after, or treatment plan

- **issues**  `[slides.2.issues.3]`
  PDF output not readable by patients

- **highlight**  `[slides.2.highlight]`
  The report was built to be filled in — not to be useful.

- **caption**  `[slides.2.image.0.caption]`
  Old UI — sidebar-locked editing, blank content area, QR-only sharing

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-i06atssrj0.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 3 — type: issuesBreakdown
_Words on screen: **88** · budget ~95_

- **label**  `[slides.3.label]`
  Who Uses It

- **title**  `[slides.3.title]`
  Four specialties, four different reports

- **description**  `[slides.3.description.0]`
  Four specialties, four reporting jobs. One report had to handle all of them — without becoming the lowest common denominator.

- **number** (read-only)  `[slides.3.issues.0.number]`
  1

- **title**  `[slides.3.issues.0.title]`
  General dentists

- **description**  `[slides.3.issues.0.description]`
  High volume, fast appointments — need a clean recap they can finish before the next patient.

- **number** (read-only)  `[slides.3.issues.1.number]`
  2

- **title**  `[slides.3.issues.1.title]`
  Restorative specialists

- **description**  `[slides.3.issues.1.description]`
  Complex cases — need before/after, cost breakdowns, and visual context to justify treatment.

- **number** (read-only)  `[slides.3.issues.2.number]`
  3

- **title**  `[slides.3.issues.2.title]`
  Orthodontists

- **description**  `[slides.3.issues.2.description]`
  Long-term treatment — need progress tracking and the ability to mark specific teeth.

- **number** (read-only)  `[slides.3.issues.3.number]`
  4

- **title**  `[slides.3.issues.3.title]`
  Implantologists

- **description**  `[slides.3.issues.3.description]`
  High-stakes decisions — need detailed reports the patient can review before committing.

_Available unused fields (`issuesBreakdown` template): cardsTitle, gridColumns, highlight, cardVariant, showNumbers_

---
## Slide 4 — type: quotes
_Words on screen: **89** · budget ~110_

- **label**  `[slides.4.label]`
  User Research

- **title**  `[slides.4.title]`
  What doctors told me

- **content**  `[slides.4.content]`
  I interviewed doctors across four specialties. 
  They weren't complaining about the report existing — they were working around everything it couldn't do.

- **text**  `[slides.4.quotes.0.text]`
  Every report takes me 10 minutes from scratch. I'm doing it after the patient leaves.

- **author**  `[slides.4.quotes.0.author]`
  Dr. A, General Practice

- **text**  `[slides.4.quotes.1.text]`
  Patients ask me to explain things the report doesn't show.

- **author**  `[slides.4.quotes.1.author]`
  Dr. B, Restorative

- **text**  `[slides.4.quotes.2.text]`
  I have no way to circle what I'm talking about on the image.

- **author**  `[slides.4.quotes.2.author]`
  Dr. C, Orthodontics

- **text**  `[slides.4.quotes.3.text]`
  Every report looks different — there's no standard starting point.

- **author**  `[slides.4.quotes.3.author]`
  Dr. D, Implantology

_Available unused fields (`quotes` template): bulletsTitle_

---
## Slide 5 — type: issuesBreakdown
_Words on screen: **73** · budget ~95_

- **label**  `[slides.5.label]`
  Pain Points

- **title**  `[slides.5.title]`
  Three pain points, three design moves

- **description**  `[slides.5.description.0]`
  Three problems, three answers. The case study from here on is how I built each one.

- **number** (read-only)  `[slides.5.issues.0.number]`
  1

- **title**  `[slides.5.issues.0.title]`
  Reports take too long

- **description**  `[slides.5.issues.0.description]`
  No starting point, no structure. Fix: procedure templates.

- **number** (read-only)  `[slides.5.issues.1.number]`
  2

- **title**  `[slides.5.issues.1.title]`
  Reports describe — they don't show

- **description**  `[slides.5.issues.1.description]`
  Long text next to images that should do the talking. Fix: in-image annotation and tooth tagging.

- **number** (read-only)  `[slides.5.issues.2.number]`
  3

- **title**  `[slides.5.issues.2.title]`
  No standard structure

- **description**  `[slides.5.issues.2.description]`
  Every doctor invents their own format. Fix: procedure-based templates with consistent ordering.

_Available unused fields (`issuesBreakdown` template): cardsTitle, highlight, cardVariant, showNumbers_

---
## Slide 6 — type: goals
_Words on screen: **98** · budget ~100_

- **label**  `[slides.6.label]`
  Design Goals

- **title**  `[slides.6.title]`
  What I set out to fix

- **number** (read-only)  `[slides.6.goals.0.number]`
  1

- **title**  `[slides.6.goals.0.title]`
  Give the canvas back

- **description**  `[slides.6.goals.0.description]`
  Move metadata and actions to the header — full screen for editing.

- **number** (read-only)  `[slides.6.goals.1.number]`
  2

- **title**  `[slides.6.goals.1.title]`
  Give doctors a starting point

- **description**  `[slides.6.goals.1.description]`
  Procedure templates so reports start structured, not blank.

- **number** (read-only)  `[slides.6.goals.2.number]`
  3

- **title**  `[slides.6.goals.2.title]`
  Make findings visual

- **description**  `[slides.6.goals.2.description]`
  Annotation and tooth tagging — show, don't describe.

- **number** (read-only)  `[slides.6.goals.3.number]`
  4

- **title**  `[slides.6.goals.3.title]`
  Make sharing frictionless

- **description**  `[slides.6.goals.3.description]`
  One-tap share, patient-readable, controlled access.

- **kpis**  `[slides.6.kpis.0]`
  Time to create a complete report

- **kpis**  `[slides.6.kpis.1]`
  Report completion rate

- **kpis**  `[slides.6.kpis.2]`
  Doctor-reported confidence in output

- **kpis**  `[slides.6.kpis.3]`
  Patient engagement with shared report

- **goalsCardsTitle**  `[slides.6.goalsCardsTitle]`
  Goals

- **description**  `[slides.6.description]`
  Each goal answers the same question: how do I add more without overwhelming the doctor? 
  Everything here came from doctors — nothing assumed.

_Available unused fields (`goals` template): showGoalsSection, highlight, cardVariant, showNumbers_

---
## Slide 7 — type: issuesBreakdown
_Words on screen: **110** · budget ~95_

- **label**  `[slides.7.label]`
  Constraints

- **title**  `[slides.7.title]`
  What I couldn't change

- **description**  `[slides.7.description.0]`
  Every design decision had to fit inside three fixed boundaries. 
  Naming them upfront kept the scope honest — and made the work that did ship realistic.

- **number** (read-only)  `[slides.7.issues.0.number]`
  1

- **title**  `[slides.7.issues.0.title]`
  The PDF engine couldn't be replaced

- **description**  `[slides.7.issues.0.description]`
  Output had to work with the existing renderer — every design decision had to respect what the engine could produce.

- **number** (read-only)  `[slides.7.issues.1.number]`
  2

- **title**  `[slides.7.issues.1.title]`
  Annotation had to ship without ML

- **description**  `[slides.7.issues.1.description]`
  No AI-assisted findings in v1 — the annotation tools had to give doctors full manual control.

- **number** (read-only)  `[slides.7.issues.2.number]`
  3

- **title**  `[slides.7.issues.2.title]`
  Sharing flow had to stay the same

- **description**  `[slides.7.issues.2.description]`
  Privacy and consent rules were locked. I could reorder and reframe the steps, but not change what they did — same steps, better surface.

_Available unused fields (`issuesBreakdown` template): cardsTitle, gridColumns, highlight, cardVariant, showNumbers_

---
## Slide 8 — type: issuesBreakdown
_Words on screen: **128** · budget ~95 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.8.label]`
  Features

- **title**  `[slides.8.title]`
  Four features, one workflow

- **description**  `[slides.8.description.0]`
  The redesign wasn't one feature — it was a coordinated rebuild from the canvas down. Each piece below was designed and tested to fit alongside the others, not as a standalone addition.

- **number** (read-only)  `[slides.8.issues.0.number]`
  1

- **title**  `[slides.8.issues.0.title]`
  Templates

- **description**  `[slides.8.issues.0.description]`
  Five procedure-based starting points so reports begin structured, not blank — General Scan, Implant, Crown Prep, Follow-up, Custom.

- **number** (read-only)  `[slides.8.issues.1.number]`
  2

- **title**  `[slides.8.issues.1.title]`
  Modular blocks

- **description**  `[slides.8.issues.1.description]`
  Eight composable content blocks doctors can add, reorder, or remove — color-coded by function so they read at a glance.

- **number** (read-only)  `[slides.8.issues.2.number]`
  3

- **title**  `[slides.8.issues.2.title]`
  Annotation & tooth chart

- **description**  `[slides.8.issues.2.description]`
  Pen, text, color, and FDI tooth tagging — findings get marked on the image instead of explained around it.

- **number** (read-only)  `[slides.8.issues.3.number]`
  4

- **title**  `[slides.8.issues.3.title]`
  Sharing modal

- **description**  `[slides.8.issues.3.description]`
  Same sharing flow, rebuilt as one continuous modal — clearer steps, better hierarchy, sharing now part of the report instead of three buttons after it.

_Available unused fields (`issuesBreakdown` template): cardsTitle, highlight, cardVariant, showNumbers_

---
## Slide 9 — type: problem
_Words on screen: **63** · budget ~75_

- **label**  `[slides.9.label]`
  Structure

- **title**  `[slides.9.title]`
  Four features, one structure

- **content**  `[slides.9.content]`
  With the features named, I mapped how they live inside one workflow — scan finishes, template loads, doctor edits and annotates, patient receives the report. Every feature had to fit into that flow without becoming its own detour.

- **highlight**  `[slides.9.highlight]`
  The flow holds the features together.

- **caption**  `[slides.9.image.0.caption]`
  Report workflow map — scan → template → edit → share → patient view

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-vd6t8dpj40.png`

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion_

---
## Slide 10 — type: directions
_Words on screen: **89** · budget ~90_

- **label**  `[slides.10.label]`
  Low-Fidelity Wireframes

- **title**  `[slides.10.title]`
  Two structures, sketched fast

- **dir1Status**  `[slides.10.dir1Status]`
  rejected

- **dir1Desc**  `[slides.10.dir1Desc]`
  Sidebar does the editing. All controls — text, tooth tagging, notes — live in the panel. The canvas only shows what the sidebar changes.

- **dir2Status**  `[slides.10.dir2Status]`
  neutral

- **dir2Desc**  `[slides.10.dir2Desc]`
  Canvas does the editing. The sidebar becomes a block library — a place to add new content, not edit existing content. Everything that changes the report happens on the report.

- **description**  `[slides.10.description]`
  Before polish, I sketched both directions as wireframes — the cheapest way to ask the structural question without committing to either. Both got built. Both got tested.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-onhducg7s.png`, `public/case-studies/project-1776014998709/img-6rtq9b9u0.png`

_Available unused fields (`directions` template): dir3Image_

---
## Slide 11 — type: directions
_Words on screen: **95** · budget ~90_

- **label**  `[slides.11.label]`
  Ideation

- **title**  `[slides.11.title]`
  The same two directions — at full fidelity

- **dir1Status**  `[slides.11.dir1Status]`
  rejected

- **dir1Desc**  `[slides.11.dir1Desc]`
  Edit from the sidebar. Controls sit in a side panel, the canvas is just a preview — you change one place and check another.

- **dir2Status**  `[slides.11.dir2Status]`
  accepted

- **dir2Desc**  `[slides.11.dir2Desc]`
  Edit on the content. Annotate, tag teeth, title and note each image right where it sits. The control lives on the thing it changes.

- **description**  `[slides.11.description]`
  After wireframe testing pointed to in-place editing, I built both directions out at full fidelity — same content, polished UI — and tested again. Every doctor preferred editing in place: less context switching, faster to finish.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-7nltfqu4k.png`, `public/case-studies/project-1776014998709/img-1te5c1kqfg.png`

_Available unused fields (`directions` template): dir3Image_

---
## Slide 12 — type: problem
_Words on screen: **94** · budget ~75 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.12.label]`
  Block Composition

- **title**  `[slides.12.title]`
  Which blocks belong in which template

- **content**  `[slides.12.content]`
  With the editing model decided, I mapped each block to the templates that needed it — based on what each procedure has to communicate.

- **issuesTitle**  `[slides.12.issuesTitle]`
  Five templates, mapped to the blocks each one needs

- **issues**  `[slides.12.issues.0]`
  General — general-purpose recap (Image + Notes)

- **issues**  `[slides.12.issues.1]`
  Implant — surgical planning with cost and follow-up details

- **issues**  `[slides.12.issues.2]`
  Crown — visual case first, with before/after and cost

- **issues**  `[slides.12.issues.3]`
  Follow-up — progress tracking with comparison and next steps

- **issues**  `[slides.12.issues.4]`
  From scratch — blank, just an image to start

- **caption**  `[slides.12.image.0.caption]`
  Template composition matrix — which blocks pre-load for which template

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-3qwdyicll0.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 13 — type: problem
_Words on screen: **92** · budget ~75_

- **label**  `[slides.13.label]`
  Block Categories

- **title**  `[slides.13.title]`
  Colors that doctors can scan, not memorise

- **content**  `[slides.13.content]`
  Once the blocks were assigned to templates, each block got a color tied to what it does. The color isn't decoration — it tells the doctor what kind of content they're looking at without reading the label.

- **issuesTitle**  `[slides.13.issuesTitle]`
  Six families, six colors

- **issues**  `[slides.13.issues.0]`
  Visual (blue) — Image, Image Gallery

- **issues**  `[slides.13.issues.1]`
  Comparison (coral) — Before / After

- **issues**  `[slides.13.issues.2]`
  Outcome (green) — Summary, Cost

- **issues**  `[slides.13.issues.3]`
  Next step (teal) — Next Appointment

- **issues**  `[slides.13.issues.4]`
  Free-form (purple) — Notes

- **issues**  `[slides.13.issues.5]`
  Clinical instructions (pink) — Prescription, Patient Instructions

- **caption**  `[slides.13.image.0.caption]`
  Six color families — one per functional category

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-n5xp1ifl7c.png`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 14 — type: problem
_Words on screen: **77** · budget ~75_

- **label**  `[slides.14.label]`
  Templates & Sections

- **title**  `[slides.14.title]`
  A structured starting point

- **content**  `[slides.14.content]`
  With the blocks defined and colored, the templates became a question of packaging — which blocks ship together for which procedure. The structure was ready before the doctor opened a report.

- **issuesTitle**  `[slides.14.issuesTitle]`
  How it works

- **issues**  `[slides.14.issues.0]`
  Five templates — General Scan, Implant, Crown Prep, Follow-up, Custom

- **issues**  `[slides.14.issues.1]`
  Pre-loaded with sections for that procedure

- **issues**  `[slides.14.issues.2]`
  Modular blocks composed from the library

- **issues**  `[slides.14.issues.3]`
  Drag to reorder, duplicate, or delete

- **highlight**  `[slides.14.highlight]`
  Templates give a running start. Blocks give control.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/vid-o79zz3riiz4.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 15 — type: question

- **label**  `[slides.15.label]`
  The Next Question

- **question**  `[slides.15.question]`
  Once the report had a shape — how do you make the findings inside it actually communicate?

- **support**  `[slides.15.support]`
  Templates gave doctors structure. Blocks gave them control. But findings were still text next to images that should have been doing the talking. Editing the report wasn't enough — the findings themselves needed a way to be shown.

---
## Slide 16 — type: problem
_Words on screen: **93** · budget ~75_

- **label**  `[slides.16.label]`
  Looking Outward

- **title**  `[slides.16.title]`
  How other tools let users mark up an image

- **content**  `[slides.16.content]`
  I looked at how other software handles image markup. The pattern was consistent — a small set of tools on the canvas, with the artifact interactive underneath.

- **issuesTitle**  `[slides.16.issuesTitle]`
  What the design space agreed on

- **issues**  `[slides.16.issues.0]`
  A small, fixed set of tools — pen, text, shapes, color

- **issues**  `[slides.16.issues.1]`
  Tools on the canvas, not in a side panel

- **issues**  `[slides.16.issues.2]`
  Artifact stays interactive — annotation is a layer on top

- **issues**  `[slides.16.issues.3]`
  Marks save with the file

- **highlight**  `[slides.16.highlight]`
  Annotation is a solved pattern. The work was adapting it — not reinventing it.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-1bbxmaemxc.jpg`, `public/case-studies/project-1776014998709/img-84h1dybaw.jpg`, `public/case-studies/project-1776014998709/img-1jz259ft1o.jpg`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 17 — type: problem
_Words on screen: **73** · budget ~75_

- **label**  `[slides.17.label]`
  Annotation & Tooth Chart

- **title**  `[slides.17.title]`
  From plain scans to annotated findings

- **content**  `[slides.17.content]`
  Doctors were writing long descriptions next to images patients couldn't read. I added two tools so findings get marked on the image — not explained around it.

- **issuesTitle**  `[slides.17.issuesTitle]`
  How it works

- **issues**  `[slides.17.issues.0]`
  Pen, text, color — annotate at full size

- **issues**  `[slides.17.issues.1]`
  Tooth chart — click to tag affected teeth, shown as markers

- **issues**  `[slides.17.issues.2]`
  Patients see which teeth are affected

- **highlight**  `[slides.17.highlight]`
  Show, don't describe — the principle behind both.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/vid-5cgrbfz8jk0.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 18 — type: comparison
_Words on screen: **66** · budget ~110_

- **label**  `[slides.18.label]`
  Share & Export

- **title**  `[slides.18.title]`
  Same flow, rebuilt as one modal

- **beforeDescription**  `[slides.18.beforeDescription]`
  Three sidebar buttons — Download PDF, WeChat, QR code. Each one isolated, no shared surface.

- **afterDescription**  `[slides.18.afterDescription]`
  Same three options, restructured as one modal — clear title, options grouped, QR code visible by default with a refresh action.

- **beforeLabel**  `[slides.18.beforeLabel]`
  Before

- **afterLabel**  `[slides.18.afterLabel]`
  After

- **description**  `[slides.18.description]`
  Three isolated buttons became one structured modal — delivery as part of the report, not a step after it.

_Images (READ these — content may live here):_ `public/case-studies/project-1776014998709/img-mpp2k7l6t4.webp`, `public/case-studies/project-1776014998709/vid-7o41wt2e5k.mp4`

_Available unused fields (`comparison` template): beforeBulletsTitle, afterBulletsTitle, bullets, bulletsTitle_

---
## Slide 19 — type: testimonial
_Words on screen: **39** · budget ~45_

- **label**  `[slides.19.label]`
  Doctor Feedback

- **quote**  `[slides.19.quote]`
  The templates actually match what I do, and everything I need is right there in front of me.

- **author**  `[slides.19.author]`
  Dr. N. Haddad

- **role**  `[slides.19.role]`
  Orthodontist, iTero early access program

- **context**  `[slides.19.context]`
  Feedback collected during the iTero early access program, before full rollout.

_Available unused fields (`testimonial` template): highlight_

---
## Slide 20 — type: outcomes
_Words on screen: **66** · budget ~95_

- **label**  `[slides.20.label]`
  Outcomes

- **title**  `[slides.20.title]`
  Early-access results

- **metric** (read-only)  `[slides.20.outcomes.0.metric]`
  Faster

- **title**  `[slides.20.outcomes.0.title]`
  Report creation

- **description**  `[slides.20.outcomes.0.description]`
  Templates removed the blank-page barrier — doctors started from structure, not nothing.

- **metric** (read-only)  `[slides.20.outcomes.1.metric]`
  Clearer

- **title**  `[slides.20.outcomes.1.title]`
  Clinical communication

- **description**  `[slides.20.outcomes.1.description]`
  Findings marked on the image — clearer for patients, faster for the doctor.

- **metric** (read-only)  `[slides.20.outcomes.2.metric]`
  Higher

- **title**  `[slides.20.outcomes.2.title]`
  Completion rate

- **description**  `[slides.20.outcomes.2.description]`
  Reports came back more complete — and more detailed than the old tool allowed.

- **metric** (read-only)  `[slides.20.outcomes.3.metric]`
  Wider

- **title**  `[slides.20.outcomes.3.title]`
  Reach per report

- **description**  `[slides.20.outcomes.3.description]`
  Reports reached patients on the channel they actually check — email, WhatsApp, WeChat, or QR.

---
## Slide 21 — type: reflection
_Words on screen: **204** · budget ~100 · ⚠ OVER — trim to fit the canvas_

- **label**  `[slides.21.label]`
  Reflection

- **title**  `[slides.21.title]`
  What I'd do differently

- **whatWorked**  `[slides.21.whatWorked.0]`
  Using AI to generate concept directions early — explored more structural options in less time.

- **whatWorked**  `[slides.21.whatWorked.1]`
  The interactive prototype made annotation testable — doctors marked up images and felt how it behaved, not just looked at static frames.

- **whatWorked**  `[slides.21.whatWorked.2]`
  Modular blocks — the right balance between freedom and consistency.

- **whatWorked**  `[slides.21.whatWorked.3]`
  Color-coding blocks by category — doctors scanned reports without reading every label.

- **whatFailed**  `[slides.21.whatFailed.0]`
  Designing for four specialties at once — every block had to work for a general dentist's recap and an implantologist's plan, without becoming the lowest common denominator.

- **whatFailed**  `[slides.21.whatFailed.1]`
  Working inside the existing sharing flow — privacy and consent were locked, so the modal had to feel new while keeping every step patients knew.

- **whatFailed**  `[slides.21.whatFailed.2]`
  Annotation couldn't be tested in static frames — required building it in the prototype and iterating on how marking actually felt.

- **whatYoudDoDifferently**  `[slides.21.whatYoudDoDifferently.0]`
  Pull engineering into sharing constraints earlier — privacy edge cases shaped the modal.

- **whatYoudDoDifferently**  `[slides.21.whatYoudDoDifferently.1]`
  Add AI-assisted field completion — drafting notes and procedure suggestions as the doctor works.

- **whatYoudDoDifferently**  `[slides.21.whatYoudDoDifferently.2]`
  Let doctors create their own templates — five presets were a starting point, not a ceiling.

- **whatYouLearned**  `[slides.21.whatYouLearned]`
  Each feature had to earn its place in the workflow.

- **whatYouCouldntMeasure**  `[slides.21.whatYouCouldntMeasure]`
  Long-term adoption and how doctors customize templates — needs 6+ months of field data.

_Available unused fields (`reflection` template): nextIteration_

---
## Slide 22 — type: end
_Words on screen: **14** · budget ~18_

- **title**  `[slides.22.title]`
  Thank You

- **subtitle**  `[slides.22.subtitle]`
  I fix the defaults professionals shouldn't have to manage.

- **cta**  `[slides.22.cta]`
  Get in touch

_Available unused fields (`end` template): buttons, email, phone, linkedinUrl_

