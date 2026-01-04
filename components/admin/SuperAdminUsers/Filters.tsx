"use client";

import type { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown } from "lucide-react";
import type { OrgRow, SuperAdminLabels } from "./types";

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
  const getCompanyLabel = (): string => {
    if (selectedCompany === "all") return labels.filters.all;
    const org = orgs.find((o) => o.id === selectedCompany);
    return org?.name ?? labels.filters.all;
  };

  const getStatusLabel = (): string => {
    if (selectedStatus === "all") return labels.filters.all;
    return selectedStatus === "active" ? labels.status.active : labels.status.disabled;
  };

  const getPlanLabel = (): string => {
    if (selectedPlan === "all") return labels.filters.all;
    return labels.plans[selectedPlan as keyof typeof labels.plans] ?? selectedPlan;
  };

  const getRoleLabel = (): string => {
    if (selectedRole === "all") return labels.filters.all;
    return selectedRole.replace("_", " ");
  };

  const getDemoLabel = (): string => {
    return showDemoOnly ? "Demo Users" : labels.filters.all;
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Search */}
        <div className="space-y-1">
          <Label htmlFor="search" className="text-xs text-muted-foreground">
            {labels.filters.search}
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{labels.filters.company}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {getCompanyLabel()}
                <ChevronDown className="ml-2 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => onCompanyChange("all")}>
                {labels.filters.all}
              </DropdownMenuItem>
              {orgs.map((org) => (
                <DropdownMenuItem key={org.id} onClick={() => onCompanyChange(org.id)}>
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{labels.filters.status}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {getStatusLabel()}
                <ChevronDown className="ml-2 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => onStatusChange("all")}>
                {labels.filters.all}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("active")}>
                {labels.status.active}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("disabled")}>
                {labels.status.disabled}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Plan */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{labels.filters.plan}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {getPlanLabel()}
                <ChevronDown className="ml-2 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => onPlanChange("all")}>
                {labels.filters.all}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanChange("demo")}>
                {labels.plans.demo}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanChange("trial")}>
                {labels.plans.trial}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanChange("smb")}>
                {labels.plans.smb}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanChange("enterprise")}>
                {labels.plans.enterprise}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanChange("expired")}>
                {labels.plans.expired}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Role */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{labels.filters.role}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {getRoleLabel()}
                <ChevronDown className="ml-2 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => onRoleChange("all")}>
                {labels.filters.all}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("COMPANY_ADMIN")}>
                Company Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("CONTRIBUTOR")}>
                Contributor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("VIEWER")}>
                Viewer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Demo Users */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{labels.filters.showDemo}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {getDemoLabel()}
                <ChevronDown className="ml-2 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => onShowDemoChange("all")}>
                {labels.filters.all}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShowDemoChange("demo")}>
                Demo Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

