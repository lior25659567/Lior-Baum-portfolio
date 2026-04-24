#!/usr/bin/env node
// Video media pipeline for public/case-studies/*.mp4.
//
//   1. Desktop re-encode (in-place, H.264 CRF 28, +faststart) — only when the
//      source is > SIZE_THRESHOLD_MB and the result is meaningfully smaller.
//   2. Mobile variant `<name>.mobile.mp4` (720p cap, CRF 30, aac 64k) — for
//      every video, so phones on cellular download ~1/3 the bytes.
//   3. Poster frame `<name>.poster.webp` (first frame @ q80) — for every
//      video, so the slide has an instant preview instead of a blank frame.
//
// Originals are copied into backups/case-studies-videos-<ts>/ before desktop
// re-encode. Mobile + poster steps never touch the original.
//
// Run: node scripts/compress-videos.js
// Dry: node scripts/compress-videos.js --dry

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ROOT = path.join(REPO_ROOT, 'public', 'case-studies');
const SIZE_THRESHOLD_MB = 2;
// CRF 20 on a 1920-wide frame gives sharp output close to visually lossless.
// The earlier CRF 28 at the source's native 2880×1800 spent its bit budget
// across too many pixels and produced soft, smeared frames on desktop.
const CRF_DESKTOP = 20;
const CRF_MOBILE = 30;
const DESKTOP_MAX_W = 1920;
const PRESET = 'slow';
const DRY = process.argv.includes('--dry');
// `--from-backup` restores the pristine original from the most recent
// backups/case-studies-videos-* dir before running the desktop encode +
// mobile/poster rebuild, so we re-encode from clean source instead of
// recompressing an already-degraded file.
const FROM_BACKUP = process.argv.includes('--from-backup');
// `--force` re-runs the desktop compression even if the current file is
// under SIZE_THRESHOLD_MB (e.g. after CRF / resolution tuning).
const FORCE = process.argv.includes('--force') || FROM_BACKUP;

const isMobileVariant = (f) => /\.mobile\.mp4$/i.test(f);
const isPosterFile = (f) => /\.poster\.webp$/i.test(f);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp4') && !isMobileVariant(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function fmtMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (result.status !== 0) {
    const tail = result.stderr?.toString().trim().split('\n').slice(-3).join(' | ') || `${cmd} failed`;
    throw new Error(tail);
  }
}

function compressDesktop(file) {
  const tmp = file + '.compressing.mp4';
  run('ffmpeg', [
    '-y', '-i', file,
    '-vf', `scale='min(${DESKTOP_MAX_W},iw)':'-2'`,
    '-c:v', 'libx264', '-crf', String(CRF_DESKTOP), '-preset', PRESET,
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '96k',
    tmp,
  ]);
  return tmp;
}

function buildMobile(file, outPath) {
  run('ffmpeg', [
    '-y', '-i', file,
    '-vf', "scale='min(1280,iw)':'-2'",
    '-c:v', 'libx264', '-crf', String(CRF_MOBILE), '-preset', PRESET,
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '64k', '-ac', '2',
    outPath,
  ]);
}

function buildPoster(file, outPath) {
  const tmpPng = outPath + '.tmp.png';
  try {
    run('ffmpeg', ['-y', '-ss', '0.1', '-i', file, '-frames:v', '1', tmpPng]);
    run('cwebp', ['-q', '80', '-quiet', tmpPng, '-o', outPath]);
  } finally {
    if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
  }
}

