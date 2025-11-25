import { Schema, model, Types } from "mongoose";

const RESTAURANT_ENUM = ["savory-sizzle", "vive-oceane"] as const;
const MEAL_ENUM = ["breakfast", "lunch_dinner", "food_dining", "beverage_wine", "beverages_wines"] as const;

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    quantity: { type: Number, default: null },
    category: { type: Types.ObjectId, ref: "MenuCategory", required: true },
    photo: { type: String },
    restaurant: { type: String, enum: RESTAURANT_ENUM, required: true },
    mealType: { type: String, enum: MEAL_ENUM, required: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default model("MenuItem", menuItemSchema);