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
  research: {
    type: 'image',
    label: 'Research',
    title: 'Understanding what exists',
    description: [],
    bullets: [],
    highlight: '',
    image: '',
    caption: 'Before starting the design phase it was important to fully understand the existing toolset and how it was distributed across the product. This step created the foundation for a structured approach.',
  },
  researchSplit: {
    type: 'researchSplit',
    label: 'Research',
    title: 'Understanding what exists',
    partTitle: 'Part Title',
    description: 'Before starting the design phase it was important to fully understand the existing toolset and how it was distributed across the product.',
    highlight: 'This step created the foundation for a structured toolbar, instead of continuing to place tools wherever space was available.',
    image: '',
    splitRatio: 50,
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
    goals: [
      { number: '1', title: 'goal title', description: 'Goal description' },
      { number: '2', title: 'another goal', description: 'Goal description' },
    ],
    kpis: ['KPI 1', 'KPI 2', 'KPI 3'],
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
  
  // Full-width hero image
  heroImage: {
    type: 'heroImage',
    label: 'Visual',
    title: 'Full Width Image',
    image: '',
  },
  
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
  
  // Gallery / Multiple images
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    title: 'Design Exploration',
    images: ['', '', '', ''],
    captions: ['Image 1', 'Image 2', 'Image 3', 'Image 4'],
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
    conclusion: 'Key takeaway or summary of the core problems identified.',
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
    solution: 'Describe how it was solved.',
    image: '',
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
  
  // Before/After Showcase - Split layout with smaller old images on left, bigger new images on right
  beforeAfterShowcase: {
    type: 'beforeAfterShowcase',
    label: 'The Solution',
    title: 'Redesigning friction points',
    beforeImages: [
      { src: '', caption: 'Old design 1' },
      { src: '', caption: 'Old design 2' },
    ],
    afterImages: [
      { src: '', caption: 'New design 1' },
      { src: '', caption: 'New design 2' },
      { src: '', caption: 'New design 3' },
      { src: '', caption: 'New design 4' },
    ],
    problemLabel: 'Problem:',
    problemText: 'Describe the main problem or pain point with the old design.',
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
    gridCols: 5,
    gridRows: 4,
  },
};

// Template categories for easier navigation
export const templateCategories = {
  'Introduction': ['intro', 'info'],
  'Content': ['text', 'twoColumn', 'insight', 'textWithImages'],
  'Visual': ['image', 'heroImage', 'gallery', 'video', 'projectShowcase', 'goalsShowcase', 'imageMosaic'],
  'Research': ['research', 'researchSplit', 'context', 'problem', 'issuesBreakdown', 'oldExperience', 'quotes', 'testimonial'],
  'Process': ['goals', 'achieveGoals', 'process', 'timeline', 'testing'],
  'Features': ['feature', 'comparison', 'challengeSolution', 'solutionShowcase', 'beforeAfterShowcase', 'tools'],
  'Results': ['stats', 'outcomes', 'end'],
};

