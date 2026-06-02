# Design System
in Claude Code — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**9 slides · 0 over budget · dataVersion 5**

## Is it good? — quality read of the current deck
_(run a fix so the critic can assess the current deck)_

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review project-1776628169716` again for fresh scores.

- **UX reviewer** (craft): —
- **Recruiter** (hireability): Recruiter Verdict: Maybe
- **Director** (positioning): Director Verdict: Needs Rework
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS (with designer-fill items)

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 76 | 75 | near |
| 1 | problem | 70 | 75 | ok |
| 2 | problem | 72 | 75 | ok |
| 3 | problem | 70 | 75 | ok |
| 4 | problem | 77 | 75 | near |
| 5 | problem | 54 | 75 | ok |
| 6 | outcomes | 57 | 95 | ok |
| 7 | reflection | 91 | 100 | ok |
| 8 | end | 16 | 18 | ok |

## Critic verdict
### Verdict: PASS (with designer-fill items)
No fabrication — every missing specific is an `[ADD: …]` placeholder. Changes this pass: chapter numbering fixed (01–06 sequential), `metaItems` added to intro, `reflection` slide inserted before the end card. end is last, reflection immediately before it. 9 slides, 0 over budget.

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

_(no coverage check recorded — re-run the critic)_

Full matrix (one row per recommendation): `cases/reviews/project-1776628169716/edit-summary.md` → "Verdict coverage matrix"

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve project-1776628169716`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

_(none recorded)_

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/project-1776628169716/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/project-1776628169716/copy-summary.md`
- Critic (verification): `cases/reviews/project-1776628169716/verify-report.md`

