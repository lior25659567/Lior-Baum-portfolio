# Agents Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dev-only `/agents-hub` page where the designer runs the whole case-study review/fix/create workflow from a UI — deterministic steps run in-browser via new dev endpoints, AI passes run in the Claude chat session, dispatched through a job queue drained with `run hub jobs`.

**Architecture:** Browser ⇆ new `/api/hub/*` dev endpoints (in `vite-plugin-save-case-study.js`, same `wrap()`+`exec()` patterns as `compress-videos`) for all deterministic work + file viewing. AI passes are queued as JSON files in `cases/reviews/_jobs/`; a `run hub jobs` chat trigger runs the existing `create`/`review`/`fix`/`resolve` pipelines and writes job status back. One small script, `scripts/hub-jobs.mjs`, owns all job-file I/O so neither the browser nor Claude hand-edits job JSON.

**Tech Stack:** React 19 + Vite 5 + React Router 7, vanilla CSS per component, Node ESM script. Artifacts render via a **zero-dependency custom markdown component** (the spec's alternative — chosen because this machine's npm deadlocks installing `react-markdown`'s large type packuments; curl proves the network is fine, so it's an npm-cache bug, not ours). Spec: `docs/superpowers/specs/2026-06-02-agents-hub-design.md`.

**Commit policy for this repo:** the user's `CLAUDE.md` says *don't push until they're ready* and *don't commit unless asked*. The per-task `git commit` steps below are **local commits only — never `git push`**. If the user prefers, collapse them into one commit at the end; the verification steps are what gate each task, not the commit.

**No test framework here:** the repo has only `eslint` + `vite build` (no jest/vitest). "Verify" steps therefore use real tools — `node` CLI runs, `curl` against the dev server, `npm run lint`, `npm run build`, and explicit browser checks — instead of unit tests.

---

## File structure

| File | Responsibility |
|---|---|
| `scripts/hub-jobs.mjs` (NEW) | All job-queue I/O: `enqueue`, `list`, `set`. Importable functions + CLI. |
| `vite-plugin-save-case-study.js` (MODIFY) | 6 dev endpoints: `/api/hub/overview`, `/run`, `/file`, `/brief`, `/jobs`, `/enqueue`. |
| `src/data/agentsHubApi.js` (NEW) | Browser fetch wrappers for the endpoints. |
| `src/components/agents-hub/Markdown.jsx` (NEW) | Zero-dep markdown renderer (headings/tables/lists/inline). |
| `src/components/agents-hub/JobsBar.jsx` (NEW) | Persistent queue banner + polling. |
| `src/components/agents-hub/StudiesView.jsx` (NEW) | Study list; Review/Fix/View + budget pill. |
| `src/components/agents-hub/CreateView.jsx` (NEW) | Brief editor; Scaffold + queue create. |
| `src/components/agents-hub/ArtifactsView.jsx` (NEW) | Render artifacts + budget table. |
| `src/components/agents-hub/VerifyView.jsx` (NEW) | Parse verify checklist; queue resolve. |
| `src/pages/AgentsHub.jsx` (NEW) | Page shell: dev/edit gate, tab routing, overview data. |
| `src/pages/AgentsHub.css` (NEW) | Page + view styles, `.hub-md` markdown styles. |
| `src/App.jsx` (MODIFY) | Add `/agents-hub` route. |
| `src/components/Navigation.jsx` (MODIFY) | Add edit-mode nav entry. |
| `CLAUDE.md` (MODIFY) | `run hub jobs` trigger + Hub references. |
| `.gitignore` (MODIFY) | Ignore `cases/reviews/_jobs/`. |

**Endpoint-naming note (Connect prefix matching):** `server.middlewares.use('/api/hub/job', …)` would also catch `/api/hub/jobs` (prefix match). To avoid that footgun, the enqueue endpoint is **`/api/hub/enqueue`** (not `/api/hub/job`); listing is `/api/hub/jobs`. No registered hub path is a prefix of another.

---

## Task 1: Job-queue script + gitignore + deps

**Files:**
- Create: `scripts/hub-jobs.mjs`
- Modify: `.gitignore`

(No `npm install` — the artifact viewer uses a zero-dep custom renderer, see Task 4.)

- [ ] **Step 2: Ignore the job queue dir**

Append to `.gitignore`:
```
# Agents Hub job queue (transient local state)
cases/reviews/_jobs/
```

- [ ] **Step 3: Write `scripts/hub-jobs.mjs`**

