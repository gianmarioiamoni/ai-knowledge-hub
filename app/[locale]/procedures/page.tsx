import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { handleGenerateSop } from "./actions";
import { ensureActivePlan } from "@/lib/server/subscriptions";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { ProcedureList } from "@/components/procedures/ProcedureList";
import { GenerateSopDialog } from "@/components/procedures/GenerateSopDialog";
import { buildMetadata } from "@/lib/seo";
import { canGenerateSop } from "@/lib/server/roles";

type ProcedureRow = {
  id: string;
  title: string;
  content: string;
  source_documents: string[];
  created_at: string;
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

export default async function ProceduresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "proceduresPage" });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect({ href: "/login", locale });
  }

  ensureActivePlan(user!, locale);

  const role = (user?.user_metadata as { role?: string } | null)?.role;
  if (role === "SUPER_ADMIN") {
    redirect({ href: "/admin-stats", locale });
  }
  const allowGenerate = canGenerateSop(role as any);

  const service = createSupabaseServiceClient();
  const organizationId = await ensureUserOrganization({ supabase });

  const { data: procedures } = await service
    .from("procedures")
    .select("id,title,content,source_documents,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const rows: ProcedureRow[] = (procedures ?? []) as ProcedureRow[];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-0">
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: `/${locale}/dashboard` },
          { label: t("breadcrumbs.procedures") },
        ]}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {t("title")}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {allowGenerate ? (
        <div className="flex justify-end">
          <GenerateSopDialog
            locale={locale}
            labels={{
              trigger: t("generate"),
              titleLabel: t("form.titleLabel"),
              scopeLabel: t("form.scopeLabel"),
              submit: t("form.submit"),
              cancel: t("form.cancel"),
              success: t("form.success"),
              description: t("form.description"),
              allowFreeLabel: t("form.allowFreeLabel"),
              allowFreeWarning: t("form.allowFreeWarning"),
            }}
            action={handleGenerateSop}
          />
        </div>
      ) : null}

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("listTitle")}</h2>
          <span className="text-sm text-muted-foreground">{rows.length} SOP</span>
        </div>
        <ProcedureList
          procedures={rows}
          labels={{
            empty: t("empty"),
            view: t("actions.view"),
            exportMd: t("actions.exportMd"),
            exportPdf: t("actions.exportPdf"),
            delete: t("actions.delete"),
            confirmDelete: t("actions.confirmDelete", { title: "{title}" }),
            edit: t("actions.edit"),
            save: t("actions.save"),
            cancel: t("actions.cancel"),
          }}
          locale={locale}
        />
      </Card>
    </div>
  );
}

