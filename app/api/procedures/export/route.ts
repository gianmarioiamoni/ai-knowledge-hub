import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { renderSopMarkdown } from "@/lib/server/sop";
import { renderSopPdf } from "@/lib/server/sopPdf";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const format = url.searchParams.get("format") ?? "md";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
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
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const { data, error } = await service
    .from("procedures")
    .select("id,title,content,source_documents,organization_id")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
  }

  if (format === "pdf") {
    const pdf = await renderSopPdf({
      title: data.title,
      content: data.content,
      sourceDocuments: data.source_documents ?? [],
    });
    const pdfBytes = new Uint8Array(pdf);
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
  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${data.title || "sop"}.md"`,
    },
  });
}

