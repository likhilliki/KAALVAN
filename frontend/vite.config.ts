import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesiumPluginPkg from 'vite-plugin-cesium'

// Safe interop for vite-plugin-cesium across ESM/CJS environments
const cesium = typeof cesiumPluginPkg === 'function' 
  ? cesiumPluginPkg 
  : (cesiumPluginPkg as any).default || cesiumPluginPkg;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), (cesium as any)()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://148.100.98.28:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://148.100.98.28:8000',
        changeOrigin: true,
      }
    }
  }
})
