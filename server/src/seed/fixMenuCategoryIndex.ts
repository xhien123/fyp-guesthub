import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });

import mongoose from "mongoose";
import MenuCategory from "../models/MenuCategory";

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);

  try {
    await MenuCategory.collection.dropIndex("name_1");
    console.log("✅ Dropped old index name_1");
  } catch (e: any) {
    if (e?.codeName === "IndexNotFound") {
      console.log("ℹ️ index name_1 not found (already removed)");
    } else {
      console.warn("⚠️ dropIndex:", e?.message || e);
    }
  }

  await MenuCategory.syncIndexes();
  console.log("✅ Synced compound index {name,restaurant,mealType}");

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
