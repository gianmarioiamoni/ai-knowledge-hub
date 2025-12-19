"use client";

import { JSX } from "react";
import type { CommandOption } from "./types";

type CommandListProps = {
  options: CommandOption[];
  onSelect: (href: string) => void;
  labels: {
    noResults: string;
  };
};

function CommandList({ options, onSelect, labels }: CommandListProps): JSX.Element {
  return (
    <div className="max-h-64 overflow-y-auto">
      {options.length === 0 ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">{labels.noResults}</div>
      ) : (
        options.map((opt) => (
          <button
            key={opt.href}
            onClick={() => onSelect(opt.href)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground hover:bg-muted"
          >
            <span>{opt.label}</span>
            {opt.hint ? <span className="text-xs text-muted-foreground">{opt.hint}</span> : null}
          </button>
        ))
      )}
    </div>
  );
}

export { CommandList };

