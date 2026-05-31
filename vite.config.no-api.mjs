import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {
  portfolioServerAndPreviewDefaults,
  portfolioViteCacheDir,
  iframeManifestPlugin,
} from './vite.shared.mjs'

// Same app, but no dev save-to-disk / Netlify hook plugin (lighter startup).
export default defineConfig({
  cacheDir: portfolioViteCacheDir(),
  plugins: [react(), iframeManifestPlugin()],
  ...portfolioServerAndPreviewDefaults(),
})
