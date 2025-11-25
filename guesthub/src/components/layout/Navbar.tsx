import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import logoUrl from "../../assets/Guesthub logo.jpg";

const Navbar: React.FC = () => {
  // --- HOOKS ---
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { clearChatHistory } = useChat();
  const navigate = useNavigate();
  const location = useLocation(); // Needed to close menu on route change
  
  const [bump, setBump] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // New State

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  // --- LOGIC ---

  const handleLogout = () => {
    clearChatHistory();
    logout();
    navigate("/login", { replace: true });
    setMobileMenuOpen(false); // Close menu on logout
  };

  // Close mobile menu when changing pages
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle bump animation
  useEffect(() => {
    if (items.length === 0) return;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 300);
    return () => window.clearTimeout(timer);
  }, [items]);

  // Handle scroll logic & manual bump events
  useEffect(() => {
    const handleBumpEvent = () => {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 300);
      window.setTimeout(() => window.clearTimeout(timer), 300);
    };

    window.addEventListener("cart:bump", handleBumpEvent);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("cart:bump", handleBumpEvent);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  
  if (user && user.role === 'admin') {
    return null; 
  }

  // --- STYLES ---

  const solid = hovered || scrolled || mobileMenuOpen; // Solid if menu is open too
  const topText = solid ? "text-gray-900" : "text-white/90 hover:text-white";
  const activeTop = solid
    ? "text-gray-900 border-b-2 border-teal-600"
    : "text-white border-b-2 border-white/50";

  const cartBtn =
    "relative rounded-none p-2 transition-colors " +
    (solid ? "text-gray-900 hover:bg-gray-100" : "text-white hover:bg-black/10");

  const signInBtn =
    "flex items-center gap-2 border px-3 py-1.5 text-sm font-semibold transition-colors " +
    (solid
      ? "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
      : "border-white/50 text-white hover:bg-white/10");

  const signInIcon = "w-4 h-4 " + (solid ? "text-gray-900" : "text-white");

  const containerBg =
    "transition-all duration-300 " +
    (solid
      ? "bg-white/95 backdrop-blur border-b border-gray-200 shadow-lg"
      : "bg-black/50");

  const linkBase =
    "flex items-center px-3 py-2 h-full text-sm tracking-wide transition-colors border-b-2 border-transparent hover:border-current";

  const logoText = "GUESTHUB BEACH RESORT";

  // Helper for mobile links
  const MobileLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link 
      to={to} 
      className="block py-3 px-4 text-sm font-bold uppercase tracking-widest text-stone-800 hover:bg-stone-100 border-b border-stone-100 transition-colors"
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={containerBg}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3">
            {/* --- MOBILE HAMBURGER BUTTON (ADDED) --- */}
            <button 
                className={`lg:hidden focus:outline-none ${solid ? "text-gray-900" : "text-white"}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="logo"
                className="h-8 w-8 rounded-sm object-cover"
              />
              <span
                className={
                  "hidden md:inline text-xl font-semibold italic tracking-wide " +
                  (solid ? "text-gray-900" : "text-white")
                }
              >
                {logoText}
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-stretch h-full">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeTop : topText} font-medium`
              }
            >
              Overview
            </NavLink>

            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeTop : topText} font-medium`
              }
            >
              Rooms
            </NavLink>

            <div className="relative group flex items-stretch h-full">
              <NavLink
                to="/restaurants/savory-sizzle"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeTop : topText
                  } font-medium flex items-center`
                }
              >
                Restaurants &amp; Bars
                <svg
                  className={`ml-2 h-3.5 w-3.5 transition-colors ${
                    solid ? "text-gray-900" : "text-white/90"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </NavLink>
              <div
                className={`absolute left-0 top-full mt-0 w-72 rounded-none border shadow-xl transition-opacity duration-300 ${
                  solid
                    ? "border-gray-200 bg-white text-gray-900 opacity-100 pointer-events-auto group-hover:block"
                    : "opacity-0 pointer-events-none"
                } hidden group-hover:block`}
              >
                <Link
                  to="/restaurants/vive-oceane"
                  className="block px-3 py-2 hover:bg-gray-50"
                >
                  Vive Océane (Ocean-view)
                </Link>
                <Link
                  to="/restaurants/savory-sizzle"
                  className="block px-3 py-2 hover:bg-gray-50"
                >
                  Savory Sizzle (Buffet)
                </Link>
              </div>
            </div>

            <NavLink
              to="/restaurants"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeTop : topText} font-medium`
              }
            >
              Menu
            </NavLink>

            <div className="relative group flex items-stretch h-full">
              <NavLink
                to="/events/meetings-weddings"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeTop : topText
                  } font-medium flex items-center`
                }
              >
                Events
                <svg
                  className={`ml-2 h-3.5 w-3.5 transition-colors ${
                    solid ? "text-gray-900" : "text-white/90"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </NavLink>
              <div
                className={`absolute left-0 top-full mt-0 w-72 rounded-none border shadow-xl transition-opacity duration-300 ${
                  solid
                    ? "border-gray-200 bg-white text-gray-900 opacity-100 pointer-events-auto group-hover:block"
                    : "opacity-0 pointer-events-none"
                } hidden group-hover:block`}
              >
                <Link
                  to="/events/meetings-weddings"
                  className="block px-3 py-2 hover:bg-gray-50"
                >
                  Meetings and Weddings
                </Link>
                <Link
                  to="/events/promotion-packages"
                  className="block px-3 py-2 hover:bg-gray-50"
                >
                  Other Promotion Packages
                </Link>
              </div>
            </div>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeTop : topText} font-medium`
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4 h-full">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={`text-sm font-medium ${
                    solid
                      ? "text-gray-800 hover:text-teal-700"
                      : "text-white hover:text-amber-100"
                  }`}
                >
                  Hi, {user.name?.split(" ")[0] ?? "Guest"}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className={`text-sm font-medium ${
                    solid
                      ? "text-red-600 hover:underline"
                      : "text-red-100 hover:underline"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={signInBtn}>
                <svg
                  className={signInIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.72 2.345A6.975 6.975 0 0110 16a6.975 6.975 0 014.72-1.655A5.99 5.99 0 0010 12z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign In / Sign up
              </Link>
            )}

            {user && (
              <motion.button
                onClick={() => navigate("/checkout")}
                className={cartBtn}
                aria-label="Cart"
                animate={bump ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <i className="fa-solid fa-basket-shopping text-lg" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={
                        "absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[11px] text-white " +
                        (solid ? "bg-teal-600" : "bg-teal-500")
                      }
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>

        {/* --- MOBILE MENU DROPDOWN (ADDED) --- */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden bg-white border-t border-stone-200 shadow-2xl overflow-hidden"
                >
                    <div className="flex flex-col">
                        <MobileLink to="/">Overview</MobileLink>
                        <MobileLink to="/rooms">Rooms</MobileLink>
                        <MobileLink to="/restaurants/savory-sizzle">Dining</MobileLink>
                        <MobileLink to="/restaurants">Menu</MobileLink>
                        <MobileLink to="/events/meetings-weddings">Events</MobileLink>
                        <MobileLink to="/contact">Contact</MobileLink>
                        {user && (
                            <MobileLink to="/checkout">Cart ({cartCount})</MobileLink>
                        )}
                        
                        {user ? (
                            <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center">
                                <Link to="/profile" className="font-bold text-stone-800 uppercase text-xs tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                                    Hi, {user.name?.split(" ")[0] ?? "Guest"}
                                </Link>
                                <button onClick={handleLogout} className="text-red-600 text-xs font-bold uppercase tracking-widest">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-stone-900 text-white p-4 text-center font-bold uppercase tracking-widest text-xs hover:bg-stone-800" onClick={() => setMobileMenuOpen(false)}>
                                Sign In / Register
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        {/* --- END MOBILE MENU --- */}

      </div>
    </header>
  );
};

export default Navbar;