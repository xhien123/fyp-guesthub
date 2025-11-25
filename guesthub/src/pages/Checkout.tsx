import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder, fetchMyActiveBooking } from "../lib/api";
import api from "../lib/api";
import type { BookingStatus, Order, Booking } from "../types";
import INROOM_DINING_IMAGE from "../assets/Inroomdining.jpg";
import logoUrl from "../assets/Guesthub logo.jpg"; // Ensure this exists or remove if not needed
import beachUrl from "../assets/Beach view 2.jpg";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

const toAbs = (p?: string) =>
  !p ? "" : p.startsWith("http") ? p : `${API_BASE}${p}`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop";

// --- ELEGANT ICONS (Styled) ---
const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Note: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Utensils: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 3v1.5M12 3v1.5m-7.5 6v7.5a2.25 2.25 0 002.25 2.25h3a2.25 2.25 0 002.25-2.25V10.5m-1.5 6H21m-4.5 0h-4.5m4.5 0v3.75m0-9.75h1.5A2.25 2.25 0 0121 12.75v6.75" />
    </svg>
  )
};

// --- LUXURY MODAL (Replaces Side Popup) ---
const CheckoutSidePopup: React.FC<{
  open: boolean;
  onClose: () => void;
  status: BookingStatus | null;
}> = ({ open, onClose, status }) => {
  const navigate = useNavigate();
  if (!open) return null;

  const [title, message, btnText, action] = status === "Pending" || status === "Confirmed"
    ? [
        "Check-In Required",
        `In-residence dining is exclusively available for guests who have checked in. Your booking is currently '${status}'.`,
        "View Reservations",
        () => navigate("/profile?sec=upcoming")
      ]
    : [
        "Reservation Required",
        "Experience our culinary excellence in the comfort of your suite. Please confirm a booking to proceed.",
        "Check Availability",
        () => navigate("/book")
      ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#1c1917]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-none shadow-2xl border border-[#D4AF37]/30 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-[#D4AF37]"></div>
        <div className="h-40 w-full bg-cover bg-center grayscale opacity-90" style={{ backgroundImage: `url(${beachUrl})` }} />
        <div className="p-8 text-center">
           <h3 className="text-2xl font-serif text-[#1c1917] mb-2">{title}</h3>
           <div className="h-px w-12 bg-[#D4AF37] mx-auto mb-4"></div>
           <p className="text-stone-600 font-light leading-relaxed mb-8">{message}</p>
           
           <div className="space-y-3">
             <button onClick={() => { onClose(); action(); }} className="w-full bg-[#1c1917] text-[#D4AF37] py-3.5 text-sm uppercase tracking-widest hover:bg-stone-900 transition-colors">
               {btnText}
             </button>
             <button onClick={() => { onClose(); navigate("/restaurants"); }} className="w-full bg-transparent text-stone-500 py-3 text-sm hover:text-stone-800 transition-colors">
               Return to Menu
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- ELEGANT QUANTITY SELECTOR ---
const Qty: React.FC<{
  value: number;
  onChange: (n: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}> = ({ value, onChange, onRemove, disabled }) => (
  <div className="flex items-center gap-3">
    {value === 1 ? (
        <button type="button" onClick={onRemove} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 border border-stone-200 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <Icons.Trash />
        </button>
    ) : (
        <button type="button" disabled={disabled} onClick={() => onChange(value - 1)} className="w-8 h-8 rounded-full flex items-center justify-center border border-stone-200 text-stone-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">-</button>
    )}
    <span className="text-stone-900 font-serif w-4 text-center">{value}</span>
    <button type="button" disabled={disabled} onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full flex items-center justify-center border border-stone-200 text-stone-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">+</button>
  </div>
);

// --- MAIN COMPONENT ---
const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items, clearCart, updateItemQty, setItemNote } = useCart();
  const navigate = useNavigate();

  // State
  const [guestName, setGuestName] = React.useState("");
  const [roomNumber, setRoomNumber] = React.useState("");
  const [deliveryOption, setDeliveryOption] = React.useState<"asap" | "later">("asap");
  const [scheduledTime, setScheduledTime] = React.useState("");
  const [cutlerySets, setCutlerySets] = React.useState(1);
  const [addSauces, setAddSauces] = React.useState(false);
  const [generalNote, setGeneralNote] = React.useState("");
  const [openItemNote, setOpenItemNote] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(true);
  
  const [activeOrder, setActiveOrder] = React.useState<Order | null>(null);
  const [realTimeBooking, setRealTimeBooking] = React.useState<Booking | null>(null);

  const justPlacedRef = React.useRef(false);

  // --- INITIAL DATA FETCH ---
  React.useEffect(() => {
    const verifyStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }
      try {
        const [ordersRes, bookingData] = await Promise.all([
            api.get('/api/orders/me').catch(() => ({ data: [] })),
            fetchMyActiveBooking().catch(() => null)
        ]);

        const myOrders = ordersRes.data as Order[];
        const active = myOrders.find(o => ["Received", "Preparing", "Ready"].includes(o.status));
        if (active) setActiveOrder(active);

        if (bookingData) {
            setRealTimeBooking(bookingData);
            if (user.name) setGuestName(user.name);
            if (bookingData.room) {
                const rTitle = typeof bookingData.room === 'object' ? bookingData.room.title : '';
                if (rTitle) setRoomNumber(rTitle);
            }
        }
      } catch (e) {
        console.error("Error verifying checkout status:", e);
      } finally {
        setCheckingStatus(false);
      }
    };

    verifyStatus();
  }, [user]);

  // Calculations
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const serviceFee = subtotal * 0.1;
  const tax = (subtotal + serviceFee) * 0.08;
  const total = subtotal + serviceFee + tax;

  React.useEffect(() => {
    justPlacedRef.current = false;
  }, []);

  React.useEffect(() => {
    if (!items.length && !loading && !justPlacedRef.current) {
      navigate("/restaurants");
    }
  }, [items.length, loading, navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!realTimeBooking) {
      setPopupOpen(true);
      return;
    }

    if (!guestName.trim()) { setError("Guest identification is required."); return; }
    if (!roomNumber.trim()) { setError("Residence confirmation is required."); return; }
    if (deliveryOption === "later" && !scheduledTime) { setError("Please select a preferred delivery time."); return; }

    let deliveryDetails = deliveryOption === "asap" ? "Deliver As Soon As Possible." : `Deliver at scheduled time: ${scheduledTime}.`;
    const preferences = [`Cutlery: ${cutlerySets === 0 ? "None" : `${cutlerySets} set(s)`}`, addSauces ? "Include extra sauces" : null].filter(Boolean).join(". ");
    const fullNote = `---
Guest Name: ${guestName}
Delivery: ${deliveryDetails}
Preferences: ${preferences}
General Note: ${generalNote || "N/A"}
---`;

    try {
      setLoading(true);
      const created = await placeOrder({
        items: items.map((i) => ({
          _id: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes || undefined,
        })),
        service: "room_delivery",
        payment: "charge_to_room",
        roomNumber: roomNumber.trim(),
        note: fullNote,
      });
      justPlacedRef.current = true;
      clearCart();
      navigate(`/orders/${created._id}/status`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "We encountered an issue processing your request.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        <p className="mt-4 text-[#1c1917] font-serif tracking-widest text-sm uppercase">Verifying Residence...</p>
    </div>
  );

  // --- ACTIVE ORDER BLOCKER ---
  if (activeOrder) {
    return (
      <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-[#1c1917]/90 backdrop-blur-md p-6">
        <div className="w-full max-w-lg bg-white shadow-2xl animate-in zoom-in duration-500 border border-[#D4AF37]">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#fafaf9] rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
                <Icons.Clock />
            </div>
            <h2 className="text-2xl font-serif text-[#1c1917]">Order In Progress</h2>
            <div className="h-px w-16 bg-[#D4AF37] mx-auto opacity-50" />
            <p className="text-stone-600 font-light leading-relaxed">
              We are currently preparing your previous order (Status: <strong className="text-[#1c1917]">{activeOrder.status}</strong>). 
              To ensure exceptional service standards, we kindly ask that you await its arrival before placing another request.
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => navigate("/restaurants")}
              className="py-4 font-serif text-stone-500 hover:text-[#1c1917] hover:bg-stone-50 transition border-r border-stone-100"
            >
              Browse Menu
            </button>
            <button
              type="button"
              onClick={() => navigate(`/orders/${activeOrder._id}/status`)}
              className="py-4 font-serif text-[#D4AF37] hover:text-[#b8860b] hover:bg-[#fffcf5] transition font-medium"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- EMPTY CART ---
  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-lg">
           <h1 className="text-4xl font-serif text-[#1c1917]">Your Tray is Empty</h1>
           <p className="text-stone-500 font-light">Explore our culinary offerings to curate your perfect in-room dining experience.</p>
           <button onClick={() => navigate("/restaurants")} className="inline-block border-b border-[#D4AF37] text-[#1c1917] pb-1 uppercase tracking-widest text-xs font-bold hover:text-[#D4AF37] transition-colors">
             View Culinary Collection
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen text-[#1c1917] font-sans selection:bg-[#D4AF37] selection:text-white pb-20">
        <style>{`
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

      {/* HEADER */}
      <div className="relative h-64 bg-[#1c1917] overflow-hidden">
         <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${INROOM_DINING_IMAGE})` }}></div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent"></div>
         <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 container max-w-7xl mx-auto">
             <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-xs font-bold mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>In-Residence Dining</p>
             <h1 className="text-4xl md:text-5xl font-serif text-white font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {getGreeting()}, {guestName.split(" ")[0] || "Guest"}
             </h1>
         </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: FORM DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. GUEST DETAILS */}
            <div className="bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                    <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"><Icons.Key /></span>
                    <h2 className="text-xl font-serif text-[#1c1917]">Residence Confirmation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Registered Guest</label>
                        <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 border-b border-stone-200 group-hover:border-[#D4AF37] transition-colors">
                            <Icons.User />
                            <input 
                                value={guestName} 
                                onChange={(e) => setGuestName(e.target.value)}
                                className="bg-transparent w-full outline-none text-stone-800 font-medium placeholder-stone-400"
                                placeholder="Guest Name"
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Suite Number</label>
                        <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 border-b border-stone-200 group-hover:border-[#D4AF37] transition-colors">
                            <Icons.Key />
                            <input 
                                value={roomNumber} 
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="bg-transparent w-full outline-none text-stone-800 font-medium placeholder-stone-400"
                                placeholder="Room No."
                            />
                        </div>
                    </div>
                </div>
                {!user && <p className="text-xs text-stone-400 mt-3 italic">*Please ensure these details match your active reservation.</p>}
            </div>

            {/* 2. ORDER ITEMS */}
            <div className="bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                    <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"><Icons.Utensils /></span>
                    <h2 className="text-xl font-serif text-[#1c1917]">Your Selection</h2>
                </div>
                <div className="space-y-6">
                    {items.map((i) => (
                        <div key={i._id} className="flex gap-5 items-start">
                            <img src={toAbs(i.photo) || FALLBACK_IMAGE} alt={i.name} className="w-20 h-20 object-cover shadow-md" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-serif text-[#1c1917] truncate">{i.name}</h3>
                                <p className="text-[#D4AF37] text-sm mb-2">${i.price.toFixed(2)}</p>
                                {openItemNote === i._id ? (
                                    <textarea 
                                        autoFocus
                                        value={i.notes || ""} 
                                        onChange={(e) => setItemNote(i._id, e.target.value)} 
                                        onBlur={() => setOpenItemNote(null)}
                                        placeholder="Special instructions for the chef..."
                                        className="w-full text-sm bg-stone-50 border-none resize-none p-3 text-stone-600 focus:ring-1 focus:ring-[#D4AF37]"
                                        rows={2}
                                    />
                                ) : (
                                    <button type="button" onClick={() => setOpenItemNote(i._id)} className="text-xs text-stone-400 hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                                        <Icons.Note /> {i.notes ? <span className="text-stone-600 italic">"{i.notes}"</span> : "Add Special Request"}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-semibold text-lg">${(i.price * i.quantity).toFixed(2)}</span>
                                <Qty value={i.quantity} onChange={(qty) => updateItemQty(i._id, qty)} onRemove={() => updateItemQty(i._id, 0)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. DELIVERY & PREFERENCES */}
            <div className="bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                    <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"><Icons.Clock /></span>
                    <h2 className="text-xl font-serif text-[#1c1917]">Delivery & Service</h2>
                </div>
                
                <div className="space-y-8">
                    {/* Time */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-stone-400 mb-3">Preferred Time</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button" 
                                onClick={() => setDeliveryOption("asap")}
                                className={`p-4 border text-left transition-all duration-300 ${deliveryOption === "asap" ? "border-[#D4AF37] bg-[#fffcf5]" : "border-stone-200 hover:border-stone-300"}`}
                            >
                                <span className={`block text-sm font-bold ${deliveryOption === "asap" ? "text-[#1c1917]" : "text-stone-500"}`}>Immediate Service</span>
                                <span className="text-xs text-stone-400">Est. 30-45 minutes</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setDeliveryOption("later")}
                                className={`p-4 border text-left transition-all duration-300 ${deliveryOption === "later" ? "border-[#D4AF37] bg-[#fffcf5]" : "border-stone-200 hover:border-stone-300"}`}
                            >
                                <span className={`block text-sm font-bold ${deliveryOption === "later" ? "text-[#1c1917]" : "text-stone-500"}`}>Schedule for Later</span>
                                <span className="text-xs text-stone-400">Select specific time</span>
                            </button>
                        </div>
                        {deliveryOption === "later" && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <input 
                                    type="time" 
                                    value={scheduledTime} 
                                    onChange={(e) => setScheduledTime(e.target.value)} 
                                    className="w-full p-3 border border-stone-300 focus:border-[#D4AF37] outline-none text-stone-800 bg-transparent"
                                />
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-3">Silverware</label>
                            <div className="flex items-center gap-2">
                                {[0, 1, 2, 3, 4].map((num) => (
                                    <button 
                                        key={num} 
                                        type="button" 
                                        onClick={() => setCutlerySets(num)}
                                        className={`w-10 h-10 border flex items-center justify-center transition-all ${cutlerySets === num ? "bg-[#1c1917] text-[#D4AF37] border-[#1c1917]" : "border-stone-200 text-stone-500 hover:border-[#D4AF37]"}`}
                                    >
                                        {num === 0 ? "✕" : num}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-2">Indicate number of guests dining.</p>
                         </div>
                         
                         <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-3">Accompaniments</label>
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${addSauces ? "bg-[#1c1917] border-[#1c1917]" : "border-stone-300"}`}>
                                    {addSauces && <span className="text-[#D4AF37] text-xs">✓</span>}
                                </div>
                                <input type="checkbox" className="hidden" checked={addSauces} onChange={(e) => setAddSauces(e.target.checked)} />
                                <div>
                                    <span className={`text-sm font-medium transition-colors ${addSauces ? "text-[#1c1917]" : "text-stone-500 group-hover:text-stone-800"}`}>Standard Condiments</span>
                                    <p className="text-xs text-stone-400">Includes Ketchup, Mayo, Chili Sauce</p>
                                </div>
                            </label>
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Concierge Notes</label>
                        <textarea 
                            value={generalNote} 
                            onChange={(e) => setGeneralNote(e.target.value)} 
                            placeholder="Any specific requests for delivery or entry..." 
                            rows={3} 
                            className="w-full bg-stone-50 border-b border-stone-200 p-4 outline-none focus:border-[#D4AF37] transition-colors resize-none text-sm text-stone-700 placeholder-stone-400" 
                        />
                    </div>
                </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY RECEIPT */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border-t-4 border-[#D4AF37] animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="font-serif text-2xl text-[#1c1917] mb-6">Order Summary</h3>
                
                <div className="space-y-3 text-sm text-stone-600 border-b border-dashed border-stone-200 pb-6 mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Service Charge (10%)</span>
                        <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <span className="font-serif text-lg text-[#1c1917]">Total</span>
                    <span className="font-serif text-3xl text-[#1c1917]">${total.toFixed(2)}</span>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 text-xs mb-4 border-l-2 border-red-500">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading || items.length === 0}
                    className="group relative w-full overflow-hidden bg-[#1c1917] text-white py-4 px-6 transition-all hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold text-[#D4AF37]">
                        {loading ? "Processing..." : "Confirm & Charge Room"}
                    </span>
                </button>
                
                <p className="text-center text-[10px] text-stone-400 mt-4 leading-normal">
                    By confirming, you authorize a charge of <strong>${total.toFixed(2)}</strong> to Residence <strong>{roomNumber || "..."}</strong>. Gratuity is included.
                </p>
                
                <div className="mt-6 flex justify-center">
                    <img src={logoUrl} alt="Logo" className="h-6 opacity-30 grayscale" /> 
                </div>
            </div>
          </div>

        </form>
      </div>
      
      <CheckoutSidePopup open={popupOpen} onClose={() => setPopupOpen(false)} status={realTimeBooking?.status || null} />
    </div>
  );
};

export default Checkout;