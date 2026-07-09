import { createFileRoute } from "@tanstack/react-router";
import { debugEnv } from "@/lib/debug-env";

export const Route = createFileRoute("/debug-env")({
  component: DebugEnvPage,
  loader: async () => await debugEnv(),
});

function DebugEnvPage() {
  const data = Route.useLoaderData();
  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-lg font-bold mb-4">Environment Debug</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}