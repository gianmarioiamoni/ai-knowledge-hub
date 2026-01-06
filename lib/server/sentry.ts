// lib/server/sentry.ts
import * as Sentry from "@sentry/node";

let initialized = false;

const initSentry = (): void => {
  if (initialized || !process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV ?? "development",
  });
  initialized = true;
};

const captureException = (error: unknown, context?: Record<string, unknown>): void => {
  if (!process.env.SENTRY_DSN) return;
  initSentry();
  if (!initialized) return;
  Sentry.captureException(error, { extra: context });
};

export { captureException };




