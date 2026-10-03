import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { generatePdfMeta } from './scripts/generate-pdf-meta.js'

function autoPdfMetaPlugin() {
  return {
    name: 'auto-pdf-meta',
    async buildStart() {
      try {
        await generatePdfMeta();
      } catch (err) {
        console.warn('PDF metadata generation warning:', err.message);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [autoPdfMetaPlugin(), react()],
  server: {
    port: 3000,
    open: false
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
})


