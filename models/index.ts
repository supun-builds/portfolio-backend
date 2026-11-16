import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// Re-use the compiled model during Next.js hot reloads, keeping schema types intact.
function model<S extends Schema>(name: string, schema: S) {
  return (mongoose.models[name] ?? mongoose.model(name, schema)) as Model<InferSchemaType<S>>;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["ADMIN"], default: "ADMIN" },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
    privileges: { type: [String], default: [] },
    lastLogin: Date,
  },
  { timestamps: true }
);

const technologySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    logo: { type: String, default: null }, // File id
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    githubUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    images: { type: [String], default: [] }, // File ids, first = cover
    technologies: [{ type: Schema.Types.ObjectId, ref: "Technology" }],
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["PUBLISHED", "DRAFT"], default: "PUBLISHED" },
  },
  { timestamps: true }
);

// Singleton document (key = "main")
const profileSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    fullName: { type: String, default: "" },
    headline: { type: String, default: "Building Smart Solutions." },
    bio: { type: String, default: "" },
    avatar: { type: String, default: null },
    cvFile: { type: String, default: null },
    cvName: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    // "Research & Writing" section
    researchSubtitle: {
      type: String,
      default: "My final-year thesis, two extended abstracts published at HIRS 2025, and technical articles.",
    },
    researchGateUrl: { type: String, default: "" },
    mediumUrl: { type: String, default: "" },
    // "Let's Connect" section
    connectText: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    openToWork: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const messageSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 200 },
    subject: { type: String, default: "", maxlength: 150 },
    message: { type: String, required: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const fileSchema = new Schema(
  {
    filename: { type: String, required: true },
    mime: { type: String, required: true },
    kind: { type: String, enum: ["image", "document"], required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

const researchSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    badge: { type: String, default: "🎓 Final-year thesis · October 2026", trim: true, maxlength: 100 },
    authors: { type: String, default: "", trim: true, maxlength: 300 },
    description: { type: String, required: true, maxlength: 3000 },
    coverImage: { type: String, default: null }, // File id for main thesis photo
    images: { type: [String], default: [] }, // Array of File ids for system/architecture screenshots
    thesisUrl: { type: String, default: "" }, // Google Drive or direct download URL
    paperUrl: { type: String, default: "" }, // ResearchGate, IEEE, etc.
    projectUrl: { type: String, default: "" }, // System live demo / project link
    githubUrl: { type: String, default: "" }, // Source code
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["PUBLISHED", "DRAFT"], default: "PUBLISHED" },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
export const Technology = model("Technology", technologySchema);
export const Project = model("Project", projectSchema);
export const Research = model("Research", researchSchema);
export const Profile = model("Profile", profileSchema);
export const Message = model("Message", messageSchema);
export const FileModel = model("FileDoc", fileSchema);
export type ProfileDoc = InferSchemaType<typeof profileSchema>;
export type ResearchDoc = InferSchemaType<typeof researchSchema>;
