"use client";

import { useRouter } from "next/navigation";
import { enableOrg, disableOrg, deleteOrg } from "@/app/[locale]/admin/users/actions";

export function useOrgActions(locale: string) {
  const router = useRouter();

  const handleEnableOrg = async (orgId: string) => {
    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("orgId", orgId);
    await enableOrg({}, fd);
    router.refresh();
  };

  const handleDisableOrg = async (orgId: string) => {
    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("orgId", orgId);
    await disableOrg({}, fd);
    router.refresh();
  };

  const handleDeleteOrg = async (orgId: string) => {
    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("orgId", orgId);
    await deleteOrg({}, fd);
    router.refresh();
  };

  return {
    handleEnableOrg,
    handleDisableOrg,
    handleDeleteOrg,
  };
}

