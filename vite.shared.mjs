import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** Keep Vite's disk cache off cloud-synced project folders (reduces ETIMEDOUT on macOS). */
export function portfolioViteCacheDir() {
  if (process.env.PORTFOLIO_VITE_CACHE_DIR)
    return process.env.PORTFOLIO_VITE_CACHE_DIR
  const home = os.homedir()
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Caches', 'portfolio-v3-vite')
  }
  if (process.platform === 'win32') {
    const base = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local')
    return path.join(base, 'portfolio-v3-vite', 'cache')
  }
  return path.join(home, '.cache', 'portfolio-v3-vite')
}

/** Shared server / preview blocks for `vite.config.js` and `vite.config.no-api.mjs`. */
export function portfolioServerAndPreviewDefaults() {
  return {
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      hmr: {
        protocol: 'ws',
        port: 5173,
        overlay: true,
      },
      watch: {
        ignored: [
          '**/public/case-studies/**',
          '**/public/about/**',
          '**/public/fonts/**',
          '**/dist/**',
          '**/.git/**',
          '**/node_modules/**',
        ],
        usePolling: process.env.PORTFOLIO_VITE_POLL === '1',
      },
      fs: {
        strict: true,
      },
    },
    preview: {
      port: 5173,
      strictPort: true,
    },
  }
}

/** virtual:iframe-manifest — list of `/public/iframes/*.html` for CaseStudy iframe dropdown. */
export function iframeManifestPlugin() {
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
    resolveId(id) {
      if (id === VIRT) return RESOLVED
    },
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
