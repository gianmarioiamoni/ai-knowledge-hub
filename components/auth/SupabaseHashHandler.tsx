// components/auth/SupabaseHashHandler.tsx
"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

type SupabaseHashHandlerProps = {
  redirectTo: string;
};

function SupabaseHashHandler({ redirectTo }: SupabaseHashHandlerProps): null {
  useEffect(() => {
    const hash = window.location.hash;
    // Supabase magic link and password reset deliver tokens in the URL fragment
    if (!hash || !hash.includes("access_token") || !hash.includes("refresh_token")) {
      return;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      return;
    }

    void supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error }) => {
        if (!error) {
          window.location.replace(redirectTo);
        }
      })
      .catch(() => {
        // silently ignore; user will stay on login page
      });
  }, [redirectTo]);

  return null;
}

export { SupabaseHashHandler };

