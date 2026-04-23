import { useEffect, useState } from 'react';
import { useEdit } from '../context/EditContext';
import './EditPanel.css';

const EditPanel = () => {
  const {
    editMode,
    showPanel,
    setShowPanel,
    activeSection,
    setActiveSection,
    content,
    updateContent,
    updateNestedContent,
    styles,
    updateStyles,
    resetToDefaults,
  } = useEdit();

  const [expandedProject, setExpandedProject] = useState(null);

  /* Tracks the viewport width so the per-breakpoint slide-padding editor can
     highlight which zone is currently live. */
  const [viewportW, setViewportW] = useState(
    typeof window === 'undefined' ? 1024 : window.innerWidth
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!editMode || !showPanel) return null;

  const sections = [
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'typography', label: 'Typography', icon: '🔤' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'spacing', label: 'Spacing', icon: '📐' },
    { id: 'projects', label: 'Projects', icon: '📁' },
  ];

  const fontOptions = [
    { value: "'Crimson Text', Georgia, serif", label: 'Crimson Text' },
    { value: "'Mona Sans', system-ui, sans-serif", label: 'Mona Sans' },
    { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
    { value: "'Poppins', system-ui, sans-serif", label: 'Poppins' },
    { value: "'Space Grotesk', system-ui, sans-serif", label: 'Space Grotesk' },
    { value: "'DM Sans', system-ui, sans-serif", label: 'DM Sans' },
    { value: "Georgia, serif", label: 'Georgia' },
    { value: "system-ui, sans-serif", label: 'System UI' },
  ];

  const weightOptions = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi-Bold (600)' },
  ];

  return (
    <div className="edit-panel">
      <div className="edit-panel-header">
        <h3>✏️ Edit Mode</h3>
        <div className="panel-actions">
          <button className="reset-btn" onClick={resetToDefaults}>
            Reset All
          </button>
          <button className="close-btn" onClick={() => setShowPanel(false)}>
            ×
          </button>
        </div>
      </div>

      <div className="edit-panel-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`tab-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="tab-icon">{section.icon}</span>
            <span className="tab-label">{section.label}</span>
          </button>
        ))}
      </div>

      <div className="edit-panel-content">
        {/* Content Section */}
        {activeSection === 'content' && (
          <div className="edit-section">
            <h4>Hero Section</h4>
            <div className="edit-group">
              <label>Label</label>
              <input
                type="text"
                value={content.hero.label}
                onChange={(e) => updateContent('hero', 'label', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Greeting</label>
              <input
                type="text"
                value={content.hero.greeting}
                onChange={(e) => updateContent('hero', 'greeting', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Name</label>
              <input
                type="text"
                value={content.hero.name}
                onChange={(e) => updateContent('hero', 'name', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Description</label>
              <textarea
                value={content.hero.description}
                onChange={(e) => updateContent('hero', 'description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="edit-group">
              <label>CV Link</label>
              <input
                type="text"
                value={content.hero.cvLink || 'https://drive.google.com/file/d/1wdnZiNuaSKB_TByqJm4TYQ7Cbg2W6sND/view?usp=sharing'}
                onChange={(e) => updateContent('hero', 'cvLink', e.target.value)}
                placeholder="https://drive.google.com/... or /resume.pdf"
              />
              <small className="field-hint">Link or file path for your CV (used in all CV buttons)</small>
            </div>

            <h4>Footer Section</h4>
            <div className="edit-group">
              <label>Line 1</label>
              <input
                type="text"
                value={content.footer.line1}
                onChange={(e) => updateContent('footer', 'line1', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Line 2 (part 1)</label>
              <input
                type="text"
                value={content.footer.line2_1}
                onChange={(e) => updateContent('footer', 'line2_1', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Line 2 (highlight)</label>
              <input
                type="text"
                value={content.footer.line2_2}
                onChange={(e) => updateContent('footer', 'line2_2', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Line 3</label>
              <input
                type="text"
                value={content.footer.line3_1}
                onChange={(e) => updateContent('footer', 'line3_1', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Line 4 (highlight)</label>
              <input
                type="text"
                value={content.footer.line4}
                onChange={(e) => updateContent('footer', 'line4', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Email</label>
              <input
                type="email"
                value={content.footer.email}
                onChange={(e) => updateContent('footer', 'email', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Copyright Name</label>
              <input
                type="text"
                value={content.footer.copyright}
                onChange={(e) => updateContent('footer', 'copyright', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Typography Section */}
        {activeSection === 'typography' && (
          <div className="edit-section">
            <h4>Fonts</h4>
            <div className="edit-group">
              <label>Display Font (Headings)</label>
              <select
                value={styles.fonts.display}
                onChange={(e) => updateStyles('fonts', 'display', e.target.value)}
              >
                {fontOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="edit-group">
              <label>Body Font (Text)</label>
              <select
                value={styles.fonts.body}
                onChange={(e) => updateStyles('fonts', 'body', e.target.value)}
              >
                {fontOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <h4>Font Weights</h4>
            <div className="edit-group">
              <label>Normal Weight</label>
              <select
                value={styles.fontWeights.normal}
                onChange={(e) => updateStyles('fontWeights', 'normal', e.target.value)}
              >
                {weightOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="edit-group">
              <label>Medium Weight</label>
              <select
                value={styles.fontWeights.medium}
                onChange={(e) => updateStyles('fontWeights', 'medium', e.target.value)}
              >
                {weightOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="edit-group">
              <label>Semi-Bold Weight</label>
              <select
                value={styles.fontWeights.semibold}
                onChange={(e) => updateStyles('fontWeights', 'semibold', e.target.value)}
              >
                {weightOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <h4>Font Sizes</h4>
            <div className="edit-group">
              <label>Hero Name Size</label>
              <input
                type="text"
                value={styles.fontSizes.heroName}
                onChange={(e) => updateStyles('fontSizes', 'heroName', e.target.value)}
                placeholder="e.g., clamp(3rem, 8vw, 6rem)"
              />
            </div>
            <div className="edit-group">
              <label>Section Title Size</label>
              <input
                type="text"
                value={styles.fontSizes.sectionTitle}
                onChange={(e) => updateStyles('fontSizes', 'sectionTitle', e.target.value)}
                placeholder="e.g., clamp(2rem, 5vw, 4rem)"
              />
            </div>
            <div className="edit-group">
              <label>Body Text Size</label>
              <input
                type="text"
                value={styles.fontSizes.bodyText}
                onChange={(e) => updateStyles('fontSizes', 'bodyText', e.target.value)}
                placeholder="e.g., 1.1rem"
              />
            </div>
          </div>
        )}

        {/* Colors Section */}
        {activeSection === 'colors' && (
          <div className="edit-section">
            <h4>Brand Colors</h4>
            <div className="edit-group color-group">
              <label>Accent Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={styles.colors.accent}
                  onChange={(e) => updateStyles('colors', 'accent', e.target.value)}
                />
                <input
                  type="text"
                  value={styles.colors.accent}
                  onChange={(e) => updateStyles('colors', 'accent', e.target.value)}
                />
              </div>
            </div>
            <div className="edit-group color-group">
              <label>Light Background</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={styles.colors.background}
                  onChange={(e) => updateStyles('colors', 'background', e.target.value)}
                />
                <input
                  type="text"
                  value={styles.colors.background}
                  onChange={(e) => updateStyles('colors', 'background', e.target.value)}
                />
              </div>
            </div>
            <div className="edit-group color-group">
              <label>Dark Background</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={styles.colors.backgroundDark}
                  onChange={(e) => updateStyles('colors', 'backgroundDark', e.target.value)}
                />
                <input
                  type="text"
                  value={styles.colors.backgroundDark}
                  onChange={(e) => updateStyles('colors', 'backgroundDark', e.target.value)}
                />
              </div>
            </div>
            <div className="edit-group color-group">
              <label>Text Color (Light)</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={styles.colors.text}
                  onChange={(e) => updateStyles('colors', 'text', e.target.value)}
                />
                <input
                  type="text"
                  value={styles.colors.text}
                  onChange={(e) => updateStyles('colors', 'text', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Spacing Section */}
        {activeSection === 'spacing' && (
          <div className="edit-section">
            <h4>Layout Spacing</h4>
            <div className="edit-group">
              <label>Section Padding</label>
              <input
                type="text"
                value={styles.spacing.sectionPadding}
                onChange={(e) => updateStyles('spacing', 'sectionPadding', e.target.value)}
                placeholder="e.g., 6rem"
              />
            </div>
            <div className="edit-group">
              <label>Container Max Width</label>
              <input
                type="text"
                value={styles.spacing.containerMaxWidth}
                onChange={(e) => updateStyles('spacing', 'containerMaxWidth', e.target.value)}
                placeholder="e.g., 1400px"
              />
            </div>
            <div className="edit-group">
              <label>Default Gap</label>
              <input
                type="text"
                value={styles.spacing.gap}
                onChange={(e) => updateStyles('spacing', 'gap', e.target.value)}
                placeholder="e.g., 2rem"
              />
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.25rem' }}>
              Case Study Slides — per breakpoint
            </h4>
            <p style={{ fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.45, marginBottom: '0.75rem' }}>
              <strong>H</strong> sets left <em>and</em> right together.
              <strong> V</strong> sets top <em>and</em> bottom together.
              Enter a number (defaults to px) or any CSS length (e.g. <code>6rem</code>, <code>4vw</code>).
              The row highlighted in accent is what your current viewport sees ({viewportW}px).
            </p>
            {(() => {
              /* Ordered mobile-first. `min` is inclusive lower bound of the
                 zone; used to decide which zone the current viewport is in. */
              const zones = [
                { id: 'mobile',    label: 'Mobile',     range: '0 – 767',      min: 0,    dx: '24px',  dy: '56px'  },
                { id: 'tablet',    label: 'Tablet',     range: '768 – 1023',   min: 768,  dx: '36px',  dy: '48px'  },
                { id: 'desktop',   label: 'Desktop',    range: '1024 – 1439',  min: 1024, dx: '80px',  dy: '128px' },
                { id: 'large',     label: 'Large',      range: '1440 – 1919',  min: 1440, dx: '64px',  dy: '96px'  },
                { id: 'ultrawide', label: 'Ultrawide',  range: '1920 – 2399',  min: 1920, dx: '128px', dy: '120px' },
                { id: 'fourK',     label: '4K',         range: '2400+',        min: 2400, dx: '144px', dy: '128px' },
              ];
              const activeId = [...zones].reverse().find((z) => viewportW >= z.min)?.id;
              return zones.map((bp) => {
                const zone = styles.spacing.slidePad?.[bp.id] || {};
                const isActive = bp.id === activeId;
                const writeZone = (axis, value) => updateStyles('spacing', 'slidePad', {
                  ...(styles.spacing.slidePad || {}),
                  [bp.id]: { ...zone, [axis]: value },
                });
                const clearZone = () => updateStyles('spacing', 'slidePad', {
                  ...(styles.spacing.slidePad || {}),
                  [bp.id]: { x: '', y: '' },
                });
                return (
                  <div
                    key={bp.id}
                    style={{
                      marginBottom: '0.6rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border, rgba(255,255,255,0.12))',
                      background: isActive ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{bp.label}</span>
                        <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>{bp.range}px</span>
                        {isActive && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: 'var(--color-accent)', color: '#fff' }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={clearZone}
                        title="Reset to default"
                        style={{
                          fontSize: '0.7rem',
                          opacity: 0.6,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        reset
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          H (left + right)
                        </span>
                        <input
                          type="text"
                          value={zone.x ?? ''}
                          onChange={(e) => writeZone('x', e.target.value)}
                          placeholder={bp.dx}
                          inputMode="numeric"
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          V (top + bottom)
                        </span>
                        <input
                          type="text"
                          value={zone.y ?? ''}
                          onChange={(e) => writeZone('y', e.target.value)}
                          placeholder={bp.dy}
                          inputMode="numeric"
                        />
                      </label>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Projects Section */}
        {activeSection === 'projects' && (
          <div className="edit-section">
            <h4>Projects Section</h4>
            <div className="edit-group">
              <label>Section Label</label>
              <input
                type="text"
                value={content.projects.sectionLabel}
                onChange={(e) => updateContent('projects', 'sectionLabel', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label>Section Title</label>
              <input
                type="text"
                value={content.projects.sectionTitle}
                onChange={(e) => updateContent('projects', 'sectionTitle', e.target.value)}
              />
            </div>

            <h4>Project Cards</h4>
            {content.projects.items.map((project, index) => (
              <div key={project.id} className="project-edit-card">
                <button 
                  className="project-toggle"
                  onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                >
                  <span>{project.title}</span>
                  <span>{expandedProject === index ? '−' : '+'}</span>
                </button>
                {expandedProject === index && (
                  <div className="project-edit-fields">
                    <div className="edit-group">
                      <label>Project Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updateNestedContent('projects', index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="edit-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) => updateNestedContent('projects', index, 'category', e.target.value)}
                      />
                    </div>
                    <div className="edit-group">
                      <label>Year</label>
                      <input
                        type="text"
                        value={project.year}
                        onChange={(e) => updateNestedContent('projects', index, 'year', e.target.value)}
                      />
                    </div>
                    <div className="edit-group">
                      <label>Image URL</label>
                      <input
                        type="text"
                        value={project.image}
                        onChange={(e) => updateNestedContent('projects', index, 'image', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="edit-panel-footer">
        <span className="hint">Press Cmd+E (Mac) or Ctrl+E (Windows) to toggle edit mode</span>
      </div>
    </div>
  );
};

export default EditPanel;

