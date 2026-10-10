import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from "bootstrap-vue-next/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    // Imports each <b-...> component a template uses (bootstrap-vue-next
    // doesn't register components globally). Only used ones get bundled.
    Components({ resolvers: [BootstrapVueNextResolver()], dts: false }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    // Existing imports leave off the .vue extension (Vue CLI resolved it).
    extensions: [".mjs", ".js", ".json", ".vue"],
  },
  // Env files live in the repo root (.env.dev etc.). Keep the VUE_APP_ names
  // so they don't have to change; only variables with these prefixes are
  // exposed to the browser bundle.
  envDir: "..",
  envPrefix: ["VITE_", "VUE_APP_"],
  build: {
    outDir: "dist",
  },
});
