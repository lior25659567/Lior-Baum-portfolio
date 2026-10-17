// ─────────────────────────────────────────────────────────────────────────
// articleMotion.js — GSAP motion for the case-study article (read view).
//
// - entranceTargets(): what the on-open stagger in CaseStudyArticle.jsx
//   animates (hero / title / lede / first blocks).
// - useArticleScrollMotion(): everything below the fold moves in once, as it
//   scrolls into view — blocks rise, cards / list items / meta rows stagger,
//   images settle from a slight zoom, Accepted/Rejected chips pop, and
//   annotations draw themselves (boxes → notes → arrows) after their image
//   lands.
// - useHeroScrollMotion(): the hero image is tied to the scroll position — it
//   eases back and fades as it scrolls away, and plays that in reverse as
//   the reader scrolls back up to it.
//
// All are off in edit mode and under prefers-reduced-motion. Every tween
// ends in clearProps, so nothing is left inline: a lingering transform makes
// the element a containing block for fixed descendants and can stall iOS
// autoplay on nested videos (see caseStudyMedia), and an inline `transition:
// none` would kill the cards' CSS hover. Unmount / project change reverts the
// context, so a block can never be stranded at opacity 0.
// ─────────────────────────────────────────────────────────────────────────
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CLEAR = 'opacity,transform,transition';
const SVG_CLEAR = 'opacity,transform,strokeDasharray,strokeDashoffset';

// One flat query so the nodes come back in document order — that keeps the
// stagger correct whether or not the study leads with a hero block (a hero
// renders BEFORE the <header>, a normal study after it). Prose can emit
// several <p class="cs-article-lede">; only the first one moves.
export const entranceTargets = (root) => {
  if (!root) return [];
  let seenLede = false;
  return Array.from(root.querySelectorAll(
    ':scope > .cs-article-block, :scope > .cs-article-header .cs-article-h1, :scope > .cs-article-header .cs-article-lede'
  )).filter((el) => {
    if (!el.classList.contains('cs-article-lede')) return true;
    if (seenLede) return false;
    seenLede = true;
    return true;
  }).slice(0, 5);
};

// Blocks whose items move in one after another instead of as one piece.
// A block title (h3) always leads its items.
const STAGGER_PARTS = {
  cards: '.cs-article-card',
  metaGrid: '.cs-article-meta-item',
  problemSolutionImpact: '.cs-article-psi-row',
  bullets: '.cs-article-list > li',
  checklist: '.cs-article-reflect-group > .cs-article-h3, .cs-article-marklist > li',
  quote: '.cs-article-quote',
};

const blockType = (el) => (String(el.className).match(/cs-article-block--([A-Za-z]+)/) || [])[1] || '';

const piecesOf = (el) => {
  const sel = STAGGER_PARTS[blockType(el)];
  if (!sel) return [el];
  const parts = Array.from(el.querySelectorAll(`:scope > .cs-article-h3, ${sel}`));
  return parts.length ? parts : [el];
};

const lengthOf = (shape) => {
  try { return shape.getTotalLength(); } catch { return 0; }
};

// A stat value like "75%" or "3x" counts up from zero. Only a single plain
// number with a prefix/suffix qualifies ("1,200" or "10–15 min" don't), and
// only when the text is one node — React owns that node, so it's edited in
// place and always handed back with its original value.
const SINGLE_NUMBER = /^(\D*?)(\d+(?:\.\d+)?)(\D*)$/;
const countUp = (el, tl, at, restores) => {
  const node = el.childNodes.length === 1 ? el.firstChild : null;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const original = node.nodeValue;
  const m = original.match(SINGLE_NUMBER);
  if (!m) return;
  const target = parseFloat(m[2]);
  const decimals = (m[2].split('.')[1] || '').length;
  const show = (v) => { node.nodeValue = `${m[1]}${v.toFixed(decimals)}${m[3]}`; };
  const restore = () => { node.nodeValue = original; };
  restores.push(restore);
  const state = { v: 0 };
  show(0);
  tl.to(state, { v: target, duration: 1, ease: 'power2.out', onUpdate: () => show(state.v), onComplete: restore }, at);
};

