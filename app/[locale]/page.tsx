import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

export const dynamic = "force-dynamic";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleIndexPage({ params }: LocalePageProps): Promise<never> {
  const { locale } = await params;
  const supabase = createSupabaseServerClient(false);
  const { data, error } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/${locale}/login`);
  }

  // Check if Super Admin
  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  const target = role === "SUPER_ADMIN" ? `/${locale}/admin/users` : `/${locale}/dashboard`;

  redirect(target);
}

