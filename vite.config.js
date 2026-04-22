import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { saveCaseStudyPlugin } from './vite-plugin-save-case-study.js'

// Exposes `virtual:iframe-manifest` with an auto-generated list of every
// .html file in /public/iframes/. The CaseStudy iframe-embed dropdown reads
// from this, so adding a file to that folder makes it appear with no code edit.
// In dev: fs.watch invalidates the module + triggers a full reload on add/remove.
// In build: the list is baked into the bundle at build time.
function iframeManifestPlugin() {
  const VIRT = 'virtual:iframe-manifest'
  const RESOLVED = '\0' + VIRT
  const dir = path.resolve(process.cwd(), 'public/iframes')

  const toLabel = (filename) =>
    filename.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ')

  const readManifest = () => {
    try {
      return fs.readdirSync(dir)
        .filter((f) => /\.html?$/i.test(f) && !f.startsWith('.'))
        .sort((a, b) => a.localeCompare(b))
        .map((f) => ({ path: `iframes/${f}`, label: toLabel(f) }))
    } catch {
      return []
    }
  }

  return {
    name: 'iframe-manifest',
    resolveId(id) { if (id === VIRT) return RESOLVED },
    load(id) {
      if (id !== RESOLVED) return
      return `export const IFRAME_FILES = ${JSON.stringify(readManifest())};`
    },
    configureServer(server) {
      let watcher
      try {
        watcher = fs.watch(dir, { persistent: false }, () => {
          const mod = server.moduleGraph.getModuleById(RESOLVED)
          if (mod) server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        })
      } catch {}
      server.httpServer?.once('close', () => watcher?.close())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveCaseStudyPlugin(), iframeManifestPlugin()],
  server: {
    port: 5173,
    strictPort: true,
    // Listen on LAN so you can open http://<your-mac-ip>:5173 on a phone (same Wi‑Fi).
    host: true,
    // Explicit HMR — omit `host` so the client uses the page hostname (localhost *or* LAN IP).
    // Pinning localhost breaks phone testing (WS would target the phone itself).
    hmr: {
      protocol: 'ws',
      port: 5173,
      overlay: true,
    },
    watch: {
      // Large or auto-generated trees — excluded so Save All / git writes
      // don't kick off a rebuild in the middle of the save.
      ignored: [
        '**/public/case-studies/**',
        '**/public/about/**',
        '**/public/fonts/**',
        '**/dist/**',
        '**/.git/**',
        '**/node_modules/**',
      ],
      usePolling: false,
    },
    fs: {
      // Don't let Vite serve files from the OS home dir even if a route asks
      strict: true,
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
