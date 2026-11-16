import { fileUrl } from "./files";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const tech = (t: any) => ({ id: String(t._id), name: t.name, logoUrl: fileUrl(t.logo), logo: t.logo ?? null, order: t.order });

export const project = (p: any) => ({
  id: String(p._id),
  title: p.title,
  description: p.description,
  githubUrl: p.githubUrl,
  liveUrl: p.liveUrl,
  images: (p.images as string[]).map((id) => ({ id, url: fileUrl(id) })),
  technologies: (p.technologies ?? []).filter((t: any) => t && t.name).map(tech),
  featured: p.featured,
  status: p.status,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const research = (r: any) => ({
  id: String(r._id),
  title: r.title,
  badge: r.badge ?? "🎓 Final-year thesis · October 2026",
  authors: r.authors ?? "",
  description: r.description,
  coverImage: r.coverImage ?? null,
  coverImageUrl: fileUrl(r.coverImage),
  images: ((r.images as string[]) ?? []).map((id) => ({ id, url: fileUrl(id) })),
  thesisUrl: r.thesisUrl ?? "",
  paperUrl: r.paperUrl ?? "",
  projectUrl: r.projectUrl ?? "",
  githubUrl: r.githubUrl ?? "",
  featured: r.featured ?? true,
  order: r.order ?? 0,
  status: r.status ?? "PUBLISHED",
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export const profile = (p: any) => ({
  fullName: p?.fullName ?? "",
  headline: p?.headline ?? "Building Smart Solutions.",
  bio: p?.bio ?? "",
  avatar: p?.avatar ?? null,
  avatarUrl: fileUrl(p?.avatar),
  cvFile: p?.cvFile ?? null,
  cvUrl: fileUrl(p?.cvFile),
  cvName: p?.cvName ?? "",
  githubUrl: p?.githubUrl ?? "",
  linkedinUrl: p?.linkedinUrl ?? "",
  researchSubtitle:
    p?.researchSubtitle ?? "My final-year thesis, two extended abstracts published at HIRS 2025, and technical articles.",
  researchGateUrl: p?.researchGateUrl ?? "",
  mediumUrl: p?.mediumUrl ?? "",
  connectText: p?.connectText ?? "",
  email: p?.email ?? "",
  phone: p?.phone ?? "",
  location: p?.location ?? "",
  openToWork: p?.openToWork ?? true,
});

export const message = (m: any) => ({
  id: String(m._id),
  name: m.name,
  email: m.email,
  subject: m.subject,
  message: m.message,
  read: m.read,
  createdAt: m.createdAt,
});
