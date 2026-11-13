import { NextRequest } from "next/server";
import { compare, hashSync } from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { LoginSchema } from "@/schemas";
import { clearAuthCookie, getUser, setAuthCookie, signToken } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { handleError, json } from "@/lib/http";

// Compared against when the email doesn't exist, so response time doesn't reveal valid emails.
const DUMMY_HASH = hashSync("not-a-real-password", 12);
const INVALID = { message: "Invalid email or password" };

export async function POST(request: NextRequest) {
  try {
    const { email, password } = LoginSchema.parse(await request.json());

    const limit = rateLimit(`login:${clientIp(request)}:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!limit.ok) {
      return json({ message: "Too many attempts. Try again later." }, 429, { "Retry-After": String(limit.retryAfter) });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    const valid = await compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !valid) return json(INVALID, 401);
    if (user.status !== "ACTIVE") return json({ message: "Account is disabled" }, 403);

    user.lastLogin = new Date();
    await user.save();

    const token = await signToken({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      privileges: user.privileges,
    });

    const response = json({ message: "Login successful", role: user.role, name: user.name });
    setAuthCookie(response, token);
    return response;
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return json({ message: "Not signed in" }, 401);
  return json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function DELETE() {
  const response = json({ message: "Signed out" });
  clearAuthCookie(response);
  return response;
}
