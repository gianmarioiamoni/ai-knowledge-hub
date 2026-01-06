// components/navigation/UserProfileLink.tsx
"use client";

import type { JSX } from "react";
import { useRouter } from "@/i18n/navigation";
import { User } from "lucide-react";

type UserProfileLinkProps = {
  userName: string;
  label: string;
};

export function UserProfileLink({ userName, label }: UserProfileLinkProps): JSX.Element {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/profile")}
      className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-all hover:bg-primary/10 hover:ring-primary/20 hover:shadow-sm"
      aria-label={label}
      title={label}
    >
      <User className="size-4" />
      <span className="hidden sm:inline">{userName}</span>
    </button>
  );
}

