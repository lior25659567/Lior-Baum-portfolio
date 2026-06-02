# Agents Hub — design spec

**Date:** 2026-06-02
**Status:** approved (brainstorming) → ready for implementation plan

## Context & purpose

The case-study review/fix/create pipeline (see the "Case Study Review System"
section of `CLAUDE.md`) is powerful but **chat-only**: every action is a typed
trigger (`review <slug>`, `fix <slug>`, `create case study <name>`, `resolve
<slug>`), and every result is a raw markdown file the designer opens by hand.

This spec adds a **dev-only "Agents Hub" page** that gives the same workflow a UI:
browse/edit briefs, scaffold a new study, kick off review/fix/create, read every
verdict/report/budget rendered nicely, and answer the verify checklist — all from
the browser, in edit mode.

### The one hard constraint

The AI passes (ux-reviewer, design-recruiter, design-director, case-study-author,
case-study-editor, copy-writer, case-study-critic, portfolio-consistency) are
**Claude agents**. They run in the Claude Code session, NOT in the browser, and
there is no `claude` CLI invocation anywhere in the repo. So the browser cannot
"think" on its own. The design splits responsibilities accordingly:

- **Browser** does all *deterministic* work (scaffold, brief I/O, budgets, reading
  artifacts) by calling new dev endpoints that shell out to
  `scripts/case-study-text.mjs` — the exact `wrap()` + `exec()` pattern already used
  by `/api/compress-videos` and `/api/convert-images-to-webp`.
- **Claude (chat)** does the *AI* passes, dispatched through a **job queue**. The
  designer drains the queue with one command: `run hub jobs`.

This is **Approach A (Cockpit + job queue)**, chosen over full-auto (`claude -p`
shell-out — rejected for v1: depends on the CLI being installed/authed, runs a
second Claude out of the loop, more failure modes) and cockpit-only (rejected: the
queue is barely more work and gives a cleaner status loop). The queue is designed so
a future "one-click auto-run" toggle (Approach B) can sit on top without rework.

## Scope (v1)

In: create-new (brief → deck), review + fix existing, artifact viewer + budgets,
verify checklist + resolve.

Out (YAGNI): one-click auto-run (Approach B), live streaming agent logs, visual slide
editing (edit mode already does that). The Hub touches **text/structure + viewing
only** — never images on disk, JSX, React, or CSS, consistent with the existing
text-only pipeline.

## Architecture

```
┌─────────────────────────── Browser (dev + edit mode only) ───────────────────────────┐
│ /agents-hub  →  AgentsHub.jsx                                                          │
│   left rail: studies + briefs            main panel: Create | Studies | Artifacts |    │
│                                                        Verify/Resolve                  │
│   - deterministic actions → call dev endpoints directly (instant)                     │
│   - AI actions → POST a job, show "queued", poll status                               │
└───────────────┬───────────────────────────────────────────────────────┬──────────────┘
                │ new dev endpoints (vite-plugin-save-case-study.js)      │ polls
                ▼                                                         ▼
   exec node scripts/case-study-text.mjs <new|budget|extract|templates>   GET /api/hub/jobs
   read/write whitelisted files (cases/reviews/**, cases/briefs/**)
                │
                ▼  writes job file
   cases/reviews/_jobs/<id>.json   ◀────────────  Claude Code chat: "run hub jobs"
                                                   reads queued jobs → runs existing
                                                   create/review/fix/resolve pipeline →
                                                   writes artifacts + updates job status
```

### Data flow per action

| UI action | Deterministic (browser, instant) | Queued (Claude drains) |
|---|---|---|
| Create from brief | `new "<title>"` → study appears; write/update brief | `create` job → author + review + fix |
| Review | — | `review` job → 3 reviewers + synthesis |
| Fix | — | `fix` job → editor + copy-writer + critic loop |
| Resolve verify items | write answers into the job payload | `resolve` job → resolver + re-critic + report |
| View artifacts | read files, `budget` table | — |

## Components

### 1. Page + nav (mirror existing dev-only pages)
- **`src/pages/AgentsHub.jsx`** + **`src/pages/AgentsHub.css`** — new page, route
  `/agents-hub`, registered in `src/App.jsx` (synchronous import, like the other
  dev pages). Gate: render only when `import.meta.env.DEV && editMode`; otherwise
  `navigate('/')`. Uses `useEdit()` for `editMode`.
