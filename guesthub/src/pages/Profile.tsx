import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { fetchMyBookings, fetchMyOrders } from "../lib/api";
import type { Booking, Order, BookingStatus } from "../types";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

import beachHero from "../assets/Beach front pic 1.png";
import viveGrill from "../assets/viveonceane pics/vive grill buffe outside.jpg";
import dineIn from "../assets/Dine in photo.png";
import snorkel from "../assets/Exclusive Guided Snorkeling Tour.jpg";
import mixology from "../assets/Mixology Masterclass.jpg";
import gourmet from "../assets/Gourmet Cooking Class.jpg";
import yogaImg from "../assets/Sunset Yoga & Meditation.jpg";
import chefParty from "../assets/in-villa cooking chef party.jpg";

const UpdateToast: React.FC<{ show: boolean; message: string; onClose: () => void }> = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-[#1c1917] text-white px-6 py-4 rounded-sm shadow-2xl border-l-4 border-[#d4af37] flex items-center gap-4 min-w-[300px]">
        <div className="bg-[#d4af37] rounded-full p-1">
           <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-0.5">Front Desk Update</h4>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
      </div>
    </div>
  );
};

type Section =
  | "dashboard"
  | "upcoming"
  | "past"
  | "account"
  | "orders"
  | "preferences"
  | "support";

const PRIMARY_COLOR = "bg-[#0b1a2c]";
const ACCENT_CLASS = "text-[#d4af37]";

const ADD_ONS_DETAILS = [
  { id: "halfBoard", title: "Half Board Meal Plan (HB)", description: "Daily gourmet breakfast and 3-course dinner. Price is per person, per night.", price: 35, currency: "USD", type: "per_person_per_night" as const },
  { id: "fullBoard", title: "Full Board Meal Plan (FB)", description: "Daily gourmet breakfast, lunch, and dinner. Price is per person, per night.", price: 65, currency: "USD", type: "per_person_per_night" as const },
  { id: "earlyCheckIn", title: "Guaranteed Early Check-in (10:00)", description: "Ensures early access to your room from 10:00 AM (Standard 14:00). Flat fee per stay.", price: 50, currency: "USD", type: "per_stay" as const },
  { id: "lateCheckOut", title: "Guaranteed Late Check-out (16:00)", description: "Extends departure time until 16:00 (Standard 12:00). Flat fee per stay.", price: 75, currency: "USD", type: "per_stay" as const },
  { id: "airportTransfer", title: "Luxury Airport Transfer (Return)", description: "Seamless, private sedan transfer to and from the resort.", price: 100, currency: "USD", type: "per_stay" as const },
  { id: "laundry", title: "Express Laundry Service", description: "Priority 24-hour turnaround for up to 10 items per stay.", price: 40, currency: "USD", type: "per_stay" as const },
  { id: "cleaning", title: "Deep Cleaning & Refresh", description: "One-time enhanced deep cleaning service with aromatherapy refresh.", price: 60, currency: "USD", type: "per_stay" as const },
  { id: "massage", title: "In-Residence Couple's Massage", description: "60-minute therapeutic massage for two, performed in your private suite.", price: 150, currency: "USD", type: "per_stay" as const },
  { id: "champagne", title: "Dom Pérignon Welcome Amenity", description: "A chilled bottle of 2013 Dom Pérignon awaiting your arrival.", price: 380, currency: "USD", type: "per_stay" as const },
  { id: "breakfast", title: "Daily Gourmet Breakfast Upgrade", description: "Exclusive all-day access to our a la carte dining experience for all registered guests, per night.", price: 15, currency: "USD", type: "per_person_per_night" as const },
];

const fmtUSD = (v?: number) =>
  v == null ? "—" : `${Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v))}`;
  
const fmtCurrency = (v?: number) => fmtUSD(v);

const sectionBtn = (active: boolean) =>
  `w-full text-left px-5 py-3 text-sm font-semibold tracking-wider ${
    active
      ? `bg-white/10 ${ACCENT_CLASS} border-l-4 border-[#d4af37]`
      : "text-white/80 hover:bg-white/5"
  } transition`;

type PillTone = "green" | "blue" | "amber" | "neutral" | "red" | "purple";

const StatusPill = (tone: PillTone, text: string) => {
  const map: Record<PillTone, string> = {
    green: "bg-green-100 text-green-700 border-green-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    amber: "bg-amber-100 text-amber-700 border-amber-300",
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-300",
    red: "bg-red-100 text-red-700 border-red-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider border ${map[tone]}`}
    >
      {text}
    </span>
  );
};

