#!/usr/bin/env node
// Video media pipeline for public/case-studies/*.mp4.
//
// Desktop originals are LEFT UNTOUCHED — no transcode, no resize, no
// re-encode. Whatever the user uploaded is what desktop serves.
//
// For every desktop mp4 we generate two siblings:
//   1. <name>.mobile.mp4  — 720p cap, CRF 30, AAC 64k. LazyVideo serves
//      this on mobile + saveData + slow-2g/2g/3g connections so phones
//      on cellular download ~1/3 the bytes.
//   2. <name>.poster.webp — first frame at q80, so the slide has an
//      instant preview before the video bytes land.
//
// Both siblings are idempotent: regenerated only when missing. Pass
// --force to rebuild them even when they already exist (e.g. after
// tuning the mobile encoder settings).
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
const CRF_MOBILE = 30;
const PRESET = 'slow';
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');

const isMobileVariant = (f) => /\.mobile\.mp4$/i.test(f);

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

function buildMobile(file, outPath) {
  // Screen-recording sources are full-range (Y: 0-255) but the default
  // H.264 pipeline tags output as TV range (16-235). Browsers then expand
  // a file that's already full-range, crushing shadows. Forcing
  // `in_range=pc`/`out_range=pc` + `-color_range pc` preserves the data
  // and tells the decoder not to re-expand it.
  run('ffmpeg', [
    '-y', '-i', file,
    '-vf', "scale='min(1280,iw)':'-2':in_range=pc:out_range=pc",
    '-c:v', 'libx264', '-crf', String(CRF_MOBILE), '-preset', PRESET,
    '-pix_fmt', 'yuv420p',
    '-color_range', 'pc',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart',
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

if (!fs.existsSync(ROOT)) {
  console.error(`Directory not found: ${ROOT}`);
  process.exit(1);
}

const files = walk(ROOT);
if (files.length === 0) {
  console.log(`No mp4 files under ${ROOT}`);
  process.exit(0);
}

console.log(`${DRY ? '[dry run] ' : ''}Processing ${files.length} mp4 file(s)`);
console.log('Desktop originals are not modified. Generating mobile + poster siblings only.\n');

let mobileGenerated = 0;
let postersGenerated = 0;
let failed = 0;

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const sizeBefore = fs.statSync(file).size;
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const mobilePath = path.join(dir, `${base}.mobile.mp4`);
  const posterPath = path.join(dir, `${base}.poster.webp`);
  const needsMobile = FORCE || !fs.existsSync(mobilePath);
  const needsPoster = FORCE || !fs.existsSync(posterPath);

  process.stdout.write(`→ ${rel} (${fmtMB(sizeBefore)})`);

  if (DRY) {
    const steps = [needsMobile ? 'mobile' : null, needsPoster ? 'poster' : null].filter(Boolean);
    console.log(steps.length ? `  [${steps.join('+')}]` : '  (up to date)');
    continue;
  }

  try {
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
    if (!needsMobile && !needsPoster) {
      process.stdout.write('  (up to date)');
    }
    console.log('');
  } catch (err) {
    console.log(`  FAILED — ${err.message}`);
    failed++;
  }
}

console.log(`\nMobile variants generated: ${mobileGenerated}`);
console.log(`Posters generated: ${postersGenerated}`);
if (failed) console.log(`Failed: ${failed}`);