- **`src/components/Navigation.jsx`** — add `{ label: 'Agents Hub', href: '/agents-hub' }`
  to the existing `editMode` nav spread (one line; desktop + mobile share the array).

### 2. Hub data layer
- **`src/data/agentsHubApi.js`** — thin fetch wrappers for the new endpoints
  (`getOverview`, `runScript`, `readFile`, `writeBrief`, `enqueueJob`, `getJobs`).
  Keeps `fetch` boilerplate out of the component. All no-ops/throw clearly in prod
  (the page never renders there anyway).

### 3. Main panel views (within AgentsHub.jsx, or split into `src/pages/agents-hub/` subcomponents if the file grows past ~300 lines)
- **CreateView** — brief picker (lists `cases/briefs/*.md` minus `_BRIEF-TEMPLATE.md`);
  "New brief" seeds the textarea from `_BRIEF-TEMPLATE.md`; Save writes the brief;
  "Scaffold + queue" runs `new` then enqueues a `create` job referencing the brief.
- **StudiesView** — rows from `overview`; each has Review / Fix / View buttons + a
  budget pill (from `runScript('budget', slug)`), and badges for which artifacts exist.
- **ArtifactsView** — tabs for `extracted`, `ux-verdict`, `recruiter-verdict`,
  `director-verdict`, `synthesis`, `edit-summary`, `copy-summary`, `verify-report`,
  `FIX-REPORT`; each rendered with react-markdown + remark-gfm. Live budget table.
- **VerifyView** — fetch `FIX-REPORT.md`, parse the "Verify before sending" section
  into items; each item → keep / genericize / replace(value); "Apply" enqueues a
  `resolve` job with the answers array.
- **JobsBar** — persistent banner: count of queued/running jobs + the literal
  reminder to type `run hub jobs` in Claude Code; polls `/api/hub/jobs` every few
  seconds while any job is non-terminal; on transition to `done`, refreshes overview.

### 4. Markdown rendering
Add **`react-markdown`** + **`remark-gfm`** (GFM tables for the budget + coverage
matrices). A single `<Markdown>` wrapper component with scoped CSS in `AgentsHub.css`.

### 5. Dev endpoints (all in `vite-plugin-save-case-study.js`, dev-only, via `wrap()`)
All reads/writes are **whitelisted** to `cases/reviews/**`, `cases/briefs/**`,
`src/data/case-studies/*.json`; paths are normalized and `..` is rejected (reuse the
existing `/about` traversal-guard pattern).

- `GET /api/hub/overview` → `{ studies:[{slug,title,slideCount,artifacts:[...]}],
  briefs:[name], jobs:[{id,action,slug,status,createdAt,note}] }`. One call = dashboard.
- `POST /api/hub/run` `{ cmd, slug?, title? }` → runs **only** a whitelisted subcommand
  (`new` | `budget` | `extract` | `templates`) via
  `exec('node scripts/case-study-text.mjs …', {cwd, timeout, maxBuffer})`; returns
  `{ stdout, stderr, code, slug? }`. `apply` is deliberately **not** whitelisted —
  agents own it. `new` parses the printed `slug:` line and returns it.
- `GET /api/hub/file?path=` → `{ path, content }` (whitelisted read).
- `POST /api/hub/brief` `{ name, content }` → writes `cases/briefs/<name>.md`
  (name sanitized to `[a-z0-9-_]`); returns `{ path }`.
- `POST /api/hub/job` `{ action, slug?, briefName?, answers? }` → writes
  `cases/reviews/_jobs/<id>.json` with `status:"queued"`; `id` =
  `<action>-<slug-or-brief>-<counter>` (no `Date.now()` needed; counter from existing
  files). Returns the job.
- `GET /api/hub/jobs` → `{ jobs:[...] }` (for polling; same shape as in overview).

