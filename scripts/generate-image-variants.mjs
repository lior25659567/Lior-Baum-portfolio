#!/usr/bin/env node
// Emits responsive width variants for every .webp under public/case-studies/
// (excluding poster frames and any previously-generated @width files).
//
//   foo.webp  →  foo@480.webp, foo@960.webp  (siblings; `foo.webp` stays as the
//                                             full/1440 source served as-is)
//
// Variants are only produced when the source is wider than the target; this
// avoids upscaling tiny icons. A manifest at public/case-studies/_variants.json
// lets the frontend build a correct srcset without probing 404s:
//
//   {
//     "/case-studies/align/foo.webp": { "widths": [480, 960, 1440], "full": 1440 },
//     ...
//   }
//
// Idempotent: re-running skips variants that already exist and are newer than
// their source. Run: node scripts/generate-image-variants.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ROOT = path.join(REPO_ROOT, 'public', 'case-studies');
const PUBLIC_PREFIX = '/case-studies';
// 1920 added so retina laptops at full slide width get a variant that
// actually meets their physical-pixel target instead of being upscaled
// from @1440. Variants are skipped automatically when the source is
// smaller than the target width, so nothing gets upscaled.
const TARGET_WIDTHS = [480, 960, 1440, 1920];
const QUALITY = 92;
const EFFORT = 6;

const VARIANT_RE = /@\d+\.webp$/i;
const POSTER_RE = /\.poster\.webp$/i;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith('.webp') &&
      !VARIANT_RE.test(entry.name) &&
      !POSTER_RE.test(entry.name)
    ) acc.push(full);
  }
  return acc;
}

if (!fs.existsSync(ROOT)) {
  console.error(`Directory not found: ${ROOT}`);
  process.exit(1);
}

const files = walk(ROOT);
console.log(`Processing ${files.length} source webp file(s)\n`);

const manifest = {};
let generated = 0;
let skipped = 0;
let upToDate = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const publicUrl = `${PUBLIC_PREFIX}/${rel.split(path.sep).join('/')}`;
  const dir = path.dirname(file);
  const base = path.basename(file, '.webp');

  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (err) {
    console.log(`× ${rel} — metadata failed: ${err.message}`);
    continue;
  }
  const srcWidth = meta.width || 0;
  const srcMtime = fs.statSync(file).mtimeMs;
  const widths = [];

  for (const w of TARGET_WIDTHS) {
    if (srcWidth <= w) { skipped++; continue; }
    const out = path.join(dir, `${base}@${w}.webp`);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcMtime) {
      widths.push(w);
      upToDate++;
      continue;
    }
    try {
      await sharp(file)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: EFFORT })
        .toFile(out);
      widths.push(w);
      generated++;
      process.stdout.write(`+ ${path.relative(process.cwd(), out)}\n`);
    } catch (err) {
      console.log(`× ${path.relative(process.cwd(), out)} — ${err.message}`);
    }
  }

  widths.push(srcWidth || 1440);
  manifest[publicUrl] = { widths: [...new Set(widths)].sort((a, b) => a - b), full: srcWidth || 1440 };
}

const manifestPath = path.join(REPO_ROOT, 'src', 'data', 'case-study-image-variants.json');
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nGenerated: ${generated}  Up-to-date: ${upToDate}  Skipped (source too small): ${skipped}`);
console.log(`Manifest: ${path.relative(REPO_ROOT, manifestPath)} (${Object.keys(manifest).length} entries)`);
