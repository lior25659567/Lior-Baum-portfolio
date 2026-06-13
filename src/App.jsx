import { lazy, Suspense } from 'react';
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

function AppLayout() {
  const location = useLocation();
  const isAbout = location.pathname === '/about';
  // About and Playground render their OWN <Footer /> inside the page so it
  // mounts fresh on each visit and its scroll-reveal animation replays.
  // The global footer here would be a persistent, already-settled duplicate.
  const isPlayground = location.pathname === '/playground';

  return (
    <>
      <Navigation />
      <main>
        <RouteErrorBoundary>
          <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--color-bg,#fff)'}} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/project/:projectId" element={<CaseStudy />} />
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
