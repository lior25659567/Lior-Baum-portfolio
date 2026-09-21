# Privacy Center
Builder — extracted text

Source: `src/data/case-studies/privacy-center-builder.json` — 15 slides.
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
_Words on screen: **58** · budget ~75_

- **title**  `[slides.0.title]`
  Privacy Center
  Builder

- **description**  `[slides.0.description]`
  Enterprise privacy teams build their consumer request pages in this editor. Every new feature made it harder to use, so we rebuilt it around direct editing — and it became the shared editor for other BigID builders.

- **label**  `[slides.0.metaItems.0.label]`
  Role

- **value**  `[slides.0.metaItems.0.value]`
  Product Designer

- **label**  `[slides.0.metaItems.1.label]`
  Team

- **value**  `[slides.0.metaItems.1.value]`
  Shir Voldman · Lior Baum

- **label**  `[slides.0.metaItems.2.label]`
  Company

- **value**  `[slides.0.metaItems.2.value]`
  BigID · B2B SaaS

- **label**  `[slides.0.metaItems.3.label]`
  Scope

- **value**  `[slides.0.metaItems.3.value]`
  End to end

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/new-editor-tour.mp4`

_Available unused fields (`intro` template): subtitle, clientLabel, client, focusLabel, focus, logo, introHeaderMode, cta, headlineMetric_

---
## Slide 1 — type: problem
_Words on screen: **58** · budget ~75_

- **label**  `[slides.1.label]`
  The Challenge

- **title**  `[slides.1.title]`
  A form builder that stopped scaling

- **content**  `[slides.1.content]`
  Privacy operations teams — mostly non-technical — use it to configure complex request forms. As their needs grew, the editor didn't.

- **issuesTitle**  `[slides.1.issuesTitle]`
  What customers kept asking for

- **issues**  `[slides.1.issues.0]`
  Conditional logic between fields

- **issues**  `[slides.1.issues.1]`
  Brand customization

- **issues**  `[slides.1.issues.2]`
  Version history

- **issues**  `[slides.1.issues.3]`
  Field reordering

- **highlight**  `[slides.1.highlight]`
  Each request was reasonable. The editor just had no good place to put them.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/before-original-editor.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion_

---
## Slide 2 — type: problem
_Words on screen: **55** · budget ~75_

- **label**  `[slides.2.label]`
  What Didn't Work

- **title**  `[slides.2.title]`
  The structure couldn't take more features

- **content**  `[slides.2.content]`
  Every addition made the editor busier and harder to navigate. It worked — but editing in it felt like guesswork.

- **issuesTitle**  `[slides.2.issuesTitle]`
  Where it broke down

- **issues**  `[slides.2.issues.0]`
  Building and settings mixed in the same tabs

- **issues**  `[slides.2.issues.1]`
  Fields toggled from a static list, apart from the preview

- **issues**  `[slides.2.issues.2]`
  Properties hidden behind dialogs

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/old-builder-annotated.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 3 — type: problem
_Words on screen: **39** · budget ~75_

- **label**  `[slides.3.label]`
  Research

- **title**  `[slides.3.title]`
  How other editors solve it

- **content**  `[slides.3.content]`
  We studied website builders, form builders, document editors and design tools. Different users, same principles.

- **issuesTitle**  `[slides.3.issuesTitle]`
  What they all share

- **issues**  `[slides.3.issues.0]`
  Direct content editing

- **issues**  `[slides.3.issues.1]`
  Editing kept apart from settings

- **issues**  `[slides.3.issues.2]`
  Familiar interaction patterns

- **issues**  `[slides.3.issues.3]`
  Instant visual feedback

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/research-editors.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 4 — type: problem
_Words on screen: **44** · budget ~75_

- **label**  `[slides.4.label]`
  Design

- **title**  `[slides.4.title]`
  Edit the form directly

- **content**  `[slides.4.content]`
  The preview became the form itself. Click a field to select it, click a title to rename it, hover to see its actions.

- **issuesTitle**  `[slides.4.issuesTitle]`
  What changed

- **issues**  `[slides.4.issues.0]`
  No separate field list to keep in sync

- **issues**  `[slides.4.issues.1]`
  Every edit visible where it happens

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/direct-editing.mp4`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 5 — type: media
_Words on screen: **32** · budget ~35_

- **label**  `[slides.5.label]`
  Interaction States

- **title**  `[slides.5.title]`
  Four field states, settled in testing

- **caption**  `[slides.5.caption]`
  Hover shows the drag handle, toolbar and +. Selected adds an outline. Testing narrowed the set to default, hover, selected, and selected + hover.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/interaction-states.webp`, `public/case-studies/privacy-center-builder/interaction-states-spec.webp`

_Available unused fields (`media` template): description, bullets, bulletsTitle, highlight_

---
## Slide 6 — type: problem
_Words on screen: **37** · budget ~75_

- **label**  `[slides.6.label]`
  Design

- **title**  `[slides.6.title]`
  Properties that stay in view

- **content**  `[slides.6.content]`
  Selecting a field opens its properties in a fixed right panel instead of a dialog.

- **issues**  `[slides.6.issues.0]`
  Fewer clicks to change a property

- **issues**  `[slides.6.issues.1]`
  The selected field stays highlighted, so context is never lost

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/properties-panel.webp`

