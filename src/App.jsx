import { lazy, Suspense, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { EditProvider } from './context/EditContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import EditPanel from './components/EditPanel';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import Home from './pages/Home';
import About from './pages/About';
import './App.css';

// Heavy routes — lazy-loaded so the home page doesn't wait on them
const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const Playground = lazy(() => import('./pages/Playground'));
const SlideDocumentation = lazy(() => import('./pages/SlideDocumentation'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const DesignSystem = lazy(() => import('./pages/DesignSystem'));
const AgentsHub = lazy(() => import('./pages/AgentsHub'));
const PresenterView = lazy(() => import('./pages/PresenterView'));

// Reset scroll to the top of the page on every route change. SPA navigation
// otherwise keeps the previous page's scroll offset, so arriving at e.g. About
// from the middle of Playground would land mid-page. Runs before paint
// (useLayoutEffect) to avoid a visible jump, and skips when the URL has a hash
// so in-page anchor links still work. Browser scroll restoration is disabled so
// it never fights this on back/forward.
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);
  useLayoutEffect(() => {
    if (window.location.hash) return;
    // Jump instantly to the top. `html { scroll-behavior: smooth }` would
    // otherwise animate the jump, and because route pages are lazy-loaded the
    // animation gets interrupted when the new (often tall) page mounts a tick
    // later — stranding you mid-page. Disable smooth for the reset, then
    // re-assert over the next frames so the lazy mount can't re-anchor scroll.
    const root = document.documentElement;
    const toTop = () => {
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
    };
    toTop();
    const raf = requestAnimationFrame(toTop);
    const timer = setTimeout(toTop, 140);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const isAbout = location.pathname === '/about';
  // About and Playground render their OWN <Footer /> inside the page so it
  // mounts fresh on each visit and its scroll-reveal animation replays.
  // The global footer here would be a persistent, already-settled duplicate.
  const isPlayground = location.pathname === '/playground';

  return (
    <>
      <ScrollToTop />
      <Navigation />
      <main>
        <RouteErrorBoundary>
          <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--color-bg,#fff)'}} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/project/:projectId" element={<CaseStudy />} />
              <Route path="/present/:projectId" element={<PresenterView />} />
              <Route path="/docs/slides" element={<SlideDocumentation />} />
              <Route path="/cv" element={<CVBuilder />} />
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="/agents-hub" element={<AgentsHub />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </main>
      {!isAbout && !isPlayground && <Footer />}
      <EditPanel />
    </>
  );
}

function App() {
  return (
    <EditProvider>
      <Router>
        <div className="app loaded">
          <AppLayout />
        </div>
      </Router>
    </EditProvider>
  );
}

export default App;
