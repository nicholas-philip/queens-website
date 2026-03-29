import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Force dependency optimization on next restart
  optimizeDeps: {
    include: ['@tanstack/react-query', 'axios'],
  },
})
