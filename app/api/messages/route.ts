import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Message } from "@/models";
import { authorize } from "@/lib/auth";
import { handleError, json, parsePagination } from "@/lib/http";
import * as S from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, "messages:read");
  if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { pageNumber, pageSize } = parsePagination(request);
    const [totalCount, unread, items] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Message.find().sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(),
    ]);
    return json({
      messages: items.map(S.message),
      unread,
      pagination: { pageNumber, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
    });
  } catch (e) {
    return handleError(e);
  }
}
