// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { routing } from "@/i18n/routing";

type AuthFormState = {
  error?: string;
};

const credentialsSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password minima 6 caratteri"),
});

const getPreferredLocale = async (): Promise<string> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  return routing.locales.includes(cookieLocale ?? "") ? (cookieLocale as string) : routing.defaultLocale;
};

export async function signInWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dati non validi" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const locale = await getPreferredLocale();
  redirect(`/${locale}/dashboard`);
}

export async function signUpWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dati non validi" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const locale = await getPreferredLocale();
  redirect(`/${locale}/dashboard`);
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url ?? "/login");
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  const locale = await getPreferredLocale();
  redirect(`/${locale}/login`);
}

