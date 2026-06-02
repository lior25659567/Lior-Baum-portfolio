import { useState, useEffect } from 'react';
import Markdown from './Markdown';
import { readFile, runScript } from '../../data/agentsHubApi';

const ORDER = ['FIX-REPORT', 'synthesis', 'ux-verdict', 'recruiter-verdict', 'director-verdict', 'edit-summary', 'copy-summary', 'verify-report', 'extracted'];

const ArtifactsView = ({ studies, selectedSlug, setSelectedSlug }) => {
  const study = studies.find((s) => s.slug === selectedSlug);
  const available = study ? ORDER.filter((a) => study.artifacts.includes(a)) : [];
  const [active, setActive] = useState('');
  const [md, setMd] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => { setActive(available[0] || ''); setBudget(''); }, [selectedSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedSlug || !active) { setMd(''); return; }
    readFile(`cases/reviews/${selectedSlug}/${active}.md`).then((r) => setMd(r.content)).catch((e) => setMd(`⚠ ${e.message}`));
  }, [selectedSlug, active]);

  const loadBudget = async () => {
    try { const { stdout } = await runScript('budget', { slug: selectedSlug }); setBudget(stdout); }
    catch (e) { setBudget(e.message); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        <select className="hub-input" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          <option value="">— pick a study —</option>
          {studies.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
        {available.map((a) => <button key={a} className={`hub-btn ${active === a ? 'primary' : ''}`} onClick={() => setActive(a)}>{a}</button>)}
        {selectedSlug && <button className="hub-btn" onClick={loadBudget}>Budget table</button>}
      </div>
      {budget && <Markdown>{'```\n' + budget + '\n```'}</Markdown>}
      {!selectedSlug && <div>Pick a study to read its review artifacts.</div>}
      {selectedSlug && !available.length && <div>No artifacts yet — run Review/Fix first.</div>}
      {md && <Markdown>{md}</Markdown>}
    </div>
  );
};

export default ArtifactsView;
