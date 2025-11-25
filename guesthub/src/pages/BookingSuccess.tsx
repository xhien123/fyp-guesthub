import React, { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti"; 

const BookingSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("id");

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1c1917', '#d4af37', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1c1917', '#d4af37', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => {
        if (bookingId) navigate(`/bookings/${bookingId}/status`);
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate, bookingId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-in zoom-in duration-500">
      <div className="max-w-lg w-full text-center space-y-8">
        
        <div className="animate-bounce duration-1000">
            <span className="text-6xl">✨</span>
        </div>

        <h1 className="font-serif text-6xl text-[#1c1917] tracking-tighter">Verified</h1>
        <p className="text-xl text-[#57534e] font-light tracking-widest uppercase border-b border-[#e7e5e4] pb-8 mx-10">
          Submitted for Approval
        </p>
        
        <div className="py-4">
            <span className="text-sm text-[#78716c] uppercase tracking-widest">Booking Reference</span>
            <br />
            <span className="font-mono text-3xl font-bold mt-3 block text-[#1c1917]">{bookingId?.slice(-6).toUpperCase() || "PENDING"}</span>
        </div>

        <p className="text-[#57534e] italic">
          Redirecting you to your profile status page...
        </p>

        <div className="pt-6 flex justify-center gap-4 opacity-0 animate-in fade-in delay-1000 duration-1000 fill-mode-forwards">
            <Link to={`/bookings/${bookingId}/status`} className="px-8 py-3 bg-[#1c1917] text-white hover:bg-opacity-90 transition shadow-lg">
              View Status
            </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;