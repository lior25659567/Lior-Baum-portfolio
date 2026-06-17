# Director Memo — Toolbar Arc Slide Addition Proposal

**Proposal:** Add two slides to the Scan toolbar arc — a question/research framing slide (Slide A) and an external references/inspiration slide (Slide B).

---

## 1. Is this a strong addition for a Senior SaaS target?

**Slide A (the design question): Yes — conditional.**
Framing the icon problem as an explicit question before solving it is a good storytelling move. Right now, the transition from Slide 17 (toolbar placement decided, icon problem surfaces in the last line) to Slide 18 (unified icon system) is the weakest seam in the Scan arc. A reader jumps from "placement is fixed" to "here is the finished icon system" with no visible thinking in between. That gap reads as mid-level: the solution appeared, the designer didn't make the reasoning visible. A short bridging slide that names the icon problem as a distinct design question, and what criteria I was solving for, closes that gap and signals Senior-level diagnostic clarity.

**Slide B (external references/competitive benchmarking): Qualified yes — with a strong caveat.**
Showing you looked at how other products solved a similar problem is a legitimate Senior signal. It demonstrates that you treated this as a design problem worth researching, not just a visual styling choice. For a SaaS audience (the profile target), benchmarking against products with unified command surfaces is directly legible — these are products they know. Done right, this slide shows design judgment: "I studied how Figma, Sketch, and [ADD: third reference] handled tool density, and here's what I took from each."

The caveat: it only helps if you name what you learned and how it shaped the decision. A slide that shows three screenshots with no explicit takeaway reads as a mood board, not as research. A mood board is a junior signal. Make each reference do one specific job — name the principle it illustrated, not just the product.

**Net verdict: Add both. Neither is decorative — they fill a real reasoning gap in the arc.**

---

## 2. Placement

**The designer's instinct (after Slide 16 "Before") is wrong.** Here's why: the icon problem has not been introduced yet at Slide 16. Slide 16 identifies scattered icons and no shared visual language as symptoms. Slide 17 (placement exploration) ends with one line acknowledging the icon problem: "With placement settled, the icon problem surfaced." That is the moment the icon problem is formally named as a distinct challenge. Slides A and B answer that named problem — they belong after it.

**Recommended order:**

| Position | Slide |
|---|---|
| 16 | Scan Toolbar — Before (current) |
| 17 | Toolbar — Exploration / placement (current) |
| **NEW A** | **The icon problem — design question** |
| **NEW B** | **Reference benchmarks — what good looks like** |
| 18 | Scan Toolbar — After (current) |

This reads as a complete sub-arc: problem → placement solved, icon problem named → question framed → external reference → solution. Each slide sets up the next. The "after" slide (18) lands as the earned conclusion to this sub-arc, not as an arbitrary jump from placement to finished icons.

---

## 3. Template recommendation

**Slide A — use `textAndImage` (type: `problem`).**
Not `media`. Not `directions`. The content here is a framing statement and design criteria — text-led, not image-led. The `textAndImage` template handles this exactly: a label, title, a 1–2 sentence content block, and a short bullet list of criteria. An image slot is optional (could hold a close-up of the fragmented old icons to make the icon problem concrete). `directions` is wrong here — it renders accepted/rejected chips, which only fits your own explored options.

**Slide B — use `media` (3-image mode).**
Not `directions`. The designer's guess of `directions` is the wrong call. `directions` renders accepted/rejected chip labels — it means "these are options I tried, one won." External reference products are not options you tried and rejected; they are inputs that informed your thinking. The `media` template supports up to 3 images via DynamicImages, takes a label, title, description, and per-image captions. That maps exactly to three reference product screenshots with a one-line caption each naming the specific principle each reference illustrated. `imageMosaic` is ruled out — it's a visual-gallery template with minimal text, and the text is where the seniority signal lives here.

---

## 4. Draft copy

### Slide A — `textAndImage`

```
label:         Icon System — The Problem

title:         Placement was solved. The icons weren't.

content:       The toolbar had a home, but the tools inside it were still built from
               different eras — different line weights, different styles, no shared
               conventions. A clinician who found the toolbar still had to remember
               what each icon meant.

issuesTitle:   What I needed to solve

issues:
  - Every icon from a different era, no shared visual language
  - No convention for adding new tools without creating new inconsistencies
  - Labeled names not yet part of the system — recall still required
```

Optional image slot: a tight crop of the old icon set side by side, making the style fragmentation visible. Caption: `Old toolbar icons — mixed line weights, inconsistent style across tools.`

Word count is lean by design — this is a bridging slide, not a feature slide. It names the problem, sets the criteria, and hands off to the reference slide.

---

### Slide B — `media` (3 images)

```
label:         Icon System — Research

title:         Three products that unified many tools into one place

description:   Before designing the icon system, I looked at how products with similar
               tool density had solved the same problem — consistent style across many
               tools, immediately readable at a glance.
```

**Per-image captions (3 slots):**

```
Image 1 caption:  [ADD: name of reference product 1] — [ADD: the specific principle
                  this product illustrated, e.g., "consistent line weight across 30+
                  tools, each readable at 20px"]

Image 2 caption:  [ADD: name of reference product 2] — [ADD: the specific principle,
                  e.g., "labeled icons as default — no hover required to understand
                  the tool"]

Image 3 caption:  [ADD: name of reference product 3] — [ADD: the specific principle,
                  e.g., "grouped tools by function, not by era of addition"]
```

The captions are the most important part of this slide. Each one must name a principle you took from the reference, not just the product name. Without that, it is a mood board. The designer must supply the real product names and the specific principle each one illustrated — those details cannot be fabricated.

---

## What to watch

- **Word budget.** Both slides are bridging slides, not feature slides. Keep them lean. Slide A is carrying a framing statement and 3 bullets — that fits in ~60 words. Slide B is largely visual — the description should be one sentence, and the signal lives in the captions, not the prose.
- **Voice on Slide B.** Do not write "I found inspiration in..." or "These products informed my thinking holistically." Write it as what you observed and extracted: "Figma's toolbar keeps consistent 1.5px line weight across every tool. That's the standard I set for the icon rebuild."
- **The `directions` template stays at Slide 17.** The placement exploration (3 positions tested, 2 rejected, 1 accepted) is exactly what `directions` was built for. Don't retype it.
