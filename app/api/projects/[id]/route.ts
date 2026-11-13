import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { authorize } from "@/lib/auth";
import { ProjectSchema } from "@/schemas";
import { handleError, isObjectId, json } from "@/lib/http";
import { deleteFiles } from "@/lib/files";
import * as S from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!isObjectId(id)) return json({ message: "Project not found" }, 404);
  await connectDB();
  const doc = await Project.findById(id).populate("technologies").lean();
  if (!doc) return json({ message: "Project not found" }, 404);
  return json({ project: S.project(doc) });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "projects:edit");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Project not found" }, 404);
    const data = ProjectSchema.parse(await request.json());
    await connectDB();
    const existing = await Project.findById(id);
    if (!existing) return json({ message: "Project not found" }, 404);

    const removed = existing.images.filter((img) => !data.images.includes(img));
    existing.set(data);
    await existing.save();
    await deleteFiles(removed);
    return json({ message: "Project updated" });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "projects:delete");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Project not found" }, 404);
    await connectDB();
    const doc = await Project.findByIdAndDelete(id);
    if (!doc) return json({ message: "Project not found" }, 404);
    await deleteFiles(doc.images);
    return json({ message: "Project deleted" });
  } catch (e) {
    return handleError(e);
  }
}
