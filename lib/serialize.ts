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