// Annotations draw in after their image lands: boxes and pen strokes trace
// their outline, then the notes fade up, then each arrow draws from its tail
// and its head pops at the tip. Desktop only — below 1024px the layer is
// hidden and its text is listed under the image instead.
const drawAnnotations = (tl, layer, at) => {
  if (getComputedStyle(layer).display === 'none') return;
  const boxes = [];
  const strokes = [];
  const arrows = [];
  layer.querySelectorAll('.cs-annot-svg > .cs-annot-shape').forEach((g) => {
    const head = g.querySelector(':scope > polygon');
    const line = g.querySelector(':scope > path:not(.cs-annot-hit), :scope > line:not(.cs-annot-hit)');
    const rect = g.querySelector(':scope > rect:not(.cs-annot-hit):not(.cs-annot-selection)');
    if (head && line) arrows.push({ line, head });
    else if (rect) boxes.push(rect);
    else if (line) strokes.push(line);
  });
  const texts = layer.querySelectorAll('.cs-annot-text, .cs-annot-marker, .cs-annot-boxlabel');

  const trace = (shape, start, duration) => {
    const len = lengthOf(shape);
    if (!len) {
      tl.fromTo(shape, { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: SVG_CLEAR }, start);
      return;
    }
    gsap.set(shape, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len });
    tl.to(shape, { strokeDashoffset: 0, duration, ease: 'power2.inOut', clearProps: SVG_CLEAR }, start);
  };

  boxes.forEach((rect, i) => {
    gsap.set(rect, { opacity: 0 });
    tl.to(rect, { opacity: 1, duration: 0.25 }, at + i * 0.1);
    trace(rect, at + i * 0.1, 0.6);
  });
  strokes.forEach((path, i) => trace(path, at + i * 0.1, 0.7));
  // `y: '+=8'` is relative, so notes centred with a CSS translate(-50%, -50%)
  // (✓/✕ labels, markers) keep their offset while they rise.
  if (texts.length) {
    tl.from(texts, { opacity: 0, y: '+=8', duration: 0.4, ease: 'power2.out', stagger: 0.08, clearProps: CLEAR }, at + 0.2);
  }
  const arrowsAt = at + 0.3 + texts.length * 0.08;
  arrows.forEach(({ line, head }, i) => {
    const start = arrowsAt + i * 0.1;
    trace(line, start, 0.45);
    gsap.set(head, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' });
    tl.to(head, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)', clearProps: SVG_CLEAR }, start + 0.38);
  });
};

// Hides one below-the-fold block and returns what plays when it scrolls in.
const prepare = (el, restores) => {
  if (el.classList.contains('cs-article-next')) {
    const cards = el.querySelectorAll('.cs-article-next-card');
    const thumbs = el.querySelectorAll('.cs-article-next-thumb img');
    gsap.set(cards, { opacity: 0, y: 24 });
    gsap.set(thumbs, { scale: 1.12, transition: 'none' });
    return (tl) => tl
      .to(cards, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1, clearProps: CLEAR }, 0)
      .to(thumbs, { scale: 1, duration: 1, ease: 'power3.out', stagger: 0.1, clearProps: CLEAR }, 0);
  }

  const type = blockType(el);

  if (type === 'divider') {
    const hr = el.querySelector('.cs-article-hr') || el;
    gsap.set(hr, { scaleX: 0, transformOrigin: 'left center' });
    return (tl) => tl.to(hr, { scaleX: 1, duration: 0.9, ease: 'power3.out', clearProps: CLEAR }, 0);
  }

  if (type === 'figure') {
    // Only image stages settle — a video keeps its box still while it starts.
    const stages = Array.from(el.querySelectorAll('.cs-annot-stage')).filter((s) => s.querySelector(':scope > img'));
    const chips = el.querySelectorAll('.cs-article-figure-chip');
    gsap.set(el, { opacity: 0, y: 28 });
    gsap.set(stages, { scale: 1.035, transformOrigin: '50% 60%' });
    gsap.set(chips, { opacity: 0, scale: 0.6 });
    return (tl) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', clearProps: CLEAR }, 0)
        .to(stages, { scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08, clearProps: CLEAR }, 0)
        .to(chips, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.08, clearProps: CLEAR }, 0.35);
      el.querySelectorAll('.cs-annot-layer').forEach((layer, i) => drawAnnotations(tl, layer, 0.55 + i * 0.15));
    };
  }

  const pieces = piecesOf(el);
  // Cards carry a CSS transform transition for their hover lift; switched off
  // while GSAP drives the transform, or every frame would be eased twice.
  gsap.set(pieces, { opacity: 0, y: 18, transition: 'none' });
  const badges = type === 'cards'
    ? Array.from(el.querySelectorAll('.cs-article-card-num, .cs-article-card-icon, .cs-article-card-value'))
    : [];
  if (badges.length) gsap.set(badges, { opacity: 0, scale: 0.5, transition: 'none' });
  return (tl) => {
    tl.to(pieces, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07, clearProps: CLEAR }, 0);
    if (badges.length) {
      tl.to(badges, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.07, clearProps: CLEAR }, 0.2);
      el.querySelectorAll('.cs-article-card-value').forEach((v, i) => countUp(v, tl, 0.2 + i * 0.07, restores));
    }
  };
};

