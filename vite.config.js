import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "source-index.html"),
      },
    },
  },
  plugins: [react()],
});
