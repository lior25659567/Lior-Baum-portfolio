import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ServicesSection.css';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: '01',
    title: 'Product Design',
    description: 'End-to-end product design from discovery to delivery. Shaping clear value propositions and intuitive flows that users love.',
    icon: 'layers',
  },
  {
    number: '02',
    title: 'UI/UX & Interfaces',
    description: 'Crafting modern, responsive interfaces with strong visual hierarchy and interaction design. Clean systems and pixel-perfect execution.',
    icon: 'grid',
  },
  {
    number: '03',
    title: 'Design Systems',
    description: 'Building scalable design systems and components that keep products consistent, accessible, and easy to evolve over time.',
    icon: 'hexagon',
  },
  {
    number: '04',
    title: 'Research & Strategy',
    description: 'User research, journey mapping, and strategy that ground decisions in evidence and align product with business goals.',
    icon: 'nodes',
  },
];

const IconLayers = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18L22 12L32 18L42 12V38L32 44L22 38L12 44V18Z" />
    <path d="M22 12V38M32 18V44" />
  </svg>
);

const IconGrid = () => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="10" y="10" width="44" height="44" rx="6" />
    <path d="M10 22H54M22 10V54" />
    <circle cx="38" cy="38" r="6" />
  </svg>
);

const IconHexagon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 10L46 18V38L32 46L18 38V18L32 10Z" />
    <path d="M32 10V46M18 18L46 38M46 18L18 38" />
  </svg>
);

const IconNodes = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="18" r="6" />
    <circle cx="46" cy="18" r="6" />
    <circle cx="18" cy="46" r="6" />
    <circle cx="46" cy="46" r="6" />
    <path d="M24 18H40M24 46H40M18 24V40M46 24V40" />
  </svg>
);

const iconMap = { layers: IconLayers, grid: IconGrid, hexagon: IconHexagon, nodes: IconNodes };

const SERVICES_HEADLINE = 'Transforming ideas into exceptional digital experiences through expertise and innovation.';

const ServicesSection = () => {
  const cardsRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const words = el.querySelectorAll('.services-headline-word');
    if (!words.length) return;

    gsap.set(words, { y: 28, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(words, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.055,
          ease: 'power3.out',
        });
      },
    });
    return () => st.kill();
  }, []);

  // GSAP scroll animation for service cards (same style as Projects)
  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('.services-card');
    if (!cards.length) return;
    gsap.set(cards, { y: 50, opacity: 0 });
    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section className="services-section" id="services">
      <div className="services-section-container">
        <h2 className="services-headline" ref={headlineRef}>
          {SERVICES_HEADLINE.split(/\s+/).map((word, i) => (
            <span key={i} className="services-headline-word">
              {word}{' '}
            </span>
          ))}
        </h2>

        <div className="services-cards" ref={cardsRef}>
          {services.map((item) => {
            const Icon = iconMap[item.icon] || IconLayers;
            return (
              <article key={item.number} className="services-card">
                <div className="services-card-inner">
                  <div className="services-card-header">
                    <span className="services-card-number">{item.number}</span>
                    <div className="services-card-icon-wrap">
                      <Icon />
                    </div>
                  </div>
                  <h3 className="services-card-title">{item.title}</h3>
                  <p className="services-card-desc">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
