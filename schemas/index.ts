import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const httpUrl = z.url({ protocol: /^https?$/ }).max(300);
const optionalUrl = z.union([httpUrl, z.literal("")]).default("");
const optionalFileId = z.union([objectId, z.null()]).optional();

export const LoginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

export const ProjectSchema = z.object({
  title: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(1000),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  images: z.array(objectId).max(6, "Max 6 images").default([]),
  technologies: z.array(objectId).max(20).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["PUBLISHED", "DRAFT"]).default("PUBLISHED"),
});

export const TechnologySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  logo: optionalFileId,
});

export const ProfileSchema = z.object({
  fullName: z.string().trim().max(100),
  headline: z.string().trim().max(120),
  bio: z.string().trim().max(1000),
  avatar: optionalFileId,
  cvFile: optionalFileId,
  cvName: z.string().trim().max(150).optional(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  connectText: z.string().trim().max(600),
  email: z.union([z.email().max(200), z.literal("")]),
  phone: z.string().trim().max(40),
  location: z.string().trim().max(100),
  openToWork: z.boolean(),
}).partial();

export const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email").max(200),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(5, "Message is too short").max(4000),
  website: z.string().optional(), // honeypot — real users never fill this
});
