"use client";

import type { JSX } from "react";
import type { OrgRow, MemberRow, SuperAdminLabels } from "./types";
import { useOrgActions } from "./useOrgActions";
import { useUserActions } from "./useUserActions";
import { useFilters } from "./useFilters";
import { CompanyGroupView } from "./CompanyGroupView";
import { Filters } from "./Filters";
import { PageHeader } from "@/components/common/PageHeader";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type SuperAdminUsersPageProps = {
  locale: string;
  orgs: OrgRow[];
  members: MemberRow[];
  labels: SuperAdminLabels;
};

export function SuperAdminUsersPage({
  locale,
  orgs,
  members,
  labels,
}: SuperAdminUsersPageProps): JSX.Element {
  const { handleEnableOrg, handleDisableOrg, handleDeleteOrg } = useOrgActions(locale);
  const { handleEnableUser, handleDisableUser, handleDeleteUser } = useUserActions(locale);

  const {
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
  } = useFilters(orgs, members);

  return (
    <div className={LAYOUT_CLASSES.pageContainerWide}>
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        description={labels.description}
        showLogout
        logoutLabel={labels.logout}
      />

      <Filters
        labels={labels}
        orgs={orgs}
        selectedCompany={selectedCompany}
        selectedStatus={selectedStatus}
        selectedPlan={selectedPlan}
        selectedRole={selectedRole}
        showDemoOnly={showDemoOnly}
        searchQuery={searchQuery}
        onCompanyChange={setSelectedCompany}
        onStatusChange={setSelectedStatus}
        onPlanChange={setSelectedPlan}
        onRoleChange={setSelectedRole}
        onShowDemoChange={(value) => setShowDemoOnly(value === "demo")}
        onSearchChange={setSearchQuery}
      />

      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          filteredGroups.map((group) => (
            <CompanyGroupView
              key={group.org.id}
              group={group}
              labels={labels}
              onEnableOrg={handleEnableOrg}
              onDisableOrg={handleDisableOrg}
              onDeleteOrg={handleDeleteOrg}
              onEnableUser={handleEnableUser}
              onDisableUser={handleDisableUser}
              onDeleteUser={handleDeleteUser}
            />
          ))
        )}
      </div>
    </div>
  );
}

