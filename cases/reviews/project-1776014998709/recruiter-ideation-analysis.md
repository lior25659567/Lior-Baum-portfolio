# Ideation Slide — Recruiter Analysis
## Slide 4 (`directions`) — Patient Report Redesign

---

## 1. Does this slide read as senior design judgment in seconds?

**Not currently. And here is exactly why.**

The current `dir1Desc` and `dir2Desc` describe the FEATURE SET of each direction — how many block types, whether the header is compact — not the core structural difference between them. A recruiter skimming in four seconds reads "maximal builder vs. streamlined one" and learns nothing about what you actually chose between. It reads as aesthetic preference ("more interface to manage" vs. "fewer choices") rather than a principled judgment call.

The real decision — the one with design thinking behind it — is WHERE you edit. Direction 1 forces the doctor to edit in a sidebar panel while looking at a read-only preview. Direction 2 puts the controls on the thing they change. That is a direct-manipulation principle. That is a specific, nameable design judgment that a recruiter at a SaaS company immediately recognizes as senior-level thinking.

The current copy buries that insight entirely. "Maximal builder" vs. "streamlined" sounds like a taste call. "Edit from the sidebar vs. edit on the content" sounds like a decision.

There is also a mismatch problem: the current descriptions do not match what the screenshots actually show (per the context transcription). The accepted direction is described as a compact-header layout with fewer choices — but the real accepted direction is inline editing directly on images, with tooth tags and notes sitting beneath each image in the canvas. The rejected direction is described as having eight block types — but the real rejected direction is a sidebar-based editor where controls are separated from the content they affect. The copy is describing a different decision than the one that was actually made.

For a Senior SaaS designer role, "I chose the pattern with fewer options" signals junior taste. "I chose the pattern where the control lives on the thing it changes, because separating editing from the content it affects adds a translation step the doctor shouldn't have to make" signals senior judgment.

---

## 2. What makes the "why Direction 2 won" reasoning land as a decision vs. a preference?

A preference sounds like: "I liked this one better" or "it felt cleaner." Testers preferred it too, so that validates the preference — but preference is not judgment.

A decision sounds like: "I chose this because it eliminates a specific cognitive load for the user. The sidebar forces the doctor to edit in one place and read the result somewhere else. Their mental model has to bridge two panels. Direction 2 collapses that — the annotation tool is on the image, the tooth tags are on the image, the notes field is under the image. You interact with the thing directly. This is also the same principle behind Goal 3 on the previous slide: 'show, don't describe.' The accepted direction embodies the goal; the rejected direction contradicts it."

Three things make it land as a decision and not a preference:

1. **It names the mechanism.** "Editing in the sidebar creates a disconnect between the control and the thing it changes" — this is a specific named problem, not a feeling.
2. **It ties back to the stated goals.** Goal 3 was "make findings visual — annotate on the image." Direction 2 is the only option that actually delivers that goal. Direction 1 cannot — you cannot annotate on a read-only preview from a sidebar panel. The decision was not a test outcome; it was logical necessity confirmed by testing.
3. **"The majority preferred it" stays soft.** It supports the decision without carrying it. The mechanic is the argument; the preference is corroboration.

The copy does NOT need a participant count to land. It needs the structural reason.

---

## 3. The single sharpest framing a recruiter would remember

> **Edit in the sidebar vs. edit on the content.**

That is the whole decision in seven words. A recruiter remembers this an hour later when reviewing candidate 12 because it describes a real UX problem — the disconnect between where you act and where you see the result — that every SaaS designer has encountered. It also directly echos the design's core goal: showing findings visually, in place.

Everything else in the slide should support that frame, not compete with it.

---

## 4. Proposed copy — within ~90-word budget

The template fields are: `description` (process narration under the title), `dir1Desc` (rejected), `dir2Desc` (accepted).

Approximate word allocation: description ~30 words, dir1Desc ~25 words, dir2Desc ~30 words. Total: ~85 words.

---

**`description`** (~30 words)

> With the goals defined, I built two directions and compared them. The deciding question: where does the doctor actually edit — in a separate panel, or right on the content?

---

**`dir1Desc`** (rejected, ~25 words)

> Edit from the sidebar. Controls lived in a left rail, separated from a read-only image preview. To change something, you looked in one place and acted in another.

---

**`dir2Desc`** (accepted, ~30 words)

> Edit on the content. Annotation, tooth tags, and notes sat directly on each image — no sidebar, no translation step between control and result. The majority preferred it; the mechanic is why.

---

### Notes on this copy

- "Translation step between control and result" is the recruiter-legible version of "cognitive mapping between panel and preview." It names the problem without jargon.
- "The majority preferred it; the mechanic is why" makes explicit that the testing result is evidence, not the reason — the reason is the design principle. This is what reads as senior judgment.
- No fabricated participant count. "The majority preferred it" stays exactly as the designer wrote it, on the verify checklist.
- The framing ties directly to Goal 3 (annotate on the image, show don't describe) from Slide 3 — the recruiter who reads the deck in order feels the logic close.
- Total copy sits at approximately 85 words across the three fields, within the ~90-word budget for the `directions` template.
- The title "Two directions I weighed" can stay as-is — it already signals active judgment rather than passive comparison.
