import { useEffect, useRef } from 'react';
import { mountPixelType } from './pixel-type.js';

/* Headline rendered as cells.
 *   `text`  — one unwrapped line, tiled and scrolled as a marquee
 *   `lines` — explicit line breaks, fitted to the block
 * Pass one or the other. */
const PixelType = ({ lines, text, className = '', height = '30vh', label }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const t = mountPixelType(ref.current, { lines, text });
    if (import.meta.env.DEV) ref.current.__type = t;
    return () => t.destroy();
  }, [lines, text]);

  return (
    <canvas
      className={`pixel-type ${className}`.trim()}
      ref={ref}
      style={{ height }}
      role="img"
      aria-label={label || text || (lines || []).join(' ')}
    />
  );
};

export default PixelType;
