import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEdit } from '../context/EditContext';
import { slideTemplates, templateCategories } from '../data/caseStudyData';
import { sharedComponentsDocs } from '../data/slideTemplateDocs';
import {
  buildTemplateDocumentation,
  getUndocumentedTemplates,
} from '../data/templateIntrospection';
import { TemplatePreview } from './CaseStudy';
import './SlideDocumentation.css';

/* ── Semantic badge ─────────────────────────────────────── */
function Badge({ children, variant = 'default' }) {
  return <span className={`docs-badge docs-badge--${variant}`}>{children}</span>;
}

/* ── Field type display ─────────────────────────────────── */
function FieldType({ field }) {
  const label =
    field.semantic === 'unknown'
      ? field.jsType
      : `${field.jsType} / ${field.semantic}`;
  return <code className="docs-field-type">{label}</code>;
}

/* ── Single template card ───────────────────────────────── */
function TemplateCard({ doc }) {
  const { key, type, category, fields, fieldCount, hasDocumentation, docs } = doc;
  const fieldEntries = Object.entries(fields);

  return (
    <div className="docs-template-card" id={`template-${key}`}>
      {/* Header */}
      <div className="docs-template-header">
        <h3 className="docs-template-name">{key}</h3>
        <div className="docs-template-badges">
          <Badge variant="category">{category}</Badge>
          {key !== type && <Badge variant="type">type: {type}</Badge>}
          <Badge variant="count">{fieldCount} fields</Badge>
          {!hasDocumentation && <Badge variant="warn">needs docs</Badge>}
        </div>
      </div>

      {/* Short description */}
      {docs?.shortDescription && (
        <p className="docs-template-short">{docs.shortDescription}</p>
      )}

      {/* Purpose & When to Use */}
      {docs ? (
        <div className="docs-template-meta">
          <div className="docs-meta-row">
            <strong>Purpose:</strong> {docs.purpose}
          </div>
          <div className="docs-meta-row">
            <strong>When to use:</strong> {docs.whenToUse}
          </div>
          {docs.layoutDescription && (
            <div className="docs-meta-row">
              <strong>Layout:</strong> {docs.layoutDescription}
            </div>
          )}
        </div>
      ) : (
        <p className="docs-template-undoc">
          Auto-detected template — human documentation not yet written.
        </p>
      )}

      {/* Media Support */}
      {docs?.mediaFields && (
        <div className="docs-open-section docs-media-info">
          <h4 className="docs-section-label">Media Support</h4>
          {docs.mediaFields.length > 0 ? (
            <table className="docs-table docs-table--media">
              <thead>
                <tr><th>Field</th><th>Type</th><th>Description</th></tr>
              </thead>
              <tbody>
                {docs.mediaFields.map((mf) => (
                  <tr key={mf.field}>
                    <td><code>{mf.field}</code></td>
                    <td>{mf.type}</td>
                    <td>{mf.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="docs-no-media">No media fields — this is a text-only template.</p>
          )}
        </div>
      )}

      {/* Required / Optional fields */}
      {docs && (docs.requiredFields || docs.optionalFields) && (
        <div className="docs-field-groups">
          {docs.requiredFields?.length > 0 && (
            <div className="docs-field-group">
              <strong>Required:</strong>{' '}
              {docs.requiredFields.map((f) => (
                <code key={f} className="docs-field-name">{f}</code>
              ))}
            </div>
          )}
          {docs.optionalFields?.length > 0 && (
            <div className="docs-field-group">
              <strong>Optional:</strong>{' '}
              {docs.optionalFields.map((f) => (
                <code key={f} className="docs-field-name">{f}</code>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content limits */}
      {docs?.contentLimits && (
        <div className="docs-open-section">
          <h4 className="docs-section-label">Content Limits</h4>
          <table className="docs-table">
            <thead>
              <tr><th>Field</th><th>Limit</th><th>Recommended</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {Object.entries(docs.contentLimits).map(([field, limits]) => (
                <tr key={field}>
                  <td><code>{field}</code></td>
                  <td>{limits.max ?? limits.min ? `${limits.min ? `min ${limits.min}, ` : ''}${limits.max ? `max ${limits.max}` : ''}` : '—'}</td>
                  <td>{limits.recommended || '—'}</td>
                  <td>{limits.note || limits.default ? `Default: ${limits.default}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Selection Hints */}
      {docs?.aiSelectionHints && (
        <div className="docs-open-section">
          <h4 className="docs-section-label">AI Selection Hints</h4>
          <div className="docs-ai-hints">
            <div className="docs-meta-row">
              <strong>Priority:</strong> {docs.aiSelectionHints.priority} (lower = more important)
            </div>
            {docs.aiSelectionHints.required && (
              <div className="docs-meta-row"><Badge variant="required">Required in every case study</Badge></div>
            )}
            <div className="docs-meta-row">
              <strong>Trigger signals:</strong>{' '}
              {docs.aiSelectionHints.signals.map((s) => (
                <Badge key={s} variant="signal">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Special behaviors */}
      {docs?.specialBehaviors?.length > 0 && (
        <div className="docs-open-section">
          <h4 className="docs-section-label">Special Behaviors</h4>
          <ul className="docs-behavior-list">
            {docs.specialBehaviors.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {/* Auto-derived field inventory */}
      <div className="docs-open-section">
        <h4 className="docs-section-label">Field Inventory ({fieldCount} fields — auto-synced)</h4>
        <table className="docs-table docs-table--fields">
          <thead>
            <tr><th>Field</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            {fieldEntries.map(([name, info]) => (
              <tr key={name}>
                <td><code>{name}</code></td>
                <td><FieldType field={info} /></td>
                <td className="docs-default-val">{info.defaultDisplay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Example JSON */}
      {docs?.exampleUsage && (
        <div className="docs-open-section">
          <h4 className="docs-section-label">Example Slide Structure</h4>
          <pre className="docs-code-block">
            {JSON.stringify(docs.exampleUsage, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
const SlideDocumentation = () => {
  const { editMode } = useEdit();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState(null);
  const [previewSlide, setPreviewSlide] = useState(null); // template key for full-screen preview

  // Keyboard navigation for slide preview
  useEffect(() => {
    if (!previewSlide) return;
    const allKeys = Object.keys(slideTemplates);
    const handler = (e) => {
      if (e.key === 'Escape') setPreviewSlide(null);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const idx = allKeys.indexOf(previewSlide);
        setPreviewSlide(allKeys[(idx - 1 + allKeys.length) % allKeys.length]);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const idx = allKeys.indexOf(previewSlide);
        setPreviewSlide(allKeys[(idx + 1) % allKeys.length]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewSlide]);

  useEffect(() => {
    if (!editMode) navigate('/', { replace: true });
  }, [editMode, navigate]);

  const allDocs = useMemo(() => {
    return buildTemplateDocumentation();
  }, []);

  const undocumented = useMemo(() => {
    return getUndocumentedTemplates();
  }, []);

  // Group by category (preserve templateCategories order), skip Custom
  const grouped = useMemo(() => {
    const map = {};
    for (const doc of allDocs) {
      if (!map[doc.category]) map[doc.category] = [];
      map[doc.category].push(doc);
    }
    const ordered = [];
    for (const cat of Object.keys(templateCategories)) {
      if (cat === 'Custom') continue;
      if (map[cat]) ordered.push({ category: cat, templates: map[cat] });
    }
    for (const doc of allDocs) {
      if (!Object.keys(templateCategories).includes(doc.category) && doc.category !== 'Custom') {
        const existing = ordered.find((g) => g.category === doc.category);
        if (existing) existing.templates.push(doc);
        else ordered.push({ category: doc.category, templates: [doc] });
      }
    }
    return ordered;
  }, [allDocs]);

  const handleCopyAll = useCallback(() => {
    if (!contentRef.current) return;
    const text = contentRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus(null), 2000);
    }).catch(() => {
      // Fallback: select all text
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setCopyStatus('selected');
      setTimeout(() => setCopyStatus(null), 2000);
    });
  }, []);

  if (!editMode) return null;

  return (
    <div className="docs-page">
      {/* Sticky copy button */}
      <button className={`docs-copy-btn ${copyStatus ? 'docs-copy-btn--done' : ''}`} onClick={handleCopyAll}>
        {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'selected' ? 'Selected!' : 'Copy All for ChatGPT'}
      </button>

      <div ref={contentRef}>
        {/* Header */}
        <header className="docs-header">
          <h1>Slide Template Documentation</h1>
          <p className="docs-subtitle">
            Auto-synchronized reference for all {allDocs.length} slide templates across{' '}
            {grouped.length} categories.
          </p>
          <p className="docs-hint">
            This documentation auto-updates when templates are added or modified in{' '}
            caseStudyData.js. Use it as a reference for building case study slides.
          </p>
        </header>

        {/* Slide Template Showcase */}
        <section className="docs-section docs-showcase" id="template-showcase">
          <h2>Slide Template Showcase</h2>
          <p className="docs-subtitle">Visual preview of all {Object.keys(slideTemplates).length} available slide templates.</p>
          <div className="docs-showcase-grid">
            {Object.keys(slideTemplates).map((key) => (
              <button key={key} type="button" className="docs-showcase-card" onClick={() => setPreviewSlide(key)}>
                <div className="docs-showcase-preview">
                  <TemplatePreview type={key} />
                </div>
                <div className="docs-showcase-name">{key}</div>
              </button>
            ))}
          </div>
        </section>

        {/* AI Prompt Guide */}
        <section className="docs-section docs-prompt-guide" id="ai-prompt-guide">
          <h2>How to Use This Documentation with AI</h2>
          <p>
            This documentation is designed to be copied and pasted into ChatGPT (or any AI) so it can generate case study slides for you. Here is how to use it:
          </p>

          <div className="docs-guide-steps">
            <div className="docs-guide-step">
              <h4>Step 1: Copy</h4>
              <p>Click the "Copy All for ChatGPT" button at the top right. This copies the entire documentation as plain text.</p>
            </div>
            <div className="docs-guide-step">
              <h4>Step 2: Paste + Prompt</h4>
              <p>Paste it into ChatGPT, then add your project details below. Use the prompt template below as a starting point.</p>
            </div>
            <div className="docs-guide-step">
              <h4>Step 3: Get Slides</h4>
              <p>ChatGPT will return a JSON slides array. Copy the JSON and paste it into the case study editor.</p>
            </div>
          </div>

          <h3>Prompt Template</h3>
          <p>Copy the prompt below after pasting the documentation. Replace the placeholder text with your actual project details:</p>

          <pre className="docs-code-block docs-prompt-block">{`Based on the slide template documentation above, generate a complete case study presentation as a JSON slides array.

PROJECT DETAILS:
- Project name: [Your project name]
- Client: [Client name]
- Your role: [Your role]
- Duration: [Timeline]
- Industry: [Industry/domain]
- Problem: [Brief description of the problem you solved]
- Solution: [Brief description of your solution]
- Key results: [Metrics, outcomes, or impact]
- Tools used: [Figma, Maze, etc.]

INSTRUCTIONS:
1. Return ONLY a valid JSON array of slide objects. No explanation, no markdown — just the array.
2. Every slide must have a "type" field matching one of the template names from the documentation.
3. Use only the fields documented for each template. Do not invent new fields.
4. Follow the content limits (max paragraphs, max bullets, recommended lengths).
5. Use the AI Selection Guide to pick the right template for each section.
6. Structure the presentation like a real UX case study:
   - Start with "intro" (required)
   - Then "info" for project overview
   - Use "chapter" slides sparingly — only for 2-3 major transitions (e.g., Problem → Solution → Results). Do NOT add a chapter before every section. Too many chapters break the flow and feel repetitive.
   - Walk through: Context → Problem → Research → Goals → Process → Solution → Results
   - End with "end" (required)
7. Write real, professional content — not placeholder text.
8. Keep bullet points concise (5-10 words each).
9. Keep paragraphs focused (2-3 sentences each).
10. Use "comparison" template for any before/after or problem/solution visuals. It supports three modes: simple side-by-side, before/after with a draggable slider, and tabbed view with pill or flat switcher styles.
11. MEDIA FIELDS — VERY IMPORTANT: Each template documents which fields support media. Check the "Media Support" section for each template.
    Supported media types across the system: images (JPG/PNG/SVG/WebP), videos (MP4/WebM), GIFs, Figma prototype embeds, and website/iframe embeds.
    - Templates with "image gallery (up to 3)": intro, media, projectShowcase, textAndImage — these support up to 3 media items per field.
    - Templates with "single image": comparison (beforeImage, afterImage) — max 1 per side.
    - Templates with "image array (up to 24)": imageMosaic — tiled grid background.
    - The "media" template supports images, videos, GIFs, Figma embeds, and video URL embeds.
    - For image fields: set to "" (empty string). I will upload images manually later.
    - For image arrays: provide items with src: "" and a descriptive caption. Example: { src: "", caption: "Screenshot of the old dashboard" }
    - For video/media fields: set to "" unless I provide a URL.
    - If a template has NO media fields (info, chapter, quotes, testimonial, goals, etc.), it is text-only — do NOT add image fields.
    - IMPORTANT: Always add a caption or description for media fields so I know what to upload there.
12. DO NOT use every slide type — only pick the templates that genuinely fit the content. Quality over quantity. If the project doesn't have stats, don't force a stats slide. If there's no before/after, skip comparison. Use what makes sense for the story.
13. "textAndImage" is the most versatile template — it supports text on one side and up to 3 media items on the other, with multiple layout options (left/right image, split ratios). Use it as your default choice when content doesn't clearly fit a more specialized template.
14. Aim for 12-20 focused slides rather than 25+ padded ones. Every slide should earn its place.

Return the JSON array now.`}</pre>

          <h3>Tips for Better Results</h3>
          <ul className="docs-tips-list">
            <li><strong>Be specific about your project</strong> — the more detail you give about the problem, process, and results, the better the slides will be.</li>
            <li><strong>Less is more</strong> — a focused 15-slide presentation is stronger than a padded 30-slide one. Only use templates that genuinely fit your content.</li>
            <li><strong>Default to textAndImage</strong> — it's the most versatile template with text + media side-by-side, multiple layout options, and split ratios. Use it whenever content doesn't clearly need a specialized template.</li>
            <li><strong>Specify which templates to use</strong> — if you want specific templates, list them: "Use intro, info, chapter, textAndImage, media, comparison, stats, and end."</li>
            <li><strong>Ask for iterations</strong> — after getting the first result, ask ChatGPT to refine specific slides or add more detail to certain sections.</li>
            <li><strong>Include research quotes</strong> — if you have real user quotes, include them in your prompt so ChatGPT can use the "quotes" or "testimonial" templates.</li>
            <li><strong>Provide metrics</strong> — real numbers make the "stats" template much more impactful than generic placeholders.</li>
          </ul>

          <h3>Example Follow-Up Prompts</h3>
          <pre className="docs-code-block docs-prompt-block">{`After receiving your slides, you can refine them:

"Add a comparison slide after slide 8 showing the old toolbar vs the new toolbar."

"Replace the slide at position 5 with a media slide that has 3 wireframe images."

"Make the stats slide more detailed — add a suffix field to each stat."

"Add a chapter divider before the research section."

"Change the intro splitRatio to 40 so the image takes more space."`}</pre>
        </section>

        {/* Warning for undocumented templates */}
        {undocumented.length > 0 && (
          <div className="docs-warning">
            <strong>{undocumented.length} template(s) missing human documentation:</strong>{' '}
            {undocumented.map((k) => (
              <code key={k}>{k}</code>
            ))}
            <p>Add entries to slideTemplateDocs.js to document them.</p>
          </div>
        )}

        {/* Table of Contents */}
        <nav className="docs-toc">
          <h2>Contents</h2>
          <div className="docs-toc-grid">
            <a href="#template-showcase" className="docs-toc-item">
              <span className="docs-toc-cat">Template Showcase</span>
              <span className="docs-toc-count">{Object.keys(slideTemplates).length}</span>
            </a>
            {grouped.map(({ category, templates }) => (
              <a key={category} href={`#category-${category}`} className="docs-toc-item">
                <span className="docs-toc-cat">{category}</span>
                <span className="docs-toc-count">{templates.length}</span>
              </a>
            ))}
            <a href="#ai-selection-guide" className="docs-toc-item">
              <span className="docs-toc-cat">AI Selection Guide</span>
            </a>
            <a href="#shared-components" className="docs-toc-item">
              <span className="docs-toc-cat">Shared Components</span>
            </a>
          </div>
        </nav>

        {/* AI Selection Guide */}
        <section className="docs-section" id="ai-selection-guide">
          <h2>AI Template Selection Guide</h2>
          <p>Use this table to select the correct template based on slide content:</p>
          <table className="docs-table docs-table--selection">
            <thead>
              <tr><th>Template</th><th>When to Use</th><th>Media</th><th>Priority</th><th>Trigger Signals</th></tr>
            </thead>
            <tbody>
              {allDocs
                .filter((d) => d.docs?.aiSelectionHints)
                .sort((a, b) => (a.docs.aiSelectionHints.priority || 99) - (b.docs.aiSelectionHints.priority || 99))
                .map((d) => (
                  <tr key={d.key}>
                    <td>
                      <a href={`#template-${d.key}`}><code>{d.key}</code></a>
                      {d.docs.aiSelectionHints.required && <Badge variant="required">required</Badge>}
                    </td>
                    <td>{d.docs.whenToUse}</td>
                    <td className="docs-media-col">
                      {d.docs.mediaFields?.length > 0
                        ? d.docs.mediaFields.map((mf) => <code key={mf.field} className="docs-field-name">{mf.field}</code>)
                        : <span className="docs-no-media-label">None</span>
                      }
                    </td>
                    <td>{d.docs.aiSelectionHints.priority}</td>
                    <td>
                      {d.docs.aiSelectionHints.signals.slice(0, 4).map((s) => (
                        <Badge key={s} variant="signal">{s}</Badge>
                      ))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Template Cards grouped by category */}
        {grouped.map(({ category, templates }) => (
          <section key={category} className="docs-section" id={`category-${category}`}>
            <h2 className="docs-category-title">
              {category}
              <span className="docs-category-count">{templates.length} templates</span>
            </h2>
            {templates.map((doc) => (
              <TemplateCard key={doc.key} doc={doc} />
            ))}
          </section>
        ))}

        {/* Shared Components */}
        <section className="docs-section" id="shared-components">
          <h2>Shared Content Components</h2>
          <p>These reusable components are used across multiple templates:</p>
          {sharedComponentsDocs.map((comp) => (
            <div key={comp.name} className="docs-component-card">
              <h3>{comp.name}</h3>
              <p>{comp.purpose}</p>
              <div className="docs-meta-row">
                <strong>Props:</strong>{' '}
                {comp.props.map((p) => <code key={p} className="docs-field-name">{p}</code>)}
              </div>
              <div className="docs-meta-row">
                <strong>Behavior:</strong> {comp.behavior}
              </div>
              {comp.mediaSupport && (
                <div className="docs-media-support">
                  <strong>Media support:</strong>
                  <ul>
                    {Object.entries(comp.mediaSupport).map(([type, desc]) => (
                      <li key={type}><strong>{type}:</strong> {desc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="docs-footer">
          <p>
            This documentation is auto-generated from slideTemplates in caseStudyData.js
            and enriched with metadata from slideTemplateDocs.js.
          </p>
        </footer>
      </div>

      {/* Full-screen slide preview overlay */}
      {previewSlide && (() => {
        const allKeys = Object.keys(slideTemplates);
        const currentIdx = allKeys.indexOf(previewSlide);
        const goPrev = () => setPreviewSlide(allKeys[(currentIdx - 1 + allKeys.length) % allKeys.length]);
        const goNext = () => setPreviewSlide(allKeys[(currentIdx + 1) % allKeys.length]);
        return (
          <div className="docs-preview-overlay" onClick={() => setPreviewSlide(null)}>
            <div className="docs-preview-content" onClick={(e) => e.stopPropagation()}>
              <div className="docs-preview-header">
                <span className="docs-preview-title">{previewSlide}</span>
                <span className="docs-preview-counter">{currentIdx + 1} / {allKeys.length}</span>
                <button type="button" className="docs-preview-close" onClick={() => setPreviewSlide(null)}>&times;</button>
              </div>
              <div className="docs-preview-body">
                <button type="button" className="docs-preview-nav docs-preview-nav--prev" onClick={goPrev} aria-label="Previous">&lsaquo;</button>
                <div className="docs-preview-slide">
                  <TemplatePreview type={previewSlide} />
                </div>
                <button type="button" className="docs-preview-nav docs-preview-nav--next" onClick={goNext} aria-label="Next">&rsaquo;</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SlideDocumentation;
