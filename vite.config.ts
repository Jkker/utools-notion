import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  root: "frontend",
  build: {
    outDir: "../dist",
  },
  publicDir: "../public",
  base: "./",
});
