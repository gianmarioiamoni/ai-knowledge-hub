"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { generateSop } from "@/lib/server/sop";

const generateSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(3, "Title is required"),
  scope: z.string().min(5, "Scope is required"),
});

type ActionResult = {
  error?: string;
  success?: string;
};

export const handleGenerateSop = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = generateSchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title"),
    scope: formData.get("scope"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in" };
  }

  const organizationId = await ensureUserOrganization({ supabase });

  try {
    const sop = await generateSop({ title: parsed.data.title, scope: parsed.data.scope });

    const { error: insertError } = await service.from("procedures").insert({
      organization_id: organizationId,
      title: sop.title,
      content: sop.content,
      source_documents: sop.sourceDocuments,
    });

    if (insertError) {
      return { error: insertError.message };
    }

    revalidatePath(`/${parsed.data.locale}/procedures`);
    return { success: "SOP generated successfully" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "SOP generation failed" };
  }
};

