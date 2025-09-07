import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react-virtuoso'
    ],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://share.net.ru",
        changeOrigin: true,
        // Keep the /api prefix so requests hit http://sharebeta.ru/api/...
      },
    },
  },
});
