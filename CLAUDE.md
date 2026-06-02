# Portfolio v3 — guide for Claude

This file gives you working context for this repo so you don't waste turns
re-discovering structure or repeating known mistakes. Read it first on every
session.

---

## What this project is

A personal portfolio site + case-study presentation system, built with:

- **React 19** + **Vite 5** + **React Router 7**
- Custom CSS (no Tailwind here — vanilla CSS files per-component)
- **Dexie** (IndexedDB) for case-study persistence in edit mode
- **GSAP** + **Framer Motion** for animation
- **html2canvas** + **jspdf** for PDF export and screenshot capture
- **react-zoom-pan-pinch** for mobile slide artboard zoom/pan

Sister project: `~/Documents/ux-case-study-agent` (a separate Vite app that
talks to this one via dev-only HTTP endpoints defined in
`vite-plugin-save-case-study.js`). Not part of this repo — but if the user
mentions "the agent", that's what they mean.

---

## Dev workflow

```bash
npm run dev           # Vite on port 5173 (predev kills :5173 first)
npm run build         # production build — RUN before any commit you make
npm run lint          # eslint
```

- **Default dev port is 5173.** The `predev` script kills anything on 5173
  before starting, so a stale dev server is rarely the cause if `npm run dev`
  fails — check Vite cache first: `rm -rf node_modules/.vite` and the
  user-cache at `~/Library/Caches/portfolio-v3-vite`.
- **"Failed to fetch dynamically imported module" errors** in the browser are
  almost always stale Vite session state (the browser holds hashed URLs from
  a previous dev server). Recovery: hard-refresh (Cmd+Shift+R) → close the
  tab → restart dev server.

---

## The case study slide system (the big one)

This is the most touched-and-fragile area of the codebase. ~80% of recent
sessions have been here.

### File map

```
src/
├── pages/
│   ├── CaseStudy.jsx          # 9k+ lines — renders 24 slide types in view + edit mode
│   ├── CaseStudy.css          # 15k+ lines — the slide design system
│   ├── CaseStudy.site.css     # Override layer for "scroll-page" site-embed mode
│   ├── SlideDocumentation.jsx # /docs/slides — template gallery for the design agent
│   └── SlideDocumentation.css
├── data/
│   ├── caseStudyData.js       # In-memory defaults; persists via Dexie
│   ├── slideTemplateDocs.js   # Template metadata for the gallery
│   └── case-studies/*.json    # Saved case studies (written by save endpoint)
├── context/EditContext.jsx    # Edit-mode toggle + persistence
└── components/                # Hero, Projects, Nav, About — all non-slide UI
docs/
└── slide-scaling-figma-style.md  # READ THIS — full spec of the canvas system
```

### Canvas mode (Figma-style fixed 1920×1080 scaling) — view mode only

Slides in **view mode** (`.case-study:not(.edit-mode)`) use a fixed-canvas
system. Read `docs/slide-scaling-figma-style.md` for full detail. Quick model:

- `.slide-inner` is **always** 1920×1080px in its own coordinate space.
- It's **absolutely positioned** at the math-center of the safe area between
  the case-nav top overlay (56px) and the slide-nav-pill bottom overlay
  (64px), then `transform: translate(-50%, -50%) scale(--slide-canvas-scale)`.
- `--slide-canvas-scale` is computed by JS in `CaseStudy.jsx` (the effect at
  line ~1552, "Figma-canvas scaler") as
  `min(slideWidth / 1920, (slideHeight - safeTop - safeBottom) / 1080)`.
- ResizeObserver on `.case-study-slides-wrapper` re-fires the scaler on every
  container resize. **Do not** observe `window` for this — use the wrapper.

### Typography system

Variables defined at the top of `CaseStudy.css` under
`/* ═══ Slide Typography System ═══ */`. Eight sizes (Figma reference scale),
three leadings, three trackings, two weights. The current sizes:

| Tier | Var | Size |
|---|---|---|
| Title | `--slide-font-display` | 96px |
| Header 1 | `--slide-font-h1` | 60px |
| Header 2 | `--slide-font-h2` | 48px |
| Header 3 | `--slide-font-h3` | 36px |
| Body 1 | `--slide-font-body-lg` | 36px |
| Body 2 | `--slide-font-body` | 30px |
| Body 3 | `--slide-font-caption` | 24px |
| Note | `--slide-font-meta` | 20px |

