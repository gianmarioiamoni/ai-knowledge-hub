"use client";

import { JSX, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

type ContextChunk = {
  id: string;
  chunk_text: string;
  chunk_metadata?: Record<string, unknown>;
};

type ChatShellProps = {
  locale: string;
  conversations: Conversation[];
  initialConversationId?: string;
  initialMessages: ChatMessage[];
  labels: {
    placeholder: string;
    send: string;
    newChat: string;
    empty: string;
    loading: string;
    retry: string;
    contextTitle: string;
    contextEmpty: string;
    stop: string;
    sending: string;
  };
};

function ChatShell({
  locale,
  conversations,
  initialConversationId,
  initialMessages,
  labels,
}: ChatShellProps): JSX.Element {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextChunks, setContextChunks] = useState<ContextChunk[]>([]);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    setFetchingMessages(true);
    fetch(`/api/chat/messages?conversationId=${conversationId}`)
      .then((res) => res.json())
      .then((data) => setMessages((data.messages as ChatMessage[]) ?? []))
      .catch(() => setMessages([]))
      .finally(() => setFetchingMessages(false));
  }, [conversationId, initialMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => (a.created_at > b.created_at ? -1 : 1)),
    [conversations]
  );

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setStreaming(true);
    setError(null);
    setContextChunks([]);
    try {
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: query,
        created_at: new Date().toISOString(),
      };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() },
      ]);
      setQuery("");
      setLastQuery(query);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch("/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, conversationId }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendToken = (token: string) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const parsed = safeParse(line);
          if (!parsed) continue;
          if (parsed.type === "meta") {
            setConversationId(parsed.conversationId);
            setContextChunks(parsed.chunks ?? []);
          } else if (parsed.type === "token") {
            appendToken(parsed.data ?? "");
          } else if (parsed.type === "done") {
            setStreaming(false);
          } else if (parsed.type === "error") {
            throw new Error(parsed.error ?? "Stream error");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const startNewChat = () => {
    setConversationId(undefined);
    setMessages([]);
    setContextChunks([]);
    setLastQuery(null);
    setStreaming(false);
    abortRef.current?.abort();
    abortRef.current = null;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-border/60 bg-white/70 p-4 backdrop-blur dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Conversations</h3>
          <button
            type="button"
            onClick={startNewChat}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {labels.newChat}
          </button>
        </div>
        {sortedConversations.length === 0 ? (
          <p className="text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="space-y-2">
            {sortedConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setConversationId(c.id)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                  c.id === conversationId ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {c.title || "Conversation"}
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-white/70 p-4 backdrop-blur dark:bg-white/5">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {fetchingMessages ? (
            <p className="text-sm text-muted-foreground">{labels.loading}</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">{labels.empty}</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-4 py-3 text-sm ${
                  m.role === "assistant"
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{m.role}</p>
                <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
          >
            {streaming ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                {labels.sending}
              </span>
            ) : (
              labels.send
            )}
          </button>
          {streaming ? (
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort();
                setStreaming(false);
                setLoading(false);
              }}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              {labels.stop}
            </button>
          ) : null}
          {error && lastQuery ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setQuery(lastQuery);
                void sendMessage(e);
              }}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              {labels.retry}
            </button>
          ) : null}
        </form>
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}

        <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {labels.contextTitle}
          </div>
          {contextChunks.length === 0 ? (
            <p className="text-xs text-muted-foreground">{labels.contextEmpty}</p>
          ) : (
            <div className="space-y-3 text-xs text-foreground">
              {contextChunks.slice(0, 3).map((chunk, idx) => (
                <div key={chunk.id} className="rounded-lg bg-white/70 p-3 ring-1 ring-border">
                  <p className="mb-1 font-semibold text-primary">#{idx + 1}</p>
                  <p className="whitespace-pre-wrap">{chunk.chunk_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type StreamEvent =
  | { type: "meta"; conversationId: string; chunks?: ContextChunk[] }
  | { type: "token"; data?: string }
  | { type: "done" }
  | { type: "error"; error?: string };

const safeParse = (line: string): StreamEvent | null => {
  try {
    return JSON.parse(line) as StreamEvent;
  } catch {
    return null;
  }
};

export { ChatShell };

