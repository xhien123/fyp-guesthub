import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendResetCode, completePasswordReset } from "../lib/api";
import hero from "../assets/login hero.jpg"; 
import logo from "../assets/Guesthub logo.jpg";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  // Technical Note: Step 1 = Enter Email, Step 2 = Enter Code & New Password
  const [step, setStep] = useState(1); 
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Step 1: Request Code Handler
  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendResetCode(email);
      // Move to next step regardless of user existence (API returns 200 always)
      setStep(2);
      setMessage(`We have sent a reset code to ${email}`);
    } catch (err) {
      setError("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password Handler
  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await completePasswordReset({ email, code, newPassword });
      setMessage("Password reset successfully!");
      // Redirect to login after 2 seconds for better UX
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid code or error resetting password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans">
      
      {/* Left Hero Image */}
      <div className="relative hidden lg:block">
        <img
          src={hero}
          alt="Resort Atmosphere"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1E1B4B]/30 mix-blend-multiply" />
        <div className="relative h-full flex items-end p-12 text-white">
          <div>
            <h1 className="font-display text-4xl font-light tracking-wide mb-4">
              Welcome Back
            </h1>
            <p className="text-white/80 font-light text-lg max-w-md">
              Recover access to your residence controls and exclusive bookings.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center px-6 sm:px-10 py-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center">
             <img src={logo} alt="GuestHub" className="h-12 w-auto mx-auto mb-6 object-contain" />
             <h2 className="text-2xl font-serif text-[#1E1B4B] mb-2">
               {step === 1 ? "Forgot Password?" : "Reset Credentials"}
             </h2>
             <p className="text-slate-500 text-sm">
               {step === 1 
                 ? "Enter your email to receive a secure reset code." 
                 : "Enter the code from your email and a new password."}
             </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          {message && !error && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center border border-green-100">
              {message}
            </div>
          )}

          {/* FORM STEP 1 */}
          {step === 1 && (
            <form onSubmit={onRequest} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-[#1E1B4B] outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E1B4B] text-white py-3.5 rounded-full font-medium hover:bg-[#151338] transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/10"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* FORM STEP 2 */}
          {step === 2 && (
            <form onSubmit={onReset} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-xl tracking-[0.3em] focus:ring-2 focus:ring-[#1E1B4B] outline-none"
                  placeholder="000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-[#1E1B4B] outline-none"
                    placeholder="Min 6 characters"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium hover:text-[#1E1B4B]"
                  >
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E1B4B] text-white py-3.5 rounded-full font-medium hover:bg-[#151338] transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/10"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

              <div className="text-center">
                 <button 
                   type="button" 
                   onClick={() => setStep(1)} 
                   className="text-xs text-slate-500 hover:underline"
                 >
                   Wait, I entered the wrong email
                 </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <Link to="/login" className="text-sm font-medium text-[#1E1B4B] hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;