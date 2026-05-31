#!/usr/bin/env node
// Case Study text tool — extract prose for review, apply edits back (text + slide
// structure), and generate the slide-template reference the review agents read.
// Text edits only touch prose fields; structural ops add/remove/retype whole
// slides. NEVER touches JSX, React components, or CSS — only the case study JSON.
//
//   node scripts/case-study-text.mjs extract   <slug>
//   node scripts/case-study-text.mjs apply     <slug> [editsPath]
//   node scripts/case-study-text.mjs templates           # writes the template reference
//
// <slug> = a file in src/data/case-studies/ without .json.
//
// edits file (cases/reviews/<slug>/edits.json) may be EITHER:
//   (a) a flat text map:        { "slides.2.title": "new text", ... }
//   (b) a structured object:    { "edits": { <path>: <text> },
//                                 "ops":   [ <structural op>, ... ] }
// Structural ops (each references ORIGINAL slide indices):
//   { "op": "insert", "after": 3, "slide": { ...full slide... }, "reason": "..." }
//   { "op": "remove", "index": 7, "reason": "..." }
//   { "op": "retype", "index": 5, "slide": { ...full slide... }, "reason": "..." }
// Use "after": -1 to insert at the very start.

import fs from 'node:fs';
import path from 'node:path';

const CS_DIR = 'src/data/case-studies';
const TEMPLATES_DOC = path.join('cases', 'reviews', '_slide-templates.md');

// Keys that are image / layout / config / contact data — NEVER prose.
const HARD_DENY = new Set([
  'type', 'src', 'size', 'position', 'fit', 'embedUrl', 'embedType',
  'imageDisplayMode', 'imageCarouselFit', 'afterImageCarouselFit',
  'beforeImageCarouselFit', 'imageCarouselInterval', 'switcherStyle',
  'slideMode', 'cardVariant', 'cardHeight', 'goalsCardVariant',
  'kpisCardVariant', 'color', 'logo', 'url', 'email', 'phone', 'linkedinUrl',
  'gridCols', 'gridColumns', 'splitRatio', 'introHeaderMode', 'isVideo',
  'wrapperBg', 'visual_note',
]);
// Factual data the editor must not fabricate — shown for context, refused in apply.
const PROTECT = new Set(['metric', 'number', 'year']);

// Approximate on-screen word budget per template (total visible prose words).
// These are FIXED-CANVAS presentation slides — scannable in seconds, not documents.
// Budgets are guidance for the reviewer/editor, not hard limits. Keyed by template key.
const WORD_BUDGET = {
  intro: 75, info: 100, chapter: 18, media: 35, imageMosaic: 8,
  textAndImage: 75, issuesBreakdown: 95, quotes: 110, testimonial: 45,
  goals: 100, achieveGoals: 85, process: 85, timeline: 95, comparison: 110,
  tools: 60, stats: 45, outcomes: 95, end: 18, directions: 90, reflection: 100,
};
const countWords = (s) => (s || '').trim() ? (s || '').trim().split(/\s+/).length : 0;
// total visible prose words in a slide (skips HARD_DENY + read-only data)
function slideWordCount(slide) {
  let n = 0;
  for (const { value, protectedField } of walkStrings(slide)) if (!protectedField) n += countWords(value);
  return n;
}

// Cross-slide duplication: flag prose fragments (≥6 words) on DIFFERENT slides that overlap
// heavily — same/near-same quote, point, or highlight repeated. Heuristic aid, not gospel.
const normTokens = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let inter = 0; for (const x of A) if (B.has(x)) inter++; const uni = A.size + B.size - inter; return uni ? inter / uni : 0; };
function findDuplicates(slides) {
  const frags = [];
  slides.forEach((s, i) => {
    for (const { key, value, protectedField, pathStr } of walkStrings(s, ['slides', i])) {
      if (protectedField) continue;
      const toks = normTokens(value);
      if (toks.length >= 6) frags.push({ i, field: key, pathStr, text: value.trim(), toks });
    }
  });
  const pairs = [];
  for (let a = 0; a < frags.length; a++) for (let b = a + 1; b < frags.length; b++) {
    if (frags[a].i === frags[b].i) continue;
    const j = jaccard(frags[a].toks, frags[b].toks);
    if (j >= 0.55) pairs.push({ a: frags[a], b: frags[b], j });
  }
  return pairs.sort((x, y) => y.j - x.j);
}

