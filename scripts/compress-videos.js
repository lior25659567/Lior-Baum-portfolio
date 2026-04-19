#!/usr/bin/env node
// Compresses every mp4 under public/case-studies/ above SIZE_THRESHOLD_MB
// in-place with h.264 + CRF 28. Filenames stay the same, so JSON references
// keep working. Run: `node scripts/compress-videos.js`
// Dry run (no writes): `node scripts/compress-videos.js --dry`

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'public', 'case-studies');
const SIZE_THRESHOLD_MB = 2;
const CRF = 28;
const PRESET = 'slow';
const DRY = process.argv.includes('--dry');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp4')) acc.push(full);
  }
  return acc;
}

function fmtMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function compress(file) {
  const tmp = file + '.compressing.mp4';
  const args = [
    '-y',
    '-i', file,
    '-c:v', 'libx264',
    '-crf', String(CRF),
    '-preset', PRESET,
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-c:a', 'aac',
    '-b:a', '96k',
    tmp,
  ];
  const result = spawnSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (result.status !== 0) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    throw new Error(result.stderr?.toString().trim().split('\n').slice(-3).join(' | ') || 'ffmpeg failed');
  }
  return tmp;
}

if (!fs.existsSync(ROOT)) {
  console.error(`Directory not found: ${ROOT}`);
  process.exit(1);
}

const files = walk(ROOT).filter((f) => fs.statSync(f).size > SIZE_THRESHOLD_MB * 1024 * 1024);

if (files.length === 0) {
  console.log(`No mp4 files above ${SIZE_THRESHOLD_MB} MB under ${ROOT}`);
  process.exit(0);
}

console.log(`${DRY ? '[dry run] ' : ''}Found ${files.length} mp4 file(s) > ${SIZE_THRESHOLD_MB} MB\n`);

let totalBefore = 0;
let totalAfter = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const sizeBefore = fs.statSync(file).size;
  totalBefore += sizeBefore;
  process.stdout.write(`→ ${rel} (${fmtMB(sizeBefore)})… `);

  if (DRY) {
    console.log('skipped (dry run)');
    totalAfter += sizeBefore;
    continue;
  }

  try {
    const tmp = compress(file);
    const sizeAfter = fs.statSync(tmp).size;
    if (sizeAfter >= sizeBefore * 0.95) {
      fs.unlinkSync(tmp);
      console.log(`kept original (compressed barely smaller: ${fmtMB(sizeAfter)})`);
      totalAfter += sizeBefore;
      skipped++;
    } else {
      fs.renameSync(tmp, file);
      totalAfter += sizeAfter;
      const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
      console.log(`${fmtMB(sizeAfter)} (−${pct}%)`);
    }
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
    totalAfter += sizeBefore;
    failed++;
  }
}

console.log(`\nTotal: ${fmtMB(totalBefore)} → ${fmtMB(totalAfter)}  (saved ${fmtMB(totalBefore - totalAfter)})`);
if (skipped) console.log(`Skipped (already efficient): ${skipped}`);
if (failed) console.log(`Failed: ${failed}`);
