## Facts to use

Everything in this section is designer-asserted truth. Agents MUST use it and must NOT
contradict it or invent around it. Where a specific is still missing it is marked
`[ADD: …]` and must stay a visible placeholder, never a guess.

# Flow Rx — Case Study Context

## The Product

iTero is a digital intraoral scanner used chairside during live patient appointments. Every
case moves through three phases: **RX** (define the case), **Scan** (capture the 3D model),
**View** (validate before lab submission). In 2024, over **37 million cases** moved through
this workflow.

The three phases were built separately. No shared layout, no shared language, no shared sense
of done. Clinicians used them as one appointment. The product didn't know that.

## The Problem

The Rx was a form. Sequential, popup-heavy, and rigid — it forced clinical decisions before
clinicians had the information to make them, then locked those decisions in.

What specifically broke:
- Too many popups — every tooth, every material, every specification triggered a modal
- No multi-select on the tooth chart — procedures set tooth by tooth, one at a time
- No flexibility mid-workflow — changing a procedure meant starting over
- No way to reuse configurations or curations across teeth
- Mandatory fields invisible until submission blocked progress with no guidance
- Setup was fully separated from scanning — one had to be complete before the other could begin

At 37 million cases a year, even one unnecessary popup per case is not a small problem.

## Who It Affected

- **Dentists** lost time chairside — every extra click was time not spent on the patient.
- **Clinical staff** absorbed the fallout — resubmissions, incomplete cases, lab queries about
  missing fields.
- **Labs** received Rx data that was incomplete and rarely structured for complex procedures
  like All-on-X or multi-phase treatments.

## Why Now

Three signals converged: competitive pressure from **3Shape, Medit, and Shining3D**, who had
already modernized their Rx flows; scale making every friction point expensive across 37
million cases; and an architecture that had been patched too many times to patch again. The
only answer was a rebuild.

## Research

Chairside observation, then six interviews. I asked clinicians to walk me through a real case
— what they did, where they hesitated, what they'd change.

Three themes surfaced across every session:

**Setup** — the Rx slowed them down before the scan even started.
> "I change the procedure multiple times before I even begin scanning."
> "I never know if I'm selecting the right tooth."

**Scanning** — losing tools mid-capture broke the clinical rhythm.
> "The moment I go looking for a tool, I lose my rhythm completely."

**View** — no signal that the work was done.
> "I never fully trust the result the first time I see it."
> "Even when I'm done, I keep going back to check."

Same three seams, every clinician. One problem showing up three times in the same appointment.

`[ADD: number of observation sessions.]`

## Design Goals

1. **Let the Rx flow alongside the scan** — setup shouldn't gate the capture
2. **Eliminate one-at-a-time configuration** — multi-select, group, reuse across teeth
3. **Make the workflow editable at any point** — no restarts when a clinician changes their mind
4. **Keep scanning uninterrupted** — tools accessible without leaving the capture context
5. **One visual language across all tools** — no icon memorization, no mixed styles
6. **Build a clear completion signal** — one done state in View so re-checking becomes a
   choice, not a reflex

### KPIs (metrics defined; production data not yet available)

- Time from case open to first scan action
- Popup count per case submission
- Multi-tooth task completion rate
- Mid-workflow restart rate
- Number of tool interactions that exit the scan context
- Re-check rate per scan

## Journey Mapping

With the scope defined and goals set, I mapped the full appointment as clinicians lived it —
not the intended flow, the actual one.

- **Before scanning:** the Rx locked setup as a prerequisite — full completion required before
  anything else could happen
- **During scanning:** tool access broke capture rhythm — every tool hunt pulled the clinician
  out of the scan context
- **After scanning:** the View phase had no resolution — no completion state, so re-checking
  became reflex

Three gaps, same flow. The map confirmed the goals were right — and made the phase structure
of the solution obvious.

## Constraints — and What They Cost the Design

Each constraint made a direct demand on what the UI could do.

**Three surfaces: scanner hardware (Element and Lumina), MIDC desktop, myitero.com.**
The touch context set the floor for every interaction pattern. Hover states, right-click menus,
and precise pointer interactions were ruled out. Tap targets had to work for gloved hands.
Every interaction had to be achievable by tap alone as a baseline.

