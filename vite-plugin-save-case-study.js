// Vite plugin: dev-only API to save case study data back to source files
// Exposes POST /api/save-case-study during development

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import https from 'https';

const NETLIFY_BUILD_HOOK = 'https://api.netlify.com/build_hooks/69d7cb8c2578b11512ef44a2';

// 500 MB ceiling — protects against runaway uploads but allows large videos
const MAX_BODY_BYTES = 500 * 1024 * 1024;

// Callback-style body reader (avoids async middleware signatures that hang Vite's chain).
// Uses Buffer chunks — string concat is O(n²) on large base64 payloads.
function readJsonBody(req, cb) {
  const chunks = [];
  let size = 0;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      cb(new Error(`Request body exceeds ${MAX_BODY_BYTES} bytes`));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try {
      cb(null, JSON.parse(Buffer.concat(chunks).toString('utf-8')));
    } catch (err) {
      cb(err);
    }
  });
  req.on('error', cb);
}

export function saveCaseStudyPlugin() {
  return {
    name: 'save-case-study',
    configureServer(server) {
      server.middlewares.use('/api/save-case-study', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        readJsonBody(req, (err, body) => {
          if (err) {
            console.error('[save-case-study] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          try {
            const { projectId, data } = body;
            if (!projectId || !data) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing projectId or data' }));
              return;
            }
            const dir = path.resolve('src/data/case-studies');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, `${projectId}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            updateIndex(dir);
            console.log(`[save-case-study] Saved ${projectId} → ${filePath}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: filePath }));
          } catch (e) {
            console.error('[save-case-study] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // Delete a saved case study
      server.middlewares.use('/api/delete-case-study', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        readJsonBody(req, (err, body) => {
          if (err) {
            console.error('[save-case-study] Delete error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          try {
            const { projectId } = body;
            if (!projectId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing projectId' }));
              return;
            }
            const dir = path.resolve('src/data/case-studies');
            const filePath = path.join(dir, `${projectId}.json`);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              updateIndex(dir);
              console.log(`[save-case-study] Deleted ${projectId}`);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            console.error('[save-case-study] Delete error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // Save a single image file to public/case-studies/{projectId}/
      server.middlewares.use('/api/save-image', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        readJsonBody(req, (err, body) => {
          if (err) {
            console.error('[save-image] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          try {
            const { projectId, filename, base64data } = body;
            if (!projectId || !filename || !base64data) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing projectId, filename, or base64data' }));
              return;
            }
            const dir = path.resolve('public', 'case-studies', projectId);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, filename);
            const buffer = Buffer.from(base64data, 'base64');
            // Skip write if identical file already exists — avoids rewriting 30MB videos on every save
            if (fs.existsSync(filePath) && fs.statSync(filePath).size === buffer.length) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, path: `/case-studies/${projectId}/${filename}`, skipped: true }));
              return;
            }
            fs.writeFileSync(filePath, buffer);
            console.log(`[save-image] Saved ${projectId}/${filename} (${buffer.length} bytes)`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: `/case-studies/${projectId}/${filename}` }));
          } catch (e) {
            console.error('[save-image] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // Save about page profile image to public/about/
      server.middlewares.use('/api/save-about-image', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        readJsonBody(req, (err, body) => {
          if (err) {
            console.error('[save-about-image] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          try {
            const { filename, base64data } = body;
            if (!filename || !base64data) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing filename or base64data' }));
              return;
            }
            const dir = path.resolve('public', 'about');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, filename);
            const buffer = Buffer.from(base64data, 'base64');
            fs.writeFileSync(filePath, buffer);
            console.log(`[save-about-image] Saved ${filename} (${buffer.length} bytes)`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: `/about/${filename}` }));
          } catch (e) {
            console.error('[save-about-image] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // Save about page content (bio, skills, experience)
      server.middlewares.use('/api/save-about-content', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        readJsonBody(req, (err, data) => {
          if (err) {
            console.error('[save-about-content] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          try {
            const dir = path.resolve('src/data');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, 'about-content.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[save-about-content] Saved → ${filePath}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: filePath }));
          } catch (e) {
            console.error('[save-about-content] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // Save home page content + styles
      server.middlewares.use('/api/save-home-content', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        readJsonBody(req, (err, body) => {
          if (err) {
            console.error('[save-home-content] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          try {
            const { content, styles } = body;
            if (!content && !styles) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing content or styles' }));
              return;
            }
            const dir = path.resolve('src/data');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, 'home-content.json');
            fs.writeFileSync(filePath, JSON.stringify({ content, styles }, null, 2), 'utf-8');
            console.log(`[save-home-content] Saved → ${filePath}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: filePath }));
          } catch (e) {
            console.error('[save-home-content] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // Git commit + push
      server.middlewares.use('/api/git-push', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const run = (cmd, timeoutMs = 60_000) => new Promise((resolve, reject) => {
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
            (err, stdout, stderr) => {
              if (err) {
                const msg = (stderr || err.message || '').trim();
                reject(new Error(msg || `Command failed: ${cmd}`));
              } else {
                resolve(stdout.trim());
              }
            }
          );
        });

        (async () => {
          try {
            await run('git add src/data/case-studies/');
            // Also stage any saved image files
            const publicDir = path.resolve('public', 'case-studies');
            if (fs.existsSync(publicDir)) {
              await run('git add public/case-studies/');
            }
            // Stage home content if it exists
            const homeContentPath = path.resolve('src/data/home-content.json');
            if (fs.existsSync(homeContentPath)) {
              await run('git add src/data/home-content.json');
            }
            // Stage about content if it exists
            const aboutContentPath = path.resolve('src/data/about-content.json');
            if (fs.existsSync(aboutContentPath)) {
              await run('git add src/data/about-content.json');
            }
            // Stage about images if they exist
            const aboutImagesDir = path.resolve('public', 'about');
            if (fs.existsSync(aboutImagesDir)) {
              await run('git add public/about/');
            }

            // Check if there's anything staged to commit
            const staged = await run('git diff --cached --name-only').catch(() => '');
            if (staged) {
              const date = new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
              await run(`git commit -m "Update case studies (${date})"`);
            }

            // Longer timeout on push — large media transfers can legitimately take a while
            await run('git push', 180_000);

            // Trigger Netlify deploy automatically
            await new Promise((resolve) => {
              const url = new URL(NETLIFY_BUILD_HOOK);
              const req = https.request({ hostname: url.hostname, path: url.pathname, method: 'POST' }, (r) => {
                r.resume();
                resolve();
              });
              req.on('error', (e) => { console.warn('[git-push] Netlify hook failed:', e.message); resolve(); });
              req.end();
            });
            console.log('[git-push] Netlify deploy triggered');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, committed: !!staged }));
          } catch (err) {
            console.error('[git-push] Error:', err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        })();
      });

      // List saved case studies
      server.middlewares.use('/api/list-case-studies', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        const dir = path.resolve('src/data/case-studies');
        if (!fs.existsSync(dir)) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ids: [] }));
          return;
        }
        const ids = fs.readdirSync(dir)
          .filter(f => f.endsWith('.json') && f !== 'index.js')
          .map(f => f.replace('.json', ''));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ids }));
      });
    },
  };
}

function updateIndex(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const imports = files.map((f, i) => {
    const id = f.replace('.json', '');
    return `import cs${i} from './${f}';`;
  });
  const entries = files.map((f, i) => {
    const id = f.replace('.json', '');
    return `  '${id}': cs${i},`;
  });
  const content = `// Auto-generated — do not edit manually\n${imports.join('\n')}\n\nexport const savedCaseStudies = {\n${entries.join('\n')}\n};\n`;
  fs.writeFileSync(path.join(dir, 'index.js'), content, 'utf-8');
}
