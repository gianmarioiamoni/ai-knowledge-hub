// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { sendAdminNewUser } from "@/lib/server/email";
import { routing } from "@/i18n/routing";

type AuthFormState = {
  error?: string;
  success?: string;
};

const signInSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password minima 6 caratteri"),
});

const signUpSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password minima 6 caratteri"),
  organization: z.string().min(2, "Nome azienda richiesto"),
});

const getPreferredLocale = async (): Promise<(typeof routing.locales)[number]> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  const candidate = cookieLocale ?? "";
  return routing.locales.includes(candidate as (typeof routing.locales)[number])
    ? (candidate as (typeof routing.locales)[number])
    : routing.defaultLocale;
};

export async function signInWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes("banned") || lowered.includes("disable")) {
      return { error: "Account disabilitato. Contatta l'amministratore." };
    }
    return { error: error.message };
  }

  const locale = await getPreferredLocale();
  redirect(`/${locale}/dashboard`);
}

export async function signUpWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    organization: formData.get("organization"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        organization_name: parsed.data.organization,
        role: "COMPANY_ADMIN",
        plan: {
          id: "trial",
          billingCycle: "monthly",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          renewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          reminder3DaysSent: false,
          reminder1DaySent: false,
        },
      },
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/login`
        : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user?.email) {
    await Promise.all([
      sendAdminNewUser(data.user.email).catch(() => {}),
      supabase.auth.updateUser({
        data: { ...(data.user.user_metadata ?? {}), adminNotified: true },
      }),
    ]);
  }

  return { success: "check_email" };
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

