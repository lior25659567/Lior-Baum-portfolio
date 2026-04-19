# Portfolio v3

React 19 + Vite 7 portfolio with a dev-only in-page editor that writes case studies, about content, and images back to disk via a custom Vite middleware plugin.

## Scripts

```bash
npm run dev          # Vite dev server on http://localhost:5173
npm run dev:doctor   # Health snapshot: port, dev API, git, repo size
npm run build        # Production build to dist/
npm run preview      # Serve the built dist/ on :5173
npm run lint         # ESLint
```

## Architecture notes

- Routes are lazy-loaded ([src/App.jsx](src/App.jsx)) so the home page does not pay the parse cost of the heavier CaseStudy / CVBuilder / SlideDocumentation bundles.
- The dev-only plugin at [vite-plugin-save-case-study.js](vite-plugin-save-case-study.js) exposes:
  - `POST /api/save-case-study` — writes `src/data/case-studies/{id}.json` and rebuilds the index.
  - `POST /api/save-image` — base64-in-JSON, **capped at 50 MB** per request.
  - `POST /api/save-video?projectId=&filename=` — raw byte streaming (up to 500 MB).
  - `POST /api/save-about-image` / `POST /api/save-about-content` / `POST /api/save-home-content`
  - `POST /api/delete-case-study`
  - `POST /api/git-push` — `git add → commit → push → trigger Netlify hook`. Returns structured `{ step, code, stderr }` on failure.
  - `GET  /api/git-status` — branch, ahead/behind, credential helper, remote reachability.
  - `GET  /api/health` — uptime + memory, used as a liveness probe before Save All.
  - `GET  /api/list-case-studies`
- All file I/O is async (`fs/promises`) so Vite's HMR websocket stays responsive during saves.
- Save All in the editor caps concurrent uploads at **3** and routes `video/*` MIME types to the streaming endpoint rather than base64-in-JSON.

## Dev server troubleshooting

If you see any of these symptoms:

| Symptom | Quickest fix |
|---|---|
| Git Push button stuck on "pushing…" | Click again — the new push fails fast with a visible error. If it times out after 200 s, run `npm run dev:doctor` to check creds. |
| Browser shows "server connection lost" | Check terminal for `[slow]` logs or a crash. Run `npm run dev:doctor`. If port 5173 is held but `/api/health` is unreachable, the process is hung — kill it with `lsof -ti:5173 \| xargs kill -9` and `npm run dev` again. |
| Save All hangs | Pre-check via `/api/health` now runs automatically; failure alerts the user. If it keeps failing, the offending file is usually a large video — confirm it's being sent to `/api/save-video` (video/* mime) in DevTools → Network. |
| HMR reloads constantly | Make sure nothing is writing into `public/case-studies/**`, `public/about/**`, or `public/fonts/**` — these are excluded from the watcher in [vite.config.js](vite.config.js). |
| `git push` fails with auth error | Run `git push` once manually from the terminal to refresh the keychain PAT. `/api/git-push` runs with `GIT_TERMINAL_PROMPT=0` so stale credentials fail fast instead of hanging. |

### `npm run dev:doctor`

Prints a color-coded status report:

```
Dev Doctor — 4/19/2026, 10:20:10 PM
────────────────────────────────────────────────
 OK  npm                  10.9.2
WARN Memory free          0.2 / 8.0 GB
 OK  Dev API /api/health  OK uptime=8s heap=33/73MB rss=95MB
 OK  Remote reachable     yes (creds OK, non-interactive)
 ...
```

Exit code is non-zero if any check is in the FAIL column, so you can wire it into a pre-push hook if you want.

### Known deferred work

- `src/pages/CaseStudy.jsx` is ~6,800 lines. Route-level lazy-loading already keeps it out of the home-page bundle, and its slide-template + docs registries are already extracted (`src/data/caseStudyData.js`, `src/data/slideTemplateDocs.js`). Splitting the remaining editor subtree into sub-components is a non-trivial refactor; the dev-server stability issues that motivated it have been addressed at the root cause (event-loop blocking) instead.

## Credits

Template originally scaffolded from the Vite React template, then heavily customized.
