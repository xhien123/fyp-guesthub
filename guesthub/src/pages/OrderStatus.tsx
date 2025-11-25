import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchOrder, cancelOrder } from "../lib/api";
import type { Order } from "../types";
import { useToast } from "../ui/Toaster";

const STEPS: Order["status"][] = ["Received", "Preparing", "Ready", "Delivered"];
const POLL_MS = 5000;

const Stepper: React.FC<{ current: Order["status"] }> = ({ current }) => {
  const isCancelled = current === "Cancelled";
  
  if (isCancelled) {
      return (
          <div className="w-full bg-red-50 border border-red-200 p-4 text-center rounded">
              <span className="text-red-800 font-bold uppercase tracking-widest">Order Cancelled</span>
          </div>
      )
  }

  const currentIndex = Math.max(0, STEPS.findIndex((s) => s === current));
  return (
    <div className="w-full">
      <ol className="grid grid-cols-4 gap-4">
        {STEPS.map((s, idx) => {
          const isDone = idx <= currentIndex;
          const isActive = idx === currentIndex;
          return (
            <li
              key={s}
              className="flex flex-col items-center justify-start relative pt-6 pb-2"
            >
              <div
                className={`absolute top-2 h-[3px]`}
                style={{
                  width: `${isDone ? 100 : 0}%`,
                  left: idx === 0 ? "50%" : "0%",
                  right: idx === STEPS.length - 1 ? "50%" : "0%",
                  backgroundColor: isDone ? `#b45309` : `#d6d3d1`,
                  transition: "width 0.5s ease-in-out",
                }}
              />
              <div
                className={`absolute top-0 flex h-8 w-8 items-center justify-center border-2 transition-all ${
                  isActive
                    ? `bg-white border-amber-700 shadow-md`
                    : isDone
                    ? `bg-amber-700 border-amber-700`
                    : `bg-stone-100 border-stone-300`
                }`}
              >
                <span
                  className={`text-base font-bold ${
                    isDone
                      ? isActive
                        ? `text-amber-700`
                        : `text-white`
                      : `text-stone-500`
                  }`}
                >
                  {isDone ? (isActive ? "•" : "✓") : idx + 1}
                </span>
              </div>
              <div
                className={`mt-6 text-center text-xs font-bold uppercase tracking-wider ${
                  isDone ? `text-amber-700` : "text-stone-600"
                }`}
              >
                {s}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const pill = (ok: boolean, status: string) => {
  if (status === "Cancelled") {
      return "inline-flex items-center px-4 py-2 text-xs font-semibold border bg-stone-200 text-stone-600 border-stone-300";
  }
  return `inline-flex items-center px-4 py-2 text-xs font-semibold border ${
    ok
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-stone-100 text-stone-700 border-stone-300"
  }`;
};

function displayMethod(o: Order) {
  if (o.service === "room_delivery") return "Residence Delivery";
  if (o.service === "dine_in") return "Reserve a table";
  if ((o as any).method === "room") return "Residence Delivery";
  return "Reserve a table";
}

const OrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Modal States
  const [showConfirm1, setShowConfirm1] = React.useState(false);
  const [showConfirm2, setShowConfirm2] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const fmtVND = (v: number) =>
    `${Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(v)}`;

  const load = React.useCallback(async () => {
    try {
      setError(null);
      const data = await fetchOrder(id!);
      setOrder(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load order status");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (order && order.status !== "Delivered" && order.status !== "Cancelled") {
      const t = window.setInterval(load, POLL_MS);
      return () => window.clearInterval(t);
    }
  }, [load, order]);

  const handleCancel = async () => {
      setCancelling(true);
      try {
          await cancelOrder(id!);
          toast({ title: "Order Cancelled", description: "Your order has been successfully cancelled.", variant: "success" });
          // Reset UI
          setShowConfirm2(false);
          setShowConfirm1(false);
          load(); // Reload to show cancelled status
      } catch (e: any) {
          toast({ title: "Cancellation Failed", description: e?.response?.data?.error || "Could not cancel order.", variant: "error" });
          setCancelling(false);
      }
  };

  if (loading)
    return (
      <div className="container max-w-4xl py-20 text-center mx-auto">
        <h1 className="text-xl font-light tracking-tight text-neutral-800">
          Activating Live Tracker...
        </h1>
      </div>
    );
  if (error)
    return (
      <div className="container max-w-4xl py-20 text-center mx-auto">
        <h1 className="text-xl text-red-600">{error}</h1>
      </div>
    );
  if (!order)
    return (
      <div className="container max-w-4xl py-20 text-center mx-auto">
        <h1 className="text-xl text-red-600">Order not found.</h1>
      </div>
    );

  const subtotal =
    order.total ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const statusMessage = () => {
    switch (order.status) {
      case "Cancelled":
        return "This order has been Cancelled. No charges will be applied.";
      case "Delivered":
        return `Your order has been Delivered to Residence ${
          order.roomNumber || "your requested location"
        }. Thank you for dining with us!`;
      case "Ready":
        return "Your order is Ready for Dispatch. Our butler service is preparing the final delivery now.";
      case "Preparing":
        return "The culinary team is currently Preparing your exquisite meal. Estimated time remaining: 15-20 minutes.";
      case "Received":
        return "Your order has been Received and is being routed to the kitchen for preparation.";
      default:
        return "We are processing your order. Please wait for an update.";
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-screen">
      <div className="container max-w-4xl py-16 space-y-10 mx-auto">
        <div className="flex items-center justify-between border-b border-stone-300 pb-4">
          <h1 className="font-serif text-5xl font-extralight italic text-stone-900">
            Live Order Status
          </h1>
          <div className="flex gap-3">
            <Link
              to={`/orders/${order._id}`}
              className="border border-stone-300 text-stone-700 px-6 py-3 text-sm font-semibold hover:bg-stone-100 transition tracking-wider"
            >
              View Details
            </Link>
            <Link
              to="/profile"
              className="border border-stone-300 text-stone-700 px-6 py-3 text-sm font-semibold hover:bg-stone-100 transition tracking-wider"
            >
              My Profile
            </Link>
          </div>
        </div>

        <div className="border border-stone-200 bg-white p-8 shadow-xl space-y-8">
          <div className="flex items-center justify-between pb-4">
            <div>
              <div className="text-sm text-stone-500 uppercase tracking-wider">
                Order ID
              </div>
              <div className="font-medium text-stone-800 text-lg">
                {order._id}
              </div>
            </div>
            <div className="text-sm text-stone-700">
              Method:{" "}
              <span className="font-semibold text-lg text-stone-800">
                {displayMethod(order)}
              </span>
            </div>
          </div>

          <Stepper current={order.status} />

          <div className={`flex justify-between items-center p-4 font-semibold text-sm border ${order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
            <span>{statusMessage()}</span>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <span className="text-sm text-stone-700 font-semibold">
              Payment Status:
            </span>
            <span
              className={pill(!!order.paid, order.status)}
              title={
                order.paidAt
                  ? `Settled at ${new Date(order.paidAt).toLocaleString()}`
                  : ""
              }
            >
              {order.status === "Cancelled" ? "Voided" : order.paid ? "Billed to Room / Settled" : "Unpaid (Charge to Room)"}
            </span>
          </div>

          <div className="border border-stone-200 bg-stone-50 p-6 space-y-4">
            <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">
              Items in Order ({order.items.length})
            </div>
            <ul className="space-y-3 text-sm">
              {order.items.map((it: any, i: number) => (
                <li
                  key={it._id ?? `${it.name}-${i}`}
                  className="flex flex-col gap-1 border-b border-stone-200 pb-2 last:border-none"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">
                      {it.name} × {it.quantity}
                    </span>
                    <span className="font-medium text-stone-800">
                      {fmtVND(it.price * it.quantity)}
                    </span>
                  </div>
                  {it.notes && it.notes.trim() !== "" && (
                    <div className="text-xs text-amber-800 italic">
                      Note: {it.notes}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-stone-300 pt-3 flex justify-between font-semibold text-lg">
              <span>Order Subtotal</span>
              <span>{fmtVND(subtotal)}</span>
            </div>
          </div>

          {/* --- ACTION BUTTONS (BOTTOM) --- */}
          <div className="pt-6 border-t border-stone-100 flex justify-end">
              {order.status === "Received" ? (
                  <button
                      onClick={() => setShowConfirm1(true)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded text-sm font-semibold transition-colors"
                  >
                      Cancel Order
                  </button>
              ) : (
                  <button
                      onClick={() => navigate("/events/promotion-packages")}
                      className="bg-[#112f4c] text-white px-6 py-3 text-sm font-semibold hover:bg-stone-800 transition tracking-wider shadow-md"
                  >
                      View Our Promotions
                  </button>
              )}
          </div>
        </div>
      </div>

      {/* --- MODAL 1: ARE YOU SURE? --- */}
      {showConfirm1 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md shadow-2xl">
                  <div className="p-5 bg-stone-800 text-white">
                      <h3 className="font-serif text-xl font-bold">Cancel Request</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-stone-700">Are you sure you want to cancel this order?</p>
                  </div>
                  <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
                      <button onClick={() => setShowConfirm1(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded transition">Keep Order</button>
                      <button onClick={() => { setShowConfirm1(false); setShowConfirm2(true); }} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-semibold transition">Yes, Cancel</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL 2: SEVERE WARNING --- */}
      {showConfirm2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-lg shadow-2xl border-t-4 border-red-600">
                  <div className="p-6">
                      <div className="flex items-center gap-3 mb-4 text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <h3 className="font-serif text-xl font-bold">Please Reconsider</h3>
                      </div>
                      <div className="space-y-4 text-stone-700 text-sm leading-relaxed">
                          <p>
                              Cancelling an order that has already been processed disrupts our kitchen workflow and may disturb the staff dedicated to your service.
                          </p>
                          <p className="font-semibold">
                              Frequent cancellations may negatively affect your guest credit rating and future reservation privileges.
                          </p>
                          <p>
                              Are you absolutely certain you wish to proceed?
                          </p>
                      </div>
                  </div>
                  <div className="p-5 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
                      <button onClick={() => setShowConfirm2(false)} className="text-stone-500 hover:text-stone-800 text-sm underline">No, I will keep it</button>
                      <button onClick={handleCancel} disabled={cancelling} className="px-6 py-2.5 bg-stone-800 text-white hover:bg-stone-900 font-bold tracking-wide transition shadow-md">
                          {cancelling ? "Processing..." : "I Understand, Cancel Order"}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default OrderStatus;