import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro({ defaultPreset: "cloudflare-module" }),
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
