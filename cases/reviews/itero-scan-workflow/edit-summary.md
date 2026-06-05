# Edit summary — itero-scan-workflow (OLD→IDEATION→NEW split pass)

This pass implements the "adopt-with-changes" structural decision: split the RX Setup and Scan Toolbar comparisons into three-beat sequences (OLD → IDEATION → NEW), leaving Tooth Selection and View Tools comparisons intact. Net result: 20 slides → 22 slides.

---

## Verdict coverage matrix

| Recommendation | Source(s) | Disposition | Where / Why |
|---|---|---|---|
| RETYPE orig slide 9 (comparison "RX Setup") → textAndImage/problem, NEW-only; migrate before-* to new OLD slide | Brief — RX Setup split | **APPLIED** | `ops[0]` — retype index 9 to type `problem`, label "RX Setup — After", content + issues from afterDescription/afterBullets |
| INSERT OLD: RX Setup slide after chapter slide 7 (before directions slide 8) | Brief — RX Setup split | **APPLIED** | `ops[1]` — insert after: 7; type `problem`, label "RX Setup — Before"; content + issues migrated from orig slide 9 beforeDescription/beforeBullets |
| Move orig directions slide 8 to sit between OLD and NEW (chapter → OLD → IDEATION → NEW) | Brief — RX Setup ordering | **APPLIED** (implicit) | Insert `after: 7` naturally places OLD between chapter 7 and directions 8 — no explicit move op needed. Final order is correct without it. |
| RETYPE orig slide 13 (comparison "Scan Toolbar") → textAndImage/problem, NEW-only; migrate before-* to new OLD slide | Brief — Toolbar split | **APPLIED** | `ops[2]` — retype index 13 to type `problem`, label "Scan Toolbar — After"; content + issues from afterDescription/afterBullets + bullets2 for icon redesign; highlight carried |
| INSERT OLD: Scan Toolbar slide after chapter slide 11 (before directions slide 12) | Brief — Toolbar split | **APPLIED** | `ops[3]` — insert after: 11; type `problem`, label "Scan Toolbar — Before"; content + issues migrated from orig slide 13 beforeDescription/beforeBullets |
| Move orig directions slide 12 to sit between OLD and NEW (chapter → OLD → IDEATION → NEW) | Brief — Toolbar ordering | **APPLIED** (implicit) | Insert `after: 11` naturally places OLD between chapter 11 and directions 12 — no explicit move op needed. |
| Carry existing highlight "Tools were now one tap away…" to retyped NEW Toolbar slide | Brief — content carry-over | **APPLIED** | `ops[2]` slide includes `highlight` field with that text |
| Add bullets2 + bullets2Title for icon redesign on NEW Toolbar slide (context.md item) | Brief — icon redesign | **APPLIED** | `ops[2]` slide: `bullets2Title: "Icon redesign"`, two bullets covering visual system + readability |
| Add highlight to OLD: RX Setup — "Every second here was a second the patient sat waiting" | Brief — drafted highlight | **APPLIED** | `ops[1]` slide includes this highlight; flagged as agent-drafted in verify list |
| KEEP orig slide 10 (comparison "RX Tooth Selection") — no split, no ideation beat | Brief — Tooth Selection | **APPLIED** | No op on index 10. Slide unchanged. Deliberate: no documented exploration exists; inventing one is forbidden. |
| KEEP orig slide 14 (problem "Multi-scan & Compare") — no change | Brief | **APPLIED** | No op on index 14. |
| KEEP orig slide 15 (comparison "View Tools") — no split; strongest visual contrast in deck | Brief — View Tools | **APPLIED** | No op on index 15. |
| Do NOT touch slides 0–7, 16–19 content | Brief — hard rule | **APPLIED** | No edits on any of those paths. |
| Do NOT invent metrics, named people, or a tooth-selection ideation beat | Brief — hard rule | **APPLIED** | No metrics invented. No names added. Tooth Selection untouched. |
| Leave image slots empty with captions — designer fills via edit mode | Brief — verify notes | **APPLIED** | All four new slides have `image: ""` and a `caption` describing the asset to add. |
| Info-Page three-iteration request (context.md) — deliberately deferred | Brief — out of scope | **DECLINED** | Brief explicitly defers this to avoid pushing deck past 22 slides. Raise as a separate addition. |

