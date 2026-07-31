# Case-Study Media Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each case study a persistent, curated media bin (`project.mediaLibrary`) auto-collected from all slide + article media, surfaced as a filterable gallery you pick from (or add to) when inserting images/videos/embeds in slides or article edit mode.

**Architecture:** A pure helper module (`mediaLibrary.js`) collects/merges/classifies media and lives on the `project` object beside `slides`/`article`, so it rides the existing IndexedDB auto-save + Save-to-Code + committed-JSON pipeline. A presentational `MediaLibraryModal` (cloned from the existing add-block picker) renders the bin. `CaseStudy.jsx` owns the bin state, runs an additive merge on edit-enter / view-switch / modal-open, and exposes an `openMediaLibrary(onPick)` used by three mount points: slides (`updateImage`/`updatePsTab`), article (`setEntry` via a small context), and an always-available toolbar button (curate mode).

**Tech Stack:** React 19 + Vite 5, vanilla CSS per component, Dexie/IndexedDB persistence. No component test runner in the repo — pure logic is unit-tested with Node's built-in `node:test` (no new deps); UI/integration is verified with `playwright-core` headless Chrome from the session scratchpad (the repo's established verification pattern), plus `npm run build` and `npm run lint`.

## Global Constraints

- **Node for all commands:** `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH"` (node not on default PATH).
- **Edit-mode only.** Every new affordance renders only when `editMode` is true. Do not change view-mode / fixed-canvas behavior.
- **Canonical media-entry shape is load-bearing:** `{ src, caption, isVideo, embedUrl, size? }`. Do not rename `src`/`embedUrl` or nest media differently — `extractAndSaveMedia` (Save-to-Code) and the text-review scripts detect media by these keys + by value.
- **`src` ↔ `embedUrl` are mutually exclusive** on any media target. Slides: always write through `updateImage` (it clears the other). Article: `setEntry` patches, clear the other explicitly.
- **Two-tier persistence, unchanged:** new uploads become `data:` URIs in IndexedDB now; they become real files only on the dev-only "Save to Code". Prefer referencing existing `/case-studies/…` paths; new uploads carry the same dev-only-persist caveat as today.
- **Per-study only.** No cross-study library.
- **Item shape (this feature):** `{ id, src?, embedUrl?, isVideo?, isGif?, caption?, addedAt }`, identity = `src ?? embedUrl` (exact trimmed string).
- **Spec:** `docs/superpowers/specs/2026-07-31-case-study-media-library-design.md`.

---

### Task 1: Pure media-library helpers (`src/data/mediaLibrary.js`)

**Files:**
- Create: `src/data/mediaLibrary.js`
- Test: `src/data/mediaLibrary.test.mjs`

**Interfaces:**
- Consumes: `isVideoSrc` from `src/data/articleBlocks.js` (`isVideoSrc(src) → boolean`).
- Produces:
  - `libraryItemRef(item) → string` — `(item.src || item.embedUrl || '').trim()`.
  - `newLibraryItemId(ref) → string` — deterministic `'ml-' + base36 hash` (stable for a given ref).
  - `classifyMediaItem(item) → 'video' | 'figma' | 'youtube' | 'embed' | 'image'`.
  - `collectStudyMedia(project) → Item[]` — value-based deep-walk of `project.slides` + `project.article.blocks`, deduped by ref, each `{ src?, embedUrl?, isVideo, caption }`.
  - `mergeIntoLibrary(project, nowMs) → Item[]` — additive merge; returns the **same array reference** (`project.mediaLibrary`) when nothing new, else a new array. Skips refs already present and refs in `project.mediaLibraryRemoved`.
  - `usageCount(project, ref) → number` — how many string occurrences of `ref` across slides+article.

- [ ] **Step 1: Write the failing test**

