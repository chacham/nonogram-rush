import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/nonogram-rush/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
})
