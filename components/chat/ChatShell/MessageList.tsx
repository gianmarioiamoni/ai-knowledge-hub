"use client";

import { useEffect, useRef } from "react";
import type { JSX } from "react";
import type { ChatMessage } from "./types";

type MessageListProps = {
  messages: ChatMessage[];
  fetching: boolean;
  loadingLabel: string;
  emptyLabel: string;
};

function MessageList({ messages, fetching, loadingLabel, emptyLabel }: MessageListProps): JSX.Element {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto">
      {fetching ? (
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl px-4 py-3 text-sm ${
              m.role === "assistant" ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{m.role}</p>
            <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}

export { MessageList };

