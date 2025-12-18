"use client";

import { JSX } from "react";

function CommandHint(): JSX.Element {
  return (
    <span className="hidden items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border sm:inline-flex">
      ⌘K / Ctrl+K
    </span>
  );
}

export { CommandHint };

