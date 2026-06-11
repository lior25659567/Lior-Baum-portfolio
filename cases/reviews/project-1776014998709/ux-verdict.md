# UX Verdict — Patient Report Redesign
`project-1776014998709` · This pass supersedes the prior verdict.
Target: Senior Product Designer, B2B SaaS (per `_designer-profile.md`)
Grounded in the updated `context.md` — structural changes A and B are designer-decided; this verdict addresses them from a craft and IA lens.

---

## THIS PASS: Two Structural Decisions

### A. Merge Slide 1 ("The Problem") + Slide 2 ("Limited by design, not by use") into ONE problem slide

**Is there a meaningful difference worth keeping them separate? No.**

Read both back to back and the conceptual territory is identical. Both say: doctors were using the report (adoption was not the problem), the ceiling was the problem, and specific structural gaps created that ceiling. Slide 1 names four failure modes via bullets; Slide 2 reframes the diagnosis in prose and adds a different set of bullets. These are not two distinct ideas — they are the same beat, restated with different words.

The split also creates a structural reading problem. Two consecutive slides making the same argument signal editorial indecision, not depth of analysis. A reader can hold one tight problem frame. Two dilute it.

**The merge analysis — what each slide contributes:**

Slide 1 owns:
- The best title: "A blank page after every appointment" — concrete, visual, specific. Keep.
- The old-UI image (img-i06atssrj0.webp) — the only before-state visual in the deck. The image shows the three-panel layout, blank content area, sidebar, and QR-only sharing. This is load-bearing evidence. Keep.
- The strongest highlight: "Built around the software — not the doctor using it." This is a design indictment, not a feature observation. Keep.
- Useful bullets: sidebar locking 25% of screen, no templates, unreadable PDF output. Keep three of the four.
- Weakest bullet: "Raw scan images with no annotation tools" — this belongs in the Annotation feature slide, not the problem framing. The problem is the ceiling; annotation is one feature response. Cut it from the problem slide.

Slide 2 owns:
- The best single-sentence summary of the ceiling: "It did one thing well — hold scan images. Everything else had to be improvised." This is sharper than anything in Slide 1's `content` field and should replace it.
- The `content` framing: "Doctors were using the report. The problem wasn't adoption — it was the ceiling." This directly fixes the intro's prior "skipping" error and should lead the merged slide. The confirmed reframe lives here.
- One additional bullet worth keeping: "No modular blocks — no cost breakdown, no before/after, no treatment plan." This is more specific than any Slide 1 bullet about the capability gap.
- The weakest bullets from Slide 2: "It did one thing well — hold scan images. Everything else had to be improvised" belongs in the `content` sentence, not a bullet. "Doctors worked around the gaps or left things out entirely" is a consequence description, not a named failure — fold it into prose or cut it.
- Slide 2's highlight: "The redesign removes the limit — not how doctors worked." This is a solution promise, not a problem diagnosis — it belongs on the Goals or Ideation slide, not the problem statement. Cut from the merged slide.

**Draft content for the merged slide (within the ~75-word budget):**

```
label:      The Problem
title:      A blank page after every appointment
content:    Doctors were using the report. The problem wasn't adoption — it was
            the ceiling. The tool did one thing well: hold scan images.
            Everything else had to be improvised.
issuesTitle: Where it failed
issues:
  1. Sidebar locked doctor info into 25% of the screen
  2. No templates — reports started blank
  3. No modular blocks — no cost breakdown, no before/after, no treatment plan
  4. PDF output unreadable by patients
highlight:  Built around the software — not the doctor using it.
image:      img-i06atssrj0.webp
caption:    Old UI — sidebar-locked editing, blank content area, QR-only sharing
```

That is four bullets, two `content` sentences, and the sharpest highlight. Total on-screen prose: approximately 65–68 words. Within budget. The old-UI image anchors the claims visually — each of the four bullets is visible in the composite screenshot.

