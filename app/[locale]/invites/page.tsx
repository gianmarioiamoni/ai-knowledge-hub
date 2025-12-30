import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { ensureUserOrganization } from "@/lib/server/organizations";
import { canInviteUsers } from "@/lib/server/roles";
import { createInvite, revokeInvite } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { format } from "date-fns";
import { InviteForm } from "@/components/invites/InviteForm";

type InviteRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
};

export default async function InvitesPage({
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
  if (!canInviteUsers(role as any)) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "invites" });
  const service = createSupabaseServiceClient();
  const orgId = await ensureUserOrganization({ supabase });

  const { data: invites } = await service
    .from("organization_invites")
    .select("id,email,role,status,expires_at,created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const rows: InviteRow[] = (invites ?? []) as InviteRow[];

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <Card className="p-6">
        <InviteForm
          locale={locale}
          labels={{
            email: t("form.email"),
            role: t("form.role"),
            roles: {
              contributor: t("form.roles.contributor"),
              viewer: t("form.roles.viewer"),
            },
            submit: t("form.submit"),
            success: t("form.success"),
            error: t("errors.limitContributor"),
          }}
        />
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("list.title")}</h2>
          <span className="text-sm text-muted-foreground">{rows.length} invites</span>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <table className="min-w-full divide-y divide-border/80 text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("list.email")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("list.role")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("list.status")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("list.expires")}</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">{t("list.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 bg-background/40">
                {rows.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 text-foreground">{inv.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.expires_at ? format(new Date(inv.expires_at), "yyyy-MM-dd") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "pending" ? (
                        <ConfirmDialog
                          title={t("list.revokeTitle")}
                          description={t("list.revokeDesc")}
                          confirmLabel={t("list.revoke")}
                          cancelLabel={t("list.cancel")}
                          onConfirm={async () => {
                            const fd = new FormData();
                            fd.append("locale", locale);
                            fd.append("id", inv.id);
                            await revokeInvite({}, fd);
                          }}
                          trigger={
                            <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">
                              {t("list.revoke")}
                            </Button>
                          }
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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


