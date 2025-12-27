// lib/env.ts
import { z } from "zod";

const envSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),
    OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
    SMTP_HOST: z.string().min(1, "SMTP host is required"),
    SMTP_PORT: z.string().min(1, "SMTP port is required"),
    SMTP_USER: z.string().min(1, "SMTP user is required"),
    SMTP_PASSWORD: z.string().min(1, "SMTP password is required"),
    SMTP_FROM: z.string().min(1, "SMTP from email is required"),
    SUPERADMIN_EMAIL: z.string().email("Super admin email is required"),
    STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),
    STRIPE_PRICE_SMB_MONTHLY: z.string().min(1, "Stripe price id for SMB monthly is required"),
    STRIPE_PRICE_SMB_ANNUAL: z.string().min(1, "Stripe price id for SMB annual is required"),
    STRIPE_PRICE_ENTERPRISE_MONTHLY: z
      .string()
      .min(1, "Stripe price id for Enterprise monthly is required"),
    STRIPE_PRICE_ENTERPRISE_ANNUAL: z.string().min(1, "Stripe price id for Enterprise annual is required"),
    SUPERADMIN_EMAIL: z.string().email().optional(),
    SUPERADMIN_PASSWORD: z.string().min(8).optional(),
    SUPERADMIN_NAME: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const provided = [value.SUPERADMIN_EMAIL, value.SUPERADMIN_PASSWORD, value.SUPERADMIN_NAME].filter(
      (v) => v !== undefined
    ).length;
    if (provided > 0 && provided < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD and SUPERADMIN_NAME must all be set together",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const message = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment variables:\n${message}`);
  }
  return result.data;
};

export const env = parseEnv();

