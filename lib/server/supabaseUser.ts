// lib/server/supabaseUser.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";

/**
 * Suppresses innocuous Supabase auth errors in development logs.
 * These errors occur when:
 * - User visits public pages (not authenticated)
 * - Session/refresh token is expired or missing
 * - Supabase tries to auto-refresh but finds no token
 * 
 * The errors are safe to ignore as they don't affect functionality.
 */
function suppressAuthErrorLogs() {
  if (process.env.NODE_ENV === "development") {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      // Suppress specific Supabase auth errors that are expected
      const message = String(args[0] || "");
      if (
        message.includes("Invalid Refresh Token") ||
        message.includes("Refresh Token Not Found") ||
        message.includes("refresh_token_not_found")
      ) {
        // Silently ignore - this is expected behavior for public pages
        return;
      }
      // Log all other errors normally
      originalError.apply(console, args);
    };
  }
}

// Suppress auth error logs on module load
suppressAuthErrorLogs();

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


