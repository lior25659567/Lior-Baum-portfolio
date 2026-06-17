# Toolbar Slides A + B — Proposal Assessment

_Focused memo: craft, template fit, placement, and drafted copy for two proposed slides to insert into the Scan Toolbar arc (Slides 16–18)._

---

## 1. Craft / Process Value — Keep Both, With Conditions

**Slide A (question / framing):** Add it. The current arc jumps from "icons scattered, no home" (Slide 16) straight to "I tested three placements" (Slide 17). The icon unification problem — that the scattered icons had no shared visual language, not just no shared location — gets folded into one throwaway line in Slide 16's `content` and again as a one-liner tagged on at the end of Slide 17's accepted direction ("Fixing placement exposed the icon problem…"). That is the right diagnosis, but it is doing too much work as a parenthetical. A short framing slide that names the icon-system problem explicitly, before the exploration, gives the icon redesign its own causality. Without it, the unified icon system in Slide 18 looks like a byproduct of toolbar placement work rather than a separate design decision that placement work revealed.

The framing question the designer proposed — "How do we pull scattered icons and buttons into one unified visual direction?" — is close but still too abstract. Keep the structure, sharpen the copy (see Section 4 below).

**Slide B (references / inspiration):** Add it, but only if the references do real work. The risk is it reads as a mood board inserted to make the process look more thorough. It earns its place only if the references are specific — named products, specific UI patterns they demonstrated — and if the copy connects them explicitly to the decision made on Slide 18. If the images are generic "good toolbars from big companies," cut the slide and fold a single sentence ("I looked at how [Product] handled…") into Slide A or Slide 18. Subject to that condition, the references slide belongs: it shows that the icon direction came from a considered look at what consistent icon systems actually look like in production tools used by clinicians or adjacent professionals, not from aesthetic preference alone.

**No duplication risk, if positioned correctly.** Slide 18 describes the outcome (unified icon system, what changed). Slide A frames the question (why icons needed attention at all). Slide B shows external references (what informed the direction). They tell different parts of the same story. The only overlap to watch: Slide 17's final accepted direction already says "a correctly placed toolbar with unmemorable icons was still broken." Slide A should not repeat that sentence — it should pick up from it.

---

## 2. Template Fit

**Slide A — the framing question.**
The designer's note didn't name a template. The content is: a framing observation that the icon problem needed its own answer, expressed as a question or insight, with no image needed.

Recommendation: `textAndImage` (type `problem`), image left empty. It's a focused insight slide — one declarative sentence as the title, two or three bullets naming the specific problems with the icon set, and a `highlight` carrying the design question that drove the work. Budget ~75 words.

Do not use `testimonial` — there is no external quote. Do not use `quotes` — the content is a design insight, not user research. Do not use `directions` — no options to show.

**Slide B — references / inspiration.**
The designer guessed `directions`. That is wrong. `directions` is specifically for accepted/rejected exploration options (it renders accepted/rejected chips). External references are not directions in this sense — they have no accept/reject verdict.

The right template depends on how the images are presented:

- If the references are shown side by side with brief captions and no prose-heavy explanation: **`media`** with up to 3 images. Budget ~35 words. The `media` template's `DynamicImages` supports up to 3 media items with individual captions — exactly right for three reference screenshots, each labeled by product name and what it demonstrates.
- If each reference needs a sentence of explanation that won't fit a caption: **`imageMosaic`** is too sparse (only ~8 words budget, title only). So `media` is the better fit — captions can do the explaining.

**Verdict: Slide B = `media` template, 3 images, labeled captions.**

---

## 3. Placement

Current arc:
- Slide 16: Scan Toolbar — Before (the problem: scattered icons, no home)
- Slide 17: Toolbar — Exploration (3 placements tested)
- Slide 18: Scan Toolbar — After (unified toolbar + icon system)

**Proposed: insert A and B between Slide 16 and Slide 17.**

This is correct. The story logic is:

1. **Slide 16** — "The icons were scattered, no visual language, no home." (The problem is named.)
2. **Slide A** — "Placement and icons were two separate problems. I tackled placement first, but I needed a clear answer to the icon problem too." (The question is framed.)
3. **Slide B** — "I looked at [reference products] to understand what a consistent icon system looked like in a real clinical/professional tool." (The inspiration is shown.)
4. **Slide 17** — "I tested three placements during live scanning." (Placement exploration, now clearly one of two tracks.)
5. **Slide 18** — "One toolbar, one visual language — the result of solving both." (Resolution.)

Do not place A and B between Slide 17 and Slide 18. That breaks the `directions` slide logic: Slide 17's final accepted-direction text already bridges to the icon problem. If references follow after that, the reader sees: accepted placement → references → icon outcome, which reads as: "I picked the placement, then went and did more research, then landed on icons." The causal chain feels backwards. The references informed the icon direction; they belong before the placement exploration kicks off.

---

## 4. Drafted Copy

Both slides are written in voice (product detail first, no taglines, first person). Unknown facts → `[ADD: …]`.

---

### Slide A — `textAndImage` (type: `problem`)

```
label:        Icon System — Problem
title:        Placement wasn't the only thing broken
content:      Once the toolbar had a home, the icon problem was impossible to ignore.
              The icons were built by different teams at different times — each one
              made sense in isolation, but together they shared nothing.
issuesTitle:  What the icons lacked
issues:
  - No consistent line weight or stroke style
  - No shared visual logic across toolbar and procedure icons
  - Clinicians had to memorise each icon's meaning — nothing was self-explanatory
highlight:    The question wasn't "which icons look better" — it was "what would
              make every tool readable on first contact, without labels as a crutch."
```

Word count estimate: approximately 65–70 words. Within the ~75 word budget.

No image needed on this slide. The text carries the reasoning; the next slide (B) provides the visual reference.

---

### Slide B — `media` template, 3 images

```
label:        Icon System — References
title:        What consistent icon systems look like in practice
description:  Before drawing anything, I looked at tools where icon systems work —
              products that consolidate many actions into one surface without
              requiring memorisation.
image:        [3 image slots via DynamicImages]

Image caption 1:  [ADD: product name] — [ADD: describe the specific visual pattern
                  that informed the iTero direction, e.g. consistent stroke weight,
                  labeled icon groups, or collapsible tool panels]
Image caption 2:  [ADD: product name] — [ADD: describe the specific visual pattern]
Image caption 3:  [ADD: product name] — [ADD: describe the specific visual pattern]
```

Word count for prose fields: approximately 30 words. Within the ~35 word budget for `media`.

Notes on the captions: each caption must name the product and name the specific pattern it demonstrated. Generic captions ("Good toolbar example") defeat the purpose. If the designer cannot name specific products used as references, the slide should be cut — do not invent references.

---

## 5. Conditions Summary

| Condition | Consequence |
|---|---|
| Slide A copy must NOT repeat Slide 17's "unmemorable icons was still broken" sentence | Either rephrase or remove the bridge from Slide 17's accepted-direction text |
| Slide B captions must name real products and real patterns | If references aren't documented, cut Slide B |
| Slide B must use `media`, not `directions` | `directions` renders accepted/rejected chips — wrong for external reference screenshots |
| Both slides insert BEFORE Slide 17, not between 17 and 18 | Post-Slide-17 placement reverses the causality of the references |