export const useArticleScrollMotion = (rootRef, { enabled, resetKey }) => {
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const restores = [];
    const plays = new Map();
    let io = null;
    const ctx = gsap.context(() => {
      const skip = new Set(entranceTargets(root));
      const fold = window.innerHeight;
      // Only what starts below the fold is hidden: anything already on screen
      // (or scrolled past, e.g. after leaving edit mode) stays put.
      root.querySelectorAll(':scope > .cs-article-block, :scope > .cs-article-end-wrap, :scope > .cs-article-next').forEach((el) => {
        if (skip.has(el) || el.getBoundingClientRect().top < fold) return;
        plays.set(el, prepare(el, restores));
      });
    }, root);
    if (!plays.size) return () => ctx.revert();

    // Several blocks can enter on the same frame (a fast scroll, short
    // blocks) — they cascade instead of popping in together.
    const playAll = (entering) => entering.forEach((el, i) => {
      const play = plays.get(el);
      if (!play) return;
      plays.delete(el);
      io.unobserve(el);
      ctx.add(() => play(gsap.timeline({ delay: i * 0.08 })));
    });
    io = new IntersectionObserver((entries) => {
      playAll(entries.filter((e) => e.isIntersecting).map((e) => e.target));
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    plays.forEach((_, el) => io.observe(el));

    // Safety net: a hidden block must never stay hidden on screen. If the
    // observer ever misses one, it plays once scrolling pauses. Same reveal
    // line as the observer (8% above the bottom edge).
    const scroller = root.closest('.case-study--article') || window;
    let timer = null;
    const sweep = () => {
      timer = null;
      const line = window.innerHeight * 0.92;
      playAll(Array.from(plays.keys()).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < line && r.bottom > 0;
      }));
      if (!plays.size) scroller.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(sweep, 160);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      scroller.removeEventListener('scroll', onScroll);
      if (timer !== null) clearTimeout(timer);
      ctx.revert();
      restores.forEach((restore) => restore());
    };
  }, [rootRef, enabled, resetKey]);
};

// The hero is the figure block rendered before the article header. The scrub
// drives its inner <figure>, never the block itself, because the entrance
// stagger animates the block.
export const useHeroScrollMotion = (rootRef, { enabled, resetKey }) => {
  useLayoutEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined;
    const root = rootRef.current;
    const hero = root?.querySelector(':scope > .cs-article-header')?.previousElementSibling;
    if (!hero?.classList.contains('cs-article-block--figure')) return undefined;
    const inner = hero.firstElementChild;
    const scroller = root.closest('.case-study--article');
    if (!inner || !scroller) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(inner,
        { scale: 1, yPercent: 0, opacity: 1 },
        {
          scale: 0.92,
          yPercent: 10,
          opacity: 0.35,
          ease: 'none',
          transformOrigin: '50% 0%',
          immediateRender: false,
          scrollTrigger: {
            trigger: hero,
            scroller,
            start: 0,
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
          // Back at the top the hero is untouched: no identity transform left
          // inline (it would make the figure a containing block for fixed
          // descendants, e.g. the lightbox trigger's focus ring).
          onUpdate() {
            if (this.progress() === 0) gsap.set(inner, { clearProps: 'transform,opacity' });
          },
        });
    }, root);

    // The end point depends on the hero's height, which changes as its image
    // loads and once the entrance stagger clears its offset.
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(hero);
    const settle = setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => {
      ro.disconnect();
      clearTimeout(settle);
      ctx.revert();
    };
  }, [rootRef, enabled, resetKey]);
};
