import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchRooms, fetchRoom, type RoomsQuery, createBooking } from "../lib/api";
import type { Room } from "../types";
import { useAuth } from "../context/AuthContext";

import DeluxeOceanView from "../assets/Rooms pic/deluxe-ocean-view.jpg";
import FamilySuite from "../assets/Rooms pic/FAMILY SUITE.jpg";
import GardenBungalow from "../assets/Rooms pic/GARDEN BUNGALOW.jpg";
import PlungePoolVilla from "../assets/Rooms pic/plunge-pool.jpg";
import RoyalSuite from "../assets/Rooms pic/royal-suite-living-room.jpg";
import StandardTwin from "../assets/Rooms pic/STANDARD TWIN.jpg";
import PresidentialRoom from "../assets/Rooms pic/presidential-suite-living-room.jpg";
import JuniorSuite from "../assets/Rooms pic/JuniorSuite.jpg";
import Superior from "../assets/Rooms pic/Superior.jpg";

const ROOM_ASSETS: Record<string, string> = {
  "DELUXE OCEAN VIEW": DeluxeOceanView,
  "FAMILY SUITE": FamilySuite,
  "GARDEN BUNGALOW": GardenBungalow,
  "STANDARD TWIN": StandardTwin,
  "PLUNGE POOL VILLA": PlungePoolVilla,
  "ROYAL SUITE": RoyalSuite,
  "PRESIDENTIAL ROOM": PresidentialRoom,
  "JUNIOR SUITE": JuniorSuite,
  "SUPERIOR": Superior,
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop";

const COUNTRIES = [
  "Vietnam","United States","United Kingdom","France","Germany","Japan","Korea, Republic of",
  "Singapore","Thailand","Australia","Canada","China","India","Italy","Spain","Malaysia",
  "Philippines","Indonesia","United Arab Emirates","Qatar"
];

const TITLES = ["Mr.", "Ms.", "Mx."];

const ADD_ONS = [
  { id: "halfBoard", title: "Half Board Meal Plan (HB)", description: "Daily gourmet breakfast and 3-course dinner. Price is per person, per night.", price: 35, currency: "USD", type: "per_person_per_night" as const },
  { id: "fullBoard", title: "Full Board Meal Plan (FB)", description: "Daily gourmet breakfast, lunch, and dinner. Price is per person, per night.", price: 65, currency: "USD", type: "per_person_per_night" as const },
  { id: "earlyCheckIn", title: "Guaranteed Early Check-in (10:00)", description: "Ensures early access to your room from 10:00 AM (Standard 14:00). Flat fee per stay.", price: 50, currency: "USD", type: "per_stay" as const },
  { id: "lateCheckOut", title: "Guaranteed Late Check-out (16:00)", description: "Extends departure time until 16:00 (Standard 12:00). Flat fee per stay.", price: 75, currency: "USD", type: "per_stay" as const },
  { id: "airportTransfer", title: "Luxury Airport Transfer (Return)", description: "Seamless, private sedan transfer to and from the resort.", price: 100, currency: "USD", type: "per_stay" as const },
  { id: "laundry", title: "Express Laundry Service", description: "Priority 24-hour turnaround for up to 10 items per stay.", price: 40, currency: "USD", type: "per_stay" as const },
  { id: "cleaning", title: "Deep Cleaning & Refresh", description: "One-time enhanced deep cleaning service with aromatherapy refresh.", price: 60, currency: "USD", type: "per_stay" as const },
];

const todayDateLocal = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const addDaysDateLocal = (dateStr: string, n: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const nightsBetween = (inDate?: string, outDate?: string) => {
  if (!inDate || !outDate) return 0;
  const dateA = new Date(inDate).setHours(0, 0, 0, 0);
  const dateB = new Date(outDate).setHours(0, 0, 0, 0);
  const diff = (dateB - dateA) / (1000 * 60 * 60 * 24);
  return Math.max(0, diff);
};

const fmtUSD = (v?: number) =>
  v == null ? "—" : `${Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v))}`;

const getRoomImage = (r: Room | null): string => {
  if (!r) return FALLBACK_IMG;
  const key = (r.title || (r as any).name || "").toUpperCase();
  if (key && ROOM_ASSETS[key]) return ROOM_ASSETS[key];
  return (Array.isArray(r.photos) && r.photos[0]) ? r.photos[0] : FALLBACK_IMG;
};

const Book: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedRoomId = params.get("roomId") || "";

  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = React.useState(true);
  const [roomsError, setRoomsError] = React.useState<string | null>(null);

  const [roomId, setRoomId] = React.useState(preselectedRoomId);
  const [room, setRoom] = React.useState<Room | null>(null);

  const [checkInDate, setCheckInDate] = React.useState(todayDateLocal());
  const [checkOutDate, setCheckOutDate] = React.useState(addDaysDateLocal(todayDateLocal(), 1));
  
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [childrenAges, setChildrenAges] = React.useState<number[]>([]);

  const [title, setTitle] = React.useState(TITLES[1]);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [nationality] = React.useState("");
  const [country, setCountry] = React.useState("Vietnam");
  const [notesFree, setNotesFree] = React.useState("");

  const [promo, setPromo] = React.useState("");
  const [loyalty, setLoyalty] = React.useState("");

  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([]);
  const [policyAccepted, setPolicyAccepted] = React.useState(false); 
  
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
        setEmail(user.email || "");
        if (user.name) {
            const parts = user.name.split(" ");
            if (parts.length > 1) {
                setLastName(parts.pop() || ""); 
                setFirstName(parts.join(" ")); 
            } else {
                setFirstName(user.name);
            }
        }
    }
  }, [user]);

  React.useEffect(() => {
    const load = async () => {
      setRoomsLoading(true);
      setRoomsError(null);
      try {
        const q: RoomsQuery = {};
        const res = await fetchRooms(q);
        const list: Room[] = Array.isArray(res) ? res : res?.rooms || [];
        setRooms(list);
      } catch (e: any) {
        setRoomsError(e?.response?.data?.error || "Failed to load rooms");
      } finally {
        setRoomsLoading(false);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!roomId) {
      setRoom(null);
      return;
    }
    let cancelled = false;
    const loadOne = async () => {
      try {
        const r = await fetchRoom(roomId);
        if (!cancelled) setRoom(r ?? null);
      } catch {
        if (!cancelled) setRoom(null);
      }
    };
    loadOne();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  React.useEffect(() => {
    setChildrenAges((prev) => {
      const next = prev.slice(0, children);
      while (next.length < children) next.push(5);
      return next;
    });
  }, [children]);

  React.useEffect(() => {
    if (!roomId && rooms.length > 0) setRoomId(String(rooms[0]._id));
  }, [rooms, roomId]);

  const totalGuests = adults + children;
  const nights = nightsBetween(checkInDate, checkOutDate);
  
  const maxAdults =
    typeof (room as any)?.maxGuests === "number"
      ? Number((room as any).maxGuests)
      : typeof (room as any)?.maxOccupancy === "number"
      ? Number((room as any).maxOccupancy)
      : undefined;
  
  const roomPriceUSD = room?.pricePerNight || 0;

  const selectedAddOnsData = ADD_ONS.filter(ao => selectedAddOns.includes(ao.id));
  
  const addOnsEstimateUSD = selectedAddOnsData.reduce((totalUSD, addOn) => {
    let cost = 0;
    if (addOn.type === "per_stay") {
        cost = addOn.price; 
    } else if (addOn.type === "per_person_per_night") {
        cost = addOn.price * nights * adults; 
    }
    return totalUSD + cost;
  }, 0);

  const roomEstimateUSD = nights > 0 ? nights * roomPriceUSD : 0;
  const estimate = roomEstimateUSD + addOnsEstimateUSD;

  const canSubmit =
    !!roomId &&
    nights > 0 &&
    adults > 0 &&
    (!maxAdults || adults <= maxAdults) && 
    children <= adults &&
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    policyAccepted; 

  const whyDisabled = () => {
    const reasons: string[] = [];
    if (!policyAccepted) reasons.push("Acceptance of Policy is required");
    if (!roomId) reasons.push("Select a room");
    if (nights <= 0) reasons.push("Dates must be at least 1 night");
    if (adults <= 0) reasons.push("Add at least 1 adult");
    
    if (maxAdults && adults > maxAdults) {
        reasons.push(`This room supports a maximum of ${maxAdults} adults.`);
    } else if (children > adults) {
        reasons.push(`This room supports a maximum of ${adults} children.`);
    }

    if (!firstName.trim()) reasons.push("First name is required");
    if (!lastName.trim()) reasons.push("Last name is required");
    if (!email.trim()) reasons.push("Email is required");
    return reasons;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !roomId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const extras = {
        title,
        firstName,
        lastName,
        email,
        phone,
        nationality,
        country,
        promo,
        loyalty,
        adults,
        children,
        childrenAges,
        uiEstimateUSD: estimate || undefined,
        addOnsEstimateUSD: addOnsEstimateUSD || undefined,
        selectedAddOns,
        freeNotes: notesFree,
      };
      
      const finalCheckIn = `${checkInDate}T14:00`;
      const finalCheckOut = `${checkOutDate}T12:00`;

      const res = await createBooking({
        roomId,
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        guests: totalGuests,
        adults: adults,
        children: children,
        notes: JSON.stringify(extras), 
      });
      
      navigate(`/booking/verify?id=${res.bookingId}`);
    } catch (e: any) {
      setSubmitError(e?.response?.data?.error || "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const hero = getRoomImage(room);

  return (
    <div className="bg-stone-50">
      <section className="relative h-[44vh] min-h-[320px] w-full overflow-hidden">
        <img
          src={hero} 
          alt="Luxury Booking Background"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          onError={(ev) => {
            const t = ev.target as HTMLImageElement;
            if (t.src !== FALLBACK_IMG) t.src = FALLBACK_IMG;
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Confirm Your Exclusive Residence
          </h1>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm">
          <nav aria-label="breadcrumb">
            <ol className="flex gap-2">
              <li>
                <Link to="/" className="underline hover:text-amber-300">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link to="/rooms" className="underline hover:text-amber-300">Residences</Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-amber-300">Reservation</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <form onSubmit={onSubmit} className="lg:col-span-2 rounded-md border border-stone-200 bg-white p-8 shadow-xl space-y-8">
          <h2 className="text-2xl font-serif font-bold text-stone-800 border-b pb-3">I. Residence & Dates</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Selected Residence</label>
              <select
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                <option value="">— Select a luxury suite —</option>
                {rooms.map((r) => (
                  <option key={String(r._id)} value={String(r._id)}>
                    {r.title} {r.type ? `• ${r.type}` : ""}
                  </option>
                ))}
              </select>
              {roomsLoading && <span className="text-xs text-stone-500">Loading residences…</span>}
              {roomsError && <span className="text-xs text-red-600">{roomsError}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Daily Tariff (USD)</label>
              <input
                readOnly
                className="rounded-md border border-stone-300 px-4 py-3 bg-stone-100 text-stone-800"
                value={
                  roomPriceUSD > 0 ? fmtUSD(roomPriceUSD) : "—"
                }
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Arrival Date (Check-in 14:00)</label>
              <input
                type="date"
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={checkInDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setCheckInDate(v);
                  if (v >= checkOutDate) setCheckOutDate(addDaysDateLocal(v, 1));
                }}
                min={todayDateLocal()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Departure Date (Check-out 12:00)</label>
              <input
                type="date"
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={addDaysDateLocal(checkInDate, 1)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Adults (18+)</label>
              <select
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Children (Under 18)</label>
              <select
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Total Occupancy</label>
              <input
                readOnly
                className="rounded-md border border-stone-300 px-4 py-3 bg-stone-100 text-stone-800"
                value={`${totalGuests}${maxAdults ? ` / ${maxAdults} Adults + ${adults} Children` : ""}`}
              />
            </div>
          </div>

          {children > 0 && (
            <div className="grid sm:grid-cols-3 gap-6 pt-2 border-t border-stone-200">
              {childrenAges.map((age, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-stone-700">Age of Child #{i + 1}</label>
                  <select
                    className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                    value={age}
                    onChange={(e) => {
                      const next = [...childrenAges];
                      next[i] = Number(e.target.value);
                      setChildrenAges(next);
                    }}
                  >
                    {Array.from({ length: 13 })
                      .map((_, n) => n)
                      .map((n) => (
                        <option key={n} value={n}>
                          {n === 0 ? "Under 1" : `${n} years`}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-serif font-bold text-stone-800 border-b pt-4 pb-3">II. Enhance Your Stay (Optional Add-ons)</h2>
          <div className="space-y-4">
            {ADD_ONS.map((addOn) => (
              <div
                key={addOn.id}
                className="flex items-start rounded-md border border-stone-300 p-4 transition duration-200"
              >
                <input
                  type="checkbox"
                  id={`addon-${addOn.id}`}
                  checked={selectedAddOns.includes(addOn.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                        if (addOn.id === "halfBoard") {
                            setSelectedAddOns(prev => [...prev.filter(id => id !== "fullBoard"), addOn.id]);
                        } else if (addOn.id === "fullBoard") {
                            setSelectedAddOns(prev => [...prev.filter(id => id !== "halfBoard"), addOn.id]);
                        } else {
                            setSelectedAddOns(prev => [...prev, addOn.id]);
                        }
                    } else {
                        setSelectedAddOns(prev => prev.filter(id => id !== addOn.id));
                    }
                  }}
                  className="mt-1 h-5 w-5 rounded-md border-stone-300 text-amber-700 focus:ring-amber-500"
                />
                <div className="ml-4 flex-1">
                  <label htmlFor={`addon-${addOn.id}`} className="text-base font-semibold text-stone-800 cursor-pointer">
                    {addOn.title}
                  </label>
                  <p className="text-sm text-stone-600 mt-0.5">{addOn.description}</p>
                  <p className="text-sm text-amber-700 font-medium mt-1">
                    {fmtUSD(addOn.price)}{addOn.type === "per_stay" ? " / per stay" : addOn.type === "per_person_per_night" ? " / person / night" : " / night"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 border-b pt-4 pb-3">III. Principal Guest Information</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Title</label>
              <select
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              >
                {TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Given Name *</label>
              <input
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Surname *</label>
              <input
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-stone-700">
                Email Address * (for your secure confirmation)
              </label>
              <input
                type="email"
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Contact Phone</label>
              <input
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 ..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Country/Region of Residence</label>
              <select
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Notes for the Concierge</label>
              <textarea
                className="rounded-md border border-stone-300 px-4 py-3 min-h-[120px] bg-white hover:border-amber-600 transition"
                placeholder="Anticipated arrival time, special dietary requests, pillow preference, etc."
                value={notesFree}
                onChange={(e) => setNotesFree(e.target.value)}
              />
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 border-b pt-4 pb-3">IV. Membership & Vouchers</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Voucher / Promo Code</label>
              <input
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                placeholder="(optional code)"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Loyalty / Membership Number</label>
              <input
                className="rounded-md border border-stone-300 px-4 py-3 bg-white hover:border-amber-600 transition"
                placeholder="(optional number)"
                value={loyalty}
                onChange={(e) => setLoyalty(e.target.value)}
              />
            </div>
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-stone-800 border-b pt-4 pb-3">V. Check-in Requirements</h2>
          <div className="border border-stone-300 p-4 bg-stone-50 space-y-3 rounded-md">
            <p className="text-sm font-semibold text-stone-800">Mandatory Documentation for All Guests</p>
            <p className="text-sm text-stone-600">For the safety, security, and legal compliance of all guests, please be prepared to present the following original documents at the reception. Failure to provide valid documentation for all members of your party will result in a denied check-in.</p>
            <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside pl-2">
                <li>Vietnamese Nationals: Valid ID Card (CCCD) or Passport.</li>
                <li>Foreign Nationals: Valid Passport and Visa (or proof of visa exemption).</li>
                <li>All Children/Minors: Must be accompanied by an adult. A valid Passport or Birth Certificate is required to verify age and identity.</li>
            </ul>
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-stone-800 border-b pt-4 pb-3">VI. Policy Acceptance & Guarantee</h2>
          <div className="border border-stone-300 p-4 bg-stone-50 space-y-3 rounded-md">
            <p className="text-sm font-semibold text-stone-800">Reservation Guarantee and Policy Terms</p>
            <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside pl-2">
                <li>Cancellation Policy: For guaranteed status, cancellation must be received at least 72 hours prior to 14:00 (local time) on the arrival date. Failure to cancel will result in a fee equivalent to the full first night's charge.</li>
                <li>Late Check-in: Your room is held until 12:00 PM the day after arrival. Please contact the concierge if your arrival is delayed beyond the scheduled Check-in time.</li>
                <li>No-Show Policy: Guests who fail to arrive without prior notification will be charged the full amount of the first night's stay.</li>
                <li>Rate Guarantee: The total estimated rate is confirmed upon booking. Any extra charges (mini-bar, spa, laundry) are settled upon check-out.</li>
            </ul>
            <div className="mt-4 flex items-center pt-2 border-t border-stone-200">
                <input 
                    type="checkbox" 
                    id="policyAccept" 
                    checked={policyAccepted}
                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                    className="h-5 w-5 border-stone-300 text-amber-700 focus:ring-amber-500 rounded-md"
                />
                <label htmlFor="policyAccept" className="ml-3 text-sm font-semibold text-stone-800">
                    I acknowledge that I have read and agree to the resort's Check-in Requirements and Cancellation Policy.
                </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-stone-200">
            <div className="rounded-md border border-stone-300 p-4 bg-stone-50">
              <div className="text-sm text-stone-500">Duration</div>
              <div className="font-semibold text-xl text-stone-800">{nights || "—"} nights</div>
            </div>
            <div className="rounded-md border border-stone-300 p-4 bg-stone-50 sm:col-span-2">
              <div className="text-sm text-stone-500">Estimated Total (USD)</div>
              <div className="font-bold text-2xl text-amber-700">
                {estimate ? fmtUSD(estimate) : "—"}
              </div>
              {roomPriceUSD > 0 && nights > 0 && (
                <div className="text-xs text-stone-500 pt-1">
                  (Includes {fmtUSD(roomEstimateUSD)} for residence and {fmtUSD(addOnsEstimateUSD)} for selected enhancements)
                </div>
              )}
               <p className="text-xs text-stone-500 pt-1">
                This is an estimated rate. The final invoice upon check-out will reflect this total plus any additional charges (e.g., minibar, spa) incurred during your stay.
               </p>
            </div>
            
            <div className="sm:col-span-3 flex items-stretch gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                title={!canSubmit ? `Fix: ${whyDisabled().join(" • ")}` : "Finalize reservation"}
                className={`w-full rounded-md text-white px-6 py-4 font-semibold text-lg transition duration-200 ${
                  canSubmit ? "bg-amber-700 hover:bg-amber-600 shadow-md" : "bg-stone-400 cursor-not-allowed"
                }`}
              >
                {submitting ? "Processing Reservation..." : "Finalize & Secure Booking"}
              </button>
            </div>
          </div>

          {maxAdults && (adults > maxAdults || children > adults) && (
            <p className="text-sm text-red-600 pt-2 font-medium">⚠️ {whyDisabled().find(r => r.includes("adults") || r.includes("children"))}</p>
          )}
          {submitError && <p className="text-red-600 text-sm pt-2 font-medium">An error occurred: {submitError}</p>}
        </form>

        <aside className="lg:col-span-1">
          <div className="rounded-md border border-stone-200 bg-white shadow-xl overflow-hidden sticky top-24">
            <div className="h-48 w-full">
              <img
                src={getRoomImage(room)} 
                alt={room?.title || "Selected room"}
                className="h-full w-full object-cover"
                onError={(ev) => {
                  const t = ev.target as HTMLImageElement;
                  if (t.src !== FALLBACK_IMG) t.src = FALLBACK_IMG;
                }}
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-serif font-bold text-stone-800">
                  {room?.title || "Select Your Residence"}
                </h3>
                <div className="text-base font-semibold text-amber-700">
                  {roomPriceUSD > 0 ? fmtUSD(roomPriceUSD) : "—"}
                  <span className="text-stone-500 font-normal text-sm"> / night</span>
                </div>
              </div>
              {room?.description && (
                <p className="text-stone-700 text-sm line-clamp-4">{room.description}</p>
              )}
              <div className="text-sm text-stone-600 flex justify-between pt-2">
                <div>{room?.type ? `Type: ${room.type}` : null}</div>
                <div>{maxAdults ? `Max ${maxAdults} Adults` : null}</div>
                <div>{(room as any)?.beds ? `${(room as any).beds} beds` : null}</div>
              </div>
              
              <div className="pt-3 text-sm text-stone-600">
                <Link to="/rooms" className="text-amber-700 hover:text-amber-500 transition underline">
                  View All Residences
                </Link>
              </div>

              <div className="mt-4 border-t border-stone-200 pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-stone-500">Arrival (14:00)</div>
                  <div className="font-semibold text-base">
                    {checkInDate}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500">Departure (12:00)</div>
                  <div className="font-semibold text-base">
                    {checkOutDate}
                  </div>
                </div>
                <div>
                  <div className="text-stone-500">Nights</div>
                  <div className="font-semibold text-base">{nights || "—"}</div>
                </div>
                <div>
                  <div className="text-stone-500">Guests</div>
                  <div className="font-semibold text-base">
                    {totalGuests}
                  </div>
                </div>
                <div className="col-span-2 border-t border-stone-300 pt-4 flex items-center justify-between font-bold text-lg">
                  <span>Estimated Total</span>
                  <span className="text-amber-700">{estimate ? fmtUSD(estimate) : "—"}</span>
                </div>
                <p className="col-span-2 text-xs text-stone-500">
                  Price is an estimate. Final price and availability confirmed upon submission.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Book;