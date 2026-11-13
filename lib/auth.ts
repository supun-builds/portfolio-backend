import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { COOKIE_NAME, TOKEN_TTL_SECONDS, type Privilege } from "./constants";

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  privileges: string[];
}

function getSecret() {
  const text = process.env.JOSE_SECRET;
  if (!text || text.length < 32) {
    throw new Error("JOSE_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(text);
}

export async function signToken(user: RequestUser) {
  return new jose.SignJWT({
    id: String(user.id),
    email: String(user.email),
    name: String(user.name),
    role: String(user.role),
    privileges: Array.from(user.privileges ?? [], String), // plain array, not a Mongoose array
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({ name: COOKIE_NAME, value: "", httpOnly: true, path: "/", maxAge: 0 });
}

export async function getUser(request: NextRequest): Promise<RequestUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload as unknown as RequestUser;
  } catch {
    return null;
  }
}

/**
 * Returns the user when authenticated AND holding the privilege,
 * otherwise a ready-to-return 401 / 403 response.
 */
export async function authorize(request: NextRequest, privilege: Privilege) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ message: "Please sign in" }, { status: 401 });
  if (!user.privileges?.includes(privilege)) {
    return NextResponse.json({ message: "You don't have permission to do that" }, { status: 403 });
  }
  return user;
}
