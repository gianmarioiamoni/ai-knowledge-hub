import { ensureSuperAdmin } from "@/lib/server/bootstrapSuperAdmin";
import { logInfo } from "@/lib/server/logger";

export async function register(): Promise<void> {
  // Run only on the Node.js runtime to avoid edge constraints
  const runtime = process.env.NEXT_RUNTIME ?? "unknown";
  logInfo("instrumentation.register invoked", { runtime });
  if (runtime === "nodejs") {
    await ensureSuperAdmin();
  } else {
    logInfo("ensureSuperAdmin skipped: non-node runtime", { runtime });
  }
}