export const defaultCaseStudies = {
  'align-technology': {
    title: 'iTero\nToolbar',
    subtitle: 'A scalable clinical toolbar for real-time scanning',
    category: 'UI Unification & Efficiency',
    year: '2024',
    color: '#E8847C',
    slides: [
      {
        type: 'intro',
        title: 'iTero Scan Process\nToolbar Redesign',
        description: 'A scalable clinical toolbar for real-time scanning',
        clientLabel: 'Client',
        client: 'Align Technology',
        focusLabel: 'Focus',
        focus: 'UI Unification & Efficiency',
      },
      {
        type: 'info',
        title: 'Project Overview',
        items: [
          { label: 'Client', value: 'Align Technology' },
          { label: 'Focus', value: 'UI Unification & Efficiency' },
          { label: 'Role', value: 'Product Designer' },
          { label: 'Deliverables', value: 'Toolbar System, Icon Set, Prototypes' },
        ],
      },
      {
        type: 'context',
        label: 'Context',
        title: 'Understanding the clinical environment',
        content: 'The iTero Scan Page is the primary workspace clinicians use during real-time digital dental scans. It sits at the center of the scanning process and remains on screen throughout the procedure.',
        highlight: 'This is a time-critical environment. The patient is in the chair, the scanner is in hand, and clinicians shift attention between the patient, the scan, and the interface. Interactions need to be fast, precise, and require minimal cognitive effort.',
        image: '/case-studies/align/slide-cover.png',
      },
      {
        type: 'problem',
        label: 'The Problem',
        title: 'When the interface outgrew its original logic',
        content: 'Early versions of the interface had only a few tools, placed naturally where space allowed. As the product evolved, new tools were added wherever there was available space, without a shared structure guiding placement.',
        issues: [
          'Tools were visible but spread across different areas',
          'Placement followed space, not workflow',
          'Spatial consistency was hard to maintain',
        ],
        conclusion: 'Scattered tools broke scan flow and added chair time.',
        image: '/case-studies/align/slide-2.png',
      },
      {
        type: 'quotes',
        label: 'User Research',
        title: 'Validating the problem with clinicians',
        content: 'To understand the users pain points I spoke with both newly onboarded and experienced clinicians and reviewed support tickets related to scanning and tool usage.',
        quotes: [
          { text: 'Even one second of hesitation feels too long.', author: 'Dr. Moti' },
          { text: 'When there were fewer tools, it was fine. Now I sometimes pause just to remember where something is.', author: 'Dr. Efrat L.' },
          { text: 'Why every tool in different place?', author: 'Dr. Hodaya M' },
        ],
      },
      {
        type: 'goals',
        label: 'Defining the KPIs',
        title: 'What did we want to achieve?',
        goals: [
          { number: '1', title: 'consistency across', description: 'Scan and View Screens' },
          { number: '2', title: 'scalable toolbar system', description: 'Support future tools without adding complexity.' },
          { number: '3', title: 'cognitive load', description: 'in critical moments. Help clinicians focus on the patient and scan quality.' },
        ],
        kpis: [
          'Average time to select a tool',
          'Overall scan duration / chair time',
          'Misclick rate during live scanning',
        ],
      },
      {
        type: 'image',
        label: 'Research',
        title: 'Understanding what exists',
        image: '/case-studies/align/slide-5.png',
        caption: 'Before starting the design phase it was important to fully understand the existing toolset and how it was distributed across the product. This step created the foundation for a structured toolbar.',
      },
      {
        type: 'testing',
        label: 'Prototyping & Layout Testing',
        title: 'Validating behavior in real conditions',
        content: 'Static mockups weren\'t enough to evaluate scanning flow. I built a live interactive prototype using Cursor that simulated real toolbar behavior, states, and transitions during scanning. This allowed clinicians to test the toolbar under realistic conditions.',
        layouts: [
          'Vertical Toolbar',
          'Horizontal Top Toolbar',
          'Horizontal Bottom Toolbar',
        ],
        conclusion: 'Based on feedback, the horizontal top toolbar was selected.',
        image: '/case-studies/align/slide-6.png',
      },
      {
        type: 'text',
        label: 'Solution',
        title: 'Supporting different experience levels',
        content: 'As the number of tools grew, testing and feedback revealed that icons alone were not always enough, especially during high-speed scanning. Clinicians requested the option to display tool names to ensure accuracy and confidence.',
      },
      {
        type: 'image',
        label: 'Design Process',
        title: 'Creating clarity before testing behavior',
        image: '/case-studies/align/slide-8.png',
        caption: 'Clinicians recognized the icons, but grouping them made inconsistencies in style and visual weight more noticeable, creating visual noise. Before testing layout and interaction, the icon system was refined to create a more straightforward and balanced experience.',
      },
      {
        type: 'image',
        label: 'Final Design',
        title: 'A unified, scalable toolbar',
        image: '/case-studies/align/slide-9.png',
        caption: 'The final solution centers on a Unified Horizontal Toolbar that remains persistent across all modes, reducing the cognitive load on the clinician.',
      },
      {
        type: 'outcomes',
        label: 'Outcomes & Learnings',
        title: 'Outcomes & Learnings',
        outcomes: [
          { title: '28% Faster Selection', description: 'Tool selection speed improved significantly due to the predictable horizontal layout.' },
          { title: 'Error Reduction', description: 'Standardized 60px click targets led to a measurable decrease in misclicks during procedures.' },
          { title: 'Enhanced Visibility', description: 'The optimized layout exposed more of the 3D scan area, improving the overall clinical utility of the software.' },
          { title: 'Systemic Scalability', description: 'The new toolbar and icon system provide a robust framework for adding future features without creating further visual clutter.' },
        ],
      },
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
    subtitle: 'Redesigning core clinical workflows for real-time dental scanning',
    category: 'MedTech / Clinical UX',
    year: '2024',
    color: '#5B8DEF',
    slides: [
      {
        type: 'intro',
        title: 'iTero Scan & View',
        description: 'Redesigning core clinical workflows for real-time dental scanning',
        clientLabel: 'Client',
        client: 'Align Technology',
        focusLabel: 'Platform',
        focus: 'Touch-based Clinical Interface',
      },
      {
        type: 'info',
        title: 'Project Overview',
        items: [
          { label: 'Client', value: 'Align Technology' },
          { label: 'Platform', value: 'Touch-based Clinical Interface (Medical Device Software)' },
          { label: 'Industry', value: 'MedTech / Dental Technology' },
          { label: 'Role', value: 'Product Designer — Research, Workflow Design, Interaction Design, Prototyping' },
        ],
      },
      {
        type: 'context',
        label: 'Background',
        title: 'What is iTero?',
        content: 'iTero is a clinical scanning platform used by dentists and orthodontists to capture high-precision 3D dental scans during live patient appointments.\n\nThe system supports real-time scanning, post-scan validation, and clinical decision-making — all while the patient is in the chair and the clinician operates the scanner with one hand.\n\nFor iTero to succeed, the software must feel fast, predictable, and safe, even as clinical capabilities continue to grow.',
        highlight: '',
        image: '',
        splitRatio: 50,
      },
      {
        type: 'context',
        label: 'Context',
        title: 'Who the users are',
        content: 'iTero is used by clinicians who work under constant time pressure and have very low tolerance for interface hesitation or errors.\n\nThey operate the system during live procedures, wear gloves and hold the scanner, and shift attention between patient, scan, and screen.\n\nAny friction directly impacts chair time and treatment confidence.',
        highlight: 'operate the system during live procedures. wear gloves and hold the scanner. shift attention between patient, scan, and screen',
        image: '',
        splitRatio: 50,
      },
      {
        type: 'issuesBreakdown',
        label: 'The Problem',
        title: 'Why the experience broke down',
        issues: [
          { number: '1', title: 'Fragmented Interaction', description: 'Tools were added incrementally and placed wherever space allowed, without a shared structure guiding their location or behavior.' },
          { number: '2', title: 'High Cognitive Load', description: 'Clinicians had to remember where tools lived and what state the system was in, instead of seeing it clearly.' },
          { number: '3', title: 'Workflow Gaps', description: 'The system assumed a single scan per session and did not support advanced clinical workflows like additional scans or safe comparison.' },
        ],
        conclusion: 'Despite strong underlying technology, everyday actions began to feel slower and more error-prone than necessary.',
      },
      {
        type: 'text',
        label: 'Research & Discovery',
        title: 'Understanding real clinical friction',
        content: 'To validate these issues, I focused on how clinicians actually work — not how the system was intended to be used.\n\nMethods included:\n\n• Interviews with newly onboarded and experienced clinicians\n• Review of scan-related support tickets\n• Workflow walkthroughs with internal clinical experts\n\nThe goal was to identify where confidence breaks during real procedures.',
      },
      {
        type: 'outcomes',
        label: 'Key Findings',
        title: 'What the research revealed',
        outcomes: [
          { title: 'Clinicians avoid workflows that feel unclear or risky', description: '' },
          { title: 'Advanced features are often ignored if their behavior isn\'t obvious', description: '' },
          { title: 'Tools often asked clinicians to manipulate data instead of make decisions', description: '' },
          { title: 'Lack of visible system state increased hesitation during live scanning', description: '' },
        ],
      },
      {
        type: 'achieveGoals',
        label: 'Defining Success',
        title: 'Goals & Metrics',
        leftColumn: {
          title: 'Goals',
          goals: [
            { number: '1', text: 'Reduce cognitive load during live scanning' },
            { number: '2', text: 'Make system state visible at all times' },
            { number: '3', text: 'Align tools with clinical decision-making' },
            { number: '4', text: 'Enable multi-scan workflows safely' },
            { number: '5', text: 'Create a scalable foundation for future features' },
          ],
        },
        rightColumn: {
          title: 'Metrics',
          goals: [
            { number: '1', text: 'Time to select a tool during live scanning' },
            { number: '2', text: 'Misclick rate during procedures' },
            { number: '3', text: 'Adoption of advanced tools (AI, additional scans)' },
            { number: '4', text: 'Overall chair time' },
          ],
        },
      },
      {
        type: 'text',
        label: 'Redesign Strategy',
        title: 'Rebuilding around real workflows',
        content: 'Instead of treating this as a visual cleanup, the redesign focused on end-to-end workflow clarity.\n\nThe work progressed through three main areas:\n\n• Live scan interaction\n• Post-scan tools\n• Scan structure and review\n\nEach step revealed the next limitation to solve.',
      },
      {
        type: 'challengeSolution',
        label: 'Flow 01 — Live Scan Toolbar',
        title: 'Creating a reliable interaction foundation',
        challenge: 'The toolbar was the primary interaction surface during scanning, but lacked hierarchy and predictability.\nMisclicks and hesitation were common in high-pressure moments.\n\nMultiple layouts were explored: vertical toolbar, horizontal top toolbar, horizontal bottom toolbar.\n\nStatic screens were not enough. Using Cursor, I built interactive prototypes that simulated real tool behavior, states, and interruptions, allowing clinicians to test options in realistic conditions.',
        solution: 'A unified horizontal top toolbar with:\n\n• Standardized click targets\n• Reduced visual noise\n• Optional labels for confidence\n\nThis created a predictable and faster interaction during scanning.',
        image: '',
      },
      {
        type: 'challengeSolution',
        label: 'Flow 02 — Core Tools (Prep · Margin · Trim)',
        title: 'Shifting from manipulation to decision-making',
        challenge: 'Post-scan tools treated clinicians as technical editors:\n\n• Validation felt manual\n• AI capabilities were hidden or optional\n• Precision interactions were difficult with gloves',
        solution: 'Tools were reframed around clinical intent:\n\n• Prep Review became a validation checkpoint\n• Margin Line moved to an AI-first review flow with clear tooth context\n• Trim adopted a touch-native confirm / undo model\n\nThis reduced effort and aligned tool behavior with clinical judgment.',
        image: '',
      },
      {
        type: 'challengeSolution',
        label: 'Flow 03 — Multi-Scan Workflows',
        title: 'Enabling advanced clinical scenarios',
        challenge: 'The system assumed a single scan per session.\nAdditional scans required workarounds and made comparison risky.',
        solution: 'Multi-scan support was designed and introduced as a new system capability:\n\n• Each scan has a clear purpose\n• All scans exist within the same session\n• Scan context is always visible\n\nA tab-based scan selector was introduced to provide a familiar, scalable mental model.',
        image: '',
      },
      {
        type: 'feature',
        label: 'Review & Comparison',
        title: 'Controlling complexity after scanning',
        description: 'With multiple scans available, review required precision.\n\nA dedicated View panel allows clinicians to show or hide scan layers, adjust opacity per scan, and compare scans safely without losing context.\n\nScans are treated as layers, not files.',
        image: '',
        bullets: ['Show or hide scan layers', 'Adjust opacity per scan', 'Compare scans safely without losing context', 'Scans are treated as layers, not files'],
        splitRatio: 50,
      },
      {
        type: 'outcomes',
        label: 'Outcomes',
        title: 'What improved',
        outcomes: [
          { title: 'Faster tool selection during live scanning', description: '' },
          { title: 'Fewer misclicks and interruptions', description: '' },
          { title: 'Increased adoption of advanced tools', description: '' },
          { title: 'Multi-scan workflows enabled for the first time', description: '' },
          { title: 'A scalable interaction model for future features', description: '' },
        ],
      },
      {
        type: 'outcomes',
        label: 'Key Learnings',
        title: 'What this project reinforced',
        outcomes: [
          { title: 'Adoption depends on workflow clarity, not feature count', description: '' },
          { title: 'Visible system structure builds confidence under pressure', description: '' },
          { title: 'Testing real behavior reveals issues static designs can\'t', description: '' },
          { title: 'Defining success early keeps decisions focused', description: '' },
        ],
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

// ========== IndexedDB Storage (Primary - much larger limits) ==========
const DB_NAME = 'PortfolioCaseStudies';
const DB_VERSION = 1;
const STORE_NAME = 'caseStudies';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const getFromIndexedDB = async (projectId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(projectId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  } catch (e) {
    console.warn('IndexedDB read failed:', e);
    return null;
  }
};

const saveToIndexedDB = async (projectId, data) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: projectId, data, updatedAt: Date.now() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (e) {
    console.warn('IndexedDB write failed:', e);
    return false;
  }
};

const deleteFromIndexedDB = async (projectId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(projectId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (e) {
    console.warn('IndexedDB delete failed:', e);
    return false;
  }
};

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

export const getAllProjectIds = () => Object.keys(defaultCaseStudies);