`--slide-font-body-lg` (Body 1) is reserved for lead/intro paragraphs
(`.intro-description`, `.showcase-description`, `.project-showcase-description`,
`.goals-showcase-description`); its override block sits right after the BODY
block in the override layer.

There's a comprehensive override layer (in the same file, look for
"Canvas-mode typography overrides") that maps every visible slide-text class
across all 24 slide types to these variables, scoped to
`.case-study:not(.edit-mode) .slide-inner`. **When adding a new slide
template, you MUST add its text classes to this override layer** or the new
template will fall back to the raw `clamp()`-based sizes that exist
elsewhere in the file. See `docs/slide-scaling-figma-style.md` for the full
class-coverage table per slide type.

### Edit mode is separate

All canvas-mode CSS is scoped to `:not(.edit-mode)`. Edit mode keeps the
older fluid-clamp layout because editor controls were tuned against it.
**Never modify edit mode behavior without explicit user request** — it's a
working surface and the user has been bitten by regressions before.

### Title + paragraph grouping

In view mode, `.split-content` / `.intro-content` / etc. have `gap: 0` with
explicit `margin-top` on adjacent siblings. When a `h1`/`h2` is immediately
followed by a `*-description-wrapper` or `*-text-wrapper`, the gap is **8px**
(tight, matches the `.dynamic-bullets` chip→list pattern). All other adjacent
pairs are **24px**. If you add a new description wrapper class, add it to
the adjacent-sibling rule block.

### The slide templates

The authoritative list is `Object.keys(slideTemplates)` in
`src/data/caseStudyData.js` — **20 templates**:

`intro, info, media, textAndImage, quotes, goals, stats, outcomes, end,
comparison, process, timeline, issuesBreakdown, achieveGoals, tools,
testimonial, imageMosaic, chapter, directions, reflection`

Each has its own JSX render block in `CaseStudy.jsx` and its own CSS class
family in `CaseStudy.css`, plus a doc entry in `src/data/slideTemplateDocs.js`.

Notes that trip people up:
- **`directions`** is the slide labelled **"Ideation"** in the picker (the old
  `ideation` divergence-grid template was removed). It renders before/after-style
  columns with Accepted/Rejected chips.
- **`problem`, `context`, `feature`, `testing`** are NOT separate templates —
  they are `type` aliases rendered by the **`textAndImage`** template.
- `define`, `impact`, `iteration`, `wireframes` do **not** exist (despite older
  notes). Don't reference them.

---

## How to work in this repo — operating principles

These are based on patterns that have hurt past sessions. Follow them.

### 1. CSS changes: diagnose before editing

When the user says "no visible change" or "still cut off" or similar:
**stop adding more rules. Identify the actual blocker first.**

- Inspect ancestor chain for `overflow: hidden`, `max-height`, `transform`,
  `position: absolute/fixed`, and conflicting `display` (grid vs flex).
- Check CSS specificity. The file has `:not(.edit-mode)` scoped rules at
  specificity 3; in-element `style` attrs from JSX win over all CSS.
- Don't escalate to `!important` until you've confirmed it's actually a
  specificity problem, not a missing rule problem.
- For canvas-mode issues: `--slide-canvas-scale` value in DevTools tells you
  if the JS scaler is firing. The artboard's `transform` shows the result.

### 2. Slide work spans 24 templates — audit first

Before making a typography or layout change, enumerate every slide type it
affects. The CSS file is 15k+ lines and the JSX is 9k+ lines — partial
changes have repeatedly missed classes (split-content, dynamic-images, intro
variants were all missed in recent passes).

Use Grep / the Explore agent up front, not one-class-at-a-time after the
user reports something looks wrong.

### 3. Don't restructure JSX without confirming scope

The CaseStudy.jsx renderer has 24 slide-type branches, edit-mode toggles, and
template-mode variants. JSX surgery is high-risk. If a request can be solved
in CSS (adjacent-sibling selectors, the canvas-mode override layer),
prefer CSS. Confirm before doing structural JSX changes.

### 4. Edit and Write tools, not Bash with cat/echo/sed

For files in this repo: use `Read` + `Edit` for changes. Reserve `Bash` for
git, grep, find, npm scripts. Editing CaseStudy.css via shell heredocs
or sed has burned past sessions.

### 5. Keep responses tight

