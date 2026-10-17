// Screenshot every annotated figure of a case study article (desktop, fresh browser
// context so it reads the saved JSON — not an edit-mode cache).
//
// playwright-core is NOT a repo dependency: copy this file into a scratch dir that has
// `npm i playwright-core`, then run it there (dev server must be up on :5173):
//   node shoot.mjs <slug> <out-dir> [src-substring ...]
import { chromium } from 'playwright-core';
import fs from 'fs';

const [slug, outDir = 'shots', ...only] = process.argv.slice(2);
if (!slug) { console.error('usage: node shoot.mjs <slug> <out-dir> [src-substring ...]'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:5173/project/${slug}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const figs = page.locator('.cs-article-figure').filter({ has: page.locator('.cs-annot-layer') });
const n = await figs.count();
let shot = 0;
for (let i = 0; i < n; i++) {
  const fig = figs.nth(i);
  const src = await fig.evaluate((el) => (el.querySelector('img, video')?.getAttribute('src') || '').split('/').pop());
  if (only.length && !only.some((s) => src.includes(s))) continue;
  await fig.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  const file = `${outDir}/${slug}-${String(i).padStart(2, '0')}-${src.replace(/\W+/g, '_')}.png`;
  await fig.screenshot({ path: file });
  console.log('shot', file);
  shot++;
}
console.log(`${slug}: ${n} annotated figures, ${shot} screenshots; errors: ${errors.length ? errors.join(' | ') : 'none'}`);
await browser.close();
