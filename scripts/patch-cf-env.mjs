import { readFileSync, writeFileSync, existsSync } from "node:fs";

const file = "dist/_worker.js/index.js";
if (!existsSync(file)) {
  console.error("[patch-cf-env] dist/_worker.js/index.js not found — skipping");
  process.exit(0);
}

let src = readFileSync(file, "utf8");

const marker = "async fetch(cfReq, env, context) {";
if (!src.includes(marker)) {
  console.error("[patch-cf-env] fetch handler marker not found — skipping");
  process.exit(0);
}

const injection = "globalThis.__env__ = env;";
if (src.includes("globalThis.__env__ = env;")) {
  console.log("[patch-cf-env] already patched — skipping");
  process.exit(0);
}

src = src.replace(
  marker,
  `${marker}\n\t\t${injection}`,
);

writeFileSync(file, src);
console.log("[patch-cf-env] Patched: globalThis.__env__ = env injected into fetch handler");