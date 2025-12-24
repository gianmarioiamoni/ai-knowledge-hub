import { getTranslations } from "next-intl/server";
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

