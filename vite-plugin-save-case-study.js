// Vite plugin: dev-only API to save case study data back to source files
// Exposes POST /api/save-case-study (and friends) during development.
//
// Design notes:
//   * All file I/O is async (fs/promises) so the dev-server event loop keeps
//     servicing HMR websockets and other API calls while a save is in flight.
//   * JSON endpoints cap body size at 50MB and early-reject via Content-Length.
//     Large media goes through /api/save-video which streams to disk instead
//     of base64-in-JSON (which was OOM'ing the Vite process).
//   * Every /api/* request logs method, path, size, and duration so we can
//     spot slow middleware before it takes the server down.

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import https from 'https';

const NETLIFY_BUILD_HOOK = 'https://api.netlify.com/build_hooks/69d7cb8c2578b11512ef44a2';

// Per-request JSON body cap. Kept intentionally small — anything bigger should
// use the streaming /api/save-video endpoint.
const MAX_JSON_BYTES = 50 * 1024 * 1024; // 50 MB
// Streaming video upload cap
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
const SLOW_REQUEST_MS = 2_000;

const SERVER_STARTED_AT = Date.now();

// ── Helpers ────────────────────────────────────────────────────────────────

function contentLengthTooBig(req, max) {
  const len = Number(req.headers['content-length']);
  return Number.isFinite(len) && len > max;
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

// Callback-style body reader — buffered because JSON endpoints are small now.
// Hard-caps by total bytes and destroys the socket on overflow.
function readJsonBody(req, max, cb) {
  const chunks = [];
  let size = 0;
  let done = false;
  const finish = (err, val) => {
    if (done) return;
    done = true;
    cb(err, val);
  };
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > max) {
      const err = new Error(`Request body exceeds ${max} bytes`);
      err.statusCode = 413;
      req.destroy();
      finish(err);
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try {
      finish(null, JSON.parse(Buffer.concat(chunks).toString('utf-8')));
    } catch (e) {
      finish(e);
    }
  });
  req.on('error', finish);
}

async function pathExists(p) {
  try { await fsp.access(p); return true; }
  catch { return false; }
}

// Wrap a handler with request logging + uniform error handling. Handler must
// return a value (sent as JSON 200) or throw. Throw an object with statusCode
// to customize the response code.
function wrap(name, handler) {
  return (req, res) => {
    const startedAt = Date.now();
    const size = Number(req.headers['content-length']) || 0;
    let statusCode = 200;
    Promise.resolve()
      .then(() => handler(req, res))
      .then((result) => {
        if (!res.writableEnded) {
          if (result === undefined) {
            sendJson(res, 200, { ok: true });
          } else {
            sendJson(res, 200, { ok: true, ...result });
          }
        }
        statusCode = res.statusCode;
      })
      .catch((err) => {
        statusCode = err.statusCode || 500;
        console.error(`[${name}] Error:`, err.message);
        if (!res.writableEnded) sendJson(res, statusCode, { error: err.message });
      })
      .finally(() => {
        const ms = Date.now() - startedAt;
        const tag = ms > SLOW_REQUEST_MS ? '[slow]' : '';
        console.log(`[api]${tag} ${req.method} ${name} ${statusCode} ${ms}ms bytesIn=${size}`);
      });
  };
}

function assertMethod(req, method) {
  if (req.method !== method) {
    const err = new Error('Method not allowed');
    err.statusCode = 405;
    throw err;
  }
}

async function readJson(req, max = MAX_JSON_BYTES) {
  if (contentLengthTooBig(req, max)) {
    const err = new Error(`Request body exceeds ${max} bytes (Content-Length)`);
    err.statusCode = 413;
    throw err;
  }
  return new Promise((resolve, reject) => {
    readJsonBody(req, max, (err, body) => (err ? reject(err) : resolve(body)));
  });
}

// ── Plugin ─────────────────────────────────────────────────────────────────

