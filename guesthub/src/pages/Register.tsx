import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Guesthub logo.jpg";
import hero from "../assets/login hero.jpg";
import { useAuth } from "../context/AuthContext";
import { registerVerified, sendVerificationCode } from "../lib/api"; 


const Register: React.FC = () => {
  const { checkUser } = useAuth(); 
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1 = Info, 2 = Code & Password

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [agree, setAgree] = useState(false);
  
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Animation States
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Validation
  const [touchedEmail, setTouchedEmail] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- HANDLERS ---

  // Step 1: Send Email Code
  const onRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("Please accept the terms & policies.");
      return;
    }
    if (!name || !emailValid) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await sendVerificationCode(name, email);
      setStep(2); // Advance to next step
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Create Account
  const onFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) { setError("Verification code must be 6 digits."); return; }
    if (password.length < 6) { setError("Password too short (min 6 chars)."); return; }
    if (password !== confirmPass) { setError("Passwords do not match."); return; }

    try {
      setLoading(true);
      
      // 1. Call the verified registration endpoint
      await registerVerified({ name, email, password, code });
      
      // 2. Refresh global auth context so Navbar updates
      await checkUser();

      // 3. Trigger "Grand Opening" Animation
      setIsAnimating(true);
      
      setTimeout(() => {
        setShowWelcome(true);
      }, 500);

      // 4. Redirect to Home Page after animation
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);

    } catch (err: any) {
      setError(err?.response?.data?.error || "Verification failed. Please check your code.");
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans">
      
      {/* --- ANIMATION OVERLAY (Hidden by default) --- */}
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1a1a] text-white transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showWelcome ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className={`text-center space-y-6 transition-all duration-1000 delay-300 transform ${showWelcome ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
           <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
             <span className="text-3xl">✨</span>
           </div>
           <h1 className="text-5xl font-serif font-light tracking-wide text-white">
             Identity Verified
           </h1>
           <p className="text-lg font-light text-white/60 tracking-[0.2em] uppercase">
             Welcome to GuestHub, {name.split(" ")[0]}
           </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-all duration-700 ease-in-out ${isAnimating ? "opacity-0 scale-95 blur-sm grayscale" : "opacity-100 scale-100"}`}>
        
        {/* Left Hero */}
        <div className="relative hidden lg:block">
          <img
            src={hero}
            alt="Resort beachfront"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex items-end">
            <div className="p-12 text-white space-y-4">
              <h1 className="font-display text-5xl font-semibold tracking-tight leading-tight">
                Secure <br/> Profile Access
              </h1>
              <p className="max-w-md text-white/80 text-lg font-light">
                We use multi-factor email verification to ensure the security of your residence and billing information.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-md py-10">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="GuestHub" className="h-12 w-auto object-contain" />
            </div>

            {/* Dynamic Header */}
            <div className="text-center mb-8">
                <h2 className="font-display text-3xl tracking-wide font-semibold text-slate-900">
                  {step === 1 ? "Create Account" : "Security Check"}
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                  {step === 1 ? "Step 1 of 2: Personal Information" : `Step 2 of 2: Code sent to ${email}`}
                </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* --- STEP 1: INFO FORM --- */}
            {step === 1 && (
              <form onSubmit={onRequestCode} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E1B4B] transition-colors"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E1B4B] transition-colors ${
                        touchedEmail && !emailValid ? "border-red-400" : "border-slate-300"
                    }`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouchedEmail(true)}
                    disabled={loading}
                  />
                  {touchedEmail && !emailValid && <p className="text-xs text-red-600 mt-1">Invalid email address</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#1E1B4B] focus:ring-[#1E1B4B] cursor-pointer"
                      disabled={loading}
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none">
                      I agree to the{" "}
                      <Link to="/policies" className="text-[#1E1B4B] font-semibold hover:underline">
                        Terms & Policies
                      </Link>
                    </label>
                </div>

                <button
                  type="submit"
                  disabled={!name || !emailValid || !agree || loading}
                  className="w-full rounded-full bg-[#1E1B4B] text-white py-3.5 font-medium text-lg tracking-wide hover:bg-[#151338] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20"
                >
                  {loading ? "Sending Code..." : "Verify & Continue →"}
                </button>
              </form>
            )}

            {/* --- STEP 2: VERIFICATION FORM --- */}
            {step === 2 && (
              <form onSubmit={onFinalize} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 mb-4">
                   We have sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Secure Code</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E1B4B] tracking-[0.5em] text-center font-mono text-lg font-bold"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E1B4B]"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E1B4B]"
                      placeholder="••••••"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={() => setShowPw(!showPw)} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                        {showPw ? "Hide Passwords" : "Show Passwords"}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-800 underline">
                        Wrong email? Go back
                    </button>
                </div>

                <button
                  type="submit"
                  disabled={code.length !== 6 || password.length < 6 || loading}
                  className="w-full rounded-full bg-[#1E1B4B] text-white py-3.5 font-medium text-lg tracking-wide hover:bg-[#151338] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 mt-4"
                >
                  {loading ? "Verifying..." : "Finalize Account"}
                </button>
              </form>
            )}

            {step === 1 && (
              <p className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-[#1E1B4B] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;