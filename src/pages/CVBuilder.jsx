import { useState, useRef, useCallback, useEffect } from 'react';
import './CVBuilder.css';

// SVG Icons for contact
const IconPortfolio = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
  </svg>
);
const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const IconEmail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const DEFAULT_CV = {
  fullName: 'LIOR BAUM',
  title: 'Product & UX Designer',
  email: 'Lior2565967@gmail.com',
  phone: '050-555-0409',
  location: '',
  portfolio: 'https://www.baumlior.com/',
  linkedin: 'linkedin.com/in/liorbaum',
  summary: 'Product & UX Designer with hands-on experience in B2B SaaS and MedTech, specializing in complex clinical workflows, design systems, and data-driven interfaces. Passionate about bridging user needs with business goals through research-backed design decisions and rapid prototyping. Currently exploring the intersection of design and AI-assisted development.',
  experience: [
    {
      company: 'Align Technology',
      role: 'UX/UI Designer',
      period: 'Dec 2024 – Present',
      location: '',
      bullets: [
        'Improved key parts of the iTero\u2122 scanner experience, focusing on how doctors and patients move through the system.',
        'Redesigned navigation and content structure within the iTero\u2122 Store to enhance discoverability and usability of scanner options and accessories.',
        'Designed the full UX experience around scanning \u2013 from patient onboarding and scan setup to post-scan insights and next steps.',
      ],
    },
    {
      company: 'Shenkar College',
      role: 'Teaching Assistant \u2013 Vibe Coding Course',
      period: 'Mar 2025 – Present',
      location: '',
      bullets: [
        'Assisting in a new interdisciplinary course that teaches designers to build functional products using AI-assisted coding tools.',
        'Supporting students in translating design concepts into working prototypes using Cursor, Claude, and modern web frameworks.',
        'Providing one-on-one mentorship and code reviews, bridging the gap between design thinking and technical implementation.',
      ],
    },
    {
      company: 'BigIdea',
      role: 'UX/UI Designer',
      period: 'Jul 2024 – Oct 2024',
      location: '',
      bullets: [
        'Led the redesign of the asset management panel within a complex privacy system.',
        'Designed flows that supported automated risk detection in sensitive data environments.',
        'Partnered with privacy officers and PMs to refine logic and improve system trust and usability.',
      ],
    },
    {
      company: 'WizeCare',
      role: 'UX/UI Design Intern',
      period: 'Jul 2023 – Nov 2023',
      location: '',
      bullets: [
        'Reimagined clinician dashboard to reduce friction in digital physical therapy sessions.',
        'Conducted interviews with stakeholders and therapists to identify pain points and deliver improved task flows.',
        'Created onboarding flows and visual guidance assets to support product adoption.',
      ],
    },
  ],
  education: [
    { institution: 'Shenkar College of Engineering, Design and Art', degree: 'BA in Visual Communication', period: 'Graduated: 2025', details: '' },
    { institution: 'Ort Shapira High School', degree: 'Advertising and Communication', period: '2014 – 2017', details: '' },
  ],
  skillCategories: [
    { name: 'Tools', skills: 'Figma, After Effects, Illustrator, Photoshop, Webflow, Vibe Coding\u2122, HTML/CSS', display: 'badges' },
    { name: 'Skills', skills: 'UX Strategy & Design Thinking, Product Discovery & User Research, Wireframing & Prototyping, Interaction Design & Microinteractions, UI Systems & Component Libraries, Site Building in Webflow & Cursor', display: 'list' },
  ],
  projects: [{ name: '', description: '', impact: '' }],
  certifications: [{ name: '', issuer: '', year: '' }],
  languages: [{ language: '', level: '' }],
  awards: [{ title: '', issuer: '', year: '' }],
  volunteer: '',
  // Layout settings
  fontSize: 11,        // pt — base font size (11pt min per CV typography best practice)
  contentWidth: 180,   // mm — content area width inside A4
  showSummary: true,
  showExperience: true,
  showEducation: true,
  showSkills: true,
  showProjects: false,
  showCertifications: false,
  showLanguages: false,
  showAwards: false,
  showVolunteer: false,
};

const STORAGE_KEY = 'portfolio_cv_builder';

// Displayed in the "JSON Structure Reference" block and used by its Copy
// button so both always show exactly the same text.
const CV_JSON_SCHEMA_REFERENCE = `{
  "fullName": "Jane Doe",
  "title": "Product Designer",
  "email": "jane@example.com",
  "phone": "050-123-4567",
  "location": "Tel Aviv, Israel",
  "portfolio": "https://janedoe.com",
  "linkedin": "linkedin.com/in/janedoe",

  "summary": "A short professional summary paragraph.",

  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "Jan 2023 – Present",
      "location": "Remote",
      "bullets": [
        "Achievement or responsibility",
        "Another bullet point"
      ]
    }
  ],

  "education": [
    {
      "institution": "University Name",
      "degree": "BA in Design",
      "period": "2019 – 2023",
      "details": "Honors, relevant coursework"
    }
  ],

  "skillCategories": [
    {
      "name": "Tools",
      "skills": "Figma, Sketch, Photoshop",
      "display": "badges"
    },
    {
      "name": "Skills",
      "skills": "UX Research, Prototyping, Design Systems",
      "display": "list"
    }
  ],

  "projects": [
    {
      "name": "Project Name",
      "description": "What you did",
      "impact": "Measurable result"
    }
  ],

  "certifications": [
    { "name": "Cert Name", "issuer": "Organization", "year": "2024" }
  ],

  "languages": [
    { "language": "English", "level": "Native" },
    { "language": "Hebrew", "level": "Fluent" }
  ],

  "awards": [
    { "title": "Award Name", "issuer": "Organization", "year": "2024" }
  ],

  "volunteer": "Description of volunteer work or side projects.",

  "fontSize": 11,
  "contentWidth": 180,

  "showSummary": true,
  "showExperience": true,
  "showEducation": true,
  "showSkills": true,
  "showProjects": false,
  "showCertifications": false,
  "showLanguages": false,
  "showAwards": false,
  "showVolunteer": false
}`;