Create `src/data/mediaLibrary.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  libraryItemRef, newLibraryItemId, classifyMediaItem,
  collectStudyMedia, mergeIntoLibrary, usageCount,
} from './mediaLibrary.js';

const project = {
  slides: [
    { type: 'intro', logo: '/case-studies/x/logo.webp', image: [{ src: '/case-studies/x/a.webp', caption: 'A' }] },
    { type: 'media', image: 'data:video/mp4;base64,AAAA' },
    { type: 'textAndImage', image: '', imageEmbedUrl: 'https://www.figma.com/embed?node=1' },
    { type: 'comparison', beforeImage: '/case-studies/x/b.webp', afterImage: '/case-studies/x/a.webp' }, // a.webp dup
  ],
  article: { blocks: [
    { id: 'b1', type: 'figure', media: [{ src: '/case-studies/x/c.webp' }, { embedUrl: 'https://youtu.be/abc' }] },
    { id: 'b2', type: 'paragraph', text: 'no media' },
  ] },
  mediaLibrary: [],
  mediaLibraryRemoved: [],
};

test('libraryItemRef prefers src then embedUrl', () => {
  assert.equal(libraryItemRef({ src: ' /x/a.webp ' }), '/x/a.webp');
  assert.equal(libraryItemRef({ embedUrl: 'https://f.com' }), 'https://f.com');
  assert.equal(libraryItemRef({}), '');
});

test('newLibraryItemId is deterministic per ref', () => {
  assert.equal(newLibraryItemId('/x/a.webp'), newLibraryItemId('/x/a.webp'));
  assert.notEqual(newLibraryItemId('/x/a.webp'), newLibraryItemId('/x/b.webp'));
  assert.match(newLibraryItemId('/x/a.webp'), /^ml-/);
});

test('classifyMediaItem covers image/video/figma/youtube/embed', () => {
  assert.equal(classifyMediaItem({ src: '/x/a.webp' }), 'image');
  assert.equal(classifyMediaItem({ src: '/x/a.mp4' }), 'video');
  assert.equal(classifyMediaItem({ src: 'data:video/mp4;base64,AA', isVideo: true }), 'video');
  assert.equal(classifyMediaItem({ embedUrl: 'https://www.figma.com/embed?x' }), 'figma');
  assert.equal(classifyMediaItem({ embedUrl: 'https://youtu.be/abc' }), 'youtube');
  assert.equal(classifyMediaItem({ embedUrl: 'https://example.com/x' }), 'embed');
});

test('collectStudyMedia walks slides + article, dedupes by ref', () => {
  const items = collectStudyMedia(project);
  const refs = items.map(libraryItemRef);
  assert.ok(refs.includes('/case-studies/x/logo.webp'));
  assert.ok(refs.includes('/case-studies/x/a.webp'));
  assert.ok(refs.includes('data:video/mp4;base64,AAAA'));
  assert.ok(refs.includes('https://www.figma.com/embed?node=1'));
  assert.ok(refs.includes('/case-studies/x/c.webp'));
  assert.ok(refs.includes('https://youtu.be/abc'));
  // a.webp appears twice in data but must be deduped
  assert.equal(refs.filter((r) => r === '/case-studies/x/a.webp').length, 1);
  // the video item must be flagged isVideo (data:video can't be sniffed by extension)
  assert.equal(items.find((i) => i.src === 'data:video/mp4;base64,AAAA').isVideo, true);
});

test('mergeIntoLibrary is additive, deduped, tombstone-aware', () => {
  const merged = mergeIntoLibrary(project, 1000);
  assert.ok(merged.length >= 6);
  assert.ok(merged.every((i) => i.id && i.addedAt === 1000));
  // idempotent: merging the result back adds nothing (same ref returned)
  const again = mergeIntoLibrary({ ...project, mediaLibrary: merged }, 2000);
  assert.equal(again, merged);
  // tombstoned ref is not re-added
  const tomb = mergeIntoLibrary({ ...project, mediaLibrary: [], mediaLibraryRemoved: ['/case-studies/x/c.webp'] }, 3000);
  assert.equal(tomb.some((i) => libraryItemRef(i) === '/case-studies/x/c.webp'), false);
});

test('usageCount counts references across slides + article', () => {
  assert.equal(usageCount(project, '/case-studies/x/a.webp'), 2); // intro image + comparison afterImage
  assert.equal(usageCount(project, '/case-studies/x/c.webp'), 1);
  assert.equal(usageCount(project, '/case-studies/x/missing.webp'), 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH" && cd "/Users/lywrbwm/Developer/Portfolio v3" && node --test src/data/mediaLibrary.test.mjs`
Expected: FAIL — `Cannot find module './mediaLibrary.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/data/mediaLibrary.js`:

```js
// ─────────────────────────────────────────────────────────────────────────
// mediaLibrary.js — pure helpers for the per-case-study media bin.
//
// The bin (project.mediaLibrary) is a curated, persistent collection of every
// image/video/embed used across a study's slides + article. It is auto-collected
// by a VALUE-BASED walk (matching how extractAndSaveMedia detects media), so it
// is immune to the slides' polymorphic shapes and namespaced keys. No React/DOM
// imports here — this module is unit-tested with `node --test`.
// ─────────────────────────────────────────────────────────────────────────
import { isVideoSrc } from './articleBlocks.js';

// A string is a stored/inline media SOURCE if it's a data image/video URI, a
// blob URL, or a repo asset path under one of our public media trees.
const MEDIA_SRC_RE = /^(data:(image|video)\/|blob:|\/(case-studies|home|playground|about)\/)/i;
const isMediaSrc = (v) => typeof v === 'string' && MEDIA_SRC_RE.test(v.trim());
const isEmbedKey = (k) => k === 'embedUrl' || /EmbedUrl$/.test(k);
const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v.trim());

export const libraryItemRef = (item) =>
  item && (item.src || item.embedUrl) ? String(item.src || item.embedUrl).trim() : '';

const hashRef = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
export const newLibraryItemId = (ref) => `ml-${hashRef(ref || '')}`;

export const classifyMediaItem = (item) => {
  if (item && item.embedUrl) {
    let host = '';
    try { host = new URL(item.embedUrl).host.replace(/^www\./, ''); } catch { host = ''; }
    if (host.includes('figma')) return 'figma';
    if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) return 'youtube';
    return 'embed';
  }
  if (item && (item.isVideo || isVideoSrc(item.src))) return 'video';
  return 'image';
};

// Deep-walk any node collecting media items; caption is best-effort from the
// enclosing object. Deduped by ref within one call.
export const collectStudyMedia = (project) => {
  const out = [];
  const seen = new Set();
  const push = (item) => {
    const ref = libraryItemRef(item);
    if (!ref || seen.has(ref)) return;
    seen.add(ref);
    out.push(item);
  };
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    const caption = typeof node.caption === 'string' ? node.caption.trim() : '';
    for (const [k, v] of Object.entries(node)) {
      if (isMediaSrc(v)) {
        const src = v.trim();
        push({ src, isVideo: /^data:video\//i.test(src) || isVideoSrc(src), caption });
      } else if (isEmbedKey(k) && isHttpUrl(v)) {
        push({ embedUrl: v.trim() });
      } else if (v && typeof v === 'object') {
        walk(v);
      }
    }
  };
  walk(project && project.slides);
  if (project && project.article && Array.isArray(project.article.blocks)) walk(project.article.blocks);
  return out;
};

export const mergeIntoLibrary = (project, nowMs) => {
  const existing = Array.isArray(project.mediaLibrary) ? project.mediaLibrary : [];
  const removed = Array.isArray(project.mediaLibraryRemoved) ? project.mediaLibraryRemoved : [];
  const have = new Set(existing.map(libraryItemRef));
  const tomb = new Set(removed);
  const additions = collectStudyMedia(project)
    .filter((item) => {
      const ref = libraryItemRef(item);
      return ref && !have.has(ref) && !tomb.has(ref);
    })
    .map((item) => ({ id: newLibraryItemId(libraryItemRef(item)), addedAt: nowMs, ...item }));
  return additions.length ? [...existing, ...additions] : existing;
};

export const usageCount = (project, ref) => {
  if (!ref) return 0;
  let n = 0;
  const target = String(ref).trim();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    for (const v of Object.values(node)) {
      if (typeof v === 'string') { if (v.trim() === target) n++; }
      else if (v && typeof v === 'object') walk(v);
    }
  };
  walk(project && project.slides);
  if (project && project.article && Array.isArray(project.article.blocks)) walk(project.article.blocks);
  return n;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH" && cd "/Users/lywrbwm/Developer/Portfolio v3" && node --test src/data/mediaLibrary.test.mjs`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/mediaLibrary.js src/data/mediaLibrary.test.mjs
