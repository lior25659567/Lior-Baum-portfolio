import { useParams, Link } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback, Component, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { useEdit } from '../context/EditContext';
import { getCaseStudyData, getCaseStudyDataAsync, saveCaseStudyData, resetCaseStudyData, slideTemplates, templateCategories, compressImage, defaultCaseStudies } from '../data/caseStudyData';
import './CaseStudy.css';

// Error Boundary to catch rendering errors
class SlideErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Slide Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="slide slide-error">
          <div className="slide-inner">
            <h2>Something went wrong</h2>
            <p>Error: {this.state.error?.message || 'Unknown error'}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Template Preview Component
const TemplatePreview = ({ type }) => {
  const template = slideTemplates[type];
  if (!template) return <p>No preview available</p>;

  const previewDescriptions = {
    intro: 'Intro slide with project title, description, Client/Focus info, and square image.',
    info: 'Grid layout showing project details like client, role, duration, and deliverables.',
    text: 'Simple text slide with a label, title, and paragraph content.',
    image: 'Full image slide with label, title, image area, and caption.',
    context: 'Split layout with text content on the left and an image on the right. Includes highlight box.',
    problem: 'Problem definition slide with issues list and conclusion. Split layout with image.',
    quotes: 'User research quotes displayed in a card grid layout.',
    goals: 'Goals with numbered items and KPI cards at the bottom.',
    testing: 'Testing/validation slide with options list and conclusion. Split layout.',
    stats: 'Large statistics display with values and labels in a grid.',
    outcomes: 'Results grid showing outcomes with titles and descriptions.',
    end: 'Thank you slide with CTA buttons.',
    comparison: 'Before/After comparison with two images side by side.',
    process: 'Process steps displayed horizontally with numbers and descriptions.',
    feature: 'Feature highlight with description, bullet points, and image.',
    twoColumn: 'Two-column text layout for comparing or contrasting content.',
    timeline: 'Vertical timeline showing project phases or events.',
    video: 'Video embed slide with caption.',
    tools: 'Tools and technologies grid with names and descriptions.',
    challengeSolution: 'Challenge and Solution blocks with supporting image.',
    testimonial: 'Large quote/testimonial centered on the slide.',
    insight: 'Key insight or learning highlighted prominently.',
    issuesBreakdown: 'Issues displayed in a 2x2 grid with numbered circles. Includes conclusion box.',
    oldExperience: 'Describes the old/current state with bullet point issues and a highlighted insight.',
    achieveGoals: 'Two-column layout with KPIs on the left and Key Metrics on the right, each with numbered items.',
    textWithImages: 'Title with description text at top, images at the bottom (up to 6). Grid adapts to image count. Perfect for comparisons or showcasing variations.',
    projectShowcase: 'Two-column layout with large number, title, description, tags, and optional logo on left. Full image on right.',
    goalsShowcase: 'Two-column layout with large number, title, optional description, and numbered goals list. Full image on right.',
    solutionShowcase: 'Two-column comparison: problem images and text on left, solution images and bullet points on right.',
    imageMosaic: 'Tiled image grid background with a centered title overlay. Perfect for showing old versions, screen collections, or visual overviews.',
  };

  return (
    <div className="preview-slide">
      <div className="preview-description">
        <p>{previewDescriptions[type] || 'A customizable slide template.'}</p>
      </div>
      <div className="preview-mockup">
        <div className={`mockup-slide mockup-${type}`}>
          {type === 'intro' && (
            <div className="mockup-intro-split">
              <div className="mockup-intro-content">
                <div className="mockup-title">Project Name</div>
                <div className="mockup-text-lines">
                  <div className="line" /><div className="line short" />
                </div>
                <div className="mockup-intro-meta">
                  <div className="mockup-meta-item">
                    <span className="meta-label">Client</span>
                    <span className="meta-value">Company</span>
                  </div>
                  <div className="mockup-meta-item">
                    <span className="meta-label">Focus</span>
                    <span className="meta-value">Area</span>
                  </div>
                </div>
              </div>
              <div className="mockup-intro-image">
                <span className="mockup-img-icon">🖼</span>
              </div>
            </div>
          )}
          {type === 'info' && (
            <div className="mockup-info-grid">
              <div className="mockup-info-item"><span>Client</span><span>Company Inc.</span></div>
              <div className="mockup-info-item"><span>Role</span><span>Lead Designer</span></div>
              <div className="mockup-info-item"><span>Duration</span><span>3 Months</span></div>
              <div className="mockup-info-item"><span>Deliverables</span><span>UI/UX, Design System</span></div>
            </div>
          )}
          {type === 'text' && (
            <div className="mockup-text-slide">
              <div className="mockup-label" />
              <div className="mockup-title-sm">Section Title</div>
              <div className="mockup-text-lines">
                <div className="line" /><div className="line" /><div className="line" /><div className="line short" />
              </div>
            </div>
          )}
          {type === 'image' && (
            <div className="mockup-image-slide">
              <div className="mockup-label" />
              <div className="mockup-title-sm">Visual Showcase</div>
              <div className="mockup-image large"><span className="mockup-img-icon">🖼</span></div>
              <div className="mockup-caption" />
            </div>
          )}
          {type === 'context' && (
            <div className="mockup-split">
              <div className="mockup-split-content">
                <div className="mockup-label" />
                <div className="mockup-title-sm">The Context</div>
                <div className="mockup-text-lines">
                  <div className="line" /><div className="line" /><div className="line short" />
                </div>
                <div className="mockup-highlight-box">Key Point</div>
              </div>
              <div className="mockup-image"><span className="mockup-img-icon">🖼</span></div>
            </div>
          )}
          {type === 'problem' && (
            <div className="mockup-split">
              <div className="mockup-split-content">
                <div className="mockup-label" />
                <div className="mockup-title-sm">The Problem</div>
                <div className="mockup-issues-list">
                  <div className="mockup-issue"><span>•</span><div className="line" /></div>
                  <div className="mockup-issue"><span>•</span><div className="line" /></div>
                  <div className="mockup-issue"><span>•</span><div className="line" /></div>
                </div>
                <div className="mockup-conclusion-box">Conclusion</div>
              </div>
              <div className="mockup-image"><span className="mockup-img-icon">🖼</span></div>
            </div>
          )}
          {type === 'testing' && (
            <div className="mockup-split">
              <div className="mockup-split-content">
                <div className="mockup-label" />
                <div className="mockup-title-sm">Testing Results</div>
                <div className="mockup-issues-list">
                  <div className="mockup-issue"><span>✓</span><div className="line" /></div>
                  <div className="mockup-issue"><span>✓</span><div className="line" /></div>
                </div>
                <div className="mockup-conclusion-box">Key Finding</div>
              </div>
              <div className="mockup-image"><span className="mockup-img-icon">📊</span></div>
            </div>
          )}
          {type === 'feature' && (
            <div className="mockup-split">
              <div className="mockup-split-content">
                <div className="mockup-label" />
                <div className="mockup-title-sm">Key Feature</div>
                <div className="mockup-text-lines">
                  <div className="line" /><div className="line short" />
                </div>
                <div className="mockup-bullet-list">
                  <div className="mockup-bullet"><span>→</span><div className="line" /></div>
                  <div className="mockup-bullet"><span>→</span><div className="line" /></div>
                </div>
              </div>
              <div className="mockup-image"><span className="mockup-img-icon">✨</span></div>
            </div>
          )}
          {type === 'challengeSolution' && (
            <div className="mockup-challenge-solution">
              <div className="mockup-cs-blocks">
                <div className="mockup-cs-block challenge">
                  <span className="mockup-cs-label">Challenge</span>
                  <div className="mockup-text-lines"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-cs-block solution">
                  <span className="mockup-cs-label">Solution</span>
                  <div className="mockup-text-lines"><div className="line" /><div className="line short" /></div>
                </div>
              </div>
              <div className="mockup-image small"><span className="mockup-img-icon">💡</span></div>
            </div>
          )}
          {type === 'quotes' && (
            <div className="mockup-quotes">
              <div className="mockup-quote-card">
                <span className="quote-mark">"</span>
                <div className="line" />
                <div className="mockup-quote-author" />
              </div>
              <div className="mockup-quote-card">
                <span className="quote-mark">"</span>
                <div className="line" />
                <div className="mockup-quote-author" />
              </div>
              <div className="mockup-quote-card">
                <span className="quote-mark">"</span>
                <div className="line" />
                <div className="mockup-quote-author" />
              </div>
            </div>
          )}
          {type === 'goals' && (
            <div className="mockup-goals-detailed">
              <div className="mockup-goals-list">
                <div className="mockup-goal"><span>1</span><div className="mockup-goal-content"><div className="line" /></div></div>
                <div className="mockup-goal"><span>2</span><div className="mockup-goal-content"><div className="line" /></div></div>
                <div className="mockup-goal"><span>3</span><div className="mockup-goal-content"><div className="line" /></div></div>
              </div>
              <div className="mockup-kpis">
                <div className="mockup-kpi">KPI 1</div>
                <div className="mockup-kpi">KPI 2</div>
              </div>
            </div>
          )}
          {type === 'stats' && (
            <div className="mockup-stats">
              <div className="mockup-stat"><span>85%</span><div className="line">Increase</div></div>
              <div className="mockup-stat"><span>2.5x</span><div className="line">Growth</div></div>
              <div className="mockup-stat"><span>95%</span><div className="line">Satisfaction</div></div>
            </div>
          )}
          {type === 'outcomes' && (
            <div className="mockup-outcomes">
              <div className="mockup-outcome"><span>📈</span><div className="line">Result 1</div></div>
              <div className="mockup-outcome"><span>⭐</span><div className="line">Result 2</div></div>
              <div className="mockup-outcome"><span>🎯</span><div className="line">Result 3</div></div>
              <div className="mockup-outcome"><span>💎</span><div className="line">Result 4</div></div>
            </div>
          )}
          {type === 'end' && (
            <div className="mockup-end">
              <div className="mockup-title">Thank You!</div>
              <div className="mockup-end-subtitle">Let's work together</div>
              <div className="mockup-btns">
                <div className="mockup-btn">Contact</div>
                <div className="mockup-btn outline">Portfolio</div>
              </div>
            </div>
          )}
          {type === 'comparison' && (
            <div className="mockup-comparison">
              <div className="mockup-compare-item">
                <span>Before</span>
                <div className="mockup-image"><span className="mockup-img-icon">📷</span></div>
              </div>
              <span className="mockup-arrow">→</span>
              <div className="mockup-compare-item">
                <span>After</span>
                <div className="mockup-image"><span className="mockup-img-icon">✨</span></div>
              </div>
            </div>
          )}
          {type === 'process' && (
            <div className="mockup-process">
              <div className="mockup-step"><span>01</span><div className="step-title">Research</div></div>
              <div className="mockup-step-arrow">→</div>
              <div className="mockup-step"><span>02</span><div className="step-title">Design</div></div>
              <div className="mockup-step-arrow">→</div>
              <div className="mockup-step"><span>03</span><div className="step-title">Test</div></div>
              <div className="mockup-step-arrow">→</div>
              <div className="mockup-step"><span>04</span><div className="step-title">Launch</div></div>
            </div>
          )}
          {type === 'twoColumn' && (
            <div className="mockup-two-col">
              <div className="mockup-col">
                <div className="mockup-col-title">Column 1</div>
                <div className="line" /><div className="line" /><div className="line short" />
              </div>
              <div className="mockup-col">
                <div className="mockup-col-title">Column 2</div>
                <div className="line" /><div className="line" /><div className="line short" />
              </div>
            </div>
          )}
          {type === 'timeline' && (
            <div className="mockup-timeline">
              <div className="mockup-event"><span className="event-date">Q1</span><div className="event-content">Phase 1</div></div>
              <div className="mockup-event"><span className="event-date">Q2</span><div className="event-content">Phase 2</div></div>
              <div className="mockup-event"><span className="event-date">Q3</span><div className="event-content">Phase 3</div></div>
              <div className="mockup-event"><span className="event-date">Q4</span><div className="event-content">Phase 4</div></div>
            </div>
          )}
          {type === 'testimonial' && (
            <div className="mockup-testimonial">
              <div className="mockup-big-quote">"</div>
              <div className="mockup-quote-text">This product changed everything for us...</div>
              <div className="mockup-author">— Client Name, Role</div>
            </div>
          )}
          {type === 'insight' && (
            <div className="mockup-insight">
              <span className="insight-icon">💡</span>
              <div className="mockup-title">Key Insight</div>
              <div className="mockup-insight-text">The most important learning from this project...</div>
            </div>
          )}
          {type === 'tools' && (
            <div className="mockup-tools">
              <div className="mockup-tool"><span>🎨</span><div>Figma</div></div>
              <div className="mockup-tool"><span>⚛️</span><div>React</div></div>
              <div className="mockup-tool"><span>📊</span><div>Analytics</div></div>
            </div>
          )}
          {type === 'video' && (
            <div className="mockup-video">
              <div className="mockup-video-player">
                <span className="play-icon">▶</span>
              </div>
              <div className="mockup-video-caption">Video caption here</div>
            </div>
          )}
          {type === 'issuesBreakdown' && (
            <div className="mockup-issues-breakdown">
              <div className="mockup-label" />
              <div className="mockup-title-sm">what started to break</div>
              <div className="mockup-issues-grid">
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">1</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">2</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">3</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
                <div className="mockup-issue-card">
                  <span className="mockup-issue-num">4</span>
                  <div className="mockup-issue-text"><div className="line" /><div className="line short" /></div>
                </div>
              </div>
              <div className="mockup-conclusion-box">Conclusion summary</div>
            </div>
          )}
          {type === 'oldExperience' && (
            <div className="mockup-old-experience">
              <div className="mockup-label" />
              <div className="mockup-title-sm">the old experience</div>
              <div className="mockup-subtitle-text">Explanation</div>
              <div className="mockup-text-lines">
                <div className="line" /><div className="line" /><div className="line short" />
              </div>
              <div className="mockup-bullet-list">
                <div className="mockup-bullet"><span>•</span><div className="line" /></div>
                <div className="mockup-bullet"><span>•</span><div className="line" /></div>
                <div className="mockup-bullet"><span>•</span><div className="line" /></div>
              </div>
              <div className="mockup-highlight-box">Key insight or quote</div>
            </div>
          )}
          {type === 'achieveGoals' && (
            <div className="mockup-achieve-goals">
              <div className="mockup-label" />
              <div className="mockup-title-sm">What did we want to achieve?</div>
              <div className="mockup-goals-columns">
                <div className="mockup-goals-col">
                  <div className="mockup-col-title">KPIs</div>
                  <div className="mockup-goal-item"><span className="goal-num">1</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">2</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">3</span><div className="line" /></div>
                </div>
                <div className="mockup-goals-col">
                  <div className="mockup-col-title">Key metrics</div>
                  <div className="mockup-goal-item"><span className="goal-num">1</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">2</span><div className="line" /></div>
                  <div className="mockup-goal-item"><span className="goal-num">3</span><div className="line" /></div>
                </div>
              </div>
            </div>
          )}
          {type === 'textWithImages' && (
            <div className="mockup-text-with-images">
              <div className="mockup-label" />
              <div className="mockup-title-sm">Title with description</div>
              <div className="mockup-text-lines">
                <div className="line" /><div className="line" /><div className="line short" />
              </div>
              <div className="mockup-two-images">
                <div className="mockup-image-box"><span className="mockup-img-icon">🖼</span></div>
                <div className="mockup-image-box"><span className="mockup-img-icon">🖼</span></div>
              </div>
            </div>
          )}
          {type === 'projectShowcase' && (
            <div className="mockup-project-showcase">
              <div className="mockup-ps-info">
                <div className="mockup-ps-number">03</div>
                <div className="mockup-ps-title">Project</div>
                <div className="mockup-text-lines">
                  <div className="line" /><div className="line short" />
                </div>
                <div className="mockup-ps-tags">UX • Design</div>
                <div className="mockup-ps-logo" />
              </div>
              <div className="mockup-ps-visual">
                <div className="mockup-image"><span className="mockup-img-icon large">🖼</span></div>
              </div>
            </div>
          )}
          {type === 'goalsShowcase' && (
            <div className="mockup-goals-showcase">
              <div className="mockup-gs-info">
                <div className="mockup-gs-number">02</div>
                <div className="mockup-gs-title">Goals</div>
                <div className="mockup-gs-goals">
                  <div className="mockup-gs-goal"><span>01</span><div className="line" /></div>
                  <div className="mockup-gs-goal"><span>02</span><div className="line" /></div>
                  <div className="mockup-gs-goal"><span>03</span><div className="line" /></div>
                </div>
              </div>
              <div className="mockup-gs-visual">
                <div className="mockup-image"><span className="mockup-img-icon large">🖼</span></div>
              </div>
            </div>
          )}
          {type === 'imageMosaic' && (
            <div className="mockup-image-mosaic">
              <div className="mockup-mosaic-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="mockup-mosaic-tile" />
                ))}
              </div>
              <div className="mockup-mosaic-overlay">
                <div className="mockup-mosaic-title">Title</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Editable field component - defined outside CaseStudy for stable React identity across renders.
// This prevents unmount/remount cycles that destroy input state, cursor position, and focus.
const EditableField = memo(function EditableField({ value, onChange, multiline = false, className = '', placeholder = '' }) {
  const { editMode } = useEdit();
  const stringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
  const [localValue, setLocalValue] = useState(stringValue);
  const timeoutRef = useRef(null);
  const isEditingRef = useRef(false);
  
  // Sync local value when prop changes from outside (but not while user is actively typing)
  useEffect(() => {
    if (!isEditingRef.current) {
      const newStringValue = typeof value === 'string' ? value : (value != null ? String(value) : '');
      setLocalValue(newStringValue);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    isEditingRef.current = true;
    setLocalValue(newValue);
    
    // Debounce the update to parent
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
      isEditingRef.current = false;
    }, 300);
  };
  
  const handleBlur = () => {
    // Clear editing flag and save immediately on blur
    isEditingRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localValue !== value) {
      onChange(localValue);
    }
  };
  
  const handleKeyDown = (e) => {
    // Allow Shift+Enter for line breaks in single-line inputs
    if (e.key === 'Enter' && e.shiftKey && !multiline) {
      e.preventDefault();
      const newValue = localValue + '\n';
      setLocalValue(newValue);
      onChange(newValue);
    }
  };
  
  if (!editMode) {
    // Render with line breaks preserved
    if (multiline || (stringValue && stringValue.includes('\n'))) {
      return <span className={className} style={{ whiteSpace: 'pre-line' }}>{stringValue}</span>;
    }
    return stringValue;
  }
  
  return multiline ? (
    <textarea
      className={`editable-field ${className}`}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
    />
  ) : (
    <input
      type="text"
      className={`editable-field ${className}`}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
    />
  );
});

