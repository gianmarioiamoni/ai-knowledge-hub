import type { SopGenerated } from "./sop";

const renderSopPdf = async (sop: SopGenerated): Promise<Buffer> => {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  const { width, height } = page.getSize();

  const titleFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const bodyBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText(sop.title, { x: margin, y, size: 20, font: titleFont });
  y -= 32;

  const stripMarkdownInline = (text: string) => text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1");

  const content = sop.content.replace(/\r\n/g, "\n").split("\n");
  const lineHeight = 16;
  const maxWidth = width - margin * 2;

  const drawWrapped = (text: string, font: typeof bodyFont, bullet?: string) => {
    const words = text.split(" ");
    let line = bullet ? bullet : "";
    const bulletWidth = bullet ? font.widthOfTextAtSize(bullet + " ", 12) : 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      const candidateWidth = font.widthOfTextAtSize(candidate, 12);
      if (candidateWidth + bulletWidth > maxWidth) {
        page.drawText(line, { x: margin + (bullet ? 14 : 0), y, size: 12, font });
        y -= lineHeight;
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) {
      page.drawText(line, { x: margin + (bullet ? 14 : 0), y, size: 12, font });
      y -= lineHeight;
    }
  };

  for (const raw of content) {
    if (y < margin + lineHeight) {
      // simple single-page safeguard
      break;
    }
    let line = raw.trim();
    if (!line) {
      y -= lineHeight * 0.5;
      continue;
    }
    // Markdown headings (#, ##, ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      line = stripMarkdownInline(headingMatch[2]).replace(/[:：]\s*$/, "");
      const size = level === 1 ? 18 : level === 2 ? 16 : 14;
      page.drawText(line, { x: margin, y, size, font: bodyBold });
      y -= lineHeight;
      continue;
    }
    // Headings ending with ":" without markdown
    if (/[:：]\s*$/.test(line) || /^[A-Z].+:$/.test(line)) {
      line = stripMarkdownInline(line.replace(/[:：]\s*$/, ""));
      page.drawText(line, { x: margin, y, size: 14, font: bodyBold });
      y -= lineHeight;
      continue;
    }
    // Bullets
    if (line.startsWith("- ")) {
      drawWrapped(stripMarkdownInline(line.slice(2)), bodyFont, "•");
      continue;
    }
    // Numbered steps
    const match = line.match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      drawWrapped(stripMarkdownInline(match[2]), bodyFont, `${match[1]}.`);
      continue;
    }
    // Default paragraph (strip inline bold markers)
    drawWrapped(stripMarkdownInline(line), bodyFont);
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
};

export { renderSopPdf };

