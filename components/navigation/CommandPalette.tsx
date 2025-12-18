"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";

type CommandOption = {
  label: string;
  href: string;
  hint?: string;
};

const options: CommandOption[] = [
  { label: "Go to Dashboard", href: "/dashboard" },
  { label: "Open Documents", href: "/documents" },
  { label: "Open Chat", href: "/chat" },
  { label: "Open Procedures", href: "/procedures" },
  { label: "Open Settings", href: "/settings" },
];

function CommandPalette(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const openFromEvent = () => setOpen(true);
    window.addEventListener("keydown", handler);
    window.addEventListener("open-command-palette", openFromEvent as EventListener);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("open-command-palette", openFromEvent as EventListener);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [query]);

  const onSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="border-b border-border px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results</div>
          ) : (
            filtered.map((opt) => (
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
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Press Esc to close · ⌘K / Ctrl+K
        </div>
      </div>
    </div>
  );
}

export { CommandPalette };