The user works in fast iterative loops. Token-limit errors have killed past
sessions. Don't reprint large file contents in your messages. Don't write
long preambles. State what you changed and what to look for, then stop.

### 6. Backups before destructive refactors

The user's `git status` is usually noisy (many uncommitted edits in
progress). Before any sweeping change, create a backup branch:
`git branch backup/<name>` at HEAD. The user has appreciated this repeatedly.

### 7. Don't commit unless asked

Default to leaving changes uncommitted. The user pushes when they're ready.
If the user does say "commit" or "push", run `npm run build` first to verify
no regressions, then commit specific files (not `git add -A`).

---

## Known gaps / things to flag if they come up

These are documented in `docs/slide-scaling-figma-style.md` as well — but
worth surfacing here for quick reference:

- **~2,970 `rem`/`em`/`vw`/`clamp()` units still exist in `CaseStudy.css`.**
  They're *overridden in view mode* by the canvas-mode typography layer for
  covered classes, so visible behavior matches the scale. A full
  source-level sweep replacing each with the scale variables is a
  multi-session refactor.
- **17 in-slide `@media` queries still in source.** Several do real work
  (mobile artboard scaling at `(max-width: 767px)`, short-viewport caps at
  `(max-height: 800/600/500px)`, edit-mode neutralization). Removing them
  requires per-query browser verification.
- **Mobile `.slide-design` artboard (1440×810)** uses
  `react-zoom-pan-pinch` for pinch/zoom — separate from desktop canvas mode.
  Hasn't been aligned with the new canvas math yet.
- **`CaseStudy.site.css`** is an additive override for "scroll-page" embed
  mode. Canvas-mode positioning hasn't been verified against this mode.
- **Backup branch from the canvas refactor**: `backup/pre-slide-scaling`.

---

## Other areas of the codebase (lighter touch)

| Area | Files |
|---|---|
| Home / Hero | `src/components/Hero.*`, `HeroCanvas.jsx`, `HeroGridArt.jsx`, `HeroInlineArt.jsx` |
| Project grid | `src/components/Projects.*` |
| About + rotator | `src/pages/About.*`, `src/components/AboutRotator.*` |
| CV builder | `src/pages/CVBuilder.*` |
| Nav / theme | `src/components/Navigation.*`, `ThemeToggle.*` |
| Edit panel (case studies) | `src/components/EditPanel.*`, `EditContext.jsx` |
| Image variants | `src/utils/`, `vite-plugin-save-case-study.js`, manifest at `src/data/case-study-image-variants.json` |

These have less active iteration and are usually safe to touch with normal
caution.

---

## When in doubt

- Read `docs/slide-scaling-figma-style.md` for the canvas system.
- Check the typography override layer in `CaseStudy.css` for class coverage.
- For exploration / audits, spawn an Explore agent up-front rather than
  guessing at file locations.
- Ask the user to confirm scope before sweeping refactors — multi-hour
  CSS rewrites have repeatedly hit token limits and left the work
  half-applied.

---

# Case Study Review System (text only)

Reviews and rewrites the **text** of the real case studies in
`src/data/case-studies/<slug>.json`. **Text only — never touches images, layout,
config fields, JSX, React components, CSS, or slide UI.** Source of truth for
slugs is `src/data/case-studies/index.js` (currently: `itero-scan-workflow`,
`project-1776014998709`, `project-1776617213367`, `project-1776628169716`,
`timeline.html`, `wizecare`).

The agents live in `.claude/agents/` (case-study-author, ux-reviewer, design-recruiter,
design-director, case-study-editor, copy-writer, case-study-critic,
portfolio-consistency). `case-study-author` is the **inverse** of the rest: instead of
reviewing/fixing an existing deck, it AUTHORS a brand-new one from a designer-written
brief (see "create case study" below).
They are **template-aware**: a generated catalog of all 20 slide templates and
their elements lives at `cases/reviews/_slide-templates.md`, so reviewers judge
whether each slide uses the right template and the editor can add/remove/retype
slides correctly.

They are also **personalized**: every agent reads `cases/reviews/_designer-profile.md`
(the designer's target role/level, industries, positioning, voice, and
non-negotiables) and aims its work at that target instead of a generic role. Each
profile value carries a `confirmed: true/false` flag — agents may rely on confirmed
values but must keep claims soft where they depend on an unconfirmed one. If the
profile file is missing, create it from the template in the spec before reviewing.

