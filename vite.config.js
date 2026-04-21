import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { saveCaseStudyPlugin } from './vite-plugin-save-case-study.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveCaseStudyPlugin()],
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
