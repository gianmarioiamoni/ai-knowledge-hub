"use client";

import { JSX } from "react";

function CommandLauncher(): JSX.Element {
  const openPalette = () => {
    window.dispatchEvent(new Event("open-command-palette"));
  };

  return (
    <button
      onClick={openPalette}
      className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border sm:hidden"
      aria-label="Open command palette"
    >
      ⌘K / Ctrl+K
    </button>
  );
}

export { CommandLauncher };

