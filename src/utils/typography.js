// ─────────────────────────────────────────────────────────────────────────
// typography.js — text helpers shared by the reading views.
//
// Rule: no text block may end on a line holding a single word. CSS
// `text-wrap: pretty` (index.css, site-wide) handles this in browsers that
// support it; `widont` is the hard guarantee for the case-study article in
// every browser. Unit-tested by typography.test.mjs (node --test).
// ─────────────────────────────────────────────────────────────────────────

const NBSP = ' ';

// Joins the last two words with a non-breaking space so they always wrap
// together. Skips texts under three words, and leaves the text alone when
// the two joined words are long enough to overflow a narrow screen.
export const widont = (text, maxTail = 24) => {
  if (typeof text !== 'string') return text;
  const body = text.replace(/\s+$/, '');
  const trailing = text.slice(body.length);
  const words = body.split(/\s+/);
  if (words.length < 3) return text;
  const tail = `${words[words.length - 2]} ${words[words.length - 1]}`.replace(/\*\*/g, '');
  if (tail.length > maxTail) return text;
  const cut = body.search(/\s+\S+$/);
  return `${body.slice(0, cut)}${NBSP}${body.slice(cut).replace(/^\s+/, '')}${trailing}`;
};
