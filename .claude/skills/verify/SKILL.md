---
name: verify
description: How to build, launch, and drive Portfolio v3 to verify changes at the browser surface (Vite SPA, no test suite).
---

# Verifying Portfolio v3 changes

## Build + launch

```bash
npm run build          # must pass before any commit (per CLAUDE.md)
npm run dev            # Vite on :5173 (predev kills stale servers on that port)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/project/wizecare   # 200 = up
```

## Drive it (headless Chrome via playwright-core)

No Playwright in project deps. Install `playwright-core` in the session
scratchpad (NOT in this repo) and use the system Chrome:

```js
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
```

Key routes/surfaces:
- `/project/wizecare` — smallest full-featured case study (15 slides, most templates)
- `/project/itero-scan-workflow` — largest (29 slides, directions/question/chapter)
- `/present/<slug>` — presenter view; `?follow=1` = follower embed (slides-only)
- `/docs/slides` — template gallery; imports `TemplatePreview` from CaseStudy.jsx,
  so it breaks if CaseStudy.jsx exports change

## Gotchas learned the hard way

- **Edit mode**: enable headlessly via `sessionStorage.setItem('editMode','true')`
  then reload. It's dev-only (`IS_DEV_EDITOR`).
- **Theme**: `localStorage.setItem('theme','dark')` then reload;
  ThemeContext stamps `data-theme` on `<html>`.
- **View mode (article/slides)**: the ARTICLE is the default public view
  (`.cs-article`, floating back button, no case-nav). The deck needs
  `?view=slides`. `?follow=1` (presenter iframe) always forces slides.
  No localStorage pref. In edit mode a Slides/Article toggle lives in the
  fixed `.edit-mode-bar`. Entering edit mode on an un-authored article
  AUTO-SEEDS it from the slides (retried when the async project load
  replaces state — don't assert on first paint), so it is immediately
  editable. The bottom `.cs-article-toolsrow` offers "Re-seed from slides"
  and "Revert to auto-generated" (revert restores the read-only derived
  projection + seed bar; `deriveArticleFromSlides` in
  src/data/articleBlocks.js).
- **`.nav-progress` is CSS-hidden in view mode by design**
  (`.case-study:not(.edit-mode) .nav-progress`) — the bottom pill shows the
  counter. Don't report it as a bug.
- **`?slide=N` is write-only**: the deck syncs currentSlide → URL but never
  reads it on load. Deep links always open slide 1. Pre-existing behavior.
- **`fetchpriority` React console warnings are pre-existing** (CaseStudy.jsx
  lowercase attr) — not a regression signal.
- **Lint is not clean at baseline** (~68 problems in CaseStudy.jsx on HEAD).
  Compare against `git stash` baseline before blaming a change.
- Case studies load IndexedDB/localStorage copies first; JSON changes need a
  higher `dataVersion` + hard refresh (fresh browser context = clean state).
