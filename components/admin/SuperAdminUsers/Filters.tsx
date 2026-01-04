"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import type { OrgRow, SuperAdminLabels } from "./types";
import { SearchFilter } from "./Filters/SearchFilter";
import { FilterDropdown } from "./Filters/FilterDropdown";
import {
  getCompanyLabel,
  getStatusLabel,
  getPlanLabel,
  getRoleLabel,
  getDemoLabel,
} from "./Filters/helpers";

type FiltersProps = {
  labels: SuperAdminLabels;
  orgs: OrgRow[];
  selectedCompany: string;
  selectedStatus: string;
  selectedPlan: string;
  selectedRole: string;
  showDemoOnly: boolean;
  searchQuery: string;
  onCompanyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onShowDemoChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function Filters({
  labels,
  orgs,
  selectedCompany,
  selectedStatus,
  selectedPlan,
  selectedRole,
  showDemoOnly,
  searchQuery,
  onCompanyChange,
  onStatusChange,
  onPlanChange,
  onRoleChange,
  onShowDemoChange,
  onSearchChange,
}: FiltersProps): JSX.Element {
  // Company dropdown options
  const companyOptions = [
    { value: "all", label: labels.filters.all },
    ...orgs.map((org) => ({ value: org.id, label: org.name })),
  ];

  // Status dropdown options
  const statusOptions = [
    { value: "all", label: labels.filters.all },
    { value: "active", label: labels.status.active },
    { value: "disabled", label: labels.status.disabled },
  ];

  // Plan dropdown options
  const planOptions = [
    { value: "all", label: labels.filters.all },
    { value: "demo", label: labels.plans.demo },
    { value: "trial", label: labels.plans.trial },
    { value: "smb", label: labels.plans.smb },
    { value: "enterprise", label: labels.plans.enterprise },
    { value: "expired", label: labels.plans.expired },
  ];

  // Role dropdown options
  const roleOptions = [
    { value: "all", label: labels.filters.all },
    { value: "COMPANY_ADMIN", label: "Company Admin" },
    { value: "CONTRIBUTOR", label: "Contributor" },
    { value: "VIEWER", label: "Viewer" },
  ];

  // Demo users dropdown options
  const demoOptions = [
    { value: "all", label: labels.filters.all },
    { value: "demo", label: "Demo Users" },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SearchFilter
          label={labels.filters.search}
          value={searchQuery}
          onChange={onSearchChange}
        />

        <FilterDropdown
          label={labels.filters.company}
          currentLabel={getCompanyLabel(selectedCompany, orgs, labels.filters.all)}
          options={companyOptions}
          onSelect={onCompanyChange}
        />

        <FilterDropdown
          label={labels.filters.status}
          currentLabel={getStatusLabel(selectedStatus, {
            all: labels.filters.all,
            active: labels.status.active,
            disabled: labels.status.disabled,
          })}
          options={statusOptions}
          onSelect={onStatusChange}
        />

        <FilterDropdown
          label={labels.filters.plan}
          currentLabel={getPlanLabel(selectedPlan, labels.plans, labels.filters.all)}
          options={planOptions}
          onSelect={onPlanChange}
        />

        <FilterDropdown
          label={labels.filters.role}
          currentLabel={getRoleLabel(selectedRole, labels.filters.all)}
          options={roleOptions}
          onSelect={onRoleChange}
        />

        <FilterDropdown
          label={labels.filters.showDemo}
          currentLabel={getDemoLabel(showDemoOnly, labels.filters.all)}
          options={demoOptions}
          onSelect={onShowDemoChange}
        />
      </div>
    </Card>
  );
}


