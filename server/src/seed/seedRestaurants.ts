import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "../models/Restaurant";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  await Restaurant.deleteMany({});

  await Restaurant.insertMany([
    {
      name: "Savory Sizzle", // Updated Name
      style: "International Buffet & Bistro", // Updated Style
      location: "Inside, Main Floor",
      description: "A vibrant selection of light and elegant dishes, offering both a refined lunch experience and a grand international buffet dinner."
    },
    {
      name: "Vive Océane", // Updated Name
      style: "Fine Dining Seafood & Grill", // Updated Style
      location: "Beachfront, Ocean View",
      description: "An exclusive culinary journey focusing on premium seafood, A5 Wagyu, and classic French-inspired dishes with breathtaking ocean views."
    }
  ]);

  console.log("✅ Restaurants seeded (Vive Océane and Savory Sizzle)");
  process.exit(0);
}

run().catch(console.error);