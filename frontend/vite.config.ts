import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// builds into ../app so GitHub Pages serves it at /vibecodedflopware/app/
export default defineConfig({
  plugins: [preact()],
  base: "/vibecodedflopware/app/",
  build: { outDir: "../app", emptyOutDir: true },
  // empty inline config stops vite from picking up stray postcss configs
  // in parent directories (there is one in the home dir)
  css: { postcss: {} },
});
