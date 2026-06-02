# Agents Hub — per-study context + never-invent policy — design spec

**Date:** 2026-06-02
**Status:** approved (brainstorming) → ready for implementation plan
**Builds on:** `2026-06-02-agents-hub-design.md`

## Context & purpose

Running the review→fix pipeline on a real deck (`project-1776617213367`, "The Techno
Chronicles") surfaced one dominant problem: when the deck was missing facts (timeline,
research, outcomes, a reflection), the `case-study-editor` and `copy-writer`
**invented plausible specifics** in the designer's first-person voice — a "4-week"
timeline, two whole rejected design directions, the entire reflection — and asked the
designer to fact-check them afterward via the "Verify before sending" list. A large
fraction of a "finished" deck was fiction.

This spec fixes that at the source: let the designer optionally hand each study a small
**context file** with the real facts and their open questions, and change the agents to
**never fabricate** — anything missing and uncovered becomes a visible `[ADD: …]`
placeholder, not a guess.

## The hard requirement: optional

The feature is **entirely optional and additive**. If a study has no context file, the
pipeline behaves exactly as it does today. No trigger, endpoint, or agent may *require* a
context file. Absence of context is the default, not an error.

## Scope

In:
- An optional per-study context file with two sections (Facts to use / Wondering whether to add).
- A Hub **Context** tab to read/write that file in the browser.
- Agent + trigger changes so review/fix read the context when present.
- A **never-invent** policy across all pipeline agents, with `[ADD: …]` placeholders.
- A small hygiene fix: agents stop stating word counts (defer to the `budget` script).

Out (YAGNI):
- "Don't touch / constraints" and "Free notes" sections (deferred — the two chosen
  sections cover the need).
- A combined "Context → Review → Fix" one-shot button (rejected: the designer wants to
  read the review verdicts before the fix rewrites the deck).
- Reusing the brief for context (rejected: couples context to the create-flow; this must
  work for studies that already exist).
- Any change to the slide renderer, the JSON schema, `case-study-text.mjs`, or edit mode.

## The context file

One optional file per study: `cases/reviews/<slug>/context.md`. Free-form markdown under
two fixed `##` headings the agents read by section:

```markdown
## Facts to use
- Timeline: 3 weeks, evenings only
- Role: solo — design + build
- Research: none (personal project)
- Live at technoh.webflow.io

## Wondering whether to add
- Should I add a slide on the ASCII-portrait technique?
- Is it worth mentioning this was built in a week?
```

- **Facts to use** — ground truth the agents MUST use instead of inventing.
- **Wondering whether to add** — open questions the reviewers answer (keep / cut / how)
  and the fix acts on.
- No rigid schema inside a section; the headings are the only contract.
- Sits beside the study's other artifacts in `cases/reviews/<slug>/`. Committed or
  gitignored alongside the rest of `cases/reviews/<slug>/` (same treatment as
  `extracted.md` etc.).

## How the agents use it

A shared block added to every pipeline agent (`ux-reviewer`, `design-recruiter`,
`design-director`, `case-study-editor`, `copy-writer`, `case-study-critic`,
`portfolio-consistency`, and `case-study-author`):

