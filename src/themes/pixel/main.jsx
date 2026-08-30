import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './tokens.css';
import Index from './pages/Index';
import CaseStudy from './pages/CaseStudy';
import About from './pages/About';
import Playground from './pages/Playground';
import Scaffold from './pages/Scaffold';
import Type from './pages/Type';
import Compare from './pages/Compare';

/* The pixel theme's own React root.
 *
 * Deliberately does NOT mount ThemeProvider or EditProvider. Those two are
 * what make a same-document second theme impossible (see docs/theme-audit.md
 * §4b and §4c): ThemeContext owns the `data-theme` attribute, and EditContext
 * writes --font-display / --font-body / --color-accent as inline styles on
 * :root, which beat any stylesheet. Not mounting them is the whole reason
 * this theme can use plain :root tokens.
 *
 * HashRouter, not BrowserRouter: this entry is served at /pixel.html, so
 * path-based routing would need a basename plus dev-server rewrites. Hash
 * routing needs neither and keeps the entry zero-config.
 */
createRoot(document.getElementById('pixel-root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="/about" element={<About />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/scaffold" element={<Scaffold />} />
        <Route path="/type" element={<Type />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
