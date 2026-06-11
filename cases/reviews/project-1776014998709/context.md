## Facts to use

### CORE PROBLEM REFRAME (highest priority — fixes a deck-wide inconsistency)
The designer has corrected the framing. The OLD framing ("doctors were skipping the report")
is WRONG and must be removed everywhere it appears (currently the intro/cover says "skipping").
The real story, in the designer's words:

> "The doctors weren't skipping the report — they were using it. It just wasn't built with
> enough functionality and wasn't clear for them, and the layout took a lot of attention
> instead of focusing on what's important. So the challenge was to understand how to add more
> functionality without overwhelming the doctors."

Apply this as the spine of the deck:
- Doctors WERE using the report (adoption was never the problem — this now matches the
  "Limited by design" slide, which already says exactly this; the intro currently contradicts it).
- The real problems: (1) too little functionality, (2) it wasn't clear, (3) the layout pulled
  attention away from what mattered (the findings).
- **The central challenge = add more functionality WITHOUT overwhelming the doctor.** This is
  the through-line: it's exactly what the Ideation decision (edit-in-place, not a heavier
  sidebar) and Templates (structure, not a blank page) each solve. Reviewers/editor should make
  this challenge explicit (intro and/or Problem) and let it tie the feature slides together.
- Reconcile the research quote "I just skip the report most of the time. It takes too long"
  (Dr. A): it is one data point about the friction/clarity, NOT evidence of wholesale
  non-adoption. Keep the quote (designer's real research) but do not let it drive a "skipping"
  narrative. If it clashes too hard with the reframe, the agents may recommend softening the
  surrounding framing — but never rewrite the quote's meaning.

### CONFIRMED: Ideation user testing
The designer confirms: **user testing was done on the two options.** So the Ideation description
SHOULD say the two options were put through user testing (not just "compared"). This resolves the
prior open verify item — "was it tested?" → yes, user testing of the two options. Still do NOT
invent a participant count; if no number is known, keep it as "user testing" without a figure.

### THIS PASS — two structural changes the designer has decided
**A. Merge the two problem slides into ONE.** The deck currently has Slide 1 "The Problem"
AND Slide 2 "Why it needed a redesign / Limited by design." The designer asks: what's the
difference? — there isn't a meaningful one; they are the same beat (the problem + why a
redesign was warranted), split across two slides. **Combine them into a single problem slide.**
Keep the strongest framing from each: doctors WERE using it but hit a ceiling (too little
functionality, unclear, the layout pulled attention); the real limits (no templates, no
modular blocks, nowhere to annotate); and the sharpest highlight (the problem-framing one,
e.g. "designed around the software, not the doctor"). Drop the duplicate bullets. Keep the
old-UI image. Then REMOVE the now-empty second slide. Result must stay within the problem
word budget — trim hard, keep only the sharpest sentence per point.

**B. Add a USER-FLOW slide (textAndImage) right AFTER the Goals slide.** This REVERSES the
earlier "cut the flow slide" verdict — the designer has given it a real rationale that earns
its place: *because the redesign adds new features and templates, the designer started by
MAPPING THE USER FLOW — to understand how to organize everything before designing and testing
it.* So it is a genuine design-process beat (how the solution was structured), not a planning
artifact. Build it as a `textAndImage` slide:
- placed immediately after Goals, before Ideation;
- `content`/description explaining the flow-mapping step in the designer's words: before adding
  features and templates, I mapped the full report flow to work out how to organize it — so the
  structure was right before I designed and tested the pieces;
- an EMPTY captioned image slot for the flow diagram: `"src": ""`, caption
  `"[ASSET: user-flow map — add in edit mode]"`;
- first-person, within the textAndImage budget; no fabricated specifics.
Reviewers: judge the best label/title, exact placement, and whether it sits before or after
Ideation in the arc — but the designer has decided it goes in.

### Ideation slide (Slide 4, `directions`) — the REAL difference between the two options
The designer explored two editor directions AFTER defining the goals. The real difference
is WHERE you edit — not how many sections each has. Show exactly TWO directions
(`directionCount: 2`), grounded only in the mechanics below. The designer's own words:

> "Option 1 = you edit from the sidebar selection itself, not on the images. All the
> editing controls are in the sidebar, not on the main panel of images — so the problem was
> there wasn't a connection [between the controls and the content]. Option 2 = you can edit
> from the images right away, the stuff right away."

