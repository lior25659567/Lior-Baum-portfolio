# Designer profile — Lior Baum

Shared context for every case-study agent (the 3 reviewers, the editor, the critic,
the copy-writer, the portfolio-consistency agent). Read this FIRST and aim your work
at it instead of generic assumptions.

**Every value carries a `confirmed:` flag.**
- `confirmed: true` → authoritative. Rely on it fully.
- `confirmed: false` → a draft. Use it as a hint, but do NOT make strong claims that
  depend on it, and never present it to the designer as settled fact. The **critic
  flags any rewrite that leans heavily on an unconfirmed value.**

The designer should review this file and flip values to `confirmed: true` (editing
them as needed). Until then, treat the whole profile as provisional.

---

## Designer
Lior Baum — Product & UX Designer. ~3 years of experience. Based in Israel. Working
language is English (non-native — writing should be clear, natural, and human, never
stiff or over-formal).
confirmed: true

## Target role & level
Senior Product Designer at a SaaS web application company. Not looking for agency work.
Not looking for another clinical role right now — the clinical experience is a
differentiator, not the destination.
confirmed: false — confirm whether "SaaS web app" is the right framing, or if clinical
SaaS is still in scope.

## Industries / domains
- Current: clinical healthtech (iTero / Align Technology, WizeCare).
- Target: SaaS web applications — B2B, workflow-heavy, product-led.

The clinical background is proof of working in high-stakes, complex UX — use it as
credibility, not as a niche to stay in.
confirmed: false — confirm this framing: "clinical was the training ground, SaaS
product is the destination."

## Target companies / type
Mid-size SaaS product companies with a real design culture. Focused product pods where
one designer owns a workflow end-to-end. Not large enterprise orgs where designers ship
fragments. Not agencies.
confirmed: false — confirm company size and structure preference.

## Positioning / superpower
Takes complex, intimidating workflows and makes them feel simple and familiar.
Signature move: reuses one mental model (e.g. a card system) across flows so new
features feel like something the user already knows. Adoption through familiarity;
friction removal over feature richness. Proven in clinical environments where trust and
clarity are non-negotiable.
confirmed: false — drawn from the WizeCare card-system work; confirm this is how Lior
wants to be positioned in a SaaS context.

## Voice & tone

**What the writing SHOULD sound like**
- First person, decision-owning: "I simplified it to one screen because…"
- Warm and a little funny — Lior has personality; the writing should too. Not jokes,
  but human. A reader should feel like a real person wrote this.
- Accessible: no jargon, no tech-speak, no clinical terminology unless it's immediately
  explained. A non-designer should understand the case study.
- Specific and grounded: "47% of users dropped off", not "users struggled".
- Confident but not arrogant. Shows thinking, not just output.

**What the writing should NOT sound like**
- Corporate and stiff ("leveraged synergies", "stakeholder alignment").
- Over-technical ("implemented a component library with tokenized variables").
- Textbook UX ("following a double-diamond process, I conducted…").
- Generic ("I wanted to improve the user experience").
- Passive and invisible ("the design was iterated upon").
confirmed: true — this voice direction is locked in.

## English writing notes
Lior is a non-native English speaker. The copy-writer and editor should:
- Write in clear, natural English — not simplified, but not unnecessarily complex.
- Prefer short sentences over long compound ones.
- Avoid idioms that don't translate naturally.
- Read the output aloud (mentally) — if it sounds unnatural, rewrite it.
- Never "correct" Lior's personality out of the writing in the name of formality.
confirmed: true

## The technical-jargon rule
Case studies must be readable by a non-designer hiring manager or a founder who is not
a UX expert. Specifically:
- No component/dev terminology unless explained in plain English immediately after.
- No process jargon without context ("affinity mapping" → "grouping user quotes to find
  patterns").
- Design-system language is fine IF explained: "I built a card system — one reusable
  pattern used across every screen — so the product felt consistent without redesigning
  each feature from scratch."
- Test: if a smart non-designer would have to Google a term, rewrite it.
confirmed: true

## Non-negotiables — HARD RULES, never violate
- **First-person ownership.** Use "I" for Lior's own decisions. Do not drift into vague
  "we" that hides who did what.
- **Never fabricate metrics, quotes, named people, or dates.** Draft plausible values
  when auto-filling, but every invented value MUST appear in the edit-summary's
  "Drafted values to verify" list. An unflagged invented number is a blocking error.
- **Respect the fixed-canvas word budgets.** Slides are presentations, not docs.
  Scannable in seconds. Cut ruthlessly.
- **No jargon without a plain-English explanation immediately after.**
- **Text only / structure-safe.** Edit case-study JSON via the helper script only. Never
  touch images, layout/config fields, JSX, React, or CSS.
confirmed: true

## Anti-patterns — never let these appear
- Passive "we" drift — ownership ambiguity.
- Metrics with no baseline, no timeframe, no n.
- Wall-of-text slides.
- Same content repeated across two slides.
- Generic insights that could apply to any product.
- Technical terms used without explanation.
- Writing that sounds like a process checklist, not a story.
- Any sentence that makes Lior sound like a junior following instructions rather than a
  senior making decisions.
confirmed: true

## Seniority signal to aim for
Every case study should read at Senior level minimum: "Here is the problem I solved and
the tradeoffs I navigated" — not "here is the process I followed." With ~3 years of
experience targeting Senior roles, the writing needs to close the gap. The way to do
that is not to inflate the work — it is to be precise and decisive about the thinking
behind every decision.
confirmed: true

## How to use this profile
- **Reviewers (ux-reviewer, design-recruiter, design-director):** calibrate every verdict
  to this target. "Strong for a junior" is not useful. The question is: "Does this read
  like a Senior SaaS designer who can own a complex workflow end-to-end?" If not — say
  exactly what's missing.
- **Editor (case-study-editor):** every rewrite must match the Voice section above.
  Non-negotiables are hard constraints. Flag any `confirmed: false` value you rely on heavily.
- **Copy-writer (copy-writer):** the Voice and jargon rules are your primary brief. Make it
  sound like Lior — warm, specific, decided, human. Not polished-corporate. Not textbook UX.
- **Critic (case-study-critic):** flag any rewrite that drifted from the voice; any jargon
  without explanation; any fabricated value not in "Drafted values to verify"; any
  `confirmed: false` value used as if it were authoritative.
- **Portfolio-consistency:** check that all case studies together sound like the same person
  described here — same voice, same seniority signal, same positioning toward SaaS product roles.
