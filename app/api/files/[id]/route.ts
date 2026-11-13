import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { FileModel } from "@/models";
import { isObjectId, json } from "@/lib/http";

// Public on purpose: the portfolio site embeds these images and links the CV.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isObjectId(id)) return json({ message: "Not found" }, 404);
  await connectDB();
  const file = await FileModel.findById(id);
  if (!file) return json({ message: "Not found" }, 404);

  const download = request.nextUrl.searchParams.get("download") === "1";
  const safeName = file.filename.replace(/"/g, "");
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "cross-origin",
      // Even if an SVG slipped through, it can't run script or load anything.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
    },
  });
}
