# Coverage Matrix — Patient Report Redesign (project-1776014998709)

Post-fix audit: every actionable recommendation across the three verdicts + synthesis, dispositioned against the current extracted text.

---

## Full Recommendation Table

| # | Recommendation | Source(s) | Disposition | Where / Why |
|---|---|---|---|---|
| 1 | Add `metaItems` (Role / Timeline / Team / Tools) to intro | All 3 + Synthesis #1 | **APPLIED** | `slides.0.metaItems.0–3` — all four items present in current extracted |
| 2 | Add `headlineMetric` to intro slide | All 3 + Synthesis #1 | **DESIGNER** | No defensible figure exists; left blank per edit-summary rationale. Designer must supply or confirm a number before this can be filled. |
| 3 | Outcomes: replace adjective labels (Faster/Clearer/Higher/Wider) with specific claims or honest pre-launch framing | All 3 + Synthesis #2 | **APPLIED** | `slides.10.title` = "Early-access results."; `slides.10.outcomes.0–3.description` all rewritten; `.outcomes.2.description` explicitly flags that broader measurement is planned |
| 4 | Add a `reflection` slide | All 3 + Synthesis #3 | **APPLIED** | Slide 12 (type: `reflection`) present with whatWorked, whatFailed, whatYoudDoDifferently, whatYouLearned, whatYouCouldntMeasure |
| 5 | Add a `directions` / Ideation slide (2–3 layout directions, rejected + accepted) | All 3 + Synthesis #4 | **APPLIED** | Slide 4 (type: `directions`) present with three directions: collapsible sidebar (rejected), floating drawer (rejected), compact header (accepted) |
| 6 | Replace "we" with "I" throughout; assert first-person ownership | All 3 + Profile non-negotiable | **APPLIED** | Slides 2 (`slides.2.title`, `slides.2.content`), 3 (`slides.3.title`), 6 (`slides.6.content`), 8 (`slides.8.afterDescription`) all use "I" |
| 7 | Remove FDI jargon / explain plain English | UX + Synthesis #5 | **APPLIED** | `slides.7.issues.1` = "Tooth chart — click to tag affected teeth, shown as numbered markers" — no FDI acronym; `slides.7.highlight` = "Show, don't describe" |
| 8 | Remove "share/download buried in sidebar" duplication (slides 1 & original slide 4) | UX + Recruiter + Synthesis #5 | **APPLIED** | `slides.1.issues` no longer contains the sharing bullet; `slides.5.beforeBullets.2` = "Share and Export buried outside the editing flow" (distinct framing) |
| 9 | Remove "25%" repeated on two slides | UX + Recruiter + Synthesis #5 | **APPLIED** | `slides.1.content` no longer mentions 25%; `slides.5.beforeDescription` no longer mentions 25% |
| 10 | Cut slide 1 (problem) to budget (was 97 words / budget 75) | UX + Synthesis #5 | **APPLIED** | `slides.1` now 69 words — within budget |
| 11 | Feature slides 6 & 7: change issuesTitle from "What this enabled" to neutral feature framing | UX + Synthesis conflict resolved | **APPLIED** | `slides.6.issuesTitle` = "How it works"; `slides.7.issuesTitle` = "How it works" |
| 12 | Add SaaS transferable-skill framing sentence | Director + Synthesis conflict resolved | **APPLIED** | `slides.11.subtitle` = "I make complex workflows feel obvious — a skill for any high-pressure product." |
| 13 | Add `highlight` to quotes slide (slide 2) for the "accepted as workarounds" insight | UX | **GAP** | Insight is in `slides.2.content` but NOT in the `highlight` field. UX reviewer specifically said "use `highlight` for the workarounds insight." Field is available (listed as unused). |
| 14 | Add `context` to testimonial slide (slide 9) | UX | **GAP** | `slides.9.context` field is absent. UX said "add `context` (e.g. 'early access, 3 mo post-launch')." Field is available (listed as unused). |
| 15 | Add `beforeLabel` / `afterLabel` to comparison slides (5 & 8) | UX | **GAP** | Both comparison slides (slides 5 and 8) list `beforeLabel` and `afterLabel` as Available unused fields. UX reviewer: "add before/after labels." Neither slide has them. |
| 16 | Slide 5 (comparison) highlight → first-person decision voice | Director + Synthesis (decision narration per feature) | **GAP** | `slides.5.highlight` = "One header line replaced an entire panel — and made every action faster to reach." — editorial, not first-person. Edit-summary claimed this was rewritten to "I replaced an entire panel…" but the current text does not match. |
| 17 | Slide 7 (annotation) content → first-person decision voice | Director + Synthesis (ownership throughout) | **GAP** | `slides.7.content` = "Two tools for the question doctors kept asking: where exactly is the problem?" — no "I". Edit-summary stated it would read "I added two tools that answer the same question…" but current text is different. |
| 18 | Per-feature "why this over alternative" sentence on feature slides | Director | **PARTIAL** | `slides.6.content` has WHY ("so doctors start with structure, not a blank page"). `slides.7.content` lacks explicit WHY. Slide 8 (share comparison) `afterDescription` has "I replaced them with a full sharing modal" but no explicit rationale. Slide 4 (directions) covers the layout direction rationale well. Partial credit — gaps on slides 7–8 covered by R17. |
| 19 | State research sample size (n of doctors interviewed) | UX + Recruiter | **DESIGNER** | `slides.2.content` = "I interviewed doctors across four specialties." — no n given. Requires designer to supply actual count. |
| 20 | Add `info` slide (role / timeline / methodology context) | UX + Synthesis #1 (as OR option) | **DECLINED** | Synthesis phrased this as "Add an `info` slide OR fill intro `metaItems`." `metaItems` were filled (R1 applied). Adding an `info` slide on top of a populated intro would duplicate the project-context beat. Per synthesis "or" framing, one fix satisfies both. |
| 21 | Surface "accepted as workarounds, not reported" insight prominently | UX | **APPLIED** | `slides.2.content` now ends with "none had ever been reported, because everyone assumed it was just how the tool worked." — the insight is prominent in the research slide. |
| 22 | Outcomes: explicit pre-launch / early-access honesty statement | Synthesis conflict resolved (honesty over adjectives) | **APPLIED** | `slides.10.title` = "Early-access results."; `slides.10.outcomes.2.description` = "Broader measurement is planned post-rollout." |
| 23 | Testimonial role: expand to include early access context | UX | **APPLIED** | `slides.9.role` = "Orthodontist, iTero early access program" |
| 24 | End slide: fill email / phone / linkedin | UX | **DESIGNER** | `slides.11` Available unused fields lists all three. Personal contact info — designer must supply. |
| 25 | Slide 8 (share comparison): remove redundant beforeBullet, cut to budget (was 114 words / budget 110) | UX + Synthesis #5 | **APPLIED** | `slides.8` now 110 words — at budget |
| 26 | Name the "scaffold without constraining" signature move | Director | **PARTIAL** | Director flagged this as a differentiation opportunity. The pattern is visible in the deck three times but never named. Synthesis top-5 doesn't mandate it (it was a director-only observation). End subtitle alludes to it ("complex workflows feel obvious") but doesn't name the pattern. Reflection slide budget is at 100/100 — no headroom to add it there. Classifying as PARTIAL/low-priority gap; not in coverage-edits since reflection is at budget. |
| 27 | Business stakes: what did report-skipping cost Align? | UX + Director | **DESIGNER** | Requires actual product/business data (completion rate as a KPI, revenue impact). Cannot be drafted without fabricating a metric — violation of profile non-negotiable. |
| 28 | Link Dr. C's quote → annotation feature decision explicitly | UX | **APPLIED** | `slides.7.content` references "the question doctors kept asking: where exactly is the problem?" — this echoes Dr. C's "no way to circle what I'm talking about on the image" (slide 2). The thread is present, though not an explicit callback. |
| 29 | Slide 5 (templates): cut to budget (was 85 words / budget 75) | UX + Synthesis #5 | **APPLIED** | `slides.6` (post-insert renumbering: templates slide) now 73 words — within budget |
| 30 | Slide 7 (share comparison): ensure no second "share buried" duplicate | Recruiter + Synthesis | **APPLIED** | `slides.8.beforeBullets` does not duplicate the slide 1 language |

