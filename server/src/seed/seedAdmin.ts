import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User";

dotenv.config();

async function seedAdmin() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/guesthub";
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "AdminPass123!";
  const name = process.env.ADMIN_NAME || "Super Admin";

  await mongoose.connect(mongoUri);
  const hash = await bcrypt.hash(password, 10);
  const update = { name, email, password: hash, passwordHash: hash, role: "admin" as const };

  const admin = await User.findOneAndUpdate({ email }, { $set: update }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();

  console.log("✅ Admin ready:");
  console.log("   Email:", email);
  console.log("   Password:", password);
  console.log("   Role:", admin?.role);

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
