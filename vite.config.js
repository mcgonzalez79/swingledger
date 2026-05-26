import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : '/swingledger/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',
      port: 8080,  
      strictPort: true,
      allowedHosts: ['.app.github.dev'] // Keeps Codespaces happy
    }
  }
})