// Repeated FACTS: the same number+noun stat (e.g. "6 clinic", "8 interview", "89 ticket")
// stated on more than one slide. Catches repeats the sentence-level check misses, because
// the surrounding wording differs. A stat should appear once unless a deliberate tease
// (e.g. a headline metric on the cover, delivered again in outcomes).
function findRepeatedStats(slides) {
  const map = new Map(); // "num|noun" -> Set(slideIdx)
  const re = /(\d+)\s*\+?\s*(%|[A-Za-z]{4,})/g;
  slides.forEach((s, i) => {
    for (const { value } of walkStrings(s)) {
      let m;
      const r = new RegExp(re.source, 'g');
      while ((m = r.exec(value))) {
        const num = m[1];
        if (num === '0' || num === '1') continue; // skip ordinals/noise
        const noun = m[2] === '%' ? '%' : m[2].toLowerCase().replace(/s$/, '');
        const key = `${num}|${noun}`;
        if (!map.has(key)) map.set(key, new Set());
        map.get(key).add(i);
      }
    }
  });
  return [...map.entries()]
    .filter(([, set]) => set.size >= 2)
    .map(([key, set]) => { const [num, noun] = key.split('|'); return { num, noun, slides: [...set].sort((a, b) => a - b) }; });
}

const slugFile = (slug) => path.join(CS_DIR, `${slug}.json`);

function listSlugs() {
  return fs.readdirSync(CS_DIR).filter((x) => x.endsWith('.json')).map((x) => x.replace(/\.json$/, ''));
}

