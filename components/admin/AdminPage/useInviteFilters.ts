"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import type { InviteRow } from "./types";

export function useInviteFilters(invites: InviteRow[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentStatus = searchParams.get("status") ?? "all";
  const filteredInvites =
    currentStatus === "all" ? invites : invites.filter((i) => i.status === currentStatus);

  const handleStatusChange = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") next.delete("status");
    else next.set("status", value);
    router.replace(`${pathname}?${next.toString()}`);
  };

  return {
    currentStatus,
    filteredInvites,
    handleStatusChange,
  };
}


