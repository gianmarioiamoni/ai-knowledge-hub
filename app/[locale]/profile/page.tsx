import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { Link, redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { getPlanStatus, isUnlimitedRole } from "@/lib/server/subscriptions";
import { CancelPlanDialog } from "@/components/profile/CancelPlanDialog";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { Button } from "@/components/ui/button";
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

  // Allow profile view to see plan, but if expired enforce redirect
  const planStatus = getPlanStatus(user!);
  const isUnlimited = isUnlimitedRole(user!);
  if (!isUnlimited && planStatus.expired && planStatus.planId !== "trial") {
    redirect({ href: "/plans", locale });
  }

  const t = await getTranslations({ locale, namespace: "profile" });
  const role = (user?.user_metadata as { role?: string } | null)?.role ?? "USER";
  const plan = planStatus;
  const planLabel = (() => {
    if (isUnlimited) return t("planLabels.unlimited");
    if (plan.planId === "trial" && plan.expired) return t("planLabels.trialExpired");
    if (plan.planId === "trial") return t("planLabels.trial");
    if (plan.planId === "smb") return t("planLabels.smb");
    if (plan.planId === "enterprise") return t("planLabels.enterprise");
    if (plan.planId === "expired") return t("planLabels.expired");
    return t("planLabels.unknown");
  })();
  const formatDate = (value?: string | null): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };
  const nextRenewal = (() => {
    if (plan.planId === "trial") return formatDate(plan.trialEndsAt);
    return formatDate(plan.renewalAt);
  })();
  const nextRenewalLabel = nextRenewal ?? t("planNotAvailable");
  const planDateLabel = (() => {
    if (!nextRenewal) return null;
    if (plan.planId === "trial") return t("planDate.trial", { date: nextRenewal });
    return t("planDate.renewal", { date: nextRenewal });
  })();
  const isPaidPlan = plan.planId === "smb" || plan.planId === "enterprise";

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
      </div>

      <Card className="border border-white/40 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("email")}</p>
            <p className="text-base font-semibold text-foreground">{user?.email}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("role")}</p>
            <p className="text-base font-semibold text-foreground">{role}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("plan")}</p>
            <div className="flex flex-col">
              <p className="text-base font-semibold text-foreground">{planLabel}</p>
              {planDateLabel ? (
                <p className="text-sm text-muted-foreground">{planDateLabel}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("nextRenewal")}</p>
            <p className="text-base font-semibold text-foreground">{nextRenewalLabel}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{t("created")}</p>
            <p className="text-base font-semibold text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleString() : "—"}
            </p>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <Button asChild variant="outline" className="w-fit">
              <Link href={`/${locale}/plans`}>{t("planManage")}</Link>
            </Button>
            {isPaidPlan ? (
              <CancelPlanDialog
                billingCycle={plan.billingCycle ?? "monthly"}
                labels={{
                  cta: t("cancel.cta"),
                  title: t("cancel.title"),
                  description: t("cancel.description"),
                  warnings: [
                    t("cancel.warnings.trialFallback"),
                    t("cancel.warnings.accessLost"),
                    t("cancel.warnings.cleanup"),
                  ],
                  confirm: t("cancel.confirm"),
                  cancel: t("cancel.cancel"),
                  success: t("cancel.success"),
                  error: t("cancel.error"),
                }}
              />
            ) : null}
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