const getStatusTone = (status: BookingStatus | string): PillTone => {
    switch(status) {
        case "Confirmed":
        case "Checked-out":
            return "green";
        case "Checked-in":
            return "blue";
        case "Pending":
            return "amber";
        case "Pending Verification":
            return "purple";
        case "Cancelled":
        case "Declined":
            return "red";
        default:
            return "neutral";
    }
};

const getFoodStatusTone = (status: Order["status"]): PillTone => {
  const k = (status || "").toLowerCase();
  if (k.includes("completed")) return "green";
  if (k.includes("ready")) return "blue";
  if (k.includes("preparing")) return "amber";
  if (k.includes("cancelled")) return "neutral";
  return "neutral";
};

const getFoodStatusInfo = (status: Order["status"], items: Order["items"]) => {
  const totalItemCount = items.length;
  
  const topItems = items.slice(0, 3).map(item => ({
    name: item.name,
    qty: item.quantity,
    price: item.price * item.quantity,
  }));

  const itemDetails = (
    <div className="space-y-2 text-sm text-neutral-700 mt-3 border-t border-b border-neutral-100 py-3">
      <p className="font-semibold text-base mb-1 text-neutral-800">Items in Order ({totalItemCount})</p>
      {topItems.map((item, idx) => (
        <p key={idx} className="flex justify-between items-center text-sm text-neutral-600">
            <span className="font-medium text-neutral-700">{item.name} × {item.qty}</span>
            <span className="font-semibold text-neutral-800">{fmtCurrency(item.price)}</span>
        </p>
      ))}
      {totalItemCount > 3 && (
        <p className="text-xs italic text-neutral-500 pt-1">... and {totalItemCount - 3} more item(s).</p>
      )}
    </div>
  );
  
  let message;
  let linkText;
  
  switch (status) {
    case "Completed":
      message = `Your culinary experience is complete. Bon Appétit!`; 
      linkText = "Review Details";
      break;
    case "Ready":
      message = `Your butler is now en route with your order.`; 
      linkText = "Track Live";
      break;
    case "Preparing":
      message = `The chef is crafting your order with precision.`; 
      linkText = "Track Live";
      break;
    case "Cancelled":
       message = `This order has been cancelled.`;
       linkText = "Details";
       break;
    case "Received":
    default:
      message = `Order secured and routed to the kitchen.`;
      linkText = "Track Live";
      break;
  }
  
  const FoodStatusPill: React.FC<{ status: Order["status"] }> = ({ status }) => {
    const tone = getFoodStatusTone(status);
    const map: Record<PillTone, string> = {
      green: "bg-green-100 text-green-700 border-green-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      amber: "bg-amber-100 text-amber-700 border-amber-300",
      neutral: "bg-stone-200 text-stone-600 border-stone-300",
      red: "bg-red-100 text-red-700 border-red-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return (
      <span
        className={`inline-flex items-center px-4 py-1.5 text-sm font-semibold border ${map[tone]}`}
      >
        {status}
      </span>
    );
  };

  return { 
    pill: <FoodStatusPill status={status} />, 
    message: message,
    linkText: linkText,
    itemDetails: itemDetails
  };
};

function daysUntil(b: Booking) {
  const checkInDate = new Date(b.checkIn);
  const checkOutDate = new Date(b.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCheckedIn = b.status === "Checked-in";
  
  if (isCheckedIn) {
    const checkOutEnd = new Date(checkOutDate);
    checkOutEnd.setDate(checkOutEnd.getDate() + 1); 
    checkOutEnd.setHours(0, 0, 0, 0);
    
    const msRemaining = checkOutEnd.getTime() - new Date().getTime();
    const days = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } 
  
  const msUntil = checkInDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(msUntil / (1000 * 60 * 60 * 24)));
}

