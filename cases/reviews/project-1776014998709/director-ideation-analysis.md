# Director Analysis — Slide 4, Ideation (`directions`)
## Patient Report Redesign · project-1776014998709

---

## 1. Does this decision belong in the arc — and does framing it as a direct-manipulation principle elevate the seniority read?

Yes, and it is currently doing neither job well.

The deck's arc is coherent: doctors told me it was broken → I set goals → I explored directions → I built the solution. The `directions` slide sits at the exact inflection point where the story pivots from "what I was trying to do" to "what I chose to build." That is the highest-value storytelling position in the whole deck — it is the one moment where design judgment is visible in isolation, before the solution exists to justify it.

The current slide throws that moment away. The two described directions do not match the real difference the designer explored. What's written now is a "maximal builder vs. streamlined interface" trade-off (feature richness vs. restraint), which reads as a valid but generic design decision. What actually happened — editing from a disconnected sidebar vs. editing in-place on the content itself — is a fundamentally different and more interesting decision. It maps directly back to the problem ("there wasn't a connection between the controls and the content"), it connects to Goal 3 ("make findings visual — show, don't describe"), and it establishes the architectural principle that governs the annotation and tooth-tagging that comes later.

The current framing reads as taste. ("The streamlined one" is not a reason — it is a preference.) The real framing is principle. Direct manipulation — the idea that the control must live on the thing it controls, not in a panel that refers to it — is a named, defensible design position. A senior designer who articulates that principle, ties it back to the research finding about disconnection, and shows why it was the deciding factor, is telling a completely different story than one who says "I preferred the cleaner option."

Framing it as direct-manipulation principle does three specific things for the seniority read:

1. It converts a taste call into an architectural decision. The hiring manager can't argue with "that looks cleaner." They can engage with "the editing control must sit on the content it changes — anything else forces the doctor to mentally map a sidebar action to a preview they can't touch while editing."
2. It creates a through-line. The annotation tools and tooth tags on Slide 7 are no longer features — they are the execution of a principle the reader already understood on Slide 4. That is the difference between a portfolio that shows "things I made" and one that shows "how I think."
3. It answers the "why" without hedging. The `description` currently says "the majority preferred it" — an unverifiable claim that weakens the slide. Grounding the decision in a structural principle removes the dependency on that soft social proof. The decision stands on its own logic.

---

## 2. The design principle the accepted direction expresses — and how to phrase it as conviction, not taste

**The principle: Direct manipulation.** The user should act on the object itself, not on a proxy for it. Editing controls live where the content lives. You click the image to annotate the image. You tag the tooth in the finding, not in a list elsewhere. The sidebar direction violated this — you edited in one place and watched the result happen somewhere else. That cognitive gap (control here, effect over there) is the same class of problem as the blank-page problem: it makes the doctor manage the software instead of the software serving the doctor.

How to phrase it as conviction rather than taste:

Avoid: "I felt the in-place option was cleaner / more intuitive / better."
Avoid: "The majority preferred Option 2."
Avoid: "Option 1 had too many steps."

Use: "The sidebar direction broke the connection between action and content — you edited in one place and saw the effect somewhere else. That's the same friction the old tool created. I needed the control to live on the thing it changes."

That is a sentence of conviction. It names the failure mode (broken connection), ties it back to the original problem (same friction), and states a non-negotiable principle (control lives on the thing it changes). There is no "I felt" in it. It does not need social proof. A hiring manager reading it understands the reasoning even if they have never heard the term "direct manipulation."

---

## 3. The single strongest one-line framing for the slide

**"The sidebar separates control from content. I needed them on the same surface."**

This works because: (a) it names the specific failure of Direction 1 without labeling it "rejected" before explaining why; (b) it states the standard Direction 2 meets in a single breath; (c) it is immediately understandable to a non-designer; (d) it does not use jargon, but a UX-literate reader will recognize the direct-manipulation principle behind it.

