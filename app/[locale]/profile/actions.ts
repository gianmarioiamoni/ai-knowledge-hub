"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/server/supabaseUser";
import { createSupabaseServiceClient } from "@/lib/server/supabaseService";

type ActionResult = { error?: string; success?: string };

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password troppo corta"),
    confirm: z.string().min(8, "Password troppo corta"),
  })
  .refine((val) => val.password === val.confirm, {
    message: "Le password non coincidono",
  });

export const changePassword = async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }
  return { success: "updated" };
};

export const deleteAccount = async (): Promise<ActionResult> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user) {
    return { error: "Not authenticated" };
  }

  const service = createSupabaseServiceClient();
  const { error: delError } = await service.auth.admin.deleteUser(user.id);
  if (delError) {
    return { error: delError.message };
  }

  await supabase.auth.signOut();
  redirect("/login");
};

