// lib/server/supabaseUser.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";

const mapCookies = () => ({
  get: async (name: string) => {
    const store = await cookies();
    return store.get(name)?.value;
  },
  set: async (name: string, value: string, options: CookieOptions) => {
    const store = await cookies();
    store.set({
      name,
      value,
      ...options,
    });
  },
  remove: async (name: string, options: CookieOptions) => {
    const store = await cookies();
    store.set({
      name,
      value: "",
      ...options,
      maxAge: 0,
    });
  },
});

const createSupabaseServerClient = () =>
  createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: mapCookies(),
    }
  );

export { createSupabaseServerClient };


