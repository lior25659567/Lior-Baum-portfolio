import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEdit } from '../context/EditContext';
import { getOverview } from '../data/agentsHubApi';
import JobsBar from '../components/agents-hub/JobsBar';
import StudiesView from '../components/agents-hub/StudiesView';
import CreateView from '../components/agents-hub/CreateView';
import ArtifactsView from '../components/agents-hub/ArtifactsView';
import VerifyView from '../components/agents-hub/VerifyView';
import './AgentsHub.css';

const TABS = [
  { key: 'studies', label: 'Studies' },
  { key: 'create', label: 'Create' },
  { key: 'artifacts', label: 'Artifacts' },
  { key: 'verify', label: 'Verify / Resolve' },
];

const AgentsHub = () => {
  const navigate = useNavigate();
  const { editMode } = useEdit();
  const allowed = import.meta.env.DEV && editMode;

  const [tab, setTab] = useState('studies');
  const [overview, setOverview] = useState({ studies: [], briefs: [], jobs: [] });
  const [selectedSlug, setSelectedSlug] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try { setOverview(await getOverview()); setError(''); }
    catch (e) { setError(e.message); }
  }, []);

  useEffect(() => { if (!allowed) navigate('/'); }, [allowed, navigate]);
  useEffect(() => { if (allowed) refresh(); }, [allowed, refresh]);

  if (!allowed) return null;

  const openArtifacts = (slug) => { setSelectedSlug(slug); setTab('artifacts'); };
  const openVerify = (slug) => { setSelectedSlug(slug); setTab('verify'); };

  return (
    <section className="agents-hub">
      <header className="hub-header">
        <h1>Agents Hub</h1>
        <p className="hub-sub">Run case-study review, fix, and create — deterministic steps run here, AI passes run in Claude Code via the job queue.</p>
      </header>

      <JobsBar jobs={overview.jobs} onRefresh={refresh} />

      <nav className="hub-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`hub-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </nav>

      {error && <div className="hub-error">⚠ {error}</div>}

      <div className="hub-panel">
        {tab === 'studies' && <StudiesView studies={overview.studies} onRefresh={refresh} onView={openArtifacts} onVerify={openVerify} />}
        {tab === 'create' && <CreateView briefs={overview.briefs} onRefresh={refresh} />}
        {tab === 'artifacts' && <ArtifactsView studies={overview.studies} selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} />}
        {tab === 'verify' && <VerifyView studies={overview.studies} selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} onRefresh={refresh} />}
      </div>
    </section>
  );
};

export default AgentsHub;
