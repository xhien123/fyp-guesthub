import { Schema, model } from "mongoose";

const RESTAURANT_ENUM = ["savory-sizzle", "vive-oceane"] as const;
const MEAL_ENUM = ["breakfast", "lunch_dinner", "food_dining", "beverages_wines"] as const;

const menuCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    restaurant: { type: String, enum: RESTAURANT_ENUM, required: true },
    mealType: { type: String, enum: MEAL_ENUM, required: true },
  },
  { timestamps: true }
);

// Unique per (restaurant, mealType, name)
menuCategorySchema.index({ name: 1, restaurant: 1, mealType: 1 }, { unique: true });

export default model("MenuCategory", menuCategorySchema);
