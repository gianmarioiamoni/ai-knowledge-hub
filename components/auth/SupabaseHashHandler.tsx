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

    void supabase.auth
      .getSessionFromUrl({ storeSession: true })
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

