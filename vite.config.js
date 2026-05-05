import { defineConfig, loadEnv } from "vite";
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useNetlifyDevProxy = env.VITE_USE_NETLIFY_DEV_PROXY === "true";
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Listen on all local IP addresses
      port: 5173, // Use a specific port (optional)
      strictPort: true, // Fail if the port is already in use
      proxy: useNetlifyDevProxy
        ? {
            "/.netlify/functions": { target: "http://127.0.0.1:8888", changeOrigin: true },
          }
        : undefined,
    },
    base: "/", // Set base path for production build
  }
})
