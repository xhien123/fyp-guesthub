// server/src/routes/rooms.ts
import { Router } from "express";
import mongoose from "mongoose";
import Room from "../models/Room";

const router = Router();

/** Normalize Room doc to FE shape (adds aliases the FE expects) */
function toClientRoom(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    // FE expects these keys:
    title: obj.title, // <- your schema uses `title` (no `name`)
    maxGuests:
      typeof obj.maxGuests === "number" ? obj.maxGuests : obj.maxOccupancy,
    available:
      typeof obj.available === "boolean" ? obj.available : obj.isAvailable,
  };
}

/** Extract ObjectId from slug-like param (e.g., deluxe-ocean-view-<id>) */
function extractId(mixed: string) {
  const lastDash = mixed.lastIndexOf("-");
  if (lastDash === -1) return mixed;
  const maybeId = mixed.slice(lastDash + 1);
  return mongoose.isValidObjectId(maybeId) ? maybeId : mixed;
}

/** Simple slugifier used by /slug/:slug */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// GET /api/rooms
router.get("/", async (req, res) => {
  try {
    const { type, min, max, occ } = req.query as {
      type?: string;
      min?: string;
      max?: string;
      occ?: string;
    };

    const filter: Record<string, any> = {};
    if (type) filter.type = type;

    if (occ) {
      const occNum = Number(occ);
      if (!Number.isNaN(occNum)) filter.maxOccupancy = { $gte: occNum };
    }

    if (min || max) {
      const minNum = min ? Number(min) : undefined;
      const maxNum = max ? Number(max) : undefined;

      if (!Number.isNaN(minNum as number) || !Number.isNaN(maxNum as number)) {
        filter.pricePerNight = {};
        if (typeof minNum === "number" && !Number.isNaN(minNum)) {
          filter.pricePerNight.$gte = minNum;
        }
        if (typeof maxNum === "number" && !Number.isNaN(maxNum)) {
          filter.pricePerNight.$lte = maxNum;
        }
      }
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    res.json(rooms.map(toClientRoom));
  } catch (err) {
    console.error("GET /api/rooms error:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/:id  (supports slug-style URLs ending in -<ObjectId>)
router.get("/:id", async (req, res) => {
  try {
    const id = extractId(req.params.id);
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(toClientRoom(room));
  } catch (err) {
    console.error("GET /api/rooms/:id error:", err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// OPTIONAL: GET /api/rooms/slug/:slug (nice for pure slugs)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rooms = await Room.find({}, { title: 1, type: 1, pricePerNight: 1, maxOccupancy: 1, amenities: 1, photos: 1, isAvailable: 1, description: 1, createdAt: 1, updatedAt: 1 });
    const found = rooms.find((r) => slugify(r.title ?? "") === slug);
    if (!found) return res.status(404).json({ error: "Room not found" });
    res.json(toClientRoom(found));
  } catch (err) {
    console.error("GET /api/rooms/slug/:slug error:", err);
    res.status(500).json({ error: "Failed to fetch room by slug" });
  }
});

export default router;
