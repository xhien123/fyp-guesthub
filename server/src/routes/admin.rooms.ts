import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import Room from "../models/Room";

const router = Router();

router.use(requireAuth, requireAdmin);

// List all
router.get("/", async (_req, res) => {
  try {
    const rooms = await Room.find().sort({ pricePerNight: 1 });
    res.json(rooms);
  } catch {
    res.status(500).json({ error: "Failed to load rooms" });
  }
});

// NEW: Get single room by ID (Required for Edit Page)
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch {
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Create
router.post("/", async (req: AuthRequest, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create room" });
  }
});

// Update
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update room" });
  }
});

// Delete
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;