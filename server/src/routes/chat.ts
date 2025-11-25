import { Router, Request, Response, RequestHandler } from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { requireAuthOptional } from "../middleware/authOptional";
import { answerIntent } from "../services/quickAnswers";

// NOTE: Rate limiter temporarily removed to prevent server crash
// import { rateLimit } from "express-rate-limit";

const r = Router();

// const quickLimiter = rateLimit({
//   windowMs: 60_000,
//   limit: 20,
//   standardHeaders: "draft-7",
//   legacyHeaders: false,
// });

/**
 * Helper: find the relevant conversation for this request.
 */
const findOrCreateConversation = async (req: any) => {
  const isLoggedIn = !!req.user;
  let conv: any;

  // 1. Logged-in user flow
  if (isLoggedIn) {
    const userId = req.user._id; 

    // 1a. Active conversation
    conv = await Conversation.findOne({
      userId,
      status: { $in: ["open", "pending"] },
    }).sort({ lastMessageAt: -1 });

    // 1b. Promote guest conversation
    if (!conv && req.fingerprint) {
      const guestConv: any = await Conversation.findOne({
        "meta.guestFingerprint": req.fingerprint,
        status: { $in: ["open", "pending"] },
      }).sort({ lastMessageAt: -1 });

      if (guestConv) {
        guestConv.userId = userId;
        if (!guestConv.meta) {
          guestConv.meta = {
            isGuest: false,
            guestFingerprint: null,
            guestName: req.user.name ?? null,
            guestEmail: req.user.email ?? null,
          };
        } else {
          guestConv.meta.isGuest = false;
          guestConv.meta.guestFingerprint = null;
          if (req.user.name) guestConv.meta.guestName = req.user.name;
          if (req.user.email) guestConv.meta.guestEmail = req.user.email;
        }
        await guestConv.save();
        conv = guestConv;
      }
    }

    // 1c. Fallback to latest
    if (!conv) {
      conv = await Conversation.findOne({ userId }).sort({
        lastMessageAt: -1,
      });
    }

    // 1d. Create new
    if (!conv) {
      conv = await Conversation.create({
        userId,
        status: "open",
        lastMessageAt: new Date(),
        channel: "web",
        meta: {
          isGuest: false,
          guestFingerprint: null,
          guestName: req.user.name ?? null,
          guestEmail: req.user.email ?? null,
        },
      });
    }
    return conv;
  }

  // 2. Guest flow
  if (!conv && !isLoggedIn) {
    if (req.fingerprint) {
      conv = await Conversation.findOne({
        "meta.guestFingerprint": req.fingerprint,
        status: { $in: ["open", "pending"] },
      }).sort({ lastMessageAt: -1 });
    }

    if (!conv) {
      conv = await Conversation.create({
        userId: undefined,
        status: "open",
        lastMessageAt: new Date(),
        channel: "web",
        meta: {
          isGuest: true,
          guestFingerprint: req.fingerprint ?? null,
          guestName: null,
          guestEmail: null,
        },
      });
    }
  }
  return conv;
};

// Ensure endpoint
r.post("/ensure", requireAuthOptional as any, async (req: any, res: Response) => {
  const conv: any = await findOrCreateConversation(req);
  const history = await Message.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .lean();

  res.json({
    conversationId: String(conv._id),
    history,
    isGuest: conv.meta?.isGuest ?? !req.user,
  });
});

// Quick Answer Endpoint (Fixed: No Rate Limiter)
r.post(
  "/quick",
  // quickLimiter as RequestHandler, // <--- REMOVED TO PREVENT CRASH
  requireAuthOptional as any,
  async (req: any, res: Response) => {
    const isLoggedIn = !!req.user;
    const { intent } = req.body || {};
    const ans = answerIntent(intent, isLoggedIn);

    if (!ans) return res.status(404).json({ error: "Unknown intent" });

    const conv: any = await findOrCreateConversation(req);
    const text = `${ans.text} ${ans.href}`.trim();

    await Message.create({
      conversationId: conv._id,
      senderType: "bot",
      text,
      quickIntent: intent,
    });

    conv.lastMessageAt = new Date();
    conv.lastMessage = text.slice(0, 4000);
    if (conv.status === "resolved") conv.status = "open";
    await conv.save();

    res.json({
      title: ans.title,
      text: ans.text,
      href: ans.href,
      conversationId: conv._id,
    });
  }
);

// Get History
r.get("/conversations/me", requireAuthOptional as any, async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Login required" });

  const conv: any = await findOrCreateConversation(req);
  const msgs = await Message.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .lean();

  res.json({ conversationId: String(conv._id), history: msgs });
});

export default r;