# Case Study Brief — <project name>

Copy this file to `cases/briefs/<name>.md` and fill it in, then run
`create case study <name>` (or `create <name>`). The `case-study-author` agent
reads THIS file to build a brand-new, correctly-typed deck on the existing slide
templates. Write in your own words — the copy-writer pass fixes the voice later.

**How to use it:**
- Fill what you know; leave a line blank or write `?` where you don't. The author
  drafts a plausible placeholder and lists it for you to confirm — it never
  fabricates a number as if it were measured.
- Be specific (real users, real failure points, real numbers). Specificity is what
  separates a Senior deck from a generic one.
- You do NOT add images here. List them in the **Asset inventory** at the bottom;
  the author leaves captioned empty slots and you drop the real files in via the
  app's edit mode afterward.

---

## 1. Title & summary
- **Title:** <the deck title — shows on the cover; supports a line break with \n>
- **One-line summary:** <one sentence: who you helped + what changed>
- **Category:** <e.g. Clinical UX · SaaS · Mobile> (optional)

## 2. The problem
- **Who had the problem:** <the specific user/role>
- **What was broken:** <the failure point — be concrete>
- **Why it mattered:** <impact on the user AND the business>
- **Evidence it was real:** <a number, a quote, an observation — anything you have>

## 3. Role & context  (→ becomes the intro `metaItems`)
- **My role:** <e.g. Lead Product Designer — own the verbs>
- **Timeline:** <e.g. 8 weeks · Q1 2025>
- **Team:** <e.g. 1 PM · 2 engineers · 1 researcher>
- **Tools:** <e.g. Figma · Maze · Notion>

## 4. What I did
- **Research:** <methods, sample size, timeframe — e.g. "8 semi-structured
  interviews with physiotherapists over 2 weeks">
- **Key insights (max 3):** <each non-obvious, each led to a decision>
- **Key decisions + why:** <the 2–3 decisions that mattered, each with its reason>
- **An iteration that failed:** <what V1 got wrong and what changed in V2 — this is
  the single strongest seniority signal; include it if you have it>
- **Exploration / directions considered:** <alternatives you weighed + why you
  picked one> (optional)

## 5. Outcome & impact
- **What changed:** <metric from X → Y over timeframe, OR an honest qualitative
  result. If it's concept / NDA / not measured, say so plainly — don't invent a number>
- **How it ties back to the problem:** <close the loop>

## 6. Reflection
- **What I learned:** <one real lesson>
- **What I'd do differently:** <name one design decision, not a process step>

## 7. Positioning override  (optional)
Leave blank to use `cases/reviews/_designer-profile.md` as-is. Fill only if THIS
study should signal something different (e.g. a different role/industry target).
- <override note>

## 8. Asset inventory
List everything you have. The author maps each to a slide and leaves a captioned
empty image slot; you add the real file in edit mode. If a file is already placed
under `public/case-studies/<slug>/`, give its path and the author wires it in.

| Asset (describe it) | Type (video / image / flow / diagram / screenshot) | Which beat/slide it supports | Path (if already placed) |
|---|---|---|---|
| <e.g. screen-recording of the old rescan flow> | video | Problem | |
| <e.g. before/after of the report screen> | image | Final solution | |
| <e.g. user-flow diagram> | flow | Process / exploration | |
| | | | |

---

### The 10 beats the author aims to cover
1. Cover  2. Problem  3. Research  4. Key insights  5. Design exploration
6. Iteration evidence  7. Final solution  8. Outcome / impact  9. Process timeline
10. Reflection

A beat your brief doesn't cover still gets a real placeholder slide (the right
template, a drafted body) — flagged in `author-summary.md` so you can fill or cut it.
