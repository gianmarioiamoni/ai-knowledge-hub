import type { BadgeProps } from "@/components/ui/badge";

/**
 * Returns the appropriate badge variant for a plan ID
 */
export function getPlanBadgeVariant(planId: string): BadgeProps["variant"] {
  switch (planId) {
    case "demo":
      return "secondary";
    case "trial":
      return "outline";
    case "smb":
    case "enterprise":
      return "default";
    default:
      return "outline";
  }
}

/**
 * Formats the delete organization warning message with member count
 */
export function formatDeleteOrgWarning(template: string, memberCount: number): string {
  return template.replace("{count}", String(memberCount));
}

/**
 * Gets the display text for a user (email or fallback to user_id)
 */
export function getUserDisplayName(email: string | null, userId: string): string {
  return email ?? userId;
}

