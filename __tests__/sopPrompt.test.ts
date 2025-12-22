import { buildSopPrompt, renderSopMarkdown } from "../lib/server/sop";

describe("SOP helpers", () => {
  it("builds a prompt containing title and scope", () => {
    const prompt = buildSopPrompt({ title: "Firewall Update", scope: "Apply patch KB123 to edge firewall" });
    expect(prompt).toContain("Firewall Update");
    expect(prompt).toContain("Apply patch KB123");
    expect(prompt).toContain("Standard Operating Procedure");
  });

  it("renders markdown with title and content", () => {
    const md = renderSopMarkdown({
      title: "Procedure X",
      content: "Step 1\nStep 2",
      sourceDocuments: [],
    });
    expect(md).toContain("# Procedure X");
    expect(md).toContain("Step 1");
  });
});

