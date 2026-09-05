import { lazy, Suspense, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { EditProvider } from './context/EditContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import EditPanel from './components/EditPanel';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import Index from './themes/pixel/pages/Index';
import About from './themes/pixel/pages/About';
import './App.css';

// Heavy routes — lazy-loaded so the home page doesn't wait on them
const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const Playground = lazy(() => import('./themes/pixel/pages/Playground'));
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

// Pixel-theme layout: the page supplies ALL its own chrome (PixelShell renders
// its own <main>, PixelNav, heat-field canvas, and PixelFooter). So this layout
// renders nothing but the outlet — no legacy Navigation / <main> / Footer, which
// would otherwise produce double nav/footer and an invalid nested <main>.
const PixelChrome = () => <Outlet />;

// Legacy layout: the original global chrome, unchanged. Wraps its routes in the
// legacy Navigation + <main> + Footer.
const LegacyChrome = () => (
  <>
    <Navigation />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <RouteErrorBoundary>
        <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--color-bg,#fff)'}} />}>
          <Routes>
            {/* Pixel-theme pages — self-chromed, no legacy wrapping. */}
            <Route element={<PixelChrome />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/playground" element={<Playground />} />
              {/* The CV builder renders its own PixelNav; the presenter view is
                  a full-screen presentation surface and wants no chrome at all.
                  Both were carrying an invisible legacy nav plus a 529px legacy
                  footer below the fold while wrapped in LegacyChrome. */}
              <Route path="/cv" element={<CVBuilder />} />
              <Route path="/present/:projectId" element={<PresenterView />} />
            </Route>

            {/* Everything else — legacy Navigation / <main> / Footer chrome. */}
            <Route element={<LegacyChrome />}>
              <Route path="/project/:projectId" element={<CaseStudy />} />
              <Route path="/docs/slides" element={<SlideDocumentation />} />
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="/agents-hub" element={<AgentsHub />} />
            </Route>
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
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
