# ResponsiveView
Extension — extracted text

Source: `src/data/case-studies/project-1780418394707.json` — 8 slides.
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
_Words on screen: **85** · budget ~75_

- **title**  `[slides.0.title]`
  ResponsiveView
  Extension

- **description**  `[slides.0.description]`
  In my vibe coding course, students shipped apps that broke on every device but their own. I designed and built a VS Code extension using Claude Code to fix that — zero context-switch, real device frames, right inside the editor.

- **label**  `[slides.0.metaItems.0.label]`
  Role

- **value**  `[slides.0.metaItems.0.value]`
  Designer & Builder

- **label**  `[slides.0.metaItems.1.label]`
  Context

- **value**  `[slides.0.metaItems.1.value]`
  Personal project · Vibe coding course

- **label**  `[slides.0.metaItems.2.label]`
  Platform

- **value**  `[slides.0.metaItems.2.value]`
  VS Code · Cursor

- **label**  `[slides.0.metaItems.3.label]`
  Tools

- **value**  `[slides.0.metaItems.3.value]`
  TypeScript · CSS · VS Code API · Claude Code

- **caption**  `[slides.0.image.0.caption]`
  [ADD: hero screenshot — the extension panel open in VS Code with a device frame visible]

_Available unused fields (`intro` template): subtitle, clientLabel, client, focusLabel, focus, logo, cta, headlineMetric_

---
## Slide 1 — type: problem
_Words on screen: **81** · budget ~75_

- **label**  `[slides.1.label]`
  Built With AI

- **title**  `[slides.1.title]`
  Designed and built with Claude Code

- **content**  `[slides.1.content]`
  Not just designing a tool — shipping one. I built the whole extension with Claude Code: TypeScript, the VS Code API, the UI. Idea to working extension, no engineering handoff.

- **issues**  `[slides.1.issues.0]`
  I wrote the prompts, reviewed the output, owned every design decision

- **issues**  `[slides.1.issues.1]`
  Claude Code handled implementation; I handled judgment

- **issues**  `[slides.1.issues.2]`
  [ADD: a Claude Code session or the extension running]

- **issuesTitle**  `[slides.1.issuesTitle]`
  How the build worked

- **conclusion**  `[slides.1.conclusion]`
  I teach building with AI — and built this with it.

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, highlight, image, splitRatio_

---
## Slide 2 — type: issuesBreakdown
_Words on screen: **116** · budget ~95_

- **label**  `[slides.2.label]`
  The Problem

- **title**  `[slides.2.title]`
  Why students skipped responsive testing

- **description**  `[slides.2.description]`
  Apps shipped fine on the student's screen — broken everywhere else. Four friction points, one root cause.

- **number** (read-only)  `[slides.2.issues.0.number]`
  1

- **title**  `[slides.2.issues.0.title]`
  One-screen tunnel vision

- **description**  `[slides.2.issues.0.description]`
  Built and tested on their own monitor — never checked other viewports until something broke.

- **number** (read-only)  `[slides.2.issues.1.number]`
  2

- **title**  `[slides.2.issues.1.title]`
  DevTools felt technical

- **description**  `[slides.2.issues.1.description]`
  DevTools device mode is powerful but intimidating — the mental overhead made students avoid it.

- **number** (read-only)  `[slides.2.issues.2.number]`
  3

- **title**  `[slides.2.issues.2.title]`
  Window-switching broke focus

- **description**  `[slides.2.issues.2.description]`
  Switching between editor and browser broke the coding flow. Most students just skipped the check.

- **number** (read-only)  `[slides.2.issues.3.number]`
  4

- **title**  `[slides.2.issues.3.title]`
  No real device frame

- **description**  `[slides.2.issues.3.description]`
  A pixel-width number doesn't feel like a phone. Without a real frame, the size didn't stick.

- **highlight**  `[slides.2.highlight]`
  Remove the switching cost and you remove the adoption problem. The barrier wasn't knowledge — it was friction.

_Available unused fields (`issuesBreakdown` template): subtitle, cardsTitle, cardVariant, showNumbers_

---
## Slide 3 — type: comparison
_Words on screen: **114** · budget ~110_

- **label**  `[slides.3.label]`
  Before & After

- **title**  `[slides.3.title]`
  From tab-switching to one panel

- **description**  `[slides.3.description]`
  Old workflow: five steps to a number. New: one click to a frame.

- **beforeLabel**  `[slides.3.beforeLabel]`
  Before

- **afterLabel**  `[slides.3.afterLabel]`
  After

- **beforeDescription**  `[slides.3.beforeDescription]`
  Left the editor, opened DevTools, typed a viewport width, guessed at a device — then switched back to code.

- **afterDescription**  `[slides.3.afterDescription]`
  One click to the panel, pick a device, see a real frame — still inside the editor.

- **beforeBullets**  `[slides.3.beforeBullets.0]`
  3–5 steps to reach a responsive preview

