import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
    ]
  },
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
})
