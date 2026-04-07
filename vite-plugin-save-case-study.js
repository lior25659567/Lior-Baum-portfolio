// Vite plugin: dev-only API to save case study data back to source files
// Exposes POST /api/save-case-study during development

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

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

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { projectId, data } = JSON.parse(body);
            if (!projectId || !data) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing projectId or data' }));
              return;
            }

            // Write to individual JSON files in src/data/case-studies/
            const dir = path.resolve('src/data/case-studies');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const filePath = path.join(dir, `${projectId}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

            // Update the index file that exports all saved case studies
            updateIndex(dir);

            console.log(`[save-case-study] Saved ${projectId} → ${filePath}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: filePath }));
          } catch (err) {
            console.error('[save-case-study] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
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
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { projectId } = JSON.parse(body);
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
          } catch (err) {
            console.error('[save-case-study] Delete error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
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

        const run = (cmd) => new Promise((resolve, reject) => {
          exec(cmd, { cwd: path.resolve('.') }, (err, stdout, stderr) => {
            if (err) reject(new Error(stderr || err.message));
            else resolve(stdout.trim());
          });
        });

        (async () => {
          try {
            await run('git add src/data/case-studies/');

            // Check if there's anything staged to commit
            const staged = await run('git diff --cached --name-only').catch(() => '');
            if (staged) {
              const date = new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
              await run(`git commit -m "Update case studies (${date})"`);
            }

            await run('git push');
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
