# WizeCare — Copy-writer voice pass

The editor's pass already did the heavy de-jargoning and warmed most of the deck.
This is a light VOICE-only pass: 5 fields re-voiced, 0 `setFields`, 0 `ops`. No
facts, metrics, names, dates, structure, or read-only fields touched. Every
"Drafted values to verify" value from the edit-summary is left exactly as-is.

### Voice fixes

- **slides.0.title** — `"Reducing Clinician Friction in Home Physical Therapy"` →
  `"Making everyday clinician work feel like less work"`. The cover title was a
  corporate noun-phrase ("Reducing X Friction in Y"). Rewrote it as a plain human
  sentence that says the same thing — the platform should make the work feel
  lighter. This is the line a hiring manager reads first, so it carries the most
  voice weight.

- **slides.5.title** — `"How we validated the redesign"` →
  `"How I tested the redesign"`. Fixed the one "we" drift (Non-negotiable:
  first-person ownership) and swapped the textbook word "validated" for the plain
  "tested."

- **slides.5.sections.2.content** — was `"Usability testing with 8 clinicians
  confirmed the consolidated patient view, single-screen editing, and protocol
  builder each resolved one breakdown."` (passive, method-report tone) →
  `"I ran the new flows past 8 clinicians and watched them work. The consolidated
  patient view, single-screen editing, and protocol builder each fixed one of the
  three breakdowns."` First-person, two short sentences (English-notes rule), same
  facts (8 clinicians, three fixes).

- **slides.6.subtitle** — `"Where clinicians land first — and spent most of their
  time lost."` had a tense clash (present "land" / past "spent"). Fixed to
  `"Where clinicians land first — and where they got lost most."` — consistent and
  reads aloud cleanly.

- **slides.14.title** — `"Concrete impact: faster workflows, fewer errors, higher
  adoption"` read like a slide label ("Concrete impact:" + three abstract nouns) →
  `"What changed: faster days, fewer mistakes, more people actually using it"`.
  Same three claims, but in a person's words — "faster days," "more people actually
  using it." The metrics below it stay untouched.

### Jargon removed / explained

- None new this pass. The editor already cleared the technical terms (contextual
  inquiry, Kanban, modal overlays, "card system"). I removed two soft textbook
  words — "validated" and "Usability testing… confirmed" (slide 5) — which read as
  method-report language rather than jargon, but lower the seniority/voice signal.

### Left alone

Already in Lior's voice — not touched:
- **slides.0.description** — editor's warm, plain rewrite. Strong as-is.
- **slides.1** (problem) — first-person, specific, has the Sarah quote. Good.
- **slides.3** (research-pivot quotes) — "stopped asking and started watching" is
  the best beat in the deck; leave it.
- **slides.4** (goals) — "What I set out to fix — and why" plus the constraint
  callouts are decisive and on-voice.
- **slides.9 / 10 / 13** — editor already de-jargoned and voiced these (the
  "reading a map," "sticky notes," "no new way of working to learn" lines). Good.
- **slides.15** (reflection) — honest, first-person, owns the misstep. Leave.
- **slides.16.subtitle** — "Designing systems that respect the people who use
  them." Slightly slogan-y but warm and true to the deck; kept.

### Notes

- **slides.0.title** is one word longer than the previous title (8 vs 7) on the
  one slide flagged OVER-budget. The over-budget came from the description, which
  the editor already trimmed; titles render large and a single word doesn't break
  the canvas. If it ever needs to shrink, drop "everyday":
  `"Making clinician work feel like less work"` (7 words). Flagging so the designer
  can choose.
- I kept the positioning soft per the `confirmed: false` flags — no "Senior" or
  "SaaS" labels added, no hardening of the card-pattern thesis into a branded
  signature. Voice carries the seniority, not self-labeling.
