// Human-authored documentation metadata for each slide template.
// The documentation page merges this with auto-derived field info from slideTemplates.
// If a template is missing here, it still appears on the docs page with auto-derived data + a warning.

export const slideTemplateDocs = {

  // ─── INTRODUCTION ───────────────────────────────────────────────

  intro: {
    shortDescription: 'Project hero slide: title, vivid description, role/timeline/team/tools, optional headline metric, hero image.',
    purpose: 'Opening slide. Front-loads role + timeline + impact in the first 3 lines so reviewers can infer seniority before they invest time reading further.',
    whenToUse: 'Always the first slide of every case study. Every presentation should begin with one.',
    layoutDescription: 'Split layout: left = circular logo chip, title, subtitle, description, headline metric, and a divider-line meta table (label left / value right, one row per item). Right = a tinted media panel that bleeds to the slide edge, holding the hero image inside a phone/device frame. Split ratio adjustable.',
    mediaFields: [
      { field: 'image', type: 'image gallery (up to 3 grid / 5 carousel)', description: 'Right side of the split layout. Use a single 16:9 hero image (1920px wide recommended) that captures the essence of the solution — not a generic stock photo or overly stylized scene. Multi-image grid/carousel also supported.' },
      { field: 'logo', type: 'logo image', description: 'Optional project/company logo. introHeaderMode controls placement.' },
    ],
    requiredFields: ['title', 'description', 'metaItems'],
    optionalFields: ['subtitle', 'clientLabel', 'client', 'focusLabel', 'focus', 'logo', 'introHeaderMode', 'splitRatio', 'cta', 'headlineMetric'],
    contentLimits: {
      title: { recommended: '2-4 words, supports line breaks with \\n' },
      description: { recommended: 'Open with a single vivid sentence establishing user pain & stakes. 1-2 sentences total.', max: '3 sentences' },
      metaItems: { max: 5, recommended: '4 items: Role, Timeline, Team, Tools (+ optionally Project type)', note: 'Array of { label, value } pairs. Front-loads seniority signals — required for senior portfolios.' },
      headlineMetric: { recommended: '{ value, label, context } — the single most impressive quantified outcome. Hiring managers decide in 6 seconds whether to keep reading.' },
      cta: { note: 'Optional { label, url } call-to-action button.' },
    },
    aiSelectionHints: {
      signals: ['project introduction', 'case study opening', 'hero slide', 'project title', 'project overview'],
      priority: 1,
      required: true,
    },
    specialBehaviors: [
      'View mode: the logo renders as a circular chip; metaItems render as a divider-line table (muted label / dark value per row), not a horizontal strip',
      'Right column is a warm tinted panel (accent wash) that full-bleeds to the slide edge, with the image inside a phone/device frame',
      'headlineMetric renders as an accent-bordered banner between description and meta with massive value + label + context line',
      'introHeaderMode: "both" shows title + logo at bottom; "logo" places logo in the title position',
      'splitRatio controls left/right column widths (default 50/50)',
      'Image area supports grid mode (up to 3 items) or carousel mode (up to 5 items)',
    ],
    exampleUsage: {
      type: 'intro',
      title: 'iTero\\nToolbar',
      description: 'Clinicians lost seconds re-aiming the scanner mid-procedure — a dropped scan meant restarting the patient session.',
      metaItems: [
        { label: 'Role', value: 'Lead Product Designer' },
        { label: 'Timeline', value: '6 weeks · Q1 2025' },
        { label: 'Team', value: '1 PM · 2 eng · 1 researcher' },
        { label: 'Tools', value: 'Figma · Maze · Notion' },
      ],
      headlineMetric: { value: '−63%', label: 'Time-to-rescan', context: 'measured across 1,200 sessions, 4 weeks post-launch' },
      logo: '',
      introHeaderMode: 'both',
      splitRatio: 50,
    },
  },

  info: {
    shortDescription: 'Project overview slide: hook sentence, headline impact metric, metadata grid, methodology with phase breakdown.',
    purpose: 'Sit-after-the-intro slide that primes evaluators on the structure: pain → impact → who/when/how → methodology phases mapped to the case study itself.',
    whenToUse: 'Right after the intro slide. Required for senior portfolios — without methodology + headline metric this slide reads as junior.',
    layoutDescription: 'Vertical stack: label → title → vivid hook sentence → headline metric banner → metadata grid (label/value) → methodology block (named methodology + numbered phases) → optional bullets / highlight.',
    mediaFields: [],
    requiredFields: ['title', 'items'],
    optionalFields: ['intro', 'headlineMetric', 'methodology', 'bullets', 'bulletsTitle', 'highlight', 'cta'],
    contentLimits: {
      intro: { recommended: 'A single vivid sentence (15-25 words) establishing user pain and stakes — make readers care before showing project details.' },
      headlineMetric: { recommended: '{ value, label, context } — leads the 6-second scan. Pair with context (sample size, time frame).' },
      items: { max: 6, recommended: '4-6 items: Role, Timeline, Team, Tools, Client, Project type', note: 'Each item is { label, value }. Cover what reviewers infer seniority from.' },
      methodology: { recommended: '{ name: "Double Diamond" | "Design Thinking" | etc, phases: [{ name, description }] } — name the methodology upfront and link each phase to a case study section.' },
      'methodology.phases': { max: 5, recommended: '4 phases (Discover/Define/Develop/Deliver, or your own)' },
      bullets: { max: 8, recommended: '3-5 bullets' },
    },
    aiSelectionHints: {
      signals: ['project overview', 'project details', 'role', 'duration', 'deliverables', 'methodology', 'process overview', 'tldr'],
      priority: 2,
    },
    specialBehaviors: [
      'intro renders as a display-font hook with an accent left border above the metadata',
      'headlineMetric renders as an accent-bordered banner with massive value + label + context',
      'methodology renders as a labeled section with numbered phase cards — primes reviewers on the case study structure',
      'Items render in a responsive grid below the metric',
    ],
    exampleUsage: {
      type: 'info',
      title: 'Project Overview',
      intro: 'Clinicians were abandoning live patient scans 23% of the time — every dropped scan was a restarted appointment and a lost minute of chair time.',
      headlineMetric: { value: '+47%', label: 'Task completion rate', context: 'measured across 12,000 sessions, 4 weeks post-launch' },
      items: [
        { label: 'Role', value: 'Lead Product Designer' },
        { label: 'Timeline', value: '6 weeks · Q1 2025' },
        { label: 'Team', value: '1 PM · 2 eng · 1 researcher' },
        { label: 'Tools', value: 'Figma · Maze · Notion' },
        { label: 'Client', value: 'Align Technology' },
        { label: 'Project type', value: 'B2B clinical SaaS' },
      ],
      methodology: {
        name: 'Double Diamond',
        phases: [
          { name: 'Discover', description: 'Stakeholder interviews + analytics audit (see Research section)' },
          { name: 'Define',   description: 'Reframed problem + success criteria (see Define section)' },
          { name: 'Develop',  description: 'Concept exploration + iteration (see Process section)' },
          { name: 'Deliver',  description: 'Hi-fi prototypes + dev handoff (see Solution section)' },
        ],
      },
    },
  },

  chapter: {
    shortDescription: 'Section divider slide with large number, title, and optional subtitle. Use to separate case study chapters.',
    purpose: 'Visual section divider that separates major chapters of a case study.',
    whenToUse: 'Before starting a new major section (e.g., Research, Design, Testing, Results). Helps structure long presentations.',
    layoutDescription: 'Left-aligned, vertically centered group: a large solid-accent index number with a short rule beneath it, then a Display-size title, then an optional subtitle. A soft accent wash bleeds in from the right edge.',
    mediaFields: [],
    requiredFields: ['number', 'title'],
    optionalFields: ['subtitle'],
    contentLimits: {
      number: { recommended: '2 digits (01, 02, etc.)' },
      title: { recommended: '1-3 words' },
      subtitle: { recommended: '1 short sentence' },
    },
    aiSelectionHints: {
      signals: ['chapter break', 'section divider', 'new section', 'phase transition'],
      priority: 3,
    },
    specialBehaviors: [
      'View mode: the number is a large solid-accent index (not a faint watermark) sitting tight above the title with a short accent rule between',
      'Minimal content — used purely as a structural divider',
    ],
    exampleUsage: {
      type: 'chapter',
      number: '01',
      title: 'Research',
      subtitle: 'Understanding the problem space',
    },
  },

  // ─── VISUAL ─────────────────────────────────────────────────────

  media: {
    shortDescription: 'Full media slide supporting images, videos, GIFs, Figma embeds, YouTube embeds, and website embeds with optional label, title, caption, description, and bullets.',
    purpose: 'Display any media type prominently — images, videos, GIFs, embedded Figma prototypes, or YouTube videos.',
    whenToUse: 'When a screenshot, diagram, photo, video walkthrough, Figma prototype, or YouTube video needs to be the star of the slide.',
    layoutDescription: 'Section label and title at top, full-width media gallery area (up to 3 items in grid mode, or up to 5 in carousel mode), optional caption, description, and bullets below.',
    mediaFields: [
      { field: 'image', type: 'media gallery (up to 3 grid / 5 carousel)', description: 'Full-width media area. Supports images, videos (MP4/WebM), GIFs, Figma embeds (interactive iframe), website embeds (iframe), and YouTube embeds (auto-plays muted and loops). Each item has configurable object-fit, position, wrapper background toggle, and optional caption. Gallery can display as grid (1-3 columns) or carousel (auto-advancing slideshow).' },
    ],
    requiredFields: ['image'],
    optionalFields: ['label', 'title', 'caption', 'description', 'bullets', 'bulletsTitle', 'highlight'],
    contentLimits: {
      images: { max: 3, note: 'Up to 3 media items via DynamicImages. Supports image upload, Figma embed, website embed, video (MP4/WebM), GIF, and video URL embed.' },
      caption: { recommended: '1 sentence' },
      bullets: { max: 6 },
    },
    aiSelectionHints: {
      signals: ['full image', 'screenshot', 'diagram', 'photo', 'visual showcase', 'single image', 'video', 'demo', 'Figma prototype'],
      priority: 5,
    },
    specialBehaviors: [
      'Two display modes: grid (up to 3 items, 1-3 columns) and carousel (up to 5 items, auto-advancing slideshow with dots, arrows, and speed control)',
      'Accepted media types: images, videos (MP4/WebM), GIFs, Figma embeds, website embeds, YouTube embeds',
      'YouTube embeds: paste any YouTube URL or <iframe> code — auto-plays muted, loops, with minimal branding',
      'Image compression: 10MB max for images, 100MB for video, 40MB for GIFs',
      'Figma embeds: paste Figma prototype URL, rendered as interactive iframe',
      'Object-fit (Fill/Fit) and position (center/top/bottom) are configurable per item',
      'Wrapper background toggle (BG): adds a secondary background with padding and 16px border-radius behind each media item',
      'Carousel mode has global Fill/Fit and BG toggles that apply to all slides',
      'Single images show both Replace and Remove buttons on hover',
    ],
    exampleUsage: {
      type: 'media',
      label: 'Final Design',
      title: 'The new toolbar in action',
      image: '',
      caption: 'Screenshot of the redesigned scanning toolbar during a live session.',
    },
  },

  imageMosaic: {
    shortDescription: 'Tiled image grid background with a centered title overlay.',
    purpose: 'Create a visually striking mosaic of images with a title overlay. Good for showing collections or old versions.',
    whenToUse: 'When you want to showcase multiple screenshots, screens, or visual artifacts in an artistic tiled layout.',
    layoutDescription: '6x4 tile mosaic fills the background. Images repeat to fill all 24 tiles. A centered title overlays the mosaic.',
    mediaFields: [
      { field: 'images', type: 'image array (up to 24)', description: 'Array of image files. Images are tiled across a 6x4 grid (24 tiles) — images repeat to fill all tiles. Supports bulk upload of multiple images at once. Compressed automatically.' },
    ],
    requiredFields: ['title'],
    optionalFields: ['images'],
    contentLimits: {
      title: { recommended: '1-3 words' },
      images: { max: 24, recommended: '3-8 images', note: 'Images repeat to fill 24 tiles automatically' },
    },
    aiSelectionHints: {
      signals: ['image mosaic', 'screen collection', 'visual overview', 'old version screenshots', 'gallery'],
      priority: 7,
    },
    specialBehaviors: [
      'Always renders 24 tiles regardless of input image count',
      'Images cycle and repeat to fill all tiles',
      'Title appears centered with a semi-transparent overlay',
    ],
    exampleUsage: {
      type: 'imageMosaic',
      title: 'Old version',
      images: [],
    },
  },

  // ─── RESEARCH ───────────────────────────────────────────────────

  textAndImage: {
    shortDescription: 'The most versatile slide — split layout with text on the left and image/media on the right. Fits almost any content type.',
    purpose: 'The go-to slide template for most case study content. Pairs text (label, title, paragraphs, two bullet lists, conclusion, highlight) with media (images, videos, Figma embeds, YouTube embeds). Works for problem statements, context, features, testing results, and more — use it whenever content doesn\'t fit a more specialized template.',
    whenToUse: 'Your default choice for most slides. Use for background context, problem statements, feature explanations, testing results, design rationale, research findings, or any content that benefits from a text + image layout. If unsure which template to use, start here.',
    layoutDescription: 'Split layout: left side has section label, title, body text, up to two bullet lists, optional conclusion and highlight. Right side has an image/media gallery (up to 3). Split ratio adjustable.',
    mediaFields: [
      { field: 'image', type: 'image gallery (up to 3 grid / 5 carousel)', description: 'Right side of the split layout. Supports multiple images, Figma embeds, website embeds (iframe), YouTube embeds (auto-plays muted and loops), videos (MP4/WebM), and GIFs. Configurable object-fit, position, and wrapper background. Gallery can display as grid or carousel. Split ratio adjustable (20-80%).' },
    ],
    requiredFields: ['title'],
    optionalFields: ['label', 'content', 'issues', 'issuesTitle', 'bullets2', 'bullets2Title', 'conclusion', 'highlight', 'image', 'splitRatio'],
    contentLimits: {
      content: { recommended: '1-3 sentences' },
      issues: { max: 8, recommended: '3-5 bullets, 5-10 words each', note: 'First bullet list (called "issues" for historical reasons)' },
      bullets2: { max: 6, recommended: '3-4 bullets', note: 'Second optional bullet list' },
      conclusion: { recommended: '1-2 sentences' },
    },
    aiSelectionHints: {
      signals: ['problem statement', 'context with image', 'background', 'testing results', 'feature explanation', 'text and image'],
      priority: 4,
    },
    specialBehaviors: [
      'Renders as type "problem" internally but works for any split-layout content',
      'Also handles types: context, testing, feature (same template, different field aliases)',
      'Supports two independent bullet lists with separate titles',
      'Split ratio adjustable (20-80%)',
      'Image area supports grid mode (up to 3 items) or carousel mode (up to 5 items with auto-advance)',
      'Accepted media: images, Figma embeds, website embeds, YouTube embeds, videos (MP4/WebM), GIFs',
      'Per-image controls: Fill/Fit, wrapper background toggle, position, size',
    ],
    exampleUsage: {
      type: 'problem',
      label: 'The Problem',
      title: 'Clinicians lose focus during scans',
      content: 'The current toolbar requires too many clicks to access common tools.',
      issues: ['Average 12 clicks per scan session', 'Tools hidden in nested menus', 'No contextual awareness'],
      issuesTitle: 'Pain points',
      image: '',
      splitRatio: 50,
    },
  },

  issuesBreakdown: {
    shortDescription: 'Issues displayed in a configurable grid with numbered circles. Supports card style variants and show/hide numbers.',
    purpose: 'Break down multiple issues or problems into a visual numbered grid.',
    whenToUse: 'When presenting 2-4 specific issues, problems, or pain points that benefit from structured, numbered presentation.',
    layoutDescription: 'Label, title, optional subtitle and description at top. Numbered issue cards in a configurable grid (1-4 columns). Optional CTA and highlight. Cards match the service card UI style with accent border and hover lift.',
    mediaFields: [],
    requiredFields: ['title', 'issues'],
    optionalFields: ['label', 'subtitle', 'description', 'cardsTitle', 'gridColumns', 'highlight', 'cardVariant', 'showNumbers'],
    contentLimits: {
      issues: { max: 8, recommended: '3-4 issues', note: 'Each issue is { number, title, description }' },
      description: { recommended: '1-2 sentences' },
      gridColumns: { default: 2, max: 4 },
    },
    aiSelectionHints: {
      signals: ['issues breakdown', 'problems list', 'pain points grid', 'what went wrong', 'what started to break'],
      priority: 5,
    },
    specialBehaviors: [
      'Issues render as cards with accent-filled number circles',
      'Grid columns configurable (1-4)',
      'Each issue has number, title, and optional description',
      'cardVariant: "default" (accent border), "minimal" (subtle border, plain accent numbers), or "clean" (no borders, bottom divider only)',
      'showNumbers: set to false to hide number circles from cards',
    ],
    exampleUsage: {
      type: 'issuesBreakdown',
      label: 'The Context',
      title: 'What started to break',
      issues: [
        { number: '1', title: 'Slow scan workflow', description: 'Too many steps to complete a basic scan' },
        { number: '2', title: 'Hidden tools', description: 'Critical tools buried in menus' },
        { number: '3', title: 'No phase awareness', description: 'Same tools shown regardless of scan stage' },
        { number: '4', title: 'Error-prone', description: 'Easy to select wrong tool during procedures' },
      ],
    },
  },

  splitList: {
    shortDescription: 'Editorial split: a big section title on the left, a scannable list on the right. Switch between simple list, two columns, or a single highlight paragraph.',
    purpose: 'Lay out a short set of related points (or one key takeaway) against a prominent section title.',
    whenToUse: 'When you have a handful of equal-weight points to scan, a two-column summary, or a single important statement to spotlight.',
    layoutDescription: 'Left column holds a large vertically-centered title (and the nav label). Right column switches via layoutVariant: "list" (one column of title + description rows), "columns" (the same rows in a 2-up grid, title column narrows), or "highlight" (a single body-large paragraph, no list).',
    mediaFields: [],
    requiredFields: ['title'],
    optionalFields: ['label', 'layoutVariant', 'items', 'highlight'],
    contentLimits: {
      items: { max: 6, recommended: '2-4 items', note: 'Each item is { title, description }; used by the list and columns layouts' },
      highlight: { recommended: '1-2 sentences', note: 'Only shown by the "highlight" layout' },
    },
    aiSelectionHints: {
      signals: ['simple list', 'two columns', 'highlight', 'key points', 'summary list', 'at a glance', 'one important thing'],
      priority: 4,
    },
    specialBehaviors: [
      'layoutVariant switches the right column: "list" | "columns" | "highlight"',
      'The left title uses the Title type scale and is vertically centered against the artboard',
      'In view mode the nav label is hidden (the title carries the slide); it still drives the slide nav',
      'list/columns share the same items array — switching variants does not lose content',
      'highlight uses the slide.highlight string instead of the items list',
    ],
    exampleUsage: {
      type: 'splitList',
      label: 'Overview',
      title: 'Simple list',
      layoutVariant: 'list',
      items: [
        { title: 'First thing', description: "Add a quick description of each thing, with enough context to understand what's up." },
        { title: 'Second thing', description: "Keep 'em short and sweet, so they're easy to scan and remember." },
        { title: 'Third thing', description: "If you've got a bunch, add another row, or use multiple copies of this slide." },
      ],
      highlight: 'Use this slide to highlight a single, important thing.',
    },
  },

  quotes: {
    shortDescription: 'User research quotes displayed in a card grid layout with author badges. Supports card style variants.',
    purpose: 'Present user research quotes in visually distinct cards.',
    whenToUse: 'After conducting user interviews or surveys, to showcase direct user quotes that support your findings.',
    layoutDescription: 'Label, title, optional intro, then a 3-up card grid (extra cards wrap). Each card: a decorative quote mark, the quote text, a divider, then an attribution row with a circular avatar (initials) + author name and role. Cards stretch to equal row height.',
    mediaFields: [],
    requiredFields: ['quotes'],
    optionalFields: ['label', 'title', 'content', 'gridColumns', 'bullets', 'bulletsTitle', 'highlight', 'cardVariant'],
    contentLimits: {
      quotes: { max: 8, recommended: '2-4 quotes', note: 'Each quote is { text, author }' },
      content: { recommended: '1-2 sentences of intro' },
      gridColumns: { default: 3, max: 4 },
    },
    aiSelectionHints: {
      signals: ['user quotes', 'research quotes', 'what users said', 'interview findings', 'testimonials grid'],
      priority: 5,
    },
    specialBehaviors: [
      'View mode: fixed 3-up grid; each card has a quote mark, a divider, and an avatar (author initials) + name/role attribution row',
      'Cards stretch to equal row heights',
      'cardVariant: "default", "minimal", or "clean" (affects edit mode); grid columns configurable in edit mode',
    ],
    exampleUsage: {
      type: 'quotes',
      label: 'User Research',
      title: 'What clinicians told us',
      quotes: [
        { text: 'I spend more time looking for tools than actually scanning.', author: 'Dr. Sarah M.' },
        { text: 'The toolbar feels like it was designed by engineers, not for us.', author: 'Dr. James K.' },
      ],
    },
  },

  testimonial: {
    shortDescription: 'Large quote/testimonial centered on the slide.',
    purpose: 'Feature a single powerful quote or testimonial with maximum visual impact.',
    whenToUse: 'When a single quote is important enough to deserve its own slide. Use for stakeholder quotes, key user feedback, or impactful statements.',
    layoutDescription: 'Large centered quote text with author name and role below. Optional label and context above.',
    mediaFields: [],
    requiredFields: ['quote', 'author'],
    optionalFields: ['label', 'role', 'context', 'highlight'],
    contentLimits: {
      quote: { recommended: '1-3 sentences' },
      role: { recommended: 'Job title, Company' },
      context: { recommended: '1 sentence of context' },
    },
    aiSelectionHints: {
      signals: ['single testimonial', 'standout quote', 'key feedback', 'stakeholder quote', 'featured quote'],
      priority: 7,
    },
    specialBehaviors: [
      'Quote text is rendered at a larger font size for emphasis',
      'Author and role are displayed below the quote',
    ],
    exampleUsage: {
      type: 'testimonial',
      quote: 'The new toolbar feels like it reads my mind. I barely touch it during scans now.',
      author: 'Dr. Sarah Mitchell',
      role: 'Orthodontist, ClearSmile Clinic',
    },
  },

  // ─── PROCESS ────────────────────────────────────────────────────

  goals: {
    shortDescription: 'Goals with numbered circle items, optional KPI cards with description support. Supports card style variants.',
    purpose: 'Present project goals as numbered cards with optional KPI section.',
    whenToUse: 'When defining what the project aimed to achieve. Great for showing goals alongside measurable KPIs.',
    layoutDescription: 'View mode: a two-column layout under the title — left = numbered "KPI Goals" list (flat rows, no cards), right = "Key Metrics" big-number rows, split by a vertical divider. (Edit mode keeps the older card grid for authoring.)',
    mediaFields: [],
    requiredFields: ['title', 'goals'],
    optionalFields: ['label', 'description', 'goalsCardsTitle', 'gridColumns', 'showGoalsSection', 'kpis', 'kpisGridColumns', 'showKpisSection', 'highlight', 'cardVariant', 'showNumbers'],
    contentLimits: {
      goals: { max: 8, recommended: '3-5 goals', note: 'Each goal is { number, title, description }' },
      kpis: { max: 8, recommended: '3-4 KPIs', note: 'String or { text, description } object' },
      gridColumns: { default: 2, max: 4 },
    },
    aiSelectionHints: {
      signals: ['project goals', 'objectives', 'what we wanted to achieve', 'KPIs', 'success criteria'],
      priority: 4,
    },
    specialBehaviors: [
      'View mode renders the two sections as side-by-side columns (goals list left, metrics right) with a vertical divider — flat rows, not cards',
      'Goals section and KPIs section can each be toggled on/off independently; with only one section it centers as a single column',
      'KPI cards support optional description: use { text: "KPI", description: "Details" } instead of plain string',
      'Section labels (KPI Goals / Key Metrics) render as plain subheadings in view mode',
      'cardVariant / showNumbers / grid columns apply to the edit-mode card layout',
    ],
    exampleUsage: {
      type: 'goals',
      label: 'Goals',
      title: 'What we wanted to achieve',
      goals: [
        { number: '1', title: 'Speed', description: 'Reduce average scan time by 30%' },
        { number: '2', title: 'Accuracy', description: 'Cut rescan rate in half' },
      ],
      kpis: ['Task completion time', 'Error rate', { text: 'User satisfaction', description: 'Measured via post-session survey' }],
    },
  },

  achieveGoals: {
    shortDescription: 'Two-column layout with KPIs on the left and Key Metrics on the right.',
    purpose: 'Present goals in a structured two-column format separating qualitative goals from quantitative metrics.',
    whenToUse: 'When you want to show KPIs alongside metrics, or split goals into two categories.',
    layoutDescription: 'Label, title, optional description, then two columns. Each column has a title and numbered goal items.',
    mediaFields: [],
    requiredFields: ['title', 'leftColumn', 'rightColumn'],
    optionalFields: ['label', 'description', 'highlight'],
    contentLimits: {
      leftColumn: { note: '{ title, goals: [{ number, text }] }', max: 6 },
      rightColumn: { note: '{ title, goals: [{ number, text }] }', max: 6 },
    },
    aiSelectionHints: {
      signals: ['KPIs and metrics', 'two-column goals', 'goals with metrics', 'achievement goals'],
      priority: 5,
    },
    specialBehaviors: [
      'Each column is an independent object with title and goals array',
      'Goals within each column are numbered items with text',
    ],
    exampleUsage: {
      type: 'achieveGoals',
      label: 'Defining goals',
      title: 'What did we want to achieve?',
      leftColumn: {
        title: 'KPIs',
        goals: [
          { number: '1', text: 'Reduce scan time by 30%' },
          { number: '2', text: 'Improve first-try success rate' },
        ],
      },
      rightColumn: {
        title: 'Key metrics',
        goals: [
          { number: '1', text: 'Task completion time' },
          { number: '2', text: 'Error rate per session' },
        ],
      },
    },
  },

  process: {
    shortDescription: 'Sequential process steps laid out as a flat row on a connector line, each with an accent number disc, title, and description.',
    purpose: 'Show a sequential process or workflow as numbered steps.',
    whenToUse: 'When describing a design process, workflow, methodology, or any sequential series of steps.',
    layoutDescription: 'View mode: title top-left, then a flat 4-column row of steps linked by a horizontal connector line. Each step is a numbered accent disc (a "bead" on the line) above a title and description — no card border or fill.',
    mediaFields: [],
    requiredFields: ['title', 'steps'],
    optionalFields: ['label', 'highlight', 'cardVariant', 'showNumbers'],
    contentLimits: {
      steps: { max: 8, recommended: '3-5 steps', note: 'Each step is { number, title, description }' },
    },
    aiSelectionHints: {
      signals: ['process', 'workflow', 'methodology', 'design process', 'how we did it', 'steps'],
      priority: 4,
    },
    specialBehaviors: [
      'View mode: steps sit on a horizontal connector line as numbered accent discs — flat, no card border/fill',
      'The connector line only draws when steps carry numbers (showNumbers !== false)',
      'Each step has a number (usually 01, 02, etc.), title, and description',
      'cardVariant: "default", "minimal", or "clean" (affects edit mode)',
      'showNumbers: set to false to hide the number discs (and the connector line)',
    ],
    exampleUsage: {
      type: 'process',
      label: 'Process',
      title: 'How we got there',
      steps: [
        { number: '01', title: 'Research', description: 'User interviews and clinical observations' },
        { number: '02', title: 'Define', description: 'Problem framing and opportunity mapping' },
        { number: '03', title: 'Design', description: 'Wireframes, prototypes, and iteration' },
        { number: '04', title: 'Test', description: 'Usability testing with 12 clinicians' },
      ],
    },
  },

  timeline: {
    shortDescription: 'Horizontal timeline of project phases or events on a connector line, each with a date, title, and description.',
    purpose: 'Display chronological events, milestones, or phases on a timeline.',
    whenToUse: 'When showing project phases, milestones, or a chronological sequence of events.',
    layoutDescription: 'View mode: title top-left, then events spread left-to-right along a horizontal connector line. Each event = an accent dot on the line, a date (accent), a title, and a description — flat editorial, no card. (Stacks vertically on mobile.)',
    mediaFields: [],
    requiredFields: ['title', 'events'],
    optionalFields: ['label', 'highlight'],
    contentLimits: {
      events: { max: 10, recommended: '4-6 events', note: 'Each event is { date, title, description }' },
    },
    aiSelectionHints: {
      signals: ['timeline', 'chronological', 'milestones', 'project phases', 'project journey', 'schedule'],
      priority: 5,
    },
    specialBehaviors: [
      'View mode: events render horizontally on a connector line with an accent dot per event (stacks vertical on mobile)',
      'Date field is flexible (can be "Week 1", "Q1 2024", etc.)',
      'Optional subtitle renders as a muted lead under the title',
    ],
    exampleUsage: {
      type: 'timeline',
      label: 'Timeline',
      title: 'Project Journey',
      events: [
        { date: 'Week 1-2', title: 'Discovery', description: 'Shadowed clinicians, interviewed 15 users' },
        { date: 'Week 3-4', title: 'Design', description: 'Created wireframes and interactive prototypes' },
        { date: 'Week 5', title: 'Testing', description: 'Ran usability tests with 8 clinicians' },
        { date: 'Week 6', title: 'Handoff', description: 'Final specs and design system documentation' },
      ],
    },
  },

  // ─── FEATURES ───────────────────────────────────────────────────

  comparison: {
    shortDescription: 'Versatile comparison slide with three modes: simple side-by-side, before/after toggle, and multi-tab switcher. Supports pill or flat tab UI styles.',
    purpose: 'Show a visual comparison between states. Supports three modes: simple (side-by-side columns), before-after (toggle switcher between two views), and tabs (multi-tab switcher for 2–6 panels). Each mode has its own switcher style option (pill or flat tabs).',
    whenToUse: 'When demonstrating any transformation or comparison — UI redesigns, process changes, A/B tests, multi-step solutions, or problem-to-solution stories. Use "simple" for side-by-side, "before-after" for a toggle between two states, or "tabs" for multi-panel comparisons.',
    layoutDescription: 'Label, title, and optional description at top. In "simple" mode: two side-by-side columns each with image, label, description, and bullets. In "before-after" mode: a switcher (pill or flat tab style) toggles between two views. In "tabs" mode: a multi-tab switcher (pill or flat) lets you navigate 2–6 panels, each with its own image, title, and bullets.',
    mediaFields: [
      { field: 'beforeImage', type: 'single image', description: 'Image showing the "before" state (left column). Supports image upload, Figma embed, website embed (iframe), video (MP4/WebM), and GIF. Max 1 per side.' },
      { field: 'afterImage', type: 'single image', description: 'Image showing the "after" state (right column). Supports image upload, Figma embed, website embed (iframe), video (MP4/WebM), and GIF. Max 1 per side.' },
    ],
    requiredFields: ['beforeImage', 'afterImage'],
    optionalFields: ['label', 'title', 'description', 'beforeLabel', 'afterLabel', 'beforeDescription', 'afterDescription', 'beforeBullets', 'beforeBulletsTitle', 'afterBullets', 'afterBulletsTitle', 'bullets', 'bulletsTitle', 'highlight'],
    contentLimits: {
      beforeLabel: { recommended: '1-2 words (e.g., "Before", "Old UI", "Problem")' },
      afterLabel: { recommended: '1-2 words (e.g., "After", "New UI", "Solution")' },
      beforeDescription: { recommended: '1-3 sentences describing the before state' },
      afterDescription: { recommended: '1-3 sentences describing the after state' },
      beforeBullets: { max: 6, recommended: '3-5 bullets listing problems or old-state details' },
      afterBullets: { max: 6, recommended: '3-5 bullets listing improvements or new-state details' },
      bullets: { max: 6, note: 'Shared bullets below both columns for overall summary' },
    },
    aiSelectionHints: {
      signals: ['before after', 'comparison', 'transformation', 'old vs new', 'visual diff', 'redesign', 'problem solution', 'challenge solution', 'improvement'],
      priority: 4,
    },
    specialBehaviors: [
      'Three slide modes: "simple" (side-by-side), "before-after" (toggle switcher), "tabs" (multi-tab switcher)',
      'Switcher style option: "pill" (rounded capsule) or "flat" (tab-style underline) — applies to both before-after and tabs modes',
      'Simple mode (view): two equal-height image columns; each label renders as a chip overlaid on the image (Before = quiet glass chip, After = solid accent pill), with the description below',
      'Before-after mode: a toggle switcher lets the viewer flip between two states, each with its own image, description, and bullets',
      'Tabs mode: 2–6 named tabs, each with its own image, title, and bullet list — great for multi-step solutions or feature comparisons',
      'All modes support DynamicImages — image upload, Figma embeds, website embeds (iframe), YouTube embeds (auto-plays muted), videos (MP4/WebM), and GIFs',
      'Split ratio adjustable in simple mode (20-80%)',
      'Can replace challenge/solution or problem/solution layouts',
    ],
    exampleUsage: {
      type: 'comparison',
      label: 'Before & After',
      title: 'The Transformation',
      description: 'A complete redesign of the scanning toolbar.',
      beforeImage: '',
      afterImage: '',
      beforeLabel: 'Before',
      afterLabel: 'After',
      beforeDescription: 'Static toolbar with all tools visible, causing cognitive overload.',
      afterDescription: 'Phase-aware toolbar showing only relevant tools for the current task.',
      beforeBullets: ['40+ tools visible', 'No contextual awareness', 'Frequent errors'],
      beforeBulletsTitle: 'Issues',
      afterBullets: ['Phase-aware filtering', '70% fewer visible tools', 'Faster completion'],
      afterBulletsTitle: 'Improvements',
      highlight: 'Task completion time decreased by 40% after the redesign.',
    },
  },

  tools: {
    shortDescription: 'Tools and technologies in a 3-column card grid, each card with a soft accent wash and an accent circle marker.',
    purpose: 'Display the tools, technologies, or methods used in a project.',
    whenToUse: 'When listing the tools and technologies used. Good for a "Built With" or "Tools & Methods" section.',
    layoutDescription: 'View mode: title top-left, then a 3-column card grid. Each card has a soft accent-tinted fill, a solid accent circle marker on top, a name (Subheading), and a description.',
    mediaFields: [],
    requiredFields: ['title', 'tools'],
    optionalFields: ['label', 'highlight'],
    contentLimits: {
      tools: { max: 12, recommended: '4-8 tools', note: 'Each tool is { name, description }' },
    },
    aiSelectionHints: {
      signals: ['tools used', 'technologies', 'built with', 'methods', 'tech stack'],
      priority: 7,
    },
    specialBehaviors: [
      'View mode: cards have a soft accent wash (no border) with a solid accent circle marker at the top',
      'Card titles render at the Subheading tier',
    ],
    exampleUsage: {
      type: 'tools',
      label: 'Tools & Tech',
      title: 'Built With',
      tools: [
        { name: 'Figma', description: 'Design & Prototyping' },
        { name: 'Maze', description: 'Usability Testing' },
        { name: 'Miro', description: 'Workshops & Mapping' },
      ],
    },
  },

  // ─── RESULTS ────────────────────────────────────────────────────

  stats: {
    shortDescription: 'Impact metrics displayed in a configurable grid with accent pill values. Grid columns adjustable.',
    purpose: 'Showcase key metrics and numbers with visual impact.',
    whenToUse: 'When presenting quantitative results, KPIs, or impact metrics. Numbers should be impressive and meaningful.',
    layoutDescription: 'Label and title at top, then a CSS grid of stat cards (1-4 columns, configurable in edit mode). Each stat value shown in an accent pill badge. Optional description and highlight below.',
    mediaFields: [],
    requiredFields: ['stats'],
    optionalFields: ['label', 'title', 'description', 'highlight', 'gridColumns'],
    contentLimits: {
      stats: { max: 6, recommended: '3-4 stats', note: 'Each stat is { value, label, suffix (optional) }' },
      description: { recommended: '1-2 paragraphs of context' },
      gridColumns: { default: 3, max: 4 },
    },
    aiSelectionHints: {
      signals: ['metrics', 'statistics', 'numbers', 'impact', 'results data', 'KPI values', 'quantitative results'],
      priority: 3,
    },
    specialBehaviors: [
      'Stat values render inside rounded accent pill badges for visual impact',
      'Optional suffix field appended to value (e.g., "%" in suffix instead of in value)',
      'Grid columns configurable (1-4) via edit mode control, default 3',
      'Cards have accent border with hover lift, matching service card style',
    ],
    exampleUsage: {
      type: 'stats',
      label: 'Results',
      title: 'Impact Metrics',
      stats: [
        { value: '40%', label: 'Faster scan time' },
        { value: '60%', label: 'Fewer rescans' },
        { value: '92%', label: 'Clinician satisfaction' },
      ],
    },
  },

  outcomes: {
    shortDescription: 'Results grid with numbered outcome cards, optional metrics, accent circles, and card variant support.',
    purpose: 'Present outcomes and learnings with optional quantitative metrics in a structured card grid.',
    whenToUse: 'When summarizing project outcomes, results, or key learnings — supports both qualitative descriptions and quantitative metrics (e.g. "40%", "3x", "10min").',
    layoutDescription: 'View mode: title top-left, then a 2-up card grid. Each card leads with an optional large accent metric, then a title, then a description, on a soft surface. The number badge is hidden in view mode — the metric carries the emphasis.',
    mediaFields: [],
    requiredFields: ['outcomes'],
    optionalFields: ['label', 'title', 'highlight', 'cardVariant', 'showNumbers'],
    contentLimits: {
      outcomes: { max: 6, recommended: '2-4 outcomes', note: 'Each outcome is { title, description, metric? }. metric is optional — a short value like "40%", "3x", "↑60%", "10min".' },
    },
    aiSelectionHints: {
      signals: ['outcomes', 'results', 'learnings', 'what we achieved', 'qualitative results', 'metrics', 'impact numbers'],
      priority: 4,
    },
    specialBehaviors: [
      'View mode: 2-up cards on a soft surface; the number badge is hidden so the metric leads',
      'Optional metric field renders as a large accent-colored number above the title (e.g. "40%", "3x")',
      'cardVariant: "default", "minimal", or "clean" (affects edit mode)',
      'showNumbers: set to false to hide number circles (edit mode)',
    ],
    exampleUsage: {
      type: 'outcomes',
      label: 'Outcomes',
      title: 'Results & Learnings',
      outcomes: [
        { title: 'Faster workflows', description: 'Clinicians complete scans 40% faster with the new toolbar.', metric: '40%' },
        { title: 'Higher confidence', description: 'Reduced rescan rate indicates better first-try accuracy.', metric: '3x' },
      ],
    },
  },

  end: {
    shortDescription: 'Thank you slide with CTA buttons.',
    purpose: 'Closing slide for the case study with a call to action.',
    whenToUse: 'Always the last slide of every case study. Provides a closing message and contact CTA.',
    layoutDescription: 'Centered title, subtitle, and animated CTA buttons.',
    mediaFields: [],
    requiredFields: ['title'],
    optionalFields: ['subtitle', 'cta', 'buttons', 'email', 'phone', 'linkedinUrl'],
    contentLimits: {
      title: { recommended: '1-3 words (e.g., "Thank You")' },
      subtitle: { recommended: '1 sentence' },
      buttons: { max: 3, note: 'Array of { text, link }' },
      email: { note: 'Email address — renders as mailto link with envelope icon' },
      phone: { note: 'Phone number — renders as tel link with phone icon' },
      linkedinUrl: { note: 'Full LinkedIn URL — renders as clickable link with LinkedIn icon' },
    },
    aiSelectionHints: {
      signals: ['ending', 'thank you', 'conclusion', 'closing slide', 'contact'],
      priority: 1,
      required: true,
    },
    specialBehaviors: [
      'Buttons render as animated CTA buttons',
      'Should always be the last slide',
      'Contact info (email, phone, LinkedIn) shown below CTA buttons with icons',
      'Each contact field is a clickable link (mailto, tel, external URL)',
    ],
    exampleUsage: {
      type: 'end',
      title: 'Thank You',
      subtitle: 'Want to work together?',
      cta: 'Get in touch',
      email: 'lior@example.com',
      phone: '+972 123 456 789',
      linkedinUrl: 'https://linkedin.com/in/liorbaum',
    },
  },

  // ─── DEFINE ─────────────────────────────────────────────────────

  // Labelled "Ideation" in the picker. The template key is `directions`.
  directions: {
    category: 'Define',
    shortDescription: 'Up to three explored design directions as before/after-style columns — each with an image, an Accepted/Rejected status chip, and a description.',
    purpose: 'Make divergence + convergence visible. Senior signal: showing the directions you explored and which you accepted vs rejected is strong evidence of design judgment.',
    whenToUse: 'Between Define and Process. Strong senior signal — without it, the chosen design can look arbitrary.',
    layoutDescription: 'Title top-left, then 2–3 equal columns side by side. Each column: an image with a status chip overlaid top-left (Accepted = solid accent pill, Rejected = quiet glass chip) and a description below. All column images share the same height regardless of how long each description is.',
    mediaFields: [
      { field: 'dir1Image', type: 'single image / embed', description: 'Image for direction 1. Supports image upload, Figma embed, website embed (iframe), video (MP4/WebM), and GIF.' },
      { field: 'dir2Image', type: 'single image / embed', description: 'Image for direction 2.' },
      { field: 'dir3Image', type: 'single image / embed', description: 'Image for direction 3 (only when directionCount is 3).' },
    ],
    requiredFields: ['title', 'directionCount'],
    optionalFields: ['label', 'dir1Image', 'dir1Status', 'dir1Desc', 'dir2Image', 'dir2Status', 'dir2Desc', 'dir3Image', 'dir3Status', 'dir3Desc'],
    contentLimits: {
      directionCount: { min: 2, max: 3, default: 3, note: 'Number of direction columns to render (2 or 3).' },
      dir1Desc: { recommended: '1-2 sentences describing the direction and why it was kept or set aside' },
      dir1Status: { note: "'accepted' or 'rejected' — controls the chip style (accent pill vs glass chip)" },
    },
    aiSelectionHints: {
      signals: ['ideation', 'directions explored', 'concepts', 'design directions', 'divergent thinking', 'options considered'],
      priority: 4,
    },
    specialBehaviors: [
      'Reuses the Before/After column system (.ba-* classes) with up to three columns',
      'Status chip overlays the image: Accepted = solid accent pill with glow, Rejected = quiet glass chip',
      'Column images are height-equalized via CSS subgrid — a longer description grows the description row for all columns, never shrinking one image',
      'directionCount toggles between 2 and 3 columns; the grid drops to 2 equal columns automatically when only two render',
      'Per-column description is optional — an empty description hides only that text, the image still fills the column',
    ],
    exampleUsage: {
      type: 'directions',
      label: 'Ideation',
      title: 'Directions explored',
      directionCount: 3,
      dir1Status: 'rejected',
      dir1Desc: 'Direction A — explored but set aside.',
      dir2Status: 'rejected',
      dir2Desc: 'Direction B — explored but set aside.',
      dir3Status: 'accepted',
      dir3Desc: 'Chosen direction — best balance of user value and feasibility.',
    },
  },

  // ─── PROCESS (added templates) ──────────────────────────────────

  // ─── RESULTS (added) ───────────────────────────────────────────

  reflection: {
    category: 'Results',
    shortDescription: 'Structured self-aware reflection: what worked, what failed, what you\'d do differently, what you couldn\'t measure.',
    purpose: 'Senior signal. Recruiters distrust designers who can\'t critique their own work — this section is where seniority becomes visible.',
    whenToUse: 'Final or near-final slide. Required for any portfolio aiming above mid-level.',
    layoutDescription: 'Title (+ optional subtitle), then three cards — What worked / What I\'d do differently / etc. Each card has an icon (✓ / ✕ / →), a heading, an optional short description, and an accent-dot bullet list. Optional learned/couldn\'t-measure/next-iteration notes follow.',
    mediaFields: [],
    requiredFields: ['title', 'whatWorked', 'whatFailed', 'whatYoudDoDifferently'],
    optionalFields: ['label', 'whatYouLearned', 'whatYouCouldntMeasure', 'nextIteration'],
    contentLimits: {
      whatWorked: { max: 3, recommended: '1-2 specific things — not platitudes' },
      whatFailed: { max: 3, recommended: 'Be specific. "Scoped X late" beats "communication could have been better"' },
      whatYoudDoDifferently: { max: 3, recommended: 'Concrete actions, not aspirations' },
      whatYouLearned: { recommended: 'One paragraph naming a transferable insight' },
      whatYouCouldntMeasure: { recommended: 'Acknowledges what data you didn\'t have — maturity signal' },
    },
    aiSelectionHints: {
      signals: ['reflection', 'lessons learned', 'what i learned', 'retrospective', 'self-awareness'],
      priority: 8,
      required: true,
    },
    specialBehaviors: [
      'View mode: three cards with accent-dot bullet lists; each card supports an optional short description above its bullets',
      'All-positive reflection content gets a warning indicator in the editor (no failures = red flag)',
      'whatYouCouldntMeasure renders smaller — it\'s the senior-signal, not the lead',
    ],
    exampleUsage: {
      type: 'reflection',
      label: 'Reflection',
      title: "What I'd do differently",
      whatWorked: ['Early test rounds caught the inverted mental model in week 2'],
      whatFailed: ['Scoped personas too late — they post-rationalized decisions'],
      whatYoudDoDifferently: ['Pair with engineering before final designs, not after'],
      whatYouLearned: 'Stakeholder alignment is more about cadence than artifacts.',
      whatYouCouldntMeasure: 'Long-term retention impact — would need 6+ months of post-launch data.',
      nextIteration: 'A/B test the simpler reduced-density version against current production.',
    },
  },

  // ─── CUSTOM ─────────────────────────────────────────────────────

};

