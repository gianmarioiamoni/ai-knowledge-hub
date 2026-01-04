"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatLabels, ChatMessage, ContextChunk, Conversation } from "./types";

type UseChatControllerParams = {
  initialConversationId?: string;
  initialMessages: ChatMessage[];
  conversations: Conversation[];
  labels: ChatLabels;
};

type StreamEvent =
  | { type: "meta"; conversationId: string; chunks?: ContextChunk[] }
  | { type: "token"; data?: string }
  | { type: "done" }
  | { type: "error"; error?: string };

export const useChatController = ({
  initialConversationId,
  initialMessages,
  conversations,
  labels,
}: UseChatControllerParams) => {
  const [conversationList, setConversationList] = useState<Conversation[]>(conversations);
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

  const sortedConversations = useMemo(
    () => [...conversationList].sort((a, b) => (a.created_at > b.created_at ? -1 : 1)),
    [conversationList]
  );

  useEffect(() => {
    if (!conversationId) return;
    setFetchingMessages(true);
    fetch(`/api/chat/messages?conversationId=${conversationId}`)
      .then((res) => res.json())
      .then((data) => setMessages((data.messages as ChatMessage[]) ?? []))
      .catch(() => setMessages([]))
      .finally(() => setFetchingMessages(false));
  }, [conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const safeParse = (line: string): StreamEvent | null => {
    try {
      return JSON.parse(line) as StreamEvent;
    } catch {
      return null;
    }
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setContextChunks([]);
    setError(null);
    setStreaming(false);
    abortRef.current?.abort();
    abortRef.current = null;
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

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setLoading(false);
  };

  const sendQuery = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setStreaming(true);
    setError(null);
    setContextChunks([]);
    setLastQuery(text);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() },
    ]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, conversationId }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Request failed");
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
            setConversationList((prev) => {
              const exists = prev.some((c) => c.id === parsed.conversationId);
              if (exists) return prev;
              return [
                ...prev,
                {
                  id: parsed.conversationId,
                  title: text.slice(0, 80) || "Conversation",
                  created_at: new Date().toISOString(),
                },
              ];
            });
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

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = query.trim();
    if (!text) return;
    setQuery("");
    await sendQuery(text);
  };

  const handleRetry = async () => {
    if (!lastQuery) return;
    setQuery(lastQuery);
    await sendQuery(lastQuery);
  };

  return {
    state: {
      conversationId,
      conversationList: sortedConversations,
      messages,
      query,
      loading,
      streaming,
      error,
      contextChunks,
      fetchingMessages,
      lastQuery,
      labels,
      messagesEndRef,
    },
    actions: {
      setQuery,
      handleSubmit,
      handleStop,
      handleRetry,
      handleSelectConversation,
      startNewChat,
    },
  };
};

