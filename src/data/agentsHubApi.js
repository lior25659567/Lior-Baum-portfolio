// Thin fetch wrappers for the dev-only /api/hub/* endpoints. Same-origin
// (the Vite dev server). The Agents Hub page never renders in production, so
// these are only ever called in dev.
async function call(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
const jsonPost = (url, body) => call(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const getOverview = () => call('/api/hub/overview');
export const getJobs = () => call('/api/hub/jobs');
export const runScript = (cmd, params = {}) => jsonPost('/api/hub/run', { cmd, ...params });
export const readFile = (p) => call(`/api/hub/file?path=${encodeURIComponent(p)}`);
export const writeBrief = (name, content) => jsonPost('/api/hub/brief', { name, content });
export const enqueueJob = (payload) => jsonPost('/api/hub/enqueue', payload);
