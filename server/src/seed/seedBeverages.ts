import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });

import mongoose, { Types } from "mongoose";
import MenuCategory from "../models/MenuCategory";
import MenuItem from "../models/MenuItem";

type RestKey = "savory-sizzle" | "vive-oceane";
const MEAL = "beverages_wines"; // <- must match your model enum exactly

async function ensureCategory(name: string, restaurant: RestKey) {
  const doc = await MenuCategory.findOneAndUpdate(
    { name, restaurant, mealType: MEAL },
    { $setOnInsert: { name, restaurant, mealType: MEAL } },
    { new: true, upsert: true }
  );
  return doc._id as Types.ObjectId;
}

async function upsertItem(
  restaurant: RestKey,
  catId: Types.ObjectId,
  name: string,
  price: number,
  description: string
) {
  await MenuItem.updateOne(
    { name, restaurant, mealType: MEAL },
    {
      $set: {
        name,
        price,
        description,
        isAvailable: true,
        restaurant,
        mealType: MEAL,
        category: catId,
      },
      $setOnInsert: { photo: "" },
    },
    { upsert: true }
  );
}

async function seedFor(restaurant: RestKey) {
  // ---- categories shown as chips in the Drinks tab
  const catSoft = await ensureCategory("Soft Drinks", restaurant);
  const catClassic = await ensureCategory("Cocktails — Classics", restaurant);
  const catSig = await ensureCategory("Cocktails — Signatures", restaurant);
  const catWine = await ensureCategory("Wine List", restaurant);

  // ---- Soft / Non-alcoholic
  await upsertItem(
    restaurant,
    catSoft,
    "The Tropical Blend",
    5.5,
    "Freshly pressed pineapple, orange, and passionfruit."
  );
  await upsertItem(
    restaurant,
    catSoft,
    "The Greens",
    5.5,
    "Celery, apple, cucumber, and ginger (detox)."
  );
  await upsertItem(
    restaurant,
    catSoft,
    "Watermelon & Mint Crush",
    5.5,
    "Watermelon purée, mint syrup, and lime."
  );
  await upsertItem(
    restaurant,
    catSoft,
    "Ginger Basil Smash (Mocktail)",
    6,
    "Muddled basil, fresh ginger, lemon; topped with sparkling water."
  );
  await upsertItem(
    restaurant,
    catSoft,
    "Virgin Piña Colada",
    6,
    "Cream of coconut blended with pineapple juice."
  );

  // ---- Cocktails: Classics
  await upsertItem(
    restaurant,
    catClassic,
    "Mojito",
    9,
    "White rum, mint, lime, sugar, soda."
  );
  await upsertItem(
    restaurant,
    catClassic,
    "Margarita",
    9.5,
    "Tequila, triple sec, fresh lime (salt rim optional)."
  );
  await upsertItem(
    restaurant,
    catClassic,
    "Aperol Spritz",
    9,
    "Aperol, prosecco, splash of soda."
  );
  await upsertItem(
    restaurant,
    catClassic,
    "Espresso Martini",
    10,
    "Vodka, coffee liqueur, fresh espresso."
  );
  await upsertItem(
    restaurant,
    catClassic,
    "Old Fashioned",
    10.5,
    "Bourbon or rye, sugar, bitters, orange peel."
  );
  await upsertItem(
    restaurant,
    catClassic,
    "Gin & Tonic",
    9,
    "Premium gin with your choice of tonic."
  );

  // ---- Cocktails: Signatures
  await upsertItem(
    restaurant,
    catSig,
    "Mango-Chili Cooler",
    10,
    "Vodka, fresh mango, lime, hint of red chili."
  );
  await upsertItem(
    restaurant,
    catSig,
    "Sunset Daiquiri",
    10,
    "Dark & light rums blended with pineapple and passionfruit."
  );
  await upsertItem(
    restaurant,
    catSig,
    "Spicy Paloma",
    10,
    "Tequila, fresh grapefruit soda, lime, chili-salt rim."
  );
  await upsertItem(
    restaurant,
    catSig,
    "Basil & Cucumber Gimlet",
    10,
    "Gin with fresh cucumber, basil, and lime."
  );
  await upsertItem(
    restaurant,
    catSig,
    "Lychee Rosé Spritz",
    10,
    "Rosé wine, lychee liqueur, sparkling water."
  );

  // ---- Wine List (representative picks)
  await upsertItem(
    restaurant,
    catWine,
    "Prosecco (Italy)",
    8,
    "Light, fruity, and approachable (glass)."
  );
  await upsertItem(
    restaurant,
    catWine,
    "Champagne (France)",
    15,
    "Premium traditional-method (glass)."
  );
  await upsertItem(
    restaurant,
    catWine,
    "Sauvignon Blanc (New Zealand)",
    9,
    "Zesty, high acidity; excellent with seafood."
  );
  await upsertItem(
    restaurant,
    catWine,
    "Pinot Grigio (Italy)",
    8.5,
    "Clean, mineral, highly popular."
  );
  await upsertItem(
    restaurant,
    catWine,
    "Provence Rosé (France)",
    9,
    "Pale, dry, elegant."
  );
  await upsertItem(
    restaurant,
    catWine,
    "Pinot Noir",
    10,
    "Light red; lovely slightly chilled."
  );
  await upsertItem(
    restaurant,
    catWine,
    "Malbec / Merlot",
    9.5,
    "Fuller, round reds for heartier dishes."
  );
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);
  console.log("✅ Connected");

  for (const r of ["savory-sizzle", "vive-oceane"] as RestKey[]) {
    console.log(`\n⟶ Seeding beverages for ${r} ...`);
    await seedFor(r);
  }

  console.log("\n✅ Beverages seeded / upserted.");
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
