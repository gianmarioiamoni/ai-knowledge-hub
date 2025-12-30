import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";
import { deleteOrg, deleteUser, disableOrg, disableUser, enableOrg, enableUser } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

type MemberRow = {
  user_id: string;
  organization_id: string;
  role: string;
  disabled: boolean;
  email: string | null;
  created_at: string | null;
};

type OrgRow = {
  id: string;
  name: string;
  disabled: boolean;
};

export default async function AdminUsersPage({
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
    return <></>;
  }
  const role = (user.user_metadata as { role?: string } | null)?.role ?? null;
  if (role !== "SUPER_ADMIN") {
    redirect({ href: "/dashboard", locale });
    return <></>;
  }

  const t = await getTranslations({ locale, namespace: "adminUsers" });
  const service = createSupabaseServiceClient();

  const { data: orgRows } = await service.from("organizations").select("id,name,disabled");
  const orgs: OrgRow[] = (orgRows ?? []) as OrgRow[];

  const { data: memberRows } = await service.from("organization_members").select("user_id,organization_id,role,disabled");
  const members = (memberRows ?? []) as Array<{
    user_id: string;
    organization_id: string;
    role: string;
    disabled: boolean;
  }>;

  const { data: usersData } = await service.auth.admin.listUsers();
  const usersById =
    usersData?.users?.reduce<Record<string, { email: string | null; created_at: string | null }>>((acc, u) => {
      acc[u.id] = { email: u.email ?? null, created_at: u.created_at ?? null };
      return acc;
    }, {}) ?? {};

  const membersWithUser: MemberRow[] = members.map((m) => ({
    ...m,
    email: usersById[m.user_id]?.email ?? null,
    created_at: usersById[m.user_id]?.created_at ?? null,
  }));

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">{t("orgsTitle")}</h2>
        <div className="mt-4 space-y-2">
          {orgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            orgs.map((org) => (
              <div key={org.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {org.disabled ? t("status.disabled") : t("status.active")}
                  </span>
                </div>
                <div className="flex gap-2">
                  {org.disabled ? (
                    <form action={async (fd) => { await enableOrg({}, fd); }}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="orgId" value={org.id} />
                      <Button size="sm" variant="secondary">
                        {t("actions.enable")}
                      </Button>
                    </form>
                  ) : (
                    <ConfirmDialog
                      title={t("actions.disableOrgTitle")}
                      description={t("actions.disableOrgDesc")}
                      confirmLabel={t("actions.disable")}
                      cancelLabel={t("actions.cancel")}
                      onConfirm={async () => {
                        const fd = new FormData();
                        fd.append("locale", locale);
                        fd.append("orgId", org.id);
                        await disableOrg({}, fd);
                      }}
                      trigger={
                        <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-800">
                          {t("actions.disable")}
                        </Button>
                      }
                    />
                  )}
                  <ConfirmDialog
                    title={t("actions.deleteOrgTitle")}
                    description={t("actions.deleteOrgDesc")}
                    confirmLabel={t("actions.delete")}
                    cancelLabel={t("actions.cancel")}
                    onConfirm={async () => {
                      const fd = new FormData();
                      fd.append("locale", locale);
                      fd.append("orgId", org.id);
                      await deleteOrg({}, fd);
                    }}
                    trigger={
                      <Button size="sm" variant="destructive">
                        {t("actions.delete")}
                      </Button>
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">{t("usersTitle")}</h2>
        {membersWithUser.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <table className="min-w-full divide-y divide-border/80 text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("users.email")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("users.org")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("users.role")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">{t("users.status")}</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">{t("users.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 bg-background/40">
                {membersWithUser.map((m) => (
                  <tr key={`${m.organization_id}-${m.user_id}`}>
                    <td className="px-4 py-3 text-foreground">{m.email ?? m.user_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {orgs.find((o) => o.id === m.organization_id)?.name ?? m.organization_id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.disabled ? t("status.disabled") : t("status.active")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {m.disabled ? (
                          <form action={async (fd) => { await enableUser({}, fd); }}>
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="userId" value={m.user_id} />
                            <Button size="sm" variant="secondary">
                              {t("actions.enable")}
                            </Button>
                          </form>
                        ) : (
                          <ConfirmDialog
                            title={t("actions.disableUserTitle")}
                            description={t("actions.disableUserDesc")}
                            confirmLabel={t("actions.disable")}
                            cancelLabel={t("actions.cancel")}
                            onConfirm={async () => {
                              const fd = new FormData();
                              fd.append("locale", locale);
                              fd.append("userId", m.user_id);
                              await disableUser({}, fd);
                            }}
                            trigger={
                              <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-800">
                                {t("actions.disable")}
                              </Button>
                            }
                          />
                        )}
                        <ConfirmDialog
                          title={t("actions.deleteUserTitle")}
                          description={t("actions.deleteUserDesc")}
                          confirmLabel={t("actions.delete")}
                          cancelLabel={t("actions.cancel")}
                          onConfirm={async () => {
                            const fd = new FormData();
                            fd.append("locale", locale);
                            fd.append("userId", m.user_id);
                            await deleteUser({}, fd);
                          }}
                          trigger={
                            <Button size="sm" variant="destructive">
                              {t("actions.delete")}
                            </Button>
                          }
                        />
                      </div>
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


