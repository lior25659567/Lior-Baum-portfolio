# Presenter Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add private, per-slide presenter notes to case studies — authored in edit mode, deployed with the deck, and revealed in a separate synced window with the `P` key so they stay off the shared screen.

**Architecture:** Notes live as an optional `presenterNotes` string on each slide and persist through the existing edit-mode save path. In view mode, `P` opens a second browser window (`/present/:projectId`) that mirrors the active slide via a same-origin `BroadcastChannel`. The presenter shares only the slides tab, so the notes window is never captured.

**Tech Stack:** React 19, React Router 7, Vite 5, vanilla CSS (per-component files), `BroadcastChannel` (browser-native).

> **Testing note:** this repo has **no test runner** (scripts are `dev`/`build`/`lint`/`preview`). Automated gates per task are `npm run lint` and `npm run build`. Behavioural checks are a **manual QA checklist** (Task 6) — run them in the browser once the machine has enough free RAM to start the dev server (currently blocked; see session notes). Do not add a test framework — that's out of scope.

> **Commits:** Per project convention ("don't commit unless asked"), treat the commit steps as *suggested messages*. Leave changes uncommitted unless Lior asks to commit.

---

## File Structure

- `src/pages/CaseStudy.jsx` (modify) — edit-mode notes panel; `P` shortcut → open presenter window; broadcast active slide.
- `src/pages/CaseStudy.css` (modify) — styles for the notes panel + the popup-blocked hint.
- `src/pages/PresenterView.jsx` (create) — the notes window: loads the deck, listens on the channel, renders notes.
- `src/pages/PresenterView.css` (create) — dark, large-type presenter styles.
- `src/App.jsx` (modify) — add the `/present/:projectId` route.
- `scripts/case-study-text.mjs` (modify) — exclude `presenterNotes` from the review/extract pipeline.

Reference symbols already in `CaseStudy.jsx` main component: `const { projectId } = useParams()` (line ~1474); `const { editMode, ... } = useEdit()` (~1476); `const [project, setProject] = useState(...)` (~1477); `const [currentSlide, setCurrentSlide] = useState(...)` (~1482); `currentSlideRef` (fresh mirror of `currentSlide`, ~1497); `updateSlide(slideIndex, updates)` useCallback (~2287); view-mode `handleKeyDown` (~2108). Data accessor: `getCaseStudyDataAsync(projectId)` in `src/data/caseStudyData.js`.

---

## Task 1: Add the edit-mode "Presenter notes" panel

**Files:**
- Modify: `src/pages/CaseStudy.jsx` (main component — add one state var + one JSX block)
- Modify: `src/pages/CaseStudy.css` (append styles)

- [ ] **Step 1: Add collapse state.** In the main `CaseStudy` component, near the other `useState` declarations (just after `const [currentSlide, setCurrentSlide] = useState(...)`, ~line 1482), add:

```jsx
const [notesPanelOpen, setNotesPanelOpen] = useState(false);
```

- [ ] **Step 2: Add the panel JSX.** Inside the component's returned JSX, place this block as a direct child of the root element (e.g. immediately before the closing tag of the top-level wrapper, alongside other top-level overlays). It renders only in edit mode and binds to the active slide:

```jsx
{editMode && (
  <div className={`presenter-notes-editor ${notesPanelOpen ? 'open' : ''}`}>
    <button
      type="button"
      className="presenter-notes-toggle"
      onClick={() => setNotesPanelOpen((o) => !o)}
    >
      <span>{notesPanelOpen ? '▾' : '▸'} Presenter notes</span>
      <span className="presenter-notes-slidenum">
        Slide {currentSlide + 1}/{project.slides.length}
      </span>
    </button>
    {notesPanelOpen && (
      <textarea
        className="presenter-notes-textarea"
        placeholder="Private notes for this slide — shown only in presenter view (press P while presenting)."
        value={project.slides[currentSlide]?.presenterNotes || ''}
        onChange={(e) => updateSlide(currentSlide, { presenterNotes: e.target.value })}
      />
    )}
  </div>
)}
```

