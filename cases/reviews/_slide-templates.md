# Slide template reference

Authoritative catalog of every slide template, its elements, and when to use it.
Generated from `src/data/slideTemplateDocs.js` — do not hand-edit; regenerate with
`node scripts/case-study-text.mjs templates`.

Reviewers: use this to judge whether each slide uses the BEST template for its content
(e.g. a text+image slide carrying a strong pull-quote should probably be a `quotes` or
`testimonial` slide). The editor: when adding or retyping a slide, copy that template's
**skeleton** below and replace text with `[FILL IN: …]` explaining what the designer must supply.

## The 10 canonical case-study beats (judge completeness against these)
1. Cover · 2. Problem Statement · 3. Research Overview · 4. Key Insights · 5. Design Exploration
6. Iteration Evidence · 7. Final Solution · 8. Outcome/Impact · 9. Process Timeline · 10. Reflection

Notes:
- `textAndImage` is the versatile default; it renders internally as type `problem` and also
  covers `context`, `feature`, `testing` (same template, aliased `type`).
- `directions` is labelled **"Ideation"** in the picker.
- `intro` must be first; `end` must be last; `reflection` is required above mid-level.

---
## `intro` — renders type `intro`
**Purpose:** Opening slide. Front-loads role + timeline + impact in the first 3 lines so reviewers can infer seniority before they invest time reading further.
**When to use:** Always the first slide of every case study. Every presentation should begin with one.
**Word budget (on-screen prose):** ~75 words — keep it scannable in seconds.
**Required fields:** title, description, metaItems
**Optional fields:** subtitle, clientLabel, client, focusLabel, focus, logo, introHeaderMode, splitRatio, cta, headlineMetric
**Media fields:** image, logo
**Choose this when the content reads like:** project introduction · case study opening · hero slide · project title · project overview
**Content limits:**
- title: rec 2-4 words, supports line breaks with \n
- description: rec Open with a single vivid sentence establishing user pain & stakes. 1-2 sentences total.; max 3 sentences
- metaItems: rec 4 items: Role, Timeline, Team, Tools (+ optionally Project type); max 5; Array of { label, value } pairs. Front-loads seniority signals — required for senior portfolios.
- headlineMetric: rec { value, label, context } — the single most impressive quantified outcome. Hiring managers decide in 6 seconds whether to keep reading.
- cta: Optional { label, url } call-to-action button.
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "intro",
  "title": "iTero\\nToolbar",
  "description": "Clinicians lost seconds re-aiming the scanner mid-procedure — a dropped scan meant restarting the patient session.",
  "metaItems": [
    {
      "label": "Role",
      "value": "Lead Product Designer"
    },
    {
      "label": "Timeline",
      "value": "6 weeks · Q1 2025"
    },
    {
      "label": "Team",
      "value": "1 PM · 2 eng · 1 researcher"
    },
    {
      "label": "Tools",
      "value": "Figma · Maze · Notion"
    }
  ],
  "headlineMetric": {
    "value": "−63%",
    "label": "Time-to-rescan",
    "context": "measured across 1,200 sessions, 4 weeks post-launch"
  },
  "logo": "",
  "introHeaderMode": "both",
  "splitRatio": 50
}
```

---
## `info` — renders type `info`
**Purpose:** Sit-after-the-intro slide that primes evaluators on the structure: pain → impact → who/when/how → methodology phases mapped to the case study itself.
**When to use:** Right after the intro slide. Required for senior portfolios — without methodology + headline metric this slide reads as junior.
**Word budget (on-screen prose):** ~100 words — keep it scannable in seconds.
**Required fields:** title, items
**Optional fields:** intro, headlineMetric, methodology, bullets, bulletsTitle, highlight, cta
**Choose this when the content reads like:** project overview · project details · role · duration · deliverables · methodology · process overview · tldr
**Content limits:**
- intro: rec A single vivid sentence (15-25 words) establishing user pain and stakes — make readers care before showing project details.
- headlineMetric: rec { value, label, context } — leads the 6-second scan. Pair with context (sample size, time frame).
- items: rec 4-6 items: Role, Timeline, Team, Tools, Client, Project type; max 6; Each item is { label, value }. Cover what reviewers infer seniority from.
- methodology: rec { name: "Double Diamond" | "Design Thinking" | etc, phases: [{ name, description }] } — name the methodology upfront and link each phase to a case study section.
- methodology.phases: rec 4 phases (Discover/Define/Develop/Deliver, or your own); max 5
- bullets: rec 3-5 bullets; max 8
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "info",
  "title": "Project Overview",
  "intro": "Clinicians were abandoning live patient scans 23% of the time — every dropped scan was a restarted appointment and a lost minute of chair time.",
  "headlineMetric": {
    "value": "+47%",
    "label": "Task completion rate",
    "context": "measured across 12,000 sessions, 4 weeks post-launch"
  },
  "items": [
    {
      "label": "Role",
      "value": "Lead Product Designer"
    },
    {
      "label": "Timeline",
      "value": "6 weeks · Q1 2025"
    },
    {
      "label": "Team",
      "value": "1 PM · 2 eng · 1 researcher"
    },
    {
      "label": "Tools",
      "value": "Figma · Maze · Notion"
    },
    {
      "label": "Client",
      "value": "Align Technology"
    },
    {
      "label": "Project type",
      "value": "B2B clinical SaaS"
    }
  ],
  "methodology": {
    "name": "Double Diamond",
    "phases": [
      {
        "name": "Discover",
        "description": "Stakeholder interviews + analytics audit (see Research section)"
      },
      {
        "name": "Define",
        "description": "Reframed problem + success criteria (see Define section)"
      },
      {
        "name": "Develop",
        "description": "Concept exploration + iteration (see Process section)"
      },
      {
        "name": "Deliver",
        "description": "Hi-fi prototypes + dev handoff (see Solution section)"
      }
    ]
  }
}
```

