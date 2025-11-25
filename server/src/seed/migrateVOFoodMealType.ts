import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import MenuItem from "../models/MenuItem";

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(uri);
  const res = await MenuItem.updateMany(
    {
      restaurant: "vive-oceane",
      $or: [{ mealType: { $exists: false } }, { mealType: "lunch_dinner" }],
    },
    { $set: { mealType: "food_dining" } }
  );
  console.log("Updated VO items -> food_dining:", res.modifiedCount);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
