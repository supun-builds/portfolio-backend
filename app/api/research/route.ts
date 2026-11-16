import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Research } from "@/models";
import { authorize } from "@/lib/auth";
import { ResearchSchema } from "@/schemas";
import { handleError, json, parsePagination } from "@/lib/http";
import * as S from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { pageNumber, pageSize } = parsePagination(request);
    const [totalCount, items] = await Promise.all([
      Research.countDocuments(),
      Research.find()
        .sort({ order: 1, createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);
    return json({
      research: items.map(S.research),
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
    const data = ResearchSchema.parse(await request.json());
    await connectDB();
    const created = await Research.create(data);
    return json({ message: "Research item created", id: String(created._id) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
