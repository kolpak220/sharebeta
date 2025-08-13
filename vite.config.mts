import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://sharebeta.ru",
        changeOrigin: true,
        // Keep the /api prefix so requests hit http://sharebeta.ru/api/...
      },
    },
  },
});
