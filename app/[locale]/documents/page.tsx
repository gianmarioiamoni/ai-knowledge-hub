import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { uploadDocument } from "./actions";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { StatusBadge } from "@/components/documents/StatusBadge";
import { Card } from "@/components/ui/card";

type DocumentRow = {
  id: string;
  file_path: string;
  file_type: string;
  status: "pending" | "processing" | "ingested" | "failed";
  metadata: Record<string, unknown> | null;
  updated_at: string | null;
};

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "documentsPage" });

  const supabase = createSupabaseServerClient();
  const organizationId = await ensureUserOrganization({ supabase });

  const { data: docs } = await supabase
    .from("documents")
    .select("id,file_path,file_type,status,metadata,updated_at")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const action = uploadDocument;

  const rows: DocumentRow[] = (docs ?? []) as DocumentRow[];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {t("title")}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("ingestionNote")}</p>
      </div>

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="text-sm font-medium text-foreground">
            {t("uploadLabel")}
            <input
              required
              name="file"
              type="file"
              accept="application/pdf"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
            />
          </label>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {t("hintFormats")} · {t("hintSecurity")}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t("uploadButton")}
            </button>
          </div>
        </form>
      </Card>

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

