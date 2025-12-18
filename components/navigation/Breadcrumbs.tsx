import { JSX } from "react";
import { Link } from "@/i18n/navigation";

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

function Breadcrumbs({ items }: BreadcrumbsProps): JSX.Element {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={`${item.label}-${idx}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="font-medium text-foreground hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
            {!isLast ? <span className="text-muted-foreground">/</span> : null}
          </div>
        );
      })}
    </nav>
  );
}

export type { BreadcrumbsProps, Crumb };
export { Breadcrumbs };