function readJson(slug) {
  const f = slugFile(slug);
  if (!fs.existsSync(f)) {
    console.error(`No case study at ${f}`);
    console.error(`Available: ${listSlugs().join(', ')}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function writeJsonValidated(slug, data) {
  const out = JSON.stringify(data, null, 2);
  JSON.parse(out); // throws if invalid
  fs.writeFileSync(slugFile(slug), out);
}

// ── walk string leaves (skips HARD_DENY keys) ───────────────────────────────
// Yields object-property strings AND array-element strings (bullets, kpis,
// reflection lists). For array elements the "key" used for deny/protect checks is
// the parent field name (e.g. `kpis` for `slides.5.kpis.0`).
function* walkStrings(node, trail = []) {
  if (Array.isArray(node)) {
    const parentKey = trail[trail.length - 1];
    for (let i = 0; i < node.length; i++) {
      if (typeof node[i] === 'string') {
        if (typeof parentKey === 'string' && HARD_DENY.has(parentKey)) continue;
        yield {
          pathStr: [...trail, i].join('.'),
          key: typeof parentKey === 'string' ? parentKey : String(i),
          value: node[i],
          protectedField: typeof parentKey === 'string' && PROTECT.has(parentKey),
        };
      } else {
        yield* walkStrings(node[i], [...trail, i]);
      }
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string') {
        if (HARD_DENY.has(k)) continue;
        yield { pathStr: [...trail, k].join('.'), key: k, value: v, protectedField: PROTECT.has(k) };
      } else {
        yield* walkStrings(v, [...trail, k]);
      }
    }
  }
}

function setByPath(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
    if (cur == null) return { ok: false, reason: 'path not found' };
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (cur == null || !(last in cur)) return { ok: false, reason: 'path not found' };
  if (typeof cur[last] !== 'string') return { ok: false, reason: 'target is not a string' };
  if (HARD_DENY.has(last)) return { ok: false, reason: `key "${last}" is image/layout/config — refused` };
  if (PROTECT.has(last)) return { ok: false, reason: `key "${last}" is factual data — refused` };
  cur[last] = value;
  return { ok: true };
}

// type alias → documented template key (textAndImage renders several types)
const TYPE_ALIASES = { problem: 'textAndImage', context: 'textAndImage', feature: 'textAndImage', testing: 'textAndImage' };

// collect on-disk image paths referenced by a slide (for the agent to Read visually)
function collectImagePaths(node, out = []) {
  if (Array.isArray(node)) { node.forEach((n) => collectImagePaths(n, out)); return out; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'src' && typeof v === 'string' && v.startsWith('/')) out.push(v);
      else collectImagePaths(v, out);
    }
  }
  return out;
}

// ── extract ─────────────────────────────────────────────────────────────────
async function extract(slug) {
  const { slideTemplateDocs } = await import('../src/data/slideTemplateDocs.js');
  const typeToKey = {};
  for (const [key, d] of Object.entries(slideTemplateDocs)) {
    const t = d.exampleUsage && d.exampleUsage.type;
    if (t && !(t in typeToKey)) typeToKey[t] = key;
  }
  const docFor = (type) => slideTemplateDocs[typeToKey[type] || TYPE_ALIASES[type] || type];

  const data = readJson(slug);
  const slides = Array.isArray(data.slides) ? data.slides : [];
  const lines = [];
  lines.push(`# ${data.title || slug} — extracted text`);
  lines.push('');
  lines.push(`Source: \`${slugFile(slug)}\` — ${slides.length} slides.`);
  lines.push('Each field shows its JSON path id in [brackets]. Reviewers: judge the prose,');
  lines.push('and judge whether each slide uses the RIGHT template (see `_slide-templates.md`).');
  lines.push('Fields marked (read-only) are factual data and cannot be auto-edited.');
  lines.push('**Images carry real content (quotes, UI, data). READ the listed image files**');
  lines.push('(Read tool, visual) before judging or editing — do not write `[FILL IN: quote]`');
  lines.push('for something an image already shows. Use **Available unused fields** to add');
  lines.push('structured fields (e.g. `metaItems`, `headlineMetric`) instead of cramming that');
  lines.push('data into prose.');
  lines.push('');
  // cross-slide duplication check
  const dups = findDuplicates(slides);
  if (dups.length) {
    lines.push('## ⚠ Cross-slide duplication check');
    lines.push('These prose fragments appear on more than one slide (high overlap). The same');
    lines.push('content should not live on two slides — merge or cut. (Image-vs-text repeats are');
    lines.push('NOT caught here — read the images to find those.)');
    lines.push('');
    for (const { a, b, j } of dups.slice(0, 20)) {
      lines.push(`- **${Math.round(j * 100)}% overlap** — \`[${a.pathStr || `slides.${a.i}.${a.field}`}]\` (slide ${a.i}) ↔ \`[${b.pathStr || `slides.${b.i}.${b.field}`}]\` (slide ${b.i})`);
      lines.push(`  - slide ${a.i}: "${a.text.slice(0, 90)}${a.text.length > 90 ? '…' : ''}"`);
      lines.push(`  - slide ${b.i}: "${b.text.slice(0, 90)}${b.text.length > 90 ? '…' : ''}"`);
    }
    lines.push('');
  }
  // repeated facts (same number+noun stat on 2+ slides)
  const stats = findRepeatedStats(slides);
  if (stats.length) {
    lines.push('## ⚠ Repeated facts (same stat on 2+ slides)');
    lines.push('State each stat ONCE unless a deliberate tease (e.g. a cover headline metric also');
    lines.push('shown in outcomes). Otherwise the repeat reads as padding — pick one home, cut the rest.');
    lines.push('');
    for (const { num, noun, slides: ss } of stats) {
      lines.push(`- **"${num} ${noun === '%' ? '%' : noun}"** appears on slides ${ss.join(', ')}`);
    }
    lines.push('');
  }
  slides.forEach((slide, i) => {
    const tplKey = typeToKey[slide.type] || TYPE_ALIASES[slide.type] || slide.type;
    const budget = WORD_BUDGET[tplKey];
    const words = slideWordCount(slide);
    const over = budget && words > budget * 1.25;
    lines.push('---');
    lines.push(`## Slide ${i} — type: ${slide.type || '(none)'}`);
    if (budget) lines.push(`_Words on screen: **${words}** · budget ~${budget}${over ? ' · ⚠ OVER — trim to fit the canvas' : ''}_`);
    lines.push('');
    for (const { pathStr, key, value, protectedField } of walkStrings(slide, ['slides', i])) {
      if (value.trim() === '') continue;
      const tag = protectedField ? ' (read-only)' : '';
      lines.push(`- **${key}**${tag}  \`[${pathStr}]\``);
      value.split('\n').forEach((ln) => lines.push(`  ${ln}`));
      lines.push('');
    }
    // images on disk
    const imgs = [...new Set(collectImagePaths(slide))];
    if (imgs.length) {
      lines.push(`_Images (READ these — content may live here):_ ${imgs.map((p) => `\`public${p}\``).join(', ')}`);
      lines.push('');
    }
    // available-but-unused template fields
    const doc = docFor(slide.type);
    if (doc) {
      const all = [...(doc.requiredFields || []), ...(doc.optionalFields || [])];
      const present = new Set(Object.keys(slide));
      const unused = all.filter((f) => !present.has(f));
      if (unused.length) { lines.push(`_Available unused fields (\`${typeToKey[slide.type] || TYPE_ALIASES[slide.type] || slide.type}\` template): ${unused.join(', ')}_`); lines.push(''); }
    } else {
      lines.push(`_⚠ type \`${slide.type}\` is not a documented template — consider retyping to a documented one._`);
      lines.push('');
    }
  });
  return lines.join('\n');
}

