import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Research } from "@/models";
import { authorize } from "@/lib/auth";
import { ResearchSchema } from "@/schemas";
import { handleError, isObjectId, json } from "@/lib/http";
import { deleteFiles } from "@/lib/files";
import * as S from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!isObjectId(id)) return json({ message: "Research item not found" }, 404);
  await connectDB();
  const doc = await Research.findById(id).lean();
  if (!doc) return json({ message: "Research item not found" }, 404);
  return json({ research: S.research(doc) });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "projects:edit");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Research item not found" }, 404);
    const data = ResearchSchema.parse(await request.json());
    await connectDB();
    const existing = await Research.findById(id);
    if (!existing) return json({ message: "Research item not found" }, 404);

    const staleFiles: string[] = [];
    if (existing.coverImage && existing.coverImage !== data.coverImage) {
      staleFiles.push(existing.coverImage);
    }
    const removedImages = (existing.images || []).filter((img) => !data.images.includes(img));
    staleFiles.push(...removedImages);

    existing.set(data);
    await existing.save();
    if (staleFiles.length > 0) {
      await deleteFiles(staleFiles);
    }

    return json({ message: "Research item updated" });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "projects:delete");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Research item not found" }, 404);
    await connectDB();
    const doc = await Research.findByIdAndDelete(id);
    if (!doc) return json({ message: "Research item not found" }, 404);
    
    const filesToDelete: string[] = [];
    if (doc.coverImage) filesToDelete.push(doc.coverImage);
    if (doc.images && doc.images.length > 0) filesToDelete.push(...doc.images);
    if (filesToDelete.length > 0) {
      await deleteFiles(filesToDelete);
    }

    return json({ message: "Research item deleted" });
  } catch (e) {
    return handleError(e);
  }
}
