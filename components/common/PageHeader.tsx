import { JSX } from "react";
import { LogoutButton } from "./LogoutButton";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  showLogout?: boolean;
  logoutLabel?: string;
  rightSlot?: JSX.Element;
};

export function PageHeader({
  title,
  subtitle,
  description,
  showLogout = false,
  logoutLabel = "Logout",
  rightSlot,
}: PageHeaderProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {title}
        </p>
        {subtitle && (
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{subtitle}</h1>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        {rightSlot}
        {showLogout && <LogoutButton label={logoutLabel} variant="outline" />}
      </div>
    </div>
  );
}

