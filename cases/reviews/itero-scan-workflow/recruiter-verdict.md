# Recruiter Verdict — itero-scan-workflow
_Calibrated against: Senior Product Designer at a B2B SaaS company. ~3 years experience. Target: workflow-heavy, product-led, mid-size company with a real design culture._
_This is a REVISED verdict, incorporating the full context.md (designer-asserted facts). Prior verdict was written without it._

---

## 4-Minute First Impression

The opening line still lands: "The patient is in the chair. The scanner is ready. The system isn't." Stakes in ten words, no drama. I'd remember this deck at review twelve.

But the 4-minute read stalls fast. Two full problem slides before research. Six quotes — two too many. A journey map slide that re-states the same three failure points the problem slides named five slides earlier. By slide 6 I'm still in setup and haven't seen design work. That's a pacing problem.

What I'd remember an hour later: the code-first prototype rationale (slide 6) — genuinely distinctive, appears in maybe 5% of the portfolios I screen. The two directions slides showing rejected options with clear reasoning. The tooth-chart multi-select interaction. Those three things.

What I'd forget: everything that should have told me why this project mattered at a business level. The context.md contains a fully formed business case — 37 million cases per year, three competitors who already modernized their Rx flows, a system that had been patched too many times to patch again, three distinct user groups absorbing the failures. None of that is in the deck. Without it, this reads as a well-executed UX redesign of a dental scanner, not a product decision made at scale under competitive pressure.

The context.md tells a Senior-level story. The deck currently tells a mid-level one.

---

## Role & Level Signal

**Current deck signals: L4 — strong execution, limited strategic context.**

What reads as senior right now:
- Evaluated and rejected design directions with specific reasoning, not just "we explored options"
- Built a coded prototype because Figma couldn't test timing — knows what different fidelities actually reveal
- Produced a design system as a by-product, not just screens
- Owns decisions in first person throughout

What reads as mid-level:
- No business context: why was this prioritized now? What was the market pressure?
- No collaboration visible: 1 PM and 4 engineers listed in meta, never referenced again in the story
- No constraints named: touch surfaces, gloved hands, feature flag behavior, backward compat — all shape every design decision, all invisible in the deck
- Outcomes are adjective labels, not observations: "Faster," "Fewer," "Clearer," "Higher" with nothing behind them
- No forward view: no next steps, no roadmap, no signal that the designer thinks about where work goes after handoff

The gap between what the context.md documents and what the deck shows is the entire Senior signal gap. The work itself is there. The presentation of the work is not.

---

## Red Flags

- **No "why now" context.** Context.md documents three converging signals: 3Shape, Medit, and Shining3D had already modernized their Rx flows; 37 million cases per year made every friction point expensive at scale; and the architecture had been patched too many times to patch again, making a full rebuild the only option. None of this appears in the deck. Without it, the project reads as internally motivated polish. A SaaS hiring manager at a company that cares about competitive positioning will ask "why did the company decide to rebuild this now?" and the deck has no answer.

- **No "who it affected" scope.** Dentists are the visible user. Context.md documents two more: clinical staff who absorb resubmissions and incomplete cases, and labs who receive Rx data too malformed for complex procedures like All-on-X or multi-phase treatments. These three audiences are what make this a product-scale problem rather than a UX inconvenience. Without them, "37 million cases" (which appears once in passing in slide 1) floats without any weight behind it.

- **Constraints are invisible.** The three-surface requirement (scanner hardware, MIDC desktop, myitero.com), the touch/gloved-hand baseline that ruled out hover states and precise pointer interactions, the feature flag (SWO NewFlowRx) that meant the flow had to be learnable on first contact every time with no persistent onboarding, backward compatibility with in-progress cases, and read/demo/editable as first-class states from day one — all of these shaped every design decision in the deck. None appear as a named constraint. The toolbar placement decision looks like a preference; it was actually forced by the touch-screen surface. The single-view layout looks like a clean UX call; it was the only option that worked with gloves. A hiring manager who asks "what constraints shaped your decisions?" gets no answer from this deck. That's a screen-out at Senior level at most SaaS companies I work with.

