import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// "styles/..." can be used inside every .scss file thanks to loadPaths,
// and every module gets the variables + mixins automatically.
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL("./src", import.meta.url))],
        additionalData: `@use "styles/variables" as *; @use "styles/mixins" as *;`,
      },
    },
  },
});
