# Agents Hub — per-study context + never-invent policy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the designer attach an optional per-study context file (real facts + open questions) that the review/fix agents read, and change all pipeline agents to never fabricate — inserting visible `[ADD: …]` placeholders for anything missing and uncovered.

**Architecture:** A dev-only `POST /api/hub/context` endpoint writes `cases/reviews/<slug>/context.md` from two sections; `/api/hub/overview` reports `hasContext` per study. A new `ContextView` Hub tab edits the file; `StudiesView` shows a badge. The 8 pipeline agents and the `review`/`fix` CLAUDE.md triggers are updated to read the file when present and follow a never-invent + `[ADD: …]` + no-word-count rule. The feature is fully optional: no context file = current behavior everywhere.

**Tech Stack:** React 19 + Vite 5 (vanilla CSS), the existing `vite-plugin-save-case-study.js` dev middleware, `scripts/case-study-text.mjs`. No test runner — verification is `npm run build`, `npm run lint`, curl against the dev server, `node -e` assertions, and grep.

**Spec:** `docs/superpowers/specs/2026-06-02-agents-hub-context-design.md`

---

## Conventions used in this plan

- **The dev server:** start once with `npm run dev` (kills :5173 first via `predev`), wait for `curl -s http://localhost:5173/api/health` to return JSON, then run the curl checks. Vite hot-reloads the plugin on save; if an endpoint 404s after an edit, restart `npm run dev`.
- **`context.md` on-disk format** (the one contract between writer and reader):

  ```markdown
  ## Facts to use

  <facts text, verbatim>

  ## Wondering whether to add

  <wondering text, verbatim>
  ```

- Commit after each task. Branch is already `feat/agents-hub`; commit straight to it.

---

## Task 1: Context write endpoint + `hasContext` in overview

**Files:**
- Modify: `vite-plugin-save-case-study.js` (add endpoint after the `/api/hub/brief` block ~line 259; add `hasContext` in the `/api/hub/overview` studies loop ~line 192-197)

- [ ] **Step 1: Add `hasContext` to the overview studies loop**

In `/api/hub/overview`, the loop currently builds `artifacts`. Find:

```js
          const adir = path.join(reviewsDir, slug);
          const artifacts = [];
          if (await pathExists(adir)) {
            for (const a of HUB_ARTIFACTS) if (await pathExists(path.join(adir, `${a}.md`))) artifacts.push(a);
          }
          studies.push({ slug, title, slideCount, artifacts });
```

Replace the last line with a `hasContext` check:

```js
          const adir = path.join(reviewsDir, slug);
          const artifacts = [];
          if (await pathExists(adir)) {
            for (const a of HUB_ARTIFACTS) if (await pathExists(path.join(adir, `${a}.md`))) artifacts.push(a);
          }
          const hasContext = await pathExists(path.join(adir, 'context.md'));
          studies.push({ slug, title, slideCount, artifacts, hasContext });
```

- [ ] **Step 2: Add the `/api/hub/context` write endpoint**

Immediately AFTER the existing `/api/hub/brief` middleware block (the one ending with `return { path: ...; name: clean };` then `}));`), add:

```js
      // Write a per-study context file (optional facts + open questions the
      // pipeline agents read). Whitelisted to cases/reviews/<slug>/context.md.
      server.middlewares.use('/api/hub/context', wrap('/api/hub/context', async (req) => {
        assertMethod(req, 'POST');
        const { slug = '', facts = '', wondering = '' } = await readJson(req);
        if (!/^[a-z0-9._-]+$/i.test(slug) || slug.includes('..')) { const e = new Error('bad slug'); e.statusCode = 400; throw e; }
        const dir = path.resolve('cases/reviews', slug);
        await fsp.mkdir(dir, { recursive: true });
        const body = `## Facts to use\n\n${String(facts).trim()}\n\n## Wondering whether to add\n\n${String(wondering).trim()}\n`;
        await fsp.writeFile(path.join(dir, 'context.md'), body, 'utf-8');
        return { path: `cases/reviews/${slug}/context.md` };
      }));
```

- [ ] **Step 3: Start the dev server (if not already running)**

Run: `npm run dev` (in the background), then poll:
`for i in $(seq 1 20); do curl -s http://localhost:5173/api/health >/dev/null && echo UP && break; sleep 1; done`
Expected: `UP`

