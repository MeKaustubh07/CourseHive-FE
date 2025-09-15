import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",   // 👈 Allow external devices (like your phone) to connect
    port: 5173,        // 👈 optional, but makes sure it’s consistent
    proxy: {
      "/api": {
        target: "https://coursehive-kmp.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});