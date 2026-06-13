# Design Director Verdict — iTero Clinical Scanning Workflow
### Focus: narrative architecture, ideal slide order, missing beats, seniority signal

_Reviewer: Design Director · Source: extracted.md (23 slides) + context.md (authoritative
designer-supplied facts) · Profile target: Senior Product Designer, SaaS B2B workflow_

---

## Career Narrative

The superpower is legible: Lior takes a workflow that grew into three disconnected systems
and redesigns it so the product finally matches how someone actually uses it — one
appointment, not three separate tools. That is a real and marketable specialty for B2B
SaaS hiring managers. Workflow coherence across phases is one of the most expensive
product failures in that market, and a designer who diagnoses it at the seam level (not
the screen level) is uncommon.

The problem is that the current 23-slide deck does not fully tell that story. It shows
the RX and Scan phases in reasonable detail, but View gets one comparison slide and no
exploration arc. More critically, seven beats that context.md supplies as authoritative
facts are completely absent from the slides: why the rebuild was triggered now, who bore
the cost of every broken transition, the hardware and operational constraints that
eliminated entire design directions, the full View phase story, the design system as
forward-compatible architecture (not just documentation), and what comes next after
handoff. Without those beats, the deck reads as a well-crafted before/after series
rather than the account of a designer who understood the whole problem and made
decisions under real pressure. The work is there. It has not been told yet.

---

## Case Study Architecture

**Hook: 8/10**

