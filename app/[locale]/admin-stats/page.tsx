import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { getPlatformStats } from "@/lib/server/adminStats";
import { Card } from "@/components/ui/card";

export default async function AdminStatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect({ href: "/login", locale });
  }

  const role = (user?.user_metadata as { role?: string } | null)?.role;
  if (role !== "SUPER_ADMIN") {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "adminStats" });
  const stats = await getPlatformStats();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label={t("users")} value={stats.usersTotal} hint={t("banned", { count: stats.bannedUsers })} />
        <StatCard label={t("orgs")} value={stats.organizationsTotal} hint={t("members", { count: stats.membersTotal })} />
        <StatCard label={t("documents")} value={stats.documentsTotal} hint={t("procedures", { count: stats.proceduresTotal })} />
        <StatCard label={t("conversations")} value={stats.conversationsTotal} hint={t("procedures", { count: stats.proceduresTotal })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-base font-semibold text-foreground">{t("docsByStatus")}</h2>
          <div className="mt-3 space-y-2">
            {Object.keys(stats.documentsByStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            ) : (
              Object.entries(stats.documentsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{status}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-base font-semibold text-foreground">{t("conversations7d")}</h2>
          <BarChart data={stats.conversations7d} />
          <div className="mt-3">
            <h3 className="text-base font-semibold text-foreground">{t("procedures7d")}</h3>
            <BarChart data={stats.procedures7d} tone="secondary" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }): JSX.Element {
  return (
    <Card className="border border-white/40 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold text-foreground">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}

function BarChart({
  data,
  tone = "primary",
}: {
  data: Array<{ label: string; count: number }>;
  tone?: "primary" | "secondary";
}): JSX.Element {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barClass =
    tone === "primary"
      ? "bg-primary/80"
      : "bg-accent/70";

  return (
    <div className="mt-3 space-y-2">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-12">{d.label}</span>
            <div className="h-2 flex-1 rounded-full bg-border">
              <div
                className={`h-2 rounded-full ${barClass}`}
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-foreground">{d.count}</span>
          </div>
        ))
      )}
    </div>
  );
}

