import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchRooms, type RoomsQuery, fetchMyActiveBooking } from "../lib/api";
import type { Room } from "../types";

import RoomsHero from "../assets/Rooms pic/Room background hero.jpg";
import DeluxeOceanView from "../assets/Rooms pic/deluxe-ocean-view.jpg";
import FamilySuite from "../assets/Rooms pic/FAMILY SUITE.jpg";
import GardenBungalow from "../assets/Rooms pic/GARDEN BUNGALOW.jpg";
import PlungePoolVilla from "../assets/Rooms pic/plunge-pool.jpg"; 
import RoyalSuite from "../assets/Rooms pic/royal-suite-living-room.jpg";
import StandardTwin from "../assets/Rooms pic/STANDARD TWIN.jpg";
import PresidentialRoom from "../assets/Rooms pic/presidential-suite-living-room.jpg";
import JuniorSuite from "../assets/Rooms pic/JuniorSuite.jpg";
import Superior from "../assets/Rooms pic/Superior.jpg";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";


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

const HERO_IMAGE = RoomsHero;

const getRoomImage = (r: Room): string => {
  const key = (r.title || (r as any).name || "").toUpperCase();
  if (key && ROOM_ASSETS[key]) return ROOM_ASSETS[key];
  if (Array.isArray(r.photos) && r.photos.length > 0) return r.photos[0];
  return FALLBACK_IMG;
};

const getRoomTitle = (r: Room): string =>
  (r.title || (r as any).name || "Room").toUpperCase();

const toSlug = (s?: string) => {
  const base = s && s.trim() ? s : "room";
  return base
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const getRoomSlug = (r: Room): string => {
  const title = getRoomTitle(r);
  return `${toSlug(title)}-${String(r._id ?? "")}`;
};

const isReal = (r: Room) => Boolean(r._id);

const getExcerpt = (txt?: string, n = 150) =>
  txt
    ? txt.length > n
      ? txt.slice(0, n) + "..."
      : txt
    : "Experience unparalleled luxury with bespoke furnishings, expansive ocean views, and our signature anticipatory service.";

const fmtCurrency = (v?: number, currencyCode = "USD") =>
  v == null
    ? ""
    : Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(v));


const ActiveBookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-stone-800 text-white">
          <h2 className="text-xl font-serif font-bold">Active Booking Found</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-700">
            Our records indicate you already have an active reservation (Pending, Confirmed, or Checked-in).
          </p>
          <p className="text-sm text-stone-600">
            To ensure the highest quality of service, we only permit one active booking per guest. You may modify your existing booking from your profile.
          </p>
        </div>
        <div className="flex justify-end gap-4 p-4 bg-stone-50 border-t border-stone-200">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 font-semibold text-stone-700 border border-stone-300 bg-white hover:bg-stone-100 transition"
          >
            Return Home
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile?sec=upcoming")}
            className="px-6 py-2 font-semibold text-white transition bg-amber-700 hover:bg-amber-600"
          >
            View Your Booking
          </button>
        </div>
      </div>
    </div>
  );
};

