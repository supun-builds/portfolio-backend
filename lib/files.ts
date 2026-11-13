import { FileModel } from "@/models/FileDoc";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 8 * 1024 * 1024;

export const fileUrl = (id?: string | null) =>
  id ? `${process.env.PUBLIC_API_URL ?? ""}/api/files/${id}` : null;

/** Detect the real type from magic bytes — never trust the client's MIME / extension. */
export function sniff(buf: Buffer): { mime: string; kind: "image" | "document" } | null {
  const hex = buf.subarray(0, 12).toString("hex");
  if (hex.startsWith("89504e470d0a1a0a")) return { mime: "image/png", kind: "image" };
  if (hex.startsWith("ffd8ff")) return { mime: "image/jpeg", kind: "image" };
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return { mime: "image/gif", kind: "image" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { mime: "image/webp", kind: "image" };
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return { mime: "application/pdf", kind: "document" };
  const head = buf.subarray(0, 1024).toString("utf8").trimStart().toLowerCase();
  if ((head.startsWith("<svg") || head.startsWith("<?xml")) && head.includes("<svg")) {
    const full = buf.toString("utf8").toLowerCase();
    if (/<script|\son\w+\s*=|javascript:|<foreignobject/.test(full)) return null;
    return { mime: "image/svg+xml", kind: "image" };
  }
  return null;
}

export async function deleteFiles(ids: Array<string | null | undefined>) {
  const clean = ids.filter((x): x is string => !!x);
  if (clean.length) await FileModel.deleteMany({ _id: { $in: clean } });
}
