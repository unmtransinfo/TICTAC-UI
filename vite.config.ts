import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/tictac/',
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      overlay: false,
    },
    // dev tape fix
    proxy: {
      "/api": {
        // Proxy target should be the BASE URL only.
        // The app appends "/api/v1" to requests, so if we include it here,
        // it results in a double path (e.g., .../tictac/api/v1/api/v1).
        target: "http://localhost:8000/tictac",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