---

## Gaps Found

The following recommendations are NOT yet reflected in the current deck and require changes:

**Gap 1 — R13: `highlight` missing on quotes slide**
`slides.2.highlight` is absent. The workarounds insight ("nobody reported it because it felt normal") is the most sophisticated finding in the deck — the UX reviewer specifically said to surface it in the `highlight` field. Currently it's buried in the `content` paragraph where it competes with two other sentences.

**Gap 2 — R14: `context` missing on testimonial slide**
`slides.9.context` is absent. The testimonial would read stronger with one line of framing (when the feedback was given, in what context). The field is available and the UX reviewer explicitly called for it.

**Gap 3 — R15: `beforeLabel` / `afterLabel` missing on both comparison slides**
`slides.5` (UI Layout) and `slides.8` (Share & Export) both have comparison images but no `beforeLabel` or `afterLabel` labels. These are short (1–2 word) structural elements that orient the reader to which side is before/after. UX reviewer flagged both.

**Gap 4 — R16: Slide 5 highlight not in first-person**
`slides.5.highlight` = "One header line replaced an entire panel — and made every action faster to reach." The edit-summary claimed this was rewritten to first-person ("I replaced an entire panel…") but the current text is still editorial passive. The director's decision-narration mandate is not satisfied here.

**Gap 5 — R17: Slide 7 content not in first-person**
`slides.7.content` = "Two tools for the question doctors kept asking: where exactly is the problem?" — no "I." The director and synthesis both require first-person ownership on every feature slide. The edit-summary targeted this slide but the current text doesn't show the "I added…" framing.

---

## Notes on Disposition Logic

- **DESIGNER** items are genuine blocks — they require the designer's own knowledge (real numbers, contact info, confirmed interview count, actual business stakes). No agent can resolve these without fabricating.
- **DECLINED** items respect the synthesis conflict resolutions. R20 (`info` slide) was declined because the synthesis stated it as an "or" option and the `metaItems` path was taken.
- **PARTIAL** items (R18, R26) are directionally applied but not complete. R18 gaps are captured by R17 (the specific slide). R26 is a director-only nice-to-have that conflicts with the reflection slide's budget ceiling.
- All budget checks use the word counts from the current extracted.md.
