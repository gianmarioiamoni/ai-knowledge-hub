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

export { getSessionUser, requireSessionUser };