function bookingTotal(b: Booking): string {
  const anyB = b as any;
  let raw: number | null = null;
  
  if (anyB.notes) {
    try {
      const notesData = JSON.parse(anyB.notes);
      raw = notesData?.uiEstimateUSD ?? null;
    } catch (e) {}
  }
  
  if (raw === null) {
      raw = anyB?.total ?? anyB?.totalPrice ?? anyB?.amount ?? anyB?.price ?? null;
  }

  return raw != null && typeof raw === "number" ? fmtUSD(raw) : "—";
}

function orderTotal(o: Order): string {
  const anyO = o as any;
  const raw =
    anyO?.total ??
    anyO?.totalAmount ??
    anyO?.amount ??
    anyO?.price ??
    null;
  return raw != null && typeof raw === "number" ? fmtUSD(raw) : "—";
}

interface Promotion {
  title: string;
  description: string;
  callToAction: string;
  link: string;
  image: string;
  isAgeRestricted?: boolean;
}

const promotions: Promotion[] = [
  {
    title: "Gourmet Cooking Class 🧑‍🍳",
    description: "Master local cuisine with our Executive Chef. Hands-on experience guaranteed!",
    callToAction: "Book Now",
    link: "/experience/cooking",
    image: gourmet,
  },
  {
    title: "Mixology Masterclass 🍸 (18+)",
    description: "Craft signature cocktails with our expert mixologist. Must be 18+.",
    callToAction: "Sign Up",
    link: "/experience/mixology",
    image: mixology,
    isAgeRestricted: true,
  },
  {
    title: "Sunset Yoga & Meditation 🧘‍♀️",
    description: "Rejuvenate your mind and body with a complimentary session for Elite Guests.",
    callToAction: "View Schedule",
    link: "/experience/yoga",
    image: yogaImg,
  },
  {
    title: "Private Beachside Dinner 🍽️",
    description: "Special 3-course menu for a romantic evening right on the sand. A must-try.",
    callToAction: "Reserve Table",
    link: "/experience/dining",
    image: dineIn,
  },
  {
    title: "Exclusive Guided Snorkeling Tour 🐠",
    description: "Discover hidden coves and vibrant marine life on a guided, personalized tour.",
    callToAction: "Explore Tours",
    link: "/experience/snorkeling",
    image: snorkel,
  },
];

