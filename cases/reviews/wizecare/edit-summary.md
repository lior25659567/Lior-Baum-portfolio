# WizeCare — Edit Summary (re-fix pass: profile alignment)

This deck is already finished work — 17 slides, deduped, complete, no `[FILL IN]`
brackets. The three reviewer verdicts + synthesis predate the current state: every
big item they flag (blank Slide 0, missing `directions`/`reflection`, duplicate
`process` slides, undocumented `researchFindings` type, 12-vs-8 interview conflict)
is ALREADY resolved in `wizecare.json`. So this pass does NOT re-do that work.

It is a light re-fix against the **new designer profile** — specifically the parts
the earlier pass couldn't have known about: the **jargon rule** (no UX/dev term
without a plain-English explanation immediately after), the **warm/human first-person
voice**, and the one remaining cross-slide duplication. **13 `edits`, 0 `setFields`,
0 `ops`.** No structural changes — the structure is settled.

### Sections rewritten

- **slides.0.description** — same facts, warmer/plainer voice. "three core
  physiotherapist workflows" → "three everyday physiotherapist tasks"; glossed
  "protocol" as "exercise protocol"; "one reusable card system" → "one familiar
  pattern" (the jargon-free version of the thesis). No role/metric crammed into the
  paragraph — those already live in `metaItems`/`headlineMetric`.
- **slides.3.title / .content / .highlight** (the research-pivot `quotes` slide) —
  tightened and de-jargoned the strongest beat in the deck. Replaced "normalized
  broken workflows" (clinical-ish phrasing) with the plain "had stopped seeing the
  friction." Kept the first-person turning-point framing the director wanted
  ("stopped asking and started watching") but made the prose read like a person
  talking, not a method writeup.
- **slides.5.sections.0.content** (process / Research) — **jargon rule:** "Contextual
  inquiry with 8 physiotherapists" → "I sat with 8 physiotherapists … and watched
  them work — what designers call contextual inquiry." Term now explained in plain
  English on first use, and the sentence is first-person.
- **slides.5.sections.1.content** (process / Iteration) — "low-fidelity wireframes to
  high-fidelity flows" → "rough sketches to detailed flows." Same meaning, no jargon,
  first-person.
- **slides.9.title** — "shouldn't require a map" → "shouldn't feel like reading a
  map." Warmer, reads aloud more naturally (English-notes rule).
- **slides.9.afterDescription** — "Each exercise is a card" → "Each exercise is its
  own card you can edit in place"; "without backtracking" → "without jumping back and
  forth." Plainer, and trims the slide toward its 100-word budget.
- **slides.9.highlight** — **jargon rule:** "I replaced modal overlays with inline
  editing" → "I swapped pop-up windows for editing right on the page." Same decision,
  no dev term. Kept the user quote and the honest trade-off.
- **slides.10.dir3Desc** (directions / accepted Kanban) — **jargon rule:** glossed
  Kanban in plain English on the slide where it's chosen — "a board where you drag
  exercise cards into place, like arranging sticky notes." Reuses "same card pattern"
  language instead of "card mental model."
- **slides.13.afterDescription** — de-jargoned the builder description: "drag-and-drop
  Kanban: exercise library on the left, live board on the right" → "a board where
  therapists drag exercise cards into place … library on the left, the plan taking
  shape on the right." "Same card system … no new mental model" → "same card pattern …
  no new way of working to learn." Plain English, still tight.
- **slides.13.highlight** (the thesis line) — "Reusing one card system across the
  patient view, editor, and builder" → "One familiar card pattern — the same building
  block in the patient view, the editor, and the builder." Names the thesis in
  language a non-designer reads cleanly, and softens it from a hard systems claim to a
  plain description (see positioning note below).
- **slides.14.outcomes.2.title** — fixes the one flagged duplication. Slide 0's
  `headlineMetric.label` and this title were 75% identical ("Daily active usage among
  former/previous non-users"). Reworded this one to "Former non-users now opening it
  every day" so the same line doesn't read twice across the deck. The read-only metric
  ("80%") is untouched.

### Slides added / removed / retyped

No structural changes. The deck's structure (intro → problem → issues → research
quotes → goals → process → 3 chaptered before/afters → ideation → testimonial →
outcomes → reflection → end) is settled and complete against the 10 canonical beats.
`directions` and `reflection` already exist; no duplicate `process` slide exists.

### Content added that wasn't there before

Nothing new factually. This pass only rephrases existing claims for voice and the
jargon rule, and breaks one duplicated line. No new metrics, names, dates, or beats.

### Drafted values to verify

None introduced this pass — no new numbers, names, or dates were invented. Every
drafted value from the prior corrective pass still stands and still needs the
designer's confirmation (it is NOT re-listed here to avoid implying it's new):
interview/clinic counts (8 / 6), the 30% figure, the four outcome metrics' baselines
and sample sizes, Slide 0 Role/Timeline/Team, and the testimonial attribution. See the
git history of this summary for that full list — this pass changed none of it.

### Positioning note (`confirmed: false` values — kept soft)

The profile's positioning items are all `confirmed: false`: Senior/SaaS target, the
"clinical was the training ground" framing, and — most relevant here — the
card-system-as-signature ("adoption through familiarity"). I did NOT harden any of
these into asserted claims:
- The card-pattern thesis (slides 0, 13) is phrased as a plain description of what was
  built ("one familiar pattern," "a new tool that feels like one clinicians already
  know"), NOT as a branded signature move or a seniority claim. If the designer
  confirms the positioning, the copy-writer can sharpen it into the explicit signature
  later; until then it stays as honest description.
- No "Senior" or "SaaS" self-labeling was added anywhere in the prose. Seniority is
  carried by the decision-owning first-person voice and the trade-offs already on the
  slides, not by asserting a level.

### Word-budget trims

The de-jargoning edits also pulled the two over-budget comparison slides toward budget
(no field is now over):
- **Slide 9** (comparison, budget ~100) — afterDescription + highlight tightened.
- **Slide 13** (comparison, budget ~100) — afterDescription + highlight tightened.
- All other edited slides were within budget and stayed there.

### Agent conflicts flagged

The synthesis flagged three conflicts. All three were already resolved in the current
JSON before this pass, so none required a call here:
- *Add beats vs. compress* — resolved: `directions` + `reflection` were added, the
  duplicate `process` slide was removed; deck sits at 17.
- *Slide 12 testimonial* — kept as a paraphrased research note (current `role` says
  "paraphrased"); not leaned on as social proof. Left as-is.
- *researchFindings target template* — resolved: that slide is now a documented
  `quotes` slide (slide 3).

### What was NOT changed

- All read-only fields (issue/goal/chapter numbers, all four outcome metrics).
- Slides 0 `metaItems`/`headlineMetric`, the reflection lists, the goals slide — all
  already strong and on-voice; left untouched.
- Slide 1 (problem) — already first-person, specific, well-budgeted. Left as-is.
- The structure, templates, and image references — all correct.

### Confidence note

Strong. The deck was already a finished senior-leaning clinical case; this pass mainly
removes the jargon a non-designer hiring manager would have to Google (contextual
inquiry, Kanban, modal overlays, "card system") and warms the voice a notch, while
keeping every fact intact and not over-claiming the `confirmed: false` positioning.
The only substantive content change is breaking the one duplicated outcome line. The
open items are unchanged from the prior pass and live in the designer's verification of
the metrics and counts.
