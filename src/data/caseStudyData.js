// Case Study Data - Editable via Edit Mode (Cmd+E)
// Data is saved to localStorage when edited

export const slideTemplates = {
  // === EXISTING TEMPLATES ===
  intro: {
    type: 'intro',
    title: 'Project\nName',
    subtitle: '',
    description: 'Brief project description goes here.',
    clientLabel: 'Client',
    client: 'Client Name',
    focusLabel: 'Focus',
    focus: 'Project Focus Area',
    logo: '',
    splitRatio: 50,
  },
  info: {
    type: 'info',
    title: 'Project Overview',
    items: [
      { label: 'Client', value: 'Client Name' },
      { label: 'Role', value: 'Your Role' },
      { label: 'Duration', value: 'Timeline' },
      { label: 'Deliverables', value: 'What you delivered' },
    ],
  },
  text: {
    type: 'text',
    label: 'Section Label',
    title: 'Section Title',
    content: 'Add your content here. Describe the challenge, process, or solution.',
  },
  image: {
    type: 'image',
    label: 'Section Label',
    title: 'Image Title',
    image: '',
    caption: 'Image caption describing what this shows.',
  },
  context: {
    type: 'context',
    label: 'Context',
    title: 'Understanding the environment',
    content: 'Describe the context and background.',
    highlight: 'Key insight or important note.',
    image: '',
    splitRatio: 50,
  },
  problem: {
    type: 'problem',
    label: 'The Problem',
    title: 'What needed to be solved',
    content: 'Describe the problem.',
    issues: ['Issue 1', 'Issue 2', 'Issue 3'],
    conclusion: 'Summary of the core problem.',
    image: '',
    splitRatio: 50,
  },
  quotes: {
    type: 'quotes',
    label: 'User Research',
    title: 'What users said',
    content: 'Description of the research process.',
    quotes: [
      { text: 'Quote from user', author: 'User Name' },
      { text: 'Another quote', author: 'User Name' },
    ],
  },
  goals: {
    type: 'goals',
    label: 'Goals',
    title: 'What we wanted to achieve',
    goalsCardsTitle: 'Goals',
    goals: [
      { number: '1', title: 'goal title', description: 'Goal description' },
      { number: '2', title: 'another goal', description: 'Goal description' },
    ],
    kpis: ['KPI 1', 'KPI 2', 'KPI 3'],
    kpisGridColumns: 3,
  },
  testing: {
    type: 'testing',
    label: 'Testing',
    title: 'Validating the solution',
    content: 'Describe the testing process.',
    layouts: ['Option 1', 'Option 2', 'Option 3'],
    conclusion: 'What we learned from testing.',
    image: '',
    splitRatio: 50,
  },
  stats: {
    type: 'stats',
    label: 'Results',
    title: 'Impact Metrics',
    stats: [
      { value: '50%', label: 'Improvement metric' },
      { value: '30%', label: 'Another metric' },
      { value: '95%', label: 'Success metric' },
    ],
  },
  outcomes: {
    type: 'outcomes',
    label: 'Outcomes',
    title: 'Results & Learnings',
    outcomes: [
      { title: 'Outcome 1', description: 'Description of this outcome.' },
      { title: 'Outcome 2', description: 'Description of this outcome.' },
    ],
  },
  end: {
    type: 'end',
    title: 'Thank You',
    subtitle: 'Want to work together?',
    cta: 'Get in touch',
  },

  // === NEW TEMPLATES ===
  
  // Before/After comparison
  comparison: {
    type: 'comparison',
    label: 'Before & After',
    title: 'The Transformation',
    beforeImage: '',
    afterImage: '',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  
  // Process steps
  process: {
    type: 'process',
    label: 'Process',
    title: 'How We Got There',
    steps: [
      { number: '01', title: 'Research', description: 'Description of this phase' },
      { number: '02', title: 'Design', description: 'Description of this phase' },
      { number: '03', title: 'Test', description: 'Description of this phase' },
      { number: '04', title: 'Launch', description: 'Description of this phase' },
    ],
  },
  
  // Feature highlight
  feature: {
    type: 'feature',
    label: 'Key Feature',
    title: 'Feature Name',
    description: 'Detailed description of this feature and why it matters.',
    image: '',
    bullets: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
    splitRatio: 50,
  },
  
  // Two-column text
  twoColumn: {
    type: 'twoColumn',
    label: 'Overview',
    title: 'Section Title',
    leftTitle: 'Left Column',
    leftContent: 'Content for the left column.',
    rightTitle: 'Right Column',
    rightContent: 'Content for the right column.',
  },
  
  // Timeline
  timeline: {
    type: 'timeline',
    label: 'Timeline',
    title: 'Project Journey',
    events: [
      { date: 'Week 1', title: 'Discovery', description: 'Initial research and planning' },
      { date: 'Week 2-3', title: 'Design', description: 'Creating wireframes and mockups' },
      { date: 'Week 4', title: 'Testing', description: 'User testing and iterations' },
      { date: 'Week 5', title: 'Launch', description: 'Final delivery' },
    ],
  },
  
  // Video embed placeholder
  video: {
    type: 'video',
    label: 'Demo',
    title: 'See It In Action',
    videoUrl: '',
    caption: 'Video walkthrough of the final product.',
  },

  // Issues Breakdown - "what started to break" style
  issuesBreakdown: {
    type: 'issuesBreakdown',
    label: 'The Context',
    title: 'what started to break',
    issues: [
      { number: '1', title: 'Issue title here', description: 'Brief description of this issue' },
      { number: '2', title: 'Another issue', description: 'Brief description of this issue' },
      { number: '3', title: 'Third issue', description: 'Brief description of this issue' },
      { number: '4', title: 'Fourth issue', description: 'Brief description of this issue' },
    ],
  },

  // Old Experience - showing the previous state
  oldExperience: {
    type: 'oldExperience',
    label: 'The problem',
    title: 'the old experience',
    subtitle: 'Explanation',
    content: 'Describe what the old experience looked like and why it was problematic for users.',
    issues: [
      'First pain point or issue with the old experience',
      'Second pain point users encountered',
      'Third issue that needed addressing',
    ],
    highlight: 'A key quote or insight about the old experience',
  },

  // Achievement Goals - two-column goals layout
  achieveGoals: {
    type: 'achieveGoals',
    label: 'defining goals',
    title: 'What did we want to achieve?',
    leftColumn: {
      title: 'KPIs',
      goals: [
        { number: '1', text: 'First KPI goal description' },
        { number: '2', text: 'Second KPI goal description' },
        { number: '3', text: 'Third KPI goal description' },
      ],
    },
    rightColumn: {
      title: 'Key metrics',
      goals: [
        { number: '1', text: 'First metric goal' },
        { number: '2', text: 'Second metric goal' },
        { number: '3', text: 'Third metric goal' },
      ],
    },
  },
  
  // Tools used
  tools: {
    type: 'tools',
    label: 'Tools & Tech',
    title: 'Built With',
    tools: [
      { name: 'Figma', description: 'Design & Prototyping' },
      { name: 'React', description: 'Frontend Development' },
      { name: 'Framer Motion', description: 'Animations' },
    ],
  },
  
  // Challenge/Solution pair
  challengeSolution: {
    type: 'challengeSolution',
    label: 'Problem Solving',
    title: 'Challenge & Solution',
    challenge: 'Describe the challenge faced.',
    challengeImage: [{ src: '', caption: '' }],
    solution: 'Describe how it was solved.',
    solutionImage: [{ src: '', caption: '' }],
  },
  
  // Solution Showcase - Problem/Solution with images comparison
  solutionShowcase: {
    type: 'solutionShowcase',
    label: 'The Solution',
    title: 'Redesigning the experience',
    problemImages: [{ src: '', caption: '' }],
    solutionImages: [{ src: '', caption: '' }],
    problemLabel: 'Problem:',
    problemText: 'Describe the main problem or pain point.',
    solutionLabel: 'Solution:',
    solutionPoints: [
      'First improvement or change',
      'Second improvement or change',
    ],
  },
  
  // Big quote/testimonial
  testimonial: {
    type: 'testimonial',
    quote: 'This is a standout quote that deserves its own slide.',
    author: 'Client Name',
    role: 'CEO, Company',
  },
  
  // Key insight
  insight: {
    type: 'insight',
    label: 'Key Insight',
    insight: 'One important learning or discovery from this project.',
    supporting: 'Additional context or explanation.',
  },

  // Text with images below - flexible paragraphs and images
  textWithImages: {
    type: 'textWithImages',
    label: 'Design Process',
    title: 'Creating clarity before testing behavior',
    paragraphs: [
      'First paragraph describing the context or situation.',
      'Second paragraph with additional details or explanation.',
    ],
    images: [
      { src: '', caption: 'Before' },
      { src: '', caption: 'After' },
    ],
  },

  // Project Showcase - Two column layout with info panel and image
  projectShowcase: {
    type: 'projectShowcase',
    slideNumber: '03',
    title: 'Project Name',
    subtitle: '',
    description: 'Brief description of the project and what it does.',
    tags: ['UX', 'Design', 'Development'],
    logo: '',
    projectShowcaseHeader: 'both', // 'both' | 'title' | 'logo'
    image: '',
  },

  // Goals Showcase - Two column layout with goals list
  goalsShowcase: {
    type: 'goalsShowcase',
    slideNumber: '02',
    title: 'Project Goals',
    description: 'What we aimed to achieve with this project.',
    goals: [
      { title: 'Goal 1', description: 'Description of the first goal' },
      { title: 'Goal 2', description: 'Description of the second goal' },
      { title: 'Goal 3', description: 'Description of the third goal' },
    ],
    image: '',
  },

  // Image Mosaic - Tiled images background with centered title overlay
  imageMosaic: {
    type: 'imageMosaic',
    title: 'Old version',
    images: [],
  },

  // Problem & Solution - Two-column with problem image (left) and solution image (right) + bullets
  problemSolution: {
    type: 'problemSolution',
    label: 'The Solution',
    title: 'From form to conversation',
    problemLabel: 'Problem:',
    problemImage: '',
    problemImageFit: 'cover',
    problemBullets: [],
    solutionLabel: 'Solution:',
    solutionImage: '',
    solutionImageFit: 'cover',
    solutionBullets: [
      'First improvement or change',
      'Second improvement or change',
    ],
  },

  // Chapter - Section divider slide
  chapter: {
    type: 'chapter',
    number: '01',
    title: 'Research',
    subtitle: 'Understanding the problem space',
  },

  // Dynamic - Composable slide with ordered content blocks
  dynamic: {
    type: 'dynamic',
    blocks: [
      { type: 'title', value: 'Section Title' },
      { type: 'paragraph', value: 'Add your content here. Use the toolbar below to add more blocks.' },
    ],
  },
};

// Template categories for easier navigation
export const templateCategories = {
  'Custom': ['dynamic'],
  'Introduction': ['intro', 'info', 'chapter'],
  'Content': ['text', 'twoColumn', 'insight', 'textWithImages'],
  'Visual': ['image', 'video', 'projectShowcase', 'goalsShowcase', 'imageMosaic'],
  'Research': ['context', 'problem', 'issuesBreakdown', 'oldExperience', 'quotes', 'testimonial'],
  'Process': ['goals', 'achieveGoals', 'process', 'timeline', 'testing'],
  'Features': ['feature', 'comparison', 'challengeSolution', 'solutionShowcase', 'problemSolution', 'tools'],
  'Results': ['stats', 'outcomes', 'end'],
};

export const defaultCaseStudies = {
  'align-technology': {
    title: 'iTero\nScan & View',
    subtitle: 'Redesigning a live clinical scanning experience',
    category: 'Clinical UX & System Design',
    year: '2024',
    color: '#E8847C',
    slides: [
      // Intro
      {
        type: 'intro',
        title: 'iTero\nScan & View',
        description: 'Redesigning a live clinical scanning experience',
        clientLabel: 'Client',
        client: 'Align Technology',
        focusLabel: 'Focus',
        focus: 'Clinical UX & System Design',
      },
      // Slide 1 — Background
      {
        type: 'context',
        label: 'Background',
        title: 'What is Align Technology',
        content: 'Align Technology develops digital systems used by clinicians during live dental procedures.\niTero is a real-time intraoral scanner designed for use while the patient is in the chair.',
        highlight: 'The platform supports scanning, validation, and review within a single clinical session. Accuracy and speed are equally critical.',
        image: '',
      },
      // Slide 2 — Context
      {
        type: 'context',
        label: 'Context',
        title: 'Scanning is a high-pressure environment',
        content: 'iTero is used in moments where clinicians must act quickly and confidently.',
        bullets: [
          'The scanner is held in one hand',
          'Attention shifts between patient and screen',
          'Adjustments happen in real time',
          'Delays increase chair time',
        ],
        highlight: 'The interface must support flow without demanding attention.',
        image: '',
      },
      // Slide 3 — The Breakdown
      {
        type: 'problem',
        label: 'The Breakdown',
        title: 'When incremental improvements stopped working',
        content: 'Over time, new tools and capabilities were added.',
        issues: [
          'Additional scan types',
          'Expanded post-scan tools',
          'More review options',
        ],
        conclusion: 'Each feature solved a specific need. Together, they created a fragmented experience. Scanning, editing, and reviewing no longer felt like one connected process.',
        image: '',
      },
      // Slide 4 — Research & Insight
      {
        type: 'text',
        label: 'Research & Insight',
        title: 'What clinicians struggled with',
        content: 'From interviews and live walkthroughs, one theme repeated:',
        highlight: '"I\'m never fully sure where I am — scanning, editing, or reviewing."',
        bulletsTitle: 'Key issues:',
        bullets: [
          'Unclear system state',
          'Tools scattered across the interface',
          'Fear of making irreversible changes',
        ],
        paragraphs: [
          'This was not a usability issue in isolation. It was a structural breakdown in the overall flow.',
        ],
      },
      // Slide 5 — Goals & KPIs
      {
        type: 'goals',
        label: 'Goals & KPIs',
        title: 'Defining success before redesign',
        description: ['Before redesigning, success criteria were clearly defined.'],
        goals: [
          { number: '1', title: 'Unified Experience', description: 'Create a unified Scan and View experience' },
          { number: '2', title: 'Reduce Cognitive Load', description: 'Reduce cognitive load during live procedures' },
          { number: '3', title: 'Enable Complexity', description: 'Enable complex workflows without confusion' },
          { number: '4', title: 'Scalable Structure', description: 'Build a scalable structure for future tools' },
        ],
        kpis: [
          'Tool selection time',
          'Overall scan duration',
          'Misclick rate',
          'Adoption of advanced features',
        ],
      },
      // Chapter: FOUNDATION — ICON SYSTEM
      {
        type: 'chapter',
        number: '01',
        title: 'Foundation',
        subtitle: 'Icon System',
      },
      // Slide 6 — Icon System Problem
      {
        type: 'problem',
        label: 'The Problem',
        title: 'Icons that worked individually failed as a system',
        content: 'As the toolset grew, icon inconsistencies became more visible.',
        issues: [
          'Mixed stroke weights',
          'Uneven visual balance',
          'Conflicting metaphors',
        ],
        conclusion: 'When grouped together, they created visual noise and hesitation.',
        image: '',
      },
      // Slide 7 — Icon System Solution
      {
        type: 'text',
        label: 'The Solution',
        title: 'Creating a scalable icon language',
        content: 'The icon system was redesigned before adjusting layout.',
        paragraphs: [
          'Changes included unified grid and stroke rules, balanced visual weight, and simplified metaphors.',
          'This created a visual foundation capable of scaling.',
        ],
        image: '',
      },
      // Chapter: LIVE SCANNING STRUCTURE
      {
        type: 'chapter',
        number: '02',
        title: 'Live Scanning',
        subtitle: 'Structure',
      },
      // Slide 8 — Scanning Structure Problem
      {
        type: 'problem',
        label: 'The Problem',
        title: 'Tools without a predictable structure',
        content: 'Even with aligned icons, tools were problematic.',
        issues: [
          'Spread across the interface',
          'Difficult to reach with one hand',
          'Competing with the scan canvas',
        ],
        conclusion: 'Clinicians searched mid-scan.',
        image: '',
      },
      // Slide 9 — Exploration
      {
        type: 'testing',
        label: 'Exploration',
        title: 'Testing toolbar positions',
        content: 'Multiple toolbar layouts were tested. Each was evaluated for reachability, obstruction, and speed.',
        layouts: [
          'Vertical',
          'Bottom',
          'Top',
        ],
        image: '',
      },
      // Slide 10 — Scanning Solution
      {
        type: 'text',
        label: 'The Solution',
        title: 'Defining a single home for scanning actions',
        content: 'The horizontal top toolbar proved most stable.',
        paragraphs: [
          'Predictable reach, minimal obstruction, and strong muscle memory.',
          'This became the structural anchor of the Scan page.',
        ],
        image: '',
      },
      // Slide 11 — Adaptive Problem
      {
        type: 'text',
        label: 'The Problem',
        title: 'One static toolbar couldn\'t support all moments',
        content: 'Different clinicians had different needs.',
        paragraphs: [
          'Experts wanted speed. Others wanted reassurance. Icons alone were not always sufficient.',
        ],
      },
      // Slide 12 — Adaptive Solution
      {
        type: 'text',
        label: 'The Solution',
        title: 'An adaptive toolbar for speed and clarity',
        content: 'The toolbar supports two states: collapsed (icons only) and expanded (icons with labels).',
        paragraphs: [
          'Clinicians can switch states without interrupting scanning.',
        ],
        image: '',
      },
      // Chapter: CLINICAL TOOLS
      {
        type: 'chapter',
        number: '03',
        title: 'Clinical Tools',
        subtitle: 'Redesigning core interactions',
      },
      // Slide 13 — Prep Review Problem
      {
        type: 'problem',
        label: 'Prep Review — Problem',
        title: 'Validation felt like technical editing',
        content: 'The legacy Prep Review required manual adjustments.',
        issues: [
          'Clinicians focused on correcting instead of validating',
        ],
        image: '',
      },
      // Slide 14 — Prep Review Solution
      {
        type: 'text',
        label: 'Prep Review — Solution',
        title: 'Turning validation into a decision checkpoint',
        content: 'Prep Review was reframed as a binary decision: Select, or Erase and Rescan.',
        paragraphs: [
          'AI validates. The clinician confirms.',
        ],
        image: '',
      },
      // Slide 15 — Margin Line Problem
      {
        type: 'problem',
        label: 'Margin Line — Problem',
        title: 'AI existed but was not central',
        content: 'AI detection was hidden behind secondary actions.',
        issues: [
          'Clinicians manually drew margins, increasing fatigue and error',
        ],
        image: '',
      },
      // Slide 16 — Margin Line Solution
      {
        type: 'text',
        label: 'Margin Line — Solution',
        title: 'Making AI the primary path',
        content: 'The tool was redesigned around AI-first detection.',
        paragraphs: [
          'Detect as the main action. Visible tooth context. Review instead of draw.',
        ],
        image: '',
      },
      // Slide 17 — Trim Tool Problem
      {
        type: 'problem',
        label: 'Trim Tool — Problem',
        title: 'Precision interaction under pressure',
        content: 'The old Trim tool required small, precise taps.',
        issues: [
          'This increased open-mouth time and fatigue',
        ],
        image: '',
      },
      // Slide 18 — Trim Tool Solution
      {
        type: 'text',
        label: 'Trim Tool — Solution',
        title: 'A touch-native confirm loop',
        content: 'Trim was redesigned for one-handed interaction.',
        paragraphs: [
          'Large gesture trimming. Clear Confirm and Undo. Stage-based flow.',
        ],
        image: '',
      },
      // Chapter: MULTI-SCAN WORKFLOWS
      {
        type: 'chapter',
        number: '04',
        title: 'Multi-Scan',
        subtitle: 'Workflows',
      },
      // Slide 19 — Multi-Scan Problem
      {
        type: 'problem',
        label: 'The Problem',
        title: 'A system built for one scan',
        content: 'Real clinical cases require multiple interactions.',
        issues: [
          'Additional scans',
          'Revisions',
          'Bite scans',
          'Pre and post comparison',
        ],
        conclusion: 'The previous structure did not support this clearly.',
      },
      // Slide 20 — Multi-Scan Solution
      {
        type: 'text',
        label: 'The Solution',
        title: 'Structuring multiple scans as one session',
        content: 'Multi-scan support was introduced with a clear structure.',
        paragraphs: [
          'Tab-based structure. Clear scan labeling. Safe switching.',
        ],
        image: '',
      },
      // Chapter: REVIEW PANEL
      {
        type: 'chapter',
        number: '05',
        title: 'Review Panel',
        subtitle: 'Control and confidence',
      },
      // Slide 21 — Review Problem
      {
        type: 'problem',
        label: 'The Problem',
        title: 'Reviewing felt fragile',
        content: 'Clinicians feared making mistakes during review.',
        issues: [
          'Accidental changes',
          'Losing context',
          'Incorrect comparisons',
        ],
      },
      // Slide 22 — Review Solution
      {
        type: 'text',
        label: 'The Solution',
        title: 'A dedicated review panel for control',
        content: 'A structured View panel allows clinicians to review with confidence.',
        paragraphs: [
          'Show and hide layers. Adjust opacity. Compare safely.',
        ],
        image: '',
      },
      // Chapter: OUTCOME
      {
        type: 'chapter',
        number: '06',
        title: 'Outcome',
        subtitle: 'Impact and reflection',
      },
      // Slide 23 — Results
      {
        type: 'outcomes',
        label: 'Results',
        title: 'From hesitation to confidence',
        outcomes: [
          { title: 'Faster Tool Selection', description: 'Predictable placement reduced time to select tools during live scanning.' },
          { title: 'Reduced Hesitation', description: 'Clear system state eliminated guesswork during procedures.' },
          { title: 'Increased Adoption', description: 'Advanced features saw higher usage with a discoverable structure.' },
          { title: 'Safer Multi-Scan Workflows', description: 'Tab-based structure enabled confident switching between scans.' },
        ],
      },
      // Slide 24 — Key Takeaway
      {
        type: 'insight',
        label: 'Key Takeaway',
        insight: 'Designing for clarity under pressure',
        supporting: 'In live clinical environments, structure reduces cognitive load, visible state builds confidence, and predictability drives adoption. Redesigning the system — not just the interface — made the difference.',
      },
      // End
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'Want to work together on your next project?',
        cta: 'Get in touch',
      },
    ],
  },
  'wizecare': {
    title: 'WizeCare',
    subtitle: 'Digitizing Home Physical Therapy',
    category: 'MedTech / Tele-Health',
    year: '2023',
    color: '#6B5CE7',
    slides: [
      // Slide 1: Intro
      {
        type: 'intro',
        title: 'Digitizing Home\nPhysical Therapy',
        description: 'Redesigning core clinical workflows for remote care',
        clientLabel: 'Client',
        client: 'WizeCare',
        focusLabel: 'Platform',
        focus: 'Desktop Dashboard (B2B SaaS)',
        image: '',
      },
      // Slide 2: Project Info
      {
        type: 'info',
        title: 'Project Overview',
        items: [
          { label: 'Client', value: 'WizeCare' },
          { label: 'Platform', value: 'Desktop Dashboard (B2B SaaS)' },
          { label: 'Industry', value: 'MedTech / Tele-Health' },
          { label: 'Role', value: 'UX/UI Designer — Research, Workflow Design, Interaction Design, Prototyping' },
        ],
      },
      // Slide 3: Background - What is WizeCare?
      {
        type: 'context',
        label: 'Background',
        title: 'What is WizeCare?',
        content: 'WizeCare is a clinical technology platform that enables physiotherapists to deliver personalized treatment remotely, bringing physical therapy into the patient\'s home.\n\nThe platform allows clinicians to manage patients, create care plans, and track adherence — but its complexity made adoption difficult in real clinical environments.',
        highlight: 'For WizeCare to succeed, the system needed to feel like a time-saver, not an extra task.',
        image: '',
      },
      // Slide 4: Context - Who the users are
      {
        type: 'context',
        label: 'Context',
        title: 'Who the users are',
        content: 'WizeCare is used by physiotherapists who want to expand beyond in-clinic sessions and manage patients remotely.\n\nThese clinicians work under constant time pressure, rely on familiar manual routines, and are cautious when adopting new technology.',
        highlight: 'For WizeCare to succeed, the system needed to feel like a time-saver, not an extra task.',
        image: '',
      },
      // Slide 5: The Problem - Why the experience broke down
      {
        type: 'issuesBreakdown',
        label: 'The Problem',
        title: 'Why the experience broke down',
        issues: [
          { number: '1', title: 'Technology Hesitation', description: 'Digital workflows felt unfamiliar compared to manual routines' },
          { number: '2', title: 'High Cognitive Load', description: 'Too much information presented at once' },
          { number: '3', title: 'Fragmented Workflows', description: 'Core tasks spread across multiple screens' },
        ],
        conclusion: 'Despite having the right clinical tools, the platform struggled with adoption. Everyday actions felt slower and more confusing than they should.',
      },
      // Slide 6: Research & Discovery
      {
        type: 'text',
        label: 'Research & Discovery',
        title: 'Understanding real friction',
        paragraphs: [
          'To understand where clinicians struggled, I visited physiotherapy clinics, conducted user interviews, and reviewed support tickets and recurring issues.',
          'This revealed a clear friction funnel across three critical workflows: patient management, care plan editing, and protocol creation.',
          'These flows became the foundation for the redesign.',
        ],
      },
      // Slide 7: Goals & KPIs
      {
        type: 'goals',
        label: 'Defining Success',
        title: 'Goals & KPIs',
        goals: [
          { number: '1', title: 'Simplify Navigation', description: 'Reduce cognitive load and make core actions intuitive' },
          { number: '2', title: 'Clear Data Visibility', description: 'Make patient data and exercises easy to understand at a glance' },
          { number: '3', title: 'Support All Users', description: 'Design for both novice and expert clinicians' },
          { number: '4', title: 'Reduce Dependencies', description: 'Minimize reliance on support and training' },
        ],
        kpis: [
          'Increased User Adoption',
          'Reduced Training Time',
          'Decrease in Support Requests',
        ],
      },
      // Slide 8: Redesign Strategy
      {
        type: 'text',
        label: 'Redesign Strategy',
        title: 'Rebuilding around real workflows',
        paragraphs: [
          'Rather than making isolated UI improvements, the redesign focused on restructuring the product around the three workflows that mattered most.',
          'Each flow was addressed independently, while maintaining consistency across the system.',
        ],
      },
      // Slide 9: Flow 01 - Patient Management Title
      {
        type: 'projectShowcase',
        number: '01',
        title: 'Patient Management',
        description: 'Finding and understanding patient information',
        tags: ['Workflow', 'Information Architecture', 'Navigation'],
        image: '',
      },
      // Slide 10: Flow 01 - Before/After
      {
        type: 'solutionShowcase',
        label: 'Flow 01',
        title: 'Patient Management',
        problemImages: [{ src: '', caption: 'Old patient page' }],
        solutionImages: [{ src: '', caption: 'New patient page' }],
        problemLabel: 'The Problem:',
        problemText: 'Clinicians struggled to understand where patient details, care plans, and adherence metrics lived. Oversized tabs and unclear hierarchy made it hard to move from insight to action.',
        solutionLabel: 'The Solution:',
        solutionPoints: [
          'A dedicated patient page centralized all patient-related information',
          'Clear separation between patient info, plans, and progress',
          'Adherence metrics made prominent',
          'Predictable navigation between views',
        ],
      },
      // Slide 11: Flow 02 - Care Plan Editing Title
      {
        type: 'projectShowcase',
        number: '02',
        title: 'Care Plan Editing',
        description: 'Reducing everyday friction in routine tasks',
        tags: ['Workflow', 'UI Design', 'Efficiency'],
        image: '',
      },
      // Slide 12: Flow 02 - Before/After
      {
        type: 'solutionShowcase',
        label: 'Flow 02',
        title: 'Care Plan Editing',
        problemImages: [{ src: '', caption: 'Old care plan flow' }],
        solutionImages: [{ src: '', caption: 'New care plan editor' }],
        problemLabel: 'The Problem:',
        problemText: 'Editing a care plan required navigating through 4–5 different screens, causing loss of context and cognitive fatigue. Exercises were displayed in cluttered lists, making errors more likely.',
        solutionLabel: 'The Solution:',
        solutionPoints: [
          'Care plan editor redesigned into a single focused screen',
          'Exercises displayed as modular cards',
          'Inline editing without modals or page changes',
          'Patient health data pinned as a constant reference',
        ],
      },
      // Slide 13: Flow 03 - Protocol Builder Title
      {
        type: 'projectShowcase',
        number: '03',
        title: 'Creating a Protocol',
        description: 'Supporting expert customization from scratch',
        tags: ['Workflow', 'Drag & Drop', 'Expert Users'],
        image: '',
      },
      // Slide 14: Flow 03 - Insight
      {
        type: 'insight',
        label: 'Key Insight',
        insight: 'Research showed that experienced physiotherapists prefer building their own protocols to tailor treatment to complex cases.',
        supporting: 'The old system lacked a clear protocol creation flow and forced reliance on rigid templates.',
      },
      // Slide 15: Flow 03 - Before/After
      {
        type: 'solutionShowcase',
        label: 'Flow 03',
        title: 'Protocol Builder',
        problemImages: [{ src: '', caption: 'Old protocol flow' }],
        solutionImages: [{ src: '', caption: 'New protocol builder' }],
        problemLabel: 'The Problem:',
        problemText: 'The old system lacked a clear protocol creation flow and forced reliance on rigid templates.',
        solutionLabel: 'The Solution:',
        solutionPoints: [
          'New protocol builder using Kanban-style drag-and-drop model',
          'Exercise library on the left, treatment plan board on the right',
          'Reused the same card system as care plan editor for familiarity',
        ],
      },
      // Slide 16: Outcomes - Stats
      {
        type: 'stats',
        label: 'Outcomes',
        title: 'What improved',
        stats: [
          { value: '10-15', label: 'Minutes saved per patient', suffix: 'min' },
          { value: '↓', label: 'Misclicks and errors' },
          { value: '↑', label: 'Daily usage increased' },
          { value: '↓', label: 'Support requests' },
        ],
      },
      // Slide 17: Outcomes - Details
      {
        type: 'outcomes',
        label: 'Results',
        title: 'Impact',
        outcomes: [
          { title: 'Time Saved', description: 'Therapists saved approximately 10–15 minutes per patient' },
          { title: 'Reduced Errors', description: 'Misclicks and prescription errors dropped significantly' },
          { title: 'Increased Usage', description: 'Daily usage increased among previously frustrated users' },
          { title: 'Scalable System', description: 'The system became scalable for future features' },
        ],
      },
      // Slide 18: Key Learnings
      {
        type: 'quotes',
        label: 'Key Learnings',
        title: 'What this project reinforced',
        quotes: [
          { text: 'Adoption depends on workflow clarity, not feature count', author: 'Learning 01' },
          { text: 'Busy clinicians need software that respects their habits', author: 'Learning 02' },
          { text: 'Consistency across flows reduces learning effort', author: 'Learning 03' },
          { text: 'Defining success early keeps design decisions focused', author: 'Learning 04' },
        ],
      },
      // Slide 19: End
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'Want to work together on your next project?',
        cta: 'Get in touch',
      },
    ],
  },
  'webflow': {
    title: 'WEBFLOW',
    subtitle: 'No-code website builder experience',
    category: 'Web Design',
    year: '2022',
    color: '#E85D75',
    slides: [
      {
        type: 'intro',
        title: 'WEB\nFLOW',
        subtitle: 'Web Design • 2022',
        description: 'Contributed to new features for the Webflow editor, focusing on improving the learning curve for new users.',
        image: '',
      },
      {
        type: 'info',
        title: 'Project Info',
        items: [
          { label: 'Role', value: 'UI Designer' },
          { label: 'Duration', value: '3 Months' },
          { label: 'Team', value: '4 Designers, 8 Engineers' },
          { label: 'Deliverables', value: 'Onboarding Flow' },
        ],
      },
      {
        type: 'text',
        label: '01 — The Challenge',
        title: 'Steep Learning Curve',
        content: 'New users often felt overwhelmed by the power and flexibility of Webflow, leading to high drop-off rates during onboarding.',
      },
      {
        type: 'stats',
        label: '02 — Results',
        title: 'Impact',
        stats: [
          { value: '45%', label: 'Increase in completion' },
          { value: '30%', label: 'Faster first publish' },
          { value: '4.6', label: 'Onboarding rating', suffix: '/5' },
        ],
      },
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'Want to work together?',
        cta: 'Get in touch',
      },
    ],
  },
  'shenkar': {
    title: 'SHENKAR',
    subtitle: 'Brand identity for design college',
    category: 'Brand Identity',
    year: '2021',
    color: '#F5A623',
    slides: [
      {
        type: 'intro',
        title: 'SHEN\nKAR',
        subtitle: 'Brand Identity • 2021',
        description: 'Developed a comprehensive brand identity system for a leading design college.',
        image: '',
      },
      {
        type: 'info',
        title: 'Project Info',
        items: [
          { label: 'Role', value: 'Brand Designer' },
          { label: 'Duration', value: '2 Months' },
          { label: 'Team', value: 'Solo Project' },
          { label: 'Deliverables', value: 'Logo, Guidelines' },
        ],
      },
      {
        type: 'text',
        label: '01 — The Challenge',
        title: 'Balancing Tradition',
        content: 'The college needed a brand that would appeal to prospective students while honoring its rich history in design education.',
      },
      {
        type: 'image',
        label: '02 — Logo Design',
        title: 'Visual Identity',
        image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1400&h=800&fit=crop',
        caption: 'Contemporary logo system with flexible applications',
      },
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'Want to work together?',
        cta: 'Get in touch',
      },
    ],
  },

  'itero-scan-view': {
    title: 'iTero\nScan & View',
    subtitle: 'Redesigning a live clinical scanning experience',
    category: 'MedTech / Clinical UX',
    year: '2024',
    color: '#5B8DEF',
    slides: [
      {
        type: 'intro',
        title: 'iTero Scan & View',
        description: 'Redesigning a live clinical scanning experience',
        clientLabel: 'Client',
        client: 'Align Technology',
        focusLabel: 'Platform',
        focus: 'Touch-based Clinical Interface',
      },
      {
        type: 'context',
        label: 'Background',
        title: 'What is Align Technology',
        content: 'Align Technology develops digital systems used by clinicians during live dental procedures.\n\niTero is a real-time intraoral scanner used while the patient is in the chair.\n\nThis is not exploratory software.\nEvery interaction must be precise, predictable, and fast.',
        highlight: '',
        image: '',
        splitRatio: 50,
      },
      {
        type: 'context',
        label: 'Context',
        title: 'Scanning is a high-pressure environment',
        content: 'During a scan:\n\nThe scanner is held in one hand.\nAttention shifts between patient and screen.\nDelays increase chair time.\n\nThe interface must support flow without demanding attention.',
        highlight: 'One hand · Patient and screen · Chair time',
        image: '',
        splitRatio: 50,
      },
      {
        type: 'issuesBreakdown',
        label: 'The Breakdown',
        title: 'When incremental improvements stopped working',
        issues: [
          { number: '1', title: 'New scan types', description: 'More tools and features were added over time.' },
          { number: '2', title: 'More post-scan tools', description: 'Each solved a local need.' },
          { number: '3', title: 'Additional review capabilities', description: 'Together they created a fragmented experience.' },
        ],
        conclusion: 'Scanning, editing, and reviewing no longer felt like one coherent flow.',
      },
      {
        type: 'text',
        label: 'Research & Insight',
        title: 'What clinicians struggled with',
        content: 'From interviews and live walkthroughs, one theme repeated.\n\nKey issues:\n\n• Unclear system state\n• Tools scattered across the interface\n• Fear of making irreversible mistakes\n\nThis was a structural issue, not a single interaction problem.',
        highlight: '"I\'m never fully sure where I am — scanning, editing, or reviewing."',
      },
      {
        type: 'achieveGoals',
        label: 'Goals & KPIs',
        title: 'Defining success before redesign',
        leftColumn: {
          title: 'Goals',
          goals: [
            { number: '1', text: 'Create a unified Scan & View experience' },
            { number: '2', text: 'Reduce cognitive load during live procedures' },
            { number: '3', text: 'Enable complex workflows without adding confusion' },
            { number: '4', text: 'Build a scalable structure for future features' },
          ],
        },
        rightColumn: {
          title: 'KPIs',
          goals: [
            { number: '1', text: 'Average time to select a tool' },
            { number: '2', text: 'Overall scan duration' },
            { number: '3', text: 'Misclick rate during scanning' },
            { number: '4', text: 'Adoption of advanced features (AI detect, multi-scan)' },
          ],
        },
      },
      {
        type: 'chapter',
        number: '02',
        title: 'Building the Foundation',
        subtitle: 'A scalable icon language',
      },
      {
        type: 'challengeSolution',
        label: 'Icons',
        title: 'Icons that worked individually failed as a system',
        challenge: 'As the toolset grew, icons became inconsistent:\n\n• Mixed stroke weights\n• Unclear metaphors\n• Uneven visual hierarchy\n\nWhen grouped together, they created visual noise.',
        solution: 'Creating a scalable icon language.\n\nBefore touching layout, the visual language was unified:\n\n• Standardized grid and stroke rules\n• Consistent visual weight\n• Simplified metaphors\n\nThis created a foundation for grouping and expansion.',
      },
      {
        type: 'chapter',
        number: '03',
        title: 'Live Scanning Structure',
        subtitle: 'A single home for scanning actions',
      },
      {
        type: 'challengeSolution',
        label: 'Toolbar placement',
        title: 'Tools without a predictable structure',
        challenge: 'Even with aligned icons, tools were:\n\n• Scattered across the screen\n• Hard to reach with one hand\n• Competing with the scan canvas\n\nClinicians searched mid-scan.',
        solution: 'Defining a single home for scanning actions.\n\nMultiple toolbar positions were tested: vertical, bottom, top.\n\nThe horizontal top toolbar proved most stable:\n\n• Predictable reach\n• Minimal obstruction\n• Strong muscle memory',
      },
      {
        type: 'challengeSolution',
        label: 'Adaptive toolbar',
        title: 'One static toolbar couldn\'t support all experience levels',
        challenge: 'Different clinicians had different needs:\n\n• Experts wanted speed\n• Others wanted clarity and reassurance\n\nIcons alone were not always sufficient.',
        solution: 'An adaptive toolbar for speed and confidence.\n\nThe toolbar supports two states:\n\n• Collapsed — icons only\n• Expanded — icons with labels\n\nClinicians can switch between them without interrupting scanning.',
      },
      {
        type: 'chapter',
        number: '03',
        title: 'Clinical Tools',
        subtitle: 'Prep Review · Margin Line · Trim',
      },
      {
        type: 'challengeSolution',
        label: 'Prep Review',
        title: 'Validation felt like manual editing',
        challenge: 'The legacy Prep Review required:\n\n• Adjusting technical parameters\n• Manually correcting AI hints\n• Focusing on "how to fix" instead of "is it acceptable?"\n\nClinicians acted like data editors.',
        solution: 'Turning validation into a decision checkpoint.\n\nPrep Review was reframed as a binary decision.\n\n• Primary action: "Select" (accept scan)\n• Secondary action: "Erase & Rescan"\n• AI performs validation, clinician confirms\n\nThe interaction shifted from manipulation to judgment.',
      },
      {
        type: 'challengeSolution',
        label: 'Margin Line',
        title: 'AI existed but was hidden',
        challenge: 'Previously:\n\n• AI detection was buried in menus\n• Clinicians manually drew margins\n• High fatigue and human error\n\nAI was passive instead of central.',
        solution: 'AI-first detection with visible context.\n\nThe margin tool was redesigned around AI detection.\n\n• Primary CTA: "Detect"\n• Visible tooth header (e.g., Tooth 11, Upper Jaw)\n• Clinician reviews instead of draws\n\nAI handles precision. The clinician provides oversight.',
      },
      {
        type: 'challengeSolution',
        label: 'Trim Tool',
        title: 'Precision tapping during live scanning',
        challenge: 'The old Trim tool:\n\n• Required small target selection\n• Was difficult with gloves\n• Increased open-mouth time\n\nInteraction demanded accuracy under pressure.',
        solution: 'A touch-native confirm loop.\n\nTrim was redesigned for one-handed interaction.\n\n• Large gesture-based trimming\n• Massive Confirm / Undo buttons\n• Clear stage-based interaction\n\nThis reduced physical strain and interaction errors.',
      },
      {
        type: 'chapter',
        number: '03',
        title: 'Multi-Scan Workflows',
        subtitle: 'Structuring multiple scans as a session',
      },
      {
        type: 'challengeSolution',
        label: 'Multi-scan',
        title: 'A single-scan mental model',
        challenge: 'Real cases require:\n\n• Additional scans\n• Revisions\n• Bite scans\n• Pre / post comparisons\n\nThe previous system wasn\'t structured for multi-scan sessions.\nSwitching context felt risky.',
        solution: 'Structuring multiple scans as a session.\n\nMulti-scan capability was introduced as a core feature.\n\n• Chrome-like tab system\n• Clear scan labeling (Pre, Post, Bite, Additional)\n• Safe switching between scans\n\nThis provided flexibility without losing orientation.',
      },
      {
        type: 'chapter',
        number: '04',
        title: 'Review & Control',
        subtitle: 'Layer control and safe comparison',
      },
      {
        type: 'challengeSolution',
        label: 'View panel',
        title: 'Reviewing felt fragile and unsafe',
        challenge: 'Clinicians feared:\n\n• Accidentally editing data\n• Losing track of active layers\n• Incorrect comparisons\n\nReview required confidence, not caution.',
        solution: 'A dedicated View panel for layer control.\n\nA structured View panel was introduced.\n\n• Show / hide layers\n• Adjust opacity\n• Compare scans safely\n\nReview became controlled and intentional.',
      },
      {
        type: 'outcomes',
        label: 'Outcomes',
        title: 'From hesitation to confidence',
        outcomes: [
          { title: 'Faster tool selection', description: '' },
          { title: 'Reduced hesitation during live scanning', description: '' },
          { title: 'Increased adoption of AI detection', description: '' },
          { title: 'Higher usage of multi-scan workflows', description: '' },
          { title: 'The system became scalable and predictable', description: '' },
        ],
      },
      {
        type: 'text',
        label: 'Key Takeaway',
        title: 'Designing for clarity under pressure',
        content: 'In live clinical environments:\n\n• Structure reduces cognitive load\n• Visible state builds confidence\n• Predictability drives adoption\n\nRedesigning the system — not just the screens — changed the experience.',
      },
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'Want to work together on your next project?',
        buttons: [
          { text: 'Get in touch', link: 'mailto:hello@example.com' },
          { text: 'View more projects', link: '/' },
        ],
      },
    ],
  },
};

