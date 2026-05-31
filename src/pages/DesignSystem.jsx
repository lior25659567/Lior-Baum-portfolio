import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useEdit } from '../context/EditContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedButton from '../components/AnimatedButton';
import './DesignSystem.css';

/* ──────────────────────────────────────────────────────────────────────────
   Design System reference page. Edit-mode only (route guards to "/" otherwise).
   Documents the case-study slide typography system, color tokens, buttons and
   reusable slide components — all driven by the live CSS custom properties so
   it always reflects the real tokens (and the active light/dark theme).
   ────────────────────────────────────────────────────────────────────────── */

// ─── Slide typography tiers (16-token Figma scale) ───────────────────────────
// Source: figma.com/design/X3mrAaCCY8J2fkrq5k1vWr  node 1041:3526
const TYPE_TIERS = [
  // DISPLAY
  { group: 'Display', name: 'Display / Display', varName: '--slide-font-display', px: 80, weight: 700, leading: 1.08, tracking: '-0.02em', sample: 'Reduce Friction', use: 'Hero titles, chapter headers' },
  { name: 'Special / Stat', varName: '--slide-font-stat', px: 80, weight: 700, leading: 1.00, tracking: '-0.03em', sample: '87%  3×  40%', use: 'Metrics, KPIs, impact numbers — accent color', accentSample: true },
  // HEADINGS
  { group: 'Headings', name: 'Headings / Title', varName: '--slide-font-title', px: 64, weight: 500, leading: 1.18, tracking: '-0.015em', sample: 'Section title — text and image layout', use: 'Slide main heading (large)' },
  { name: 'Headings / Subtitle', varName: '--slide-font-header', px: 56, weight: 500, leading: 1.20, tracking: '-0.012em', sample: 'Sub-section or supporting title', use: 'Slide subtitles, intro context · also --slide-font-h1' },
  { name: 'Headings / Heading', varName: '--slide-font-h2', px: 48, weight: 500, leading: 1.20, tracking: '-0.012em', sample: 'Sub-section or feature heading', use: 'Section headings, sub-titles' },
  { name: 'Headings / Subheading', varName: '--slide-font-h3', px: 36, weight: 500, leading: 1.22, tracking: '-0.01em', sample: 'Card title or column heading', use: 'Card titles, feature names' },
  // BODY
  { group: 'Body', name: 'Body / Body Large', varName: '--slide-font-body-lg', px: 32, weight: 400, leading: 1.50, tracking: '-0.005em', sample: 'A sprint redesign of the clinician dashboard.', use: 'Lead paragraphs, intro text' },
  { name: 'Body / Body Medium', varName: '--slide-font-body-md', px: 28, weight: 400, leading: 1.50, tracking: '-0.005em', sample: 'iTero is used chair-side across three connected phases.', use: 'Secondary lead text — apply .body-medium' },
  { name: 'Body / Body', varName: '--slide-font-body', px: 24, weight: 400, leading: 1.52, tracking: '-0.005em', sample: 'Clinicians lose focus during scans · Tools hidden in nested menus', use: 'Bullets, descriptions, body text' },
  { name: 'Body / Body Small', varName: '--slide-font-caption', px: 20, weight: 400, leading: 1.48, tracking: '0', sample: 'Redesigning the scanning workflow reduced average session time by 40%.', use: 'Captions, footnotes, annotations' },
  // META
  { group: 'Meta · Info tables & metadata', name: 'Meta / Meta Label', varName: '--slide-font-meta-label', px: 28, weight: 400, leading: 1.30, tracking: '-0.005em', sample: 'Client · Platform · Role · Duration', use: 'Table keys, muted labels', mutedSample: true },
  { name: 'Meta / Meta Value', varName: '--slide-font-meta-value', px: 28, weight: 500, leading: 1.30, tracking: '-0.005em', sample: 'WizeCare · Desktop Dashboard (B2B SaaS) · Product Designer', use: 'Table values, primary metadata' },
  // UTILITY
  { group: 'Utility · Labels, tags, overlines', name: 'Utility / Label', varName: '--slide-font-label', px: 14, weight: 500, leading: 1.20, tracking: '0.08em', sample: 'THE PROBLEM · USER RESEARCH · BEFORE & AFTER', use: 'Overlines, section tags — always uppercase', uppercase: true, accentSample: true },
  { name: 'Utility / Tag', varName: '--slide-font-tag', px: 18, weight: 500, leading: 1.20, tracking: '0', sample: 'UX Design · Interaction Design · MedTech · Figma · Maze', use: 'Pill chips, badges, tool names' },
  { name: 'Utility / Number', varName: '--slide-font-number', px: 24, weight: 500, leading: 1.20, tracking: '0.06em', sample: '01   02   03   04   05   06', use: 'Step counters, card numbers — accent color', accentSample: true },
  { name: 'Utility / Caption', varName: '--slide-font-meta', px: 16, weight: 400, leading: 1.40, tracking: '0', sample: 'Screenshot of the redesigned scanning toolbar. Source: 2024.', use: 'Image captions, fine print, dates', mutedSample: true },
  // SPECIAL
  { group: 'Special · Stats & quotes', name: 'Special / Quote', varName: '--slide-font-quote', px: 32, weight: 400, leading: 1.45, tracking: '-0.005em', sample: '"I spend more time looking for tools than actually scanning."', use: 'Testimonials, user research quotes' },
];