They are also **context-aware**: each study may carry an OPTIONAL
`cases/reviews/<slug>/context.md` (written from the Agents Hub Context tab) with two
sections — **Facts to use** (real timeline/role/research/outcomes the agents must use
instead of inventing) and **Wondering whether to add** (open questions the reviewers
answer and the fix acts on). If the file is absent, the pipeline behaves exactly as
before. With it present, agents **never fabricate**: anything missing and uncovered
becomes a visible `[ADD: …]` placeholder rather than a guess.

A deterministic helper does all JSON I/O so no agent ever hand-edits raw JSON:

```
node scripts/case-study-text.mjs new "<title>"    # scaffold a blank case study (slug = project-<timestamp>), register it in index.js
node scripts/case-study-text.mjs templates        # (re)generate cases/reviews/_slide-templates.md
node scripts/case-study-text.mjs extract <slug>   # JSON prose → cases/reviews/<slug>/extracted.md
node scripts/case-study-text.mjs apply   <slug>   # cases/reviews/<slug>/edits.json → back into the JSON
```

`new` writes a minimal valid skeleton (`{ dataVersion, title, subtitle, category, year,
color, slides: [] }`) and regenerates `index.js` itself (the Vite plugin only does that on
an HTTP save), then prints `slug: project-<timestamp>` on its last line. The
`case-study-author` agent then fills the empty `slides` via `apply` insert ops. This is the
ONLY way to create a new case study from the CLI — `apply` requires the JSON to already exist.

`extract` surfaces, per slide: the **image files to READ** (content like quotes lives
in images), the **available unused template fields** (so the editor adds `metaItems`
etc. instead of cramming data into prose), the **word count vs budget** (these are
fixed-canvas slides — keep them scannable), and a top-of-file **cross-slide
duplication check** (prose repeated on 2+ slides → merge/cut; image-vs-text repeats
still need an image read). The agents are instructed to act on all of these.

`apply` accepts text edits (path-id → new text), `setFields` (create/replace
structured fields like `metaItems`/`headlineMetric`), AND structural ops
(`insert` / `remove` / `retype` / `move` whole slides, indices referencing original
order). `move` (`{ "op": "move", "index": N, "after": M }`, `after: -1` = first)
**reorders** a slide for storytelling without changing its content — agents may
reposition any slide when a different slide number serves the narrative better.
It refuses to write image/layout/config keys and read-only data (`metric`,
`number`, `year`), validates the result is valid JSON, and writes byte-for-byte
matching formatting. `cases/reviews/<slug>/` holds all generated artifacts; the
JSON in `src/data/case-studies/` is the only thing that changes.