// ── apply (text edits + structural ops) ──────────────────────────────────────
function apply(slug, editsPath) {
  const data = readJson(slug);
  const ep = editsPath || path.join('cases', 'reviews', slug, 'edits.json');
  if (!fs.existsSync(ep)) { console.error(`No edits file at ${ep}`); process.exit(1); }
  const raw = JSON.parse(fs.readFileSync(ep, 'utf8'));

  const structured = raw && typeof raw === 'object' && ('edits' in raw || 'ops' in raw || 'setFields' in raw);
  const textMap = structured ? (raw.edits || {}) : raw;
  const setFields = structured ? (raw.setFields || {}) : {};
  const ops = structured ? (raw.ops || []) : [];

  const applied = [];
  const refused = [];

  // 1) text edits — replace EXISTING string fields (paths reference original indices)
  for (const [p, val] of Object.entries(textMap)) {
    if (typeof val !== 'string') { refused.push(`text ${p} — value not a string`); continue; }
    const r = setByPath(data, p, val);
    if (r.ok) applied.push(`text ${p}`);
    else refused.push(`text ${p} — ${r.reason}`);
  }

  // 1b) setFields — CREATE or overwrite structured fields (any JSON value), creating
  //     intermediate objects/arrays. For adding metaItems, headlineMetric, etc.
  for (const [p, val] of Object.entries(setFields)) {
    const parts = p.split('.');
    const leaf = parts[parts.length - 1];
    if (HARD_DENY.has(leaf)) { refused.push(`setField ${p} — key "${leaf}" is image/layout/config — refused`); continue; }
    if (PROTECT.has(leaf)) { refused.push(`setField ${p} — key "${leaf}" is factual data — refused`); continue; }
    let cur = data;
    let bad = false;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
      if (cur == null || typeof cur !== 'object') { bad = true; break; }
      if (cur[part] == null) cur[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[part];
    }
    if (bad || cur == null || typeof cur !== 'object') { refused.push(`setField ${p} — parent path not found`); continue; }
    cur[leaf] = val;
    applied.push(`setField ${p}`);
  }

  // 2) structural ops (reference ORIGINAL indices via __oi tags) -----------
  if (ops.length) {
    if (!Array.isArray(data.slides)) { console.error('No slides array to restructure.'); process.exit(1); }
    const slides = data.slides;
    slides.forEach((s, i) => { s.__oi = i; });

    const validSlide = (s) => s && typeof s === 'object' && typeof s.type === 'string' && s.type.length > 0;

    // retype: replace the whole slide object, keep its original-index tag
    for (const op of ops.filter((o) => o.op === 'retype')) {
      const idx = slides.findIndex((s) => s.__oi === op.index);
      if (idx < 0) { refused.push(`retype @${op.index} — index not found`); continue; }
      if (!validSlide(op.slide)) { refused.push(`retype @${op.index} — replacement slide missing valid "type"`); continue; }
      slides[idx] = { ...op.slide, __oi: op.index };
      applied.push(`retype @${op.index} -> ${op.slide.type}${op.reason ? ` (${op.reason})` : ''}`);
    }

    // remove
    const removeSet = new Set();
    for (const op of ops.filter((o) => o.op === 'remove')) {
      if (!slides.some((s) => s.__oi === op.index)) { refused.push(`remove @${op.index} — index not found`); continue; }
      removeSet.add(op.index);
      applied.push(`remove @${op.index}${op.reason ? ` (${op.reason})` : ''}`);
    }
    let result = slides.filter((s) => !removeSet.has(s.__oi));

    // insert (after original index; -1 = start). Append unplaced at end.
    const inserts = ops.filter((o) => o.op === 'insert');
    const byAfter = new Map();
    for (const op of inserts) {
      if (!validSlide(op.slide)) { refused.push(`insert after ${op.after} — slide missing valid "type"`); continue; }
      const key = Number.isInteger(op.after) ? op.after : result.length ? result[result.length - 1].__oi : -1;
      if (!byAfter.has(key)) byAfter.set(key, []);
      byAfter.get(key).push(op);
    }
    const placed = new Set();
    const finalArr = [];
    (byAfter.get(-1) || []).forEach((op) => { finalArr.push(op.slide); placed.add(op); applied.push(`insert@start -> ${op.slide.type}${op.reason ? ` (${op.reason})` : ''}`); });
    for (const s of result) {
      finalArr.push(s);
      (byAfter.get(s.__oi) || []).forEach((op) => { finalArr.push(op.slide); placed.add(op); applied.push(`insert after ${op.after} -> ${op.slide.type}${op.reason ? ` (${op.reason})` : ''}`); });
    }
    // any insert whose target index was removed/never matched → append at end
    for (const op of inserts) {
      if (placed.has(op)) continue;
      if (refused.some((r) => r.startsWith(`insert after ${op.after} — slide missing`))) continue;
      finalArr.push(op.slide);
      applied.push(`insert (target ${op.after} missing → appended at end) -> ${op.slide.type}${op.reason ? ` (${op.reason})` : ''}`);
    }

    finalArr.forEach((s) => { if (s && typeof s === 'object') delete s.__oi; });
    data.slides = finalArr;
  }

  // Bump dataVersion on any change so the app (which loads IndexedDB/localStorage first in
  // dev) auto-discards its stale cached copy and reloads from this JSON. Without this, edits
  // to the JSON are invisible in the running app. See caseStudyData.js getCaseStudyData*.
  let bumped = null;
  if (applied.length > 0) {
    bumped = (typeof data.dataVersion === 'number' ? data.dataVersion : 0) + 1;
    data.dataVersion = bumped;
  }

  writeJsonValidated(slug, data);
  console.log(`${slugFile(slug)} — applied ${applied.length}, refused ${refused.length}` + (bumped ? ` (dataVersion → ${bumped})` : ''));
  applied.forEach((a) => console.log(`  ✓ ${a}`));
  refused.forEach((r) => console.log(`  ✗ ${r}`));
  if (bumped) console.log(`  ↻ dataVersion bumped to ${bumped} — hard-refresh the app (Cmd+Shift+R) to load the changes`);
}

