# UX Verdict — itero-scan-workflow (Expanded, post-context.md)

Reviewed against: `context.md` (Facts to use, full), `_designer-profile.md` (target: Senior
Product Designer, SaaS B2B), `_writing-voice.md`, `_ux-lexicon.md`, `_slide-templates.md`.

Images read: intro cover (Info page, tooth chart, View/Trim), system webp (clinician
chairside), problem webp (old fragmented RX UI), journey map flowchart (four columns),
old RX form (overlapping Windows dialogs + patient search modal), old toolbar screenshot
(left-side icon column, 3D scan view), old icon clusters (blue arrow, green lasso, grey
starburst, red trash), named tool panels (Prep review, Margin line, Trim), design system
component sheet (grouped accordion, patient table, scan layer panel, procedure icon grid).

---

## Problem Framing Quality
**Score: 7/10**

The problem is specific and believable. The intro hooks with a concrete clinical moment.
Slide 1's 37 million cases anchor frames the business stakes before a reader has to infer
them. Slide 2 identifies four named failure points — blocking modal, tooth-by-tooth
repetition, tool access during scanning, no completion signal — each tied to a real
behavior. This is not a "I wanted to improve the experience" deck.

What is missing from the current deck, and is available in context.md:

**Who bore the cost.** Context.md names three groups: dentists lost chair time at every
unnecessary click; clinical staff absorbed the downstream fallout (resubmissions, lab
queries for missing fields, incomplete cases); labs received Rx data that was too
incomplete to process complex procedures like All-on-X. The deck shows only the clinician
side. For a SaaS hiring manager, multi-stakeholder impact is what distinguishes a workflow
redesign from a feature polish — this framing earns its place.

**Why it became urgent.** Context.md names three converging triggers: competitive pressure
from 3Shape, Medit, and Shining3D who had already modernized their Rx flows; scale making
every click expensive (37 million cases means even one unnecessary popup per submission is
not a rounding error); and an architecture patched too many times to patch again. None of
this appears in the deck. A SaaS hiring manager will ask "why did this redesign happen
when it did, not earlier?" Without an answer the project reads as designer-initiated
polish rather than a business-driven rebuild.

**What the framing omits about scope.** Context.md positions this as the Flow Rx project
— specifically the front half of the Rx workflow (Patient Details, Procedure Selection,
Materials setup). The deck frames it as a full redesign of RX, Scan, and View. The scan
toolbar and view tools work may be in scope, but context.md's emphasis is on the Rx
changes. This framing gap will surface in any technical interview. It is not a fabrication
concern — the designer knows what they built — but the deck should be explicit about which
parts were the core delivery vs. what came alongside.

---

## Research Rigor
**Score: 4/10**

This is the deck's weakest section and the most consequential gap for the Senior target.

Slide 3 presents six quotes from six clinicians covering the three phases. The quotes map
with suspicious precision onto the four problems stated on slide 2 — one quote per failure
point, zero contradictory evidence. The writing-voice doctrine is explicit: "At least one
quote must complicate the story. A wall of identical complaints reads as cherry-picked."
Include one note from a clinician who found the old flow acceptable under certain
conditions, and name what that told you.

Context.md's research section confirms the method: chairside observation first, then six
clinician interviews. The observation sessions are not mentioned in the deck at all —
context.md even flags `[ADD: number of observation sessions]` as a pending placeholder.
In a clinical context, observation is harder to arrange than a Zoom interview and produces
different findings. Not naming it is leaving the strongest part of the research invisible.

Context.md also confirms one real clinician quote: "like a long boring form." That quote
is human, unpolished, and specific in the way only real feedback is. It is not in the deck.
The six named doctors in the deck are not confirmed in context.md's Facts to use section.
If any of them are invented names, this is a blocking integrity concern — the profile
non-negotiable is explicit: never fabricate quotes or named people. They should be
genericized to role descriptions ("clinician, restorative specialist") or confirmed.

The flow map on slide 4 (img-t2to0gdcf0.png) is the one visible synthesis artifact — a
four-column flowchart with decision nodes, branching paths, and explicit bottlenecks across
INFO PAGE, SCAN PAGE, VIEW PAGE, and SUMMARY PAGE. The text barely references it:
"I mapped the appointment flow as clinicians lived it." The image is the evidence; the
prose misses the opportunity to say what the mapping revealed that the interviews hadn't.

---

## Synthesis & Insight Quality
**Score: 6/10**

The sharpest insight in the deck is buried in slide 9's rejection reasoning: "In testing,
clinicians kept reopening the same section. The blocking step moved to a different point;
it didn't go away." This is not just "the accordion failed" — it names the pattern: a
blocking gate is architectural, not layout. Removing a modal without removing the
sequential dependency produces the same failure in a different form. That is a genuine
design insight and the clearest evidence of Senior thinking in the deck.

The slide 10 highlight — "The modal was gone. But each tooth still needed its own click."
— is also strong. It names exactly what survived the first fix and directly sets up the
next problem without repeating what came before. This is how honest iteration looks.

Where synthesis breaks down:

The flow map image on slide 4 contains the richest insight in the deck — conditional logic,
decision gates, phase transitions, branching paths. But the slide's text only restates the
three failure points from slide 2. The insight that the map actually produced — that every
failure lived at a phase boundary because the system treated each screen as standalone
while clinicians experienced them as one appointment — is visible in the image but never
said in the prose. That sentence is the structural finding that makes the three-part
solution coherent. It should be the `highlight` field on slide 4, not the restated bullets.

