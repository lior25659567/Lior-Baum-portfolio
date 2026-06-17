ok# Presenter Notes for Case Studies — Design

**Date:** 2026-06-14
**Status:** Approved design, pending spec review
**Owner:** Lior

## Goal

Let the presenter see private, per-slide notes (PowerPoint / Keynote / Figma
"presenter view" style) while showing a case study on the deployed Netlify
site during an interview — without the people watching the shared screen
seeing those notes.

## Core constraint (why the design is what it is)

Screen sharing captures pixels. Anything drawn on the surface being shared is
sent to participants. Therefore notes shown as an overlay on the *same* shared
view cannot be private. Privacy comes from **where the notes render**, not from
a key toggle.

The presenter shares a **single window/tab** in interviews (confirmed). So the
viable solution is a **separate presenter window**: the case study stays in the
shared tab; a second browser window holds the notes and is never shared. This
mirrors how Keynote/PowerPoint/Figma presenter view works.

## Decisions (settled)

- **Approach:** A — separate, synced presenter window.
- **Storage:** notes baked into the case-study JSON and deployed to Netlify
  (authored in edit mode, same save path as other slide content).
- **Activation key:** `P` (free — view-mode keys currently used are arrows for
  nav and `R` for jump-to-first).
- **Timer:** out of scope for v1.
- **Privacy caveat (accepted):** because notes deploy in the public JSON, they
  are not displayed anywhere but are technically fetchable by someone inspecting
  network requests / devtools. Acceptable for this use case.

## Data model

Add an optional field to each slide object in
`src/data/case-studies/<slug>.json`:

```
presenterNotes: string   // optional; plain text, may contain line breaks
```

- Absent / empty ⇒ presenter view shows "(no notes for this slide)".
- Text-only. Never rendered in the normal (non-presenter) deck, view or edit.

## Component 1 — Authoring UI (edit mode)

A collapsible **"Presenter notes"** panel docked at the bottom of the case
study while `editMode` is on.

- Bound to the **currently viewed slide** (`currentSlide`).
- A `<textarea>`; on change calls the existing `updateSlide(currentSlide, {
  presenterNotes })` so it persists through the same Dexie/localStorage +
  save-to-code (JSON write) path every other edit uses, and therefore deploys
  to Netlify with the deck.
- Collapsed by default so it never clutters the editing surface; a small toggle
  (e.g. "Notes") expands it.
- Because the global keydown handler ignores events whose target is an
  `INPUT`/`TEXTAREA`/`contentEditable`, typing in this panel will not trigger
  slide navigation or the `P` shortcut. (Already handled in `handleKeyDown`.)

## Component 2 — Presenter view (view mode)

### Trigger
In view mode, pressing `P` (when not typing in a field) opens the presenter
window via `window.open('/present/<slug>', 'cs-presenter', '<popup features>')`.

- Pressing `P` again focuses the existing window (reuse the same window name).
- If `window.open` returns null (popup blocked), show a transient toast in the
  main window: "Allow pop-ups for this site, then press P again."

### Route
New route in `src/App.jsx`:

```
<Route path="/present/:projectId" element={<PresenterView />} />
```

### PresenterView.jsx (new)
A minimal, self-contained, high-contrast page:

- Loads the case study for `:projectId` using the same data accessor the case
  study page uses (`getCaseStudyData` / async variant) so it has every slide's
  `presenterNotes` and titles.
- Renders for the active slide index:
  - **Position** — e.g. "7 / 30".
  - **Current notes** — the slide's `presenterNotes`, scrollable, large readable
    type. Empty ⇒ "(no notes for this slide)".
  - **Next up** — the next slide's title (or label) as a peek; nothing if last.
- No site chrome (nav/theme toggle/footer). Dark, legible, fills the window.

## Component 3 — Sync (main ↔ presenter)

Use a `BroadcastChannel` named per slug, e.g. `cs-presenter:<slug>`.

Protocol:
- **Presenter → main, on load:** post `{ type: 'ready' }`.
- **Main → presenter:** on receiving `ready`, and whenever `currentSlide`
  changes, post `{ type: 'index', index }`.
- **Presenter** keeps local state from the latest `index` message and renders
  the matching slide's notes.

One-way drive for v1 (the presenter advances the deck in the shared tab; the
notes window mirrors). `BroadcastChannel` is supported in all current browsers;
no fallback needed for v1. If the main window closes, the presenter keeps
showing the last received slide.

## Files touched

- `src/data/case-studies/<slug>.json` — gains optional `presenterNotes` per
  slide (written through edit mode; no manual edits required).
- `src/pages/CaseStudy.jsx` —
  - edit-mode "Presenter notes" panel bound to the current slide;
  - `P` keydown handler (view mode) → open/focus presenter window;
  - broadcast `currentSlide` changes on `cs-presenter:<slug>`.
- `src/pages/PresenterView.jsx` (new) + `PresenterView.css` (new) — the notes
  window.
- `src/App.jsx` — add the `/present/:projectId` route.
- Save endpoint (`vite-plugin-save-case-study.js`) — ensure `presenterNotes` is
  allowed to persist (it is plain prose, not a protected media/config key).
- Case-study text pipeline (`scripts/case-study-text.mjs`) — exclude
  `presenterNotes` from `extract` so the review/critic agents ignore it (it is
  not part of the on-screen deck copy).

## Edge cases

- **Popup blocked** → toast instructs the user; pressing `P` again retries.
- **Slide with no notes** → "(no notes for this slide)".
- **Last slide** → "Next up" peek hidden.
- **Typing in the notes textarea** → no nav / no `P` trigger (target-tag guard).
- **Presenter opened before any navigation** → `ready` handshake pulls the
  current index immediately, so it isn't stuck on slide 0.
- **Reopening `P`** → focuses the existing window instead of spawning duplicates.

## Out of scope (v1)

- Driving the deck from the presenter window (prev/next buttons there).
- Elapsed timer / clock.
- Cross-machine sync (channel is same-browser, same-origin only — which is
  exactly the interview setup).
- Rich-text notes (plain text only).

## Success criteria

1. In edit mode the presenter can write/edit notes per slide; they save and
   survive deploy to Netlify.
2. On the deployed site, pressing `P` opens a separate window showing the
   current slide's notes.
3. Advancing slides in the shared tab updates the presenter window.
4. Sharing the slides tab in Zoom/Meet does not reveal the presenter window.
