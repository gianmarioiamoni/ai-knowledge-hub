type SopPromptInput = {
  title: string;
  scope: string;
};

type SopGenerated = {
  title: string;
  content: string;
  sourceDocuments: string[];
};

const buildSopPrompt = ({ title, scope }: SopPromptInput): string => {
  return [
    "You are an expert process engineer. Create a concise Standard Operating Procedure (SOP) with the following structure:",
    "- Title",
    "- Purpose",
    "- Preconditions",
    "- Step-by-step instructions (numbered)",
    "- Safety warnings",
    "- Checklist",
    "",
    "Constraints:",
    "- Be concise and actionable.",
    "- Use clear, numbered steps.",
    "- Keep safety warnings explicit.",
    "",
    `SOP Title: ${title}`,
    `Scope/Context: ${scope}`,
  ].join("\n");
};

const generateSop = async (input: SopPromptInput): Promise<SopGenerated> => {
  const { createOpenAIClient } = await import("./openai");
  const client = createOpenAIClient();
  const prompt = buildSopPrompt(input);

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content =
    (response.output_text ??
      response.output
        ?.map((item) => ("content" in item ? String((item as { content?: unknown }).content ?? "") : ""))
        .join("")) ??
    "";

  return {
    title: input.title,
    content,
    sourceDocuments: [],
  };
};

const renderSopMarkdown = (sop: SopGenerated): string => {
  return [`# ${sop.title}`, "", sop.content.trim()].join("\n");
};

export { buildSopPrompt, generateSop, renderSopMarkdown };
export type { SopGenerated };

