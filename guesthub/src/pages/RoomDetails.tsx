import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchRoom, extractId, fetchMyActiveBooking } from "../lib/api";
import type { Room } from "../types";

import DeluxeOceanView from "../assets/Rooms pic/deluxe-ocean-view.jpg";
import FamilySuite from "../assets/Rooms pic/FAMILY SUITE.jpg";
import GardenBungalow from "../assets/Rooms pic/GARDEN BUNGALOW.jpg";
import JuniorSuite from "../assets/Rooms pic/JuniorSuite.jpg";
import PenthouseSuite from "../assets/Rooms pic/Penthouse-Suite.jpg";
import PlungePool from "../assets/Rooms pic/plunge-pool.jpg";
import Presidential from "../assets/Rooms pic/presidential-suite-living-room.jpg";
import RoyalSuite from "../assets/Rooms pic/royal-suite-living-room.jpg";
import StandardTwin from "../assets/Rooms pic/STANDARD TWIN.jpg";
import Superior from "../assets/Rooms pic/Superior.jpg";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop";

const safeImg = (u?: string) => (!u ? FALLBACK_IMG : u);

const LOCAL_IMAGE_BY_TITLE: Record<string, string> = {
  "DELUXE OCEAN VIEW": DeluxeOceanView,
  "FAMILY SUITE": FamilySuite,
  "GARDEN BUNGALOW": GardenBungalow,
  "JUNIOR SUITE": JuniorSuite,
  "SUPERIOR": Superior,
  "STANDARD TWIN": StandardTwin,
  "PLUNGE POOL VILLA": PlungePool,
  "ROYAL SUITE": RoyalSuite,
  "PRESIDENTIAL ROOM": Presidential,
  "PENTHOUSE SUITE": PenthouseSuite,
};

