import { useEffect, useRef } from 'react';
import { getJobs } from '../../data/agentsHubApi';

const TERMINAL = new Set(['done', 'error']);

const JobsBar = ({ jobs, onRefresh }) => {
  const active = jobs.filter((j) => !TERMINAL.has(j.status));
  const wasActive = useRef(false);

  useEffect(() => {
    if (active.length === 0) {
      if (wasActive.current) { wasActive.current = false; onRefresh(); } // flush final state
      return;
    }
    wasActive.current = true;
    const t = setInterval(async () => {
      try {
        const { jobs: latest } = await getJobs();
        const stillActive = latest.some((j) => !TERMINAL.has(j.status));
        onRefresh();
        if (!stillActive) clearInterval(t);
      } catch { /* keep polling */ }
    }, 4000);
    return () => clearInterval(t);
  }, [active.length, onRefresh]);

  if (jobs.length === 0) {
    return <div className="hub-jobsbar">No jobs queued. Queue a Review / Fix / Create, then run <code>run hub jobs</code> in Claude Code.</div>;
  }
  return (
    <div className="hub-jobsbar">
      <strong>{active.length}</strong> active ·
      {jobs.slice(-6).map((j) => (
        <span key={j.id} className={`hub-jobchip ${j.status}`}>{j.action}:{j.slug || j.briefName} · {j.status}</span>
      ))}
      {active.length > 0 && <span>→ run <code>run hub jobs</code> in Claude Code</span>}
    </div>
  );
};

export default JobsBar;
