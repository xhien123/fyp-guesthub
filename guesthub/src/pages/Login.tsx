import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { verifyAdminLogin } from "../lib/api";
import hero from "../assets/login hero.jpg";
import logo from "../assets/Guesthub logo.jpg";

const EyeIcon: React.FC<{ open: boolean; onClick: () => void }> = ({ open, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute inset-y-0 right-2 px-2 text-slate-400 hover:text-slate-600 transition-colors"
    tabIndex={-1}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-all">
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
  </button>
);

const OAuthBtn: React.FC<{ icon: React.ReactNode; label: string; disabled?: boolean }> = ({ icon, label, disabled }) => (
  <button
    type="button"
    onClick={(ev) => ev.preventDefault()}
    disabled={disabled}
    className="w-full flex items-center gap-3 rounded-full border border-slate-300 px-4 py-2.5 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span className="text-lg w-6 flex justify-center">{icon}</span>
    <span className="mx-auto text-sm font-medium text-slate-800">{label}</span>
  </button>
);

const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Login: React.FC = () => {
  const { login, checkUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  
  const returnTo = params.get("returnTo") || "/";
  const sessionExpired = params.get("expired") === "1";

  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [uiState, setUiState] = useState({
    showPw: false,
    capsOn: false,
    loading: false,
    error: "",
    isAdminStep: false,
    isAnimating: false,
    showWelcome: false,
    userName: ""
  });

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (uiState.error) setUiState(prev => ({ ...prev, error: "" }));
  };

  const handlePwKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCaps = e.getModifierState("CapsLock");
    setUiState(prev => ({ ...prev, capsOn: isCaps }));
  };

  const handleSuccess = (user: any) => {
    setUiState(prev => ({ 
      ...prev, 
      loading: false, 
      userName: user?.name || "Guest", 
      isAnimating: true 
    }));

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showWelcome: true }));
    }, 500);

    setTimeout(() => {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        if (sessionExpired || returnTo === '/login') {
             navigate('/', { replace: true });
        } else {
             navigate(returnTo, { replace: true });
        }
      }
    }, 2200);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, loading: true, error: "" }));

    try {
      if (uiState.isAdminStep) {
        const user = await verifyAdminLogin(formData.email, formData.otp);
        await checkUser(); 
        handleSuccess(user);
      } else {
        const response: any = await login(formData.email, formData.password);

        if (response?.requireOtp) {
          setUiState(prev => ({ ...prev, isAdminStep: true, loading: false }));
        } else {
          handleSuccess(response);
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Login failed. Please try again.";
      setUiState(prev => ({ ...prev, error: msg, loading: false }));
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans text-slate-900">
      
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1c1917] text-white transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          uiState.showWelcome ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className={`text-center space-y-6 transition-all duration-1000 delay-300 transform ${uiState.showWelcome ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
           <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 bg-white/5 backdrop-blur-sm">
             <span className="text-4xl">{uiState.isAdminStep ? "🛡️" : "👋"}</span>
           </div>
           <h1 className="text-5xl font-serif font-light tracking-wide text-white">
             {uiState.isAdminStep ? "Access Granted" : "Welcome Back"}
           </h1>
           <p className="text-xl font-light text-[#D4AF37] tracking-[0.2em] uppercase">
             {uiState.userName}
           </p>
        </div>
      </div>

      <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-all duration-700 ease-in-out ${uiState.isAnimating ? "opacity-0 scale-95 blur-sm grayscale" : "opacity-100 scale-100"}`}>
        
        <div className="relative hidden lg:block">
          <img src={hero} alt="Resort Lobby" className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 transition-colors duration-700 ${uiState.isAdminStep ? "bg-red-950/60" : "bg-black/30"}`} />
          
          <div className="relative h-full flex flex-col justify-end p-16 text-white">
            <h1 className="font-serif text-5xl mb-4">
              {uiState.isAdminStep ? "Restricted Access" : "GuestHub Resort"}
            </h1>
            <p className="max-w-md text-white/90 text-lg font-light leading-relaxed">
              {uiState.isAdminStep 
                ? "Administrative Control Panel. Authorization Required." 
                : "Experience seamless luxury. Sign in to manage your bookings and dining."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 sm:px-10 bg-white">
          <div className="w-full max-w-md py-10">
            
            <div className="flex justify-center mb-8">
              <img src={logo} alt="GuestHub Logo" className="h-12 w-auto object-contain" />
            </div>

            <h2 className={`text-center font-serif text-3xl mb-8 ${uiState.isAdminStep ? "text-red-800" : "text-stone-900"}`}>
              {uiState.isAdminStep ? "Security Verification" : "Sign In"}
            </h2>

            {sessionExpired && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-amber-800 text-sm">
                <span>⚠️</span>
                <span>Your session has expired. Please log in again to continue.</span>
              </div>
            )}

            {uiState.error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm text-center">
                {uiState.error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              
              {!uiState.isAdminStep ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#b8860b] focus:bg-white transition-all"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      disabled={uiState.loading}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-[#b8860b] hover:text-[#8f690b]">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={uiState.showPw ? "text" : "password"}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#b8860b] focus:bg-white transition-all"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                        onKeyUp={handlePwKey}
                        disabled={uiState.loading}
                      />
                      <EyeIcon open={uiState.showPw} onClick={() => setUiState(p => ({ ...p, showPw: !p.showPw }))} />
                    </div>
                    {uiState.capsOn && <p className="mt-2 text-xs font-bold text-amber-600">⇪ Caps Lock is on</p>}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                   <div className="bg-red-50 border border-red-100 p-5 rounded-xl mb-6 text-center">
                     <p className="text-red-900 text-sm font-bold mb-1">⚠️ Administrative Access Detected</p>
                     <p className="text-red-700 text-xs">A secure verification code has been sent to the registered General Manager email.</p>
                   </div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-red-900 mb-2 text-center">Enter Security Code</label>
                   <input
                     type="text"
                     className="w-full rounded-xl border-2 border-red-100 bg-red-50/50 px-3 py-4 text-center font-mono text-3xl tracking-[0.5em] font-bold text-red-900 focus:border-red-500 focus:bg-white outline-none transition-all"
                     placeholder="000000"
                     maxLength={6}
                     value={formData.otp}
                     onChange={(e) => updateForm("otp", e.target.value.replace(/[^0-9]/g, ''))}
                     autoFocus
                     disabled={uiState.loading}
                   />
                </div>
              )}

              <button
                type="submit"
                disabled={uiState.loading}
                className={`w-full rounded-full py-3.5 font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                  uiState.isAdminStep 
                    ? "bg-red-800 hover:bg-red-900 shadow-red-900/20" 
                    : "bg-[#1c1917] hover:bg-stone-800 shadow-stone-900/20"
                }`}
              >
                {uiState.loading ? (
                    <div className="flex items-center justify-center gap-2">
                       <Spinner />
                       <span>{uiState.isAdminStep ? "Verifying..." : "Authenticating..."}</span>
                    </div>
                ) : (uiState.isAdminStep ? "Verify Access" : "Log In")}
              </button>
              
              {uiState.isAdminStep && (
                  <button 
                    type="button" 
                    onClick={() => setUiState(p => ({ ...p, isAdminStep: false, error: "" }))}
                    className="w-full text-xs font-medium text-slate-400 hover:text-slate-800 transition-colors mt-4"
                  >
                    Cancel authentication
                  </button>
              )}
            </form>

            {!uiState.isAdminStep && (
               <>
                <div className="my-10 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Or continue with</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="space-y-3">
                  <OAuthBtn disabled={uiState.isAnimating} icon={<span className="text-xl">🇬</span>} label="Google" />
                  <OAuthBtn disabled={uiState.isAnimating} icon={<span className="text-xl"></span>} label="Apple ID" />
                </div>

                <p className="mt-10 text-center text-sm text-slate-500">
                  New to GuestHub?{" "}
                  <Link to="/register" className="text-[#b8860b] font-bold hover:text-[#8f690b] hover:underline">
                    Create an account
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