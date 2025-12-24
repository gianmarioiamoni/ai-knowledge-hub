import { env } from "@/lib/env";
import { logError, logInfo } from "@/lib/server/logger";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";

const ensureSuperAdmin = async (): Promise<void> => {
  const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME } = env;

  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD || !SUPERADMIN_NAME) {
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
      return;
    }
    logError("Failed to create super admin", { error: error.message });
    throw error;
  }

  logInfo("Super admin ensured", { email: SUPERADMIN_EMAIL });
};

export { ensureSuperAdmin };

