import { describe, expect, it } from "@jest/globals";
import { filterOptions } from "@/components/navigation/CommandPalette/filters";
import type { CommandOption } from "@/components/navigation/CommandPalette/types";

const sampleOptions: CommandOption[] = [
  { label: "Go to Dashboard", href: "/dashboard" },
  { label: "Open Documents", href: "/documents" },
  { label: "Open Chat", href: "/chat" },
];

describe("filterOptions", () => {
  it("returns all options when query is empty", () => {
    const result = filterOptions(sampleOptions, "");
    expect(result).toHaveLength(3);
  });

  it("filters options case-insensitively", () => {
    const result = filterOptions(sampleOptions, "chat");
    expect(result).toEqual([{ label: "Open Chat", href: "/chat" }]);
  });

  it("trims query before filtering", () => {
    const result = filterOptions(sampleOptions, "   documents  ");
    expect(result[0].href).toBe("/documents");
  });

  it("returns empty array when no option matches", () => {
    const result = filterOptions(sampleOptions, "something else");
    expect(result).toHaveLength(0);
  });
});

