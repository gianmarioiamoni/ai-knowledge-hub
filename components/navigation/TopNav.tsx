"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { clsx } from "clsx";
import { JSX } from "react";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Documents", href: "/documents" },
  { label: "Chat", href: "/chat" },
  { label: "Procedures", href: "/procedures" },
];

function TopNav(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {navItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition",
              active
                ? "bg-primary text-white shadow-sm"
                : "bg-white/70 text-foreground ring-1 ring-border hover:bg-white"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export { TopNav };

