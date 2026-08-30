import { makeSimplex } from './noise.js';

/* Procedural fields for plates with no image. Each takes (u, v, t, sx) over the
 * unit square and returns roughly 0..1.
 *
 * The brief: they must read as different SUBJECTS at thumbnail size, not as the
 * same noise with different seeds. So these are built from different geometry —
 * a figure, strata, a lit sphere, interference, structure, turbulence — rather
 * than one fBm with varied parameters. */

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

const cache = new Map();
const noiseFor = (seed) => {
  let n = cache.get(seed);
  if (!n) { n = makeSimplex(seed); cache.set(seed, n); }
  return n;
};

/** Head-and-shoulders silhouette with directional light. Reads as a person. */
const portrait = (u, v, t, sx) => {
  const n = noiseFor(sx);
  const head = 1 - Math.hypot((u - 0.5) / 0.19, (v - 0.36) / 0.24);
  const body = 1 - Math.hypot((u - 0.5) / 0.46, (v - 1.06) / 0.42);
  let m = Math.max(head, body);
  m = smooth(-0.05, 0.35, m);
  // light from upper-left, so the form has volume rather than reading flat
  const light = 0.45 + 0.55 * clamp01(1 - Math.hypot(u - 0.34, v - 0.26) * 1.5);
  const grain = n(u * 6, v * 6 + t * 0.3) * 0.08;
  return clamp01(m * light + grain);
};

/** Layered ridged strata. Reads as landscape / terrain. */
const terrain = (u, v, t, sx) => {
  const n = noiseFor(sx);
  let h = 0, amp = 0.5, f = 2.2;
  for (let o = 0; o < 4; o++) {
    h += (1 - Math.abs(n(u * f, o * 12.3 + t * 0.12))) * amp;   // ridged
    amp *= 0.5; f *= 2.1;
  }
  const ridge = 0.34 + h * 0.30;            // ridge line, measured from the top
  const below = smooth(ridge - 0.03, ridge + 0.10, v);
  // Shade downward so the mass spans the ramp instead of reading as one flat
  // colour — a silhouette with no tonal range quantises to a single stop.
  const shade = 0.28 + 0.72 * smooth(ridge, 1.05, v);
  return clamp01(below * shade);
};

/** Lit sphere. Reads as an object / orb. */
const orb = (u, v, t, sx) => {
  const n = noiseFor(sx);
  const dx = (u - 0.5) / 0.4, dy = (v - 0.5) / 0.4;
  const d2 = dx * dx + dy * dy;
  if (d2 > 1) return clamp01(0.06 - (d2 - 1) * 0.4);
  const z = Math.sqrt(1 - d2);
  const lx = -0.45, ly = -0.5, lz = 0.74;
  const lam = clamp01(dx * lx + dy * ly + z * lz);
  const wobble = n(dx * 2 + t * 0.2, dy * 2) * 0.09;
  return clamp01(lam * 0.95 + wobble + 0.05);
};

/** Concentric interference. Reads as ripples / a wave pattern. */
const ripple = (u, v, t, sx) => {
  const n = noiseFor(sx);
  const d1 = Math.hypot(u - 0.34, v - 0.42);
  const d2 = Math.hypot(u - 0.72, v - 0.62);
  const w = Math.sin(d1 * 46 - t * 1.5) * Math.sin(d2 * 38 + t * 1.1);
  const env = clamp01(1.15 - (d1 + d2) * 0.8);
  return clamp01(0.5 + w * 0.5 * env + n(u * 3, v * 3) * 0.06);
};

/** Vertical structure with depth. Reads as architecture / a UI skeleton. */
const structure = (u, v, t, sx) => {
  const n = noiseFor(sx);
  const col = Math.floor(u * 9);
  const h = 0.28 + Math.abs(n(col * 3.7, sx * 0.01)) * 0.62;
  const lit = 0.55 + 0.45 * Math.sin(col * 1.7 + t * 0.25);
  const bar = smooth(1 - h - 0.02, 1 - h + 0.05, v);
  const gutter = smooth(0.06, 0.16, Math.abs((u * 9) % 1 - 0.5) * 2);
  return clamp01(bar * lit * gutter);
};

/** Domain-warped diagonal turbulence. Reads as flow / smoke. */
const flow = (u, v, t, sx) => {
  const n = noiseFor(sx);
  const wx = n(u * 2.2, v * 2.2 + t * 0.18) * 0.6;
  const wy = n(u * 2.2 + 5.3, v * 2.2 - t * 0.14) * 0.6;
  const s = Math.sin((u + wx) * 7 + (v + wy) * 4.5 - t * 0.6);
  return clamp01(0.5 + s * 0.5 - (v - 0.5) * 0.25);
};

export const MOTIFS = { portrait, terrain, orb, ripple, structure, flow };
export const MOTIF_NAMES = Object.keys(MOTIFS);
