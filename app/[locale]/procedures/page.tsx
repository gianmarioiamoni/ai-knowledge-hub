import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { handleGenerateSop } from "./actions";
import { ensureActivePlan } from "@/lib/server/subscriptions";
import { buildMetadata } from "@/lib/seo";
import { canGenerateSop } from "@/lib/server/roles";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { ProceduresListPage } from "@/components/procedures";
import type { ProcedureRow } from "@/components/procedures";
import { getProceduresListLabels } from "@/lib/server/procedureHelpers";

export const dynamic = "force-dynamic";

type ProceduresPageRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "proceduresPage" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/procedures",
  });
}

export default async function ProceduresPageRoute({
  params,
}: ProceduresPageRouteProps): Promise<JSX.Element> {
  const { locale } = await params;

  // Auth check
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect({ href: "/login", locale });
  }

  // Plan check
  ensureActivePlan(user!, locale);

  // Role check
  const role = (user?.user_metadata as { role?: string } | null)?.role;
  if (role === "SUPER_ADMIN") {
    redirect({ href: "/admin-stats", locale });
  }

  const allowGenerate = canGenerateSop(role as any);

  // Organization check
  const { organizationId } = await requireActiveOrganization({ supabase, locale });

  // Fetch procedures
  const service = createSupabaseServiceClient();
  const { data: procedures } = await service
    .from("procedures")
    .select("id,title,content,source_documents,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const rows: ProcedureRow[] = (procedures ?? []) as ProcedureRow[];

  // Labels
  const labels = await getProceduresListLabels(locale);

  return (
    <ProceduresListPage
      locale={locale}
      procedures={rows}
      labels={labels}
      allowGenerate={allowGenerate}
      generateAction={handleGenerateSop}
    />
  );
}