const WEIGHT_TOKENS = [
  { varName: '--slide-weight-regular', value: 400, label: 'Regular' },
  { varName: '--slide-weight-medium',  value: 500, label: 'Medium' },
  { varName: '--slide-weight-bold',    value: 700, label: 'Bold' },
];

const LEADING_TOKENS = [
  { varName: '--slide-leading-display',  value: '1.08', label: 'Display' },
  { varName: '--slide-leading-title',    value: '1.18', label: 'Title' },
  { varName: '--slide-leading-heading',  value: '1.20', label: 'Heading' },
  { varName: '--slide-leading-subhead',  value: '1.22', label: 'Subheading' },
  { varName: '--slide-leading-body-lg',  value: '1.50', label: 'Body Large' },
  { varName: '--slide-leading-body-md',  value: '1.50', label: 'Body Medium' },
  { varName: '--slide-leading-body',     value: '1.52', label: 'Body' },
  { varName: '--slide-leading-caption',  value: '1.48', label: 'Caption' },
  { varName: '--slide-leading-meta',     value: '1.30', label: 'Meta' },
  { varName: '--slide-leading-quote',    value: '1.45', label: 'Quote' },
];

const TRACKING_TOKENS = [
  { varName: '--slide-tracking-display',  value: '-0.02em',  label: 'Display' },
  { varName: '--slide-tracking-stat',     value: '-0.03em',  label: 'Stat' },
  { varName: '--slide-tracking-title',    value: '-0.015em', label: 'Title' },
  { varName: '--slide-tracking-heading',  value: '-0.012em', label: 'Heading' },
  { varName: '--slide-tracking-subhead',  value: '-0.01em',  label: 'Subheading' },
  { varName: '--slide-tracking-body',     value: '-0.005em', label: 'Body / Meta / Quote' },
  { varName: '--slide-tracking-number',   value: '0.06em',   label: 'Number' },
  { varName: '--slide-tracking-label',    value: '0.08em',   label: 'Label' },
  { varName: '--slide-tracking-normal',   value: '0',        label: 'Normal' },
];

// ─── Color tokens (semantic, theme-aware) ────────────────────────────────────
const SEMANTIC_GROUPS = [
  { title: 'Background', tokens: ['--color-bg', '--color-bg-secondary', '--color-image-contain-bg'] },
  { title: 'Text',       tokens: ['--color-text', '--color-text-muted'] },
  { title: 'Accent',     tokens: ['--color-accent', '--color-accent-strong', '--color-accent-vivid', '--color-accent-contrast', '--color-accent-soft'] },
  { title: 'Border',     tokens: ['--color-border', '--color-border-soft'] },
  { title: 'Status',     tokens: ['--color-success', '--color-success-soft', '--color-error', '--color-error-soft', '--color-warning', '--color-warning-soft', '--color-info', '--color-info-soft'] },
  { title: 'Named accents', tokens: ['--accent-warm', '--accent-cool', '--accent-violet', '--accent-graphite'] },
  { title: 'Showcase palette', tokens: ['--showcase-lavender', '--showcase-pink', '--showcase-orange', '--showcase-lime'] },
];

// ─── Spacing / rhythm tokens ─────────────────────────────────────────────────
const SPACING_TOKENS = [
  { varName: '--rhythm-xs',    px: 8 },
  { varName: '--rhythm-tight', px: 12 },
  { varName: '--rhythm-sm',    px: 16 },
  { varName: '--rhythm-md',    px: 24 },
  { varName: '--rhythm-lg',    px: 48 },
  { varName: '--rhythm-xl',    px: 64 },
  { varName: '--slide-gap',    px: 80 },
  { varName: '--grid-gap',     px: 28 },
];

const SECTIONS = [
  { id: 'typography', label: 'Typography' },
  { id: 'colors',     label: 'Colors' },
  { id: 'buttons',    label: 'Buttons' },
  { id: 'components',  label: 'Spacing & components' },
];

