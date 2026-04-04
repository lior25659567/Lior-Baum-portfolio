import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { saveCaseStudyPlugin } from './vite-plugin-save-case-study.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveCaseStudyPlugin()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
