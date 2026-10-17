---
name: annotate-case-study
description: Add text-driven annotations (notes, boxes, arrows) to a case study's article images, placed on the UI the article text talks about, and trim the bullets they replace. Use when the user says "annotate <slug>", "use the annotation(s)", "add annotations to <case study>", or asks to mark problems/fixes on case-study images.
---

# Annotating case-study images from their text

The article editor has an annotation layer on figure images (`src/components/ImageAnnotations.jsx`,
data helpers in `src/data/annotations.js`). This skill fills it automatically: read what the
article says about each screenshot, point at those exact spots on the image, and remove the
bullets that now just repeat the notes. It was built and approved on Patient Report and iTero
Scan Workflow; their applied plans are in `plans/` (reference + re-apply source).

Everything goes through `scripts/annotate.py`. It refuses to reformat the JSON, touches only
`auto-` annotations and listed bullet items, and verifies nothing else changed.

## Steps

1. **Pick the study** — `src/data/case-studies/<slug>.json`. Annotations are article-only
   (a study with no `article` → stop and say so).
2. **Map the figures** — `python3 .claude/skills/annotate-case-study/scripts/figures.py <slug>`
   prints every figure (width tier, display, media flags, captions) with the heading /
   paragraphs / bullets before it and their block ids.
3. **Choose images.** Annotate only where the nearby text names specific UI problems,
   fixes or decisions you can point at. **Skip:** hero/cover images, diagrams/flows/maps that
   carry their own labels, `display: "carousel"` figures (annotations don't render in
   carousels), embeds (`embedUrl`, no `src`), videos, images with baked-in highlight boxes,
   photos with no UI, and anything where a note would only repeat the caption. Fewer,
   precise notes beat clutter — max ~4 notes per image. Concluding "nothing qualifies" is fine.
4. **Find coordinates** — `python3 .claude/skills/annotate-case-study/scripts/grid.py
   public<src> <scratch>/grid-<name>.png`, then Read the PNG. Read target positions and
   EMPTY areas (blank canvas, margins, dimmed overlays, empty panels) as 0–1 fractions.
5. **Write a plan** `<scratch>/<slug>.plan.json` (format below). Rules:
   - Wording comes ONLY from the article's own text, shortened. Never invent facts or numbers.
     Plain product language, no slogans (follow `cases/reviews/_writing-voice.md`).
   - Color `error` (red) for problems / what didn't work; `success` (green) for the solution;
     `info`/`accent` only for neutral structure.
   - Notes sit on empty space, never over the thing they describe; point with an arrow
     (curve it via `cx`/`cy` when a straight line would cross content); box the target
     region when it helps.
   - Size for the render width: note text = max(10px, 1.3% of image width). `prose` ≈ 920px,
     `wide` ≈ 1160px, `full` ≈ 1400px → at prose, `w: 0.2` ≈ 184px ≈ 22 chars/line. Keep notes
     to ~4–9 words, 1–3 lines.
   - **Trim:** list bullet items whose point is now fully on the image next to them (match
     the bold lead-in). Keep bullets that aren't on an image. If a trimmed bullet had a
     concrete detail (a number, a behavior), move it into the note. Never trim a whole list
     unless every item is on the image — then say so.
6. **Apply without bumping** —
   `python3 .claude/skills/annotate-case-study/scripts/annotate.py <slug> <plan.json> --trim`.
7. **Look at every result** — copy `scripts/shoot.mjs` into a scratch dir with
   `npm i playwright-core`, run `node shoot.mjs <slug> <out-dir>` (dev server on :5173), and
   Read each screenshot. Fix notes that overlap UI, arrows that miss, bad wraps; re-apply
   (idempotent) until every image is clean.
8. **Save the plan** into `.claude/skills/annotate-case-study/plans/<slug>.json` so it can be
   re-applied later.
9. **Bump + report** — re-run step 6 with `--bump` so browsers drop their cached edit-mode copy.
   Tell the user: which images got which notes, which bullets were removed, which images were
   skipped and why, and to hard-refresh (Cmd+Shift+R). Warn that the bump replaces any
   **unsaved** edit-mode changes to that study in their browser. Don't commit unless asked.

Several studies at once: run steps 2–8 per study in parallel sub-agents (one per study, each
told these rules and to never `--bump`), then review their screenshots yourself and bump each.

## Plan format

```json
{
  "media": {
    "/case-studies/<folder>/<image>.webp": [
      { "id": "auto-<study>-<name>", "kind": "text", "style": "note", "x": 0.02, "y": 0.05, "w": 0.2, "text": "…", "color": "error" },
      { "id": "auto-<study>-<name>", "kind": "arrow", "x1": 0.22, "y1": 0.1, "x2": 0.37, "y2": 0.14, "cx": 0.3, "cy": 0.08, "color": "error" },
      { "id": "auto-<study>-<name>", "kind": "box", "x": 0.16, "y": 0.44, "w": 0.39, "h": 0.07, "color": "error" }
    ]
  },
  "trim": { "<bullets block id>": ["**Bold lead-in of the item**"] }
}
```

- Every id starts with `auto-` (the script enforces it) — that's what makes them removable.
- Note (x, y) = top-left; arrow tip = (x2, y2); `cx`/`cy` = curve control point (may sit past
  the edges, −1…2). Other kinds/options exist (`pill`, `card`, `marker`, `positive`/`negative`
  labels, box `fill`/`border`/`label`, note `bg`/`shadow`/`border`) — see `src/data/annotations.js`.
- Keep plan colors semantic (`error`/`success`). Per image, one colors switch (media entry
  `palette`: `"brand"` | `"semantic"`, figure tools → **brand** / **green/red**) drives BOTH the
  Accepted/Rejected chip and the annotations; brand shows success as accent and error as ink.
  Unset = green/red when the image has annotations. Don't write it from a plan.

## Undo / recovery

- Remove every auto-annotation from a study:
  `python3 .claude/skills/annotate-case-study/scripts/annotate.py <slug> --remove --bump`
  (trimmed bullets come back only via git).
- If the user's **Save to Code** overwrote the file with a copy that lacks the annotations,
  re-apply the saved plan: `annotate.py <slug> .claude/skills/annotate-case-study/plans/<slug>.json --trim --bump`.
- Everything stays editable in the app's edit mode (figure tools → **annotate**).

## Gotchas

- The app loads a study from the browser's IndexedDB copy first; the file only wins when its
  `dataVersion` is higher. "I don't see any change" almost always means no bump yet.
- Annotations show at ≥1024px; below that their text is listed under the image instead.
- Headless screenshots in edit mode: the sticky edit nav covers the top ~190px — scroll the
  figure lower before clicking annotations.
- A newly added file in `public/` isn't served by an already-running Vite dev server (it answers
  with the SPA HTML) — restart `npm run dev` after adding assets.