- **Outcomes are content-free.** "Faster," "Fewer," "Clearer," "Higher" as metric labels. Context.md honestly says production data isn't available yet — that's fine and credible. But the current slide implies results without having any. A Senior outcome story with no production data still says something honest: "In prototype testing, clinicians moved from RX to first scan without the modal flow — the average old path had three steps; the new path had zero." That's real. What's on the slide now is four adjectives.

- **No collaboration signal.** The PM appears once in the metaItems. Engineers are never referenced. No engineering constraint surfaced. No scope conversation with the PM visible. The context.md documents a roadmap sequenced with the PM — that doesn't appear anywhere. This reads as solo work. At Senior level, every B2B SaaS company I've placed into cares about how the designer works across functions.

- **No next steps.** Context.md documents a sequenced roadmap: smart defaults and auto-fill now; Rx Summary & Send next; lab-side connection later. That roadmap doesn't appear in the deck. A designer who can't show where work goes next reads as task-completer. A designer who shows a sequenced roadmap reads as a product partner.

- **Research has no scope.** "I ran six clinician interviews" with no session count for observations, no conditions described. Context.md adds "chairside observation, then six interviews." It also acknowledges the limitation: six interviews is a small sample, skewed toward clinicians available for observation. That honest limitation is not in the deck.

---

## Green Flags

- **The code-first prototype rationale (slide 6) is the single best signal in the deck.** "Figma can't show whether toolbar placement disrupts scanning rhythm the moment a clinician reaches for a tool" is design reasoning, not a tools brag. This is a designer who knows what each fidelity tests and chooses deliberately. Context.md confirms the toolbar placement decision would not have been made correctly without it. That's a testable claim — and it's right.

- **Rejected directions show design judgment, not just design output.** Both directions slides explain the specific failure of each rejected option. "The modal was gone but a sequential gate replaced it" (slide 9). "Reaching up pulled attention off the live scan mid-capture" (slide 14). These are not "we considered other options" — they're decisions made visible. Most mid-level portfolios skip this.

- **The problem → goals → KPIs chain is structurally tight.** Four goals map to four failure points. Four KPIs named. The infrastructure is correct. It just needs the last link closed.

- **Reflection is honest and specific.** "Toolbar testing came too late — I revised layout decisions that were already built." "Icon redesign got bundled into toolbar work — it deserved its own scope." These are real mistakes, named with specificity. The context.md adds a third specific regret: grouped materials definition came in too late, which compressed testing time for edge cases like ungrouping mid-case. That belongs in the reflection too.

- **Design system slide (19) shows upstream thinking.** Built in three states (editable, read-only, demo) from day one — not retrofitted. IA structured to absorb lab workflows without a rebuild. That's a product-forward decision documented as delivered infrastructure, not just screens.

- **The tooth-chart multi-select interaction (slide 11) is concrete and memorable.** "One interaction for a range of teeth — instead of a separate modal per tooth" is immediately legible to any hiring manager who has used a modal-heavy form. This is exactly the kind of specific decision that makes work stick.

---

## Level Calibration

**Realistic level this deck currently supports: L4 strong mid-level, with L5 Senior work visible underneath.**

The design thinking documented in context.md is unambiguously Senior — constrained surfaces, competitive context, multi-audience problem definition, PM-sequenced roadmap. The deck as built is L4 because none of that strategic context made it in.

**Single thing missing that would push to clear Senior:** A constraints slide. Every B2B SaaS hiring manager I've placed asks "what were the constraints you worked against?" The answer is excellent — three surfaces, gloved-hand touch baseline, feature flag with no persistent onboarding, backward compat with live cases, three states as first-class from day one. These constraints explain every design decision in the deck. Right now the deck has no answer to that question.

