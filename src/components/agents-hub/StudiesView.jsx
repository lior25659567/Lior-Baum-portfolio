import { useState } from 'react';
import { enqueueJob, runScript } from '../../data/agentsHubApi';

const StudiesView = ({ studies, onRefresh, onView, onVerify }) => {
  const [budgets, setBudgets] = useState({});
  const [busy, setBusy] = useState('');

  const queue = async (action, slug) => {
    setBusy(`${action}:${slug}`);
    try { await enqueueJob({ action, slug }); await onRefresh(); }
    catch (e) { alert(e.message); }
    finally { setBusy(''); }
  };

  const loadBudget = async (slug) => {
    try {
      const { stdout } = await runScript('budget', { slug });
      const line = stdout.split('\n').find((l) => /over budget/.test(l)) || stdout.split('\n')[0];
      setBudgets((b) => ({ ...b, [slug]: line.trim() }));
    } catch (e) { setBudgets((b) => ({ ...b, [slug]: e.message })); }
  };

  if (!studies.length) return <div>No case studies yet. Use the Create tab.</div>;
  return (
    <div>
      {studies.map((s) => (
        <div key={s.slug} className="hub-row">
          <div className="meta">
            <strong>{s.title}</strong>
            <span className="hub-badge">{s.slug}</span>
            <span className="hub-badge">{s.slideCount} slides</span>
            {s.artifacts.length > 0 && <span className="hub-badge">{s.artifacts.length} artifacts</span>}
            {s.hasContext && <span className="hub-badge">context ✓</span>}
            {budgets[s.slug] && <span className="hub-pill">{budgets[s.slug]}</span>}
          </div>
          <div className="hub-actions">
            <button className="hub-btn" onClick={() => loadBudget(s.slug)}>Budget</button>
            <button className="hub-btn" disabled={busy === `review:${s.slug}`} onClick={() => queue('review', s.slug)}>Review</button>
            <button className="hub-btn" disabled={busy === `fix:${s.slug}`} onClick={() => queue('fix', s.slug)}>Fix</button>
            <button className="hub-btn" onClick={() => onView(s.slug)} disabled={!s.artifacts.length}>View</button>
            <button className="hub-btn" onClick={() => onVerify(s.slug)} disabled={!s.artifacts.includes('FIX-REPORT')}>Verify</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudiesView;
