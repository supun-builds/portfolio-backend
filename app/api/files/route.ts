import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { FileModel } from "@/models";
import { authorize } from "@/lib/auth";
import { handleError, json } from "@/lib/http";
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES, fileUrl, sniff } from "@/lib/files";

// multipart/form-data  →  field "file"; optional field "kind" = "image" | "document"
export async function POST(request: NextRequest) {
  const auth = await authorize(request, "files:upload");
  if (auth instanceof Response) return auth;
  try {
    const form = await request.formData();
    const file = form.get("file");
    const wanted = form.get("kind");
    if (!(file instanceof File)) return json({ message: "No file uploaded" }, 400);
    if (file.size === 0) return json({ message: "File is empty" }, 400);
    if (file.size > MAX_PDF_BYTES) return json({ message: "File is too large" }, 413);

    const buf = Buffer.from(await file.arrayBuffer());
    const detected = sniff(buf);
    if (!detected) return json({ message: "Unsupported file type. Use PNG, JPG, WEBP, GIF, SVG or PDF." }, 415);
    if (wanted && wanted !== detected.kind) {
      return json({ message: wanted === "image" ? "Please upload an image" : "Please upload a PDF" }, 415);
    }
    if (detected.kind === "image" && buf.length > MAX_IMAGE_BYTES) {
      return json({ message: "Images must be under 5 MB" }, 413);
    }

    await connectDB();
    const doc = await FileModel.create({
      filename: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 150),
      mime: detected.mime,
      kind: detected.kind,
      size: buf.length,
      data: buf,
    });
    return json({ id: String(doc._id), url: fileUrl(String(doc._id)), name: doc.filename, mime: doc.mime }, 201);
  } catch (e) {
    return handleError(e);
  }
}
