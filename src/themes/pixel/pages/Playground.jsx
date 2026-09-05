import { useState } from 'react';
import PixelShell from '../PixelShell.jsx';
import DitherPlate from '../DitherPlate.jsx';
import { MOTIF_NAMES } from '../motifs.js';
import { PixelEditable, PixelAddBtn, PixelRemoveBtn, PixelPublishBar } from '../PixelEdit.jsx';
import { useEdit } from '../../../context/EditContext';
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
  const { content, editMode, updateContent, updateNestedContent, saveHomeToCode } = useEdit();
  const pg = content.playground || {};
  const items = pg.items || [];

  const setPg = (key, value) => updateContent('playground', key, value);
  const setItem = (i, key, value) => updateNestedContent('playground', i, key, value);
  const setPara = (i, j, value) =>
    setItem(i, 'paragraphs', (items[i].paragraphs || []).map((p, jx) => (jx === j ? value : p)));

  return (
    <PixelShell fade={1} band="20vh">
      <header className="pg-head">
        <PixelEditable
          tag="p" className="pg-eyebrow" value={pg.sectionLabel ?? 'Playground'}
          onChange={(v) => setPg('sectionLabel', v)} placeholder="Label"
        />
        <PixelEditable
          tag="h1" className="pg-title" value={pg.sectionTitle ?? 'Experiments'}
          onChange={(v) => setPg('sectionTitle', v)} placeholder="Title"
        />
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
                <h3 className="pg-card-title">
                  <PixelEditable
                    value={item.title?.trim() ?? ''}
                    onChange={(v) => setItem(i, 'title', v)} placeholder="Project name"
                  />
                  <PixelRemoveBtn
                    onClick={() => setPg('items', items.filter((_, ix) => ix !== i))}
                    title="Remove experiment"
                  />
                </h3>
                {item.meta || editMode ? (
                  <PixelEditable
                    tag="p" className="pg-card-meta" value={item.meta ?? ''}
                    onChange={(v) => setItem(i, 'meta', v)} placeholder="2025 · Side bet"
                  />
                ) : null}
                {(item.paragraphs || []).map((para, j) => (
                  <p className="pg-card-text" key={j}>
                    <PixelEditable
                      tag="span" value={para} multiline
                      onChange={(v) => setPara(i, j, v)} placeholder="Write a paragraph…"
                    />
                    <PixelRemoveBtn
                      onClick={() => setItem(i, 'paragraphs', (item.paragraphs || []).filter((_, jx) => jx !== j))}
                      title="Remove paragraph"
                    />
                  </p>
                ))}
                <PixelAddBtn onClick={() => setItem(i, 'paragraphs', [...(item.paragraphs || []), ''])}>
                  + Paragraph
                </PixelAddBtn>

                {/* View mode shows the link only when there is a URL to open.
                    Edit mode always shows both halves, so an empty link can be
                    filled in without first inventing a URL elsewhere. */}
                {editMode ? (
                  <p className="pg-card-link is-editing">
                    <PixelEditable
                      value={item.link?.label ?? ''}
                      onChange={(v) => setItem(i, 'link', { ...(item.link || {}), label: v })}
                      placeholder="Link label"
                    />
                    <PixelEditable
                      className="pg-card-url" value={item.link?.url ?? ''}
                      onChange={(v) => setItem(i, 'link', { ...(item.link || {}), url: v })}
                      placeholder="https://…"
                    />
                  </p>
                ) : item.link?.url ? (
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

        <PixelAddBtn
          onClick={() => setPg('items', [
            ...items,
            { id: `pg-${Date.now()}`, title: '', meta: '', paragraphs: [''], link: { url: '', label: '' }, hero: null, gallery: [] },
          ])}
        >
          + Experiment
        </PixelAddBtn>
      </section>

      <PixelPublishBar save={saveHomeToCode} />
    </PixelShell>
  );
};

export default Playground;
