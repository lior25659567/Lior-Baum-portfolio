import { useEffect, useRef, useCallback } from 'react';
import { mountCardMosaic } from './card-mosaic.js';
import './WorkCarousel.css';

const ArrowIcon = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'prev'
      ? (<><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>)
      : (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>)}
  </svg>
);

/* Horizontal work carousel, driven by the arrows.
 *
 * Cards show the REAL image; the pixel treatment is the hover mosaic
 * (card-mosaic.js), not a dithered plate — the card keeps its own colours.
 *
 * There is deliberately no drag-to-scrub: it fought the card links, needed
 * pointer capture to work at all (which swallowed the arrow clicks), and the
 * arrows are the intended control. Horizontal wheel/trackpad still works.
 */
const WorkCarousel = ({ items, title = 'Selected work', hint }) => {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const xRef = useRef(0);
  // Arrow enablement is driven imperatively alongside the transform, so a
  // scrub does not fire a setState per frame.
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const measure = useCallback(() => {
    const wrap = wrapRef.current, track = trackRef.current;
    if (!wrap || !track) return 0;
    return Math.min(0, wrap.clientWidth - track.scrollWidth);
  }, []);

  const apply = useCallback((next) => {
    const min = measure();
    const x = Math.max(min, Math.min(0, next));
    xRef.current = x;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${x}px,0,0)`;
    if (prevRef.current) prevRef.current.disabled = x >= -1;
    if (nextRef.current) nextRef.current.disabled = x <= min + 1;
  }, [measure]);

  /* dir: +1 advances (track moves LEFT, so x decreases), -1 goes back. */
  const step = useCallback((dir) => {
    const slide = trackRef.current?.querySelector('.slide');
    const w = slide ? slide.getBoundingClientRect().width + 28 : 360;
    apply(xRef.current - dir * w);
  }, [apply]);

  // Mosaic + bounds. Re-runs if the item set changes.
  useEffect(() => {
    if (!wrapRef.current) return undefined;
    const destroy = mountCardMosaic(wrapRef.current);
    apply(0);
    const ro = new ResizeObserver(() => apply(xRef.current));
    ro.observe(wrapRef.current);
    return () => { destroy(); ro.disconnect(); };
  }, [items, apply]);

  // Horizontal wheel / trackpad.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const wheel = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;   // let vertical scroll through
      apply(xRef.current - e.deltaX);
      e.preventDefault();
    };
    wrap.addEventListener('wheel', wheel, { passive: false });
    return () => wrap.removeEventListener('wheel', wheel);
  }, [apply]);

  return (
    <section className="caro" id="work">
      <div className="ch">
        <h2>{title}</h2>
        {hint ? <span className="hint">{hint}</span> : null}
      </div>

      <div className="track-wrap" ref={wrapRef}>
        <div className="track" ref={trackRef}>
          {items.map((p) => (
            <a className="slide cs" href={`#/work/${p.id}`} key={p.id}>
              <div className="csm">
                <img src={p.image} alt={p.title} loading="lazy" />
                <span className="reveal-cta" aria-hidden="true" />
                <span className="rc-clip"><span className="rc-i">View case study</span></span>
              </div>
              <p className="t">{p.title}</p>
              <p className="d">{p.description}</p>
            </a>
          ))}
        </div>

        <button type="button" className="sl-arrow prev" ref={prevRef}
                aria-label="Previous slides" disabled onClick={() => step(-1)}>
          <ArrowIcon dir="prev" />
        </button>
        <button type="button" className="sl-arrow next" ref={nextRef}
                aria-label="Next slides" onClick={() => step(1)}>
          <ArrowIcon dir="next" />
        </button>
      </div>
    </section>
  );
};

export default WorkCarousel;