1. **Read `cases/reviews/<slug>/context.md` if it exists.** If absent, proceed as today.
2. **Never fabricate.** A specific the agent does not have (timeline, metric, role,
   research, headcount, a reflection's content, a design direction) is taken from
   **Facts to use** when present. If it is not in facts and not on the deck, the fix
   inserts a **visible `[ADD: …]` placeholder** — never a plausible guess. The literal
   `[ADD: …]` form is used so placeholders are greppable and visually obvious in the deck.
3. **Each Wondering item gets an explicit verdict** in the review (with one-line
   reasoning). The fix then either (a) adds it using real content from Facts, (b) adds it
   as an `[ADD: …]` placeholder if the designer owes the content, or (c) records why it
   was declined — in the editor's verdict-coverage matrix.
4. **No word-count claims.** Agents never state or estimate word counts; the deterministic
   `case-study-text.mjs budget` table is the only source of truth. (Fixes the false
   "~58 words" / "over budget" mismatches seen this run.)

Effect on "Verify before sending": it stops being a pile of agent fictions. It becomes
(a) `[ADD: …]` slots the designer fills, plus (b) the designer's *own* pre-existing
unverified claims. Agent-invented specifics no longer appear there because agents no
longer invent.

## Hub UI

New **Context** tab in `AgentsHub.jsx` (added to the existing `TABS` array):

- **`ContextView.jsx`** — study picker (select from `overview.studies`) → two labelled
  textareas ("Facts to use", "Wondering whether to add") → **Save**. On select, loads the
  existing `context.md` (split on the two headings) into the textareas; empty if none.
  Mirrors the existing `CreateView` brief editor pattern.
- **`StudiesView.jsx`** — show a "context ✓" badge on rows whose study has a context file,
  so the designer can see at a glance which studies are primed.

## Dev endpoints (`vite-plugin-save-case-study.js`)

- **Write:** `POST /api/hub/context` `{ slug, facts, wondering }` → writes
  `cases/reviews/<slug>/context.md` from the two sections (sanitized slug, whitelisted to
  `cases/reviews/**`, reuse the existing traversal guard). Returns `{ path }`.
- **Read:** reuse the existing `GET /api/hub/file?path=cases/reviews/<slug>/context.md`.
- **Overview:** `GET /api/hub/overview` adds a `hasContext: boolean` per study (cheap
  `pathExists` check) to drive the badge.

No new job type — the context file is read off disk by slug inside the existing
`review`/`fix` jobs; the `_jobs` schema is unchanged.

## CLAUDE.md changes

- The `review <slug>` and `fix <slug>` triggers instruct each spawned agent to read
  `cases/reviews/<slug>/context.md` **if it exists** (optional), and state the never-invent
  + `[ADD: …]` policy and the no-word-count rule.
- A short "per-study context" note in the Case Study Review System section documenting the
  file, its two sections, and the optional behavior.

## Files

| Action | Path |
|---|---|
| NEW | `src/components/agents-hub/ContextView.jsx` |
| NEW (per study, optional) | `cases/reviews/<slug>/context.md` |
| MODIFY | `src/pages/AgentsHub.jsx` (Context tab) |
| MODIFY | `src/components/agents-hub/StudiesView.jsx` (context badge) |
| MODIFY | `src/data/agentsHubApi.js` (writeContext wrapper) |
| MODIFY | `vite-plugin-save-case-study.js` (`/api/hub/context` write + `hasContext` in overview) |
| MODIFY | `.claude/agents/*.md` (8 agents — never-invent + read-context + no-word-count) |
| MODIFY | `CLAUDE.md` (triggers + context doc) |

No changes to `case-study-text.mjs`, the case-study JSON schema, the slide renderer, or
edit mode.

## Error handling
- Endpoints throw `{statusCode}` on bad/non-whitelisted slug; `wrap()` returns `{error}`;
  UI surfaces it inline per-action.
- Missing context file is never an error anywhere — it is the default path.
- A malformed `context.md` (missing a heading) degrades gracefully: a section that can't
  be found is treated as empty.

## Testing / verification
1. **Optional path:** a study with no `context.md` reviews and fixes exactly as before
   (regression check against current behavior).
2. **Endpoint:** `POST /api/hub/context` writes the file from two sections; reading it back
   via `/api/hub/file` returns the two headings; non-whitelisted/`..` slug rejected.
3. **UI:** Context tab loads existing context into the textareas, Save round-trips,
   StudiesView shows the badge after save.
4. **Never-invent:** run `fix` on a deck missing a fact with NO context → the deck contains
   a `[ADD: …]` placeholder for it and the critic does not list an agent-invented specific.
5. **Facts honored:** add the fact to context → re-run `fix` → the placeholder is replaced
   by the real value, no `[ADD: …]` remains for it.
6. **No word-count claims:** agent summaries/reports contain no word-count assertions; the
   budget table comes only from `case-study-text.mjs budget`.
7. `npm run build` passes.

## Open questions (resolve in the plan)
- **Context tab placement** — standalone tab vs. a panel inside Studies. Lean: standalone
  tab (matches Create). Confirm during planning.
- **`[ADD: …]` rendering in the live deck** — confirm a placeholder string in a text field
  renders harmlessly (it will; it's just text) and is visually obvious enough in view mode.
