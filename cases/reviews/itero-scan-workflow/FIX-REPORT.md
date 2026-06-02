# Clinical Scanning
Workflow — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**21 slides · 1 over budget · dataVersion 12**

## Is it good? — quality read of the current deck
_(run a fix so the critic can assess the current deck)_

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review itero-scan-workflow` again for fresh scores.

- **UX reviewer** (craft): —
- **Recruiter** (hireability): —
- **Director** (positioning): —
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS (with designer-fill items)

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 97 | 75 | ⚠ OVER |
| 1 | problem | 68 | 75 | ok |
| 2 | problem | 72 | 75 | ok |
| 3 | quotes | 121 | 110 | near |
| 4 | problem | 82 | 75 | near |
| 5 | goals | 86 | 100 | ok |
| 6 | problem | 86 | 75 | near |
| 7 | chapter | 13 | 18 | ok |
| 8 | comparison | 78 | 110 | ok |
| 9 | comparison | 97 | 110 | ok |
| 10 | directions | 79 | 90 | ok |
| 11 | comparison | 101 | 110 | ok |
| 12 | chapter | 20 | 18 | near |
| 13 | directions | 89 | 90 | ok |
| 14 | comparison | 117 | 110 | near |
| 15 | problem | 72 | 75 | ok |
| 16 | comparison | 93 | 110 | ok |
| 17 | outcomes | 84 | 95 | ok |
| 18 | problem | 75 | 75 | ok |
| 19 | reflection | 101 | 100 | near |
| 20 | end | 11 | 18 | ok |

## Critic verdict
### Verdict: PASS (with designer-fill items)
Acted on the designer's updated context (show the design process). No fabrication — every new specific/image is an `[ADD: …]` placeholder. Order correct (end last, reflection before end). Only over-budget slide is the intro (97/75), which is placeholder-driven (the `metaItems` `[ADD:]` strings) and drops under budget once filled.

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

_(no coverage check recorded — re-run the critic)_

Full matrix (one row per recommendation): `cases/reviews/itero-scan-workflow/coverage-matrix.md` / `edit-summary.md`

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve itero-scan-workflow`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

_(none recorded)_

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/itero-scan-workflow/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/itero-scan-workflow/copy-summary.md`
- Critic (verification): `cases/reviews/itero-scan-workflow/verify-report.md`

