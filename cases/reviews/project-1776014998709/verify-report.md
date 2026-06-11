# Verify Report — Patient Report Redesign (Round 2)
`project-1776014998709` · post-merge + structure pass · re-critique

---

### Quality read (current deck)

**Overall:** Almost there

**Seniority:** Mid-Senior vs target Senior — gap is the Outcomes slide only. Four directional adjectives (Faster / Clearer / Higher / Wider) with no figure, no baseline, no sample size, on a slide where the Goals section defined four explicit KPIs. The rest of the deck reads Senior: decisions are named, the Ideation trade-off is mechanically argued, the reflection is specific, and the Ideation description ("Doctors preferred editing in place") is correctly tight without overclaiming.

**What's still missing:**

1. **User-flow diagram image (Slide 4).** The placeholder `[ASSET: user-flow map — add in edit mode]` is correctly in place. This is the one gate before distributing — a slide claiming "I mapped the flow" without showing the map is worse than no slide. Must be filled in edit mode first.

2. **One quantified outcome (Slide 10).** Even a rough early-access figure with an explicit caveat ("~30% faster across N early-access sessions, pre-rollout baseline") would close the loop the Goals KPIs opened and shift this from "directional" to "evidenced."

3. **Research participant count (Slide 2).** "I interviewed doctors across four specialties" is strong framing with no number attached. Adding it — even a rough figure — is the lowest-effort remaining credibility lift.

---

### Verdict: PASS

No agent-invented unflagged fabrications. No cross-slide contradictions. The Ideation description is intentionally the tight version; see below.

---

### Blocking issues (pipeline must auto-fix)

None.

---

### Verdict coverage check

Checking every actionable recommendation from the three verdicts and the synthesis against the edit-summary matrix and the live deck.

**One stale matrix row (not blocking — the deck is correct):**

The matrix row for `slides.5.description` is declared APPLIED with a longer draft ("ran user testing on both... Doctors preferred editing in place, so I took that forward"). The live deck carries the shorter, tighter version: "After the goals, I built both directions and user-tested them on the same task — same content, different model. Doctors preferred editing in place."

Per the designer's explicit instruction, the tight version is intentional and final. It was deliberately chosen over the longer draft because the longer version duplicated the direction cards' mechanics and pushed the slide over its 90-word budget. The matrix entry reflects the original edit intent, not the final shipped text. **The deck is the source of truth; the matrix entry is stale. Not blocking.**

All other APPLIED rows check out against the extracted text. DECLINED rows carry substantive reasons (not dodges). DESIGNER rows are all genuinely designer-owned items (image asset, contact info, outcome figures, project duration, role title, business stakes).

**Matrix otherwise complete — all actionable items dispositioned.**

---

### Verify before sending (designer's call — NOT blocking)

1. **[SHIP-BLOCKING IMAGE] Slide 4 · `slides.4.image.0` · User-flow diagram** — image slot is correctly empty (`src: ""`), caption `[ASSET: user-flow map — add in edit mode]`. All three reviewers: a slide claiming "I mapped the flow" without showing the map is a screen-out risk, worse than no slide. Add the actual flow diagram in edit mode before distributing to any recruiter.

2. **Slide 5 · `slides.5.description` · "Doctors preferred editing in place"** — the user testing produced a stated preference. If the result was more nuanced (split, task-dependent, small sample), soften to "the majority preferred editing in place." Real? confirm or genericize.

3. **Slide 9 · `slides.9.author` · "Dr. N. Haddad"** — pre-existing. Confirm real name and consent for public portfolio use. Real? confirm or genericize to "Orthodontist, iTero early access program."

4. **Slide 9 · `slides.9.role` · "Orthodontist, iTero early access program"** — pre-existing. Confirm specialty and program name are accurate.

5. **Slide 6 · `slides.6.issues.0` · "Five templates — General Scan, Implant, Crown Prep, Follow-up, Custom"** — pre-existing. Confirm these are the shipped template names. Real? confirm or update to the actual names.

6. **Slide 2 · `slides.2.content` · Research participant count** — "I interviewed doctors across four specialties" carries no number. If you know the count, add "I interviewed [N] doctors across four specialties." Even a rough figure meaningfully raises the research credibility signal.

7. **Slide 0 · `slides.0.metaItems.1.value` · "2025"** — no duration. Add actual project length and quarter (e.g. "Q1–Q2 2025 · 10 weeks") — duration signals scope of ownership to recruiters.

8. **Slide 0 · `slides.0.metaItems.0.value` · "Product Designer"** — if your actual title during this project was Senior or Lead, update it. The work in the deck reads at that level; the title label should match.

9. **Slide 10 · `slides.10.outcomes.*` · Directional labels only** — one number from the early-access cohort with an explicit scope caveat would close the KPI loop the Goals slide opened. Confirm or add `[ADD: directional outcome figure]`.

10. **Business stakes (no current path)** — the deck names the capability ceiling but not why it mattered to Align Technology as a business (retention tool? clinical communication requirement? competitive differentiator?). One sentence in the problem or intro adds the stakeholder frame. Confirm the context and the editor can place it.

---

### Nits (auto-fixable, listed for transparency)

- **Stale matrix row for `slides.5.description`** — noted above. No deck change needed; matrix is a record, not the source of truth.

- **Dr. A's "I just skip the report most of the time" (Slide 2)** — the word "skip" appears only in this quote; the surrounding framing ("they were working around everything it couldn't do") correctly contextualizes it as a friction data point, not a "skipping narrative." No conflict. Note only.

---

### Leaning on unconfirmed profile values

- **Slide 0 · `slides.0.focus` · "Workflow UX · B2B SaaS"** — leans on the `confirmed: false` profile positioning. Directionally accurate and appropriate for the target; not a hard fabrication. Low risk.

No other slide depends on an unconfirmed profile value.

---

### Confidence

Safe to show — the deck is structurally clean and the text is correct. The one action before distributing: add the user-flow diagram in edit mode (Slide 4). After that, the deck reads at a solid Senior level and is ready to circulate. The verify checklist above is what the designer acts on next; the pipeline has nothing left to fix.
