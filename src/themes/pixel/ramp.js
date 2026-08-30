import { makeRandom } from './noise.js';

/* The heat ramp and the quantiser — shared by the hero field and the plates so
 * there is ONE definition of what a heat index means. Index IS the heat value.
 * Index 0 is never painted: the background rule shows through the gutter. */
/* Exact hexes read from the reference's own source — its :root custom
   properties and the BANDS array its hero field quantises against:
     BANDS=[[0.30,'#1c2541'],[0.46,'#3b5bd9'],[0.62,'#f5c518'],[0.78,'#e0492a']]
     …and '#d8ff00' for the hottest band. */
export const RAMP = ['transparent', '#1c2541', '#3b5bd9', '#f5c518', '#e0492a', '#d8ff00'];
export const STOPS = RAMP.length - 1;   // 5 — the maximum palette index

/** Static per-cell dither thresholds. Ordered, but from a seeded xorshift
 *  rather than a Bayer matrix. Call this ONCE per resize and never per frame:
 *  re-randomising every frame is what makes the output sizzle. */
export const makeThresholds = (cols, rows, seed) => {
  const rnd = makeRandom(seed);
  const out = new Float32Array(cols * rows);
  for (let i = 0; i < out.length; i++) out[i] = rnd();
  return out;
};

/** Quantise a 0..1 value to a palette index against this cell's static
 *  threshold. Returns 0 for "do not paint". */
export const quantise = (value, threshold) => {
  if (value <= 0) return 0;
  const v = value > 1 ? 1 : value;
  const q = v * STOPS;
  let idx = q | 0;
  if (q - idx > threshold) idx++;
  return idx > STOPS ? STOPS : idx;
};