---
## `chapter` — renders type `chapter`
**Purpose:** Visual section divider that separates major chapters of a case study.
**When to use:** Before starting a new major section (e.g., Research, Design, Testing, Results). Helps structure long presentations.
**Word budget (on-screen prose):** ~18 words — keep it scannable in seconds.
**Required fields:** number, title
**Optional fields:** subtitle
**Choose this when the content reads like:** chapter break · section divider · new section · phase transition
**Content limits:**
- number: rec 2 digits (01, 02, etc.)
- title: rec 1-3 words
- subtitle: rec 1 short sentence
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "chapter",
  "number": "01",
  "title": "Research",
  "subtitle": "Understanding the problem space"
}
```

---
## `media` — renders type `media`
**Purpose:** Display any media type prominently — images, videos, GIFs, embedded Figma prototypes, or YouTube videos.
**When to use:** When a screenshot, diagram, photo, video walkthrough, Figma prototype, or YouTube video needs to be the star of the slide.
**Word budget (on-screen prose):** ~35 words — keep it scannable in seconds.
**Required fields:** image
**Optional fields:** label, title, caption, description, bullets, bulletsTitle, highlight
**Media fields:** image
**Choose this when the content reads like:** full image · screenshot · diagram · photo · visual showcase · single image · video · demo · Figma prototype
**Content limits:**
- images: max 3; Up to 3 media items via DynamicImages. Supports image upload, Figma embed, website embed, video (MP4/WebM), GIF, and video URL embed.
- caption: rec 1 sentence
- bullets: max 6
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "media",
  "label": "Final Design",
  "title": "The new toolbar in action",
  "image": "",
  "caption": "Screenshot of the redesigned scanning toolbar during a live session."
}
```

