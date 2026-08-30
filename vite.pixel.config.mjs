import path from 'node:path'
import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { iframeManifestPlugin } from './vite.shared.mjs'

/* ═══════════════════════════════════════════════════════════════════════
   PIXEL THEME — dev server config
   ═══════════════════════════════════════════════════════════════════════

   A SEPARATE config file. `vite.config.js` is untouched — this is additive,
   like everything else in src/themes/pixel/. Run it with:

       npx vite --config vite.pixel.config.mjs

   It serves pixel.html at "/" so the pixel theme gets a clean root URL
   instead of /pixel.html. The default site is unaffected; run it the normal
   way (`npm run dev`) whenever you want it back.

   Only one of the two can hold :5173 at a time — they both use strictPort,
   so the second one to start fails loudly rather than silently picking
   another port.
   ═══════════════════════════════════════════════════════════════════════ */

/** Serve pixel.html at "/" without moving or renaming the file. */
const servePixelAtRoot = () => ({
  name: 'pixel-root',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = (req.url || '').split('?')[0]
      // Only "/" is rewritten. /index.html deliberately still serves the DEFAULT
      // site, so the two systems can be put side by side in one server (see the
      // theme's /#/compare page) without running two dev servers on one port.
      if (url === '/') req.url = '/pixel.html'
      next()
    })
  },
})

export default defineConfig({
  // Its own cache dir, so the two dev configs never invalidate each other's
  // pre-bundled deps and force a re-optimize on every switch.
  cacheDir: path.join(os.homedir(), 'Library', 'Caches', 'portfolio-v3-vite-pixel'),
  /* iframeManifestPlugin is the DEFAULT site's, not the theme's — it provides
     the `virtual:iframe-manifest` module that src/iframes.js imports. It is
     needed here because /index.html stays reachable so the two systems can be
     compared side by side (see the theme's /#/compare page). Without it the
     default app fails to resolve that import and only the pixel theme loads. */
  plugins: [react(), iframeManifestPlugin(), servePixelAtRoot()],
  optimizeDeps: {
    // Pin the scanner to pixel.html. Without this, Vite globs EVERY *.html in
    // the repo (public/iframes/**, public/case-studies/**, docs/*.html) and can
    // wedge on that tree — the same trap documented in vite.config.js.
    entries: ['pixel.html', 'index.html'],
    noDiscovery: true,
    /* The theme needs only the first four. The rest are the DEFAULT site's, and
       they have to be listed because noDiscovery skips the crawl — without them
       /index.html 504s on its first import. */
    include: [
      'react', 'react-dom', 'react-dom/client', 'react-router-dom',
      'gsap', 'gsap/ScrollTrigger',
      'framer-motion',
      'dexie',
      'html2canvas',
      'jspdf',
      'react-zoom-pan-pinch',
      'dompurify',
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: {
      ignored: [
        '**/public/**',
        '**/dist/**',
        '**/.git/**',
        '**/node_modules/**',
        // The pixel theme reads src/data/* but nothing else from the default
        // tree; no need to watch the 9k-line case-study surface.
        '**/src/pages/CaseStudy.*',
      ],
    },
  },
})
