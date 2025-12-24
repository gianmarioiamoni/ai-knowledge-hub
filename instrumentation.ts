import { ensureSuperAdmin } from "@/lib/server/bootstrapSuperAdmin";

export async function register(): Promise<void> {
  // Run only on the Node.js runtime to avoid edge constraints
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await ensureSuperAdmin();
  }
}

