import { useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import AnimatedButton from './AnimatedButton';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { content, editMode } = useEdit();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const ctaRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const line4Ref = useRef(null);

  useLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  // The footer stays mounted across client-side route changes, so its
  // ScrollTrigger start/end positions are computed for whatever page first
  // loaded. On a shorter page (e.g. /playground) those stale positions sit
  // below the reachable scroll range, so the CTA reveal never fires and the
  // footer reads as blank. Recompute on every route change.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];

    gsap.set(lines, { y: 60, opacity: 0, filter: 'blur(4px)' });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(lines, {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.2)'
          });
        },
        onLeaveBack: () => {
          gsap.to(lines, {
            y: 60,
            opacity: 0,
            filter: 'blur(4px)',
            duration: 0.5,
            stagger: 0.05,
            ease: 'power3.in'
          });
        }
      });
    }, footerRef);

    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, []);

  return (
    <footer className={`footer ${editMode ? 'edit-mode-active' : ''}`} id="contact" ref={footerRef}>
      <div className="footer-container">
        {/* CTA block */}
        <div className="footer-cta-wrapper" ref={ctaRef}>
          <div className="footer-cta">
            <div className="cta-line-wrapper">
              <div className="cta-line" ref={line1Ref}>
                <span className="cta-text sans">{content.footer.line1}</span>
              </div>
            </div>
            <div className="cta-line-wrapper">
              <div className="cta-line" ref={line2Ref}>
                <span className="cta-text sans">{content.footer.line2_1}</span>
                <span className="cta-text serif highlight">{content.footer.line2_2}</span>
              </div>
            </div>
            <div className="cta-line-wrapper">
              <div className="cta-line with-button" ref={line3Ref}>
                <span className="cta-text sans">{content.footer.line3_1}</span>
                <AnimatedButton href={`mailto:${content.footer.email}`} variant="outline" icon="→">
                  Get in touch
                </AnimatedButton>
              </div>
            </div>
            <div className="cta-line-wrapper">
              <div className="cta-line" ref={line4Ref}>
                <span className="cta-text serif highlight">{content.footer.line4}</span>
              </div>
            </div>
          </div>
          <motion.nav
            className="footer-sitemap"
            aria-label="Footer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="footer-sitemap-col">
              <span className="footer-sitemap-title">Explore</span>
              <Link to="/" className="footer-sitemap-link">Home</Link>
              <Link to="/playground" className="footer-sitemap-link">Playground</Link>
              <Link to="/about" className="footer-sitemap-link">About</Link>
            </div>
            <div className="footer-sitemap-col">
              <span className="footer-sitemap-title">Connect</span>
              <a className="footer-sitemap-link" href={`mailto:${content.footer.email}`}>Email</a>
              <a
                className="footer-sitemap-link"
                href={content.hero.cvLink || '#'}
                target="_blank"
                rel="noreferrer"
              >
                CV
              </a>
            </div>
          </motion.nav>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">© {currentYear} {content.footer.copyright}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
