"use client";

import { JSX } from "react";

function CommandHint(): JSX.Element {
  const openPalette = () => {
    window.dispatchEvent(new Event("open-command-palette"));
  };

  return (
    <button
      type="button"
      onClick={openPalette}
      className="hidden items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border transition hover:bg-white sm:inline-flex"
      aria-label="Open command palette"
    >
      ⌘K / Ctrl+K
    </button>
  );
}

export { CommandHint };

