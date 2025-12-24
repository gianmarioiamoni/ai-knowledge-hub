// lib/server/auth.ts
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabaseUser";

const getSessionUser = async (): Promise<User | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
};

const requireSessionUser = async (): Promise<User> => {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};

const isSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  const metaRole = (user.user_metadata as { role?: string } | null)?.role;
  const appRole = (user.app_metadata as { role?: string } | null)?.role;
  return metaRole === "SUPER_ADMIN" || appRole === "SUPER_ADMIN";
};

export { getSessionUser, requireSessionUser, isSuperAdmin };