// ── templates reference (generated from slideTemplateDocs.js) ─────────────────
async function templates() {
  const { slideTemplateDocs } = await import('../src/data/slideTemplateDocs.js');
  const L = [];
  L.push('# Slide template reference');
  L.push('');
  L.push('Authoritative catalog of every slide template, its elements, and when to use it.');
  L.push('Generated from `src/data/slideTemplateDocs.js` — do not hand-edit; regenerate with');
  L.push('`node scripts/case-study-text.mjs templates`.');
  L.push('');
  L.push('Reviewers: use this to judge whether each slide uses the BEST template for its content');
  L.push('(e.g. a text+image slide carrying a strong pull-quote should probably be a `quotes` or');
  L.push('`testimonial` slide). The editor: when adding or retyping a slide, copy that template\'s');
  L.push('**skeleton** below and replace text with `[FILL IN: …]` explaining what the designer must supply.');
  L.push('');
  L.push('## The 10 canonical case-study beats (judge completeness against these)');
  L.push('1. Cover · 2. Problem Statement · 3. Research Overview · 4. Key Insights · 5. Design Exploration');
  L.push('6. Iteration Evidence · 7. Final Solution · 8. Outcome/Impact · 9. Process Timeline · 10. Reflection');
  L.push('');
  L.push('Notes:');
  L.push('- `textAndImage` is the versatile default; it renders internally as type `problem` and also');
  L.push('  covers `context`, `feature`, `testing` (same template, aliased `type`).');
  L.push('- `directions` is labelled **"Ideation"** in the picker.');
  L.push('- `intro` must be first; `end` must be last; `reflection` is required above mid-level.');
  L.push('');

  for (const [key, d] of Object.entries(slideTemplateDocs)) {
    const ex = d.exampleUsage || {};
    L.push('---');
    L.push(`## \`${key}\`${key === 'directions' ? ' (picker label: "Ideation")' : ''} — renders type \`${ex.type || key}\``);
    if (d.purpose) L.push(`**Purpose:** ${d.purpose}`);
    if (d.whenToUse) L.push(`**When to use:** ${d.whenToUse}`);
    if (WORD_BUDGET[key]) L.push(`**Word budget (on-screen prose):** ~${WORD_BUDGET[key]} words — keep it scannable in seconds.`);
    if (d.requiredFields) L.push(`**Required fields:** ${d.requiredFields.join(', ')}`);
    if (d.optionalFields) L.push(`**Optional fields:** ${d.optionalFields.join(', ')}`);
    if (d.mediaFields && d.mediaFields.length) L.push(`**Media fields:** ${d.mediaFields.map((m) => m.field).join(', ')}`);
    if (d.aiSelectionHints && d.aiSelectionHints.signals) L.push(`**Choose this when the content reads like:** ${d.aiSelectionHints.signals.join(' · ')}`);
    if (d.contentLimits) {
      const lim = Object.entries(d.contentLimits)
        .map(([f, c]) => `${f}: ${[c.recommended && `rec ${c.recommended}`, c.max && `max ${c.max}`, c.note].filter(Boolean).join('; ')}`)
        .filter((s) => s.split(': ')[1]);
      if (lim.length) { L.push('**Content limits:**'); lim.forEach((s) => L.push(`- ${s}`)); }
    }
    L.push('**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**');
    L.push('```json');
    L.push(JSON.stringify(ex, null, 2));
    L.push('```');
    L.push('');
  }
  fs.mkdirSync(path.dirname(TEMPLATES_DOC), { recursive: true });
  fs.writeFileSync(TEMPLATES_DOC, L.join('\n') + '\n');
  console.log(`Wrote ${TEMPLATES_DOC} (${Object.keys(slideTemplateDocs).length} templates)`);
}

