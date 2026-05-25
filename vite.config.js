import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useNetlifyDevProxy = env.VITE_USE_NETLIFY_DEV_PROXY === "true";

  const oauthPopupHeaders = {
    // Needed for OAuth popups (Google sign-in) to be able to call window.close/window.closed.
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      headers: oauthPopupHeaders,
      proxy: useNetlifyDevProxy
        ? {
            "/.netlify/functions": {
              target: "http://127.0.0.1:8888",
              changeOrigin: true,
            },
          }
        : undefined,
    },
    preview: {
      headers: oauthPopupHeaders,
    },
    base: "/",
  };
});