**What would push from Senior to Staff:** The 37 million cases figure front-loaded as a product-economy framing (not a buried mention in slide 1), three affected audiences named explicitly, and a visible moment of cross-functional navigation — the PM scope conversation, one engineering constraint that changed a design call.

---

## Culture Fit Profile

**Best fit:** Mid-size B2B SaaS product company (50–500 people) with focused product pods. One designer owns a workflow end-to-end. Domains with expert users operating under time pressure: healthcare SaaS, legal tech, financial services tooling, logistics, or any workflow-heavy product where errors have real consequences. Engineering-adjacent teams that value prototype-as-research over pure Figma delivery.

**Would struggle in:** Large enterprise org where designers own fragments. Consumer product where visual delight dominates. Agency environments. The solo framing and functional-over-aesthetic signals throughout suggest someone who needs space to own a surface end-to-end.

**Transfer story this deck doesn't yet make:** The clinical background is an asset for any B2B company serving regulated or high-stakes workflows. Complex expert-user workflows under time pressure — that pattern transfers to Salesforce, Atlassian, a strong healthcare SaaS, or any company whose users can't afford to be confused mid-task. The deck doesn't connect those dots. The hiring manager at a non-clinical SaaS company has no bridge to walk across. One line in the intro or reflection would close it.

---

## Beats in context.md That Would Most Raise Hirability if Surfaced as Slides

### Must add — screen-out risk if they stay missing

**1. Who It Affected (new slide — `issuesBreakdown` template)**
Position: after slide 1 (The System slide).
What it must say: Three groups, three specific failures. Dentists lost chair time — every extra click was time not spent on the patient. Clinical staff absorbed the fallout — resubmissions, incomplete cases, lab queries about missing fields. Labs received Rx data incomplete and rarely structured for complex procedures like All-on-X or multi-phase treatments. At 37 million cases a year, even one unnecessary popup per case is not a small problem.
Why it's a screen-out risk if missing: Without it, "37 million cases" is a number with no human weight. A SaaS hiring manager reads this project as a dental UX problem, not a product-scale failure. The three-audience framing is what makes this a Senior-level problem definition.

**2. Why Now (new slide — `textAndImage` problem type)**
Position: after Who It Affected.
What it must say: Three signals converged. Competitors had modernized — 3Shape, Medit, and Shining3D had already rebuilt their Rx flows. Scale made every friction point expensive at 37 million cases per year. And the architecture had been patched too many times to patch again. The only answer was a rebuild.
Why it's a screen-out risk if missing: Without it, the project has no business case. A hiring manager at a product-led SaaS company wants to know the designer understands why work gets prioritized. This is the answer to that question.

**3. Constraints (new slide — `textAndImage` problem type with `bullets2` for design consequences)**
Position: after slide 6 (Prototype rationale), before chapter slide 7 (RX).
What it must say: Name the constraints and their design consequences explicitly. Three surfaces (scanner hardware, MIDC desktop, myitero.com) set the floor — hover states, right-click menus, and precise pointer interactions ruled out; every tap target had to work for a gloved hand. Backward compatibility required the new flow and the old Rx to coexist for the same user in the same session. The feature flag (SWO NewFlowRx) meant no persistent onboarding — the flow had to be learnable on first contact, every time. Read mode and demo mode as first-class states from the start — not retrofitted. M&I, Labs, and iTero Labs out of MVP scope, but designed so adding them wouldn't require a rebuild.
Why it's a screen-out risk if missing: This is the single biggest Senior signal in the entire project and it's currently invisible. Every constraint named here directly explains a design decision in the deck. Without this slide, toolbar placement and single-view layout look like preferences. With it, they look like the only defensible options against a real constraint set.

