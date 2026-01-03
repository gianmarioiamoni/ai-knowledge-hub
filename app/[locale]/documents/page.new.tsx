import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { handleUploadWithState } from "./actions";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { ensureActivePlan } from "@/lib/server/subscriptions";
import { buildMetadata } from "@/lib/seo";
import { canUploadDocs } from "@/lib/server/roles";
import { DocumentsPage } from "@/components/documents";
import type { DocumentRow } from "@/components/documents";
import { getDocumentsLabels } from "@/lib/server/documentsHelpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "documentsPage" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/documents",
  });
}

export default async function DocumentsPageRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;

  // Auth check
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect({ href: "/login", locale });
  }

  // Non-null assertion safe here because redirect throws
  const user = data.user!;

  // Plan check
  ensureActivePlan(user, locale);

  // Role check
  const role = (user.user_metadata as { role?: string } | null)?.role;
  if (role === "SUPER_ADMIN") {
    redirect({ href: "/admin-stats", locale });
  }

  const allowUpload = canUploadDocs(role as any);

  // Data fetching
  const service = createSupabaseServiceClient();
  const { organizationId } = await requireActiveOrganization({ supabase, locale });

  const { data: docs } = await service
    .from("documents")
    .select("id,file_path,file_type,status,metadata,updated_at")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const documents: DocumentRow[] = (docs ?? []) as DocumentRow[];

  // Labels
  const labels = await getDocumentsLabels(locale);

  return (
    <DocumentsPage
      locale={locale}
      documents={documents}
      labels={labels}
      allowUpload={allowUpload}
      uploadAction={handleUploadWithState}
    />
  );
}

