import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "admin", "system", "bot"],
      required: true,
    },
    senderId: { type: Types.ObjectId, ref: "User" },
    text: { type: String, required: true, trim: true },
    quickIntent: { type: String },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// indexes for efficient retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderType: 1 });
messageSchema.index({ readAt: 1 });

export default model("Message", messageSchema);
