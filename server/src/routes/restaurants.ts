import { Router } from "express";
import Restaurant from "../models/Restaurant";

const router = Router();

// GET /api/restaurants
router.get("/", async (_, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch {
    res.status(500).json({ error: "Failed to load restaurants" });
  }
});

export default router;
