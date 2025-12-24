"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { SuperAdminLabels } from "./types";

type ToolbarProps = {
  labels: SuperAdminLabels;
  loading: boolean;
  isPending: boolean;
  message: string | null;
  onRefresh: () => void;
};

function Toolbar({ labels, loading, isPending, message, onRefresh }: ToolbarProps): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <Button size="sm" onClick={onRefresh} disabled={loading || isPending}>
        {loading ? labels.loading : labels.refresh}
      </Button>
      {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
    </div>
  );
}

export { Toolbar };