const Rooms: React.FC = () => {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasActiveBooking, setHasActiveBooking] = React.useState(false);
  const [showActiveBookingModal, setShowActiveBookingModal] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const query: RoomsQuery = {};
        const [data, activeBooking] = await Promise.all([
          fetchRooms(query),
          fetchMyActiveBooking().catch(() => null)
        ]);
        
        if (activeBooking && activeBooking._id) {
          setHasActiveBooking(true);
        }

        const fetched = Array.isArray(data) ? data : data?.rooms || [];
        
 
        setRooms(fetched); 
        
      } catch (e: any) {
        console.error("Failed to fetch rooms:", e);
        setError(e?.response?.data?.error || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSecureBookingClick = (e: React.MouseEvent, real: boolean) => {
    if (!real) {
      e.preventDefault();
      return;
    }
    
    if (hasActiveBooking) {
      e.preventDefault();
      setShowActiveBookingModal(true);
    }
  };

  return (
    <>
      <ActiveBookingModal 
        isOpen={showActiveBookingModal} 
        onClose={() => setShowActiveBookingModal(false)} 
      />
      <div className="bg-white">
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="GuestHub Resort Hero"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex h-full items-end">
            <div className="max-w-7xl mx-auto w-full px-6 pb-12">
              <nav
                aria-label="breadcrumb"
                className="text-white/90 text-sm mb-2 font-light tracking-wider"
              >
                <ol className="flex gap-2 items-center">
                  <li>
                    <Link
                      to="/"
                      className="underline hover:no-underline font-light"
                    >
                      Home
                    </Link>
                  </li>
                  <li aria-hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li className="font-semibold uppercase text-amber-300">
                    Rooms & Suites
                  </li>
                </ol>
              </nav>
              <h1 className="font-serif text-6xl md:text-8xl font-thin italic text-white tracking-tight drop-shadow-lg mb-4">
                Accommodations
              </h1>
              <p className="text-left text-xl font-light text-white max-w-3xl drop-shadow hidden md:block">
                A collection of bespoke spaces, each designed to serve as your
                private sanctuary, connecting you seamlessly with the sea and sky
                of Da Nang.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          {loading && (
            <p className="text-center text-lg text-stone-700">
              Loading our exclusive residences...
            </p>
          )}
          {error && (
            <p className="text-center text-lg text-red-600">Error: {error}</p>
          )}
          {!loading && !error && rooms.length === 0 && (
            <p className="text-center text-lg text-stone-600">
              No rooms available to display.
            </p>
          )}

          <ul className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r, index) => {
              const img = getRoomImage(r);
              const title = getRoomTitle(r);
              const real = isReal(r);
              const slug = real ? getRoomSlug(r) : "#";
  
              const isFeatured = index === 0;
              const price = r.pricePerNight;

            
              const isAvailable = r.available ?? true;

              const buttonBaseClasses =
                "w-full text-center px-4 py-3 font-semibold uppercase tracking-widest transition-colors ";
              
              const secureButtonClasses =
                buttonBaseClasses +
                (isFeatured ? "text-sm " : "text-xs ") +
                (real && isAvailable
                  ? "bg-amber-700 text-white hover:bg-amber-800 shadow-md"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed");

              const detailsButtonClasses =
                buttonBaseClasses.replace('font-semibold', 'font-medium') +
                (isFeatured ? "text-sm " : "text-xs ") +
                (real && isAvailable
                  ? "border-stone-300 bg-white hover:bg-stone-50 text-stone-800 border"
                  : "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed border");
                  
              const titleClasses = 
                  "font-serif font-light text-stone-900 tracking-wide uppercase " + 
                  (isFeatured ? "text-3xl" : "text-xl");

              return (
                <li
                  key={real ? (r._id as any) : `placeholder-${index}`}
                  className={`bg-white shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 relative
                    ${
                      isFeatured
                        ? "lg:col-span-3 lg:flex lg:h-96"
                        : "lg:col-span-1 group"
                    }
                    ${isAvailable ? "hover:shadow-2xl" : ""}
                  `}
                >
                  {/* --- UNAVAILABLE OVERLAY --- */}
                  {!isAvailable && (
                    <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-6">
                      <div className="bg-white/90 border border-stone-300 shadow-2xl p-6 rounded-lg transform rotate-[-2deg] max-w-xs">
                        <span className="block text-xl font-serif font-bold text-stone-800 mb-1">
                           Currently Unavailable
                        </span>
                        <span className="text-xs text-stone-500 uppercase tracking-widest font-medium">
                           Sold Out / Maintenance
                        </span>
                      </div>
                    </div>
                  )}

                  <figure
                    className={`relative aspect-[4/3] overflow-hidden ${
                      isFeatured
                        ? "lg:aspect-auto lg:h-full lg:w-2/3"
                        : "group"
                    }`}
                  >
                    <img
                      src={img}
                      alt={title}
                      className={`h-full w-full object-cover transition-transform duration-500 
                        ${isAvailable ? (isFeatured ? "hover:scale-100" : "group-hover:scale-105") : "grayscale opacity-60"}
                      `}
                      loading="lazy"
                    />
                    {real && price != null && isAvailable && (
                      <span className="absolute top-4 right-4 bg-stone-900/80 text-white px-4 py-2 text-sm font-semibold tracking-widest rounded-sm">
                        {fmtCurrency(price)}/Night
                      </span>
                    )}
                  </figure>

                  <div
                    className={`p-6 space-y-4 ${
                      isFeatured ? "lg:w-1/3 flex flex-col justify-between" : ""
                    } ${!isAvailable ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={titleClasses}>
                          {title}
                        </h3>
                        {r.maxGuests && (
                          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-sm whitespace-nowrap ml-4">
                            <span aria-hidden="true">👤</span> Sleeps{" "}
                            {r.maxGuests}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-stone-700 leading-relaxed text-sm ${
                          isFeatured ? "text-base" : ""
                        }`}
                      >
                        {getExcerpt(r.description)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <Link
                        to={
                          real && isAvailable
                            ? `/book?roomId=${encodeURIComponent(String(r._id))}`
                            : "#"
                        }
                        aria-disabled={!real || !isAvailable}
                        onClick={(e) => handleSecureBookingClick(e, real && isAvailable)}
                        className={secureButtonClasses}
                      >
                        {isAvailable ? "Secure Your Booking" : "Booking Closed"}
                      </Link>
                      <Link
                        to={slug}
                        aria-disabled={!real || !isAvailable}
                        onClick={(e) => (!real || !isAvailable) && e.preventDefault()}
                        className={detailsButtonClasses}
                      >
                        View Exclusive Details
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Rooms;