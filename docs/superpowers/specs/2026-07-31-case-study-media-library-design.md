# Case-Study Media Library — Design Spec

- **Date:** 2026-07-31
- **Status:** Design approved; pending implementation plan
- **Scope:** One implementation plan (single feature, single case-study editor surface)

## 1. Goal

Give each case study a persistent **media library** ("asset bin") — one place that holds every
image, video, GIF, and embed (Figma / YouTube / site iframe) used across that study's **slides +
article**. The bin is a curated collection: media stays in it even after it's removed from every
slide/article, and the designer can remove items from the bin themselves. When adding media in
either slides or article edit mode, a filterable gallery of the study's collected media opens, plus
an "add new" option.

## 2. Functional requirements

- **FR1** — A persistent, per-case-study media bin, stored on the `project` object.
- **FR2** — Auto-collect: on entering edit mode and on every slides↔article view switch, merge all
  media referenced anywhere in the study (slides + article) into the bin. Additive and idempotent.
- **FR3** — Curated: items persist regardless of whether they're still used; the designer can remove
  items, and removal is **sticky** (tombstoned) so auto-collect won't re-add a removed item.
- **FR4** — A gallery **modal**, edit-mode only, showing the bin as thumbnails, with **type filters**
  (All / Images / Videos / Figma / YouTube / Other embeds, each with a count) and a **search box**.
- **FR5** — Picking a tile inserts that media into the slot that opened the gallery (a slide media
  field or an article figure entry).
- **FR6** — "Add new": upload a file (image / video / GIF) **or** paste an embed URL (Figma / YouTube
  / site) — the new item is added to the bin **and** fills the slot.
- **FR7** — Media types include images, videos, GIFs, and embeds (Figma iframe, YouTube, site iframe).
- **FR8** — Mount points (all edit-mode only): the article figure empty-slot + tools row; the slides
  DynamicImages empty-state chooser and the psTabs media-type row; **plus** an always-available
  "Media Library" button in the edit toolbar for browse/curate any time.

## 3. Non-goals & constraints

- **Edit-mode only.** Public viewers never see the library. No changes to view-mode / fixed-canvas
  behavior (per repo convention: never alter edit-mode behavior beyond what this feature needs).
- **Per-study only** — no cross-study library.
- **Persistence is the existing two-tier model, unchanged.** New uploads become `data:` URIs in
  IndexedDB immediately and only become real files on the **dev-only "Save to Code"**
  (`extractAndSaveMedia` → `/api/save-image` / `/api/save-video`). On the deployed static site a new
  upload stays a `data:` URI in that one browser — a pre-existing limitation we are **not** solving
  here. Referencing already-saved `/case-studies/…` paths works everywhere.
- **Respect the media-protection contract.** Keep the canonical media-entry shape and media key names
  so `extractAndSaveMedia` (value-based data-URI walk) and the text-review scripts keep
  detecting/protecting media.

## 4. Data model

Two new keys on the `project` object (siblings of `slides` / `article`):

```js
// project.mediaLibrary
MediaLibraryItem = {
  id: string,          // stable local id from newLibraryItemId() (e.g. 'ml-<counter>')
  src?: string,        // image/video path OR data: URI   (mutually exclusive with embedUrl)
  embedUrl?: string,   // Figma / YouTube / site iframe URL
  isVideo?: boolean,   // forces video render (required for data: video, whose ext can't be sniffed)
  isGif?: boolean,
  caption?: string,    // optional label; also searched
  addedAt: number,     // Date.now() at add time (the pure merge helper takes `nowMs` as an arg so it stays testable)
}

// project.mediaLibraryRemoved: string[]   — tombstones (the src/embedUrl strings removed by the user)
```

- **Identity / dedup key** = `item.src ?? item.embedUrl` (exact string).
- **Persistence** rides the existing path: `setProject` → debounced auto-save (IndexedDB +
  localStorage) → Save-to-Code (`extractAndSaveMedia` rewrites any `data:` URI inside `mediaLibrary`
  to a file path, value-based, no special-casing) → committed `<slug>.json`.
- **JSON-import protection:** add `mediaLibrary` / `mediaLibraryRemoved` to the incomplete media-key
  merge-protection list at `CaseStudy.jsx:3048` so pasting JSON can't silently drop the bin.
- No `dataVersion` bump needed for in-app edits (they write IndexedDB). Absent `mediaLibrary` is
  treated as `[]`.

## 5. Auto-collect / sync

Pure helpers (new `src/data/mediaLibrary.js`):