**4. Next Steps (new slide — `process` template)**
Position: after Outcomes (slide 20), before Reflection (slide 21).
What it must say: Three stages, sequenced with the PM. Now: smart defaults and auto-fill — the interaction model is in place; the intelligence layer isn't. Next: Rx Summary & Send — the final phase of the flow, out of scope for this phase but inheriting every problem the new Rx was designed to solve. Later: lab-side connection — the tooth chart, grouped definitions, and materials summary were designed to be extensible; when lab workflows connect to the same surface, the architecture is ready.
Why it's a screen-out risk if missing: A designer who shows where the work goes next is a product partner. A designer who shows only what they shipped is a task-completer. The context.md documents a PM-sequenced roadmap. A roadmap slide is the most direct way to signal that collaboration and forward-thinking are real, not claimed.

### Should add — not immediate screen-outs but missing Senior signal

**5. Research scope (revise slide 3 — Quotes)**
The quotes slide currently presents six named quotes with no research context before them. Context.md confirms: chairside observation first, then six interviews, with clinicians walking through a real case. Add one honest line of research framing to the slide content field. Also: six quotes is two too many. The context.md acknowledges a small-sample limitation (skewed toward available clinicians, not a representative cross-section). That honest qualifier should appear somewhere — either on the quotes slide or in the reflection.

**6. Design Goals and KPIs (revise slide 5 — not a new slide)**
The slide exists but needs two changes. First, the title "What I needed to fix" frames the goals as the designer's task list, not the product outcome — revise it. Second, the KPIs need an honest qualifier: these were defined before the project and will be measured post-launch; production data wasn't available at handoff. Currently the slide lists KPIs as if they've been measured. They haven't. That ambiguity is a trust problem for any hiring manager who follows up.

### Already present — no new slide needed

- **Journey Mapping (slide 4):** Present. Needs the content tightened (currently re-states the problem slides), not a new slide.
- **Prototyping rationale (slide 6):** Present and strong. Add one more concrete line about what code made possible that Figma wouldn't.
- **Phase exploration (slides 7–18):** Well-covered. Issue is connective tissue between phases, not missing content.
- **Design System (slide 19):** Present. Strengthen the claim from context.md that the IA is extensible to lab workflows.

---

## Would You Advance Them?

**Maybe** — the design thinking and craft are genuinely Senior, but the strategic setup is almost entirely absent from the deck; add the "who it affected," "why now," "constraints," and "next steps" slides from context.md and this becomes a clear advance.

---

## Recruiter Verdict: Maybe

**Single deciding factor:** The context.md contains a complete Senior-level story — competitive pressure, constrained hardware surfaces, three affected user groups, PM-sequenced roadmap — but almost none of it made it into the deck, so the work currently reads as mid-level execution of a narrowly-defined UX problem.

> **Flag for UX Reviewer:** The outcomes slide (slide 20) uses "Faster," "Fewer," "Clearer," "Higher" as metric labels with no supporting data. Context.md states production data wasn't available at handoff and that prototype testing validated interaction logic, not real scanning conditions. The slide needs to reflect this honestly rather than implying measured results. Verify whether any prototype testing produced task-time, step-count, or error-rate observations — even one honest usability data point would transform the slide from vague to credible. Also: the icon redesign (slide 15 and 16) is the most craft-demonstrating work in the deck; confirm it's showing the actual redesigned icon set, not just describing it in bullets.

> **Flag for Director:** The positioning gap is the largest hiring risk. This is one of the most technically and commercially grounded projects in the portfolio — three hardware surfaces, a feature-flag constraint, backward compat with live cases, competitive pressure from three named competitors, 37 million annual cases as scale context. The deck presents almost none of this. The four slides recommended above (Who It Affected, Why Now, Constraints, Next Steps) are all sourced directly from context.md — no invention required. Adding them transforms the deck from "a dental scanner UX redesign" to "a product decision made under real constraints at scale." That transformation is the difference between Maybe and Advance at the Senior level in B2B SaaS.
