// Case Study Data - Editable via Edit Mode (Cmd+E)
// Data is saved to localStorage when edited
// Use "Save to Code" in edit mode to persist changes to source files

import { savedCaseStudies } from './case-studies/index.js';

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
    introHeaderMode: 'both', // 'both' = title + logo at bottom, 'logo' = logo only in title position
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
  media: {
    type: 'media',
    title: 'Media Slide',
    image: [{ src: '', caption: '', position: 'center center', size: 'large', fit: 'cover', embedUrl: '' }],
  },
  textAndImage: {
    type: 'problem',
    label: 'Section',
    title: 'Heading',
    content: 'Add your text here. Use for context, problem, testing, feature, or any split layout.',
    issues: ['Point 1', 'Point 2', 'Point 3'],
    issuesTitle: '',
    conclusion: 'Optional conclusion or takeaway.',
    image: '',
    splitRatio: 50,
    bullets2: [],
    bullets2Title: '',
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
    bullets: [],
    bulletsTitle: '',
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
      { title: 'Outcome 1', description: 'Description of this outcome.', metric: '' },
      { title: 'Outcome 2', description: 'Description of this outcome.', metric: '' },
    ],
  },
  end: {
    type: 'end',
    title: 'Thank You',
    subtitle: 'Want to work together?',
    cta: 'Get in touch',
    email: '',
    phone: '',
    linkedinUrl: '',
  },

  // === NEW TEMPLATES ===
  
  // Before/After comparison — supports images, text, bullets, and highlight
  comparison: {
    type: 'comparison',
    label: 'Before & After',
    title: 'The Transformation',
    description: '',
    beforeImage: '',
    afterImage: '',
    beforeLabel: 'Before',
    afterLabel: 'After',
    beforeDescription: '',
    afterDescription: '',
    beforeBullets: [],
    beforeBulletsTitle: '',
    afterBullets: [],
    afterBulletsTitle: '',
    bullets: [],
    bulletsTitle: '',
    highlight: '',
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
  
  // Big quote/testimonial
  testimonial: {
    type: 'testimonial',
    quote: 'This is a standout quote that deserves its own slide.',
    author: 'Client Name',
    role: 'CEO, Company',
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


  // Image Mosaic - Tiled images background with centered title overlay
  imageMosaic: {
    type: 'imageMosaic',
    title: 'Old version',
    images: [],
  },

  // Chapter - Section divider slide
  chapter: {
    type: 'chapter',
    number: '01',
    title: 'Research',
    subtitle: 'Understanding the problem space',
  },


};

// Template categories for easier navigation
export const templateCategories = {
  'Introduction': ['intro', 'info', 'chapter'],
  'Visual': ['media', 'imageMosaic'],
  'Layout': ['testimonial'],
  'Showcase': ['projectShowcase'],
  'Research': ['textAndImage', 'issuesBreakdown', 'quotes'],
  'Process': ['goals', 'achieveGoals', 'process', 'timeline'],
  'Features': ['comparison', 'tools'],
  'Results': ['stats', 'outcomes', 'end'],
};

export const defaultCaseStudies = {
  'align-technology': {
    dataVersion: 2,
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
        type: 'context',
        label: 'Research & Insight',
        title: 'What clinicians struggled with',
        content: 'From interviews and live walkthroughs, one theme repeated:\n\nThis was not a usability issue in isolation. It was a structural breakdown in the overall flow.',
        highlight: '"I\'m never fully sure where I am — scanning, editing, or reviewing."',
        bulletsTitle: 'Key issues:',
        bullets: [
          'Unclear system state',
          'Tools scattered across the interface',
          'Fear of making irreversible changes',
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
        type: 'context',
        label: 'The Solution',
        title: 'Creating a scalable icon language',
        content: 'The icon system was redesigned before adjusting layout.\n\nChanges included unified grid and stroke rules, balanced visual weight, and simplified metaphors.\n\nThis created a visual foundation capable of scaling.',
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
        type: 'context',
        label: 'The Solution',
        title: 'Defining a single home for scanning actions',
        content: 'The horizontal top toolbar proved most stable.\n\nPredictable reach, minimal obstruction, and strong muscle memory.\n\nThis became the structural anchor of the Scan page.',
        image: '',
      },
      // Slide 11 — Adaptive Problem
      {
        type: 'context',
        label: 'The Problem',
        title: 'One static toolbar couldn\'t support all moments',
        content: 'Different clinicians had different needs.\n\nExperts wanted speed. Others wanted reassurance. Icons alone were not always sufficient.',
      },
      // Slide 12 — Adaptive Solution
      {
        type: 'context',
        label: 'The Solution',
        title: 'An adaptive toolbar for speed and clarity',
        content: 'The toolbar supports two states: collapsed (icons only) and expanded (icons with labels).\n\nClinicians can switch states without interrupting scanning.',
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
        type: 'context',
        label: 'Prep Review — Solution',
        title: 'Turning validation into a decision checkpoint',
        content: 'Prep Review was reframed as a binary decision: Select, or Erase and Rescan.\n\nAI validates. The clinician confirms.',
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
        type: 'context',
        label: 'Margin Line — Solution',
        title: 'Making AI the primary path',
        content: 'The tool was redesigned around AI-first detection.\n\nDetect as the main action. Visible tooth context. Review instead of draw.',
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
        type: 'context',
        label: 'Trim Tool — Solution',
        title: 'A touch-native confirm loop',
        content: 'Trim was redesigned for one-handed interaction.\n\nLarge gesture trimming. Clear Confirm and Undo. Stage-based flow.',
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
        type: 'context',
        label: 'The Solution',
        title: 'Structuring multiple scans as one session',
        content: 'Multi-scan support was introduced with a clear structure.\n\nTab-based structure. Clear scan labeling. Safe switching.',
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
        type: 'context',
        label: 'The Solution',
        title: 'A dedicated review panel for control',
        content: 'A structured View panel allows clinicians to review with confidence.\n\nShow and hide layers. Adjust opacity. Compare safely.',
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
        type: 'testimonial',
        label: 'Key Takeaway',
        quote: 'Designing for clarity under pressure',
        context: 'In live clinical environments, structure reduces cognitive load, visible state builds confidence, and predictability drives adoption. Redesigning the system — not just the interface — made the difference.',
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
  'itero-scan-workflow': {
    dataVersion: 3,
    title: 'iTero\nScan Experience',
    subtitle: 'Redesigning the clinical scanning workflow to improve speed, clarity, and decision-making in real treatment conditions.',
    category: 'Clinical Workflow Redesign',
    year: '2024',
    color: '#E8847C',
    slides: [
      {
        type: 'intro',
        title: 'iTero\nScan Experience',
        description: 'Redesigning the clinical scanning workflow to improve speed, clarity, and decision-making in real treatment conditions.',
        clientLabel: 'Client',
        client: 'Align Technology',
        focusLabel: 'Focus',
        focus: 'Clinical UX',
        image: [
          { src: '', caption: 'iTero scanner interface during a live scan session' },
        ],
      },
      {
        type: 'info',
        title: 'Project Overview',
        items: [
          { label: 'Role', value: 'UX/UI Designer' },
          { label: 'Product', value: 'iTero Scanner' },
          { label: 'Duration', value: 'Ongoing' },
          { label: 'Scope', value: 'End-to-end redesign' },
        ],
        bulletsTitle: 'Focus Areas',
        bullets: [
          'Scanning workflow redesign',
          'Clinical decision tools',
          'Toolbar system',
          'RX to View experience',
          'Design system alignment',
        ],
      },
      {
        type: 'textAndImage',
        label: 'Context',
        title: 'Designing inside a clinical workflow',
        content: 'The scanning process happens in a time-critical environment where dentists must divide attention between the patient, the scanner, and the screen. Every interaction must be fast, clear, and reliable.',
        issuesTitle: 'Constraints',
        issues: [
          'Time-critical actions',
          'Split attention',
          'High precision needed',
          'Low error tolerance',
        ],
        image: [
          { src: '', caption: 'Dentist scanning a patient using iTero scanner' },
        ],
      },
      {
        type: 'issuesBreakdown',
        label: 'Problem',
        title: 'What started to break',
        issues: [
          { number: '1', title: 'Overloaded interface', description: 'Too many tools visible at once' },
          { number: '2', title: 'Weak hierarchy', description: 'No clear prioritization of actions' },
          { number: '3', title: 'Fragmented flow', description: 'RX, Scan, and View disconnected' },
          { number: '4', title: 'Decision friction', description: 'Hard to validate clinical results' },
        ],
      },
      {
        type: 'textAndImage',
        label: 'Old Experience',
        title: 'From scanning to hesitation',
        content: 'As more features were added, the interface became harder to navigate. The system exposed functionality but didn\'t align with how clinicians think and act during a scan.',
        issuesTitle: 'Pain points',
        issues: [
          'Visual noise',
          'Slow access to tools',
          'High cognitive load',
          'Frequent hesitation',
        ],
        image: [
          { src: '', caption: 'Old scanning interface with crowded UI and toolbar' },
        ],
      },
      {
        type: 'quotes',
        label: 'Research',
        title: 'What clinicians said',
        content: 'Feedback collected from usability sessions and real workflows.',
        quotes: [
          { text: 'I don\'t have time to think about the UI while scanning.', author: 'Dr. Amir Cohen' },
          { text: 'Sometimes I\'m not sure if the prep is actually correct.', author: 'Dr. Yael Levi' },
          { text: 'There\'s too much happening on the screen at once.', author: 'Dr. Daniel Katz' },
        ],
      },
      {
        type: 'goals',
        label: 'Goals',
        title: 'What we wanted to achieve',
        goals: [
          { number: '1', title: 'Reduce cognitive load', description: 'Simplify what users see and process' },
          { number: '2', title: 'Increase speed', description: 'Enable faster interactions' },
          { number: '3', title: 'Support decisions', description: 'Improve clinical confidence' },
        ],
        kpis: [
          'Task completion time',
          'Error rate reduction',
          'Tool usage efficiency',
          'User confidence',
        ],
      },
      {
        type: 'process',
        label: 'Process',
        title: 'How we approached it',
        steps: [
          { number: '01', title: 'Audit', description: 'Mapped tools and flows across system' },
          { number: '02', title: 'Reframing', description: 'Separated navigation vs decisions' },
          { number: '03', title: 'Redesign', description: 'Built unified system experience' },
          { number: '04', title: 'Testing', description: 'Validated with interactive prototypes' },
        ],
      },
      {
        type: 'comparison',
        label: 'Workflow',
        title: 'From fragmented to structured',
        beforeImage: '',
        afterImage: '',
        beforeLabel: 'Before',
        afterLabel: 'After',
        beforeDescription: 'Disconnected experience across RX, scan, and view phases.',
        afterDescription: 'Clear, structured workflow with predictable transitions.',
        beforeBullets: [
          'Disconnected phases',
          'No clear flow',
          'Hard transitions',
        ],
        afterBullets: [
          'Structured phases',
          'Clear progression',
          'Consistent experience',
        ],
      },
      {
        type: 'textAndImage',
        label: 'System',
        title: 'Connecting RX, Scan, and View',
        content: 'The redesign unified the entire experience\u2014from case setup to scanning to review\u2014into a continuous flow. Each phase now supports the next instead of feeling like separate tools.',
        issuesTitle: 'Improvements',
        issues: [
          'Clear phase transitions',
          'Consistent interaction patterns',
          'Better context awareness',
        ],
        image: [
          { src: '', caption: 'Flow diagram of RX to Scan to View experience' },
        ],
      },
      {
        type: 'textAndImage',
        label: 'Toolbar',
        title: 'Reducing noise, improving speed',
        content: 'The toolbar was simplified to reduce overload and improve access speed. Instead of showing everything, it focuses on what is relevant in the moment.',
        issuesTitle: 'Design changes',
        issues: [
          'Unified icon system',
          'Cleaner visual hierarchy',
          'Reduced visible tools',
        ],
        bullets2Title: 'Adaptive behavior',
        bullets2: [
          'Expand for clarity',
          'Collapse for speed',
        ],
        image: [
          { src: '', caption: 'Toolbar showing collapsed and expanded states' },
        ],
      },
      {
        type: 'textAndImage',
        label: 'Clinical Decisions',
        title: 'From tools to outcomes',
        content: 'After stabilizing navigation, the focus shifted to clinical tools. The goal was to help dentists validate their work quickly instead of manually adjusting it.',
        issuesTitle: 'Approach',
        issues: [
          'Simplified interactions',
          'Clear visual feedback',
          'Reduced manual corrections',
        ],
        image: [
          { src: '', caption: 'Prep QC, margin line, and trim tool redesigns' },
        ],
      },
      {
        type: 'comparison',
        label: 'Interaction',
        title: 'From adjustment to validation',
        beforeImage: '',
        afterImage: '',
        beforeLabel: 'Before',
        afterLabel: 'After',
        beforeDescription: 'Clinicians manually adjusted results with uncertainty.',
        afterDescription: 'System guides validation with clear feedback.',
        beforeBullets: [
          'Manual corrections',
          'Unclear results',
          'High effort',
        ],
        afterBullets: [
          'Guided workflow',
          'Clear validation',
          'Faster decisions',
        ],
      },
      {
        type: 'media',
        label: 'Final Design',
        title: 'The redesigned scan experience',
        image: [
          { src: '', caption: 'Full scan interface showing new system, toolbar, and tools' },
        ],
      },
      {
        type: 'outcomes',
        label: 'Results',
        title: 'What this improved',
        outcomes: [
          { title: 'Clearer workflows', description: 'More predictable and structured scanning experience' },
          { title: 'Faster interaction', description: 'Reduced hesitation and navigation time' },
          { title: 'Better decisions', description: 'Higher confidence during clinical evaluation' },
        ],
      },
      {
        type: 'tools',
        label: 'Tools & Methods',
        title: 'Built With',
        tools: [
          { name: 'Figma', description: 'Design and prototyping' },
          { name: 'Cursor', description: 'Interactive prototypes' },
          { name: 'User Testing', description: 'Clinician validation' },
          { name: 'Design System', description: 'Consistency and scalability' },
        ],
      },
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'Let\'s build better clinical systems',
        cta: 'Get in touch',
      },
    ],
  },
  'template-demo': {
    dataVersion: 3,
    title: 'Template\nDemo',
    subtitle: 'All slide templates in one place',
    category: 'Template Reference',
    year: '2025',
    color: '#4A90E2',
    slides: [
      // ─── 1. intro ───
      {
        type: 'intro',
        title: 'Template\nDemo',
        description: 'A showcase of every available slide template. Browse through to see what each one looks like and how it works.',
        clientLabel: 'Type',
        client: 'Demo',
        focusLabel: 'Purpose',
        focus: 'Template Reference',
        introHeaderMode: 'both',
        splitRatio: 50,
      },
      // ─── 2. info ───
      {
        type: 'info',
        label: 'info',
        title: 'Project Overview',
        items: [
          { label: 'Client', value: 'Company Name' },
          { label: 'Role', value: 'Lead Product Designer' },
          { label: 'Duration', value: '3 months' },
          { label: 'Deliverables', value: 'Design system, Prototypes, Specs' },
        ],
        bullets: ['Optional bullet point below the info grid', 'Another supporting detail'],
        bulletsTitle: 'Additional notes',
      },
      // ─── 3. context ───
      {
        type: 'context',
        label: 'context',
        title: 'Context Slide',
        content: 'The context slide uses a split layout — text on the left, image on the right. It supports a label, title, body text, bullets, and optional conclusion.',
        bullets: ['Split layout with adjustable ratio', 'Supports Simple, Before/After, and Tabs modes', 'Optional highlight note'],
        bulletsTitle: 'Features',
        image: '',
        splitRatio: 50,
      },
      // ─── 8. problem ───
      {
        type: 'problem',
        label: 'problem',
        title: 'Problem Slide',
        content: 'The problem slide shares the same unified component as context, feature, testing, and comparison. It maps "issues" as bullets and supports a conclusion.',
        issues: ['First pain point or finding', 'Second issue discovered', 'Third problem identified'],
        issuesTitle: 'Key issues',
        bullets2: ['Additional context point', 'Supporting detail'],
        bullets2Title: 'Additional notes',
        conclusion: 'The conclusion appears at the bottom of the text column.',
        image: '',
        splitRatio: 50,
      },
      // ─── 9. feature ───
      {
        type: 'feature',
        label: 'feature',
        title: 'Feature Slide',
        description: 'The feature slide uses the same split layout. Its body text field is called "description" and bullets are generic. Perfect for showcasing individual features.',
        bullets: ['Shared component with problem/context/testing', 'Same three style modes available', 'Image on the right side'],
        bulletsTitle: 'Capabilities',
        image: '',
        splitRatio: 50,
      },
      // ─── 10. testing ───
      {
        type: 'testing',
        label: 'testing',
        title: 'Testing Slide',
        content: 'The testing slide uses "layouts" as its bullet field name. It includes a conclusion section and shares the same unified component.',
        layouts: ['Layout variation A tested', 'Layout variation B tested', 'Layout variation C tested'],
        layoutsTitle: 'Tested layouts',
        conclusion: 'Testing revealed that option B performed best across all user segments.',
        image: '',
        splitRatio: 50,
      },
      {
        type: 'chapter',
        number: '01',
        title: 'Visual & Media',
        subtitle: 'Media, image, and showcase slides',
      },
      // ─── media ───
      {
        type: 'media',
        label: 'media',
        title: 'Media Slide',
        image: [{ src: '', caption: 'Supports images, Figma embeds, video URLs, and GIFs.', position: 'center center', size: 'large', fit: 'cover', embedUrl: '' }],
      },
      // ─── textAndImage ───
      {
        type: 'textAndImage',
        label: 'textAndImage',
        title: 'Text & Image Split',
        content: 'This split layout pairs text on the left with an image on the right. It supports body text, bullets, conclusion, and a highlight note.',
        bullets: ['Split layout with adjustable ratio', 'Supports multiple bullet groups', 'Optional conclusion section'],
        bulletsTitle: 'Features',
        image: '',
        splitRatio: 50,
      },
      // ─── projectShowcase ───
      {
        type: 'projectShowcase',
        label: 'projectShowcase',
        slideNumber: '01',
        title: 'Project Showcase',
        subtitle: 'Feature highlight template',
        description: 'Two-column layout with large number, title, description, and tag chips on the left. Full image on the right.',
        tags: ['UX Design', 'Interaction', 'MedTech'],
        projectShowcaseHeader: 'both',
        image: '',
        splitRatio: 50,
      },
      // ─── imageMosaic ───
      {
        type: 'imageMosaic',
        label: 'imageMosaic',
        title: 'Image Mosaic',
        images: [],
      },
      {
        type: 'chapter',
        number: '02',
        title: 'Research',
        subtitle: 'Discovery and analysis slides',
      },
      // ─── issuesBreakdown ───
      {
        type: 'issuesBreakdown',
        label: 'issuesBreakdown',
        title: 'Issues Breakdown Grid',
        subtitle: 'Numbered cards showing specific problems',
        description: 'Displays issues in a configurable grid (1-4 columns). Each card has a number, title, and description.',
        cardsTitle: 'What broke',
        issues: [
          { number: '1', title: 'Slow workflows', description: 'Too many steps to complete basic tasks' },
          { number: '2', title: 'Hidden tools', description: 'Critical features buried in menus' },
          { number: '3', title: 'No context', description: 'Same UI regardless of current task' },
          { number: '4', title: 'Error-prone', description: 'Easy to select wrong options' },
        ],
        gridColumns: 2,
        highlight: 'This highlight note appears below the issue cards.',
      },
      // ─── quotes ───
      {
        type: 'quotes',
        label: 'quotes',
        title: 'Research Quotes Grid',
        content: 'User quotes in a card grid. Grid columns are configurable (1-4).',
        quotes: [
          { text: 'I spend more time looking for tools than actually working.', author: 'User A' },
          { text: 'The interface feels like it was designed by engineers, not for us.', author: 'User B' },
          { text: 'I wish I could just focus on my task without all the clutter.', author: 'User C' },
        ],
        gridColumns: 3,
        bullets: ['Collected from 15 interviews', 'Consistent theme across all user segments'],
        bulletsTitle: 'Research context',
      },
      // ─── 21. testimonial ───
      {
        type: 'testimonial',
        label: 'testimonial',
        quote: 'The new design feels like it reads my mind. I barely have to think about the interface anymore.',
        author: 'Dr. Sarah Mitchell',
        role: 'Lead Clinician, Demo Hospital',
        context: 'Feedback received during the final round of usability testing.',
      },
      {
        type: 'chapter',
        number: '03',
        title: 'Process & Goals',
        subtitle: 'Planning and process slides',
      },
      // ─── 22. goals ───
      {
        type: 'goals',
        label: 'goals',
        title: 'Goals & KPIs',
        description: ['Presents goals as numbered cards with an optional KPI section below.'],
        goalsCardsTitle: 'Design Goals',
        goals: [
          { number: '1', title: 'Simplify Navigation', description: 'Reduce cognitive load and make core actions intuitive' },
          { number: '2', title: 'Clear Data Visibility', description: 'Make information easy to scan at a glance' },
          { number: '3', title: 'Support All Users', description: 'Design for both novice and expert workflows' },
        ],
        gridColumns: 3,
        kpis: ['Task completion rate', 'Time on task', 'Error rate', 'User satisfaction'],
        kpisGridColumns: 4,
      },
      // ─── 23. achieveGoals ───
      {
        type: 'achieveGoals',
        label: 'achieveGoals',
        title: 'Two-Column Goals',
        description: 'Separates goals into two columns — KPIs vs metrics, or qualitative vs quantitative.',
        leftColumn: {
          title: 'KPIs',
          goals: [
            { number: '1', text: 'Reduce task completion time by 30%' },
            { number: '2', text: 'Improve first-try success rate to 90%' },
            { number: '3', text: 'Decrease support tickets by 50%' },
          ],
        },
        rightColumn: {
          title: 'Key Metrics',
          goals: [
            { number: '1', text: 'Average session duration' },
            { number: '2', text: 'Feature adoption rate' },
            { number: '3', text: 'Net promoter score (NPS)' },
          ],
        },
      },
      // ─── 24. process ───
      {
        type: 'process',
        label: 'process',
        title: 'Process Steps',
        steps: [
          { number: '01', title: 'Research', description: 'User interviews and field observations' },
          { number: '02', title: 'Define', description: 'Problem framing and opportunity mapping' },
          { number: '03', title: 'Design', description: 'Wireframes, prototypes, and iteration' },
          { number: '04', title: 'Test', description: 'Usability testing with target users' },
          { number: '05', title: 'Ship', description: 'Handoff, QA, and launch support' },
        ],
        highlight: 'Each phase included stakeholder reviews and user validation checkpoints.',
      },
      // ─── 25. timeline ───
      {
        type: 'timeline',
        label: 'timeline',
        title: 'Project Timeline',
        events: [
          { date: 'Week 1-2', title: 'Discovery', description: 'Stakeholder interviews, competitive analysis' },
          { date: 'Week 3-4', title: 'Define', description: 'Problem definition, persona refinement' },
          { date: 'Week 5-8', title: 'Design', description: 'Wireframes, prototypes, design system' },
          { date: 'Week 9-10', title: 'Test', description: 'Usability testing with 12 participants' },
          { date: 'Week 11-12', title: 'Ship', description: 'Final iteration, specs, handoff' },
        ],
      },
      {
        type: 'chapter',
        number: '04',
        title: 'Features & Comparison',
        subtitle: 'Comparison, tools, and feature slides',
      },
      // ─── 26. comparison (before-after mode) ───
      {
        type: 'comparison',
        label: 'comparison',
        slideMode: 'before-after',
        title: 'Before / After Comparison',
        description: 'Side-by-side comparison with pill or flat switcher. Each side supports its own image, description, and bullets.',
        beforeImage: '',
        afterImage: '',
        beforeLabel: 'Before',
        afterLabel: 'After',
        beforeDescription: 'The old interface had a static toolbar with 40+ tools visible at all times.',
        afterDescription: 'The redesigned toolbar uses phase-aware filtering, showing only relevant tools.',
        beforeBullets: ['All tools visible at once', 'No contextual awareness', 'High cognitive load'],
        beforeBulletsTitle: 'Issues',
        afterBullets: ['Phase-aware filtering', 'Contextual grouping', '70% fewer visible tools'],
        afterBulletsTitle: 'Improvements',
        highlight: 'Supports Simple, Before/After, and Tabs modes — switchable in edit mode.',
      },
      // ─── 27. comparison (tabs mode) ───
      {
        type: 'comparison',
        label: 'comparison (tabs)',
        slideMode: 'tabs',
        title: 'Tabbed Comparison',
        psTabs: [
          { label: 'Problem', columnLabel: 'The Problem:', image: '', embedUrl: '', bullets: ['Complex workflows with too many steps', 'Users struggled to find core actions'], bulletsTitle: '' },
          { label: 'Solution', columnLabel: 'The Solution:', image: '', embedUrl: '', bullets: ['Streamlined 5-step workflow into 2 steps', 'Contextual actions always visible'], bulletsTitle: '' },
          { label: 'Result', columnLabel: 'The Result:', image: '', embedUrl: '', bullets: ['40% faster task completion', '60% fewer support tickets'], bulletsTitle: '' },
        ],
        highlight: 'Tabs mode supports 2-6 tabs, each with its own label, bullets, and image.',
      },
      // ─── 28. tools ───
      {
        type: 'tools',
        label: 'tools',
        title: 'Tools & Methods',
        tools: [
          { name: 'Figma', description: 'Design & Prototyping' },
          { name: 'Maze', description: 'Usability Testing' },
          { name: 'Miro', description: 'Workshops & Mapping' },
          { name: 'Jira', description: 'Project Management' },
          { name: 'Hotjar', description: 'Analytics & Heatmaps' },
          { name: 'Notion', description: 'Documentation' },
        ],
        highlight: 'Tools are displayed in a responsive horizontal grid.',
      },
      {
        type: 'chapter',
        number: '05',
        title: 'Results',
        subtitle: 'Outcomes and closing slides',
      },
      // ─── 29. stats ───
      {
        type: 'stats',
        label: 'stats',
        title: 'Statistics',
        stats: [
          { value: '40%', label: 'Faster task completion' },
          { value: '60%', label: 'Fewer errors' },
          { value: '92%', label: 'User satisfaction' },
          { value: '3x', label: 'Feature adoption increase' },
        ],
        description: ['Stats are displayed as large values with labels. Use the optional suffix field for units.'],
        highlight: 'These metrics were measured 3 months after launch.',
      },
      // ─── 30. outcomes ───
      {
        type: 'outcomes',
        label: 'outcomes',
        title: 'Outcomes',
        outcomes: [
          { title: 'Faster Workflows', description: 'Users complete core tasks 40% faster with the redesigned interface.' },
          { title: 'Higher Confidence', description: 'Reduced error rate indicates better first-try accuracy.' },
          { title: 'Better Adoption', description: 'Advanced features saw 3x higher usage.' },
          { title: 'Scalable System', description: 'New architecture supports adding features without complexity creep.' },
        ],
        highlight: 'Outcomes are shown as cards with title and description.',
      },
      // ─── 31. end ───
      {
        type: 'end',
        title: 'Thank You',
        subtitle: 'This is the closing slide template',
        cta: 'Get in touch',
      },
    ],
  },
  'wizecare': {
    dataVersion: 1,
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
        type: 'context',
        label: 'Research & Discovery',
        title: 'Understanding real friction',
        content: 'To understand where clinicians struggled, I visited physiotherapy clinics, conducted user interviews, and reviewed support tickets and recurring issues.\n\nThis revealed a clear friction funnel across three critical workflows: patient management, care plan editing, and protocol creation.\n\nThese flows became the foundation for the redesign.',
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
        type: 'context',
        label: 'Redesign Strategy',
        title: 'Rebuilding around real workflows',
        content: 'Rather than making isolated UI improvements, the redesign focused on restructuring the product around the three workflows that mattered most.\n\nEach flow was addressed independently, while maintaining consistency across the system.',
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
        type: 'comparison',
        slideMode: 'tabs',
        label: 'Flow 01',
        title: 'Patient Management',
        psTabs: [
          { label: 'The Problem', columnLabel: 'The Problem:', image: '', embedUrl: '', bullets: ['Clinicians struggled to understand where patient details, care plans, and adherence metrics lived. Oversized tabs and unclear hierarchy made it hard to move from insight to action.'], bulletsTitle: '' },
          { label: 'The Solution', columnLabel: 'The Solution:', image: '', embedUrl: '', bullets: ['A dedicated patient page centralized all patient-related information', 'Clear separation between patient info, plans, and progress', 'Adherence metrics made prominent', 'Predictable navigation between views'], bulletsTitle: '' },
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
        type: 'comparison',
        slideMode: 'tabs',
        label: 'Flow 02',
        title: 'Care Plan Editing',
        psTabs: [
          { label: 'The Problem', columnLabel: 'The Problem:', image: '', embedUrl: '', bullets: ['Editing a care plan required navigating through 4–5 different screens, causing loss of context and cognitive fatigue. Exercises were displayed in cluttered lists, making errors more likely.'], bulletsTitle: '' },
          { label: 'The Solution', columnLabel: 'The Solution:', image: '', embedUrl: '', bullets: ['Care plan editor redesigned into a single focused screen', 'Exercises displayed as modular cards', 'Inline editing without modals or page changes', 'Patient health data pinned as a constant reference'], bulletsTitle: '' },
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
        type: 'testimonial',
        label: 'Key Insight',
        quote: 'Research showed that experienced physiotherapists prefer building their own protocols to tailor treatment to complex cases.',
        context: 'The old system lacked a clear protocol creation flow and forced reliance on rigid templates.',
      },
      // Slide 15: Flow 03 - Before/After
      {
        type: 'comparison',
        slideMode: 'tabs',
        label: 'Flow 03',
        title: 'Protocol Builder',
        psTabs: [
          { label: 'The Problem', columnLabel: 'The Problem:', image: '', embedUrl: '', bullets: ['The old system lacked a clear protocol creation flow and forced reliance on rigid templates.'], bulletsTitle: '' },
          { label: 'The Solution', columnLabel: 'The Solution:', image: '', embedUrl: '', bullets: ['New protocol builder using Kanban-style drag-and-drop model', 'Exercise library on the left, treatment plan board on the right', 'Reused the same card system as care plan editor for familiarity'], bulletsTitle: '' },
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
  }
};

// Merge: saved JSON files override hardcoded defaults
for (const [id, data] of Object.entries(savedCaseStudies)) {
  defaultCaseStudies[id] = data;
}


// Helper functions for localStorage

// Process an image - compress for storage efficiency
export const compressImage = (dataUrl, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve) => {
    // If not a data URL or not an image, return as-is
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    // SVGs are vector — skip canvas entirely, return unchanged
    if (dataUrl.startsWith('data:image/svg+xml')) {
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
      
      // Preserve PNG format to keep alpha channel (transparency).
      // Convert everything else (JPEG, WEBP, etc.) to JPEG for smaller file sizes.
      const originalSize = dataUrl.length;
      const isPng = dataUrl.startsWith('data:image/png');
      const format = isPng ? 'image/png' : 'image/jpeg';
      const outputQuality = isPng ? 0.95 : quality;
      
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
  const defaults = defaultCaseStudies[projectId] || defaultCaseStudies['align-technology'];
  // In production, always use source JSON — never stale browser cache
  if (!import.meta.env.DEV) return defaults;
  // First try localStorage (for backward compatibility and sync access)
  try {
    const saved = localStorage.getItem(`caseStudy_${projectId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Auto-reset if saved version is older than default
      if (defaults.dataVersion && (!parsed.dataVersion || parsed.dataVersion < defaults.dataVersion)) {
        console.log(`[getCaseStudyData] Saved data for ${projectId} is outdated (v${parsed.dataVersion || 0} < v${defaults.dataVersion}), resetting to defaults`);
        localStorage.removeItem(`caseStudy_${projectId}`);
        localStorage.removeItem(`caseStudy_${projectId}_minimal`);
        localStorage.removeItem(`caseStudy_${projectId}_idb`);
        deleteFromIndexedDB(projectId);
        return defaults;
      }
      return parsed;
    }
    // Check for minimal version (structure without images)
    const minimal = localStorage.getItem(`caseStudy_${projectId}_minimal`);
    if (minimal) {
      const parsed = JSON.parse(minimal);
      if (defaults.dataVersion && (!parsed.dataVersion || parsed.dataVersion < defaults.dataVersion)) {
        localStorage.removeItem(`caseStudy_${projectId}_minimal`);
        deleteFromIndexedDB(projectId);
        return defaults;
      }
      // Return minimal version - images will be loaded from IndexedDB via async
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }
  return defaults;
};

// Async version that checks IndexedDB first (for larger data)
export const getCaseStudyDataAsync = async (projectId) => {
  console.log(`[getCaseStudyDataAsync] Loading data for projectId: ${projectId}`);
  const defaults = defaultCaseStudies[projectId] || defaultCaseStudies['align-technology'];

  // In production, always use source JSON — never stale browser cache
  if (!import.meta.env.DEV) return defaults;

  // Try IndexedDB first (larger storage)
  try {
    const idbData = await getFromIndexedDB(projectId);
    if (idbData) {
      // Auto-reset if saved version is older than default
      if (defaults.dataVersion && (!idbData.dataVersion || idbData.dataVersion < defaults.dataVersion)) {
        console.log(`[getCaseStudyDataAsync] IndexedDB data for ${projectId} is outdated (v${idbData.dataVersion || 0} < v${defaults.dataVersion}), resetting to defaults`);
        await deleteFromIndexedDB(projectId);
        localStorage.removeItem(`caseStudy_${projectId}`);
        localStorage.removeItem(`caseStudy_${projectId}_minimal`);
        localStorage.removeItem(`caseStudy_${projectId}_idb`);
        return defaults;
      }
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
            const removeMedia = (obj) => {
              if (typeof obj === 'string' && (obj.startsWith('data:image') || obj.startsWith('data:video') || obj.startsWith('data:application'))) {
                return '';
              }
              if (Array.isArray(obj)) {
                return obj.map(item => removeMedia(item));
              }
              if (obj && typeof obj === 'object') {
                const result = {};
                for (const key in obj) {
                  result[key] = removeMedia(obj[key]);
                }
                return result;
              }
              return obj;
            };
            const minimal = removeMedia(minimalCopy);
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