**Backward compatibility with in-progress cases.**
The new flow and the old Rx had to coexist for the same user in the same session. The new flow
had to read as clearly different — so clinicians didn't carry old mental models into new
interactions and get confused when behaviors didn't match.

**Feature flag (SWO NewFlowRx) could be turned on and off.**
No persistent onboarding. The flow had to be learnable on first contact, every time. Procedure
availability had to be genuinely dynamic — a clinician with only Study Model and Invisalign
unlocked should see exactly those two, with nothing suggesting the others exist.

**Read mode and demo mode as first-class states.**
Every screen designed in three states from the start — editable, read-only, and demo. Not
retrofitted. Retrofitting read mode onto an interaction-heavy flow produces visual
inconsistency that erodes trust in a clinical context.

**M&I, Labs, and iTero Labs out of MVP scope — but coming.**
The tooth chart, grouped definitions, and materials summary were designed to be extensible. The
constraint wasn't "we're not building that now." It was "we can't build something now that makes
that harder later."

## Prototyping Approach

I built the prototype in code before any screens. Figma can show what a toolbar looks like — it
can't show whether placement disrupts scanning rhythm the moment a clinician reaches for a tool.
Building in code meant timing failures surfaced immediately. A decision made in the morning could
be tested the same afternoon.

The toolbar placement decision would not have been made correctly without it.

## Phase 01 — RX: Removing the Gate

**Before.** A long scrolling form — procedure selection as a text list with no visual context,
materials added one by one with no multi-select and no way to copy attributes across teeth. Every
tooth required its own dialogue: open, configure, confirm, close, repeat. Once scanning started,
the workflow locked. Changing anything meant starting over.

**Exploration.**
- **Step-by-step wizard** *(rejected)* — organized, but preserved sequential gating. The modal
  became a wizard. The blocking logic survived.
- **Accordion panels** *(rejected)* — clinicians kept reopening the procedure section after seeing
  the tooth chart. The gate moved; it didn't disappear.
- **Single-view layout** *(accepted)* — everything visible at once. Patient, procedure, tooth
  chart, and materials on one page. No gates, no navigation events between sections.

**After.** Patient details as a persistent header — always visible, editable by expanding directly.
Procedure selection as a visual interface — distinct options, dynamic based on company feature
flags, collapsing on selection but always re-editable. The tooth chart became interactive — select
one tooth or a range, apply a unified material and specification in one interaction. Grouped
definitions applied across multiple teeth, ungroupable when individual variation was needed.
Materials summary sat beside the chart, updating in real time. The form became the page. No section
was a gate to the next.

## Phase 02 — Scan: Fixing the Toolbar

**Before.** The toolbar grew by accumulation — icons from different eras, different styles, no
shared visual language. No fixed location. Every tool access during a live scan pulled attention
off the 3D model at the exact moment that attention mattered most.

**Exploration.** The placement decision came from user research — I tested the three options with
clinicians during live scanning, not from sketching alone.
- **Bottom center** *(rejected)* — sat across the occlusal area, obscuring the scan detail that
  required the most visual attention during capture.
- **Vertical right rail** *(rejected)* — consistent location, but always-visible consumed model
  viewport space even when no tool was needed.
- **Top-right toolbar** *(accepted)* — outside the active scan area, away from the 3D model,
  reachable without disrupting capture. The research was clear: it was the only placement clinicians
  could reach without pulling their eyes off the model. Fixing placement exposed the icon problem —
  a toolbar in the right place with unmemorable icons was still a broken toolbar.

**After.** A toolbar anchored to the top-right, rebuilt with a unified icon system: consistent line
weight, consistent style, labeled. Toolbar and procedure icons rebuilt as one system — they had
never shared a visual language despite appearing in the same workflow. New tools slot in without
requiring new conventions. **Multi-scan and compare** — pre-treatment and post-treatment scans
organized by tab, with real-time overlay and adjustable opacity. We added this because complex,
multi-visit cases need more than one scan: clinicians had to add and toggle layers to see what
changed between visits, and the system had to scale to multiple scans per case without the
interface falling apart. Comparing two scans became visual instead of mental.

