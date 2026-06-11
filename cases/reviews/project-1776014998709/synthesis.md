# Synthesis — merge problem slides + add user-flow slide

ux/recruiter/director — unanimous on both. Current deck: 13 slides. Target: Senior, B2B SaaS.

---

## A. MERGE Slide 1 "The Problem" + Slide 2 "Limited by design" → ONE problem slide
All 3: no meaningful difference — same beat at two lengths; the split reads as indecision, and
the strongest sentence ("not adoption, the ceiling") is stranded on the second slide. Combine:

- **Open with the reframe** (from Slide 2): doctors were using it — adoption was never the
  problem; it hit a ceiling (did one thing well: hold scan images; everything else improvised).
- **Issues — dedup to ~4:** keep "Sidebar locked doctor info into 25%" (the layout-pulls-
  attention point), "No templates — every report started blank", ADD Slide 2's "No modular
  blocks — no cost breakdown / before-after / treatment plan" (more specific), keep "PDF output
  not readable by patients". **DROP** "Raw scan images with no annotation tools" → it belongs to
  the Annotation feature slide. **DROP** Slide 2's "worked around the gaps" bullet (consequence, not a limit).
- **Highlight:** keep the problem-framing one — "The tool was built around the software, not the
  doctor using it." DROP Slide 2's "removes the limit" highlight (a solution promise, not a diagnosis).
- **Keep the old-UI image** (visual proof the text can't do).
- **Retire the label "Why it needed a redesign."** Then **REMOVE Slide 2.**
- Result: one tight problem slide (~65–70 words), each bullet mapping to a later feature slide.

## B. ADD a user-flow slide (textAndImage) AFTER Goals, before Ideation — KEEP (reverses earlier cut)
All 3 reversed their earlier "cut" given the new rationale: the designer mapped the full report
flow to organize the new templates/features BEFORE designing and testing — IA before UI, a
genuine Senior sequencing decision (not process documentation). Placement Goals → User Flow →
Ideation is correct (it answers "how did I organize the problem space before designing?").

**It must read as a DECISION, not documentation** (all 3, emphatically): the description must
say WHY mapping first mattered, not "I made a user flow." Build it:
- `textAndImage` slide · label "Structure" · title "Mapping the flow before designing the features"
- `content` (IA-before-UI judgment): because the redesign added templates, blocks and new tools,
  I mapped the full report flow first — how the pieces connect and how a doctor moves through it —
  so the structure was right before I designed or tested any of it.
- `highlight`: "Structure first. Features second."
- EMPTY captioned image slot: `"src": ""`, caption `"[ASSET: user-flow map — add in edit mode]"`.

**HARD CONDITION (all 3): the flow image MUST be filled before the deck ships.** An empty
flow-slide that claims "I mapped the flow" without showing the map is a screen-out risk — worse
than no slide. Put this at the TOP of the verify list.

## Structural ops (original indices, current 13-slide deck)
- `remove` index 2 (problem "Limited by design").
- `insert` after index 4 (goals) the new `textAndImage` user-flow slide.
- Merge content edits land on Slide 1.

## Still designer-owed (verify — not blocking, except the flow image)
1. **The user-flow map image** (Slide after Goals) — blocking for ship per all 3.
2. The two Ideation screenshots (`dir1Image`/`dir2Image`).
3. One quantified outcome (the single gap to Strong Advance).
4. "Doctors preferred editing in place" — confirm testing scope.

## Overall verdict
**Almost There → Advance.** Tighter setup (one problem beat), a real IA beat, clean feature
chain. Remaining gate is filling the flow image + one outcome figure.