Context.md's own synthesis is tighter than the deck's: "Same three seams, every clinician.
One problem showing up three times in the same appointment." That should be in the deck.

The goals slide connects four goals to four problems — correct logic. But the KPIs defined
on slide 5 (time from RX entry to first scan action, tool interactions mid-scan, rescan
rate, confidence in scan result) never come back on the outcomes slide. The loop from
"here is what I will measure" to "here is what I measured" is not closed.

---

## Design Decision Depth
**Score: 7/10**

The two `directions` slides are the strongest evidence of judgment in the deck.

**Slide 9 (RX, three directions):** Wizard rejected because it preserved sequential gating
in a different form. Accordion rejected because testing showed clinicians kept reopening
sections — the gate moved, it didn't disappear. Single-view accepted because everything is
visible in one pass. The images confirm these are real explorations: a 4-step stepper, an
accordion with a "Configuration: Pending" section, and the accepted single-view layout.
Rejection reasoning tied to observed behavior, not design opinion. This is Senior.

**Slide 14 (toolbar, three directions):** Fixed left rail rejected because it compressed
the viewport at the moment the full 3D model mattered most. Top bar rejected because
reaching up pulled attention off the live scan. Collapsible corner toolbar accepted.

What the deck doesn't show but context.md confirms: the explored options for the toolbar
were "bottom center" (rejected because it sat across the occlusal area, obscuring the scan
detail), "vertical right rail" (rejected because always-visible consumed model viewport),
and "top-right" (accepted). The deck currently says "fixed left rail" and "top bar" as the
two rejected directions. These don't match the context. The bottom center rejection has the
more clinical and specific logic — "sat across the occlusal area" is a concrete piece of
dental scanning knowledge that immediately signals domain expertise. The deck's current
framing loses that specificity. Fix slide 14 to match the context.

What is missing that would push this to Senior throughout:

**No constraints are named as a set.** Context.md reveals four constraints with direct
design consequences: (1) three surfaces — scanner hardware (Element and Lumina, touch,
gloved hands), MIDC Windows desktop, myitero.com browser — meaning hover states, right-
click menus, and precise pointer interactions were all ruled out; (2) backward compatibility
with in-progress cases, requiring the new flow to read as clearly different so clinicians
didn't carry old mental models; (3) feature flag (SWO NewFlowRx) that could be toggled on
and off, requiring zero persistent onboarding and genuinely dynamic procedure availability;
(4) read mode and demo mode as first-class states from day one, not retrofitted.

These constraints are the explanation behind every design decision that might otherwise
look like personal preference. The single-view layout beats the wizard partly because a
gloved-hand touch screen cannot do sequential tap-through comfortably. The collapsible
corner toolbar wins partly because a touch scanner cannot have hover states. Without
naming these constraints, the reader is left to infer the "why" behind the decisions.

**No iteration within a chosen direction.** The deck shows concept → accepted direction →
final. It does not show V1 of the single-view layout, what failed, and what V2 fixed. The
coded prototype slide implies iteration happened; the evidence of it is not in the deck.

---

## Craft Quality
**Score: 7/10**

The visual work is strong and consistent.

The final Info page (img-6s57kfmq7o.png): patient card, procedure selection as a labeled
card grid (six procedure types with icons and descriptions), persistent Case Summary
sidebar, navigation tab bar (Info → Scan → View → Send). One-page, no modals, scannable
in a glance. The before image (img-14ptax4ol0.png) — overlapping Windows dialogs, patient
search modal on top of a multi-step form — makes the contrast immediate and legible.

The tooth chart (img-morqwmjyo.png): multi-select visible (teeth 41/42/43 in blue,
11/12/13 in pink), accordion configuration panels inline below each group, procedure
toggles (Crown, Bridge, Veneer, Inlay, Onlay, Eggshell, Mockup, Missing, Implant Based),
Material and Shade dropdowns. This is the core design decision — the shift from one-tooth
modals to chart-direct multi-select with inline grouped configuration.

The named tool panels (img-2x1frtk9p0.webp): Prep review tool (Select / Erase & Rescan),
Margin line (Detect / Draw / Undo / Clear), Trim tool (Trim / Undo / Confirm). Consistent
panel architecture across three different tools — a title bar, one primary CTA, secondary
actions below, X to close. The visual argument against the old icon clusters
(img-aeiguj0sno.webp — blue circular arrow, green lasso, grey starburst, red trash can)
is immediate.

The design system component sheet (img-5ljyfdsz90.png): teeth grouping accordion with
"Incomplete" warning state, patient table with checkbox multi-select, scan layer panel with
opacity sliders for Treatment Scan and Pre Treatment (upper/lower), procedure icon grid
(six labeled icons: Fixed Restorative, Dentures, Study Model, Invisalign, Implant
Planning, Appliance). Real system-level work, not a collection of one-off screens.

**Craft issues in the prose:**
- "This wasn't just a fix — the IA was built to absorb future lab workflows without a
  rebuild" (slide 19 highlight) is a tagline — banned by the voice doctrine.
- "Each step had its own setup — and clinicians felt every gap between them" (slide 1
  highlight) is a dramatic summary that says less than the concrete bullets above it.
