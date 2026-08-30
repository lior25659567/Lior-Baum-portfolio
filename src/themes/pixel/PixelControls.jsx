import { useState } from 'react';
import './PixelControls.css';

/* Cell L/M/S and Brush L/M/S, with the reference's measured values:
     Cell   L=22px  M=14px  S=9px   (S default)
     Brush  L=16    M=10    S=7     (M default)
 *
 * Cell writes --cell on :root — the single source of truth. The background
 * rule and the canvas both read it, so they change together and cannot
 * drift apart by a pixel.
 *
 * Only the M values are measured. L and S are inference until the DevTools
 * pass on the reference lands; they are one-line changes in tokens.css. */
const CELLS = [
  { key: 'L', varName: '--cell-l' },
  { key: 'M', varName: '--cell-m' },
  { key: 'S', varName: '--cell-s' },
];
const BRUSHES = [
  { key: 'L', varName: '--brush-l' },
  { key: 'M', varName: '--brush-m' },
  { key: 'S', varName: '--brush-s' },
];

const readVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const PixelControls = ({ fieldRef }) => {
  // The reference ships Cell S / Brush M; this theme runs a smaller brush.
  const [cell, setCell] = useState('S');
  const [brush, setBrush] = useState('S');

  const pickCell = (opt) => {
    document.documentElement.style.setProperty('--cell', readVar(opt.varName));
    setCell(opt.key);
    fieldRef.current?.setCell();
  };

  const pickBrush = (opt) => {
    setBrush(opt.key);
    fieldRef.current?.setBrush(parseFloat(readVar(opt.varName)));
  };

  return (
    <div className="pixel-controls">
      <div className="pixel-control">
        <span className="pixel-control-label">Cell</span>
        {CELLS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className="pixel-control-btn"
            aria-pressed={cell === opt.key}
            onClick={() => pickCell(opt)}
          >
            {opt.key}
          </button>
        ))}
      </div>
      <div className="pixel-control">
        <span className="pixel-control-label">Brush</span>
        {BRUSHES.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className="pixel-control-btn"
            aria-pressed={brush === opt.key}
            onClick={() => pickBrush(opt)}
          >
            {opt.key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PixelControls;
