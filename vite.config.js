import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,    // Listen on all local IP addresses
    port: 5173,    // Use a specific port (optional)
    strictPort: true // Fail if the port is already in use
  },
  base: '/', // Set base path for production build
})