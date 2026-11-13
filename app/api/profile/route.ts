import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Profile } from "@/models";
import { authorize } from "@/lib/auth";
import { ProfileSchema } from "@/schemas";
import { handleError, json } from "@/lib/http";
import { deleteFiles } from "@/lib/files";
import * as S from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const auth = await authorize(request, "projects:read");
  if (auth instanceof Response) return auth;
  await connectDB();
  const doc = await Profile.findOne({ key: "main" }).lean();
  return json({ profile: S.profile(doc) });
}

export async function PUT(request: NextRequest) {
  const auth = await authorize(request, "profile:edit");
  if (auth instanceof Response) return auth;
  try {
    const data = ProfileSchema.parse(await request.json());
    await connectDB();
    const before = await Profile.findOne({ key: "main" }).lean();
    const after = await Profile.findOneAndUpdate(
      { key: "main" },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // Remove replaced / cleared files so storage doesn't fill with orphans
    const stale: Array<string | null | undefined> = [];
    if (before?.avatar && before.avatar !== after?.avatar) stale.push(before.avatar);
    if (before?.cvFile && before.cvFile !== after?.cvFile) stale.push(before.cvFile);
    await deleteFiles(stale);

    return json({ message: "Profile saved", profile: S.profile(after) });
  } catch (e) {
    return handleError(e);
  }
}
