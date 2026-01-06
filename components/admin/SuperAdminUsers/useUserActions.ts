"use client";

import { useRouter } from "next/navigation";
import { enableUser, disableUser, deleteUser } from "@/app/[locale]/admin/users/actions";

export function useUserActions(locale: string) {
  const router = useRouter();

  const handleEnableUser = async (userId: string) => {
    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("userId", userId);
    await enableUser({}, fd);
    router.refresh();
  };

  const handleDisableUser = async (userId: string) => {
    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("userId", userId);
    await disableUser({}, fd);
    router.refresh();
  };

  const handleDeleteUser = async (userId: string) => {
    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("userId", userId);
    await deleteUser({}, fd);
    router.refresh();
  };

  return {
    handleEnableUser,
    handleDisableUser,
    handleDeleteUser,
  };
}


