import type { CommandOption } from "./types";

export const filterOptions = (options: CommandOption[], query: string): CommandOption[] => {
  const q = query.toLowerCase().trim();
  if (!q) return options;
  return options.filter((opt) => opt.label.toLowerCase().includes(q));
};

