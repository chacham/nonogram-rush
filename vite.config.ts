import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

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
  plugins: [
    {
      name: 'serve-tools',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/stage-builder') {
            const html = readFileSync(resolve(__dirname, 'tools/stage-builder.html'), 'utf-8')
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
            return
          }
          next()
        })
      },
    },
  ],
})