_Available unused fields (`textAndImage` template): issuesTitle, bullets2, bullets2Title, conclusion, highlight_

---
## Slide 7 — type: problem
_Words on screen: **25** · budget ~75_

- **label**  `[slides.7.label]`
  Design

- **title**  `[slides.7.title]`
  A navigation panel for structure

- **content**  `[slides.7.content]`
  Privacy forms run over several steps. A collapsible Form steps panel shows that structure and jumps to any step.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/navigation-panel.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight_

---
## Slide 8 — type: problem
_Words on screen: **24** · budget ~75_

- **label**  `[slides.8.label]`
  Design

- **title**  `[slides.8.title]`
  Theme controls for branding

- **content**  `[slides.8.content]`
  Brand color, buttons, icons, stepper and background live in a theme panel. The preview updates as you change them.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/theme-controls.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight_

---
## Slide 9 — type: problem
_Words on screen: **29** · budget ~75_

- **label**  `[slides.9.label]`
  Design

- **title**  `[slides.9.title]`
  One place for settings

- **content**  `[slides.9.content]`
  Regulations, email settings, links, brand images and layout moved into one settings dialog — a click away, and out of the way while editing.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/settings-dialog.mp4`

_Available unused fields (`textAndImage` template): issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight_

---
## Slide 10 — type: directions
_Words on screen: **78** · budget ~90_

- **label**  `[slides.10.label]`
  Prototype & Validation

- **title**  `[slides.10.title]`
  Where should navigation and theme live?

- **description**  `[slides.10.description]`
  We prototyped three layouts and watched where users looked, clicked, and expected actions.

- **dir1Status**  `[slides.10.dir1Status]`
  rejected

- **dir1Desc**  `[slides.10.dir1Desc]`
  Floating buttons opening a left panel. Users looked for theme in the top-right, and the theme panel blocked navigation.

- **dir2Status**  `[slides.10.dir2Status]`
  rejected

- **dir2Desc**  `[slides.10.dir2Desc]`
  A horizontal toolbar. Users read it as text formatting, and it took space from the form.

- **dir3Status**  `[slides.10.dir3Status]`
  accepted

- **dir3Desc**  `[slides.10.dir3Desc]`
  Navigation on the left, open by default. Theme as a header action that slides over the properties panel.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/option-1-fabs.webp`, `public/case-studies/privacy-center-builder/option-2-toolbar.webp`, `public/case-studies/privacy-center-builder/option-3-final.mp4`

---
## Slide 11 — type: problem
_Words on screen: **40** · budget ~75_

- **label**  `[slides.11.label]`
  Scaling

- **title**  `[slides.11.title]`
  One editor pattern for the platform

- **content**  `[slides.11.content]`
  With the design system team, we turned the builder's layout into shared patterns that other BigID builders reuse.

- **issuesTitle**  `[slides.11.issuesTitle]`
  The shared layout

- **issues**  `[slides.11.issues.0]`
  Global header and actions

- **issues**  `[slides.11.issues.1]`
  Collapsible left panel

- **issues**  `[slides.11.issues.2]`
  Main canvas

- **issues**  `[slides.11.issues.3]`
  Contextual properties panel

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/editor-layout-anatomy.webp`

_Available unused fields (`textAndImage` template): bullets2, bullets2Title, conclusion, highlight_

---
## Slide 12 — type: media
_Words on screen: **16** · budget ~35_

- **label**  `[slides.12.label]`
  Scaling

- **title**  `[slides.12.title]`
  Same editor, different products

- **caption**  `[slides.12.caption]`
  Assessments, privacy notices and report templates on the same editor framework.

_Images (READ these — content may live here):_ `public/case-studies/privacy-center-builder/same-editor-products.webp`

_Available unused fields (`media` template): description, bullets, bulletsTitle, highlight_

---
## Slide 13 — type: outcomes
_Words on screen: **48** · budget ~95_

- **label**  `[slides.13.label]`
  Impact

- **title**  `[slides.13.title]`
  What changed

- **title**  `[slides.13.outcomes.0.title]`
  More forms finished

- **description**  `[slides.13.outcomes.0.description]`
  More users completed form creation and customization, with fewer drop-offs.

- **title**  `[slides.13.outcomes.1.title]`
  Less dev effort

- **description**  `[slides.13.outcomes.1.description]`
  Several editing patterns merged into one reusable framework.

- **title**  `[slides.13.outcomes.2.title]`
  One way to edit

- **description**  `[slides.13.outcomes.2.description]`
  Users move between products without relearning editing.

- **title**  `[slides.13.outcomes.3.title]`
  Room to grow

- **description**  `[slides.13.outcomes.3.description]`
  New customer requirements fit without adding complexity.

_Available unused fields (`outcomes` template): highlight_

---
## Slide 14 — type: end
_Words on screen: **10** · budget ~18_

- **title**  `[slides.14.title]`
  Thank You

- **subtitle**  `[slides.14.subtitle]`
  Designed together with Shir Voldman.

- **cta**  `[slides.14.cta]`
  Get in touch

_Available unused fields (`end` template): buttons, email, phone, linkedinUrl_