const CaseStudy = () => {
  const { projectId } = useParams();
  const { editMode, setEditMode, setShowPanel } = useEdit(); // Use global edit mode from context
  const [project, setProject] = useState(() => getCaseStudyData(projectId));
  const containerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderMode, setBuilderMode] = useState('choose'); // 'choose' | 'form' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null); // { slides, preview }
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTwiImageControl, setActiveTwiImageControl] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'
  const [builderStep, setBuilderStep] = useState(0);
  const [builderData, setBuilderData] = useState({
    projectName: '',
    category: '',
    year: new Date().getFullYear().toString(),
    client: '',
    role: '',
    duration: '',
    deliverables: '',
    description: '',
    context: '',
    problem: '',
    issues: ['', '', ''],
    goals: ['', '', ''],
    solution: '',
    results: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }],
    testimonial: '',
    testimonialAuthor: '',
  });
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const totalSlides = project.slides.length;

  // Track if we've loaded initial data (to avoid saving on first load)
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const projectRef = useRef(project); // Keep ref to latest project for beforeunload
  
  // Update projectRef whenever project changes
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Load project data when projectId changes.
  // When preserveSlide is true (e.g. on tab visibility change), we do not reset currentSlide.
  const loadProjectData = useCallback(async (preserveSlide = false) => {
    console.log(`[loadProjectData] Loading projectId: ${projectId}`);
    hasLoadedRef.current = false; // Reset on projectId change
    
    // Check if we have a marker that data is in IndexedDB
    const hasIdbMarker = localStorage.getItem(`caseStudy_${projectId}_idb`) === 'true';
    console.log(`[loadProjectData] hasIdbMarker: ${hasIdbMarker}`);
    
    // Load sync first for immediate display (unless we know data is only in IndexedDB)
    const syncData = getCaseStudyData(projectId);
    const defaultData = defaultCaseStudies[projectId] || defaultCaseStudies['align-technology'];
    
    // Check if sync data is actually different from defaults (has real saved data)
    const syncHasData = localStorage.getItem(`caseStudy_${projectId}`) !== null;
    const hasMinimal = localStorage.getItem(`caseStudy_${projectId}_minimal`) !== null;
    console.log(`[loadProjectData] syncHasData: ${syncHasData}, hasMinimal: ${hasMinimal}`);
    
    // If localStorage has data or no IDB marker, use sync data immediately
    // Otherwise, wait for async load to avoid showing defaults
    if (!hasIdbMarker || syncHasData || hasMinimal) {
      setProject(syncData);
      if (!preserveSlide) setCurrentSlide(0);
      console.log('[loadProjectData] Set project from sync data');
    } else {
      // Data is only in IndexedDB, show defaults temporarily while loading
      setProject(defaultData);
      if (!preserveSlide) setCurrentSlide(0);
      console.log('[loadProjectData] Set project to defaults (waiting for IndexedDB)');
    }
    
    // Always try async load from IndexedDB (may have more complete data)
    try {
      const asyncData = await getCaseStudyDataAsync(projectId);
      if (asyncData) {
        // Update with the real data from IndexedDB
        setProject(asyncData);
        console.log('[loadProjectData] Updated project from IndexedDB');
        // If we showed defaults initially, reset slide to 0 (unless preserving for tab return)
        if (!preserveSlide && hasIdbMarker && !syncHasData && !hasMinimal) {
          setCurrentSlide(0);
        }
      } else if (hasIdbMarker && !syncHasData && !hasMinimal) {
        // Expected data from IndexedDB but got nothing - this shouldn't happen
        console.warn('[loadProjectData] Expected IndexedDB data but got null. Marker exists but data not found.');
        // Keep defaults for now, but log the issue
      }
    } catch (e) {
      console.error('[loadProjectData] Async load failed:', e);
      // If we were expecting IndexedDB data but it failed, log it
      if (hasIdbMarker && !syncHasData && !hasMinimal) {
        console.error('[loadProjectData] Critical: Data was saved to IndexedDB but cannot be loaded. Error:', e);
      }
    }
    // Mark as loaded after async attempt
    hasLoadedRef.current = true;
  }, [projectId]);
  
  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);
  
  // Reload data when component becomes visible again (in case user navigated away and back).
  // Preserve current slide so switching tabs doesn't jump back to slide 1.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasLoadedRef.current && !editMode) {
        // Component became visible again, reload data to ensure we have latest
        // Skip reload when in edit mode to preserve user's editing state
        console.log('[visibilitychange] Component visible again, reloading data');
        loadProjectData(true); // preserveSlide = true
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadProjectData, editMode]);

  // Track previous edit mode to detect when exiting edit mode
  const prevEditModeRef = useRef(editMode);
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialProjectRef = useRef(null);
  
  // Store initial project state when entering edit mode AND save when exiting
  useEffect(() => {
    const wasEditing = prevEditModeRef.current;
    const isEditing = editMode;
    
    // Just entered edit mode - store initial state
    if (isEditing && !wasEditing) {
      initialProjectRef.current = JSON.stringify(project);
      setHasUnsavedChanges(false);
    }
    
    // Just exited edit mode - save if there are changes
    if (!isEditing && wasEditing && hasLoadedRef.current) {
      const currentState = JSON.stringify(project);
      const hasChanges = initialProjectRef.current && currentState !== initialProjectRef.current;
      
      if (hasChanges) {
        // Show saving status
        setSaveStatus('saving');
        
        // Save immediately when done editing
        const doSave = async () => {
          try {
            console.log('Saving case study data for projectId:', projectId);
            const success = await saveCaseStudyData(projectId, project);
            console.log('Save result:', success);
            if (success) {
              setSaveStatus('saved');
              setHasUnsavedChanges(false);
              // Hide status after 2 seconds
              setTimeout(() => setSaveStatus(null), 2000);
            } else {
              console.error('Save returned false');
              setSaveStatus('error');
            }
          } catch (err) {
            console.error('Failed to save:', err);
            setSaveStatus('error');
          }
        };
        
        doSave();
      } else {
        console.log('No changes detected, skipping save');
      }
    }
    
    // Update ref AFTER checking for transitions
    prevEditModeRef.current = editMode;
  }, [editMode, project, projectId]);
  
  // Track unsaved changes while editing
  useEffect(() => {
    if (editMode && hasLoadedRef.current && initialProjectRef.current) {
      const currentState = JSON.stringify(project);
      setHasUnsavedChanges(currentState !== initialProjectRef.current);
    } else if (!editMode) {
      // Clear unsaved changes flag when not editing
      setHasUnsavedChanges(false);
    }
  }, [project, editMode]);
  
  // Save before page unloads (backup save)
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      // Try to save before leaving - use sendBeacon for async save
      if (editMode || hasUnsavedChanges) {
        try {
          // Try synchronous localStorage save first (most reliable)
          const jsonData = JSON.stringify(projectRef.current);
          const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
          if (sizeInMB < 4) {
            localStorage.setItem(`caseStudy_${projectId}`, jsonData);
            console.log('[beforeunload] Saved to localStorage');
          } else {
            // Data too large, mark for IndexedDB
            localStorage.setItem(`caseStudy_${projectId}_idb`, 'true');
            // Try to save minimal version
            try {
              const minimalCopy = JSON.parse(JSON.stringify(projectRef.current));
              const removeImages = (obj) => {
                if (typeof obj === 'string' && obj.startsWith('data:image')) return '';
                if (Array.isArray(obj)) return obj.map(item => removeImages(item));
                if (obj && typeof obj === 'object') {
                  const result = {};
                  for (const key in obj) result[key] = removeImages(obj[key]);
                  return result;
                }
                return obj;
              };
              const minimal = removeImages(minimalCopy);
              const minimalJson = JSON.stringify(minimal);
              const minimalSize = new Blob([minimalJson]).size / (1024 * 1024);
              if (minimalSize < 2) {
                localStorage.setItem(`caseStudy_${projectId}_minimal`, minimalJson);
              }
            } catch (err) {
              console.warn('[beforeunload] Failed to save minimal version:', err);
            }
          }
        } catch (e) {
          console.error('[beforeunload] Failed to save on unload:', e);
        }
      }
    };
    
    // Also listen for visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden && (editMode || hasUnsavedChanges)) {
        // Page is being hidden, try to save
        handleBeforeUnload();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projectId, editMode, hasUnsavedChanges]);

  // Hide main navigation when on case study
  useEffect(() => {
    document.body.classList.add('case-study-active');
    return () => {
      document.body.classList.remove('case-study-active');
    };
  }, []);

  // Close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // Navigation handlers with proper debouncing
  useEffect(() => {
    const container = containerRef.current;
    if (!container || editMode) return;

    const goToSlide = (direction) => {
      if (isScrollingRef.current) return;
      
      isScrollingRef.current = true;
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      setCurrentSlide(prev => {
        const next = prev + direction;
        if (next < 0) return 0;
        if (next >= totalSlides) return totalSlides - 1;
        return next;
      });
      
      // Lock scrolling for 400ms to prevent multiple slides (faster response)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current) return;
      
      // Immediate response - no accumulation delay
      if (Math.abs(e.deltaY) > 20) {
        goToSlide(e.deltaY > 0 ? 1 : -1);
      }
    };

    const handleKeyDown = (e) => {
      if (editMode) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(-1);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current || editMode) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      const timeDiff = Date.now() - touchStartTime;
      
      // Only register swipe if it was quick enough (under 500ms) and long enough (50px)
      if (timeDiff < 500) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          goToSlide(diffX > 0 ? 1 : -1);
      } else if (Math.abs(diffY) > 50) {
          goToSlide(diffY > 0 ? 1 : -1);
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [totalSlides, editMode]);

  // Edit mode functions
  const updateSlide = useCallback((slideIndex, updates) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => 
        i === slideIndex ? { ...slide, ...updates } : slide
      )
    }));
  }, []);

  const updateSlideItem = useCallback((slideIndex, itemKey, itemIndex, value) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => {
        if (i !== slideIndex) return slide;
        const newItems = [...slide[itemKey]];
        if (typeof newItems[itemIndex] === 'object') {
          newItems[itemIndex] = { ...newItems[itemIndex], ...value };
        } else {
          newItems[itemIndex] = value;
        }
        return { ...slide, [itemKey]: newItems };
      })
    }));
  }, []);

  const addSlide = useCallback((templateType, afterIndex) => {
    const template = { ...slideTemplates[templateType] };
    setProject(prev => ({
      ...prev,
      slides: [
        ...prev.slides.slice(0, afterIndex + 1),
        template,
        ...prev.slides.slice(afterIndex + 1)
      ]
    }));
    setShowTemplates(false);
  }, []);

  const deleteSlide = useCallback((index) => {
    if (project.slides.length <= 1) return;
    setProject(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));
    if (currentSlide >= project.slides.length - 1) {
      setCurrentSlide(prev => Math.max(0, prev - 1));
    }
  }, [project.slides.length, currentSlide]);

  const moveSlide = useCallback((fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= project.slides.length) return;
    
    setProject(prev => {
      const newSlides = [...prev.slides];
      [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];
      return { ...prev, slides: newSlides };
    });
    setCurrentSlide(toIndex);
  }, [project.slides.length]);

  const handleReset = useCallback(async () => {
    if (window.confirm('Reset all changes to default? This cannot be undone.')) {
      const defaultData = await resetCaseStudyData(projectId);
      setProject(defaultData);
    }
  }, [projectId]);

  // Case Study Builder - Generate slides from form data
  const generateFromBuilder = () => {
    const slides = [];
    const d = builderData;
    
    // Intro slide
    if (d.projectName) {
      slides.push({
        type: 'intro',
        title: d.projectName,
        subtitle: `${d.category || 'Case Study'} • ${d.year}`,
        description: d.description || '',
        image: '',
      });
    }
    
    // Info slide
    if (d.client || d.role || d.duration || d.deliverables) {
      const items = [];
      if (d.client) items.push({ label: 'Client', value: d.client });
      if (d.role) items.push({ label: 'Role', value: d.role });
      if (d.duration) items.push({ label: 'Duration', value: d.duration });
      if (d.deliverables) items.push({ label: 'Deliverables', value: d.deliverables });
      slides.push({
        type: 'info',
        title: 'Project Overview',
        items,
      });
    }
    
    // Context slide
    if (d.context) {
      slides.push({
        type: 'context',
        label: 'Context',
        title: 'Understanding the environment',
        content: d.context,
        highlight: '',
        image: '',
      });
    }
    
    // Problem slide
    if (d.problem || d.issues.some(i => i)) {
      slides.push({
        type: 'problem',
        label: 'The Problem',
        title: 'What needed to be solved',
        content: d.problem,
        issues: d.issues.filter(i => i),
        conclusion: '',
        image: '',
      });
    }
    
    // Goals slide
    if (d.goals.some(g => g)) {
      slides.push({
        type: 'goals',
        label: 'Goals',
        title: 'What we wanted to achieve',
        goals: d.goals.filter(g => g).map((g, i) => ({
          number: String(i + 1),
          title: g,
          description: '',
        })),
        kpis: [],
      });
    }
    
    // Solution/Text slide
    if (d.solution) {
      slides.push({
        type: 'text',
        label: 'The Solution',
        title: 'How we solved it',
        content: d.solution,
      });
    }
    
    // Stats slide
    if (d.results.some(r => r.value)) {
      slides.push({
        type: 'stats',
        label: 'Results',
        title: 'Impact & Metrics',
        stats: d.results.filter(r => r.value).map(r => ({
          value: r.value,
          label: r.label,
        })),
      });
    }
    
    // Testimonial slide
    if (d.testimonial) {
      slides.push({
        type: 'testimonial',
        quote: d.testimonial,
        author: d.testimonialAuthor || 'Client',
        role: '',
      });
    }
    
    // End slide
    slides.push({
      type: 'end',
      title: 'Thank You',
      subtitle: "Let's work together",
      buttons: [
        { text: 'Get in touch', link: 'mailto:hello@example.com' },
        { text: 'View more projects', link: '/' },
      ],
    });
    
    // Update project with generated slides
    setProject(prev => ({
      ...prev,
      title: d.projectName || prev.title,
      category: d.category || prev.category,
      year: d.year || prev.year,
      slides,
    }));
    
    closeBuilder();
    setCurrentSlide(0);
  };

  // Close builder and reset all state
  const closeBuilder = () => {
    setShowBuilder(false);
    setBuilderMode('choose');
    setBuilderStep(0);
    setPasteText('');
    setParsedPreview(null);
  };

  // Text-to-slides parser — intelligently maps pasted content to the best slide templates
  const parseTextToSlides = (rawText) => {
    const text = rawText.trim();
    if (!text) return { slides: [], preview: [] };

    const lines = text.split('\n');

    // Group lines into blocks separated by empty lines
    const blocks = [];
    let currentBlock = [];
    for (const line of lines) {
      if (line.trim() === '') {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.map(l => l.trim()).filter(l => l));
          currentBlock = [];
        }
      } else {
        currentBlock.push(line);
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock.map(l => l.trim()).filter(l => l));
    }

    if (blocks.length === 0) return { slides: [], preview: [] };

    // Known info labels for key-value pair detection
    const infoLabels = ['client', 'platform', 'industry', 'role', 'duration', 'timeline', 'year', 'team', 'deliverables', 'type', 'company', 'agency', 'scope', 'period', 'sector'];

    // Regex patterns that match the START of real section headings
    // This prevents content lines like "Scan context is always visible" from matching "context"
    const headingPatterns = [
      // Background / Context
      /^background\b/i, /^context\b/i, /^overview\b/i, /^about\b/i,
      // Problem / Challenge
      /^(the\s+)?problem\b/i, /^(the\s+)?challenge\b/i, /^pain\s+point/i,
      // Research
      /^research/i, /^user\s+research/i,
      // Findings / Insights
      /^(key\s+)?finding/i, /^(key\s+)?insight/i, /^what\s+(the\s+)?research/i,
      // Goals / Success
      /^defining\s+(success|goals)/i, /^(success\s+)?goals?\b/i, /^objectives?\b/i,
      // Strategy / Approach
      /^(redesign\s+)?strategy/i, /^redesign\b/i, /^approach\b/i, /^methodology\b/i, /^framework\b/i,
      // Solution
      /^(the\s+)?solution\b/i, /^how\s+we\s+solved/i,
      // Flow / Feature sections
      /^flow\s+\d/i, /^core\s+tool/i, /^multi.scan/i,
      // Process / Timeline
      /^(the\s+)?process\b/i, /^timeline\b/i, /^how\s+we\s+got/i,
      // Testing
      /^testing\b/i, /^validation\b/i, /^usability/i,
      // Outcomes / Results
      /^outcome/i, /^result/i, /^impact\b/i, /^what\s+(improved|changed)\b/i,
      // Learnings
      /^(key\s+)?learning/i, /^(key\s+)?takeaway/i, /^lesson/i, /^what\s+this\s+project/i,
      // End
      /^thank\s+you/i, /^want\s+to\s+work/i,
      // Comparison / Review
      /^review\s+[&+]/i, /^before\s+[&+]\s+after/i, /^comparison\b/i,
    ];

    // Section heading keywords → template mapping (used in Phase 4 for confirmed sections)
    const sectionKeywords = {
      context: ['background', 'context', 'about', 'overview', 'what is'],
      users: ['users', 'who the users', 'audience', 'user profile', 'persona'],
      problem: ['problem', 'challenge', 'broke', 'breakdown', 'pain point', 'friction'],
      research: ['research', 'discovery'],
      findings: ['findings', 'insights', 'revealed', 'key findings', 'discovered'],
      goals: ['goals', 'defining success', 'objectives', 'metrics', 'kpi', 'achieve'],
      strategy: ['strategy', 'approach', 'redesign strategy', 'framework', 'methodology'],
      flow: ['flow 0', 'flow 1', 'flow 2', 'flow 3', 'flow 4', 'flow 5'],
      solution: ['solution', 'how we solved', 'resolution'],
      outcomes: ['outcomes', 'results', 'impact', 'what improved', 'what changed', 'improvements'],
      learnings: ['learnings', 'takeaways', 'reinforced', 'reflection', 'lessons', 'what this project'],
      end: ['thank you', 'thanks', 'get in touch', 'work together'],
      testing: ['testing', 'validation', 'usability test', 'experiment'],
      process: ['process', 'timeline', 'journey', 'phases', 'how we got'],
      comparison: ['before & after', 'comparison', 'transformation'],
      review: ['review &', 'review and', 'core tools', 'multi-scan', 'key feature'],
    };

    // Helpers
    const matchesKeywords = (text, keywords) => {
      const lower = text.toLowerCase();
      return keywords.some(kw => lower.includes(kw));
    };

    // Strict heading check using regex START-of-text patterns
    const isSectionHeading = (blockText) => {
      const lower = blockText.toLowerCase().trim();
      return headingPatterns.some(p => p.test(lower));
    };

    const slides = [];
    const preview = [];
    let blockIndex = 0;

    // --- Phase 1: Detect intro (first blocks are typically title + subtitle) ---
    let projectTitle = '';
    let projectDescription = '';

    if (blocks.length > 0) {
      const firstBlock = blocks[0];
      if (firstBlock.length === 1 && firstBlock[0].length < 80) {
        projectTitle = firstBlock[0];
        blockIndex = 1;
        if (blockIndex < blocks.length) {
          const nextBlock = blocks[blockIndex];
          // Check if next block is description (not an info label)
          if (nextBlock.length === 1 && nextBlock[0].length < 150 && !infoLabels.includes(nextBlock[0].replace(/:$/, '').trim().toLowerCase())) {
            projectDescription = nextBlock[0];
            blockIndex++;
          } else if (nextBlock.length >= 2 && !infoLabels.includes(nextBlock[0].replace(/:$/, '').trim().toLowerCase())) {
            projectDescription = nextBlock.join(' ');
            blockIndex++;
          }
        }
      } else if (firstBlock.length >= 2) {
        projectTitle = firstBlock[0];
        projectDescription = firstBlock.slice(1).join(' ');
        blockIndex = 1;
      }
    }

    // --- Phase 2: Detect info key-value pairs (Client → Value, Role → Value, etc.) ---
    const infoItems = [];
    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex];
      const label = block[0].replace(/:$/, '').trim();
      
      if (infoLabels.includes(label.toLowerCase())) {
        // Value is in the same block (lines after label)
        let value = block.slice(1).join(' ').trim();
        
        // If no value in same block, peek at next block
        if (!value && blockIndex + 1 < blocks.length) {
          const nextBlock = blocks[blockIndex + 1];
          // Next block should be a short value, not another label or section heading
          if (nextBlock.length <= 2 && !infoLabels.includes(nextBlock[0].replace(/:$/, '').trim().toLowerCase()) && !isSectionHeading(nextBlock.join(' '))) {
            value = nextBlock.join(' ').trim();
            blockIndex++; // consume the value block too
          }
        }
        
        if (value) {
          infoItems.push({ label, value });
          blockIndex++;
          continue;
        }
      }
      break;
    }

    // Generate intro slide
    if (projectTitle) {
      const introSlide = {
        type: 'intro',
        title: projectTitle,
        description: projectDescription,
        image: '',
      };
      if (infoItems.length > 0) {
        introSlide.clientLabel = infoItems[0]?.label || 'Client';
        introSlide.client = infoItems[0]?.value || '';
        if (infoItems.length > 1) {
          introSlide.focusLabel = infoItems[1]?.label || 'Focus';
          introSlide.focus = infoItems[1]?.value || '';
        }
      }
      slides.push(introSlide);
      preview.push({ type: 'intro', label: `Intro — ${projectTitle}` });
    }

    // Generate info slide if enough key-value pairs found
    if (infoItems.length >= 2) {
      slides.push({
        type: 'info',
        title: 'Project Overview',
        items: infoItems,
      });
      preview.push({ type: 'info', label: `Project Info — ${infoItems.length} items` });
    }

    // --- Phase 3: Parse remaining content into sections ---
    // ONLY create a new section when a block matches START-of-text heading patterns
    // plus passes strict guards. Everything else is content under the current section.
    const sections = [];
    let currentSection = null;

    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex];
      const blockText = block.join(' ');
      const firstLine = block[0];
      const subtitle = block.length > 1 ? block[1] : '';
      const combinedWords = blockText.split(/\s+/).length;

      // Strict heading detection with multiple guards
      const isRecognizedHeading =
        block.length <= 2 &&              // Max 2 lines (heading + optional subtitle)
        firstLine.length < 60 &&          // First line is short
        combinedWords >= 2 &&             // At least 2 words total (avoids single-word sub-headings like "Goals", "Metrics")
        !firstLine.endsWith('.') &&       // Not a sentence
        !firstLine.endsWith(':') &&       // Not a list introducer
        !firstLine.endsWith(',') &&       // Not a partial sentence
        !firstLine.endsWith(';') &&
        !subtitle.endsWith(':') &&        // Subtitle not a list introducer (catches "The Problem\nTools were...:")
        !/^\d+[\.\)]\s/.test(firstLine) && // Not a numbered item
        isSectionHeading(blockText);       // Matches a known heading pattern at START of text

      if (isRecognizedHeading) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          heading: firstLine,
          subtitle: subtitle,
          content: [],
        };
      } else if (currentSection) {
        // Append as content to current section
        currentSection.content.push(block);
      } else {
        // No section started yet and block is not a heading - create a generic section
        currentSection = { heading: '', subtitle: '', content: [block] };
      }
      blockIndex++;
    }
    if (currentSection) sections.push(currentSection);

    // --- Phase 4: Map each section to the best slide template ---
    for (const section of sections) {
      const heading = section.heading;
      const subtitle = section.subtitle;
      const headingLower = (heading + ' ' + subtitle).toLowerCase();
      const allContent = section.content.flat();
      const contentText = allContent.join('\n');

      if (!heading && allContent.length === 0) continue;

      // Detect sub-sections (The Problem / The Process / The Solution pattern)
      const hasSubSections = allContent.some(line =>
        /^(The Problem|The Process|The Solution)$/i.test(line.trim())
      );

      // Extract numbered items, bullets, paragraphs
      const numberedItems = [];
      const bulletItems = [];
      const paragraphs = [];

      for (const block of section.content) {
        for (const line of block) {
          if (/^\d+[\.\)]\s/.test(line)) {
            numberedItems.push(line.replace(/^\d+[\.\)]\s*/, '').trim());
          } else if (/^[-•·]\s/.test(line)) {
            bulletItems.push(line.replace(/^[-•·]\s*/, '').trim());
          }
        }
        const blockText = block.join(' ');
        if (blockText.length > 60 && !/^\d+[\.\)]\s/.test(block[0]) && !/^[-•·]\s/.test(block[0])) {
          paragraphs.push(blockText);
        }
      }

      // Short standalone items (not sentences, not numbered, not bullets)
      const shortItems = allContent.filter(l =>
        l.length < 120 && l.length > 8 &&
        !/^\d+[\.\)]\s/.test(l) &&
        !/^[-•·]\s/.test(l) &&
        !l.endsWith(':') &&
        !l.endsWith('.')
      );

      // ===================== Template Mapping =====================

      // End slide (only create one)
      if (matchesKeywords(headingLower, sectionKeywords.end)) {
        if (!slides.some(s => s.type === 'end')) {
          slides.push({
            type: 'end',
            title: heading || 'Thank You',
            subtitle: subtitle || allContent.find(l => l.length > 5) || "Let's work together",
            buttons: [
              { text: 'Get in touch', link: 'mailto:hello@example.com' },
              { text: 'View more projects', link: '/' },
            ],
          });
          preview.push({ type: 'end', label: `End — ${heading || 'Thank You'}` });
        }
        continue;
      }

      // Problem / Issues
      if (matchesKeywords(headingLower, sectionKeywords.problem)) {
        // Check for numbered issues with descriptions
        const issues = [];
        let issueIdx = -1;

        for (const block of section.content) {
          for (const line of block) {
            const numberedMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
            if (numberedMatch) {
              issues.push({ title: numberedMatch[2], description: '' });
              issueIdx = issues.length - 1;
            } else if (issueIdx >= 0 && !issues[issueIdx].description && line.length > 15) {
              issues[issueIdx].description = line;
            }
          }
        }

        if (issues.length >= 2) {
          slides.push({
            type: 'issuesBreakdown',
            label: heading || 'The Problem',
            title: subtitle || 'What started to break',
            issues: issues.map((issue, i) => ({
              number: String(i + 1),
              title: issue.title,
              description: issue.description,
            })),
            conclusion: paragraphs.length > 0 ? paragraphs[paragraphs.length - 1] : '',
          });
          preview.push({ type: 'issuesBreakdown', label: `Issues — ${issues.length} issues identified` });
        } else {
          const issueTexts = [...numberedItems, ...bulletItems].slice(0, 5);
          slides.push({
            type: 'problem',
            label: heading || 'The Problem',
            title: subtitle || 'What needed to be solved',
            content: paragraphs[0] || contentText.slice(0, 400),
            issues: issueTexts.length > 0 ? issueTexts : [],
            conclusion: paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '',
            image: '',
            splitRatio: 50,
          });
          preview.push({ type: 'problem', label: `Problem — ${subtitle || heading}` });
        }
        continue;
      }

      // Context / Background / Users
      if (matchesKeywords(headingLower, sectionKeywords.context) || matchesKeywords(headingLower, sectionKeywords.users)) {
        slides.push({
          type: 'context',
          label: heading || 'Context',
          title: subtitle || 'Understanding the environment',
          content: paragraphs.join('\n\n') || allContent.join('\n'),
          highlight: shortItems.length > 0 ? shortItems.slice(0, 3).join('. ') : '',
          image: '',
          splitRatio: 50,
        });
        preview.push({ type: 'context', label: `Context — ${heading}${subtitle ? ': ' + subtitle : ''}` });
        continue;
      }

      // Research
      if (matchesKeywords(headingLower, sectionKeywords.research)) {
        const methods = [...bulletItems, ...shortItems].filter(i => i.length > 10);
        slides.push({
          type: 'text',
          label: heading || 'Research',
          title: subtitle || 'Understanding the problem space',
          content: paragraphs.join('\n\n') + (methods.length > 0 ? '\n\n' + methods.map(m => '• ' + m).join('\n') : ''),
        });
        preview.push({ type: 'text', label: `Research — ${heading}` });
        continue;
      }

      // Findings / Insights
      if (matchesKeywords(headingLower, sectionKeywords.findings)) {
        const items = [...bulletItems, ...shortItems, ...numberedItems].filter(i => i.length > 10);
        if (items.length >= 2) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Key Findings',
            title: subtitle || 'What the research revealed',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `Findings — ${items.length} insights` });
        } else {
          slides.push({
            type: 'insight',
            label: heading || 'Key Insight',
            insight: items[0] || paragraphs[0] || contentText.slice(0, 200),
            supporting: paragraphs.length > 1 ? paragraphs[1] : '',
          });
          preview.push({ type: 'insight', label: `Insight — ${heading}` });
        }
        continue;
      }

      // Goals (detect dual Goals + Metrics sub-sections for achieveGoals)
      if (matchesKeywords(headingLower, sectionKeywords.goals)) {
        const goalItems = [];
        const metricItems = [];
        let collecting = '';

        for (const line of allContent) {
          const lineLower = line.toLowerCase().trim();
          if (lineLower === 'goals' || lineLower === 'objectives') { collecting = 'goals'; continue; }
          if (lineLower === 'metrics' || lineLower === 'kpis' || lineLower === 'key metrics') { collecting = 'metrics'; continue; }
          if (collecting === 'goals' && line.length > 5 && line.length < 150) goalItems.push(line);
          else if (collecting === 'metrics' && line.length > 5 && line.length < 150) metricItems.push(line);
        }

        if (goalItems.length > 0 && metricItems.length > 0) {
          slides.push({
            type: 'achieveGoals',
            label: heading || 'Defining Goals',
            title: subtitle || 'What did we want to achieve?',
            leftColumn: {
              title: 'Goals',
              goals: goalItems.map((g, i) => ({ number: String(i + 1), text: g })),
            },
            rightColumn: {
              title: 'Metrics',
              goals: metricItems.map((m, i) => ({ number: String(i + 1), text: m })),
            },
          });
          preview.push({ type: 'achieveGoals', label: `Goals & Metrics — ${goalItems.length + metricItems.length} items` });
        } else {
          const allGoals = [...goalItems, ...metricItems, ...bulletItems, ...numberedItems, ...shortItems].filter(g => g.length > 5);
          slides.push({
            type: 'goals',
            label: heading || 'Goals',
            title: subtitle || 'What we wanted to achieve',
            goals: allGoals.slice(0, 6).map((g, i) => ({
              number: String(i + 1),
              title: g,
              description: '',
            })),
            kpis: metricItems.length > 0 ? metricItems.slice(0, 4) : [],
          });
          preview.push({ type: 'goals', label: `Goals — ${allGoals.length} items` });
        }
        continue;
      }

      // Flow / Feature sections (Flow 01, Flow 02, etc.) or sections with Problem/Solution sub-structure
      if (matchesKeywords(headingLower, sectionKeywords.flow) || matchesKeywords(headingLower, sectionKeywords.review) || hasSubSections) {
        let problemText = '';
        let solutionText = '';
        let processText = '';
        let currentSub = '';

        for (const line of allContent) {
          const lineLower = line.toLowerCase().trim();
          if (lineLower === 'the problem' || lineLower === 'problem') { currentSub = 'problem'; continue; }
          if (lineLower === 'the process' || lineLower === 'process') { currentSub = 'process'; continue; }
          if (lineLower === 'the solution' || lineLower === 'solution') { currentSub = 'solution'; continue; }

          if (currentSub === 'problem') problemText += (problemText ? '\n' : '') + line;
          else if (currentSub === 'process') processText += (processText ? '\n' : '') + line;
          else if (currentSub === 'solution') solutionText += (solutionText ? '\n' : '') + line;
        }

        if (problemText && solutionText) {
          slides.push({
            type: 'challengeSolution',
            label: heading || 'Design Solution',
            title: subtitle || 'Challenge & Solution',
            challenge: problemText,
            solution: solutionText,
            image: '',
          });
          preview.push({ type: 'challengeSolution', label: `Flow — ${heading}` });
        } else {
          const description = paragraphs.join('\n\n') || allContent.join('\n');
          const bullets = [...bulletItems, ...shortItems].slice(0, 5);
          slides.push({
            type: 'feature',
            label: heading || 'Feature',
            title: subtitle || heading || 'Feature Highlight',
            description: description.slice(0, 500),
            image: '',
            bullets: bullets.length > 0 ? bullets : [],
            splitRatio: 50,
          });
          preview.push({ type: 'feature', label: `Feature — ${heading}` });
        }
        continue;
      }

      // Testing
      if (matchesKeywords(headingLower, sectionKeywords.testing)) {
        const options = [...bulletItems, ...numberedItems, ...shortItems];
        slides.push({
          type: 'testing',
          label: heading || 'Testing',
          title: subtitle || 'Validating the solution',
          content: paragraphs[0] || contentText.slice(0, 300),
          layouts: options.slice(0, 5),
          conclusion: paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '',
          image: '',
          splitRatio: 50,
        });
        preview.push({ type: 'testing', label: `Testing — ${heading}` });
        continue;
      }

      // Outcomes / Results
      if (matchesKeywords(headingLower, sectionKeywords.outcomes)) {
        const items = [...bulletItems, ...numberedItems, ...shortItems].filter(i => i.length > 5);
        if (items.length >= 2) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Outcomes',
            title: subtitle || 'Results & Impact',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `Outcomes — ${items.length} results` });
        } else {
          slides.push({
            type: 'text',
            label: heading || 'Outcomes',
            title: subtitle || 'Results',
            content: paragraphs.join('\n\n') || contentText,
          });
          preview.push({ type: 'text', label: `Outcomes — ${heading}` });
        }
        continue;
      }

      // Learnings / Takeaways
      if (matchesKeywords(headingLower, sectionKeywords.learnings)) {
        const items = [...bulletItems, ...numberedItems, ...shortItems].filter(i => i.length > 10);
        if (items.length >= 2) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Key Learnings',
            title: subtitle || 'What we learned',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `Learnings — ${items.length} items` });
        } else {
          slides.push({
            type: 'insight',
            label: heading || 'Key Learning',
            insight: items[0] || paragraphs[0] || allContent[0] || '',
            supporting: items.length > 1 ? items.slice(1).join('. ') : (paragraphs.length > 1 ? paragraphs[1] : ''),
          });
          preview.push({ type: 'insight', label: `Learning — ${heading}` });
        }
        continue;
      }

      // Strategy / Approach
      if (matchesKeywords(headingLower, sectionKeywords.strategy) || matchesKeywords(headingLower, sectionKeywords.solution)) {
        const items = [...bulletItems, ...shortItems].filter(i => i.length > 10);
        if (items.length >= 3) {
          slides.push({
            type: 'process',
            label: heading || 'Strategy',
            title: subtitle || 'Our Approach',
            steps: items.slice(0, 6).map((step, i) => ({
              number: String(i + 1).padStart(2, '0'),
              title: step,
              description: '',
            })),
          });
          preview.push({ type: 'process', label: `Strategy — ${items.length} steps` });
        } else {
          slides.push({
            type: 'text',
            label: heading || 'Strategy',
            title: subtitle || 'Our Approach',
            content: paragraphs.join('\n\n') || allContent.join('\n'),
          });
          preview.push({ type: 'text', label: `Strategy — ${heading}` });
        }
        continue;
      }

      // Process
      if (matchesKeywords(headingLower, sectionKeywords.process)) {
        const steps = [...numberedItems, ...bulletItems, ...shortItems].filter(i => i.length > 5);
        if (steps.length >= 2) {
          slides.push({
            type: 'process',
            label: heading || 'Process',
            title: subtitle || 'How We Got There',
            steps: steps.slice(0, 6).map((step, i) => ({
              number: String(i + 1).padStart(2, '0'),
              title: step.split(/[-—:]/)[0].trim(),
              description: step.includes('—') || step.includes(':') ? step.split(/[-—:]/)[1]?.trim() || '' : '',
            })),
          });
          preview.push({ type: 'process', label: `Process — ${steps.length} steps` });
        } else {
          slides.push({
            type: 'text',
            label: heading || 'Process',
            title: subtitle || heading,
            content: paragraphs.join('\n\n') || allContent.join('\n'),
          });
          preview.push({ type: 'text', label: `Process — ${heading}` });
        }
        continue;
      }

      // Comparison
      if (matchesKeywords(headingLower, sectionKeywords.comparison)) {
        slides.push({
          type: 'comparison',
          label: heading || 'Comparison',
          title: subtitle || 'The Transformation',
          beforeImage: '',
          afterImage: '',
          beforeLabel: 'Before',
          afterLabel: 'After',
        });
        preview.push({ type: 'comparison', label: `Comparison — ${heading}` });
        continue;
      }

      // Default fallback: pick the best fit based on content shape
      if (heading || paragraphs.length > 0 || allContent.length > 0) {
        const items = [...bulletItems, ...numberedItems, ...shortItems].filter(i => i.length > 10);

        if (items.length >= 3 && paragraphs.length <= 1) {
          slides.push({
            type: 'outcomes',
            label: heading || 'Overview',
            title: subtitle || heading || 'Key Points',
            outcomes: items.slice(0, 6).map(item => ({
              title: item,
              description: '',
            })),
          });
          preview.push({ type: 'outcomes', label: `${heading || 'Key Points'} — ${items.length} items` });
        } else {
          slides.push({
            type: 'text',
            label: heading || 'Content',
            title: subtitle || heading || 'Details',
            content: (paragraphs.join('\n\n') || allContent.join('\n')).slice(0, 1000),
          });
          preview.push({ type: 'text', label: heading ? `${heading}` : 'Content' });
        }
      }
    }

    // Always ensure an end slide exists
    if (!slides.some(s => s.type === 'end')) {
      slides.push({
        type: 'end',
        title: 'Thank You',
        subtitle: "Let's work together",
        buttons: [
          { text: 'Get in touch', link: 'mailto:hello@example.com' },
          { text: 'View more projects', link: '/' },
        ],
      });
      preview.push({ type: 'end', label: 'End — Thank You' });
    }

    return { slides, preview };
  };

  // Generate slides from pasted text
  const generateFromPaste = () => {
    if (!parsedPreview || parsedPreview.slides.length === 0) return;

    const generatedSlides = parsedPreview.slides;
    const title = generatedSlides[0]?.title || 'Case Study';

    setProject(prev => ({
      ...prev,
      title,
      slides: generatedSlides,
    }));

    closeBuilder();
    setCurrentSlide(0);
  };

  // Builder steps configuration
  const builderSteps = [
    { title: 'Project Basics', fields: ['projectName', 'category', 'year', 'description'] },
    { title: 'Project Info', fields: ['client', 'role', 'duration', 'deliverables'] },
    { title: 'Context & Problem', fields: ['context', 'problem', 'issues'] },
    { title: 'Goals & Solution', fields: ['goals', 'solution'] },
    { title: 'Results', fields: ['results', 'testimonial', 'testimonialAuthor'] },
  ];

  // EditableField is now defined at module scope (above CaseStudy) for stable React identity

  // Add item to array field
  const addArrayItem = (slideIndex, field, defaultItem) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const currentArray = newSlides[slideIndex][field] || [];
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        [field]: [...currentArray, defaultItem]
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Remove item from array field
  const removeArrayItem = (slideIndex, field, itemIndex) => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const currentArray = [...(newSlides[slideIndex][field] || [])];
      currentArray.splice(itemIndex, 1);
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        [field]: currentArray
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Toggle optional field visibility (useCallback for stable reference)
  const toggleField = useCallback((slideIndex, field, defaultValue = '') => {
    setProject(prev => {
      const newSlides = [...prev.slides];
      const currentValue = newSlides[slideIndex][field];
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        [field]: currentValue === undefined || currentValue === null ? defaultValue : null
      };
      return { ...prev, slides: newSlides };
    });
  }, []);

  // Optional field component with toggle (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const OptionalField = useMemo(() => ({ slide, index, field, label, defaultValue = '', multiline = false, children }) => {
    const hasValue = slide[field] !== undefined && slide[field] !== null;
    
    if (!editMode && !hasValue) return null;
    
    if (editMode && !hasValue) {
      return (
        <button 
          className="add-field-btn"
          onClick={() => toggleField(index, field, defaultValue)}
        >
          + Add {label}
        </button>
      );
    }
    
    return (
      <div className="optional-field-wrapper">
        {children || (
          multiline ? (
            <p className={`field-${field}`}>
              <EditableField
                value={slide[field]}
                onChange={(v) => updateSlide(index, { [field]: v })}
                multiline
              />
            </p>
          ) : (
            <span className={`field-${field}`}>
              <EditableField
                value={slide[field]}
                onChange={(v) => updateSlide(index, { [field]: v })}
              />
            </span>
          )
        )}
        {editMode && (
          <button 
            className="remove-field-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleField(index, field);
            }}
            title={`Remove ${label}`}
          >
            ×
          </button>
        )}
      </div>
    );
  }, [editMode, toggleField, updateSlide]);

  // Array item controls component (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ArrayItemControls = useMemo(() => ({ onRemove }) => {
    if (!editMode) return null;
    return (
      <button className="remove-item-btn" onClick={onRemove} title="Remove item">×</button>
    );
  }, [editMode]);

  // Add item button component (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const AddItemButton = useMemo(() => ({ onClick, label }) => {
    if (!editMode) return null;
    return (
      <button className="add-item-btn" onClick={onClick}>
        + Add {label}
      </button>
    );
  }, [editMode]);

  // Toggle field button - shows remove button when field has value (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ToggleFieldButton = useMemo(() => ({ hasValue, onToggle, label }) => {
    if (!editMode) return null;
    return hasValue ? (
      <button className="remove-field-btn" onClick={onToggle} title={`Remove ${label}`}>
        × Remove {label}
      </button>
    ) : null;
  }, [editMode]);

  // ========== DYNAMIC CONTENT COMPONENT ==========
  // Handles single content OR array of paragraphs with add/remove (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DynamicContent = useMemo(() => ({ slide, slideIndex, field = 'content', className = '', maxParagraphs = 0, optional = false }) => {
    // Check if it's an array (paragraphs) or single string (content)
    const isArray = Array.isArray(slide[field]);
    const paragraphs = isArray ? slide[field] : (slide[field] ? [slide[field]] : []);
    
    const updateParagraph = (pIndex, value) => {
      if (isArray) {
        const newParagraphs = [...paragraphs];
        newParagraphs[pIndex] = value;
        updateSlide(slideIndex, { [field]: newParagraphs });
      } else {
        updateSlide(slideIndex, { [field]: value });
      }
    };
    
    const addParagraph = () => {
      if (maxParagraphs > 0 && paragraphs.length >= maxParagraphs) return;
      const newParagraphs = isArray ? [...paragraphs, 'New paragraph...'] : [slide[field] || '', 'New paragraph...'];
      updateSlide(slideIndex, { [field]: newParagraphs });
    };
    
    const removeParagraph = (pIndex) => {
      const newParagraphs = paragraphs.filter((_, i) => i !== pIndex);
      // If removing last one and optional, set to empty array
      if (newParagraphs.length === 0 && optional) {
        updateSlide(slideIndex, { [field]: [] });
      } else if (newParagraphs.length === 0) {
        // Keep at least one if not optional
        return;
      } else {
        updateSlide(slideIndex, { [field]: newParagraphs });
      }
    };
    
    // For optional fields, show nothing if empty and not in edit mode
    if (paragraphs.length === 0 && !editMode) return null;
    
    // For optional fields in edit mode with no content, show add button
    if (paragraphs.length === 0 && editMode && optional) {
      return (
        <div className={`dynamic-content ${className}`}>
          <button className="add-paragraph-btn" onClick={addParagraph}>
            + Add Description
          </button>
        </div>
      );
    }
    
    const canAddMore = maxParagraphs === 0 || paragraphs.length < maxParagraphs;
    
    return (
      <div className={`dynamic-content ${className}`}>
        {paragraphs.map((para, pIndex) => (
          <div key={pIndex} className="dynamic-paragraph-wrapper">
            <p className="dynamic-text">
              <EditableField 
                value={para} 
                onChange={(v) => updateParagraph(pIndex, v)} 
                multiline 
              />
            </p>
            {editMode && (paragraphs.length > 1 || optional) && (
              <button 
                className="remove-paragraph-btn" 
                onClick={() => removeParagraph(pIndex)}
                title="Remove paragraph"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {editMode && canAddMore && (
          <button className="add-paragraph-btn" onClick={addParagraph}>
            + Add Paragraph {maxParagraphs > 0 ? `(${paragraphs.length}/${maxParagraphs})` : ''}
          </button>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // ========== DYNAMIC BULLETS COMPONENT ==========
  // Reusable bullet points with optional section title - can be added to any slide (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DynamicBullets = useMemo(() => ({ slide, slideIndex, field = 'bullets', titleField, className = '', maxBullets = 0, label = 'Bullet' }) => {
    // Support both string bullets and { title, text } objects for per-bullet titles
    const rawBullets = Array.isArray(slide[field]) ? slide[field] : [];
    const sectionTitle = titleField ? slide[titleField] : null;
    const hasSectionTitle = sectionTitle !== undefined && sectionTitle !== null && sectionTitle !== '';
    
    const getBulletText = (bullet) => {
      if (typeof bullet === 'object' && bullet !== null) return bullet.text || '';
      return typeof bullet === 'string' ? bullet : String(bullet || '');
    };
    
    const getBulletTitle = (bullet) => {
      if (typeof bullet === 'object' && bullet !== null) return bullet.title || '';
      return '';
    };
    
    const hasBulletTitle = (bullet) => {
      return typeof bullet === 'object' && bullet !== null && bullet.title !== undefined;
    };
    
    const updateBullet = (bIndex, value) => {
      const newBullets = [...rawBullets];
      const current = newBullets[bIndex];
      if (typeof current === 'object' && current !== null) {
        newBullets[bIndex] = { ...current, text: value };
      } else {
        newBullets[bIndex] = value;
      }
      updateSlide(slideIndex, { [field]: newBullets });
    };
    
    const updateBulletTitle = (bIndex, value) => {
      const newBullets = [...rawBullets];
      const current = newBullets[bIndex];
      if (typeof current === 'object' && current !== null) {
        newBullets[bIndex] = { ...current, title: value };
      } else {
        newBullets[bIndex] = { title: value, text: current || '' };
      }
      updateSlide(slideIndex, { [field]: newBullets });
    };
    
    const toggleBulletTitle = (bIndex) => {
      const newBullets = [...rawBullets];
      const current = newBullets[bIndex];
      if (hasBulletTitle(current)) {
        // Remove title, convert back to string
        newBullets[bIndex] = getBulletText(current);
      } else {
        // Add title, convert to object
        newBullets[bIndex] = { title: 'Title', text: getBulletText(current) };
      }
      updateSlide(slideIndex, { [field]: newBullets });
    };
    
    const addBullet = () => {
      if (maxBullets > 0 && rawBullets.length >= maxBullets) return;
      const newBullets = [...rawBullets, 'New bullet point'];
      updateSlide(slideIndex, { [field]: newBullets });
    };
    
    const removeBullet = (bIndex) => {
      const newBullets = rawBullets.filter((_, i) => i !== bIndex);
      updateSlide(slideIndex, { [field]: newBullets });
    };
    
    const toggleSectionTitle = () => {
      if (!titleField) return;
      if (hasSectionTitle) {
        updateSlide(slideIndex, { [titleField]: undefined });
      } else {
        updateSlide(slideIndex, { [titleField]: 'Section Title' });
      }
    };
    
    // If no bullets and not in edit mode, show nothing
    if (rawBullets.length === 0 && !editMode) return null;
    
    // If no bullets and in edit mode, show add button
    if (rawBullets.length === 0 && editMode) {
      return (
        <div className={`dynamic-bullets ${className}`}>
          {titleField && (
            <button className="add-section-title-btn" onClick={toggleSectionTitle}>
              + Add Bullets Title
            </button>
          )}
          <button className="add-bullet-btn" onClick={addBullet}>
            + Add {label}
          </button>
        </div>
      );
    }
    
    const canAddMore = maxBullets === 0 || rawBullets.length < maxBullets;
    
    return (
      <div className={`dynamic-bullets ${className}`}>
        {/* Section Title - optional header for all bullets */}
        {hasSectionTitle && (
          <div className="bullets-section-title">
            <EditableField 
              value={sectionTitle} 
              onChange={(v) => updateSlide(slideIndex, { [titleField]: v })} 
            />
            {editMode && (
              <button 
                className="remove-section-title-btn"
                title="Remove section title"
                onClick={toggleSectionTitle}
              >×</button>
            )}
          </div>
        )}
        {editMode && titleField && !hasSectionTitle && (
          <button 
            className="add-section-title-btn"
            onClick={toggleSectionTitle}
          >
            + Add Bullets Title
          </button>
        )}
        <ul className="bullet-list">
          {rawBullets.map((bullet, bIndex) => (
            <li key={bIndex} className={hasBulletTitle(bullet) ? 'has-title' : ''}>
              {hasBulletTitle(bullet) && (
                <span className="bullet-title">
                  <EditableField 
                    value={getBulletTitle(bullet)} 
                    onChange={(v) => updateBulletTitle(bIndex, v)} 
                  />
                </span>
              )}
              <span className={hasBulletTitle(bullet) ? 'bullet-text' : ''}>
                <EditableField 
                  value={getBulletText(bullet)} 
                  onChange={(v) => updateBullet(bIndex, v)} 
                />
              </span>
              {editMode && (
                <>
                  <button 
                    className="toggle-bullet-title-btn"
                    title={hasBulletTitle(bullet) ? 'Remove bullet title' : 'Add bullet title'}
                    onClick={() => toggleBulletTitle(bIndex)}
                  >{hasBulletTitle(bullet) ? '−' : 'T'}</button>
                  <button 
                    className="remove-bullet-btn"
                    onClick={() => removeBullet(bIndex)}
                  >×</button>
                </>
              )}
            </li>
          ))}
        </ul>
        {editMode && canAddMore && (
          <button className="add-bullet-btn" onClick={addBullet}>
            + Add {label} {maxBullets > 0 ? `(${rawBullets.length}/${maxBullets})` : ''}
          </button>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // ========== DYNAMIC IMAGES COMPONENT ==========
  // Handles single image OR array of images with add/remove and position control (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DynamicImages = useMemo(() => ({ slide, slideIndex, field = 'image', captionField = 'caption', className = '', maxImages = 3 }) => {
    const [activePositionControl, setActivePositionControl] = useState(null);
    
    // Check if it's an array or single string
    const isArray = Array.isArray(slide[field]);
    let images = [];
    
    if (isArray) {
      images = slide[field].map((img, i) => 
        typeof img === 'object' 
          ? { position: 'center center', size: 'large', fit: 'cover', ...img } 
          : { src: img, caption: slide.captions?.[i] || '', position: 'center center', size: 'large', fit: 'cover' }
      );
    } else if (slide[field]) {
      const isVideoVal = slide[`${field}IsVideo`] || false;
      const isGifVal = slide[`${field}IsGif`] || false;
      images = [{ 
        src: slide[field], 
        caption: slide[captionField] || '', 
        isVideo: isVideoVal,
        isGif: isGifVal,
        position: slide.imagePosition || 'center center',
        size: slide.imageSize || 'large',
        fit: slide.imageFit || 'cover'
      }];
    }
    
    // updateImage can take either (imgIndex, field, value) or (imgIndex, fieldsObject)
    const updateImage = (imgIndex, imgFieldOrObj, value) => {
      const updates = typeof imgFieldOrObj === 'object' ? imgFieldOrObj : { [imgFieldOrObj]: value };
      
      if (isArray) {
        const newImages = [...images];
        newImages[imgIndex] = { ...newImages[imgIndex], ...updates };
        updateSlide(slideIndex, { [field]: newImages });
      } else {
        const slideUpdates = {};
        Object.entries(updates).forEach(([key, val]) => {
          if (key === 'src') {
            slideUpdates[field] = val;
          } else if (key === 'caption') {
            slideUpdates[captionField] = val;
          } else if (key === 'position') {
            slideUpdates.imagePosition = val;
          } else if (key === 'size') {
            slideUpdates.imageSize = val;
          } else if (key === 'fit') {
            slideUpdates.imageFit = val;
          } else if (key === 'isVideo') {
            slideUpdates[`${field}IsVideo`] = val;
          } else if (key === 'isGif') {
            slideUpdates[`${field}IsGif`] = val;
          }
        });
        updateSlide(slideIndex, slideUpdates);
      }
    };
    
    // File picker for image/video upload
    const handleDynamicImageUpload = (imgIndex) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/mp4,video/webm,.gif';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const isVideo = file.type.startsWith('video/');
          const isGif = file.type === 'image/gif';
          
          // File size limits (in MB)
          const maxVideoSize = 10; // 10MB for videos
          const maxGifSize = 40; // 40MB for GIFs
          const maxImageSize = 10; // 10MB for images (will be compressed)
          const fileSizeMB = file.size / (1024 * 1024);
          
          if (isVideo && fileSizeMB > maxVideoSize) {
            alert(`Video file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxVideoSize}MB. Please use a smaller video or compress it first.`);
            return;
          }
          if (isGif && fileSizeMB > maxGifSize) {
            alert(`GIF file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxGifSize}MB. Please use a smaller GIF.`);
            return;
          }
          if (!isVideo && !isGif && fileSizeMB > maxImageSize) {
            alert(`Image file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxImageSize}MB.`);
            return;
          }
          
          const reader = new FileReader();
          reader.onerror = () => {
            alert('Error reading file. Please try again.');
          };
          reader.onload = async (event) => {
            try {
              const dataUrl = event.target.result;
              
              // Don't compress videos or GIFs - update src, isVideo, isGif in single call
              if (isVideo || isGif) {
                updateImage(imgIndex, { src: dataUrl, isVideo: isVideo, isGif: isGif });
              } else {
                try {
                  const compressed = await compressImage(dataUrl);
                  updateImage(imgIndex, { src: compressed, isVideo: false });
                } catch (err) {
                  console.error('Error compressing image:', err);
                  updateImage(imgIndex, { src: dataUrl, isVideo: false });
                }
              }
            } catch (err) {
              console.error('Error processing file:', err);
              alert('Error processing file. Please try a smaller file.');
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };
    
    const addImage = () => {
      const newImages = isArray 
        ? [...images, { src: '', caption: '', position: 'center center', size: 'large' }] 
        : [
            { src: slide[field] || '', caption: slide[captionField] || '', position: slide.imagePosition || 'center center', size: slide.imageSize || 'large' }, 
            { src: '', caption: '', position: 'center center', size: 'large' }
          ];
      updateSlide(slideIndex, { [field]: newImages });
    };
    
    const removeImage = (imgIndex) => {
      if (images.length <= 1) return;
      const newImages = images.filter((_, i) => i !== imgIndex);
      updateSlide(slideIndex, { [field]: newImages });
    };
    
    // Position presets
    const positionPresets = [
      { label: '↖', value: 'left top', title: 'Top Left' },
      { label: '↑', value: 'center top', title: 'Top Center' },
      { label: '↗', value: 'right top', title: 'Top Right' },
      { label: '←', value: 'left center', title: 'Center Left' },
      { label: '•', value: 'center center', title: 'Center' },
      { label: '→', value: 'right center', title: 'Center Right' },
      { label: '↙', value: 'left bottom', title: 'Bottom Left' },
      { label: '↓', value: 'center bottom', title: 'Bottom Center' },
      { label: '↘', value: 'right bottom', title: 'Bottom Right' },
    ];
    
    if (images.length === 0 && !editMode) return null;
    
    const imageCount = images.length;
    const gridCols = slide.gridCols || (imageCount >= 3 ? 3 : imageCount >= 2 ? 2 : 1);
    
    return (
      <div className={`dynamic-images images-count-${imageCount} ${className}`}>
        {editMode && imageCount >= 2 && (
          <div className="dynamic-grid-control">
            <span className="dynamic-grid-label">Grid</span>
            <div className="dynamic-grid-buttons">
              {[1, 2, 3].map(cols => (
                <button
                  key={cols}
                  className={`dynamic-grid-btn ${gridCols === cols ? 'active' : ''}`}
                  onClick={() => updateSlide(slideIndex, { gridCols: cols })}
                  title={`${cols} column${cols > 1 ? 's' : ''}`}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="dynamic-images-grid" style={imageCount >= 2 ? { gridTemplateColumns: `repeat(${gridCols}, 1fr)` } : undefined}>
          {images.map((img, imgIndex) => {
            const position = img.position || 'center center';
            const imgSize = img.size || 'large';
            const imgFit = img.fit || 'cover';
            
            // Size presets
            const sizePresets = [
              { label: 'S', value: 'small', title: 'Small' },
              { label: 'M', value: 'medium', title: 'Medium' },
              { label: 'L', value: 'large', title: 'Large (Full)' },
            ];
            
            // Fit presets
            const fitPresets = [
              { label: 'Fill', value: 'cover', title: 'Fill - image covers entire area (may crop)' },
              { label: 'Fit', value: 'contain', title: 'Fit - shows entire image (may have gaps)' },
            ];
            
            const isContain = imgFit === 'contain';
            // Inline styles for contain mode to guarantee no dark background/radius
            const wrapperContainStyle = isContain ? {
              background: 'transparent',
              borderRadius: 0,
              overflow: 'visible',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } : {};
            const mediaContainStyle = isContain ? {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '12px',
              objectPosition: position,
              objectFit: imgFit,
            } : { objectPosition: position, objectFit: imgFit };
            
            return (
              <div 
                key={imgIndex} 
                className={`dynamic-image-item img-size-${imgSize} img-fit-${imgFit}`}
              >
                <div 
                  className={`dynamic-image-wrapper ${!editMode && img.src ? 'clickable' : ''}`}
                  style={wrapperContainStyle}
                  onClick={() => {
                    if (editMode && !activePositionControl) {
                      handleDynamicImageUpload(imgIndex);
                    } else if (!editMode && img.src) {
                      setLightboxImage(img.src);
                    }
                  }}
                >
                  {img.src ? (
                    <>
                      {img.isVideo ? (
                        <video 
                          src={img.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={mediaContainStyle}
                        />
                      ) : (
                        <img 
                          src={img.src} 
                          alt={img.caption || `Image ${imgIndex + 1}`} 
                          style={mediaContainStyle}
                        />
                      )}
                      {editMode && <div className="image-edit-overlay">Click to change</div>}
                      {!editMode && !img.isVideo && !img.isGif && <div className="image-zoom-hint">🔍</div>}
                      
                      {/* Fill / Fit control - visible for video and GIF */}
                      {editMode && (img.isVideo || img.isGif) && (
                        <div className="media-fit-inline" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`fit-inline-btn ${imgFit === 'cover' ? 'active' : ''}`}
                            onClick={() => updateImage(imgIndex, 'fit', 'cover')}
                            title="Fill - covers entire area (may crop)"
                          >
                            Fill
                          </button>
                          <button
                            type="button"
                            className={`fit-inline-btn ${imgFit === 'contain' ? 'active' : ''}`}
                            onClick={() => updateImage(imgIndex, 'fit', 'contain')}
                            title="Fit - shows entire media (may have gaps)"
                          >
                            Fit
                          </button>
                        </div>
                      )}
                      
                      {/* Image Controls Button - inside wrapper */}
                      {editMode && (
                        <div className="image-position-control">
                          <button 
                            className="position-toggle-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePositionControl(activePositionControl === imgIndex ? null : imgIndex);
                            }}
                            title="Adjust media settings"
                          >
                            ⊞
                          </button>
                        </div>
                      )}
                      
                      {/* Image Settings Panel */}
                      {editMode && activePositionControl === imgIndex && (
                        <div 
                          className="position-grid-overlay"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePositionControl(null);
                          }}
                        >
                          <div className="image-settings-panel" onClick={(e) => e.stopPropagation()}>
                            {/* Focus Position */}
                            <div className="settings-section">
                              <span className="settings-section-title">Focus Point</span>
                              <div className="position-grid-buttons">
                                {positionPresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    className={`position-btn ${position === preset.value ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'position', preset.value)}
                                    title={preset.title}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Size Control */}
                            <div className="settings-section">
                              <span className="settings-section-title">Image Size</span>
                              <div className="size-presets-row">
                                {sizePresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    className={`size-preset-btn ${imgSize === preset.value ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'size', preset.value)}
                                    title={preset.title}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Fit Control */}
                            <div className="settings-section">
                              <span className="settings-section-title">Image Fit</span>
                              <div className="fit-presets-row">
                                {fitPresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    className={`fit-preset-btn ${imgFit === preset.value ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'fit', preset.value)}
                                    title={preset.title}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <button 
                              className="settings-done-btn"
                              onClick={() => setActivePositionControl(null)}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="image-placeholder">{editMode ? 'Click to add image' : ''}</div>
                  )}
                </div>
                
                {(img.caption || editMode) && (
                  <div className="dynamic-image-caption-wrapper">
                    <span className="dynamic-image-caption">
                      <EditableField 
                        value={img.caption || ''} 
                        onChange={(v) => updateImage(imgIndex, 'caption', v)} 
                        placeholder="Add caption..."
                      />
                    </span>
                    {editMode && img.caption && (
                      <button 
                        className="remove-caption-btn" 
                        onClick={(e) => { e.stopPropagation(); updateImage(imgIndex, 'caption', ''); }}
                        title="Remove caption"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                {editMode && images.length > 1 && (
                  <button 
                    className="remove-dynamic-image-btn" 
                    onClick={(e) => { e.stopPropagation(); removeImage(imgIndex); }}
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {editMode && images.length < maxImages && (
          <button className="add-dynamic-image-btn" onClick={addImage}>
            + Add Image ({images.length}/{maxImages})
          </button>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // ========== SPLIT RATIO CONTROL ==========
  // Allows adjusting the width ratio between text and images in split layouts (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const SplitRatioControl = useMemo(() => ({ slide, slideIndex }) => {
    if (!editMode) return null;
    
    const ratio = slide.splitRatio || 50; // Default 50/50
    
    const handleRatioChange = (newRatio) => {
      updateSlide(slideIndex, { splitRatio: newRatio });
    };
    
    const presets = [
      { label: '30/70', value: 30 },
      { label: '40/60', value: 40 },
      { label: '50/50', value: 50 },
      { label: '60/40', value: 60 },
      { label: '70/30', value: 70 },
    ];
    
    return (
      <div className="split-ratio-control">
        <span className="ratio-label">Layout ratio:</span>
        <div className="ratio-presets">
          {presets.map(preset => (
            <button
              key={preset.value}
              className={`ratio-preset ${ratio === preset.value ? 'active' : ''}`}
              onClick={() => handleRatioChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="20"
          max="80"
          value={ratio}
          onChange={(e) => handleRatioChange(parseInt(e.target.value))}
          className="ratio-slider"
        />
        <span className="ratio-value">{ratio}% / {100 - ratio}%</span>
      </div>
    );
  }, [editMode, updateSlide]);

  // Helper to get split grid style based on ratio
  const getSplitStyle = (slide) => {
    const ratio = slide.splitRatio || 50;
    return {
      gridTemplateColumns: `${ratio}fr ${100 - ratio}fr`
    };
  };

  // CTA Editor Component (memoized for stable identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const SlideCta = useMemo(() => ({ slide, index }) => {
    const hasCta = slide.cta && (slide.cta.text || slide.cta.link);
    
    if (!editMode && !hasCta) return null;
    
    const toggleCta = () => {
      if (hasCta) {
        updateSlide(index, { cta: null });
      } else {
        updateSlide(index, { cta: { text: 'Learn More', link: '#' } });
      }
    };
    
    if (editMode && !hasCta) {
      return (
        <div className="slide-cta-editor">
          <button className="add-cta-btn" onClick={toggleCta}>
            + Add CTA Button
          </button>
        </div>
      );
    }
    
    return (
      <div className="slide-cta">
        {editMode ? (
          <div className="slide-cta-editor">
            <div className="cta-inputs">
              <input
                type="text"
                className="editable-field"
                placeholder="Button text"
                value={slide.cta?.text || ''}
                onChange={(e) => updateSlide(index, { cta: { ...slide.cta, text: e.target.value } })}
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                className="editable-field"
                placeholder="Link URL"
                value={slide.cta?.link || ''}
                onChange={(e) => updateSlide(index, { cta: { ...slide.cta, link: e.target.value } })}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <button className="remove-cta-btn" onClick={toggleCta}>×</button>
          </div>
        ) : (
          <a href={slide.cta?.link} className="slide-cta-button" target="_blank" rel="noopener noreferrer">
            {slide.cta?.text}
            <span className="cta-arrow">→</span>
          </a>
        )}
      </div>
    );
  }, [editMode, updateSlide]);

  // Image/video upload handler
  const handleImageUpload = (slideIndex, field = 'image') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/mp4,video/webm,.gif';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const isVideo = file.type.startsWith('video/');
        const isGif = file.type === 'image/gif';
        
        // File size limits (in MB)
        const maxVideoSize = 10;
        const maxGifSize = 40;
        const maxImageSize = 10;
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (isVideo && fileSizeMB > maxVideoSize) {
          alert(`Video file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxVideoSize}MB. Please use a smaller video or compress it first.`);
          return;
        }
        if (isGif && fileSizeMB > maxGifSize) {
          alert(`GIF file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxGifSize}MB. Please use a smaller GIF.`);
          return;
        }
        if (!isVideo && !isGif && fileSizeMB > maxImageSize) {
          alert(`Image file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxImageSize}MB.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onerror = () => {
          alert('Error reading file. Please try again.');
        };
        reader.onload = async (event) => {
          try {
            const dataUrl = event.target.result;
            
            // Don't compress videos or GIFs
            if (isVideo || isGif) {
              updateSlide(slideIndex, { [field]: dataUrl, [`${field}IsVideo`]: isVideo, [`${field}IsGif`]: isGif });
            } else {
              try {
                const compressed = await compressImage(dataUrl);
                updateSlide(slideIndex, { [field]: compressed, [`${field}IsVideo`]: false, [`${field}IsGif`]: false });
              } catch (err) {
                console.error('Error compressing image:', err);
                updateSlide(slideIndex, { [field]: dataUrl, [`${field}IsGif`]: false });
              }
            }
          } catch (err) {
            console.error('Error processing file:', err);
            alert('Error processing file. Please try a smaller file.');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderSlide = (slide, index) => {
    const slideControls = editMode && (
      <div className="slide-edit-controls">
        <button onClick={() => moveSlide(index, -1)} disabled={index === 0}>↑</button>
        <button onClick={() => moveSlide(index, 1)} disabled={index === totalSlides - 1}>↓</button>
        <button onClick={() => deleteSlide(index)} className="delete">×</button>
        <button onClick={() => setShowTemplates(true)} className="add">+</button>
      </div>
    );

    switch (slide.type) {
      case 'intro':
        return (
          <div className="slide slide-intro" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-intro-layout" style={getSplitStyle(slide)}>
              <div className="intro-content">
                <OptionalField slide={slide} index={index} field="label" label="Section Label" defaultValue="Introduction">
                  <span className="slide-label">
                    <EditableField
                      value={slide.label}
                      onChange={(v) => updateSlide(index, { label: v })}
                    />
                  </span>
                </OptionalField>
                {(slide.logo || editMode) && (
                  <div className="intro-logo">
                    <div
                      className="intro-logo-wrapper"
                      onClick={() => editMode && handleImageUpload(index, 'logo')}
                    >
                      {slide.logo ? (
                        <>
                          <img src={slide.logo} alt="Logo" />
                          {editMode && <div className="image-edit-overlay">Click to change</div>}
                        </>
                      ) : (
                        <div className="image-placeholder">{editMode ? 'Click to add logo' : ''}</div>
                      )}
                    </div>
                    {editMode && slide.logo && (
                      <button
                        type="button"
                        className="remove-logo-btn"
                        onClick={(e) => { e.stopPropagation(); updateSlide(index, { logo: '' }); }}
                      >
                        × Remove logo
                      </button>
                    )}
                  </div>
                )}
                <h1 className="intro-title">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                    multiline
                  />
                </h1>
                {(slide.subtitle || editMode) && (
                  <p className="intro-subtitle">
                    <EditableField
                      value={slide.subtitle || ''}
                      onChange={(v) => updateSlide(index, { subtitle: v })}
                    />
                    {editMode && (
                      <button
                        type="button"
                        className="toggle-subtitle-btn"
                        onClick={() => updateSlide(index, { subtitle: slide.subtitle ? '' : 'Add a subtitle' })}
                      >
                        {slide.subtitle ? '× Remove subtitle' : '+ Add subtitle'}
                      </button>
                    )}
                  </p>
                )}
                <p className="intro-description">
                  <EditableField
                    value={slide.description}
                    onChange={(v) => updateSlide(index, { description: v })}
                    multiline
                  />
                </p>
                
                {/* Client & Focus Info Row */}
                <div className="intro-meta-row">
                  <div className="intro-meta-item">
                    <span className="intro-meta-label">
                      <EditableField
                        value={slide.clientLabel || 'Client'}
                        onChange={(v) => updateSlide(index, { clientLabel: v })}
                      />
                    </span>
                    <span className="intro-meta-value">
                      <EditableField
                        value={slide.client || 'Client Name'}
                        onChange={(v) => updateSlide(index, { client: v })}
                      />
                    </span>
                  </div>
                  <div className="intro-meta-item">
                    <span className="intro-meta-label">
                      <EditableField
                        value={slide.focusLabel || 'Focus'}
                        onChange={(v) => updateSlide(index, { focusLabel: v })}
                      />
                    </span>
                    <span className="intro-meta-value">
                      <EditableField
                        value={slide.focus || 'Project Focus'}
                        onChange={(v) => updateSlide(index, { focus: v })}
                      />
                    </span>
                  </div>
                </div>
                <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="intro-bullets" label="Bullet" />
                <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
              </div>
              
              {/* Image */}
              <DynamicImages slide={slide} slideIndex={index} field="image" className="intro-images-wrapper" />
            </div>
          </div>
        );
      
      case 'info':
        return (
          <div className="slide slide-info" key={index}>
            {slideControls}
            <div className="slide-inner">
              <OptionalField slide={slide} index={index} field="label" label="Section Label" defaultValue="Project Info">
                <span className="slide-label">
                  <EditableField
                    value={slide.label}
                    onChange={(v) => updateSlide(index, { label: v })}
                  />
                </span>
              </OptionalField>
              <h2 className="info-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              {slide.items?.length > 0 && (
              <div className="info-grid">
                {slide.items.map((item, i) => (
                  <div key={i} className="info-item">
                      <span className="info-label">
                        <EditableField
                          value={item.label}
                          onChange={(v) => updateSlideItem(index, 'items', i, { ...item, label: v })}
                        />
                      </span>
                      <span className="info-value">
                        <EditableField
                          value={item.value}
                          onChange={(v) => updateSlideItem(index, 'items', i, { ...item, value: v })}
                        />
                      </span>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'items', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'items', { label: 'Label', value: 'Value' })}
                label="Info Item"
              />
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="info-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="info-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="slide slide-text" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="text-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="content" className="text-content-wrapper" />
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="text-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="text-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
              <SlideCta slide={slide} index={index} />
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="slide slide-image" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="image-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="image-description-wrapper" maxParagraphs={3} optional />
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="image-bullets-wrapper" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="image-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
              <DynamicImages slide={slide} slideIndex={index} field="image" captionField="caption" className="image-gallery-wrapper" />
            </div>
          </div>
        );

      case 'projectShowcase':
        return (
          <div className="slide slide-project-showcase" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner">
              <div className="project-showcase-layout" style={getSplitStyle(slide)}>
                {/* Left Panel - Info (centered vertically when no number) */}
                <div className={`project-showcase-info${!slide.slideNumber ? ' project-showcase-info--no-number' : ''}`}>
                  {(slide.slideNumber || editMode) && (
                    <div className="project-showcase-number-wrapper">
                      {slide.slideNumber ? (
                        <div className="project-showcase-number">
                          <EditableField
                            value={slide.slideNumber}
                            onChange={(v) => updateSlide(index, { slideNumber: v })}
                          />
                        </div>
                      ) : null}
                      {editMode && (
                        <button
                          className="toggle-number-btn"
                          onClick={() => updateSlide(index, { slideNumber: slide.slideNumber ? '' : '01' })}
                        >
                          {slide.slideNumber ? '× Remove' : '+ Add Number'}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Header mode: Title only | Logo only (logo in title position) | Title + Logo */}
                  {editMode && (
                    <div className="project-showcase-header-mode">
                      <span className="project-showcase-header-mode-label">Header:</span>
                      <div className="project-showcase-header-mode-btns">
                        <button
                          type="button"
                          className={`header-mode-btn ${(slide.projectShowcaseHeader || 'both') === 'title' ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { projectShowcaseHeader: 'title' })}
                          title="Show title only"
                        >
                          Title only
                        </button>
                        <button
                          type="button"
                          className={`header-mode-btn ${(slide.projectShowcaseHeader || 'both') === 'logo' ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { projectShowcaseHeader: 'logo' })}
                          title="Show logo in title position (instead of title)"
                        >
                          Logo only
                        </button>
                        <button
                          type="button"
                          className={`header-mode-btn ${(slide.projectShowcaseHeader || 'both') === 'both' ? 'active' : ''}`}
                          onClick={() => updateSlide(index, { projectShowcaseHeader: 'both' })}
                          title="Show title and logo (title on top, logo below)"
                        >
                          Title + Logo
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Logo in title position (when "Logo only" is selected) */}
                  {(slide.projectShowcaseHeader || 'both') === 'logo' && (slide.logo || editMode) && (
                    <div className="project-showcase-logo project-showcase-logo-in-title-position">
                      <div
                        className="project-logo-wrapper"
                        onClick={() => editMode && handleImageUpload(index, 'logo')}
                      >
                        {slide.logo ? (
                          <>
                            <img src={slide.logo} alt="Logo" />
                            {editMode && <div className="image-edit-overlay">Click to change</div>}
                          </>
                        ) : (
                          <div className="image-placeholder">{editMode ? 'Click to add logo' : ''}</div>
                        )}
                      </div>
                      {editMode && slide.logo && (
                        <button
                          type="button"
                          className="remove-logo-btn project-showcase-remove-logo"
                          onClick={(e) => { e.stopPropagation(); updateSlide(index, { logo: '' }); }}
                        >
                          × Remove logo
                        </button>
                      )}
                    </div>
                  )}
                  {((slide.projectShowcaseHeader || 'both') === 'both' || (slide.projectShowcaseHeader || 'both') === 'title') && (slide.title || editMode) && (
                    <h2 className="project-showcase-title">
                      <EditableField
                        value={slide.title}
                        onChange={(v) => updateSlide(index, { title: v })}
                      />
                      {editMode && slide.title && (
                        <button
                          type="button"
                          className="remove-title-btn project-showcase-remove-title"
                          onClick={() => updateSlide(index, { title: '' })}
                          title="Remove title"
                        >
                          × Remove title
                        </button>
                      )}
                    </h2>
                  )}
                  {(slide.subtitle || editMode) && (
                    <p className="project-showcase-subtitle">
                      <EditableField
                        value={slide.subtitle || ''}
                        onChange={(v) => updateSlide(index, { subtitle: v })}
                      />
                      {editMode && (
                        <button
                          type="button"
                          className="toggle-subtitle-btn"
                          onClick={() => updateSlide(index, { subtitle: slide.subtitle ? '' : 'Add a subtitle' })}
                        >
                          {slide.subtitle ? '× Remove subtitle' : '+ Add subtitle'}
                        </button>
                      )}
                    </p>
                  )}
                  <p className="project-showcase-description">
                    <EditableField
                      value={slide.description}
                      onChange={(v) => updateSlide(index, { description: v })}
                      multiline
                    />
                  </p>
                  <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="project-showcase-bullets" label="Bullet" />
                  {(slide.tags?.length > 0 || editMode) && (
                    <div className="project-showcase-tags">
                      {(slide.tags || []).map((tag, i) => (
                        <span key={i} className="project-showcase-tag">
                          <EditableField
                            value={tag}
                            onChange={(v) => {
                              const tags = [...(slide.tags || [])];
                              tags[i] = v;
                              updateSlide(index, { tags });
                            }}
                          />
                          {editMode && slide.tags.length > 1 && (
                            <button
                              className="remove-tag-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const tags = slide.tags.filter((_, idx) => idx !== i);
                                updateSlide(index, { tags });
                              }}
                            >
                              ×
                            </button>
                          )}
                          {i < slide.tags.length - 1 && <span className="tag-separator"> • </span>}
                        </span>
                      ))}
                      {editMode && (
                        <button
                          className="add-tag-btn"
                          onClick={() => {
                            const tags = [...(slide.tags || []), 'New Tag'];
                            updateSlide(index, { tags });
                          }}
                        >
                          + Add Tag
                        </button>
                      )}
                    </div>
                  )}
                  {/* Logo at bottom (when "Title + Logo" is selected) */}
                  {(slide.projectShowcaseHeader || 'both') === 'both' && (slide.logo || editMode) && (
                    <div className="project-showcase-logo">
                      <div
                        className="project-logo-wrapper"
                        onClick={() => editMode && handleImageUpload(index, 'logo')}
                      >
                        {slide.logo ? (
                          <>
                            <img src={slide.logo} alt="Logo" />
                            {editMode && <div className="image-edit-overlay">Click to change</div>}
                          </>
                        ) : (
                          <div className="image-placeholder">{editMode ? 'Click to add logo' : ''}</div>
                        )}
                      </div>
                      {editMode && slide.logo && (
                        <button
                          type="button"
                          className="remove-logo-btn project-showcase-remove-logo"
                          onClick={(e) => { e.stopPropagation(); updateSlide(index, { logo: '' }); }}
                        >
                          × Remove logo
                        </button>
                      )}
                    </div>
                  )}
                  <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                    <div className="project-showcase-highlight">
                      <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                    </div>
                  </OptionalField>
                </div>
                {/* Right Panel - Image */}
                <div className="project-showcase-visual">
                  <DynamicImages slide={slide} slideIndex={index} field="image" className="project-showcase-dynamic" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'goalsShowcase':
        return (
          <div className="slide slide-goals-showcase" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner">
              <div className="goals-showcase-layout" style={getSplitStyle(slide)}>
                {/* Left Panel - Info */}
                <div className="goals-showcase-info">
                  {(slide.slideNumber || editMode) && (
                    <div className="goals-showcase-number-wrapper">
                      {slide.slideNumber ? (
                        <div className="goals-showcase-number">
                          <EditableField
                            value={slide.slideNumber}
                            onChange={(v) => updateSlide(index, { slideNumber: v })}
                          />
                        </div>
                      ) : null}
                      {editMode && (
                        <button
                          className="toggle-number-btn"
                          onClick={() => updateSlide(index, { slideNumber: slide.slideNumber ? '' : '01' })}
                        >
                          {slide.slideNumber ? '× Remove' : '+ Add Number'}
                        </button>
                      )}
                    </div>
                  )}
                  <h2 className="goals-showcase-title">
                    <EditableField
                      value={slide.title}
                      onChange={(v) => updateSlide(index, { title: v })}
                    />
                  </h2>
                  {(slide.description || editMode) && (
                    <div className="goals-showcase-description-wrapper">
                      {slide.description ? (
                        <p className="goals-showcase-description">
                          <EditableField
                            value={slide.description}
                            onChange={(v) => updateSlide(index, { description: v })}
                            multiline
                          />
                        </p>
                      ) : null}
                      {editMode && (
                        <button
                          className="toggle-description-btn"
                          onClick={() => updateSlide(index, { description: slide.description ? '' : 'Add a description here.' })}
                        >
                          {slide.description ? '× Remove Description' : '+ Add Description'}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Goals List */}
                  <div className="goals-showcase-goals">
                    {(slide.goals || []).map((goal, i) => (
                      <div key={i} className="goal-item">
                        <span className="goal-number">{String(i + 1).padStart(2, '0')}</span>
                        <div className="goal-content">
                          <h3 className="goal-title">
                            <EditableField
                              value={goal.title}
                              onChange={(v) => {
                                const goals = [...(slide.goals || [])];
                                goals[i] = { ...goals[i], title: v };
                                updateSlide(index, { goals });
                              }}
                            />
                          </h3>
                          <p className="goal-description">
                            <EditableField
                              value={goal.description}
                              onChange={(v) => {
                                const goals = [...(slide.goals || [])];
                                goals[i] = { ...goals[i], description: v };
                                updateSlide(index, { goals });
                              }}
                              multiline
                            />
                          </p>
                        </div>
                        {editMode && slide.goals?.length > 1 && (
                          <button
                            className="remove-goal-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const goals = slide.goals.filter((_, idx) => idx !== i);
                              updateSlide(index, { goals });
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {editMode && (
                      <button
                        className="add-goal-btn"
                        onClick={() => {
                          const goals = [...(slide.goals || []), { title: 'New Goal', description: 'Goal description' }];
                          updateSlide(index, { goals });
                        }}
                      >
                        + Add Goal
                      </button>
                    )}
                  </div>
                  <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                    <div className="goals-showcase-highlight">
                      <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                    </div>
                  </OptionalField>
                </div>
                {/* Right Panel - Image */}
                <div className="goals-showcase-visual">
                  <DynamicImages slide={slide} slideIndex={index} field="image" className="goals-showcase-dynamic" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'stats':
      case 'results':
        return (
          <div className={`slide slide-stats ${slide.type === 'results' ? 'results' : ''}`} key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="stats-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="stats-description-wrapper" maxParagraphs={3} optional />
              {slide.stats?.length > 0 && (
              <div className="stats-grid">
                {slide.stats.map((stat, i) => (
                  <div key={i} className="stat-item">
                    <span className="stat-value" style={{ '--color': project.color }}>
                        <EditableField
                          value={stat.value}
                          onChange={(v) => updateSlideItem(index, 'stats', i, { ...stat, value: v })}
                        />
                      {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                    </span>
                      <span className="stat-label">
                        <EditableField
                          value={stat.label}
                          onChange={(v) => updateSlideItem(index, 'stats', i, { ...stat, label: v })}
                        />
                      </span>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'stats', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'stats', { value: '0%', label: 'New metric' })}
                label="Stat"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="stats-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'context':
        return (
          <div className="slide slide-context" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-split" style={getSplitStyle(slide)}>
              <div className="split-content">
                <span className="slide-label">
                  <EditableField
                    value={slide.label}
                    onChange={(v) => updateSlide(index, { label: v })}
                  />
                </span>
                <h2 className="context-title">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                  />
                </h2>
                <DynamicContent slide={slide} slideIndex={index} field="content" className="context-text-wrapper" />
                <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="context-bullets" label="Bullet" />
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlight..." multiline>
                  <p className="context-highlight">
                    <EditableField
                      value={slide.highlight}
                      onChange={(v) => updateSlide(index, { highlight: v })}
                      multiline
                    />
                  </p>
                </OptionalField>
              </div>
              <DynamicImages slide={slide} slideIndex={index} field="image" className="split-images-wrapper" />
            </div>
          </div>
        );

      case 'problem':
        return (
          <div className="slide slide-problem" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-split" style={getSplitStyle(slide)}>
              <div className="split-content">
                <span className="slide-label">
                  <EditableField
                    value={slide.label}
                    onChange={(v) => updateSlide(index, { label: v })}
                  />
                </span>
                <h2 className="problem-title">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                  />
                </h2>
                <DynamicContent slide={slide} slideIndex={index} field="content" className="problem-text-wrapper" />
                <DynamicBullets slide={slide} slideIndex={index} field="issues" titleField="issuesTitle" className="problem-issues-wrapper" label="Issue" />
                <OptionalField slide={slide} index={index} field="conclusion" label="Conclusion" defaultValue="Add conclusion...">
                  <p className="problem-conclusion">
                    <EditableField
                      value={slide.conclusion}
                      onChange={(v) => updateSlide(index, { conclusion: v })}
                    />
                  </p>
                </OptionalField>
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                  <div className="problem-highlight">
                    <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                  </div>
                </OptionalField>
              </div>
              <DynamicImages slide={slide} slideIndex={index} field="image" className="split-images-wrapper" />
            </div>
          </div>
        );

      case 'quotes':
        return (
          <div className="slide slide-quotes" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="quotes-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              <OptionalField slide={slide} index={index} field="content" label="Description" defaultValue="Add description..." multiline>
                <p className="quotes-intro">
                  <EditableField
                    value={slide.content}
                    onChange={(v) => updateSlide(index, { content: v })}
                    multiline
                  />
                </p>
              </OptionalField>
              {/* Grid Layout Control */}
              {editMode && (
                <div className="grid-layout-control">
                  <span className="grid-control-label">Grid Columns:</span>
                  <div className="grid-control-buttons">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        className={`grid-col-btn ${(slide.gridColumns || 3) === cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: cols })}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slide.quotes?.length > 0 && (
              <div className="quotes-grid" style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 3}, 1fr)` }}>
                {slide.quotes.map((quote, i) => (
                  <div key={i} className="quote-card">
                      <p className="quote-text">
                        "<EditableField
                          value={quote.text}
                          onChange={(v) => updateSlideItem(index, 'quotes', i, { ...quote, text: v })}
                        />"
                      </p>
                      <span className="quote-author">
                        <EditableField
                          value={quote.author}
                          onChange={(v) => updateSlideItem(index, 'quotes', i, { ...quote, author: v })}
                        />
                      </span>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'quotes', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'quotes', { text: 'New quote...', author: 'User Name' })}
                label="Quote"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="quotes-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="slide slide-goals" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="goals-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="goals-description-wrapper" maxParagraphs={3} optional />
              
              {/* Grid Layout Control */}
              {editMode && (
                <div className="grid-layout-control">
                  <span className="grid-control-label">Grid Columns:</span>
                  <div className="grid-control-buttons">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        className={`grid-col-btn ${(slide.gridColumns || 2) === cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: cols })}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Goals cards section - can be removed in edit mode */}
              {slide.showGoalsSection !== false ? (
                <div className="goals-cards-section-wrapper">
                  {editMode && (
                    <button
                      type="button"
                      className="remove-section-btn remove-goals-section-btn"
                      onClick={() => updateSlide(index, { showGoalsSection: false })}
                      title="Remove goals section"
                    >
                      ×
                    </button>
                  )}
                  {slide.goals?.length > 0 && (
                    <div
                      className="goals-grid"
                      style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 2}, 1fr)` }}
                    >
                      {slide.goals.map((goal, i) => (
                        <div key={i} className="goal-item">
                          <span className="goal-number">{i + 1}</span>
                          <div className="goal-content">
                            <span className="goal-title-text">
                              <EditableField
                                value={goal.title}
                                onChange={(v) => updateSlideItem(index, 'goals', i, { ...goal, title: v })}
                              />
                            </span>
                            {(goal.description || editMode) && (
                              <span className="goal-description">
                                <EditableField
                                  value={goal.description || ''}
                                  onChange={(v) => updateSlideItem(index, 'goals', i, { ...goal, description: v })}
                                />
                              </span>
                            )}
                          </div>
                          <ArrayItemControls onRemove={() => removeArrayItem(index, 'goals', i)} />
                        </div>
                      ))}
                    </div>
                  )}
                  <AddItemButton
                    onClick={() => addArrayItem(index, 'goals', { number: String(slide.goals?.length + 1 || 1), title: 'New Goal', description: '' })}
                    label="Goal"
                  />
                </div>
              ) : editMode ? (
                <button
                  type="button"
                  className="add-section-btn add-goals-section-btn"
                  onClick={() => updateSlide(index, { showGoalsSection: true })}
                >
                  + Add goals section
                </button>
              ) : null}

              {/* KPIs section - can be removed in edit mode */}
              {slide.showKpisSection !== false ? (
                <div className="kpis-section-wrapper">
                  {editMode && (
                    <button
                      type="button"
                      className="remove-section-btn remove-kpis-section-btn"
                      onClick={() => updateSlide(index, { showKpisSection: false })}
                      title="Remove KPIs section"
                    >
                      ×
                    </button>
                  )}
                  {slide.kpis?.length > 0 && (
                    <div className="kpis-section">
                      <span className="kpis-label">KPIs</span>
                      <div className="kpis-grid">
                        {slide.kpis.map((kpi, i) => (
                          <div key={i} className="kpi-card">
                            <EditableField
                              value={kpi}
                              onChange={(v) => updateSlideItem(index, 'kpis', i, v)}
                            />
                            <ArrayItemControls onRemove={() => removeArrayItem(index, 'kpis', i)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <AddItemButton
                    onClick={() => addArrayItem(index, 'kpis', 'New KPI')}
                    label="KPI"
                  />
                </div>
              ) : editMode ? (
                <button
                  type="button"
                  className="add-section-btn add-kpis-section-btn"
                  onClick={() => updateSlide(index, { showKpisSection: true })}
                >
                  + Add KPIs section
                </button>
              ) : null}
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="goals-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'testing':
        return (
          <div className="slide slide-testing" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-split" style={getSplitStyle(slide)}>
              <div className="split-content">
                <span className="slide-label">
                  <EditableField
                    value={slide.label}
                    onChange={(v) => updateSlide(index, { label: v })}
                  />
                </span>
                <h2 className="testing-title">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                  />
                </h2>
                <OptionalField slide={slide} index={index} field="content" label="Description" defaultValue="Add description..." multiline>
                  <p className="testing-text">
                    <EditableField
                      value={slide.content}
                      onChange={(v) => updateSlide(index, { content: v })}
                      multiline
                    />
                  </p>
                </OptionalField>
                <DynamicBullets slide={slide} slideIndex={index} field="layouts" titleField="layoutsTitle" className="testing-options" label="Option" />
                <OptionalField slide={slide} index={index} field="conclusion" label="Conclusion" defaultValue="Add conclusion...">
                  <p className="testing-conclusion">
                    <EditableField
                      value={slide.conclusion}
                      onChange={(v) => updateSlide(index, { conclusion: v })}
                    />
                  </p>
                </OptionalField>
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                  <div className="testing-highlight">
                    <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                  </div>
                </OptionalField>
              </div>
              <DynamicImages slide={slide} slideIndex={index} field="image" className="split-images-wrapper" />
            </div>
          </div>
        );

      case 'outcomes':
        return (
          <div className="slide slide-outcomes" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField
                  value={slide.label}
                  onChange={(v) => updateSlide(index, { label: v })}
                />
              </span>
              <h2 className="outcomes-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              {slide.outcomes?.length > 0 && (
              <div className="outcomes-grid">
                {slide.outcomes.map((outcome, i) => (
                  <div key={i} className="outcome-item">
                      <h3 className="outcome-title">
                        <EditableField
                          value={outcome.title}
                          onChange={(v) => updateSlideItem(index, 'outcomes', i, { ...outcome, title: v })}
                        />
                      </h3>
                      {(outcome.description || editMode) && (
                        <p className="outcome-description">
                          <EditableField
                            value={outcome.description || ''}
                            onChange={(v) => updateSlideItem(index, 'outcomes', i, { ...outcome, description: v })}
                            multiline
                          />
                        </p>
                      )}
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'outcomes', i)} />
                  </div>
                ))}
              </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'outcomes', { title: 'New Outcome', description: '' })}
                label="Outcome"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="outcomes-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
            </div>
          </div>
        );
      
      case 'end':
        return (
          <div className="slide slide-end" key={index}>
            {slideControls}
            <div className="slide-inner">
              <h2 className="end-title">
                <EditableField
                  value={slide.title}
                  onChange={(v) => updateSlide(index, { title: v })}
                />
              </h2>
              <p className="end-subtitle">
                <EditableField
                  value={slide.subtitle}
                  onChange={(v) => updateSlide(index, { subtitle: v })}
                />
              </p>
              <div className="end-cta-group">
                <AnimatedButton 
                  href={slide.buttons?.[0]?.link || "mailto:lior@example.com"}
                  variant="primary"
                  icon="→"
                >
                  {slide.cta || slide.buttons?.[0]?.text || 'Get in touch'}
                </AnimatedButton>
                <AnimatedButton 
                  href={slide.buttons?.[1]?.link || "/"}
                  variant="outline"
                  icon="←"
                >
                  {slide.buttons?.[1]?.text || 'Back to projects'}
                </AnimatedButton>
              </div>
            </div>
          </div>
        );

      // === NEW SLIDE TYPES ===
      
      case 'comparison':
        return (
          <div className="slide slide-comparison" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="comparison-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <div className="comparison-grid">
                <div className="comparison-item">
                  <span className="comparison-label">
                    <EditableField value={slide.beforeLabel} onChange={(v) => updateSlide(index, { beforeLabel: v })} />
                  </span>
                  <DynamicImages slide={slide} slideIndex={index} field="beforeImage" maxImages={1} className="comparison-dynamic" />
                </div>
                <div className="comparison-item">
                  <span className="comparison-label">
                    <EditableField value={slide.afterLabel} onChange={(v) => updateSlide(index, { afterLabel: v })} />
                  </span>
                  <DynamicImages slide={slide} slideIndex={index} field="afterImage" maxImages={1} className="comparison-dynamic" />
                </div>
              </div>
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="comparison-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="comparison-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="slide slide-process" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="process-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <div className="process-steps">
                {slide.steps?.map((step, i) => (
                  <div key={i} className="process-step">
                    <span className="step-number">{step.number}</span>
                    <div className="step-content">
                      <h3 className="step-title">
                        <EditableField value={step.title} onChange={(v) => updateSlideItem(index, 'steps', i, { ...step, title: v })} />
                      </h3>
                      <p className="step-description">
                        <EditableField value={step.description} onChange={(v) => updateSlideItem(index, 'steps', i, { ...step, description: v })} multiline />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <AddItemButton 
                onClick={() => addArrayItem(index, 'steps', { number: String((slide.steps?.length || 0) + 1), title: 'New Step', description: '' })}
                label="Step"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="process-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'feature':
        return (
          <div className="slide slide-feature" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-split" style={getSplitStyle(slide)}>
              <div className="split-content">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
                <h2 className="feature-title">
                  <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
                </h2>
                <DynamicContent slide={slide} slideIndex={index} field="description" className="feature-description-wrapper" />
                <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="feature-bullets-wrapper" label="Bullet" />
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                  <div className="feature-highlight">
                    <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                  </div>
                </OptionalField>
              </div>
              <DynamicImages slide={slide} slideIndex={index} field="image" className="split-images-wrapper" />
            </div>
          </div>
        );

      case 'twoColumn':
        return (
          <div className="slide slide-two-column" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="two-column-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="two-column-description-wrapper" maxParagraphs={2} optional />
              <div className="two-column-grid">
                <div className="column">
                  <h3><EditableField value={slide.leftTitle} onChange={(v) => updateSlide(index, { leftTitle: v })} /></h3>
                  <p><EditableField value={slide.leftContent} onChange={(v) => updateSlide(index, { leftContent: v })} multiline /></p>
                </div>
                <div className="column">
                  <h3><EditableField value={slide.rightTitle} onChange={(v) => updateSlide(index, { rightTitle: v })} /></h3>
                  <p><EditableField value={slide.rightContent} onChange={(v) => updateSlide(index, { rightContent: v })} multiline /></p>
                </div>
              </div>
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="two-column-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="two-column-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="slide slide-timeline" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="timeline-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <div className="timeline-events">
                {slide.events?.map((event, i) => (
                  <div key={i} className="timeline-event">
                    <span className="event-date">
                      <EditableField value={event.date} onChange={(v) => updateSlideItem(index, 'events', i, { ...event, date: v })} />
                    </span>
                    <div className="event-content">
                      <h3><EditableField value={event.title} onChange={(v) => updateSlideItem(index, 'events', i, { ...event, title: v })} /></h3>
                      <p><EditableField value={event.description} onChange={(v) => updateSlideItem(index, 'events', i, { ...event, description: v })} /></p>
                    </div>
                    <ArrayItemControls onRemove={() => removeArrayItem(index, 'events', i)} />
                  </div>
                ))}
              </div>
              <AddItemButton 
                onClick={() => addArrayItem(index, 'events', { date: 'Date', title: 'Event Title', description: '' })}
                label="Event"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="timeline-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="slide slide-testimonial" key={index}>
            {slideControls}
            <div className="slide-inner">
              <OptionalField slide={slide} index={index} field="label" label="Section Label" defaultValue="Testimonial">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
              </OptionalField>
              <blockquote className="testimonial-quote">
                "<EditableField value={slide.quote} onChange={(v) => updateSlide(index, { quote: v })} multiline />"
              </blockquote>
              <div className="testimonial-author">
                <span className="author-name">
                  <EditableField value={slide.author} onChange={(v) => updateSlide(index, { author: v })} />
                </span>
                <span className="author-role">
                  <EditableField value={slide.role} onChange={(v) => updateSlide(index, { role: v })} />
                </span>
              </div>
              <OptionalField slide={slide} index={index} field="context" label="Context" defaultValue="Add context..." multiline>
                <p className="testimonial-context">
                  <EditableField value={slide.context} onChange={(v) => updateSlide(index, { context: v })} multiline />
                </p>
              </OptionalField>
            </div>
          </div>
        );

      case 'insight':
        return (
          <div className="slide slide-insight" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <p className="insight-text">
                <EditableField value={slide.insight} onChange={(v) => updateSlide(index, { insight: v })} multiline />
              </p>
              <OptionalField slide={slide} index={index} field="supporting" label="Supporting Text" defaultValue="Add supporting text..." multiline>
                <p className="insight-supporting">
                  <EditableField value={slide.supporting} onChange={(v) => updateSlide(index, { supporting: v })} multiline />
                </p>
              </OptionalField>
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="insight-bullets" label="Bullet" />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="insight-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'challengeSolution':
        return (
          <div className="slide slide-challenge-solution" key={index}>
            {slideControls}
            <SplitRatioControl slide={slide} slideIndex={index} />
            <div className="slide-inner slide-split" style={getSplitStyle(slide)}>
              <div className="split-content">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
                <h2 className="cs-title">
                  <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
                </h2>
                <div className="cs-block challenge">
                  <h3>Challenge</h3>
                  <p><EditableField value={slide.challenge} onChange={(v) => updateSlide(index, { challenge: v })} multiline /></p>
                </div>
                <div className="cs-block solution">
                  <h3>Solution</h3>
                  <p><EditableField value={slide.solution} onChange={(v) => updateSlide(index, { solution: v })} multiline /></p>
                </div>
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                  <div className="cs-highlight">
                    <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                  </div>
                </OptionalField>
              </div>
              <div className="split-image challenge-solution-image">
                <DynamicImages slide={slide} slideIndex={index} field="image" className="challenge-solution-dynamic" />
              </div>
            </div>
          </div>
        );

      case 'solutionShowcase': {
        return (
          <div className="slide slide-solution-showcase" key={index}>
            {slideControls}
            <div className="slide-inner">
              {/* Header */}
              <div className="showcase-header">
                <span className="slide-label">
                  <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
                </span>
                <h2 className="showcase-title">
                  <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
                </h2>
              </div>
              
              {/* Two Column Images */}
              <div className="showcase-columns">
                {/* Problem/Before Images */}
                <div className="showcase-column problem-column">
                  <DynamicImages slide={slide} slideIndex={index} field="problemImages" className="showcase-dynamic" />
                  
                  {/* Problem Description */}
                  <div className="showcase-description">
                    <span className="showcase-desc-label problem-label">
                      <EditableField value={slide.problemLabel || 'Problem:'} onChange={(v) => updateSlide(index, { problemLabel: v })} />
                    </span>
                    <p className="showcase-desc-text">
                      <EditableField value={slide.problemText} onChange={(v) => updateSlide(index, { problemText: v })} multiline />
                    </p>
                  </div>
                </div>
                
                {/* Solution/After Images */}
                <div className="showcase-column solution-column">
                  <DynamicImages slide={slide} slideIndex={index} field="solutionImages" className="showcase-dynamic" />
                  
                  {/* Solution Description */}
                  <div className="showcase-description">
                    <span className="showcase-desc-label solution-label">
                      <EditableField value={slide.solutionLabel || 'Solution:'} onChange={(v) => updateSlide(index, { solutionLabel: v })} />
                    </span>
                    <DynamicBullets slide={slide} slideIndex={index} field="solutionPoints" titleField="solutionPointsTitle" className="showcase-solution-bullets" label="Point" />
                  </div>
                </div>
              </div>
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="showcase-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );
      }

      case 'tools':
        return (
          <div className="slide slide-tools" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="tools-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <div className="tools-grid">
                {slide.tools?.map((tool, i) => (
                  <div key={i} className="tool-item">
                    <h3><EditableField value={tool.name} onChange={(v) => updateSlideItem(index, 'tools', i, { ...tool, name: v })} /></h3>
                    <p><EditableField value={tool.description} onChange={(v) => updateSlideItem(index, 'tools', i, { ...tool, description: v })} /></p>
                    <ArrayItemControls onRemove={() => removeArrayItem(index, 'tools', i)} />
                  </div>
                ))}
              </div>
              <AddItemButton 
                onClick={() => addArrayItem(index, 'tools', { name: 'New Tool', description: 'Description' })}
                label="Tool"
              />
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="tools-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="slide slide-video" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="video-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="video-description-wrapper" maxParagraphs={2} optional />
              <DynamicBullets slide={slide} slideIndex={index} field="bullets" titleField="bulletsTitle" className="video-bullets" label="Bullet" />
              <div className="video-wrapper">
                {slide.videoUrl ? (
                  <iframe 
                    src={slide.videoUrl} 
                    title={slide.title}
                    allowFullScreen
                  />
                ) : (
                  <div className="video-placeholder">
                    <span className="video-icon">▶</span>
                    <span>Video URL:</span>
                    {editMode ? (
                      <input 
                        type="text" 
                        className="editable-field"
                        placeholder="Paste YouTube/Vimeo embed URL"
                        value={slide.videoUrl || ''}
                        onChange={(e) => updateSlide(index, { videoUrl: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>No video set</span>
                    )}
                  </div>
                )}
              </div>
              <p className="video-caption">
                <EditableField value={slide.caption} onChange={(v) => updateSlide(index, { caption: v })} />
              </p>
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="video-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
            </div>
          </div>
        );

      // === ISSUES BREAKDOWN - "what started to break" style ===
      case 'issuesBreakdown':
        return (
          <div className="slide slide-issues-breakdown" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="issues-breakdown-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="issues-breakdown-description-wrapper" maxParagraphs={2} optional />
              
              {/* Grid Layout Control */}
              {editMode && (
                <div className="grid-layout-control">
                  <span className="grid-control-label">Grid Columns:</span>
                  <div className="grid-control-buttons">
                    {[1, 2, 3, 4].map(cols => (
                      <button
                        key={cols}
                        className={`grid-col-btn ${(slide.gridColumns || 2) === cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: cols })}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {slide.issues?.length > 0 && (
                <div 
                  className="issues-breakdown-grid"
                  style={{ gridTemplateColumns: `repeat(${slide.gridColumns || 2}, 1fr)` }}
                >
                  {slide.issues.map((issue, i) => (
                    <div key={i} className="issue-breakdown-card">
                      <div className="issue-breakdown-number">{issue.number || i + 1}</div>
                      <div className="issue-breakdown-content">
                        <h4 className="issue-breakdown-heading">
                          <EditableField 
                            value={issue.title} 
                            onChange={(v) => updateSlideItem(index, 'issues', i, { ...issue, title: v })} 
                          />
                        </h4>
                        <p className="issue-breakdown-desc">
                          <EditableField 
                            value={issue.description} 
                            onChange={(v) => updateSlideItem(index, 'issues', i, { ...issue, description: v })} 
                            multiline
                          />
                        </p>
                      </div>
                      <ArrayItemControls onRemove={() => removeArrayItem(index, 'issues', i)} />
                    </div>
                  ))}
                </div>
              )}
              <AddItemButton 
                onClick={() => addArrayItem(index, 'issues', { number: String((slide.issues?.length || 0) + 1), title: 'New issue', description: '' })}
                label="Issue"
              />
              
              {(slide.conclusion || editMode) && (
                <div className="issues-breakdown-conclusion">
                  <EditableField 
                    value={slide.conclusion || 'Add conclusion here'} 
                    onChange={(v) => updateSlide(index, { conclusion: v })} 
                    multiline
                  />
                  <ToggleFieldButton 
                    hasValue={!!slide.conclusion}
                    onToggle={() => updateSlide(index, { conclusion: slide.conclusion ? null : 'Add conclusion here' })}
                    label="Conclusion"
                  />
                </div>
              )}
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="issues-breakdown-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
              <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
            </div>
          </div>
        );

      // === OLD EXPERIENCE - showing the previous state ===
      case 'oldExperience':
        return (
          <div className="slide slide-old-experience" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="old-experience-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="old-experience-description-wrapper" maxParagraphs={2} optional />
              
              <div className="old-experience-content">
                <span className="old-experience-subtitle">
                  <EditableField value={slide.subtitle || 'Explanation'} onChange={(v) => updateSlide(index, { subtitle: v })} />
                </span>
                <p className="old-experience-text">
                  <EditableField value={slide.content} onChange={(v) => updateSlide(index, { content: v })} multiline />
                </p>
                
                <DynamicBullets slide={slide} slideIndex={index} field="issues" titleField="issuesTitle" className="old-experience-issues-wrapper" label="Issue" />
                
                <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add key insight here" multiline>
                  <div className="old-experience-highlight">
                    <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                  </div>
                </OptionalField>
              </div>
              <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
            </div>
          </div>
        );

      // === ACHIEVE GOALS - two-column goals layout ===
      case 'achieveGoals':
        return (
          <div className="slide slide-achieve-goals" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="achieve-goals-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              <DynamicContent slide={slide} slideIndex={index} field="description" className="achieve-goals-description-wrapper" maxParagraphs={2} optional />
              
              <div className="achieve-goals-columns">
                {/* Left Column */}
                <div className="achieve-goals-column">
                  <h3 className="achieve-goals-column-title">
                    <EditableField 
                      value={slide.leftColumn?.title || 'KPIs'} 
                      onChange={(v) => updateSlide(index, { leftColumn: { ...slide.leftColumn, title: v } })} 
                    />
                  </h3>
                  <div className="achieve-goals-list">
                    {slide.leftColumn?.goals?.map((goal, i) => (
                      <div key={i} className="achieve-goal-item">
                        <div className="achieve-goal-number">{goal.number || i + 1}</div>
                        <div className="achieve-goal-text">
                          <EditableField 
                            value={goal.text} 
                            onChange={(v) => {
                              const newGoals = [...(slide.leftColumn?.goals || [])];
                              newGoals[i] = { ...goal, text: v };
                              updateSlide(index, { leftColumn: { ...slide.leftColumn, goals: newGoals } });
                            }} 
                          />
                        </div>
                        {editMode && (
                          <button 
                            className="remove-item-btn"
                            onClick={() => {
                              const newGoals = slide.leftColumn.goals.filter((_, idx) => idx !== i);
                              updateSlide(index, { leftColumn: { ...slide.leftColumn, goals: newGoals } });
                            }}
                          >×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <button 
                      className="add-item-btn"
                      onClick={() => {
                        const currentGoals = slide.leftColumn?.goals || [];
                        updateSlide(index, { 
                          leftColumn: { 
                            ...slide.leftColumn, 
                            goals: [...currentGoals, { number: String(currentGoals.length + 1), text: 'New goal' }] 
                          } 
                        });
                      }}
                    >+ Add Goal</button>
                  )}
                </div>
                
                {/* Right Column */}
                <div className="achieve-goals-column">
                  <h3 className="achieve-goals-column-title">
                    <EditableField 
                      value={slide.rightColumn?.title || 'Key metrics'} 
                      onChange={(v) => updateSlide(index, { rightColumn: { ...slide.rightColumn, title: v } })} 
                    />
                  </h3>
                  <div className="achieve-goals-list">
                    {slide.rightColumn?.goals?.map((goal, i) => (
                      <div key={i} className="achieve-goal-item">
                        <div className="achieve-goal-number">{goal.number || i + 1}</div>
                        <div className="achieve-goal-text">
                          <EditableField 
                            value={goal.text} 
                            onChange={(v) => {
                              const newGoals = [...(slide.rightColumn?.goals || [])];
                              newGoals[i] = { ...goal, text: v };
                              updateSlide(index, { rightColumn: { ...slide.rightColumn, goals: newGoals } });
                            }} 
                          />
                        </div>
                        {editMode && (
                          <button 
                            className="remove-item-btn"
                            onClick={() => {
                              const newGoals = slide.rightColumn.goals.filter((_, idx) => idx !== i);
                              updateSlide(index, { rightColumn: { ...slide.rightColumn, goals: newGoals } });
                            }}
                          >×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <button 
                      className="add-item-btn"
                      onClick={() => {
                        const currentGoals = slide.rightColumn?.goals || [];
                        updateSlide(index, { 
                          rightColumn: { 
                            ...slide.rightColumn, 
                            goals: [...currentGoals, { number: String(currentGoals.length + 1), text: 'New metric' }] 
                          } 
                        });
                      }}
                    >+ Add Metric</button>
                  )}
                </div>
              </div>
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="achieve-goals-highlight">
                  <EditableField value={slide.highlight} onChange={(v) => updateSlide(index, { highlight: v })} multiline />
                </div>
              </OptionalField>
              <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
            </div>
          </div>
        );

      // === TEXT WITH IMAGES - Title, description, two images at bottom ===
      case 'textWithImages':
        // Helper to update paragraph at specific index
        const updateParagraph = (pIndex, value) => {
          const newParagraphs = [...(slide.paragraphs || [])];
          newParagraphs[pIndex] = value;
          updateSlide(index, { paragraphs: newParagraphs });
        };
        // Helper to remove paragraph
        const removeParagraph = (pIndex) => {
          const newParagraphs = (slide.paragraphs || []).filter((_, i) => i !== pIndex);
          updateSlide(index, { paragraphs: newParagraphs });
        };
        // Helper to add paragraph
        const addParagraph = () => {
          const newParagraphs = [...(slide.paragraphs || []), 'New paragraph...'];
          updateSlide(index, { paragraphs: newParagraphs });
        };
        // Helper to update image at specific index - accepts (imgIndex, field, value) or (imgIndex, fieldsObject)
        const updateImage = (imgIndex, fieldOrObj, value) => {
          const newImages = [...(slide.images || [])];
          const updates = typeof fieldOrObj === 'object' ? fieldOrObj : { [fieldOrObj]: value };
          newImages[imgIndex] = { ...newImages[imgIndex], ...updates };
          updateSlide(index, { images: newImages });
        };
        // Helper to upload image/video from file picker
        const handleTwiImageUpload = (imgIndex) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*,video/mp4,video/webm,.gif';
          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
              const isVideo = file.type.startsWith('video/');
              const isGif = file.type === 'image/gif';
              
              // File size limits (in MB)
              const maxVideoSize = 10;
              const maxGifSize = 40;
              const maxImageSize = 10;
              const fileSizeMB = file.size / (1024 * 1024);
              
              if (isVideo && fileSizeMB > maxVideoSize) {
                alert(`Video file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxVideoSize}MB.`);
                return;
              }
              if (isGif && fileSizeMB > maxGifSize) {
                alert(`GIF file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxGifSize}MB.`);
                return;
              }
              if (!isVideo && !isGif && fileSizeMB > maxImageSize) {
                alert(`Image file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxImageSize}MB.`);
                return;
              }
              
              const reader = new FileReader();
              reader.onerror = () => alert('Error reading file. Please try again.');
              reader.onload = async (event) => {
                try {
                  const dataUrl = event.target.result;
                  
                  // Don't compress videos or GIFs - update src, isVideo, isGif in single call
                  if (isVideo || isGif) {
                    updateImage(imgIndex, { src: dataUrl, isVideo: isVideo, isGif: isGif });
                  } else {
                    try {
                      const compressed = await compressImage(dataUrl);
                      updateImage(imgIndex, { src: compressed, isVideo: false });
                    } catch (err) {
                      console.error('Error compressing image:', err);
                      updateImage(imgIndex, { src: dataUrl, isVideo: false });
                    }
                  }
                } catch (err) {
                  console.error('Error processing file:', err);
                  alert('Error processing file. Please try a smaller file.');
                }
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        };
        // Helper to remove image
        const removeImage = (imgIndex) => {
          const newImages = (slide.images || []).filter((_, i) => i !== imgIndex);
          updateSlide(index, { images: newImages });
        };
        // Helper to add image
        const addImage = () => {
          const newImages = [...(slide.images || []), { src: '', caption: '', position: 'center center', size: 'large', fit: 'cover' }];
          updateSlide(index, { images: newImages });
        };
        
        // Position presets
        const twiPositionPresets = [
          { label: '↖', value: 'left top', title: 'Top Left' },
          { label: '↑', value: 'center top', title: 'Top Center' },
          { label: '↗', value: 'right top', title: 'Top Right' },
          { label: '←', value: 'left center', title: 'Center Left' },
          { label: '•', value: 'center center', title: 'Center' },
          { label: '→', value: 'right center', title: 'Center Right' },
          { label: '↙', value: 'left bottom', title: 'Bottom Left' },
          { label: '↓', value: 'center bottom', title: 'Bottom Center' },
          { label: '↘', value: 'right bottom', title: 'Bottom Right' },
        ];
        
        // Size presets
        const twiSizePresets = [
          { label: 'S', value: 'small', title: 'Small' },
          { label: 'M', value: 'medium', title: 'Medium' },
          { label: 'L', value: 'large', title: 'Large (Full)' },
        ];
        
        // Fit presets
        const twiFitPresets = [
          { label: 'Fill', value: 'cover', title: 'Fill - image covers entire area (may crop)' },
          { label: 'Fit', value: 'contain', title: 'Fit - shows entire image (may have gaps)' },
        ];
        
        const paragraphs = slide.paragraphs || [];
        const images = slide.images || [];
        const imageCount = images.length;
        const maxImages = 6;
        
        // Calculate grid columns based on image count
        const getGridColumns = (count) => {
          switch (count) {
            case 1: return '1fr';
            case 2: return '1fr 1fr';
            case 3: return '1fr 1fr 1fr';
            case 4: return '1fr 1fr'; // 2x2
            case 5: return '1fr 1fr 1fr'; // 3+2 rows
            case 6: return '1fr 1fr 1fr'; // 3x2
            default: return '1fr 1fr 1fr';
          }
        };
        
        return (
          <div className="slide slide-text-with-images" key={index}>
            {slideControls}
            <div className="slide-inner">
              <span className="slide-label">
                <EditableField value={slide.label} onChange={(v) => updateSlide(index, { label: v })} />
              </span>
              <h2 className="twi-title">
                <EditableField value={slide.title} onChange={(v) => updateSlide(index, { title: v })} />
              </h2>
              
              {/* Dynamic Paragraphs */}
              <div className="twi-content">
                {paragraphs.map((para, pIndex) => (
                  <div key={pIndex} className="twi-paragraph-wrapper">
                    <p className="twi-text">
                      <EditableField 
                        value={para} 
                        onChange={(v) => updateParagraph(pIndex, v)} 
                        multiline 
                      />
                    </p>
                    {editMode && paragraphs.length > 1 && (
                      <button 
                        className="remove-paragraph-btn" 
                        onClick={() => removeParagraph(pIndex)}
                        title="Remove paragraph"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button className="add-paragraph-btn" onClick={addParagraph}>
                    + Add Paragraph
                  </button>
                )}
              </div>
              
              {/* Dynamic Bullets */}
              <DynamicBullets 
                slide={slide} 
                slideIndex={index} 
                field="bullets" 
                titleField="bulletsTitle"
                className="twi-bullets" 
                label="Bullet" 
              />
              
              {/* Optional Highlight */}
              <OptionalField slide={slide} index={index} field="highlight" label="Highlight" defaultValue="Add highlighted note..." multiline>
                <div className="twi-highlight">
                  <EditableField
                    value={slide.highlight}
                    onChange={(v) => updateSlide(index, { highlight: v })}
                    multiline
                  />
                </div>
              </OptionalField>
              
              {/* Grid Layout Control */}
              {editMode && images.length > 1 && (
                <div className="twi-grid-control">
                  <span className="grid-control-label">Image Grid:</span>
                  <div className="grid-control-buttons">
                    {[
                      { cols: 1, label: '1 col' },
                      { cols: 2, label: '2 cols' },
                      { cols: 3, label: '3 cols' },
                    ].map(opt => (
                      <button
                        key={opt.cols}
                        className={`grid-col-btn ${(slide.gridColumns || Math.min(imageCount, 3)) === opt.cols ? 'active' : ''}`}
                        onClick={() => updateSlide(index, { gridColumns: opt.cols })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Dynamic Images Grid */}
              {images.length === 0 && editMode ? (
                <div 
                  className="twi-images-empty-placeholder"
                  onClick={() => {
                    // Add an empty image first, then trigger upload
                    const currentLength = images.length;
                    addImage();
                    // Use setTimeout to ensure state has updated, then trigger upload for the new image
                    setTimeout(() => {
                      handleTwiImageUpload(currentLength);
                    }, 50);
                  }}
                >
                  <div className="empty-placeholder-content">
                    <span className="empty-placeholder-icon">📷</span>
                    <span className="empty-placeholder-text">Click to add image</span>
                  </div>
                </div>
              ) : images.length > 0 ? (
                <div 
                  className={`twi-images-grid twi-images-count-${imageCount}`}
                  style={{ gridTemplateColumns: slide.gridColumns ? `repeat(${slide.gridColumns}, 1fr)` : getGridColumns(imageCount) }}
                >
                  {images.map((img, imgIndex) => {
                    const imgPosition = img.position || 'center center';
                    const imgSize = img.size || 'large';
                    const imgFit = img.fit || 'cover';
                    const controlKey = `twi-${index}-${imgIndex}`;
                    
                    return (
                      <div key={imgIndex} className={`twi-image-item img-size-${imgSize} img-fit-${imgFit}`}>
                        <div 
                          className={`twi-image-wrapper ${!editMode && img.src ? 'clickable' : ''}`}
                          onClick={() => {
                            if (editMode && activeTwiImageControl !== controlKey) {
                              handleTwiImageUpload(imgIndex);
                            } else if (!editMode && img.src) {
                              setLightboxImage(img.src);
                            }
                          }}
                        >
                          {img.src ? (
                            <>
                              {img.isVideo ? (
                                <video 
                                  src={img.src}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{ objectPosition: imgPosition, objectFit: imgFit }}
                                />
                              ) : (
                                <img 
                                  src={img.src} 
                                  alt={img.caption || `Image ${imgIndex + 1}`} 
                                  style={{ objectPosition: imgPosition, objectFit: imgFit }}
                                />
                              )}
                              {editMode && <div className="image-edit-overlay">Click to change</div>}
                              {!editMode && !img.isVideo && !img.isGif && <div className="image-zoom-hint">🔍</div>}
                              
                              {/* Fill / Fit control - visible for video and GIF */}
                              {editMode && (img.isVideo || img.isGif) && (
                                <div className="media-fit-inline" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className={`fit-inline-btn ${imgFit === 'cover' ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'fit', 'cover')}
                                    title="Fill - covers entire area (may crop)"
                                  >
                                    Fill
                                  </button>
                                  <button
                                    type="button"
                                    className={`fit-inline-btn ${imgFit === 'contain' ? 'active' : ''}`}
                                    onClick={() => updateImage(imgIndex, 'fit', 'contain')}
                                    title="Fit - shows entire media (may have gaps)"
                                  >
                                    Fit
                                  </button>
                                </div>
                              )}
                              
                              {/* Image Controls Button */}
                              {editMode && (
                                <div className="image-position-control">
                                  <button 
                                    className="position-toggle-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTwiImageControl(activeTwiImageControl === controlKey ? null : controlKey);
                                    }}
                                    title="Adjust media settings"
                                  >
                                    ⊞
                                  </button>
                                </div>
                              )}
                              
                              {/* Image Settings Panel */}
                              {editMode && activeTwiImageControl === controlKey && (
                                <div 
                                  className="position-grid-overlay"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTwiImageControl(null);
                                  }}
                                >
                                  <div className="image-settings-panel" onClick={(e) => e.stopPropagation()}>
                                    {/* Focus Position */}
                                    <div className="settings-section">
                                      <span className="settings-section-title">Focus Point</span>
                                      <div className="position-grid-buttons">
                                        {twiPositionPresets.map((preset) => (
                                          <button
                                            key={preset.value}
                                            className={`position-btn ${imgPosition === preset.value ? 'active' : ''}`}
                                            onClick={() => updateImage(imgIndex, 'position', preset.value)}
                                            title={preset.title}
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Size Control */}
                                    <div className="settings-section">
                                      <span className="settings-section-title">Image Size</span>
                                      <div className="size-presets-row">
                                        {twiSizePresets.map((preset) => (
                                          <button
                                            key={preset.value}
                                            className={`size-preset-btn ${imgSize === preset.value ? 'active' : ''}`}
                                            onClick={() => updateImage(imgIndex, 'size', preset.value)}
                                            title={preset.title}
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Fit Control */}
                                    <div className="settings-section">
                                      <span className="settings-section-title">Image Fit</span>
                                      <div className="fit-presets-row">
                                        {twiFitPresets.map((preset) => (
                                          <button
                                            key={preset.value}
                                            className={`fit-preset-btn ${imgFit === preset.value ? 'active' : ''}`}
                                            onClick={() => updateImage(imgIndex, 'fit', preset.value)}
                                            title={preset.title}
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <button 
                                      className="settings-done-btn"
                                      onClick={() => setActiveTwiImageControl(null)}
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="image-placeholder">{editMode ? 'Click to add image' : 'No image'}</div>
                          )}
                        </div>
                        <div className="twi-caption-wrapper">
                          <span className="twi-caption">
                            <EditableField 
                              value={img.caption || ''} 
                              onChange={(v) => updateImage(imgIndex, 'caption', v)}
                              placeholder="Add caption..."
                            />
                          </span>
                          {editMode && img.caption && (
                            <button 
                              className="remove-caption-btn" 
                              onClick={(e) => { e.stopPropagation(); updateImage(imgIndex, 'caption', ''); }}
                              title="Remove caption"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {editMode && images.length > 1 && (
                          <button 
                            className="remove-image-btn" 
                            onClick={() => removeImage(imgIndex)}
                            title="Remove image"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {editMode && imageCount < maxImages && (
                <button className="add-image-btn" onClick={addImage}>
                  + Add Image {imageCount > 0 ? `(${imageCount}/${maxImages})` : ''}
                </button>
              )}
              
              <SlideCta slide={slide} index={index} updateSlide={updateSlide} />
            </div>
          </div>
        );

      // === IMAGE MOSAIC - Grid of images with centered title ===
      case 'imageMosaic': {
        return (
          <div className="slide slide-image-mosaic" key={index}>
            {slideControls}
            <div className="slide-inner">
              <DynamicImages slide={slide} slideIndex={index} field="images" className="mosaic-dynamic" />
              {/* Centered title overlay */}
              <div className="mosaic-overlay">
                <div className="mosaic-title-badge">
                  <EditableField
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      default:
        return (
          <div className="slide slide-unknown" key={index}>
            {slideControls}
            <div className="slide-inner">
              <p>Unknown slide type: {slide.type}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`case-study ${editMode ? 'edit-mode' : ''}`} ref={containerRef}>
      {/* Edit Mode Indicator */}
      <AnimatePresence>
        {editMode && (
          <motion.div 
            className="edit-mode-bar"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <span>✏️ Edit Mode</span>
            <div className="edit-actions">
              <button className="builder-trigger" onClick={() => setShowBuilder(true)}>🚀 Build from Scratch</button>
              <button onClick={handleReset}>Reset to Default</button>
              <button onClick={() => { setEditMode(false); setShowPanel(false); }}>Done Editing</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            className="template-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowTemplates(false); setPreviewTemplate(null); }}
          >
            <motion.div 
              className={`template-modal ${previewTemplate ? 'with-preview' : ''}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="template-selector">
                <h3>Add New Slide</h3>
                <p>Click a template to preview, then add:</p>
                <div className="template-categories">
                  {Object.entries(templateCategories).map(([category, templates]) => (
                    <div key={category} className="template-category">
                      <h4 className="category-title">{category}</h4>
                      <div className="template-grid">
                        {templates.map((type) => (
                          <button 
                            key={type}
                            className={`template-btn ${previewTemplate === type ? 'active' : ''}`}
                            onClick={() => setPreviewTemplate(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="close-modal" onClick={() => { setShowTemplates(false); setPreviewTemplate(null); }}>Cancel</button>
              </div>
              
              {/* Preview Panel */}
              {previewTemplate && (
                <div className="template-preview">
                  <div className="preview-header">
                    <h4>Preview: {previewTemplate.charAt(0).toUpperCase() + previewTemplate.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                    <button 
                      className="add-template-btn"
                      onClick={() => {
                        addSlide(previewTemplate, currentSlide);
                        setPreviewTemplate(null);
                      }}
                    >
                      Add This Slide
                    </button>
                  </div>
                  <div className="preview-content">
                    <TemplatePreview type={previewTemplate} />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Study Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div 
            className="builder-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBuilder}
          >
            <motion.div 
              className={`builder-modal ${builderMode === 'paste' ? 'builder-modal--wide' : ''}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="builder-header">
                <h2>{builderMode === 'paste' ? '📝 Create from Text' : '🚀 Create Case Study'}</h2>
                <p>
                  {builderMode === 'choose' && 'Choose how you want to build your presentation'}
                  {builderMode === 'paste' && 'Paste your case study content and we\'ll pick the best slides automatically'}
                  {builderMode === 'form' && 'Fill in the information and we\'ll generate your presentation automatically'}
                </p>
                <button className="builder-close" onClick={closeBuilder}>×</button>
              </div>

              {/* Progress stepper - only in form mode */}
              {builderMode === 'form' && (
                <div className="builder-progress">
                  {builderSteps.map((step, i) => (
                    <div 
                      key={i} 
                      className={`progress-step ${i === builderStep ? 'active' : ''} ${i < builderStep ? 'completed' : ''}`}
                      onClick={() => setBuilderStep(i)}
                    >
                      <span className="step-number">{i + 1}</span>
                      <span className="step-title">{step.title}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="builder-content">

                {/* === MODE: Choose === */}
                {builderMode === 'choose' && (
                  <div className="builder-mode-select">
                    <div className="builder-mode-card" onClick={() => setBuilderMode('paste')}>
                      <div className="mode-icon">📝</div>
                      <h3>Paste Content</h3>
                      <p>Paste your full case study text and we'll automatically detect sections and create the best slides for your content</p>
                      <span className="mode-tag">Recommended</span>
                    </div>
                    <div className="builder-mode-card" onClick={() => setBuilderMode('form')}>
                      <div className="mode-icon">📋</div>
                      <h3>Step by Step</h3>
                      <p>Fill in a structured form field by field to build your case study slides one step at a time</p>
                    </div>
                  </div>
                )}

                {/* === MODE: Paste Content === */}
                {builderMode === 'paste' && (
                  <div className="builder-paste-container">
                    <div className="builder-field">
                      <label>Paste your case study content</label>
                      <textarea
                        className="builder-paste-textarea"
                        value={pasteText}
                        onChange={(e) => { setPasteText(e.target.value); setParsedPreview(null); }}
                        placeholder={`Paste your full case study text here...\n\nExample format:\n\nProject Name\nShort description of the project\n\nClient\nCompany Name\n\nRole\nYour Role\n\nBackground\nWhat is this project about?\n\nThe Problem\nWhat needed to be solved\n\n1. First issue\n2. Second issue\n\nGoals\nWhat you wanted to achieve\n\nThe Solution\nHow you solved it\n\nOutcomes\nWhat improved\n\nThank You`}
                        rows={14}
                      />
                      <div className="builder-text-stats">
                        {pasteText.trim() ? `${pasteText.split(/\s+/).filter(w => w).length} words` : 'Paste your content to get started'}
                      </div>
                    </div>

                    {parsedPreview && parsedPreview.preview.length > 0 && (
                      <div className="builder-preview">
                        <div className="builder-preview-header">
                          <h4>{parsedPreview.preview.length} slides detected</h4>
                          <span className="builder-preview-hint">You can edit any slide after generating</span>
                        </div>
                        <div className="builder-preview-list">
                          {parsedPreview.preview.map((item, i) => (
                            <div key={i} className="builder-preview-item">
                              <span className="preview-number">{String(i + 1).padStart(2, '0')}</span>
                              <span className="preview-type-badge">{item.type}</span>
                              <span className="preview-label">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* === MODE: Step-by-step Form === */}
                {builderMode === 'form' && builderStep === 0 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Project Name *</label>
                      <input
                        type="text"
                        value={builderData.projectName}
                        onChange={(e) => setBuilderData(d => ({ ...d, projectName: e.target.value }))}
                        placeholder="e.g., Mobile Banking App Redesign"
                      />
                    </div>
                    <div className="builder-row">
                      <div className="builder-field">
                        <label>Category</label>
                        <input
                          type="text"
                          value={builderData.category}
                          onChange={(e) => setBuilderData(d => ({ ...d, category: e.target.value }))}
                          placeholder="e.g., UX/UI Design"
                        />
                      </div>
                      <div className="builder-field">
                        <label>Year</label>
                        <input
                          type="text"
                          value={builderData.year}
                          onChange={(e) => setBuilderData(d => ({ ...d, year: e.target.value }))}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                    <div className="builder-field">
                      <label>Brief Description</label>
                      <textarea
                        value={builderData.description}
                        onChange={(e) => setBuilderData(d => ({ ...d, description: e.target.value }))}
                        placeholder="A short description of what this project is about..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 1 && (
                  <div className="builder-step">
                    <div className="builder-row">
                      <div className="builder-field">
                        <label>Client</label>
                        <input
                          type="text"
                          value={builderData.client}
                          onChange={(e) => setBuilderData(d => ({ ...d, client: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="builder-field">
                        <label>Your Role</label>
                        <input
                          type="text"
                          value={builderData.role}
                          onChange={(e) => setBuilderData(d => ({ ...d, role: e.target.value }))}
                          placeholder="e.g., Lead Designer"
                        />
                      </div>
                    </div>
                    <div className="builder-row">
                      <div className="builder-field">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={builderData.duration}
                          onChange={(e) => setBuilderData(d => ({ ...d, duration: e.target.value }))}
                          placeholder="e.g., 3 months"
                        />
                      </div>
                      <div className="builder-field">
                        <label>Deliverables</label>
                        <input
                          type="text"
                          value={builderData.deliverables}
                          onChange={(e) => setBuilderData(d => ({ ...d, deliverables: e.target.value }))}
                          placeholder="e.g., UI Kit, Prototypes"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 2 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Context / Background</label>
                      <textarea
                        value={builderData.context}
                        onChange={(e) => setBuilderData(d => ({ ...d, context: e.target.value }))}
                        placeholder="Describe the context and background of the project..."
                        rows={3}
                      />
                    </div>
                    <div className="builder-field">
                      <label>The Problem</label>
                      <textarea
                        value={builderData.problem}
                        onChange={(e) => setBuilderData(d => ({ ...d, problem: e.target.value }))}
                        placeholder="What problem were you trying to solve?"
                        rows={2}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Key Issues (one per line)</label>
                      {builderData.issues.map((issue, i) => (
                        <input
                          key={i}
                          type="text"
                          value={issue}
                          onChange={(e) => {
                            const newIssues = [...builderData.issues];
                            newIssues[i] = e.target.value;
                            setBuilderData(d => ({ ...d, issues: newIssues }));
                          }}
                          placeholder={`Issue ${i + 1}`}
                          style={{ marginBottom: '0.5rem' }}
                        />
                      ))}
                      <button 
                        className="builder-add-btn"
                        onClick={() => setBuilderData(d => ({ ...d, issues: [...d.issues, ''] }))}
                      >
                        + Add Issue
                      </button>
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 3 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Goals</label>
                      {builderData.goals.map((goal, i) => (
                        <input
                          key={i}
                          type="text"
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...builderData.goals];
                            newGoals[i] = e.target.value;
                            setBuilderData(d => ({ ...d, goals: newGoals }));
                          }}
                          placeholder={`Goal ${i + 1}`}
                          style={{ marginBottom: '0.5rem' }}
                        />
                      ))}
                      <button 
                        className="builder-add-btn"
                        onClick={() => setBuilderData(d => ({ ...d, goals: [...d.goals, ''] }))}
                      >
                        + Add Goal
                      </button>
                    </div>
                    <div className="builder-field">
                      <label>The Solution</label>
                      <textarea
                        value={builderData.solution}
                        onChange={(e) => setBuilderData(d => ({ ...d, solution: e.target.value }))}
                        placeholder="Describe how you solved the problem..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {builderMode === 'form' && builderStep === 4 && (
                  <div className="builder-step">
                    <div className="builder-field">
                      <label>Results / Metrics</label>
                      {builderData.results.map((result, i) => (
                        <div key={i} className="builder-row" style={{ marginBottom: '0.5rem' }}>
                          <input
                            type="text"
                            value={result.value}
                            onChange={(e) => {
                              const newResults = [...builderData.results];
                              newResults[i] = { ...newResults[i], value: e.target.value };
                              setBuilderData(d => ({ ...d, results: newResults }));
                            }}
                            placeholder="e.g., 50%"
                            style={{ flex: '0 0 100px' }}
                          />
                          <input
                            type="text"
                            value={result.label}
                            onChange={(e) => {
                              const newResults = [...builderData.results];
                              newResults[i] = { ...newResults[i], label: e.target.value };
                              setBuilderData(d => ({ ...d, results: newResults }));
                            }}
                            placeholder="Metric description"
                          />
                        </div>
                      ))}
                      <button 
                        className="builder-add-btn"
                        onClick={() => setBuilderData(d => ({ ...d, results: [...d.results, { value: '', label: '' }] }))}
                      >
                        + Add Metric
                      </button>
                    </div>
                    <div className="builder-field">
                      <label>Client Testimonial (optional)</label>
                      <textarea
                        value={builderData.testimonial}
                        onChange={(e) => setBuilderData(d => ({ ...d, testimonial: e.target.value }))}
                        placeholder="A quote from your client..."
                        rows={2}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Testimonial Author</label>
                      <input
                        type="text"
                        value={builderData.testimonialAuthor}
                        onChange={(e) => setBuilderData(d => ({ ...d, testimonialAuthor: e.target.value }))}
                        placeholder="e.g., John Doe, CEO"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions bar */}
              {builderMode !== 'choose' && (
                <div className="builder-actions">
                  <button 
                    className="builder-btn secondary"
                    onClick={() => {
                      if (builderMode === 'paste') {
                        setParsedPreview(null);
                        setBuilderMode('choose');
                      } else if (builderStep === 0) {
                        setBuilderMode('choose');
                      } else {
                        setBuilderStep(s => Math.max(0, s - 1));
                      }
                    }}
                  >
                    ← Back
                  </button>

                  {/* Paste mode actions */}
                  {builderMode === 'paste' && !parsedPreview && (
                    <button 
                      className="builder-btn primary"
                      onClick={() => {
                        const result = parseTextToSlides(pasteText);
                        setParsedPreview(result);
                      }}
                      disabled={!pasteText.trim()}
                    >
                      Analyze Content
                    </button>
                  )}
                  {builderMode === 'paste' && parsedPreview && (
                    <div className="builder-actions-group">
                      <button 
                        className="builder-btn secondary"
                        onClick={() => setParsedPreview(null)}
                      >
                        Re-edit
                      </button>
                      <button 
                        className="builder-btn primary generate"
                        onClick={generateFromPaste}
                      >
                        ✨ Generate {parsedPreview.preview.length} Slides
                      </button>
                    </div>
                  )}

                  {/* Form mode actions */}
                  {builderMode === 'form' && builderStep < builderSteps.length - 1 && (
                    <button 
                      className="builder-btn primary"
                      onClick={() => setBuilderStep(s => s + 1)}
                    >
                      Next →
                    </button>
                  )}
                  {builderMode === 'form' && builderStep === builderSteps.length - 1 && (
                    <button 
                      className="builder-btn primary generate"
                      onClick={generateFromBuilder}
                    >
                      ✨ Generate Case Study
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Status Indicator */}
      {(saveStatus || (editMode && hasUnsavedChanges)) && (
        <div className={`save-status ${saveStatus ? `save-status-${saveStatus}` : 'save-status-unsaved'}`}>
          {saveStatus === 'saving' && '💾 Saving...'}
          {saveStatus === 'saved' && '✓ Saved'}
          {saveStatus === 'error' && '⚠ Save failed'}
          {!saveStatus && editMode && hasUnsavedChanges && '● Unsaved changes'}
        </div>
      )}

      <div className="case-nav">
        <Link to="/" className="nav-back">
          <span className="back-icon">←</span>
          <span className="back-text">Back</span>
        </Link>
        <div className="nav-progress">
          <span className="progress-current">{String(currentSlide + 1).padStart(2, '0')}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
          </div>
          <span className="progress-total">{String(totalSlides).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="slides-container">
        <motion.div 
          className="slides-track"
          animate={{ x: `-${currentSlide * 100}%` }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {project.slides.map((slide, index) => (
            <SlideErrorBoundary key={`error-${index}`}>
              {renderSlide(slide, index)}
            </SlideErrorBoundary>
          ))}
        </motion.div>
      </div>

      <div className="slide-indicators">
        {project.slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Lightbox for viewing images in full size */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>×</button>
            <motion.img 
              src={lightboxImage} 
              alt="Full size view"
              className="lightbox-image"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaseStudy;
