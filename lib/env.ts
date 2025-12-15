// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase service role key is required"),
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
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

