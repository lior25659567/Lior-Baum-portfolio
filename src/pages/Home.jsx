import { useState } from 'react';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import Projects from '../components/Projects';
import { useEdit } from '../context/EditContext';
import './HomePublishBar.css';

const Home = () => {
  const { editMode, saveHomeToCode, gitPush } = useEdit();
  const [status, setStatus] = useState('');

  const handleSaveToCode = async () => {
    setStatus('saving');
    try {
      await saveHomeToCode();
      setStatus('saved');
      setTimeout(() => setStatus(''), 2500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handlePushToGit = async () => {
    setStatus('pushing');
    try {
      await saveHomeToCode();
      await gitPush();
      setStatus('pushed');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <>
      <Hero />
      <ServicesSection />
      <Projects />
      {editMode && (
        <div className="home-publish-bar">
          <button
            className="home-publish-btn save-btn"
            onClick={handleSaveToCode}
            disabled={status === 'saving' || status === 'pushing'}
          >
            {status === 'saving' ? 'Saving...' : status === 'saved' ? '✓ Saved' : '💾 Save to Code'}
          </button>
          <button
            className="home-publish-btn push-btn"
            onClick={handlePushToGit}
            disabled={status === 'saving' || status === 'pushing'}
          >
            {status === 'pushing' ? 'Pushing...' : status === 'pushed' ? '✓ Pushed & Deployed' : '↑ Push to Git'}
          </button>
          {status === 'error' && <span className="home-publish-error">Failed — check console</span>}
        </div>
      )}
    </>
  );
};

export default Home;
