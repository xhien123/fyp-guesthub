import React, { Suspense, useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";


interface ToastProps {
  show: boolean;
  title: string;
  message: string;
  type: "booking" | "order" | "inquiry" | "message";
  onClose: () => void;
}

const AdminToast: React.FC<ToastProps> = ({ show, title, message, type, onClose }) => {
  if (!show) return null;

  const iconMap = {
    booking: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, // Calendar
    order: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />, // Bell/Food
    inquiry: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, // Mail
    message: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> // Chat
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-[#1c1917] text-white px-6 py-5 rounded-sm shadow-2xl border-l-4 border-[#d4af37] flex items-center gap-5 min-w-[350px] max-w-[450px]">
        <div className="bg-[#d4af37] rounded-full p-2 flex-shrink-0">
           <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {iconMap[type]}
           </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-1">{title}</h4>
          <p className="text-sm font-medium text-white/90 truncate">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-white/40 hover:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};


const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Notification State
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [newInquiryAlert, setNewInquiryAlert] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ show: boolean; title: string; msg: string; type: "booking"|"order"|"inquiry"|"message" }>({
      show: false, title: "", msg: "", type: "booking"
  });
  
  const [, setSocket] = useState<Socket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  const showNotification = (title: string, msg: string, type: "booking"|"order"|"inquiry"|"message") => {
      // Play a subtle sound (Optional)
      // const audio = new Audio('/assets/notification.mp3'); audio.play().catch(() => {});
      
      setToast({ show: true, title, msg, type });
      // Auto hide after 6 seconds
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 6000);
  };

  useEffect(() => {
    // Initial Fetch
    fetch("/api/admin/chat/unread-count", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUnreadChatCount(data.count || 0))
      .catch(() => setUnreadChatCount(0));

    const s = io(SOCKET_URL, { transports: ["websocket"], withCredentials: true });
    setSocket(s);

    s.emit("admin:join:notifications");

    // 1. CHAT MESSAGES
    s.on("chat:new-message", (data) => {
      setUnreadChatCount(data.unreadCount);
      // Only show toast if not currently on chat page
      if (!location.pathname.includes("/admin/chat")) {
          showNotification("Concierge Message", "New guest message received.", "message");
      }
    });

    // 2. BOOKINGS (New / Verified)
    s.on("booking:updated", (booking) => {
        // If status is "Pending", it means they just verified their email
        if (booking.status === "Pending") {
            setNewBookingAlert(true);
            const guest = booking.guestName || "Guest";
            const room = typeof booking.room === 'string' ? 'Room' : booking.room?.title || 'Room';
            showNotification("New Reservation Verified", `${guest} confirmed for ${room}. Review needed.`, "booking");
        }
    });

    // 3. ORDERS (New Food/Service)
    s.on("order:new", (order) => {
        setNewOrderAlert(true);
        const room = order.roomNumber ? `Room ${order.roomNumber}` : "Dine-in";
        showNotification("New Order Received", `New request from ${room}.`, "order");
    });

    // 4. INQUIRIES (New Contact Form)
    s.on("inquiry:new", (inquiry) => {
        setNewInquiryAlert(true);
        showNotification("New Inquiry", `${inquiry.subject} from ${inquiry.name}`, "inquiry");
    });

    return () => {
      s.disconnect();
    };
  }, [location.pathname]);

 
  useEffect(() => {
      if (location.pathname === "/admin/bookings") setNewBookingAlert(false);
      if (location.pathname === "/admin/orders") setNewOrderAlert(false);
      if (location.pathname === "/admin/inquiries") setNewInquiryAlert(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/admin", icon: "fa-tachometer-alt", label: "Dashboard" },
    { to: "/admin/bookings", icon: "fa-door-closed", label: "Bookings", alert: newBookingAlert },
    { to: "/admin/orders", icon: "fa-utensils", label: "Orders", alert: newOrderAlert },
    { to: "/admin/inquiries", icon: "fa-envelope", label: "Inquiries", alert: newInquiryAlert },
    { to: "/admin/rooms", icon: "fa-bed", label: "Rooms" },
    { to: "/admin/menu", icon: "fa-list-alt", label: "Menu" },
    { to: "/admin/chat", icon: "fa-comments", label: "Chat", count: unreadChatCount },
  ];

  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20';
  const contentMargin = isSidebarOpen ? 'ml-64' : 'ml-20'; 
  const toggleIcon = isSidebarOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'; 

  return (
    <div className="flex h-screen w-screen bg-neutral-100 overflow-hidden m-0 p-0">
      
    
      <AdminToast 
        show={toast.show} 
        title={toast.title} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))} 
      />

      <div className={`fixed z-50 h-full transition-all duration-300 ${sidebarWidth}`}>
        
        <div className="bg-zinc-900 text-white flex flex-col flex-shrink-0 shadow-lg h-full">
          
          <div className="p-4 border-b border-gray-700">
            <Link to="/admin" className={`text-2xl font-serif font-bold text-yellow-400 overflow-hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
              GuestHub Admin
            </Link>
            {!isSidebarOpen && (
               <Link to="/admin" className="text-xl font-serif font-bold text-yellow-400 text-center">
                  <i className="fas fa-bars text-lg"></i>
              </Link>
            )}
          </div>
          
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center p-3 rounded-lg transition-colors relative ${
                  location.pathname.startsWith(item.to) && item.to !== "/admin"
                    ? "bg-yellow-500 text-zinc-900 font-semibold"
                    : location.pathname === "/admin" && item.to === "/admin"
                    ? "bg-yellow-500 text-zinc-900 font-semibold"
                    : "text-gray-300 hover:bg-zinc-800"
                }`}
              >
                <i className={`fas ${item.icon} w-5 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}></i>
                <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {item.label}
                </span>
                
                {item.count && item.count > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                )}
                
                
                {item.alert && (
                    <span className="absolute right-2 top-2 h-3 w-3 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse"></span>
                )}
              </Link>
            ))}

            <div className="h-10"></div> 
            
            <div className="pt-2 border-t border-gray-700">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full flex items-center justify-start p-3 text-sm font-semibold text-gray-400 hover:text-yellow-400 transition"
                aria-label={isSidebarOpen ? "Collapse menu" : "Expand menu"}
              >
                <i className={`fas ${toggleIcon} w-5 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}></i>
                <span className={isSidebarOpen ? 'inline' : 'sr-only'}>
                  {isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
                </span>
              </button>
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-700">
            <p className={`text-sm font-medium text-gray-400 overflow-hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
              Logged in as: {user?.name || "Admin"}
            </p>
            <button
              onClick={logout}
              className={`mt-2 w-full text-left text-sm text-gray-400 hover:text-red-400 transition ${isSidebarOpen ? 'text-left' : 'text-center'}`}
            >
              <i className={`fas fa-sign-out-alt ${isSidebarOpen ? 'mr-2' : ''}`}></i>
              <span className={isSidebarOpen ? 'inline' : 'sr-only'}>Sign Out</span>
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-50 bg-zinc-900 border-2 border-yellow-500 text-yellow-500 shadow-xl p-2 transition-all duration-300 transform 
            ${isSidebarOpen ? 'right-[-12px]' : 'right-[-12px]'} 
            hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 hidden lg:block`}
          style={{ clipPath: isSidebarOpen ? 'polygon(50% 0, 100% 50%, 50% 100%, 0% 50%)' : 'polygon(0 0, 100% 50%, 0 100%)' }}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-sm`}></i>
        </button>
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${contentMargin}`}>
        
        <header className="bg-zinc-900 text-white shadow-xl h-20 flex items-center justify-between px-8 flex-shrink-0">
            <div className="text-xl font-serif font-light text-white tracking-wider">
                <span className="text-yellow-400 font-bold">FLAWLESS SERVICE:</span> Where Anticipation Meets Execution
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400">Hi, {user?.name || "Admin"}</span>
                <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>
        </header>
        
        <div className="p-8 flex-1 overflow-y-auto"> 
          <h1 className="text-3xl font-serif font-bold text-zinc-800 mb-6 sr-only">
            {navItems.find((item) => location.pathname.startsWith(item.to))?.label || "Admin Panel"}
          </h1>
          <Suspense fallback={<div className="p-6">Loading Admin Content...</div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;