---
## `imageMosaic` — renders type `imageMosaic`
**Purpose:** Create a visually striking mosaic of images with a title overlay. Good for showing collections or old versions.
**When to use:** When you want to showcase multiple screenshots, screens, or visual artifacts in an artistic tiled layout.
**Word budget (on-screen prose):** ~8 words — keep it scannable in seconds.
**Required fields:** title
**Optional fields:** images
**Media fields:** images
**Choose this when the content reads like:** image mosaic · screen collection · visual overview · old version screenshots · gallery
**Content limits:**
- title: rec 1-3 words
- images: rec 3-8 images; max 24; Images repeat to fill 24 tiles automatically
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "imageMosaic",
  "title": "Old version",
  "images": []
}
```

---
## `textAndImage` — renders type `problem`
**Purpose:** The go-to slide template for most case study content. Pairs text (label, title, paragraphs, two bullet lists, conclusion, highlight) with media (images, videos, Figma embeds, YouTube embeds). Works for problem statements, context, features, testing results, and more — use it whenever content doesn't fit a more specialized template.
**When to use:** Your default choice for most slides. Use for background context, problem statements, feature explanations, testing results, design rationale, research findings, or any content that benefits from a text + image layout. If unsure which template to use, start here.
**Word budget (on-screen prose):** ~75 words — keep it scannable in seconds.
**Required fields:** title
**Optional fields:** label, content, issues, issuesTitle, bullets2, bullets2Title, conclusion, highlight, image, splitRatio
**Media fields:** image
**Choose this when the content reads like:** problem statement · context with image · background · testing results · feature explanation · text and image
**Content limits:**
- content: rec 1-3 sentences
- issues: rec 3-5 bullets, 5-10 words each; max 8; First bullet list (called "issues" for historical reasons)
- bullets2: rec 3-4 bullets; max 6; Second optional bullet list
- conclusion: rec 1-2 sentences
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "problem",
  "label": "The Problem",
  "title": "Clinicians lose focus during scans",
  "content": "The current toolbar requires too many clicks to access common tools.",
  "issues": [
    "Average 12 clicks per scan session",
    "Tools hidden in nested menus",
    "No contextual awareness"
  ],
  "issuesTitle": "Pain points",
  "image": "",
  "splitRatio": 50
}
```

---
## `issuesBreakdown` — renders type `issuesBreakdown`
**Purpose:** Break down multiple issues or problems into a visual numbered grid.
**When to use:** When presenting 2-4 specific issues, problems, or pain points that benefit from structured, numbered presentation.
**Word budget (on-screen prose):** ~95 words — keep it scannable in seconds.
**Required fields:** title, issues
**Optional fields:** label, subtitle, description, cardsTitle, gridColumns, highlight, cardVariant, showNumbers
**Choose this when the content reads like:** issues breakdown · problems list · pain points grid · what went wrong · what started to break
**Content limits:**
- issues: rec 3-4 issues; max 8; Each issue is { number, title, description }
- description: rec 1-2 sentences
- gridColumns: max 4
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "issuesBreakdown",
  "label": "The Context",
  "title": "What started to break",
  "issues": [
    {
      "number": "1",
      "title": "Slow scan workflow",
      "description": "Too many steps to complete a basic scan"
    },
    {
      "number": "2",
      "title": "Hidden tools",
      "description": "Critical tools buried in menus"
    },
    {
      "number": "3",
      "title": "No phase awareness",
      "description": "Same tools shown regardless of scan stage"
    },
    {
      "number": "4",
      "title": "Error-prone",
      "description": "Easy to select wrong tool during procedures"
    }
  ]
}
```

---
## `quotes` — renders type `quotes`
**Purpose:** Present user research quotes in visually distinct cards.
**When to use:** After conducting user interviews or surveys, to showcase direct user quotes that support your findings.
**Word budget (on-screen prose):** ~110 words — keep it scannable in seconds.
**Required fields:** quotes
**Optional fields:** label, title, content, gridColumns, bullets, bulletsTitle, highlight, cardVariant
**Choose this when the content reads like:** user quotes · research quotes · what users said · interview findings · testimonials grid
**Content limits:**
- quotes: rec 2-4 quotes; max 8; Each quote is { text, author }
- content: rec 1-2 sentences of intro
- gridColumns: max 4
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "quotes",
  "label": "User Research",
  "title": "What clinicians told us",
  "quotes": [
    {
      "text": "I spend more time looking for tools than actually scanning.",
      "author": "Dr. Sarah M."
    },
    {
      "text": "The toolbar feels like it was designed by engineers, not for us.",
      "author": "Dr. James K."
    }
  ]
}
```

---
## `testimonial` — renders type `testimonial`
**Purpose:** Feature a single powerful quote or testimonial with maximum visual impact.
**When to use:** When a single quote is important enough to deserve its own slide. Use for stakeholder quotes, key user feedback, or impactful statements.
**Word budget (on-screen prose):** ~45 words — keep it scannable in seconds.
**Required fields:** quote, author
**Optional fields:** label, role, context, highlight
**Choose this when the content reads like:** single testimonial · standout quote · key feedback · stakeholder quote · featured quote
**Content limits:**
- quote: rec 1-3 sentences
- role: rec Job title, Company
- context: rec 1 sentence of context
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "testimonial",
  "quote": "The new toolbar feels like it reads my mind. I barely touch it during scans now.",
  "author": "Dr. Sarah Mitchell",
  "role": "Orthodontist, ClearSmile Clinic"
}
```

---
## `goals` — renders type `goals`
**Purpose:** Present project goals as numbered cards with optional KPI section.
**When to use:** When defining what the project aimed to achieve. Great for showing goals alongside measurable KPIs.
**Word budget (on-screen prose):** ~100 words — keep it scannable in seconds.
**Required fields:** title, goals
**Optional fields:** label, description, goalsCardsTitle, gridColumns, showGoalsSection, kpis, kpisGridColumns, showKpisSection, highlight, cardVariant, showNumbers
**Choose this when the content reads like:** project goals · objectives · what we wanted to achieve · KPIs · success criteria
**Content limits:**
- goals: rec 3-5 goals; max 8; Each goal is { number, title, description }
- kpis: rec 3-4 KPIs; max 8; String or { text, description } object
- gridColumns: max 4
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "goals",
  "label": "Goals",
  "title": "What we wanted to achieve",
  "goals": [
    {
      "number": "1",
      "title": "Speed",
      "description": "Reduce average scan time by 30%"
    },
    {
      "number": "2",
      "title": "Accuracy",
      "description": "Cut rescan rate in half"
    }
  ],
  "kpis": [
    "Task completion time",
    "Error rate",
    {
      "text": "User satisfaction",
      "description": "Measured via post-session survey"
    }
  ]
}
```

---
## `achieveGoals` — renders type `achieveGoals`
**Purpose:** Present goals in a structured two-column format separating qualitative goals from quantitative metrics.
**When to use:** When you want to show KPIs alongside metrics, or split goals into two categories.
**Word budget (on-screen prose):** ~85 words — keep it scannable in seconds.
**Required fields:** title, leftColumn, rightColumn
**Optional fields:** label, description, highlight
**Choose this when the content reads like:** KPIs and metrics · two-column goals · goals with metrics · achievement goals
**Content limits:**
- leftColumn: max 6; { title, goals: [{ number, text }] }
- rightColumn: max 6; { title, goals: [{ number, text }] }
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "achieveGoals",
  "label": "Defining goals",
  "title": "What did we want to achieve?",
  "leftColumn": {
    "title": "KPIs",
    "goals": [
      {
        "number": "1",
        "text": "Reduce scan time by 30%"
      },
      {
        "number": "2",
        "text": "Improve first-try success rate"
      }
    ]
  },
  "rightColumn": {
    "title": "Key metrics",
    "goals": [
      {
        "number": "1",
        "text": "Task completion time"
      },
      {
        "number": "2",
        "text": "Error rate per session"
      }
    ]
  }
}
```

---
## `process` — renders type `process`
**Purpose:** Show a sequential process or workflow as numbered steps.
**When to use:** When describing a design process, workflow, methodology, or any sequential series of steps.
**Word budget (on-screen prose):** ~85 words — keep it scannable in seconds.
**Required fields:** title, steps
**Optional fields:** label, highlight, cardVariant, showNumbers
**Choose this when the content reads like:** process · workflow · methodology · design process · how we did it · steps
**Content limits:**
- steps: rec 3-5 steps; max 8; Each step is { number, title, description }
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "process",
  "label": "Process",
  "title": "How we got there",
  "steps": [
    {
      "number": "01",
      "title": "Research",
      "description": "User interviews and clinical observations"
    },
    {
      "number": "02",
      "title": "Define",
      "description": "Problem framing and opportunity mapping"
    },
    {
      "number": "03",
      "title": "Design",
      "description": "Wireframes, prototypes, and iteration"
    },
    {
      "number": "04",
      "title": "Test",
      "description": "Usability testing with 12 clinicians"
    }
  ]
}
```

