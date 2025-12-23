// lib/server/logger.ts
type LogContext = Record<string, unknown>;

const formatContext = (context?: LogContext): string =>
  context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : "";

const logInfo = (message: string, context?: LogContext): void => {
  console.info(`[info] ${message}${formatContext(context)}`);
};

const logError = (message: string, context?: LogContext): void => {
  console.error(`[error] ${message}${formatContext(context)}`);
};

export { logInfo, logError };

