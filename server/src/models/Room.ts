import { Schema, model } from "mongoose";

const roomSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  maxOccupancy: { type: Number, required: true },
  beds: { type: Number, required: true },
  amenities: [{ type: String }],
  photos: [{ type: String }],
  description: { type: String },
  available: { type: Boolean, default: true },
}, { timestamps: true });

export default model("Room", roomSchema);