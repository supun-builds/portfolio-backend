import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Project, Technology } from "@/models";
import { authorize } from "@/lib/auth";
import { TechnologySchema } from "@/schemas";
import { handleError, isObjectId, json } from "@/lib/http";
import { deleteFiles } from "@/lib/files";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "technologies:edit");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Technology not found" }, 404);
    const data = TechnologySchema.parse(await request.json());
    await connectDB();
    const existing = await Technology.findById(id);
    if (!existing) return json({ message: "Technology not found" }, 404);
    const oldLogo = existing.logo;
    existing.name = data.name;
    if (data.logo !== undefined) existing.logo = data.logo;
    await existing.save();
    if (oldLogo && oldLogo !== existing.logo) await deleteFiles([oldLogo]);
    return json({ message: "Technology updated" });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "technologies:delete");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Technology not found" }, 404);
    await connectDB();
    const doc = await Technology.findByIdAndDelete(id);
    if (!doc) return json({ message: "Technology not found" }, 404);
    await Project.updateMany({ technologies: doc._id }, { $pull: { technologies: doc._id } });
    await deleteFiles([doc.logo]);
    return json({ message: "Technology deleted" });
  } catch (e) {
    return handleError(e);
  }
}
