"use client";

import { useState, useMemo } from "react";
import type { OrgRow, MemberRow, CompanyGroup } from "./types";

type UseFiltersResult = {
  selectedCompany: string;
  selectedStatus: string;
  selectedPlan: string;
  selectedRole: string;
  showDemoOnly: boolean;
  searchQuery: string;
  filteredGroups: CompanyGroup[];
  setSelectedCompany: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setSelectedPlan: (value: string) => void;
  setSelectedRole: (value: string) => void;
  setShowDemoOnly: (value: boolean) => void;
  setSearchQuery: (value: string) => void;
};

export function useFilters(orgs: OrgRow[], members: MemberRow[]): UseFiltersResult {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showDemoOnly, setShowDemoOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredGroups = useMemo(() => {
    // Group members by organization
    const groupsMap = new Map<string, CompanyGroup>();

    for (const org of orgs) {
      groupsMap.set(org.id, {
        org,
        members: [],
      });
    }

    for (const member of members) {
      const group = groupsMap.get(member.organization_id);
      if (group) {
        group.members.push(member);
      }
    }

    // Convert to array and apply filters
    let groups = Array.from(groupsMap.values());

    // Filter by company
    if (selectedCompany !== "all") {
      groups = groups.filter((g) => g.org.id === selectedCompany);
    }

    // Filter by plan
    if (selectedPlan !== "all") {
      groups = groups.filter((g) => g.org.plan_id === selectedPlan);
    }

    // Filter by status (org level)
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        groups = groups.filter((g) => !g.org.disabled);
      } else if (selectedStatus === "disabled") {
        groups = groups.filter((g) => g.org.disabled);
      }
    }

    // Filter members within each group
    groups = groups.map((group) => {
      let filteredMembers = group.members;

      // Filter by role
      if (selectedRole !== "all") {
        filteredMembers = filteredMembers.filter((m) => m.role === selectedRole);
      }

      // Filter by demo users
      if (showDemoOnly) {
        filteredMembers = filteredMembers.filter((m) => m.is_demo_user);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredMembers = filteredMembers.filter((m) =>
          m.email?.toLowerCase().includes(query)
        );
      }

      return {
        ...group,
        members: filteredMembers,
      };
    });

    // Remove groups with no members after filtering (unless filtering by company specifically)
    if (selectedCompany === "all" && (selectedRole !== "all" || showDemoOnly || searchQuery.trim())) {
      groups = groups.filter((g) => g.members.length > 0);
    }

    return groups;
  }, [orgs, members, selectedCompany, selectedStatus, selectedPlan, selectedRole, showDemoOnly, searchQuery]);

  return {
    selectedCompany,
    selectedStatus,
    selectedPlan,
    selectedRole,
    showDemoOnly,
    searchQuery,
    filteredGroups,
    setSelectedCompany,
    setSelectedStatus,
    setSelectedPlan,
    setSelectedRole,
    setShowDemoOnly,
    setSearchQuery,
  };
}

