"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { clsx } from "clsx";
import { JSX } from "react";
import { CircleHelpIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
};

type TopNavProps = {
  items?: NavItem[];
  helpHref?: string;
  helpLabel?: string;
};

function TopNav({ items, helpHref, helpLabel }: TopNavProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = items ?? [];

  return (
    <nav className="hidden items-center gap-2 lg:flex">
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
      {helpHref ? (
        <button
          onClick={() => router.push(helpHref)}
          aria-label={helpLabel ?? "Help Center"}
          title={helpLabel ?? "Help Center"}
          className="inline-flex items-center justify-center rounded-full bg-white/80 p-2 text-foreground ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <CircleHelpIcon className="size-4" />
        </button>
      ) : null}
    </nav>
  );
}

export type { NavItem, TopNavProps };
export { TopNav };