---
## `timeline` — renders type `timeline`
**Purpose:** Display chronological events, milestones, or phases on a timeline.
**When to use:** When showing project phases, milestones, or a chronological sequence of events.
**Word budget (on-screen prose):** ~95 words — keep it scannable in seconds.
**Required fields:** title, events
**Optional fields:** label, highlight
**Choose this when the content reads like:** timeline · chronological · milestones · project phases · project journey · schedule
**Content limits:**
- events: rec 4-6 events; max 10; Each event is { date, title, description }
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "timeline",
  "label": "Timeline",
  "title": "Project Journey",
  "events": [
    {
      "date": "Week 1-2",
      "title": "Discovery",
      "description": "Shadowed clinicians, interviewed 15 users"
    },
    {
      "date": "Week 3-4",
      "title": "Design",
      "description": "Created wireframes and interactive prototypes"
    },
    {
      "date": "Week 5",
      "title": "Testing",
      "description": "Ran usability tests with 8 clinicians"
    },
    {
      "date": "Week 6",
      "title": "Handoff",
      "description": "Final specs and design system documentation"
    }
  ]
}
```

---
## `comparison` — renders type `comparison`
**Purpose:** Show a visual comparison between states. Supports three modes: simple (side-by-side columns), before-after (toggle switcher between two views), and tabs (multi-tab switcher for 2–6 panels). Each mode has its own switcher style option (pill or flat tabs).
**When to use:** When demonstrating any transformation or comparison — UI redesigns, process changes, A/B tests, multi-step solutions, or problem-to-solution stories. Use "simple" for side-by-side, "before-after" for a toggle between two states, or "tabs" for multi-panel comparisons.
**Word budget (on-screen prose):** ~110 words — keep it scannable in seconds.
**Required fields:** beforeImage, afterImage
**Optional fields:** label, title, description, beforeLabel, afterLabel, beforeDescription, afterDescription, beforeBullets, beforeBulletsTitle, afterBullets, afterBulletsTitle, bullets, bulletsTitle, highlight
**Media fields:** beforeImage, afterImage
**Choose this when the content reads like:** before after · comparison · transformation · old vs new · visual diff · redesign · problem solution · challenge solution · improvement
**Content limits:**
- beforeLabel: rec 1-2 words (e.g., "Before", "Old UI", "Problem")
- afterLabel: rec 1-2 words (e.g., "After", "New UI", "Solution")
- beforeDescription: rec 1-3 sentences describing the before state
- afterDescription: rec 1-3 sentences describing the after state
- beforeBullets: rec 3-5 bullets listing problems or old-state details; max 6
- afterBullets: rec 3-5 bullets listing improvements or new-state details; max 6
- bullets: max 6; Shared bullets below both columns for overall summary
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "comparison",
  "label": "Before & After",
  "title": "The Transformation",
  "description": "A complete redesign of the scanning toolbar.",
  "beforeImage": "",
  "afterImage": "",
  "beforeLabel": "Before",
  "afterLabel": "After",
  "beforeDescription": "Static toolbar with all tools visible, causing cognitive overload.",
  "afterDescription": "Phase-aware toolbar showing only relevant tools for the current task.",
  "beforeBullets": [
    "40+ tools visible",
    "No contextual awareness",
    "Frequent errors"
  ],
  "beforeBulletsTitle": "Issues",
  "afterBullets": [
    "Phase-aware filtering",
    "70% fewer visible tools",
    "Faster completion"
  ],
  "afterBulletsTitle": "Improvements",
  "highlight": "Task completion time decreased by 40% after the redesign."
}
```