git commit -m "feat(case-study): pure media-library helpers (collect/merge/classify)"
```

---

### Task 2: Shared file-upload util `pickMediaFile` (lift from CaseStudyArticle)

**Files:**
- Modify: `src/pages/caseStudyMedia.jsx` (add `pickMediaFile`)
- Modify: `src/pages/CaseStudyArticle.jsx:149-174` (delete local `pickArticleMedia`, import `pickMediaFile`, update 2 call sites at 467 & 473)

**Interfaces:**
- Produces: `pickMediaFile(cb)` — opens a file dialog (`image/*,video/mp4,video/webm,.gif`), enforces caps (video 100MB / gif 40MB / image 10MB), mobile-compresses non-video/non-gif images, then calls `cb({ src: dataUrl, isVideo, isGif })`.

- [ ] **Step 1: Add `pickMediaFile` to `caseStudyMedia.jsx`**

Add near the top of `src/pages/caseStudyMedia.jsx` (after imports; it needs `compressImage`, `isMobileViewport` — add them to the existing `../data/caseStudyData` import if not already present):

```jsx
// Imperative file picker shared by the article editor, the slide editor, and
// the media library "add new". Returns media as a data: URI (persisted to a
// real file later by Save-to-Code). cb receives { src, isVideo, isGif }.
export const pickMediaFile = (cb) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/mp4,video/webm,.gif';
  input.onchange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const isVideo = /^video\//.test(file.type);
    const isGif = file.type === 'image/gif';
    const maxBytes = isVideo ? 100 * 1024 * 1024 : isGif ? 40 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      let dataUrl = reader.result;
      if (!isVideo && !isGif && isMobileViewport()) {
        try { dataUrl = await compressImage(dataUrl); } catch { /* keep original */ }
      }
      cb({ src: dataUrl, isVideo, isGif });
    };
    reader.readAsDataURL(file);
  };
  input.click();
};
```

- [ ] **Step 2: Replace the local uploader in `CaseStudyArticle.jsx`**

Delete the module-level `pickArticleMedia` (lines 149-174). Add `pickMediaFile` to the existing `caseStudyMedia` import. Update the two call sites:
- Line ~467: `onClick={() => pickArticleMedia((m) => setEntry(i, m))}` → `onClick={() => pickMediaFile((m) => setEntry(i, m))}`
- Line ~473: `onClick={() => pickArticleMedia((m) => setEntry(i, { ...m, embedUrl: '' }))}` → `onClick={() => pickMediaFile((m) => setEntry(i, { ...m, embedUrl: '' }))}`

(`isMobileViewport`/`compressImage` imports in CaseStudyArticle.jsx that were only used by the deleted function can be removed if now unused — verify with lint.)

- [ ] **Step 3: Verify build + lint**

Run: `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH" && cd "/Users/lywrbwm/Developer/Portfolio v3" && npm run build 2>&1 | tail -5 && npx eslint src/pages/caseStudyMedia.jsx src/pages/CaseStudyArticle.jsx`
Expected: build succeeds; eslint reports no NEW errors for these files (compare against `git stash` baseline if unsure — CaseStudyArticle.jsx has pre-existing lint noise).

- [ ] **Step 4: Commit**

```bash
git add src/pages/caseStudyMedia.jsx src/pages/CaseStudyArticle.jsx
git commit -m "refactor(case-study): lift pickArticleMedia into shared pickMediaFile"
```

---

### Task 3: `MediaLibraryModal` component + CSS (presentational)

**Files:**
- Create: `src/components/MediaLibraryModal.jsx`
- Create: `src/components/MediaLibraryModal.css`

**Interfaces:**
- Consumes: `classifyMediaItem`, `libraryItemRef` (Task 1); `buildResponsiveWebp`, `LazyVideo`, `deriveVideoPoster` from `../pages/caseStudyMedia`.
- Produces: default export `MediaLibraryModal(props)` where
  `props = { open, items, mode, onPick, onRemove, onAddFile, onAddEmbed, onClose, usageCountOf }`.
  - `mode`: `'pick' | 'curate'` — in `'curate'`, clicking a tile does nothing (view/remove/add only).
  - `usageCountOf(ref) → number` — for the "still used" note when removing.

- [ ] **Step 1: Write the component**

Create `src/components/MediaLibraryModal.jsx`:

