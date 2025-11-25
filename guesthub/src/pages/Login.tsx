import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { verifyAdminLogin } from "../lib/api"; // Ensure this is imported
import hero from "../assets/login hero.jpg";
import logo from "../assets/Guesthub logo.jpg";

const EyeIcon: React.FC<{ open?: boolean }> = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-70">
    {open ? (
      <path stroke="currentColor" strokeWidth="1.5" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    ) : (
      <>
        <path stroke="currentColor" strokeWidth="1.5" d="M3 3l18 18" />
        <path stroke="currentColor" strokeWidth="1.5" d="M10.6 5.1c.45-.07.92-.1 1.4-.1 6.5 0 10 7 10 7a16.7 16.7 0 0 1-4.03 4.95" />
        <path stroke="currentColor" strokeWidth="1.5" d="M6.02 7.01A16.9 16.9 0 0 0 2 12s3.5 7 10 7c1.2 0 2.34-.18 3.4-.5" />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      </>
    )}
  </svg>
);

const Login: React.FC = () => {
  const { login, checkUser } = useAuth(); 
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/";
  const expired = params.get("expired") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isAdminStep, setIsAdminStep] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  const handlePwKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // @ts-ignore
    const isCaps = e.getModifierState?.("CapsLock");
    setCapsOn(!!isCaps);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      setLoading(true);

      if (isAdminStep) {
        // --- STEP 2: ADMIN VERIFY ---
        const user = await verifyAdminLogin(email, otp);
        await checkUser(); 
        handleSuccess(user);
      } else {
        // --- STEP 1: INITIAL LOGIN ---
        const response: any = await login(email, password);
        
        if (response?.requireOtp) {
           setIsAdminStep(true);
           setLoading(false);
        } else {
           handleSuccess(response);
        }
      }

    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Login failed.";
      setError(String(msg));
      setLoading(false);
    }
  };

  const handleSuccess = (user: any) => {
      setUserName(user?.name || "Guest");
      setIsAnimating(true);
      setTimeout(() => setShowWelcome(true), 500);
      setTimeout(() => {
        if (user.role === 'admin') {
            navigate('/admin', { replace: true });
        } else {
            navigate(returnTo, { replace: true });
        }
      }, 2200);
  };

  const OAuthBtn: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button
      type="button"
      onClick={(ev) => ev.preventDefault()}
      className="w-full flex items-center gap-3 rounded-full border border-slate-300 px-4 py-2.5 hover:bg-slate-50 transition disabled:opacity-50"
      disabled={isAnimating}
    >
      <span className="text-lg">{icon}</span>
      <span className="mx-auto text-sm font-medium text-slate-800">{label}</span>
    </button>
  );

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      
      {/* --- WELCOME OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1a1a] text-white transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showWelcome ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className={`text-center space-y-6 transition-all duration-1000 delay-300 transform ${showWelcome ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
           <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-3xl">{isAdminStep ? "🛡️" : "🏨"}</span>
           </div>
           <h1 className="text-5xl font-serif font-light tracking-wide text-white">
             {isAdminStep ? "Access Granted" : "Welcome Back"}
           </h1>
           <p className="text-xl font-light text-white/60 tracking-[0.2em] uppercase">
             {userName}
           </p>
        </div>
      </div>

      <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-all duration-700 ease-in-out ${isAnimating ? "opacity-0 scale-95 blur-sm grayscale" : "opacity-100 scale-100"}`}>
        
        {/* Left Hero */}
        <div className="relative hidden lg:block">
          <img src={hero} alt="Resort" className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 transition-colors duration-700 ${isAdminStep ? "bg-red-900/40" : "bg-black/30"}`} />
          <div className="relative h-full flex items-end">
            <div className="p-10 text-white space-y-2">
              <h1 className="font-display text-4xl font-semibold tracking-tight">
                {isAdminStep ? "Restricted Access" : "Guest Hub Resort"}
              </h1>
              <p className="max-w-md text-white/90">
                {isAdminStep 
                  ? "Administrative Control Panel. Authorization Required." 
                  : "Sign in to manage your bookings, orders, and preferences."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-md py-10">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="GuestHub" className="h-10 w-auto object-contain" />
            </div>

            <h2 className={`text-center font-display text-[28px] tracking-wide font-semibold mb-6 ${isAdminStep ? "text-red-900" : "text-stone-900"}`}>
              {isAdminStep ? "SECURITY CHECK" : "SIGN IN"}
            </h2>

            {expired && (
              <div role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
                Your session expired. Please sign in again.
              </div>
            )}

            {error && (
              <p className="mb-4 text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              
              {!isAdminStep ? (
                <>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Email address</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1E1B4B]"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm text-slate-700 mb-1">Password</label>
                      <Link to="/forgot-password" className="text-sm text-blue-700 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-[#1E1B4B]"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={handlePwKey}
                        disabled={loading}
                      />
                      <button type="button" className="absolute inset-y-0 right-2 px-2" onClick={() => setShowPw(!showPw)}>
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                    {capsOn && <p className="mt-1 text-xs text-amber-700">Caps Lock is on.</p>}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                   <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-6 text-center">
                      <p className="text-red-800 text-sm font-bold mb-1">⚠️ Admin Detected</p>
                      <p className="text-red-600 text-xs">We have sent a secure verification code to the General Manager's device.</p>
                   </div>
                   <label className="block text-sm font-bold text-red-900 mb-1 text-center uppercase tracking-wider">Enter Security Code</label>
                   <input
                      type="text"
                      className="w-full rounded-xl border-2 border-red-100 bg-red-50/50 px-3 py-4 text-center font-mono text-2xl tracking-[0.5em] font-bold text-red-900 focus:border-red-500 outline-none"
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      autoFocus
                      disabled={loading}
                    />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-full py-3 font-medium text-white transition-all duration-300 shadow-lg ${
                    isAdminStep 
                    ? "bg-red-700 hover:bg-red-800 shadow-red-900/20" 
                    : "bg-[#1E1B4B] hover:opacity-90"
                }`}
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isAdminStep ? "Verifying..." : "Authenticating..."}
                    </span>
                ) : (isAdminStep ? "Verify Access" : "Log in")}
              </button>
              
              {isAdminStep && (
                  <button 
                    type="button" 
                    onClick={() => setIsAdminStep(false)}
                    className="w-full text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel authentication
                  </button>
              )}
            </form>

            {!isAdminStep && (
               <>
                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Or continue with</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="space-y-3">
                  <OAuthBtn icon={<span>🇬</span>} label="Continue with Google" />
                  <OAuthBtn icon={<span></span>} label="Continue with Apple" />
                </div>

                <p className="mt-8 text-center text-sm text-slate-600">
                  Don’t have an account?{" "}
                  <Link to="/register" className="text-[#1E1B4B] font-semibold hover:underline">
                    Register
                  </Link>
                </p>
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;