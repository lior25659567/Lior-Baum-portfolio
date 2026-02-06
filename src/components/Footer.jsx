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
    // Ensure ScrollTrigger refreshes after page loads
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];
    
    // Set initial state
    gsap.set(lines, { y: 80, opacity: 0, skewY: 5 });

    const ctx = gsap.context(() => {
      // Create timeline for footer animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
          onEnter: () => {
            // Animate lines in
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
            // Animate lines out when scrolling back up
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

    // Refresh ScrollTrigger after a short delay to ensure DOM is ready
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, []);
  
  return (
    <footer className={`footer ${editMode ? 'edit-mode-active' : ''}`} id="contact" ref={footerRef}>
      <div className="footer-container">
        {/* CTA Section with Decoration */}
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
                <AnimatedButton 
                  href={`mailto:${content.footer.email}`}
                  variant="outline"
                  icon="→"
                >
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
          
          {/* Visual Decoration - aligned to CTA */}
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
        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="footer-copyright">
            © {currentYear} {content.footer.copyright}. All rights reserved.
          </p>
          
          <div className="footer-links">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              LinkedIn
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              Dribbble
            </a>
            <a href="https://behance.net" target="_blank" rel="noopener noreferrer" className="footer-link">
              Behance
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
