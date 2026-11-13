import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Message } from "@/models";
import { authorize } from "@/lib/auth";
import { handleError, isObjectId, json } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "messages:edit");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    if (!isObjectId(id)) return json({ message: "Message not found" }, 404);
    const { read } = z.object({ read: z.boolean() }).parse(await request.json());
    await connectDB();
    const doc = await Message.findByIdAndUpdate(id, { $set: { read } });
    if (!doc) return json({ message: "Message not found" }, 404);
    return json({ message: "Updated" });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await authorize(request, "messages:delete");
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!isObjectId(id)) return json({ message: "Message not found" }, 404);
  await connectDB();
  const doc = await Message.findByIdAndDelete(id);
  if (!doc) return json({ message: "Message not found" }, 404);
  return json({ message: "Message deleted" });
}
