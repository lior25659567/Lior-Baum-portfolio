#!/usr/bin/env node
// Idempotently injects scrollbar-hiding CSS into every iframe HTML under
// public/iframes/. The marker comment `/* scrollbar-hide */` makes re-runs a
// no-op. Run: node scripts/hide-iframe-scrollbars.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ROOT = path.join(REPO_ROOT, 'public', 'iframes');
const MARKER = '/* scrollbar-hide */';
const SNIPPET = `${MARKER}
* { scrollbar-width: none; -ms-overflow-style: none; }
*::-webkit-scrollbar { width: 0; height: 0; display: none; }
html, body { overflow: hidden; overscroll-behavior: none; }
`;

if (!fs.existsSync(ROOT)) {
  console.error(`Directory not found: ${ROOT}`);
  process.exit(1);
}

const files = fs.readdirSync(ROOT)
  .filter((f) => f.toLowerCase().endsWith('.html'))
  .map((f) => path.join(ROOT, f));

let updated = 0;
let already = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes(MARKER)) { already++; continue; }

  let next;
  const styleOpenIdx = src.search(/<style\b[^>]*>/i);
  if (styleOpenIdx !== -1) {
    const tagEnd = src.indexOf('>', styleOpenIdx) + 1;
    next = src.slice(0, tagEnd) + '\n' + SNIPPET + src.slice(tagEnd);
  } else {
    const headIdx = src.search(/<head\b[^>]*>/i);
    if (headIdx !== -1) {
      const tagEnd = src.indexOf('>', headIdx) + 1;
      next = src.slice(0, tagEnd) + `\n<style>\n${SNIPPET}</style>` + src.slice(tagEnd);
    } else {
      next = `<style>\n${SNIPPET}</style>\n` + src;
    }
  }

  fs.writeFileSync(file, next);
  updated++;
  process.stdout.write(`+ ${path.relative(REPO_ROOT, file)}\n`);
}

console.log(`\nUpdated: ${updated}  Already had marker: ${already}  Total: ${files.length}`);
