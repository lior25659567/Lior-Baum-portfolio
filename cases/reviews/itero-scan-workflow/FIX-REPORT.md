# Clinical Scanning
Workflow — fix report

The single place to read after a `fix`. Source of truth is the JSON, so the budget
table below always matches what actually shipped.

**22 slides · 0 over budget · dataVersion 19**

## Is it good? — quality read of the current deck
Overall: Almost there

Seniority: Mid-Senior vs target Senior — the single gap: the two NEW slides (RX
Setup — After, Scan Toolbar — After) carry empty image slots, so the resolution beats
exist in text only. The story arc is now fully assembled and the decision logic is
visible; the deck closes to Senior the moment the designer drops in the four
placeholder images/videos.

What's still missing:

1. **Four empty image slots on the split slides.** Slides 8, 10, 13, and 15 all have
   `image: ""` with caption instructions. Until those are filled the OLD→IDEATION→NEW
   sequence is a prose argument with no visual evidence — the strongest part of the
   redesign story is missing its payoff. This is the highest-leverage remaining gap.

2. **Outcomes are qualifier-only, no data.** Slide 18 has `Faster / Fewer / Clearer /
   Higher` labels with `[ADD: …]` placeholders throughout. For a Senior SaaS portfolio,
   the hiring manager's seniority read happens on this slide. Even one prototype-session
   data point (time comparison, rescan count) would close this gap.

3. **Reflection is half-complete.** Slide 20 has two `[ADD: …]` items in `whatFailed`
   and `whatYoudDoDifferently`, and `whatYouCouldntMeasure` is a placeholder. Reflection
   is where strategic self-awareness is shown — two unfilled bullets leave the section at
   half-strength.

---

## All agents at a glance
Each agent's headline. The reviewer scores are from the **last full `review`** —
after big edits, run `review itero-scan-workflow` again for fresh scores.

- **UX reviewer** (craft): —
- **Recruiter** (hireability): —
- **Director** (positioning): —
- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).
- **Critic** (correctness, current deck): Verdict: PASS

## Word budget per slide (ground truth)
These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget
(the pipeline auto-trims these — a clean fix shows 0 over).

| # | type | words | budget | status |
|---|------|-------|--------|--------|
| 0 | intro | 76 | 75 | near |
| 1 | problem | 68 | 75 | ok |
| 2 | problem | 72 | 75 | ok |
| 3 | quotes | 121 | 110 | near |
| 4 | problem | 69 | 75 | ok |
| 5 | goals | 86 | 100 | ok |
| 6 | problem | 86 | 75 | near |
| 7 | chapter | 19 | 18 | near |
| 8 | problem | 74 | 75 | ok |
| 9 | directions | 68 | 90 | ok |
| 10 | problem | 54 | 75 | ok |
| 11 | comparison | 97 | 110 | ok |
| 12 | chapter | 20 | 18 | near |
| 13 | problem | 68 | 75 | ok |
| 14 | directions | 90 | 90 | ok |
| 15 | problem | 74 | 75 | ok |
| 16 | problem | 72 | 75 | ok |
| 17 | comparison | 93 | 110 | ok |
| 18 | outcomes | 84 | 95 | ok |
| 19 | problem | 75 | 75 | ok |
| 20 | reflection | 101 | 100 | near |
| 21 | end | 11 | 18 | ok |

## Critic verdict
### Verdict: PASS

No agent-invented unflagged fabrications. No cross-slide contradictions. Both
agent-drafted specifics on the new slides are properly listed in the edit-summary's
"Drafted values to verify." One slide is over budget (see Nits). No blocking issues.

---

### Blocking issues (pipeline must auto-fix)

None.

---

## Verdict coverage — every recommendation accounted for
The fix flow dispositions EVERY actionable item from all three verdicts + synthesis as
APPLIED / DECLINED / DESIGNER — nothing applied "in general". The critic re-checks this.

### Verdict coverage check

This pass was driven by an agreed structural brief, not by ux-verdict / recruiter-verdict
/ director-verdict / synthesis files (none exist for this pass). The coverage matrix rows
are sourced from the brief, not from reviewer verdicts — this is structurally correct for
a brief-driven structural pass. All 14 brief recommendations are dispositioned.

Spot-check of APPLIED rows against the current deck:

