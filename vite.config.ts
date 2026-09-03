import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];
const buildOutDir = process.env.ALSAT_VITE_OUT_DIR
  ? path.resolve(import.meta.dirname, process.env.ALSAT_VITE_OUT_DIR)
  : path.resolve(import.meta.dirname, "dist/public");
const emptyOutDir = process.env.ALSAT_EMPTY_OUT_DIR === "false" ? false : true;
const publicDir =
  process.env.ALSAT_DISABLE_PUBLIC_DIR === "true"
    ? false
    : path.resolve(import.meta.dirname, "client", "public");

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir,
  build: {
    outDir: buildOutDir,
    emptyOutDir,
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
