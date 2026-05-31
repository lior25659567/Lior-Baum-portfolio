import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {
  portfolioServerAndPreviewDefaults,
  portfolioViteCacheDir,
  iframeManifestPlugin,
} from './vite.shared.mjs'

// https://vite.dev/config/
export default defineConfig(async () => {
  const { saveCaseStudyPlugin } = await import('./vite-plugin-save-case-study.js')
  const sharedDefaults = portfolioServerAndPreviewDefaults()
  return {
    cacheDir: portfolioViteCacheDir(),
    plugins: [react(), saveCaseStudyPlugin(), iframeManifestPlugin()],
    // Force pre-bundle these packages at server startup so the first
    // browser load is instant instead of waiting 30-60s.
    optimizeDeps: {
      // Pin the dep-scanner to the real SPA entry. Without this, Vite's scanner
      // globs EVERY *.html in the repo (my-app/, public/iframes/**,
      // public/case-studies/**, docs/*.html) and wedges on that tree — which
      // hangs every dev-server request indefinitely. Crawl only from index.html.
      entries: ['index.html'],
      // Don't hold browser requests until dep optimization finishes.
      // Heavy deps (jspdf, html2canvas) can take 20-30s to bundle;
      // with holdUntilCrawlEnd=true that blocks the ENTIRE first page load.
      holdUntilCrawlEnd: false,
      include: [
        'react', 'react-dom', 'react-dom/client',
        'react-router-dom',
        'gsap', 'gsap/ScrollTrigger',
        'framer-motion',
        'dexie',
        'html2canvas',
        'jspdf',
        'react-zoom-pan-pinch',
        'dompurify',
      ],
    },
    ...sharedDefaults,
    server: {
      ...sharedDefaults.server,
      warmup: {
        clientFiles: [
          './src/main.jsx',
          './src/App.jsx',
          './src/pages/Home.jsx',
          './src/components/Hero.jsx',
          './src/components/Projects.jsx',
          './src/components/Navigation.jsx',
          './src/context/EditContext.jsx',
          './src/index.css',
        ],
      },
    },
  }
})