**Why JSON edits may not show in the app — `dataVersion`.** In dev the app loads
each case study from **IndexedDB/localStorage first** (the user's edit-mode copy)
and only falls back to the JSON; it discards the cached copy only when the JSON's
top-level `dataVersion` is **higher** than the cached one (see
`getCaseStudyData`/`getCaseStudyDataAsync` in `caseStudyData.js`). So a JSON with
no/low `dataVersion` is invisible in the running app. `apply` therefore **auto-bumps
`dataVersion` on every change** — after a fix, the user must **hard-refresh
(Cmd+Shift+R)** to let the app reset its cache and load the new JSON. Every case
study JSON should carry a `dataVersion` (the others use 4+).

## Trigger: "create case study" / "create <brief-name>"
Builds a BRAND-NEW case study from a designer-written brief — the inverse of
`review`/`fix`. The designer drops a filled brief at `cases/briefs/<name>.md` (copied from
`cases/briefs/_BRIEF-TEMPLATE.md`). The brief carries the problem, what they did, role/
outcomes, and an **asset inventory** (videos of flows, screenshots, user-flow diagrams).

1. **Check the brief exists** — `cases/briefs/<name>.md`. If missing, point the designer to
   `cases/briefs/_BRIEF-TEMPLATE.md` ("fill this, save as `cases/briefs/<name>.md`, re-run")
   and stop.
2. **Prepare inputs**: `node scripts/case-study-text.mjs templates` (refresh the catalog);
   ensure `cases/reviews/_designer-profile.md` exists (create from the spec template if not).
3. **Scaffold + capture the slug**: `node scripts/case-study-text.mjs new "<title from the
   brief>"`. Read the printed `slug: project-<timestamp>` — that's `<slug>` for the rest.
   Then `node scripts/case-study-text.mjs extract <slug>` (the empty skeleton gives the
   author its top-level path scaffold).
4. **Backup branch**: `git branch backup/case-create-<slug>` at HEAD.
5. **Author the deck** — run `case-study-author`: "Author a new case study. The slug is
   `<slug>`; the brief is `cases/briefs/<name>.md`. Read in order:
   `cases/reviews/_designer-profile.md`, that brief, `cases/reviews/_slide-templates.md`,
   `cases/reviews/<slug>/extracted.md`. Build the deck as an ops-only edits.json (every slide
   an `insert` with `after: -1`, intro first / end last), map the brief to the 10 canonical
   beats, placeholder-fill any missing beat, and leave captioned empty image slots for each
   inventory asset. Write `cases/reviews/<slug>/edits.json` and
   `cases/reviews/<slug>/author-summary.md`."
6. **Apply**: `node scripts/case-study-text.mjs apply <slug>` — confirm all inserts applied
   and 0 refused. **Validate JSON**:
   `node -e "JSON.parse(require('fs').readFileSync('src/data/case-studies/<slug>.json'))"`.
7. **Run the full review→fix loop inline** (reuse the `review <slug>` then `fix <slug>`
   triggers below verbatim): re-extract → ux-reviewer + design-recruiter + design-director in
   parallel → `synthesis.md` → case-study-editor → `apply` → copy-writer → `apply` →
   case-study-critic + the autonomous self-remediation loop. (Reviewers will note the
   still-empty asset slots as gaps — expected; the designer fills them next.)
8. **Cross-study fit**: run the `portfolio-consistency` agent (the study is real text now) →
   `cases/reviews/PORTFOLIO-CONSISTENCY.md`.
9. **Consolidated report**: `node scripts/case-study-text.mjs report <slug>` → `FIX-REPORT.md`.
10. **Show the designer a FINISHED draft, not a gate.** Lead with the outcome ("Done — new
    deck built: N slides across the 10 beats; critic PASS after cleanup"). Then surface:
    the **Beat coverage map** + **Suggested/placeholder slides** (from `author-summary.md`);
    the **Asset slots to fill** list (what to drop in via in-app edit mode); the critic's
    **Verify before sending** checklist; and the portfolio-consistency note. Tell them:
    hard-refresh (Cmd+Shift+R) to see it in the project grid, add the real images/videos in
    edit mode, answer the verify checklist, then `resolve <slug>`. Undo: delete
    `src/data/case-studies/<slug>.json` + `git checkout` `index.js`, or restore the backup branch.

## Trigger: "run hub jobs"
Drains the Agents Hub job queue — `cases/reviews/_jobs/*.json`, written by the browser
Hub (the `/agents-hub` page). Each job names an existing pipeline to run. Never
hand-edit job JSON — go through `scripts/hub-jobs.mjs`.

1. `node scripts/hub-jobs.mjs list queued` → queued jobs (already oldest-first).
2. For each queued job, in order:
   a. `node scripts/hub-jobs.mjs set <id> running`.
   b. Run the existing trigger for the job's `action`, using its fields:
      - `create` → the browser already ran `new`, so the job carries a real `slug`.
        Run the **author → review → fix** part of the "create case study" flow on that
        existing `slug`, with brief `cases/briefs/<briefName>.md`. Do NOT scaffold again.
      - `review` → the "review <slug>" flow.
      - `fix`    → the "fix <slug>" flow.
      - `resolve`→ the "resolve <slug>" flow, applying the job's `answers` array
        (each item `{ item, decision: "keep"|"genericize"|"replace", value }`):
        keep = confirm as-is, genericize = remove the unverifiable specific, replace =
        substitute `value`. Then re-extract → critic → report as the resolve flow does.
   c. On success: `node scripts/hub-jobs.mjs set <id> done "<one-line result>"`.
      On any failure: `node scripts/hub-jobs.mjs set <id> error "<reason>"`, then
      continue to the next job (one bad job never blocks the rest).
3. Print a one-line summary per job. The browser Hub polls `/api/hub/jobs` and updates
   itself; the designer hard-refreshes the app to see new/changed decks.

## Trigger: "review <slug>"
Example: `review wizecare`

1. **Check it exists** — `src/data/case-studies/<slug>.json`. If missing, list the
   available slugs from `index.js` and stop.
2. **Prepare inputs**: run `node scripts/case-study-text.mjs templates` (refreshes
   `cases/reviews/_slide-templates.md`) and `node scripts/case-study-text.mjs extract
   <slug>` (writes `cases/reviews/<slug>/extracted.md`).
3. **Spawn all 3 review agents in parallel** (single message, multiple Agent
   calls — do not wait for one before the next). Each reads the extracted file, the
   template catalog, AND `cases/reviews/_designer-profile.md`:
   - `ux-reviewer` → "Review `cases/reviews/<slug>/extracted.md` (templates:
     `cases/reviews/_slide-templates.md`, profile: `cases/reviews/_designer-profile.md`,
     plus `cases/reviews/<slug>/context.md` if it exists).
     Apply your full 6-step framework, including template fit and missing slides, aimed
     at the profile's target. Write to `cases/reviews/<slug>/ux-verdict.md`."
   - `design-recruiter` → same (templates: `cases/reviews/_slide-templates.md`, profile:
     `cases/reviews/_designer-profile.md`, plus `cases/reviews/<slug>/context.md` if it
     exists), writing to `recruiter-verdict.md`.
   - `design-director` → same (templates: `cases/reviews/_slide-templates.md`, profile:
     `cases/reviews/_designer-profile.md`, plus `cases/reviews/<slug>/context.md` if it
     exists), writing to `director-verdict.md`.
4. **After all 3 finish, synthesize** — read the 3 verdicts, write
   `cases/reviews/<slug>/synthesis.md`:
   - `## Where all 3 agents agree` — highest-confidence, non-negotiable fixes
   - `## Conflicts — DECIDED` — for each reviewer disagreement, **pick a verdict yourself**,
     grounded in `_designer-profile.md` (favor the option that best serves the profile's
     target — Senior, SaaS). Format: the tension in one line, then `→ Verdict: <decision>` +
     a one-line rationale. Do NOT punt with "your call"; decide. (The designer can still
     override, but the default is decided.)
   - `## Top 5 action items ordered by impact`
   - `## Seniority signal` — Junior / Mid / Senior / Principal + 1-sentence evidence
   - `## Overall verdict` — Ready to Send / Almost There / Needs Work / Rethink
5. **Show the synthesis in the terminal**, then say: "Run `fix <slug>` to apply
   the text rewrites. Full verdicts are in `cases/reviews/<slug>/`." Stop.

## Trigger: "fix <slug>"
1. **Backup branch first**: `git branch backup/case-text-<slug>` at HEAD (skip if
   it already exists). This is editing live site content — always back up.
2. Run `case-study-editor` with: "The slug is <slug>. Read in order:
   `cases/reviews/_designer-profile.md`, `cases/reviews/<slug>/extracted.md`,
   `cases/reviews/<slug>/context.md` (if it exists), `cases/reviews/_slide-templates.md`,
   then `ux-verdict.md`, `recruiter-verdict.md`,
   `director-verdict.md`, `synthesis.md`. Write `cases/reviews/<slug>/edits.json`
   (text edits + any insert/remove/retype slide ops) and
   `cases/reviews/<slug>/edit-summary.md`. **First build the verdict-coverage matrix
   (Step 1.5): enumerate EVERY actionable recommendation from all three verdicts +
   synthesis, one row each, and disposition each as APPLIED (→ path/op) / DECLINED (→
   reason) / DESIGNER (→ verify list). The matrix is the first section of edit-summary.md
   and is mandatory — no verdict item may be silently skipped.**"
3. **Apply**: `node scripts/case-study-text.mjs apply <slug>` — report applied text
   edits, applied slide ops (added/removed/retyped), and anything refused.
4. **Verify JSON**: `node -e "JSON.parse(require('fs').readFileSync('src/data/case-studies/<slug>.json'))"`
   (confirms valid JSON); optionally `npm run build`.
4.25 **Copy-writer (automatic — voice pass)**: re-extract the post-editor text
   (`node scripts/case-study-text.mjs extract <slug>`), then run the `copy-writer` agent:
   "Voice-polish case study <slug>. Read `_designer-profile.md` (Voice / English notes /
   jargon rule are your brief), `cases/reviews/<slug>/extracted.md`,
   `cases/reviews/<slug>/context.md` (if it exists), and `edit-summary.md`.
   Write `cases/reviews/<slug>/copy-edits.json` and `cases/reviews/<slug>/copy-summary.md`."
   Then apply it explicitly: `node scripts/case-study-text.mjs apply <slug>
   cases/reviews/<slug>/copy-edits.json`. (Voice only — it emits no slide ops.)
