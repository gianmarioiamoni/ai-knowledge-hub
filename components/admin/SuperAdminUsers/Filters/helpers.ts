import type { OrgRow, SuperAdminLabels } from "../types";

/**
 * Gets the display label for company filter
 */
export function getCompanyLabel(
  selectedCompany: string,
  orgs: OrgRow[],
  allLabel: string
): string {
  if (selectedCompany === "all") return allLabel;
  const org = orgs.find((o) => o.id === selectedCompany);
  return org?.name ?? allLabel;
}

/**
 * Gets the display label for status filter
 */
export function getStatusLabel(
  selectedStatus: string,
  labels: { all: string; active: string; disabled: string }
): string {
  if (selectedStatus === "all") return labels.all;
  return selectedStatus === "active" ? labels.active : labels.disabled;
}

/**
 * Gets the display label for plan filter
 */
export function getPlanLabel(
  selectedPlan: string,
  plans: Record<string, string>,
  allLabel: string
): string {
  if (selectedPlan === "all") return allLabel;
  return plans[selectedPlan as keyof typeof plans] ?? selectedPlan;
}

/**
 * Gets the display label for role filter
 */
export function getRoleLabel(selectedRole: string, allLabel: string): string {
  if (selectedRole === "all") return allLabel;
  return selectedRole.replace("_", " ");
}

/**
 * Gets the display label for demo users filter
 */
export function getDemoLabel(showDemoOnly: boolean, allLabel: string): string {
  return showDemoOnly ? "Demo Users" : allLabel;
}

