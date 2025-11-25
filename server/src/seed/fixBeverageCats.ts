// server/src/seed/fixBeverageCats.ts
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });

import mongoose, { Types } from "mongoose";
import MenuCategory from "../models/MenuCategory";
import MenuItem from "../models/MenuItem";

type RestKey = "savory-sizzle" | "vive-oceane";
const MEAL = "beverages_wines" as const;

const RESTAURANTS: RestKey[] = ["savory-sizzle", "vive-oceane"];

/** Ensure a canonical cat exists and return its _id */
async function ensureCat(name: string, restaurant: RestKey) {
  const doc = await MenuCategory.findOneAndUpdate(
    { name, restaurant, mealType: MEAL },
    { $setOnInsert: { name, restaurant, mealType: MEAL } },
    { new: true, upsert: true }
  ).lean();
  return doc!._id as Types.ObjectId;
}

/** Move all items from oldCatId -> newCatId, then delete old cat */
async function moveItemsDeleteCat(oldCatId: Types.ObjectId, newCatId: Types.ObjectId) {
  await MenuItem.updateMany({ category: oldCatId }, { $set: { category: newCatId } });
  await MenuCategory.deleteOne({ _id: oldCatId });
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
  console.log("✅ Mongo connected");

  for (const r of RESTAURANTS) {
    console.log(`\n==> Fixing beverages categories for ${r}`);

    // Canonical names we want to keep
    const CAT_CLASSICS   = await ensureCat("Cocktails — Classics", r);     // em-dash
    const CAT_SIGNATURES = await ensureCat("Cocktails — Signatures", r);   // em-dash
    const CAT_MOCKTAILS  = await ensureCat("Fresh & Non-Alcoholic", r);
    const CAT_WINE       = await ensureCat("Wine List", r);

    // Variants to merge -> Classics
    const classicsVariants = [
      "Cocktails - Classics",            // hyphen
      "Cocktails – Classics",            // en-dash
      "Cocktails — Classic",             // typo variant
    ];
    const classicCats = await MenuCategory.find({
      restaurant: r, mealType: MEAL, name: { $in: classicsVariants },
    }).lean();

    for (const c of classicCats) {
      console.log(`  • Merging "${c.name}" -> "Cocktails — Classics"`);
      await moveItemsDeleteCat(c._id as Types.ObjectId, CAT_CLASSICS);
    }

    // Variants to merge -> Signatures
    const signatureVariants = [
      "Cocktails - Signatures",
      "Cocktails – Signatures",
      "Cocktail — Signatures",
    ];
    const signatureCats = await MenuCategory.find({
      restaurant: r, mealType: MEAL, name: { $in: signatureVariants },
    }).lean();

    for (const c of signatureCats) {
      console.log(`  • Merging "${c.name}" -> "Cocktails — Signatures"`);
      await moveItemsDeleteCat(c._id as Types.ObjectId, CAT_SIGNATURES);
    }

    // Move Soft Drinks -> Fresh & Non-Alcoholic (Mocktails)
    const soft = await MenuCategory.findOne({
      restaurant: r, mealType: MEAL, name: "Soft Drinks",
    }).lean();

    if (soft?._id) {
      console.log(`  • Moving "Soft Drinks" items -> "Fresh & Non-Alcoholic"`);
      await moveItemsDeleteCat(soft._id as Types.ObjectId, CAT_MOCKTAILS);
    }

    // (Optional) Collapse any stray wine variants into Wine List
    const wineVariants = ["Wine – Sparkling", "Wine – Light Red", "Wine – Rosé", "Wine – Crisp White", "Wine – Fuller Red"];
    const strayWineCats = await MenuCategory.find({
      restaurant: r, mealType: MEAL, name: { $in: wineVariants },
    }).lean();

    for (const c of strayWineCats) {
      console.log(`  • Collapsing wine variant "${c.name}" -> "Wine List"`);
      await moveItemsDeleteCat(c._id as Types.ObjectId, CAT_WINE);
    }
  }

  console.log("\n✅ Beverage categories cleaned up.");
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
