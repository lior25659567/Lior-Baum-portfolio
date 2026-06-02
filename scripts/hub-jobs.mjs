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
