import { useState } from 'react';
import PixelShell from '../PixelShell.jsx';
import './Type.css';

/* Type specimen — the Phase 4 face decision.
 *
 * The reference site's face could not be identified (the page fetch returns
 * text only, no CSS), so this is a real comparison rather than a default.
 * Every candidate is set at the SAME spec'd values so the only variable is
 * the face itself:
 *   display  clamp(56px, 11.5vw, 168px) / 600 / -.035em / .92
 *   body     16-19px / 1.55 / -.015em / 62ch
 *   utility  11px / uppercase / .09em
 */
const FACES = [
  {
    key: 'archivo',
    name: 'Archivo',
    stack: "'Archivo', sans-serif",
    tier: 'Open-source · Google Fonts · free',
    fit: 'Grotesque built for high-performance text. Real 400/600/700 as separate cuts, true tabular figures, and it stays sturdy at -.035em where lighter grotesques fall apart.',
    weakness: 'The most neutral of the four. It will not give the page a voice on its own — the field has to carry all the personality.',
  },
  {
    key: 'switzer',
    name: 'Switzer',
    stack: "'Switzer', sans-serif",
    tier: 'Fontshare · free for commercial use',
    fit: 'Neo-grotesque in the Söhne/Helvetica Now register — the closest free face to what studio sites of this kind actually license. Real weights, tight apertures, excellent at large display sizes.',
    weakness: 'Its 11px uppercase is slightly softer than Archivo’s; the utility layer needs the full .09em to stay crisp.',
  },
  {
    key: 'inter',
    name: 'Inter',
    stack: "'Inter', sans-serif",
    tier: 'Open-source · variable · free',
    fit: 'A true variable axis, so display weight can be tuned continuously rather than picked from cuts. Superb tabular figures and the best-tested UI face here.',
    weakness: 'Ubiquitous. It reads as "a product interface" and will not signal craft — and the brief explicitly prefers real cuts over a variable axis.',
  },
  {
    key: 'space',
    name: 'Space Grotesk',
    stack: "'Space Grotesk', sans-serif",
    tier: 'Open-source · Google Fonts · free · wildcard',
    fit: 'A grotesque with actual quirks — squared bowls, a distinctive g and R. Gives the page a voice the other three do not, and pairs well with a hard-edged pixel system.',
    weakness: 'Those quirks fight long body copy, and it is heavily used in "technical/AI studio" branding — the exact adjacency you are trying to avoid.',
  },
];

const DISPLAY_LINE = 'Lior Baum';
const BODY = 'I love working on platforms and complex products with awesome people that are passionate about what they’re building. I think in systems, and I go just as deep on the details as I do on the big picture.';

const Type = () => {
  const [only, setOnly] = useState(null);
  const shown = only ? FACES.filter((f) => f.key === only) : FACES;

  return (
    <PixelShell fade={1} band="18vh">
      <div className="type-page">
        <h1 className="type-title">Choosing a face</h1>
        <p className="type-lede">
          The reference site&apos;s typeface could not be identified — the page returns
          text only, no CSS. So these are four real candidates set at identical
          spec&apos;d values. The only variable is the face.
        </p>

        <div className="type-filter">
          <button type="button" aria-pressed={!only} onClick={() => setOnly(null)}>All</button>
          {FACES.map((f) => (
            <button key={f.key} type="button" aria-pressed={only === f.key} onClick={() => setOnly(f.key)}>
              {f.name}
            </button>
          ))}
        </div>

        {shown.map((f) => (
          <section className="type-spec" key={f.key} style={{ '--face': f.stack }}>
            <div className="type-meta">
              <span className="type-name">{f.name}</span>
              <span className="type-tier">{f.tier}</span>
            </div>

            <p className="type-display">{DISPLAY_LINE}</p>

            <div className="type-cols">
              <p className="type-body">{BODY}</p>
              <div className="type-detail">
                <p className="type-utility">Utility · 11px · .09em · uppercase</p>
                <p className="type-figures">Tabular 0123456789 · 2024–2026 · 89 tickets · 4.5:1</p>
                <p className="type-h2">Section heading at 1.06</p>
              </div>
            </div>

            <dl className="type-notes">
              <dt>Why it fits</dt><dd>{f.fit}</dd>
              <dt>Biggest weakness</dt><dd>{f.weakness}</dd>
            </dl>
          </section>
        ))}

        <section className="type-spec type-paid">
          <div className="type-meta">
            <span className="type-name">The paid tier</span>
            <span className="type-tier">not loaded here — licence required</span>
          </div>
          <p className="type-body">
            If you want to buy the face: <strong>Söhne</strong> (Klim), <strong>Diatype</strong>{' '}
            (ABC Dinamo) and <strong>Neue Haas Grotesk</strong> (Linotype) are the
            register this treatment actually belongs to, and Switzer above is the
            closest free stand-in. I can&apos;t verify current web licence pricing
            offline — check the foundry directly before budgeting.
          </p>
        </section>
      </div>
    </PixelShell>
  );
};

export default Type;
