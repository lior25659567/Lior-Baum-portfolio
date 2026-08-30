import homeContent from '../../../data/home-content.json';
import { savedCaseStudies } from '../../../data/case-studies/index.js';
import PixelShell from '../PixelShell.jsx';
import DitherPlate from '../DitherPlate.jsx';
import './Scaffold.css';

/* Phase 1 placeholder.
 *
 * Its job is to prove three things and nothing more:
 *   1. The separate entry boots and the pixel tokens apply.
 *   2. The cell grid reads from --cell, so the rule and future canvases
 *      cannot drift apart.
 *   3. Content comes from the SAME source the default site uses — imported,
 *      never copied. Both trees read src/data/*.
 *
 * The heat field (Phase 2) replaces the empty .pixel-field canvas slot.
 */
const RAMP = [
  { i: 0, name: 'transparent', hex: '—',       note: 'background shows through' },
  { i: 1, name: 'navy',        hex: '#141A34', note: '' },
  { i: 2, name: 'blue',        hex: '#2F4CD4', note: '' },
  { i: 3, name: 'amber',       hex: '#F5BC17', note: '' },
  { i: 4, name: 'red',         hex: '#DE3A22', note: '' },
  { i: 5, name: 'chartreuse',  hex: '#D2FE00', note: 'brush core' },
];

/* Eight plates — six procedural motifs plus two real images — so the Phase 3
   perf budget (8 animating plates under 8ms/frame) is exercised on the page,
   not just asserted. */
const PLATES = [
  { motif: 'portrait',  seed: 3,  caption: 'motif · portrait' },
  { motif: 'terrain',   seed: 11, caption: 'motif · terrain' },
  { motif: 'orb',       seed: 5,  caption: 'motif · orb' },
  { motif: 'ripple',    seed: 7,  caption: 'motif · ripple' },
  { motif: 'structure', seed: 2,  caption: 'motif · structure' },
  { motif: 'flow',      seed: 9,  caption: 'motif · flow' },
  { src: '/about/profile.webp', seed: 13, contrast: 1.05, ratio: '3 / 4', caption: 'image · portrait' },
  // A UI screenshot is bimodal — a white canvas with dark chrome. Un-inverted,
  // that white ground maps to the HOTTEST stop and the plate reads as a
  // chartreuse slab. Inverted, the ground stays unpainted (the page shows
  // through) and the interface structure is what gets drawn.
  { src: '/case-studies/thumbnails/clinical-workflow@960.webp', seed: 17, contrast: 1.15, invert: true, caption: 'image · product UI' },
];

const Scaffold = () => {
  const { hero } = homeContent.content;
  const slugs = Object.keys(savedCaseStudies);

  return (
    <PixelShell fade={1} band="20vh">
      <div className="scaffold-page">
        <section className="scaffold-hero">
          <h1 className="scaffold-display">{hero.name}</h1>
          <p className="scaffold-lede">{hero.description}</p>
          <p className="scaffold-meta">
            Read from <code>src/data/home-content.json</code> — the same file the
            default site uses. Nothing duplicated.
          </p>
        </section>

        <section className="scaffold-block">
          <h2 className="scaffold-label">Heat ramp — index is the heat value</h2>
          <ul className="scaffold-ramp">
            {RAMP.map(({ i, name, hex, note }) => (
              <li key={i} className="scaffold-ramp-row">
                <span
                  className="scaffold-swatch"
                  style={{ background: `var(--heat-${i})` }}
                  aria-hidden="true"
                />
                <span className="scaffold-ramp-i">{i}</span>
                <span className="scaffold-ramp-name">{name}</span>
                <span className="scaffold-ramp-hex">{hex}</span>
                <span className="scaffold-ramp-note">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="scaffold-block">
          <h2 className="scaffold-label">Cell geometry</h2>
          <p className="scaffold-body">
            The grid behind this page is drawn at <code>--cell</code> pitch
            (currently 9px: 8px painted fill, 1px gutter). Every canvas in
            Phases 2 and 3 reads the same custom property, so the rule and the
            painted cells can never drift apart.
          </p>
          <div className="scaffold-cell-demo" aria-hidden="true" />
        </section>

        <section className="scaffold-block">
          <h2 className="scaffold-label">Dither plates — same quantiser, arbitrary element</h2>
          <div className="plate-grid">
            {PLATES.map((cfg, i) => (
              <DitherPlate key={i} {...cfg} />
            ))}
          </div>
          <p className="scaffold-meta" style={{ marginTop: 20 }}>
            Hover a plate — heat eases up and warms the ramp. Plates run at 20fps,
            separately from the hero&apos;s 30.
          </p>
        </section>

        <section className="scaffold-block">
          <h2 className="scaffold-label">Shared content — {slugs.length} case studies</h2>
          <ul className="scaffold-list">
            {slugs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="scaffold-meta">
            Imported from <code>src/data/case-studies/index.js</code>. Phase 4
            composes these through pixel-theme presentational components.
          </p>
        </section>

        <section className="scaffold-block">
          <h2 className="scaffold-label">Not yet built</h2>
          <ul className="scaffold-list">
            <li>Phase 4 — page shells · index, case study, playground, about</li>
            <li>Phase 5 — footer</li>
            <li>Typeface — undecided; this is a placeholder grotesque stack</li>
          </ul>
        </section>
      </div>
    </PixelShell>
  );
};

export default Scaffold;
