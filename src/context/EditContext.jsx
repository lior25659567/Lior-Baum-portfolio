import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveData, getData, deleteData } from '../storage/devStore';

let savedHomeData = null;
try {
  const mod = import.meta.glob('../data/home-content.json', { eager: true });
  const key = Object.keys(mod)[0];
  if (key) savedHomeData = mod[key].default || mod[key];
} catch { /* file doesn't exist yet */ }

const EditContext = createContext();

// Default site content
const defaultContent = {
  hero: {
    label: 'Product Designer',
    greeting: "Hello! I'm ",
    name: 'Lior Baum',
    description: 'Crafting digital experiences that merge aesthetics with functionality. Based in Israel, currently available for freelance work.',
    cvLink: '/resume.pdf',
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
      "Product & UX Designer with hands-on experience in B2B SaaS and MedTech, specializing in complex clinical workflows, design systems, and data-driven interfaces.",
      "Passionate about bridging user needs with business goals through research-backed design decisions and rapid prototyping. Currently exploring the intersection of design and AI-assisted development.",
      "I've worked across MedTech, privacy, and B2B SaaS \u2014 from redesigning clinical workflows at WizeCare, to building automated risk detection flows at BigID, to improving the iTero scanner experience at Align Technology.",
    ],
    email: 'Lior2565967@gmail.com',
    skillsTitle: 'Skills & Expertise',
    skills: [
      { category: 'Design', items: ['UX Strategy & Design Thinking', 'Product Discovery & User Research', 'Wireframing & Prototyping', 'Interaction Design & Microinteractions', 'UI Systems & Component Libraries'] },
      { category: 'Tools', items: ['Figma', 'After Effects', 'Illustrator', 'Photoshop', 'Webflow', 'HTML/CSS'] },
      { category: 'AI & Development', items: ['Claude Code', 'Cursor', 'Vibe Coding\u2122', 'AI-Assisted Prototyping', 'Prompt Engineering'] },
    ],
    experienceTitle: 'Experience',
    experience: [
      { year: 'Dec 2024 \u2013 Present', role: 'UX/UI Designer', company: 'Align Technology', description: 'Improved key parts of the iTero\u2122 scanner experience, focusing on how doctors and patients move through the system. Redesigned navigation and content structure within the iTero\u2122 Store to enhance discoverability and usability. Designed the full UX experience around scanning \u2013 from patient onboarding and scan setup to post-scan insights and next steps.' },
      { year: 'Mar 2025 \u2013 Present', role: 'Teaching Assistant \u2013 Vibe Coding Course', company: 'Shenkar College', description: 'Assisting in a new interdisciplinary course that teaches designers to build functional products using AI-assisted coding tools. Supporting students in translating design concepts into working prototypes using Cursor, Claude, and modern web frameworks. Providing one-on-one mentorship and code reviews, bridging the gap between design thinking and technical implementation.' },
      { year: 'Jul 2024 \u2013 Oct 2024', role: 'UX/UI Designer', company: 'BigIdea', description: 'Led the redesign of the asset management panel within a complex privacy system. Designed flows that supported automated risk detection in sensitive data environments. Partnered with privacy officers and PMs to refine logic and improve system trust and usability.' },
      { year: 'Jul 2023 \u2013 Nov 2023', role: 'UX/UI Design Intern', company: 'WizeCare', description: 'Reimagined clinician dashboard to reduce friction in digital physical therapy sessions. Conducted interviews with stakeholders and therapists to identify pain points and deliver improved task flows. Created onboarding flows and visual guidance assets to support product adoption.' },
    ],
  },
  projects: {
    sectionLabel: 'Portfolio',
    sectionTitle: 'Selected Projects',
    items: [
      { id: 'align-technology', title: 'iTero Toolbar', category: 'UI Unification & Efficiency', year: '2024', image: '/case-studies/align/slide-1.png', tag: 'work' },
      { id: 'itero-scan-workflow', title: 'iTero Scan Workflow', category: 'Clinical Workflow Redesign', year: '2024', image: '', tag: 'work' },
      { id: 'wizecare', title: 'WizeCare', category: 'B2B Complex System', year: '2023', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop', tag: 'work' },
    ],
  },
  footer: {
    line1: 'How about',
    line2_1: 'we do a ',
    line2_2: 'thing',
    line3_1: 'Or two,',
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
  },
  colors: {
    accent: '#ff584a',
    background: '#f7f9f4',
    backgroundDark: '#0a0a0a',
    text: '#1a1a1a',
    textDark: '#f5f5f5',
  },
};

// Override defaults with saved home-content.json if present
const effectiveDefaultContent = (() => {
  if (!savedHomeData?.content) return defaultContent;
  const mergedAbout = { ...defaultContent.about, ...savedHomeData.content.about };
  if (!mergedAbout.skills?.length) mergedAbout.skills = defaultContent.about.skills;
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
  // Preserve default skills/experience when saved data has empty arrays
  if (!mergedAbout.skills?.length) mergedAbout.skills = effectiveDefaultContent.about.skills;
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
      return saved ? mergeContent(JSON.parse(saved)) : effectiveDefaultContent;
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
      if (savedContent) setContent(mergeContent(savedContent));
      if (savedStyles) setStyles(prev => ({ ...prev, ...savedStyles }));
      hydrated.current = true;
    })();
    return () => { cancelled = true; };
  }, []);

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

  useEffect(() => {
    if (!editMode || !hydrated.current) return;
    saveData('siteContent', content);
    try { localStorage.setItem('siteContent', JSON.stringify(content)); } catch { /* quota */ }
  }, [content, editMode]);

  useEffect(() => {
    if (!editMode || !hydrated.current) return;
    saveData('siteStyles', styles);
    try { localStorage.setItem('siteStyles', JSON.stringify(styles)); } catch { /* quota */ }
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

