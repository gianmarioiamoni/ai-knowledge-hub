import type { AdminLabels } from "./types";

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().replace("T", " ").slice(0, 16);
}

export function getRoleLabel(role: string | null, labels: AdminLabels): string {
  if (role === "COMPANY_ADMIN") return labels.roles.COMPANY_ADMIN;
  if (role === "VIEWER") return labels.roles.VIEWER;
  return labels.roles.CONTRIBUTOR;
}

