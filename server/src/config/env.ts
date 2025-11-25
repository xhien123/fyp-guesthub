import path from "path";
import { config } from "dotenv";

// Load environment variables from the real .env inside /server
config({ path: path.resolve(__dirname, "../../.env") });

// 🔒 Enforce Atlas URI — no fallback to localhost
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";
export const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";
