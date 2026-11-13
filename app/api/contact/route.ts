import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Message } from "@/models";
import { ContactSchema } from "@/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { handleError, json } from "@/lib/http";

// Public endpoint used by the "Let's Connect" form on the portfolio site.
export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`contact:${clientIp(request)}`, 3, 60 * 60 * 1000);
    if (!limit.ok) {
      return json({ message: "Too many messages. Please try again later." }, 429, { "Retry-After": String(limit.retryAfter) });
    }
    const { website, ...data } = ContactSchema.parse(await request.json());
    if (website) return json({ message: "Message sent" }); // bot: pretend success, store nothing
    await connectDB();
    await Message.create(data);
    return json({ message: "Message sent" }, 201);
  } catch (e) {
    return handleError(e);
  }
}
