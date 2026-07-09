import { createServerFn } from "@tanstack/react-start";

function getEnvValue(key: string): string | undefined {
  const cfEnv = (globalThis as Record<string, Record<string, string> | undefined>).__env__;
  const cfVal = cfEnv?.[key];
  const procVal = process.env[key];
  return cfVal ?? procVal;
}

export const debugEnv = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string>> => {
    const keys = [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "ADMIN_TOKEN",
      "R2_ACCOUNT_ID",
      "R2_BUCKET_NAME",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_PUBLIC_DOMAIN",
      "NODE_ENV",
    ];
    const result: Record<string, string> = {};
    for (const key of keys) {
      const val = getEnvValue(key);
      if (val) {
        result[key] = val.length > 10 ? val.slice(0, 4) + "..." + val.slice(-4) : val;
      } else {
        result[key] = "(not set)";
      }
    }
    const cfEnv = (globalThis as Record<string, Record<string, string> | undefined>).__env__;
    result["__has_cf_env__"] = cfEnv ? "yes" : "no";
    result["__cf_env_keys__"] = cfEnv ? Object.keys(cfEnv).join(", ") : "(none)";
    return result;
  },
);