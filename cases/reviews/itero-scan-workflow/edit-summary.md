# Edit summary — itero-scan-workflow, Toolbar Arc Slides A + B (additive pass)

## Scope

Additive pass only. Two new slides inserted into the Scan toolbar arc after original Slide 17 ("Toolbar — Exploration") and before original Slide 18 ("Scan Toolbar — After"). No existing slide text changed. The existing `edits` block from the prior pass (Slides 8 and 19) is preserved unchanged.

---

## Verdict coverage matrix

| Recommendation | Source(s) | Disposition | Where / Why |
|---|---|---|---|
| Add Slide A (icon-question framing) after Slide 17, before Slide 18 | toolbar-proposal-director.md + toolbar-proposal-ux.md | APPLIED | `ops[0]` — insert `problem`/`textAndImage` after original index 17 |
| Add Slide B (references/inspiration) after Slide A, before Slide 18 | toolbar-proposal-director.md + toolbar-proposal-ux.md | APPLIED | `ops[1]` — insert `media` (3-image) after original index 18 (i.e. after the new Slide A) |
| Template for Slide A: `textAndImage` (type `problem`), not `directions` | Both memos | APPLIED | op[0] slide uses `"type": "problem"` |
| Template for Slide B: `media` with DynamicImages (3 slots), not `directions` | Both memos | APPLIED | op[1] slide uses `"type": "media"` with 3-item `image` array |
| Placement AFTER Slide 17, not before it | Decided spec (overrides UX memo which placed them before 17) | APPLIED | `"after": 17` for Slide A; `"after": 18` for Slide B (original index, so Slide B follows Slide A in final deck) |
| Slide A must NOT repeat the "unmemorable icons was still broken" line already in Slide 17 | toolbar-proposal-ux.md | APPLIED | Slide A's content picks up from that diagnosis without repeating its wording: "the next problem was plain" rather than re-stating "unmemorable icons was still broken" |
| Slide B captions must be `[ADD: real product name + specific principle]` — never invent | Both memos | APPLIED | All three captions are `[ADD: …]` placeholders; no product names invented |
| Slide B captions must name the specific principle each reference illustrated, not just the product | toolbar-proposal-director.md | APPLIED | Each caption placeholder spells out exactly what the designer must supply: product name AND the specific visual principle |
| Keep both slides within their template word budgets (Slide A ~75w, Slide B ~35w) | Both memos + word-budget rule | APPLIED | Slide A ~65 words; Slide B ~32 words — see Word-budget trims below |
| Voice: product detail first, no taglines, first person, no invented metrics | _writing-voice.md + _designer-profile.md | APPLIED | "Placement wasn't the only thing broken" is a plain statement, not a dramatic fragment; bullets are concrete and observable |
| Do NOT invent reference product names for Slide B | _designer-profile.md non-negotiables + Both memos | APPLIED | All three image slots have empty `src: ""` and `[ADD: …]` captions |

---

## Slides added

### NEW-A — "Icon System — Problem" (original index 17 + 1 = new slide 18)

**Template:** `textAndImage` (type `problem`)
**Placement:** after original Slide 17, before original Slide 18
**Purpose:** Frames the icon-unification problem as a second, distinct toolbar design question — separate from placement — so the unified icon system on (now-shifted) Slide 19 reads as the resolution to a named problem, not a byproduct.

**Copy as written:**

- **label:** Icon System — Problem
- **title:** Placement wasn't the only thing broken
- **content:** Once the toolbar had a home, the next problem was plain: the icons inside it were built at different times, by different teams, with no shared style or logic.
- **issuesTitle:** What the icons lacked
- **issues:**
  - No consistent line weight or stroke style across tools
  - No shared visual logic between toolbar icons and procedure icons
  - Clinicians had to memorise each icon — nothing was self-explanatory

No image slot on this slide. The three bullets carry the design criteria; Slide B provides the visual reference immediately after.

### NEW-B — "Icon System — References" (new slide 19 in final deck)

**Template:** `media` (DynamicImages, 3 slots)
**Placement:** after NEW-A, before original Slide 18 (now final slide 20)
**Purpose:** Shows the external benchmarking that informed the icon-system direction, turning the unified icon set on the following slide from a visual preference into a researched decision.