**One improvement to the image caption:** The current caption reads "Old — three-panel split, static sidebar, blank content area." The composite image also shows the QR sharing modal. The caption undersells what the image contains. Revised: "Old UI — sidebar-locked editing, blank content area, QR-only sharing." All four problem bullets are now accounted for either in the text or the image.

**What this structural change solves beyond word count:** The merged slide tells a complete causal story in one frame — doctors were in, the tool was the limit, here are the four hard limits, each one mapping to a subsequent feature slide. The narrative thread is explicit: sidebar → Goals "give the canvas back"; no templates → Templates slide; no modular blocks → Templates/sections slide; unreadable PDF → Sharing slide. The second slide was diffusing that thread.

**Execution instruction:** Merge the content as described above into Slide 1 (keep the index, keep the image). Then remove Slide 2 entirely. The remaining slides renumber.

---

### B. Adding a User-Flow Slide (textAndImage) After Goals, Before Ideation

**Does the confirmed rationale earn its place as a process beat? Yes — conditionally.**

The earlier "cut" verdict was the right call given what was known: a user-flow diagram shown without a stated reason is a planning artifact, not a portfolio beat. It communicates deliverable, not thinking.

The confirmed rationale changes the case. The designer mapped the full report flow specifically to figure out how to organize the new features and templates BEFORE designing and testing them. This is not a record of discovery — it is a structural decision: "the redesign adds multiple intersecting features; before I design any of them I need to know where each one lands in the flow." That is a Senior-level sequencing move. Scoping the structure before designing the pieces is the kind of decision a Director would look for evidence of.

The slide earns its place on one condition: the image slot must be filled. A slide that says "I mapped the flow before designing" without showing the map is a claim, not evidence. If the asset cannot be added before the deck ships, the slide should not ship either.

**Placement: after Goals, before Ideation — correct.**

The narrative position is right and I would not move it. Goals establishes what you set out to fix. Ideation shows the first design decision (how to structure editing). The user-flow slide sits between them as the organizing step that made Ideation possible: before I could design how editing works, I needed to know what the doctor does in sequence and where each feature sits. This is a bridge, not a detour.

If placed AFTER Ideation it reads backward — you mapped the flow after deciding the editing model. If placed before Goals, it reads as research-adjacent synthesis, which is not what it is. The Goals → User Flow → Ideation sequence is: "here's what I wanted to achieve → here's how I organized the solution space → here's the first design decision within that space." That arc is clean and followable.

**Proposed slide content (first-person, textAndImage template, within ~75-word budget):**

```
type:       problem   (textAndImage template, type alias)
label:      Process
title:      Mapping the report before designing it
content:    The redesign adds multiple features — templates, annotation, modular blocks,
            sharing. Before designing any of them, I mapped the full report flow to work
            out how everything fits together. The structure had to be right before I
            could design and test the individual pieces.
highlight:  Structure first. Features second.
image:      [ASSET: user-flow map — add in edit mode]
caption:    Full report flow — mapped before feature design began
```

Approximate on-screen word count: 60 words. Within budget.

**Label choice:** `"Process"` signals this is a design-process beat, not a deliverable or UX artifact. Alternative: `"User Flow"` is more literal and tells the reader exactly what they are looking at. I recommend `"Process"` — it frames the intent (a design decision was made here) rather than naming the output. If the image makes the flow diagram self-evident, `"Process"` is the better label.

**Title rationale:** "Mapping the report before designing it" is first-person, action-oriented, and explains the decision without jargon. It tells the reader what happened and implicitly why. Stronger than any variant of "User Flow Diagram" or "Flow Mapping," which describe the output rather than the reasoning.

**Highlight rationale:** "Structure first. Features second." states the principle behind the step in five words. It echoes the deck's through-line (add more without overwhelming) and gives the reader a frame for why this slide exists. Do not use "I mapped the flow to understand the journey" — that is process-checklist language.

**One thing the slide must NOT do:** Describe the flow's contents as if they are the point. The flow diagram is evidence of a process decision; the text should explain the decision, not narrate the diagram. What the map revealed (how the features organize, what the sequence is) can be implied. What the slide must communicate is why the mapping step was taken.