```javascript
#!/usr/bin/env node
// Owns ALL Agents Hub job-queue I/O. The browser endpoints import these
// functions; the `run hub jobs` chat trigger calls the CLI. Job JSON is never
// hand-edited anywhere else. Jobs live in cases/reviews/_jobs/<id>.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const JOBS_DIR = path.join('cases', 'reviews', '_jobs');
const VALID_ACTIONS = new Set(['create', 'review', 'fix', 'resolve']);
const VALID_STATUS = new Set(['queued', 'running', 'done', 'error']);

function ensureDir() { fs.mkdirSync(JOBS_DIR, { recursive: true }); }
const jobPath = (id) => path.join(JOBS_DIR, `${id}.json`);

export function listJobs(statusFilter) {
  ensureDir();
  const jobs = fs.readdirSync(JOBS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(JOBS_DIR, f), 'utf8')));
  jobs.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
  return statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;
}

export function enqueueJob({ action, slug = '', briefName = '', answers = null }) {
  if (!VALID_ACTIONS.has(action)) throw new Error(`Invalid action: ${action}`);
  ensureDir();
  const base = (slug || briefName || 'job').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'job';
  const count = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith('.json')).length;
  const id = `${action}-${base}-${count + 1}`;
  const job = { id, action, slug, briefName, answers, status: 'queued', createdAt: new Date().toISOString(), note: '' };
  fs.writeFileSync(jobPath(id), JSON.stringify(job, null, 2) + '\n');
  return job;
}

export function setJob(id, status, note = '') {
  if (!VALID_STATUS.has(status)) throw new Error(`Invalid status: ${status}`);
  const p = jobPath(id);
  if (!fs.existsSync(p)) throw new Error(`No job ${id}`);
  const job = JSON.parse(fs.readFileSync(p, 'utf8'));
  job.status = status;
  if (note) job.note = note;
  fs.writeFileSync(p, JSON.stringify(job, null, 2) + '\n');
  return job;
}

function parseFlags(rest) {
  const out = {};
  for (let i = 1; i < rest.length; i++) {
    if (rest[i] === '--slug') out.slug = rest[++i];
    else if (rest[i] === '--brief') out.brief = rest[++i];
    else if (rest[i] === '--answers') out.answers = rest[++i];
  }
  return out;
}

// CLI dispatch — only when run directly, NOT when imported by the Vite plugin.
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [, , mode, ...rest] = process.argv;
  if (mode === 'list') {
    console.log(JSON.stringify(listJobs(rest[0]), null, 2));
  } else if (mode === 'enqueue') {
    const f = parseFlags(rest);
    console.log(JSON.stringify(enqueueJob({ action: rest[0], slug: f.slug, briefName: f.brief, answers: f.answers ? JSON.parse(f.answers) : null }), null, 2));
  } else if (mode === 'set') {
    console.log(JSON.stringify(setJob(rest[0], rest[1], rest.slice(2).join(' ')), null, 2));
  } else {
    console.error('Usage: node scripts/hub-jobs.mjs <list [status] | enqueue <action> [--slug x] [--brief y] [--answers json] | set <id> <status> [note]>');
    process.exit(1);
  }
}
```

- [ ] **Step 4: Verify the script (enqueue → list → set)**

Run:
```bash
node scripts/hub-jobs.mjs enqueue review --slug demo-slug
node scripts/hub-jobs.mjs list queued
node scripts/hub-jobs.mjs set review-demoslug-1 done "smoke test"
node scripts/hub-jobs.mjs list
```
Expected: enqueue prints a job with `status:"queued"`, id `review-demoslug-1`; `list queued` shows it; `set` flips it to `done` with the note; final `list` shows `done`.

- [ ] **Step 5: Clean up the smoke job**

Run:
```bash
rm -rf cases/reviews/_jobs && echo cleaned
```
Expected: `cleaned`. (The dir is gitignored and recreated on demand.)

- [ ] **Step 6: Commit (local only)**

```bash
git add scripts/hub-jobs.mjs .gitignore
git commit -m "feat(hub): job-queue script + queue gitignore"
```

---

## Task 2: Dev endpoints in the Vite plugin

**Files:**
- Modify: `vite-plugin-save-case-study.js` (add import at top ~line 17; register 6 endpoints inside `configureServer`, e.g. right after the `/api/health` block ~line 170)

- [ ] **Step 1: Import the job functions**

Add after the existing imports (near line 17, after `import https from 'https';`):
```javascript
import { enqueueJob, listJobs } from './scripts/hub-jobs.mjs';
```

- [ ] **Step 2: Register the six hub endpoints**

Insert this block inside `configureServer(server)`, immediately after the `/api/health` middleware's closing `}));` (around line 170). **Register `/api/hub/jobs` before `/api/hub/enqueue`** is not required (names don't collide), but keep this order for clarity:

