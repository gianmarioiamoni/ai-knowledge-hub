"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { CommandOption } from "./types";
import { defaultOptions } from "./options";
import { filterOptions } from "./filters";

type UseCommandPaletteParams = {
  options?: CommandOption[];
};

export const useCommandPalette = ({ options = defaultOptions }: UseCommandPaletteParams) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (event.key === "Escape") {
        setOpen(false);
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
    return filterOptions(options, query);
  }, [options, query]);

  const onSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return { open, setOpen, query, setQuery, filtered, onSelect };
};

