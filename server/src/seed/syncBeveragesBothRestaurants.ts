import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuCategory from "../models/MenuCategory";
import MenuItem from "../models/MenuItem";

dotenv.config();

const VIVE = "vive-oceane";
const SAVORY = "savory-sizzle";
const DRINKS = "beverages_wines";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guesthub";
  await mongoose.connect(uri);
  console.log("🔗 Connected to DB");

  const [viveCats, savoryCats] = await Promise.all([
    MenuCategory.find({ restaurant: VIVE, mealType: DRINKS }).lean(),
    MenuCategory.find({ restaurant: SAVORY, mealType: DRINKS }).lean(),
  ]);

  if (!viveCats.length || !savoryCats.length) {
    console.log("❌ Missing beverage categories for one restaurant.");
    process.exit(1);
  }

  const viveNameToId = new Map(viveCats.map((c) => [c.name, String(c._id)]));
  const savoryNameToId = new Map(savoryCats.map((c) => [c.name, String(c._id)]));

  const viveItems = await MenuItem.find({ restaurant: VIVE, mealType: DRINKS }).lean();
  if (!viveItems.length) {
    console.log("❌ No beverage items found in Vive Oceane!");
    process.exit(1);
  }

  let count = 0;
  for (const it of viveItems) {
    const catName = viveCats.find((c) => String(c._id) === String(it.category))?.name;
    if (!catName) continue;
    const savoryCat = savoryNameToId.get(catName);
    if (!savoryCat) continue;

    await MenuItem.findOneAndUpdate(
      { restaurant: SAVORY, mealType: DRINKS, name: it.name },
      {
        $set: {
          restaurant: SAVORY,
          mealType: DRINKS,
          category: savoryCat,
          name: it.name,
          description: it.description,
          price: it.price,
          photo: it.photo,
          isAvailable: it.isAvailable,
        },
      },
      { upsert: true, new: true }
    );
    count++;
  }

  console.log(`✅ Synced ${count} beverage items from Vive → Savory`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
