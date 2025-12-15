import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";

export default async function Home(): Promise<never> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
