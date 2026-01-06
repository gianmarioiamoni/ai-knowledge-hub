export function formatDate(value: string | null, locale: string): string {
  if (!value) return "–";
  return new Intl.DateTimeFormat(locale, { 
    dateStyle: "medium", 
    timeStyle: "short" 
  }).format(new Date(value));
}

export function toReadableMarkdown(value: string): string {
  const headingLabels = new Set([
    "Standard Operating Procedure (SOP)",
    "Purpose",
    "Preconditions",
    "Prerequisites",
    "Step-by-Step Instructions",
    "Safety Warnings",
    "Warnings",
    "Checklist",
    "Notes",
  ]);

  const headingWithValue = new Set([
    "Title",
    "Scope",
    "Purpose",
    "Preconditions",
    "Prerequisites",
    "Step-by-Step Instructions",
    "Safety Warnings",
    "Warnings",
    "Checklist",
    "Notes",
  ]);

  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    // Markdown headings already present
    if (/^#{1,6}\s/.test(trimmed)) {
      out.push("", trimmed);
      continue;
    }
    // Known section labels -> H2
    if (headingLabels.has(trimmed)) {
      out.push("", `## ${trimmed}`);
      continue;
    }
    // Lines ending with ":" -> H3
    if (/[:：]\s*$/.test(trimmed)) {
      out.push("", `### ${trimmed.replace(/[:：]\s*$/, "")}`);
      continue;
    }
    // Label: value pattern -> bold label
    const labelMatch = trimmed.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);
    if (labelMatch) {
      const label = labelMatch[1];
      const value = labelMatch[2];
      if (headingWithValue.has(label)) {
        out.push("", `## ${label}`, value);
      } else {
        out.push(`**${label}:** ${value}`);
      }
      continue;
    }
    out.push(trimmed);
  }

  return out.join("\n");
}


