// server/src/seed/migrateBeverageCategories.ts
import dotenv from "dotenv";
import mongoose from "mongoose";
import MenuCategory from "../models/MenuCategory";
import MenuItem from "../models/MenuItem";

dotenv.config();

const RESTAURANTS = ["savory-sizzle","vive-oceane"] as const;
const MEAL = "beverages_wines";

const CATEGORY_DEFS = [
  { key: "soft-drinks", name: "Soft Drinks", rx: /(soft|cola|soda|tonic|ginger|lemon|lime)/i },
  { key: "mocktails", name: "Mocktails", rx: /(virgin|mocktail|smash|cooler|crush|greens|blend)/i },
  { key: "cocktails-classics", name: "Cocktails – Classics", rx: /(mojito|margarita|old fashioned|martini|spritz|daiquiri|gimlet|paloma)/i },
  { key: "cocktails-signatures", name: "Cocktails – Signatures", rx: /(signature|basil|lychee|sunset|mango|spicy)/i },
  { key: "spirits", name: "Spirits", rx: /(vodka|gin|rum|tequila|whiskey|scotch|bourbon|irish)/i },
  { key: "beer", name: "Beer", rx: /(beer|draft|bottle|lager|pilsner|ale)/i },
  { key: "wines", name: "Wines", rx: /(wine|champagne|prosecco|ros[eé]|sauvignon|pinot|malbec|merlot)/i },
];

async function ensureCategories() {
  const map: Record<string, Record<string, string>> = {};
  for (const r of RESTAURANTS) {
    map[r] = {};
    for (const def of CATEGORY_DEFS) {
      const doc = await MenuCategory.findOneAndUpdate(
        { name: def.name, restaurant: r, mealType: MEAL },
        { $setOnInsert: { name: def.name, restaurant: r, mealType: MEAL } },
        { upsert: true, new: true }
      );
      map[r][def.key] = String(doc._id);
    }
  }
  return map;
}

function pickKey(name: string) {
  for (const def of CATEGORY_DEFS) if (def.rx.test(name)) return def.key;
  return "wines";
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/guesthub";
  await mongoose.connect(uri);

  const catMap = await ensureCategories();

  const items = await MenuItem.find({ mealType: { $in: ["beverage_wine","beverages_wines"] } });
  let moved = 0, normalized = 0;

  for (const it of items) {
    let changed = false;
    if (it.mealType !== MEAL) { it.mealType = MEAL; changed = true; normalized++; }
    const r = (it as any).restaurant as string;
    const key = pickKey(it.name || "");
    const target = catMap[r]?.[key];
    if (target && String(it.category) !== target) { (it as any).category = target; changed = true; }
    if (changed) { await it.save(); moved++; }
  }

  console.log("Updated items:", moved, "Normalized mealType:", normalized);
  await mongoose.disconnect();
}

run().catch(async e => { console.error(e); await mongoose.disconnect(); process.exit(1); });
