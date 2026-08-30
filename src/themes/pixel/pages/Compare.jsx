import { useState } from 'react';
import PixelShell from '../PixelShell.jsx';
import './Compare.css';

/* Side by side — the two design systems rendering the same content, so the
 * Phase 9 decision is made by looking rather than from memory.
 *
 * The default site is served at /index.html; only "/" is rewritten to the pixel
 * entry (see vite.pixel.config.mjs), which is what lets both load from one dev
 * server. */
const VIEWS = [
  { id: 'split', label: 'Side by side' },
  { id: 'pixel', label: 'Pixel only' },
  { id: 'default', label: 'Default only' },
];

const Compare = () => {
  const [view, setView] = useState('split');

  return (
    <PixelShell fade={1} band="14vh" footer={false}>
      <header className="cmp-head">
        <p className="cmp-eyebrow">Phase 9 · decide</p>
        <h1 className="cmp-title">Two systems, one content</h1>
        <p className="cmp-lede">
          The same portfolio through both design systems. Neither is a mockup —
          both are the running app, so what you see is what ships.
        </p>

        <div className="cmp-tabs">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </header>

      <div className={`cmp-stage is-${view}`}>
        {view !== 'default' ? (
          <figure className="cmp-frame">
            <figcaption>Pixel — /pixel.html</figcaption>
            <iframe src="/pixel.html" title="Pixel theme" loading="lazy" />
          </figure>
        ) : null}

        {view !== 'pixel' ? (
          <figure className="cmp-frame">
            <figcaption>Default — /index.html</figcaption>
            <iframe src="/index.html" title="Default theme" loading="lazy" />
          </figure>
        ) : null}
      </div>

      <p className="cmp-note">
        Read <code>docs/theme-decision.md</code> for the measured comparison —
        performance, accessibility and what it costs to keep both alive.
      </p>
    </PixelShell>
  );
};

export default Compare;
