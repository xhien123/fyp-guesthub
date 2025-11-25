import { Router } from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { requireAuth } from "../middleware/requireAuth";
import { io } from "../index";

const r = Router();

// Middleware: Ensure admin role
function requireAdmin(req: any, res: any, next: any) {
  if (!req?.user || req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}

// Helper: Count global unread messages from users
async function getGlobalUnreadCount() {
    const unreadMsgs = await Message.distinct("conversationId", { 
        senderType: { $ne: "admin" }, 
        readAt: null 
    });
    return unreadMsgs.length;
}

// GET /unread-count - Returns total unread count for dashboard badges
r.get("/unread-count", requireAuth as any, requireAdmin, async (_req, res) => {
    const count = await getGlobalUnreadCount();
    res.json({ count });
});

// GET /conversations - Returns list sorted by last activity
r.get("/conversations", requireAuth as any, requireAdmin, async (req, res) => {
  // 1. Fetch conversations sorted by time (Newest first)
  const convos = await Conversation.find({})
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .populate("userId", "name email")
    .lean();

  const convIds = convos.map(c => c._id);
  
  // 2. Aggregate unread message counts per conversation
  const unreadCounts = await Message.aggregate([
      { $match: { conversationId: { $in: convIds }, senderType: { $ne: "admin" }, readAt: null } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } }
  ]);
  
  const unreadMap = new Map(unreadCounts.map(u => [String(u._id), u.count]));

  // 3. Format response with display names and read status
  const withDetails = convos.map((c: any) => {
    let displayName = "Guest";
    if (c.meta?.guestName) {
        displayName = c.meta.guestName;
    } else if (c.userId) {
        displayName = c.userId.name || c.userId.email;
    } else if (c.meta?.guestFingerprint) {
        displayName = `Guest #${c.meta.guestFingerprint.slice(0, 4)}`;
    }

    return {
      ...c,
      displayName,
      lastMessage: c.lastMessage || "Started a conversation",
      unreadCount: unreadMap.get(String(c._id)) || 0,
      isUnread: (unreadMap.get(String(c._id)) || 0) > 0
    };
  });

  res.json(withDetails);
});

// GET /conversations/:id - Fetch details and mark as READ
r.get("/conversations/:id", requireAuth as any, requireAdmin, async (req, res) => {
  const conv: any = await Conversation.findById(req.params.id)
    .populate("userId", "name email")
    .lean();
    
  if (!conv) return res.status(404).json({ error: "Not found" });

  // Resolve display name
  let displayName = "Guest";
  if (conv.meta?.guestName) displayName = conv.meta.guestName;
  else if (conv.userId) displayName = conv.userId.name || conv.userId.email;
  else if (conv.meta?.guestFingerprint) displayName = `Guest #${conv.meta.guestFingerprint.slice(0, 4)}`;

  // AUTO-READ: Mark all user messages in this thread as read
  await Message.updateMany(
      { conversationId: req.params.id, senderType: { $ne: "admin" }, readAt: null },
      { $set: { readAt: new Date() } }
  );

  // Broadcast global unread count update to all admin clients
  const globalCount = await getGlobalUnreadCount();
  io.to("admin-notifications").emit("chat:new-message", { unreadCount: globalCount });

  res.json({ ...conv, displayName });
});

// GET /conversations/:id/messages - Fetch message history
r.get("/conversations/:id/messages", requireAuth as any, requireAdmin, async (req, res) => {
  const msgs = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).lean();
  res.json(msgs);
});

// POST /conversations/:id/reply - Send admin reply
r.post("/conversations/:id/reply", requireAuth as any, requireAdmin, async (req: any, res) => {
  const { text } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "Empty" });

  const trimmed = String(text).trim().slice(0, 4000);
  
  // 1. Create Message
  const msg = await Message.create({
    conversationId: req.params.id,
    senderType: "admin",
    senderId: req.user._id,
    text: trimmed,
    readAt: new Date() // Admin messages are implicitly read
  });

  // 2. Update Conversation (Bump timestamp for sorting)
  await Conversation.findByIdAndUpdate(req.params.id, {
    $set: { lastMessageAt: new Date(), lastMessage: trimmed },
  });

  // 3. Real-time Emit to specific chat room (for live thread update)
  io.to(`c:${req.params.id}`).emit("message:new", msg.toObject());
  
  // 4. Emit to global admin notification room (to re-sort the inbox list)
  const count = await getGlobalUnreadCount();
  io.to("admin-notifications").emit("chat:new-message", { unreadCount: count });

  res.json(msg.toObject());
});

// POST /conversations/:id/status - Manual status toggle (Optional usage)
r.post("/conversations/:id/status", requireAuth as any, requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!["open", "pending", "resolved"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  
  await Conversation.findByIdAndUpdate(req.params.id, { $set: { status } });
  res.json({ ok: true });
});

export default r;