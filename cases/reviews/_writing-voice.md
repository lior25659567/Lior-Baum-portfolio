# Writing voice — how the copy must sound

This is the **primary brief** for every agent that writes or rewrites case-study copy
(author, editor, copy-writer) and the standard the critic enforces. It outranks the
`_ux-lexicon.md`: that file only tells you the *correct name* for a method on the rare
occasion you name one — this file tells you *how to write*, and the answer is **plain
product story first, UX language second and only when earned.**

## The one rule

**Concrete product detail first. UX language second.** Start with what actually happened
in the product — what the user did, what the system did, what broke. Name the UX concept
only *after* a concrete example has earned it, and only when the term makes the decision
clearer. Never open a sentence with an abstract UX word.

> Bad: "There were friction points across the user journey."
> Good: "Clinicians had to stop mid-scan to find the right tool. That pause broke their
> rhythm and made the scan feel less reliable."

> Bad: "Recognition over recall improved tool clarity."
> Good: "Instead of asking clinicians to remember what each icon meant, I added clear tool
> names and grouped actions by task."

## Sound like a designer in an interview

Write like a thoughtful product designer explaining their work to a hiring manager at
Microsoft, Google, Atlassian, Salesforce, or a strong B2B SaaS company. The copy should be:
human, clear, specific, confident, honest, professional, easy to understand — **not cheesy,
not over-written, not full of forced UX jargon.**

For every slide, the prose should answer as many of these as fit (in plain language, not as
labels): (1) What was happening before? (2) Why did it matter to the user? (3) What design
decision was made? (4) What changed after? (5) What trade-off or constraint shaped it?
**Explain the reason behind the UI, not just the UI.**

## Make it ONE story — connect every slide (the throughline)

The deck must read as **one continuous story where each thing leads to the next** — a chain
of causes, not a pile of strong-but-separate slides. This is the most common failure: every
slide is fine on its own, but the deck feels disconnected because the *links* between them
are missing. The reader should never wonder "why am I looking at this now?"

**Every slide connects backward and forward.** Each slide should pick up where the previous
one left off, and set up the one after it. The engine of the story is cause and effect:
**research → what I found → so what I decided → what that changed → what it led to next.**
Each link must be visible.

How to build the connective tissue (do it in the lead line, the highlight, or the label —
without adding length or sounding repetitive):
- **Open by inheriting the last beat.** A solution slide names the problem it's answering;
  a "what I did" slide names the finding that drove it. "Because clinicians lost their
  rhythm hunting for tools, I put every scan tool in one fixed place."
- **Close by setting up the next.** End a problem slide with the question the next slide
  answers; end a decision slide by pointing at what it unlocked or what problem remained.
  "Setup was fixed — but the moment scanning started, a second problem showed up."
- **Reference earlier beats explicitly.** "The flow map from earlier showed three breakpoints;
  this is the second one." Tie outcomes back to the specific problems they resolve, and the
  reflection back to specific decisions in the deck.
- **Let the decision carry the finding.** Never present a design choice as if it appeared
  from nowhere — anchor it to the research/insight that made it the right call.

Use plain, sparing connectors — the connection should live in the *logic* (this caused
that), not in a pile of "Then… then… then." A few honest bridges beat a transition word on
every slide. The test: read slides N and N+1 back to back — can the reader see *why* N+1
follows N? If not, the link is missing.