const copyByTitle: Record<string, { display: string; paras: string[] }> = {
  "DELUXE OCEAN VIEW": {
    display: "DELUXE OCEAN VIEW",
    paras: [
      "Ascend to a privileged perspective where the horizon meets the East Sea. Our 42 m² Deluxe Ocean View room is an oasis of calm, designed to connect you instantly with the tranquil majesty of the ocean. The generous, private loggia is your personal stage for breathtaking sunrises and quiet, reflective moments. This experience is what truly defines Vietnamese coastal luxury, ensuring every dollar spent secures an irreplaceable memory.",
      "Interiors feature meticulously crafted wood details and a soothing color palette, ensuring deep relaxation. Every element, from the seamless GuestHub digital service to the automated climate control, is tuned for effortless luxury. The marble-clad bathroom invites long soaks, completing a sanctuary where every amenity justifies its position in a 6-star resort. You receive unparalleled comfort and a vantage point unmatched by lesser properties.",
    ],
  },
  "FAMILY SUITE": {
    display: "FAMILY SUITE",
    paras: [
      "The Family Suite redefines time spent together, providing a magnificent 75 m² sanctuary. It artfully pairs a lavish master bedroom with a dedicated, stylish living area, perfect for private movie nights or relaxed slow mornings. The separation of spaces ensures both privacy and togetherness, delivering a dual-residence experience within one suite.",
      "Featuring a flexible sofa corner, adaptable premium bedding, and abundant bespoke storage, every practical consideration for family travel has been addressed with style. The spacious dual-vanity bathroom simplifies morning routines. This suite isn't just accommodation; it's an investment in uncompromised comfort and priceless quality time for the entire family, setting the standard for luxurious multi-generational travel.",
    ],
  },
  "GARDEN BUNGALOW": {
    display: "GARDEN BUNGALOW",
    paras: [
      "Tucked within an expansive, lush tropical landscape, the Garden Bungalow offers a secluded haven, providing an intimate and exclusive connection to Vietnam’s natural beauty. This 50 m² space grants the coveted privacy often reserved for villas, yet remains steps from the resort's central amenities.",
      "A spacious, private sun terrace flows seamlessly onto the serene gardens, creating a living extension of your interior space. Light, natural woods and gentle textures create a truly tranquil retreat from the world. It is the ideal choice for discerning nature lovers and couples seeking quiet contemplation and exclusive comfort, offering a rare opportunity to own a piece of paradise for your stay.",
    ],
  },
  "JUNIOR SUITE": {
    display: "JUNIOR SUITE",
    paras: [
      "Experience refined, open-plan living in the Junior Suite. The bright, 65 m² layout artfully blends generous sleeping and sophisticated lounging areas. The intelligent design maximizes space and light, providing an atmosphere of effortless elegance and relaxation.",
      "The suite boasts a private balcony overlooking the pristine estate, a plush King-size bed dressed in high-thread-count Egyptian cotton linens, a dedicated executive desk, and a marble spa-inspired bathroom. It is a supremely refined choice for extended stays or guests who cherish a little extra room to breathe, conduct business, and relax. The value is found in the combination of residential comfort and 6-star service.",
    ],
  },
  "SUPERIOR": {
    display: "SUPERIOR ROOM",
    paras: [
      "The Superior Room, at 38 m², is a masterpiece of crisp, modern, and quietly elegant design. It delivers every essential luxury required for a comfortable city-by-the-sea break, executed with precision that far exceeds its category.",
      "Oversized windows welcome abundant natural daylight; guests enjoy fast, reliable fiber-optic connectivity, a carefully curated minibar, and a supremely restful bed dressed in smooth, high-thread-count linens. This is not a standard room; it is a perfectly appointed base for the discerning business traveler or a luxurious short getaway, proving that true luxury lies in flawless execution of detail.",
    ],
  },
  "STANDARD TWIN": {
    display: "STANDARD TWIN ROOM",
    paras: [
      "An efficient, exceptionally well-appointed 35 m² base for two, the Standard Twin offers modern essentials executed with 6-star precision. This room demonstrates the resort's commitment to quality across all tiers of accommodation.",
      "Featuring two comfortable single beds, a tidy integrated workspace, and a bright, contemporary bathroom, it provides all-day ease without compromise. The space is intimate, considered, and crafted for maximum functional comfort, ensuring even the entry-level guest receives a taste of unparalleled resort quality.",
    ],
  },
  "PLUNGE POOL VILLA": {
    display: "PLUNGE POOL VILLA",
    paras: [
      "Slip into your own private rhythm in this 85 m² Plunge Pool Villa. The highlight is a secluded, temperature-controlled plunge pool and an adjoining sun terrace, sheltered by lush foliage. This villa offers the ultimate in personal, unwitnessed luxury.",
      "Stylish outdoor lounging meets cozy, sun-drenched interiors, setting the scene for slow, uninterrupted mornings and starlit evenings. It is a refined sanctuary perfectly suited for couples, honeymooners, or anyone desiring the ultimate personal privacy, promising an escape that feels entirely custom-made.",
    ],
  },
  "ROYAL SUITE": {
    display: "THE ROYAL SUITE",
    paras: [
      "The 150 m² Royal Suite embodies contemporary grandeur with a breathtakingly large, separate living room and sweeping, privileged views of the estate and sea. It’s an ideal setting for intimate entertaining or expansive private relaxation.",
      "It features the finest, bespoke finishes, generous designer seating, and abundant natural daylight, setting the mood for unhurried, relaxed luxury. This suite is designed for guests who appreciate statement spaces, personalized service, and quiet elegance, offering a residential scale of luxury that few resorts can match. The value is inherent in the exclusive access and size.",
    ],
  },
  "PRESIDENTIAL ROOM": {
    display: "THE PRESIDENTIAL ROOM",
    paras: [
      "Our most prestigious accommodation, the Presidential Room, offers expansive, cinematic sea views and elevated privacy across an enormous 200 m² floor plan. This is where leaders and celebrated figures choose to reside.",
      "The suite includes a stately living area, a refined master bedroom, a dedicated executive corner, and a marble-clad spa-style bathroom. Every fixture and finish signifies uncompromising quality. This residence is reserved for milestone moments, diplomatic visits, and remarkable, legacy trips, offering a level of security and luxury that sets the global benchmark.",
    ],
  },
  "PENTHOUSE SUITE": {
    display: "THE PENTHOUSE SUITE",
    paras: [
      "At the very pinnacle of the resort, the 250 m² Penthouse Suite commands 360-degree panoramic views over the entire coastline and city skyline. This is the apex of residential resort living.",
      "The space features airy open-plan living, bespoke designer furniture, and endless light, creating a one-of-a-kind, exclusive retreat. A private roof terrace allows for unrivaled personal enjoyment. This is the pinnacle experience for design aficionados and those seeking the ultimate high-level perspective, offering an unparalleled sense of dominion and escape.",
    ],
  },
};

