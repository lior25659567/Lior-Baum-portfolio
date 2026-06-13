# Synthesis — itero-scan-workflow (context-driven expansion)

Source: ux-verdict.md · recruiter-verdict.md · director-verdict.md, all read against the newly
expanded `context.md`. The designer wants the deck expanded so every beat in context.md is
represented — **add the missing slides, revise the rest, reorder into one continuous three-phase
story.** Everything below is sourced from context.md; invent nothing (KPIs are defined but
unmeasured — keep `[ADD: …]` for production data).

## Where all 3 agents agree — ADD these slides (non-negotiable)

1. **Why Now / business case** — `textAndImage`. 37M cases/year; 3Shape, Medit, Shining3D had
   already modernized; architecture patched past the point of patching → rebuild. This is the
   business stake that makes everything downstream matter. Place near the top (after the
   system/problem framing).
2. **Who It Affected** — `issuesBreakdown` (3 cards). Dentists (chair time), clinical staff
   (resubmission fallout), labs (incomplete/unstructured Rx for All-on-X & multi-phase). Turns
   "37M cases" into a product-scale, multi-stakeholder problem. Place right after Why Now.
3. **Constraints** — `textAndImage`. THE highest-impact addition (all three rank it #1). Three
   surfaces (Element/Lumina scanner, MIDC desktop, myitero.com) → gloved-hand tap floor; backward
   compatibility with in-progress cases; feature flag (SWO NewFlowRx) → no persistent onboarding +
   dynamic procedure availability; read/demo as first-class states; M&I/Labs forward-compat.
   Without it, every direction rejection reads as a preference, not a forced elimination.
4. **Next Steps roadmap** — `directions` or `process` (Now / Next / Later): smart defaults & auto-fill
   → Rx Summary & Send → lab-side connection, sequenced with the PM. Closes the deck on forward
   product ownership, not retrospection. Place after Outcomes, before Reflection.
5. **View gets its own arc** — add **Chapter 03 — View** (`chapter`) + a **View Before** slide
   (`textAndImage`/`problem`) carrying the sharpest clinical line in context.md: *"re-checking is a
   trust symptom, not a workflow preference."* The existing comparison/after work sits inside this arc.

## Also agreed — REVISE existing slides

- **Goals** — state all **6** goals (currently incomplete: multi-select and editable-mid-workflow
  are missing) and label the KPIs **"defined, not yet measured."**
- **Prototype** — reframe as methodology and move it *before* Chapter 01 RX (it's a method, not a
  footnote); lead with the consequence ("the toolbar placement decision wouldn't have been made
  correctly without it"), not the method.
- **Quotes / Research** — the new context.md supplies the REAL quotes; use them and drop the older
  set. Keep ~4 (setup ×2, scanning ×1, view ×1), attribute to roles, and add one line of research
  framing + the small-sample limitation. Lead the problem with *"like a long boring form."*
- **Design System** — reframe from "components documented" to the **three-state model** (editable /
  read-only / demo designed in from the start) + IA built to absorb future lab workflows.
- **RX / Scan before+exploration+after** — align exploration options to context.md exactly:
  RX explored Step-by-step wizard (rej) / Accordion (rej) / Single-view (acc); Scan explored Bottom
  center (rej) / Vertical right rail (rej) / Top-right (acc). Fix any slide whose options don't match.
- **Outcomes** — use the four concrete goal→result statements from context.md's Outcomes table;
  keep `[ADD: …]` for quantitative data. No directional adjectives.

## Conflicts — DECIDED

- **Why Now + Who It Affected: one slide or two?** Recruiter says two; director folds into one
  business-case slide. → **Verdict: two** — a `textAndImage` Why Now (the trigger/business case) and
  an `issuesBreakdown` Who It Affected (the three stakeholders). Rationale: distinct jobs; the
  stakeholder grid is wasted as a paragraph, and the business case is wasted as cards.
- **Constraints placement: before or after Goals?** → **Verdict: Journey Map → Constraints → Goals →
  Prototype.** Constraints frame why the goals take the shape they do; goals then read as targets set
  inside known boundaries.
- **Deck length: ~30 slides — too long?** → **Verdict: accept the growth.** The additions are all
  load-bearing story beats, not padding; the profile target (Senior, SaaS) expects business framing,
  constraints, and roadmap. Keep each new slide tight (≤ its template budget).

## Recommended order (≈23 → ≈30)

Cover → System → **Why Now** → **Who It Affected** → Problem → Research/Quotes → Journey Map →
**Constraints** → Goals (all 6 + KPIs) → **Prototype (methodology)** → Chapter 01 RX → RX before →
RX exploration (directions) → RX after → Chapter 02 Scan → Scan before → Scan exploration (directions)
→ Scan after → **Chapter 03 View** → **View before** → View after/comparison → Design System →
Outcomes → **Next Steps (Now/Next/Later)** → Reflection → End.

## Top 5 action items (by impact)

1. Add **Constraints** (`textAndImage`) — the missing narrative engine.
2. Add **Why Now** + **Who It Affected** — the business case + stakeholders.
3. Add **Next Steps** roadmap and **Chapter 03 View + View Before** — close the View arc and end on
   forward ownership.
4. Revise **Goals** (all 6 + KPIs labelled unmeasured) and move **Prototype** earlier as methodology.
5. Swap in the **real research quotes**, reframe **Design System** (three-state), and fix any
   exploration options that don't match context.md. Fill the reflection's `whatYouLearned`.

## Seniority signal

**Senior — currently under-presented as Mid.** Execution, decision reasoning, and the coded prototype
are Senior; the gap is purely the missing business/constraint/roadmap framing, all of which now exists
verbatim in context.md.

## Overall verdict

**Almost There → Senior once the 7 beats are added.** No invention required — every addition is sourced
from context.md. This is an expansion + reorder pass, not a rewrite of what's already strong.
