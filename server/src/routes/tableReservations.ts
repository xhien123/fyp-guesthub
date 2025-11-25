import { Router } from "express";
import TableReservation from "../models/TableReservation";

const router = Router();

// POST /api/table-reservations
router.post("/", async (req, res) => {
  try {
    const reservation = await TableReservation.create(req.body);
    res.status(201).json(reservation);
  } catch {
    res.status(400).json({ error: "Failed to create reservation" });
  }
});

// GET /api/table-reservations/:id
router.get("/:id", async (req, res) => {
  try {
    const reservation = await TableReservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });
    res.json(reservation);
  } catch {
    res.status(500).json({ error: "Failed to load reservation" });
  }
});

export default router;