**Conditional flag:** If the image slot is empty when the deck is shown to a recruiter, this slide actively hurts rather than helps — it claims rigor without showing it. The designer should add the asset in edit mode before distributing the deck. Until then, the slide should not be included.

---

## Open Decisions from context.md

### Is the "redesigned report" media slide redundant? (and: do we need both it AND Templates & Sections?)

**Verdict: Cut the media slide. Keep Templates & Sections.**

These two questions overlap and resolve the same way. The media slide ("The redesigned report") would show the new UI as an establishing shot. The Templates & Sections slide (currently Slide 6 after renumbering, Slide 7 before merge) shows the new UI in active use via a video, plus explains the structural logic. One slide does the job of the other and does it better.

The more important argument: a standalone media slide stalls the narrative at exactly the wrong moment. Ideation closes with "direction decided." The reader expects the next beat to be a payoff — not an establishing shot but the first demonstration of what the accepted direction looks like in practice. Templates & Sections is that payoff. An empty establishing slide inserts a pause between the decision and its resolution.

The one scenario where a media slide earns its place: if the complete redesigned report, as a whole, shows something the individual feature slides cannot — a high-altitude view of the full new layout that establishes the visual context before the reader zooms into individual features. Looking at the available images (img-1kpvq4sizhc.png and img-324afqhug8.png), both already appear in Ideation and/or the feature slides. No unique information is added by a standalone media slide.

**Result:** Remove the media slide. The post-merge, post-removal sequence is:

`Problem (merged) → Research/Quotes → Goals → User Flow → Ideation → Templates → Annotation → Sharing → Testimonial → Outcomes → Reflection → End`

This is a clean, justified arc. Every slide has a distinct job.

---

## Problem Framing Quality
Score: 7/10

The merged problem slide will be the strongest version of this beat the deck has had. The "ceiling, not adoption" reframe is correct and is now explicitly stated in the `content` field. The four bullets each map to a subsequent feature slide. The old-UI image is the one piece of visual evidence that makes the claim real.

What prevents a higher score: the problem slide does not name the central design challenge that the context.md identifies as the through-line — how do you add functionality without overwhelming the doctor? That constraint is the reason every design decision in this deck lands the way it does (in-place editing over a heavier sidebar, structured templates over a blank page, a sharing modal over three isolated buttons). Without it being stated explicitly somewhere near the problem, the feature slides read as a feature list rather than a coherent answer to a single design problem.

The appropriate place to surface it: one additional sentence in the Goals slide `description` field. "The constraint every goal had to respect: add more without adding to the doctor's cognitive load." That is the spine of the deck stated once, in the right place, without requiring a new slide.

---

## Research Rigor
Score: 6/10

Four quotes from four named specialties covering four distinct failure modes (time cost, explanatory gap, annotation absence, structural inconsistency) is credible breadth. Each quote maps to a subsequent design goal — the traceability is there, even if it is not explicitly drawn on screen.

The research highlight — "These problems had gone unreported — doctors assumed it was just how the tool worked" — is the sharpest finding in the deck. It names a systemic normalization of friction that explains why a broken tool survived in production. This is a real insight, not an obvious observation.

What holds this at 6: no participant count, one method named (interviews), no analytics or usage data referenced, no visible synthesis step. The jump from four quotes to four design goals is clean but the inferential step is invisible. Adding "I interviewed [N] doctors" in the quotes slide `content` field is a one-word addition that anchors the research claim.

---

## Synthesis & Insight Quality
Score: 6/10

The sharpest insight is in the right place (research slide highlight) but does not carry forward. "Doctors normalized the friction — they assumed it was just how the tool worked" implies the entire design framing: raise the ceiling of what doctors believe the tool can do. That principle drives every feature decision. But it is stated once, in a small highlight chip at the bottom of one slide, and then dropped.

The second-best insight is on the Ideation slide: "The control lives on the thing it changes — no context switch." This is a design principle derived from observation, stated in plain language. It earns the decision.

