import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "node:module";

const require = createRequire(process.cwd() + "/vite.config.ts");
const { nitro } = require("nitro/vite");

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro({ defaultPreset: "vercel" }),
    tailwindcss(),
    viteReact(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    entry: "server",
  },
});
