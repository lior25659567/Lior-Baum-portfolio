import { useState, useEffect } from 'react';
import { readFile, writeBrief, runScript, enqueueJob } from '../../data/agentsHubApi';

const CreateView = ({ briefs, onRefresh }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const loadBrief = async (briefName) => {
    setName(briefName);
    try { const { content: c } = await readFile(`cases/briefs/${briefName}.md`); setContent(c); }
    catch (e) { setStatus(e.message); }
  };

  const newBrief = async () => {
    try { const { content: tmpl } = await readFile('cases/briefs/_BRIEF-TEMPLATE.md'); setContent(tmpl); setName(''); setStatus('Loaded template — edit, set a name, Save.'); }
    catch (e) { setStatus(e.message); }
  };

  useEffect(() => { if (!content) newBrief(); /* seed once */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!name) { setStatus('Set a brief name first.'); return; }
    try { await writeBrief(name, content); await onRefresh(); setStatus(`Saved cases/briefs/${name.replace(/[^a-z0-9-_]/gi, '')}.md`); }
    catch (e) { setStatus(e.message); }
  };

  const scaffoldAndQueue = async () => {
    if (!title) { setStatus('Set a deck title first.'); return; }
    if (!name) { setStatus('Save the brief first.'); return; }
    setBusy(true);
    try {
      await writeBrief(name, content);
      const { slug } = await runScript('new', { title });
      if (!slug) throw new Error('scaffold did not return a slug');
      await enqueueJob({ action: 'create', slug, briefName: name });
      await onRefresh();
      setStatus(`Scaffolded ${slug}. Queued create job — run "run hub jobs" in Claude Code, then hard-refresh the app.`);
    } catch (e) { setStatus(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="hub-subtabs">
        {briefs.map((b) => <button key={b} className="hub-btn" onClick={() => loadBrief(b)}>{b}</button>)}
        <button className="hub-btn" onClick={newBrief}>+ New from template</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input className="hub-input" placeholder="brief name (a-z0-9-_)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="hub-input" placeholder="deck title (shows on cover)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="hub-btn" onClick={save}>Save brief</button>
        <button className="hub-btn primary" disabled={busy} onClick={scaffoldAndQueue}>Scaffold + queue create</button>
      </div>
      {status && <div className="hub-pill" style={{ display: 'block', marginBottom: 8 }}>{status}</div>}
      <textarea className="hub-textarea" value={content} onChange={(e) => setContent(e.target.value)} />
    </div>
  );
};

export default CreateView;
