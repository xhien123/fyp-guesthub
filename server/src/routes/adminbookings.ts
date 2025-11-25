import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import Booking from "../models/Booking";

const r = Router();

r.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await Booking.find({})
    .populate("room", "title")
    .sort({ createdAt: -1 })
    .lean();
  res.json(rows);
});

r.patch("/:id/status", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: "Pending" | "Confirmed" | "Checked-in" | "Checked-out" | "Declined" };
  const updated = await Booking.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  ).lean();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

export default r;