What would elevate this section to a 7 or 8: a one-sentence connection on the Goals slide between the research finding and the design constraint. "Doctors had stopped expecting more — every goal here was about exceeding what they'd accepted as the limit." That turns the goals from a task list into the output of a design inference.

---

## Design Decision Depth
Score: 7/10

The Ideation slide is the clearest seniority signal in the deck. Two directions with a real mechanical distinction, one accepted and one rejected, with a stated reason grounded in how doctors work (editing in one place, checking in another = context switch = friction). The image content confirms it: img-1te5c1kqfg.png shows the accepted direction in practice — Annotate/Replace controls on the image, tooth tags inline, Title and Notes immediately beneath. This is evidence, not description.

The reflection slide supports the seniority read: "I scoped annotation too late, triggering a full rework after the first feedback round" is a specific failure, named precisely. That is what Senior-level self-awareness looks like.

What holds this at 7: no iteration evidence in the design section. The reflection admits a full rework of annotation, but the deck goes from Ideation directly to three polished feature slides. The loop between "accepted direction" and "finished design" is invisible. Where did V1 of annotation fail? What specifically changed? One sentence in the Annotation slide would answer this. Without it, a Director will ask in the interview and the deck offers no support.

---

## Craft Quality
Score: 7/10

The images do genuine work. img-i06atssrj0.webp shows the old three-panel UI with sidebar, blank content area, and QR modal — direct evidence for the four problem bullets. img-1kpvq4sizhc.png shows the full new report with template picker, annotated scan images, and tooth markers — proof of the accepted direction. img-1te5c1kqfg.png shows in-place editing in practice, with controls sitting directly on the image they affect. img-186j8andvk.png shows the sharing modal with email, access levels, PIN toggle, and delivery icons. The work looks real and complete.

Writing is consistently first-person, specific, and decision-owning. No passive constructions, no process-checklist language. The Sharing slide description ("delivery as part of the report, not a step after it") is a design principle in plain English.

Weaknesses: the rejected Ideation direction has no image — text-only comparison for the rejected path reads as description rather than evidence. If a wireframe or annotated screenshot of the sidebar-editing model exists, it belongs here. Also: the end slide has no contact information — the CTA ("Get in touch") has no destination. Email and LinkedIn fields in the `end` template are unused.

---

## Impact Evidence
Score: 5/10

The outcomes slide is honest about its limitations, which is the right call for pre-rollout data. "Early-access signals, not final measurements" is a mature framing and signals a designer who understands the difference between directional evidence and measured outcomes.

What weakens this section: "Faster," "Clearer," "Higher," and "Wider" are directional adjectives with no baseline, no delta, and no sample size. For a hiring manager reading fast, these read as "things went well" with nothing to hold onto. The testimonial (Dr. Haddad) is the one piece of qualitative outcome evidence that has a named source and program context — it is appropriately placed and appropriately scoped.

The goals slide defines four KPIs. The outcomes slide addresses roughly the same four areas but never maps back to those KPIs. The success criteria and the results float independently, making the KPIs feel decorative. Aligning outcome card titles to KPI language — or adding a brief parenthetical — would close that loop and demonstrate that the designer tracked what they said they would track.

---

## Template Fit & Structure

**Per-slide assessment (post-merge, post-removal sequence):**

