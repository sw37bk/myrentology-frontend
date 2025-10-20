import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: `[name]-[hash]-1760971000.js`,
        chunkFileNames: `[name]-[hash]-1760971000.js`,
        assetFileNames: `[name]-[hash]-1760971000.[ext]`
      }
    }
  },
  server: {
    port: 3000
  }
})
