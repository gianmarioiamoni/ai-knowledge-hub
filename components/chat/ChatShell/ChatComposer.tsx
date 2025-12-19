"use client";

import { JSX } from "react";

type ChatComposerProps = {
  query: string;
  onChange: (value: string) => void;
  onSubmit: (event?: React.FormEvent) => void;
  onStop: () => void;
  onRetry: () => void;
  streaming: boolean;
  loading: boolean;
  hasLastQuery: boolean;
  labels: {
    placeholder: string;
    send: string;
    sending: string;
    stop: string;
    retry: string;
  };
  error?: string | null;
};

function ChatComposer({
  query,
  onChange,
  onSubmit,
  onStop,
  onRetry,
  streaming,
  loading,
  hasLastQuery,
  labels,
  error,
}: ChatComposerProps): JSX.Element {
  return (
    <>
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
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
            onClick={onStop}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            {labels.stop}
          </button>
        ) : null}
        {error && hasLastQuery ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRetry();
            }}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            {labels.retry}
          </button>
        ) : null}
      </form>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </>
  );
}

export { ChatComposer };