| Slide | Type | Verdict |
|---|---|---|
| 0 | `intro` | Correct. `headlineMetric` field unused — even one early-access signal (e.g. "4 specialties · early-access program") belongs here for the 6-second scan. Timeline "2025" carries no duration; add quarter or project length. |
| 1 | `textAndImage` (problem) | Correct. Post-merge content is clean and within budget. |
| 2 (was 3) | `quotes` | Correct. Four quotes, four specialties, each a different failure mode. Strongest highlight in the deck. |
| 3 (was 4) | `goals` | Correct. KPIs section is a Senior signal — pre-design success criteria defined. `description` field should carry the through-line ("add more without overwhelming"). |
| NEW | `textAndImage` (user-flow) | Add here. See Section B above for full proposed content. Conditional on image asset being filled. |
| 4 (was 5) | `directions` | Correct. Two-direction format matches `directionCount: 2`. The rejected direction has no image — text-only for rejected path is the one craft gap. |
| 5 (was 7) | `textAndImage` (Templates) | Correct. Feature explanation in problem template — documented alias, no mismatch. `issuesTitle` "How it works" reads slightly as a troubleshooting label; consider "What's included" or remove label and let bullets stand alone. |
| 6 (was 8) | `textAndImage` (Annotation) | Correct. Same note on `issuesTitle`. The slide should connect back to Dr. C's specific quote — one sentence referencing "I have no way to circle what I'm talking about" makes the research-to-feature line explicit. |
| 7 (was 9) | `comparison` | Correct. Best-executed template in the deck. `description` field currently unused — "delivery as part of the report, not a step after it" belongs there. |
| 8 (was 10) | `testimonial` | Correct. Named doctor, role, program context. `highlight` field unused — a behavioral observation from early access would ground the testimonial. |
| 9 (was 11) | `outcomes` | Correct for pre-rollout data. The directional-metric approach is the honest choice given the data state. |
| 10 (was 12) | `reflection` | Correct. All required fields populated with specific, non-boilerplate content. |
| 11 (was 13) | `end` | Correct. Email, phone, LinkedIn fields all unused. The CTA ("Get in touch") has no destination — add contact information. |

**Missing beats:**

- **Beat 6 — Iteration Evidence:** The reflection discloses the annotation rework. Nothing in the design section shows it. One sentence in the Annotation slide — what the first version looked like, what doctor feedback changed — would add a credibility layer the current deck lacks. Does not require a new slide.

- **Beat 5 partial — Design Exploration:** The Ideation slide covers one direction decision (editor model). The feature slides (Templates, Annotation, Sharing) have no exploration evidence — why these five template types, why these modular blocks, why the sharing modal scope expanded from three buttons to a full permissions system. Even one sentence per feature slide on the selection rationale would satisfy this.

- **No `info` slide:** For a Senior target, an `info` slide after the cover naming the methodology phases (discovery → goals → structure mapping → direction testing → feature build → early-access validation) would make the process legible before the reader hits the problem slide. Optional but adds seniority signal.

**Slides to remove:**

- **Old Slide 2** ("Limited by design, not by use") — subsumed by the merge. Remove.
- **Media slide** ("The redesigned report") if present — redundant with Templates & Sections. Remove.

---

## Cross-Slide Redundancy & Coherence

**Slides 1 + 2:** Full merge addressed in Section A. Same beat, same argument, one must go.

**"Before they open it" echo — Intro vs. Templates slide:** The intro's prior version said "the hard part is done before they open it." The Templates slide says "the structure is ready before they open it." After the intro is rewritten (the "skipping" error removal), check whether the echo still exists and whether it is intentional. If the intro no longer carries this phrase, the Templates version stands alone cleanly. If both remain, verify the echo is deliberate.

**Outcomes (slide 9) vs. Reflection (slide 10):** Outcome card 3 addresses completion rate with a disclaimer about post-rollout measurement. The reflection's `whatYouCouldntMeasure` field also flags the measurement gap: "Long-term adoption and variability — needs 6+ months of data." These are the same admission from two angles. Keep the reflection version (it is more specific and belongs there); trim the outcomes card to a behavioral observation from early access, not a repeat of the measurement caveat.

**Goals KPIs vs. Outcomes cards:** The four goals KPIs (time to create a report, completion rate, doctor confidence, patient engagement) and the four outcomes (report creation speed, clinical communication clarity, completion rate, reach) map approximately but never explicitly. The reader cannot see the loop being closed. This is not redundancy — it is a missing connection. Aligning language would fix it.