// Helper functions for localStorage

// Process an image - compress for storage efficiency
export const compressImage = (dataUrl, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve) => {
    // If not a data URL or not an image, return as-is
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Always compress to save space, resize if larger than maxWidth
      const canvas = document.createElement('canvas');
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Always use JPEG for compression (much smaller file size)
      // PNG is only preserved for very small images (likely icons/logos)
      const originalSize = dataUrl.length;
      const isSmallPng = dataUrl.startsWith('data:image/png') && originalSize < 50000; // 50KB
      const format = isSmallPng ? 'image/png' : 'image/jpeg';
      const outputQuality = isSmallPng ? 1.0 : quality;
      
      const compressed = canvas.toDataURL(format, outputQuality);
      
      // Only use compressed if it's actually smaller
      if (compressed.length < originalSize) {
        resolve(compressed);
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl); // On error, return original
    img.src = dataUrl;
  });
};

// Compress all images in the data object recursively
const compressDataImages = async (data) => {
  if (!data) return data;
  
  if (typeof data === 'string' && data.startsWith('data:image')) {
    return await compressImage(data);
  }
  
  if (Array.isArray(data)) {
    return Promise.all(data.map(item => compressDataImages(item)));
  }
  
  if (typeof data === 'object') {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = await compressDataImages(data[key]);
    }
    return result;
  }
  
  return data;
};