### 6. Job queue + the `run hub jobs` trigger
- **Queue dir:** `cases/reviews/_jobs/` (gitignored or committed — see Open question).
- **Job schema:**
  ```json
  { "id": "create-project-1780-1", "action": "create|review|fix|resolve",
    "slug": "project-…", "briefName": "myproject", "answers": [ … ],
    "status": "queued|running|done|error", "createdAt": "<iso>",
    "note": "one-line result or error" }
  ```
- **`CLAUDE.md` new trigger — `run hub jobs`:**
  1. List `cases/reviews/_jobs/*.json` with `status:"queued"`, oldest first.
  2. For each: set `status:"running"`; run the existing pipeline for its `action`
     (`create`/`review`/`fix`/`resolve`) **verbatim — no new agent logic**, using the
     job's `slug`/`briefName`/`answers`; on success set `status:"done"` + a one-line
     `note` (e.g. "12 slides, critic PASS"); on failure set `status:"error"` + the
     reason. Continue to the next job.
  3. Report a short summary of jobs processed.
  - **Job state is never hand-edited.** A small new script `scripts/hub-jobs.mjs`
    owns all job JSON I/O with three subcommands: `enqueue <action> [--slug …]
    [--brief …] [--answers …]`, `list [--status queued]`, and `set <id> <status>
    [note]`. The `/api/hub/job` + `/api/hub/jobs` endpoints call it (or import its
    functions); the `run hub jobs` trigger calls `list` then `set` around each job.
    One code path, structure-safe, used by both the browser and Claude.

## Error handling
- Endpoints throw `{statusCode}` on bad/again-whitelisted paths; `wrap()` already
  returns `{error}` + logs. UI surfaces endpoint errors inline per-action (no global
  crash).
- `exec` failures (non-zero exit) return `{stdout,stderr,code}` with `code!==0`; UI
  shows stderr.
- A job that errors stays as a visible `error` row with its note; the designer can
  retry by re-queuing. No silent drops.
- Prod safety: the page refuses to render outside `import.meta.env.DEV`, and the
  endpoints only exist on the dev middleware — they are absent from the production
  build entirely.

## Testing / verification
1. **Endpoints (curl):** `overview` returns studies+briefs+jobs; `run` with
   `cmd:"new"` creates a study and returns its slug; `run` with `cmd:"budget"` returns
   the table; `file` reads a whitelisted path and rejects `../` and non-whitelisted
   roots; `brief` writes a sanitized file; `job` enqueues and `jobs` lists it.
2. **Page:** with `npm run dev` + edit mode on, the nav shows "Agents Hub"; the route
   renders; outside edit mode / in a prod build it redirects.
3. **Round-trip:** create a brief in the UI → Scaffold (study appears in grid after
   hard-refresh) → a `create` job shows "queued" → in chat `run hub jobs` runs the
   pipeline and flips the job to "done" → Artifacts view renders the verdicts +
   FIX-REPORT, budget table shows 0 over budget → Verify view lists checklist items →
   answering + Apply enqueues a `resolve` job.
4. `npm run build` passes (page tree-shakes/guards cleanly in prod).

## Open questions (resolve in the plan)
- **Commit the `_jobs/` dir?** Lean: gitignore `cases/reviews/_jobs/` (transient local
  state). Confirm during planning.
- **Subcomponent split:** keep AgentsHub.jsx whole vs. split into `src/pages/agents-hub/*`
  — decide by size once drafted (target: no file > ~300 lines).

## Files

| Action | Path |
|---|---|
| NEW | `src/pages/AgentsHub.jsx`, `src/pages/AgentsHub.css` |
| NEW | `src/data/agentsHubApi.js` |
| NEW | `scripts/hub-jobs.mjs` (job list/set/enqueue — shared by endpoint + trigger) |
| MODIFY | `src/App.jsx` (route), `src/components/Navigation.jsx` (nav entry) |
| MODIFY | `vite-plugin-save-case-study.js` (6 `/api/hub/*` endpoints) |
| MODIFY | `CLAUDE.md` (`run hub jobs` trigger + Hub section) |
| MODIFY | `package.json` (add react-markdown, remark-gfm) |
| MODIFY | `.gitignore` (ignore `cases/reviews/_jobs/` — pending open question) |

No changes to the case-study slide renderer, CSS design system, or edit-mode behavior.
