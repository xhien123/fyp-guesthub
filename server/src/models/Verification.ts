import { Schema, model } from "mongoose";

const verificationSchema = new Schema(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    // TTL Index: Documents expire 600 seconds (10 minutes) after creation
    createdAt: { type: Date, default: Date.now, expires: 600 }, 
  },
  { timestamps: true }
);

export default model("Verification", verificationSchema);