---

## Slides added / removed / retyped

### Op 1 — RETYPE index 9 → type `problem` ("RX Setup — After")
The before/after comparison (orig slide 9) split into two. This slide keeps the after-state only: single-view RX setup, inline patient selection, no blocking modal. Before-state content migrated to the new OLD slide. Image slot empty — designer adds vid-aouv40ns6o0.mp4.

### Op 2 — INSERT after: 7 → type `problem` ("RX Setup — Before")
New OLD slide. Content migrated verbatim from orig slide 9's `beforeDescription` and `beforeBullets`. Lands between chapter 7 and directions slide 8, producing the sequence: chapter → OLD → IDEATION → NEW. Highlight line is agent-drafted (see verify list).

### Op 3 — RETYPE index 13 → type `problem` ("Scan Toolbar — After")
The Scan Toolbar comparison (orig slide 13) split into two. This slide keeps the after-state only: unified collapsible toolbar, one visual language. Before-state content migrated to new OLD slide. Icon redesign work from context.md added via `bullets2`/`bullets2Title`. Existing highlight carried. Image slot empty — designer adds vid-g2r58c0dp9s.mp4.

### Op 4 — INSERT after: 11 → type `problem` ("Scan Toolbar — Before")
New OLD slide. Content migrated verbatim from orig slide 13's `beforeDescription` and `beforeBullets`. Lands between chapter 11 and directions slide 12, producing the sequence: chapter → OLD → IDEATION → NEW. Image slot empty with a designer-verify note about confirming the image shows icon fragmentation. No highlight (brief did not specify one for this slide; none invented).

**Net: 20 slides → 22 slides. No slides removed.**

---

## Ordering assembly — how the 22-slide final order is achieved

The two inserts (`after: 7` and `after: 11`) naturally produce the correct order without explicit move ops:

**RX section (original indices 7–10):**
After insert `after: 7`:
7 (chapter) → [NEW: OLD RX Setup] → 8 (directions, unchanged) → 9 (retyped: NEW RX Setup) → 10 (comparison tooth, unchanged)

**Scan & View section (original indices 11–15):**
After insert `after: 11`:
11 (chapter) → [NEW: OLD Toolbar] → 12 (directions, unchanged) → 13 (retyped: NEW Toolbar) → 14 (multi-scan, unchanged) → 15 (view tools, unchanged)

Full 22-slide sequence matches `finalStructure` exactly.

---

## Content migrated (no content lost)

| Content | From | To |
|---|---|---|
| `beforeDescription` (RX blocking form) | orig slide 9 | NEW: OLD RX Setup — `content` field |
| `beforeBullets` × 3 (RX) | orig slide 9 | NEW: OLD RX Setup — `issues` array |
| `afterDescription` (RX inline) | orig slide 9 | Retyped slide 9 — `content` field |
| `afterBullets` × 3 (RX) | orig slide 9 | Retyped slide 9 — `issues` array |
| `beforeDescription` (Toolbar scattered) | orig slide 13 | NEW: OLD Toolbar — `content` field |
| `beforeBullets` × 3 (Toolbar) | orig slide 13 | NEW: OLD Toolbar — `issues` array |
| `afterDescription` (Toolbar unified) | orig slide 13 | Retyped slide 13 — `content` field |
| `afterBullets` × 3 (Toolbar) | orig slide 13 | Retyped slide 13 — `issues` array |
| `highlight` (Tools were now one tap away…) | orig slide 13 | Retyped slide 13 — `highlight` field |

---

## Content added that wasn't there before

- **OLD: RX Setup highlight** — "Every second here was a second the patient sat waiting." Agent-drafted tension line. See verify list.
- **NEW: Toolbar bullets2 / bullets2Title** — "Icon redesign" section with two bullets: "Toolbar and procedure icons rebuilt into one visual system" and "Every tool reads at a glance — nothing to memorise." Derived from context.md icon redesign request and dir3Desc of existing directions slide 12. See verify list.
- **Captioned empty image slots** — four slides now have captions naming the asset to drop in.

---

## Drafted values to verify

Every item below is agent-drafted or agent-inferred. The designer must confirm or replace before sending.

