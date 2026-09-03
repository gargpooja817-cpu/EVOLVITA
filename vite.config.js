import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// NOTE: base set to './' for SAP BTP HTML5 Application Repository hosting
// This ensures all asset paths are relative, which is required for BTP's CDN delivery.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) requires manualChunks as a function, not an object
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor'
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts'
          }
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }
        }
      }
    }
  }
})
