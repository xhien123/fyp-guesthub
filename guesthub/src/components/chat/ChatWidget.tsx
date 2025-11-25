import React from "react";
import { io, Socket } from "socket.io-client";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat, type Message as ChatMessage } from "../../context/ChatContext";
import promoImg from "../../assets/promotion package background.png";

// --- Types ---
type BotSegment =
  | string
  | { type: "link"; to: string; text: string }
  | { type: "image"; src: string; alt?: string };

type BotContent = BotSegment[];
type Msg = ChatMessage;

type QuickOption = { title: string; text: string; link: string; linkText: string };
type QuickMap = Record<string, QuickOption>;

// --- Constants ---
const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const quickGuest: QuickMap = {
  login: {
    title: "Access Membership",
    text: "Please log in to access your personal concierge and exclusive privileges.",
    link: "/login",
    linkText: "Sign In / Register",
  },
  menu: {
    title: "Culinary Journey",
    text: "Explore our chef-curated menus and fine dining options.",
    link: "/menu",
    linkText: "View Menus",
  },
  about: {
    title: "Our Heritage",
    text: "Discover the story of serenity behind GuestHub Beach Resort.",
    link: "/about",
    linkText: "Read Our Story",
  },
  contact: {
    title: "Connect With Us",
    text: "Require immediate assistance? Here is how to reach our front desk.",
    link: "/contact",
    linkText: "Contact Details",
  },
};

const quickUser: QuickMap = {
  book: {
    title: "Reserve a Suite",
    text: "Ready to book your next escape?",
    link: "/book",
    linkText: "Check Availability",
  },
  order: {
    title: "In-Room Dining",
    text: "Experience world-class dining from the comfort of your room.",
    link: "/restaurants",
    linkText: "Order Now",
  },
  bookings: {
    title: "My Reservations",
    text: "View details of your upcoming and past stays.",
    link: "/profile?tab=bookings",
    linkText: "Manage Bookings",
  },
  loyalty: {
    title: "Elite Status",
    text: "Review your points, tier status, and exclusive member benefits.",
    link: "/profile?tab=loyalty",
    linkText: "My Privileges",
  },
};

