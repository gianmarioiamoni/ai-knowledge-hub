import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function POST(request: Request): Promise<NextResponse> {
  const { access_token: accessToken, refresh_token: refreshToken } = (await request.json()) as {
    access_token?: string;
    refresh_token?: string;
  };

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "missing_tokens" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.headers.get("cookie")?.split("; ").find((c) => c.startsWith(`${name}=`))?.split("=")[1];
      },
      set(name: string, value: string, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return response;
}


