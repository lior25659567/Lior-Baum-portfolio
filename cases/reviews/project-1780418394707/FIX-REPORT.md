# ResponsiveView
Extension — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**8 slides · 0 over budget · dataVersion 7**

## Is it good? — quality read of the current deck
_(run a fix so the critic can assess the current deck)_

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review project-1780418394707` again for fresh scores.

- **UX reviewer** (craft): —
- **Recruiter** (hireability): —
- **Director** (positioning): —
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS (after remediation)

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 85 | 75 | near |
| 1 | problem | 81 | 75 | near |
| 2 | issuesBreakdown | 116 | 95 | near |
| 3 | comparison | 114 | 110 | near |
| 4 | problem | 88 | 75 | near |
| 5 | outcomes | 94 | 95 | ok |
| 6 | reflection | 102 | 100 | near |
| 7 | end | 13 | 18 | ok |

## Critic verdict
### Verdict: PASS (after remediation)
The critic's one blocking item — a verdict-coverage-matrix gap (Director rewrite #3 undispositioned) — is resolved: that recommendation was already satisfied by the outcomes' behavioral framing, and the matrix now records it APPLIED. The cross-slide "one click to any device" duplication was differentiated. No agent-invented fabrication; every gap is an `[ADD: …]` placeholder. 14 slides, 0 over budget, valid JSON. **Seniority: Mid → Senior once the designer fills the items below.**

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

_(no coverage check recorded — re-run the critic)_

Full matrix (one row per recommendation): `cases/reviews/project-1780418394707/edit-summary.md` → "Verdict coverage matrix"

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve project-1780418394707`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

_(none recorded)_

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/project-1780418394707/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/project-1780418394707/copy-summary.md`
- Critic (verification): `cases/reviews/project-1780418394707/verify-report.md`

