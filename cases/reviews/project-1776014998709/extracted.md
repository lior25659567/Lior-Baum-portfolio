# Patient Report
Redesign — extracted text

Source: `src/data/case-studies/project-1776014998709.json` — 11 slides.
Each field shows its JSON path id in [brackets]. Reviewers: judge the prose.
Editor: produce edits keyed by these path ids. Fields marked (read-only) cannot be auto-edited.

---
## Slide 0 — type: intro

- **title**  `[slides.0.title]`
  Patient Report
  Redesign

- **description**  `[slides.0.description]`
  After every scan, doctors had to generate a patient report from a blank page. We rebuilt it into a template-driven system that produces professional reports in minutes.

- **clientLabel**  `[slides.0.clientLabel]`
  Client

- **client**  `[slides.0.client]`
  Align Technology

- **focusLabel**  `[slides.0.focusLabel]`
  Focus

- **focus**  `[slides.0.focus]`
  Clinical Reporting UX

---
## Slide 1 — type: problem

- **label**  `[slides.1.label]`
  The Problem

- **title**  `[slides.1.title]`
  A blank page after every appointment

- **content**  `[slides.1.content]`
  No structure, no templates, no annotation. A third of the screen was always locked to static info doctors couldn't act on while editing.

- **issuesTitle**  `[slides.1.issuesTitle]`
  Where it failed

- **highlight**  `[slides.1.highlight]`
  The interface was designed around the tool — not the doctor using it.

- **caption**  `[slides.1.image.0.caption]`
  Old — three-panel split, static sidebar, blank content area

---
## Slide 2 — type: quotes

- **label**  `[slides.2.label]`
  User Research

- **title**  `[slides.2.title]`
  What doctors told us

- **content**  `[slides.2.content]`
  Interviews across multiple practices. Same problems everywhere — accepted as workarounds, not reported as issues.

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

---
## Slide 3 — type: goals

- **label**  `[slides.3.label]`
  Design Goals

- **title**  `[slides.3.title]`
  What we set out to fix.

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

- **goalsCardsTitle**  `[slides.3.goalsCardsTitle]`
  Goals

---
## Slide 4 — type: comparison

- **label**  `[slides.4.label]`
  UI Layout

- **title**  `[slides.4.title]`
  From three fixed panels to a full editing canvas

- **caption**  `[slides.4.beforeImage.0.caption]`
  Old — static three-panel split

- **caption**  `[slides.4.afterImage.0.caption]`
  New — compact header, full canvas for editing

- **beforeDescription**  `[slides.4.beforeDescription]`
  A permanent right sidebar locked doctor info, preview, and share buttons into 25% of the screen.

- **afterDescription**  `[slides.4.afterDescription]`
  Everything moved to a compact top header — doctor, clinic, patient, and actions inline.

- **highlight**  `[slides.4.highlight]`
  The header replaced an entire panel — and made every action faster to reach.

---
## Slide 5 — type: problem

- **label**  `[slides.5.label]`
  Templates & Sections

- **title**  `[slides.5.title]`
  A structured starting point — built to flex

- **content**  `[slides.5.content]`
  Procedure templates pre-seed the report with the right sections. A modular block system lets doctors add, reorder, or remove anything to fit the case.

- **issuesTitle**  `[slides.5.issuesTitle]`
  What this enabled

- **highlight**  `[slides.5.highlight]`
  Templates give doctors a running start — sections let them stay in control.

---
## Slide 6 — type: problem

- **label**  `[slides.6.label]`
  Annotation & Tooth Chart

- **title**  `[slides.6.title]`
  From plain images to clinically annotated findings

- **content**  `[slides.6.content]`
  Doctors annotate directly on scan images and tag findings to specific teeth via an interactive FDI chart.

- **issuesTitle**  `[slides.6.issuesTitle]`
  What this enabled

- **highlight**  `[slides.6.highlight]`
  Two tools that answered the same question: where exactly is the problem?

---
## Slide 7 — type: comparison

- **label**  `[slides.7.label]`
  Share & Export

- **title**  `[slides.7.title]`
  From three basic buttons to a full sharing system

- **caption**  `[slides.7.beforeImage.0.caption]`
  Old — Preview, Download PDF, Share via QR

- **beforeDescription**  `[slides.7.beforeDescription]`
  Three sidebar buttons — Preview, Download PDF, Share via QR. No access control, no recipient management.

- **afterDescription**  `[slides.7.afterDescription]`
  A full Share Report modal — email invites, access permissions, PIN protection, multi-channel delivery.

- **highlight**  `[slides.7.highlight]`
  Sharing stopped being an afterthought — it became a controlled, secure handoff.

---
## Slide 8 — type: testimonial

- **label**  `[slides.8.label]`
  Doctor Feedback

- **quote**  `[slides.8.quote]`
  The templates actually match what I do, and everything I need is right there in front of me. 

- **author**  `[slides.8.author]`
  Dr. N. Haddad

- **role**  `[slides.8.role]`
  Orthodontist, iTero early access

---
## Slide 9 — type: outcomes

- **label**  `[slides.9.label]`
  Outcomes

- **title**  `[slides.9.title]`
  A report doctors actually use.

- **metric** (read-only)  `[slides.9.outcomes.0.metric]`
  Faster

- **title**  `[slides.9.outcomes.0.title]`
  Report creation

- **description**  `[slides.9.outcomes.0.description]`
  Reports that took 15+ minutes now start in seconds.

- **metric** (read-only)  `[slides.9.outcomes.1.metric]`
  Clearer

- **title**  `[slides.9.outcomes.1.title]`
  Clinical communication

- **description**  `[slides.9.outcomes.1.description]`
  Annotation and tooth tagging let doctors show, not describe.

- **metric** (read-only)  `[slides.9.outcomes.2.metric]`
  Higher

- **title**  `[slides.9.outcomes.2.title]`
  Completion rate

- **description**  `[slides.9.outcomes.2.description]`
  With structure upfront, doctors stopped skipping the report.

- **metric** (read-only)  `[slides.9.outcomes.3.metric]`
  Wider

- **title**  `[slides.9.outcomes.3.title]`
  Reach per report

- **description**  `[slides.9.outcomes.3.description]`
  Multi-channel sharing reached patients on their preferred channel.

---
## Slide 10 — type: end

- **title**  `[slides.10.title]`
  Thank You

- **subtitle**  `[slides.10.subtitle]`
  Designing clinical tools that work at the speed of care.

- **cta**  `[slides.10.cta]`
  Get in touch