- [ ] **Step 3: Add styles.** Append to `src/pages/CaseStudy.css`:

```css
/* ═══ Presenter notes editor (edit mode only) ═══ */
.presenter-notes-editor {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 1200;
  width: min(420px, 38vw);
  background: rgba(20, 20, 22, 0.96);
  color: #f4f4f5;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  font-family: inherit;
}
.presenter-notes-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: 0;
  color: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.presenter-notes-slidenum {
  font-weight: 400;
  opacity: 0.6;
  font-size: 0.78rem;
}
.presenter-notes-textarea {
  width: 100%;
  min-height: 160px;
  resize: vertical;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.35);
  color: #f4f4f5;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0 0 10px 10px;
  font-size: 0.9rem;
  line-height: 1.5;
  font-family: inherit;
  outline: none;
}
```

- [ ] **Step 4: Lint + build.**

Run: `npm run lint && npm run build`
Expected: no new lint errors; build succeeds.

- [ ] **Step 5 (suggested commit):**

```bash
git add src/pages/CaseStudy.jsx src/pages/CaseStudy.css
git commit -m "feat(case-study): edit-mode presenter notes panel per slide"
```

---

## Task 2: Broadcast the active slide + open presenter window on `P`

**Files:**
- Modify: `src/pages/CaseStudy.jsx` (main component — refs, channel effect, slide-push effect, open handler, key effect, hint JSX)
- Modify: `src/pages/CaseStudy.css` (append hint style)

- [ ] **Step 1: Add refs + hint state.** Near the other `useState`/`useRef` in the main component, add:

```jsx
const presenterChannelRef = useRef(null);
const presenterWindowRef = useRef(null);
const [presenterHint, setPresenterHint] = useState('');
```

