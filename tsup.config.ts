import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { quay: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
  },
  {
    entry: { "quay.iife": "src/iife.ts" },
    format: ["iife"],
    globalName: "Quay",
    sourcemap: true,
    outDir: "dist",
    minify: true,
    outExtension() {
      return { js: ".js" };
    },
  },
]);