**Copy as written:**

- **label:** Icon System — References
- **title:** What a consistent icon system looks like in practice
- **description:** Before drawing anything, I looked at products where icon systems work — many tools in one surface, nothing requiring memorisation.
- **image[0].caption:** [ADD: product name — the specific visual principle this product demonstrated, e.g. consistent 1.5px line weight across 30+ tools]
- **image[1].caption:** [ADD: product name — the specific visual principle, e.g. labeled icons as default so the tool name is never hidden]
- **image[2].caption:** [ADD: product name — the specific visual principle, e.g. tools grouped by function with one shared stroke convention]

All three `src` fields are empty strings — the designer adds screenshots in edit mode.

---

## [ADD: …] placeholders the designer must fill

These are NOT optional. The slide ships incomplete until each is replaced:

1. **NEW-B, image[0].src** — screenshot of reference product 1. Drop in via edit mode.
2. **NEW-B, image[0].caption** — Replace `[ADD: …]` with the real product name and the specific visual principle it demonstrated (e.g. "Figma — consistent 1.5px stroke across all toolbar icons, readable at 16px").
3. **NEW-B, image[1].src** — screenshot of reference product 2.
4. **NEW-B, image[1].caption** — Replace with real product name + specific principle.
5. **NEW-B, image[2].src** — screenshot of reference product 3.
6. **NEW-B, image[2].caption** — Replace with real product name + specific principle.

If the designer cannot supply real, named references with specific principles for all three slots, cut Slide B — a generic mood board of "good toolbars" is a junior signal, not a senior one.

---

## Word-budget trims

- **NEW-A (textAndImage, budget ~75w):** label (3) + title (7) + content (30) + issuesTitle (4) + 3 issues (21) = ~65 words. Within budget.
- **NEW-B (media, budget ~35w):** label (3) + title (9) + description (20) = ~32 words. Within budget. Captions are `[ADD: …]` placeholders.

---

## Drafted values to verify

All invented by the agent in this pass (none are from context.md or any confirmed source):

- **NEW-A title:** "Placement wasn't the only thing broken" — agent-draft, synthesised from UX memo. Confirm this is how Lior wants to frame the transition.
- **NEW-A content:** "the icons inside it were built at different times, by different teams, with no shared style or logic" — sourced from context.md ("icons from different eras, different styles, no shared visual language") and both proposal memos. Confirm phrasing.
- **NEW-A issues:** all three bullets — synthesised from UX memo's drafted bullets. Confirm these reflect the actual icon problems observed.
- **NEW-B title:** "What a consistent icon system looks like in practice" — agent-draft from UX memo. Confirm.
- **NEW-B description:** "Before drawing anything, I looked at products where icon systems work — many tools in one surface, nothing requiring memorisation." — synthesised from UX memo. Confirm this is how Lior would describe the benchmarking step.
- **NEW-B image captions:** All three are `[ADD: …]` — the designer must supply real product names and real principles. NOTHING invented here.

---

## Agent conflicts noted

**Memo conflict — placement of Slides A + B:**

- **UX memo** (toolbar-proposal-ux.md, Section 3): recommends inserting A and B BEFORE Slide 17 (after Slide 16), arguing that references inform the icon direction before placement exploration begins, and that placing them after Slide 17 reverses causality.
- **Director memo** (toolbar-proposal-director.md, Section 2): recommends inserting A and B AFTER Slide 17 (before Slide 18), arguing that the icon problem is only "formally named" in Slide 17's final accepted-direction line, so A and B must follow it.
- **Decided spec (task brief):** explicitly calls for placement AFTER Slide 17. This overrides both memos. Applied as directed.

The UX memo's causality concern is noted: if the designer finds the arc reads as "placement decided → then I did more research → icons", they should consider whether Slide B works better before Slide 17. The current placement follows the decided spec.

---

## What was NOT changed

All existing slides (0–27) — text, structure, media, order. The `edits` block from the prior pass (Slides 8 and 19) is preserved exactly. No ops on existing slides.
