"use server";

import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { seedDemoData, deleteDemoData, getDemoDataStatus } from "@/seed/demoSeed";
import type { SeedResult, ResetResult, DemoDataStatus } from "@/seed/types";

/**
 * Seed demo data (Super Admin only)
 */
export async function seedDemoDataAction(locale: string): Promise<SeedResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  if (role !== "SUPER_ADMIN") {
    return {
      success: false,
      documentsCreated: 0,
      chunksCreated: 0,
      conversationsCreated: 0,
      messagesCreated: 0,
      proceduresCreated: 0,
      error: "Unauthorized: Super Admin access required",
    };
  }

  return await seedDemoData();
}

/**
 * Reset demo data (Delete + Re-seed) (Super Admin only)
 */
export async function resetDemoDataAction(locale: string): Promise<ResetResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  if (role !== "SUPER_ADMIN") {
    return {
      success: false,
      deleted: {
        documents: 0,
        chunks: 0,
        conversations: 0,
        messages: 0,
        procedures: 0,
      },
      recreated: {
        success: false,
        documentsCreated: 0,
        chunksCreated: 0,
        conversationsCreated: 0,
        messagesCreated: 0,
        proceduresCreated: 0,
        error: "Unauthorized",
      },
      error: "Unauthorized: Super Admin access required",
    };
  }

  // Delete existing data
  const deleteResult = await deleteDemoData();
  
  if (!deleteResult.success) {
    return {
      success: false,
      deleted: deleteResult.deleted,
      recreated: {
        success: false,
        documentsCreated: 0,
        chunksCreated: 0,
        conversationsCreated: 0,
        messagesCreated: 0,
        proceduresCreated: 0,
      },
      error: deleteResult.error,
    };
  }

  // Re-seed
  const seedResult = await seedDemoData();

  return {
    success: seedResult.success,
    deleted: deleteResult.deleted,
    recreated: seedResult,
  };
}

/**
 * Get demo data status (Super Admin only)
 */
export async function getDemoDataStatusAction(locale: string): Promise<DemoDataStatus> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  if (role !== "SUPER_ADMIN") {
    return {
      hasData: false,
      documentCount: 0,
      conversationCount: 0,
      procedureCount: 0,
      chunkCount: 0,
      messageCount: 0,
    };
  }

  return await getDemoDataStatus();
}