- [ ] **Step 2: Create the channel once per project.** Add this effect in the main component (the `ready` handshake answers the presenter window's request for the current index; `currentSlideRef` avoids a stale closure):

```jsx
// Presenter sync: one BroadcastChannel per case study, kept for the page's life.
useEffect(() => {
  if (typeof BroadcastChannel === 'undefined') return;
  const ch = new BroadcastChannel(`cs-presenter:${projectId}`);
  presenterChannelRef.current = ch;
  ch.onmessage = (e) => {
    if (e.data?.type === 'ready') {
      ch.postMessage({ type: 'index', index: currentSlideRef.current ?? 0 });
    }
  };
  return () => {
    ch.close();
    presenterChannelRef.current = null;
  };
}, [projectId]);
```

- [ ] **Step 3: Push every slide change.** Add this effect after the one above:

```jsx
// Mirror the active slide to the presenter window whenever it changes.
useEffect(() => {
  presenterChannelRef.current?.postMessage({ type: 'index', index: currentSlide });
}, [currentSlide]);
```

- [ ] **Step 4: Add the open-window handler.** Add this `useCallback` in the main component:

```jsx
const openPresenterWindow = useCallback(() => {
  const existing = presenterWindowRef.current;
  if (existing && !existing.closed) {
    existing.focus();
    return;
  }
  const features = 'popup=yes,width=520,height=720,menubar=no,toolbar=no,location=no,status=no';
  const win = window.open(`/present/${projectId}`, `cs-presenter-${projectId}`, features);
  if (!win) {
    setPresenterHint('Allow pop-ups for this site, then press P again.');
    setTimeout(() => setPresenterHint(''), 4000);
    return;
  }
  presenterWindowRef.current = win;
}, [projectId]);
```

- [ ] **Step 5: Add the `P` shortcut (view mode only).** Add this dedicated effect (kept separate from the existing nav `handleKeyDown` to avoid touching its dependency array). The input/textarea guard mirrors the existing handler so typing notes never triggers it:

```jsx
// View-mode "P" opens the presenter window.
useEffect(() => {
  if (editMode) return;
  const onKey = (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      openPresenterWindow();
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [editMode, openPresenterWindow]);
```

- [ ] **Step 6: Render the popup-blocked hint.** Add near the top-level overlays in the returned JSX (sibling to the notes panel from Task 1):

```jsx
{presenterHint && <div className="presenter-hint">{presenterHint}</div>}
```

- [ ] **Step 7: Hint style.** Append to `src/pages/CaseStudy.css`:

```css
.presenter-hint {
  position: fixed;
  left: 50%;
  bottom: 90px;
  transform: translateX(-50%);
  z-index: 1300;
  padding: 10px 16px;
  background: rgba(20, 20, 22, 0.96);
  color: #f4f4f5;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  font-size: 0.85rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 8: Lint + build.**

Run: `npm run lint && npm run build`
Expected: no new lint errors; build succeeds. (Verifying the window actually opens is in Task 6.)

- [ ] **Step 9 (suggested commit):**

```bash
git add src/pages/CaseStudy.jsx src/pages/CaseStudy.css
git commit -m "feat(case-study): P opens synced presenter window"
```

---

## Task 3: Create the PresenterView window

**Files:**
- Create: `src/pages/PresenterView.jsx`
- Create: `src/pages/PresenterView.css`

- [ ] **Step 1: Create `src/pages/PresenterView.jsx`:**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCaseStudyDataAsync } from '../data/caseStudyData';
import './PresenterView.css';

const slideTitle = (s) => s?.title || s?.label || 'Slide';

const PresenterView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [index, setIndex] = useState(0);

  // Load the deck (same accessor the case study page uses).
  useEffect(() => {
    let alive = true;
    getCaseStudyDataAsync(projectId).then((data) => {
      if (alive) setProject(data);
    });
    return () => { alive = false; };
  }, [projectId]);

  // Listen for slide changes from the main window; announce readiness on mount.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(`cs-presenter:${projectId}`);
    ch.onmessage = (e) => {
      if (e.data?.type === 'index' && typeof e.data.index === 'number') {
        setIndex(e.data.index);
      }
    };
    ch.postMessage({ type: 'ready' });
    const onKey = (e) => { if (e.key === 'Escape') window.close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      ch.close();
      window.removeEventListener('keydown', onKey);
    };
  }, [projectId]);

  const slides = project?.slides || [];
  const current = slides[index];
  const next = slides[index + 1];

  return (
    <div className="presenter-view">
      <div className="presenter-position">
        {project ? `${index + 1} / ${slides.length}` : '…'}
      </div>
      <div className="presenter-notes-body">
        {current?.presenterNotes
          ? current.presenterNotes.split('\n').map((line, i) => <p key={i}>{line || ' '}</p>)
          : <p className="presenter-empty">(no notes for this slide)</p>}
      </div>
      {next && <div className="presenter-next">Next: {slideTitle(next)}</div>}
    </div>
  );
};

export default PresenterView;
```

- [ ] **Step 2: Create `src/pages/PresenterView.css`:**

```css
.presenter-view {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 32px;
  background: #0d0d0f;
  color: #f4f4f5;
  font-family: system-ui, -apple-system, sans-serif;
}
.presenter-position {
  flex: 0 0 auto;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.7;
}
.presenter-notes-body {
  flex: 1 1 auto;
  overflow-y: auto;
  font-size: 1.6rem;
  line-height: 1.5;
}
.presenter-notes-body p { margin: 0 0 0.6em; }
.presenter-empty { opacity: 0.45; font-style: italic; }
.presenter-next {
  flex: 0 0 auto;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 1rem;
  opacity: 0.7;
}
```

- [ ] **Step 3: Lint + build.**

Run: `npm run lint && npm run build`
Expected: no new lint errors; build succeeds (route not wired yet — that's Task 4).

- [ ] **Step 4 (suggested commit):**

```bash
git add src/pages/PresenterView.jsx src/pages/PresenterView.css
git commit -m "feat(case-study): presenter notes window component"
```

---

## Task 4: Wire the `/present/:projectId` route

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import the component.** Match the existing page-import style at the top of `src/App.jsx` (the other pages like `CaseStudy` are imported there — add alongside them):

```jsx
import PresenterView from './pages/PresenterView';
```

- [ ] **Step 2: Add the route.** Inside `<Routes>`, next to the existing case-study route `<Route path="/project/:projectId" element={<CaseStudy />} />`, add:

```jsx
<Route path="/present/:projectId" element={<PresenterView />} />
```

- [ ] **Step 3: Lint + build.**

Run: `npm run lint && npm run build`
Expected: no new lint errors; build succeeds.

- [ ] **Step 4 (suggested commit):**

```bash
git add src/App.jsx
git commit -m "feat(case-study): route for presenter view window"
```

---

## Task 5: Exclude `presenterNotes` from the review/extract pipeline

**Files:**
- Modify: `scripts/case-study-text.mjs`

- [ ] **Step 1: Add the key to `HARD_DENY`.** In the `HARD_DENY` set (~line 32–40), add `'presenterNotes'` so the `extract` step never surfaces it as deck copy and `apply` refuses agent edits to it. Change the final line of the set from:

```js
  'wrapperBg', 'visual_note',
]);
```

to:

```js
  'wrapperBg', 'visual_note', 'presenterNotes',
]);
```

- [ ] **Step 2: Verify it's ignored.** Run extract on a deck that has notes (after the feature is used) or any deck now:

Run: `node scripts/case-study-text.mjs extract itero-scan-workflow`
Then: `grep -c presenterNotes cases/reviews/itero-scan-workflow/extracted.md`
Expected: `0` (the field does not appear in the extracted prose).

- [ ] **Step 3 (suggested commit):**

```bash
git add scripts/case-study-text.mjs
git commit -m "chore(case-study): keep presenterNotes out of the review pipeline"
```

---

## Task 6: Manual QA checklist (run in browser when RAM allows)

> No automated runner exists; these are the behavioural acceptance checks. The dev server currently can't start due to machine memory pressure — run these once it can (`npm run dev`, then open a case study).

- [ ] **Authoring:** Enter edit mode on a case study → the "Presenter notes" panel shows bottom-left. Expand it, type notes on slide 1, move to slide 2 → panel now shows slide 2's (empty) notes; return to slide 1 → your text is still there.
- [ ] **Persistence:** Save (the normal edit-mode save), reload the page → notes survive. (On Netlify: after deploy + hard-refresh, notes are present.)
- [ ] **Open presenter:** In view mode press `P` → a second window opens at `/present/<slug>` showing slide 1's notes and "1 / N".
- [ ] **Sync:** Advance slides in the main tab → the presenter window's position and notes update to match. "Next:" shows the upcoming slide's title; hidden on the last slide.
- [ ] **Handshake:** Navigate to slide 5 in the main tab first, *then* press `P` → the presenter window opens already showing slide 5 (not slide 1).
- [ ] **Empty notes:** A slide with no notes shows "(no notes for this slide)".
- [ ] **Popup blocked:** With pop-ups blocked, press `P` → the hint pill appears and auto-hides; allowing pop-ups + `P` opens the window.
- [ ] **Reopen:** Press `P` again with the window open → it focuses the existing window (no duplicate).
- [ ] **Privacy (the point):** In Zoom/Meet choose "share a tab/window" and share the *slides* tab. Confirm the presenter window's notes are NOT visible to participants while you read them.
- [ ] **No leakage in normal view:** With the presenter window closed and not in edit mode, the case study shows no notes anywhere.

---

## Self-Review (completed by author)

- **Spec coverage:** data model → Task 1/5; authoring panel → Task 1; `P` + window + sync → Tasks 2–4; route → Task 4; pipeline exclusion → Task 5; privacy/edge cases → Task 6. All spec sections mapped.
- **Placeholder scan:** none — every code step is complete.
- **Type/name consistency:** channel name `cs-presenter:${projectId}` and messages `{type:'ready'}` / `{type:'index', index}` match across `CaseStudy.jsx` (Task 2) and `PresenterView.jsx` (Task 3); window name `cs-presenter-${projectId}` and route `/present/:projectId` consistent across Tasks 2 and 4.
