import { getTranslations } from "next-intl/server";
import type { HelpPageLabels } from "@/components/help/types";

export async function getHelpLabels(locale: string): Promise<HelpPageLabels> {
  const t = await getTranslations({ locale, namespace: "help" });

  return {
    title: t("title"),
    subtitle: t("subtitle"),
    description: t("description"),
    cards: {
      manual: {
        title: t("cards.manual.title"),
        description: t("cards.manual.description"),
        cta: t("cards.manual.cta"),
      },
      contact: {
        title: t("cards.contact.title"),
        description: t("cards.contact.description"),
        cta: t("cards.contact.cta"),
      },
      support: {
        title: t("cards.support.title"),
        description: t("cards.support.description"),
        email: t("cards.support.email"),
        sla: t("cards.support.sla"),
      },
    },
    faq: {
      title: t("faq.title"),
      items: [
        { q: t("faq.ingestion.q"), a: t("faq.ingestion.a") },
        { q: t("faq.chat.q"), a: t("faq.chat.a") },
        { q: t("faq.sop.q"), a: t("faq.sop.a") },
        { q: t("faq.plans.q"), a: t("faq.plans.a") },
      ],
    },
    quick: {
      title: t("quick.title"),
      links: {
        documents: {
          title: t("quick.documents.title"),
          body: t("quick.documents.body"),
          href: "/documents",
        },
        chat: {
          title: t("quick.chat.title"),
          body: t("quick.chat.body"),
          href: "/chat",
        },
        procedures: {
          title: t("quick.procedures.title"),
          body: t("quick.procedures.body"),
          href: "/procedures",
        },
        plans: {
          title: t("quick.plans.title"),
          body: t("quick.plans.body"),
          href: "/plans",
        },
      },
    },
  };
}


