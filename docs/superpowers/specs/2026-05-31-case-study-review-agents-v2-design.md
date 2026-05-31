# Case Study Review Agents — v2 (smarter agents)

Date: 2026-05-31
Status: Approved design → implementation

## Context

The portfolio has a working case-study review/fix system (CLAUDE.md "Case Study
Review System"): three reviewer agents (ux-reviewer, design-recruiter,
design-director), an editor (case-study-editor), a deterministic helper
(`scripts/case-study-text.mjs`) that extracts prose / applies edits / generates a
template catalog / detects cross-slide duplication, and triggers `review <slug>`,
`fix <slug>`, `review all case studies`.

The agents are a strict superset of the original setup prompt (full frameworks +
image reading + template fit + word budgets + structural ops + auto-fill drafts).
Four blind spots remain. This spec covers the three that need no new dependency;
the fourth (visual/screenshot review) is a deferred follow-up.

### Goals
1. **Personalize** every verdict and rewrite to the designer's real target.
2. **Verify** the editor's output automatically — catch regressions before the
   designer sees them.
3. **Portfolio-level consistency** — review voice/positioning across all studies.

### Non-goals (this round)
- Screenshot / rendered-slide review (deferred; will reuse the app's existing
  html2canvas/jspdf export, not a new browser dependency).

---

## Unit 1 — `cases/reviews/_designer-profile.md` (shared personalization)

One file, read by ALL agents (3 reviewers, editor, critic, consistency). Replaces
per-agent generic assumptions with the designer's actual target.

### Sections
- **Target role & level** — e.g. "Senior Product Designer → Staff / Lead"
- **Industries / domains** — e.g. B2B / clinical SaaS, healthtech
- **Target companies / type** — e.g. mid-stage healthtech, focused product pods
- **Positioning / superpower** — e.g. systems thinking; one reusable card system so
  new tools feel familiar (card-system-reuse signature)
- **Voice & tone** — first-person, decision-owning; active voice; no filler
- **Non-negotiables** — hard rules (MOST IMPORTANT section): always first-person
  ownership; never fabricate metrics; every invented value goes in
  "Drafted values to verify"; respect the fixed-canvas word budgets
- **Anti-patterns** — what to avoid (passive "we" drift; metrics with no n/baseline;
  wall-of-text slides)

### Confirmed-flag mechanism (per refinement)
Every seeded value carries a confirmation flag so agents know authoritative vs.
guess. Format:

```markdown
## Target role
Senior Product Designer → Staff / Lead
confirmed: false — drafted from session context, verify this
```

- `confirmed: true` → authoritative; agents may rely on it fully.
- `confirmed: false` → a draft; agents use it as a hint but must NOT make strong
  claims that depend on it. The **critic flags any rewrite that leans heavily on an
  unconfirmed profile value.**
- Seed values come from this session (iTero, WizeCare, B2B/clinical SaaS,
  card-system-reuse signature, first-person voice) — all start `confirmed: false`
  for the designer to confirm/adjust.

### Integration
- 3 reviewers + editor + critic + consistency each get a one-line instruction to
  read `_designer-profile.md` first and aim their work at it.
- CLAUDE.md `review`/`fix`/`check portfolio` triggers reference it.

---

## Unit 2 — Critic loop (`case-study-critic` agent + verify step)

A new read-only agent (`tools: [Read, Grep, Glob]`, model sonnet) that runs
**automatically inside `fix`**, after edits are applied.

### Inputs
- Post-fix extracted text (re-run `extract <slug>` after apply)
- `cases/reviews/<slug>/edit-summary.md` (esp. "Drafted values to verify")
- The three verdicts + `synthesis.md`
- `_designer-profile.md`, `_slide-templates.md`

### Checks
1. **Lost meaning** — a key point the original made that the rewrite dropped.
2. **Over-claim / fabrication** — a metric/number/claim presented as fact that is
   NOT listed in "Drafted values to verify". (Unflagged invented numbers = blocking.)
