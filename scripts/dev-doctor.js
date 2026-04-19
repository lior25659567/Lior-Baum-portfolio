#!/usr/bin/env node
// dev-doctor — one-shot diagnostic for the common "push broken / localhost
// stuck / disconnects" cluster. Prints a colored health report covering:
//   * Node / npm versions, free memory
//   * Port 5173 state (who's holding it)
//   * Dev server reachability (+ /api/health if up)
//   * Git remote, credential helper, remote reachability
//   * Repo sanity (sizes of watch-ignored trees)
//
// Read-only — never mutates anything.

import { execSync, spawnSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import http from 'http';

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const rows = [];
function row(label, value, status = 'info') {
  rows.push({ label, value, status });
}

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch (e) { return null; }
}

function dirSizeMB(p) {
  try {
    const out = execSync(`du -sk "${p}" 2>/dev/null`, { encoding: 'utf-8' }).trim();
    const kb = Number(out.split(/\s+/)[0]);
    return Number.isFinite(kb) ? Math.round(kb / 1024) : null;
  } catch { return null; }
}

// ── Node / system ────────────────────────────────────────────────────────
row('Node', process.version, 'info');
row('npm', sh('npm -v') || 'not found', sh('npm -v') ? 'ok' : 'bad');
const freeGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
const totalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
row('Memory free', `${freeGB} / ${totalGB} GB`, os.freemem() < 500 * 1024 * 1024 ? 'warn' : 'ok');

// ── Port 5173 ─────────────────────────────────────────────────────────────
const port = 5173;
const lsof = sh(`lsof -iTCP:${port} -sTCP:LISTEN -n -P 2>/dev/null`);
if (lsof) {
  row(`Port ${port}`, 'in use (see details below)', 'warn');
  console.error(`${C.dim}${lsof}${C.reset}`);
} else {
  row(`Port ${port}`, 'free (dev server not running)', 'info');
}

// ── Dev server reachability ──────────────────────────────────────────────
async function httpGet(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
  });
}

const health = await httpGet(`http://localhost:${port}/api/health`, 2000);
if (health.status === 200) {
  try {
    const j = JSON.parse(health.body);
    row('Dev API /api/health', `OK uptime=${j.uptimeSec}s heap=${j.memoryMB.heapUsed}/${j.memoryMB.heapTotal}MB rss=${j.memoryMB.rss}MB`, 'ok');
  } catch {
    row('Dev API /api/health', `OK (non-JSON response)`, 'warn');
  }
} else if (health.status === 0) {
  row('Dev API /api/health', `unreachable (${health.body})`, lsof ? 'bad' : 'info');
} else {
  row('Dev API /api/health', `HTTP ${health.status}`, 'warn');
}

// ── Git ──────────────────────────────────────────────────────────────────
row('Git branch', sh('git rev-parse --abbrev-ref HEAD') || 'not a repo', 'info');
row('Git remote', sh('git config --get remote.origin.url') || 'not set', 'info');
row('Credential helper', sh('git config --get credential.helper') || 'none', 'info');

const lsRemote = spawnSync('git', ['ls-remote', '--heads', 'origin'], {
  encoding: 'utf-8',
  timeout: 10_000,
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: 'echo' },
});
if (lsRemote.status === 0) {
  row('Remote reachable', 'yes (creds OK, non-interactive)', 'ok');
} else {
  const err = (lsRemote.stderr || '').trim().split('\n').slice(-1)[0] || `exit ${lsRemote.status}`;
  row('Remote reachable', `NO — ${err}`, 'bad');
}

const dirty = sh('git status --porcelain') || '';
row('Working tree', dirty ? `${dirty.split('\n').length} unstaged` : 'clean', dirty ? 'warn' : 'ok');
const aheadBehind = sh('git rev-list --left-right --count @{u}...HEAD 2>/dev/null');
if (aheadBehind) {
  const [behind, ahead] = aheadBehind.split(/\s+/).map(Number);
  row('vs upstream', `ahead=${ahead} behind=${behind}`, (ahead || behind) ? 'warn' : 'ok');
}

// ── Repo health ──────────────────────────────────────────────────────────
const caseStudiesSize = dirSizeMB(path.resolve('public/case-studies'));
if (caseStudiesSize !== null) row('public/case-studies', `${caseStudiesSize} MB`, caseStudiesSize > 500 ? 'warn' : 'ok');
const gitSize = dirSizeMB(path.resolve('.git'));
if (gitSize !== null) row('.git', `${gitSize} MB`, gitSize > 500 ? 'warn' : 'ok');

// ── Report ───────────────────────────────────────────────────────────────
function color(status) {
  if (status === 'ok') return C.green;
  if (status === 'warn') return C.yellow;
  if (status === 'bad') return C.red;
  return C.cyan;
}
function tag(status) {
  if (status === 'ok') return ' OK  ';
  if (status === 'warn') return 'WARN ';
  if (status === 'bad') return 'FAIL ';
  return '  -  ';
}

console.log();
console.log(`${C.bold}Dev Doctor — ${new Date().toLocaleString()}${C.reset}`);
console.log('─'.repeat(60));
const labelWidth = Math.max(...rows.map(r => r.label.length)) + 2;
for (const r of rows) {
  const pad = r.label.padEnd(labelWidth);
  console.log(`${color(r.status)}${tag(r.status)}${C.reset} ${C.bold}${pad}${C.reset}${r.value}`);
}
console.log('─'.repeat(60));

const hasFail = rows.some(r => r.status === 'bad');
const hints = [];
if (lsof && health.status === 0) hints.push('• Port 5173 is held by a process that is NOT responding. Kill it: `lsof -ti:5173 | xargs kill -9` then re-run `npm run dev`.');
if (lsRemote.status !== 0) hints.push('• Git remote unreachable non-interactively. Run `git push` from a terminal to refresh credentials in your keychain.');
if (hints.length) {
  console.log(`${C.bold}Hints:${C.reset}`);
  for (const h of hints) console.log(h);
  console.log();
}
process.exit(hasFail ? 1 : 0);
