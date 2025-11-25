import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { cancelMyBooking } from "../lib/api";
import type { Booking, Room } from "../types";

const PRIMARY_COLOR = "amber-700";

const USD_PRICE_MAP: Record<string, number> = {
  "DELUXE OCEAN VIEW": 120,
  "FAMILY SUITE": 200,
  "STANDARD TWIN": 95,
  "GARDEN BUNGALOW": 150,
  "PLUNGE POOL VILLA": 260,
  "ROYAL SUITE": 320,
  "PRESIDENTIAL ROOM": 420,
  "JUNIOR SUITE": 160,
  "SUPERIOR": 140,
};

const CancellationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}> = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

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
          <h2 className="text-xl font-serif font-bold">Confirm Cancellation</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-700">
            Are you sure you wish to request cancellation?
          </p>
          <div className="border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">Please Note: This action is irreversible.</p>
            <p className="text-sm text-red-700 mt-1">
              Per our resort policy, cancellations may be subject to a fee.
              Furthermore, frequent cancellations (more than 2) may result in your account
              being restricted from future bookings to ensure availability for all guests.
            </p>
          </div>
          <p className="text-sm text-stone-700">Do you wish to proceed?</p>
        </div>
        <div className="flex justify-end gap-4 p-4 bg-stone-50 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 font-semibold text-stone-700 border border-stone-300 bg-white hover:bg-stone-100 transition disabled:opacity-50"
          >
            Keep My Reservation
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-6 py-2 font-semibold text-white transition ${
              isProcessing
                ? "bg-stone-400"
                : "bg-red-700 hover:bg-red-600"
            }`}
          >
            {isProcessing ? "Processing..." : "Yes, Cancel This Stay"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  
    
  const fmtUSD = (v?: number) =>
    v == null ? "—" : `${Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v))}`;

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/bookings/${id}`);
        setBooking(res.data as Booking);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const roomObj = (booking?.room && typeof booking.room !== "string" ? booking.room : null) as Room | null;
  const roomTitle = roomObj?.title ?? (typeof booking?.room === "string" ? booking?.room : "Residence");
    
  if (loading) return <p className="text-center py-12 text-lg text-stone-700">Retrieving detailed reservation information...</p>;
  if (error) return <p className="text-center py-12 text-xl text-red-600">Error: {error}</p>;
  if (!booking) return <p className="text-center py-12 text-xl text-red-600">Reservation not found.</p>;

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  
  let guestDetails: any = {};
  let uiEstimateUSD: number | undefined;
  let roomPriceUSD: number | undefined;

  try {
    if (booking.notes) {
      guestDetails = JSON.parse(booking.notes);
      uiEstimateUSD = guestDetails.uiEstimateUSD;
      
      if (roomObj?.title) {
        const roomTitleKey = roomObj.title.toUpperCase() as keyof typeof USD_PRICE_MAP;
        roomPriceUSD = USD_PRICE_MAP[roomTitleKey] || undefined;
      }
    }
  } catch {}

  const nights =
    Math.max(
      0,
      Math.round(
        (checkOutDate.setHours(0, 0, 0, 0) - checkInDate.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    ) || 1;
  
  const getStatusClasses = (status: Booking["status"]) => {
    switch(status) {
      case "Confirmed": return "bg-green-100 text-green-700 border-green-300";
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Checked-in": return "bg-blue-100 text-blue-700 border-blue-300";
      case "Checked-out": return "bg-stone-200 text-stone-700 border-stone-300";
      default: return "bg-red-100 text-red-700 border-red-300";
    }
  }

  const handleRequestCancellation = async () => {
    if (!booking) return;
    
    setIsCancelling(true);
    try {
      await cancelMyBooking(booking._id); 
      setBooking(prev => prev ? { ...prev, status: "Cancelled" } : null);
      setIsModalOpen(false);
      navigate('/profile?sec=past');
    } catch (e: any) {
      alert("Cancellation failed: " + (e?.response?.data?.error || "Please contact the concierge."));
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = booking.status === "Pending";

  return (
    <>
      <CancellationModal
        isOpen={isModalOpen}
        isProcessing={isCancelling}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRequestCancellation}
      />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        
        <header className="flex items-center justify-between border-b border-stone-200 pb-4">
          <h1 className="font-serif text-4xl font-thin italic text-stone-900 tracking-tight">
            Reservation File
          </h1>
          <div className="flex gap-3">
            <button
              disabled
              className={`bg-amber-700 text-white px-5 py-2 text-sm font-semibold transition opacity-50 cursor-default`}
            >
              View Full Details
            </button>
            <Link
              to={`/bookings/${booking._id}/status`}
              className={`border border-stone-300 text-stone-700 px-5 py-2 text-sm font-semibold hover:bg-stone-50 transition`}
            >
              Track Live Status
            </Link>
            <Link
              to="/profile"
              className="border border-stone-300 text-stone-700 px-5 py-2 text-sm font-semibold hover:bg-stone-50 transition"
            >
              My Profile
            </Link>
          </div>
        </header>
        
        <div className="border border-stone-200 bg-white shadow-2xl overflow-hidden">
          
          <div className="p-8 space-y-8">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h2 className="font-serif text-3xl font-bold text-stone-900">{roomTitle}</h2>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase border ${getStatusClasses(booking.status)}`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-4 gap-4">
              <div className="border border-stone-200 p-4 bg-stone-50">
                <div className="text-xs uppercase tracking-wider text-stone-500">Check-in</div>
                <div className="font-medium text-stone-800">{checkInDate.toDateString()}</div>
              </div>
              <div className="border border-stone-200 p-4 bg-stone-50">
                <div className="text-xs uppercase tracking-wider text-stone-500">Check-out</div>
                <div className="font-medium text-stone-800">{checkOutDate.toDateString()}</div>
              </div>
              <div className="border border-stone-200 p-4 bg-stone-50">
                <div className="text-xs uppercase tracking-wider text-stone-500">Duration</div>
                <div className="font-medium text-stone-800">{nights} Nights</div>
              </div>
              <div className="border border-stone-200 p-4 bg-stone-50">
                <div className="text-xs uppercase tracking-wider text-stone-500">Guests</div>
                <div className="font-medium text-stone-800">{booking.guests} Total</div>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-stone-800">Principal Guest</h3>
                <div className="border border-stone-200 p-4 space-y-3">
                  <DataField label="Name" value={`${guestDetails.title || ''} ${guestDetails.firstName || ''} ${guestDetails.lastName || ''}`.trim() || "—"} />
                  <DataField label="Email" value={guestDetails.email || "—"} />
                  <DataField label="Phone" value={guestDetails.phone || "—"} />
                  <DataField label="Country" value={guestDetails.country || "—"} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-stone-800">Financial Summary</h3>
                <div className="border border-amber-300 p-4 bg-amber-50 space-y-3">
                  <DataField label="Rate per Night" value={roomPriceUSD ? fmtUSD(roomPriceUSD) : "—"} color="text-amber-800" />
                  <div className="border-t border-amber-200 pt-3">
                    <DataField label="Estimated Total (USD)" value={uiEstimateUSD ? fmtUSD(uiEstimateUSD) : "—"} size="text-xl font-bold" color="text-amber-800" />
                  </div>
                  <div className="text-xs text-amber-700">
                      *Total excludes local taxes and resort fees, subject to final settlement.
                  </div>
                </div>
              </div>
            </div>

            {(guestDetails.freeNotes || guestDetails.promo || guestDetails.loyalty || roomObj?.description) && (
              <div className="pt-4 border-t border-stone-100 space-y-4">
                  <h3 className="text-xl font-semibold text-stone-800">Requests & Information</h3>
                  
                  {roomObj?.description && (
                      <DataField label={`${roomTitle} Description`} value={roomObj.description} fullWidth={true} />
                  )}
                  
                  {guestDetails.freeNotes && (
                      <DataField label="Concierge Notes" value={guestDetails.freeNotes} fullWidth={true} />
                  )}
                  
                  {(guestDetails.promo || guestDetails.loyalty) && (
                      <div className="grid sm:grid-cols-2 gap-4">
                          <DataField label="Promo/Voucher Code" value={guestDetails.promo || "None Provided"} />
                          <DataField label="Loyalty Number" value={guestDetails.loyalty || "—"} />
                      </div>
                  )}
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 flex gap-4">
              {canCancel ? (
                <button
                    disabled={isCancelling}
                    onClick={() => setIsModalOpen(true)}
                    className={`border px-6 py-3 font-semibold transition ${
                        isCancelling 
                        ? "border-stone-300 text-stone-500 cursor-not-allowed" 
                        : "border-red-500 text-red-700 hover:bg-red-50"
                    }`}
                >
                    {isCancelling ? "Processing..." : "Request Cancellation"}
                </button>
              ) : (
                <Link
                  to="/events/promotion-packages"
                  className={`border border-amber-700 text-white bg-amber-700 px-6 py-3 font-semibold hover:bg-amber-600 transition`}
                >
                  View Our Promotions
                </Link>
              )}
              
              <Link
                  to="/rooms"
                  className={`border border-${PRIMARY_COLOR} text-${PRIMARY_COLOR} px-6 py-3 font-semibold hover:bg-amber-50 transition`}
              >
                  Explore More Residences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DataField: React.FC<{ label: string; value: string; size?: string; color?: string; fullWidth?: boolean }> = ({ label, value, size = "text-base", color = "text-stone-800", fullWidth = false }) => (
    <div className={`${fullWidth ? "" : "flex justify-between items-start"}`}>
        <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
        <div className={`${size} font-medium ${color} ${fullWidth ? "mt-1" : ""}`}>{value}</div>
    </div>
);

export default BookingDetails;