- [ ] **Step 4: Verify the endpoint writes the file**

Run:
```bash
curl -s -X POST http://localhost:5173/api/hub/context -H 'Content-Type: application/json' \
  -d '{"slug":"project-1776617213367","facts":"Timeline: 3 weeks","wondering":"Add a research slide?"}'
```
Expected: `{"ok":true,"path":"cases/reviews/project-1776617213367/context.md"}`

Then confirm the file content:
```bash
curl -s "http://localhost:5173/api/hub/file?path=cases/reviews/project-1776617213367/context.md"
```
Expected: JSON whose `content` contains `## Facts to use`, `Timeline: 3 weeks`, `## Wondering whether to add`, and `Add a research slide?`.

- [ ] **Step 5: Verify slug guards + overview `hasContext`**

Run:
```bash
curl -s -X POST http://localhost:5173/api/hub/context -H 'Content-Type: application/json' -d '{"slug":"../../etc/x","facts":"x","wondering":"y"}'
curl -s http://localhost:5173/api/hub/overview | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const o=JSON.parse(s);const st=o.studies.find(x=>x.slug==='project-1776617213367');console.log('hasContext:',st.hasContext)})"
```
Expected: first call returns `{"error":"bad slug"}`; second prints `hasContext: true`.

- [ ] **Step 6: Commit**

```bash
git add vite-plugin-save-case-study.js
git commit -m "feat(hub): /api/hub/context write endpoint + hasContext in overview"
```

---

## Task 2: `writeContext` API wrapper

**Files:**
- Modify: `src/data/agentsHubApi.js` (add one export at end)

- [ ] **Step 1: Add the wrapper**

After the existing `export const enqueueJob = ...` line, add:

```js
export const writeContext = (slug, facts, wondering) => jsonPost('/api/hub/context', { slug, facts, wondering });
```

- [ ] **Step 2: Verify lint passes**

Run: `npm run lint`
Expected: no new errors referencing `agentsHubApi.js`.

- [ ] **Step 3: Commit**

```bash
git add src/data/agentsHubApi.js
git commit -m "feat(hub): writeContext api wrapper"
```

---

## Task 3: `ContextView` component (load / edit / save context)

**Files:**
- Create: `src/components/agents-hub/ContextView.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/agents-hub/ContextView.jsx` with:

```jsx
import { useState, useEffect } from 'react';
import { readFile, writeContext } from '../../data/agentsHubApi';

// Split a context.md back into its two sections for the textareas.
// Tolerant: a missing heading yields an empty section.
function parseContext(md) {
  if (!md) return { facts: '', wondering: '' };
  const norm = md.replace(/\r\n/g, '\n');
  const wi = norm.search(/^##\s+Wondering whether to add\s*$/m);
  const fi = norm.search(/^##\s+Facts to use\s*$/m);
  let facts = '', wondering = '';
  if (fi >= 0) {
    const end = wi > fi ? wi : norm.length;
    facts = norm.slice(fi, end).replace(/^##\s+Facts to use\s*$/m, '').trim();
  }
  if (wi >= 0) {
    wondering = norm.slice(wi).replace(/^##\s+Wondering whether to add\s*$/m, '').trim();
  }
  return { facts, wondering };
}

const ContextView = ({ studies, selectedSlug, setSelectedSlug, onRefresh }) => {
  const [facts, setFacts] = useState('');
  const [wondering, setWondering] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFacts(''); setWondering(''); setStatus('');
    if (!selectedSlug) return;
    readFile(`cases/reviews/${selectedSlug}/context.md`)
      .then((r) => { const p = parseContext(r.content); setFacts(p.facts); setWondering(p.wondering); })
      .catch(() => { /* no context yet — start blank */ });
  }, [selectedSlug]);

  const save = async () => {
    if (!selectedSlug) { setStatus('Pick a study first.'); return; }
    setBusy(true);
    try {
      await writeContext(selectedSlug, facts, wondering);
      await onRefresh();
      setStatus('Saved. Review / Fix will read this context. Optional — leave blank to skip.');
    } catch (e) { setStatus(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        <select className="hub-input" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          <option value="">— pick a study —</option>
          {studies.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
        <button className="hub-btn primary" disabled={busy || !selectedSlug} onClick={save}>Save context</button>
      </div>
      <p className="hub-sub">Optional. Real facts here stop the agents inventing them; open questions get answered in the review. Leave empty and nothing changes.</p>
      {status && <div className="hub-pill" style={{ display: 'block', marginBottom: 8 }}>{status}</div>}
      {selectedSlug && (
        <>
          <label className="hub-label">Facts to use</label>
          <textarea className="hub-textarea" placeholder={'- Timeline: 3 weeks\n- Role: solo — design + build\n- Research: none (personal project)\n- Live at example.com'} value={facts} onChange={(e) => setFacts(e.target.value)} />
          <label className="hub-label">Wondering whether to add</label>
          <textarea className="hub-textarea" placeholder={'- Should I add a slide on X?\n- Is it worth mentioning Y?'} value={wondering} onChange={(e) => setWondering(e.target.value)} />
        </>
      )}
      {!selectedSlug && <div>Pick a study to add or edit its context.</div>}
    </div>
  );
};

export default ContextView;
```

