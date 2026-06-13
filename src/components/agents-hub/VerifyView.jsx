import { useState, useEffect } from 'react';
import { readFile, enqueueJob } from '../../data/agentsHubApi';

// Pull the "Verify before sending" list out of FIX-REPORT.md. The report can
// carry two "## Verify before sending …" headings (an intro/instructions block
// then the actual list) and writes the items as a NUMBERED list — so we stay
// "in section" across any verify heading, exit on any other ## heading, and
// accept both bullet (-, *) and numbered (1., 1)) list markers.
function parseVerifyItems(mdText) {
  if (!mdText) return [];
  const items = [];
  let inSection = false;
  for (const line of mdText.split('\n')) {
    if (/^##\s+/.test(line)) {
      inSection = /^##\s+Verify before sending/i.test(line);
      continue;
    }
    if (!inSection) continue;
    const m = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.*\S)\s*$/);
    if (m) items.push(m[1].trim());
  }
  return items;
}

const VerifyView = ({ studies, selectedSlug, setSelectedSlug, onRefresh }) => {
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    setItems([]); setAnswers({}); setStatus('');
    if (!selectedSlug) return;
    readFile(`cases/reviews/${selectedSlug}/FIX-REPORT.md`)
      .then((r) => { const it = parseVerifyItems(r.content); setItems(it); setAnswers(Object.fromEntries(it.map((_, i) => [i, { decision: 'keep', value: '' }]))); })
      .catch((e) => setStatus(e.message));
  }, [selectedSlug]);

  const setDecision = (i, decision) => setAnswers((a) => ({ ...a, [i]: { ...a[i], decision } }));
  const setValue = (i, value) => setAnswers((a) => ({ ...a, [i]: { ...a[i], value } }));

  const apply = async () => {
    const payload = items.map((text, i) => ({ item: text, decision: answers[i].decision, value: answers[i].value }));
    try { await enqueueJob({ action: 'resolve', slug: selectedSlug, answers: payload }); await onRefresh(); setStatus('Queued resolve job — run "run hub jobs" in Claude Code.'); }
    catch (e) { setStatus(e.message); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        <select className="hub-input" value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          <option value="">— pick a study —</option>
          {studies.filter((s) => s.artifacts.includes('FIX-REPORT')).map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
      </div>
      {status && <div className="hub-pill" style={{ display: 'block', marginBottom: 10 }}>{status}</div>}
      {selectedSlug && !items.length && <div>No "Verify before sending" items in this study's FIX-REPORT.</div>}
      {items.map((text, i) => (
        <div key={i} className="hub-verify-item">
          <div>{text}</div>
          <div className="choices">
            {['keep', 'genericize', 'replace'].map((d) => (
              <button key={d} className={`hub-btn ${answers[i]?.decision === d ? 'primary' : ''}`} onClick={() => setDecision(i, d)}>{d}</button>
            ))}
            {answers[i]?.decision === 'replace' && (
              <input className="hub-input" placeholder="real value" value={answers[i].value} onChange={(e) => setValue(i, e.target.value)} />
            )}
          </div>
        </div>
      ))}
      {items.length > 0 && <button className="hub-btn primary" onClick={apply}>Apply answers (queue resolve)</button>}
    </div>
  );
};

export default VerifyView;
