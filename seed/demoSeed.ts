// seed/demoSeed.ts
import { readFileSync } from "fs";
import { join } from "path";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import type { SeedResult, SeedDocument, DemoDataStatus } from "./types";
import { SAMPLE_CONVERSATIONS } from "./sampleConversations";
import { SAMPLE_PROCEDURES } from "./sampleProcedures";
import {
  getDemoOrgId,
  getDemoUserIds,
  chunkText,
  generateMockEmbedding,
  formatEmbeddingForPg,
  sleep,
} from "./demoSeedHelpers";

/**
 * Load sample document texts from files
 */
function loadSampleDocuments(): SeedDocument[] {
  const documentsPath = join(process.cwd(), "seed", "sampleDocuments");

  return [
    {
      title: "IT Security Policy 2025",
      fileName: "security-policy.pdf",
      fileType: "application/pdf",
      textContent: readFileSync(join(documentsPath, "security-policy.txt"), "utf-8"),
      metadata: {
        pages: 12,
        author: "IT Security Team",
        category: "Policy",
        version: "3.2",
      },
    },
    {
      title: "VPN Setup Guide - Remote Access",
      fileName: "vpn-guide.pdf",
      fileType: "application/pdf",
      textContent: readFileSync(join(documentsPath, "vpn-guide.txt"), "utf-8"),
      metadata: {
        pages: 8,
        version: "2.1",
        category: "Tutorial",
      },
    },
    {
      title: "New Employee IT Onboarding",
      fileName: "onboarding-checklist.pdf",
      fileType: "application/pdf",
      textContent: readFileSync(join(documentsPath, "onboarding-checklist.txt"), "utf-8"),
      metadata: {
        pages: 5,
        department: "IT & HR",
        category: "Process",
        version: "1.5",
      },
    },
  ];
}

/**
 * Seed documents with chunks and embeddings
 */
async function seedDocuments(orgId: string): Promise<{ docsCreated: number; chunksCreated: number }> {
  const supabase = createSupabaseServiceClient();
  const sampleDocs = loadSampleDocuments();
  
  let docsCreated = 0;
  let chunksCreated = 0;

  for (const doc of sampleDocs) {
    // Create document record
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        organization_id: orgId,
        file_path: `demo/${doc.fileName}`,
        file_type: doc.fileType,
        title: doc.title,
        status: "ingested",
        metadata: doc.metadata,
      })
      .select()
      .single();

    if (docError || !document) {
      console.error(`[seedDocuments] Failed to create document ${doc.title}:`, docError);
      continue;
    }

    docsCreated++;

    // Create chunks
    const textChunks = chunkText(doc.textContent, 1000, 200);
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const embedding = generateMockEmbedding();
      const embeddingStr = formatEmbeddingForPg(embedding);

      const { error: chunkError } = await supabase.from("document_chunks").insert({
        organization_id: orgId,
        document_id: document.id,
        chunk_text: chunk,
        chunk_metadata: {
          chunk_index: i,
          chunk_size: chunk.length,
          document_title: doc.title,
        },
        embedding: embeddingStr,
      });

      if (chunkError) {
        console.error(`[seedDocuments] Failed to create chunk for ${doc.title}:`, chunkError);
      } else {
        chunksCreated++;
      }

      // Rate limiting: small delay between chunks
      await sleep(10);
    }

    console.log(`[seedDocuments] Created document: ${doc.title} with ${textChunks.length} chunks`);
  }

  return { docsCreated, chunksCreated };
}

/**
 * Seed conversations with messages
 */
async function seedConversations(
  orgId: string,
  userIds: Record<string, string>
): Promise<{ conversationsCreated: number; messagesCreated: number }> {
  const supabase = createSupabaseServiceClient();
  
  let conversationsCreated = 0;
  let messagesCreated = 0;

  for (const conv of SAMPLE_CONVERSATIONS) {
    const userId = userIds[conv.userEmail];
    
    if (!userId) {
      console.warn(`[seedConversations] User not found: ${conv.userEmail}`);
      continue;
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        organization_id: orgId,
        user_id: userId,
        title: conv.title,
      })
      .select()
      .single();

    if (convError || !conversation) {
      console.error(`[seedConversations] Failed to create conversation ${conv.title}:`, convError);
      continue;
    }

    conversationsCreated++;

    // Create messages
    for (const message of conv.messages) {
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: message.role,
        content: message.content,
        metadata: {},
      });

      if (msgError) {
        console.error(`[seedConversations] Failed to create message:`, msgError);
      } else {
        messagesCreated++;
      }
    }

    console.log(`[seedConversations] Created conversation: ${conv.title} with ${conv.messages.length} messages`);
  }

  return { conversationsCreated, messagesCreated };
}

/**
 * Seed procedures (SOPs)
 */
async function seedProcedures(orgId: string): Promise<number> {
  const supabase = createSupabaseServiceClient();
  
  let proceduresCreated = 0;

  for (const proc of SAMPLE_PROCEDURES) {
    const { error: procError } = await supabase.from("procedures").insert({
      organization_id: orgId,
      title: proc.title,
      content: proc.content,
      source_documents: proc.sourceDocuments,
    });

    if (procError) {
      console.error(`[seedProcedures] Failed to create procedure ${proc.title}:`, procError);
    } else {
      proceduresCreated++;
      console.log(`[seedProcedures] Created procedure: ${proc.title}`);
    }
  }

  return proceduresCreated;
}

/**
 * Main seed function - creates all demo data
 */