const PromotionSlider: React.FC = () => {
  const itemsPerView = 3;
  const base = promotions;
  const extended = React.useMemo(
    () => [...base, ...base.slice(0, itemsPerView)],
    [base]
  );
  const total = base.length;

  const [index, setIndex] = React.useState(0);
  const [withTransition, setWithTransition] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((p) => p + 1), 5000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (index === total) {
      const t = setTimeout(() => {
        setWithTransition(false);
        setIndex(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setWithTransition(true));
        });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [index, total]);

  const dots = 3;
  const activeDot = index % dots;

  return (
    <section className="border border-neutral-200 bg-white shadow overflow-hidden max-w-5xl mx-auto">
      <div className="p-6 border-b border-neutral-100">
        <h3 className="font-serif text-xl font-bold text-neutral-900">
          ✨ More Ways to Elevate Your Stay
        </h3>
      </div>

      <div className="relative overflow-hidden p-6">
        <div
          className="flex"
          style={{
            width: `${(extended.length / itemsPerView) * 100}%`,
            transform: `translateX(-${(index / extended.length) * 100}%)`,
            transition: withTransition ? "transform 500ms ease-in-out" : "none",
          }}
        >
          {extended.map((promo, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / extended.length}%` }}
            >
              <div className="border border-neutral-200 shadow-sm p-4 h-full flex flex-col">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="h-40 w-full object-cover mb-4"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{promo.title}</h4>
                  <p className="text-sm text-neutral-600 mb-4">{promo.description}</p>
                </div>
                <Link
                  to={promo.link}
                  className="block text-center px-4 py-2 font-semibold text-sm bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-200 transition"
                >
                  {promo.callToAction}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pb-4 space-x-2">
        {Array.from({ length: dots }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 border-2 border-transparent transition-all duration-300 ${
              activeDot === i ? `${PRIMARY_COLOR} ring-2 ring-offset-2 ring-[#d4af37]` : "bg-neutral-300 hover:bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

const DataField: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="border border-neutral-200 p-4 bg-neutral-50/50">
    <div className="text-neutral-500 text-sm font-medium">
      {label}
    </div>
    <div className="font-semibold text-neutral-800 break-all">
      {value || "—"}
    </div>
  </div>
);

const AddOnCard: React.FC<{ addOnId: string }> = ({ addOnId }) => {
  const addOn = ADD_ONS_DETAILS.find(a => a.id === addOnId);
  if (!addOn) return null;

  let howToUse = "";
  let links = null;

  switch(addOn.id) {
    case "halfBoard":
    case "fullBoard":
      howToUse = "Your meal plan is linked to your room profile. Simply provide your name and room number at our restaurants to redeem. This applies to all registered adults in your party.";
      links = (
        <div className="flex gap-4 mt-2">
          <Link to="/restaurants/vive-oceane" className="text-sm text-amber-700 underline hover:text-amber-500">Vive Oceane Menu</Link>
          <Link to="/restaurants/savory-sizzle" className="text-sm text-amber-700 underline hover:text-amber-500">Savory Sizzle Menu</Link>
        </div>
      );
      break;
    case "earlyCheckIn":
    case "lateCheckOut":
      howToUse = "This service is guaranteed and has been noted by our front desk team. You may proceed to the resort at your selected time.";
      break;
    case "airportTransfer":
    case "laundry":
    case "cleaning":
      howToUse = "Our concierge will contact you to confirm the necessary timing or details. Alternatively, please dial 'Concierge' from your room phone upon arrival.";
      break;
    case "massage":
      howToUse = "Our spa team will contact you to schedule your in-residence treatment. Alternatively, you may dial 'Spa' from your room phone upon arrival.";
      break;
    default:
      howToUse = "Please present your booking confirmation at the front desk to redeem this service.";
  }

  return (
    <div className="border border-neutral-200 bg-white shadow-md">
      <div className={`${PRIMARY_COLOR} text-white p-4 flex justify-between items-center`}>
        <h4 className="text-xl font-bold text-white tracking-wide">{addOn.title}</h4>
        <span className={`text-xl font-bold ${ACCENT_CLASS} flex-shrink-0 ml-4`}>{fmtUSD(addOn.price)}</span>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="pt-2">
            <p className="text-sm text-stone-600">{addOn.description}</p>
        </div>
        
        <div className="pt-3 border-t border-stone-200">
          <p className="text-sm font-bold text-stone-700 mb-2">How to Redeem:</p>
          <p className="text-sm text-stone-600 leading-relaxed">{howToUse}</p>
          {links}
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const section = (params.get("sec") as Section) || "dashboard";
  const setSection = (s: Section) => {
    const next = new URLSearchParams(params);
    next.set("sec", s);
    setParams(next, { replace: true });
  };

  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{show: boolean, msg: string}>({ show: false, msg: "" });

  React.useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const [b, o] = await Promise.all([fetchMyBookings(), fetchMyOrders()]);
        setBookings(Array.isArray(b) ? b : []);
        setOrders(Array.isArray(o) ? o : []);
      } catch {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    })();

    // IMPORTANT: Ensure this matches your server port (4000)
    const socket = io("http://localhost:4000", {
      transports: ['websocket'] // Force websocket to avoid polling issues
    });
    
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.io");
    });

    // 1. BOOKING UPDATES
    socket.on("booking:updated", (updatedBooking: Booking) => {
      setBookings(prev => {
         const exists = prev.find(b => b._id === updatedBooking._id);
         // Only update if this user actually has this booking in their list
         if (!exists) return prev;
         
         const newList = prev.map(b => b._id === updatedBooking._id ? updatedBooking : b);
         
         setToast({ show: true, msg: `Your reservation status updated to: ${updatedBooking.status}` });
         setTimeout(() => setToast({ show: false, msg: "" }), 5000);
         
         return newList;
      });
    });

    // 2. ORDER UPDATES
    socket.on("order:updated", (updatedOrder: Order) => {
      setOrders(prev => {
         const exists = prev.find(o => o._id === updatedOrder._id);
         if (!exists) return prev;
         
         const newList = prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
         
         setToast({ show: true, msg: `Your order status updated to: ${updatedOrder.status}` });
         setTimeout(() => setToast({ show: false, msg: "" }), 5000);
         
         return newList;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const activeStatuses: string[] = ["Pending", "Confirmed", "Checked-in", "Pending Verification"];
  const pastStatuses: string[] = ["Checked-out", "Declined", "Cancelled"];

  const upcoming = [...bookings]
    .filter((b) => activeStatuses.includes(b.status))
    .sort((a, b) => +new Date(a.checkIn) - +new Date(b.checkIn));
    
  const past = [...bookings]
    .filter((b) => pastStatuses.includes(b.status))
    .sort((a, b) => +new Date(a.checkIn) - +new Date(b.checkIn));
    
  const nextStay = upcoming[0];

  const activeGuestDetails = React.useMemo(() => {
    if (!nextStay || !nextStay.notes) return null;
    try {
        return JSON.parse(nextStay.notes);
    } catch (e) {
        return null;
    }
  }, [nextStay]);

  const activeAddOnIds = React.useMemo(() => {
    return activeGuestDetails?.selectedAddOns || [];
  }, [activeGuestDetails]);
  
  const currentOrder = React.useMemo(() => {
    if (orders.length === 0) return null;
    const terminalStatuses: Order["status"][] = ["Completed", "Delivered", "Cancelled"];

    const activeOrders = orders.filter(
        (o) => !terminalStatuses.includes(o.status)
    );
    if (activeOrders.length === 0) return null;

    return activeOrders.sort((a: any, b: any) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0))[0] || null;
  }, [orders]);


  if (loading)
    return (
      <p className="max-w-6xl mx-auto py-20 text-center text-xl">
        Loading your Elite Portal…
      </p>
    );
  if (error)
    return (
      <p className="max-w-6xl mx-auto py-20 text-center text-xl text-red-700">
        Error: {error}
      </p>
    );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="p-12 text-center bg-white/70">
      <p className="text-neutral-500 italic text-lg">{message}</p>
    </div>
  );

  const OrdersSection = () => {
    const sorted = [...orders].sort((a: any, b: any) => {
        return +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0);
    });

    const toneFor = (s: string): PillTone => getFoodStatusTone(s as Order["status"]);
    const toneTextClass: Record<PillTone, string> = {
      green: "text-green-700",
      blue: "text-blue-700",
      amber: "text-amber-700",
      red: "text-red-700",
      neutral: "text-stone-500",
      purple: "text-purple-700",
    };

    return (
      <section className="border border-neutral-200 bg-white shadow-lg overflow-hidden">
        <div className="relative p-6 border-b bg-[#0b1a2c] text-white">
          <h2 className="font-serif text-2xl font-bold">In-Room Dining Orders</h2>
        </div>
        {sorted.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-neutral-700 mb-6">No in-room orders yet.</p>
            <Link to="/restaurants" className={`px-6 py-3 ${PRIMARY_COLOR} text-white font-semibold hover:bg-neutral-900 transition`}>Explore Menu</Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Order</th>
                  <th className="px-6 py-3 text-left font-semibold">Placed</th>
                  <th className="px-6 py-3 text-left font-semibold">Total</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o: any) => {
                  const itemsCount = o.items?.length ?? o.qty ?? 0;
                  const placedIso = o.createdAt || o.placedAt || new Date().toISOString();
                  const totalText = orderTotal(o);
                  const tone = toneFor(o.status || "");
                  const isCancelled = o.status === "Cancelled";

                  return (
                    <tr 
                      key={o._id || o.id} 
                      className={`border-t hover:bg-neutral-50 transition cursor-pointer ${isCancelled ? 'opacity-60 bg-stone-50' : ''}`}
                      onClick={() => navigate(`/orders/${o._id}/status`)}
                    >
                      <td className="px-6 py-4 font-medium">{itemsCount} items</td>
                      <td className="px-6 py-4 text-neutral-600">{new Date(placedIso).toLocaleString()}</td>
                      <td className={`px-6 py-4 font-bold ${isCancelled ? 'text-stone-400 line-through' : 'text-neutral-800'}`}>{totalText}</td>
                      <td className={`px-6 py-4 font-semibold ${toneTextClass[tone]}`}>{o.status || "Received"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      
      <UpdateToast show={toast.show} message={toast.msg} onClose={() => setToast({ show: false, msg: "" })} />

      <div className="relative">
        <img
          src={beachHero}
          alt="Luxury beach resort view"
          className="h-60 w-full object-cover contrast-110 shadow-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 max-w-6xl mx-auto px-4 flex items-end pb-8">
          <div className="text-white">
            <p className="text-lg font-light tracking-wider opacity-90">
              Welcome back, {user?.name || "Guest"}
            </p>
            <h1 className="text-4xl font-serif font-bold tracking-wide mt-1">
              Elite Portal
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <aside className="md:w-64 w-full shrink-0">
            <div
              className="sticky top-24 border border-neutral-300 shadow-xl overflow-hidden"
              style={{
                backgroundImage: `url(${beachHero})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative z-10 bg-[#0b1a2c]/90 backdrop-blur-sm">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 border border-[#d4af37] bg-[#d4af37] text-black flex items-center justify-center font-bold text-xl ring-2 ring-[#d4af37]/50">
                      {user?.name ? user.name.trim()[0] : "G"}
                    </div>
                    <div>
                      <p className="font-semibold text-lg leading-tight text-white">
                        {user?.name || "Guest"}
                      </p>
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider border ${ACCENT_CLASS} bg-white/20 border-white/30 text-white`}>
                        Platinum Status
                      </span>
                    </div>
                  </div>
                </div>

                <nav className="space-y-0 divide-y divide-white/10">
                  <button
                    className={sectionBtn(section === "upcoming")}
                    onClick={() => setSection("upcoming")}
                  >
                    Current & Upcoming Stays
                  </button>
                  <button
                    className={sectionBtn(section === "orders")}
                    onClick={() => setSection("orders")}
                  >
                    In-Room Orders
                  </button>
                  <button
                    className={sectionBtn(section === "past")}
                    onClick={() => setSection("past")}
                  >
                    Past Bookings
                  </button>
                  <button
                    className={sectionBtn(section === "account")}
                    onClick={() => setSection("account")}
                  >
                    Personal Information
                  </button>
                  <button
                    className={sectionBtn(section === "preferences")}
                    onClick={() => setSection("preferences")}
                  >
                    Preferences
                  </button>
                  <button
                    className={sectionBtn(section === "support")}
                    onClick={() => setSection("support")}
                  >
                    Support / Concierge Chat
                  </button>
                </nav>

                <div className="border-t border-white/10 p-4">
                  <button
                    onClick={logout}
                    className="w-full py-3 font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition shadow-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-8">
            {(section === "dashboard" || section === "upcoming") && (
              <section className="border border-neutral-200 bg-white shadow-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <div className="flex items-center gap-6">
                    <h2 className="font-serif text-3xl font-bold text-neutral-900">
                        Current & Upcoming Stays
                    </h2>
                  </div>
                </div>

                {nextStay ? (
                  <>
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="relative">
                        <img
                          src={viveGrill}
                          alt="Upcoming stay room image"
                          className="h-80 w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-6 pt-20">
                          <p className="text-white/80 text-lg">Your next escape in:</p>
                          <p className="text-white text-5xl font-extrabold tracking-tight">
                            {daysUntil(nextStay)} days
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-4 flex flex-col justify-center">
                        <p className="text-xl font-serif font-bold text-neutral-800">
                          {typeof nextStay.room === "string"
                            ? nextStay.room
                            : nextStay.room?.title || "Luxury Stay"}
                        </p>
                        <div className="text-base text-neutral-600">
                          <span className="font-medium">Check-in:</span>{" "}
                          {formatDate(nextStay.checkIn)} <span className="mx-2">·</span>{" "}
                          {formatDate(nextStay.checkOut)}
                        </div>
                        <div className="flex items-center gap-3">
                          {StatusPill(
                            getStatusTone(nextStay.status),
                            nextStay.status
                          )}
                          <span className={`font-bold ${ACCENT_CLASS}`}>
                            {bookingTotal(nextStay)}
                          </span>
                        </div>
                        <div className="pt-2 flex flex-wrap gap-3">
                          <Link
                            to={`/bookings/${nextStay._id}`}
                            className={`px-6 py-3 font-semibold text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition shadow-sm`}
                          >
                            View/Modify Booking
                          </Link>
                          {nextStay.status === "Pending Verification" && (
                             <Link 
                                to={`/booking/verify?id=${nextStay._id}`}
                                className="px-6 py-3 font-semibold text-sm bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
                             >
                                Check Email to Verify
                             </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {currentOrder && (
                      <div className="border-t border-neutral-200 mt-8 pt-8">
                        <div className="p-6 pt-0">
                            <h3 className="font-serif text-3xl font-bold text-stone-800 mb-4">
                                In-Residence Dining Status
                            </h3>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-0 border border-neutral-200 mx-6 mb-6 bg-white shadow-md">
                            <div className="p-6 space-y-4 flex flex-col justify-center">
                                <div className="flex items-center space-x-3 pb-2">
                                    {getFoodStatusInfo(currentOrder.status, currentOrder.items).pill}
                                </div>
                                
                                {getFoodStatusInfo(currentOrder.status, currentOrder.items).itemDetails}
                                
                                <p className="text-sm font-medium text-neutral-700 pt-1">
                                    {getFoodStatusInfo(currentOrder.status, currentOrder.items).message}
                                </p>
                                
                                <Link
                                    to={`/orders/${currentOrder._id}/status`}
                                    className={`px-6 py-3 font-semibold text-sm text-white ${PRIMARY_COLOR} hover:bg-neutral-900 transition max-w-xs text-center`}
                                >
                                    {getFoodStatusInfo(currentOrder.status, currentOrder.items).linkText}
                                </Link>
                            </div>

                            <div className="relative">
                                <img
                                    src={chefParty}
                                    alt="Chef preparing order in residence"
                                    className="h-80 w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <p className="text-white text-xl font-serif font-bold text-center">
                                        Bon Appétit!
                                    </p>
                                </div>
                            </div>
                        </div>
                      </div>
                    )}

                  </>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                      ✈️
                    </div>
                    <h3 className="text-xl font-serif font-bold text-neutral-800 mb-2">Your Next Journey Awaits</h3>
                    <p className="text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
                      You currently have no upcoming reservations. The sun, sand, and sea are ready for your return.
                    </p>
                    <Link 
                      to="/rooms" 
                      className={`px-8 py-3 ${PRIMARY_COLOR} text-white font-semibold hover:bg-neutral-900 transition shadow-md uppercase tracking-wider text-sm`}
                    >
                      Plan Your Stay
                    </Link>
                  </div>
                )}
              </section>
            )}

            {section === "past" && (
              <section className="border border-neutral-200 bg-white shadow-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h2 className="font-serif text-2xl font-bold text-neutral-900">
                    Past Bookings
                  </h2>
                </div>
                {past.length === 0 ? (
                  <EmptyState message="No past bookings to show." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left bg-neutral-50/70 border-b border-neutral-100">
                          <th className="px-6 py-4 font-semibold text-neutral-700">
                            Resort / Room
                          </th>
                          <th className="px-6 py-4 font-semibold text-neutral-700">
                            Dates
                          </th>
                          <th className="px-6 py-4 font-semibold text-neutral-700">
                            Status
                          </th>
                          <th className="px-6 py-4 font-semibold text-neutral-700">
                            Total Price
                          </th>
                          <th className="px-6 py-4 font-semibold text-neutral-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {past.map((b) => (
                          <tr
                            key={b._id}
                            className="border-b border-neutral-100 hover:bg-neutral-50 transition"
                          >
                            <td className="px-6 py-4 font-medium">
                              {typeof b.room === "string"
                                ? b.room
                                : b.room?.title || "Room"}
                            </td>
                            <td className="px-6 py-4 text-neutral-600">
                              {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                            </td>
                            <td className="px-6 py-4">
                              {StatusPill(getStatusTone(b.status), b.status)}
                            </td>
                            <td className="px-6 py-4 font-bold text-neutral-800">
                              {bookingTotal(b)}
                            </td>
                            <td className="px-6 py-4 space-x-3">
                              <Link
                                to={`/bookings/${b._id}`}
                                className="text-sm underline text-neutral-700"
                              >
                                View Details
                              </Link>
                              <Link
                                to="/rooms"
                                className="text-sm underline text-neutral-700"
                              >
                                Re-book
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {section === "account" && (
              <section className="border border-neutral-200 bg-white shadow-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h2 className="font-serif text-2xl font-bold text-neutral-900">
                    Personal Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <DataField 
                      label="Full Name" 
                      value={user?.name || `${activeGuestDetails?.title || ''} ${activeGuestDetails?.firstName || ''} ${activeGuestDetails?.lastName || ''}`.trim()} 
                    />
                    <DataField 
                      label="Email Address" 
                      value={user?.email || activeGuestDetails?.email} 
                    />
                    <DataField 
                      label="Contact Phone" 
                      value={activeGuestDetails ? activeGuestDetails.phone : "Will be updated with your next booking"} 
                    />
                    <DataField 
                      label="Country of Residence" 
                      value={activeGuestDetails ? activeGuestDetails.country : "Will be updated with your next booking"} 
                    />
                  </div>
                  {!activeGuestDetails && (
                     <div className="pt-2 text-center">
                        <p className="text-xs text-stone-500 italic">Guest details are refreshed with every new reservation to ensure accuracy.</p>
                     </div>
                  )}
                </div>
              </section>
            )}

            {section === "orders" && <OrdersSection />}

            {section === "preferences" && (
              <section className="border border-neutral-200 bg-white shadow-xl overflow-hidden">
                <div className={`${PRIMARY_COLOR} p-6 border-b border-neutral-100`}>
                  <h2 className="font-serif text-2xl font-bold text-white">
                    Personalized Preferences
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {activeGuestDetails ? (
                    <>
                        <div>
                            <h3 className="text-xl font-semibold text-stone-800 mb-4">Your Purchased Add-ons</h3>
                            <div className="space-y-4">
                            {activeAddOnIds.length > 0 ? (
                                activeAddOnIds.map((id: string) => <AddOnCard key={id} addOnId={id} />)
                            ) : (
                                <EmptyState message="No add-on preferences saved from your last booking." />
                            )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-stone-200">
                            <div className={`${PRIMARY_COLOR} text-white p-3 -mx-6 -mt-6 mb-4`}>
                                <h3 className="text-xl font-bold text-white">Your Concierge Notes</h3>
                            </div>
                            {activeGuestDetails?.freeNotes ? (
                                <DataField 
                                    label="Notes from last booking" 
                                    value={activeGuestDetails.freeNotes} 
                                />
                                ) : (
                                <EmptyState message="No specific notes on file." />
                            )}
                        </div>
                    </>
                  ) : (
                    <div className="p-12 text-center">
                       <p className="text-stone-500 italic text-lg mb-4">
                         Enhancements and concierge notes will appear here once you have an active reservation.
                       </p>
                       <Link to="/rooms" className="text-amber-700 underline font-semibold">Start Planning</Link>
                    </div>
                  )}
                </div>
              </section>
            )}

            {section === "support" && (
              <section className="border border-neutral-200 bg-white shadow-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                  <h2 className="font-serif text-2xl font-bold text-neutral-900">
                    Concierge & Support
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="tel:+842363558888"
                      className="border border-neutral-400 text-neutral-800 px-6 py-3 font-semibold text-sm hover:bg-neutral-100 transition shadow-sm"
                    >
                      Call Concierge
                    </a>
                    <a
                      href="mailto:support@resort.com"
                      className="border border-neutral-400 text-neutral-800 px-6 py-3 font-semibold text-sm hover:bg-neutral-100 transition shadow-sm"
                    >
                      Email Support
                    </a>
                    <button
                      className={`font-semibold text-sm px-6 py-3 text-white ${PRIMARY_COLOR} hover:bg-neutral-900 transition shadow-md`}
                    >
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </section>
            )}
            
            <PromotionSlider />
          </main>
        </div>
        
        
      </div>

      <footer className="mt-10 border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-neutral-600 flex flex-wrap gap-6">
          <span>Secure & Encrypted Data</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};

export default Profile;