- [ ] **Step 2: Verify the parse helper round-trips**

Run:
```bash
node --input-type=module -e "
const md='## Facts to use\n\n- Timeline: 3 weeks\n\n## Wondering whether to add\n\n- Add research?\n';
const norm=md;
const wi=norm.search(/^##\s+Wondering whether to add\s*$/m);
const fi=norm.search(/^##\s+Facts to use\s*$/m);
const facts=norm.slice(fi, wi).replace(/^##\s+Facts to use\s*$/m,'').trim();
const wondering=norm.slice(wi).replace(/^##\s+Wondering whether to add\s*$/m,'').trim();
console.assert(facts==='- Timeline: 3 weeks','facts: '+JSON.stringify(facts));
console.assert(wondering==='- Add research?','wondering: '+JSON.stringify(wondering));
console.log('parse OK');
"
```
Expected: `parse OK` (no assertion output).

- [ ] **Step 3: Commit**

```bash
git add src/components/agents-hub/ContextView.jsx
git commit -m "feat(hub): ContextView — edit per-study context"
```

---

## Task 4: Wire the Context tab into the Hub page

**Files:**
- Modify: `src/pages/AgentsHub.jsx` (import, `TABS`, render branch)
- Modify: `src/pages/AgentsHub.css` (add `.hub-label` style)

- [ ] **Step 1: Import ContextView**

After `import VerifyView from '../components/agents-hub/VerifyView';` add:

```jsx
import ContextView from '../components/agents-hub/ContextView';
```

- [ ] **Step 2: Add the tab to `TABS`**

Change the `TABS` array so Context sits right after Create:

```jsx
const TABS = [
  { key: 'studies', label: 'Studies' },
  { key: 'create', label: 'Create' },
  { key: 'context', label: 'Context' },
  { key: 'artifacts', label: 'Artifacts' },
  { key: 'verify', label: 'Verify / Resolve' },
];
```

- [ ] **Step 3: Add the render branch**

After the `{tab === 'create' && <CreateView ... />}` line, add:

```jsx
        {tab === 'context' && <ContextView studies={overview.studies} selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} onRefresh={refresh} />}
```

- [ ] **Step 4: Add the `.hub-label` style**

Append to `src/pages/AgentsHub.css`:

```css
.hub-label { display: block; font-size: 12px; font-weight: 600; opacity: 0.7; margin: 10px 0 4px; }
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: build completes; `dist/assets/AgentsHub-*.js` emitted, no errors.

- [ ] **Step 6: Manual UI check**

With `npm run dev` + edit mode on, open `/agents-hub` → Context tab → pick "The Techno Chronicles" → the textareas load the context saved in Task 1 → edit Facts → Save → status shows "Saved." Reload the tab and confirm the edit persisted.

- [ ] **Step 7: Commit**

```bash
git add src/pages/AgentsHub.jsx src/pages/AgentsHub.css
git commit -m "feat(hub): Context tab"
```

---

## Task 5: `context ✓` badge in StudiesView

**Files:**
- Modify: `src/components/agents-hub/StudiesView.jsx` (one badge in the `.meta` block)

- [ ] **Step 1: Add the badge**

In the `.meta` div, after the line:

```jsx
            {s.artifacts.length > 0 && <span className="hub-badge">{s.artifacts.length} artifacts</span>}