| Item | Slide | Status | What to confirm |
|---|---|---|---|
| Highlight: "Every second here was a second the patient sat waiting." | OLD: RX Setup (inserted) | **agent-draft** | Does this match your framing of the waiting-patient cost? Soften or replace if needed. |
| bullets2[1]: "Every tool reads at a glance — nothing to memorise" | NEW: Scan Toolbar — After (retyped 13) | **agent-draft** | Derived from dir3Desc of existing directions slide. Confirm this accurately describes the icon redesign outcome. |
| OLD Toolbar image note: "DESIGNER: confirm this image shows icon fragmentation" | OLD: Scan Toolbar — Before | **pre-existing flag** | img-c1djiu0kh0.webp — ux-reviewer flagged this may show the new 3D scan view with a left rail, not old scattered icons. If so, supply a real old-toolbar screenshot. |
| Six clinician quotes and participant names (Dr. Yael Levi et al.) | Slide 3 (quotes) | **pre-existing, unconfirmed** | These names are unchanged from the existing deck. Confirm they are real participants or genericize (e.g. "Dr. Y.L., orthodontist"). |
| Participant count and research scope [ADD: …] | Slide 3 (quotes) | **pre-existing [ADD]** | Fill in the actual count and session scope. |
| Role / Timeline / Team metaItems [ADD: …] | Slide 0 (intro) | **pre-existing [ADD]** | Fill in your actual role, project timeline, and team composition. |
| Design system image [ADD: …] | Slide 17 (Lasting Impact) | **pre-existing [ADD]** | Add the real design-system component image (img-5pdk4g6ngg.webp was suggested). |
| Reflection gaps (whatFailed.1, whatYoudDoDifferently.1, whatYouCouldntMeasure) | Slide 18 (Reflection) | **pre-existing [ADD]** | Supply one more specific failure, one more concrete action, and real post-launch data when available. |
| Real post-launch metrics | Slide 16 (Outcomes) | **pre-existing [ADD]** | Replace [ADD: real metric…] placeholders once post-launch data is available. |

---

## Word-budget check — new slides

Both inserted slides use the `textAndImage` budget (~75 words on screen).

- **OLD: RX Setup** — label + title + content (1 sentence) + 3 issue bullets + issuesTitle + highlight = ~45 words prose. Well within budget.
- **OLD: Scan Toolbar** — label + title + content (1 sentence) + 3 issue bullets + issuesTitle = ~35 words prose. Well within budget.
- **NEW: RX Setup** (retyped 9) — label + title + content (1 sentence) + 3 issue bullets + issuesTitle + caption = ~40 words prose. Within budget.
- **NEW: Scan Toolbar** (retyped 13) — label + title + content (1 sentence) + 3 issue bullets + issuesTitle + bullets2Title + 2 bullets2 + highlight = ~65 words prose. Within budget.

---

## Agent conflicts flagged

None. This pass executes a decided structural verdict with no reviewer disagreement.

---

## Intentional non-changes

- **Tooth Selection (orig 10) and View Tools (orig 15)** remain `comparison` type. This is a deliberate decision, not an omission. No documented exploration exists for Tooth Selection; no split was requested for View Tools. Do not let a later pass split them.
- **Slides 0–7, 16–19**: content unchanged.
- **Orig directions slides 8 and 12**: content unchanged — only their position in the deck changes as a result of the inserts landing before them.
- **Context.md Info-Page three-iteration request**: deliberately out of scope for this pass. Raise as a separate addition when the designer has distinct Info Page exploration assets.

---

## Confidence note

After this pass the two split beats are structurally complete: each reads OLD (the problem state) → IDEATION (why we chose this direction) → NEW (the solution). The deck tells a clear decision story for both RX Setup and Scan Toolbar. The four empty image slots are the only remaining gap before this section is portfolio-ready — the text case is fully made.

**Run `node scripts/case-study-text.mjs apply itero-scan-workflow` then validate JSON with `node -e "JSON.parse(require('fs').readFileSync('src/data/case-studies/itero-scan-workflow.json'))"`. Hard-refresh (Cmd+Shift+R) to see changes. Undo: `git checkout src/data/case-studies/itero-scan-workflow.json` or restore the backup branch.**
