import { Router } from "express";
import mongoose from "mongoose";
import MenuItem from "../models/MenuItem";
import MenuCategory from "../models/MenuCategory";

const router = Router();

function normalizeMealType(input?: string) {
  if (!input) return undefined;
  const t = String(input).trim();
  if (t === "beverages_wines") return "beverage_wines";
  if (
    t === "breakfast" ||
    t === "lunch_dinner" ||
    t === "food_dining" ||
    t === "beverage_wines" ||
    t === "beverage_wine"
  ) {
    return t;
  }
  return undefined;
}

router.get("/categories", async (req, res) => {
  try {
    const { restaurant, mealType } = req.query as {
      restaurant?: string;
      mealType?: string;
    };

    const mt = normalizeMealType(mealType);

    const filter: Record<string, any> = {};
    if (restaurant) filter.restaurant = restaurant;

    if (mt) {
      if (mt === "beverage_wines" || mt === "beverage_wine") {
        filter.mealType = { $in: ["beverage_wines", "beverage_wine"] };
      } else {
        filter.mealType = mt;
      }
    }

    const cats = await MenuCategory.find(filter)
      .select({ name: 1 })
      .sort({ name: 1 })
      .lean();

    res.json({ categories: cats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/items", async (req, res) => {
  try {
    const { category, search, limit, restaurant, mealType } = req.query as {
      category?: string;
      search?: string;
      limit?: string;
      restaurant?: string;
      mealType?: string;
    };

    const mt = normalizeMealType(mealType);

    const filter: Record<string, any> = {};

    if (restaurant) filter.restaurant = restaurant;

    if (mt) {
      if (mt === "beverage_wines" || mt === "beverage_wine") {
        filter.mealType = { $in: ["beverage_wines", "beverage_wine"] };
      } else {
        filter.mealType = mt;
      }
    }

    if (category && category !== "all") {
      const asId = mongoose.Types.ObjectId.isValid(category);
      if (asId) {
        filter.category = category;
      } else {
        const catScope: any = { name: category };
        if (restaurant) catScope.restaurant = restaurant;
        if (mt) {
          if (mt === "beverage_wines" || mt === "beverage_wine") {
            catScope.mealType = { $in: ["beverage_wines", "beverage_wine"] };
          } else {
            catScope.mealType = mt;
          }
        }

        const catDoc = await MenuCategory.findOne(catScope)
          .select({ _id: 1 })
          .lean();

        if (catDoc?._id) filter.category = catDoc._id;
        else return res.json({ items: [], total: 0 });
      }
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    let lim = Number(limit);
    if (!Number.isFinite(lim) || lim <= 0) lim = 100;

    const items = await MenuItem.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(lim)
      .lean();

    const normalized = items.map((i: any) => {
      const isManualAvailable = typeof i.isAvailable === "boolean" 
          ? i.isAvailable 
          : (typeof i.available === "boolean" ? i.available : true);

      const hasStock = i.quantity === null || i.quantity === undefined || i.quantity > 0;

      return {
        ...i,
        available: isManualAvailable && hasStock,
        photo: i.imagePath || i.photo || "",
      };
    });

    res.json({ items: normalized, total: normalized.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

export default router;