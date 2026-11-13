import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3001")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowed = allowedOrigins.includes(origin);

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
  if (isAllowed) corsHeaders["Access-Control-Allow-Origin"] = origin;

  // Preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // CSRF defence in depth: browsers always send Origin on cross-site writes.
  // A write coming from an origin we don't know is rejected outright.
  if (!SAFE_METHODS.includes(request.method) && origin && !isAllowed) {
    return NextResponse.json({ message: "Origin not allowed" }, { status: 403, headers: { Vary: "Origin" } });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = { matcher: "/api/:path*" };
