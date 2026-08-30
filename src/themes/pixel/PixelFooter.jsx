import { useEffect, useRef, useState } from 'react';
import homeContent from '../../data/home-content.json';
import { mountFootCity, mountPieces } from './foot-city.js';
import PixelType from './PixelType.jsx';
import './PixelFooter.css';

/* Contact CTA + the playing footer.
 *
 *   .cta     — the statement, drawn as cells, on ONE line. It is sized off the
 *              block height rather than fitted to the width, so the glyphs stay
 *              large and the sentence runs past both edges.
 *   footer   — a short skyline strip that expands into the board on play, per
 *              the reference: teaser button, score, d-pad, close, game over.
 */

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);

/* A grid of cells that fills the button in sequence — the same pixel logic as
   the rest of the system, rather than a colour fade. */
const PXFX_ACCENTS = ['var(--yellow)', 'var(--red)', 'var(--neon)', 'var(--ink)'];
const PXFX_RATE = 0.22;
const PXFX_MS = 150;            // ≈7fps, the reference's accent cadence

const hash = (a, b) => {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

/* A grid of cells over the button. WHICH cells are lit, and in what colour,
 * re-rolls on a tick while the pointer is over it — a frozen arrangement reads
 * as a texture, a moving one reads as static. Same cadence the reference uses
 * for its accent flicker. */
const PixelFx = ({ cols = 19, rows = 7, active = false }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), PXFX_MS);
    return () => clearInterval(id);
  }, [active]);

  return (
    <span
      className="pxfx"
      aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr' }}
    >
      {Array.from({ length: cols * rows }, (_, i) => {
        // Most cells stay transparent so the blue plate reads through; a
        // minority carry an accent, re-rolled every tick.
        const lit = hash(i + 0.3, tick * 3.7) < PXFX_RATE;
        const colour = lit ? PXFX_ACCENTS[Math.floor(hash(i + tick * 2.1, 5.1) * PXFX_ACCENTS.length)] : 'transparent';
        return <i key={i} style={{ background: colour }} />;
      })}
    </span>
  );
};

/* home-content stores the footer as four separately-styled display lines, so
 * each begins with a capital. Read as one sentence they need lowercasing — the
 * copy is unchanged, only the case of the joins. */
const lower = (t = '') => (t ? t[0].toLowerCase() + t.slice(1) : t);

const PixelFooter = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const footRef = useRef(null);
  const piecesRef = useRef(null);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [over, setOver] = useState(false);
  const [hot, setHot] = useState('');
  const { footer } = homeContent.content;

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const game = mountFootCity(canvasRef.current, {
      onScore: setScore,
      onGameOver: () => setOver(true),
    });
    gameRef.current = game;
    return () => game.destroy();
  }, []);

  useEffect(() => {
    if (!piecesRef.current) return undefined;
    const ticker = mountPieces(piecesRef.current);
    return () => ticker.destroy();
  }, []);

  const play = () => {
    setOver(false);
    setPlaying(true);
    gameRef.current?.play();
    // The footer grows from 126px to 390px over .55s, so the board is partly
    // below the fold at the moment it opens. Scroll once now and again after
    // the expand settles, since the page height changes underneath it.
    const bring = () => footRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    bring();
    setTimeout(bring, 620);
  };
  const quit = () => { setOver(false); setPlaying(false); gameRef.current?.quit(); };

  const line = `${footer.line1} ${lower(footer.line2_1)}${footer.line2_2} ${lower(footer.line3_1)} ${lower(footer.line4)}`;

  return (
    <>
      <section className="cta">
        {/* One unwrapped line at full block height, tiled and scrolled — the
            sentence runs past both edges instead of being shrunk to fit. */}
        <PixelType className="cta-type" height="clamp(130px, 14vw, 240px)" text={line} label={line} />

        <a
          className="cta-btn"
          href={`mailto:${footer.email}`}
          onPointerEnter={() => setHot('cta')}
          onPointerLeave={() => setHot('')}
        >
          <PixelFx active={hot === 'cta'} />
          <span className="lbl">Get in touch</span>
        </a>

        <p className="cta-meta">
          I work on platforms and complex products — clinical, enterprise, and the
          messy systems in between. Happiest with a real problem to solve.
        </p>
        <p className="cta-contact">
          <a href={`mailto:${footer.email}`}>{footer.email}</a>
          <span> · Tel Aviv, Israel.</span>
        </p>
      </section>

      <footer className={`pxfoot${playing ? ' playing' : ''}`} ref={footRef}>
        <canvas className="pxfoot-city" ref={canvasRef} aria-hidden="true" />

        <button
          className="tt-teaser"
          type="button"
          aria-label="play tetris"
          onClick={play}
          onPointerEnter={() => setHot('teaser')}
          onPointerLeave={() => setHot('')}
        >
          <PixelFx cols={15} rows={6} active={hot === 'teaser'} />
          <span className="lbl">
            play
            <span className="tt-blocks" aria-hidden="true">
              <canvas ref={piecesRef} width="40" height="32" />
            </span>
          </span>
        </button>

        <div className="tt" hidden={!playing}>
          <div className="tt-score">{String(score).padStart(6, '0')}</div>

          <div className="tt-pad">
            <button type="button" aria-label="Move left" onClick={() => gameRef.current?.input('left')}>
              <Icon d={['M19 12H5', 'm12 19-7-7 7-7']} />
            </button>
            <button type="button" aria-label="Move right" onClick={() => gameRef.current?.input('right')}>
              <Icon d={['M5 12h14', 'm12 5 7 7-7 7']} />
            </button>
            <button type="button" aria-label="Rotate" onClick={() => gameRef.current?.input('rot')}>
              <Icon d={['M20.49 15a9 9 0 1 1-2.12-9.36L23 10', 'M23 4v6h-6']} />
            </button>
            <button type="button" aria-label="Hard drop" onClick={() => gameRef.current?.input('drop')}>
              <Icon d={['m7 6 5 5 5-5', 'm7 13 5 5 5-5']} />
            </button>
          </div>

          <button className="tt-close" type="button" aria-label="Close" onClick={quit}>
            <Icon d={['M18 6 6 18', 'M6 6l12 12']} />
          </button>

          {over ? (
            <div className="tt-over">
              <span className="ttl">Game over</span>
              <button
                className="tt-again"
                type="button"
                onClick={play}
                onPointerEnter={() => setHot('again')}
                onPointerLeave={() => setHot('')}
              >
                <PixelFx cols={13} rows={5} active={hot === 'again'} />
                <span className="lbl">play again</span>
              </button>
            </div>
          ) : null}
        </div>

        <p className="pxfoot-copy">© {footer.copyright}</p>
      </footer>

    </>
  );
};

export default PixelFooter;
