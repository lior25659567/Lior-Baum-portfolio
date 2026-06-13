# Copy edits — connective tissue pass (slides 1–9, post-reorder)

## What this pass did

One edit. One slide. Everything else was already working.

The reorder introduced a single narrative inconsistency: slide 7 (User Flow / Journey Mapping) opened with "Before designing, I mapped the full RX→Scan→View sequence as users lived it." In the previous order that read correctly — the mapping happened before design work. In the new order, slide 6 (Design Goals) comes immediately before it, so "before designing" now implies the mapping preceded the goals — the opposite of what happened. The context.md is explicit: "With the scope defined and goals set, I mapped the full appointment as clinicians lived it."

**Fix applied to `slides.7.content`:**

Before: "Before designing, I mapped the full RX→Scan→View sequence as users lived it. The friction clusters were impossible to ignore."

After: "With the goals in place, I mapped the full appointment as clinicians actually moved through it — not the designed flow, the real one. Three breakpoints emerged immediately."

The new line inherits from slide 6 ("goals in place"), names what the mapping was looking for ("the real flow, not the intended one"), and closes with the finding that slide 7's bullet list then unpacks. Word count: 69 → 73, within the 75-word budget. "Friction clusters" was also removed — "breakpoints" is more concrete and maps directly to the three bullets below it.

## The slides I left untouched — and why

- **Slide 1 (The System):** Closes with "A problem in one disrupts the whole appointment." Slide 2 (The Problem) lands the problem directly. The link is already in the sentence.
- **Slide 2 (The Problem):** Opens cold by design — "The Problem" label and title do the framing. Slide 1's closing line is the bridge.
- **Slide 3 (Who It Affected):** Opens with "Setup failures didn't stop at the clinician." Picks up exactly from slide 2's setup failures. Clean.
- **Slide 4 (Why Now):** The title "Three signals converged at once" carries the bridge from slide 3. The transition from "who suffered" to "why the rebuild was now" reads clearly without an additional line.
- **Slide 5 (Research):** "Chairside observation, then six interviews" follows naturally from the scale and urgency established in slide 4. No bridge needed.
- **Slide 6 (Design Goals):** Already over budget (119 words vs 100). No addition possible. The label and title orient the reader from research findings.
- **Slide 8 (Constraints):** Already over budget (126 words vs 75). No addition possible. "What the design had to work across" is a self-sufficient title.
- **Slide 9 (Interactive Prototype):** Already over budget (95 words vs 75). No addition possible. The existing content closes the setup arc cleanly.

## Notes

- Slides 8 and 9 are both over budget and cannot absorb even a one-line bridge. If connective language is wanted on those slides, the bullet content would need to be trimmed first to make room.
- The "37 million" duplication between slides 2 and 4 (flagged in extracted.md) is a separate structural issue — not a connective-tissue problem and not in scope for this pass.
