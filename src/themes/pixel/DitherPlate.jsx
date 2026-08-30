import { useEffect, useRef } from 'react';
import { mountPlate } from './dither-plate.js';
import './DitherPlate.css';

/* React binding for a dither plate. The plate itself is framework-agnostic and
 * configured entirely through data attributes, so this only wires mount/unmount
 * and passes the options through. */
const DitherPlate = ({ src, motif = 'flow', seed = 1, cell, contrast, invert, caption, ratio = '4 / 3' }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const plate = mountPlate(ref.current);
    // Dev-only handle so the Phase 3 perf check can drive plates deterministically.
    if (import.meta.env.DEV) ref.current.__plate = plate;
    const el = ref.current;
    return () => { plate.destroy(); if (el) delete el.__plate; };
  }, [src, motif, seed, cell, contrast, invert]);

  return (
    <figure className="plate" style={{ '--plate-ratio': ratio }}>
      <canvas
        className="plate-canvas"
        ref={ref}
        data-src={src}
        data-motif={motif}
        data-seed={seed}
        data-cell={cell}
        data-contrast={contrast}
        data-invert={invert ? 'true' : undefined}
        role="img"
        aria-label={caption || `${motif} plate`}
      />
      {caption ? <figcaption className="plate-caption">{caption}</figcaption> : null}
    </figure>
  );
};

export default DitherPlate;