**"These problems had gone unreported" (Quotes slide highlight):** This is the sharpest insight in the deck and it appears only once. No redundancy issue. The flag is the opposite — it deserves more prominence than a highlight chip gives it. Consider whether it belongs in the Goals slide `description` as well, as the motivation behind the decision to solicit feedback directly.

---

## Slide Density (Word Budget)

Per extracted.md counts:

- **Slide 1 (problem) — 80 words vs. ~75 budget:** Over by 5 words. The merge and redraft above targets approximately 65–68 words; this is resolved.
- **Slide 2 (problem) — 76 words vs. ~75 budget:** Moot after removal.
- **Slide 3/quotes — 102 words vs. ~110 budget:** Within budget. No action.
- **Slide 4/goals — 98 words vs. ~100 budget:** Within budget. Dense but acceptable.
- **Slide 5/directions — 85 words vs. ~90 budget:** Within budget.
- **Slide 8/comparison — 111 words vs. ~110 budget:** One word over. One trimmed bullet resolves it (e.g. shorten "Invite by email with ownership and access levels" to "Email invites with access levels").
- **Slide 11/reflection — 98 words vs. ~100 budget:** Every line is load-bearing. No cuts.

No severe offenders. Density is well-managed across the deck. The one density risk is the Goals slide — at 98 words it is at the limit; adding the through-line sentence to the description field will push it over. Either trim one KPI bullet (the fourth, "Patient engagement with shared report," is the weakest — it is an outcome, not a KPI) or trim the `description` field to one sentence.

---

## "Wondering Whether to Add" — Per-Item Decisions

**Problem slide description:** KEEP, with the merged framing above. The confirmed reframe ("ceiling, not adoption") and the one-sentence ceiling description ("The tool did one thing well: hold scan images. Everything else had to be improvised.") come from Slide 2 and belong in the merged `content` field.

**User Research description:** KEEP. "They weren't complaining about the report existing — they were working around everything it couldn't do" is the right level of specificity and replaces the current `content` field verbatim.

**Design Goals description:** KEEP with one addition. "Every goal maps directly to a limitation doctors named in research. Nothing here was assumed upfront." Add a second sentence carrying the through-line: "The constraint every goal had to respect: add more without adding to the doctor's cognitive load." This is the one place in the deck to state the design constraint explicitly.

**Ideation description:** KEEP. "I built two editing directions and tested both with the same task — same content, different model." Change "tested" to "ran user testing on" (the context.md confirms user testing was done — "tested" undersells this). Append: "Doctors consistently chose the second." Keep this on the verify checklist — "consistently" needs the designer's confirmation.

**Templates & Sections description:** KEEP. Already in the live slide and strong. Verify the "before they open it" echo with the intro rewrite.

**Annotation description (context.md version):** KEEP. "Doctors were describing findings in text next to images that showed them clearly. I added two tools to close that gap — so findings are marked, not explained." This is the strongest proposed copy in the set. Replace the current `content` field verbatim.

**Share & Export description:** KEEP. "The old tool had three isolated sharing buttons with no logic connecting them. I replaced it with a deliberate flow that treats delivery as part of the report, not a step after it." Add this to the unused `description` field on the comparison slide — it explains the scope expansion from three buttons to a full modal, which the slide's text currently never explains.

**Outcomes description:** KEEP. "These are directional signals from the early access group. Quantitative targets are defined and being tracked post-rollout — the results here reflect pattern, not final measurement." Use this as the `highlight` field content on the outcomes slide. Tighten to: "Early-access signals, not final measurements. Quantitative targets are defined and tracked post-rollout." Shorter, same weight.

**Reflection subtitle:** KEEP the addition. Current subtitle: "The decisions I'd change weren't mistakes. They were sequencing problems." Proposed addition: "Things I scoped too late or validated with the wrong people." This second sentence makes the subtitle specific rather than philosophical — keep it. The full proposed subtitle from context.md is the right version.

**"Limited by design" expansion text (the three-paragraph body):** CUT. This is document-length prose (~150 words) that cannot fit the ~75-word canvas budget. Every meaningful insight it contains is already captured in the merged problem slide or the goals through-line sentence. Extract nothing new from it; the argument is covered.

