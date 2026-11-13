import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { User, Profile } from "../models";
import { ADMIN_PRIVILEGES } from "../lib/constants";
import dns from "node:dns";   // put this with the other imports at the top
// ...
dns.setServers(["8.8.8.8", "1.1.1.1"]);   // put this line right before mongoose.connect

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD");
  if (ADMIN_PASSWORD.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  await mongoose.connect(MONGODB_URI);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      email: ADMIN_EMAIL.toLowerCase(),
      password: await hash(ADMIN_PASSWORD, 12),
      name: ADMIN_NAME ?? "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      privileges: [...ADMIN_PRIVILEGES],
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
  await Profile.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main", fullName: ADMIN_NAME ?? "" } }, { upsert: true });
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