// ── budget table (GROUND TRUTH — computed from the live JSON) ─────────────────
async function buildBudgetTable(data) {
  const { slideTemplateDocs } = await import('../src/data/slideTemplateDocs.js');
  const typeToKey = {};
  for (const [key, d] of Object.entries(slideTemplateDocs)) {
    const t = d.exampleUsage && d.exampleUsage.type;
    if (t && !(t in typeToKey)) typeToKey[t] = key;
  }
  const slides = Array.isArray(data.slides) ? data.slides : [];
  const rows = ['| # | type | words | budget | status |', '|---|------|-------|--------|--------|'];
  let over = 0;
  slides.forEach((s, i) => {
    const tpl = typeToKey[s.type] || TYPE_ALIASES[s.type] || s.type;
    const budget = WORD_BUDGET[tpl];
    const words = slideWordCount(s);
    let status = '—';
    if (budget) {
      if (words > budget * 1.25) { status = '⚠ OVER'; over++; }
      else if (words > budget) status = 'near';
      else status = 'ok';
    }
    rows.push(`| ${i} | ${s.type || '?'} | ${words} | ${budget || '—'} | ${status} |`);
  });
  return { table: rows.join('\n'), over, count: slides.length };
}

// grab the first heading/label line that STARTS with `needle` (after stripping leading
// #, >, -, * and spaces). Start-anchored so "Seniority Signal:" matches the heading, not a
// bullet that merely mentions the phrase, and a colon avoids matching the file's H1 title.
function mdLine(file, needle) {
  if (!fs.existsSync(file)) return '';
  for (const ln of fs.readFileSync(file, 'utf8').split('\n')) {
    const stripped = ln.replace(/^[#>*\-\s]+/, '').trim();
    if (stripped.toLowerCase().startsWith(needle.toLowerCase())) return stripped;
  }
  return '';
}

// pull one markdown section (heading containing `needle`) up to the next same-or-higher heading
function mdSection(file, needle) {
  if (!fs.existsSync(file)) return '';
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let start = -1, level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)/);
    if (m && m[2].toLowerCase().includes(needle.toLowerCase())) { start = i; level = m[1].length; break; }
  }
  if (start < 0) return '';
  const out = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= level) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