// Prompt shipped verbatim to an AI. Contains the schema, editing rules, and
// the user's current CV so the model can return a valid JSON patch ready to
// paste back into the "Apply JSON" textarea.
const buildAiPrompt = (cv) => `You are helping me edit my CV. I will paste a JSON object that represents my CV. Return a SINGLE valid JSON object in the same shape — nothing else, no prose, no markdown fences — so I can paste it directly back into the editor.

RULES
- Keep the top-level keys the same: fullName, title, email, phone, location, portfolio, linkedin, summary, experience, education, skillCategories, projects, certifications, languages, awards, volunteer, fontSize, contentWidth, showSummary, showExperience, showEducation, showSkills, showProjects, showCertifications, showLanguages, showAwards, showVolunteer.
- Any field you don't change: leave exactly as-is.
- Only include fields you want to change (the editor merges your output into the current state), OR return the whole object with edits applied. Both are fine. Never invent new top-level keys.
- Arrays (experience, education, skillCategories, projects, certifications, languages, awards): include the FULL array if you touch it — missing entries will be treated as "keep unchanged" only if you omit the whole key.
- experience[].bullets is an array of strings. Prefer quantified, outcome-oriented bullets. Start with a strong verb (Led, Shipped, Reduced, Built, Launched). Include a metric whenever possible.
- skillCategories[].display is "badges" (comma-separated chips) or "list" (bulleted list).
- Dates: "Mon YYYY – Mon YYYY" or "Mon YYYY – Present" (en-dash).
- Keep the tone concise and evidence-first. No clichés ("team player", "results-driven"). No emoji.
- Output pure JSON — no leading/trailing text, no \`\`\`json fences.

SCHEMA REFERENCE
{
  "fullName": "Jane Doe",
  "title": "Product Designer",
  "email": "jane@example.com",
  "phone": "050-123-4567",
  "location": "Tel Aviv, Israel",
  "portfolio": "https://janedoe.com",
  "linkedin": "linkedin.com/in/janedoe",
  "summary": "A short professional summary paragraph.",
  "experience": [
    { "company": "Company", "role": "Title", "period": "Jan 2023 – Present", "location": "Remote", "bullets": ["Achievement with metric", "Another achievement"] }
  ],
  "education": [
    { "institution": "University", "degree": "BA in Design", "period": "2019 – 2023", "details": "Honours, relevant coursework" }
  ],
  "skillCategories": [
    { "name": "Tools", "skills": "Figma, Sketch, Photoshop", "display": "badges" }
  ],
  "projects":       [ { "name": "", "description": "", "impact": "" } ],
  "certifications": [ { "name": "", "issuer": "", "year": "" } ],
  "languages":      [ { "language": "", "level": "" } ],
  "awards":         [ { "title": "", "issuer": "", "year": "" } ],
  "volunteer": "",
  "fontSize": 11,
  "contentWidth": 180,
  "showSummary": true, "showExperience": true, "showEducation": true,
  "showSkills": true, "showProjects": false, "showCertifications": false,
  "showLanguages": false, "showAwards": false, "showVolunteer": false
}

MY CURRENT CV
${JSON.stringify(cv, null, 2)}

WHAT TO DO
[Write here what you want the AI to change. Examples: "Tighten every experience bullet to one sentence.", "Rewrite the summary to target a senior IC role at a B2B SaaS company.", "Translate everything to Hebrew.", "Add a new experience entry for [Company]."]
`;

const CV_STYLES = [
  // Two-column original layout
  { id: 'default',                label: 'Default' },
  { id: 'minimal',                label: 'Minimal' },
  // Editorial-family single-column layout (clean paper flow)
  { id: 'editorial',              label: 'Editorial — Single' },
  { id: 'minimal-ats',            label: 'Minimal ATS — Single' },
  { id: 'classic',                label: 'Classic — Single' },
  { id: 'modernist',              label: 'Modernist — Single' },
  // Sidebar layout: left rail with contact + skills, right column content
  { id: 'editorial-sidebar',      label: 'Editorial — Sidebar' },
  { id: 'minimal-ats-sidebar',    label: 'Minimal ATS — Sidebar' },
  { id: 'classic-sidebar',        label: 'Classic — Sidebar' },
  { id: 'modernist-sidebar',      label: 'Modernist — Sidebar' },
];

// Themes that use the paper-style editorial rendering. Both the single and
// sidebar layouts share the same theme variables; the layout suffix picks
// which layout component to render.
const EDITORIAL_THEMES = new Set(['editorial', 'minimal-ats', 'classic', 'modernist']);

// Split a composite style id ("classic-sidebar") into its theme + layout.
const parseCvStyle = (styleId) => {
  if (!styleId) return { theme: 'default', layout: 'default' };
  if (styleId.endsWith('-sidebar')) {
    const theme = styleId.slice(0, -'-sidebar'.length);
    return { theme, layout: EDITORIAL_THEMES.has(theme) ? 'sidebar' : 'default' };
  }
  if (EDITORIAL_THEMES.has(styleId)) return { theme: styleId, layout: 'single' };
  return { theme: styleId, layout: 'default' };
};

// Measures 1mm in px — mm rendering varies with browser zoom, so we re-check
// on resize. Falls back to the 96dpi standard if the probe can't run.
const measurePxPerMm = () => {
  if (typeof document === 'undefined') return 3.7795;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;width:1mm;height:0;top:-9999px;left:-9999px;visibility:hidden;';
  document.body.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  document.body.removeChild(probe);
  return w || 3.7795;
};

// Watches the CV preview and reports how many mm it overflows past 297mm.
// Drives the overflow badge + the "Fit to Page" auto-shrink. 2mm tolerance
// swallows sub-pixel rendering noise from the mm→px probe.
const PAGE_FIT_TOLERANCE_MM = 2;
const usePageFit = (ref) => {
  const [overflowMm, setOverflowMm] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pxPerMm = measurePxPerMm();
    const update = () => {
      const pagePx = 297 * pxPerMm;
      const overflow = Math.max(0, el.scrollHeight - pagePx);
      setOverflowMm(Math.round(overflow / pxPerMm));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const onResize = () => { pxPerMm = measurePxPerMm(); update(); };
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  });
  return { overflowMm, fits: overflowMm <= PAGE_FIT_TOLERANCE_MM };
};

// Map of theme -> { bg, ink, accent } used to tint the style-picker thumbnails.
const STYLE_THUMB_COLORS = {
  default:       { bg: '#FFFFFF', ink: '#1A1A1A', accent: '#FF584A' },
  minimal:       { bg: '#FFFFFF', ink: '#1A1A1A', accent: '#888888' },
  editorial:     { bg: '#F5F1E8', ink: '#1A1915', accent: '#D97757' },
  classic:       { bg: '#FAF8F2', ink: '#1A1A2E', accent: '#8B2635' },
  modernist:     { bg: '#F2EFE8', ink: '#0F0F0F', accent: '#FF4B2B' },
  'minimal-ats': { bg: '#FFFFFF', ink: '#0A0A0A', accent: '#0A0A0A' },
};