```javascript
      // ── Agents Hub (dev-only cockpit) ────────────────────────────────────
      const HUB_ARTIFACTS = ['extracted', 'ux-verdict', 'recruiter-verdict', 'director-verdict', 'synthesis', 'edit-summary', 'copy-summary', 'verify-report', 'FIX-REPORT'];

      // Dashboard payload: studies (+ which artifacts exist), briefs, jobs.
      server.middlewares.use('/api/hub/overview', wrap('/api/hub/overview', async (req) => {
        assertMethod(req, 'GET');
        const csDir = path.resolve('src/data/case-studies');
        const reviewsDir = path.resolve('cases/reviews');
        const briefsDir = path.resolve('cases/briefs');
        const studyFiles = (await pathExists(csDir)) ? (await fsp.readdir(csDir)).filter((f) => f.endsWith('.json')) : [];
        const studies = [];
        for (const f of studyFiles) {
          const slug = f.replace(/\.json$/, '');
          let title = slug, slideCount = 0;
          try {
            const d = JSON.parse(await fsp.readFile(path.join(csDir, f), 'utf-8'));
            title = d.title || slug;
            slideCount = Array.isArray(d.slides) ? d.slides.length : 0;
          } catch { /* leave defaults */ }
          const adir = path.join(reviewsDir, slug);
          const artifacts = [];
          if (await pathExists(adir)) {
            for (const a of HUB_ARTIFACTS) if (await pathExists(path.join(adir, `${a}.md`))) artifacts.push(a);
          }
          studies.push({ slug, title, slideCount, artifacts });
        }
        studies.sort((a, b) => a.title.localeCompare(b.title));
        const briefs = (await pathExists(briefsDir))
          ? (await fsp.readdir(briefsDir)).filter((f) => f.endsWith('.md') && f !== '_BRIEF-TEMPLATE.md').map((f) => f.replace(/\.md$/, ''))
          : [];
        return { studies, briefs, jobs: listJobs() };
      }));

      // Run a WHITELISTED deterministic script subcommand. apply is NOT exposed
      // (agents own it). new/budget/extract/templates only.
      server.middlewares.use('/api/hub/run', wrap('/api/hub/run', async (req) => {
        assertMethod(req, 'POST');
        const { cmd, slug = '', title = '' } = await readJson(req);
        const WHITELIST = new Set(['new', 'budget', 'extract', 'templates']);
        if (!WHITELIST.has(cmd)) { const e = new Error(`cmd "${cmd}" not allowed`); e.statusCode = 400; throw e; }
        let argline = '';
        if (cmd === 'new') {
          if (!title) { const e = new Error('new requires title'); e.statusCode = 400; throw e; }
          argline = JSON.stringify(title);
        } else if (cmd === 'budget' || cmd === 'extract') {
          if (!/^[a-z0-9._-]+$/i.test(slug)) { const e = new Error('bad slug'); e.statusCode = 400; throw e; }
          argline = JSON.stringify(slug);
        }
        const result = await new Promise((resolve) => {
          exec(`node scripts/case-study-text.mjs ${cmd} ${argline}`.trim(), {
            cwd: path.resolve('.'), timeout: 120_000, maxBuffer: 10 * 1024 * 1024, env: { ...process.env },
          }, (err, stdout, stderr) => resolve({ stdout: (stdout || '').trim(), stderr: (stderr || '').trim(), code: err ? (err.code ?? 1) : 0 }));
        });
        if (result.code !== 0) { const e = new Error(result.stderr || result.stdout || `exit ${result.code}`); e.statusCode = 500; throw e; }
        let newSlug;
        if (cmd === 'new') { const m = result.stdout.match(/slug:\s*(\S+)/); newSlug = m ? m[1] : undefined; }
        return { stdout: result.stdout, stderr: result.stderr, code: result.code, slug: newSlug };
      }));

      // Whitelisted file read for the artifact/brief viewer.
      server.middlewares.use('/api/hub/file', wrap('/api/hub/file', async (req) => {
        assertMethod(req, 'GET');
        const url = new URL(req.url, 'http://localhost');
        const rel = url.searchParams.get('path') || '';
        if (!/^[a-zA-Z0-9_\-./]+$/.test(rel)) { const e = new Error('invalid path'); e.statusCode = 400; throw e; }
        const safe = path.posix.normalize(rel).replace(/^\/+/, '');
        if (safe.startsWith('..')) { const e = new Error('traversal blocked'); e.statusCode = 403; throw e; }
        const ALLOWED = ['cases/reviews/', 'cases/briefs/'];
        if (!ALLOWED.some((r) => safe.startsWith(r))) { const e = new Error('path not whitelisted'); e.statusCode = 403; throw e; }
        const abs = path.resolve(safe);
        if (!(await pathExists(abs))) { const e = new Error('not found'); e.statusCode = 404; throw e; }
        return { path: rel, content: await fsp.readFile(abs, 'utf-8') };
      }));

      // Write a brief markdown file (name sanitized).
      server.middlewares.use('/api/hub/brief', wrap('/api/hub/brief', async (req) => {
        assertMethod(req, 'POST');
        const { name, content } = await readJson(req);
        const clean = String(name || '').replace(/[^a-z0-9-_]/gi, '').slice(0, 60);
        if (!clean) { const e = new Error('invalid brief name'); e.statusCode = 400; throw e; }
        const dir = path.resolve('cases/briefs');
        await fsp.mkdir(dir, { recursive: true });
        await fsp.writeFile(path.join(dir, `${clean}.md`), String(content ?? ''), 'utf-8');
        return { path: `cases/briefs/${clean}.md`, name: clean };
      }));

      // List jobs (polling).
      server.middlewares.use('/api/hub/jobs', wrap('/api/hub/jobs', async (req) => {
        assertMethod(req, 'GET');
        return { jobs: listJobs() };
      }));

      // Enqueue a job.
      server.middlewares.use('/api/hub/enqueue', wrap('/api/hub/enqueue', async (req) => {
        assertMethod(req, 'POST');
        const { action, slug = '', briefName = '', answers = null } = await readJson(req);
        return { job: enqueueJob({ action, slug, briefName, answers }) };
      }));
```

- [ ] **Step 3: Start the dev server (background) and verify endpoints**

Run (in one shell, leave the server running for later tasks):
```bash
npm run dev
```
Then in another shell:
```bash
curl -s localhost:5173/api/hub/overview | head -c 400; echo
curl -s -X POST localhost:5173/api/hub/run -H 'Content-Type: application/json' -d '{"cmd":"budget","slug":"wizecare"}' | head -c 300; echo
curl -s 'localhost:5173/api/hub/file?path=../etc/passwd'; echo
curl -s 'localhost:5173/api/hub/file?path=cases/reviews/_slide-templates.md' | head -c 120; echo
curl -s -X POST localhost:5173/api/hub/enqueue -H 'Content-Type: application/json' -d '{"action":"review","slug":"wizecare"}'; echo
curl -s localhost:5173/api/hub/jobs | head -c 300; echo
```
Expected: `overview` returns `{"ok":true,"studies":[…],"briefs":[…],"jobs":[…]}`; `run budget` returns a stdout budget table; the traversal path returns `{"error":"traversal blocked"}` (403); the whitelisted read returns markdown; `enqueue` returns the new job; `jobs` lists it.

- [ ] **Step 4: Clean up the smoke job**

Run:
```bash
rm -rf cases/reviews/_jobs && echo cleaned
```

- [ ] **Step 5: Commit (local only)**

```bash
git add vite-plugin-save-case-study.js
git commit -m "feat(hub): dev endpoints for overview/run/file/brief/jobs/enqueue"
```

---

## Task 3: Browser API client

**Files:**
- Create: `src/data/agentsHubApi.js`

- [ ] **Step 1: Write the client**

```javascript
// Thin fetch wrappers for the dev-only /api/hub/* endpoints. Same-origin
// (the Vite dev server). The Agents Hub page never renders in production, so
// these are only ever called in dev.
async function call(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
const jsonPost = (url, body) => call(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const getOverview = () => call('/api/hub/overview');
export const getJobs = () => call('/api/hub/jobs');
export const runScript = (cmd, params = {}) => jsonPost('/api/hub/run', { cmd, ...params });
export const readFile = (p) => call(`/api/hub/file?path=${encodeURIComponent(p)}`);
export const writeBrief = (name, content) => jsonPost('/api/hub/brief', { name, content });
export const enqueueJob = (payload) => jsonPost('/api/hub/enqueue', payload);
```

