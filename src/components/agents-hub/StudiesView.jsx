import { useState } from 'react';
import { enqueueJob, runScript } from '../../data/agentsHubApi';
import Markdown from './Markdown';

const StudiesView = ({ studies, onRefresh, onView, onVerify }) => {
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState('');
  const [busy, setBusy] = useState('');

  const queue = async (action, slug) => {
    setBusy(`${action}:${slug}`);
    try { await enqueueJob({ action, slug }); await onRefresh(); }
    catch (e) { alert(e.message); }
    finally { setBusy(''); }
  };

  // Toggle: first click fetches + shows the full budget table; second click hides it.
  const toggleBudget = async (slug) => {
    if (budgets[slug]) { setBudgets((b) => { const n = { ...b }; delete n[slug]; return n; }); return; }
    setLoading(slug);
    try {
      const { stdout } = await runScript('budget', { slug });
      setBudgets((b) => ({ ...b, [slug]: stdout || '(no output)' }));
    } catch (e) { setBudgets((b) => ({ ...b, [slug]: `⚠ ${e.message}` })); }
    finally { setLoading(''); }
  };

  if (!studies.length) return <div>No case studies yet. Use the Create tab.</div>;
  return (
    <div>
      {studies.map((s) => (
        <div key={s.slug} className="hub-row-wrap">
          <div className="hub-row">
            <div className="meta">
              <strong>{s.title}</strong>
              <span className="hub-badge">{s.slug}</span>
              <span className="hub-badge">{s.slideCount} slides</span>
              {s.artifacts.length > 0 && <span className="hub-badge">{s.artifacts.length} artifacts</span>}
              {s.hasContext && <span className="hub-badge">context ✓</span>}
            </div>
            <div className="hub-actions">
              <button className="hub-btn" onClick={() => toggleBudget(s.slug)}>
                {loading === s.slug ? 'Loading…' : budgets[s.slug] ? 'Hide budget' : 'Budget'}
              </button>
              <button className="hub-btn" disabled={busy === `review:${s.slug}`} onClick={() => queue('review', s.slug)}>Review</button>
              <button className="hub-btn" disabled={busy === `fix:${s.slug}`} onClick={() => queue('fix', s.slug)}>Fix</button>
              <button className="hub-btn" onClick={() => onView(s.slug)} disabled={!s.artifacts.length}>View</button>
              <button className="hub-btn" onClick={() => onVerify(s.slug)} disabled={!s.artifacts.includes('FIX-REPORT')}>Verify</button>
            </div>
          </div>
          {budgets[s.slug] && <div className="hub-budget"><Markdown>{budgets[s.slug]}</Markdown></div>}
        </div>
      ))}
    </div>
  );
};

export default StudiesView;
