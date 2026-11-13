import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { authorize } from "@/lib/auth";
import { ProjectSchema } from "@/schemas";
import { handleError, json, parsePagination } from "@/lib/http";
import * as S from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { pageNumber, pageSize } = parsePagination(request);
    const [totalCount, items] = await Promise.all([
      Project.countDocuments(),
      Project.find()
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate("technologies")
        .lean(),
    ]);
    return json({
      projects: items.map(S.project),
      pagination: { pageNumber, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, "projects:add");
  if (auth instanceof Response) return auth;
  try {
    const data = ProjectSchema.parse(await request.json());
    await connectDB();
    const created = await Project.create(data);
    return json({ message: "Project created", id: String(created._id) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
