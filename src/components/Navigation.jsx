import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import ThemeToggle from './ThemeToggle';
import { useEdit } from '../context/EditContext';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const location = useLocation();
  const { content, editMode, updateContent } = useEdit();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/#projects' },
  ];

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith('/#')) {
      if (location.pathname === '/') {
        const element = document.querySelector(href.replace('/', ''));
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <motion.nav
        className={`navigation ${isMenuOpen ? 'menu-open' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src="/logo/liorbaum-logo.svg" alt="Lior Baum" />
          </Link>

          {/* Desktop Links */}
          <div className="nav-links desktop-only">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.href.startsWith('/#') ? (
                  <Link
                    to={item.href.replace('/#', '/')}
                    className={`nav-link ${location.pathname === '/' && location.hash === item.href.replace('/', '') ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    to={item.href}
                    className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop Right Section */}
          <div className="nav-right desktop-only">
            <ThemeToggle />
            {editMode ? (
              <div className="cv-link-editor">
                <AnimatedButton 
                  href={content.hero.cvLink || '/resume.pdf'} 
                  variant="outline"
                  icon="→"
                  className="nav-cta-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditingLink(!isEditingLink);
                  }}
                >
                  View CV
                </AnimatedButton>
                {isEditingLink && (
                  <div className="cv-link-input-wrapper">
                    <input
                      type="text"
                      className="cv-link-input"
                      value={content.hero.cvLink || '/resume.pdf'}
                      onChange={(e) => updateContent('hero', { ...content.hero, cvLink: e.target.value })}
                      placeholder="Enter CV link or file path"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                      className="cv-link-done"
                      onClick={() => setIsEditingLink(false)}
                    >
                      ✓
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <AnimatedButton 
                href={content.hero.cvLink || '/resume.pdf'} 
                variant="outline"
                icon="→"
                className="nav-cta-btn"
              >
                View CV
              </AnimatedButton>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="nav-mobile-right">
            <ThemeToggle />
            {/* Hamburger Menu Button */}
            <button 
              className={`hamburger ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
              <span className="hamburger-line line-3"></span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="mobile-menu-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="mobile-nav-links">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                  >
                    {item.href.startsWith('/#') ? (
                      <Link
                        to={item.href.replace('/#', '/')}
                        className="mobile-nav-link"
                        onClick={() => handleNavClick(item.href)}
                      >
                        <span className="mobile-link-number">0{index + 1}</span>
                        <span className="mobile-link-text">{item.label}</span>
                      </Link>
                    ) : (
                      <Link
                        to={item.href}
                        className="mobile-nav-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="mobile-link-number">0{index + 1}</span>
                        <span className="mobile-link-text">{item.label}</span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mobile-menu-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <AnimatedButton 
                  href={content.hero.cvLink || '/resume.pdf'} 
                  variant="primary"
                  icon="↓"
                  className="mobile-cta-btn"
                >
                  Download CV
                </AnimatedButton>
                
                <div className="mobile-social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer">Dribbble</a>
                  <a href="https://behance.net" target="_blank" rel="noopener noreferrer">Behance</a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
