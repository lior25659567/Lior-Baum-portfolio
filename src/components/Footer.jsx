import { useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import AnimatedButton from './AnimatedButton';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { content, editMode } = useEdit();
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

  useEffect(() => {
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];

    gsap.set(lines, { y: 80, opacity: 0, skewY: 5 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
          onEnter: () => {
            gsap.to(lines, {
              y: 0,
              opacity: 1,
              skewY: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out'
            });
          },
          onLeaveBack: () => {
            gsap.to(lines, {
              y: 80,
              opacity: 0,
              skewY: 5,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power3.in'
            });
          }
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
          <motion.div
            className="footer-decoration"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="decoration-circle" />
            <div className="decoration-ring" />
          </motion.div>
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
