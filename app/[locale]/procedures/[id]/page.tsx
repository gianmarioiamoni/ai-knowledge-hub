import { notFound } from "next/navigation";
import type { JSX } from "react";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { ProcedureDetailPage } from "@/components/procedures";
import type { ProcedureData } from "@/components/procedures";
import { formatDate, toReadableMarkdown } from "@/components/procedures/helpers";
import { getProcedureLabels } from "@/lib/server/procedureHelpers";

export const dynamic = "force-dynamic";

type ProcedurePageRouteProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProcedurePageRoute({ params }: ProcedurePageRouteProps): Promise<JSX.Element> {
  const { locale, id } = await params;

  // Auth check
  const supabase = createSupabaseServerClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) {
    notFound();
  }

  // Get organization
  const orgId = await ensureUserOrganization({ supabase });

  // Fetch procedure
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("procedures")
    .select("id,title,content,source_documents,created_at,organization_id")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();

  if (!data) {
    notFound();
  }

  const procedure = data as ProcedureData;

  // Process data
  const createdAt = formatDate(procedure.created_at, locale);
  const content = toReadableMarkdown(procedure.content);

  // Labels
  const labels = await getProcedureLabels(locale);

  return (
    <ProcedureDetailPage
      title={procedure.title}
      content={content}
      createdAt={createdAt}
      labels={labels}
    />
  );
}