- **beforeBullets**  `[slides.3.beforeBullets.1]`
  No visual device context — just numbers

- **beforeBullets**  `[slides.3.beforeBullets.2]`
  Coding flow broken every time

- **beforeBulletsTitle**  `[slides.3.beforeBulletsTitle]`
  Old workflow

- **afterBullets**  `[slides.3.afterBullets.0]`
  One-click access to any device size

- **afterBullets**  `[slides.3.afterBullets.1]`
  CSS device frames with notches and stands

- **afterBullets**  `[slides.3.afterBullets.2]`
  Preview stays open while code is edited

- **afterBulletsTitle**  `[slides.3.afterBulletsTitle]`
  New workflow

- **highlight**  `[slides.3.highlight]`
  [ADD: any measured improvement — e.g. adoption rate, student feedback, time-to-test reduction]

_Available unused fields (`comparison` template): bullets, bulletsTitle_

---
## Slide 4 — type: problem
_Words on screen: **88** · budget ~75_

- **label**  `[slides.4.label]`
  The Solution

- **title**  `[slides.4.title]`
  A preview panel that lives inside the editor

- **content**  `[slides.4.content]`
  ResponsiveView opens as a VS Code panel. Enter a localhost URL, pick a device, and instantly see the app inside a realistic frame. I kept the surface minimal: device selection, orientation, theme, and refresh — nothing to learn.

- **issues**  `[slides.4.issues.0]`
  URL input remembers the last address between sessions

- **issues**  `[slides.4.issues.1]`
  Device picker grouped by category: phones, tablets, laptops, desktops, ultrawide

- **issues**  `[slides.4.issues.2]`
  Portrait/landscape toggle with one click

- **issues**  `[slides.4.issues.3]`
  Auto-scaling preview fits any panel size without scrolling

- **issuesTitle**  `[slides.4.issuesTitle]`
  Core interface decisions

- **highlight**  `[slides.4.highlight]`
  52 devices. Real frames. One panel.

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 5 — type: outcomes
_Words on screen: **94** · budget ~95_

- **label**  `[slides.5.label]`
  Outcomes

- **title**  `[slides.5.title]`
  What changed for students

- **title**  `[slides.5.outcomes.0.title]`
  Testing became habitual

- **description**  `[slides.5.outcomes.0.description]`
  Students started checking layouts mid-build.

- **metric** (read-only)  `[slides.5.outcomes.0.metric]`
  [ADD]

- **title**  `[slides.5.outcomes.1.title]`
  Cleaner project demos

- **description**  `[slides.5.outcomes.1.description]`
  Presentations showed fewer broken layouts.

- **metric** (read-only)  `[slides.5.outcomes.1.metric]`
  [ADD]

- **title**  `[slides.5.outcomes.2.title]`
  [ADD: a real observed outcome — e.g. behavior you noticed change, student confidence at demos, or a signal from course feedback]

- **description**  `[slides.5.outcomes.2.description]`
  [ADD: describe the outcome in behavioral terms — what changed about how students worked or how they presented. Do not use the accessibility feature description here — that belongs on the solution slide, not the outcomes slide]

- **highlight**  `[slides.5.highlight]`
  [ADD: any adoption number, student feedback quote, or download count from the VS Code marketplace]

_Available unused fields (`outcomes` template): cardVariant, showNumbers_

---
## Slide 6 — type: reflection
_Words on screen: **102** · budget ~100_

- **label**  `[slides.6.label]`
  Reflection

- **title**  `[slides.6.title]`
  What building this taught me

- **whatWorked**  `[slides.6.whatWorked.0]`
  Placement was the strategy — it was already in the editor.

- **whatWorked**  `[slides.6.whatWorked.1]`
  CSS frames made the size feel real. Students took checks more seriously.

- **whatFailed**  `[slides.6.whatFailed.0]`
  [ADD: anything that didn't go as planned — e.g. an early UI approach that confused students, a technical constraint that forced a design compromise, features that were cut]

- **whatYoudDoDifferently**  `[slides.6.whatYoudDoDifferently.0]`
  I'd have built side-by-side from day one. Students kept asking for both views.

- **whatYoudDoDifferently**  `[slides.6.whatYoudDoDifferently.1]`
  [ADD: any other decision you'd revisit]

- **whatYouLearned**  `[slides.6.whatYouLearned]`
  The goal wasn't completeness — it was changing a habit. Friction is a design decision.

- **whatYouCouldntMeasure**  `[slides.6.whatYouCouldntMeasure]`
  Cleaner demos were visible. Long-term habit change is harder to trace.

_Available unused fields (`reflection` template): nextIteration_

---
## Slide 7 — type: end
_Words on screen: **13** · budget ~18_

- **title**  `[slides.7.title]`
  Let's Talk

- **subtitle**  `[slides.7.subtitle]`
  Want to see it in action or work on something together?

_Available unused fields (`end` template): cta, buttons, phone_