// ========== IndexedDB Storage via Dexie (shared PortfolioDev database) ==========
import { saveCaseStudy, getCaseStudy, deleteCaseStudy, listCaseStudies } from '../storage/devStore';

const getFromIndexedDB = (projectId) => getCaseStudy(projectId);
const saveToIndexedDB = (projectId, data) => saveCaseStudy(projectId, data);
const deleteFromIndexedDB = (projectId) => deleteCaseStudy(projectId);

// ========== Public API ==========
export const getCaseStudyData = (projectId) => {
  // First try localStorage (for backward compatibility and sync access)
  try {
    const saved = localStorage.getItem(`caseStudy_${projectId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    // Check for minimal version (structure without images)
    const minimal = localStorage.getItem(`caseStudy_${projectId}_minimal`);
    if (minimal) {
      // Return minimal version - images will be loaded from IndexedDB via async
      return JSON.parse(minimal);
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }
  return defaultCaseStudies[projectId] || defaultCaseStudies['align-technology'];
};

// Async version that checks IndexedDB first (for larger data)
export const getCaseStudyDataAsync = async (projectId) => {
  console.log(`[getCaseStudyDataAsync] Loading data for projectId: ${projectId}`);
  
  // Try IndexedDB first (larger storage)
  try {
    const idbData = await getFromIndexedDB(projectId);
    if (idbData) {
      console.log('[getCaseStudyDataAsync] Found data in IndexedDB');
      // Also sync to localStorage if we got data from IndexedDB
      // This ensures localStorage is up to date for future sync loads
      try {
        const jsonData = JSON.stringify(idbData);
        const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
        if (sizeInMB < 4) {
          localStorage.setItem(`caseStudy_${projectId}`, jsonData);
          localStorage.removeItem(`caseStudy_${projectId}_idb`); // Clear marker if full data fits
          localStorage.removeItem(`caseStudy_${projectId}_minimal`); // Clear minimal version
          console.log('[getCaseStudyDataAsync] Synced full data to localStorage');
        } else {
          // Keep the marker that full data is in IndexedDB
          localStorage.setItem(`caseStudy_${projectId}_idb`, 'true');
          console.log('[getCaseStudyDataAsync] Data too large, keeping IndexedDB marker');
        }
      } catch (e) {
        // localStorage sync failed, but we have the data from IndexedDB
        console.warn('[getCaseStudyDataAsync] Failed to sync IndexedDB data to localStorage:', e);
      }
      return idbData;
    } else {
      console.log('[getCaseStudyDataAsync] No data found in IndexedDB');
    }
  } catch (e) {
    console.warn('[getCaseStudyDataAsync] IndexedDB read failed, trying localStorage:', e);
  }
  
  // Fall back to localStorage (or minimal version)
  const fallbackData = getCaseStudyData(projectId);
  console.log('[getCaseStudyDataAsync] Using fallback data from localStorage/defaults');
  return fallbackData;
};

export const saveCaseStudyData = async (projectId, data) => {
  try {
    console.log(`[saveCaseStudyData] Starting save for projectId: ${projectId}`);
    
    // Compress images first
    const compressedData = await compressDataImages(data);
    console.log('[saveCaseStudyData] Images compressed');
    
    // Try IndexedDB first (much larger limit - 50MB+)
    const idbSuccess = await saveToIndexedDB(projectId, compressedData);
    console.log(`[saveCaseStudyData] IndexedDB save result: ${idbSuccess}`);
    
    if (idbSuccess) {
      // Always try to save to localStorage as backup/fallback
      try {
        const jsonData = JSON.stringify(compressedData);
        const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
        console.log(`[saveCaseStudyData] Data size: ${sizeInMB.toFixed(2)}MB`);
        
        if (sizeInMB < 4) {
          // Full data fits, save it
          localStorage.setItem(`caseStudy_${projectId}`, jsonData);
          localStorage.removeItem(`caseStudy_${projectId}_idb`); // Clear marker if full data fits
          localStorage.removeItem(`caseStudy_${projectId}_minimal`); // Clear minimal version
          console.log('[saveCaseStudyData] Saved full data to localStorage');
        } else {
          // Data is too large for localStorage, mark that it's in IndexedDB
          // Don't save to localStorage to avoid quota issues
          localStorage.setItem(`caseStudy_${projectId}_idb`, 'true');
          console.log('[saveCaseStudyData] Data too large, marked for IndexedDB only');
          
          // Try to keep a minimal version in localStorage if possible (structure only)
          // But don't fail if it doesn't fit
          try {
            // Create a minimal structure copy (without images) for quick loading
            const minimalCopy = JSON.parse(JSON.stringify(compressedData));
            const removeImages = (obj) => {
              if (typeof obj === 'string' && obj.startsWith('data:image')) {
                return '';
              }
              if (Array.isArray(obj)) {
                return obj.map(item => removeImages(item));
              }
              if (obj && typeof obj === 'object') {
                const result = {};
                for (const key in obj) {
                  result[key] = removeImages(obj[key]);
                }
                return result;
              }
              return obj;
            };
            const minimal = removeImages(minimalCopy);
            const minimalJson = JSON.stringify(minimal);
            const minimalSize = new Blob([minimalJson]).size / (1024 * 1024);
            if (minimalSize < 2) {
              // Save minimal structure for quick display
              localStorage.setItem(`caseStudy_${projectId}_minimal`, minimalJson);
              console.log('[saveCaseStudyData] Saved minimal structure to localStorage');
            }
          } catch (e) {
            // Minimal copy failed, that's okay - IndexedDB has the full data
            console.warn('[saveCaseStudyData] Failed to create minimal copy:', e);
          }
        }
      } catch (lsError) {
        // localStorage failed but IndexedDB succeeded, that's okay
        console.warn('[saveCaseStudyData] localStorage backup failed, but IndexedDB save succeeded:', lsError);
      }
      console.log('[saveCaseStudyData] Save completed successfully');
      return true;
    }
    
    // IndexedDB failed, try localStorage only
    console.warn('[saveCaseStudyData] IndexedDB failed, falling back to localStorage only');
    const jsonData = JSON.stringify(compressedData);
    localStorage.setItem(`caseStudy_${projectId}`, jsonData);
    localStorage.removeItem(`caseStudy_${projectId}_idb`); // Clear IDB marker
    console.log('[saveCaseStudyData] Saved to localStorage only');
    return true;
    
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('[saveCaseStudyData] Storage quota exceeded.');
      alert('Storage limit reached! Try using smaller images or remove some existing images.');
      return false;
    }
    console.error('[saveCaseStudyData] Error saving case study data:', e);
    return false;
  }
};

export const resetCaseStudyData = async (projectId) => {
  // Remove from both storages
  localStorage.removeItem(`caseStudy_${projectId}`);
  await deleteFromIndexedDB(projectId);
  return defaultCaseStudies[projectId];
};

/**
 * List all case studies that have saved data (IndexedDB + localStorage).
 * Returns [{ projectId, slideCount, updatedAt? }] sorted by slideCount descending.
 * Use this to find which project has your 30+ slides.
 */
export const listSavedCaseStudies = async () => {
  const byId = new Map();
  try {
    const idbList = await listCaseStudies();
    idbList.forEach(({ id, slideCount, updatedAt }) => {
      byId.set(id, { projectId: id, slideCount, updatedAt });
    });
  } catch (e) {
    console.warn('[listSavedCaseStudies] IndexedDB list failed:', e);
  }
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('caseStudy_') && !key.includes('_idb') && !key.includes('_minimal')) {
        const projectId = key.replace(/^caseStudy_/, '');
        if (byId.has(projectId)) return;
        try {
          const raw = localStorage.getItem(key);
          const data = raw ? JSON.parse(raw) : null;
          const slideCount = data?.slides?.length ?? 0;
          byId.set(projectId, { projectId, slideCount });
        } catch (_) {}
      }
    });
  } catch (e) {
    console.warn('[listSavedCaseStudies] localStorage scan failed:', e);
  }
  const list = Array.from(byId.values());
  list.sort((a, b) => (b.slideCount || 0) - (a.slideCount || 0));
  return list;
};

export const getAllProjectIds = () => Object.keys(defaultCaseStudies);