export function saveCaseStudyPlugin() {
  return {
    name: 'save-case-study',
    configureServer(server) {
      // Health probe — used by Save All and by the dev:doctor script to
      // confirm the plugin's event loop is still responsive before firing
      // expensive batches. Intentionally zero-I/O.
      server.middlewares.use('/api/health', wrap('/api/health', async (req) => {
        assertMethod(req, 'GET');
        const mem = process.memoryUsage();
        return {
          uptimeSec: Math.round((Date.now() - SERVER_STARTED_AT) / 1000),
          memoryMB: {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          },
          node: process.version,
        };
      }));

      // Save a case study JSON and regenerate the index.
      server.middlewares.use('/api/save-case-study', wrap('/api/save-case-study', async (req) => {
        assertMethod(req, 'POST');
        const body = await readJson(req);
        const { projectId, data } = body;
        if (!projectId || !data) {
          const err = new Error('Missing projectId or data');
          err.statusCode = 400;
          throw err;
        }
        const dir = path.resolve('src/data/case-studies');
        await fsp.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, `${projectId}.json`);
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        await updateIndex(dir);
        console.log(`[save-case-study] Saved ${projectId} → ${filePath}`);
        return { path: filePath };
      }));

      server.middlewares.use('/api/delete-case-study', wrap('/api/delete-case-study', async (req) => {
        assertMethod(req, 'POST');
        const { projectId } = await readJson(req);
        if (!projectId) {
          const err = new Error('Missing projectId');
          err.statusCode = 400;
          throw err;
        }
        const dir = path.resolve('src/data/case-studies');
        const filePath = path.join(dir, `${projectId}.json`);
        if (await pathExists(filePath)) {
          await fsp.unlink(filePath);
          await updateIndex(dir);
          console.log(`[delete-case-study] Deleted ${projectId}`);
        }
        return {};
      }));

      // Image save (base64-in-JSON). Kept for backward compat with the editor
      // but capped at MAX_JSON_BYTES — videos must use /api/save-video.
      server.middlewares.use('/api/save-image', wrap('/api/save-image', async (req) => {
        assertMethod(req, 'POST');
        const { projectId, filename, base64data } = await readJson(req);
        if (!projectId || !filename || !base64data) {
          const err = new Error('Missing projectId, filename, or base64data');
          err.statusCode = 400;
          throw err;
        }
        const dir = path.resolve('public', 'case-studies', projectId);
        await fsp.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, filename);
        const buffer = Buffer.from(base64data, 'base64');
        // Skip write if identical file already exists — avoids rewriting
        // large assets on every "Save All".
        try {
          const stat = await fsp.stat(filePath);
          if (stat.size === buffer.length) {
            return { path: `/case-studies/${projectId}/${filename}`, skipped: true };
          }
        } catch { /* file does not exist — continue */ }
        await fsp.writeFile(filePath, buffer);
        console.log(`[save-image] Saved ${projectId}/${filename} (${buffer.length} bytes)`);
        return { path: `/case-studies/${projectId}/${filename}` };
      }));

      // Streaming video upload — avoids loading the whole file into a JS
      // string before parsing. Query params carry metadata.
      //   POST /api/save-video?projectId=foo&filename=demo.mp4
      //   Content-Type: application/octet-stream
      server.middlewares.use('/api/save-video', (req, res) => {
        const startedAt = Date.now();
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          console.log(`[api] POST /api/save-video 405 ${Date.now() - startedAt}ms`);
          return;
        }
        if (contentLengthTooBig(req, MAX_VIDEO_BYTES)) {
          sendJson(res, 413, { error: `Video exceeds ${MAX_VIDEO_BYTES} bytes` });
          console.log(`[api] POST /api/save-video 413 ${Date.now() - startedAt}ms`);
          return;
        }
        const url = new URL(req.url, 'http://localhost');
        const projectId = url.searchParams.get('projectId');
        const filename = url.searchParams.get('filename');
        if (!projectId || !filename) {
          sendJson(res, 400, { error: 'Missing projectId or filename query param' });
          return;
        }
        const dir = path.resolve('public', 'case-studies', projectId);
        const filePath = path.join(dir, filename);
        const tmpPath = `${filePath}.part`;

        (async () => {
          try {
            await fsp.mkdir(dir, { recursive: true });
            const out = fs.createWriteStream(tmpPath);
            let received = 0;
            let aborted = false;

            const abort = (statusCode, msg) => {
              aborted = true;
              req.unpipe(out);
              out.destroy();
              fsp.unlink(tmpPath).catch(() => {});
              if (!res.writableEnded) sendJson(res, statusCode, { error: msg });
              console.log(`[api] POST /api/save-video ${statusCode} ${Date.now() - startedAt}ms bytesIn=${received}`);
            };

            req.on('data', (chunk) => {
              received += chunk.length;
              if (received > MAX_VIDEO_BYTES) {
                req.destroy();
                abort(413, `Video exceeds ${MAX_VIDEO_BYTES} bytes`);
              }
            });
            req.on('error', (e) => abort(500, `Upload error: ${e.message}`));
            out.on('error', (e) => abort(500, `Write error: ${e.message}`));

            req.pipe(out);

            out.on('close', async () => {
              if (aborted) return;
              try {
                await fsp.rename(tmpPath, filePath);
                console.log(`[save-video] Saved ${projectId}/${filename} (${received} bytes) in ${Date.now() - startedAt}ms`);
                sendJson(res, 200, { ok: true, path: `/case-studies/${projectId}/${filename}`, bytes: received });
              } catch (e) {
                console.error('[save-video] rename failed:', e.message);
                sendJson(res, 500, { error: e.message });
              }
            });
          } catch (e) {
            console.error('[save-video] setup failed:', e.message);
            sendJson(res, 500, { error: e.message });
          }
        })();
      });

      server.middlewares.use('/api/save-about-image', wrap('/api/save-about-image', async (req) => {
        assertMethod(req, 'POST');
        const { filename, base64data } = await readJson(req);
        if (!filename || !base64data) {
          const err = new Error('Missing filename or base64data');
          err.statusCode = 400;
          throw err;
        }
        const dir = path.resolve('public', 'about');
        await fsp.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, filename);
        const buffer = Buffer.from(base64data, 'base64');
        await fsp.writeFile(filePath, buffer);
        console.log(`[save-about-image] Saved ${filename} (${buffer.length} bytes)`);
        return { path: `/about/${filename}` };
      }));

      // Direct-serve fallback for /about/*. Vite's public-dir middleware is
      // registered once at startup; if public/about/ didn't exist then, new
      // files written there won't be served even though they're on disk. This
      // middleware re-reads from disk per request so uploads work without a
      // dev-server restart.
      server.middlewares.use('/about', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const urlPath = req.url.split('?')[0];
        const safe = path.posix.normalize(urlPath).replace(/^\/+/, '');
        if (safe.startsWith('..')) return next();
        const abs = path.resolve('public', 'about', safe);
        fsp.stat(abs).then((stat) => {
          if (!stat.isFile()) return next();
          const ext = path.extname(abs).toLowerCase();
          const mime = {
            '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
            '.avif': 'image/avif',
          }[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Cache-Control', 'no-cache');
          if (req.method === 'HEAD') { res.end(); return; }
          fs.createReadStream(abs).pipe(res);
        }).catch(() => next());
      });

      server.middlewares.use('/api/save-about-content', wrap('/api/save-about-content', async (req) => {
        assertMethod(req, 'POST');
        const data = await readJson(req);
        const dir = path.resolve('src/data');
        await fsp.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, 'about-content.json');
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[save-about-content] Saved → ${filePath}`);
        return { path: filePath };
      }));

      server.middlewares.use('/api/save-home-content', wrap('/api/save-home-content', async (req) => {
        assertMethod(req, 'POST');
        const { content, styles } = await readJson(req);
        if (!content && !styles) {
          const err = new Error('Missing content or styles');
          err.statusCode = 400;
          throw err;
        }
        const dir = path.resolve('src/data');
        await fsp.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, 'home-content.json');
        await fsp.writeFile(filePath, JSON.stringify({ content, styles }, null, 2), 'utf-8');
        console.log(`[save-home-content] Saved → ${filePath}`);
        return { path: filePath };
      }));

      // Git commit + push — fully instrumented with per-step timing and
      // structured error responses (step / code / stderr) so the UI can show
      // the real reason a push failed.
      server.middlewares.use('/api/git-push', (req, res) => {
        const requestStart = Date.now();
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        const run = (cmd, timeoutMs = 60_000) => new Promise((resolve) => {
          const startedAt = Date.now();
          exec(
            cmd,
            {
              cwd: path.resolve('.'),
              timeout: timeoutMs,
              maxBuffer: 10 * 1024 * 1024,
              env: {
                ...process.env,
                // Fail instead of hanging forever if git needs credentials interactively
                GIT_TERMINAL_PROMPT: '0',
                GIT_ASKPASS: 'echo',
              },
            },
            (err, stdout, stderr) => resolve({
              cmd,
              ms: Date.now() - startedAt,
              code: err ? (err.code ?? err.signal ?? 1) : 0,
              killed: !!(err && err.killed),
              stdout: (stdout || '').trim(),
              stderr: (stderr || '').trim(),
              error: err ? (err.message || '').trim() : null,
            })
          );
        });

        const must = async (cmd, timeoutMs, step) => {
          const r = await run(cmd, timeoutMs);
          console.log(`[git-push] step=${step} cmd="${cmd}" exit=${r.code} ms=${r.ms}${r.stderr ? ` stderr="${r.stderr.slice(0, 300)}"` : ''}`);
          if (r.code !== 0) {
            const hint = r.killed ? ' (killed — likely timeout)' : '';
            const detail = r.stderr || r.error || r.stdout || `exit ${r.code}`;
            const e = new Error(`${step} failed${hint}: ${detail}`);
            e.step = step;
            e.code = r.code;
            e.stderr = r.stderr;
            e.stdout = r.stdout;
            throw e;
          }
          return r.stdout;
        };

        (async () => {
          try {
            await must('git add src/data/case-studies/', 30_000, 'add-case-studies');

            if (await pathExists(path.resolve('public', 'case-studies'))) {
              await must('git add public/case-studies/', 30_000, 'add-public-case-studies');
            }
            if (await pathExists(path.resolve('src/data/home-content.json'))) {
              await must('git add src/data/home-content.json', 30_000, 'add-home-content');
            }
            if (await pathExists(path.resolve('src/data/about-content.json'))) {
              await must('git add src/data/about-content.json', 30_000, 'add-about-content');
            }
            if (await pathExists(path.resolve('public', 'about'))) {
              await must('git add public/about/', 30_000, 'add-about-images');
            }

            const staged = await must('git diff --cached --name-only', 30_000, 'diff-cached');
            if (staged) {
              const date = new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
              await must(`git commit -m "Update case studies (${date})"`, 30_000, 'commit');
            }

            await must('git push', 180_000, 'push');

            await new Promise((resolve) => {
              const url = new URL(NETLIFY_BUILD_HOOK);
              const hookReq = https.request(
                { hostname: url.hostname, path: url.pathname, method: 'POST' },
                (r) => { r.resume(); resolve(); }
              );
              hookReq.on('error', (e) => { console.warn('[git-push] Netlify hook failed:', e.message); resolve(); });
              hookReq.end();
            });
            const totalMs = Date.now() - requestStart;
            console.log(`[git-push] OK totalMs=${totalMs} committed=${!!staged}`);
            sendJson(res, 200, { ok: true, committed: !!staged, elapsedMs: totalMs });
          } catch (err) {
            const totalMs = Date.now() - requestStart;
            console.error(`[git-push] FAILED step=${err.step || '?'} code=${err.code || '?'} totalMs=${totalMs} msg=${err.message}`);
            sendJson(res, 500, {
              error: err.message,
              step: err.step || null,
              code: err.code ?? null,
              stderr: err.stderr || null,
              stdout: err.stdout || null,
            });
          }
        })();
      });

      // Run the case-study WebP conversion script. Dev-only (never shipped).
      // The script handles backup + convert + ref rewrite + build-verify + delete
      // end-to-end; this endpoint is a thin exec wrapper so the editor can fire
      // it without the user touching a terminal.
      server.middlewares.use('/api/convert-images-to-webp', wrap('/api/convert-images-to-webp', async (req) => {
        assertMethod(req, 'POST');
        const scriptPath = path.resolve('scripts/convert-case-study-images-to-webp.sh');
        const startedAt = Date.now();
        const result = await new Promise((resolve) => {
          exec(`bash ${JSON.stringify(scriptPath)}`, {
            cwd: path.resolve('.'),
            timeout: 300_000,
            maxBuffer: 10 * 1024 * 1024,
            env: { ...process.env },
          }, (err, stdout, stderr) => resolve({
            stdout: (stdout || '').trim(),
            stderr: (stderr || '').trim(),
            code: err ? (err.code ?? err.signal ?? 1) : 0,
            killed: !!(err && err.killed),
          }));
        });
        const elapsedMs = Date.now() - startedAt;
        console.log(`[convert-webp] exit=${result.code} ms=${elapsedMs}`);
        if (result.code !== 0) {
          const hint = result.killed ? ' (killed — likely timeout)' : '';
          const detail = result.stderr || result.stdout || `exit ${result.code}`;
          const e = new Error(`WebP conversion failed${hint}: ${detail}`);
          e.statusCode = 500;
          e.stderr = result.stderr;
          e.stdout = result.stdout;
          throw e;
        }
        return { stdout: result.stdout, stderr: result.stderr, elapsedMs };
      }));

      // Runs scripts/compress-videos.js — produces desktop re-encode,
      // .mobile.mp4, and .poster.webp siblings. Idempotent; originals go
      // into backups/case-studies-videos-<ts>/. Long timeout because ffmpeg
      // preset=slow can take minutes across a full library.
      server.middlewares.use('/api/compress-videos', wrap('/api/compress-videos', async (req) => {
        assertMethod(req, 'POST');
        const scriptPath = path.resolve('scripts/compress-videos.js');
        const startedAt = Date.now();
        const result = await new Promise((resolve) => {
          exec(`node ${JSON.stringify(scriptPath)}`, {
            cwd: path.resolve('.'),
            timeout: 1_800_000,
            maxBuffer: 20 * 1024 * 1024,
            env: { ...process.env },
          }, (err, stdout, stderr) => resolve({
            stdout: (stdout || '').trim(),
            stderr: (stderr || '').trim(),
            code: err ? (err.code ?? err.signal ?? 1) : 0,
            killed: !!(err && err.killed),
          }));
        });
        const elapsedMs = Date.now() - startedAt;
        console.log(`[compress-videos] exit=${result.code} ms=${elapsedMs}`);
        if (result.code !== 0) {
          const hint = result.killed ? ' (killed — likely timeout)' : '';
          const detail = result.stderr || result.stdout || `exit ${result.code}`;
          const e = new Error(`Video compression failed${hint}: ${detail}`);
          e.statusCode = 500;
          e.stderr = result.stderr;
          e.stdout = result.stdout;
          throw e;
        }
        return { stdout: result.stdout, stderr: result.stderr, elapsedMs };
      }));

      // Runs scripts/generate-image-variants.mjs — emits @480/@960 webp
      // siblings + updates src/data/case-study-image-variants.json.
      server.middlewares.use('/api/generate-image-variants', wrap('/api/generate-image-variants', async (req) => {
        assertMethod(req, 'POST');
        const scriptPath = path.resolve('scripts/generate-image-variants.mjs');
        const startedAt = Date.now();
        const result = await new Promise((resolve) => {
          exec(`node ${JSON.stringify(scriptPath)}`, {
            cwd: path.resolve('.'),
            timeout: 600_000,
            maxBuffer: 20 * 1024 * 1024,
            env: { ...process.env },
          }, (err, stdout, stderr) => resolve({
            stdout: (stdout || '').trim(),
            stderr: (stderr || '').trim(),
            code: err ? (err.code ?? err.signal ?? 1) : 0,
            killed: !!(err && err.killed),
          }));
        });
        const elapsedMs = Date.now() - startedAt;
        console.log(`[image-variants] exit=${result.code} ms=${elapsedMs}`);
        if (result.code !== 0) {
          const hint = result.killed ? ' (killed — likely timeout)' : '';
          const detail = result.stderr || result.stdout || `exit ${result.code}`;
          const e = new Error(`Image variant generation failed${hint}: ${detail}`);
          e.statusCode = 500;
          e.stderr = result.stderr;
          e.stdout = result.stdout;
          throw e;
        }
        return { stdout: result.stdout, stderr: result.stderr, elapsedMs };
      }));

      // Cheap, always-safe git state snapshot.
      server.middlewares.use('/api/git-status', wrap('/api/git-status', async (req) => {
        assertMethod(req, 'GET');
        const run = (cmd, timeoutMs = 5_000) => new Promise((resolve) => {
          exec(
            cmd,
            {
              cwd: path.resolve('.'),
              timeout: timeoutMs,
              maxBuffer: 1 * 1024 * 1024,
              env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: 'echo' },
            },
            (err, stdout, stderr) => resolve({
              code: err ? (err.code ?? 1) : 0,
              stdout: (stdout || '').trim(),
              stderr: (stderr || '').trim(),
            })
          );
        });
        const [branchR, remoteR, aheadBehindR, dirtyR, credR, lsRemoteR] = await Promise.all([
          run('git rev-parse --abbrev-ref HEAD'),
          run('git config --get remote.origin.url'),
          run('git rev-list --left-right --count @{u}...HEAD'),
          run('git status --porcelain'),
          run('git config --get credential.helper'),
          run('git ls-remote --heads origin', 10_000),
        ]);
        const parts = (aheadBehindR.stdout || '0\t0').split(/\s+/).map(Number);
        const [behind, ahead] = [parts[0] || 0, parts[1] || 0];
        return {
          branch: branchR.stdout || null,
          remote: remoteR.stdout || null,
          ahead,
          behind,
          hasUnstaged: !!dirtyR.stdout,
          unstagedCount: dirtyR.stdout ? dirtyR.stdout.split('\n').length : 0,
          credentialHelper: credR.stdout || null,
          remoteReachable: lsRemoteR.code === 0,
          remoteError: lsRemoteR.code === 0 ? null : (lsRemoteR.stderr || `exit ${lsRemoteR.code}`),
        };
      }));

      server.middlewares.use('/api/list-case-studies', wrap('/api/list-case-studies', async (req) => {
        assertMethod(req, 'GET');
        const dir = path.resolve('src/data/case-studies');
        if (!(await pathExists(dir))) return { ids: [] };
        const entries = await fsp.readdir(dir);
        const ids = entries
          .filter(f => f.endsWith('.json') && f !== 'index.js')
          .map(f => f.replace('.json', ''));
        return { ids };
      }));
    },
  };
}

async function updateIndex(dir) {
  const entries = await fsp.readdir(dir);
  const files = entries.filter(f => f.endsWith('.json'));
  const imports = files.map((f, i) => `import cs${i} from './${f}';`);
  const entriesStr = files.map((f, i) => {
    const id = f.replace('.json', '');
    return `  '${id}': cs${i},`;
  });
  const content = `// Auto-generated — do not edit manually\n${imports.join('\n')}\n\nexport const savedCaseStudies = {\n${entriesStr.join('\n')}\n};\n`;
  await fsp.writeFile(path.join(dir, 'index.js'), content, 'utf-8');
}