- [ ] **Step 2: Lint**

Run:
```bash
npx eslint src/data/agentsHubApi.js
```
Expected: no errors.

- [ ] **Step 3: Commit (local only)**

```bash
git add src/data/agentsHubApi.js
git commit -m "feat(hub): browser api client"
```

---

## Task 4: Markdown component + page shell + route + nav

**Files:**
- Create: `src/components/agents-hub/Markdown.jsx`
- Create: `src/pages/AgentsHub.jsx`, `src/pages/AgentsHub.css`
- Modify: `src/App.jsx`, `src/components/Navigation.jsx`

- [ ] **Step 1: Zero-dependency Markdown renderer**

`src/components/agents-hub/Markdown.jsx` — handles the subset our review artifacts use: headings, GFM pipe tables (budget + coverage matrices), ordered/unordered lists, blockquotes, fenced code, horizontal rules, paragraphs, and inline bold/italic/code/links. No external dependency.
```jsx
// Minimal, dependency-free markdown renderer for the Agents Hub artifact viewer.
// Covers exactly what the review artifacts use; not a general markdown engine.
function renderInline(text, keyBase) {
  const nodes = [];
  let rest = text;
  let n = 0;
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/;
  while (rest.length) {
    const m = rest.match(re);
    if (!m) { nodes.push(rest); break; }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const tok = m[0];
    const key = `${keyBase}-${n++}`;
    if (tok.startsWith('`')) nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('*')) nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else { const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/); nodes.push(<a key={key} href={lm[2]} target="_blank" rel="noreferrer">{lm[1]}</a>); }
    rest = rest.slice(m.index + tok.length);
  }
  return nodes;
}

const splitRow = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const isTableSep = (line) => line.includes('-') && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line);
const BLOCK_START = /^(#{1,6}\s|```|>\s?|\s*[-*]\s+|\s*\d+\.\s+)/;

const Markdown = ({ children }) => {
  const lines = (children || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  const key = () => blocks.length;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; blocks.push(<pre key={key()}><code>{buf.join('\n')}</code></pre>); continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const Tag = `h${Math.min(h[1].length + 1, 6)}`; blocks.push(<Tag key={key()}>{renderInline(h[2], `h${key()}`)}</Tag>); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { blocks.push(<hr key={key()} />); i++; continue; }
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line); i += 2; const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) { rows.push(splitRow(lines[i])); i++; }
      blocks.push(
        <table key={key()}>
          <thead><tr>{header.map((c, j) => <th key={j}>{renderInline(c, `th${key()}-${j}`)}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{renderInline(c, `td${key()}-${ri}-${j}`)}</td>)}</tr>)}</tbody>
        </table>
      ); continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push(<blockquote key={key()}>{renderInline(buf.join(' '), `bq${key()}`)}</blockquote>); continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      blocks.push(<ul key={key()}>{items.map((it, j) => <li key={j}>{renderInline(it, `li${key()}-${j}`)}</li>)}</ul>); continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      blocks.push(<ol key={key()}>{items.map((it, j) => <li key={j}>{renderInline(it, `ol${key()}-${j}`)}</li>)}</ol>); continue;
    }
    if (!line.trim()) { i++; continue; }
    const para = [line]; i++;
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) { para.push(lines[i]); i++; }
    blocks.push(<p key={key()}>{renderInline(para.join(' '), `p${key()}`)}</p>);
  }
  return <div className="hub-md">{blocks}</div>;
};

export default Markdown;
```

- [ ] **Step 2: Page shell (gate + tabs + overview load)**

`src/pages/AgentsHub.jsx` (view components are added in later tasks; import them now so the file is complete):
```jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEdit } from '../context/EditContext';
import { getOverview } from '../data/agentsHubApi';
import JobsBar from '../components/agents-hub/JobsBar';
import StudiesView from '../components/agents-hub/StudiesView';
import CreateView from '../components/agents-hub/CreateView';
import ArtifactsView from '../components/agents-hub/ArtifactsView';
import VerifyView from '../components/agents-hub/VerifyView';
import './AgentsHub.css';

const TABS = [
  { key: 'studies', label: 'Studies' },
  { key: 'create', label: 'Create' },
  { key: 'artifacts', label: 'Artifacts' },
  { key: 'verify', label: 'Verify / Resolve' },
];

const AgentsHub = () => {
  const navigate = useNavigate();
  const { editMode } = useEdit();
  const allowed = import.meta.env.DEV && editMode;

  const [tab, setTab] = useState('studies');
  const [overview, setOverview] = useState({ studies: [], briefs: [], jobs: [] });
  const [selectedSlug, setSelectedSlug] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try { setOverview(await getOverview()); setError(''); }
    catch (e) { setError(e.message); }
  }, []);

  useEffect(() => { if (!allowed) navigate('/'); }, [allowed, navigate]);
  useEffect(() => { if (allowed) refresh(); }, [allowed, refresh]);

  if (!allowed) return null;

  const openArtifacts = (slug) => { setSelectedSlug(slug); setTab('artifacts'); };
  const openVerify = (slug) => { setSelectedSlug(slug); setTab('verify'); };

  return (
    <section className="agents-hub">
      <header className="hub-header">
        <h1>Agents Hub</h1>
        <p className="hub-sub">Run case-study review, fix, and create — deterministic steps run here, AI passes run in Claude Code via the job queue.</p>
      </header>

      <JobsBar jobs={overview.jobs} onRefresh={refresh} />

      <nav className="hub-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`hub-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </nav>

      {error && <div className="hub-error">⚠ {error}</div>}

      <div className="hub-panel">
        {tab === 'studies' && <StudiesView studies={overview.studies} onRefresh={refresh} onView={openArtifacts} onVerify={openVerify} />}
        {tab === 'create' && <CreateView briefs={overview.briefs} onRefresh={refresh} />}
        {tab === 'artifacts' && <ArtifactsView studies={overview.studies} selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} />}
        {tab === 'verify' && <VerifyView studies={overview.studies} selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} onRefresh={refresh} />}
      </div>
    </section>
  );
};