**Structural note / cut the Before/After UI layout slide:** CONFIRMED. Already addressed — media slide removed. The problem slide's old-UI image is the only before-state the deck needs.

**Proposed beat order:** The recommended sequence in context.md (Problem → research → Goals → Ideation → new report → Templates → Annotation → Sharing → Testimonial → Outcomes → Reflection) is correct, with two modifications: (1) the "new report" establishing shot (media slide) is removed per the open decision above; (2) the User Flow slide is added between Goals and Ideation per Section B. Final sequence:

`Problem (merged) → Research/Quotes → Goals → User Flow → Ideation → Templates → Annotation → Sharing → Testimonial → Outcomes → Reflection → End`

---

## What Makes This Stand Out

Two genuine strengths that most designers at this level do not show:

**1. The Ideation slide is real design thinking made visible.** Two actual directions, a clear mechanical distinction, one accepted and one rejected — with a stated reason grounded in how doctors work. The images support it: img-1te5c1kqfg.png shows the accepted direction in practice, with Annotate/Replace controls directly on the image they affect, tooth tags inline, Title and Notes immediately beneath. That is proof, not description. Most portfolios show one final solution and retroactively call it a choice. This one shows the fork and explains the path.

**2. The outcomes honesty.** "These are early-access signals, not final measurements" is a senior move. A junior designer inflates partial data or omits outcomes. Claiming uncertain data while explaining what is tracked post-rollout is the behavior of a designer who understands product maturity — and it reads that way.

---

## What Would Make This Much Stronger

**1. State the through-line explicitly — once.**
"Add more without overwhelming the doctor" is the best design insight in the deck and it is currently nowhere on screen. It is the reason the Ideation decision rejected the heavier sidebar. It is the reason Templates provide structure rather than more choices at runtime. It is the reason the sharing modal wraps three isolated buttons into a coherent system. One sentence in the Goals slide `description` field: "The constraint every goal had to respect: add more without adding to the doctor's cognitive load." This turns a feature showcase into a design argument.

**2. Connect the Goals KPIs to the Outcomes.**
The deck defines four measurable targets (Goals slide) and reports four results (Outcomes slide). They should map visibly onto each other. Right now they float independently and the Goals KPIs feel decorative. Aligning outcome card titles to KPI language — or adding one parenthetical per card — shows the designer tracked what they said they would track. This is the difference between "I defined success criteria" and "I closed the loop."

**3. Show one iteration moment in the design section.**
The reflection admits a full annotation rework triggered by feedback. That story is real and belongs in the design section, not hidden in the retrospective. One sentence in the Annotation slide — what the first version looked like, what changed — adds an iteration layer the deck currently lacks. Without it, three polished feature slides and an Ideation decision create an impression of a linear process that any Senior hiring manager knows is not how design works.

---

## Overall Craft Score: 7/10

## Seniority Signal: Mid / approaching Senior

The Ideation slide and Reflection demonstrate Senior judgment. The proposed structural changes (merge, user-flow addition, through-line statement, KPI-to-outcomes connection) would close the remaining gap. What holds the deck at approaching-Senior rather than solidly-Senior: the through-line is implicit rather than stated, the iteration loop is visible only in the retrospective, and the outcomes carry no behavioral grounding. Fix those three and this reads Senior consistently.

> **Flag for Recruiter:** The CTA on the end slide has no destination — email, phone, and LinkedIn fields are all unused. A recruiter who wants to reach out has nowhere to go. Add contact information before distributing.

> **Flag for Director:** The deck's central design constraint — add functionality without overwhelming the doctor — is the reason every design decision lands the way it does, and it is never stated on screen. A Director reading this will see coherent feature choices but will not see the governing principle that made them coherent. One sentence on the Goals slide would surface it. Also: the annotation rework is named in the reflection but invisible in the design section — a Director will ask what V1 looked like and why it changed; the deck has no answer for that conversation.