What the screenshots actually show (transcribed for the agents, who can't see chat images):

- **Direction 1 — edit from the SIDEBAR (REJECTED).** The main canvas is a read-only-looking
  report PREVIEW (logo, the patient/doctor/clinic header, the image cards with tooth pills
  underneath). To change anything you go to the left rail — a "Content" list of sections
  (Image 1 ›, Image 2 ›) that you open and edit *there*. The editing controls live in a
  separate panel from the image they affect. The disconnect: you edit in one place (sidebar)
  and see the result somewhere else (the preview) — the control is not on the thing it changes.
- **Direction 2 — edit ON the content, in place (ACCEPTED — the designer's preferred "second
  option").** Each section is editable directly in the main canvas: the image carries
  **Annotate / Replace** controls right on it, tooth tags (14 ×, 24 ×, + Add), a Title field
  and a Notes field sit immediately beneath that same image. You annotate, tag, title and
  note the finding right where you're looking — the control sits with the content it changes.

**Do NOT pre-decide the rationale for the agents.** Give them these mechanics and let them
analyze, in their own words, WHY editing-in-place (Direction 2) beats sidebar-editing
(Direction 1) — e.g. direct manipulation, editing in context, fewer steps, no mental mapping
between a control and a separate preview, and how it ties back to the deck's goals
("make findings visual / show, don't describe"). Direction 2 is the accepted one.

The designer also wants the **description line under the Ideation title** (the `directions`
template supports a `description` field that renders as an intro under the title) to narrate
the PROCESS: after the goals, two directions were built and compared, and the second
(edit-in-place) was preferred and taken forward. First-person, concise. Do NOT invent a
participant count or formal study — "the majority preferred it" is the designer's own claim;
phrase it without a fabricated number and keep it on the verify checklist (who / how tested).

## Open decisions for THIS pass (agents must each decide, with reasoning)

1. **Is the "redesigned report" media slide redundant?** Last pass added a `media` slide
   ("The redesigned report") right after Ideation as an establishing shot, and the very next
   slide (Templates & Sections) also shows the new report. Decide: do we NEED the media slide,
   or does it just repeat what the following slide already shows? If redundant, remove ONE of
   them — say which and why. (Reach your own verdict; "keep both, here's why each earns its
   place" is valid, and so is "cut the media slide.")

2. **Do we need BOTH "the redesigned report" (the overall-redesign payoff) AND "Templates &
   Sections"?** What is the real difference between them? If the redesign slide and the
   templates/sections slide are doing the same job, we may not need both. Decide and name the
   distinction, or recommend merging/cutting.

(Note: these two questions overlap — the underlying concern is whether the establishing/payoff
slide duplicates the feature slide that follows. Resolve it cleanly and consistently.)

## Wondering whether to add

Slide-by-slide descriptions

Problem slide
Description to add under title:

Doctors were using the report — but the tool kept getting in the way. No templates, no building blocks, nowhere to annotate. They made it work with what they had.


User Research / Quotes slide
Description to add under title:

I interviewed doctors across four specialties. They weren't complaining about the report existing — they were working around everything it couldn't do.


Design Goals slide
Description to add under title:

Every goal maps directly to a limitation doctors named in research. Nothing here was assumed upfront.


Ideation / Directions slide
Description to add under title:

I built two editing directions and tested both with the same task — same content, different model. The gap was obvious. One asks the doctor to edit in one place and check the result in another. The other puts the control on the thing it changes.


Templates & Sections slide
Description to add under title:

Doctors were building every report from scratch — same procedure, blank page every time. Templates fix that default. The structure is ready before they open it.


Annotation & Tooth Chart slide
Description to add under title:

Doctors were describing findings in text next to images that showed them clearly. I added two tools to close that gap — so findings are marked, not explained.


Share & Export slide
Description to add under title:

The old tool had three isolated sharing buttons with no logic connecting them. I replaced it with a deliberate flow that treats delivery as part of the report, not a step after it.


Outcomes slide
Description to add under title:

These are directional signals from the early access group. Quantitative targets are defined and being tracked post-rollout — the results here reflect pattern, not final measurement.


Reflection slide
Description to add under title:

The decisions I'd change weren't mistakes — they were sequencing problems. Things I scoped too late or validated with the wrong people.



Expansion text — new slide
Label: "Why it needed a redesign"
Title: "Limited by design, not by use"

Doctors were using the patient report. The problem wasn't adoption — it was ceiling.
The tool supported one thing well: dropping in scan images. Everything else had to be improvised. No templates, no modular building blocks, no annotation tools. Doctors who wanted to show a cost breakdown, walk through a treatment plan, or mark a finding on an image had no way to do it. They either described it in plain text or left it out entirely.
The redesign doesn't replace how doctors were using the report — it extends what they can do with it. Templates give them a structured starting point matched to the procedure. Modular blocks — image, before/after, clinical details, cost, notes — let them build the report the patient actually needs. Annotation tools mean findings get shown, not just described.
The old tool had a hard limit. The new one removes it.


Structural note
Cut the Before/After layout slide — same reasoning as before, still holds. The Problem slide already shows the old UI. Showing it again in a comparison wrapper restates something the reader already has.
After Ideation, go straight into the new report as the payoff. Then Templates, Annotation, Sharing as feature-level proof.

Problem → "Limited by design" expansion → Research → Goals → Ideation → New report → Templates → Annotation → Sharing → Testimonial → Outcomes → Reflection
