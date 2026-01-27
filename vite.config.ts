import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target:
          process.env.VITE_API_URL || "https://bookmate-n9wh.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