// Shared reusable components documentation (not template-specific)
export const sharedComponentsDocs = [
  {
    name: 'EditableField',
    purpose: 'Inline text editing for single-line or multi-line fields.',
    props: ['value', 'onChange', 'multiline', 'allowLineBreaks', 'className', 'placeholder'],
    behavior: 'Renders as a span in view mode, converts to input/textarea in edit mode. Supports Shift+Enter for line breaks when allowLineBreaks is true.',
  },
  {
    name: 'DynamicContent',
    purpose: 'Renders one or more paragraphs with add/remove controls in edit mode.',
    props: ['slide', 'slideIndex', 'field', 'className', 'maxParagraphs', 'optional'],
    behavior: 'Can render from a string field (content) or array field (paragraphs). Supports max paragraph limit. Optional flag hides empty content in view mode.',
  },
  {
    name: 'DynamicBullets',
    purpose: 'Bullet list with optional section title and add/remove controls.',
    props: ['slide', 'slideIndex', 'field', 'titleField', 'className', 'maxBullets', 'label'],
    behavior: 'Renders bullet items as editable list. Supports per-bullet titles for some templates. Add/remove buttons in edit mode.',
  },
  {
    name: 'DynamicImages',
    purpose: 'Image gallery with upload, compression, embed support, carousel mode, and per-image controls.',
    props: ['slide', 'slideIndex', 'field', 'captionField', 'className', 'maxImages'],
    behavior: 'Handles single image or array of images. Supports file upload with automatic compression (10MB images, 100MB video, 40MB GIF). Supports Figma embeds, website embeds, and YouTube embeds (auto-plays muted and loops). Two display modes: grid (1-3 columns) and carousel (auto-advancing slideshow with dots, arrows, speed control). Per-image controls: Fill/Fit toggle, wrapper background toggle (BG on/off with padding and border-radius), image position, and image size. Carousel mode has global Fill/Fit and BG toggles. Single images show a Remove button on hover in addition to Replace.',
    mediaSupport: {
      images: 'JPG, PNG, SVG, WebP (compressed if > 10MB)',
      videos: 'MP4, WebM (up to 100MB)',
      gifs: 'Up to 40MB',
      embeds: 'Figma prototypes, website embeds (iframe), YouTube videos (auto-plays muted and loops)',
    },
  },
  {
    name: 'SplitRatioControl',
    purpose: 'Adjusts the left/right column ratio for split-layout templates.',
    props: ['slide', 'slideIndex'],
    behavior: 'Shows ratio presets (30/70, 40/60, 50/50, 60/40, 70/30) and a slider. Edit-mode only.',
  },
  {
    name: 'OptionalField',
    purpose: 'Wraps content with a toggle to show/hide an optional field.',
    props: ['slide', 'index', 'field', 'label', 'defaultValue', 'multiline', 'children'],
    behavior: 'Shows toggle buttons in edit mode to add/remove optional content. Hidden in view mode if empty.',
  },
  {
    name: 'SlideCta',
    purpose: 'Call-to-action button editor.',
    props: ['slide', 'index'],
    behavior: 'Configurable button with text and link. Edit-mode only controls.',
  },
];
