import { Schema, model } from "mongoose";

const contactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export default model("ContactMessage", contactMessageSchema);