// Schematic mini-preview that hints at the layout (two-col / single / sidebar)
// and theme palette. Lets the user tell the 10 styles apart at a glance.
const StyleTile = ({ id, label, active, onClick }) => {
  const { theme, layout } = parseCvStyle(id);
  const colors = STYLE_THUMB_COLORS[theme] || STYLE_THUMB_COLORS.default;
  const bodyClass = layout === 'sidebar' ? 'is-sidebar' : layout === 'single' ? 'is-single' : 'is-two-col';
  return (
    <button type="button" className={`cv-style-tile ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
      <div className="cv-style-thumb" style={{ background: colors.bg, color: colors.ink }}>
        <div className="cv-style-thumb-head">
          <div className="cv-style-thumb-head-left">
            <div className="cv-style-thumb-name" style={{ background: colors.ink }} />
            <div className="cv-style-thumb-tag" style={{ background: colors.accent }} />
          </div>
          {layout !== 'sidebar' && (
            <div className="cv-style-thumb-head-right">
              <div className="cv-style-thumb-contact" style={{ background: colors.ink }} />
              <div className="cv-style-thumb-contact" style={{ background: colors.ink }} />
              <div className="cv-style-thumb-contact" style={{ background: colors.ink }} />
            </div>
          )}
        </div>
        <div className={`cv-style-thumb-body ${bodyClass}`} style={{ color: colors.ink }}>
          <div className="cv-style-thumb-col">
            <div className="cv-style-thumb-line is-title" style={{ background: colors.accent }} />
            <div className="cv-style-thumb-line" />
            <div className="cv-style-thumb-line is-mid" />
            <div className="cv-style-thumb-line is-short" />
            <div className="cv-style-thumb-line is-title" style={{ background: colors.accent, marginTop: '3%' }} />
            <div className="cv-style-thumb-line" />
            <div className="cv-style-thumb-line is-mid" />
          </div>
          {layout !== 'single' && (
            <div className="cv-style-thumb-col">
              <div className="cv-style-thumb-line is-title" style={{ background: colors.accent }} />
              <div className="cv-style-thumb-line is-short" />
              <div className="cv-style-thumb-line is-short" />
              <div className="cv-style-thumb-line is-title" style={{ background: colors.accent, marginTop: '3%' }} />
              <div className="cv-style-thumb-line is-short" />
            </div>
          )}
        </div>
      </div>
      <span className="cv-style-tile-label">{label}</span>
    </button>
  );
};

// Top-level editor navigation — groups 10 content sections, design controls,
// section-visibility toggles, and data (JSON/AI) into four panels.
const PANELS = [
  { id: 'content',  label: 'Content' },
  { id: 'design',   label: 'Design' },
  { id: 'sections', label: 'Sections' },
  { id: 'data',     label: 'Data' },
];

const CONTENT_SECTIONS = [
  { id: 'personal',       label: 'Personal' },
  { id: 'summary',        label: 'Summary' },
  { id: 'experience',     label: 'Experience' },
  { id: 'education',      label: 'Education' },
  { id: 'skills',         label: 'Skills' },
  { id: 'projects',       label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'languages',      label: 'Languages' },
  { id: 'awards',         label: 'Awards' },
  { id: 'volunteer',      label: 'Volunteer' },
];

const CVBuilder = () => {
  const [cv, setCv] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_CV, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CV;
  });
  const [cvStyle, setCvStyle] = useState(() => {
    return localStorage.getItem('portfolio_cv_style') || 'default';
  });
  const [activePanel, setActivePanel] = useState('content');
  const [activeSection, setActiveSection] = useState('personal');
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonStatus, setJsonStatus] = useState('');
  const [copyJsonStatus, setCopyJsonStatus] = useState('');
  const [copyAiStatus, setCopyAiStatus] = useState('');
  const [copySchemaStatus, setCopySchemaStatus] = useState('');
  const [fitStatus, setFitStatus] = useState('');
  const printRef = useRef(null);
  const { overflowMm, fits } = usePageFit(printRef);

  useEffect(() => {
    localStorage.setItem('portfolio_cv_style', cvStyle);
  }, [cvStyle]);

  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cv)); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [cv]);

  const update = useCallback((key, value) => {
    setCv(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateArrayItem = useCallback((key, index, field, value) => {
    setCv(prev => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  }, []);

  const addArrayItem = useCallback((key, template) => {
    setCv(prev => ({ ...prev, [key]: [...prev[key], { ...template }] }));
  }, []);

  const removeArrayItem = useCallback((key, index) => {
    setCv(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  }, []);

  const updateBullet = useCallback((expIndex, bulletIndex, value) => {
    setCv(prev => {
      const exp = [...prev.experience];
      const bullets = [...exp[expIndex].bullets];
      bullets[bulletIndex] = value;
      exp[expIndex] = { ...exp[expIndex], bullets };
      return { ...prev, experience: exp };
    });
  }, []);

  const addBullet = useCallback((expIndex) => {
    setCv(prev => {
      const exp = [...prev.experience];
      exp[expIndex] = { ...exp[expIndex], bullets: [...exp[expIndex].bullets, ''] };
      return { ...prev, experience: exp };
    });
  }, []);

  const removeBullet = useCallback((expIndex, bulletIndex) => {
    setCv(prev => {
      const exp = [...prev.experience];
      exp[expIndex] = { ...exp[expIndex], bullets: exp[expIndex].bullets.filter((_, i) => i !== bulletIndex) };
      return { ...prev, experience: exp };
    });
  }, []);

  const handleExportPDF = useCallback(() => {
    const cleanup = () => document.documentElement.classList.remove('cv-printing');
    document.documentElement.classList.add('cv-printing');
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => window.print(), 50);
  }, []);

  // Scale down font-size in one shot so the CV fits on 297mm. If already at or
  // below the 7pt floor and still overflowing, flag the user with a toast.
  const handleFitToPage = useCallback(() => {
    if (!printRef.current) return;
    const pxPerMm = measurePxPerMm();
    const pagePx = 297 * pxPerMm;
    const currentHeight = printRef.current.scrollHeight;
    const currentSize = cv.fontSize || 11;
    if (currentHeight <= pagePx + PAGE_FIT_TOLERANCE_MM * pxPerMm) {
      setFitStatus('fits');
      setTimeout(() => setFitStatus(''), 2000);
      return;
    }
    // Linear-scale guess with a 3% safety margin, quantized to 0.25pt steps.
    const scale = pagePx / currentHeight;
    const next = Math.max(11, Math.round(currentSize * scale * 0.97 * 4) / 4);
    if (next >= currentSize) {
      setFitStatus('floor');
      setTimeout(() => setFitStatus(''), 3500);
      return;
    }
    setCv(prev => ({ ...prev, fontSize: next }));
    if (next <= 11 + 0.01) {
      setFitStatus('floor');
      setTimeout(() => setFitStatus(''), 3500);
    } else {
      setFitStatus('shrunk');
      setTimeout(() => setFitStatus(''), 2000);
    }
  }, [cv.fontSize]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset CV to defaults? This cannot be undone.')) {
      setCv(DEFAULT_CV);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(cv, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.fullName || 'cv'}_resume.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cv]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          setCv({ ...DEFAULT_CV, ...data });
        } catch { alert('Invalid JSON file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Section toggle component
  const SectionToggle = ({ label, field }) => (
    <div className="cv-toggle-row">
      <label className="cv-toggle-label">
        <input type="checkbox" checked={cv[field] !== false} onChange={e => update(field, e.target.checked)} />
        <span>{label}</span>
      </label>
    </div>
  );

  return (
    <div className="cv-builder">
      {/* Editor Panel */}
      <div className="cv-editor no-print">
        <div className="cv-editor-header">
          <h1>CV Builder</h1>
          <p>One-page, best-practice resume — edit, style, and export.</p>
          <div className="cv-editor-actions">
            <button className="cv-fit-btn" onClick={handleFitToPage} title="Auto-shrink font size so the CV fits on one A4 page">
              {fitStatus === 'shrunk' ? '✓ Shrunk' : fitStatus === 'fits' ? '✓ Already fits' : fitStatus === 'floor' ? 'At 11pt floor — hide sections' : 'Fit to page'}
            </button>
            <button onClick={handleExportPDF}>Export PDF</button>
            <button onClick={handleExportJSON}>Save JSON</button>
            <button onClick={handleImportJSON}>Load JSON</button>
            <button onClick={handleReset} className="cv-reset-btn">Reset</button>
          </div>
        </div>

        <nav className="cv-panel-nav">
          {PANELS.map(p => (
            <button
              key={p.id}
              className={`cv-panel-btn ${activePanel === p.id ? 'active' : ''}`}
              onClick={() => setActivePanel(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>

        {activePanel === 'content' && (
        <div className="cv-panel cv-content-layout">
          <nav className="cv-content-nav">
            {CONTENT_SECTIONS.map(s => (
              <button
                key={s.id}
                className={`cv-content-nav-btn ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="cv-form">
          {/* Personal Info */}
          {activeSection === 'personal' && (
            <div className="cv-form-section">
              <h3>Personal Information</h3>
              <div className="cv-field">
                <label>Full Name</label>
                <input value={cv.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Lior Baum" />
              </div>
              <div className="cv-field">
                <label>Job Title</label>
                <input value={cv.title} onChange={e => update('title', e.target.value)} placeholder="Product & UX Designer" />
              </div>
              <div className="cv-field-row">
                <div className="cv-field">
                  <label>Email</label>
                  <input value={cv.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
                </div>
                <div className="cv-field">
                  <label>Phone</label>
                  <input value={cv.phone} onChange={e => update('phone', e.target.value)} placeholder="050-555-0409" />
                </div>
              </div>
              <div className="cv-field">
                <label>Location</label>
                <input value={cv.location} onChange={e => update('location', e.target.value)} placeholder="Tel Aviv, Israel" />
              </div>
              <div className="cv-field-row">
                <div className="cv-field">
                  <label>Portfolio URL</label>
                  <input value={cv.portfolio} onChange={e => update('portfolio', e.target.value)} placeholder="https://www.baumlior.com/" />
                </div>
                <div className="cv-field">
                  <label>LinkedIn</label>
                  <input value={cv.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/liorbaum" />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {activeSection === 'summary' && (
            <div className="cv-form-section">
              <h3>Professional Summary</h3>
              <SectionToggle label="Show in CV" field="showSummary" />
              <p className="cv-hint">2-3 sentences highlighting your experience, specialization, and value. Focus on impact, not just responsibilities.</p>
              <div className="cv-field">
                <textarea
                  value={cv.summary}
                  onChange={e => update('summary', e.target.value)}
                  placeholder="UX Designer with 5+ years of experience designing B2B SaaS and MedTech products. Specialized in complex workflows, design systems, and data-driven design decisions."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Experience */}
          {activeSection === 'experience' && (
            <div className="cv-form-section">
              <h3>Work Experience</h3>
              <SectionToggle label="Show in CV" field="showExperience" />
              <p className="cv-hint">List in reverse chronological order. Use action verbs and quantify impact where possible.</p>
              {cv.experience.map((exp, i) => (
                <div key={i} className="cv-card">
                  <div className="cv-card-header">
                    <span className="cv-card-num">{String(i + 1).padStart(2, '0')}</span>
                    <button className="cv-remove" onClick={() => removeArrayItem('experience', i)} disabled={cv.experience.length <= 1}>×</button>
                  </div>
                  <div className="cv-field-row">
                    <div className="cv-field">
                      <label>Company</label>
                      <input value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} placeholder="Company Name" />
                    </div>
                    <div className="cv-field">
                      <label>Role</label>
                      <input value={exp.role} onChange={e => updateArrayItem('experience', i, 'role', e.target.value)} placeholder="Senior UX Designer" />
                    </div>
                  </div>
                  <div className="cv-field-row">
                    <div className="cv-field">
                      <label>Period</label>
                      <input value={exp.period} onChange={e => updateArrayItem('experience', i, 'period', e.target.value)} placeholder="Dec 2024 — Present" />
                    </div>
                    <div className="cv-field">
                      <label>Location</label>
                      <input value={exp.location} onChange={e => updateArrayItem('experience', i, 'location', e.target.value)} placeholder="Tel Aviv, Israel" />
                    </div>
                  </div>
                  <div className="cv-field">
                    <label>Key Achievements</label>
                    {exp.bullets.map((bullet, j) => (
                      <div key={j} className="cv-bullet-row">
                        <input value={bullet} onChange={e => updateBullet(i, j, e.target.value)} placeholder="Led redesign of X, resulting in Y% improvement in Z" />
                        <button className="cv-bullet-remove" onClick={() => removeBullet(i, j)} disabled={exp.bullets.length <= 1}>×</button>
                      </div>
                    ))}
                    <button className="cv-add-small" onClick={() => addBullet(i)}>+ Add bullet</button>
                  </div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('experience', { company: '', role: '', period: '', location: '', bullets: [''] })}>+ Add Experience</button>
            </div>
          )}

          {/* Education */}
          {activeSection === 'education' && (
            <div className="cv-form-section">
              <h3>Education</h3>
              <SectionToggle label="Show in CV" field="showEducation" />
              {cv.education.map((edu, i) => (
                <div key={i} className="cv-card">
                  <div className="cv-card-header">
                    <span className="cv-card-num">{String(i + 1).padStart(2, '0')}</span>
                    <button className="cv-remove" onClick={() => removeArrayItem('education', i)} disabled={cv.education.length <= 1}>×</button>
                  </div>
                  <div className="cv-field-row">
                    <div className="cv-field"><label>Institution</label><input value={edu.institution} onChange={e => updateArrayItem('education', i, 'institution', e.target.value)} placeholder="University Name" /></div>
                    <div className="cv-field"><label>Degree</label><input value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} placeholder="BA in Visual Communication" /></div>
                  </div>
                  <div className="cv-field-row">
                    <div className="cv-field"><label>Period</label><input value={edu.period} onChange={e => updateArrayItem('education', i, 'period', e.target.value)} placeholder="Graduated: 2025" /></div>
                    <div className="cv-field"><label>Details (optional)</label><input value={edu.details} onChange={e => updateArrayItem('education', i, 'details', e.target.value)} placeholder="Honors, relevant coursework" /></div>
                  </div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('education', { institution: '', degree: '', period: '', details: '' })}>+ Add Education</button>
            </div>
          )}

          {/* Skills */}
          {activeSection === 'skills' && (
            <div className="cv-form-section">
              <h3>Skills</h3>
              <SectionToggle label="Show in CV" field="showSkills" />
              <p className="cv-hint">Group skills by category. Set display to "badges" for tools/tech or "list" for skills. Comma-separated.</p>
              {cv.skillCategories.map((cat, i) => (
                <div key={i} className="cv-card cv-card--compact">
                  <div className="cv-card-header">
                    <select
                      className="cv-display-select"
                      value={cat.display || 'list'}
                      onChange={e => updateArrayItem('skillCategories', i, 'display', e.target.value)}
                    >
                      <option value="list">List</option>
                      <option value="badges">Badges</option>
                    </select>
                    <button className="cv-remove" onClick={() => removeArrayItem('skillCategories', i)} disabled={cv.skillCategories.length <= 1}>×</button>
                  </div>
                  <div className="cv-field"><label>Category Name</label><input value={cat.name} onChange={e => updateArrayItem('skillCategories', i, 'name', e.target.value)} placeholder="Design Tools" /></div>
                  <div className="cv-field"><label>Skills (comma-separated)</label><input value={cat.skills} onChange={e => updateArrayItem('skillCategories', i, 'skills', e.target.value)} placeholder="Figma, Sketch, Adobe XD" /></div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('skillCategories', { name: '', skills: '', display: 'list' })}>+ Add Category</button>
            </div>
          )}

          {/* Projects */}
          {activeSection === 'projects' && (
            <div className="cv-form-section">
              <h3>Key Projects</h3>
              <SectionToggle label="Show in CV" field="showProjects" />
              <p className="cv-hint">Highlight 2-3 impactful projects. Focus on the problem, your role, and measurable outcomes.</p>
              {cv.projects.map((proj, i) => (
                <div key={i} className="cv-card">
                  <div className="cv-card-header">
                    <span className="cv-card-num">{String(i + 1).padStart(2, '0')}</span>
                    <button className="cv-remove" onClick={() => removeArrayItem('projects', i)} disabled={cv.projects.length <= 1}>×</button>
                  </div>
                  <div className="cv-field"><label>Project Name</label><input value={proj.name} onChange={e => updateArrayItem('projects', i, 'name', e.target.value)} placeholder="iTero Toolbar Redesign" /></div>
                  <div className="cv-field"><label>Description</label><textarea value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} placeholder="Redesigned the clinical scanning toolbar..." rows={2} /></div>
                  <div className="cv-field"><label>Impact</label><input value={proj.impact} onChange={e => updateArrayItem('projects', i, 'impact', e.target.value)} placeholder="Reduced task time by 35%" /></div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('projects', { name: '', description: '', impact: '' })}>+ Add Project</button>
            </div>
          )}

          {/* Certifications */}
          {activeSection === 'certifications' && (
            <div className="cv-form-section">
              <h3>Certifications</h3>
              <SectionToggle label="Show in CV" field="showCertifications" />
              {cv.certifications.map((cert, i) => (
                <div key={i} className="cv-card cv-card--compact">
                  <div className="cv-card-header"><button className="cv-remove" onClick={() => removeArrayItem('certifications', i)} disabled={cv.certifications.length <= 1}>×</button></div>
                  <div className="cv-field-row">
                    <div className="cv-field"><label>Name</label><input value={cert.name} onChange={e => updateArrayItem('certifications', i, 'name', e.target.value)} placeholder="Google UX Design Certificate" /></div>
                    <div className="cv-field"><label>Issuer</label><input value={cert.issuer} onChange={e => updateArrayItem('certifications', i, 'issuer', e.target.value)} placeholder="Google / Coursera" /></div>
                    <div className="cv-field" style={{maxWidth: '100px'}}><label>Year</label><input value={cert.year} onChange={e => updateArrayItem('certifications', i, 'year', e.target.value)} placeholder="2023" /></div>
                  </div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '' })}>+ Add Certification</button>
            </div>
          )}

          {/* Languages */}
          {activeSection === 'languages' && (
            <div className="cv-form-section">
              <h3>Languages</h3>
              <SectionToggle label="Show in CV" field="showLanguages" />
              {cv.languages.map((lang, i) => (
                <div key={i} className="cv-card cv-card--compact">
                  <div className="cv-card-header"><button className="cv-remove" onClick={() => removeArrayItem('languages', i)} disabled={cv.languages.length <= 1}>×</button></div>
                  <div className="cv-field-row">
                    <div className="cv-field"><label>Language</label><input value={lang.language} onChange={e => updateArrayItem('languages', i, 'language', e.target.value)} placeholder="English" /></div>
                    <div className="cv-field"><label>Level</label><input value={lang.level} onChange={e => updateArrayItem('languages', i, 'level', e.target.value)} placeholder="Native / Fluent" /></div>
                  </div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('languages', { language: '', level: '' })}>+ Add Language</button>
            </div>
          )}

          {/* Awards */}
          {activeSection === 'awards' && (
            <div className="cv-form-section">
              <h3>Awards & Recognition</h3>
              <SectionToggle label="Show in CV" field="showAwards" />
              {cv.awards.map((award, i) => (
                <div key={i} className="cv-card cv-card--compact">
                  <div className="cv-card-header"><button className="cv-remove" onClick={() => removeArrayItem('awards', i)} disabled={cv.awards.length <= 1}>×</button></div>
                  <div className="cv-field-row">
                    <div className="cv-field"><label>Title</label><input value={award.title} onChange={e => updateArrayItem('awards', i, 'title', e.target.value)} placeholder="Best Design Award" /></div>
                    <div className="cv-field"><label>Issuer</label><input value={award.issuer} onChange={e => updateArrayItem('awards', i, 'issuer', e.target.value)} placeholder="Design Week" /></div>
                    <div className="cv-field" style={{maxWidth: '100px'}}><label>Year</label><input value={award.year} onChange={e => updateArrayItem('awards', i, 'year', e.target.value)} placeholder="2023" /></div>
                  </div>
                </div>
              ))}
              <button className="cv-add-btn" onClick={() => addArrayItem('awards', { title: '', issuer: '', year: '' })}>+ Add Award</button>
            </div>
          )}

          {/* Volunteer */}
          {activeSection === 'volunteer' && (
            <div className="cv-form-section">
              <h3>Volunteer & Side Projects</h3>
              <SectionToggle label="Show in CV" field="showVolunteer" />
              <div className="cv-field">
                <textarea value={cv.volunteer} onChange={e => update('volunteer', e.target.value)} placeholder="UX mentor at ADPList, contributed to open-source design system..." rows={3} />
              </div>
            </div>
          )}

          </div>
        </div>
        )}

        {activePanel === 'design' && (
        <div className="cv-panel cv-design-panel">
          <div className="cv-design-section">
            <label>Style</label>
            <div className="cv-style-grid">
              {CV_STYLES.map(s => (
                <StyleTile key={s.id} id={s.id} label={s.label} active={cvStyle === s.id} onClick={() => setCvStyle(s.id)} />
              ))}
            </div>
          </div>

          <div className="cv-design-section">
            <label>Typography</label>
            <div className="cv-layout-control">
              <label>Font size</label>
              <div className="cv-layout-slider">
                <input type="range" min="11" max="14" step="0.25" value={cv.fontSize || 11} onChange={e => update('fontSize', parseFloat(e.target.value))} />
                <span>{(cv.fontSize || 11).toFixed(2).replace(/\.?0+$/, '')}pt</span>
              </div>
            </div>
            <div className="cv-layout-control">
              <label>Content width</label>
              <div className="cv-layout-slider">
                <input type="range" min="140" max="200" step="5" value={cv.contentWidth || 180} onChange={e => update('contentWidth', parseInt(e.target.value))} />
                <span>{cv.contentWidth || 180}mm</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {activePanel === 'sections' && (
        <div className="cv-panel">
          <div className="cv-form">
            <div className="cv-form-section">
              <h3>Manage sections</h3>
              <p className="cv-hint">Toggle which sections appear on your CV. Disabled sections are hidden from the preview and PDF.</p>
              <div className="cv-sections-manager">
                <SectionToggle label="Professional Summary" field="showSummary" />
                <SectionToggle label="Work Experience" field="showExperience" />
                <SectionToggle label="Education" field="showEducation" />
                <SectionToggle label="Skills" field="showSkills" />
                <SectionToggle label="Key Projects" field="showProjects" />
                <SectionToggle label="Certifications" field="showCertifications" />
                <SectionToggle label="Languages" field="showLanguages" />
                <SectionToggle label="Awards" field="showAwards" />
                <SectionToggle label="Volunteer & Side Projects" field="showVolunteer" />
              </div>
            </div>
          </div>
        </div>
        )}

        {activePanel === 'data' && (
        <div className="cv-panel">
          <div className="cv-form">
            <div className="cv-form-section cv-json-section">
              <h3>Edit the full JSON</h3>
              <p className="cv-hint">Paste or edit the JSON directly. Applying it merges into the current CV — only the fields you include get overwritten. Use <strong>Load Current CV</strong> to start from what's on the page now.</p>
              <textarea
                className="cv-json-textarea"
                value={jsonDraft}
                onChange={e => { setJsonDraft(e.target.value); setJsonStatus(''); }}
                placeholder="Paste your JSON here — or click Load Current CV to start editing what's on the page."
                spellCheck={false}
              />
              <div className="cv-json-actions">
                <button
                  className="cv-json-apply-btn"
                  onClick={() => {
                    try {
                      const data = JSON.parse(jsonDraft);
                      setCv(prev => ({ ...prev, ...data }));
                      setJsonStatus('applied');
                      setTimeout(() => setJsonStatus(''), 2500);
                    } catch {
                      setJsonStatus('error');
                      setTimeout(() => setJsonStatus(''), 3000);
                    }
                  }}
                  disabled={!jsonDraft.trim()}
                >
                  {jsonStatus === 'applied' ? '✓ Applied' : jsonStatus === 'error' ? 'Invalid JSON' : 'Apply JSON'}
                </button>
                <button
                  className="cv-json-current-btn"
                  onClick={() => { setJsonDraft(JSON.stringify(cv, null, 2)); setJsonStatus(''); }}
                >
                  Load Current CV
                </button>
                <button
                  className="cv-json-current-btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(JSON.stringify(cv, null, 2));
                      setCopyJsonStatus('copied');
                    } catch {
                      setCopyJsonStatus('error');
                    }
                    setTimeout(() => setCopyJsonStatus(''), 2500);
                  }}
                >
                  {copyJsonStatus === 'copied' ? '✓ Copied' : copyJsonStatus === 'error' ? 'Copy failed' : 'Copy JSON'}
                </button>
              </div>

              {/* AI-assist panel: copy a ready-made prompt containing the
                  schema + current CV JSON so the user can paste straight into
                  Claude/ChatGPT and ask for edits. */}
              <div className="cv-ai-panel">
                <h4>Ask an AI to edit your CV</h4>
                <p className="cv-hint">Copy the block below into any chat (Claude, ChatGPT, Cursor). It contains the full JSON schema, your current CV, and editing rules the AI should follow. Paste what the AI returns back into the textarea above and click <strong>Apply JSON</strong>.</p>
                <pre className="cv-json-example cv-ai-prompt">{buildAiPrompt(cv)}</pre>
                <div className="cv-json-actions">
                  <button
                    className="cv-json-apply-btn"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(buildAiPrompt(cv));
                        setCopyAiStatus('copied');
                      } catch {
                        setCopyAiStatus('error');
                      }
                      setTimeout(() => setCopyAiStatus(''), 2500);
                    }}
                  >
                    {copyAiStatus === 'copied' ? '✓ Copied prompt' : copyAiStatus === 'error' ? 'Copy failed' : 'Copy prompt for AI'}
                  </button>
                </div>
              </div>

              <div className="cv-json-reference">
                <h4>Your CV as JSON</h4>
                <p className="cv-hint">Live view of what's currently on the page. Updates as you edit.</p>
                <pre className="cv-json-example">{JSON.stringify(cv, null, 2)}</pre>
                <div className="cv-json-actions">
                  <button
                    className="cv-json-current-btn"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(JSON.stringify(cv, null, 2));
                        setCopySchemaStatus('copied');
                      } catch {
                        setCopySchemaStatus('error');
                      }
                      setTimeout(() => setCopySchemaStatus(''), 2500);
                    }}
                  >
                    {copySchemaStatus === 'copied' ? '✓ Copied' : copySchemaStatus === 'error' ? 'Copy failed' : 'Copy JSON'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* CV Preview / Print Target */}
      <div className="cv-preview-wrapper">
        <div className="cv-preview-actions no-print">
          <span className={`cv-fit-badge ${fits ? 'cv-fit-badge--ok' : 'cv-fit-badge--warn'}`}>
            <span className="cv-fit-badge-dot" />
            {fits ? 'Fits on one page' : `Overflows by ~${overflowMm}mm`}
          </span>
          <div className="cv-preview-actions-spacer" />
          {!fits && (
            <button className="cv-fit-btn" onClick={handleFitToPage}>
              {fitStatus === 'shrunk' ? '✓ Shrunk' : fitStatus === 'floor' ? 'At 11pt floor — hide sections' : 'Fit to page'}
            </button>
          )}
          <button onClick={handleExportPDF}>Export PDF</button>
        </div>
        <div className="cv-preview-stage">
        {parseCvStyle(cvStyle).layout === 'sidebar' ? (
          <SidebarCV cv={cv} theme={parseCvStyle(cvStyle).theme} innerRef={printRef} overflowing={!fits} />
        ) : parseCvStyle(cvStyle).layout === 'single' ? (
          <EditorialCV cv={cv} theme={parseCvStyle(cvStyle).theme} innerRef={printRef} overflowing={!fits} />
        ) : (
        <div className={`cv-preview cv-style-${cvStyle}${!fits ? ' is-overflowing' : ''}`} ref={printRef} style={{ '--cv-font-size': `${cv.fontSize || 11}pt`, '--cv-content-width': `${cv.contentWidth || 180}mm` }}>
          {/* Header */}
          <header className="cv-doc-header">
            <div className="cv-doc-header-left">
              <h1 className="cv-doc-name">{cv.fullName || 'LIOR BAUM'}</h1>
              <p className="cv-doc-title">{cv.title || 'Product & UX Designer'}</p>
            </div>
            <div className="cv-doc-header-right">
              {cv.portfolio && <div className="cv-doc-contact-item"><IconPortfolio /><span>{cv.portfolio}</span></div>}
              {cv.linkedin && <div className="cv-doc-contact-item"><IconLinkedIn /><span>{cv.linkedin}</span></div>}
              {cv.email && <div className="cv-doc-contact-item"><IconEmail /><span>{cv.email}</span></div>}
              {cv.phone && <div className="cv-doc-contact-item"><IconPhone /><span>{cv.phone}</span></div>}
              {cv.location && <div className="cv-doc-contact-item"><IconLocation /><span>{cv.location}</span></div>}
            </div>
          </header>

          {/* Summary */}
          {cv.showSummary !== false && cv.summary && (
            <section className="cv-doc-summary">
              <p>{cv.summary}</p>
            </section>
          )}

          {/* Two-column body */}
          <div className="cv-doc-body">
            {/* Left column */}
            <div className="cv-doc-col-left">
              {cv.showExperience !== false && cv.experience.some(e => e.company || e.role) && (
                <section className="cv-doc-section">
                  <h2>Experience</h2>
                  {cv.experience.filter(e => e.company || e.role).map((exp, i) => (
                    <div key={i} className="cv-doc-exp-item">
                      <div className="cv-doc-exp-header">
                        <span className="cv-doc-exp-company">{exp.company}</span>
                        {exp.role && <><span className="cv-doc-exp-sep">·</span><span className="cv-doc-exp-role">{exp.role}</span></>}
                      </div>
                      {exp.period && <span className="cv-doc-period-badge">{exp.period}</span>}
                      {exp.bullets.filter(b => b).length > 0 && (
                        <ul className="cv-doc-bullets">
                          {exp.bullets.filter(b => b).map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {cv.showProjects && cv.projects.some(p => p.name) && (
                <section className="cv-doc-section">
                  <h2>Key Projects</h2>
                  {cv.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="cv-doc-project">
                      <strong>{proj.name}</strong>
                      {proj.description && <p>{proj.description}</p>}
                      {proj.impact && <p className="cv-doc-impact">{proj.impact}</p>}
                    </div>
                  ))}
                </section>
              )}

              {cv.showVolunteer && cv.volunteer && (
                <section className="cv-doc-section">
                  <h2>Volunteer & Side Projects</h2>
                  <p className="cv-doc-body-text">{cv.volunteer}</p>
                </section>
              )}
            </div>

            {/* Right column */}
            <div className="cv-doc-col-right">
              {cv.showEducation !== false && cv.education.some(e => e.institution || e.degree) && (
                <section className="cv-doc-section">
                  <h2>Education</h2>
                  {cv.education.filter(e => e.institution || e.degree).map((edu, i) => (
                    <div key={i} className="cv-doc-edu-card">
                      <strong>{edu.institution}</strong>
                      {edu.period && <span className="cv-doc-edu-period">{edu.period}</span>}
                      {edu.degree && <p className="cv-doc-edu-degree">{edu.degree}</p>}
                      {edu.details && <p className="cv-doc-edu-details">{edu.details}</p>}
                    </div>
                  ))}
                </section>
              )}

              {cv.showSkills !== false && cv.skillCategories.some(c => c.name && c.skills) && (
                <>
                  {cv.skillCategories.filter(c => c.name && c.skills).map((cat, i) => (
                    <section key={i} className="cv-doc-section">
                      <h2>{cat.name}</h2>
                      {(cat.display === 'badges') ? (
                        <div className="cv-doc-badge-list">
                          {cat.skills.split(',').map((skill, j) => (
                            <span key={j} className="cv-doc-badge">{skill.trim()}</span>
                          ))}
                        </div>
                      ) : (
                        <ul className="cv-doc-skill-list">
                          {cat.skills.split(',').map((skill, j) => (
                            <li key={j}>{skill.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </>
              )}

              {cv.showCertifications && cv.certifications.some(c => c.name) && (
                <section className="cv-doc-section">
                  <h2>Certifications</h2>
                  {cv.certifications.filter(c => c.name).map((cert, i) => (
                    <div key={i} className="cv-doc-cert">
                      <strong>{cert.name}</strong>
                      {cert.issuer && <span className="cv-doc-cert-issuer">{cert.issuer}</span>}
                      {cert.year && <span className="cv-doc-cert-year">{cert.year}</span>}
                    </div>
                  ))}
                </section>
              )}

              {cv.showLanguages && cv.languages.some(l => l.language) && (
                <section className="cv-doc-section">
                  <h2>Languages</h2>
                  <div className="cv-doc-lang-list">
                    {cv.languages.filter(l => l.language).map((lang, i) => (
                      <span key={i} className="cv-doc-lang-pill">{lang.language}{lang.level ? ` — ${lang.level}` : ''}</span>
                    ))}
                  </div>
                </section>
              )}

              {cv.showAwards && cv.awards.some(a => a.title) && (
                <section className="cv-doc-section">
                  <h2>Awards</h2>
                  {cv.awards.filter(a => a.title).map((award, i) => (
                    <div key={i} className="cv-doc-cert">
                      <strong>{award.title}</strong>
                      {award.issuer && <span className="cv-doc-cert-issuer">{award.issuer}</span>}
                      {award.year && <span className="cv-doc-cert-year">{award.year}</span>}
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

// Editorial-family layout — single column, Fraunces/DM Sans, timeline-style
// entries, chip-grouped skills. The `theme` prop sets data-cv-theme on the
// root so the CSS can swap palette + fonts per variant (editorial / classic
// / modernist). Reuses the same cv data model as the default layout.
const EditorialIcon = ({ name }) => {
  const common = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'portfolio':
      return <svg {...common}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
    case 'linkedin':
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    case 'email':
      return <svg {...common}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case 'phone':
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    default:
      return null;
  }
};

const EditorialCV = ({ cv, theme, innerRef, overflowing }) => {
  const bullets = (exp) => (exp.bullets || []).filter(Boolean);
  const skills = (cv.skillCategories || []).filter(c => c.name || c.skills);
  const projects = (cv.projects || []).filter(p => p.name || p.description || p.impact);
  const certs = (cv.certifications || []).filter(c => c.name);
  const languages = (cv.languages || []).filter(l => l.language);
  const awards = (cv.awards || []).filter(a => a.title);
  const hasExperience = cv.showExperience !== false && (cv.experience || []).some(e => e.company || e.role || bullets(e).length);
  const hasEducation = cv.showEducation !== false && (cv.education || []).some(e => e.institution || e.degree);
  const hasSkills = cv.showSkills !== false && skills.length > 0;
  const hasProjects = cv.showProjects && projects.length > 0;
  const hasCerts = cv.showCertifications && certs.length > 0;
  const hasLanguages = cv.showLanguages && languages.length > 0;
  const hasAwards = cv.showAwards && awards.length > 0;
  const hasVolunteer = cv.showVolunteer && cv.volunteer;
  return (
    <div
      ref={innerRef}
      className={`cv-preview-editorial${overflowing ? ' is-overflowing' : ''}`}
      data-cv-theme={theme}
      style={{ '--cv-font-size': `${cv.fontSize || 11}pt`, '--cv-content-width': `${cv.contentWidth || 180}mm` }}
    >
      <header className="ed-header">
        <div className="ed-header-left">
          <h1 className="ed-name">{cv.fullName || 'Your Name'}</h1>
          {cv.title && <p className="ed-tagline">{cv.title}</p>}
        </div>
        <div className="ed-contact">
          {cv.portfolio && <div className="ed-contact-row"><EditorialIcon name="portfolio" /><span>{cv.portfolio}</span></div>}
          {cv.email && <div className="ed-contact-row"><EditorialIcon name="email" /><span>{cv.email}</span></div>}
          {cv.phone && <div className="ed-contact-row"><EditorialIcon name="phone" /><span>{cv.phone}</span></div>}
          {cv.linkedin && <div className="ed-contact-row"><EditorialIcon name="linkedin" /><span>{cv.linkedin}</span></div>}
        </div>
      </header>

      {cv.showSummary !== false && cv.summary && (
        <section className="ed-section">
          <p className="ed-summary">{cv.summary}</p>
        </section>
      )}

      {hasExperience && (
        <section className="ed-section">
          <h2 className="ed-section-title">Experience</h2>
          {cv.experience.filter(e => e.company || e.role || bullets(e).length).map((exp, i) => (
            <div key={i} className="ed-entry">
              <div className="ed-entry-head">
                <h3 className="ed-entry-title">{exp.role || exp.company}</h3>
                {exp.period && <span className="ed-entry-dates">{exp.period}</span>}
              </div>
              {(exp.company || exp.location) && (
                <p className="ed-entry-meta">
                  {exp.role && exp.company && <span>{exp.company}</span>}
                  {exp.role && exp.company && exp.location && <span className="ed-sep">·</span>}
                  {exp.location && <span className="ed-loc">{exp.location}</span>}
                </p>
              )}
              {bullets(exp).length > 0 && (
                <ul className="ed-bullets">
                  {bullets(exp).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {hasEducation && (
        <section className="ed-section">
          <h2 className="ed-section-title">Education</h2>
          {cv.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="ed-entry">
              <div className="ed-entry-head">
                <h3 className="ed-entry-title">{edu.degree || edu.institution}</h3>
                {edu.period && <span className="ed-entry-dates">{edu.period}</span>}
              </div>
              {edu.degree && edu.institution && (
                <p className="ed-entry-meta"><span>{edu.institution}</span></p>
              )}
              {edu.details && (
                <ul className="ed-bullets"><li>{edu.details}</li></ul>
              )}
            </div>
          ))}
        </section>
      )}

      {hasSkills && (
        <section className="ed-section">
          <h2 className="ed-section-title">Skills</h2>
          {skills.map((cat, i) => (
            <div key={i} className="ed-skills-group">
              <div className="ed-skills-label">{cat.name}</div>
              <div className="ed-chips">
                {(cat.skills || '').split(',').map(s => s.trim()).filter(Boolean).map((s, j) => (
                  <span key={j} className="ed-chip">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {hasProjects && (
        <section className="ed-section">
          <h2 className="ed-section-title">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="ed-entry">
              <div className="ed-entry-head">
                <h3 className="ed-entry-title">{p.name}</h3>
              </div>
              {p.description && <p className="ed-entry-meta" style={{ color: 'var(--ed-ink-2)', fontWeight: 400 }}>{p.description}</p>}
              {p.impact && <p className="ed-project-impact">{p.impact}</p>}
            </div>
          ))}
        </section>
      )}

      {hasCerts && (
        <section className="ed-section">
          <h2 className="ed-section-title">Certifications</h2>
          <div className="ed-certs">
            {certs.map((c, i) => (
              <div key={i} className="ed-cert-row">
                <strong>{c.name}</strong>
                {(c.issuer || c.year) && (
                  <span className="ed-cert-meta">{[c.issuer, c.year].filter(Boolean).join(', ')}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasLanguages && (
        <section className="ed-section">
          <h2 className="ed-section-title">Languages</h2>
          <div className="ed-langs">
            {languages.map((l, i) => (
              <span key={i} className="ed-lang-pill">
                {l.language}
                {l.level && <span className="ed-lang-level">{l.level}</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {hasAwards && (
        <section className="ed-section">
          <h2 className="ed-section-title">Awards</h2>
          <div className="ed-awards">
            {awards.map((a, i) => (
              <div key={i} className="ed-award-row">
                <strong>{a.title}</strong>
                {(a.issuer || a.year) && (
                  <span className="ed-award-meta">{[a.issuer, a.year].filter(Boolean).join(', ')}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasVolunteer && (
        <section className="ed-section">
          <h2 className="ed-section-title">Volunteer & Side Projects</h2>
          <p className="ed-volunteer">{cv.volunteer}</p>
        </section>
      )}
    </div>
  );
};

// Sidebar layout — same theme palette/fonts as EditorialCV, but with a
// left rail for contact + skills and the right column holding the main
// content (summary, experience, education). Swapping cvStyle between
// "<theme>" and "<theme>-sidebar" flips layouts without touching any data.
const SidebarCV = ({ cv, theme, innerRef, overflowing }) => {
  const bullets = (exp) => (exp.bullets || []).filter(Boolean);
  const skills = (cv.skillCategories || []).filter(c => c.name || c.skills);
  const projects = (cv.projects || []).filter(p => p.name || p.description || p.impact);
  const certs = (cv.certifications || []).filter(c => c.name);
  const languages = (cv.languages || []).filter(l => l.language);
  const awards = (cv.awards || []).filter(a => a.title);
  const hasExperience = cv.showExperience !== false && (cv.experience || []).some(e => e.company || e.role || bullets(e).length);
  const hasEducation = cv.showEducation !== false && (cv.education || []).some(e => e.institution || e.degree);
  const hasSkills = cv.showSkills !== false && skills.length > 0;
  const hasProjects = cv.showProjects && projects.length > 0;
  const hasCerts = cv.showCertifications && certs.length > 0;
  const hasLanguages = cv.showLanguages && languages.length > 0;
  const hasAwards = cv.showAwards && awards.length > 0;
  const hasVolunteer = cv.showVolunteer && cv.volunteer;
  return (
    <div
      ref={innerRef}
      className={`cv-preview-editorial cv-preview-sidebar${overflowing ? ' is-overflowing' : ''}`}
      data-cv-theme={theme}
      style={{ '--cv-font-size': `${cv.fontSize || 11}pt`, '--cv-content-width': `${cv.contentWidth || 180}mm` }}
    >
      <header className="ed-header sb-header">
        <h1 className="ed-name">{cv.fullName || 'Your Name'}</h1>
        {cv.title && <p className="ed-tagline">{cv.title}</p>}
      </header>

      <div className="sb-body">
        <aside className="sb-aside">
          <div className="sb-aside-block">
            <h2 className="ed-section-title">Contact</h2>
            <div className="sb-contact">
              {cv.portfolio && <div className="sb-contact-row">{cv.portfolio}</div>}
              {cv.email && <div className="sb-contact-row">{cv.email}</div>}
              {cv.phone && <div className="sb-contact-row">{cv.phone}</div>}
              {cv.linkedin && <div className="sb-contact-row">{cv.linkedin}</div>}
              {cv.location && <div className="sb-contact-row">{cv.location}</div>}
            </div>
          </div>

          {hasSkills && (
            <div className="sb-aside-block">
              <h2 className="ed-section-title">Skills</h2>
              {skills.map((cat, i) => (
                <div key={i} className="ed-skills-group sb-skills-group">
                  <div className="ed-skills-label">{cat.name}</div>
                  <div className="ed-chips">
                    {(cat.skills || '').split(',').map(s => s.trim()).filter(Boolean).map((s, j) => (
                      <span key={j} className="ed-chip">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasLanguages && (
            <div className="sb-aside-block">
              <h2 className="ed-section-title">Languages</h2>
              <div className="sb-lang-pills">
                {languages.map((l, i) => (
                  <span key={i} className="sb-lang-pill">
                    {l.language}{l.level ? ` · ${l.level}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasCerts && (
            <div className="sb-aside-block">
              <h2 className="ed-section-title">Certifications</h2>
              <div className="sb-compact-list">
                {certs.map((c, i) => (
                  <div key={i}>
                    <strong>{c.name}</strong>
                    {(c.issuer || c.year) && (
                      <span className="sb-compact-meta">{[c.issuer, c.year].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasAwards && (
            <div className="sb-aside-block">
              <h2 className="ed-section-title">Awards</h2>
              <div className="sb-compact-list">
                {awards.map((a, i) => (
                  <div key={i}>
                    <strong>{a.title}</strong>
                    {(a.issuer || a.year) && (
                      <span className="sb-compact-meta">{[a.issuer, a.year].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="sb-main">
          {cv.showSummary !== false && cv.summary && (
            <section className="ed-section">
              <p className="ed-summary">{cv.summary}</p>
            </section>
          )}

          {hasExperience && (
            <section className="ed-section">
              <h2 className="ed-section-title">Experience</h2>
              {cv.experience.filter(e => e.company || e.role || bullets(e).length).map((exp, i) => (
                <div key={i} className="ed-entry">
                  <div className="ed-entry-head">
                    <h3 className="ed-entry-title">{exp.role || exp.company}</h3>
                    {exp.period && <span className="ed-entry-dates">{exp.period}</span>}
                  </div>
                  {(exp.company || exp.location) && (
                    <p className="ed-entry-meta">
                      {exp.role && exp.company && <span>{exp.company}</span>}
                      {exp.role && exp.company && exp.location && <span className="ed-sep">·</span>}
                      {exp.location && <span className="ed-loc">{exp.location}</span>}
                    </p>
                  )}
                  {bullets(exp).length > 0 && (
                    <ul className="ed-bullets">
                      {bullets(exp).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {hasEducation && (
            <section className="ed-section">
              <h2 className="ed-section-title">Education</h2>
              {cv.education.filter(e => e.institution || e.degree).map((edu, i) => (
                <div key={i} className="ed-entry">
                  <div className="ed-entry-head">
                    <h3 className="ed-entry-title">{edu.degree || edu.institution}</h3>
                    {edu.period && <span className="ed-entry-dates">{edu.period}</span>}
                  </div>
                  {edu.degree && edu.institution && (
                    <p className="ed-entry-meta"><span>{edu.institution}</span></p>
                  )}
                  {edu.details && (
                    <ul className="ed-bullets"><li>{edu.details}</li></ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {hasProjects && (
            <section className="ed-section">
              <h2 className="ed-section-title">Projects</h2>
              {projects.map((p, i) => (
                <div key={i} className="ed-entry">
                  <div className="ed-entry-head">
                    <h3 className="ed-entry-title">{p.name}</h3>
                  </div>
                  {p.description && <p className="ed-entry-meta" style={{ color: 'var(--ed-ink-2)', fontWeight: 400 }}>{p.description}</p>}
                  {p.impact && <p className="ed-project-impact">{p.impact}</p>}
                </div>
              ))}
            </section>
          )}

          {hasVolunteer && (
            <section className="ed-section">
              <h2 className="ed-section-title">Volunteer & Side Projects</h2>
              <p className="ed-volunteer">{cv.volunteer}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default CVBuilder;