---
## `tools` — renders type `tools`
**Purpose:** Display the tools, technologies, or methods used in a project.
**When to use:** When listing the tools and technologies used. Good for a "Built With" or "Tools & Methods" section.
**Word budget (on-screen prose):** ~60 words — keep it scannable in seconds.
**Required fields:** title, tools
**Optional fields:** label, highlight
**Choose this when the content reads like:** tools used · technologies · built with · methods · tech stack
**Content limits:**
- tools: rec 4-8 tools; max 12; Each tool is { name, description }
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "tools",
  "label": "Tools & Tech",
  "title": "Built With",
  "tools": [
    {
      "name": "Figma",
      "description": "Design & Prototyping"
    },
    {
      "name": "Maze",
      "description": "Usability Testing"
    },
    {
      "name": "Miro",
      "description": "Workshops & Mapping"
    }
  ]
}
```

---
## `stats` — renders type `stats`
**Purpose:** Showcase key metrics and numbers with visual impact.
**When to use:** When presenting quantitative results, KPIs, or impact metrics. Numbers should be impressive and meaningful.
**Word budget (on-screen prose):** ~45 words — keep it scannable in seconds.
**Required fields:** stats
**Optional fields:** label, title, description, highlight, gridColumns
**Choose this when the content reads like:** metrics · statistics · numbers · impact · results data · KPI values · quantitative results
**Content limits:**
- stats: rec 3-4 stats; max 6; Each stat is { value, label, suffix (optional) }
- description: rec 1-2 paragraphs of context
- gridColumns: max 4
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "stats",
  "label": "Results",
  "title": "Impact Metrics",
  "stats": [
    {
      "value": "40%",
      "label": "Faster scan time"
    },
    {
      "value": "60%",
      "label": "Fewer rescans"
    },
    {
      "value": "92%",
      "label": "Clinician satisfaction"
    }
  ]
}
```

---
## `outcomes` — renders type `outcomes`
**Purpose:** Present outcomes and learnings with optional quantitative metrics in a structured card grid.
**When to use:** When summarizing project outcomes, results, or key learnings — supports both qualitative descriptions and quantitative metrics (e.g. "40%", "3x", "10min").
**Word budget (on-screen prose):** ~95 words — keep it scannable in seconds.
**Required fields:** outcomes
**Optional fields:** label, title, highlight, cardVariant, showNumbers
**Choose this when the content reads like:** outcomes · results · learnings · what we achieved · qualitative results · metrics · impact numbers
**Content limits:**
- outcomes: rec 2-4 outcomes; max 6; Each outcome is { title, description, metric? }. metric is optional — a short value like "40%", "3x", "↑60%", "10min".
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "outcomes",
  "label": "Outcomes",
  "title": "Results & Learnings",
  "outcomes": [
    {
      "title": "Faster workflows",
      "description": "Clinicians complete scans 40% faster with the new toolbar.",
      "metric": "40%"
    },
    {
      "title": "Higher confidence",
      "description": "Reduced rescan rate indicates better first-try accuracy.",
      "metric": "3x"
    }
  ]
}
```

---
## `end` — renders type `end`
**Purpose:** Closing slide for the case study with a call to action.
**When to use:** Always the last slide of every case study. Provides a closing message and contact CTA.
**Word budget (on-screen prose):** ~18 words — keep it scannable in seconds.
**Required fields:** title
**Optional fields:** subtitle, cta, buttons, email, phone, linkedinUrl
**Choose this when the content reads like:** ending · thank you · conclusion · closing slide · contact
**Content limits:**
- title: rec 1-3 words (e.g., "Thank You")
- subtitle: rec 1 sentence
- buttons: max 3; Array of { text, link }
- email: Email address — renders as mailto link with envelope icon
- phone: Phone number — renders as tel link with phone icon
- linkedinUrl: Full LinkedIn URL — renders as clickable link with LinkedIn icon
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "end",
  "title": "Thank You",
  "subtitle": "Want to work together?",
  "cta": "Get in touch",
  "email": "lior@example.com",
  "phone": "+972 123 456 789",
  "linkedinUrl": "https://linkedin.com/in/liorbaum"
}
```

