import express from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

// create or get user conversation
router.get("/conversations/me", requireAuth, async (req: any, res) => {
  let conv = await Conversation.findOne({ userId: req.user._id });
  if (!conv) {
    conv = await Conversation.create({ userId: req.user._id });
  }
  const history = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
  res.json({ conversationId: conv._id, history });
});

// admin: list all conversations
router.get("/conversations", requireAuth, async (req: any, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const convs = await Conversation.find().sort({ updatedAt: -1 }).populate("userId", "email");
  res.json(convs);
});

// get messages of conversation
router.get("/:id/messages", requireAuth, async (req: any, res) => {
  const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
  res.json(messages);
});

export default router;