```jsx
import { useMemo, useState, useEffect } from 'react';
import { classifyMediaItem, libraryItemRef } from '../data/mediaLibrary';
import { buildResponsiveWebp, LazyVideo, deriveVideoPoster } from '../pages/caseStudyMedia';
import './MediaLibraryModal.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
  { key: 'figma', label: 'Figma' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'embed', label: 'Other embeds' },
];

const filenameOf = (ref) => {
  if (!ref || ref.startsWith('data:')) return '';
  try { return decodeURIComponent(ref.split('?')[0].split('/').pop() || ''); } catch { return ''; }
};

const Thumb = ({ item }) => {
  const kind = classifyMediaItem(item);
  if (kind === 'video') {
    const poster = deriveVideoPoster(item.src);
    return poster
      ? <img className="cs-media-thumb-img" src={poster} alt="" loading="lazy" />
      : <div className="cs-media-thumb-fallback">▶ video</div>;
  }
  if (kind === 'figma' || kind === 'youtube' || kind === 'embed') {
    return <div className={`cs-media-thumb-embed cs-media-thumb-embed--${kind}`}>{kind === 'figma' ? 'Figma' : kind === 'youtube' ? 'YouTube' : 'Embed'}</div>;
  }
  const responsive = buildResponsiveWebp(item.src);
  return (
    <img
      className="cs-media-thumb-img"
      src={item.src}
      srcSet={responsive?.srcSet}
      sizes={responsive?.sizes}
      alt={item.caption || ''}
      loading="lazy"
    />
  );
};

const MediaLibraryModal = ({ open, items, mode = 'pick', onPick, onRemove, onAddFile, onAddEmbed, onClose, usageCountOf }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedDraft, setEmbedDraft] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const counts = useMemo(() => {
    const c = { all: items.length, image: 0, video: 0, figma: 0, youtube: 0, embed: 0 };
    items.forEach((it) => { c[classifyMediaItem(it)] += 1; });
    return c;
  }, [items]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== 'all' && classifyMediaItem(it) !== filter) return false;
      if (!q) return true;
      const ref = libraryItemRef(it);
      return (
        (it.caption || '').toLowerCase().includes(q) ||
        filenameOf(ref).toLowerCase().includes(q) ||
        (it.embedUrl || '').toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  if (!open) return null;

  return (
    <div className="template-modal-overlay cs-media-overlay" onClick={onClose}>
      <div className="template-modal cs-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cs-media-head">
          <span className="cs-media-title">Media Library</span>
          <button type="button" className="cs-media-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cs-media-filterbar">
          <div className="cs-media-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`cs-media-chip${filter === f.key ? ' is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="cs-media-chip-count">{counts[f.key] || 0}</span>
              </button>
            ))}
          </div>
          <input
            className="cs-media-search"
            type="text"
            placeholder="Search caption / filename…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="cs-media-grid">
          <div className="cs-media-add">
            <button type="button" className="cs-media-add-btn" onClick={onAddFile}>＋ Upload</button>
            {!embedOpen ? (
              <button type="button" className="cs-media-add-link" onClick={() => setEmbedOpen(true)}>or embed URL…</button>
            ) : (
              <div className="cs-media-embed-row">
                <input
                  className="cs-media-embed-input"
                  type="text"
                  autoFocus
                  placeholder="Figma / YouTube / site URL"
                  value={embedDraft}
                  onChange={(e) => setEmbedDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onAddEmbed(embedDraft.trim()); setEmbedDraft(''); setEmbedOpen(false); } }}
                />
                <button type="button" className="cs-media-embed-apply" onClick={() => { onAddEmbed(embedDraft.trim()); setEmbedDraft(''); setEmbedOpen(false); }}>Add</button>
              </div>
            )}
          </div>

          {shown.map((item) => {
            const ref = libraryItemRef(item);
            return (
              <div className={`cs-media-tile${mode === 'pick' ? ' is-pickable' : ''}`} key={item.id || ref}>
                <button
                  type="button"
                  className="cs-media-tile-body"
                  disabled={mode !== 'pick'}
                  onClick={() => mode === 'pick' && onPick(item)}
                  title={mode === 'pick' ? 'Insert this media' : ''}
                >
                  <Thumb item={item} />
                  <span className={`cs-media-badge cs-media-badge--${classifyMediaItem(item)}`}>{classifyMediaItem(item)}</span>
                  {(item.caption || filenameOf(ref)) && (
                    <span className="cs-media-caption">{item.caption || filenameOf(ref)}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="cs-media-remove"
                  title="Remove from library"
                  onClick={() => {
                    const used = usageCountOf ? usageCountOf(ref) : 0;
                    if (used > 0 && !window.confirm(`Still used on ${used} place(s). This only removes it from the library, not from the deck/article. Remove?`)) return;
                    onRemove(item);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}

          {!shown.length && <div className="cs-media-empty">No media in this filter.</div>}
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;
```

- [ ] **Step 2: Write the CSS**

Create `src/components/MediaLibraryModal.css`:

```css
/* Media Library modal — piggybacks the deck's .template-modal-overlay backdrop. */
.cs-media-overlay { z-index: 400; }

.cs-media-modal {
  width: min(920px, 94vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

.cs-media-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.2rem; border-bottom: 1px solid var(--color-border);
}
.cs-media-title { font-family: var(--font-body); font-weight: 650; font-size: 1rem; }
.cs-media-close {
  border: none; background: transparent; color: var(--color-text-muted);
  font-size: 1rem; cursor: pointer; width: 28px; height: 28px; border-radius: 50%;
}
.cs-media-close:hover { background: var(--color-bg-secondary); color: var(--color-text); }

.cs-media-filterbar {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  padding: 0.75rem 1.2rem; border-bottom: 1px solid var(--color-border);
}
.cs-media-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.cs-media-chip {
  border: 1px solid var(--color-border); background: var(--color-bg);
  color: var(--color-text-muted); border-radius: 999px; padding: 0.3rem 0.7rem;
  font-family: var(--font-body); font-size: 0.78rem; font-weight: 550; cursor: pointer;
  transition: border-color 0.12s ease, color 0.12s ease, background 0.12s ease;
}
.cs-media-chip:hover { color: var(--color-text); }
.cs-media-chip.is-active { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-contrast); }
.cs-media-chip-count { opacity: 0.7; font-variant-numeric: tabular-nums; }
.cs-media-search {
  flex: 1; min-width: 160px; border: 1px solid var(--color-border); border-radius: 8px;
  background: var(--color-bg); color: var(--color-text); font-family: var(--font-body);
  font-size: 0.85rem; padding: 0.45rem 0.7rem;
}
.cs-media-search:focus { outline: none; border-color: var(--color-accent); }

.cs-media-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.8rem; padding: 1.2rem; overflow-y: auto;
}
.cs-media-empty { grid-column: 1 / -1; color: var(--color-text-muted); text-align: center; padding: 2rem; }

.cs-media-add {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
  min-height: 120px; border: 2px dashed var(--color-border); border-radius: 12px;
  background: var(--color-bg-secondary); padding: 0.8rem;
}
.cs-media-add-btn {
  border: none; border-radius: 999px; background: var(--color-accent);
  color: var(--color-accent-contrast); font-weight: 600; font-size: 0.85rem;
  padding: 0.45rem 1rem; cursor: pointer;
}
.cs-media-add-link { border: none; background: transparent; color: var(--color-text-muted); font-size: 0.78rem; cursor: pointer; text-decoration: underline; }
.cs-media-embed-row { display: flex; gap: 0.35rem; width: 100%; }
.cs-media-embed-input { flex: 1; min-width: 0; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.78rem; padding: 0.35rem 0.5rem; }
.cs-media-embed-apply { border: none; border-radius: 8px; background: var(--color-accent); color: var(--color-accent-contrast); font-weight: 600; font-size: 0.78rem; padding: 0 0.7rem; cursor: pointer; }

.cs-media-tile { position: relative; border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; background: var(--color-bg-secondary); }
.cs-media-tile-body {
  display: block; width: 100%; border: none; background: transparent; padding: 0; cursor: default; position: relative;
}
.cs-media-tile.is-pickable .cs-media-tile-body { cursor: pointer; }
.cs-media-tile.is-pickable:hover { border-color: var(--color-accent); }
.cs-media-thumb-img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
.cs-media-thumb-fallback, .cs-media-thumb-embed {
  display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: 16 / 10;
  color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600;
}
.cs-media-thumb-embed--figma { background: color-mix(in srgb, #a259ff 12%, var(--color-bg-secondary)); color: #a259ff; }
.cs-media-thumb-embed--youtube { background: color-mix(in srgb, #ff0000 10%, var(--color-bg-secondary)); color: #d40000; }
.cs-media-badge {
  position: absolute; top: 6px; left: 6px; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.03em;
  text-transform: uppercase; padding: 0.12rem 0.4rem; border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 80%, transparent); color: var(--color-text-muted);
  backdrop-filter: blur(4px);
}
.cs-media-caption {
  display: block; padding: 0.4rem 0.55rem; font-size: 0.72rem; color: var(--color-text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left;
}
.cs-media-remove {
  position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border: none; border-radius: 50%;
  background: color-mix(in srgb, var(--color-bg) 80%, transparent); color: var(--color-text);
  font-size: 0.7rem; cursor: pointer; opacity: 0; transition: opacity 0.12s ease; backdrop-filter: blur(4px);
}
.cs-media-tile:hover .cs-media-remove { opacity: 1; }
.cs-media-remove:hover { background: var(--color-accent); color: var(--color-accent-contrast); }
```

- [ ] **Step 3: Verify build + lint**

Run: `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH" && cd "/Users/lywrbwm/Developer/Portfolio v3" && npm run build 2>&1 | tail -5 && npx eslint src/components/MediaLibraryModal.jsx`
Expected: build succeeds; eslint clean for the new file. (The component is not mounted yet — build just confirms it compiles.)

- [ ] **Step 4: Commit**

```bash
git add src/components/MediaLibraryModal.jsx src/components/MediaLibraryModal.css
git commit -m "feat(case-study): MediaLibraryModal gallery (filters + search + thumbnails)"
```

---

### Task 4: Bin state + auto-collect + toolbar button with count (in `CaseStudy.jsx`)

**Files:**
- Modify: `src/pages/CaseStudy.jsx` (imports; new state; merge effect; toolbar button near the Slides/Article toggle at ~8218)

**Interfaces:**
- Consumes: `mergeIntoLibrary` (Task 1).
- Produces (used by Task 5–7): `project.mediaLibrary` populated; state `mediaLibraryTarget` + setter (added in Task 5, referenced here only via the button placeholder). This task's deliverable is a **visible count** proving auto-collect works.

- [ ] **Step 1: Import the helpers**

Add to the imports at the top of `src/pages/CaseStudy.jsx`:

```js
import { mergeIntoLibrary } from '../data/mediaLibrary';
```

- [ ] **Step 2: Add the auto-collect merge effect**

Add this effect near the other project effects (e.g., just after the view-mode effect around line 1427). It fires on edit-enter and on every view switch; `mergeIntoLibrary` returns the same array reference when nothing is new, so `setProject` is a no-op and there is no render loop:

```jsx
  // Media library: additively collect every image/video/embed used across the
  // slides + article into project.mediaLibrary. Runs on edit-enter and on each
  // slides<->article switch. Idempotent (mergeIntoLibrary returns the same ref
  // when there's nothing new, so this never loops).
  useEffect(() => {
    if (!editMode) return;
    setProject((prev) => {
      const next = mergeIntoLibrary(prev, Date.now());
      return next === prev.mediaLibrary ? prev : { ...prev, mediaLibrary: next };
    });
  }, [editMode, isArticleMode]);
```

- [ ] **Step 3: Add a toolbar "Media Library (N)" button**

In the edit-mode toolbar next to the Slides/Article toggle (`.cs-view-toggle`, ~line 8218), add a button showing the bin count. It calls `openMediaLibrary()` which is added in Task 5 — for THIS task, wire it to a temporary no-op so the count renders and is verifiable:

```jsx
  {editMode && (
    <button
      type="button"
      className="cs-media-lib-btn"
      onClick={() => openMediaLibrary && openMediaLibrary()}
    >
      Media Library ({(project.mediaLibrary || []).length})
    </button>
  )}
```

Add minimal CSS for `.cs-media-lib-btn` in `CaseStudy.css` near the `.cs-view-toggle` rules:

```css
.cs-media-lib-btn {
  border: 1px solid var(--color-border); background: var(--color-bg-secondary);
  color: var(--color-text); font-family: inherit; font-size: 0.72rem; font-weight: 600;
  padding: 0.28rem 0.7rem; border-radius: 999px; cursor: pointer; white-space: nowrap;
}
.cs-media-lib-btn:hover { border-color: var(--color-text-muted); }
```

(Guard `openMediaLibrary &&` so this compiles before Task 5 defines it; Task 5 replaces the guard with the real handler.)

- [ ] **Step 4: Verify auto-collect via playwright (headless Chrome)**

Create `/private/tmp/…/scratchpad/verify-mediacount.mjs` (use your session scratchpad path) and run it. It enters edit mode, switches views, and reads the button's count:

```js
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('http://localhost:5173/project/wizecare', { waitUntil: 'networkidle' }).catch(() => {});
await p.evaluate(() => sessionStorage.setItem('editMode', 'true'));
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
const readCount = () => p.$eval('.cs-media-lib-btn', (el) => el.textContent).catch(() => null);
console.log('article view:', await readCount());
// switch to slides
await p.goto('http://localhost:5173/project/wizecare?view=slides', { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(2000);
console.log('slides view:', await readCount());
await b.close();
```

Run: `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH" && cd "/Users/lywrbwm/Developer/Portfolio v3" && (npm run dev > /tmp/pf.log 2>&1 &) && sleep 6 && cd <scratchpad> && node verify-mediacount.mjs`
Expected: a non-zero count (e.g. `Media Library (12)`) that reflects the study's media in both views.

- [ ] **Step 5: Commit**

```bash
git add src/pages/CaseStudy.jsx src/pages/CaseStudy.css
git commit -m "feat(case-study): collect media into project.mediaLibrary + toolbar count"
```

---

### Task 5: Mount the modal (curate mode) + add-new + remove

**Files:**
- Modify: `src/pages/CaseStudy.jsx` (import modal + `pickMediaFile` + `libraryItemRef`/`usageCount`; `mediaLibraryTarget` state; `openMediaLibrary`; add/remove handlers; render `<MediaLibraryModal>`; replace the Task 4 button guard)

**Interfaces:**
- Consumes: `MediaLibraryModal` (Task 3); `pickMediaFile` (Task 2); `libraryItemRef`, `usageCount`, `newLibraryItemId` (Task 1).
- Produces: `openMediaLibrary(onPick?)` — opens the modal; with an `onPick` it's `mode:'pick'`, without it `mode:'curate'`. Used by Task 6 (slides) and Task 7 (article, via prop).

- [ ] **Step 1: Imports + state**

Add imports to `CaseStudy.jsx`:

```js
import MediaLibraryModal from '../components/MediaLibraryModal';
import { mergeIntoLibrary, libraryItemRef, usageCount, newLibraryItemId } from '../data/mediaLibrary';
import { pickMediaFile } from './caseStudyMedia';
```

(Merge with the Task 4 `mergeIntoLibrary` import — one line. `pickMediaFile` may already be exported from `caseStudyMedia`; confirm the import path resolves.)

Add state near the other modal state (e.g., beside `showTemplates`):

```jsx
  // Media library modal. `null` = closed. { onPick } = pick mode (insert into a
  // target slot). 'curate' = browse/remove/add only.
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState(null);
```

- [ ] **Step 2: `openMediaLibrary` + add/remove handlers**

Add these handlers (near `articleOps` / other callbacks). `openMediaLibrary` freshens the bin first (covers the async-load race):

```jsx
  const openMediaLibrary = useCallback((onPick) => {
    setProject((prev) => {
      const next = mergeIntoLibrary(prev, Date.now());
      return next === prev.mediaLibrary ? prev : { ...prev, mediaLibrary: next };
    });
    setMediaLibraryTarget(onPick ? { onPick } : 'curate');
  }, []);

  // Add an item to the bin (from upload or embed URL). Deduped by ref.
  const addToMediaLibrary = useCallback((item) => {
    const ref = libraryItemRef(item);
    if (!ref) return;
    setProject((prev) => {
      const lib = prev.mediaLibrary || [];
      if (lib.some((x) => libraryItemRef(x) === ref)) return prev;
      const removed = (prev.mediaLibraryRemoved || []).filter((r) => r !== ref); // un-tombstone if re-added
      return { ...prev, mediaLibrary: [...lib, { id: newLibraryItemId(ref), addedAt: Date.now(), ...item }], mediaLibraryRemoved: removed };
    });
  }, []);

  const removeFromMediaLibrary = useCallback((item) => {
    const ref = libraryItemRef(item);
    if (!ref) return;
    setProject((prev) => ({
      ...prev,
      mediaLibrary: (prev.mediaLibrary || []).filter((x) => libraryItemRef(x) !== ref),
      mediaLibraryRemoved: [...new Set([...(prev.mediaLibraryRemoved || []), ref])],
    }));
  }, []);

  const handleLibraryPick = useCallback((item) => {
    const target = mediaLibraryTarget;
    setMediaLibraryTarget(null);
    if (target && target.onPick) target.onPick(item);
  }, [mediaLibraryTarget]);

  const handleLibraryAddFile = useCallback(() => {
    pickMediaFile((m) => {
      addToMediaLibrary(m);
      // In pick mode, also fill the target slot with the freshly uploaded media.
      const target = mediaLibraryTarget;
      if (target && target.onPick) { setMediaLibraryTarget(null); target.onPick(m); }
    });
  }, [mediaLibraryTarget, addToMediaLibrary]);

  const handleLibraryAddEmbed = useCallback((url) => {
    if (!/^https?:\/\//i.test(url || '')) return;
    const item = { embedUrl: url };
    addToMediaLibrary(item);
    const target = mediaLibraryTarget;
    if (target && target.onPick) { setMediaLibraryTarget(null); target.onPick(item); }
  }, [mediaLibraryTarget, addToMediaLibrary]);
```

- [ ] **Step 3: Render the modal**

Near the other modals (template picker / lightbox render, ~8318+), add:

```jsx
  <MediaLibraryModal
    open={mediaLibraryTarget != null}
    mode={mediaLibraryTarget && mediaLibraryTarget !== 'curate' ? 'pick' : 'curate'}
    items={project.mediaLibrary || []}
    onPick={handleLibraryPick}
    onRemove={removeFromMediaLibrary}
    onAddFile={handleLibraryAddFile}
    onAddEmbed={handleLibraryAddEmbed}
    onClose={() => setMediaLibraryTarget(null)}
    usageCountOf={(ref) => usageCount(project, ref)}
  />
```

- [ ] **Step 4: Wire the toolbar button (replace the Task 4 guard)**

Change the Task 4 button's onClick to `onClick={() => openMediaLibrary()}` (curate mode).

- [ ] **Step 5: Verify curate flow via playwright**

Extend the verify script (or write `verify-curate.mjs`): enter edit mode, click `.cs-media-lib-btn`, assert `.cs-media-modal` appears, assert filter chips render with counts, click a chip and assert the grid filters, click a tile's `.cs-media-remove`, and assert the count on the toolbar button decreases after closing. Example core:

```js
await p.click('.cs-media-lib-btn');
await p.waitForSelector('.cs-media-modal');
const chips = await p.$$eval('.cs-media-chip', (els) => els.map((e) => e.textContent.trim()));
console.log('chips:', chips); // All N · Images .. · Videos .. · Figma .. · YouTube .. · Other embeds ..
const before = await p.$$eval('.cs-media-tile', (els) => els.length);
await p.click('.cs-media-chip:nth-child(3)'); // Videos
const afterFilter = await p.$$eval('.cs-media-tile', (els) => els.length);
console.log('tiles all→videos:', before, afterFilter);
```

Run the dev server (as in Task 4) then the script.
Expected: modal opens; chips show counts; filtering changes the tile count; remove works.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CaseStudy.jsx
git commit -m "feat(case-study): mount MediaLibraryModal (curate) + add/remove/upload/embed"
```

---

### Task 6: Slides pick mount (DynamicImages empty-state + psTabs)

**Files:**
- Modify: `src/pages/CaseStudy.jsx` — add a "Library" button to the DynamicImages empty-state media-type chooser (near the Upload/Embed buttons, ~5040-5100 region where `updateImage` and `setEmbedInputIndex` are in scope) and to the psTabs media-type row (~1027, ComparisonSlide, where `updatePsTab` is in scope).

**Interfaces:**
- Consumes: `openMediaLibrary` (Task 5); `updateImage(imgIndex, { src, isVideo, embedUrl })` (existing, ~4357); `updatePsTab(tabIdx, patch)` (existing).

- [ ] **Step 1: DynamicImages — add a "Library" button next to the upload/embed choosers**

In the empty-state media-type button group inside `DynamicImages` (the block that renders "Upload image / Embed Figma / …" when a slot has no media), add:

```jsx
<button
  type="button"
  className="media-type-btn"
  onClick={() => openMediaLibrary((item) =>
    updateImage(imgIndex, { src: item.src || '', isVideo: !!item.isVideo, embedUrl: item.embedUrl || '' })
  )}
>
  ⊞ Library
</button>
```

`DynamicImages` is a component defined inside `CaseStudy`, so `openMediaLibrary` and `updateImage` are already in closure scope. Match the existing sibling button's className (`media-type-btn` or the actual class used there — confirm when editing).

- [ ] **Step 2: psTabs — add a "Library" button to the ComparisonSlide media-type row (~1027)**

Next to that row's Upload/Embed buttons, add:

```jsx
<button
  type="button"
  className="media-type-btn"
  onClick={() => openMediaLibrary((item) =>
    updatePsTab(tabIdx, { image: item.src || '', embedUrl: item.embedUrl || '' })
  )}
>
  ⊞ Library
</button>
```

(If `updatePsTab` sets `image` and `embedUrl` on the tab, keep them mutually exclusive: when `item.embedUrl` is set, pass `image: ''`; when `item.src` is set, pass `embedUrl: ''`. The example above already passes both with one empty.)

- [ ] **Step 3: Verify slide pick via playwright**

Script: enter edit mode + slides view (`?view=slides`), navigate to a slide with an empty image slot (or clear one), click its "⊞ Library", assert the modal opens in pick mode (`.cs-media-tile.is-pickable`), click a tile, then assert the slide now renders that media (an `<img>`/`<video>` with the picked src appears where the slot was). Core:

```js
await p.click('.media-type-btn:has-text("Library")');
await p.waitForSelector('.cs-media-modal .cs-media-tile.is-pickable');
const pickedSrc = await p.$eval('.cs-media-tile.is-pickable .cs-media-thumb-img', (el) => el.currentSrc || el.src);
await p.click('.cs-media-tile.is-pickable .cs-media-tile-body');
await p.waitForTimeout(500);
const nowUsed = await p.$$eval('img,video', (els) => els.map((e) => e.currentSrc || e.src));
console.log('picked into slide:', nowUsed.some((s) => s && pickedSrc && s.includes(pickedSrc.split('/').pop())));
```

Expected: `true` — the picked media is now on the slide.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CaseStudy.jsx
git commit -m "feat(case-study): pick from media library into slides (DynamicImages + psTabs)"
```

---

### Task 7: Article pick mount (FigureBlock via context)

**Files:**
- Modify: `src/pages/CaseStudy.jsx:8916` — pass `openMediaLibrary` to `<CaseStudyArticle>`.
- Modify: `src/pages/CaseStudyArticle.jsx` — add a `MediaLibraryContext`, provide `openMediaLibrary` at the top of the component, and add a "⊞ Library" button in `FigureBlock` (empty slot + tools row) that consumes it.

**Interfaces:**
- Consumes: `openMediaLibrary(onPick)` (Task 5).
- Produces: article figure entries set via `setEntry(i, { src, isVideo, embedUrl })`.

- [ ] **Step 1: Pass the prop from `CaseStudy.jsx`**

At the `<CaseStudyArticle … ops={articleOps} />` render (~8916), add `openMediaLibrary={openMediaLibrary}`.

- [ ] **Step 2: Context + provider in `CaseStudyArticle.jsx`**

Near the top of `CaseStudyArticle.jsx` (module scope):

```jsx
import { createContext, useContext } from 'react';
const MediaLibraryContext = createContext(null);
```

In the main `CaseStudyArticle({ project, projectId, editMode, ops, openMediaLibrary })` component, wrap the returned tree in the provider:

```jsx
return (
  <MediaLibraryContext.Provider value={openMediaLibrary}>
    {/* …existing returned JSX… */}
  </MediaLibraryContext.Provider>
);
```

(Add `openMediaLibrary` to the component's destructured props.)

- [ ] **Step 3: "⊞ Library" button in `FigureBlock`**

In `FigureBlock`, read the context and add a button in the empty-slot area (after line 469) and in the tools row (after line 473):

```jsx
const openLibrary = useContext(MediaLibraryContext);
// …
// Empty slot — offer library beside "+ Upload":
{editing && openLibrary && !(hasText(entry.src) || hasText(entry.embedUrl)) && (
  <button
    type="button"
    className="cs-article-mini-btn cs-article-lib-btn"
    onClick={() => openLibrary((item) => setEntry(i, { src: item.src || '', isVideo: !!item.isVideo, embedUrl: item.embedUrl || '' }))}
  >
    ⊞ Library
  </button>
)}
// …tools row (next to the "upload" mini-btn at 473):
{openLibrary && (
  <button
    type="button"
    className="cs-article-mini-btn"
    onClick={() => openLibrary((item) => setEntry(i, { src: item.src || '', isVideo: !!item.isVideo, embedUrl: item.embedUrl || '' }))}
  >
    library
  </button>
)}
```

- [ ] **Step 4: Verify article pick via playwright**

Script: enter edit mode + article view (default), scroll to a figure block's empty slot or tools row, click "⊞ Library"/"library", pick a tile, assert the figure now shows the picked media. Reuse the pick-assertion pattern from Task 6 Step 3, scoped to `.cs-article-figure`.

Expected: the picked media renders in the article figure.

- [ ] **Step 5: Full build + final commit**

Run: `export PATH="/Users/lywrbwm/.nvm/versions/node/v24.15.0/bin:$PATH" && cd "/Users/lywrbwm/Developer/Portfolio v3" && npm run build 2>&1 | tail -5 && node --test src/data/mediaLibrary.test.mjs`
Expected: build succeeds; all unit tests pass.

```bash
git add src/pages/CaseStudy.jsx src/pages/CaseStudyArticle.jsx src/pages/CaseStudyArticle.css
git commit -m "feat(case-study): pick from media library into article figures"
```

---

## Self-Review

**Spec coverage:**
- FR1 (persistent bin on project) → Task 4 (state) + Task 1 (shape).
- FR2 (auto-collect on edit-enter + view-switch) → Task 4 effect (+ Task 5 on-open freshen).
- FR3 (curated, sticky removal/tombstones) → Task 1 `mergeIntoLibrary` tombstone filter + Task 5 `removeFromMediaLibrary`.
- FR4 (filterable/searchable modal) → Task 3.
- FR5 (pick inserts into slot) → Task 6 (slides) + Task 7 (article).
- FR6 (add-new: upload or embed URL) → Task 5 handlers + Task 3 add tile.
- FR7 (images/videos/gifs/embeds) → Task 1 `classifyMediaItem` + Task 3 thumbnails.
- FR8 (mount points: slides + article + toolbar) → Tasks 4/5/6/7.

**Spec correction folded in:** the design spec said to extend the JSON-import merge-protection list at `CaseStudy.jsx:3048`. That list is **per-slide**; the paste-import `setProject` at `3063` spreads `...prev` and only overrides specific top-level keys, so `mediaLibrary`/`mediaLibraryRemoved` survive automatically — **no change needed there.** (If the "Edit Full JSON" apply path replaces the whole project object, ensure it preserves/echoes these two keys — verify during Task 5.)

**Placeholder scan:** none — all code is concrete. The Task 4 button uses a temporary `openMediaLibrary &&` guard, explicitly replaced in Task 5 Step 4.

**Type consistency:** item shape `{ id, src?, embedUrl?, isVideo?, isGif?, caption?, addedAt }` and `libraryItemRef`/`classifyMediaItem`/`mergeIntoLibrary`/`usageCount` signatures are identical across Tasks 1, 3, 5. Write targets are the existing `updateImage(i,{src,isVideo,embedUrl})`, `updatePsTab(tabIdx,{image,embedUrl})`, and `setEntry(i,{src,isVideo,embedUrl})`.

**Known adaptation:** No component test runner exists in the repo, so UI/integration tasks (3–7) are verified with `playwright-core` + `npm run build`/`eslint` (the repo's established pattern) rather than unit tests; pure logic (Task 1) uses real `node --test` TDD.
