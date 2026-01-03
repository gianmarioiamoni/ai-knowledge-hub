import type { OrgRow } from "./types";

export function getOrgName(orgId: string, orgs: OrgRow[]): string {
  return orgs.find((o) => o.id === orgId)?.name ?? orgId;
}

