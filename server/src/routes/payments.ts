import express from "express";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import Order from "../models/Order";

dotenv.config();
const router = express.Router();

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID as string;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET as string;
const PAYPAL_BASE = process.env.PAYPAL_BASE || "https://api-m.sandbox.paypal.com";
const APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";

async function getPayPalAccessToken(): Promise<string> {
  const cred = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${cred}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`PayPal token error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

router.post("/paypal/order", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.body as { orderId: string };
    if (!orderId) return res.status(400).json({ error: "orderId required" });
    const ord = await Order.findById(orderId);
    if (!ord) return res.status(404).json({ error: "Order not found" });
    if (ord.paid) return res.status(400).json({ error: "Order already paid" });
    const owner = ord.user?.toString();
    if (req.user!.role !== "admin" && owner !== req.user!._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const total =
      typeof ord.total === "number" && ord.total > 0
        ? ord.total
        : ord.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const accessToken = await getPayPalAccessToken();
    const payload = {
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: total.toFixed(2) }, description: `GuestHub Order ${ord._id}` }],
      application_context: {
        brand_name: "GuestHub",
        user_action: "PAY_NOW",
        return_url: `${APP_URL}/orders/${ord._id}/status?provider=paypal`,
        cancel_url: `${APP_URL}/orders/${ord._id}/status?provider=paypal&cancel=1`,
      },
    };
    const createRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!createRes.ok) {
      const err = await createRes.text().catch(() => createRes.statusText);
      throw new Error(`PayPal create order error: ${createRes.status} ${err}`);
    }
    const data = (await createRes.json()) as any;
    ord.payment = "pay_now";
    ord.paymentRef = data.id;
    await ord.save();
    const approveLink = data.links?.find((l: any) => l.rel === "approve")?.href;
    return res.json({ id: data.id, approveLink });
  } catch {
    return res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

router.post("/paypal/capture", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { paypalOrderId, orderId } = req.body as { paypalOrderId: string; orderId: string };
    if (!paypalOrderId || !orderId) return res.status(400).json({ error: "paypalOrderId and orderId required" });
    const ord = await Order.findById(orderId);
    if (!ord) return res.status(404).json({ error: "Order not found" });
    const owner = ord.user?.toString();
    if (req.user!.role !== "admin" && owner !== req.user!._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const accessToken = await getPayPalAccessToken();
    const capRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    if (!capRes.ok) {
      const err = await capRes.text().catch(() => capRes.statusText);
      throw new Error(`PayPal capture error: ${capRes.status} ${err}`);
    }
    const data = (await capRes.json()) as any;
    const status =
      data?.status ||
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.status ||
      "UNKNOWN";
    if (status === "COMPLETED") {
      ord.paid = true;
      ord.paidAt = new Date();
      ord.payment = "pay_now";
      ord.paymentRef = paypalOrderId;
      await ord.save();
    }
    return res.json({ ok: true, status, orderPaid: ord.paid });
  } catch {
    return res.status(500).json({ error: "Failed to capture PayPal order" });
  }
});

export default router;