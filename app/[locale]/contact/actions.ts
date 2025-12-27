"use server";

import { z } from "zod";
import { sendContactEmails } from "@/lib/server/email";

type ActionState = { error?: string; success?: string };

const contactSchema = z.object({
  topic: z.enum(["technical", "commercial", "billing", "other"]),
  title: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
  email: z.string().email(),
  phone: z.string().min(6).max(30).optional().or(z.literal("")),
  locale: z.string().min(2).max(5),
});

const submitContact = async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
  const parsed = contactSchema.safeParse({
    topic: formData.get("topic"),
    title: formData.get("title"),
    message: formData.get("message"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await sendContactEmails({
      ...parsed.data,
      phone: parsed.data.phone || null,
    });
    return { success: "sent" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return { error: message };
  }
};

export { submitContact };


