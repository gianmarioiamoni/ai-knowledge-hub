export function getManualUrl(locale: string): string {
  return locale === "it"
    ? "https://raw.githubusercontent.com/gianmarioiamoni/ai-knowledge-hub/main/docs/USER_MANUAL_IT.md"
    : "https://raw.githubusercontent.com/gianmarioiamoni/ai-knowledge-hub/main/docs/USER_MANUAL.md";
}