---
## `directions` (picker label: "Ideation") — renders type `directions`
**Purpose:** Make divergence + convergence visible. Senior signal: showing the directions you explored and which you accepted vs rejected is strong evidence of design judgment.
**When to use:** Between Define and Process. Strong senior signal — without it, the chosen design can look arbitrary.
**Word budget (on-screen prose):** ~90 words — keep it scannable in seconds.
**Required fields:** title, directionCount
**Optional fields:** label, dir1Image, dir1Status, dir1Desc, dir2Image, dir2Status, dir2Desc, dir3Image, dir3Status, dir3Desc
**Media fields:** dir1Image, dir2Image, dir3Image
**Choose this when the content reads like:** ideation · directions explored · concepts · design directions · divergent thinking · options considered
**Content limits:**
- directionCount: max 3; Number of direction columns to render (2 or 3).
- dir1Desc: rec 1-2 sentences describing the direction and why it was kept or set aside
- dir1Status: 'accepted' or 'rejected' — controls the chip style (accent pill vs glass chip)
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "directions",
  "label": "Ideation",
  "title": "Directions explored",
  "directionCount": 3,
  "dir1Status": "rejected",
  "dir1Desc": "Direction A — explored but set aside.",
  "dir2Status": "rejected",
  "dir2Desc": "Direction B — explored but set aside.",
  "dir3Status": "accepted",
  "dir3Desc": "Chosen direction — best balance of user value and feasibility."
}
```

---
## `reflection` — renders type `reflection`
**Purpose:** Senior signal. Recruiters distrust designers who can't critique their own work — this section is where seniority becomes visible.
**When to use:** Final or near-final slide. Required for any portfolio aiming above mid-level.
**Word budget (on-screen prose):** ~100 words — keep it scannable in seconds.
**Required fields:** title, whatWorked, whatFailed, whatYoudDoDifferently
**Optional fields:** label, whatYouLearned, whatYouCouldntMeasure, nextIteration
**Choose this when the content reads like:** reflection · lessons learned · what i learned · retrospective · self-awareness
**Content limits:**
- whatWorked: rec 1-2 specific things — not platitudes; max 3
- whatFailed: rec Be specific. "Scoped X late" beats "communication could have been better"; max 3
- whatYoudDoDifferently: rec Concrete actions, not aspirations; max 3
- whatYouLearned: rec One paragraph naming a transferable insight
- whatYouCouldntMeasure: rec Acknowledges what data you didn't have — maturity signal
**Skeleton (copy for insert/retype; replace text with `[FILL IN: …]`):**
```json
{
  "type": "reflection",
  "label": "Reflection",
  "title": "What I'd do differently",
  "whatWorked": [
    "Early test rounds caught the inverted mental model in week 2"
  ],
  "whatFailed": [
    "Scoped personas too late — they post-rationalized decisions"
  ],
  "whatYoudDoDifferently": [
    "Pair with engineering before final designs, not after"
  ],
  "whatYouLearned": "Stakeholder alignment is more about cadence than artifacts.",
  "whatYouCouldntMeasure": "Long-term retention impact — would need 6+ months of post-launch data.",
  "nextIteration": "A/B test the simpler reduced-density version against current production."
}
```

