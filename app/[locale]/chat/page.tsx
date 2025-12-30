import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { JSX } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { listConversations, listMessages } from "@/lib/server/chat";
import { requireActiveOrganization } from "@/lib/server/organizations";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { ensureActivePlan } from "@/lib/server/subscriptions";
import { buildMetadata } from "@/lib/seo";
import { canUseChat } from "@/lib/server/roles";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type ChatPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "chatPage" });
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/chat",
  });
}

export default async function ChatPage({ params }: ChatPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
      return redirectToLogin(locale);
  }

  ensureActivePlan(data.user, locale);

  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  if (!canUseChat(role as any)) {
    redirect({ href: "/dashboard", locale });
  }

  const { organizationId } = await requireActiveOrganization({ supabase, locale });
  const conversations = await listConversations(organizationId, data.user.id);
  const initialConversationId = conversations[0]?.id;
  const initialMessages = initialConversationId ? await listMessages(initialConversationId) : [];

  const t = await getTranslations({ locale, namespace: "chatPage" });

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-0">
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: `/${locale}/dashboard` },
          { label: t("breadcrumbs.chat") },
        ]}
      />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <div className="flex flex-wrap gap-2 text-sm text-primary">
          <a className="underline-offset-4 hover:underline" href={`/${locale}/documents`}>
            {t("breadcrumbs.home")}
          </a>
          <span>·</span>
          <a className="underline-offset-4 hover:underline" href={`/${locale}/procedures`}>
            Procedures
          </a>
        </div>
      </div>

      <ChatShell
        conversations={conversations}
        initialConversationId={initialConversationId}
        initialMessages={initialMessages}
        labels={{
          placeholder: t("inputPlaceholder"),
          send: t("send"),
          newChat: t("newChat"),
          empty: t("empty"),
          loading: t("loading"),
          retry: t("retry"),
          contextTitle: t("contextTitle"),
          contextEmpty: t("contextEmpty"),
          stop: t("stop"),
          sending: t("sending"),
          streaming: t("streaming"),
        }}
      />
    </div>
  );
}

function redirectToLogin(locale: string): JSX.Element {
  const { redirect } = require("next/navigation");
  redirect(`/${locale}/login`);
  return <></>;
}

