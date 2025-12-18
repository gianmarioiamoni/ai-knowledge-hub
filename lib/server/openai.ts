// lib/server/openai.ts
import OpenAI from "openai";
import { env } from "../env";

const createOpenAIClient = (): OpenAI => new OpenAI({ apiKey: env.OPENAI_API_KEY });

export { createOpenAIClient };

