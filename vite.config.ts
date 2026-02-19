import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/_matrix": {
        target: "https://matrix.aminoimmigration.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
