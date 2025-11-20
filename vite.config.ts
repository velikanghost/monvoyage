import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/indexer': {
        target: 'https://indexer.dev.hyperindex.xyz/7a6859e/v1/graphql',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/indexer/, ''),
        secure: false,
      },
    },
  },
})