```

add:

```jsx
            {s.hasContext && <span className="hub-badge">context ✓</span>}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: build completes, no errors.

- [ ] **Step 3: Manual UI check**

`/agents-hub` → Studies tab → "The Techno Chronicles" row shows a `context ✓` badge (it has a context.md from Task 1); other rows do not.

- [ ] **Step 4: Commit**

```bash
git add src/components/agents-hub/StudiesView.jsx
git commit -m "feat(hub): context badge on study rows"
```

---

## Task 6: Never-invent + read-context + no-word-count rule on all 8 agents

**Files:**
- Modify: `.claude/agents/ux-reviewer.md`, `design-recruiter.md`, `design-director.md`, `case-study-editor.md`, `copy-writer.md`, `case-study-critic.md`, `portfolio-consistency.md`, `case-study-author.md` (append one shared section to each)

- [ ] **Step 1: Append the shared rule block to each of the 8 agent files**

Append exactly this block (verbatim) to the END of each of the 8 files listed above:

```markdown

## Per-study context & honesty rules (shared)

- **Read `cases/reviews/<slug>/context.md` if it exists.** It is OPTIONAL — if absent,
  proceed exactly as before. It has two sections: **Facts to use** (ground truth — use
  these instead of inferring) and **Wondering whether to add** (the designer's open
  questions).
- **Never fabricate a specific.** A timeline, metric, role, research count, headcount,
  named person, a reflection's content, or a design direction must come from the deck
  itself or from **Facts to use**. If it is not available in either, do NOT invent a
  plausible value — for an editing agent, insert a visible placeholder in the exact form
  `[ADD: <what's needed>]` (e.g. `[ADD: project timeline]`); for a review/critic agent,
  flag the gap rather than assuming a value. `[ADD: …]` is the only allowed stand-in.
- **Answer every "Wondering whether to add" item.** Reviewers give each a keep / cut / how
  verdict with one-line reasoning. The editor either adds it from Facts, adds it as an
  `[ADD: …]` placeholder if the designer owes the content, or records why it was declined
  in the verdict-coverage matrix.
- **Never state or estimate word counts.** The deterministic
  `node scripts/case-study-text.mjs budget <slug>` table is the only source of truth for
  per-slide budgets. Do not assert a slide's word count in any summary or report.
```

- [ ] **Step 2: Verify all 8 files got the block**

Run:
```bash
cd .claude/agents && for f in ux-reviewer design-recruiter design-director case-study-editor copy-writer case-study-critic portfolio-consistency case-study-author; do printf "%-22s " "$f"; grep -c "Per-study context & honesty rules" "$f.md"; done; cd ../..
```
Expected: each file prints `1`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/ux-reviewer.md .claude/agents/design-recruiter.md .claude/agents/design-director.md .claude/agents/case-study-editor.md .claude/agents/copy-writer.md .claude/agents/case-study-critic.md .claude/agents/portfolio-consistency.md .claude/agents/case-study-author.md
git commit -m "feat(agents): never-invent + per-study context + no word-count rule"
```

---

## Task 7: CLAUDE.md — triggers read context, doc the file

**Files:**
- Modify: `CLAUDE.md` (review trigger step 3 prompts; fix trigger step 2/4.25/4.5 prompts; a new doc paragraph in the Case Study Review System intro)

- [ ] **Step 1: Add context to the three reviewer prompts in `review <slug>` step 3**

Each reviewer bullet currently reads `(templates: ...`, profile: `cases/reviews/_designer-profile.md`)`. Append the context file to each of the three (`ux-reviewer`, `design-recruiter`, `design-director`) prompts, e.g. change the `ux-reviewer` line's parenthetical to:

```
(templates: `cases/reviews/_slide-templates.md`, profile: `cases/reviews/_designer-profile.md`, plus `cases/reviews/<slug>/context.md` if it exists)
```

Apply the same `, plus `cases/reviews/<slug>/context.md` if it exists` addition to the `design-recruiter` and `design-director` lines.

- [ ] **Step 2: Add context to the editor + copy-writer + critic prompts in `fix <slug>`**

- In step 2 (`case-study-editor`), in the "Read in order:" list, add `cases/reviews/<slug>/context.md` (if it exists) right after `extracted.md`.
- In step 4.25 (`copy-writer`), add `cases/reviews/<slug>/context.md` (if present) to its read list.
- In step 4.5 (`case-study-critic`), add `cases/reviews/<slug>/context.md` (if present) to its read list, and add this sentence to the critic's brief: "Anything the agents could not source from the deck or Facts to use must appear as an `[ADD: …]` placeholder, NOT an invented value — flag any invented specific as a blocking CONCERN."

- [ ] **Step 3: Add the doc paragraph**

In the "Case Study Review System (text only)" section, after the paragraph that begins "They are also **personalized**…", add:

```markdown
They are also **context-aware**: each study may carry an OPTIONAL
`cases/reviews/<slug>/context.md` (written from the Agents Hub Context tab) with two
sections — **Facts to use** (real timeline/role/research/outcomes the agents must use
instead of inventing) and **Wondering whether to add** (open questions the reviewers
answer and the fix acts on). If the file is absent, the pipeline behaves exactly as
before. With it present, agents **never fabricate**: anything missing and uncovered
becomes a visible `[ADD: …]` placeholder rather than a guess.
```

- [ ] **Step 4: Verify the edits landed**

Run:
```bash
grep -c "context.md" CLAUDE.md
grep -c "ADD: …\|\[ADD:" CLAUDE.md
```
Expected: `context.md` count ≥ 6 (3 reviewers + editor + copy + critic + doc); `[ADD:` count ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): review/fix triggers read per-study context; never-invent doc"
```

---

## Task 8: End-to-end verification (optional-path + never-invent)

**Files:** none (verification only)

- [ ] **Step 1: Optional-path regression (no context = unchanged)**

Pick a study WITHOUT a context file (e.g. `wizecare`). Confirm `cases/reviews/wizecare/context.md` does not exist:
`test -f cases/reviews/wizecare/context.md && echo EXISTS || echo NONE`
Expected: `NONE`. (A real `review wizecare` run, if performed, must proceed normally — the agents simply find no context file and behave as before.)

- [ ] **Step 2: Never-invent path (manual, via the pipeline)**

For a study that is missing a fact and has NO fact for it in context, run `fix <slug>` (or `run hub jobs` on a queued fix). After `apply`, confirm a placeholder exists rather than an invented value:
`grep -R "\[ADD:" src/data/case-studies/<slug>.json && echo "placeholder present"`
Expected: at least one `[ADD: …]` where the agent lacked a fact; the critic's `verify-report.md` lists no agent-invented specific.

- [ ] **Step 3: Facts-honored path**

Add the missing fact to that study's context (Context tab → Facts to use → Save), re-run `fix`, and confirm the placeholder is gone and replaced by the real value:
`grep -R "\[ADD:" src/data/case-studies/<slug>.json || echo "no placeholders — facts honored"`
Expected: the specific `[ADD: …]` is replaced; `no placeholders — facts honored` if all were resolved.

- [ ] **Step 4: Full build + lint**

Run: `npm run build && npm run lint`
Expected: both pass.

- [ ] **Step 5: Clean up the Task 1 test artifact (if undesired)**

The Task 1 curl wrote a real `context.md` for `project-1776617213367`. Keep it if useful, or remove:
`rm -f cases/reviews/project-1776617213367/context.md`

---

## Self-review notes (author)

- **Spec coverage:** context file format → Task 1/3; Hub Context tab → Task 3/4; badge → Task 5; write endpoint + `hasContext` → Task 1; `writeContext` wrapper → Task 2; never-invent + read-context + no-word-count across 8 agents → Task 6; triggers + doc → Task 7; optional behavior → Tasks 7 (doc) + 8 (regression); testing section → Task 8. All spec sections mapped.
- **No new job type, no `case-study-text.mjs` change, no JSON/renderer/edit-mode change** — consistent with the spec's "Out of scope".
- **Type consistency:** `writeContext(slug, facts, wondering)` (Task 2) is called identically in ContextView (Task 3); `hasContext` field (Task 1) is consumed in StudiesView (Task 5); `parseContext` headings match the endpoint's written headings (Task 1 body vs Task 3 regex).
