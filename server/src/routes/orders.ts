import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import Order from "../models/Order";
import Booking from "../models/Booking";
import MenuItem from "../models/MenuItem"; 

function sumTotal(items: Array<{ price: number; quantity: number }>) {
  return items.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );
}

async function getActiveBooking(userId: string) {
  return Booking.findOne({
    user: userId,
    status: "Checked-in",
  }).sort({ createdAt: -1 });
}

async function validateMatrix(opts: {
  userId: string;
  service: "room_delivery" | "dine_in";
  payment: "charge_to_room" | "pay_now" | "pay_at_restaurant";
  roomNumber?: string | null | undefined;
}) {
  const { userId, service, payment } = opts;

  if (!["room_delivery", "dine_in"].includes(service))
    return "Invalid service type";
  if (!["charge_to_room", "pay_now", "pay_at_restaurant"].includes(payment))
    return "Invalid payment method";

  const activeBooking = await getActiveBooking(userId);
  const hasBooking = !!activeBooking;

  if (service === "room_delivery") {
    if (!hasBooking)
      return "You must be checked in to your residence to use in-room dining.";
    if (!opts.roomNumber) return "Room number required for room delivery";
    if (payment === "pay_at_restaurant")
      return "Pay at restaurant is not allowed for room delivery";
  } else {
    if (payment === "charge_to_room" && !hasBooking)
      return "Charge to room is only available for checked-in guests.";
  }

  const existingActiveOrder = await Order.findOne({
    user: userId,
    status: { $in: ["Received", "Preparing", "Ready"] }
  });

  if (existingActiveOrder) {
    return `You already have an order in progress (${existingActiveOrder.status}). Please wait for delivery before ordering again.`;
  }

  return null;
}

async function restockOrderItems(items: any[]) {
  for (const item of items) {
    if (!item.menuItemId) continue;
    
    const dbItem = await MenuItem.findById(item.menuItemId);
    
    if (dbItem && dbItem.quantity !== null && dbItem.quantity !== undefined) {
       dbItem.quantity += item.quantity;
       
       if (dbItem.quantity > 0 && !dbItem.isAvailable) {
          dbItem.isAvailable = true;
       }
       
       await dbItem.save();
    }
  }
}

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { items, service, payment, roomNumber, dineIn, note } = req.body as {
      items: Array<{
        _id?: string;
        itemId?: string;
        name: string;
        price: number;
        quantity: number;
        notes?: string;
      }>;
      service: "room_delivery" | "dine_in";
      payment: "charge_to_room" | "pay_now" | "pay_at_restaurant";
      roomNumber?: string;
      dineIn?: { date?: string; time?: string; guests?: number; notes?: string };
      note?: string;
    };

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "Order must have at least one item" });
    if (items.length > 10)
      return res.status(400).json({ error: "Cannot order more than 10 items per order" });

    const cleanItems: any[] = [];
    
    for (const i of items) {
        const id = (i.itemId || i._id);
        if (!id) continue;

        const dbItem = await MenuItem.findById(id);
        if (!dbItem) {
            return res.status(404).json({ error: `Item not found: ${i.name}` });
        }

        const isAvailable = typeof dbItem.isAvailable === 'boolean' ? dbItem.isAvailable : true;
        if (!isAvailable) {
            return res.status(400).json({ error: `We apologize, but ${dbItem.name} is currently unavailable.` });
        }

        if (dbItem.quantity !== null && dbItem.quantity !== undefined) {
            const requestedQty = Number(i.quantity || 1);
            
            if (dbItem.quantity < requestedQty) {
                 return res.status(400).json({ 
                   error: `We apologize, but we only have ${dbItem.quantity} serving(s) remaining of ${dbItem.name}.` 
                 });
            }

            dbItem.quantity -= requestedQty;

            if (dbItem.quantity <= 0) {
                dbItem.quantity = 0;
                dbItem.isAvailable = false;
            }
            
            await dbItem.save();
        }

        cleanItems.push({
            menuItemId: dbItem._id,
            name: dbItem.name,
            price: dbItem.price,
            quantity: Number(i.quantity || 1),
            notes: i.notes,
        });
    }

    const rn: string | null = roomNumber ?? null;

    const matrixError = await validateMatrix({
      userId: req.user!._id,
      service,
      payment,
      roomNumber: rn,
    });
    if (matrixError) return res.status(400).json({ error: matrixError });

    const total = sumTotal(cleanItems);

    const order = await Order.create({
      user: req.user!._id,
      items: cleanItems,
      total,
      service,
      payment,
      roomNumber: service === "room_delivery" ? rn : null,
      note: note || "",
      dineIn:
        service === "dine_in" && dineIn
          ? {
              date: dineIn.date
                ? new Date(`${dineIn.date}T${dineIn.time ?? "00:00"}`)
                : undefined,
              guests:
                typeof dineIn.guests === "number" ? dineIn.guests : undefined,
              notes: dineIn.notes,
            }
          : undefined,
      status: "Received",
      paid: false,
      paidAt: null,
      billedToFolio: false,
      paymentRef: null,
    });

    const io = req.app.get("io");
    if (io) io.emit("order:new", order);

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to place order" });
  }
});

router.patch("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status !== "Received") {
      return res.status(400).json({ 
        error: "Order is already being prepared or delivered and cannot be cancelled." 
      });
    }

    await restockOrderItems(order.items);

    order.status = "Cancelled";
    await order.save();
    
    const io = req.app.get("io");
    if (io) io.emit("order:updated", order);

    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ user: req.user!._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to load orders" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const orderUserId = order.user?.toString();
    if (
      req.user!.role !== "admin" &&
      orderUserId !== req.user!._id.toString()
    )
      return res.status(403).json({ error: "Forbidden" });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to load order" });
  }
});

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const allOrders = await Order.find({}).sort({ createdAt: -1 });
    res.json(allOrders);
  } catch {
    res.status(500).json({ error: "Failed to load all orders" });
  }
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body as { status: string };
    const allowed = ["Received", "Preparing", "Ready", "Delivered", "Completed", "Cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: "Invalid status" });
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (status === "Cancelled" && order.status !== "Cancelled") {
        await restockOrderItems(order.items);
    }

    order.status = status as any;
    await order.save();
    
    const io = req.app.get("io");
    if (io) io.emit("order:updated", order);
    
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.patch("/:id/markPaid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const ord = await Order.findById(req.params.id);
    if (!ord) return res.status(404).json({ error: "Order not found" });
    if (ord.paid)
      return res.status(400).json({ error: "Order already marked as paid" });
    ord.paid = true;
    ord.paidAt = new Date();
    if (typeof req.body?.billedToFolio === "boolean")
      ord.billedToFolio = req.body.billedToFolio;
    if (typeof req.body?.paymentRef === "string")
      ord.paymentRef = req.body.paymentRef;
    if (!ord.payment) ord.payment = "charge_to_room";
    await ord.save();
    
    const io = req.app.get("io");
    if (io) io.emit("order:updated", ord);

    res.json(ord);
  } catch {
    res.status(500).json({ error: "Failed to mark order as paid" });
  }
});

export default router;