"The patient is in the chair. The scanner is ready. The system isn't." opens in fourteen
words, establishes a specific scene, and creates stakes before explaining anything. The
follow-up sentence in the description closes the loop ("three parts of one appointment
that had never been designed together"). This is a strong hook — keep it exactly.

The problem: the hook promises three phases treated as one story, and the deck partially
delivers that promise. What slightly undercuts it is that the Why Now framing is absent.
A SaaS hiring manager who does not know this domain reads "I redesigned a clinical
workflow" and wants to know immediately: why was this the moment to do it, and what was
at stake if it stayed broken? Right now the deck cannot answer those questions until
slide 20, and by then the reader has already formed their impression.

The `headlineMetric` field on the intro slide is unused. For a Senior portfolio a hiring
manager doing a 6-second scan gets no quantified anchor from the first slide.

**Stakes: 4/10**

This is the deck's most critical gap. The problem is presented as a clinic-level UX
friction — a patient sitting, a modal blocking, a tool unreachable mid-scan. That framing
is accurate but undersells the actual stakes.

Context.md has the full picture: 37 million cases in 2024 (meaning one unnecessary popup
per case multiplied 37 million times); competitive pressure from 3Shape, Medit, and
Shining3D who had already modernized their Rx flows; an architecture that had been patched
too many times to patch again and required a full rebuild. Dentists lost chair time on
every extra click. Clinical staff absorbed the resubmission fallout when cases were
submitted incomplete. Labs received Rx data that was not structured for complex
procedures. Three distinct user groups were paying a cost at scale, and the business was
under competitive pressure.

None of that is in the deck. Without it, the problem reads as a usability annoyance
rather than a strategic product decision. A Senior candidate names the business case.
This one does not yet.

**Conflict: 7/10**

The two `directions` slides (slides 9 and 14) are the strongest structural elements in
the deck. Both have real reasoning behind the rejections: the wizard "preserved
sequential gating," the accordion meant "the gate moved, it didn't go away," the fixed
left rail "compressed the scan viewport," the top bar "pulled attention off the live scan
mid-capture." That is design judgment made visible rather than "we tried these and
eliminated them." It is a genuine Senior signal.

The coded prototype choice (slide 6) is the secondary conflict beat: a designer who
identified that Figma could not surface timing failures and built the test environment
before touching static screens. The reasoning is stated but underplayed.

What is missing is any constraint that shaped the decision space. Context.md documents a
rich set of hard constraints that directly eliminated design options:

- Three surfaces: scanner hardware (Element and Lumina used with gloved hands),
  MIDC Windows desktop, and myitero.com browser — each with different interaction floors
- Every interaction had to be achievable by tap alone as a baseline, which ruled out
  hover states, right-click menus, and small precision targets
- Feature flag (SWO NewFlowRx) that could be toggled on and off meant no persistent
  onboarding — the flow had to be learnable on first contact every time
- Backward compatibility with in-progress cases — new flow and old Rx coexisting for the
  same user in the same session
- Read mode and demo mode as first-class states from day one, not retrofits
- M&I, Labs, and iTero Labs out of MVP scope but architecturally anticipated — the
  constraint was not "we won't build it now" but "we can't make it harder to build later"

Not one of these appears in the deck. The consequence is stark: the direction rejections
look like aesthetic preferences. "Fixed left rail compressed the scan viewport" (slide 14)
is described but its underlying reason is not — the clinician cannot reframe a 3D model
while actively scanning, so viewport compression was functionally unacceptable, not
merely untidy. The constraint is the reason. The reason is absent.

A single Constraints slide between the journey map and the goals slide would transform
how every downstream decision reads.

**Resolution: 5/10**

The chapter structure gives the deck a clean arc. Each chapter closes with an After
slide. The reflection and end slides are correctly placed, and the end subtitle ("Three
phases built separately, now one experience in the appointment") is a good callback.

Two structural problems break the resolution:

First, View has no exploration arc. The deck promises three phases in the intro, gives
RX four or five slides, gives Scan five slides, and gives View one comparison slide
(slide 18) embedded inside a combined "Scan & View" chapter. The three-phase promise is
not kept. Context.md has a complete View story: the before state (unlabelled icons, no
hierarchy, no completion signal, re-checking as a trust symptom — not a workflow
preference), and the after (named panels describing clinical steps rather than technical
functions, AI Detect as the default starting point, destructive actions explicitly
separated, one clear completion state). That is a full arc. It needs its own chapter,
its own Before slide, and its own promotion inside the deck.

Second, the Next Steps beat is entirely missing. Context.md carries a prioritized Now /
Next / Later roadmap: smart defaults and auto-fill (the interaction model is in place,
the intelligence layer is not); Rx Summary & Send (the final phase of the flow, which
inherits every problem the new Rx was designed to solve); lab-side connection (the
architecture is ready, the UI is not done yet). A senior designer who shapes a product
roadmap and can say "here is where this goes next" in a prioritized sequence is
distinguishable from a designer who finishes a project and hands it off. That slide does
not exist in the deck.

Third, the Design System slide (slide 19) claims less than the actual work delivered.
Context.md states the information architecture was deliberately designed to absorb future
lab workflows without a rebuild — the constraint was not "we are not building that now"
but "we cannot build something now that makes it harder later." That is a forward-
compatible architecture decision, a meaningfully different and stronger claim than
"components were documented."

**Voice: 8/10**

This is the deck's real strength. The writing is specific, first-person, and grounded.
Several lines are genuinely good: "Every second in that modal was time the patient sat
waiting." "Comparing two scans used to be a mental exercise. The overlay made it visual."
"Named panels closed the last gap in View." These are concrete, human, and earned. The
reflection names specific failures (toolbar testing came too late; icon redesign got
bundled into toolbar work) and concrete alternatives. The jargon rule is respected.

One voice issue worth naming: the word "seam" appears multiple times in the deck across
different slides. The voice doctrine is explicit — a non-obvious connective word that
recurs on three or more slides becomes a tic, not a connection. Vary it: "gap,"
"transition," "where one step passed to the next," "the point between phases."

A second issue: slide 15's highlight rushes a decision that deserves a full beat — "Once
I was building it in code, the icon inconsistency became visible as its own problem." The
logical chain requires more than one clause. Where in the process did this happen? What
did it cost? This is the kind of scope-discovery moment that signals project management
alongside design judgment.

**Weakest element: Stakes.** The deck presents an enterprise-scale business problem as a
clinic-level UX friction. The actual facts — 37 million cases, three competitors who had
already modernized, an architecture that could not be patched further — are in context.md
and not in the deck. That absence is the primary screening risk for a Senior SaaS role.

---

## Seniority Positioning Gap

**Current signal: Mid — approaching Senior**

What reads at Senior level:
- Journey-map-first discipline, with goals that trace directly back to map findings
- Two `directions` slides with specific accept/reject reasoning (not just "we tried it")
- Coded prototype as a deliberate tool choice with a named reason
- Design system framed as an architectural decision, not an afterthought
- A `reflection` slide with specific failures and concrete "would-do-differently" items

What does not yet read at Senior level:
- No constraints that shaped the design — decisions look like preferences, not tradeoffs
- No business stakes visible — the scale and competitive pressure are absent
- No stakeholder impact named — who paid the cost, what they could not do because of it
- No forward product ownership — no Next Steps roadmap, no stated point of view on where
  the product goes from here
- The View phase has no exploration arc — one third of the promised story is missing

**Target should be: Senior, reading convincingly at that level for B2B SaaS**

**Gap — what closes it:**

Three additions close most of the gap, in order of impact:

1. A "Why Now / Who It Affected" beat in the opening chapter. This is the business case
   that makes everything downstream matter — scale (37M cases), competitive pressure
   (3Shape, Medit, Shining3D), architecture that required a rebuild, three user groups
   paying a cost (clinicians, staff, labs). Without it the deck is a design exercise;
   with it the deck is a strategic product decision the designer owned.

2. A Constraints slide between the journey map and the design goals. This is where the
   work starts to read at Senior level. Three surfaces. Gloved-hand touch floor. Feature
   flag with no persistent onboarding. Backward compatibility. Read/demo as first-class
   states. M&I/Labs forward-compatibility. Every design decision downstream becomes
   legible as a constrained choice rather than an unconstrained preference once this
   context exists.

3. A View chapter with its own chapter break, a dedicated Before slide, and a Next Steps
   roadmap before the reflection. View is promised in the intro and underdelivered in the
   deck. The roadmap is the clearest signal that the designer shaped the product, not
   just the screens.

---

## Ideal Slide Order and Beat Structure

This is the recommended deck architecture after expansion. Current 23 slides expand to
approximately 30. All existing slides are retained; only new slides are added (via insert
ops) and some existing slides are reordered (move ops). The numbers below show the
recommended final position.

```
00  Cover (intro) — existing slide 0
    [Keep as-is. The hook is strong. Consider adding headlineMetric if prototype
    testing produced a clean observation that can be stated honestly.]

01  Why Now / Who It Affected — NEW textAndImage or issuesBreakdown
    "Three competitors had already modernized their Rx flows. At 37 million cases a
    year, every unnecessary popup per case was a systemic cost, not a UX annoyance.
    The architecture had been patched too many times. The only answer was a rebuild."
    Stakeholders: dentists (chair time at every extra click), clinical staff
    (resubmission and missing-field fallout), labs (incomplete Rx for complex
    procedures like All-on-X)
    Template: issuesBreakdown with three numbered stakeholder cards works well here.
    Alternatively textAndImage with the scale stat as a highlight.

02  The System — existing slide 1
    [Keep. Establishes the three-phase context before the problem.]

03  The Problem — existing slide 2
    [Keep. Names the four specific breakdowns.]

04  Research — existing slide 3 (quotes)
    [Keep. Six interviews, four quotes, three themes. Resolve the [ADD: observation
    sessions] placeholder — fill it or remove the sentence that references it.]

05  Journey Map — existing slide 4
    [Keep. The flow map as the diagnostic tool is the right beat here.]

06  Constraints — NEW textAndImage
    Label: "What the build couldn't do"
    Title: "Three surfaces. One touch floor. No persistent onboarding."
    Content: scanner hardware (Element, Lumina) set the interaction floor — every
    tap had to work with a gloved hand, ruling out hover states and small targets;
    feature flag behavior meant no onboarding, first contact had to teach the flow
    every time; backward compatibility required the new and old flows to coexist;
    read mode and demo mode as first-class states from day one, not retrofits;
    M&I/Labs extensibility as a future-compatibility constraint, not a deferred scope.
    Template: textAndImage with bullets carrying each constraint and a highlight
    naming the floor: "The touch surface set every interaction decision. If it
    couldn't be done with a glove, it wasn't an option."

07  Design Goals + KPIs — existing slide 5
    [Keep. Now reads as goals within the constraint space, not unconstrained
    aspirations. That reframe is free — the constraint slide does the work.]

08  Interactive Prototype — existing slide 6
    [Move from its current position to sit here, between goals and the RX chapter
    break. Its job is to explain the methodology used across all three phases before
    the phase-by-phase story begins. Currently it sits between the goals and the RX
    chapter, which makes it feel like a procedural footnote. Here it reads as a
    deliberate methodology choice made before any phase work began.]

09  Chapter 01 — RX — existing slide 7
10  RX Before — existing slide 8
11  RX Exploration — existing slide 9 (directions)
12  RX After — existing slide 10
13  RX Tooth Selection — existing slide 11 (comparison)

14  Chapter 02 — Scan — existing slide 12
    [Rename from "Scan & View" to "Scan." View gets its own chapter.]
15  Scan Before — existing slide 13
16  Scan Exploration — existing slide 14 (directions)
17  Scan After — existing slide 15
18  Icon Redesign — existing slide 16 (comparison)
19  Multi-Scan & Compare — existing slide 17

20  Chapter 03 — View — NEW chapter slide
    Number: 03
    Title: View
    Subtitle: "Scan captured. Last: making sure the result could be trusted before
    it went to the lab."

21  View Before — NEW textAndImage
    Label: "View — Before"
    Title: "No signal that the work was done"
    Content: "Unlabelled icons. No hierarchy between primary and destructive actions.
    And no completion state — so clinicians re-checked every scan by reflex. Not
    because anything was wrong. Because nothing told them they were done."
    Bullets: unlabelled icons with mixed styles; primary and destructive actions at
    equal visual weight; no done state — re-checking was a trust symptom, not a
    workflow preference
    Highlight: "Re-checking is not a workflow preference. It is what happens when
    the interface gives no reason to stop."
    [This is the clearest clinical insight in context.md and it is not in the deck
    at all. It turns slide 18 from a visual comparison into the resolution of a
    stated problem.]

22  View After — existing slide 18 (comparison)
    [Move to inside Chapter 03, after the View Before slide. The comparison slide
    already has strong content — named panels, AI Detect as default, destructive
    actions separated. It just needs to sit inside its own arc.]

23  Design System — existing slide 19
    [Keep here — after the full three-phase solution arc is complete, before
    outcomes. Rewrite the highlight to claim the stronger truth from context.md:
    "The IA was built so that when lab workflows connect to the same surface, the
    architecture is ready. The UI work isn't done — but it won't need to be rebuilt
    from scratch."]

24  Outcomes — existing slide 20
    [Keep position. Rewrite the outcome descriptions — replace directional adjectives
    (Faster, Fewer, Clearer, Higher) with honest, sourced observations from prototype
    testing. "In prototype testing, clinicians moved from patient selection to first
    scan action without going through the setup modal — a step that had appeared in
    every pre-redesign session I observed" is more credible than "Faster / [ADD: …]".]

25  Next Steps — NEW textAndImage or process slide
    Label: "Next Steps"
    Title: "Three follow-on opportunities, sequenced with the PM"
    Template: process slide with three numbered steps works cleanly here
    Step 1 — Now: Smart defaults and auto-fill. The single-view layout creates the
    surface for it. The interaction model is in place; the intelligence layer is not.
    Step 2 — Next: Rx Summary & Send. The final phase of the flow — missing fields,
    last edits, case submission — was out of scope. It inherits every problem the new
    Rx was designed to solve.
    Step 3 — Later: Lab-side connection. The tooth chart and grouped definitions were
    built to be extensible. When lab workflows connect, the architecture is ready.
    [This slide is the clearest seniority signal available to add. It shows the
    designer understood the product trajectory and made scope decisions deliberately,
    not by accident.]

26  Reflection — existing slide 21
    [Keep. Fill the unused `whatYouLearned` field — see Rewrite #3 below. Resolve
    the `whatYouCouldntMeasure` field: context.md has honest limitation statements
    (six-interview sample, prototype-not-live-scanning validation, production data
    not yet available, lab-side resubmission rate uninstrumented). Use them directly.]

27  End — existing slide 22
    [Keep. The subtitle "Three phases built separately, now one appointment" is a
    good callback and earns its place.]
```

**Key ordering decisions explained:**

Why Now + Who It Affected at position 01 (not buried later): Business stakes must
precede the problem breakdown. A hiring manager who does not know this domain needs to
understand why anyone cared before they read the bullet list of failures. Framing first,
evidence second.

Constraints at position 06 (between journey map and design goals): Its structural job is
to explain the decision space before the goals are stated. When a hiring manager reads
"Goal 1: Eliminate the setup gate," they should already know that the alternative — a
multi-step wizard — was considered and rejected because it preserved sequential gating.
When they read the exploration slide and see "Step-by-step wizard: rejected," they should
already understand why: the touch surface and gloved-hand constraint made any sequential
gate unworkable, not merely undesirable. Constraints before goals makes every direction
rejection read as necessary, not preferential.

Interactive Prototype moved to position 08 (before Chapter 01): Currently it sits at
position 6 between the design goals and the RX chapter break, which reads as a
procedural aside. Moved to just before the first chapter opener, it reads as a
methodology statement: "before any phase work began, I built a test environment that
could surface timing failures static screens couldn't show." That is the correct
narrative function for this slide.

View gets its own chapter (Chapter 03) at positions 20-22: The current "Scan & View"
chapter collapses two distinct phases with different problems and different design arcs
into one section. Scan's problem is tool access mid-capture. View's problem is the
absence of a completion signal. These are not the same problem. Combining them in one
chapter tells the reader they are equivalent in depth; they are not. Giving View its own
chapter — with its own chapter slide and its own Before slide — fulfills the three-phase
promise the intro makes.

Next Steps at position 25 (before Reflection): A roadmap shows forward product
ownership. A reflection looks critically backward. Hearing "here is where this goes
next" before "here is what I would do differently" produces the right close: a designer
who shaped the product's direction, then interrogated their own process honestly. The
current deck ends at outcomes → reflection → end, which reads as "project complete,
lessons learned." The expanded close reads as "project complete, product continues,
here's what I learned."

---

## Market Positioning

**Optimized for (currently, without the missing beats):** Health-adjacent B2B SaaS
audiences who already recognize "dental scanner Rx workflow" as a complex professional
tool. These hiring managers will immediately trust and recognize the domain. A hiring
manager outside healthcare may recognize the process discipline but may not automatically
map "chair-side scanner" to "our kind of workflow problem."

**After expansion (with Why Now, Constraints, and View arc):** The deck becomes legible
to any SaaS company with multi-phase workflows serving professional users under time
pressure. The competitive framing ("3Shape and Medit had already modernized") reads as
product management fluency, not clinical specialization. The constraint-driven decisions
read as engineering-partnered design, not aesthetics-driven iteration. The Next Steps
roadmap reads as product leadership.

**Who would hire immediately (after expansion):** B2B SaaS companies with complex,
multi-phase professional workflows — internal tooling platforms, operations software,
scheduling systems, ERP-adjacent tools, any product where the cost of a bad interaction
is measured in real professional time. Companies that value designers who think at the
workflow level before touching any individual screen.

**Who would pass:** Pure consumer products, early-stage startups without structured
workflow problems, B2C SaaS. Not because the work is weak but because the expansion of
the deck makes it more specialized, not less. The designer's profile is explicit: the
clinical background is not the destination. One line in the reflection or the intro
bridges that gap — see Rewrite 3 below.

---

## The Signature Move

Two signature moves exist in the work but are not yet visible in the deck.

The first is **constraint-driven elimination**: every design direction in this project
was rejected not because a better option existed aesthetically, but because the
hardware, the feature flag behavior, the backward compatibility requirement, or the
three-surface context made it unworkable. A designer who reasons from constraints before
generating options is distinguishable from one who generates options and then evaluates
them. The deck shows the evaluations; the constraints that drove them are absent.

The second is the **coded prototype as a diagnostic tool**: most designers at this
experience level prototype in Figma. Building in code to surface timing failures — and
catching the toolbar placement failure before it shipped — is a specific and memorable
choice. Slide 6 states this but does not frame it as a deliberate method choice that any
designer facing the same problem should consider. One sentence would make it land as a
signature: "I build prototypes in code when the failure mode is about timing, not visual
clarity — Figma shows what a toolbar looks like; code shows whether reaching for it
breaks your concentration."

Together, those two moves describe a designer who thinks in systems and constraints
before thinking in screens. That is a specific and valuable type of designer, and it
is not yet visible from reading the deck alone.

---

## "Wondering Whether to Add" — Answers

The context.md's "Wondering whether to add" section identifies nine candidate beats for
expansion. Verdict on each:

**Why Now (competitive / scale trigger) — ADD, high priority**
Template: fold into the new "Why Now / Who It Affected" slide (position 01 above). Scale
(37M cases) and competitive pressure (3Shape, Medit, Shining3D) together establish why
a redesign was the strategic call, not just the nice-to-have one. One paragraph, not a
full slide on its own.

**Who It Affected (stakeholders) — ADD, high priority, same slide as Why Now**
Dentists, clinical staff, labs. Each one has a specific cost named in context.md —
chair time lost, resubmission absorbed, incomplete lab data — which makes the three-user
framing concrete rather than generic. The `issuesBreakdown` template with three cards
is the cleanest way to render this: one card per stakeholder group, one specific cost
per card.

**Design Goals + KPIs — ALREADY IN DECK (slide 5)**
Slide 5 is present and well-structured. The KPIs listed are the right ones from context.md.
No addition needed. Note that the slide already acknowledges production data is not
available — that is the correct honest framing.

**Journey Mapping — ALREADY IN DECK (slide 4)**
Slide 4 maps the flow as clinicians lived it, not the intended flow. The three gaps
(before scanning, during scanning, after scanning) map directly to the three chapters.
No addition needed. The visual image carries this beat.

**Constraints — ADD, high priority, own slide (position 06)**
See the proposed slide above in full detail. This is the highest-leverage missing beat
for seniority positioning. Not optional for a Senior-targeting deck.

**Prototyping rationale (code-first) — ALREADY IN DECK (slide 6), move it**
The content is there. The position is wrong. Move slide 6 to just before the first
chapter opener so it reads as a methodology statement rather than a procedural footnote.

**The three before→exploration→after phases — PARTIALLY IN DECK**
RX and Scan are complete. View is missing its Before slide and its own chapter. Add
Chapter 03 (View) with a Before slide (position 20-21 above). The existing comparison
slide 18 becomes the View After beat once it is moved inside the new chapter.

**Design System — ALREADY IN DECK (slide 19), rewrite the claim**
The slide is in the right position. Rewrite the highlight to claim the stronger fact from
context.md: the IA was built to absorb lab workflows without a rebuild. Currently the
slide says "fix" — it should say "extensible architecture designed for what comes next."

**Next Steps roadmap (Now / Next / Later) — ADD, high priority**
Template: process slide with three numbered steps. Content from context.md is fully
formed and does not require invention. This slide does not belong on the verify checklist
— it comes from the designer's own planning work with the PM.

---

## 3 Rewrites That Would Change Everything

**1. Open the deck's second slide with the business case, not the system description.**

Currently: slide 1 establishes the product context (iTero, three phases, 37 million
cases) and slide 2 lists the four breakdowns. Both are correct. What is missing is the
business pressure that made this the moment to rebuild.

Add a new slide at position 01 (using `issuesBreakdown` for three stakeholder cards or
`textAndImage` for a scale paragraph with bullets):

"In 2024, three competitors had already modernized their Rx flows. At 37 million cases
a year, every unnecessary click per case was a systemic cost, not a UX annoyance. The
architecture had been patched too many times. The only path forward was a rebuild."

Then below: Dentists — every extra tap was time not spent on the patient. Clinical staff
— incomplete submissions created resubmission work and lab queries. Labs — Rx data wasn't
structured for complex multi-phase procedures.

This paragraph changes every subsequent design decision from "a cleanup" into "a
strategic product decision under competitive pressure." It is the highest-impact addition
the deck is missing.

**2. Add a Constraints slide between the journey map (slide 4) and the design goals
(slide 5).**

Title: "What the build couldn't do" or "What the hardware decided"
Content: "The scanner hardware set the interaction floor. Every interaction had to work
with a gloved hand — hover states, right-click menus, and precision tap targets were out.
The feature flag meant no persistent onboarding: the flow had to teach itself on first
contact every time. The new flow also had to coexist with the old Rx for in-progress
cases — no migration path, same user, same session."

Bullets for the remaining constraints: read mode and demo mode as first-class states
from day one (retrofitting creates visual inconsistency that erodes trust in clinical
contexts); M&I, Labs, and iTero Labs out of MVP scope but architecturally anticipated.

Highlight: "These constraints made some directions impossible before exploration began.
The single-view layout wasn't a preference — it was the only Rx pattern that worked on
a touch screen under gloves."

This slide does two things: it makes the direction rejections in slides 9 and 14 read as
necessary eliminations rather than taste calls, and it establishes the designer as
someone who maps the constraint space before generating options — a Senior-level move.

**3. Fill the `whatYouLearned` field in the reflection (slide 21) with the sentence
that makes this clinical story readable as a SaaS principle.**

The `whatYouLearned` field is available and unfilled. This is the one sentence that
bridges the clinical context to the SaaS audience the profile is targeting:

"Any product used mid-task — where the user cannot stop and think things through —
breaks at the transitions, not inside individual steps. That is where I looked first
here, and it is where I would look first in the next project."

This sentence does three things simultaneously: it names the designer's point of view
(a transferable design principle, not a clinical observation); it connects the case study
back to the intro's thesis (three phases as one appointment); and it explicitly bridges
the healthcare domain to the SaaS audience without abandoning the clinical credential.
It is the line that makes a hiring manager at Atlassian or Salesforce think "that
principle applies to our product too."

---

## Director Verdict: Needs Rework — structural expansion, not a voice fix

The writing is already at the right level. The seniority gap is not in the prose — it is
in the architecture. Seven beats that are fully documented in context.md (Why Now, Who It
Affected, Constraints, View Before, View chapter, Next Steps, updated Design System
claim) are missing from the slides. Adding those beats in the sequence above closes the
gap from Mid to Senior. The three rewrites named above are the highest-impact changes;
the slide-order map above is the blueprint for the rest.

> **Flag for Recruiter:** The deck opens without business stakes — no competitive
> framing, no scale context, no stakeholder cost visible in the first three slides. A
> recruiter filtering for Senior product ownership will not find that signal before
> slide 20. The `headlineMetric` field on the intro slide is unused. Two `[ADD: …]`
> placeholders remain visible in the published deck (slide 3 research context, slide 21
> outcomes). Fix the stakes and the placeholders before this deck screens at Senior level.

> **Flag for UX Reviewer:** The multi-surface constraint (scanner hardware with gloved
> hands, Windows desktop, browser) shaped every interaction decision and appears nowhere
> in the deck. The direction rejections in slides 9 and 14 name what failed at the screen
> level but not why the underlying constraint made those failures unacceptable. The View
> phase has no before/exploration arc — one third of the deck's promised three-phase
> story is missing. The Design System slide (slide 19) claims components were documented
> when context.md establishes the IA was deliberately built for lab-workflow extensibility
> — a meaningfully stronger and more credible claim that is not in the deck.