export async function seedDemoData(): Promise<SeedResult> {
  console.log("[seedDemoData] Starting demo data seeding...");

  try {
    // 1. Get demo organization ID
    const orgId = await getDemoOrgId();
    if (!orgId) {
      return {
        success: false,
        documentsCreated: 0,
        chunksCreated: 0,
        conversationsCreated: 0,
        messagesCreated: 0,
        proceduresCreated: 0,
        error: "Demo organization not found. Please ensure demo users are created first.",
      };
    }

    console.log(`[seedDemoData] Found demo organization: ${orgId}`);

    // 2. Get demo user IDs
    const userIds = await getDemoUserIds();
    if (Object.keys(userIds).length === 0) {
      return {
        success: false,
        documentsCreated: 0,
        chunksCreated: 0,
        conversationsCreated: 0,
        messagesCreated: 0,
        proceduresCreated: 0,
        error: "Demo users not found.",
      };
    }

    console.log(`[seedDemoData] Found ${Object.keys(userIds).length} demo users`);

    // 3. Seed documents
    const { docsCreated, chunksCreated } = await seedDocuments(orgId);
    console.log(`[seedDemoData] Documents: ${docsCreated}, Chunks: ${chunksCreated}`);

    // 4. Seed conversations
    const { conversationsCreated, messagesCreated } = await seedConversations(orgId, userIds);
    console.log(`[seedDemoData] Conversations: ${conversationsCreated}, Messages: ${messagesCreated}`);

    // 5. Seed procedures
    const proceduresCreated = await seedProcedures(orgId);
    console.log(`[seedDemoData] Procedures: ${proceduresCreated}`);

    console.log("[seedDemoData] Demo data seeding completed successfully!");

    return {
      success: true,
      documentsCreated: docsCreated,
      chunksCreated,
      conversationsCreated,
      messagesCreated,
      proceduresCreated,
    };
  } catch (error) {
    console.error("[seedDemoData] Unexpected error during seeding:", error);
    return {
      success: false,
      documentsCreated: 0,
      chunksCreated: 0,
      conversationsCreated: 0,
      messagesCreated: 0,
      proceduresCreated: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete all demo organization data
 */
export async function deleteDemoData(): Promise<{
  success: boolean;
  deleted: {
    documents: number;
    chunks: number;
    conversations: number;
    messages: number;
    procedures: number;
  };
  error?: string;
}> {
  console.log("[deleteDemoData] Starting demo data deletion...");

  try {
    const orgId = await getDemoOrgId();
    if (!orgId) {
      return {
        success: false,
        deleted: {
          documents: 0,
          chunks: 0,
          conversations: 0,
          messages: 0,
          procedures: 0,
        },
        error: "Demo organization not found",
      };
    }

    const supabase = createSupabaseServiceClient();

    // Delete in reverse order (to respect foreign keys)
    // Messages are deleted by CASCADE when conversations are deleted
    // Chunks are deleted by CASCADE when documents are deleted

    // Delete procedures
    const { error: procError, count: procCount } = await supabase
      .from("procedures")
      .delete()
      .eq("organization_id", orgId)
      .select("id", { count: "exact", head: true });

    // Delete conversations (messages cascade)
    const { error: convError, count: convCount } = await supabase
      .from("conversations")
      .delete()
      .eq("organization_id", orgId)
      .select("id", { count: "exact", head: true });

    // Count messages before deletion (for reporting)
    const { count: msgCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in(
        "conversation_id",
        supabase.from("conversations").select("id").eq("organization_id", orgId)
      );

    // Delete documents (chunks cascade)
    const { error: docError, count: docCount } = await supabase
      .from("documents")
      .delete()
      .eq("organization_id", orgId)
      .select("id", { count: "exact", head: true });

    // Count chunks before deletion (for reporting)
    const { count: chunkCount } = await supabase
      .from("document_chunks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId);

    if (procError || convError || docError) {
      console.error("[deleteDemoData] Errors during deletion:", { procError, convError, docError });
    }

    console.log("[deleteDemoData] Demo data deletion completed");

    return {
      success: true,
      deleted: {
        documents: docCount ?? 0,
        chunks: chunkCount ?? 0,
        conversations: convCount ?? 0,
        messages: msgCount ?? 0,
        procedures: procCount ?? 0,
      },
    };
  } catch (error) {
    console.error("[deleteDemoData] Unexpected error during deletion:", error);
    return {
      success: false,
      deleted: {
        documents: 0,
        chunks: 0,
        conversations: 0,
        messages: 0,
        procedures: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get current status of demo data
 */
export async function getDemoDataStatus(): Promise<DemoDataStatus> {
  const orgId = await getDemoOrgId();
  
  if (!orgId) {
    return {
      hasData: false,
      documentCount: 0,
      conversationCount: 0,
      procedureCount: 0,
      chunkCount: 0,
      messageCount: 0,
    };
  }

  const supabase = createSupabaseServiceClient();

  const [
    { count: documentCount },
    { count: chunkCount },
    { count: conversationCount },
    { count: messageCount },
    { count: procedureCount },
  ] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("document_chunks").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", supabase.from("conversations").select("id").eq("organization_id", orgId)),
    supabase.from("procedures").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
  ]);

  const hasData = (documentCount ?? 0) > 0 || (conversationCount ?? 0) > 0 || (procedureCount ?? 0) > 0;

  return {
    hasData,
    documentCount: documentCount ?? 0,
    conversationCount: conversationCount ?? 0,
    procedureCount: procedureCount ?? 0,
    chunkCount: chunkCount ?? 0,
    messageCount: messageCount ?? 0,
  };
}

