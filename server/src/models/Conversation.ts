import { Schema, model, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User" },
    adminId: { type: Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["open", "pending", "resolved"],
      default: "open",
    },
    lastMessageAt: { type: Date, default: Date.now },
    channel: {
      type: String,
      enum: ["web", "mobile", "kiosk"],
      default: "web",
    },
    lastMessage: { type: String },
    meta: {
      isGuest: { type: Boolean, default: true },
      guestFingerprint: { type: String },
      guestName: { type: String },
      guestEmail: { type: String },
    },
  },
  { timestamps: true }
);

// indexing for sorting and fast lookup
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ userId: 1 });

export default model("Conversation", conversationSchema);
