# Recruiter Verdict — Patient Report Redesign
`project-1776014998709` · reviewed against: Senior Product Designer, B2B SaaS

---

## THIS PASS: Structural Decisions A and B

These two items are addressed before the standard framework because the designer has
decided both — the questions are whether each is net-positive from a hiring lens, and
what the execution must nail.

---

### A. Merge the two problem slides — confirmed net-positive. Lead with the ceiling.

Yes. Merge is the right call. Two problem slides back-to-back signals the designer
hasn't decided what the problem actually is — it reads as uncertainty dressed up as depth.
In a 4-minute read, a recruiter on candidate 8 of the afternoon will register "this deck
is slow to get going" before they absorb a single specific.

The merged slide must open with the diagnosis, not the symptom list.

The framing that must lead: doctors were already using the report — the ceiling was the
problem, not adoption. That sentence does two things at once. It repositions the project
from "fix what's broken" to "extend what's possible." And it makes every design decision
that follows (templates, annotation, edit-in-place) read as a logical extension rather
than a repair job. "Fix what's broken" is reactive. "Remove the ceiling" is strategic.
For a Senior SaaS target, the second framing is the higher-level signal.

What to keep from each slide:
- From Slide 1: the four specific failure points (sidebar locked to 25%, no templates,
  no annotation tools, PDF unreadable). These are concrete and credible — keep all four.
- From Slide 2: the diagnosis framing. "Limited by design, not by use" is the sharpest
  sentence in either slide — it is the slide title and it should anchor the merged slide.
  Drop the three bullets from Slide 2. They restate what the Slide 1 issues already cover.
- One highlight, not two. "Built around the software — not the doctor using it" (Slide 1)
  is sharper than "The redesign removes the limit — not how doctors worked" (Slide 2).
  Use the former.

The merged slide arc: here is what doctors were already doing (using it), here is exactly
where the tool stopped them (four points), here is the diagnosis. One beat, one slide.
The recruiter turns the page knowing precisely what was wrong and why it warranted a
full redesign rather than a patch. That is the correct entry into the research slide.

One hard constraint: the merged slide must stay within the textAndImage budget (~75 words
on screen). Trim the content sentence to one clause and keep only the four sharpest
issue bullets. The second slide's bullets are the cut, not the issues from Slide 1.

---

### B. The user-flow slide after Goals — keep it, but the description must carry the judgment.

My prior lean was cut. The new rationale changes the verdict — partially.

The prior version of a flow slide read as documentation: "here is a diagram I made."
That version earned a cut because it added an artifact without adding reasoning. The new
rationale is materially different. The designer is saying: before touching any of the
three major features, I first needed to understand how they connect — how templates,
annotation, and sharing fit into a single report-creation workflow. That is a genuine
design decision, not a documentation step. Most designers at this level would jump
straight to the first feature. Mapping the whole flow first to understand where new
features land before designing any of them is exactly the kind of upstream judgment a
hiring manager at a workflow-heavy SaaS company cares about. It is the difference between
"I designed three features" and "I structured the solution space before designing anything."

So: keep the slide. But the description must carry that judgment explicitly, or it
collapses back into documentation the moment the reader glances at it.

What the description must say, in substance:
- Before designing any of the three features, I needed to understand where each one sits
  in the full report workflow — otherwise the structure would be wrong before I started.
- Mapping the flow first showed me how templates, annotation, and sharing connect to each
  other, and organized the design space before I tested anything.
- One sentence on what the mapping revealed or changed: what did seeing the whole flow
  make visible that you could not have seen by jumping straight to Feature 1?

What the description must NOT say:
- "I created a user flow diagram to map out the experience." That is a deliverable, not a
  decision. The artifact is not the point — the reasoning behind doing it first is.
- Anything that lists the steps in the flow. The reader is not interested in the shape of
  the flow; they are interested in why mapping it first changed what you designed.
- "I used Figma to map out the flow." Tool names are filler here.

On placement: after Goals, before Ideation is correct. Goals establish what is being
solved; the flow slide establishes how the solution space is organized; Ideation shows the
first specific decision. The sequence is: "here is why" → "here is the structure" →
"here is the first choice." That holds.

One non-negotiable constraint: this slide needs a real image to earn its place. An empty
slot with a caption placeholder reads as a gap, not a feature. A recruiter who lands on a
blank slide with a label label will not stop to appreciate the rationale in the body
text — they will register "unfinished" and move on. The asset must be added in edit mode
before this deck goes to any target company. An empty flow-slide is worse than no
flow-slide. Flag this loudly.

