"use client";

import { JSX } from "react";
import { ChatComposer } from "./ChatShell/ChatComposer";
import { ContextPanel } from "./ChatShell/ContextPanel";
import { ConversationList } from "./ChatShell/ConversationList";
import { MessageList } from "./ChatShell/MessageList";
import { StreamingBadge } from "./ChatShell/StreamingBadge";
import { useChatController } from "./ChatShell/useChatController";
import type { ChatLabels, ChatMessage, Conversation } from "./ChatShell/types";

type ChatShellProps = {
  conversations: Conversation[];
  initialConversationId?: string;
  initialMessages: ChatMessage[];
  labels: ChatLabels;
};

function ChatShell({ conversations, initialConversationId, initialMessages, labels }: ChatShellProps): JSX.Element {
  const {
    state: {
      conversationId,
      conversationList,
      messages,
      query,
      loading,
      streaming,
      error,
      contextChunks,
      fetchingMessages,
      lastQuery,
    },
    actions: {
      setQuery,
      handleSubmit,
      handleStop,
      handleRetry,
      handleSelectConversation,
      startNewChat,
    },
  } = useChatController({
    initialConversationId,
    initialMessages,
    conversations,
    labels,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ConversationList
        conversations={conversationList}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNewChat={startNewChat}
        emptyLabel={labels.empty}
        newChatLabel={labels.newChat}
      />

      <section className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-white/70 p-4 backdrop-blur dark:bg-white/5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span />
          <StreamingBadge streaming={streaming} label={labels.streaming} />
        </div>

        <MessageList
          messages={messages}
          fetching={fetchingMessages}
          loadingLabel={labels.loading}
          emptyLabel={labels.empty}
        />

        <ChatComposer
          query={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          onStop={handleStop}
          onRetry={handleRetry}
          streaming={streaming}
          loading={loading}
          hasLastQuery={Boolean(lastQuery)}
          labels={{
            placeholder: labels.placeholder,
            send: labels.send,
            sending: labels.sending,
            stop: labels.stop,
            retry: labels.retry,
          }}
          error={error}
        />

        <ContextPanel chunks={contextChunks} title={labels.contextTitle} emptyLabel={labels.contextEmpty} />
      </section>
    </div>
  );
}

export { ChatShell };

