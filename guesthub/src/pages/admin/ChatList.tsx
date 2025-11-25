import React from "react";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const SearchIcon = () => <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const ChatList: React.FC = () => {
  const [items, setItems] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const location = useLocation();
  const selectedId = location.pathname.split("/").pop();

  // Fetch items sorted by time (Backend handles sorting)
  const fetchConversations = React.useCallback(() => {
    fetch(`/api/admin/chat/conversations`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  // Initial Load
  React.useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Socket Listener: Re-fetch list when ANY new message event occurs
  // This ensures the list re-sorts and unread dots appear instantly
  React.useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"], withCredentials: true });
    s.emit("admin:join:notifications");

    s.on("chat:new-message", () => {
      fetchConversations(); 
    });

    return () => {
      s.disconnect();
    };
  }, [fetchConversations]);

  // Client-side Filter (Search by name or message content)
  const filteredItems = items.filter((it) => {
    // Prioritize the display name sent by backend, fallback to guestName, then "Guest"
    const name = it.displayName || it.meta?.guestName || it.user?.name || "Guest";
    const msg = it.lastMessage || "";
    const lower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(lower) || msg.toLowerCase().includes(lower);
  });

  // Time Formatter
  const formatTime = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sticky Header */}
      <div className="px-5 pt-6 pb-2 border-b border-stone-100 z-10 bg-white sticky top-0 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h1 className="font-serif text-2xl text-stone-900 tracking-tight">Inbox</h1>
            {items.some(i => i.isUnread) && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-widest">
                    {items.filter(i => i.isUnread).length} New
                </span>
            )}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-2">
          <div className="absolute left-3 top-2.5"><SearchIcon /></div>
          <input 
            className="w-full bg-stone-50 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-stone-200 transition-all outline-none"
            placeholder="Search guest name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">📭</div>
            <p className="text-stone-400 text-sm font-serif italic">No messages found.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filteredItems.map((it) => {
              const isSelected = it._id === selectedId;
              const isUnread = it.isUnread;
              const time = formatTime(it.lastMessageAt || it.updatedAt);
              const displayName = it.displayName || it.meta?.guestName || "Guest";
              
              return (
                <Link
                  key={it._id}
                  to={`/admin/chat/${it._id}`}
                  // Optimistic Update: Instantly remove red dot locally when clicked
                  onClick={() => {
                      setItems(prev => prev.map(i => i._id === it._id ? { ...i, isUnread: false, unreadCount: 0 } : i));
                  }}
                  className={`group block px-5 py-4 transition-all duration-200 border-l-4 ${
                    isSelected
                      ? "bg-stone-50 border-stone-900" // Active state
                      : isUnread 
                        ? "bg-rose-50/30 border-rose-500" // Unread state (Red Highlight)
                        : "bg-white border-transparent hover:bg-stone-50 hover:border-stone-200" // Normal state
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2 overflow-hidden max-w-[75%]">
                        {/* The "Red Bump" Indicator */}
                        {isUnread && (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0 shadow-sm animate-pulse" title="New Message" />
                        )}
                        
                        <span className={`text-sm truncate ${
                            isUnread 
                            ? "font-bold text-stone-900" // Bold text if unread
                            : isSelected ? "font-semibold text-stone-900" : "font-medium text-stone-700"
                        }`}>
                        {displayName}
                        </span>
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ml-2 ${isUnread ? "text-rose-600" : "text-stone-400"}`}>
                      {time}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                      <p className={`text-xs line-clamp-1 leading-relaxed pr-4 flex-1 ${
                          isUnread ? "text-stone-900 font-medium" : "text-stone-500"
                      }`}>
                        {it.lastMessage || <span className="italic opacity-50">No messages yet</span>}
                      </p>
                      
                      {/* Unread Count Badge Pill */}
                      {it.unreadCount > 0 && (
                          <span className="flex-shrink-0 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ml-2 shadow-sm">
                              {it.unreadCount}
                          </span>
                      )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;