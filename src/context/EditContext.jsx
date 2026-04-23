import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveData, getData, deleteData } from '../storage/devStore';

let savedHomeData = null;
try {
  const mod = import.meta.glob('../data/home-content.json', { eager: true });
  const key = Object.keys(mod)[0];
  if (key) savedHomeData = mod[key].default || mod[key];
} catch { /* file doesn't exist yet */ }

const EditContext = createContext();

/* After the 2026-04-23 WebP conversion, /case-studies/*.png|jpg paths no
   longer resolve. localStorage/IndexedDB copies of site content written
   before that deploy still reference them — this walker rewrites those
   paths on load so pre-migration snapshots keep rendering. Non-mutating:
   returns a new tree so shared default objects are never touched. */
function migrateCaseStudyImagePathsToWebp(node) {
  if (node == null) return node;
  if (Array.isArray(node)) return node.map(migrateCaseStudyImagePathsToWebp);
  if (typeof node === 'object') {
    const out = {};
    for (const k of Object.keys(node)) out[k] = migrateCaseStudyImagePathsToWebp(node[k]);
    return out;
  }
  if (typeof node === 'string' && /^\/case-studies\//.test(node)) {
    return node.replace(/\.(png|jpe?g)(?=($|[?#]))/i, '.webp');
  }
  return node;
}

// Default site content
const defaultContent = {
  hero: {
    label: 'Product Designer',
    greeting: "Hello! I'm ",
    name: 'Lior Baum',
    description: 'Crafting digital experiences that merge aesthetics with functionality. Based in Israel, currently available for freelance work.',
    cvLink: 'https://drive.google.com/file/d/1wdnZiNuaSKB_TByqJm4TYQ7Cbg2W6sND/view?usp=sharing',
    ctaText: 'View work',
    ctaLink: '#projects',
  },
  about: {
    label: 'About Me',
    title1: 'Designing',
    title2: 'experiences',
    title3: 'that matter',
    bioHeading: 'Hello!',
    bio: [
      "Hey, I'm Lior \u2014 a Product & UX Designer drawn to complex B2B SaaS and MedTech. I love taking tangled systems and dense workflows and turning them into interfaces people actually enjoy using.",
      "I'm into design, technology, and AI \u2014 and how they keep reshaping the way we build. I care a lot about improving myself, learning something new every week, and pushing my craft forward.",
      "Outside Figma, you'll usually find me with a good coffee in hand, thinking up the next thing to make. Always happy to chat \u2014 especially if complicated systems are involved.",
    ],
    email: 'Lior2565967@gmail.com',
    skillsTitle: 'Skills & Expertise',
    skills: [
      { category: 'Product & UX Strategy', items: ['Product Strategy', 'Product Roadmapping', 'UX Strategy', 'Service Design', 'Information Architecture', 'Interaction Design', 'Design Systems', 'Design Ops'] },
      { category: 'Research & Testing', items: ['User Research', 'Usability Testing', 'Behavioral Analytics', 'Jobs-to-be-Done', 'Heuristic Evaluation', 'A/B Testing', 'Stakeholder Interviews'] },
      { category: 'Craft & Visual', items: ['Visual Design', 'Typography', 'Motion Design', 'Prototyping', 'Wireframing', 'Data Visualization', 'Accessibility', 'Brand Identity'] },
      { category: 'AI & Emerging Tech', items: ['AI-Native Interfaces', 'Generative UX', 'Agent-Based UX', 'Prompt Engineering', 'LLM Integration', 'Multimodal Design', 'AI-Assisted Prototyping', 'Vibe Coding'] },
      { category: 'Tools', items: ['Figma', 'FigJam', 'Framer', 'Webflow', 'Cursor', 'Claude Code', 'After Effects', 'Illustrator'] },
      { category: 'Collaboration', items: ['Cross-functional Collaboration', 'Stakeholder Management', 'Design Critique', 'Mentorship', 'Workshop Facilitation'] },
    ],
    experienceTitle: 'Experience',
    experience: [
      { year: 'Dec 2024 \u2013 Present', role: 'UX/UI Designer', company: 'Align Technology', description: 'Designing the iTero\u2122 scanner experience end-to-end \u2014 from patient onboarding and scan setup to post-scan insights \u2014 plus cleaning up navigation and discoverability across the iTero\u2122 Store.' },
      { year: 'Mar 2025 \u2013 Present', role: 'Teaching Assistant \u2013 Vibe Coding Course', company: 'Shenkar College', description: 'Helping designers ship real products with AI-assisted tools like Cursor and Claude. Code reviews, mentorship, and bridging design thinking with implementation.' },
      { year: 'Jul 2024 \u2013 Oct 2024', role: 'UX/UI Designer', company: 'BigIdea', description: 'Redesigned the asset management panel and risk-detection flows inside a complex privacy platform, partnering with privacy officers and PMs.' },
      { year: 'Jul 2023 \u2013 Nov 2023', role: 'UX/UI Design Intern', company: 'WizeCare', description: 'Reimagined the clinician dashboard for digital PT sessions, simplified core task flows, and built onboarding to drive product adoption.' },
    ],
  },
  projects: {
    sectionLabel: 'Portfolio',
    sectionTitle: 'Selected Projects',
    items: [
      { id: 'align-technology', title: 'iTero Toolbar', category: 'UI Unification & Efficiency', year: '2024', image: '/case-studies/align/slide-1.webp', tag: 'work' },
      { id: 'itero-scan-workflow', title: 'iTero Scan Workflow', category: 'Clinical Workflow Redesign', year: '2024', image: '', tag: 'work' },
      { id: 'wizecare', title: 'WizeCare', category: 'B2B Complex System', year: '2023', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop', tag: 'work' },
    ],
  },
  footer: {
    line1: 'How about',
    line2_1: 'we do a ',
    line2_2: 'Thing',
    line3_1: 'or two,',
    line4: 'Together',
    email: 'lior@example.com',
    copyright: 'Lior Baum',
  },
};

// Default styles
const defaultStyles = {
  fonts: {
    display: "'Crimson Text', Georgia, serif",
    body: "'Mona Sans', system-ui, sans-serif",
  },
  fontSizes: {
    heroName: 'clamp(3rem, 8vw, 6rem)',
    heroGreeting: 'clamp(1.5rem, 4vw, 3rem)',
    sectionTitle: 'clamp(2rem, 5vw, 4rem)',
    bodyText: '1.1rem',
    smallText: '0.9rem',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  spacing: {
    sectionPadding: '6rem',
    containerMaxWidth: '1400px',
    gap: '2rem',
    /* Per-breakpoint case-study slide padding. Mobile-first min-width
       cascade — each zone inherits from the one before until overridden. */
    slidePad: {
      mobile:    { x: '24px',  y: '56px'  }, /* 0+    */
      tablet:    { x: '36px',  y: '48px'  }, /* 768+  */
      desktop:   { x: '80px',  y: '128px' }, /* 1024+ */
      large:     { x: '64px',  y: '96px'  }, /* 1440+ */
      ultrawide: { x: '128px', y: '120px' }, /* 1920+ */
      fourK:     { x: '144px', y: '128px' }, /* 2400+ */
    },
  },
  colors: {
    accent: '#ff584a',
    background: '#f7f9f4',
    backgroundDark: '#0a0a0a',
    text: '#1a1a1a',
    textDark: '#f5f5f5',
  },
};

// Treat skill arrays that are only unedited placeholders (empty categories
// with "Skill 1" items) as if nothing was saved, so defaults kick in. Avoids
// leaving users stuck with a half-built list they created accidentally.
const PLACEHOLDER_CATEGORIES = new Set(['', 'New Category']);
const PLACEHOLDER_ITEMS = new Set(['', 'New Skill', 'Skill 1']);
const isPlaceholderSkills = (skills) =>
  !skills?.length ||
  skills.every(g =>
    PLACEHOLDER_CATEGORIES.has(g?.category || '') &&
    (!g?.items?.length || g.items.every(i => PLACEHOLDER_ITEMS.has(i || '')))
  );

// Override defaults with saved home-content.json if present
const effectiveDefaultContent = (() => {
  if (!savedHomeData?.content) return defaultContent;
  const mergedAbout = { ...defaultContent.about, ...savedHomeData.content.about };
  if (isPlaceholderSkills(mergedAbout.skills)) mergedAbout.skills = defaultContent.about.skills;
  if (!mergedAbout.experience?.length) mergedAbout.experience = defaultContent.about.experience;
  return {
    ...defaultContent,
    ...savedHomeData.content,
    hero: { ...defaultContent.hero, ...savedHomeData.content.hero },
    footer: { ...defaultContent.footer, ...savedHomeData.content.footer },
    about: mergedAbout,
    projects: { ...defaultContent.projects, ...savedHomeData.content.projects },
  };
})();

const effectiveDefaultStyles = savedHomeData?.styles
  ? { ...defaultStyles, ...savedHomeData.styles }
  : defaultStyles;

function mergeContent(saved) {
  if (!saved) return effectiveDefaultContent;
  const mergedAbout = { ...effectiveDefaultContent.about, ...saved.about };
  // Fall back to defaults when saved skills are empty or all placeholders
  if (isPlaceholderSkills(mergedAbout.skills)) mergedAbout.skills = effectiveDefaultContent.about.skills;
  if (!mergedAbout.experience?.length) mergedAbout.experience = effectiveDefaultContent.about.experience;
  return {
    ...effectiveDefaultContent,
    ...saved,
    hero: { ...effectiveDefaultContent.hero, ...saved.hero },
    footer: { ...effectiveDefaultContent.footer, ...saved.footer },
    about: mergedAbout,
    projects: { ...effectiveDefaultContent.projects, ...saved.projects },
  };
}

export const EditProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(() => {
    return sessionStorage.getItem('editMode') === 'true';
  });
  const [showPanel, setShowPanel] = useState(false);
  const [activeSection, setActiveSection] = useState('content');
  const hydrated = useRef(false);

  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('siteContent');
      return saved
        ? migrateCaseStudyImagePathsToWebp(mergeContent(JSON.parse(saved)))
        : effectiveDefaultContent;
    } catch { return effectiveDefaultContent; }
  });

  const [styles, setStyles] = useState(() => {
    try {
      const saved = localStorage.getItem('siteStyles');
      return saved ? { ...effectiveDefaultStyles, ...JSON.parse(saved) } : effectiveDefaultStyles;
    } catch { return effectiveDefaultStyles; }
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedContent, savedStyles] = await Promise.all([
        getData('siteContent'),
        getData('siteStyles'),
      ]);
      if (cancelled) return;
      if (savedContent) setContent(migrateCaseStudyImagePathsToWebp(mergeContent(savedContent)));
      if (savedStyles) setStyles(prev => ({ ...prev, ...savedStyles }));
      hydrated.current = true;
    })();
    return () => { cancelled = true; };
  }, []);

  // One-shot migration: if the current content (from useState init or HMR-
  // preserved state) has placeholder skills, swap them for defaults. Runs on
  // every mount but is idempotent — after the first substitution, the check
  // returns false and the effect is a no-op.
  useEffect(() => {
    if (isPlaceholderSkills(content?.about?.skills)) {
      setContent(prev => ({
        ...prev,
        about: { ...prev.about, skills: effectiveDefaultContent.about.skills },
      }));
    }
  }, [content]);

  // Toggle edit mode with Cmd+E (Mac) or Ctrl+E (Windows/Linux)
  useEffect(() => {
    let isProcessing = false; // Prevent double triggers
    
    const handleKeyDown = (e) => {
      // Check for E key
      const isE = e.key === 'E' || e.key === 'e' || e.code === 'KeyE' || e.keyCode === 69;
      // Check for Cmd+E (Mac) or Ctrl+E (Windows/Linux)
      const hasModifier = e.metaKey || e.ctrlKey;
      
      if (hasModifier && isE && !isProcessing) {
        e.preventDefault();
        e.stopPropagation();
        isProcessing = true;
        
        console.log('Edit mode toggle triggered');
        
        // Toggle both states
        setEditMode(prev => {
          console.log('Edit mode:', !prev);
          return !prev;
        });
        setShowPanel(prev => {
          console.log('Show panel:', !prev);
          return !prev;
        });
        
        // Reset processing flag after a short delay
        setTimeout(() => { isProcessing = false; }, 300);
      }
    };
    
    // Add to both window and document for better coverage
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Persist editMode to sessionStorage so it survives tab switches / HMR
  useEffect(() => {
    sessionStorage.setItem('editMode', editMode);
  }, [editMode]);

  // Keep showPanel in sync with editMode (if editMode is off, panel must be hidden)
  useEffect(() => {
    if (!editMode && showPanel) {
      setShowPanel(false);
    }
  }, [editMode, showPanel]);

  // Debounced persistence — IndexedDB is the source of truth. localStorage
  // is kept only as a best-effort fast path for first-paint hydration, and
  // only for payloads that fit comfortably under its ~5MB quota.
  const LOCAL_STORAGE_MAX = 2 * 1024 * 1024; // 2 MB safety margin below browser quotas
  const persistTimers = useRef({});
  useEffect(() => {
    if (!editMode || !hydrated.current) return;
    clearTimeout(persistTimers.current.content);
    persistTimers.current.content = setTimeout(() => {
      saveData('siteContent', content);
      try {
        const json = JSON.stringify(content);
        if (json.length < LOCAL_STORAGE_MAX) localStorage.setItem('siteContent', json);
        else localStorage.removeItem('siteContent');
      } catch { /* quota — IndexedDB still has it */ }
    }, 500);
    return () => clearTimeout(persistTimers.current.content);
  }, [content, editMode]);

  useEffect(() => {
    if (!editMode || !hydrated.current) return;
    clearTimeout(persistTimers.current.styles);
    persistTimers.current.styles = setTimeout(() => {
      saveData('siteStyles', styles);
      try {
        const json = JSON.stringify(styles);
        if (json.length < LOCAL_STORAGE_MAX) localStorage.setItem('siteStyles', json);
      } catch { /* quota */ }
    }, 500);
    return () => clearTimeout(persistTimers.current.styles);
  }, [styles, editMode]);

  // Apply CSS variables when styles change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-display', styles.fonts.display);
    root.style.setProperty('--font-body', styles.fonts.body);
    root.style.setProperty('--color-accent', styles.colors.accent);
    root.style.setProperty('--spacing-section', styles.spacing.sectionPadding);
    root.style.setProperty('--container-max-width', styles.spacing.containerMaxWidth);
  }, [styles]);

  const updateContent = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const updateNestedContent = (section, index, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map((item, i) => 
          i === index ? { ...item, [key]: value } : item
        ),
      },
    }));
  };

  const updateStyles = (category, key, value) => {
    setStyles(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const resetToDefaults = () => {
    setContent(defaultContent);
    setStyles(defaultStyles);
    localStorage.removeItem('siteContent');
    localStorage.removeItem('siteStyles');
    deleteData('siteContent');
    deleteData('siteStyles');
  };

  const saveHomeToCode = async () => {
    const res = await fetch('/api/save-home-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, styles }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Save failed');
    return json;
  };

  const gitPush = async () => {
    const res = await fetch('/api/git-push', { method: 'POST' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Push failed');
    return json;
  };

  return (
    <EditContext.Provider value={{
      editMode,
      setEditMode,
      showPanel,
      setShowPanel,
      activeSection,
      setActiveSection,
      content,
      setContent,
      updateContent,
      updateNestedContent,
      styles,
      setStyles,
      updateStyles,
      resetToDefaults,
      saveHomeToCode,
      gitPush,
      defaultContent,
      defaultStyles,
    }}>
      {children}
    </EditContext.Provider>
  );
};

export const useEdit = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
};

export default EditContext;

