"use client";

import { JSX } from "react";
import type { Conversation } from "./types";

type ConversationListProps = {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  emptyLabel: string;
  newChatLabel: string;
};

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  emptyLabel,
  newChatLabel,
}: ConversationListProps): JSX.Element {
  return (
    <aside className="rounded-2xl border border-border/60 bg-white/70 p-4 backdrop-blur dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Conversations</h3>
        <button
          type="button"
          onClick={onNewChat}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {newChatLabel}
        </button>
      </div>
      {conversations.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                c.id === activeId ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {c.title || "Conversation"}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export { ConversationList };