| Matrix row | Claimed disposition | Actual in deck |
|---|---|---|
| Retype orig slide 9 → problem "RX Setup — After" | APPLIED | Confirmed: slide 10 in extracted.md is type `problem`, label "RX Setup — After" |
| Insert OLD: RX Setup after chapter 7 | APPLIED | Confirmed: slide 8 in extracted.md is type `problem`, label "RX Setup — Before" |
| Chapter → OLD → IDEATION → NEW order (RX) | APPLIED | Confirmed: slides 7→8→9→10 in current deck |
| Retype orig slide 13 → problem "Scan Toolbar — After" | APPLIED | Confirmed: slide 15 in extracted.md is type `problem`, label "Scan Toolbar — After" |
| Insert OLD: Scan Toolbar after chapter 11 | APPLIED | Confirmed: slide 13 in extracted.md is type `problem`, label "Scan Toolbar — Before" |
| Chapter → OLD → IDEATION → NEW order (Toolbar) | APPLIED | Confirmed: slides 12→13→14→15 in current deck |
| Carry highlight "Tools were now one tap away…" to NEW Toolbar | APPLIED | Confirmed: `slides[15].highlight` in JSON |
| Add bullets2 / bullets2Title (icon redesign) to NEW Toolbar | APPLIED | Confirmed: `slides[15].bullets2Title = "Icon redesign"`, two bullets present |
| KEEP Tooth Selection comparison — no split | APPLIED | Confirmed: slide 11 is still type `comparison` |
| KEEP View Tools comparison — no split | APPLIED | Confirmed: slide 17 is still type `comparison` |
| Do not touch slides 0–7 and 16–19 content | APPLIED | Confirmed by extracted.md — those slides unchanged |
| No metrics invented, no named people added | APPLIED | Confirmed — no metrics, no new names |
| Empty image slots with captions on all four affected slides | APPLIED | Confirmed: `image: ""` + caption on slides 8, 10, 13, 15 in JSON |
| Info-Page three-iteration request (context.md) — out of scope | DECLINED | Reason given: avoid pushing past 22 slides; raise as separate addition |

Matrix complete — all 14 items dispositioned. No APPLIED row is absent from the deck.

---

Full matrix (one row per recommendation): `cases/reviews/itero-scan-workflow/edit-summary.md` → "Verdict coverage matrix"

## Verify before sending — YOUR call
The only things the system cannot know (your real data). For each item, answer:
**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in
chat or write next to the item, then run **`resolve itero-scan-workflow`** — the system applies
your answers, stops re-asking the confirmed ones, and regenerates this report.

### Verify before sending (designer's call — NOT blocking)

#### Agent-drafted specifics introduced by this pass

| Slide | Path | Claim | Action |
|---|---|---|---|
| 8 | `slides[8].highlight` | "Every second here was a second the patient sat waiting." | Agent-drafted tension line. Does this match how you'd frame the waiting-patient cost? Confirm or replace with your own words. |
| 15 | `slides[15].bullets2[0]` | "Toolbar and procedure icons rebuilt into one visual system" | Paraphrase of your own dir3Desc text — but agent-phrased. Confirm this is how you'd describe the icon redesign outcome. |
| 15 | `slides[15].bullets2[1]` | "Every tool reads at a glance — nothing to memorise" | Agent-drafted readability claim. Confirm this accurately describes the icon redesign result. |

#### Pre-existing unconfirmed specifics (unchanged by this pass)

| Slide | Path | Claim | Action |
|---|---|---|---|
| 3 | `slides[3].quotes[0-5].author` | Dr. Yael Levi, Dr. Amir Cohen, Dr. Noa Ben-David, Dr. Efrat Mizrahi, Dr. Daniel Katz, Dr. Lior Haddad | Are these real participant names? Confirm they are real, or genericize to "Dr. Y.L., orthodontist" style. |
| 3 | `slides[3].content` | "[ADD: participant count and research scope]" | Fill in actual count and session scope. |
| 13 | `slides[13].caption` | "DESIGNER: confirm this image shows icon fragmentation, else supply a real old-toolbar screenshot." | img-c1djiu0kh0.webp — pre-existing flag from a prior review: confirm this image shows the old scattered icons, not a new-state screenshot. |

#### Pre-existing [ADD: …] placeholders (not introduced by this pass)

| Slide | Path | What's needed |
|---|---|---|
| 0 | `slides[0].metaItems[0-2].value` | Your role, project timeline, and team composition |
| 18 | `slides[18].outcomes[0-1].description` + `slides[18].highlight` | Real metrics or post-launch quotes once available |
| 19 | `slides[19].image` | Design system component image (img-5pdk4g6ngg.webp was suggested) |
| 20 | `slides[20].whatFailed[1]`, `slides[20].whatYoudDoDifferently[1]`, `slides[20].whatYouCouldntMeasure` | One more specific failure, one concrete action, real post-launch data |

---

## Deliberation — where the reviewers disagreed
How the three reviewers split, and what the editor was told to weigh. (Full per-agent
verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)

_(no recorded conflicts)_

## What the passes changed
- Editor (structure + content): `cases/reviews/itero-scan-workflow/edit-summary.md`
- Copy-writer (voice + jargon): `cases/reviews/itero-scan-workflow/copy-summary.md`
- Critic (verification): `cases/reviews/itero-scan-workflow/verify-report.md`