// ── report (consolidated, human-readable FIX-REPORT.md) ──────────────────────
async function report(slug) {
  const data = readJson(slug);
  const dir = path.join('cases', 'reviews', slug);
  const { table, over, count } = await buildBudgetTable(data);
  const f = (n) => path.join(dir, n);
  const L = [];
  L.push(`# ${data.title || slug} — fix report`);
  L.push('');
  L.push(`The single place to read after a \`fix\`. Source of truth is the JSON, so the budget`);
  L.push(`table below always matches what actually shipped.`);
  L.push('');
  L.push(`**${count} slides · ${over} over budget · dataVersion ${data.dataVersion ?? '—'}**`);
  L.push('');

  // ── "Is it good?" — the critic's quality read of the CURRENT deck ──────────
  const quality = mdSection(f('verify-report.md'), 'Quality read (current');
  L.push('## Is it good? — quality read of the current deck');
  L.push(quality ? quality.replace(/^#+\s*Quality read.*$/m, '').trim() : '_(run a fix so the critic can assess the current deck)_');
  L.push('');

  // ── all agents at a glance ────────────────────────────────────────────────
  L.push('## All agents at a glance');
  L.push('Each agent\'s headline. The reviewer scores are from the **last full `review`** —');
  L.push('after big edits, run `review ' + slug + '` again for fresh scores.');
  L.push('');
  const uxScore = mdLine(f('ux-verdict.md'), 'Overall Craft Score');
  const uxSen = mdLine(f('ux-verdict.md'), 'Seniority Signal');
  const recV = mdLine(f('recruiter-verdict.md'), 'Recruiter Verdict:');
  const dirV = mdLine(f('director-verdict.md'), 'Director Verdict:');
  const critV = mdLine(f('verify-report.md'), 'Verdict:');
  L.push(`- **UX reviewer** (craft): ${uxScore || '—'}${uxSen ? ' · ' + uxSen : ''}`);
  L.push(`- **Recruiter** (hireability): ${recV || '—'}`);
  L.push(`- **Director** (positioning): ${dirV || '—'}`);
  L.push(`- **Editor + Copy-writer**: applied the synthesis + voice/jargon (see summaries below).`);
  L.push(`- **Critic** (correctness, current deck): ${critV || '—'}`);
  L.push('');

  L.push('## Word budget per slide (ground truth)');
  L.push('These are the authoritative budgets the agents enforce. `⚠ OVER` = past 1.25× budget');
  L.push('(the pipeline auto-trims these — a clean fix shows 0 over).');
  L.push('');
  L.push(table);
  L.push('');
  const verdict = mdSection(f('verify-report.md'), 'Verdict');
  const verify = mdSection(f('verify-report.md'), 'Verify before sending');
  const blocking = mdSection(f('verify-report.md'), 'Blocking');
  const conflicts = mdSection(f('synthesis.md'), 'they conflict');
  L.push('## Critic verdict');
  L.push(verdict || '_(no verify-report.md yet — run a fix)_');
  L.push('');
  if (blocking) { L.push(blocking); L.push(''); }
  L.push('## Verify before sending — YOUR call');
  L.push('The only things the system cannot know (your real data). For each item, answer:');
  L.push('**real** (keep it) · **not real** (genericize it) · **replace: <value>**. Answer in');
  L.push('chat or write next to the item, then run **`resolve ' + slug + '`** — the system applies');
  L.push('your answers, stops re-asking the confirmed ones, and regenerates this report.');
  L.push('');
  L.push(verify || '_(none recorded)_');
  L.push('');
  L.push('## Deliberation — where the reviewers disagreed');
  L.push('How the three reviewers split, and what the editor was told to weigh. (Full per-agent');
  L.push('verdicts: `ux-verdict.md`, `recruiter-verdict.md`, `director-verdict.md`.)');
  L.push('');
  L.push(conflicts || '_(no recorded conflicts)_');
  L.push('');
  L.push('## What the passes changed');
  L.push(`- Editor (structure + content): \`${path.join(dir, 'edit-summary.md')}\``);
  L.push(`- Copy-writer (voice + jargon): \`${path.join(dir, 'copy-summary.md')}\``);
  L.push(`- Critic (verification): \`${path.join(dir, 'verify-report.md')}\``);
  L.push('');
  const outFile = f('FIX-REPORT.md');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outFile, L.join('\n') + '\n');
  console.log(`Wrote ${outFile} — ${count} slides, ${over} over budget`);
}

// ── dispatch ─────────────────────────────────────────────────────────────────
const [, , mode, slug, arg3] = process.argv;
if (mode === 'templates') {
  await templates();
} else if (!mode || !slug) {
  console.error('Usage: node scripts/case-study-text.mjs <extract|apply|templates|report|budget> <slug> [editsPath]');
  process.exit(1);
} else if (mode === 'extract') {
  const md = await extract(slug);
  const dir = path.join('cases', 'reviews', slug);
  fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(dir, 'extracted.md');
  fs.writeFileSync(outFile, md + '\n');
  console.log(`Wrote ${outFile}`);
} else if (mode === 'apply') {
  apply(slug, arg3);
} else if (mode === 'report') {
  await report(slug);
} else if (mode === 'budget') {
  const { table, over, count } = await buildBudgetTable(readJson(slug));
  console.log(`${slug} — ${count} slides, ${over} over budget\n${table}`);
} else {
  console.error(`Unknown mode "${mode}". Use extract, apply, templates, report, or budget.`);
  process.exit(1);
}