- "I went to find out why" (slide 2 highlight close) is too vague — say what you did.
- Slide 9 direction 3: "Single-view layout: everything visible at once — no steps, no
  expanding. Patient, procedure, and configuration readable in one pass." Three sentences
  saying the same thing. Cut to one.
- Slide 14 direction 3 ends: "I rebuilt every icon into a single visual language as part
  of this decision." That belongs on slide 15 or 16, not inside a toolbar placement
  rejection slide.

---

## Impact Evidence
**Score: 5/10**

The outcomes slide uses directional labels — Faster, Fewer, Clearer, Higher — in the
`metric` field of the `outcomes` template. That template is built for values like "40%",
"3x", "−60%". Using adjectives in a number slot wastes the visual format.

The descriptions attached to each outcome are better than the metrics. "In prototype
sessions, no clinician left the scan area mid-capture. Before the fixed toolbar, this
happened every session." That is a specific, zero-occurrence claim from a bounded study —
credible and honest about its context. "In prototype sessions, clinicians tapped directly
to the right tool" is similarly specific.

What context.md provides that the deck does not use:

The context.md outcomes table is more concrete:
- "Case open → first scan with no blocking gate" — a countable behavioral change
- "Multi-tooth selection + grouped definitions in one interaction" — a specific capability
- "Zero blocking modals between case open and scan" — verifiable
- "Procedure and materials changeable mid-workflow, no restart" — a new capability, not
  just an improvement on the old one

These are stronger outcome statements than the four directional labels because they name
what was made possible, not just what direction things moved. The outcomes slide should use
them — labeled as prototype testing observations, not production data.

The goals slide (slide 5) defined four KPIs. The outcomes slide does not refer to any of
them by name. The loop opened by "here is what I will measure" is not closed.

The reflection slide (slide 21) honestly acknowledges that production metrics weren't
available at handoff. That honesty is correct and the voice doctrine endorses it. The
outcomes slide should match the same honesty rather than letting directional adjectives
imply measurement that wasn't done.

