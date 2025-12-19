"use client";

import { JSX } from "react";
import { CommandList } from "./CommandPalette/CommandList";
import { useCommandPalette } from "./CommandPalette/useCommandPalette";
import type { CommandPaletteLabels } from "./CommandPalette/types";

const labels: CommandPaletteLabels = {
  placeholder: "Search or jump to…",
  noResults: "No results",
  closeHint: "Press Esc to close · ⌘K / Ctrl+K",
};

function CommandPalette(): JSX.Element | null {
  const { open, setOpen, query, setQuery, filtered, onSelect } = useCommandPalette({});

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
              }
            }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted"
            aria-label="Close command palette"
          >
            ✕
          </button>
        </div>
        <CommandList options={filtered} onSelect={onSelect} labels={{ noResults: labels.noResults }} />
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{labels.closeHint}</div>
      </div>
    </div>
  );
}

export { CommandPalette };