3. **Contradiction** — cross-slide inconsistency (counts, claims, names).
4. **Voice / profile drift** — doesn't match the profile's voice/target; OR leans
   heavily on a `confirmed: false` profile value.
5. **Budget / canvas** — any slide still over its word budget.

### Output + blocking threshold (per refinement)
Writes `cases/reviews/<slug>/verify-report.md` with a verdict:
- **PASS** — no blocking issues.
- **CONCERNS** — at least one BLOCKING issue: a fabricated/unflagged metric, or a
  contradiction. The `fix` flow MUST surface CONCERNS explicitly to the designer
  ("⚠ Critic flagged N blocking issues — review before using") rather than only
  writing the report. Non-blocking nits are listed but don't trigger CONCERNS.

Each issue: severity (blocking / nit), slide + path, what's wrong, recommended fix.

### `fix` trigger change (step 4.5)
apply → validate JSON → **re-extract** → run `case-study-critic` → read
`verify-report.md` → if CONCERNS, surface the blocking issues prominently in the
final message; if PASS, note it passed.

---

## Unit 3 — Portfolio consistency (`portfolio-consistency` agent + trigger)

A new read-only agent that reviews the WHOLE portfolio. **Never runs inside `fix`**
(it reads all studies; you usually work on one). Manual only.

### Inputs
- Every case study's extracted text (generate `extract` for each slug in
  `src/data/case-studies/index.js`)
- `_designer-profile.md`

### Checks
- **Voice consistency** — same person across all decks? (first-person, tone)
- **Positioning / seniority consistency** — do they all signal the same level/lane?
- **Structural consistency** — which canonical beats each deck is missing
- **Quality spread** — strongest / weakest, and why
- **Repeated phrasing** — phrases/claims reused across studies (staleness)
- **Naming / label consistency** — section labels, client naming

### Output
`cases/reviews/PORTFOLIO-CONSISTENCY.md` — per-study table + cross-portfolio findings
+ top fixes ranked by portfolio impact.

### Triggers
- New standalone trigger: **`check portfolio`** (or "portfolio consistency").
- Also appended to the end of `review all case studies`.

---

## Sequencing (the full system after this round)

```
_designer-profile.md  (shared, always read)
        ↓
3 reviewers in parallel  (read profile + extracted text + images + templates)
        ↓
editor  (read profile + verdicts → writes edits.json)
        ↓
apply → validate → re-extract
        ↓
critic  (AUTOMATIC, inside fix — blocks on fabrication/contradiction)
        ↓
designer reviews output
        ↓
portfolio consistency  (MANUAL: `check portfolio`, when a batch is done)
```

---

## Files

**Create**
- `cases/reviews/_designer-profile.md` (seeded, all `confirmed: false`)
- `.claude/agents/case-study-critic.md`
- `.claude/agents/portfolio-consistency.md`

**Modify**
- `.claude/agents/{ux-reviewer,design-recruiter,design-director,case-study-editor}.md`
  — add "read `_designer-profile.md`" line + aim work at it
- `CLAUDE.md` — `fix` gains step 4.5 (critic); `review`/reviewer prompts reference
  the profile; new `check portfolio` trigger; `review all` appends consistency;
  file-structure block adds the new artifacts
- `scripts/case-study-text.mjs` — none required (critic/consistency re-use `extract`).
  Optional: a convenience `extract-all` is NOT needed (the trigger loops slugs).

**No new dependencies.**

---

## Deferred (next round) — Visual / screenshot review
Capture rendered slides to `cases/reviews/<slug>/shots/` by reusing the app's
existing html2canvas/jspdf export, then give the ux-reviewer the image set so it
critiques real visual craft (hierarchy, spacing, the card layouts). Out of scope here.

## Verification
- `review wizecare` → confirm all 3 reviewers cite the profile.
- `fix wizecare` → confirm the critic runs after apply and writes `verify-report.md`;
  intentionally leave a fabricated number in an edit and confirm a CONCERNS verdict
  is surfaced. Then `git checkout` the test.
- `check portfolio` → confirm `PORTFOLIO-CONSISTENCY.md` is written across all slugs.