type AmenityGroupKey = "ENTERTAINMENT" | "CONNECTIVITY" | "SAFETY" | "RELAXATION";
const labels: Record<AmenityGroupKey, string> = {
  ENTERTAINMENT: "In-Residence Entertainment",
  CONNECTIVITY: "Seamless Connectivity",
  SAFETY: "Security & Peace of Mind",
  RELAXATION: "Luxury Comfort & Bath",
};
const groupAmenity = (a: string): AmenityGroupKey => {
  const s = a.toLowerCase();
  if (/(tv|screen|speaker|cable|channel|media|dock)/.test(s)) return "ENTERTAINMENT";
  if (/(wifi|wi-fi|internet|usb|socket|desk)/.test(s)) return "CONNECTIVITY";
  if (/(safe|alarm|lock|sprinkler|smoke|door|emergency|guard)/.test(s)) return "SAFETY";
  return "RELAXATION";
};

const fmtUSD = (v?: number) =>
  v == null ? "Price Upon Request" : `${Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v))}/night`;

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
            Our records indicate you already have an active reservation .
          </p>
          <p className="text-sm text-stone-600">
            To ensure the highest quality of service, we only permit one active booking per guest. You may modify your existing booking from your profile, or finalize your current stay before making a new reservation.
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

const RoomDetails: React.FC = () => {
  const params = useParams();
  const rawId = params.id ?? params.slugId ?? "";
  const id = extractId(rawId);
  const navigate = useNavigate();

  const [room, setRoom] = React.useState<Room | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasActiveBooking, setHasActiveBooking] = React.useState(false);
  const [showActiveBookingModal, setShowActiveBookingModal] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      setError("Invalid residence link");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, activeBooking] = await Promise.all([
            fetchRoom(id),
            fetchMyActiveBooking().catch(() => null)
        ]);
        
        if (activeBooking && activeBooking._id) {
            setHasActiveBooking(true);
        }
        setRoom(data ?? null);
      } catch (e) {
        setError("Failed to load residence details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleReserveClick = () => {
    if (hasActiveBooking) {
        setShowActiveBookingModal(true);
    } else if (id) {
        navigate(`/book?roomId=${id}`);
    }
  };

  if (loading) return <p className="py-10 text-center text-xl font-serif">Loading your exclusive residence details…</p>;
  if (error) return <p className="py-10 text-center text-red-600 font-serif">{error}</p>;
  if (!room) return <p className="py-10 text-center font-serif">Residence type not found in our collection.</p>;

  const key = (room.title || "").trim().toUpperCase();
  const info = copyByTitle[key];
  const photos = (Array.isArray(room.photos) ? room.photos : []).map(safeImg);
  const hero = LOCAL_IMAGE_BY_TITLE[key] || photos[0] || FALLBACK_IMG;
  const displayTitle = info?.display || room.title || "Elite Residence";
  const paragraphs = info?.paras ?? (room.description ? [room.description] : []);

  const groups: Partial<Record<AmenityGroupKey, string[]>> = {};
  (room.amenities || []).forEach((a) => {
    const k = groupAmenity(a);
    if (!groups[k]) groups[k] = [];
    groups[k]!.push(a);
  });
  
  // Use the actual price from the database now
  const roomPriceUSD = room.pricePerNight;

  return (
    <>
      <ActiveBookingModal 
        isOpen={showActiveBookingModal} 
        onClose={() => setShowActiveBookingModal(false)} 
      />
      <div className="bg-stone-50 text-stone-900">
        <section className="relative w-full overflow-hidden">
          <div className="relative h-[55vh] min-h-[400px]">
            <img
              src={hero}
              alt={displayTitle}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => ((e.currentTarget.src = FALLBACK_IMG))}
              loading="eager"
            />
            <div className="absolute inset-0 bg-stone-900/50" />
            <div className="relative z-10 flex h-full items-center justify-center">
              <h1 className="font-serif text-6xl md:text-7xl font-light text-white tracking-widest drop-shadow uppercase italic">
                {displayTitle}
              </h1>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm font-light">
              <nav aria-label="breadcrumb">
                <ol className="flex gap-2">
                  <li>
                    <Link to="/" className="hover:text-amber-300 transition-colors">
                      The Resort
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li>
                    <Link to="/rooms" className="hover:text-amber-300 transition-colors">
                      Residences
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li className="font-medium text-amber-200">{displayTitle}</li>
                </ol>
              </nav>
            </div>
          </div>

          {photos.length > 1 && (
            <div className="mx-auto max-w-6xl px-4 -mt-8 relative z-20">
              <div className="grid grid-flow-col auto-cols-[250px] gap-4 overflow-x-auto border bg-white p-4 shadow-xl border-stone-100">
                {photos.slice(1, 8).map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`${displayTitle}-${i + 2}`}
                    className="h-40 w-full object-cover shadow-md hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => ((e.currentTarget.src = FALLBACK_IMG))}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 pt-16 pb-20">
          
          <div className="lg:col-span-2 space-y-12">
            
            <div className="space-y-6 text-xl font-light leading-relaxed text-stone-800 font-serif">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="border border-stone-200 bg-white p-6 shadow-sm">
              <h4 className="text-xl font-serif font-semibold mb-3 tracking-wide text-amber-700">Residence Specifications</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <p>
                      <span className="block text-stone-500 uppercase text-xs tracking-wider">Type</span>
                      <span className="font-semibold text-stone-800">{room.type || "Room"}</span>
                  </p>
                  <p>
                      <span className="block text-stone-500 uppercase text-xs tracking-wider">Max Occupancy</span>
                      <span className="font-semibold text-stone-800">{room.maxGuests || 2} Guests</span>
                  </p>
                  <p>
                      <span className="block text-stone-500 uppercase text-xs tracking-wider">Bedding Configuration</span>
                      <span className="font-semibold text-stone-800">{room.beds || 1} Bed{Number(room.beds) > 1 ? "s" : ""}</span>
                  </p>
                  <p>
                      <span className="block text-stone-500 uppercase text-xs tracking-wider">Starting Daily Rate</span>
                      <span className="font-semibold text-stone-800">{fmtUSD(roomPriceUSD)}</span>
                  </p>
              </div>
            </div>

            {Object.keys(groups).length > 0 && (
              <div id="services">
                <h4 className="text-3xl font-serif font-light mb-8 text-center text-stone-900">Exclusive In-Residence Amenities</h4>
                <div className="grid gap-8 md:grid-cols-2">
                  {(Object.keys(labels) as AmenityGroupKey[])
                    .filter((k) => groups[k]?.length)
                    .map((k) => (
                      <div key={k} className="border border-stone-200 p-6 bg-white shadow-sm">
                        <h5 className="font-serif text-xl font-medium mb-3 text-amber-700">{labels[k]}</h5>
                        <div className="my-2 h-px bg-stone-100" />
                        <ul className="space-y-2 text-sm text-stone-700">
                          {groups[k]!.map((a) => (
                            <li key={a} className="flex items-start">
                              <span className="text-amber-600 mr-2 mt-0.5">▪</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {photos.length > 3 && (
              <div className="pt-2 text-center">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 font-semibold text-lg underline text-amber-700 hover:text-amber-800 transition-colors"
                >
                  View The Full Photo Gallery →
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-8 lg:h-fit">
            <div className="border border-stone-300 bg-white p-6 shadow-lg space-y-5">
              <h2 className="text-2xl font-serif font-semibold text-stone-900 tracking-wide">Begin Your Reservation</h2>
              
              <p className="text-stone-700 font-serif text-lg tracking-wider">
                  Starting Rate: {fmtUSD(roomPriceUSD)}
              </p>
              
              <p className="text-sm text-stone-600 border-t border-stone-100 pt-4">
                  Proceed to the booking page to select your dates, finalize guest numbers, and view your complete reservation total including optional enhancements.
              </p>

              <button
                onClick={handleReserveClick}
                className="bg-amber-600 text-stone-900 py-3 w-full font-semibold uppercase tracking-widest hover:bg-amber-700 transition duration-300 shadow-md"
              >
                Reserve Your Sanctuary
              </button>
              
              <p className="text-xs text-stone-500 text-center pt-2">
                  Booking confirmation subject to concierge review.
              </p>

            </div>

            <div className="overflow-hidden border border-stone-300 bg-white shadow-lg">
              <img
                src={photos[1] || FALLBACK_IMG}
                alt="Explore more residences"
                className="w-full h-48 object-cover"
                onError={(e) => ((e.currentTarget.src = FALLBACK_IMG))}
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold text-stone-900">
                  <Link to="/rooms" className="text-stone-900 hover:text-amber-700 transition-colors">
                    Explore The Full Collection →
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-stone-600 font-light">
                  Discover a higher floor, a broader view, or bespoke luxury. Browse all exclusive residence types to find your perfect fit.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default RoomDetails;