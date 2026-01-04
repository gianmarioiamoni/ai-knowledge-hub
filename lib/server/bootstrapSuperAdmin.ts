import { env } from "@/lib/env";
import { logError, logInfo } from "@/lib/server/logger";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createDemoUsersIfNeeded } from "@/lib/server/demoUsers";

const ensureSuperAdmin = async (): Promise<void> => {
  const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME } = env;
  const hasCreds = Boolean(SUPERADMIN_EMAIL && SUPERADMIN_PASSWORD && SUPERADMIN_NAME);

  logInfo("ensureSuperAdmin invoked", {
    hasCreds,
  });

  if (!hasCreds) {
    logInfo("ensureSuperAdmin skipped: missing env trio", {});
    return;
  }

  const supabase = createSupabaseServiceClient();

  const { error } = await supabase.auth.admin.createUser({
    email: SUPERADMIN_EMAIL,
    password: SUPERADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: SUPERADMIN_NAME,
      role: "SUPER_ADMIN",
    },
  });

  if (error) {
    // Ignore duplicate user errors, log others
    if (error.message?.toLowerCase().includes("already registered") || error.status === 422) {
      logInfo("Super admin already exists", { email: SUPERADMIN_EMAIL });
    } else {
      logError("Failed to create super admin", { error: error.message, status: error.status });
      throw error;
    }
  } else {
    logInfo("Super admin ensured (created)", { email: SUPERADMIN_EMAIL });
  }

  // Create demo users after super admin
  try {
    await createDemoUsersIfNeeded();
  } catch (error) {
    logError("Failed to create demo users", { error });
    // Don't throw - demo users are optional
  }
};

export { ensureSuperAdmin };

