import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { ensureUserOrganization } from "@/lib/server/organizations";

type ProcedurePageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProcedurePage({ params }: ProcedurePageProps): Promise<JSX.Element> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "proceduresPage" });

  const supabase = createSupabaseServerClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) {
    notFound();
  }

  const orgId = await ensureUserOrganization({ supabase });
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

  const created = data.created_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.created_at))
    : "–";

  const toReadableMarkdown = (value: string): string => {
    const headingLabels = new Set([
      "Standard Operating Procedure (SOP)",
      "Purpose",
      "Preconditions",
      "Prerequisites",
      "Step-by-Step Instructions",
      "Safety Warnings",
      "Warnings",
      "Checklist",
      "Notes",
    ]);
  const headingWithValue = new Set([
    "Title",
    "Scope",
    "Purpose",
    "Preconditions",
    "Prerequisites",
    "Step-by-Step Instructions",
    "Safety Warnings",
    "Warnings",
    "Checklist",
    "Notes",
  ]);

    const lines = value.replace(/\r\n/g, "\n").split("\n");
    const out: string[] = [];

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) {
        out.push("");
        continue;
      }
      // Markdown headings already present
      if (/^#{1,6}\s/.test(trimmed)) {
        out.push("", trimmed);
        continue;
      }
      // Known section labels -> H2
      if (headingLabels.has(trimmed)) {
        out.push("", `## ${trimmed}`);
        continue;
      }
      // Lines ending with ":" -> H3
      if (/[:：]\s*$/.test(trimmed)) {
        out.push("", `### ${trimmed.replace(/[:：]\s*$/, "")}`);
        continue;
      }
      // Label: value pattern -> bold label
      const labelMatch = trimmed.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);
      if (labelMatch) {
        const label = labelMatch[1];
        const value = labelMatch[2];
        if (headingWithValue.has(label)) {
          out.push("", `## ${label}`, value);
        } else {
          out.push(`**${label}:** ${value}`);
        }
        continue;
      }
      out.push(trimmed);
    }

    return out.join("\n");
  };

  const content = toReadableMarkdown(data.content);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-0">
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: "/dashboard" },
          { label: t("breadcrumbs.procedures"), href: "/procedures" },
          { label: data.title },
        ]}
      />

      <div className="flex justify-end">
        <Link
          href="/procedures"
          className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          ← {t("breadcrumbs.procedures")}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {t("title")}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{data.title}</h1>
        <p className="text-sm text-muted-foreground">{created}</p>
      </div>

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <article className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="mt-4 text-2xl font-bold text-foreground" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="mt-4 text-xl font-semibold text-foreground" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="mt-3 text-lg font-semibold text-foreground" {...props} />
              ),
              p: ({ node, ...props }) => <p className="text-sm leading-6 text-foreground" {...props} />,
              li: ({ node, ...props }) => <li className="text-sm leading-6 text-foreground" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </Card>
    </div>
  );
}