4.5 **Critic + autonomous self-remediation loop (always run).** Re-extract
   (`node scripts/case-study-text.mjs extract <slug>`), then run `case-study-critic`:
   "Critique the post-fix case study <slug>. Read `_designer-profile.md`,
   `cases/reviews/<slug>/extracted.md`, `cases/reviews/<slug>/context.md` (if it exists),
   `edit-summary.md`, `copy-summary.md`, `synthesis.md`, the three verdicts, and
   `_slide-templates.md`. Write `cases/reviews/<slug>/verify-report.md`.
   Anything the agents could not source from the deck or Facts to use must appear as an
   `[ADD: …]` placeholder, NOT an invented value — flag any invented specific as a
   blocking CONCERN."
   The pipeline FIXES ITS OWN problems — do not hand them to the designer:
   - **If the critic returns CONCERNS** (agent-invented unflagged fabrication, a
     contradiction, or a **verdict-coverage gap** — a recommendation missing from the matrix
     or marked APPLIED but not actually in the deck): run a targeted remediation pass (the
     `case-study-editor` or `copy-writer`, whichever fits) addressing ONLY those blocking
     issues — fix the contradiction; for an agent fabrication flag it in "Drafted values to
     verify" or soften it; for a coverage gap APPLY the missed recommendation (or explicitly
     DECLINE it with a reason in the matrix). Apply, re-extract, re-run the critic. **Loop up
     to 2 rounds.**
   - **Over-budget slides** the critic lists: auto-trim them in the same remediation pass
     (never leave any slide over budget).
   - Only escalate to the designer if a BLOCKING issue genuinely survives 2 rounds.
   The designer's own pre-existing unverified specifics are NOT blocking — they belong on
   the critic's "Verify before sending" checklist, untouched.
