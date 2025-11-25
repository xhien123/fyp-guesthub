import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import logoUrl from "../../assets/Guesthub logo.jpg";
import ChatWidget from "../chat/ChatWidget";
import { ChatProvider } from "../../context/ChatContext"; 
import { useAuth } from "../../context/AuthContext"; 

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = () => {
  const { user } = useAuth(); 

  
  const isAdmin = user && user.role === 'admin';
  
  
  const mainPaddingClass = isAdmin ? '' : 'pt-20';


  return (
    <ChatProvider>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only absolute left-4 top-4 z-[60] bg-white/90 px-3 py-2 text-teal-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        Skip to main content
      </a>

      {/* Navbar will return null if user is admin, but we render the component here */}
      <Navbar />

      {/* FIX: Conditionally apply padding based on role */}
      <main id="main" className={mainPaddingClass}> 
        <Outlet />
      </main>

      {/* CONDITIONAL FOOTER RENDERING */}
      {isAdmin ? (
        <footer className="w-full bg-zinc-900 px-6 py-10 text-gray-200 shadow-2xl" role="contentinfo">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4 border-b border-gray-700 pb-10">
            {/* 1. EXECUTIVE DIAL CODES */}
            <div>
              <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">Executive Access (Urgent Dial)</h4>
              <address className="not-italic text-sm space-y-2">
                <p className="font-bold text-yellow-300">
                    To Call from Desk Phone: Press 9 + Extension
                </p>
                <p className="flex justify-between text-sm">
                    <span className="text-gray-400">CEO (Mr. Hien) (999)</span>
                    <span className="font-bold text-yellow-400">DIAL 1</span>
                </p>
                <p className="flex justify-between text-sm">
                    <span className="text-gray-400">Front Office Manager (100)</span>
                    <span className="font-bold text-yellow-400">DIAL 2</span>
                </p>
                <p className="flex justify-between text-sm">
                    <span className="text-gray-400">F&B Manager (200)</span>
                    <span className="font-bold text-yellow-400">DIAL 3</span>
                </p>
                <p className="flex justify-between text-sm">
                    <span className="text-gray-400">Housekeeping Head (300)</span>
                    <span className="font-bold text-yellow-400">DIAL 4</span>
                </p>
                <p className="flex justify-between text-sm">
                    <span className="text-gray-400">Engineering Lead (400)</span>
                    <span className="font-bold text-yellow-400">DIAL 5</span>
                </p>
              </address>
            </div>

            {/* 2. OPERATIONAL QUICK LINKS */}
            <div>
              <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">Internal Processes / SOPs</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/admin/docs/incident-protocol" className="hover:text-yellow-400 transition text-gray-300">Urgent Incident Protocol</Link></li>
                <li><Link to="/admin/docs/service-recovery" className="hover:text-yellow-400 transition text-gray-300">Service Recovery Guide</Link></li>
                <li><Link to="/admin/docs/revenue" className="hover:text-yellow-400 transition text-gray-300">Daily Revenue Report</Link></li>
                 <li>
                    <Link to="/admin/reports/chat-summary" className="hover:text-yellow-400 transition text-gray-300">
                        Chat & Inquiry Summary
                    </Link>
                </li>
              </ul>
            </div>

            {/* 3. MAINTENANCE/FACILITIES STATUS */}
            <div>
              <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">Facilities Status</h4>
              <p className="text-sm text-green-500 font-bold mb-2">
                Engineering Team: All Systems Normal
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                  <li>HVAC: Normal operation.</li>
                  <li>Water Quality: Last check 12:00 PM (Optimal).</li>
                  <li>Kitchen Appliances: Daily maintenance complete.</li>
              </ul>
            </div>

            {/* 4. PUBLIC FACING LINKS (Minimal) */}
            <div>
                <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">Public Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/rooms" className="hover:text-yellow-400 transition text-gray-300">Public Booking Page</Link></li>
                  <li><Link to="/contact" className="hover:text-yellow-400 transition text-gray-300">Public Contact Form</Link></li>
                  <li><Link to="/policies" className="hover:text-yellow-400 transition text-gray-300">Resort Policies</Link></li>
                </ul>
            </div>
          </div>
           <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between pt-4 text-sm text-gray-400 md:flex-row">
                <p>© {new Date().getFullYear()} GuestHub Operations Console. All rights reserved.</p>
            </div>
        </footer>
      ) : (
        <footer className="w-full bg-zinc-900 px-6 py-12 text-gray-200 shadow-2xl" role="contentinfo">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4 border-b border-gray-700 pb-10">
            <div className="md:col-span-1">
              <div className="h-10 mb-4">
                <img alt="GuestHub Resort logo" className="h-full w-auto" src={logoUrl} />
              </div>
              <p className="mt-4 text-sm font-light leading-relaxed text-gray-400">
                Where sophisticated digital ease meets the unparalleled warmth of coastal hospitality. We define luxury in Đà Nẵng.
              </p>
              <div className="mt-6 flex space-x-4 text-xl">
                <i className="fa-brands fa-facebook-f hover:text-yellow-400 transition cursor-pointer" />
                <i className="fa-brands fa-instagram hover:text-yellow-400 transition cursor-pointer" />
                <i className="fa-brands fa-linkedin-in hover:text-yellow-400 transition cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">Contact</h4>
              <address className="not-italic text-sm space-y-3">
                <p>Vo Nguyen Giap Street, My An Ward, Ngu Hanh Son District, Đà Nẵng, Việt Nam</p>
                <p>
                  Reservations:{" "}
                  <a className="font-bold text-yellow-300 hover:text-yellow-400 transition" href="tel:+84999999999">
                    +84 999999999
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <NavLink className="text-yellow-300 hover:text-yellow-400 transition" to="/contact">
                    tranhienELVIS@fpt.edu.vn
                  </NavLink>
                </p>
                <p className="text-xs text-gray-500 pt-2">Front Desk: 6:00 AM–11:00 PM • Live Chat: 7:00 AM–11:00 PM</p>
              </address>
            </div>

            <div>
              <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">The Resort</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/">
                    Overview
                  </NavLink>
                </li>
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/rooms">
                    Luxury Suites & Villas
                  </NavLink>
                </li>
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/restaurants/savory-sizzle">
                    Fine Dining & Bars
                  </NavLink>
                </li>
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/events/meetings-weddings">
                    Events & Celebrations
                  </NavLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-xl font-semibold text-yellow-400 border-b border-yellow-400/50 pb-2 mb-4">Information</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/contact">
                    Contact Us
                  </NavLink>
                </li>
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/faqs">
                    FAQs & Guest Services
                  </NavLink>
                </li>
                <li>
                  <NavLink className="hover:text-yellow-400 transition" to="/policies">
                    Resort Policies
                  </NavLink>
                </li>
                <li>
                  <Link className="hover:text-yellow-400 transition" to="/privacy">
                    Privacy Statement
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between pt-4 text-sm text-gray-400 md:flex-row">
            <p>© {new Date().getFullYear()} GuestHub Resort. All rights reserved.</p>
            <div className="mt-3 md:mt-0">
              <NavLink className="font-extrabold text-lg text-yellow-400 hover:text-yellow-300 transition uppercase tracking-widest" to="/rooms">
                BOOK YOUR UNFORGETTABLE STAY
              </NavLink>
            </div>
          </div>
        </footer>
      )}
      

      {/* CONDITIONAL RENDERING: Hide ChatWidget if user is admin */}
      {!isAdmin && <ChatWidget />}
    </ChatProvider>
  );
};

export default Layout;