## Phase 03 — View: A Clear Ending

**Before.** Unlabelled icons. No hierarchy between primary and destructive actions. No completion
signal. Clinicians re-checked every scan by habit — not because anything was wrong, but because
nothing told them they were done. Re-checking is a trust symptom, not a workflow preference.

**After.** Named panels — Prep review, Margin line, Trim — each describing the clinical step, not
the technical function. AI Detect ran first by default; the clinician reviewed rather than redrew.
Destructive actions separated and labeled explicitly. One clear completion state at the end.
Re-checking dropped because the interface finally gave clinicians a reason to stop.

## The Design System

Every pattern from the redesign — inputs, buttons, selections, progress states — was documented as
reusable components. The three problem areas got fixed. The wider product got a shared language it
hadn't had before.

## Outcomes

| Goal | Result |
|---|---|
| Flow alongside the scan | Case open → first scan with no blocking gate |
| Eliminate one-at-a-time | Multi-tooth selection + grouped definitions in one interaction |
| Remove popups from critical path | Zero blocking modals between case open and scan |
| Editable at any point | Procedure and materials changeable mid-workflow, no restart |

`[ADD: quantitative measurements from usability testing or post-launch analytics.]`

## Limitations

- Six interviews is a small sample — findings skewed toward the clinicians available for
  observation, not a representative cross-section of procedure types or practice sizes
- Prototype testing validated interaction logic, not real scanning conditions — the coded
  prototype simulated the workflow, not a live patient context
- Production data not yet available — outcomes measured in testing, not in the field
- Lab-side impact unmeasured — resubmission rate and mandatory-field error rate, the clearest
  proof of Rx completeness, were not instrumented for this phase

## Reflection

**What worked:** Starting with structure, not screens. The problems were architectural — fixing the
visual layer without addressing the sequential logic would have produced a better-looking version of
the same failure. The journey map made that visible before any design work began.

**What didn't:** Toolbar exploration ran sequentially instead of criteria-first. The reasons for
rejecting bottom center and right rail were clear from the first sketch. Naming the constraints
upfront would have made the exploration shorter and the decision faster.

**What I'd do differently:** Define placement constraints before generating toolbar options. And
bring grouped materials definition into scope earlier — it was the highest-leverage feature in the
materials flow, but came late, which compressed testing time for edge cases like ungrouping mid-case
or applying a group to teeth with conflicting existing specifications.

`[ADD: post-launch resubmission rate and mandatory-field error rate.]`

## Next Steps

Three follow-on opportunities, sequenced with the PM:

- **Now — Smart defaults and auto-fill.** The single-view layout creates the right surface for smart
  defaults — last-used materials, common shade selections, saved configurations. The interaction model
  is in place; the intelligence layer isn't.
- **Next — Rx Summary & Send.** The final phase of the flow — showing missing fields, allowing last
  edits, and sending the case — was out of scope for this phase. It inherits every problem the new Rx
  flow was designed to solve.
- **Later — Lab-side connection.** The tooth chart, grouped definitions, and materials summary were
  designed to be extensible. When lab workflows connect to the same surface, the architecture is ready.
  The UI work isn't done yet.

## Closing

Three phases built separately, now one workflow in the appointment. The Rx no longer gates the scan.
The toolbar no longer interrupts the capture. View no longer ends without resolution.

*Happy to walk through the full journey map, the coded prototype, or the documentation.*

## Wondering whether to add

The designer wants the deck expanded so every beat above is represented. The agents should decide
(and the editor should add via insert ops) which of these are currently MISSING as slides and worth
adding — candidates: **Who It Affected** (stakeholders), **Why Now** (competitive/scale trigger),
**Design Goals + KPIs**, **Journey Mapping**, **Constraints** (the three-surfaces/feature-flag/
read-demo set), **Prototyping rationale** (code-first), the **three before→exploration→after phases**
(RX / Scan / View), **Design System**, and a **Next Steps roadmap** (Now / Next / Later). Reorder and
revise existing slides so the deck reads as one continuous story across the three phases. Do not
invent any number — KPIs are defined but unmeasured; keep `[ADD: …]` placeholders for production data.
