// lib/server/supabaseUser.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";

const mapCookies = (allowWrite: boolean) => ({
  get: async (name: string) => {
    const store = await cookies();
    return store.get(name)?.value;
  },
  set: async (name: string, value: string, options: CookieOptions) => {
    if (!allowWrite) return;
    try {
      const store = await cookies();
      store.set({
        name,
        value,
        ...options,
      });
    } catch {
      // ignore when not in a writable context (e.g., RSC)
    }
  },
  remove: async (name: string, options: CookieOptions) => {
    if (!allowWrite) return;
    try {
      const store = await cookies();
      store.set({
        name,
        value: "",
        ...options,
        maxAge: 0,
      });
    } catch {
      // ignore when not in a writable context (e.g., RSC)
    }
  },
});

const createSupabaseServerClient = (allowCookieWrite = true) =>
  createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: mapCookies(allowCookieWrite),
    }
  );

export { createSupabaseServerClient };


