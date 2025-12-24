import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { Card } from "@/components/ui/card";

export default async function ProfilePage({
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

  const t = await getTranslations({ locale, namespace: "profile" });
  const role = (user?.user_metadata as { role?: string } | null)?.role ?? "USER";

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
      </div>

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("email")}</p>
            <p className="text-base font-semibold text-foreground">{user?.email}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("role")}</p>
            <p className="text-base font-semibold text-foreground">{role}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("created")}</p>
            <p className="text-base font-semibold text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </Card>

      <ChangePasswordForm
        labels={{
          title: t("changePassword.title"),
          newPassword: t("changePassword.newPassword"),
          confirmPassword: t("changePassword.confirmPassword"),
          submit: t("changePassword.submit"),
          success: t("changePassword.success"),
          error: t("changePassword.error"),
        }}
      />

      <Card className="border border-rose-100 bg-rose-50 p-6 shadow-sm dark:bg-white/5">
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-foreground">{t("delete.title")}</p>
          <p className="text-sm text-muted-foreground">{t("delete.description")}</p>
          <DeleteAccountDialog
            labels={{
              title: t("delete.title"),
              description: t("delete.description"),
              confirm: t("delete.confirm"),
              cancel: t("delete.cancel"),
              success: t("delete.success"),
              error: t("delete.error"),
              confirmLabel: t("delete.confirmLabel"),
            }}
          />
        </div>
      </Card>
    </div>
  );
}

