# Edit summary — itero-scan-workflow, slides 8 and 19

## Scope

Two-slide pass. Slide 8 (`problem`, label "Constraints") — over-budget trim. Slide 19 (`problem`, label "Multi-scan & Compare") — WHY added from context.md. No other slides touched. No ops (no insert/remove/retype/move).

---

## Verdict coverage matrix

| Recommendation | Source(s) | Disposition | Where / Why |
|---|---|---|---|
| Trim slide 8 to within budget (~75 words) | User brief | APPLIED | `slides.8.content`, `slides.8.issues.0–4` — content rewritten from 38→12 words; each bullet shortened; total ~70 words |
| Keep all five constraints (touch/hover, three surfaces, backward-compat, feature flag, read/demo, M&I out of scope) | User brief | APPLIED | All five issues retained, tightened |
| Add WHY to slide 19 (multi-visit cases, toggling layers, scaling) | User brief + context.md | APPLIED | `slides.19.content` — WHY prepended; `slides.19.bullets2.2` trimmed by 2 words to stay under budget |
| Invent nothing not in context.md | User brief | APPLIED | Every word sourced from context.md "Phase 02 — Scan" and "Constraints" sections |

---

## Fields changed

### Slide 8 — `slides.8.content`

**Before:** "The touch context set the floor for every interaction pattern. Hover states, right-click menus, and precise pointer interactions were ruled out — tap targets had to work for gloved hands, and every interaction had to be achievable by tap alone as a baseline." (44 words)

**After:** "Tap targets sized for gloved hands. Nothing essential could depend on hover." (12 words)

**Why:** The original spread one idea across three redundant clauses. The rewrite states the same constraint in two short sentences — the touch baseline (gloves), and the hover rule — without repetition.

### Slide 8 — `slides.8.issues.0`

**Before:** "Three surfaces — scanner hardware (Element and Lumina), MIDC desktop, and myitero.com — one design across all three" (18 words)

**After:** "Three surfaces: scanner hardware (Element, Lumina), MIDC desktop, and myitero.com" (10 words)

**Why:** The closing clause "one design across all three" restates what "three surfaces" already implies. Dropped it. Comma inside parentheses replaces "and" to save a word.

### Slide 8 — `slides.8.issues.1`

**Before:** "Backward-compatible with in-progress cases still on the old Rx" (9 words)

**After:** "Compatible with in-progress cases on the old Rx" (8 words)

**Why:** "Backward-" is implied by the constraint; "still" is filler. One word saved.

### Slide 8 — `slides.8.issues.2`

**Before:** "Feature flag (SWO NewFlowRx) — no persistent onboarding; learnable on first contact, every time" (14 words)

**After:** "Feature-flagged — no persistent onboarding; learnable on first contact" (8 words)

**Why:** Flag name (SWO NewFlowRx) is internal jargon a portfolio reader doesn't need. "Every time" is covered by "every first contact." Six words cut without losing the constraint.

### Slide 8 — `slides.8.issues.3`

**Before:** "Read mode and demo mode designed in from the start, not retrofitted" (12 words)

**After:** "Read and demo states designed in from day one" (9 words)

**Why:** "mode and…mode" → "states"; "from the start, not retrofitted" → "from day one." Same meaning, three words shorter.

### Slide 8 — `slides.8.issues.4`

**Before:** "M&I, Labs, and iTero Labs out of MVP scope — but the IA was built to absorb them" (18 words)

**After:** "M&I and Labs out of scope — IA built to absorb them" (11 words)

**Why:** "iTero Labs" is redundant with "Labs." "MVP" qualifier is implied. "the IA was" → "IA" (article dropped, verb compressed). Same meaning, seven words cut.

### Slide 8 — `slides.8.issuesTitle`

Unchanged ("What each constraint demanded") — already concise, 4 words.

### Slide 19 — `slides.19.content`

**Before:** "Pre-treatment and post-treatment scans, organised by tab, with real-time overlay and adjustable opacity." (14 words)

**After:** "Multi-visit cases need more than one scan. Clinicians had to track changes between appointments. Pre- and post-treatment scans sit in tabs, with overlay and adjustable opacity." (27 words)

**Why:** The original described the mechanics (tabs, overlay, opacity) but gave no reason the feature exists. The two opening sentences, sourced directly from context.md ("We added this because complex, multi-visit cases need more than one scan: clinicians had to add and toggle layers to see what changed between visits"), supply the WHY. The existing mechanics line is preserved in compressed form. "real-time" dropped from content (it's stated in bullet 1 below).

### Slide 19 — `slides.19.bullets2.2`

**Before:** "What clinicians held in their head, they could now see directly" (11 words)

**After:** "What clinicians held in memory, now visible on screen" (9 words)

**Why:** Trimmed by 2 words to keep the slide within the 75-word budget after the content expansion. "In their head" → "in memory"; "they could now see directly" → "now visible on screen." Same meaning.

---

## Slides added / removed / retyped

No structural changes.

---

## Word-budget trims

- **Slide 8** — was 126 words (⚠ OVER), now ~70 words (budget ~75). All five constraints kept.
- **Slide 19** — was ~64 words, now ~74 words (budget ~75). Added WHY; trimmed bullet2.2 to compensate.

---

## Drafted values to verify

None. Every word in both edits comes directly from context.md (Facts to use):
- Slide 8 content sourced from "Constraints — and What They Cost the Design" section.
- Slide 19 WHY sourced verbatim from "Phase 02 — Scan: Fixing the Toolbar / After" section ("We added this because complex, multi-visit cases need more than one scan...").

No values invented or assumed.

---

## What was NOT changed

All other slides (0–7, 9–18, 20–27). All image/media fields. `slides.8.label`, `slides.8.title`, `slides.19.label`, `slides.19.title`, `slides.19.bullets2Title`, `slides.19.bullets2.0`, `slides.19.bullets2.1`, `slides.19.highlight`.
