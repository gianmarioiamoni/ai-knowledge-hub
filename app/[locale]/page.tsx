import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

type LocalePageProps = {
  params: { locale: string };
};

export default async function LocaleIndexPage({ params }: LocalePageProps): Promise<never> {
  const { locale } = params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  const target = data.user ? `/${locale}/dashboard` : `/${locale}/login`;

  if (process.env.NODE_ENV !== "production") {
    console.info("[locale/page] redirecting", {
      locale,
      hasUser: Boolean(data.user),
      error: error?.message,
      target,
    });
  }

  redirect(target);
}

