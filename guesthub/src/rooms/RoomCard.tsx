import React from "react";
import { useNavigate } from "react-router-dom";
import type { Room } from "../types";
import { formatMoney } from "../utils/format";

type Props = { room: Room };

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";

const RoomCard: React.FC<Props> = ({ room }) => {
  const navigate = useNavigate();

  const photo = room.photos?.[0] ?? FALLBACK_IMG;

  const goDetails = () => navigate(`/rooms/${room._id}`);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-200">
      <button
        type="button"
        onClick={goDetails}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View details for ${room.title}`}
      >
        <img
          src={photo}
          alt={room.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      </button>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold line-clamp-1">{room.title}</h3>
          <span className="text-primary font-medium shrink-0">
            {formatMoney(room.pricePerNight)} <span className="text-xs">/night</span>
          </span>
        </div>

        <div className="text-sm text-neutral-600">
          Type: {room.type} • Up to {room.maxGuests} guest{room.maxGuests > 1 ? "s" : ""}
        </div>

        {!!room.amenities?.length && (
          <div className="flex flex-wrap gap-2 pt-1">
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                {a}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-xs text-neutral-500">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <span
            className={`text-xs inline-flex items-center rounded-full px-2 py-1 ${
              room.available
                ? "bg-green-100 text-green-700"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {room.available ? "Available" : "Unavailable"}
          </span>

          <button
            className="ml-auto rounded-xl bg-primary text-white px-4 py-2 hover:bg-primary600 transition"
            onClick={goDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