Context.md's `[ADD: quantitative measurements from usability testing or post-launch
analytics]` placeholder should be carried visibly into the deck — either as a note in the
outcomes slide or as a `whatYouCouldntMeasure` entry in the reflection that names the
specific measurements (resubmission rate, mandatory-field error rate, setup time delta)
that would close the picture.

---

## Gap Analysis — Beats in context.md NOT in the Deck

This section enumerates every meaningful beat present in context.md that the current 23
slides do not represent, or represent too weakly to count. Each gap names a specific
recommended slide (template, position, required content).

---

### GAP 1 — Who It Affected (three stakeholders)
**Status:** MISSING

The deck names only the clinician. Context.md identifies three groups with distinct cost:
- Dentists: lost chairside time at every extra click
- Clinical staff: absorbed resubmissions, incomplete cases, lab queries for missing fields
- Labs: received Rx data too incomplete for complex procedures (All-on-X, multi-phase)

For a SaaS hiring manager, multi-stakeholder framing is what distinguishes "a UX fix" from
"a product decision that crossed a workflow end-to-end." This framing is in the context and
should be in the deck.

**Recommended add:** `issuesBreakdown` slide (three numbered cards, one per stakeholder)
inserted after slide 1 ("The System"), before slide 2 ("The Problem"). Keep it to three
cards with one-sentence descriptions — the goal is to name the stakeholders and their pain,
not to detail each one. This is ~60 words at most.

Alternate path: add a `bullets2` block to slide 1's existing `textAndImage` layout —
"bullets2Title: Who it affected" with three bullets. No new slide required. Lower-impact
but faster.

---

### GAP 2 — Why Now (competitive trigger + scale + architectural limit)
**Status:** MISSING

Three signals from context.md converged to make this rebuild happen at this moment:
competitive pressure (3Shape, Medit, Shining3D had already modernized their Rx flows),
scale (37 million cases making every friction point expensive), and an architecture patched
too many times to patch again.

This is missing entirely from the deck. A hiring manager at a SaaS company will ask
"why now?" The current deck has no answer. Surfacing this signals that the designer
understood the business reason for the project, not just the UX problem.

**Recommended add:** A `bullets2` block on the existing slide 1 (using the available
`bullets2Title` and `bullets2` unused fields) covering the three converging triggers.
No new slide needed — this is one section of the context slide, not a standalone beat.

If the designer wants it to have more visual weight: insert a `textAndImage` slide after
slide 1 ("The System") with a short paragraph and three issues bullets. Three competitors
can be named by name.

---

### GAP 3 — Design Goals (two of six are missing)
**Status:** PARTIALLY REPRESENTED — slide 5 exists but is incomplete

Context.md lists six design goals. The current goals slide has four:
1. Eliminate the setup gate
2. Keep scanning uninterrupted
3. Make every tool self-explanatory
4. Build a clear completion signal

Missing from the deck:
- "Eliminate one-at-a-time configuration — multi-select, group, reuse across teeth"
- "Make the workflow editable at any point — no restarts when a clinician changes their mind"

These two missing goals are not minor additions. The multi-select goal is the reason the
tooth chart redesign (slide 11) exists. The "editable at any point" goal is the reason
procedure changeability mid-workflow is possible. Without these goals appearing on the
goals slide, both slide 11 and the "editable mid-workflow" outcome read as unplanned
additions rather than design intentions.

The KPI list in context.md is also richer than what's on slide 5 — "popup count per case
submission" and "mid-workflow restart rate" are missing from the deck's current four KPIs.

**Recommended fix:** Revise slide 5 to include all 6 goals and all 6 KPIs. The `goals`
template supports up to 8 of each — no template change needed.

---

### GAP 4 — Journey Mapping (image is strong; prose doesn't use it)
**Status:** PRESENT but undersold

Slide 4 (labeled "Journey Mapping") carries the right image — a four-column flowchart with
decision diamonds covering the full appointment arc. But the text only restates the three
failure points from slide 2. The slide should explain what the mapping revealed that the
research hadn't — specifically, that every failure lived at a phase boundary, and that the
map made the solution structure obvious before any design work began.

Context.md: "Three gaps, same flow. The map confirmed the goals were right — and made the
phase structure of the solution obvious." That is the insight the slide should carry.

**Recommended fix:** Rewrite the `content` and `highlight` fields on slide 4. Replace the
three-bullet restating with a description of what the map revealed. Use the `conclusion`
field (currently unused) to bridge to the next beat: "The map showed where to start — and
it wasn't where I expected."

Also remove the three bullets from slide 4 that duplicate slide 2 — see Cross-Slide
Redundancy section.

---

### GAP 5 — Constraints (three surfaces / feature flag / read+demo modes)
**Status:** MISSING — highest-priority addition

Context.md lists four constraints that shaped every design decision:

1. **Three hardware surfaces.** Scanner hardware (Element and Lumina: touch screen, gloved
   hands, no keyboard, large tap targets, no hover states, no right-click) + MIDC Windows
   desktop + myitero.com browser. Every interaction had to be achievable by tap alone as a
   baseline. This is why the wizard was wrong, the single-view was right, and the
   collapsible corner toolbar beat all alternatives.

2. **Backward compatibility with in-progress cases.** The new flow and the old Rx had to
   coexist for the same user in the same session. The new flow had to read as clearly
   different — clinicians couldn't carry old mental models into new interactions and be
   surprised when behaviors didn't match.

3. **Feature flag (SWO NewFlowRx).** No persistent onboarding — the flow had to be
   learnable on first contact, every time. Procedure availability had to be genuinely
   dynamic — a clinician with only Study Model and Invisalign unlocked should see exactly
   those two.

4. **Read mode and demo mode as first-class states.** Every component built in three states
   from the start: editable, read-only, demo. Not retrofitted. Retrofitting produces visual
   inconsistency that erodes trust in a clinical context.

Without this slide, a hiring manager looking at the single-view layout might wonder "why
not just use an accordion?" The answer is: touch screen with gloves, no sequential
tap-through possible. Without the constraints, the accepted direction looks like a
preference, not a conclusion from evidence.

**Recommended add:** `textAndImage` slide with a four-item `issues` list, one constraint
per bullet. Insert after slide 5 (Design Goals), before slide 6 (Interactive Prototype).
The highlight field: "These constraints ruled out most of the obvious solutions before
exploration began." ~75 words, within budget.

---

### GAP 6 — Prototyping Rationale (slide 6 exists but framing is wrong)
**Status:** PRESENT — framing needs revision

Slide 6 leads with the method: "I built the prototype in code before designing any screens
— Figma can't show whether toolbar placement disrupts scanning rhythm the moment a
clinician reaches for a tool."

Context.md puts the consequence first: "The toolbar placement decision would not have been
made correctly without it."

The current framing sounds like a methodology preference. The correct framing is a
statement about what the prototype caught that a static mockup would have missed — and
what that meant for a specific decision. Lead with the consequence, follow with the method.

**Recommended fix:** Rewrite the `content` field on slide 6 to lead with the specific
failure the prototype caught: a toolbar placement that looked right in Figma disrupted
scanning rhythm the moment a clinician reached for it mid-capture. The code prototype
caught this because it could simulate timing; Figma cannot. A decision made in the morning
could be tested the same afternoon.

Also use the `conclusion` field (available and unused) for: "The toolbar placement decision
would not have been made correctly without it."

---

### GAP 7 — RX Before state (two more failure modes from context.md)
**Status:** PARTIALLY REPRESENTED

Slide 8 names three RX modal failures. Context.md names seven specific failure modes in
the old Rx — two that are not in the deck:

- No flexibility mid-workflow: changing a procedure meant starting over
- Mandatory fields invisible until submission blocked progress with no guidance

These are important because they map directly to the missing goals ("editable at any point"
and the popup-count KPI). Without naming them in the before state, the "editable at any
point" goal appears on the goals slide but has no corresponding problem that motivated it.

**Recommended fix:** Add a `bullets2` block to slide 8 (field is available and unused)
covering "mid-workflow lock" and "invisible mandatory fields." This connects the before
state to the goals and to the "editable mid-workflow" outcome later.

---

### GAP 8 — Scan toolbar directions (wrong options shown vs. context.md)
**Status:** DISCREPANCY — existing slide needs correction

Context.md says the three toolbar directions explored were:
- Bottom center (rejected: sat across the occlusal area, obscuring scan detail)
- Vertical right rail (rejected: always-visible consumed model viewport)
- Top-right (accepted)

The current slide 14 says:
- Fixed left rail (rejected: compressed scan viewport)
- Top bar above viewport (rejected: reaching up pulled attention)
- Collapsible corner toolbar (accepted)

These are different options with different rejection reasons. The context's "bottom center"
rejection has a more clinically specific rationale (occlusal area) that immediately signals
domain expertise. A hiring manager who knows dental scanning will recognize "occlusal area"
as the zone requiring the most visual attention during capture — the placement was wrong
for a dental-specific reason, not just a generic "too much screen space" reason.

**Recommended fix:** Revise `dir1Desc` and `dir2Desc` on slide 14 to match context.md:
"Bottom center — sat across the occlusal area, obscuring the scan detail that required the
most visual attention during capture" and "Vertical right rail — consistent location, but
always-visible consumed model viewport even when no tool was needed." The directions
images may also need to be verified against this corrected description.

---

### GAP 9 — View Phase: needs its own chapter break
**Status:** MISSING

Slide 12 labels the chapter "Scan & View" and covers both phases under one header. But
View has its own distinct before/exploration/after arc: unlabelled icons → named panels,
no completion signal → clear done state. The View chapter is substantive enough (slides
17, 18, and parts of 16) to deserve its own section marker.

Collapsing Scan and View into one chapter reads as if the designer wasn't sure how to
structure the View story. The reality from context.md is that View had its own problem
("Re-checking is a trust symptom, not a workflow preference") and its own solution
(named panels + completion state), which is a different kind of design problem than the
toolbar placement issue.

**Recommended add:** `chapter` slide ("03 — View") inserted after the icon redesign slide
(current slide 16), before the multi-scan/compare slide (current slide 17). Subtitle:
"With scanning stable, the last gap was ending the scan — clinicians had no signal they
were done."

Renumber the current Scan chapter slide (12) to "02 — Scan" — which it effectively is
already, so no title change is needed.

---

### GAP 10 — Design System (needs richer framing and better template)
**Status:** PRESENT but undersold

Slide 19 exists. The image (img-5ljyfdsz90.png) is rich: grouped teeth accordion with
"Incomplete" warning state, patient table with checkbox selection, scan layer panel with
treatment/pre-treatment opacity sliders, and a procedure icon grid with twelve icons across
two visual families. This is real system-level work.

But two problems:

First, the `textAndImage` template forces this image into a side panel where it gets half
the slide area. The design system component sheet deserves to be seen at full scale.
Consider retyping to `imageMosaic` with a title and one-sentence caption, or use a `media`
slide that lets the image fill the canvas.

Second, the prose highlights "IA was built to absorb future lab workflows without a
rebuild" — this is a tagline. The real story is the three-state model: every component
built in editable, read-only, and demo states from day one. That is not just a design
decision — it is the constraint (from Gap 5 above) that made the clinical trust requirement
achievable. The before state of retrofitting read mode onto an interaction-heavy flow
produces visual inconsistency. Building it in from the start means every future feature
that uses these components inherits consistency automatically.

**Recommended fix:** Revise `content` and `highlight` on slide 19 to explain the three-
state model and why "from day one" matters. Cut the tagline. Consider retyping the slide
to `imageMosaic` or `media` to give the component sheet its full visual weight.

---

### GAP 11 — Next Steps roadmap (Now / Next / Later)
**Status:** MISSING — second-highest-priority addition

Context.md has a clear three-horizon roadmap sequenced with the PM:

- **Now — Smart defaults and auto-fill.** The single-view layout creates the right surface
  for smart defaults: last-used materials, common shade selections, saved configurations.
  The interaction model is in place; the intelligence layer isn't.
- **Next — Rx Summary & Send.** The final phase of the flow — missing fields review, last
  edits, and case submission — was out of scope. It inherits every problem the new Rx flow
  was designed to solve.
- **Later — Lab-side connection.** The tooth chart, grouped definitions, and materials
  summary were designed to be extensible. When lab workflows connect to the same surface,
  the architecture is ready. The UI work isn't done yet.

This roadmap is a Senior signal. It shows the designer thinks past the delivered feature
to what the platform enables, and it reframes the "production data not available" limitation
as "the next phase is where the full measurement story lives."

**Recommended add:** `process` slide (three numbered steps: Smart Defaults, Rx Summary &
Send, Lab-Side Connection) inserted after slide 20 (Outcomes), before slide 21
(Reflection). Each step: title + one-sentence description. ~75 words, within budget.

---

## Template Fit & Structure

**Slide 0 (intro):** Correct template. The three cover images (Info page, tooth chart, View
with Trim tool) show the final product before anything else — good choice. The `headlineMetric`
optional field is empty and should carry the "37 million cases" scale signal if no KPI
figure exists yet. The `subtitle` field is also available.

**Slide 1 (textAndImage):** Correct template. The image (clinician chairside with a patient)
confirms the clinical context. The highlight drifts toward tagline ("Each step had its own
setup — and clinicians felt every gap between them"). Rewrite to say what the gap was
concretely. The `bullets2` field is available for "Why now" and stakeholder content.

**Slide 2 (textAndImage):** Correct template. The before-state image (img-ojnudsaui8.webp
— the old RX UI with overlapping modals) is appropriate evidence. The prose does not
reference the image explicitly; the caption should name what is shown.

**Slide 3 (quotes):** Correct template for this content. The six quotes are over budget
(~126 words vs. ~110). Consider cutting to four quotes — the two from "clinician,
restorative specialist" (first and fourth) are the most specific; the fifth ("Even when
I'm done, I keep going back to check") and sixth ("I never know if I'm selecting the right
tooth") name symptoms, not feelings or moments. The context.md quote ("like a long boring
form") is more human than any of the six — add it.

**Slide 4 (textAndImage — labeled "Journey Mapping"):** The image is the right artifact to
show here. The template is acceptable but the prose doesn't serve the image. A `media`
slide with a one-sentence caption that names what the map revealed would let the flowchart
speak for itself. If keeping `textAndImage`, remove the three duplicate bullets and use the
space for the structural insight the map produced.

**Slide 5 (goals):** Correct template. Goals are incomplete — see Gap 3. The `description`
field connects the flow map to the goals correctly.

**Slide 6 (textAndImage — "Interactive Prototype"):** Correct template if prototype video
is added. Currently the media slot appears unused (only a caption placeholder is in the
extracted listing). If a video of the coded prototype exists, it should be the primary
content here. If not, this slide risks reading as self-congratulation ("I built in code")
without evidence. Move or reframe.

**Slide 7 (chapter "RX"):** Correct. The subtitle correctly scopes the chapter.

**Slide 8 (textAndImage — "RX Setup Before"):** Correct template. The image (overlapping
Windows dialogs, patient search modal) is strong evidence. The `bullets2` field is
available for the two additional before-state failure modes from context.md (mid-workflow
lock, invisible mandatory fields).

**Slide 9 (directions — "RX Design Exploration"):** Excellent template choice. The three
directions with accepted/rejected chips and real exploration images are the strongest
ideation evidence in the deck. Slightly over budget (~104 words vs. ~90). The direction 3
description repeats itself ("no steps, no expanding … readable in one pass"); tighten to
one clause.

**Slide 10 (textAndImage — "RX Setup After"):** Correct template. The video is the right
medium for showing the new flow in motion. The highlight is the best connective line in
the deck — keep it exactly as is.

**Slide 11 (comparison — "RX Tooth Selection"):** Correct template. The comparison of
one-tooth-modal to chart-direct multi-select is clear. The `beforeBulletsTitle` and
`afterBulletsTitle` fields are available and unused — add "Before" / "After" headers for
scannability.

**Slide 12 (chapter "Scan & View"):** Consider splitting. "Scan & View" conflates two
phases that each have a distinct problem and solution arc. Rename this chapter to "02 —
Scan" and add a new "03 — View" chapter slide (see Gap 9).

**Slide 13 (textAndImage — "Scan Toolbar Before"):** Correct template. The image
(img-73988r6wpso.png — old scan interface with left-side icon column and 3D model) is
appropriate. The `highlight` field is available and unused — a line naming what made the
old toolbar specifically unusable in a live scan context would add the clinical specificity
this slide needs.

**Slide 14 (directions — "Scan Design Exploration"):** Correct template. Content needs
revision to match context.md's account of what was actually explored (see Gap 8). The
three direction images are visually similar — annotations indicating toolbar position on
each would help the reader see the difference at a glance.

**Slide 15 (textAndImage — "Scan Toolbar After"):** Over budget (~87 words vs. ~75). The
`bullets2` block duplicates slide 16's icon redesign content — remove it from slide 15
(see Cross-Slide Redundancy). The `highlight` is the one line worth keeping: it honestly
names that the icon inconsistency became visible only during implementation, and needed
separate scope.

**Slide 16 (comparison — "Icon Redesign"):** Correct template. The before/after images
are the strongest visual argument in the deck — the old icon cluster vs. the new named
panels is immediately legible without reading any text. The `highlight` claims the
redesign changed how clinicians understood the tools — one sentence of observed behavior
would make this claim land. The `beforeBulletsTitle` "Problems" is unused-style placeholder.

**Slide 17 (textAndImage — "Multi-Scan & Compare"):** This slide is the most structurally
orphaned in the deck. It appears mid-section with no before state and no problem setup. It
reads as a feature announcement, not a case study beat. Options: (a) move it to after the
View chapter break as a "what the new View enabled" slide; (b) add a brief before state
("Before this, comparing two scans meant holding one result in memory while looking at the
other") as the `content` field. The video (vid-7n89uy3l420.mp4) likely shows the overlay
interaction — make the video the anchor, not the prose description.

**Slide 18 (comparison — "View Tools Before & After"):** Correct template. Before image
(old icon clusters — blue arrow, green lasso, grey starburst, red trash) and after image
(named Prep review, Margin line, Trim panels) are strong. Slightly over budget (~113 words
vs. ~110). The `beforeBulletsTitle` / `afterBulletsTitle` fields are available and would
help scannability.

**Slide 19 (textAndImage — "Design System"):** The image deserves more visual real estate
than a `textAndImage` side panel gives it. Consider retyping to `imageMosaic` or `media`.
The prose highlight is a tagline — rewrite. See Gap 10 above.

**Slide 20 (outcomes):** Correct template. Metric field values should be specific
observations, not directional adjectives. See Impact Evidence above.

**Slide 21 (reflection):** Correct template and correctly filled. Self-critiques are
specific and credible. The `whatYouCouldntMeasure` field ("Production metrics weren't
available at handoff. Post-launch instrumentation will confirm the direction.") could be
more specific — name the metrics that would close the picture (resubmission rate, mandatory-
field error rate, setup time delta). The `nextIteration` optional field is available and
unused — the Next Steps roadmap content belongs here if a standalone slide is not added.

**Slide 22 (end):** Correct template, correctly last. The `cta`, `email`, and `linkedinUrl`
fields are all empty. Fill them — this is the only actionable CTA in the deck.

### Missing slides — canonical beats not represented

| Beat | Template | Position | Priority |
|---|---|---|---|
| Stakeholders (who bore the cost) | `issuesBreakdown` (3 cards) | After slide 1 | High |
| Why now (competition / scale / architecture) | `bullets2` on slide 1 OR new `textAndImage` | After slide 1 | High |
| Constraints (3 surfaces / flag / read+demo) | `textAndImage` (4 issues bullets) | After slide 5 | High |
| View chapter break | `chapter` (03 — View) | After slide 16 | Medium |
| Next Steps (Now / Next / Later) | `process` (3 steps) | After slide 20 | Medium |

A sixth missing beat is the `info` slide. The `_slide-templates.md` catalog states:
"Required for senior portfolios — without methodology + headline metric this slide reads
as junior." An `info` slide after slide 0 with a methodology overview (Discover → Define →
Design → Validate, mapped to the deck's chapters) and one headline metric (even from
prototype testing, with context labeled honestly) would close the most consequential gap in
the deck's opening.

---

## Cross-Slide Redundancy & Coherence

**Redundancy 1 — Slides 2 and 4 repeat the same three failure points.**
Slide 2 bullets: "A blocking modal stopped setup before scanning began" / "Tool access
broke focus mid-scan" / "No completion signal — clinicians re-checked by habit."
Slide 4 bullets: "The modal had to be completed before scanning could start" / "Reaching
for a tool mid-scan broke focus on the 3D capture" / "No completion signal — clinicians
kept checking after the scan."
These are near-identical. Slide 4's job is to show what the flow map added — the
conditional logic, the decision gates, the phase-boundary pattern. Remove the three bullets
from slide 4 and replace them with the structural insight the map produced. Let the image
carry the detailed evidence.

**Redundancy 2 — Slide 3 highlight and slide 2 highlight say the same thing from adjacent
positions.**
Slide 2 highlight: "Every failure happened at one of the same three transitions — so I
went to find out why."
Slide 3 highlight: "Three moments surfaced in every session: the setup gate, tool access
mid-scan, and end-of-scan ambiguity."
Both are summary statements of the same three failure points. They read as repetition, not
as cause and effect. Slide 2's highlight should set up the research; slide 3's highlight
should deliver the synthesis insight — what the research revealed that the problem
statement alone didn't say.

**Redundancy 3 — Slides 15 and 16 both contain icon redesign content.**
Slide 15's `bullets2` block ("Old toolbar: mixed icon styles, no labels / New toolbar:
consistent visual weight, labeled on hover") covers the same territory as slide 16's
entire `comparison` slide. Remove the `bullets2` block from slide 15 entirely. Slide 15
ends with the toolbar placement conclusion; slide 16 opens with the icon redesign as its
own beat. This also fixes slide 15's word budget overage.

**Repetition — "scanning rhythm."** The phrase appears on slides 6, 14, and 15. Three uses
of the same non-domain word across adjacent slides is the repetition tic the voice doc
warns against. Keep it on slide 14 where it earns its place (toolbar placement disrupting
rhythm at the moment of capture). Vary it on 6 ("timing" or "capture flow") and cut it
from 15 where the highlight doesn't need it.

**Coherence gap — no bridge from goals to first chapter.**
Slide 5 (goals) → slide 6 (prototype) → slide 7 (chapter: RX). There is no connection
between "here are the four goals" and "here is why we started with RX first." The answer
is explicit in context.md: RX was the blocking gate — the patient literally couldn't be
scanned until setup was complete. Say that in the chapter 7 subtitle or in the slide 8
`content` opening line.

**Image overlap flag (slides 4 and 19, 78% flagged):** From reading both images directly,
these are different artifacts — slide 4's image is the four-column appointment flowchart;
slide 19's image is the design system component sheet. The 78% overlap flag is a
pixel-hash false positive on similar image dimensions and background color. No action
needed.

---

## Slide Density (word budget)

Slides over budget per extracted.md:

- **Slide 3 (quotes): ~126 words vs. ~110.** Over by ~16. Cut to four quotes — the fifth
  and sixth are the weakest (symptom-level, not moment-level). The "like a long boring form"
  quote from context.md is more specific and more human than any of the current six — add it
  as a replacement for one of the two weakest.

- **Slide 6 (textAndImage — prototype): ~88 words vs. ~75.** Over by ~13. The two
  `bullets2` bullets ("Timing failures caught that static screens never surface" and "Design
  changes tested same-day without a dev cycle") say the same thing the highlight says. Cut
  one or collapse to a single bullet.

- **Slide 9 (directions): ~104 words vs. ~90.** Over by ~14. Direction 3 repeats itself
  in three consecutive clauses. Cut to one: "Single-view layout — everything visible at
  once, no gates between sections. On a touch screen with gloves, this was the only option
  that worked without sequential tap-through." That's the one sentence worth keeping.

- **Slide 14 (directions): ~100 words vs. ~90.** Over by ~10. Direction 3 ends with a
  sentence that belongs on slide 15: "I rebuilt every icon into a single visual language
  as part of this decision." Cut it from 14, carry it to 15 or 16.

- **Slide 15 (textAndImage — scan toolbar after): ~87 words vs. ~75.** Over by ~12. The
  fix is structural — removing the `bullets2` icon-redesign block (which belongs on slide
  16) solves the budget and the redundancy simultaneously.

- **Slide 19 (textAndImage — design system): ~93 words vs. ~75.** Over by ~18. If retyped
  to `imageMosaic` or `media`, the text budget drops significantly and the image gets the
  space it deserves. Otherwise: cut the four `issues` bullets to two most important, cut
  the tagline highlight.

- **Slide 21 (reflection): ~113 words vs. ~100.** Over by ~13. The `whatYouCouldntMeasure`
  field is the most useful place to expand (naming the specific missing metrics). To make
  room, trim `whatFailed` item 2 ("Icon redesign got bundled into toolbar work. It deserved
  its own scope.") — it is true but already implied by what's done on slide 16.

---

## What Makes This Stand Out

Three things most designers don't do:

**The coded prototype decision.** Building in code to test timing before any screens, and
being explicit that Figma cannot surface whether toolbar placement disrupts scanning rhythm
at the moment of capture — this is a specific, defensible method choice that names what
medium answers what design question. Most portfolios show Figma prototypes as the method of
record. Showing when Figma is the wrong tool signals more maturity than showing it used
correctly.

**The accordion rejection.** "In testing, clinicians kept reopening the same section. The
blocking step moved to a different point; it didn't go away." Most designers would say "the
accordion failed." This names why: removing a modal without removing the sequential
dependency produces the same failure in a new form. Understanding the pattern behind the
symptom is Senior design judgment.

**The three-state component model.** Building every component in editable, read-only, and
demo states from day one — not retrofitting — is a systems constraint that most mid-level
portfolios would skip over or mention as a footnote. The image evidence (img-5ljyfdsz90.png
showing the full component sheet with incomplete warning states, selection states, and
layered scan panels) makes it concrete.

---

## What Would Make This Much Stronger

**1. Add the Constraints slide — this is the single highest-impact fix.**
Five design decisions in this deck look like preferences without the constraints: the
single-view layout beats the wizard (because gloved touch, no sequential tap-through); the
collapsible corner toolbar beats all alternatives (because no hover states on a scanner);
the three-state component model (because read mode retrofitted produces clinical trust
problems). A single `textAndImage` slide after slide 5 naming the four constraints — three
surfaces, backward compatibility, feature flag, three-state from day one — turns five
design preferences into five design conclusions. ~75 words, fits the budget.

**2. Fix the Goals slide to include all six goals, then close the loop in Outcomes.**
Two missing goals (multi-select across teeth; editable at any point mid-workflow) are the
reason slides 11 and the "editable mid-workflow" outcome exist. Without them on the goals
slide, the tooth chart redesign reads as an add-on rather than an intended outcome. Add
both goals and the two missing KPIs (popup count per case submission, mid-workflow restart
rate) to slide 5. Then rewrite the outcomes slide to answer each KPI by name — even as a
prototype observation — so the loop opened on the goals slide is explicitly closed.

**3. Add the Next Steps slide, then let the Reflection reference it.**
Context.md's Now/Next/Later roadmap (Smart Defaults → Rx Summary & Send → Lab-Side
Connection) takes 60 words and signals that the designer owns a product domain, not just
a delivered feature. It also reframes the "production data not available" limitation as a
forward-looking claim: "the architecture is ready for the next phase, and that's where the
full measurement story lives." Add it as a `process` slide after outcomes, then update the
`whatYouCouldntMeasure` field in the reflection to name the specific metrics (resubmission
rate, mandatory-field error rate) that the next phase will capture.

---

## Overall Craft Score: 7/10

## Seniority Signal: Mid-to-Senior

The design execution — alternatives explored, constraints navigated, code-first prototyping,
three-state component system — reads at Senior level. The story as told reads at Mid level:
the research section is underframed (no method named, fabrication risk on six doctor names),
the constraints that explain every major decision are invisible, two of six goals are
missing, and the deck has no explanation for why this rebuild happened when it did. A Senior
portfolio's framing must be as strong as its execution. Right now the execution leads and
the framing lags.

> **Flag for Recruiter:** The six clinician quotes carry doctor names not confirmed in
> context.md. If any are fabricated, genericize them immediately — "Clinician, restorative
> specialist" is more credible than a named person who can't be verified. The absence of
> business stakes (why 37 million cases makes this project important) means a 30-second
> scan may not surface why this project matters at scale. Add one sentence of business
> context to the intro or slide 1.

> **Flag for Director:** Slide 14 (toolbar directions) describes different options than
> what context.md says was explored — the "bottom center" and "vertical right rail" from
> context are more clinically specific and more interesting than the "fixed left rail" and
> "top bar" in the current deck. Resolve this discrepancy before sending to a hiring manager
> who might probe the exploration. Additionally: the constraints are the missing narrative
> engine of this deck — every design decision makes more sense once the gloved-hand /
> feature-flag / three-state constraint is visible. The constraints slide is the highest-
> priority structural addition.
