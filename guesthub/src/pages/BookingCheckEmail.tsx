import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";

const BookingCheckEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("id");

  useEffect(() => {
    if (!bookingId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/bookings/${bookingId}`);
        const status = res.data?.status;
        
        // If status is NO LONGER "Pending Verification", it means they verified
        if (status && status !== "Pending Verification") {
          navigate(`/booking-success?id=${bookingId}`);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="max-w-md w-full bg-white border border-[#e7e5e4] p-10 text-center shadow-xl rounded-sm transform transition-all hover:scale-[1.01] duration-500">
        <div className="w-20 h-20 bg-[#1c1917] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl text-[#1c1917] mb-4 tracking-tight">One Last Step</h1>
        <p className="text-[#57534e] mb-8 leading-relaxed font-light text-lg">
          We have reserved your suite. To submit your request for approval, please check your email and click the "Verify Request" button.
        </p>
        <div className="bg-amber-50 border border-amber-100 p-5 text-sm text-amber-900 mb-8 rounded-md">
          <span className="font-bold block mb-1">Action Required</span>
          Your reservation is held for 60 minutes pending email verification.
        </div>
        <Link to="/profile" className="text-sm font-medium text-[#1c1917] hover:text-amber-700 transition-colors uppercase tracking-widest border-b border-transparent hover:border-amber-700 pb-1">
          Back to Your Profile
        </Link>
      </div>
    </div>
  );
};

export default BookingCheckEmail;