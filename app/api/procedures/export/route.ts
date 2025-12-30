import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { renderSopMarkdown } from "@/lib/server/sop";
import { renderSopPdf } from "@/lib/server/sopPdf";
import { logError, logInfo } from "@/lib/server/logger";
import { rateLimit } from "@/lib/server/rateLimit";
import { z } from "zod";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { ensureActivePlan } from "@/lib/server/subscriptions";
import { canGenerateSop } from "@/lib/server/roles";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = z
    .object({
      id: z.string().uuid(),
      format: z.enum(["md", "pdf"]).default("md"),
      locale: z.enum(["en", "it"]).default("en"),
    })
    .safeParse({
      id: url.searchParams.get("id"),
      format: url.searchParams.get("format") ?? "md",
      locale: url.searchParams.get("locale") ?? "en",
    });

  if (!parsed.success) {
    logError("Invalid export params", { issues: parsed.error.issues });
    return NextResponse.json({ error: "Invalid id or format" }, { status: 400 });
  }

  const { id, format, locale } = parsed.data;
  const messages = {
    en: {
      invalid: "Invalid id or format",
      unauthorized: "Unauthorized",
      noOrg: "No organization found",
      notFound: "Procedure not found",
      rateLimit: "Rate limit exceeded. Please try again later.",
    },
    it: {
      invalid: "ID o formato non valido",
      unauthorized: "Non autorizzato",
      noOrg: "Nessuna organizzazione trovata",
      notFound: "Procedura non trovata",
      rateLimit: "Limite di richieste superato. Riprovare più tardi.",
    },
  } as const;
  const t = messages[locale] ?? messages.en;

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    logError("Unauthorized export attempt", { route: "procedures/export" });
    return NextResponse.json({ error: t.unauthorized }, { status: 401 });
  }
  const role = (userData.user.user_metadata as { role?: string } | null)?.role;
  if (!canGenerateSop(role as any)) {
    return NextResponse.json({ error: t.unauthorized }, { status: 403 });
  }

  ensureActivePlan(userData.user, locale, true);
  const { organizationId } = await requireActiveOrganization({ supabase, locale });

  const rl = rateLimit(`export:${userData.user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: t.rateLimit },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
    );
  }

  const service = createSupabaseServiceClient();

  const { data, error } = await service
    .from("procedures")
    .select("id,title,content,source_documents,organization_id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .single();

  if (error || !data) {
    logError("Procedure not found", { id, org: membership.organization_id });
    return NextResponse.json({ error: t.notFound }, { status: 404 });
  }

  if (format === "pdf") {
    const pdf = await renderSopPdf({
      title: data.title,
      content: data.content,
      sourceDocuments: data.source_documents ?? [],
    });
    const pdfBytes = new Uint8Array(pdf);
    logInfo("SOP export PDF", { id, org: organizationId });
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
  logInfo("SOP export MD", { id, org: organizationId });
  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${data.title || "sop"}.md"`,
    },
  });
}

