// lib/server/demoUsers.ts
import { createSupabaseServiceClient } from "./supabaseService";
import { env } from "@/lib/env";

type DemoUser = {
  email: string;
  password: string;
  name: string;
  role: "COMPANY_ADMIN" | "CONTRIBUTOR" | "VIEWER";
};

const DEMO_ORG_NAME = "Demo Company";

// Default values if env vars not provided
const DEFAULT_DEMO_EMAIL = "demo@aiknowledgehub.com";
const DEFAULT_DEMO_PASSWORD = "Demo@2025!Secure";
const DEFAULT_DEMO_NAME = "Demo Admin";

export const getDemoUserConfig = (): DemoUser => ({
  email: env.DEMO_USER_EMAIL || DEFAULT_DEMO_EMAIL,
  password: env.DEMO_USER_PASSWORD || DEFAULT_DEMO_PASSWORD,
  name: env.DEMO_USER_NAME || DEFAULT_DEMO_NAME,
  role: "COMPANY_ADMIN",
});

export const getDemoContributorConfig = (): DemoUser => {
  const demoPassword = env.DEMO_USER_PASSWORD || DEFAULT_DEMO_PASSWORD;
  return {
    email: "demo.contributor@aiknowledgehub.com",
    password: demoPassword,
    name: "Demo Contributor",
    role: "CONTRIBUTOR",
  };
};

export const getDemoViewerConfig = (): DemoUser => {
  const demoPassword = env.DEMO_USER_PASSWORD || DEFAULT_DEMO_PASSWORD;
  return {
    email: "demo.viewer@aiknowledgehub.com",
    password: demoPassword,
    name: "Demo Viewer",
    role: "VIEWER",
  };
};

export const isDemoUser = (email: string | undefined): boolean => {
  if (!email) return false;
  const demoEmails = [
    getDemoUserConfig().email,
    getDemoContributorConfig().email,
    getDemoViewerConfig().email,
  ];
  return demoEmails.includes(email.toLowerCase());
};

export const createDemoUsersIfNeeded = async (): Promise<void> => {
  const service = createSupabaseServiceClient();

  // Get demo user config
  const demoAdmin = getDemoUserConfig();
  const demoContributor = getDemoContributorConfig();
  const demoViewer = getDemoViewerConfig();

  // Check if demo admin already exists
  const { data: existingUsers } = await service.auth.admin.listUsers();
  const demoAdminExists = existingUsers?.users.some((u) => u.email === demoAdmin.email);

  if (demoAdminExists) {
    console.info("[createDemoUsers] Demo users already exist, skipping creation.");
    return;
  }

  console.info("[createDemoUsers] Creating demo organization and users...");

  try {
    // 1. Create demo organization
    const { data: org, error: orgError } = await service
      .from("organizations")
      .insert({ name: DEMO_ORG_NAME })
      .select()
      .single();

    if (orgError || !org) {
      console.error("[createDemoUsers] Failed to create demo organization:", orgError);
      return;
    }

    console.info(`[createDemoUsers] Demo organization created: ${org.id}`);

    // 2. Create demo admin user
    const { data: adminUser, error: adminError } = await service.auth.admin.createUser({
      email: demoAdmin.email,
      password: demoAdmin.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: demoAdmin.name,
        role: demoAdmin.role,
        organization_id: org.id,
        organization_name: org.name,
        is_demo_user: true, // Flag to identify demo users
        plan: {
          id: "smb",
          billingCycle: "monthly",
        },
      },
    });

    if (adminError || !adminUser.user) {
      console.error("[createDemoUsers] Failed to create demo admin:", adminError);
      // Rollback: delete organization
      await service.from("organizations").delete().eq("id", org.id);
      return;
    }

    console.info(`[createDemoUsers] Demo admin created: ${adminUser.user.id}`);

    // 3. Add admin to organization
    const { error: adminMemberError } = await service.from("organization_members").insert({
      organization_id: org.id,
      user_id: adminUser.user.id,
      role: demoAdmin.role,
    });

    if (adminMemberError) {
      console.error("[createDemoUsers] Failed to add admin to organization:", adminMemberError);
    }

    // 4. Create demo contributor
    const { data: contributorUser, error: contributorError } = await service.auth.admin.createUser({
      email: demoContributor.email,
      password: demoContributor.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoContributor.name,
        role: demoContributor.role,
        organization_id: org.id,
        organization_name: org.name,
        is_demo_user: true,
      },
    });

    if (contributorError || !contributorUser.user) {
      console.error("[createDemoUsers] Failed to create demo contributor:", contributorError);
    } else {
      await service.from("organization_members").insert({
        organization_id: org.id,
        user_id: contributorUser.user.id,
        role: demoContributor.role,
      });
      console.info(`[createDemoUsers] Demo contributor created: ${contributorUser.user.id}`);
    }

    // 5. Create demo viewer
    const { data: viewerUser, error: viewerError } = await service.auth.admin.createUser({
      email: demoViewer.email,
      password: demoViewer.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoViewer.name,
        role: demoViewer.role,
        organization_id: org.id,
        organization_name: org.name,
        is_demo_user: true,
      },
    });

    if (viewerError || !viewerUser.user) {
      console.error("[createDemoUsers] Failed to create demo viewer:", viewerError);
    } else {
      await service.from("organization_members").insert({
        organization_id: org.id,
        user_id: viewerUser.user.id,
        role: demoViewer.role,
      });
      console.info(`[createDemoUsers] Demo viewer created: ${viewerUser.user.id}`);
    }

    console.info("[createDemoUsers] Demo users setup complete!");
    console.info(`Demo Admin: ${demoAdmin.email}`);
    console.info(`Demo Contributor: ${demoContributor.email}`);
    console.info(`Demo Viewer: ${demoViewer.email}`);
    console.info(`Password (all): ${demoAdmin.password}`);
  } catch (error) {
    console.error("[createDemoUsers] Unexpected error:", error);
  }
};

