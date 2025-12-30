"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { generateSop } from "@/lib/server/sop";
import { rateLimit } from "@/lib/server/rateLimit";
import { embedQuery, searchSimilarChunks } from "@/lib/server/rag";
import { canGenerateSop } from "@/lib/server/roles";

const messages = {
  en: {
    unauthorized: "You must be logged in",
    rateLimit: "Too many SOP requests. Please try again later.",
    noContext: "No relevant content found in your documents. Add documents or enable free mode.",
  },
  it: {
    unauthorized: "Devi essere autenticato",
    rateLimit: "Troppe richieste SOP. Riprova più tardi.",
    noContext: "Nessun contenuto rilevante trovato nei documenti. Aggiungi documenti o abilita la modalità libera.",
  },
} as const;

const generateSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(3, "Title is required").max(120, "Title too long"),
  scope: z.string().min(5, "Scope is required").max(2000, "Scope too long"),
  allowFree: z.enum(["on", "off"]).default("off"),
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
    allowFree: formData.get("allowFree") ? "on" : "off",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    const locale = parsed.data.locale as keyof typeof messages;
    return { error: messages[locale]?.unauthorized ?? "You must be logged in" };
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canGenerateSop(role as any)) {
    const locale = parsed.data.locale as keyof typeof messages;
    return { error: messages[locale]?.unauthorized ?? "You must be logged in" };
  }

  const locale = parsed.data.locale as keyof typeof messages;
  const rl = rateLimit(`sop-gen:${userData.user.id}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!rl.allowed) {
    return { error: messages[locale]?.rateLimit ?? "Rate limit exceeded. Try later." };
  }

  const organizationId = await ensureUserOrganization({ supabase });

  const allowFree = parsed.data.allowFree === "on";

  try {
    const chunks = await fetchSopContext({ organizationId, query: `${parsed.data.title}\n${parsed.data.scope}` });

    if (!allowFree && chunks.length === 0) {
      return { error: messages[locale]?.noContext ?? "No context found in documents" };
    }

    const contextTexts = chunks.map((c) => c.chunk_text);

    const sop = await generateSop({
      title: parsed.data.title,
      scope: parsed.data.scope,
      context: contextTexts.length > 0 ? contextTexts : undefined,
      allowFree,
    });

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

const fetchSopContext = async ({
  organizationId,
  query,
}: {
  organizationId: string;
  query: string;
}) => {
  const embedding = await embedQuery(query);
  return searchSimilarChunks(organizationId, embedding, 6);
};

const deleteSchema = z.object({
  locale: z.string().min(2),
  id: z.string().uuid(),
});

export const handleDeleteSop = async (formData: FormData): Promise<ActionResult> => {
  const parsed = deleteSchema.safeParse({
    locale: formData.get("locale"),
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in" };
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canGenerateSop(role as any)) {
    return { error: "Permission denied" };
  }

  const organizationId = await ensureUserOrganization({ supabase });

  const { error: delError } = await service
    .from("procedures")
    .delete()
    .eq("id", parsed.data.id)
    .eq("organization_id", organizationId);

  if (delError) {
    return { error: delError.message };
  }

  revalidatePath(`/${parsed.data.locale}/procedures`);
  return { success: "Deleted" };
};

const renameSchema = z.object({
  locale: z.string().min(2),
  id: z.string().uuid(),
  title: z.string().min(3, "Title is required"),
});

export const handleRenameSop = async (formData: FormData): Promise<ActionResult> => {
  const parsed = renameSchema.safeParse({
    locale: formData.get("locale"),
    id: formData.get("id"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in" };
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canGenerateSop(role as any)) {
    return { error: "Permission denied" };
  }

  const organizationId = await ensureUserOrganization({ supabase });

  const { error: updateError } = await service
    .from("procedures")
    .update({ title: parsed.data.title })
    .eq("id", parsed.data.id)
    .eq("organization_id", organizationId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/${parsed.data.locale}/procedures`);
  return { success: "Updated" };
};

