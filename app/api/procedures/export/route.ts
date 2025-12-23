import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { renderSopMarkdown } from "@/lib/server/sop";
import { renderSopPdf } from "@/lib/server/sopPdf";
import { logError, logInfo } from "@/lib/server/logger";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = z
    .object({
      id: z.string().uuid(),
      format: z.enum(["md", "pdf"]).default("md"),
    })
    .safeParse({
      id: url.searchParams.get("id"),
      format: url.searchParams.get("format") ?? "md",
    });

  if (!parsed.success) {
    logError("Invalid export params", { issues: parsed.error.issues });
    return NextResponse.json({ error: "Invalid id or format" }, { status: 400 });
  }

  const { id, format } = parsed.data;

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    logError("Unauthorized export attempt", { route: "procedures/export" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data: membership } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.organization_id) {
    logError("Export without organization", { userId: userData.user.id });
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const { data, error } = await service
    .from("procedures")
    .select("id,title,content,source_documents,organization_id")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single();

  if (error || !data) {
    logError("Procedure not found", { id, org: membership.organization_id });
    return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
  }

  if (format === "pdf") {
    const pdf = await renderSopPdf({
      title: data.title,
      content: data.content,
      sourceDocuments: data.source_documents ?? [],
    });
    const pdfBytes = new Uint8Array(pdf);
    logInfo("SOP export PDF", { id, org: membership.organization_id });
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${data.title || "sop"}.pdf"`,
      },
    });
  }

  // default markdown
  const md = renderSopMarkdown({
    title: data.title,
    content: data.content,
    sourceDocuments: data.source_documents ?? [],
  });
  logInfo("SOP export MD", { id, org: membership.organization_id });
  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${data.title || "sop"}.md"`,
    },
  });
}

