import { useState } from 'react';
import homeContent from '../../../data/home-content.json';
import PixelShell from '../PixelShell.jsx';
import DitherPlate from '../DitherPlate.jsx';
import { MOTIF_NAMES } from '../motifs.js';
import './Playground.css';

/* Playground — a live module exposing the plate's own controls, then the
 * experiment cards. The module is the point: it lets the plate be driven
 * directly rather than described. */
const LiveModule = () => {
  const [motif, setMotif] = useState('flow');
  const [seed, setSeed] = useState(7);
  const [cell, setCell] = useState(4);
  const [contrast, setContrast] = useState(1);

  return (
    <div className="pg-module">
      <div className="pg-stage">
        {/* Keyed so a control change remounts the plate with new attributes. */}
        <DitherPlate
          key={`${motif}-${seed}-${cell}-${contrast}`}
          motif={motif}
          seed={seed}
          cell={cell}
          contrast={contrast}
          ratio="16 / 10"
          caption={null}
        />
      </div>

      <div className="pg-controls">
        <div className="pg-control">
          <span className="pg-control-label">Motif</span>
          <div className="pg-btns">
            {MOTIF_NAMES.map((m) => (
              <button key={m} type="button" aria-pressed={motif === m} onClick={() => setMotif(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="pg-control">
          <span className="pg-control-label">Cell</span>
          <div className="pg-btns">
            {[3, 4, 6, 9, 14].map((c) => (
              <button key={c} type="button" aria-pressed={cell === c} onClick={() => setCell(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className="pg-control">
          <span className="pg-control-label">Contrast</span>
          <div className="pg-btns">
            {[0.8, 1, 1.3, 1.7].map((c) => (
              <button key={c} type="button" aria-pressed={contrast === c} onClick={() => setContrast(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className="pg-control">
          <span className="pg-control-label">Seed</span>
          <div className="pg-btns">
            <button type="button" onClick={() => setSeed((s) => s + 1)}>Reroll</button>
            <span className="pg-seed">{String(seed).padStart(3, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Playground = () => {
  const pg = homeContent.content.playground;
  const items = pg?.items || [];

  return (
    <PixelShell fade={1} band="20vh">
      <header className="pg-head">
        <p className="pg-eyebrow">{pg?.sectionLabel || 'Playground'}</p>
        <h1 className="pg-title">{pg?.sectionTitle || 'Experiments'}</h1>
      </header>

      <section className="pg-live">
        <h2 className="pg-rule-label">
          <span>Dither plate — live</span>
          <span className="pg-hint">Drive it</span>
        </h2>
        <LiveModule />
      </section>

      <section className="pg-experiments">
        <h2 className="pg-rule-label">
          <span>Experiments</span>
          <span className="pg-hint">{String(items.length).padStart(2, '0')}</span>
        </h2>

        <ol className="pg-cards">
          {items.map((item, i) => (
            <li className="pg-card" key={item.id}>
              <span className="pg-card-i">{String(i + 1).padStart(2, '0')}</span>
              <div className="pg-card-body">
                <h3 className="pg-card-title">{item.title?.trim()}</h3>
                {item.meta ? <p className="pg-card-meta">{item.meta}</p> : null}
                {(item.paragraphs || []).map((para, j) => (
                  <p className="pg-card-text" key={j}>{para}</p>
                ))}
                {item.link?.url ? (
                  <p className="pg-card-link">
                    <a href={item.link.url} target="_blank" rel="noreferrer">
                      {item.link.label || 'Open'} ↗
                    </a>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </PixelShell>
  );
};

export default Playground;
