import { describe, expect, it } from "@jest/globals";
import { buildPrompt, encodeLine } from "@/lib/server/ragPrompt";

describe("buildPrompt", () => {
  it("includes question and context in order", () => {
    const prompt = buildPrompt("What is RLS?", "Context line");
    expect(prompt).toContain("Context:");
    expect(prompt).toContain("Context line");
    expect(prompt).toContain("Question:");
    expect(prompt.endsWith("What is RLS?")).toBe(true);
  });

  it("contains the instruction about missing info", () => {
    const prompt = buildPrompt("Q", "C");
    expect(prompt.toLowerCase()).toContain("don't have enough information");
  });
});

describe("encodeLine", () => {
  it("returns a newline-terminated JSON string as Uint8Array", () => {
    const encoded = encodeLine({ a: 1 });
    const decoded = new TextDecoder().decode(encoded);
    expect(decoded).toBe('{"a":1}\n');
  });

  it("handles empty objects", () => {
    const encoded = encodeLine({});
    expect(new TextDecoder().decode(encoded)).toBe("{}\n");
  });
});

