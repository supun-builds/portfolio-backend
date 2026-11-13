import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers });

export function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    const field = issue?.path.join(".");
    return json({ message: field ? `${field}: ${issue.message}` : (issue?.message ?? "Invalid input") }, 400);
  }
  if (error instanceof SyntaxError) return json({ message: "Invalid JSON body" }, 400);
  console.error(error);
  return json({ message: "Internal server error" }, 500);
}

export const isObjectId = (id: string) => mongoose.isValidObjectId(id) && /^[a-f\d]{24}$/i.test(id);

export function parsePagination(request: Request) {
  const sp = new URL(request.url).searchParams;
  const pageNumber = Math.max(1, parseInt(sp.get("pageNumber") ?? "1") || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") ?? "10") || 10));
  return { pageNumber, pageSize };
}
