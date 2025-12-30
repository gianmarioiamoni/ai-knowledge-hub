import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { handleUploadWithState } from "./actions";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { ensureActivePlan } from "@/lib/server/subscriptions";
import { StatusBadge } from "@/components/documents/StatusBadge";
import { DeleteDocumentAction } from "@/components/documents/DeleteDocumentAction";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { UploadForm } from "@/components/documents/UploadForm";
import { buildMetadata } from "@/lib/seo";
import { canUploadDocs } from "@/lib/server/roles";

type DocumentRow = {
  id: string;
  file_path: string;
  file_type: string;
  status: "pending" | "processing" | "ingested" | "failed";
  metadata: Record<string, unknown> | null;
  updated_at: string | null;
};

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

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "documentsPage" });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect({ href: "/login", locale });
  }

  ensureActivePlan(user!, locale);

  const role = (user?.user_metadata as { role?: string } | null)?.role;
  const allowUpload = canUploadDocs(role as any);
  if (role === "SUPER_ADMIN") {
    redirect({ href: "/admin-stats", locale });
  }

  const service = createSupabaseServiceClient();
  const { organizationId } = await requireActiveOrganization({ supabase, locale });

  const { data: docs } = await service
    .from("documents")
    .select("id,file_path,file_type,status,metadata,updated_at")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const action = handleUploadWithState;

  const rows: DocumentRow[] = (docs ?? []) as DocumentRow[];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-0">
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: `/${locale}/dashboard` },
          { label: t("breadcrumbs.documents") },
        ]}
      />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {t("title")}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("ingestionNote")}</p>
        <div className="flex flex-wrap gap-2 text-sm text-primary">
          <a className="underline-offset-4 hover:underline" href={`/${locale}/chat`}>
            {t("links.chat")}
          </a>
          <span>·</span>
          <a className="underline-offset-4 hover:underline" href={`/${locale}/procedures`}>
            {t("links.procedures")}
          </a>
        </div>
      </div>

      {allowUpload ? (
        <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <UploadForm
            locale={locale}
            labels={{
              uploadLabel: t("uploadLabel"),
              uploadButton: t("uploadButton"),
              uploading: t("uploading"),
              hintFormats: t("hintFormats"),
              hintSecurity: t("hintSecurity"),
            }}
            action={action}
          />
        </Card>
      ) : null}

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("listTitle")}</h2>
          <span className="text-sm text-muted-foreground">{rows.length} docs</span>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <table className="min-w-full divide-y divide-border/80 text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("table.name")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("table.type")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("table.status")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("table.updated")}</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 bg-background/40">
                {rows.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3 text-foreground">
                      {getDisplayName(doc) ?? doc.file_path}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.file_type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} label={t(`status.${doc.status}`)} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(doc.updated_at, locale)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteDocumentAction
                        locale={locale}
                        id={doc.id}
                        labels={{
                          deleteLabel: t("delete.label"),
                          confirmText: t("delete.confirm", { title: getDisplayName(doc) ?? doc.file_path }),
                          cancelLabel: t("delete.cancel"),
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

const getDisplayName = (doc: DocumentRow): string | undefined => {
  const metadata = doc.metadata ?? {};
  const name = (metadata as { originalName?: string }).originalName;
  return name;
};

const formatDate = (value: string | null, locale: string): string => {
  if (!value) return "–";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

