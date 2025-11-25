import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import Order from "../models/Order";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", async (_req, res) => {
  const rows = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(rows);
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const currentOrder = await Order.findById(id).lean();
  if (!currentOrder) return res.status(404).json({ error: "Order not found" });

  const currentStatus = currentOrder.status;
  const activePreparationStates = ["Received", "Preparing", "Ready"];

  if (currentStatus === "Completed") {
    if (newStatus !== "Completed") {
        return res.status(400).json({ error: `Cannot change status from final state: ${currentStatus}` });
    }
  }
  
  if (currentStatus === "Delivered") {
    if (activePreparationStates.includes(newStatus)) {
        return res.status(400).json({ error: "Cannot revert a Delivered order to preparation stages." });
    }
  }
  
  if (currentStatus === "Delivered" && activePreparationStates.includes(newStatus)) {
      return res.status(400).json({ error: "Cannot revert a Delivered order to preparation stages." });
  }

  const row = await Order.findByIdAndUpdate(id, { status: newStatus }, { new: true })
    .populate("user", "name email")
    .lean();

  if (!row) return res.status(404).json({ error: "Not found" });

  const io = req.app.get("io");
  if (io) {
    io.emit("order:updated", row);
  }

  res.json(row);
});

router.patch("/:id/markPaid", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const row = await Order.findByIdAndUpdate(
    id,
    { paid: true, paidAt: new Date() },
    { new: true }
  )
  .populate("user", "name email")
  .lean();

  if (!row) return res.status(404).json({ error: "Not found" });

  const io = req.app.get("io");
  if (io) {
    io.emit("order:updated", row);
  }

  res.json(row);
});

export default router;