import { connectDB } from "@/lib/db";
import { Profile, Project, Research, Technology } from "@/models";
import { json } from "@/lib/http";
import * as S from "@/lib/serialize";

// Everything the public portfolio needs, in one request. No auth, read-only.
export async function GET() {
  await connectDB();
  const [profile, projects, technologies, researchList] = await Promise.all([
    Profile.findOne({ key: "main" }).lean(),
    Project.find({ status: "PUBLISHED" }).sort({ featured: -1, createdAt: -1 }).populate("technologies").lean(),
    Technology.find().sort({ order: 1, createdAt: 1 }).lean(),
    Research.find({ status: "PUBLISHED" }).sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
  ]);
  return json(
    {
      profile: S.profile(profile),
      projects: projects.map(S.project),
      technologies: technologies.map(S.tech),
      research: researchList.map(S.research),
    },
    200,
    { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
  );
}
