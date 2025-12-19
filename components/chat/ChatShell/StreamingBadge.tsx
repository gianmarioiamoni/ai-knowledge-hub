"use client";

import { JSX } from "react";

type StreamingBadgeProps = {
  streaming: boolean;
  label: string;
};

function StreamingBadge({ streaming, label }: StreamingBadgeProps): JSX.Element | null {
  if (!streaming) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
      <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-primary/40 border-t-transparent" />
      {label}
    </span>
  );
}

export { StreamingBadge };

