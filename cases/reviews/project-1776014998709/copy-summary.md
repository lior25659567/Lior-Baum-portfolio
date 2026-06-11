# Copy-writer summary — Patient Report Redesign (merge + structure pass)
`project-1776014998709` · 3 fields re-voiced

---

## Voice fixes

**Problem slide content (`slides.1.content`) — second sentence cut, reframe tightened**

The editor's version: "Doctors were using the report — the ceiling was the problem, not adoption. The tool held scan images well; everything else had to be improvised." The reframe in the first sentence is exactly right and stays verbatim. The second sentence — "The tool held scan images well; everything else had to be improvised" — is true, but the four bullets below say the same thing in specific terms. It was doing the bullets' job twice. Removed entirely. The content now opens the reframe and lets the bullets carry the diagnosis. Saves 12 words, bringing the slide from 89 to ~75 words (on budget).

**Problem slide highlight (`slides.1.highlight`) — two words cut, punch preserved**

"Built around the software — not the doctor using it." → "Built around the software — not the doctor." "Using it" adds nothing the reader doesn't already have. The subject contrast (software vs. doctor) lands the same without it, and shorter reads harder. Saves 2 words.

**Structure slide content (`slides.4.content`) — documentation → first-person decision**

The editor's version narrated a process: "The redesign added templates, modular blocks, annotation, and sharing — four features that all connect inside one workflow. Before designing any of them, I mapped the full report flow to work out how everything fits together. Structure first, so the pieces would be right before I designed or tested them."

The problem: "to work out how everything fits together" is vague process-speak, and the closing clause ("so the pieces would be right before I designed or tested them") is a rationale embedded in a subordinate clause — the reasoning gets buried. Rewritten to be explicit and direct: the decision is stated up front ("I mapped..."), the reason follows as its own sentence ("I needed to understand how they connect..."), and the closing line states the consequence plainly instead of wrapping it in a conditional. "Get the structure wrong and everything built on top of it is wrong too" — anyone can follow this, designer or not.

Also changed "connect" in the first sentence: "that all connect inside one workflow" → "that all live inside one workflow." "Live" is more natural here; "connect" implies they're wired together, which isn't the point. The point is that they all belong to one workflow.

Word count stays within the ~75 budget.

---

## Jargon removed / explained

No jargon in this pass's target fields. "Modular blocks," "annotation," and "workflow" in slide 4 are plain enough that a non-designer recruiter follows without stopping.

---

## Left alone

Every field not in copy-edits.json was already working or is out of scope for voice:

- `slides.1.title`, `label`, `issuesTitle` — kept per editor and synthesis decisions.
- `slides.1.issues.0–3` — all four bullets are specific, sharp, and within budget. No voice problem.
- `slides.1.image.0.caption` — image field, not touched.
- `slides.4.title` ("Mapping the flow before designing the features") — editor adopted this verbatim from two reviewer verdicts; left alone.
- `slides.4.highlight` ("Structure first. Features second.") — already the sharpest line on the slide.
- `slides.4.image.0.caption` ("[ASSET: user-flow map — add in edit mode]") — kept verbatim per task instruction.
- All other slides (0, 2, 3, 5–12) — not targeted this pass; voice was not the issue.

---

## Notes

**Slide 1 content — the second sentence is gone, and that's correct.** The bullets that follow are the specific diagnosis. Repeating a general version of them in the content adds weight without adding information. The reframe alone is the right setup for a bullet list.

**Slide 4 closing line — "Get the structure wrong and everything built on top of it is wrong too."** This is intentionally plain and a little blunt. It's the reasoning in plain English — a non-designer hiring manager reads it and immediately understands why mapping comes before designing. If the tone feels too casual for the deck, it could soften to "The structure had to be right before any feature could be" — but that's flatter. The direct version is in Lior's voice.
