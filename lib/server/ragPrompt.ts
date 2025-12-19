export const buildPrompt = (question: string, context: string): string => {
  return [
    "You are a concise assistant. Answer based only on the provided context.",
    "If the answer is not present, say you don't have enough information.",
    "",
    "Context:",
    context,
    "",
    "Question:",
    question,
  ].join("\n");
};

export const encodeLine = (data: unknown): Uint8Array => {
  return new TextEncoder().encode(`${JSON.stringify(data)}\n`);
};

