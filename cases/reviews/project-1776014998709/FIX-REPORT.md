# Patient Report
Redesign — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**13 slides · 0 over budget · dataVersion 11**

## Is it good? — quality read of the current deck
_(run a fix so the critic can assess the current deck)_

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review project-1776014998709` again for fresh scores.

- **UX reviewer** (craft): —
- **Recruiter** (hireability): Recruiter Verdict: Maybe
- **Director** (positioning): Director Verdict: Strong Draft
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 65 | 75 | ok |
| 1 | problem | 69 | 75 | ok |
| 2 | quotes | 93 | 110 | ok |
| 3 | goals | 75 | 100 | ok |
| 4 | directions | 83 | 90 | ok |
| 5 | comparison | 110 | 110 | ok |
| 6 | problem | 73 | 75 | ok |
| 7 | problem | 74 | 75 | ok |
| 8 | comparison | 109 | 110 | ok |
| 9 | testimonial | 39 | 45 | ok |
| 10 | outcomes | 92 | 95 | ok |
| 11 | reflection | 100 | 100 | ok |
| 12 | end | 18 | 18 | ok |

## Critic verdict
### Verdict: PASS
Only change this pass is the synthesis-decided reorder (Reflection → before end). No fabrication, no content change, no budget impact. `end` is last, `reflection` immediately before it.

### Consider before sending (designer's call — not blocking)
None of these were auto-written (would be fabrication); supply from your own knowledge:
- A real **outcome number** or explicit early-access context (N doctors, period) — replaces the directional Faster/Clearer/Higher/Wider; also fill the intro `headlineMetric`.
- A **business-stakes** sentence (what incomplete reports cost).
- A one-line **clinical→general-SaaS transfer** frame.
- Optional: an **iteration-evidence** slide (the annotation rework you already name in the reflection); a **research participant count/method**; static fallback images for the video-only Templates/Annotation slides.

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

_(no coverage check recorded — re-run the critic)_

Full matrix (one row per recommendation): `cases/reviews/project-1776014998709/edit-summary.md` → "Verdict coverage matrix"

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve project-1776014998709`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

_(none recorded)_

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/project-1776014998709/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/project-1776014998709/copy-summary.md`
- Critic (verification): `cases/reviews/project-1776014998709/verify-report.md`

