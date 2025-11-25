import React from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import type { Order } from "../types";

const getStatusClasses = (status: Order["status"]) => {
  switch (status) {
    case "Delivered":
    case "Completed":
      return "bg-green-100 text-green-800 border-green-300";
    case "Ready":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "Preparing":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Received":
      return "bg-stone-100 text-stone-800 border-stone-300";
    default:
      return "bg-stone-200 text-stone-700 border-stone-300";
  }
};

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const fmtVND = (v: number) =>
    `${Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(v)}`;

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/orders/${id}`, {
          withCredentials: true,
        });
        setOrder(res.data as Order);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading)
    return (
      <div className="container max-w-4xl py-20 text-center mx-auto">
        <h1 className="text-xl font-light tracking-tight text-neutral-800">
          Retrieving Order Receipt...
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

  const placedAt = order.createdAt ? new Date(order.createdAt) : null;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const serviceFee = subtotal * 0.1;
  const tax = (subtotal + serviceFee) * 0.08;
  const grandTotal = subtotal + serviceFee + tax;

  const displayMethod = (o: Order) => {
    if (o.service === "room_delivery") return "Residence Delivery";
    if (o.service === "dine_in") return "Dine-in Reservation";
    if ((o as any).method === "room") return "Residence Delivery";
    return "Dine-in Reservation";
  };

  return (
    <div className="bg-neutral-50/50 min-h-screen">
      <div className="container max-w-4xl py-16 space-y-10 mx-auto">
        <div className="flex items-center justify-between border-b border-stone-300 pb-4">
          <h1 className="font-serif text-5xl font-extralight italic text-stone-900">
            Order Receipt
          </h1>
          <div className="flex gap-3">
            <Link
              to={`/orders/${order._id}/status`}
              className="border border-stone-300 text-stone-700 px-6 py-3 text-sm font-semibold hover:bg-stone-100 transition tracking-wider"
            >
              View Live Status
            </Link>
            <Link
              to={`/orders/${order._id}`}
              className="bg-[#112f4c] text-white px-6 py-3 text-sm font-semibold hover:bg-stone-900 transition tracking-wider"
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

        <div className="border border-stone-200 bg-white shadow-xl p-8 space-y-8">
          <div className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div>
              <div className="text-sm text-stone-500 uppercase tracking-wider">
                Order ID
              </div>
              <div className="font-medium text-stone-800 text-lg">
                {order._id}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-4 py-2 text-sm font-semibold border ${getStatusClasses(
                  order.status
                )}`}
              >
                Status: {order.status}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 border-b border-stone-200 pb-6">
            <div className="border border-stone-200 p-4 bg-stone-50">
              <div className="text-xs text-stone-500 uppercase tracking-wider">
                Service Method
              </div>
              <div className="font-semibold capitalize text-stone-800 text-lg">
                {displayMethod(order)}
              </div>
            </div>
            <div className="border border-stone-200 p-4 bg-stone-50">
              <div className="text-xs text-stone-500 uppercase tracking-wider">
                Residence / Table
              </div>
              <div className="font-semibold text-stone-800 text-lg">
                {order.service === "room_delivery" ||
                (order as any).method === "room"
                  ? order.roomNumber || "—"
                  : "Reserved"}
              </div>
            </div>
            <div className="border border-stone-200 p-4 bg-stone-50">
              <div className="text-xs text-stone-500 uppercase tracking-wider">
                Placed At
              </div>
              <div className="font-semibold text-stone-800 text-lg">
                {placedAt ? placedAt.toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-stone-800">
            Order Items Summary
          </h2>
          {order.items.length === 0 ? (
            <p className="text-stone-600">No items in this order.</p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {order.items.map((it: any, idx: number) => (
                <li
                  key={it._id || `${it.name}-${idx}`}
                  className="py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                >
                  <div className="flex-1 pr-6">
                    <div className="font-semibold text-stone-800 text-lg">
                      {it.name} × {it.quantity}
                    </div>
                    {it.notes && it.notes.trim() !== "" && (
                      <div className="mt-1 text-xs text-amber-800 italic bg-amber-50 border-l-2 border-amber-300 px-2 py-1 max-w-full overflow-hidden">
                        Guest Note: {it.notes}
                      </div>
                    )}
                  </div>
                  <div className="ml-0 sm:ml-4 font-bold text-xl text-stone-900">
                    {fmtVND(it.price * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border border-stone-300 bg-neutral-50 p-6 space-y-3">
            <h3 className="text-lg font-semibold text-stone-800">
              Total Breakdown
            </h3>
            <div className="flex justify-between text-base text-stone-600">
              <span>Subtotal (Items)</span>
              <span>{fmtVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base text-stone-600">
              <span>Service Fee (10%)</span>
              <span>{fmtVND(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-base text-stone-600">
              <span>VAT / Tax (8%)</span>
              <span>{fmtVND(tax)}</span>
            </div>
            <div className="mt-4 border-t border-stone-300 pt-3 flex items-center justify-between font-bold text-2xl text-stone-900">
              <span>Grand Total</span>
              <span>{fmtVND(grandTotal)}</span>
            </div>
            <div className="text-xs text-stone-500 pt-2">
              Payment Method: Charge to Residence Account
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 justify-center">
          <Link
            to="/restaurants"
            className="bg-[#112f4c] text-white px-8 py-3 text-sm font-semibold hover:bg-stone-900 transition tracking-wider"
          >
            Order More Food
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;