- `collectStudyMedia(project) → MediaLibraryItem[]` — walk **slides** (every media key: `image`,
  `images`, `beforeImage`, `afterImage`, `dir1Image`/`dir2Image`/`dir3Image`, `carouselImages`,
  `psTabs[].image` + `psTabs[].embedUrl`, `logo`, `imageLeft`/`imageRight`, and per-field
  `…EmbedUrl`) through `normalizeMedia`, plus **article** `project.article.blocks[].media[]` (figure
  blocks, already in entry shape). Dedup by ref string. Reuse/extend the existing collect walker at
  `CaseStudy.jsx:1585-1615` as the template (it already covers most keys; extend to embeds + the
  remaining keys).
- `mergeIntoLibrary(project, nowMs) → { mediaLibrary }` — append each collected item whose ref is
  **not** already in `mediaLibrary` and **not** in `mediaLibraryRemoved`. Returns a new array; caller
  writes via `setProject` only when it changed. Additive only — never removes.
- **Triggers:** (a) entering edit mode once the (authored) project is loaded; (b) the
  `useEffect([isArticleMode])` view-switch effect at `CaseStudy.jsx:1427`. Both idempotent.
- `usageCount(project, ref) → number` — how many slide media fields + article figure entries still
  reference a given `src`/`embedUrl`. Feeds the "still used on N" note when removing from the bin.

## 6. Classification (filters)

`classifyMediaItem(item) → 'video' | 'figma' | 'youtube' | 'embed' | 'image'`:

- `item.isVideo || isVideoSrc(item.src)` → **video**
- else `item.embedUrl` set → host `figma.com` → **figma**; `youtube.com`/`youtu.be` → **youtube**;
  else → **embed**
- else → **image** (GIF shown with a badge when `item.isGif` / `.gif`)

Filter bar chips: **All · Images · Videos · Figma · YouTube · Other embeds**, each with a live count.
Search filters by `caption` + filename (basename of `src`) + `embedUrl`.

## 7. Gallery modal — `MediaLibraryModal`

New `src/components/MediaLibraryModal.jsx` + `.css`. Clones the existing picker shell
(`.template-modal-overlay` + `.cs-article-picker`).

Props: `{ open, items, mode: 'pick' | 'curate', onPick(item), onRemove(item), onAddFile(),
onAddEmbed(url), onClose, usageCount(ref) }`.

Layout:

- **Header:** "Media Library" title + ✕.
- **Filter bar:** type chips (with counts) + search input.
- **Grid** of tiles (`.cs-media-tile`): thumbnail — image via `buildResponsiveWebp`/`<img>`, video via
  poster (`deriveVideoPoster`) or `<LazyVideo>`, embed via a small live iframe or a Figma/YouTube chip
  with title; a type badge; a caption/label; a hover ✕ **remove** button. Clicking the tile body =
  **pick** (only in `mode:'pick'`).
- **"＋ Add new"** tile → a small menu: **Upload file** (existing uploader) or **Paste embed URL**
  (inline input → `onAddEmbed`).
- **Remove:** `onRemove` tombstones + drops the item. If `usageCount(ref) > 0`, show an inline note:
  "still used on N — this only removes it from the library."
- **Open/close:** overlay click or ✕ (plus Escape, harmless, for parity with the lightbox).
  z-index at picker level, below the lightbox (10000).

`mode:'curate'` (toolbar entry) hides the pick affordance — tiles are for viewing / removing /
adding to the bin only.

## 8. Mount points & state ownership

`CaseStudy.jsx` owns `project` + `articleOps`, so it owns the library state:

- New state `mediaLibraryTarget: { onPick } | 'curate' | null` and a helper
  `openMediaLibrary(onPick?)`. The modal reads `project.mediaLibrary` / `mediaLibraryRemoved`.
- **Slides:** add a "Library" button to the DynamicImages empty-state media-type chooser
  (`~5040-5100`) and the psTabs media-type row (`~1027`). `onPick(item)` →
  `updateImage(imgIndex, { src, isVideo, embedUrl })` (the single normalized slide write path;
  handles array-vs-single and clears the other of src/embedUrl) or `updatePsTab` for comparison tabs.
- **Article:** pass `openMediaLibrary` into `CaseStudyArticle` alongside `ops`. Add a "⊞ Library"
  button in `FigureBlock`'s empty slot (`467`) and tools row (`471-486`). `onPick(item)` →
  `setEntry(i, { src, isVideo, embedUrl })` → `ops.updateArticleBlock`.