> Disconnected: [Slide: "Setup blocked the scan."] … [next slide: "I moved procedure
> selection into the tooth chart."] — two facts, no link.
> Connected: [Slide: "Setup blocked the scan — clinicians filled a modal before they could
> start."] … [next: "So the first move was to kill the modal: I put procedure selection
> right on the tooth chart, where the clinician already was."]

**Connect with logic, NOT by repeating the same word.** This is the trap: don't create the
link by echoing one keyword ("handoff", "workflow", "phase", "breakpoint") on slide after
slide. Repetition is not connection — it reads as a tic, and it's worse than a missing
bridge. The link comes from cause and effect; say it a different way each time, lean on the
specific product detail (the modal, the toolbar, the missing done-signal), or let the
connection be implicit when the logic is already clear. **Watch your own repetition:** if a
non-obvious word (handoff, workflow, gate, rhythm…) is about to appear on a third slide,
rephrase or cut it. Vary the verbs and nouns; the same idea can be "moving between steps",
"the seam between setup and scanning", "where one phase passed to the next" — pick the one
that fits, don't stamp the same term everywhere. Domain words that must recur (clinician,
scan) are fine; *connective* vocabulary should not repeat.

**Introduce a named structure ONCE, then vary how you refer to it.** When the project has a
named multi-part structure (e.g. "RX, Scan, and View", a three-step pipeline, named
phases), **keep that structure** — but spell out the full list only once, where you
introduce it (usually the intro and the system/problem slide). After that, refer to its
parts with natural language: "setup", "scanning", "review", "the three phases", "the
appointment flow", "the setup step", "the next step", or just the one phase the slide is
actually about. Re-listing the full trio on slide after slide is the same repetition tic —
it makes the deck feel mechanical. Don't drop the structure; vary how you point at it.

**Add a description where a slide needs one.** A slide that jumps straight into a list
(goals, directions, a problem's bullets) with no lead sentence can break the flow — the
reader gets items with no framing. If the template has an available lead/description/intro
field and the story needs it, **add a short one-line description** that frames the slide and
carries the thread from the previous beat. Don't leave a slide bare when one plain
connective line would make it land. (Equally: don't pad a slide that already reads clearly.)

## Kill the portfolio taglines

The single biggest problem to fix: dramatic one-liners and slogans. When every slide has a
punchy tagline, the deck reads as scripted, not real. **Remove them. Say the plain thing.**

> Bad: "The system grew. The experience didn't."  → Good: "RX, Scan, and View had grown
> into separate workflows."
> Bad: "This map became the contract."  → Good: "Mapping the flow showed where clinicians
> lost time."
> Bad: "I fix it at the handoff."  → Good: "My work focused on the transitions between
> setup, scanning, and reviewing."
> Bad: "Map the flow first. Design second."  → Good: "Mapping the flow showed where
> clinicians lost time."
> Bad: "Setup gone. Start scanning." → Good: "Patient setup no longer blocked the scan."

No empty slogans, no dramatic fragments, no "This unlocked…", "This became the
foundation…", "The system saw each screen as separate…". One earned, human line is fine;
a deck where every slide reaches for a mic-drop is not.

## Earn every UX term — don't decorate with it

UX terminology is allowed, but it must be **earned by a concrete example first**, and used
sparingly. Overusing terms (friction points, pain points, behavioral patterns, cognitive
load, recognition over recall, journey mapping, design system, phase handoff, workflow
optimization, opportunity areas) makes it sound like the designer is proving they know the
words instead of telling the story.

> First: "Users had to open a modal for each tooth, confirm the procedure, close it, and
> repeat." Then, if it helps: "This created unnecessary friction in complex cases."

Rules: don't use a UX term before a concrete example. Don't repeat the same term across
slides. Don't capitalize UX terms mid-sentence (only slide titles get title case). Don't
write "improved clarity" without saying what became clearer, or "reduced friction" without
saying what friction was removed.

## Preferred plain language

Use: "Clinicians had to…", "The old flow made them…", "The problem showed up when…", "I
tested three directions…", "This option was clearer because…", "We rejected this because…",
"The final design kept…", "This made it easier to…".

Avoid: "This unlocked…", "This became the foundation…", "the map became the contract…",
"the system saw each screen as separate…", "I fix it at the handoff…".

## Body copy

Short. 1–3 sentences per slide. It should sound like something a designer would say out
loud.

> Bad: "I redesigned the RX, Scan, and View workflow into one continuous experience. The
> same problem lives in every complex SaaS workflow: systems grow faster than their UX."
> Good: "RX, Scan, and View had been designed as separate parts of the workflow. In the
> clinic, clinicians experience them as one appointment. My work focused on making the
> transitions between these steps clearer and faster."

## Bullets — concrete and observable

> Bad: "Reduced cognitive load · Improved discoverability · Better workflow clarity"
> Good: "Moved procedure selection directly into the tooth chart · Kept scan tools in one
> predictable location · Added labels so clinicians didn't need to memorize icons"

## Research — honest, not inflated

Don't make the research sound bigger than it was. If the input has real research, use it
clearly. If exact numbers aren't given, write "In user testing…", "During clinician
feedback sessions…", "In the sessions I observed…", "A repeated theme was…". **Never invent**
participant counts, names, quotes, metrics, success rates, or post-launch impact (missing
specifics become a visible `[ADD: …]` placeholder, never a guess). If a quote sounds fake or
too perfect, rewrite it as a finding.

> Bad: "The moment I go looking for a tool, I lose my rhythm completely."
> Good: "Several clinicians described losing focus when they had to leave the scan area to
> find a tool."

## Outcomes — no faked impact

If there are no real numbers, do not fake impact.

> Bad: "Faster setup time." → Good: "In prototype testing, clinicians reached the scan
> screen without going through the old modal flow. Production setup-time data wasn't
> available yet."
> Bad: "Higher clinician confidence." → Good: "Clinicians said the clearer review state
> made it easier to know when the scan was ready to submit."

## Reflection — honest and specific

Not a perfect story.

> "I would test toolbar placement earlier, because it shaped almost every later decision."
> "Icon redesign wasn't visual polish — it changed how clinicians understood the tools."
> "Next time I'd separate prototype validation from visual refinement."

## Final check — run on every slide before returning

1. Would a real designer say this in an interview?
2. Is there a concrete product detail?
3. Is every UX word actually needed (and earned by an example)?
4. Is the claim supported by the input (no invented metrics/names/quotes/research)?
5. Does the slide explain *why* the design decision mattered?
6. Is the tone confident but not cheesy — no dramatic tagline?

**Don't write "UX about UX." Write the product story, then use UX language only when it
clarifies the decision.**

---

# Tone & voice mechanics — how every sentence should read

This section extends the doctrine above with sentence-level mechanics. Everything above
sets the *what* (plain product story first, sound like a designer in an interview); this
sets the *how*, word by word. Same standard: **write the way a confident senior designer
talks through their work in a room — not the way people write on LinkedIn, not the way
academic reports are written. Plain. Specific. Grounded in evidence.** The examples below
use an e-commerce checkout for illustration; the principles apply to any product domain
(B2B SaaS, clinical, internal tools — whatever the deck is about).

**The one rule everything else follows:** if a sentence could appear in *any* case study
about *any* product, it is too generic. Cut it and replace it with a detail only this
project could have.

## First person, active voice — always

The designer did the work. Own it.

| ❌ Passive / distanced | ✅ First person, active |
|---|---|
| "User interviews were conducted." | "I interviewed 8 users." |
| "It was decided to simplify the checkout." | "I collapsed 5 screens into one." |
| "The team felt the solution needed testing." | "I ran two rounds of usability tests." |
| "Research was performed to understand pain points." | "I spent three weeks in the data before touching Figma." |

## Numbers over adjectives

Every claim that can carry a number must carry one. Adjectives without evidence are
marketing copy, not case-study writing.

| ❌ Vague | ✅ Specific |
|---|---|
| "Significantly improved completion." | "Completion rose from 24% to 34%." |
| "Users found it much faster." | "Median time-to-order dropped 58 seconds." |
| "A large portion of users dropped off." | "68% quit between cart and payment." |
| "The redesign was well received." | "Post-order CSAT rose 12 points." |

When numbers aren't available, name the measurement that *should* have existed and say why
it's missing — more credible than silence. (This is the same rule as "no faked impact"
above: never invent a number; surface the gap as an `[ADD: …]` placeholder.)

## Short sentences. One idea each.

If a sentence contains two "and"s, split it. If it runs past 25 words, split it. A breath
between ideas gives them room to land.

| ❌ Overloaded | ✅ Split |
|---|---|
| "We conducted research and found three key insights which led us to redesign the checkout flow and ultimately improve conversion." | "The research surfaced three insights. Each one pointed at the same screen: checkout. I redesigned it. Conversion rose 41%." |

## Decision → reason → outcome

Every design choice follows this sequence — never state a decision without its evidence,
never state a finding without its consequence. **Template: I did X because the evidence
showed Y, and the result was Z.**

| ❌ Decision only | ✅ Full sequence |
|---|---|
| "We added a guest checkout option." | "Six of eight interviewees named the signup wall as the moment they quit. I removed the wall and offered account creation after payment — when users have a reason to save their details. Seventy-one percent still created an account." |
| "We simplified the form." | "Analytics showed 14 fields before payment; competitor checkouts averaged 6. I cut to 6 using autofill and saved addresses. Task completion in testing went from 67% to 100%." |

## User quotes as emotional anchors

Quotes do what numbers can't — they make the pain human. Use them sparingly so each lands.

- ≤20 words. Cut ruthlessly with ellipses if needed (for trimming, never for drama).
- Always attributed: "— P4" or "— participant, 32, commuter."
- One quote per insight, placed at the *end* of the finding — not the beginning.
- At least one quote must *complicate* the story. A wall of identical complaints reads as
  cherry-picked. Include the user who didn't hate the old flow and explain what that told
  you.

| ❌ Long, unattributed, decorative | ✅ Short, attributed, placed after the evidence |
|---|---|
| "One user said something like 'I didn't really understand why I had to make an account just to buy something, it seemed unnecessary and annoying.'" | "Analytics confirmed it. So did P2: \"Why do I need a password to buy food?\"" |

## Constraints and setbacks are story, not shame

Deadlines, cuts, pivots, and mistakes are the most interesting parts of a case study. Do
not omit them. Frame them as decisions made against real constraints — not confessions.

| ❌ Buried or omitted | ✅ Named and owned |
|---|---|
| "Due to time constraints we had to limit scope." | "The launch date was fixed. With 3 weeks left I cut the reorder feature and protected guest checkout — 4× the completion impact per engineering-day." |
| "I learned a lot from this project." | "I'd pull engineers into research synthesis in week 3. The SDK constraint that nearly killed express pay would have surfaced for free; I found it in week 8 instead." |
| "Some research limitations were present." | "Eight participants skews toward mobile commuters. A 4-week A/B window can't rule out novelty effects. Refund rates were never instrumented — the revenue picture is incomplete." |

## Business framing — open and close

Open by naming the business cost of the problem. Close by naming the business impact of the
solution. Everything in between — research, personas, ideation — explains how you got from
one to the other.

| ❌ Designer-only framing | ✅ Business-connected framing |
|---|---|
| "The checkout flow had usability issues." | "Marketing was growing installs. Revenue stayed flat. The leak was checkout." |
| "Users had a better experience after the redesign." | "Completion rose 41%. At average order value, that's a material revenue lift from the same acquisition spend." |

## Banned phrases — delete on sight

These appear in every case study and mean nothing. Replace with the specific truth of this
project. (Extends the "kill the taglines" and "earn every UX term" sections above.)

delightful experience · seamless journey / seamless experience · user-centric /
human-centered (as a standalone claim) · leveraging insights · pain points (use the
specific pain) · intuitive design / intuitive interface · "we wanted to improve the
experience" · at the end of the day · move the needle · holistic approach · impactful
design · deep dive · iterate and improve

## Writing pain & friction

"Pain point" is banned as a *label* — it has been used so often it communicates nothing.
Every pain is different. Write the specific one, so the reader *feels* the obstacle.

**Name the exact friction, not the category:**

| ❌ Generic | ✅ Specific |
|---|---|
| "Users experienced pain points in the checkout." | "Users had to create an account before they could pay — a signup wall between wanting something and getting it." |
| "The form had usability issues." | "Fourteen fields. No autofill. One-handed, on a moving train." |
| "Users found the pricing confusing." | "Delivery fees appeared only on the final screen. By then users felt tricked, not surprised." |
| "Navigation was a pain point for users." | "Users tapped back an average of 4 times per session trying to find their cart." |

**Use the three-layer model** — write all three, not just the surface:
1. **The moment** — exactly where and when it happened ("screen 4 of 5, after already filling in their address").
2. **The feeling** — the emotional register, in the user's own words where possible ("felt sneaky", not "confusing").
3. **The consequence** — what the user did because of it ("6 of 8 interviewees quit here; session recordings show rage-taps").

> The delivery fee appeared only at payment — screen 5 of 5, after the user had already
> committed address, schedule, and card. Six of eight interviewees called this the moment
> they quit. "The price jumped at the end. Felt sneaky." — P7. Session recordings confirmed
> it: tap, tap, close.

**Emotion words — use them precisely.** Frustrated, confused, and annoyed are not the same
experience. Never stack them ("frustrated and confused and annoyed"); pick the dominant one
and name the moment that caused it.

| Word | When to use it |
|---|---|
| **Confused** | User didn't know what to do next — the task flow broke down |
| **Frustrated** | User knew what they wanted but the interface blocked them |
| **Annoyed** | User had to do unnecessary extra work — extra taps, repeated fields, redundant steps |
| **Betrayed** | User put in effort and then felt misled — hidden fees, bait-and-switch flows |
| **Anxious** | User wasn't sure something worked or was safe — payment confirmation, data handling |
| **Impatient** | User was in a context where time mattered and the interface didn't respect it |

**Friction vs. insight — know the difference.** A pain point is an observation. An insight
is a pain point *plus a cause plus an implication for design*. Never stop at the pain.

| ❌ Pain point only | ✅ Pain → insight |
|---|---|
| "Users were frustrated by the signup wall." | "The signup wall frustrated first-time buyers — but returning users with saved logins called checkout 'fine.' The pain wasn't the account system, it was the timing. Move account creation to after purchase and the wall disappears for the people who matter most." |
| "The late fee reveal caused drop-off." | "Fees shown late didn't just cause drop-off — they caused distrust. Users who saw fees early in our prototype completed at the same rate as a flat-fee service. Transparency, not price, was the variable." |
| "The form was too long." | "Fourteen fields wasn't the problem — it was fourteen fields with no autofill, on a phone, one-handed. The same form on desktop took 90 seconds; on mobile it took 4 minutes. Context collapsed the tolerance." |

**Contextual friction — name the environment, not just the interface failure:**

| ❌ Interface-only | ✅ Context-aware |
|---|---|
| "The text was hard to read." | "Light grey text on white. Unreadable in sunlight on a commute." |
| "The tap targets were too small." | "Buttons sized for a mouse. Users on the train hit the wrong one every third tap." |
| "The flow was too long." | "Five screens is fine at a desk. On a moving train it's five chances to get interrupted and lose the session." |

## Headlines are story beats, not labels

Read the headlines of a finished case study in order — they should tell a mini-story on
their own.

| ❌ Label | ✅ Story beat |
|---|---|
| "Research" | "Research: Where the Funnel Leaks" |
| "The Problem" | "68% of Users Never Made It to Payment" |
| "Design Process" | "Four Sprints, One Rule: No Untested Assumption Ships" |
| "Results" | "Completion Up 41% — Here's What Actually Moved It" |
| "Learnings" | "What I'd Do Differently (and the Exact Week I'd Do It)" |

**Reconcile with "kill the taglines" above:** a story-beat headline is *earned by a specific
number or fact* ("68% Never Made It to Payment"). That is NOT a banned tagline. The banned
ones are content-free drama with no evidence behind them ("The system grew. The experience
didn't.", "This map became the contract."). The test: strip the headline to its claim — is
there a real number or concrete fact under it? Keep it. Is it just a mood? Cut it.

## Punctuation & formatting conventions

- **Em dash** for emphasis and asides — never parentheses for the same job.
- **→** for transformations and before/after: "24% → 34%", "67% → 100% task success".
- *Italics* for tips, asides, meta-notes, and honest caveats.
- **Bold** for the first appearance of a key term that anchors a section.
- Use the Oxford comma, consistently.
- Ellipses in quotes only for trimming, never for drama.

## The tone in three sentences

Speak from evidence, not from enthusiasm. Name what you did, why the data pointed there, and
what changed because of it. Be honest about the gaps — a case study with limitations and a
real mistake is more convincing than one without.

## Before / after at a glance

| Before | After |
|---|---|
| "We conducted extensive research to understand user needs." | "I interviewed 8 cart-abandoners, recruited via in-app intercept the same week they quit." |
| "The redesign significantly improved the user experience." | "Completion rose 41%. Time-to-order fell 58 seconds. CSAT rose 12 points." |
| "Our goal was to create a better checkout experience." | "Three goals, set before any design work: lift completion above 30%, cut time-to-order below 2 minutes, keep signup volume flat despite adding guest checkout." |
| "Some ideas were deprioritized due to constraints." | "Voice ordering was dropped: 1 of 8 interviewees mentioned it, and recordings showed users ordering on noisy public transit." |
| "The app had some usability issues." | "68% quit before paying. Marketing was growing installs. Revenue stayed flat." |
| "I learned a lot from this project." | "The SDK constraint surfaced in week 8 and nearly killed express pay. I'd have caught it in week 3 if I'd brought engineers into synthesis earlier." |
| "Users experienced pain points in the checkout." | "Fourteen fields. No autofill. One-handed, on a moving train. 6 of 8 users quit here." |
| "There was confusion around the pricing." | "Fees appeared on screen 5 of 5. By then users felt tricked, not surprised — and they left." |
| "Users were frustrated with navigation." | "Users tapped back an average of 4 times per session hunting for their cart. The path existed. They just couldn't see it." |
