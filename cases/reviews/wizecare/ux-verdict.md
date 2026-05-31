# WizeCare — UX Review Verdict

Reviewer: Principal UX Designer
Case: Reducing Clinician Friction in Home Physical Therapy (WizeCare, B2B SaaS desktop dashboard)
Slides assessed: 17

---

### Problem Framing Quality
Score: 7/10

The framing is genuinely strong where it is complete. "Physiotherapists lose 30% of their day to administrative friction" is a specific, quantified, business-relevant problem statement — it names the user (physiotherapists), the cost (a third of the workday), and the mechanism (administrative friction). Slide 1 grounds it in a concrete persona ("Sarah," 12+ patients/day, three disconnected systems) and a vivid in-context quote ("I waste 15 minutes per patient hunting through screens. By lunch I'm already behind schedule"). That is exactly the altitude a senior framing should hit: a real failure point, a real user, a real consequence.

The framing also shows judgment in the highlight: "The system had to feel like a time-saver from day one — not another administrative burden." That reframes the design constraint as an adoption risk, which is mature.

What holds the score back:
- The single most important framing artifact — the **intro description (Slide 0)** — is almost entirely `[FILL IN]` placeholders: role, timeline, clinician/clinic counts, and the headline outcome are all blank. A reviewer cannot infer seniority in the first three lines, which is the entire job of the cover. This is the difference between a 7 and a 9.
- Success metrics appear only at the end (Slide 15). There is no evidence they were defined *before* designing. Stating the target metrics up front (e.g., "we set out to cut per-session time by X") would convert this from post-hoc reporting to deliberate problem-solving.
- The 30% figure is asserted without a source on the slide. If it came from the ticket/observation data, say so where the claim is made.

---

### Research Rigor
Score: 7/10

This is the standout dimension of the case, and it is unusually specific for a portfolio: **6 clinic observations, 12 provider interviews, and 89 support tickets analyzed over 8 weeks** (Slide 2). The mix matters — contextual observation + interviews + a quantitative ticket corpus is real triangulation, not one round of five interviews dressed up as "extensive research." Naming 89 tickets specifically signals the designer actually did the analytics-adjacent work most portfolios skip.

The research also visibly *changed direction*: the insight that "clinicians had normalized broken workflows" (Slide 3) and weren't self-reporting problems led the team to **observe workflows directly rather than trust self-reported pain points** (Slide 4, implication 1). That is a textbook example of research altering method — strong senior evidence.

What undercuts it:
- The numbers are **inconsistent across slides**. Slide 2 says 6 observations / 12 interviews; Slide 3 says "6 clinic visits and 8 interviews"; Slide 4's `methods` field is `[FILL IN]`; the two `process` slides (6, 14) leave clinic and clinician counts blank. A reviewer who notices 12 vs. 8 will question the rigor the case is otherwise earning. Pick the true numbers and make them identical everywhere.
- The synthesis method is unstated. Slide 4's `synthesisApproach` is `[FILL IN]` — there is no affinity map, thematic coding description, or workshop named. We're told three breakdown points "surfaced," but not *how* 89 tickets + 18-ish sessions became those three.
- Slide 4's third finding's evidence is a blank placeholder, so one of the three headline findings has no supporting data shown.

---

### Synthesis & Insight Quality
Score: 7/10

The sharpest insight in the deck — and it is genuinely sharp — is:

> "Clinicians accept friction as routine, not a solvable problem... years of daily use had made the friction invisible." (Slides 3–4)

