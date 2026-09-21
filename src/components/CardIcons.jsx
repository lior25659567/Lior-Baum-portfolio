// ─────────────────────────────────────────────────────────────────────────
// CardIcons — the small inline icon set for article Cards (per-card icon
// picker) and annotation ✓ / ✕ callouts. Stroke icons on a 24px grid,
// drawn in currentColor so tone classes color them. Add an icon by adding
// a key here — it shows up in the picker automatically.
// ─────────────────────────────────────────────────────────────────────────

// This module exports icon data (JSX elements), not components — editing it
// just triggers a full reload instead of a hot update, which is fine.
/* eslint-disable react-refresh/only-export-components */

const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const CARD_ICONS = {
  alert: <Svg><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></Svg>,
  bolt: <Svg><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></Svg>,
  dot: <Svg><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" /></Svg>,
  check: <Svg><path d="M20 6 9 17l-5-5" /></Svg>,
  x: <Svg><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>,
  star: <Svg><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" /></Svg>,
  target: <Svg><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Svg>,
  lightbulb: <Svg><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></Svg>,
  user: <Svg><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>,
  users: <Svg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>,
  chart: <Svg><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></Svg>,
  clock: <Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>,
  shield: <Svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Svg>,
  layers: <Svg><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></Svg>,
  sparkle: <Svg><path d="M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z" /></Svg>,
  heart: <Svg><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></Svg>,
  arrow: <Svg><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Svg>,
};

export const CARD_ICON_KEYS = Object.keys(CARD_ICONS);

// Cards with no explicit `icon` keep the icon their tone always showed.
export const TONE_DEFAULT_ICON = { negative: 'alert', positive: 'bolt', neutral: 'dot' };
