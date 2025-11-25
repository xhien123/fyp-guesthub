import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import Booking from "../models/Booking";

const r = Router();

r.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await Booking.find({})
    .populate("room", "title")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(rows);
});

r.patch("/:id/status", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const currentBooking = await Booking.findById(id).lean();
  if (!currentBooking) return res.status(404).json({ error: "Booking not found" });

  const currentStatus = currentBooking.status;

  const TERMINAL_STATES = ["Checked-out", "Declined", "Cancelled"];
  if (TERMINAL_STATES.includes(currentStatus)) {
    return res.status(400).json({ error: `Cannot change status from terminal state: ${currentStatus}` });
  }
  
  if (currentStatus === "Confirmed") {
    if (newStatus !== "Checked-in" && newStatus !== "Declined") {
      return res.status(400).json({ error: "Confirmed booking can only move to Checked-in or Declined." });
    }
  }
  
  if (currentStatus === "Checked-in") {
    if (newStatus !== "Checked-out") {
      return res.status(400).json({ error: "Checked-in booking can only move to Checked-out." });
    }
  }

  if (currentStatus === "Pending") {
      if (newStatus === "Checked-in" || newStatus === "Checked-out") {
        return res.status(400).json({ error: "Pending must be Confirmed before Check-in/out." });
    }
  }

  const updated = await Booking.findByIdAndUpdate(
    id,
    { $set: { status: newStatus } },
    { new: true }
  )
  .populate("room", "title")
  .populate("user", "name email")
  .lean();
  
  if (!updated) return res.status(404).json({ error: "Failed to update booking" });

  const io = req.app.get("io");
  if (io) {
    io.emit("booking:updated", updated);
  }

  res.json(updated);
});

export default r;