---

## 4-Minute First Impression

The cover description is now correctly framed: doctors were using it, the tool couldn't
keep up, the challenge was adding more without overwhelming. That is a sharp, specific
setup and it earns the read.

The research quotes slide is the strongest single slide in the deck. Four quotes, four
specialties, one framing line that flips the expectation: "they weren't complaining about
the report existing — they were working around everything it couldn't do." That sentence
does the intellectual work of the whole problem section in one beat. The rest of the deck
needs to match its clarity.

The Ideation slide is doing real work. Showing a rejected direction — and naming exactly
why it fails mechanically — is the clearest seniority signal in this presentation. Most
designers at this level either skip the exploration entirely or show two options without
explaining the choice. This slide names the mechanism of failure ("edit in one place,
check the result in another") and connects it to the design goal ("control lives on the
thing it changes"). That is decisive, and it is the kind of reasoning that survives the
round-two panel interview.

The Outcomes slide is the deck's biggest vulnerability. Four directional labels — Faster,
Clearer, Higher, Wider — with no figures. For a recruiter reviewing this for a SaaS
product company, no outcome numbers reads as "I don't know if it worked." The caveat
at the bottom ("early-access signals, not final measurements") is honest and appropriate,
but a caveat on a blank canvas is still a blank canvas. The Goals slide defined four
measurable KPIs; the Outcomes slide should echo at least one of them with a directional
figure, however small the sample.

What I would remember at candidate 12: the edit-in-place decision, and "the decisions
I'd change weren't mistakes — they were sequencing problems." What I would forget: the
outcomes.

---

## Role & Level Signal

This work signals mid-to-senior. The decision-making language is consistent — "I built
both directions," "I replaced," "I added two tools" — and avoids the passive drift that
marks junior writing. The reflection is specifically Senior: scoped annotation too late,
involved engineering too late on permissions. Those are named failures with consequences,
not platitudes. They are credible.

The gap holding this back from a confident Senior read is the outcomes. A Senior designer
at a SaaS company is expected to have defined success criteria, tracked something, and
reported it — even as qualitative patterns from an early cohort. The current outcomes
slide reads like the project ended at handoff.

Company type this signals: B2B SaaS product pod, growth stage. The clinical context is
doing its job as credibility, not as a niche. The problems — blank starting states,
annotation tools, permissions and sharing — translate directly to any document-heavy B2B
workflow. A hiring manager at HR tech, legal tech, or ops tooling will recognize the
pattern without needing dental-domain knowledge. That transfer is legible.

---

## Red Flags

- Outcomes have no quantifiable signal. "Faster," "Clearer," "Higher," "Wider" without a
  single figure — even approximate, even from a small early-access cohort — reads as a
  measurement gap. The Goals slide defined four KPIs. The Outcomes slide should connect
  back to them. Directional numbers with an explicit caveat are infinitely more credible
  than directional adjectives.

- The user-flow slide, if added with an empty image slot, becomes a screen-out risk. A
  blank slide in a live portfolio reads as unfinished work. The asset must be in place
  before this deck circulates.

- Timeline says "2025" only. No duration, no phase scope. A Senior candidate's case study
  shows engagement scale — one quarter, six weeks, a focused sprint. "2025" tells a
  recruiter nothing about how much this person held at once.

- Role title says "Product Designer" with no seniority qualifier. The evidence in this
  deck reads Senior. The title does not. At companies where leveling is explicit, a
  candidate who lists "Product Designer" and interviews for Senior starts at a framing
  disadvantage.

- Research volume is unspecified. "I interviewed doctors across four specialties" is
  strong framing, but no participant count is given. A five-character addition carries a
  meaningful seniority signal.

- No constraint navigation is visible. Timeline pressure, scope decisions, engineering
  pushback — none appear in the body of the deck. The reflection hints at one (annotation
  scoped too late), but the arc of the work presents as friction-free until the end. For a
  Senior target at a mid-size company, showing one real constraint and how it was navigated
  would close the remaining gap between this deck and an unambiguous Senior read.

---

## Green Flags

- The Ideation slide is the strongest process-evidence slide in the portfolio. A rejected
  direction with a clear mechanical reason for rejection, an accepted direction tied back
  to the goals — this is what Senior process evidence looks like on a single slide.

- Research quotes are specific and credentialed. Four named specialties, anonymized
  doctors, framing that positions them correctly: not abandonment signals, but friction
  signals. The analytical maturity of that reframe is visible.

- Goals connect directly to research findings. The goals description says every goal maps
  to a limitation doctors named in research. When you read back through the quotes, that
  is true — the chain is auditable. Most portfolios declare goals without grounding them.
  This one shows the derivation.

- Reflection names real sequencing failures. "I scoped annotation too late" and "define
  sharing permissions with engineering earlier" are specific enough to be credible. Generic
  reflections are a red flag. These pass the specificity test.

- Voice is consistent and owned. First person throughout, decision-language without
  arrogance, no passive drift, no process jargon. The writing sounds like a designer who
  made real decisions, not one who followed a methodology.

- "Show, don't describe" is explicit and demonstrated. The designer names this principle
  on the annotation slide and it is actually enacted in the ideation decision (in-place
  editing over a sidebar preview). That level of conceptual coherence across the deck is
  not common.

- The testimonial is contextualized. "Feedback collected during the iTero early access
  program, before full rollout" converts a quote into a data point with a defined scope.
  Without that sentence the testimonial is an endorsement. With it, it is a validation
  signal.

---

## Level Calibration

Realistically supporting: L4 strong to L5 borderline.

The thinking earns L5. The packaging does not confirm it. The gap is almost entirely on
outcomes and framing — not on the quality of the design decisions made.

What would push this to a confirmed L5 read:

1. One quantified outcome with a shape — a completion rate delta, a session time figure,
   a sample count. The Goals slide defined four KPIs. The Outcomes slide should echo at
   least one of them with a directional figure and an explicit scope caveat.
2. A real project timeline with duration and scope, not just a year.
3. Ideation updated to say "tested with users" rather than "compared" — this is a
   confirmed fact and a pure writing fix.
4. The user-flow slide asset filled before the deck circulates.

None of these require new design work. They are framing and presentation fixes. The
underlying work is more sophisticated than the cover slide represents. The deck is
underselling.

---

## Culture Fit Profile

Best fit: focused product pod (2-4 engineers, 1 PM, 1 designer) at a mid-size B2B SaaS
company. Design culture is established but not bureaucratic. The designer owns a workflow
surface end-to-end — from research through delivery through measurement.

The Goals slide (KPIs defined before design began) and the reflection ("defining KPIs
before design kept every decision tied to an outcome") both signal a designer who builds
their own structure when none is given. That is a growth-stage instinct. It will not
survive in a large enterprise org where the sign-off chain matters more than the user data
and where "internal reviews weren't enough" is not a defensible conclusion to put in a
portfolio.

The clinical background is being used correctly — as proof of high-stakes, complex UX
judgment, not as a niche to stay in. A hiring manager at a non-clinical SaaS company will
follow the reasoning without needing dental domain knowledge. That positioning is working.

Would struggle in: agency environments (no product ownership arc), large-enterprise orgs
with heavy approval chains, any role where the designer is primarily a visual executor
rather than a problem framer.

---

## Would You Advance Them?

Yes — with one condition: the outcomes slide needs at least one signal with a concrete
shape before this deck goes to any target company, because that is the first question in
a round-two panel and the deck currently has no answer.

---

## Recruiter Verdict: Advance

The single deciding factor is the Ideation slide — showing a rejected direction with a
clear mechanical reason is the one thing that separates this deck from the others reviewed
this week, and it is enough to advance.

---

> **Flag for UX Reviewer:** The three feature slides (Templates, Annotation, Share) all
> use the `problem` / `textAndImage` template with a "How it works" bullet structure.
> The annotation slide in particular describes a multi-tool interaction model (pen, tooth
> chart, markers) in four bullets. Worth confirming whether the existing video asset is
> carrying that interaction weight or whether the surrounding text needs to cue the viewer
> on what to watch for — four bullets about a complex interaction tool without that cue
> risks reading as a feature list rather than a design decision.
>
> **Flag for Director:** "Fix the defaults professionals shouldn't have to manage" is the
> designer's positioning statement — it appears on the end slide and is implicit in every
> feature decision. A recruiter encounters it for the first time at the last slide, where
> it reads as a summary rather than a frame. Moving one clause of this philosophy into the
> cover or problem framing (the old tool made professionals manage its own limitations;
> the redesign removes that burden) would turn the end slide into a resolution of an
> established theme rather than a standalone declaration. That is one sentence change with
> significant narrative payoff. Also: the intro's `headlineMetric` field is unused. If any
> directional figure from the early-access cohort is available, it belongs in the first
> 6 seconds of the read — that is the highest-leverage unused real estate in the deck.
