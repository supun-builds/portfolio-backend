import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Message, Project, Technology } from "@/models";
import { authorize } from "@/lib/auth";
import { handleError, json } from "@/lib/http";
import * as S from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const [projects, published, technologies, messages, unread, recent] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: "PUBLISHED" }),
      Technology.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Message.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return json({ projects, published, technologies, messages, unread, recent: recent.map(S.message) });
  } catch (e) {
    return handleError(e);
  }
}
