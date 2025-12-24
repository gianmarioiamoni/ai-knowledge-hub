"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { clsx } from "clsx";
import { JSX } from "react";

type NavItem = {
  label: string;
  href: string;
};

type TopNavProps = {
  items?: NavItem[];
};

function TopNav({ items }: TopNavProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = items ?? [];

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

export type { NavItem, TopNavProps };
export { TopNav };