Alternative if the title field carries this line and the description must be distinct:
Title: **"Where you edit changes what you can do"**
That frames the decision as consequential rather than aesthetic — the location of editing is a functional choice, not a layout preference.

---

## 4. Proposed copy — within the ~90-word directions budget

**`description` (the process narration under the Ideation title):**

> After setting the goals, I built two directions for the editing experience — one sidebar-driven, one in-place — and compared them. The in-place direction was the clear call: it kept the control on the content it changed. I took it forward.

Notes: 44 words. First-person. States the process (two built, compared), names the real distinction (sidebar vs. in-place, not feature richness), gives the reasoning (control stays with content), avoids the unverifiable "majority preferred" claim. The verify checklist should carry: [ADD: how directions were tested / who compared them].

---

**`dir1Desc` (Direction 1 — rejected):**

> Edit from the sidebar. Controls live in a left-rail panel — you select a section there and fill in the fields. The main canvas is a read-only preview. What you type in the sidebar appears over there. The control and the content it changes are in different places.

Notes: 44 words. Describes the mechanic precisely without judgment. "Read-only preview" and "different places" make the problem self-evident — the label "rejected" becomes obviously deserved without the slide telling the reader what to think.

---

**`dir2Desc` (Direction 2 — accepted):**

> Edit on the content. Each image carries Annotate and Replace controls directly on it. Tooth tags, title, and notes sit immediately under the same image. You never leave the finding to edit the finding — the control is on the thing it changes.

Notes: 41 words. Describes the mechanic precisely. "You never leave the finding to edit the finding" is the payoff line — it names the direct-manipulation principle in plain English without using the term. Echoes the dir1Desc structure so the contrast is clean.

---

**Combined word count check:** description (44) + dir1Desc (44) + dir2Desc (41) = 129 words across three fields. The ~90-word budget applies to words on screen; the `directions` template renders the title, two direction descs, and the description. The title ("Two directions I weighed" or equivalent, ~5 words) + dir1Desc (44) + dir2Desc (41) + status chips (non-prose) + description (44) = 134 prose words total. That is over the ~90-word budget for this template.

**Trimmed versions to fit budget:**

`description` (cut to 30 words):
> After setting the goals, I explored two editing directions and compared them. The in-place approach was the clear call — the control stays on the content it changes.

`dir1Desc` (cut to 25 words):
> Edit from the sidebar. Controls live in a separate left-rail panel; the canvas is a read-only preview. The control and the content it changes are in different places.

`dir2Desc` (cut to 25 words):
> Edit on the content. Controls, tooth tags, and notes sit directly on each image. You never leave the finding to edit the finding.

**Trimmed total: 30 + 25 + 25 + title (~5) = ~85 words.** Within budget.

---

## On the "Wondering whether to add" items

**User journey / user flow slide:** Keep it — but only if it shows a decision the final flow answers, not just a documentation artifact. If the flow diagram was used to evaluate which editing template created fewer steps (sidebar direction vs. in-place direction), that is the most compelling use of a flow slide in this deck: it would make the Slide 4 decision quantitatively legible, not just principled. Place it between Goals (Slide 3) and Ideation (Slide 4). If the diagram was produced after the decision was made (as documentation), cut it — it belongs in a handoff doc, not a case study. [ADD: confirm whether the flow was used to evaluate directions or produced post-decision.]

**Descriptions after titles on other slides:** Yes, selectively. The `description` field on the `directions` slide is doing essential work here — it narrates the process so the reader isn't left to infer it. The same applies anywhere the slide title is a label ("Annotation & Tooth Chart") rather than a claim ("Show, don't describe"). Slides 6 and 7 both have strong `highlight` lines that are doing the persuasion work, but neither has a `description` that narrates HOW the decision was made. That is the gap the reflection on Slide 11 partially covers — but it's too late by then. Short description lines (one sentence) on Slides 6 and 7 connecting back to the goals ("This is Goal 3 in practice") would strengthen the through-line without blowing the budget.
