import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EditProvider } from './context/EditContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import EditPanel from './components/EditPanel';
import Home from './pages/Home';
import About from './pages/About';
import CaseStudy from './pages/CaseStudy';
import './App.css';

function App() {
  return (
    <EditProvider>
      <Router>
        <div className="app loaded">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/project/:projectId" element={<CaseStudy />} />
            </Routes>
          </main>
          <Footer />
          <EditPanel />
        </div>
      </Router>
    </EditProvider>
  );
}

export default App;
