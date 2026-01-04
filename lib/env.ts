// lib/env.ts
import { z } from "zod";

const envSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),
    OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    GMAIL_USER: z.string().email().optional(),
    GMAIL_APP_PASSWORD: z.string().optional(),
    ADMIN_EMAIL: z.string().email().optional(),
    CRON_SECRET: z.string().optional(),
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
    DEMO_USER_EMAIL: z.string().email().optional(),
    DEMO_USER_PASSWORD: z.string().min(8).optional(),
    DEMO_USER_NAME: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const hasGmail = Boolean(value.GMAIL_USER && value.GMAIL_APP_PASSWORD);
    const smtpFields = [value.SMTP_HOST, value.SMTP_PORT, value.SMTP_USER, value.SMTP_PASSWORD, value.SMTP_FROM];
    const hasSmtp = smtpFields.every((v) => Boolean(v));

    if (!hasGmail && !hasSmtp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either Gmail credentials (GMAIL_USER + GMAIL_APP_PASSWORD) or SMTP_* settings",
      });
    }
    if (!value.ADMIN_EMAIL && !value.SUPERADMIN_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ADMIN_EMAIL or SUPERADMIN_EMAIL is required for notifications",
      });
    }

    const provided = [value.SUPERADMIN_EMAIL, value.SUPERADMIN_PASSWORD, value.SUPERADMIN_NAME].filter(
      (v) => v !== undefined
    ).length;
    if (provided > 0 && provided < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD and SUPERADMIN_NAME must all be set together",
      });
    }

    const demoProvided = [value.DEMO_USER_EMAIL, value.DEMO_USER_PASSWORD, value.DEMO_USER_NAME].filter(
      (v) => v !== undefined
    ).length;
    if (demoProvided > 0 && demoProvided < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DEMO_USER_EMAIL, DEMO_USER_PASSWORD and DEMO_USER_NAME must all be set together or all omitted",
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

