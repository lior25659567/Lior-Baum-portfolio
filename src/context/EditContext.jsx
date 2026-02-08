import { createContext, useContext, useState, useEffect } from 'react';

const EditContext = createContext();

// Default site content
const defaultContent = {
  hero: {
    label: 'Product Designer',
    greeting: "Hello, I'm",
    name: 'Lior Baum',
    description: 'Crafting digital experiences that merge aesthetics with functionality. Based in Israel, currently available for freelance work.',
    cvLink: '/resume.pdf',
  },
  about: {
    label: 'About Me',
    title1: 'Designing',
    title2: 'experiences',
    title3: 'that matter',
    bioHeading: 'Hello!',
    bio: [
      "I'm a product designer with a passion for creating digital experiences that are both beautiful and functional. With over 5 years of experience in the industry, I've had the privilege of working with startups and established companies alike.",
      "My approach combines user-centered design principles with a keen eye for aesthetics. I believe that great design should not only look good but also solve real problems and create meaningful connections between products and their users.",
      "When I'm not designing, you can find me exploring new places, experimenting with photography, or diving into the latest design trends and technologies.",
    ],
    email: 'lior@example.com',
  },
  projects: {
    sectionLabel: 'Portfolio',
    sectionTitle: 'Selected Projects',
    items: [
      { id: 'align-technology', title: 'iTero Toolbar', category: 'UI Unification & Efficiency', year: '2024', image: '/case-studies/align/slide-1.png' },
      { id: 'itero-scan-view', title: 'iTero Scan & View', category: 'MedTech / Clinical UX', year: '2024', image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop' },
      { id: 'wizecare', title: 'WizeCare', category: 'B2B Complex System', year: '2023', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop' },
      { id: 'webflow', title: 'Webflow', category: 'Web Design', year: '2023', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop' },
      { id: 'shenkar', title: 'Shenkar', category: 'Brand Identity', year: '2022', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop' },
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
    display: "'Playfair Display', Georgia, serif",
    body: "'Syne', system-ui, sans-serif",
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

export const EditProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(() => {
    return sessionStorage.getItem('editMode') === 'true';
  });
  const [showPanel, setShowPanel] = useState(false);
  const [activeSection, setActiveSection] = useState('content');
  
  // Load content from localStorage or use defaults
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('siteContent');
    if (saved) {
      const parsedContent = JSON.parse(saved);
      // Deep merge to ensure new fields like cvLink are included
      return {
        ...defaultContent,
        ...parsedContent,
        hero: { ...defaultContent.hero, ...parsedContent.hero },
        footer: { ...defaultContent.footer, ...parsedContent.footer },
        about: { ...defaultContent.about, ...parsedContent.about },
        projects: { ...defaultContent.projects, ...parsedContent.projects },
      };
    }
    return defaultContent;
  });
  
  // Load styles from localStorage or use defaults
  const [styles, setStyles] = useState(() => {
    const saved = localStorage.getItem('siteStyles');
    return saved ? { ...defaultStyles, ...JSON.parse(saved) } : defaultStyles;
  });

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

  // Save content to localStorage
  useEffect(() => {
    if (editMode) {
      localStorage.setItem('siteContent', JSON.stringify(content));
    }
  }, [content, editMode]);

  // Save styles to localStorage
  useEffect(() => {
    if (editMode) {
      localStorage.setItem('siteStyles', JSON.stringify(styles));
    }
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

