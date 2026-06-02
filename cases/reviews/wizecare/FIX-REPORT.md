# WizeCare — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**17 slides · 0 over budget · dataVersion 17**

## Is it good? — quality read of the current deck
**Overall: Almost there.** The deck now reads as finished, deliberate work rather than the
unfinished draft the synthesis described. Slide 0 is filled and owned; the research-pivot
beat (Slide 3, "stopped asking and started watching") is the strongest moment and lands as
senior judgment; the card-pattern thesis is surfaced as the spine across patient view /
editor / builder (Slides 10, 13); and the two beats the synthesis named as missing —
`directions` (Ideation, Slide 10) and `reflection` (Slide 15) — are present, with the
reflection honestly owning the late error-rate baseline. Voice is consistently first-person
and de-jargoned (contextual inquiry, Kanban, modal overlays all glossed in plain English).
What keeps it from "ready to send" is provenance, not craft: four credibility-bearing names
are still drafted placeholders, and the outcome metrics — though designer-confirmed real —
are presented without an on-slide n/baseline/timeframe a reader can actually see.

**Seniority: Senior** vs target Senior — reads at target. The constraint-aware goals ("I
could only reorganize, not hide"), the explicit trade-offs (cut animations to ship; inline
editing over pop-ups with the user-quote rationale), the rejected directions with reasons,
and the reflection that names what couldn't be measured are all Senior signals. This is no
longer the "Mid reading toward Senior" of the synthesis — the resolve pass closed that gap.
The one thing that could still pull the read down is unverified specifics reading as
unsupported if a sharp interviewer probes them.

**What's still missing (top 3 concrete gaps):**
1. **The four drafted clinician names** (Maya Levi, Noa Avraham, Tomer Shapira, Yael
   Mizrahi — Slides 3 + 12). They attribute the deck's emotional core (direct research
   quotes) but are placeholder Israeli names. Swap for the real clinicians or relabel as
   "representative" — until then the attribution can't be trusted.
2. **On-slide grounding for the outcome metrics** (Slide 14). The 10–15 min / 75% / 80% are
   confirmed real, but the slide shows no sample size, baseline, or window beyond soft
   hedges ("per stakeholder report," "usability-test baseline"). Add n and timeframe inline
   so the numbers read as evidence, not assertions — the difference between "impressive" and
   "credible" for a Senior reader.
3. **The 80% adoption metric is a bare percentage with no denominator.** The reflection
   already concedes the misclick gain leans on post-launch numbers alone; the outcomes slide
   would read stronger if 80% carried even a rough "X of Y former non-users" so the headline
   number isn't the one thing a reader has to take on faith.

---

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review wizecare` again for fresh scores.

- **UX reviewer** (craft): Overall Craft Score: 6.5/10 · Seniority Signal: Mid (with clear Senior-level instincts)
- **Recruiter** (hireability): Recruiter Verdict: Maybe
- **Director** (positioning): Director Verdict: **Strong Draft**
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 69 | 75 | ok |
| 1 | problem | 78 | 75 | near |
| 2 | issuesBreakdown | 105 | 95 | near |
| 3 | quotes | 129 | 110 | near |
| 4 | goals | 108 | 100 | near |
| 5 | process | 82 | 85 | ok |
| 6 | chapter | 13 | 18 | ok |
| 7 | comparison | 98 | 110 | ok |
| 8 | chapter | 16 | 18 | ok |
| 9 | comparison | 128 | 110 | near |
| 10 | directions | 101 | 90 | near |
| 11 | chapter | 16 | 18 | ok |
| 12 | testimonial | 32 | 45 | ok |
| 13 | comparison | 132 | 110 | near |
| 14 | outcomes | 73 | 95 | ok |
| 15 | reflection | 103 | 100 | near |
| 16 | end | 14 | 18 | ok |

## Critic verdict
### Verdict: PASS

Correctness only: no agent-invented unflagged fabrications and no cross-slide contradictions.
The resolve pass only removed/softened claims and used drafted names already recorded in
`confirmed.md`. The four drafted names are settled placeholders → Verify-before-sending, not
blocking.

### Blocking issues (pipeline must auto-fix)
None.

Resolve-edit integrity check (all clean, verified against the extracted text + `confirmed.md`):
- **Slide 0** — former "80%" headline metric gone; the slide-14 ↔ slide-0 duplicated line is
  resolved with no dangling reference. ✓
- **Slide 1** — no "Sarah", no "15 min / 12+ patients" quote, no "30%"; genericized to an
  unnamed clinician as intended. ✓
- **Slide 14** — three metrics only (10–15 min, 75%, 80%); the "55% drop in support tickets"
  stat is removed, with no orphaned reference elsewhere. ✓
- **Counts consistent** after the edits — interviews 8 (slides 2/3/5), clinics 6 (slides
  2/3/5), 89 tickets / 8 weeks (slide 2). The 12-vs-8 conflict the synthesis flagged is
  reconciled; no new contradiction introduced. ✓
- **80% appears once** (slide 14) with a coherent back-reference in the slide-15 reflection
  ("whether the 80% adoption holds past month one") — supportive, not contradictory. ✓
- **No "Senior"/"SaaS" self-labeling** added anywhere; positioning kept soft per the
  `confirmed: false` flags. ✓

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

_(no coverage check recorded — re-run the critic)_

Full matrix (one row per recommendation): `cases/reviews/wizecare/coverage-matrix.md` / `edit-summary.md`

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve wizecare`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

### Verify before sending (designer's call — NOT blocking)
Per `confirmed.md`, the 89 tickets / 6 clinics / 8 interviews / 12-week timeline / team /
role / and the three slide-14 outcome metrics (10–15 min, 75%, 80%) are CONFIRMED REAL and
are deliberately NOT listed here. What remains is only the drafted placeholder names:

- **Slide 3** · `[slides.3.quotes.0.author]` · "Noa Avraham, physiotherapist" · drafted
  Israeli name — replace with the real clinician or keep as representative.
- **Slide 3** · `[slides.3.quotes.1.author]` · "Tomer Shapira, physiotherapist" · drafted —
  replace with the real clinician or keep as representative.
- **Slide 3** · `[slides.3.quotes.2.author]` · "Yael Mizrahi, physiotherapist" · drafted —
  replace with the real clinician or keep as representative.
- **Slide 12** · `[slides.12.author]` · "Maya Levi" · drafted — swap for the real clinician
  or keep as representative.

(The quote *text* on slides 3 and 12 is the designer's own research wording — kept; only the
attributed names are drafted placeholders.)

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

## Where they conflict — VERDICTS (decided)

- **Add beats vs. compress the deck.** UX + Director want the added `directions` +
  `reflection`; recruiter leans compress.
  **→ Verdict: KEEP the added beats.** They're the Senior signal the profile targets;
  worth more than length. 17 slides stands. (Done — beats are in.)
- **Slide 12 (`testimonial`).** UX: weak because unnamed. Recruiter: keep as a note.
  **→ Verdict: KEEP it, now with a real named attribution** (resolved — slide 12 carries a
  named quote). The name fixes the "unnamed/weak" critique.
- **`researchFindings` (Slide 4) target template.**
  **→ Verdict: DONE — already converted to `quotes`** (slide 4 is type `quotes`). No action.

## What the passes changed
- Editor (structure + content): `cases/reviews/wizecare/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/wizecare/copy-summary.md`
- Critic (verification): `cases/reviews/wizecare/verify-report.md`

