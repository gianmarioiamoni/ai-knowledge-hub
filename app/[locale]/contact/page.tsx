import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
import { JSX } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps): Promise<JSX.Element> {
  const { locale } = await params;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const defaultEmail = data.user?.email ?? null;

  const t = await getTranslations({ locale, namespace: "contact" });

  // Build topics array
  const topics = [
    { value: "technical", label: t("topics.technical") },
    { value: "commercial", label: t("topics.commercial") },
    { value: "billing", label: t("topics.billing") },
    { value: "other", label: t("topics.other") },
  ];

  // Build labels object
  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    topic: t("topic"),
    selectTopic: t("selectTopic"),
    message: t("message"),
    email: t("email"),
    phone: t("phone"),
    submit: t("submit"),
    success: t("success"),
    error: t("error"),
    note: t("note"),
    subject: t("subject"),
  };

  return (
    <ContactForm
      locale={locale}
      defaultEmail={defaultEmail}
      topics={topics}
      labels={labels}
    />
  );
}


