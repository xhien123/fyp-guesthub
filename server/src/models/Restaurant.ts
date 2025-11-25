import { Schema, model } from "mongoose";

const restaurantSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Buffet", "Beach"], required: true },
  description: { type: String },
}, { timestamps: true });

export default model("Restaurant", restaurantSchema);