That is a real insight, not an observation. It explains *why* the research had to be observational and *why* feature requests from users would have been misleading. It distinguishes what happened (workarounds exist) from what it means (the users won't report them, so you must watch). Most mid-level portfolios never make that leap.

The second insight — "tools must remove steps, not add them" — is solid and correctly drives the design principle of consolidation over feature-richness.

Where it falls short of a top score:
- The third "finding" ("Three critical breakdown points identified") is not an insight — it's a summary of observations, and its evidence field is empty. Two real insights plus one filler reduces the punch.
- There is **no synthesis artifact** shown anywhere (affinity map, journey map, HMW statements). The thinking is clearly there in prose, but the case tells rather than shows the synthesis. A single affinity-cluster visual would lift this materially.
- The line from insight → principle → specific design move is implied but never drawn explicitly as a chain. The goals slide (5) does the best job of this with its constraints.

---

### Design Decision Depth
Score: 7/10

This is where the designer reads as more than mid-level. The decisions are explained *with reasoning and tradeoffs*, which is rare:

- **Goals carry explicit constraints** (Slide 5): "therapists need 6+ data points visible at a glance, so we couldn't hide information—only reorganize it"; "preserve flexibility... without rebuilding the backend in our 12-week timeline." Naming constraints alongside goals is a senior tell — it shows the designer worked inside real engineering and time limits.
- **Care plan editing (Slide 10):** "Inline editing replaced modal overlays because therapists said 'I lose context when things pop up.'" That ties a specific UI decision directly to a research quote. The acknowledged tradeoff — "I sacrificed custom animation options for exercises to ship within [timeline]" — is exactly the kind of honest sacrifice reviewers look for.
- **Protocol Builder (Slide 13):** reusing the card system across both flows "meant the new builder felt familiar from day one" — a deliberate consistency decision justified by reusing existing mental models, with the Kanban choice mapped to three specific pain points.

What's missing and capping the score:
- **No design exploration / divergence is shown.** The case jumps from research to polished before/after comparisons. There is no `directions` ("Ideation") slide showing alternatives considered and rejected. We see *what* was built and *why it's good*, but not *what else was on the table*. Without that, the chosen solutions can read as the only options the designer saw — which weakens the judgment story even though the rationale is good.
- **No iteration evidence.** There is no V1-failed → learned → V2-fixed beat. The before/afters are old-system vs. new-design, not design-iteration. For a case this otherwise mature, the absence of "the first version of my redesign failed because…" is the biggest gap in seniority signal.
- Several rationales still hinge on `[FILL IN]` validation metrics (Slides 10, 13), so the decision→evidence link is promised but not delivered.

---

### Craft Quality
Score: 6/10

Craft here is judged from the writing and structure, since the deck text is what's provided (images are placeholders). On that basis:

Strengths:
- Titles do real work and carry voice: "Editing a plan shouldn't require a map — so I flattened it into one screen" and "Protocol Builder — why we replaced templates with a drag-and-drop Kanban" are decision-led headlines, not labels. That is good editorial craft.
- The before/after descriptions are concrete and consistently structured (problem → mechanism → consequence), and captions explain *why* not just *what* ("adherence data now appears where therapists look first").
- The chapter dividers (Slides 7, 9, 11) give the deck a clean three-act spine (Patient Management → Care Plan Editing → Protocol Builder), which is well-organized for a long case.

Weaknesses:
- **A first-person voice inconsistency:** the case switches between "we" (most slides) and "I" (Slides 10, 13). For a portfolio, ambiguity about *your* contribution vs. the team's is a real positioning risk — decide and standardize.
- **Duplicate process slide.** Slides 6 and 14 are *identical* ("How we validated the redesign," same three sections, same `[FILL IN]`s). One is redundant.
- Visual hierarchy, spacing, and interaction craft cannot be fully assessed because the images are placeholders — but the deck *claims* strong hierarchy outcomes, so the screens must deliver on that or the narrative collapses.

---

### Impact Evidence
Score: 5/10

The outcomes slide (15) is quantified and outcome-oriented rather than activity-oriented, which is the right instinct:
- 10–15 min saved per session
- 75% reduction in misclicks (prescription errors)
- 80% daily active usage among previous non-users
- 55% drop in support tickets (first month)

These map cleanly back to the original problem (the 30% admin-time loss, the three breakdowns, adoption risk), and "misclicks → prescription errors" and "support tickets" tie to *outcomes that matter clinically and commercially*, not vanity clicks. That's good.

But credibility is thin:
- The metrics are hedged with soft sourcing: "per stakeholder report," "baseline observed in usability tests" — with **no sample sizes, no n, no timeframe beyond "first month," and no before/after baseline numbers.** 75% and 80% are striking precisely because they're large; large numbers with no denominator invite skepticism from a senior reviewer.
- Across the deck, *every* validation metric in the decision slides (10, 13) and *both* process slides are `[FILL IN]`. So the impact slide asserts results the rest of the case never substantiates with method. The 75%/80% figures float free of the testing that supposedly produced them.
- There is **no reflection slide**, so there's no honest accounting of what *couldn't* be measured — which, paradoxically, would make the measured numbers more believable.

The instinct is senior; the substantiation is junior. That gap is the single biggest risk to the case's credibility.

---

### Template Fit & Structure

**Per-slide template fit:**

- **Slide 0 — `intro`:** Correct template, badly under-filled. Required `metaItems` (Role/Timeline/Team/Tools) and the `headlineMetric` are missing — exactly the fields that front-load seniority. The template is right; the content is a skeleton. Fix the content, not the type.
- **Slide 1 — `problem` (textAndImage):** Good fit. Persona + in-context quote + highlight is exactly what this template is for.
- **Slide 2 — `issuesBreakdown`:** Excellent fit. Three numbered, titled, described breakdown points is the canonical use. Keep.
- **Slide 3 — `problem` (textAndImage):** Acceptable, but **overlaps heavily with Slide 4**. Both cover "clinicians normalized broken workflows." This is a redundancy, not a template error (see below).
- **Slide 4 — `researchFindings` (NOT in catalog):** **Flag.** This type is not a documented template, so in the live system it will fall back to default rendering and miss the canvas-mode typography overrides — a real maintenance/visual risk per the project's own rules. More importantly, its content (insight + evidence-quote + implication, ×3) is a textbook **`quotes`** or **`issuesBreakdown`** payload. My recommendation: **convert to `quotes`** — the evidence fields are literally pull-quotes ("Same frustrations across every clinic — accepted as part of the routine"), and the `quotes` template is built to present 2–4 research quotes in cards with an intro carrying the insight. If the designer wants insight→implication structure preserved, `issuesBreakdown` (insight as title, implication as description) is the second-best documented fit. Either way, **stop using `researchFindings`** — it's an undocumented type that breaks the design system's coverage guarantees.
- **Slide 5 — `goals`:** Correct and well-used (numbered goals + constraints). Keep.
- **Slide 6 — `process`:** Correct template, but **duplicate of Slide 14** and entirely `[FILL IN]`. See removals.
- **Slides 7, 9, 11 — `chapter`:** Correct. Clean section dividers. Keep all three.
- **Slides 8, 10, 13 — `comparison`:** Correct and strong fit. Before/after with descriptions + decision highlight is the intended use.
- **Slide 12 — `testimonial`:** Right template for a single standout quote, **but the content is mis-positioned.** It's a paraphrased research finding ("Physiotherapists prefer to create their own protocols…") attributed to "Clinic interviews," not a real named person. `testimonial` is strongest with an attributed human quote. This content is really a *research insight* and would sit better as the intro `content` of the Protocol Builder section or folded into the (converted) `quotes` slide. As-is it's a slightly weak testimonial because there's no person behind it.
- **Slide 14 — `process`:** Duplicate of Slide 6. Remove one.
- **Slide 15 — `outcomes`:** Correct template, right choice (qualitative + metric cards). Keep.
- **Slide 16 — `end`:** Correct. Keep.

**Missing canonical beats (judged against the 10):**

1. **Design Exploration / Ideation — MISSING.** Add a `directions` ("Ideation") slide between Define (Slide 5) and the chapters. It must show 2–3 explored directions for at least one of the three problems (most naturally the Protocol Builder) with accepted/rejected status and one-line rationale each. This is the case's biggest structural hole — right now solutions appear without alternatives.
2. **Iteration Evidence — MISSING.** Add a `comparison` (or `media`) slide showing a *design* iteration, not old-vs-new system: a V1 of the redesign that failed in testing and the V2 that fixed it. The case repeatedly references usability tests; surface one finding that *changed* a design.
3. **Reflection — MISSING and required above mid-level.** Add a `reflection` slide before `end`: whatWorked, whatFailed, whatYoudDoDifferently, and crucially `whatYouCouldntMeasure` (e.g., long-term retention, whether the 80% adoption holds past month one). Its absence is the clearest junior tell in an otherwise mature deck.

**Slides to remove or merge:**

- **Remove one of Slides 6 / 14** — they are identical duplicate `process` slides. Keep a single, fully-filled one and place it before the chapters (process belongs before solutions, not buried at Slide 14).
- **Merge Slides 3 and 4** — both make the "normalized friction" point. Collapse into one beat: keep the insight from Slide 3 as framing and the evidence/implication structure from Slide 4 (re-typed as `quotes`). Two slides currently say one thing.

Net: the deck would *shrink* by 2 redundant slides and *grow* by 3 missing beats — landing tighter and more complete.

---

### What Makes This Stand Out

Three things most designers don't do, and this one does:

1. **Triangulated, quantified research with a genuine method-changing insight.** "89 support tickets" + the realization that clinicians had made their own friction invisible (so observation beat self-report) is real research thinking, not portfolio theater.
2. **Decisions justified by constraints and tradeoffs**, including a named sacrifice ("I sacrificed custom animation options to ship in [timeline]") and UI choices tied to verbatim user language ("I lose context when things pop up"). That's senior reasoning.
3. **Outcome-oriented metrics** that map to clinical and business consequences (prescription errors, support tickets, adoption among prior non-users) rather than clicks.

The thinking is here. What's missing is the *evidence layer* (filled numbers, synthesis artifacts, exploration, iteration, reflection) that would let the thinking be trusted.

---

### What Would Make This Much Stronger

1. **Fill every `[FILL IN]` and reconcile the contradicting research counts — then ground the four headline metrics.** Make interviews "12" (or "8") everywhere, state the synthesis method (affinity? thematic coding?), and give the 75%/80%/55% figures an n, a baseline, and a timeframe ("misclicks dropped 75%, from X to Y, in usability tests with N clinicians"). Right now the case earns trust in prose and loses it in placeholders.
2. **Add the three missing beats: a `directions` (Ideation) slide, one real design-iteration `comparison`, and a `reflection` slide.** These convert the case from "well-explained final solution" to "visible design judgment under uncertainty" — the jump from mid to senior.
3. **Fix structure and voice: remove the duplicate `process` slide, merge Slides 3+4, re-type Slide 4 off the undocumented `researchFindings` into `quotes`, and standardize first-person voice (I vs. we).** Each is a quick edit that removes a credibility paper-cut.

---

### Overall Craft Score: 6.5/10
### Seniority Signal: Mid (with clear Senior-level instincts)
The constraint-aware, tradeoff-explicit decision-making and the method-changing research insight are genuinely senior signals — but the missing exploration/iteration/reflection beats and the pervasive `[FILL IN]` placeholders (including contradictory research counts and unsubstantiated headline metrics) keep this from reading as a finished senior case.

> **Flag for Recruiter:** Strong hire signal *if completed* — the research rigor and tradeoff reasoning are above mid-level. But the deck is currently unfinished: the cover has no role/timeline/impact, research numbers contradict each other (12 vs. 8 interviews), and every validation metric in the decision slides is a placeholder. Do not show externally until the `[FILL IN]`s are resolved and the numbers reconciled.
> **Flag for Director:** Positioning risk in two places — (1) "I" vs. "we" inconsistency obscures the candidate's actual contribution on a clearly multi-disciplinary project; clarify ownership. (2) The case tells a clean linear success story with no exploration, no failed iteration, and no reflection, which can read as too tidy to a senior panel. Adding the messy middle (alternatives, a failure, an honest limitation) will make the strong results *more* believable, not less.