export default AgentsHub;
```

- [ ] **Step 3: Page styles**

`src/pages/AgentsHub.css`:
```css
.agents-hub { max-width: 1100px; margin: 0 auto; padding: 96px 24px 120px; color: var(--color-text, #111); }
.hub-header h1 { font-size: 2rem; margin: 0 0 4px; }
.hub-sub { opacity: .7; margin: 0 0 20px; font-size: .9rem; }
.hub-tabs { display: flex; gap: 8px; border-bottom: 1px solid rgba(0,0,0,.12); margin: 16px 0 20px; }
.hub-tab { background: none; border: none; padding: 10px 14px; cursor: pointer; font-size: .92rem; opacity: .6; border-bottom: 2px solid transparent; }
.hub-tab.active { opacity: 1; border-bottom-color: currentColor; font-weight: 600; }
.hub-error { background: #fde8e8; color: #9b1c1c; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: .88rem; }
.hub-panel { min-height: 300px; }

.hub-jobsbar { display: flex; align-items: center; gap: 12px; background: #f5f6f8; border: 1px solid rgba(0,0,0,.08); border-radius: 10px; padding: 10px 14px; font-size: .88rem; }
.hub-jobsbar code { background: #111; color: #fff; padding: 2px 8px; border-radius: 6px; }
.hub-jobchip { padding: 2px 8px; border-radius: 999px; font-size: .75rem; }
.hub-jobchip.queued { background: #fff4d6; } .hub-jobchip.running { background: #d6ecff; }
.hub-jobchip.done { background: #d8f5dd; } .hub-jobchip.error { background: #fde2e2; }

.hub-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border: 1px solid rgba(0,0,0,.08); border-radius: 10px; margin-bottom: 8px; }
.hub-row .meta { display: flex; gap: 10px; align-items: center; }
.hub-badge { font-size: .7rem; padding: 1px 6px; border-radius: 6px; background: #eef0f3; opacity: .8; }
.hub-actions { display: flex; gap: 6px; }
.hub-btn { border: 1px solid rgba(0,0,0,.18); background: #fff; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: .82rem; }
.hub-btn.primary { background: #111; color: #fff; border-color: #111; }
.hub-btn:disabled { opacity: .5; cursor: default; }
.hub-pill { font-size: .72rem; padding: 2px 8px; border-radius: 999px; background: #eef0f3; }

.hub-textarea { width: 100%; min-height: 360px; font-family: ui-monospace, monospace; font-size: .82rem; padding: 12px; border: 1px solid rgba(0,0,0,.15); border-radius: 10px; }
.hub-input { padding: 8px 10px; border: 1px solid rgba(0,0,0,.15); border-radius: 8px; font-size: .85rem; }
.hub-subtabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }

.hub-md { font-size: .9rem; line-height: 1.55; }
.hub-md table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: .82rem; }
.hub-md th, .hub-md td { border: 1px solid rgba(0,0,0,.15); padding: 6px 10px; text-align: left; }
.hub-md code { background: #f0f1f3; padding: 1px 5px; border-radius: 4px; }
.hub-md pre { background: #1115; padding: 12px; border-radius: 8px; overflow: auto; }
.hub-verify-item { border: 1px solid rgba(0,0,0,.1); border-radius: 10px; padding: 12px; margin-bottom: 10px; }
.hub-verify-item .choices { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
```

- [ ] **Step 4: Register the route**

In `src/App.jsx`, add to the lazy-import block (after line 16):
```jsx
const AgentsHub = lazy(() => import('./pages/AgentsHub'));
```
And add inside `<Routes>` (after the `/design-system` route, line 34):
```jsx
              <Route path="/agents-hub" element={<AgentsHub />} />
```

- [ ] **Step 5: Add the nav entry**

In `src/components/Navigation.jsx`, replace the `editMode` spread (line 35):
```jsx
    ...(editMode ? [{ label: 'Agents Hub', href: '/agents-hub' }, { label: 'Docs', href: '/docs/slides' }, { label: 'CV Builder', href: '/cv' }, { label: 'Design System', href: '/design-system' }] : []),
```

- [ ] **Step 6: Verify in the browser**

With `npm run dev` running, open `http://localhost:5173`, press **Cmd+E** (edit mode). Expected: nav shows "Agents Hub"; clicking it loads `/agents-hub` showing the header, the Jobs bar, and the four tabs. (Views may render empty until later tasks — that's fine.) Turn edit mode off (Cmd+E): the page redirects to home.

> NOTE: Steps 1–5 reference `JobsBar`, `StudiesView`, `CreateView`, `ArtifactsView`, `VerifyView`, which are created in Tasks 5–8. If executing strictly task-by-task, create empty stub components first so the dev server compiles, then flesh them out. Stub form (repeat for each name):
> ```jsx
> const StudiesView = () => <div>…</div>;
> export default StudiesView;
> ```

- [ ] **Step 7: Commit (local only)**

```bash
git add src/components/agents-hub/Markdown.jsx src/pages/AgentsHub.jsx src/pages/AgentsHub.css src/App.jsx src/components/Navigation.jsx
git commit -m "feat(hub): page shell, route, nav entry, markdown renderer"
```

---

## Task 5: JobsBar + StudiesView

**Files:**
- Create: `src/components/agents-hub/JobsBar.jsx`
- Create: `src/components/agents-hub/StudiesView.jsx`

- [ ] **Step 1: JobsBar (polls while jobs are active)**

`src/components/agents-hub/JobsBar.jsx`:
```jsx
import { useEffect, useRef } from 'react';
import { getJobs } from '../../data/agentsHubApi';

const TERMINAL = new Set(['done', 'error']);

const JobsBar = ({ jobs, onRefresh }) => {
  const active = jobs.filter((j) => !TERMINAL.has(j.status));
  const wasActive = useRef(false);

  useEffect(() => {
    if (active.length === 0) {
      if (wasActive.current) { wasActive.current = false; onRefresh(); } // flush final state
      return;
    }
    wasActive.current = true;
    const t = setInterval(async () => {
      try {
        const { jobs: latest } = await getJobs();
        const stillActive = latest.some((j) => !TERMINAL.has(j.status));
        onRefresh();
        if (!stillActive) clearInterval(t);
      } catch { /* keep polling */ }
    }, 4000);
    return () => clearInterval(t);
  }, [active.length, onRefresh]);

  if (jobs.length === 0) {
    return <div className="hub-jobsbar">No jobs queued. Queue a Review / Fix / Create, then run <code>run hub jobs</code> in Claude Code.</div>;
  }
  return (
    <div className="hub-jobsbar">
      <strong>{active.length}</strong> active ·
      {jobs.slice(-6).map((j) => (
        <span key={j.id} className={`hub-jobchip ${j.status}`}>{j.action}:{j.slug || j.briefName} · {j.status}</span>
      ))}
      {active.length > 0 && <span>→ run <code>run hub jobs</code> in Claude Code</span>}
    </div>
  );
};

export default JobsBar;
```

- [ ] **Step 2: StudiesView (list + queue review/fix + budget pill)**

`src/components/agents-hub/StudiesView.jsx`:
```jsx
import { useState } from 'react';
import { enqueueJob, runScript } from '../../data/agentsHubApi';

const StudiesView = ({ studies, onRefresh, onView, onVerify }) => {
  const [budgets, setBudgets] = useState({});
  const [busy, setBusy] = useState('');

  const queue = async (action, slug) => {
    setBusy(`${action}:${slug}`);
    try { await enqueueJob({ action, slug }); await onRefresh(); }
    catch (e) { alert(e.message); }
    finally { setBusy(''); }
  };

  const loadBudget = async (slug) => {
    try {
      const { stdout } = await runScript('budget', { slug });
      const line = stdout.split('\n').find((l) => /over budget/.test(l)) || stdout.split('\n')[0];
      setBudgets((b) => ({ ...b, [slug]: line.trim() }));
    } catch (e) { setBudgets((b) => ({ ...b, [slug]: e.message })); }
  };

  if (!studies.length) return <div>No case studies yet. Use the Create tab.</div>;
  return (
    <div>
      {studies.map((s) => (
        <div key={s.slug} className="hub-row">
          <div className="meta">
            <strong>{s.title}</strong>
            <span className="hub-badge">{s.slug}</span>
            <span className="hub-badge">{s.slideCount} slides</span>
            {s.artifacts.length > 0 && <span className="hub-badge">{s.artifacts.length} artifacts</span>}
            {budgets[s.slug] && <span className="hub-pill">{budgets[s.slug]}</span>}
          </div>
          <div className="hub-actions">
            <button className="hub-btn" onClick={() => loadBudget(s.slug)}>Budget</button>
            <button className="hub-btn" disabled={busy === `review:${s.slug}`} onClick={() => queue('review', s.slug)}>Review</button>
            <button className="hub-btn" disabled={busy === `fix:${s.slug}`} onClick={() => queue('fix', s.slug)}>Fix</button>
            <button className="hub-btn" onClick={() => onView(s.slug)} disabled={!s.artifacts.length}>View</button>
            <button className="hub-btn" onClick={() => onVerify(s.slug)} disabled={!s.artifacts.includes('FIX-REPORT')}>Verify</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudiesView;
```

- [ ] **Step 3: Verify in the browser**

Reload `/agents-hub` (edit mode). Expected: Studies tab lists your real case studies; **Budget** loads the over-budget line; **Review**/**Fix** add a job (the Jobs bar count rises and shows the `run hub jobs` reminder). **View** is disabled until artifacts exist; **Verify** until a FIX-REPORT exists.

- [ ] **Step 4: Clean up test jobs**

```bash
rm -rf cases/reviews/_jobs && echo cleaned
```

- [ ] **Step 5: Commit (local only)**

```bash
git add src/components/agents-hub/JobsBar.jsx src/components/agents-hub/StudiesView.jsx
git commit -m "feat(hub): jobs bar + studies view"
```

---

## Task 6: CreateView

**Files:**
- Create: `src/components/agents-hub/CreateView.jsx`

- [ ] **Step 1: Write CreateView**

`src/components/agents-hub/CreateView.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { readFile, writeBrief, runScript, enqueueJob } from '../../data/agentsHubApi';

const CreateView = ({ briefs, onRefresh }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const loadBrief = async (briefName) => {
    setName(briefName);
    try { const { content: c } = await readFile(`cases/briefs/${briefName}.md`); setContent(c); }
    catch (e) { setStatus(e.message); }
  };

  const newBrief = async () => {
    try { const { content: tmpl } = await readFile('cases/briefs/_BRIEF-TEMPLATE.md'); setContent(tmpl); setName(''); setStatus('Loaded template — edit, set a name, Save.'); }
    catch (e) { setStatus(e.message); }
  };

  useEffect(() => { if (!content) newBrief(); /* seed once */ }, []); // eslint-disable-line

  const save = async () => {
    if (!name) { setStatus('Set a brief name first.'); return; }
    try { await writeBrief(name, content); await onRefresh(); setStatus(`Saved cases/briefs/${name.replace(/[^a-z0-9-_]/gi, '')}.md`); }
    catch (e) { setStatus(e.message); }
  };

  const scaffoldAndQueue = async () => {
    if (!title) { setStatus('Set a deck title first.'); return; }
    if (!name) { setStatus('Save the brief first.'); return; }
    setBusy(true);
    try {
      await writeBrief(name, content);
      const { slug } = await runScript('new', { title });
      if (!slug) throw new Error('scaffold did not return a slug');
      await enqueueJob({ action: 'create', slug, briefName: name });
      await onRefresh();
      setStatus(`Scaffolded ${slug}. Queued create job — run "run hub jobs" in Claude Code, then hard-refresh the app.`);
    } catch (e) { setStatus(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        {briefs.map((b) => <button key={b} className="hub-btn" onClick={() => loadBrief(b)}>{b}</button>)}
        <button className="hub-btn" onClick={newBrief}>+ New from template</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input className="hub-input" placeholder="brief name (a-z0-9-_)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="hub-input" placeholder="deck title (shows on cover)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="hub-btn" onClick={save}>Save brief</button>
        <button className="hub-btn primary" disabled={busy} onClick={scaffoldAndQueue}>Scaffold + queue create</button>
      </div>
      {status && <div className="hub-pill" style={{ display: 'block', marginBottom: 8 }}>{status}</div>}
      <textarea className="hub-textarea" value={content} onChange={(e) => setContent(e.target.value)} />
    </div>
  );
};

export default CreateView;
```

- [ ] **Step 2: Verify in the browser**

Create tab: "+ New from template" loads `_BRIEF-TEMPLATE.md` into the textarea; set a name → Save → it appears as a brief button and the file exists (`ls cases/briefs/`). Set a title → "Scaffold + queue create" → a new `project-…json` appears (`ls src/data/case-studies/`), a `create` job is queued. **Then clean up the test artifacts:**
```bash
ls cases/briefs/ && ls src/data/case-studies/ | tail -3
# remove the test brief + test study, restore index.js, drop the job:
rm -f cases/briefs/<your-test-name>.md src/data/case-studies/<new-slug>.json
git checkout src/data/case-studies/index.js
rm -rf cases/reviews/_jobs && echo cleaned
```

- [ ] **Step 3: Commit (local only)**

```bash
git add src/components/agents-hub/CreateView.jsx
git commit -m "feat(hub): create view (brief editor + scaffold/queue)"
```

---

## Task 7: ArtifactsView

**Files:**
- Create: `src/components/agents-hub/ArtifactsView.jsx`

- [ ] **Step 1: Write ArtifactsView**

`src/components/agents-hub/ArtifactsView.jsx`:
```jsx
import { useState, useEffect } from 'react';
import Markdown from './Markdown';
import { readFile, runScript } from '../../data/agentsHubApi';

const ORDER = ['FIX-REPORT', 'synthesis', 'ux-verdict', 'recruiter-verdict', 'director-verdict', 'edit-summary', 'copy-summary', 'verify-report', 'extracted'];

const ArtifactsView = ({ studies, selectedSlug, setSelectedSlug }) => {
  const study = studies.find((s) => s.slug === selectedSlug);
  const available = study ? ORDER.filter((a) => study.artifacts.includes(a)) : [];
  const [active, setActive] = useState('');
  const [md, setMd] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => { setActive(available[0] || ''); }, [selectedSlug]); // eslint-disable-line

  useEffect(() => {
    if (!selectedSlug || !active) { setMd(''); return; }
    readFile(`cases/reviews/${selectedSlug}/${active}.md`).then((r) => setMd(r.content)).catch((e) => setMd(`⚠ ${e.message}`));
  }, [selectedSlug, active]);

  const loadBudget = async () => {
    try { const { stdout } = await runScript('budget', { slug: selectedSlug }); setBudget(stdout); }
    catch (e) { setBudget(e.message); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        <select className="hub-input" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          <option value="">— pick a study —</option>
          {studies.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
        {available.map((a) => <button key={a} className={`hub-btn ${active === a ? 'primary' : ''}`} onClick={() => setActive(a)}>{a}</button>)}
        {selectedSlug && <button className="hub-btn" onClick={loadBudget}>Budget table</button>}
      </div>
      {budget && <div className="hub-md"><Markdown>{'```\n' + budget + '\n```'}</Markdown></div>}
      {!selectedSlug && <div>Pick a study to read its review artifacts.</div>}
      {selectedSlug && !available.length && <div>No artifacts yet — run Review/Fix first.</div>}
      {md && <Markdown>{md}</Markdown>}
    </div>
  );
};

export default ArtifactsView;
```

- [ ] **Step 2: Verify in the browser**

Artifacts tab: pick a study that already has artifacts (e.g. `project-1776014998709` from the earlier review runs). Expected: the artifact buttons appear; clicking one renders its markdown (GFM pipe tables render as real tables via the custom renderer); "Budget table" renders the budget as a fenced block.

- [ ] **Step 3: Commit (local only)**

```bash
git add src/components/agents-hub/ArtifactsView.jsx
git commit -m "feat(hub): artifacts view (rendered verdicts + budget)"
```

---

## Task 8: VerifyView

**Files:**
- Create: `src/components/agents-hub/VerifyView.jsx`

- [ ] **Step 1: Write VerifyView**

`src/components/agents-hub/VerifyView.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { readFile, enqueueJob } from '../../data/agentsHubApi';

// Pull the "Verify before sending" bullet list out of FIX-REPORT.md.
function parseVerifyItems(mdText) {
  if (!mdText) return [];
  const lines = mdText.split('\n');
  const start = lines.findIndex((l) => /^##\s+Verify before sending/i.test(l));
  if (start < 0) return [];
  const items = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    const m = lines[i].match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (m) items.push(m[1].trim());
  }
  return items;
}

const VerifyView = ({ studies, selectedSlug, setSelectedSlug, onRefresh }) => {
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    setItems([]); setAnswers({});
    if (!selectedSlug) return;
    readFile(`cases/reviews/${selectedSlug}/FIX-REPORT.md`)
      .then((r) => { const it = parseVerifyItems(r.content); setItems(it); setAnswers(Object.fromEntries(it.map((_, i) => [i, { decision: 'keep', value: '' }]))); })
      .catch((e) => setStatus(e.message));
  }, [selectedSlug]);

  const setDecision = (i, decision) => setAnswers((a) => ({ ...a, [i]: { ...a[i], decision } }));
  const setValue = (i, value) => setAnswers((a) => ({ ...a, [i]: { ...a[i], value } }));

  const apply = async () => {
    const payload = items.map((text, i) => ({ item: text, decision: answers[i].decision, value: answers[i].value }));
    try { await enqueueJob({ action: 'resolve', slug: selectedSlug, answers: payload }); await onRefresh(); setStatus('Queued resolve job — run "run hub jobs" in Claude Code.'); }
    catch (e) { setStatus(e.message); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        <select className="hub-input" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          <option value="">— pick a study —</option>
          {studies.filter((s) => s.artifacts.includes('FIX-REPORT')).map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
      </div>
      {status && <div className="hub-pill" style={{ display: 'block', marginBottom: 10 }}>{status}</div>}
      {selectedSlug && !items.length && <div>No "Verify before sending" items in this study's FIX-REPORT.</div>}
      {items.map((text, i) => (
        <div key={i} className="hub-verify-item">
          <div>{text}</div>
          <div className="choices">
            {['keep', 'genericize', 'replace'].map((d) => (
              <button key={d} className={`hub-btn ${answers[i]?.decision === d ? 'primary' : ''}`} onClick={() => setDecision(i, d)}>{d}</button>
            ))}
            {answers[i]?.decision === 'replace' && (
              <input className="hub-input" placeholder="real value" value={answers[i].value} onChange={(e) => setValue(i, e.target.value)} />
            )}
          </div>
        </div>
      ))}
      {items.length > 0 && <button className="hub-btn primary" onClick={apply}>Apply answers (queue resolve)</button>}
    </div>
  );
};

export default VerifyView;
```

- [ ] **Step 2: Verify in the browser**

Verify tab: pick a study with a FIX-REPORT. Expected: the "Verify before sending" items list out; each has keep/genericize/replace; choosing "replace" shows a value input; "Apply answers" queues a `resolve` job (Jobs bar updates). Clean up the test job: `rm -rf cases/reviews/_jobs`.

- [ ] **Step 3: Commit (local only)**

```bash
git add src/components/agents-hub/VerifyView.jsx
git commit -m "feat(hub): verify view (checklist + queue resolve)"
```

---

## Task 9: `run hub jobs` trigger in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (Case Study Review System section)

- [ ] **Step 1: Add the trigger**

Insert this trigger in `CLAUDE.md` right after the `## Trigger: "create case study" …` section:

```markdown
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
```

- [ ] **Step 2: Register the Hub in the system overview**

In the same section, add `scripts/hub-jobs.mjs` next to the other helper commands, and add to the File structure block:
```
cases/reviews/_jobs/<id>.json       ← Agents Hub queue (gitignored; written by the /agents-hub UI, drained by "run hub jobs")
scripts/hub-jobs.mjs                ← job-queue I/O (enqueue/list/set) shared by the UI endpoints + the trigger
```

- [ ] **Step 3: Commit (local only)**

```bash
git add CLAUDE.md
git commit -m "docs(hub): run hub jobs trigger + registration"
```

---

## Task 10: Full-loop verification + build

- [ ] **Step 1: Lint + build**

Run:
```bash
npm run lint
npm run build
```
Expected: lint clean (or only pre-existing warnings unrelated to hub files); build succeeds. The hub page is lazy + gated, so it tree-shakes out of the runtime path in production; the endpoints live only on the dev middleware and are absent from the build.

- [ ] **Step 2: End-to-end smoke (real round-trip)**

With `npm run dev` + edit mode:
1. **Create:** Create tab → New from template → name `e2e-test`, title "E2E Test" → Save → Scaffold + queue create. Confirm a `project-…` study appears and a `create` job is `queued`.
2. **Drain:** in the Claude Code chat, run `run hub jobs`. Confirm the job flips to `running` then `done`, and artifacts (verdicts, synthesis, FIX-REPORT) get written under `cases/reviews/<slug>/`.
3. **View:** Studies → View → Artifacts render; Budget table shows 0 over budget.
4. **Verify:** Verify tab → the FIX-REPORT checklist lists items → choose decisions → Apply → a `resolve` job queues → `run hub jobs` again → checklist shrinks.

- [ ] **Step 3: Clean up the e2e study**

```bash
rm -f cases/briefs/e2e-test.md src/data/case-studies/<e2e-slug>.json
rm -rf cases/reviews/<e2e-slug> cases/reviews/_jobs
git checkout src/data/case-studies/index.js
echo cleaned
```

- [ ] **Step 4: Final commit (local only)**

```bash
git add -A
git commit -m "chore(hub): agents hub end-to-end verified"
```

---

## Self-review notes (author)

- **Spec coverage:** page+nav (T4), 4 views/capabilities create/review-fix/artifacts/verify (T5–T8), 6 endpoints (T2), job queue + `run hub jobs` (T1/T9), markdown render (T4), instant `new` + queued AI (T6), whitelisted file read (T2). All spec sections map to a task.
- **Endpoint prefix footgun** resolved by `/api/hub/enqueue` (not `/api/hub/job`) — documented in File structure.
- **Import-side-effect footgun**: `hub-jobs.mjs` guards its CLI dispatch with the `isMain` check so importing it in the Vite plugin doesn't run CLI code.
- **Naming consistency:** client `enqueueJob/getOverview/getJobs/runScript/readFile/writeBrief` match endpoint paths and are used identically across T5–T8. `runScript('budget'|'new')`, `enqueueJob({action,slug,briefName,answers})` consistent throughout.
- **Open questions from spec:** (1) `_jobs/` is gitignored (T1). (2) AgentsHub is split into shell + 6 focused components (all < ~120 lines).
```
