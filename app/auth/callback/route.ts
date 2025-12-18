import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { routing } from "@/i18n/routing";

const createResponseSupabaseClient = (
  request: NextRequest,
  response: NextResponse
) =>
  createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieLocale = request.cookies.get("preferred_locale")?.value;
  const locale = routing.locales.includes(cookieLocale ?? "") ? (cookieLocale as string) : routing.defaultLocale;
  const next = requestUrl.searchParams.get("next") ?? `/${locale}/dashboard`;

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  const supabase = createResponseSupabaseClient(request, response);

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}

