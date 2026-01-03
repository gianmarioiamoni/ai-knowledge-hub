import type { DocumentRow } from "./types";

export function getDisplayName(doc: DocumentRow): string | undefined {
  const metadata = doc.metadata ?? {};
  const name = (metadata as { originalName?: string }).originalName;
  return name;
}

export function formatDate(value: string | null, locale: string): string {
  if (!value) return "–";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

