# Clinical Scanning
Workflow — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**28 slides · 4 over budget · dataVersion 58**

## Is it good? — quality read of the current deck
**Overall:** Almost there

**Seniority:** Senior vs target Senior — reads at target level. Business framing (Why Now, Who It Affected, scale), constraints doctrine, coded-prototype methodology, honest data-gap handling, and roadmap all read as Senior-SaaS-B2B. The one gap holding it below "ready to send" is the View arc: it gets one comparison slide with no setup beat and shares a chapter header with Scan. RX and Scan each get a before + exploration + after arc; View gets only after. The decision to remove the View chapter and View Before slides (designer directive) is honored — but the asymmetry shows.

**What's still missing (top 3 to reach "ready to send"):**

1. **View arc still light.** Slide 15 chapter header is "Scan & View" — View has no dedicated setup or before-state framing. Slide 20 (View Tools comparison) arrives with no connective sentence from the Scan arc, so the reader doesn't know they've moved into View work. Even a one-line bridge in the slide 20 label or beforeDescription ("Moving from capture to validation: the View phase had no completion signal") would close this without adding a slide. This is the most meaningful storytelling gap remaining.

2. **Slide 19 → 20 seam still missing.** Slide 18 (Scan Toolbar After) ends the toolbar fix. Slide 19 (Multi-scan & Compare) opens with "Complex cases need more than one scan" — no bridge from the toolbar arc to the multi-scan feature. A one-line connector in the slide 19 content or label closes it: "With the toolbar fixed, a second Scan gap surfaced: complex cases needed more than one scan held in the same session."

3. **Outcomes are mechanical.** Slide 22 has four metric-label + one-line description pairs, each ending in `[ADD: …]`. The qualitative result on outcome 2 ("Zero blocking modals on the critical path. Between case open and scan start, no popup blocks progress.") is the only one that reads as a finished claim — the other three feel like skeleton entries. Before adding numbers (which don't exist yet), adding one plain sentence of observed qualitative result to each would make the slide legible: "In prototype testing, clinicians reached the scan screen without going through the old modal flow" rather than just a metric label and a placeholder.

---

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review itero-scan-workflow` again for fresh scores.

- **UX reviewer** (craft): Overall Craft Score: 7/10 · Seniority Signal: Mid-to-Senior
- **Recruiter** (hireability): Recruiter Verdict: Maybe
- **Director** (positioning): Director Verdict: Needs Rework — structural expansion, not a voice fix
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 53 | 75 | ok |
| 1 | problem | 68 | 75 | ok |
| 2 | problem | 76 | 75 | near |
| 3 | issuesBreakdown | 81 | 95 | ok |
| 4 | problem | 88 | 75 | near |
| 5 | quotes | 103 | 110 | ok |
| 6 | goals | 119 | 100 | near |
| 7 | problem | 78 | 75 | near |
| 8 | problem | 126 | 75 | ⚠ OVER |
| 9 | problem | 95 | 75 | ⚠ OVER |
| 10 | chapter | 19 | 18 | near |
| 11 | problem | 74 | 75 | ok |
| 12 | directions | 68 | 90 | ok |
| 13 | problem | 54 | 75 | ok |
| 14 | comparison | 82 | 110 | ok |
| 15 | chapter | 16 | 18 | ok |
| 16 | problem | 72 | 75 | ok |
| 17 | directions | 81 | 90 | ok |
| 18 | problem | 89 | 75 | near |
| 19 | problem | 64 | 75 | ok |
| 20 | chapter | 17 | 18 | ok |
| 21 | problem | 51 | 75 | ok |
| 22 | comparison | 92 | 110 | ok |
| 23 | problem | 103 | 75 | ⚠ OVER |
| 24 | outcomes | 91 | 95 | ok |
| 25 | process | 92 | 85 | near |
| 26 | reflection | 131 | 100 | ⚠ OVER |
| 27 | end | 13 | 18 | ok |

## Critic verdict
### Verdict: PASS

No agent-invented unflagged fabrications. No contradictions. Both round-1 blocking issues are confirmed resolved. Coverage matrix is honest on all 19 rows.

---

### Blocking issues (pipeline must auto-fix)

None.

---

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

### Verdict coverage check

The edit-summary matrix has 19 rows covering all actionable directives from the designer's context.md brief. This pass re-walks all 19:

- **Row 5 (no View chapter):** confirmed — no chapter slide for View exists in the 26-slide deck. APPLIED, honest.
- **Row 6 (no View Before):** confirmed — no before-state slide for View exists. APPLIED, honest.
- **Row 8 (quotes trimmed to 4, named doctors removed):** confirmed — slide 5 now has exactly 4 quotes (quotes.0–3), all role-attributed (Restorative specialist / General dentist / Orthodontist / Restorative specialist). Dr. Daniel Katz and Dr. Lior Haddad are gone. APPLIED, honest, and now actually in the deck.
- **Row 1–4, 7, 9–19:** all spot-checked against extracted.md. Every APPLIED disposition is verifiably present in the current deck (Why Now slide 2 present; Who It Affected slide 3 present; Constraints slide 7 present with correct hover framing; Next Steps slide 23 present; toolbar research attribution on slide 17; multi-scan explanation on slide 19; confirmed highlight on slide 20; prototype slide 9 present; all 6 goals + 6 KPIs on slide 8; etc.).

Matrix complete — all 19 items dispositioned honestly.

---

Full matrix (one row per recommendation): `cases/reviews/itero-scan-workflow/coverage-matrix.md` / `edit-summary.md`

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve itero-scan-workflow`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

### Verify before sending (designer's call — NOT blocking)

Pre-existing designer-asserted specifics. Pipeline keeps them; designer confirms or genericizes.

1. **Slide 2 · `[slides.2.highlight]`** — "At 37 million cases a year, one unnecessary popup per case adds up fast." — real figure from context.md (designer-asserted). Confirm or genericize.

2. **Slide 2 · `[slides.2.content]` and `[slides.2.issuesTitle]`** — "3Shape, Medit, and Shining3D" named as competitors. Real? Confirm or replace with "major competitors."

3. **Slide 22 · `[slides.22.outcomes.0.description]`** — "[ADD: setup time measurement from usability testing or post-launch analytics]" — still open. Fill when available.

4. **Slide 22 · `[slides.22.outcomes.1.description]`** — "[ADD: multi-tooth task completion rate from testing]" — still open.

5. **Slide 22 · `[slides.22.outcomes.3.description]`** — "[ADD: restart rate before/after from testing or analytics]" — still open.

6. **Slide 24 · `[slides.24.whatYouCouldntMeasure]`** — "[ADD: post-launch resubmission rate, setup time, and mandatory-field error rate.]" — still open.

7. **Slide 25 (end) · `[slides.25]`** — contact info (email, LinkedIn URL, CTA) still blank per confirmed.md "Still open." Add in edit mode.

---

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/itero-scan-workflow/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/itero-scan-workflow/copy-summary.md`
- Critic (verification): `cases/reviews/itero-scan-workflow/verify-report.md`

