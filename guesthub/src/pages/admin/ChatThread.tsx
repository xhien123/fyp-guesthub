import React from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

// Icons
const SendIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

const ChatThread: React.FC = () => {
  const { id } = useParams();
  const [msgs, setMsgs] = React.useState<any[]>([]);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [, setSocket] = React.useState<Socket | null>(null);
  const [details, setDetails] = React.useState<any>(null);

  // FIXED: Changed behavior to "auto" for instant snap (no dizzying scroll animation)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  };

  // 1. Socket Connection
  React.useEffect(() => {
    if (!id) return;
    const s = io(SOCKET_URL, { transports: ["websocket"], withCredentials: true });
    setSocket(s);

    s.emit("admin:join", { conversationId: id });
    
    s.on("message:new", (m: any) => {
      if (m.conversationId === id) {
        setMsgs((prev) => [...prev, m]);
      }
    });
    
    return () => {
      s.disconnect();
    };
  }, [id]);

  // 2. Fetch Data
  React.useEffect(() => {
    if (!id) return;
    
    // Fetch Details
    fetch(`/api/admin/chat/conversations/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setDetails)
      .catch(() => {});

    // Fetch Messages
    fetch(`/api/admin/chat/conversations/${id}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
          setMsgs(Array.isArray(data) ? data : []);
          // Instant snap to bottom on load
          setTimeout(scrollToBottom, 50);
      })
      .catch(() => {});
  }, [id]);

  // 3. Auto Scroll on new message (Instant)
  React.useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  const send = async () => {
    if (!text.trim() || sending || !id) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chat/conversations/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      
      if(res.ok) setText("");
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  // Determine Name for Display
  const displayName = details?.displayName || details?.meta?.guestName || "Guest";

  return (
    <div className="flex flex-col h-full bg-[#f8f8f6]">
      
      {/* Header */}
      <div className="flex-shrink-0 h-20 bg-white border-b border-stone-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div>
            <h2 className="font-serif text-xl text-stone-900 truncate max-w-md">
                {displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">
                    Active Session
                </p>
            </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {msgs.map((m) => {
            const isAdmin = m.senderType === "admin";
            const isBot = m.senderType === "bot" || m.senderType === "system";

            if (isBot) {
                return (
                    <div key={m._id} className="flex justify-center my-4">
                        <span className="px-3 py-1 bg-stone-200/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            {m.text}
                        </span>
                    </div>
                );
            }

            return (
                <div key={m._id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] group relative`}>
                        {/* Label for Guest messages */}
                        {!isAdmin && (
                            <span className="block ml-1 mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                {displayName}
                            </span>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                            isAdmin 
                            ? "bg-stone-800 text-stone-50 rounded-2xl rounded-tr-sm" 
                            : "bg-white text-stone-800 border border-stone-200 rounded-2xl rounded-tl-sm"
                        }`}>
                            {m.text}
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-[10px] text-stone-400 mt-1 transition-opacity opacity-0 group-hover:opacity-100 ${isAdmin ? "text-right mr-1" : "ml-1"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-stone-200 p-5">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
                <textarea
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 outline-none transition-all resize-none"
                    rows={1}
                    placeholder="Type your reply..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
            </div>
            <button
                className="flex-shrink-0 h-11 w-11 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-black active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-stone-900/20"
                onClick={send}
                disabled={!text.trim() || sending}
            >
                {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SendIcon />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatThread;