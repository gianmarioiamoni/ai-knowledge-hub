"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { ensureUserOrganization, requireActiveOrganizationId } from "@/lib/server/organizations";
import { createEmbeddingModel, createTextSplitter } from "@/lib/server/langchain";
import { canUploadDocs } from "@/lib/server/roles";

const uploadSchema = z.object({
  locale: z.string().min(2),
});

type ActionResult = { error?: string; success?: string };
const deleteSchema = z.object({
  locale: z.string().min(2),
  id: z.string().min(1),
});

export async function handleUploadWithState(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  return uploadDocument(formData);
}

export async function uploadDocument(formData: FormData): Promise<ActionResult> {
  const locale = uploadSchema.safeParse({ locale: formData.get("locale") });
  if (!locale.success) {
    return { error: "Invalid locale" };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { error: "File is required" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large. Max 10MB." };
  }

  if (!file.type.includes("pdf")) {
    return { error: "Only PDF files are supported right now" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in" };
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canUploadDocs(role as any)) {
    return { error: "Permission denied" };
  }

  const organizationId = await requireActiveOrganizationId({ supabase, locale: parsed.data.locale });

  const filePath = `${organizationId}/${crypto.randomUUID()}-${file.name}`;

  const { error: storageError } = await service.storage
    .from("documents")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    return { error: storageError.message };
  }

  const { data: insertDoc, error: insertError } = await service
    .from("documents")
    .insert({
      organization_id: organizationId,
      file_path: filePath,
      file_type: file.type,
      status: "processing",
      metadata: { originalName: file.name, size: file.size },
    })
    .select("id")
    .single();

  if (insertError || !insertDoc?.id) {
    return { error: insertError?.message ?? "Unable to save document" };
  }

  const documentId = insertDoc.id as string;

  const parsePdf = await loadPdfParse();
  if (!parsePdf) {
    await service.from("documents").update({ status: "failed" }).eq("id", documentId);
    return { error: "PDF parsing module not available. Please contact support." };
  }

  try {
    await runIngestion({
      service,
      buffer,
      documentId,
      organizationId,
      fileName: file.name,
      fileType: file.type,
      parsePdf,
      locale: locale.data.locale,
    });
    await service
      .from("documents")
      .update({ status: "ingested", updated_at: new Date().toISOString() })
      .eq("id", documentId);
  } catch (err) {
    await service
      .from("documents")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", documentId);
    return { error: getFriendlyError(err, locale.data.locale) };
  }

  revalidatePath(`/${locale.data.locale}/documents`);
  return { success: "Document uploaded and ingested" };
}

export const handleDeleteDocument = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  return deleteDocument(formData);
};

export const deleteDocument = async (formData: FormData): Promise<ActionResult> => {
  const parsed = deleteSchema.safeParse({
    locale: formData.get("locale"),
    id: formData.get("id"),
  });
  if (!parsed.success) {
    return { error: "Invalid request" };
  }

  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "You must be logged in" };
  }

  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canUploadDocs(role as any)) {
    return { error: "Permission denied" };
  }

  const organizationId = await requireActiveOrganizationId({ supabase, locale: parsed.data.locale });
  const { data: doc, error: fetchErr } = await service
    .from("documents")
    .select("id,file_path")
    .eq("id", parsed.data.id)
    .eq("organization_id", organizationId)
    .single();

  if (fetchErr || !doc) {
    return { error: "Document not found" };
  }

  await service.from("document_chunks").delete().eq("document_id", parsed.data.id);
  await service.storage.from("documents").remove([doc.file_path]);
  await service.from("documents").delete().eq("id", parsed.data.id);

  revalidatePath(`/${parsed.data.locale}/documents`);
  return { success: "deleted" };
};

type IngestionParams = {
  service: ReturnType<typeof createSupabaseServiceClient>;
  buffer: Buffer;
  documentId: string;
  organizationId: string;
  fileName: string;
  fileType: string;
  parsePdf: (data: Buffer) => Promise<{ text: string }>;
  locale: string;
};

const runIngestion = async ({
  service,
  buffer,
  documentId,
  organizationId,
  fileName,
  fileType,
  parsePdf,
  locale,
}: IngestionParams) => {
  const parsed = await parsePdf(buffer);
  const text = parsed.text?.trim() ?? "";
  if (!text) {
    throw new Error(getFriendlyError("NO_TEXT", locale));
  }

  const splitter = createTextSplitter();
  const chunks = await splitter.splitText(text);
  if (chunks.length === 0) {
    throw new Error("No chunks produced from document");
  }

  const embedder = createEmbeddingModel();
  const embeddings = await embedder.embedDocuments(chunks);

  const rows = chunks.map((chunk, idx) => ({
    organization_id: organizationId,
    document_id: documentId,
    chunk_text: chunk,
    chunk_metadata: {
      originalName: fileName,
      fileType,
      chunk_index: idx,
    },
    embedding: embeddings[idx],
  }));

  const { error: insertChunksError } = await service.from("document_chunks").insert(rows);
  if (insertChunksError) {
    throw new Error(insertChunksError.message);
  }
};

const loadPdfParse = async (): Promise<((data: Buffer) => Promise<{ text: string }>) | null> => {
  // Prefer the direct lib entry (avoids the debug block in index.js)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("pdf-parse/lib/pdf-parse.js") as unknown;
    if (typeof mod === "function") {
      return mod as (data: Buffer) => Promise<{ text: string }>;
    }
    if (typeof (mod as { default?: unknown }).default === "function") {
      return (mod as { default: (data: Buffer) => Promise<{ text: string }> }).default;
    }
  } catch (error) {
    console.warn("Require of pdf-parse/lib/pdf-parse.js failed, trying package root.", error);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("pdf-parse") as unknown;
    if (typeof mod === "function") {
      return mod as (data: Buffer) => Promise<{ text: string }>;
    }
    if (typeof (mod as { default?: unknown }).default === "function") {
      return (mod as { default: (data: Buffer) => Promise<{ text: string }> }).default;
    }
  } catch (error) {
    console.warn("Require of pdf-parse failed.", error);
  }

  return null;
};

const friendlyErrors: Record<string, { en: string; it: string }> = {
  INVALID_PDF: {
    en: "The PDF is invalid or protected. Please upload an unprotected PDF.",
    it: "Il PDF non è valido o è protetto. Carica un PDF non protetto.",
  },
  NO_TEXT: {
    en: "No text could be extracted from this PDF. Please try another file.",
    it: "Non è stato possibile estrarre testo da questo PDF. Prova un altro file.",
  },
  INGESTION_FAILED: {
    en: "Ingestion failed. Please try again or use a different PDF.",
    it: "Ingestion fallita. Riprova o usa un altro PDF.",
  },
};

const getFriendlyError = (error: unknown, locale: string): string => {
  const key = normalizeErrorKey(error);
  const lang = locale.startsWith("it") ? "it" : "en";
  return friendlyErrors[key]?.[lang] ?? friendlyErrors.INGESTION_FAILED[lang];
};

const normalizeErrorKey = (error: unknown): keyof typeof friendlyErrors => {
  if (typeof error === "string") {
    if (error === "NO_TEXT") return "NO_TEXT";
    return "INGESTION_FAILED";
  }

  if (error instanceof Error) {
    const msg = error.message || "";
    if (msg.toLowerCase().includes("invalid pdf")) return "INVALID_PDF";
    if (msg.toLowerCase().includes("password")) return "INVALID_PDF";
    if (msg.toLowerCase().includes("no text extracted")) return "NO_TEXT";
  }

  return "INGESTION_FAILED";
};

