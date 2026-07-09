import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

/**
 * Bridges Cloudflare env bindings (set by Nitro on request.runtime.cloudflare.env)
 * into globalThis.__env__ so server functions can read them via the env() helper.
 */
const envBridgeMiddleware = createMiddleware().server(async ({ request, next }) => {
  const runtime = (request as Request & { runtime?: { cloudflare?: { env?: Record<string, string> } } }).runtime;
  const cfEnv = runtime?.cloudflare?.env;
  if (cfEnv && typeof cfEnv === "object") {
    (globalThis as Record<string, unknown>).__env__ = cfEnv;
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [envBridgeMiddleware, errorMiddleware],
}));
