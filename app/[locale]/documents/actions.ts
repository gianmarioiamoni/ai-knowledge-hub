"use server";

import { revalidatePath } from "next/cache";
import { createRequire } from "module";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createEmbeddingModel, createTextSplitter } from "@/lib/server/langchain";

const uploadSchema = z.object({
  locale: z.string().min(2),
});

type ActionResult = { error?: string; success?: string };

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

  const organizationId = await ensureUserOrganization({ supabase });

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

  try {
    await runIngestion({
      service,
      buffer,
      documentId,
      organizationId,
      fileName: file.name,
      fileType: file.type,
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
    return { error: err instanceof Error ? err.message : "Ingestion failed" };
  }

  revalidatePath(`/${locale.data.locale}/documents`);
  return { success: "Document uploaded and ingested" };
}

type IngestionParams = {
  service: ReturnType<typeof createSupabaseServiceClient>;
  buffer: Buffer;
  documentId: string;
  organizationId: string;
  fileName: string;
  fileType: string;
};

const runIngestion = async ({
  service,
  buffer,
  documentId,
  organizationId,
  fileName,
  fileType,
}: IngestionParams) => {
  const pdfParse = await loadPdfParse();
  const parsed = await pdfParse(buffer);
  const text = parsed.text?.trim() ?? "";
  if (!text) {
    throw new Error("No text extracted from PDF");
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

const loadPdfParse = async (): Promise<(data: Buffer) => Promise<{ text: string }>> => {
  const require = createRequire(import.meta.url);
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("pdf-parse");
    const candidate = (mod as { default?: unknown }).default ?? mod;
    if (typeof candidate === "function") {
      return candidate as (data: Buffer) => Promise<{ text: string }>;
    }
  } catch {
    // ignore and fallback
  }

  const mod = await import("pdf-parse").catch(() => null);
  const candidate = (mod as unknown as { default?: unknown })?.default ?? mod;
  if (typeof candidate === "function") {
    return candidate as (data: Buffer) => Promise<{ text: string }>;
  }

  throw new Error("pdf-parse is not available");
};