- **Toolbar:** a "Media Library" button near the edit bar / view toggle → `openMediaLibrary()` with
  no `onPick` → `mode:'curate'`.

## 9. Reuse map (minimal new plumbing)

- **Item shape** = existing `{ src, caption, isVideo, embedUrl, size? }` (`normalizeMedia`).
- **Write paths** already exist: `updateImage` (slides), `setEntry`→`updateArticleBlock` (article),
  `updatePsTab` / carousel handlers (comparison).
- **Modal chrome:** `.template-modal-overlay` + `.cs-article-picker` classes / CSS.
- **Thumbnails:** `buildResponsiveWebp`, `<LazyVideo>`, `deriveVideoPoster` (`caseStudyMedia.jsx`).
- **Uploader:** extract the file logic from `pickArticleMedia` (`CaseStudyArticle.jsx:149`) into a
  shared `pickMediaFile(cb)` util (size caps + mobile `compressImage`), used by both surfaces and the
  modal's "Add new".
- **Persistence / extraction:** `setProject` auto-save + `extractAndSaveMedia` — already value-based,
  so it walks `mediaLibrary` with no change.

## 10. Files

**New**
- `src/data/mediaLibrary.js` — pure helpers: `collectStudyMedia`, `mergeIntoLibrary`,
  `classifyMediaItem`, `libraryItemRef`, `newLibraryItemId`, `usageCount`.
- `src/components/MediaLibraryModal.jsx` + `MediaLibraryModal.css` — the gallery.

**Edited**
- `src/pages/CaseStudy.jsx` — default `mediaLibrary`/`mediaLibraryRemoved`; extend the JSON-merge
  protection list (`3048`); `mediaLibraryTarget` state + `openMediaLibrary`; run `mergeIntoLibrary`
  on edit-enter and in the view-switch effect (`1427`); render `<MediaLibraryModal>`; add Library
  buttons in DynamicImages + psTabs; thread `openMediaLibrary` to `CaseStudyArticle`; extract
  `pickMediaFile`.
- `src/pages/CaseStudyArticle.jsx` — accept `openMediaLibrary` prop; add "⊞ Library" button in
  `FigureBlock`; `onPick` → `setEntry`.
- (Optional) `src/data/caseStudyData.js` defaults — initialize `mediaLibrary: []` on new/default
  studies (absent is fine; treated as `[]`).

## 11. Edge cases / gotchas to honor

- **`src` ↔ `embedUrl` are mutually exclusive** — on pick, set one and clear the other.
- **Slide namespaced-key inconsistency** (`image` uses legacy `imagePosition/…`; other fields use
  `${field}…`) — always go through `updateImage`, never write slide keys directly.
- **Article editing requires an authored article** (auto-seeds on edit-enter, capped at 3 tries) —
  only collect/merge once `authored` is truthy.
- **Article hero/index offset** (blocks[0] figure = hero; body blocks offset by `heroFirst`) — reuse
  `setEntry`/`updateArticleBlock`, which already handle `realIndex`.
- **data-URI vs path duplication:** an asset can appear as a `data:` URI (pre-save) and later as a
  `/case-studies/…` path (post-Save-to-Code) — two entries by string identity. Acceptable for v1;
  optional reconcile (prune a bin item whose `data:` ref no longer appears anywhere after Save-to-Code)
  is a follow-up, not blocking.
- **localStorage 4 MB cap** — prefer paths over data-URIs in the bin (data-URIs are transient); a bin
  of paths is tiny.
- **Do not broadcast** to presenter/followMode — the modal is local-only.

## 12. Testing / verification

- `npm run build` passes; lint no worse than baseline.
- Manual (headless Chrome, edit mode via `sessionStorage.editMode`):
  1. Open a study, enter edit mode, switch slides↔article → bin auto-populates with all media.
  2. Open a figure/slide slot → "Library" → gallery shows collected media; filters + search work;
     counts correct.
  3. Pick a tile → inserts into the slot (slide + article).
  4. "Add new" upload → item added to bin **and** inserted; paste Figma / YouTube URL → embed added.
  5. Remove a tile → tombstoned; does **not** reappear after another view switch; "still used" note
     shows when applicable.
  6. Toolbar "Media Library" → curate mode (view/remove/add, no insert).
  7. No public/view-mode regression; Save-to-Code still extracts a bin data-URI to a file.

## 13. Follow-ups (non-blocking)

- Auto-prune stale `data:` bin items after Save-to-Code rewrites them to paths.
- Usage panel: show exactly which slides/blocks reference an item (v1 shows only a count in the remove
  note).
