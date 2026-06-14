import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCaseStudyDataAsync } from '../data/caseStudyData';
import './PresenterView.css';

const slideTitle = (s) => s?.title || s?.label || 'Slide';

const PresenterView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [index, setIndex] = useState(0);

  // Load the deck (same accessor the case study page uses).
  useEffect(() => {
    let alive = true;
    getCaseStudyDataAsync(projectId).then((data) => {
      if (alive) setProject(data);
    });
    return () => { alive = false; };
  }, [projectId]);

  // Listen for slide changes from the main window; announce readiness on mount.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(`cs-presenter:${projectId}`);
    ch.onmessage = (e) => {
      if (e.data?.type === 'index' && typeof e.data.index === 'number') {
        setIndex(e.data.index);
      }
    };
    ch.postMessage({ type: 'ready' });
    const onKey = (e) => { if (e.key === 'Escape') window.close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      ch.close();
      window.removeEventListener('keydown', onKey);
    };
  }, [projectId]);

  const slides = project?.slides || [];
  const current = slides[index];
  const next = slides[index + 1];

  return (
    <div className="presenter-view">
      <div className="presenter-position">
        {project ? `${index + 1} / ${slides.length}` : '…'}
      </div>
      <div className="presenter-notes-body">
        {current?.presenterNotes
          ? current.presenterNotes.split('\n').map((line, i) => <p key={i}>{line || ' '}</p>)
          : <p className="presenter-empty">(no notes for this slide)</p>}
      </div>
      {next && <div className="presenter-next">Next: {slideTitle(next)}</div>}
    </div>
  );
};

export default PresenterView;
