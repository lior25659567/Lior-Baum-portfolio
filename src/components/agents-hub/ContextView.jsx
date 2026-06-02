import { useState, useEffect } from 'react';
import { readFile, writeContext } from '../../data/agentsHubApi';

// Split a context.md back into its two sections for the textareas.
// Tolerant: a missing heading yields an empty section; section order doesn't matter.
function parseContext(md) {
  if (!md) return { facts: '', wondering: '' };
  const norm = md.replace(/\r\n/g, '\n');
  const section = (label) => {
    const m = norm.match(new RegExp(`^##\\s+${label}\\s*$`, 'm'));
    if (!m) return '';
    const rest = norm.slice(m.index + m[0].length);
    const next = rest.search(/^##\s+/m);
    return (next >= 0 ? rest.slice(0, next) : rest).trim();
  };
  return { facts: section('Facts to use'), wondering: section('Wondering whether to add') };
}

const ContextView = ({ studies, selectedSlug, setSelectedSlug, onRefresh }) => {
  const [facts, setFacts] = useState('');
  const [wondering, setWondering] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFacts(''); setWondering(''); setStatus('');
    if (!selectedSlug) return;
    readFile(`cases/reviews/${selectedSlug}/context.md`)
      .then((r) => { const p = parseContext(r.content); setFacts(p.facts); setWondering(p.wondering); })
      .catch(() => { /* no context yet — start blank */ });
  }, [selectedSlug]);

  const save = async () => {
    if (!selectedSlug) { setStatus('Pick a study first.'); return; }
    setBusy(true);
    try {
      await writeContext(selectedSlug, facts, wondering);
      await onRefresh();
      setStatus('Saved. Review / Fix will read this context. Optional — leave blank to skip.');
    } catch (e) { setStatus(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        <select className="hub-input" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          <option value="">— pick a study —</option>
          {studies.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
        <button className="hub-btn primary" disabled={busy || !selectedSlug} onClick={save}>Save context</button>
      </div>
      <p className="hub-sub">Optional. Real facts here stop the agents inventing them; open questions get answered in the review. Leave empty and nothing changes.</p>
      {status && <div className="hub-pill" style={{ display: 'block', marginBottom: 8 }}>{status}</div>}
      {selectedSlug && (
        <>
          <label className="hub-label">Facts to use</label>
          <textarea className="hub-textarea" placeholder={'- Timeline: 3 weeks\n- Role: solo — design + build\n- Research: none (personal project)\n- Live at example.com'} value={facts} onChange={(e) => setFacts(e.target.value)} />
          <label className="hub-label">Wondering whether to add</label>
          <textarea className="hub-textarea" placeholder={'- Should I add a slide on X?\n- Is it worth mentioning Y?'} value={wondering} onChange={(e) => setWondering(e.target.value)} />
        </>
      )}
      {!selectedSlug && <div>Pick a study to add or edit its context.</div>}
    </div>
  );
};

export default ContextView;
