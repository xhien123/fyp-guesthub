import React from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import type { Booking } from "../types";

const PRIMARY_COLOR = "amber-700"; 
const BOOKING_STEPS: Booking["status"][] = [
  "Pending",
  "Confirmed",
  "Checked-in",
  "Checked-out",
];

const Stepper: React.FC<{ current: Booking["status"]; steps: string[] }> = ({ current, steps }) => {
  const currentIndex = steps.findIndex((s) => s === current);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((s, idx) => {
        const isDone = idx <= currentIndex;
        const isActive = idx === currentIndex;
        

        return (
          <li
            key={s}
            className={`flex flex-col items-center justify-start relative pt-6 pb-2 transition-all duration-500`}
          >
            <div
              className={`absolute top-2 w-full h-[3px] transition-colors duration-500 ${
                idx === 0 ? "left-1/2 w-1/2" : ""
              } ${
                idx === steps.length - 1 ? "right-1/2 w-1/2" : ""
              } ${
                idx > 0 && idx < steps.length - 1 ? "w-full" : ""
              }`}
              style={{
                backgroundColor: isDone && idx > 0 ? `#b45309` : `#d6d3d1`,
              }}
            />

            <div
              className={`absolute top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                isActive
                  ? `bg-white border-${PRIMARY_COLOR}`
                  : isDone
                  ? `bg-${PRIMARY_COLOR} border-${PRIMARY_COLOR}`
                  : `bg-stone-100 border-stone-300`
              }`}
            >
              <span
                className={`text-sm ${
                  isDone ? (isActive ? `text-${PRIMARY_COLOR}` : `text-white`) : `text-stone-500`
                }`}
              >
                {isActive ? "•" : isDone ? "✓" : idx + 1}
              </span>
            </div>

            <div
              className={`mt-4 text-center text-xs font-semibold uppercase tracking-wider ${
                isDone ? `text-${PRIMARY_COLOR}` : "text-stone-500"
              }`}
            >
              {s}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const BookingStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fmtUSD = (v?: number) =>
    v == null ? "—" : `${Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v))}`;

  React.useEffect(() => {
    let timer: number | undefined;

    const load = async () => {
      try {
        setError(null);
        const res = await api.get(`/api/bookings/${id}`, { withCredentials: true });
        setBooking(res.data as Booking);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load booking status");
      } finally {
        setLoading(false);
      }
    };

    load();
    timer = window.setInterval(load, 5000);
    return () => { if (timer) window.clearInterval(timer); };
  }, [id]);

  if (loading) return <p className="text-center py-12 text-lg text-stone-700">A moment while we retrieve your reservation details...</p>;
  if (error) return <p className="text-center py-12 text-xl text-red-600">Error: {error}</p>;
  if (!booking) return <p className="text-center py-12 text-xl text-red-600">Reservation not found.</p>;

  const roomName = typeof booking.room === "string" ? booking.room : booking.room?.title;
  const nights =
    Math.max(
      0,
      Math.round(
        (new Date(booking.checkOut).setHours(0, 0, 0, 0) -
          new Date(booking.checkIn).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    ) || 1;

  let guestDetails: any = {};
  let uiEstimateUSD: number | undefined;
  
  try {
    if (booking.notes) {
      guestDetails = JSON.parse(booking.notes);
      uiEstimateUSD = guestDetails.uiEstimateUSD;
    }
  } catch {}
  
  const getStatusMessage = (status: Booking["status"]) => {
    switch(status) {
      case "Pending":
        return {
          title: "Confirmation Pending: Anticipation Builds",
          message: "Your exclusive reservation has been successfully received. Our dedicated concierge team is now reviewing your request and will provide 'Confirmed' status shortly. Please check back in a few minutes.",
          color: "border-yellow-500 bg-yellow-50 text-yellow-800"
        };
      case "Confirmed":
        return {
          title: "Reservation Confirmed: Your Sanctuary Awaits",
          message: `The ${roomName || "residence"} is secured! We look forward to welcoming you on ${new Date(booking.checkIn).toDateString()}. A detailed confirmation has been sent to your email.`,
          color: "border-green-500 bg-green-50 text-green-800"
        };
      case "Checked-in":
        return {
          title: "Welcome Home: Enjoy Your Stay",
          message: "You are currently checked in and enjoying your luxurious retreat. Should you require any assistance, please contact the Front Desk directly.",
          color: "border-blue-500 bg-blue-50 text-blue-800"
        };
      case "Checked-out":
        return {
          title: "Experience Concluded: Thank You",
          message: "Thank you for choosing us for your stay. We hope your experience was exceptional and we look forward to welcoming you back soon.",
          color: "border-stone-500 bg-stone-50 text-stone-800"
        };
      default:
        return {
          title: "Status Update Required",
          message: "We are having trouble retrieving the latest status. Please contact our front desk.",
          color: "border-red-500 bg-red-50 text-red-800"
        };
    }
  }
  
  const statusInfo = getStatusMessage(booking.status);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      
      <header className="flex items-center justify-between border-b border-stone-200 pb-4">
        <h1 className="font-serif text-4xl font-thin italic text-stone-900 tracking-tight">
          Your Reservation Status
        </h1>
        <div className="flex gap-3">
          <Link
            to={`/bookings/${booking._id}`}
            className="border border-stone-300 text-stone-700 px-5 py-2 text-sm font-semibold hover:bg-stone-50 transition"
          >
            View Full Details
          </Link>
          <button
            disabled
            className={`bg-amber-700 text-white px-5 py-2 text-sm font-semibold transition opacity-50 cursor-default`}
          >
            Track Live Status
          </button>
          <Link
            to="/profile"
            className="border border-stone-300 text-stone-700 px-5 py-2 text-sm font-semibold hover:bg-stone-50 transition"
          >
            My Profile
          </Link>
        </div>
      </header>

      <div className="border border-stone-200 bg-white p-8 shadow-2xl space-y-8">
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Residence</div>
            <div className="text-lg font-semibold text-stone-900">{roomName || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Guests</div>
            <div className="text-lg font-semibold text-stone-900">{booking.guests} Pax</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Nights</div>
            <div className="text-lg font-semibold text-stone-900">{nights}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Booking ID</div>
            <div className="text-sm font-medium text-stone-700">{booking._id}</div>
          </div>
        </div>

        <Stepper current={booking.status} steps={BOOKING_STEPS} />

        <div className={`border-l-4 p-5 shadow-inner ${statusInfo.color}`}>
          <h3 className="text-lg font-bold mb-1">{statusInfo.title}</h3>
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: statusInfo.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-stone-100">
          <div className="border border-stone-300 p-4 bg-stone-50">
            <div className="text-xs uppercase tracking-wider text-stone-500">Check-in</div>
            <div className="font-semibold text-lg text-stone-800">{new Date(booking.checkIn).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
          </div>
          <div className="border border-stone-300 p-4 bg-stone-50">
            <div className="text-xs uppercase tracking-wider text-stone-500">Check-out</div>
            <div className="font-semibold text-lg text-stone-800">{new Date(booking.checkOut).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
          </div>
          <div className="border border-amber-300 p-4 bg-amber-50">
            <div className="text-xs uppercase tracking-wider text-amber-800">Estimated Total (USD)</div>
            <div className="font-bold text-xl text-amber-800">
              {uiEstimateUSD ? fmtUSD(uiEstimateUSD) : "—"}
            </div>
            {uiEstimateUSD && <div className="text-xs text-amber-700 pt-1">({nights} nights)</div>}
          </div>
        </div>

        <div className="border border-stone-200 p-4 text-center bg-stone-50">
          <div className="text-sm text-stone-600">
            Your Dedicated Concierge: Need assistance or have a special request?
          </div>
          <div className="font-medium text-stone-800 mt-1">
            Call: <span className={`text-${PRIMARY_COLOR}`}>+84 236 555 8888</span> • Email: <span className={`text-${PRIMARY_COLOR}`}>reservations@guesthub.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;