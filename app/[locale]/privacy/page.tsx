import { getTranslations } from "next-intl/server";
import { JSX } from "react";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PrivacyPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t("title")}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{t("headline")}</h1>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </div>

      <div className="space-y-6 text-sm leading-6 text-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("sections.data.title")}</h2>
          <p>{t("sections.data.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("sections.cookies.title")}</h2>
          <p>{t("sections.cookies.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("sections.rights.title")}</h2>
          <p>{t("sections.rights.body")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("sections.contacts.title")}</h2>
          <p>{t("sections.contacts.body")}</p>
        </section>
      </div>
    </div>
  );
}

