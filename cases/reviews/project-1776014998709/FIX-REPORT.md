# Patient Report
Redesign — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**13 slides · 0 over budget · dataVersion 32**

## Is it good? — quality read of the current deck
**Overall:** Almost there

**Seniority:** Mid-Senior vs target Senior — gap is the Outcomes slide only. Four directional adjectives (Faster / Clearer / Higher / Wider) with no figure, no baseline, no sample size, on a slide where the Goals section defined four explicit KPIs. The rest of the deck reads Senior: decisions are named, the Ideation trade-off is mechanically argued, the reflection is specific, and the Ideation description ("Doctors preferred editing in place") is correctly tight without overclaiming.

**What's still missing:**

1. **User-flow diagram image (Slide 4).** The placeholder `[ASSET: user-flow map — add in edit mode]` is correctly in place. This is the one gate before distributing — a slide claiming "I mapped the flow" without showing the map is worse than no slide. Must be filled in edit mode first.

2. **One quantified outcome (Slide 10).** Even a rough early-access figure with an explicit caveat ("~30% faster across N early-access sessions, pre-rollout baseline") would close the loop the Goals KPIs opened and shift this from "directional" to "evidenced."

3. **Research participant count (Slide 2).** "I interviewed doctors across four specialties" is strong framing with no number attached. Adding it — even a rough figure — is the lowest-effort remaining credibility lift.

---

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review project-1776014998709` again for fresh scores.

- **UX reviewer** (craft): Overall Craft Score: 7/10 · Seniority Signal: Mid / approaching Senior
- **Recruiter** (hireability): Recruiter Verdict: Advance
- **Director** (positioning): Director Verdict: Strong Draft
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 68 | 75 | ok |
| 1 | problem | 75 | 75 | ok |
| 2 | quotes | 102 | 110 | ok |
| 3 | goals | 98 | 100 | ok |
| 4 | problem | 73 | 75 | ok |
| 5 | directions | 85 | 90 | ok |
| 6 | problem | 74 | 75 | ok |
| 7 | problem | 74 | 75 | ok |
| 8 | comparison | 108 | 110 | ok |
| 9 | testimonial | 39 | 45 | ok |
| 10 | outcomes | 94 | 95 | ok |
| 11 | reflection | 98 | 100 | ok |
| 12 | end | 14 | 18 | ok |

## Critic verdict
### Verdict: PASS

No agent-invented unflagged fabrications. No cross-slide contradictions. The Ideation description is intentionally the tight version; see below.

---

### Blocking issues (pipeline must auto-fix)

None.

---

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

### Verdict coverage check

Checking every actionable recommendation from the three verdicts and the synthesis against the edit-summary matrix and the live deck.

**One stale matrix row (not blocking — the deck is correct):**

The matrix row for `slides.5.description` is declared APPLIED with a longer draft ("ran user testing on both... Doctors preferred editing in place, so I took that forward"). The live deck carries the shorter, tighter version: "After the goals, I built both directions and user-tested them on the same task — same content, different model. Doctors preferred editing in place."

Per the designer's explicit instruction, the tight version is intentional and final. It was deliberately chosen over the longer draft because the longer version duplicated the direction cards' mechanics and pushed the slide over its 90-word budget. The matrix entry reflects the original edit intent, not the final shipped text. **The deck is the source of truth; the matrix entry is stale. Not blocking.**

All other APPLIED rows check out against the extracted text. DECLINED rows carry substantive reasons (not dodges). DESIGNER rows are all genuinely designer-owned items (image asset, contact info, outcome figures, project duration, role title, business stakes).

**Matrix otherwise complete — all actionable items dispositioned.**

---

Full matrix (one row per recommendation): `cases/reviews/project-1776014998709/edit-summary.md` → "Verdict coverage matrix"

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve project-1776014998709`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

### Verify before sending (designer's call — NOT blocking)

1. **[SHIP-BLOCKING IMAGE] Slide 4 · `slides.4.image.0` · User-flow diagram** — image slot is correctly empty (`src: ""`), caption `[ASSET: user-flow map — add in edit mode]`. All three reviewers: a slide claiming "I mapped the flow" without showing the map is a screen-out risk, worse than no slide. Add the actual flow diagram in edit mode before distributing to any recruiter.

2. **Slide 5 · `slides.5.description` · "Doctors preferred editing in place"** — the user testing produced a stated preference. If the result was more nuanced (split, task-dependent, small sample), soften to "the majority preferred editing in place." Real? confirm or genericize.

3. **Slide 9 · `slides.9.author` · "Dr. N. Haddad"** — pre-existing. Confirm real name and consent for public portfolio use. Real? confirm or genericize to "Orthodontist, iTero early access program."

4. **Slide 9 · `slides.9.role` · "Orthodontist, iTero early access program"** — pre-existing. Confirm specialty and program name are accurate.

5. **Slide 6 · `slides.6.issues.0` · "Five templates — General Scan, Implant, Crown Prep, Follow-up, Custom"** — pre-existing. Confirm these are the shipped template names. Real? confirm or update to the actual names.

6. **Slide 2 · `slides.2.content` · Research participant count** — "I interviewed doctors across four specialties" carries no number. If you know the count, add "I interviewed [N] doctors across four specialties." Even a rough figure meaningfully raises the research credibility signal.

7. **Slide 0 · `slides.0.metaItems.1.value` · "2025"** — no duration. Add actual project length and quarter (e.g. "Q1–Q2 2025 · 10 weeks") — duration signals scope of ownership to recruiters.

8. **Slide 0 · `slides.0.metaItems.0.value` · "Product Designer"** — if your actual title during this project was Senior or Lead, update it. The work in the deck reads at that level; the title label should match.

9. **Slide 10 · `slides.10.outcomes.*` · Directional labels only** — one number from the early-access cohort with an explicit scope caveat would close the KPI loop the Goals slide opened. Confirm or add `[ADD: directional outcome figure]`.

10. **Business stakes (no current path)** — the deck names the capability ceiling but not why it mattered to Align Technology as a business (retention tool? clinical communication requirement? competitive differentiator?). One sentence in the problem or intro adds the stakeholder frame. Confirm the context and the editor can place it.

---

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/project-1776014998709/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/project-1776014998709/copy-summary.md`
- Critic (verification): `cases/reviews/project-1776014998709/verify-report.md`

