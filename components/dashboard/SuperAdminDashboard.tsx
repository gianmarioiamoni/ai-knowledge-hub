"use client";

import type { JSX } from "react";
import { HeaderBar } from "./HeaderBar";
import { SuperAdminPanel } from "@/components/admin/SuperAdminPanel";
import { BackgroundGradient } from "./BackgroundGradient";
import type { SuperAdminLabels } from "./types";
import { LAYOUT_CLASSES } from "@/lib/styles/layout";

type SuperAdminDashboardProps = {
  title: string;
  greetingPrefix: string;
  email: string;
  profileTooltip: string;
  adminLabels: SuperAdminLabels;
};

export function SuperAdminDashboard({
  title,
  greetingPrefix,
  email,
  profileTooltip,
  adminLabels,
}: SuperAdminDashboardProps): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden py-12">
      <BackgroundGradient />
      <div className={`relative mx-auto flex w-full max-w-6xl flex-col gap-8 ${LAYOUT_CLASSES.horizontalPadding}`}>
        <HeaderBar
          title={title}
          headlinePrefix={greetingPrefix}
          headlineLinkLabel={email}
          headlineHref="/profile"
          headlineTooltip={profileTooltip}
        />
        <SuperAdminPanel labels={adminLabels} />
      </div>
    </div>
  );
}

