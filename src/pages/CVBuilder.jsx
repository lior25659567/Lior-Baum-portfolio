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
  fullName: '',
  title: 'UX Designer',
  email: '',
  phone: '',
  location: '',
  portfolio: '',
  linkedin: '',
  summary: '',
  experience: [{ company: '', role: '', period: '', location: '', bullets: ['', ''] }],
  education: [{ institution: '', degree: '', period: '', details: '' }],
  skillCategories: [
    { name: 'Design Tools', skills: 'Figma, Sketch, Adobe XD, Framer, Principle', display: 'badges' },
    { name: 'Research Methods', skills: 'User Interviews, Usability Testing, A/B Testing, Surveys, Journey Mapping', display: 'list' },
    { name: 'Design Skills', skills: 'Interaction Design, Visual Design, Design Systems, Wireframing, Prototyping', display: 'list' },
    { name: 'Collaboration', skills: 'Agile/Scrum, Stakeholder Management, Cross-functional Teams, Design Critique', display: 'list' },
  ],
  projects: [{ name: '', description: '', impact: '' }],
  certifications: [{ name: '', issuer: '', year: '' }],
  languages: [{ language: '', level: '' }],
  awards: [{ title: '', issuer: '', year: '' }],
  volunteer: '',
  // Section visibility
  showSummary: true,
  showExperience: true,
  showEducation: true,
  showSkills: true,
  showProjects: true,
  showCertifications: false,
  showLanguages: false,
  showAwards: false,
  showVolunteer: false,
};

const STORAGE_KEY = 'portfolio_cv_builder';

const CVBuilder = () => {
  const [cv, setCv] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_CV, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CV;
  });
  const [activeSection, setActiveSection] = useState('personal');
  const printRef = useRef(null);

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

  const sections = [
    { id: 'personal', label: 'Personal' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certs' },
    { id: 'languages', label: 'Languages' },
    { id: 'awards', label: 'Awards' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'sections', label: 'Sections' },
  ];

  return (
    <div className="cv-builder">
      {/* Editor Panel */}
      <div className="cv-editor no-print">
        <div className="cv-editor-header">
          <h1>CV Builder</h1>
          <p>Best-practice UX Designer resume</p>
          <div className="cv-editor-actions">
            <button onClick={handleExportPDF}>Export PDF</button>
            <button onClick={handleExportJSON}>Save JSON</button>
            <button onClick={handleImportJSON}>Load JSON</button>
            <button onClick={handleReset} className="cv-reset-btn">Reset</button>
          </div>
        </div>

        <nav className="cv-sections-nav">
          {sections.map(s => (
            <button
              key={s.id}
              className={`cv-nav-btn ${activeSection === s.id ? 'active' : ''}`}
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

          {/* Sections Manager */}
          {activeSection === 'sections' && (
            <div className="cv-form-section">
              <h3>Manage Sections</h3>
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
          )}
        </div>
      </div>

      {/* CV Preview / Print Target */}
      <div className="cv-preview-wrapper">
        <div className="cv-preview" ref={printRef}>
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
                  <div className="cv-doc-timeline">
                    {cv.experience.filter(e => e.company || e.role).map((exp, i) => (
                      <div key={i} className="cv-doc-timeline-item">
                        <div className="cv-doc-timeline-dot" />
                        <div className="cv-doc-timeline-content">
                          <div className="cv-doc-exp-header">
                            <span className="cv-doc-exp-company">{exp.company}</span>
                            {exp.role && <><span className="cv-doc-exp-sep">|</span><span className="cv-doc-exp-role">{exp.role}</span></>}
                          </div>
                          {exp.period && <span className="cv-doc-period-badge">{exp.period}</span>}
                          {exp.bullets.filter(b => b).length > 0 && (
                            <ul className="cv-doc-bullets">
                              {exp.bullets.filter(b => b).map((b, j) => <li key={j}>{b}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                      {edu.period && <span className="cv-doc-period-badge">{edu.period}</span>}
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
      </div>
    </div>
  );
};

export default CVBuilder;
