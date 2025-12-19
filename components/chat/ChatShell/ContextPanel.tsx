"use client";

import { JSX } from "react";
import type { ContextChunk } from "./types";

type ContextPanelProps = {
  chunks: ContextChunk[];
  title: string;
  emptyLabel: string;
};

function ContextPanel({ chunks, title, emptyLabel }: ContextPanelProps): JSX.Element {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span>{title}</span>
        <span className="text-[11px] text-muted-foreground">
          {chunks.length > 0 ? `${chunks.length} chunks` : emptyLabel}
        </span>
      </div>
      <div className="space-y-3 text-xs text-foreground">
        {chunks.slice(0, 3).map((chunk, idx) => (
          <div key={chunk.id} className="rounded-lg bg-white/70 p-3 ring-1 ring-border">
            <p className="mb-1 font-semibold text-primary">#{idx + 1}</p>
            <p className="whitespace-pre-wrap">
              {chunk.chunk_text?.trim() ? chunk.chunk_text : emptyLabel}
            </p>
          </div>
        ))}
        {chunks.length === 0 ? <p className="text-xs text-muted-foreground">{emptyLabel}</p> : null}
      </div>
    </div>
  );
}

export { ContextPanel };

