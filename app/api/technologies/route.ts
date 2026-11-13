import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Technology } from "@/models";
import { authorize } from "@/lib/auth";
import { TechnologySchema } from "@/schemas";
import { handleError, json } from "@/lib/http";
import * as S from "@/lib/serialize";

// Reading the list needs a sign-in; the public site uses /api/public/portfolio.
export async function GET(request: NextRequest) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  await connectDB();
  const items = await Technology.find().sort({ order: 1, createdAt: 1 }).lean();
  return json({ technologies: items.map(S.tech) });
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, "technologies:add");
  if (auth instanceof Response) return auth;
  try {
    const data = TechnologySchema.parse(await request.json());
    await connectDB();
    const last = await Technology.findOne().sort({ order: -1 }).lean();
    const created = await Technology.create({ ...data, order: (last?.order ?? 0) + 1 });
    return json({ message: "Technology added", id: String(created._id) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
