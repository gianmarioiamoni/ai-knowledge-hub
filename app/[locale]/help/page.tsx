import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpenIcon, LifeBuoyIcon, MailIcon, MessageCircleIcon } from "lucide-react";

type HelpPageProps = {
  params: Promise<{ locale: string }>;
};

const manualHrefByLocale = (locale: string): string =>
  locale === "it"
    ? "https://github.com/gianmarioiamoni/ai-knowledge-hub/blob/main/docs/USER_MANUAL_IT.md"
    : "https://github.com/gianmarioiamoni/ai-knowledge-hub/blob/main/docs/USER_MANUAL.md";

export default async function HelpPage({ params }: HelpPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });
  const faq = [
    { q: t("faq.ingestion.q"), a: t("faq.ingestion.a") },
    { q: t("faq.chat.q"), a: t("faq.chat.a") },
    { q: t("faq.sop.q"), a: t("faq.sop.a") },
    { q: t("faq.plans.q"), a: t("faq.plans.a") },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <LifeBuoyIcon className="size-6 text-primary" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("subtitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="size-5 text-primary" />
            <div>
              <p className="text-base font-semibold text-foreground">{t("cards.manual.title")}</p>
              <p className="text-sm text-muted-foreground">{t("cards.manual.description")}</p>
            </div>
          </div>
          <Button asChild className="w-fit">
            <Link href={manualHrefByLocale(locale)} target="_blank">
              {t("cards.manual.cta")}
            </Link>
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <MessageCircleIcon className="size-5 text-primary" />
            <div>
              <p className="text-base font-semibold text-foreground">{t("cards.contact.title")}</p>
              <p className="text-sm text-muted-foreground">{t("cards.contact.description")}</p>
            </div>
          </div>
          <Button asChild variant="secondary" className="w-fit">
            <Link href="/contact">{t("cards.contact.cta")}</Link>
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <MailIcon className="size-5 text-primary" />
            <div>
              <p className="text-base font-semibold text-foreground">{t("cards.support.title")}</p>
              <p className="text-sm text-muted-foreground">{t("cards.support.description")}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground leading-5">
            <p>{t("cards.support.email")}</p>
            <p>{t("cards.support.sla")}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 pb-2">
          <LifeBuoyIcon className="size-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">{t("faq.title")}</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-6">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground">{t("quick.title")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/documents"
            className="rounded-lg border bg-white/70 p-4 text-sm leading-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <p className="font-semibold text-foreground">{t("quick.documents.title")}</p>
            <p className="text-muted-foreground">{t("quick.documents.body")}</p>
          </Link>
          <Link
            href="/chat"
            className="rounded-lg border bg-white/70 p-4 text-sm leading-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <p className="font-semibold text-foreground">{t("quick.chat.title")}</p>
            <p className="text-muted-foreground">{t("quick.chat.body")}</p>
          </Link>
          <Link
            href="/procedures"
            className="rounded-lg border bg-white/70 p-4 text-sm leading-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <p className="font-semibold text-foreground">{t("quick.procedures.title")}</p>
            <p className="text-muted-foreground">{t("quick.procedures.body")}</p>
          </Link>
          <Link
            href="/plans"
            className="rounded-lg border bg-white/70 p-4 text-sm leading-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <p className="font-semibold text-foreground">{t("quick.plans.title")}</p>
            <p className="text-muted-foreground">{t("quick.plans.body")}</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}


