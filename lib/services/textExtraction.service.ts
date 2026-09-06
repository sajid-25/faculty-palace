import { PDFParse } from "pdf-parse";

export interface ExtractedDocument {
  filename: string;
  mimeType: string;
  rawText: string;
  characterCount: number;
  wordCount: number;
  pageCount?: number;
}

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/octet-stream",
];

const SUPPORTED_EXTENSIONS = [".pdf", ".txt", ".md"];

export function isSupportedFileType(filename: string, mimeType?: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (SUPPORTED_EXTENSIONS.includes(ext)) {
    return true;
  }
  if (mimeType && SUPPORTED_MIME_TYPES.includes(mimeType)) {
    return true;
  }
  return false;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ExtractedDocument> {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (!isSupportedFileType(filename, mimeType)) {
    throw new Error(
      `Unsupported file type '${ext || mimeType}'. Only text-based PDF and plain text documents (.pdf, .txt, .md) are supported.`
    );
  }

  let rawText = "";
  let pageCount: number | undefined = undefined;

  if (ext === ".pdf" || mimeType === "application/pdf") {
    try {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const textResult = await parser.getText();
      rawText = typeof textResult === "string" ? textResult : (textResult as { text?: string })?.text || "";
      const info = await parser.getInfo?.().catch(() => null);
      pageCount = info?.pages || undefined;
      await parser.destroy?.().catch(() => null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error parsing PDF";
      throw new Error(`Failed to parse PDF document '${filename}': ${message}`);
    }
  } else {
    // Plain text / Markdown
    rawText = buffer.toString("utf-8");
  }

  // Clean and normalize whitespace while preserving structural line breaks
  const cleanedText = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const words = cleanedText ? cleanedText.split(/\s+/).filter(Boolean).length : 0;

  return {
    filename,
    mimeType: mimeType || (ext === ".pdf" ? "application/pdf" : "text/plain"),
    rawText: cleanedText,
    characterCount: cleanedText.length,
    wordCount: words,
    pageCount,
  };
}
