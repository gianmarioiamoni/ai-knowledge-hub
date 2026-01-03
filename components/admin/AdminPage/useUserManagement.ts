"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  changeUserRole,
  deleteUserMembership,
  enableUser,
  suspendUser,
} from "@/app/[locale]/admin/actions";
import type { UserRow, AdminLabels } from "./types";

export function useUserManagement({
  initialUsers,
  locale,
  labels,
}: {
  initialUsers: UserRow[];
  locale: string;
  labels: AdminLabels;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Optimistic update
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    formData.append("role", newRole);
    const result = await changeUserRole({}, formData);

    if (result?.error) {
      toast.error(result.error);
      setUsers(initialUsers);
    } else if (result?.success) {
      toast.success(labels.changeRole);
    }
  };

  const handleToggleDisabled = async (userId: string, currentDisabled: boolean) => {
    // Optimistic update
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, disabled: !currentDisabled } : u))
    );

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    const action = currentDisabled ? enableUser : suspendUser;
    const result = await action({}, formData);

    if (result?.error) {
      toast.error(result.error);
      setUsers(initialUsers);
    } else if (result?.success) {
      const label = currentDisabled ? labels.enable : labels.suspend;
      toast.success(label);
      router.refresh();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("userId", userId);
    const result = await deleteUserMembership({}, formData);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      toast.success(labels.deleteUser);
      router.refresh();
    }
  };

  return {
    users,
    handleRoleChange,
    handleToggleDisabled,
    handleDeleteUser,
  };
}