// Resolve a CSS custom property's computed value off the document root.
function readVar(name) {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const DesignSystem = () => {
  const { editMode } = useEdit();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(null);
  // Bump on theme change so resolved color values re-read.
  const [, setTick] = useState(0);

  useEffect(() => { setTick((t) => t + 1); }, [theme]);

  const copy = useCallback((value) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopied(value);
    window.clearTimeout(copy._t);
    copy._t = window.setTimeout(() => setCopied(null), 1400);
  }, []);

  // Edit-mode-only: anyone hitting the URL directly without edit mode goes home.
  if (!editMode) return <Navigate to="/" replace />;

  const Token = ({ name, children, className = '' }) => (
    <button
      type="button"
      className={`ds-token ${className} ${copied === `var(${name})` ? 'is-copied' : ''}`}
      onClick={() => copy(`var(${name})`)}
      title={`Click to copy var(${name})`}
    >
      {children ?? <code className="ds-token-name">{name}</code>}
      <span className="ds-copied-flag">{copied === `var(${name})` ? 'Copied ✓' : 'Copy'}</span>
    </button>
  );

  return (
    <div className="design-system-page">
      <header className="ds-header">
        <p className="ds-eyebrow">Reference · edit mode</p>
        <h1 className="ds-title">Design System</h1>
        <p className="ds-lead">
          The live tokens behind the case-study slide system — typography, color,
          buttons and components. Click any token or swatch to copy its
          variable. Values follow the active <strong>{theme}</strong> theme.
        </p>
        <nav className="ds-subnav">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="ds-subnav-link">{s.label}</a>
          ))}
        </nav>
      </header>

      {/* ─── TYPOGRAPHY ─────────────────────────────────────────────── */}
      <section id="typography" className="ds-section">
        <h2 className="ds-section-title">Typography</h2>
        <p className="ds-section-note">
          16-token scale · DM Sans only · 3 weights (Regular 400 / Medium 500 / Bold 700) ·{' '}
          <a href="https://www.figma.com/design/X3mrAaCCY8J2fkrq5k1vWr/Aohs" target="_blank" rel="noopener noreferrer">
            Figma → Aohs · Typography scale · node 1041:3526
          </a>.{' '}
          Specimens render at true canvas px — on a 1920×1080 slide they scale down via transform:scale().
          Canvas padding: 128px all sides → content area 1664 × 824px.
        </p>

        <div className="ds-type-list">
          {TYPE_TIERS.map((t) => (
            <React.Fragment key={t.varName}>
              {t.group && <div className="ds-type-group-label">{t.group}</div>}
              <div className="ds-type-row">
                <div className="ds-type-meta">
                  <span className="ds-type-name">{t.name}</span>
                  <Token name={t.varName} />
                  <span className="ds-type-specs">{t.px}px · {t.weight} · lh {t.leading} · ls {t.tracking}</span>
                  <span className="ds-type-use">{t.use}</span>
                </div>
                <div
                  className="ds-type-specimen"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: `var(${t.varName})`,
                    fontWeight: t.weight,
                    lineHeight: t.leading,
                    letterSpacing: t.tracking,
                    textTransform: t.uppercase ? 'uppercase' : undefined,
                    color: t.accentSample ? 'var(--color-accent)' : t.mutedSample ? 'var(--color-text-muted)' : undefined,
                  }}
                >
                  {t.sample}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="ds-token-trio">
          <div className="ds-token-col">
            <h3 className="ds-col-title">Weight</h3>
            {WEIGHT_TOKENS.map((w) => (
              <Token key={w.varName} name={w.varName} className="ds-token-row">
                <span className="ds-token-name">{w.varName}</span>
                <span className="ds-token-val" style={{ fontWeight: w.value }}>{w.label} · {w.value}</span>
              </Token>
            ))}
          </div>
          <div className="ds-token-col">
            <h3 className="ds-col-title">Leading</h3>
            {LEADING_TOKENS.map((l) => (
              <Token key={l.varName} name={l.varName} className="ds-token-row">
                <span className="ds-token-name">{l.varName}</span>
                <span className="ds-token-val">{l.label} · {l.value}</span>
              </Token>
            ))}
          </div>
          <div className="ds-token-col">
            <h3 className="ds-col-title">Tracking</h3>
            {TRACKING_TOKENS.map((tr) => (
              <Token key={tr.varName} name={tr.varName} className="ds-token-row">
                <span className="ds-token-name">{tr.varName}</span>
                <span className="ds-token-val">{tr.label} · {tr.value}</span>
              </Token>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COLORS ─────────────────────────────────────────────────── */}
      <section id="colors" className="ds-section">
        <h2 className="ds-section-title">Colors</h2>
        <p className="ds-section-note">
          Semantic tokens resolve through the three-layer system and respect the
          theme toggle. Swatch values are read live from the document root.
        </p>

        {SEMANTIC_GROUPS.map((group) => (
          <div key={group.title} className="ds-color-group">
            <h3 className="ds-col-title">{group.title}</h3>
            <div className="ds-swatch-grid">
              {group.tokens.map((name) => {
                const value = readVar(name);
                const isCopied = copied === `var(${name})`;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`ds-swatch ${isCopied ? 'is-copied' : ''}`}
                    onClick={() => copy(`var(${name})`)}
                    title={`Click to copy var(${name})`}
                  >
                    <span className="ds-swatch-chip" style={{ background: `var(${name})` }} />
                    <span className="ds-swatch-info">
                      <code className="ds-swatch-name">{name}</code>
                      <span className="ds-swatch-value">{isCopied ? 'Copied ✓' : (value || '—')}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ─── BUTTONS ────────────────────────────────────────────────── */}
      <section id="buttons" className="ds-section">
        <h2 className="ds-section-title">Buttons</h2>
        <p className="ds-section-note">
          The animated character button (used in the nav and CTAs) plus
          token-built button styles.
        </p>

        <div className="ds-btn-grid">
          <div className="ds-btn-demo">
            <AnimatedButton variant="primary">Primary</AnimatedButton>
            <code className="ds-btn-label">{'<AnimatedButton variant="primary" />'}</code>
          </div>
          <div className="ds-btn-demo">
            <AnimatedButton variant="secondary">Secondary</AnimatedButton>
            <code className="ds-btn-label">{'variant="secondary"'}</code>
          </div>
          <div className="ds-btn-demo">
            <AnimatedButton variant="outline">Outline</AnimatedButton>
            <code className="ds-btn-label">{'variant="outline"'}</code>
          </div>
          <div className="ds-btn-demo">
            <button type="button" className="ds-cta-solid">Solid CTA</button>
            <code className="ds-btn-label">accent · radius 8px</code>
          </div>
          <div className="ds-btn-demo">
            <button type="button" className="ds-cta-ghost">Ghost</button>
            <code className="ds-btn-label">border · transparent</code>
          </div>
        </div>
      </section>

      {/* ─── SPACING & COMPONENTS ───────────────────────────────────── */}
      <section id="components" className="ds-section">
        <h2 className="ds-section-title">Spacing &amp; components</h2>
        <p className="ds-section-note">
          Rhythm tokens (pinned px for the 1920 canvas) and faithful renders of
          the reusable slide pieces, built from the same tokens.
        </p>

        <h3 className="ds-col-title">Spacing &amp; rhythm</h3>
        <div className="ds-spacing-list">
          {SPACING_TOKENS.map((s) => (
            <button
              key={s.varName}
              type="button"
              className={`ds-spacing-row ${copied === `var(${s.varName})` ? 'is-copied' : ''}`}
              onClick={() => copy(`var(${s.varName})`)}
              title={`Click to copy var(${s.varName})`}
            >
              <code className="ds-token-name">{s.varName}</code>
              <span className="ds-spacing-bar" style={{ width: `${s.px}px` }} />
              <span className="ds-token-val">{copied === `var(${s.varName})` ? 'Copied ✓' : `${s.px}px`}</span>
            </button>
          ))}
        </div>

        <h3 className="ds-col-title ds-components-title">Components</h3>
        <div className="ds-component-grid">
          {/* Highlight callout */}
          <div className="ds-demo-card">
            <span className="ds-demo-tag">Highlight callout</span>
            <div className="ds-demo-highlight">
              Key insight: users dropped off before reaching the second step.
            </div>
          </div>

          {/* Card */}
          <div className="ds-demo-card">
            <span className="ds-demo-tag">Card</span>
            <div className="ds-demo-tile">
              <span className="ds-demo-number">01</span>
              <h4 className="ds-demo-tile-title">Card title</h4>
              <p className="ds-demo-tile-desc">Supporting description text that explains the card content.</p>
            </div>
          </div>

          {/* Pill / label */}
          <div className="ds-demo-card">
            <span className="ds-demo-tag">Pill &amp; eyebrow label</span>
            <div className="ds-demo-pills">
              <span className="ds-demo-pill">Section pill</span>
              <span className="ds-demo-eyebrow">Eyebrow label</span>
            </div>
          </div>

          {/* Stat */}
          <div className="ds-demo-card">
            <span className="ds-demo-tag">Stat</span>
            <div className="ds-demo-stat">
              <span className="ds-demo-stat-value">87%</span>
              <span className="ds-demo-stat-label">Task success rate</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