5. **Show the user a FINISHED result, not a gate.** Lead with the outcome ("Done — N edits
   across editor + copy-writer; critic PASS after autonomous cleanup"). Then:
   - The critic's **"Verify before sending"** checklist — the ONE thing that needs the
     designer's own knowledge (is "Sarah" real? is the 89-ticket count real?). Frame as
     "confirm or I'll genericize", not as a blocker.
   - The `confirmed: false` profile decisions still open.
   - A short note of what the passes changed (voice/jargon/structure) + any genuine
     `AGENT CONFLICT`.
   - "Applied to `src/data/case-studies/<slug>.json` (hard-refresh to see). Undo:
     `git checkout` the file or restore the pre-fix snapshot." Keep it brief — the system
     did the work; the designer gets a checklist, not a pile of decisions.
6. **Write the consolidated report** — `node scripts/case-study-text.mjs report <slug>`.
   This generates `cases/reviews/<slug>/FIX-REPORT.md`: the ONE place the designer reads
   after a fix. It pulls together (a) the **ground-truth word-budget table** computed from
   the live JSON — so the budget shown ALWAYS matches what actually shipped, never an
   agent's claim; (b) the critic verdict; (c) the **"Verify before sending"** checklist
   (the Sarah-is-she-real questions); (d) the **deliberation** (where the reviewers
   disagreed, from synthesis); (e) links to each pass's summary. Point the designer to it:
   "Read `cases/reviews/<slug>/FIX-REPORT.md`."

`node scripts/case-study-text.mjs budget <slug>` prints the budget table on its own any time.

## Trigger: "resolve <slug>"
Closes the verify loop after a `fix`. The designer has answered the
"Verify before sending" checklist — either in chat ("Sarah's not real, the 89 tickets is
real, my role is Senior Product Designer") or by annotating
`cases/reviews/<slug>/FIX-REPORT.md` next to each item. Apply those answers:

1. **Collect the answers.** Read them from chat and/or the annotated FIX-REPORT verify
   section. Classify each verify item as **KEEP** (real / confirmed), **GENERICIZE**
   (not real / can't confirm), or **REPLACE: <value>** (substitute a real value).
2. **Run the resolver** (use `case-study-editor` with a focused brief): "Apply these verify
   resolutions to <slug>. For GENERICIZE items, remove the unverifiable specific and rewrite
   to a defensible version (named person → unnamed clinician; invented number → softened
   claim with no fake figure) — staying in voice and budget. For REPLACE items, substitute
   the given value. Touch ONLY the listed fields. Write `cases/reviews/<slug>/edits.json`
   (+ `setFields` if needed) and note each change." Then `apply`.
3. **Record what's now settled** → append to `cases/reviews/<slug>/confirmed.md` (create if
   needed): every KEEP and REPLACE item as a confirmed specific (slide · the value · the
   designer confirmed it). The critic reads this and stops re-flagging them.
4. **Profile values.** If an answer confirms a `confirmed: false` profile value (role,
   timeline, target), update `_designer-profile.md` — flip it to `confirmed: true` with the
   real value.
5. **Re-verify + regenerate**: `extract` → `case-study-critic` → `report`. The resolved items
   drop off the "Verify before sending" list; show the updated, shorter checklist.

Repeat fix→read→resolve until the checklist is empty. That's "done".

## Trigger: "review all case studies"
Run the full `review <slug>` sequence for every slug in
`src/data/case-studies/index.js`. Then write `cases/reviews/MASTER-REPORT.md`: a
`Slug | Verdict | Seniority Signal | Top Fix` table, the top-3 issues recurring
across studies, the strongest study, and the one most needing work. Finally, run the
`check portfolio` trigger (below) for the cross-study consistency pass. Show both in
the terminal.

## Trigger: "check portfolio"
Cross-study consistency — run MANUALLY (never inside `fix`; it reads every study).
1. Refresh extracted text for every slug in `index.js`
   (`node scripts/case-study-text.mjs extract <slug>` for each).
2. Run the `portfolio-consistency` agent: "Review the whole portfolio for voice,
   positioning, seniority, structural, and quality consistency against
   `cases/reviews/_designer-profile.md`. Read every `cases/reviews/<slug>/extracted.md`.
   Write `cases/reviews/PORTFOLIO-CONSISTENCY.md`."
3. Show the report in the terminal.

## The 10 canonical case-study beats (for judging completeness)
1. Cover  2. Problem Statement  3. Research Overview  4. Key Insights
5. Design Exploration  6. Iteration Evidence  7. Final Solution
8. Outcome/Impact  9. Process Timeline  10. Reflection

## File structure
```
src/data/case-studies/<slug>.json   ← the real case study (text + slides rewritten here; `new` scaffolds it)
scripts/case-study-text.mjs         ← new / extract / apply / templates helper (structure-safe)
scripts/hub-jobs.mjs                ← job-queue I/O (enqueue/list/set) shared by the /agents-hub UI endpoints + the "run hub jobs" trigger
cases/reviews/_jobs/<id>.json       ← Agents Hub queue (gitignored; written by the /agents-hub UI, drained by "run hub jobs")
cases/briefs/_BRIEF-TEMPLATE.md     ← copy this to start a NEW case study (input to case-study-author)
cases/briefs/<name>.md              ← a filled brief: problem + what you did + asset inventory
cases/reviews/_designer-profile.md  ← designer's target/voice/non-negotiables (ALL agents read; confirmed: flags)
cases/reviews/_slide-templates.md   ← generated catalog of all 20 templates (agents read this)
cases/reviews/<slug>/
  author-summary.md                 ← (create flow) beat-coverage map, asset slots to fill, drafted values to verify
  extracted.md                      ← prose pulled from the JSON (input to reviewers + critic)
  ux-verdict.md                     ← craft + template-fit review
  recruiter-verdict.md              ← hiring review
  director-verdict.md               ← positioning + structure review
  synthesis.md                      ← unified verdict + action items
  edits.json                        ← editor's { edits, setFields, ops } (structure + content)
  edit-summary.md                   ← what the editor changed (opens with the VERDICT COVERAGE MATRIX:
                                       every verdict+synthesis recommendation → APPLIED/DECLINED/DESIGNER)
  copy-edits.json                   ← copy-writer's voice-pass edits (text only, no ops)
  copy-summary.md                   ← voice/jargon changes the copy-writer made
  verify-report.md                  ← critic's post-fix verdict (PASS | CONCERNS + blocking issues)
cases/reviews/MASTER-REPORT.md      ← overview across all case studies
cases/reviews/PORTFOLIO-CONSISTENCY.md ← cross-study voice/positioning/quality (check portfolio)
```