function backupOriginal(file, backupDir) {
  const rel = path.relative(ROOT, file);
  const dest = path.join(backupDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}

if (!fs.existsSync(ROOT)) {
  console.error(`Directory not found: ${ROOT}`);
  process.exit(1);
}

// With --from-backup, restore pristine originals from the most recent
// backups/case-studies-videos-* directory before the compression pass.
// Also deletes the existing mobile + poster so they get rebuilt from
// clean source at the new quality settings.
const restoredFromBackup = new Set();
if (FROM_BACKUP && !DRY) {
  const backupsRoot = path.join(REPO_ROOT, 'backups');
  const backupDirs = fs.existsSync(backupsRoot)
    ? fs.readdirSync(backupsRoot).filter((n) => n.startsWith('case-studies-videos-'))
    : [];
  if (backupDirs.length === 0) {
    console.error('--from-backup: no backups/case-studies-videos-* directory found');
    process.exit(1);
  }
  backupDirs.sort();
  const src = path.join(backupsRoot, backupDirs[backupDirs.length - 1]);
  console.log(`--from-backup: restoring originals from ${path.relative(REPO_ROOT, src)}/\n`);
  const restoreWalk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { restoreWalk(full); continue; }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.mp4')) continue;
      if (isMobileVariant(entry.name)) continue;
      const rel = path.relative(src, full);
      const dest = path.join(ROOT, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
      // Drop the derived artifacts so the pipeline rebuilds them from
      // the restored source.
      const base = path.basename(dest, path.extname(dest));
      const siblingDir = path.dirname(dest);
      const mobilePath = path.join(siblingDir, `${base}.mobile.mp4`);
      const posterPath = path.join(siblingDir, `${base}.poster.webp`);
      if (fs.existsSync(mobilePath)) fs.unlinkSync(mobilePath);
      if (fs.existsSync(posterPath)) fs.unlinkSync(posterPath);
      restoredFromBackup.add(dest);
      console.log(`  restored ${rel}`);
    }
  };
  restoreWalk(src);
  console.log('');
}

const files = walk(ROOT);
if (files.length === 0) {
  console.log(`No mp4 files under ${ROOT}`);
  process.exit(0);
}

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(REPO_ROOT, 'backups', `case-studies-videos-${ts}`);

console.log(`${DRY ? '[dry run] ' : ''}Processing ${files.length} mp4 file(s)\n`);
if (!DRY) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Backups → ${path.relative(REPO_ROOT, backupDir)}/\n`);
}

let totalBefore = 0;
let totalAfter = 0;
let mobileGenerated = 0;
let postersGenerated = 0;
let failed = 0;

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const sizeBefore = fs.statSync(file).size;
  totalBefore += sizeBefore;
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const mobilePath = path.join(dir, `${base}.mobile.mp4`);
  const posterPath = path.join(dir, `${base}.poster.webp`);
  // With --from-backup, only re-encode files that were actually restored
  // from the backup — files without a backup counterpart are already
  // lossy-compressed, and re-encoding them just degrades them further.
  const skipDueToNoBackup = FROM_BACKUP && !restoredFromBackup.has(file);
  const needsDesktop = !skipDueToNoBackup && (FORCE || sizeBefore > SIZE_THRESHOLD_MB * 1024 * 1024);
  const needsMobile = !fs.existsSync(mobilePath);
  const needsPoster = !fs.existsSync(posterPath);

  process.stdout.write(`→ ${rel} (${fmtMB(sizeBefore)})`);

  if (DRY) {
    const steps = [
      needsDesktop ? 'desktop' : null,
      needsMobile ? 'mobile' : null,
      needsPoster ? 'poster' : null,
    ].filter(Boolean);
    console.log(steps.length ? `  [${steps.join('+')}]` : '  (up to date)');
    totalAfter += sizeBefore;
    continue;
  }

  let sizeAfter = sizeBefore;
  try {
    if (needsDesktop) {
      backupOriginal(file, backupDir);
      const tmp = compressDesktop(file);
      const compressedSize = fs.statSync(tmp).size;
      if (compressedSize >= sizeBefore * 0.95) {
        fs.unlinkSync(tmp);
        process.stdout.write('  desktop: kept original');
      } else {
        fs.renameSync(tmp, file);
        sizeAfter = compressedSize;
        const pct = ((1 - compressedSize / sizeBefore) * 100).toFixed(1);
        process.stdout.write(`  desktop: ${fmtMB(compressedSize)} (−${pct}%)`);
      }
    }

    if (needsMobile) {
      buildMobile(file, mobilePath);
      mobileGenerated++;
      process.stdout.write(`  mobile: ${fmtMB(fs.statSync(mobilePath).size)}`);
    }

    if (needsPoster) {
      buildPoster(file, posterPath);
      postersGenerated++;
      process.stdout.write(`  poster: ${fmtMB(fs.statSync(posterPath).size)}`);
    }

    console.log('');
  } catch (err) {
    console.log(`  FAILED — ${err.message}`);
    failed++;
  }

  totalAfter += sizeAfter;
}

console.log(`\nDesktop total: ${fmtMB(totalBefore)} → ${fmtMB(totalAfter)} (saved ${fmtMB(totalBefore - totalAfter)})`);
console.log(`Mobile variants generated: ${mobileGenerated}`);
console.log(`Posters generated: ${postersGenerated}`);
if (failed) console.log(`Failed: ${failed}`);
