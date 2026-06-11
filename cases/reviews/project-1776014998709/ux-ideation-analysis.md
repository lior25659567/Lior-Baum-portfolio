# Ideation Slide — UX Analysis: Direction 1 vs Direction 2

## 1. Why Direction 2 is the Stronger Choice

The core problem in Direction 1 is not aesthetic — it is cognitive architecture. When
controls live in a sidebar and the thing they affect is a separate panel, the user must
perform a mental translation on every single edit: "I am changing X in this list over
here, but the result appears over there on the canvas." This is a textbook violation of
direct manipulation — the foundational interaction principle that says controls should
be co-located with the object they affect, not separated from it.

Don Norman calls this the Gulf of Evaluation: the distance between performing an action
and seeing its effect. In Direction 1, that gulf is physical. The doctor opens a "Content"
list in a sidebar, edits Image 1's fields there, then has to shift gaze to the main canvas
to see what changed. Every edit requires two attentional moves: act here, look there. For
a professional doing this across a multi-image report — potentially mid-patient
consultation — that double-look is friction compounded.

There is also a Gulf of Execution problem: the sidebar abstraction makes it non-obvious
that editing "Image 1 ›" in a list IS the same as changing the image card the doctor is
already looking at on the canvas. The connection between "the thing I want to change" and
"where I go to change it" is not self-evident. The doctor has to learn the mapping, keep
it in working memory, and apply it every time.

Direction 2 dissolves both gulfs in a single architectural decision. The Annotate / Replace
controls appear directly on the image. The tooth tags render immediately beneath it. The
Title and Notes fields sit right below that same image. The distance between "I see this
finding" and "I change this finding" is zero. No sidebar to open, no mental map to maintain,
no gaze shift between control and preview. You are editing the thing, not editing a
representation of the thing in a different panel.

This matters more than usual in this specific product context. The deck's third goal is
explicitly "make findings visual / show, don't describe." Direction 2 enacts that principle
at the interaction level — the editing experience itself is visual and direct, not
list-based and abstract. Direction 1 would have been a structural contradiction: asking
doctors to make reports more visual while giving them a text-list sidebar to drive it.
The tool's philosophy and the editing mechanic would have been pointing in opposite
directions.

There is a secondary benefit worth naming: fewer steps. In Direction 1, to annotate an
image you open a sidebar section, find the right image entry, add your note, then check
the canvas. In Direction 2, you click on the image and annotate it. One gesture,
one context. The step reduction is not marginal — it compounds across every finding in a
multi-image report.

The annotation feature that Direction 2 makes obvious (Annotate button directly on the
image) also has discoverability built in. In Direction 1, annotation capabilities buried
inside a sidebar section are easy to miss — the doctor may not even know they exist. In
Direction 2, the control is sitting on the image the moment the doctor looks at it.
Feature discovery becomes a side effect of good co-location.

## 2. The Sharpest One-Sentence Framing

Direction 1 forces doctors to edit a list about the image while looking at the image;
Direction 2 lets them edit the image itself — the sidebar abstraction was a layer of
indirection the tool didn't earn.

## 3. Proposed Copy for Slide 4 (`directions` template)

These are written within the ~90-word on-screen total budget (description + dir1Desc +
dir2Desc combined). Voice is first-person, Lior's — warm, decided, no fabricated metrics.
"The majority preferred" is treated as the designer's own claim and left in soft form,
per context.md.

---

### `description` (process intro, under the Ideation title)

> After setting the goals, I built two editor directions to answer one question: where
> should editing happen? I tested both with doctors, and the second was the clear
> preference — so I took it forward.

*(38 words — leaves ~52 words for the two direction descriptions.)*

---

### `dir1Desc` (Direction 1 — REJECTED, sidebar editing)

> Edit from the sidebar. Controls live in a left-rail list — you open a section, change
> it there, and see the result on the canvas. The doctor has to look in one place to edit
> and another to see what changed.

*(44 words)*

---

### `dir2Desc` (Direction 2 — ACCEPTED, edit in place)

> Edit on the content. Annotate and replace buttons sit directly on the image; tooth tags,
> title, and notes sit right beneath it. You change the finding exactly where you're
> looking at it — no sidebar, no context switch.

*(41 words)*

---

**Total on-screen word count (all three fields): 38 + 44 + 41 = 123 words.**

That is over the ~90-word budget. Below is a tighter version that fits:

---

### Tight version (budget-aware)

**`description`** (~22 words):
> After setting the goals, I built two editor directions and tested them with doctors.
> The second was the clear preference.

**`dir1Desc`** (~32 words):
> Edit from the sidebar. Controls live in a left-rail list — you change a section there,
> then look at the canvas to see the result. The control is not on the thing it changes.

**`dir2Desc`** (~33 words):
> Edit on the content. Annotate, replace, tag teeth, title, and notes — all directly on
> the image. You change a finding exactly where you're looking at it. No sidebar, no
> context switch.

**Total: 87 words — within budget.**

---

## Verify before sending

- "I tested both with doctors" — confirm whether this was a formal session, informal
  walkthrough, or a design critique. If no real testing happened, soften to
  "I compared both and the second fit the goals better." Never leave an implied test
  that didn't occur.
- "The second was the clear preference" / "the majority preferred" — confirm who
  preferred it, in what context. If a participant count or test type can be cited, add it.
  If not, the softer phrasing above is safer.
