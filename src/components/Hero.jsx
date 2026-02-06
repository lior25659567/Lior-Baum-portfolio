import { useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEdit } from '../context/EditContext';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const { content, editMode } = useEdit();
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const descRef = useRef(null);

  useLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    const elements = [introRef.current, line1Ref.current, line2Ref.current, descRef.current];
    
    // Set initial state - visible (since it's the first section)
    gsap.set(elements, { y: 0, opacity: 1, skewY: 0 });

    const ctx = gsap.context(() => {
      // Initial entrance animation
      const tl = gsap.timeline();
      
      gsap.set(elements, { y: 80, opacity: 0, skewY: 5 });
      
      tl.to(introRef.current, {
        y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: 'power2.out'
      })
      .to(line1Ref.current, {
        y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: 'power3.out'
      }, '-=0.3')
      .to(line2Ref.current, {
        y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: 'power3.out'
      }, '-=0.5')
      .to(descRef.current, {
        y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: 'power2.out'
      }, '-=0.4');

      // Scroll trigger - animate out when scrolling down, back in when scrolling up
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom 20%',
        onLeave: () => {
          // Scrolling down past hero
          gsap.to(elements, {
            y: -50,
            opacity: 0,
            skewY: -3,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.in'
          });
        },
        onEnterBack: () => {
          // Scrolling back up into hero
          gsap.to(elements, {
            y: 0,
            opacity: 1,
            skewY: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out'
          });
        }
      });
    }, heroRef);

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
    };
  }, []);

  return (
    <section className={`hero ${editMode ? 'edit-mode-active' : ''}`} id="home" ref={heroRef}>
      <div className="hero-background">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-intro" ref={introRef}>
            <span className="intro-line" />
            <span className="intro-text">{content.hero.label}</span>
          </div>
          
          <div className="hero-name">
            <div className="name-line-wrapper">
              <h1 className="name-line" ref={line1Ref}>
                <span className="sans">{content.hero.greeting}</span>
              </h1>
            </div>
            <div className="name-line-wrapper">
              <h1 className="name-line name-main" ref={line2Ref}>
                <span className="serif accent">{content.hero.name}</span>
              </h1>
            </div>
          </div>
          
          <p className="hero-description" ref={descRef}>
            {content.hero.description}
          </p>
        </div>
        
        {/* Animated Visual - Right Side */}
        <div className="hero-visual">
          <motion.div 
            className="visual-shape shape-main"
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div 
            className="visual-shape shape-outline"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div 
            className="visual-shape shape-secondary"
            initial={{ opacity: 0, x: 50, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: 360 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div 
            className="visual-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          />
          <motion.div 
            className="visual-dot dot-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          />
          <motion.div 
            className="visual-dot dot-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          />
          <motion.div 
            className="visual-dot dot-3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          />
          <motion.div 
            className="visual-dot dot-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.15, duration: 0.5 }}
          />
        </div>
        
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <div className="scroll-line" />
          <span>Scroll</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