// --- Helpers ---
async function apiJson(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

// --- Component ---
const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const {
    conversationId,
    history,
    setConversationState,
    addMessage,
    clearChatHistory,
  } = useChat();

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [liveChatStarted, setLiveChatStarted] = React.useState(false);
  const [quickPanelOpen, setQuickPanelOpen] = React.useState(false);
  const [hasSentAutoReply, setHasSentAutoReply] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const quicks: QuickMap = isLoggedIn ? quickUser : quickGuest;

  // --- Effects ---
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, open]);

  React.useEffect(() => {
    if (!isLoggedIn) {
      setLiveChatStarted(false);
      setInput("");
      setQuickPanelOpen(false);
      setHasSentAutoReply(false);
      clearChatHistory();
      setSocket((s) => {
        s?.disconnect();
        return null;
      });
    } else {
      setHasSentAutoReply(false);
    }
  }, [isLoggedIn, clearChatHistory]);

  React.useEffect(() => {
    if (!open || !isLoggedIn) return;

    let cancelled = false;

    (async () => {
      try {
        const { conversationId: cid, history: h } = await apiJson("/api/chat/ensure", {
          method: "POST",
        });

        if (cancelled) return;

        setConversationState(cid, h);

        const hasLiveMessages = (h as Msg[]).some(
          (m) => m.senderType === "admin" || m.senderType === "user"
        );
        setLiveChatStarted(hasLiveMessages);

        const s = io(BACKEND_URL, { transports: ["websocket"], withCredentials: true });
        setSocket(s);
        s.emit("user:join", { conversationId: cid });

        s.on("message:new", (m: Msg) => {
          addMessage(m);
          if (m.senderType === "admin") setLiveChatStarted(true);
        });
      } catch (error) {
        console.error("Failed to establish chat session:", error);
      }
    })();

    return () => {
      cancelled = true;
      setSocket((s) => {
        s?.disconnect();
        return null;
      });
    };
  }, [open, isLoggedIn, setConversationState, addMessage]);

  // --- Handlers ---
  const sendLive = () => {
    const text = input.trim();
    if (!text || !socket || !conversationId || !isLoggedIn) return;

    setInput("");
    setLiveChatStarted(true);

    socket.emit("user:message", {
      conversationId,
      senderType: "user",
      senderId: user?._id,
      text,
    });

    if (!hasSentAutoReply) {
      const nowIso = new Date().toISOString();
      const autoText: BotContent = [
        "Thank you for reaching out. A concierge associate is reviewing your request and will be with you momentarily.",
        "\n\nWhile you wait, we invite you to explore our exclusive offers.",
        "\n\n",
        {
          type: "image",
          src: promoImg,
          alt: "GuestHub Resort – promotion package",
        },
        "\n",
        {
          type: "link",
          to: "/events/promotion-packages",
          text: "View Curated Packages",
        },
      ];

      const autoMessage: Msg = {
        _id: `auto-${Date.now()}`,
        conversationId,
        senderType: "bot",
        text: autoText as any,
        createdAt: nowIso,
      };

      addMessage(autoMessage);
      setHasSentAutoReply(true);
    }
  };

  const quickClick = (key: string) => {
    const qa = quicks[key];
    if (!qa) return;

    setQuickPanelOpen(false);
    const nowIso = new Date().toISOString();

    // User message
    addMessage({
      _id: `local-${Date.now()}-u`,
      conversationId: conversationId || "",
      senderType: "user",
      text: qa.title,
      createdAt: nowIso,
    });

    // Bot response
    const botContent: BotContent = [
      qa.text + " ",
      { type: "link", to: qa.link, text: qa.linkText },
    ];

    addMessage({
      _id: `local-${Date.now()}-b`,
      conversationId: conversationId || "",
      senderType: "bot",
      text: botContent as any,
      createdAt: nowIso,
    });
  };

  // --- Renderers ---
  const showInitialQuicks = !liveChatStarted;
  const messages: Msg[] = history as Msg[];

  const renderMessage = (m: Msg) => {
    if (m.senderType === "bot") {
      if (Array.isArray(m.text)) {
        return (m.text as BotContent).map((segment, index) => {
          if (typeof segment === "string") {
            return <span key={index}>{segment}</span>;
          }
          if (segment.type === "link") {
            return (
              <Link
                key={index}
                to={segment.to}
                className="block mt-3 text-xs tracking-widest uppercase font-bold text-[#b8860b] hover:text-[#8f690b] transition-colors border-b border-[#b8860b] w-max pb-0.5"
              >
                {segment.text} &rarr;
              </Link>
            );
          }
          if (segment.type === "image") {
            return (
              <div key={index} className="mt-4 mb-2">
                <Link to="/events/promotion-packages">
                  <div className="w-full h-32 rounded-lg border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={segment.src}
                      alt={segment.alt ?? "Promotion"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              </div>
            );
          }
          return null;
        });
      }
      return String(m.text ?? "");
    }
    return String(m.text ?? "");
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="fixed bottom-8 right-8 z-[9999] font-sans">
        {/* LAUNCHER BUTTON */}
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-[#1c1917] text-[#D4AF37] shadow-2xl hover:scale-105 transition-all duration-300 ease-out border border-[#333] hover:border-[#D4AF37]"
          >
            <span className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <i className="fa-solid fa-bell-concierge text-2xl"></i>
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
            </span>
          </button>
        ) : (
          /* MAIN CHAT CONTAINER */
          <div 
            className="animate-slide-in w-[360px] h-[600px] flex flex-col bg-[#FAFAFA] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-stone-200 overflow-hidden ring-1 ring-black/5"
          >
            
            {/* HEADER */}
            <div className="relative z-10 px-6 py-5 bg-[#1c1917] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8f690b] flex items-center justify-center text-stone-900 shadow-lg">
                        <i className="fa-solid fa-gem text-lg"></i>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1c1917] rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-serif text-lg tracking-wide text-[#D4AF37]">Concierge</h3>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">At Your Service</p>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); setQuickPanelOpen(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-[#FAFAFA]" ref={chatContainerRef}>
              
              {/* Login Prompt for Guests */}
              {!isLoggedIn && (
                <div className="mx-auto w-full max-w-[90%] text-center p-6 bg-white border border-stone-100 shadow-sm rounded-xl">
                    <i className="fa-solid fa-lock text-2xl text-stone-300 mb-3"></i>
                    <p className="text-sm text-stone-600 mb-3 font-light leading-relaxed">
                        To access our live concierge and view personalized requests, please sign in.
                    </p>
                    <Link to="/login" className="inline-block text-xs font-bold uppercase tracking-widest text-[#1c1917] border-b border-[#1c1917] pb-1 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all">
                        Access Account
                    </Link>
                </div>
              )}

              {/* Messages */}
              {messages.map((m, i) => {
                const isUser = m.senderType === "user";
                return (
                  <div
                    key={m._id || i}
                    className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div
                        className={`px-5 py-3 text-sm leading-relaxed shadow-sm ${
                            isUser
                                ? "bg-[#1c1917] text-stone-100 rounded-2xl rounded-tr-sm"
                                : "bg-white text-stone-700 border border-stone-100 rounded-2xl rounded-tl-sm"
                        }`}
                    >
                        <div className="whitespace-pre-wrap">{renderMessage(m)}</div>
                    </div>
                    <span className="text-[9px] text-stone-400 mt-1 px-1">
                        {isUser ? "You" : "Concierge"}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER AREA */}
            <div className="p-5 bg-white border-t border-stone-100 relative">
              
              {/* Initial Suggestions (Pills) */}
              {showInitialQuicks && (
                <div className="flex gap-2 flex-wrap mb-4 justify-end">
                    {Object.entries(quicks).map(([key, qa]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => quickClick(key)}
                        className="text-[10px] uppercase tracking-wider font-semibold px-3 py-2 rounded-full border border-stone-200 text-stone-600 bg-white hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#FFFCF5] transition-all shadow-sm"
                    >
                        {qa.title}
                    </button>
                    ))}
                </div>
              )}

              {/* Expanded Quick Panel */}
              {quickPanelOpen && (
                <div className="absolute bottom-[80px] left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-xl p-3 z-20 animate-slide-in">
                    <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-2 text-center">Assistance Menu</div>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(quicks).map(([key, qa]) => (
                            <button
                                key={key}
                                onClick={() => quickClick(key)}
                                className="text-left p-2 rounded-lg hover:bg-stone-50 transition border border-transparent hover:border-stone-200 group"
                            >
                                <div className="text-xs font-bold text-stone-800 group-hover:text-[#b8860b]">{qa.title}</div>
                                <div className="text-[9px] text-stone-500 line-clamp-1">{qa.linkText}</div>
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {/* Input Area */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setQuickPanelOpen(!quickPanelOpen)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${quickPanelOpen ? 'bg-stone-100 text-[#b8860b]' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <i className="fa-solid fa-bars text-lg"></i>
                    </button>
                    
                    <div className="flex-1 relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendLive()}
                            placeholder="Type your request..."
                            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:ring-1 focus:ring-[#D4AF37] focus:bg-white transition-all shadow-inner"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={sendLive}
                        disabled={!input.trim()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1c1917] text-[#D4AF37] hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-md"
                    >
                        <i className="fa-solid fa-paper-plane text-sm pl-0.5 pt-0.5"></i>
                    </button>
                </div>
              ) : (
                <div className="text-center">
                    <p className="text-xs text-stone-400">Guest Mode Active</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;