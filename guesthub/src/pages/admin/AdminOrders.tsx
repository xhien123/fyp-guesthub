import React from "react";
import { adminListOrders, adminUpdateOrderStatus } from "../../lib/api";
import type { Order } from "../../types";
import { useToast } from "../../ui/Toaster";
import { io } from "socket.io-client";

const STATUS: Order["status"][] = ["Received", "Preparing", "Ready", "Delivered", "Completed", "Cancelled"];
type SortKey = "total" | "created" | "room" | "status" | "paid" | "notes";

const getStatusClasses = (status: Order["status"]) => {
  switch (status) {
    case "Cancelled": return "bg-stone-200 text-stone-500 border-stone-300";
    case "Preparing": return "bg-amber-100 text-amber-800 border-amber-200 ring-1 ring-amber-200";
    case "Ready": return "bg-yellow-100 text-yellow-800 border-yellow-200 ring-1 ring-yellow-300";
    case "Delivered": return "bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-200";
    case "Completed": return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200";
    case "Received": return "bg-stone-100 text-stone-600 border-stone-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const isSettled = (status: Order["status"]) => {
  return ["Delivered", "Completed"].includes(status);
};

const pill = (status: Order["status"]) => {
  if (status === "Cancelled") {
      return "inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold border rounded-full bg-stone-100 text-stone-400 border-stone-200";
  }
  const settled = isSettled(status);
  return `inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold border rounded-full ${
    settled
      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
      : "bg-stone-100 text-stone-500 border-stone-200"
  }`;
};

function effectiveMethod(o: Order): "pickup" | "room" {
  const svc = (o as any).service as "room_delivery" | "dine_in" | undefined;
  if (svc === "room_delivery") return "room";
  if (svc === "dine_in") return "pickup";
  return (o.method ?? "room");
}

const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Just now";
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
};

const formatTime = (dateString?: string) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getOrderNoteDetails = (o: Order) => {
    let guestName = "—";
    let generalNote = "—";
    let isUrgent = false;

    const fullNote = o.note || "No detailed note was saved.";
    const safeNote = o.note || ""; 

    if (fullNote !== "No detailed note was saved.") {
        const lines = fullNote.split('\n');
        lines.forEach(line => {
            if (line.includes('Guest Name:')) {
                guestName = line.substring(line.indexOf('Guest Name:') + 'Guest Name:'.length).trim() || "Guest (Unknown)";
            }
            if (line.includes('General Note:')) {
                generalNote = line.substring(line.indexOf('General Note:') + 'General Note:'.length).trim() || "—";
            }
        });
        if (generalNote.toLowerCase().includes('asap') || generalNote.toLowerCase().includes('sharp')) {
            isUrgent = true;
        }
    }
    
    const displayNote = generalNote !== "—" ? generalNote.substring(0, 40) + (generalNote.length > 40 ? '...' : '') : '—';
    const phoneExtracted = safeNote.includes('Phone:') ? safeNote.substring(safeNote.indexOf('Phone:') + 6).split('\n')[0].trim() || 'N/A' : 'N/A';

    return { 
        guestName: guestName.split(' ')[0], 
        generalNote: displayNote, 
        isUrgent,
        fullNote: fullNote, 
        items: o.items,
        phoneExtracted: phoneExtracted
    };
};

const AdminOrders: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const [params, setParams] = React.useState(() => {
    const p = new URLSearchParams(window.location.search);
    if (!p.get("sort")) {
        p.set("sort", "created:desc");
    }
    if (!p.get("range")) {
        p.set("range", "today");
    }
    return p;
  });

  const sync = (p: URLSearchParams) => {
    setParams(p);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  };

  const fStatus = params.get("status") || "";
  const fRange = params.get("range") || "today";
  const fDate = params.get("date") || ""; 
  
  const sortParam = params.get("sort") || "created:desc";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "10");

  const [sortKey, sortDir] = React.useMemo((): [SortKey, "asc" | "desc"] => {
    const [k, d] = sortParam.split(":");
    const key = (["total", "created", "room", "status", "paid", "notes"].includes(k) ? (k as SortKey) : "created");
    const dir = d === "desc" ? "desc" : "asc";
    return [key, dir];
  }, [sortParam]);

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (v && v.length) next.set(k, v); else next.delete(k);
    if (["status", "range"].includes(k)) next.set("page", "1");
    
    if (k === "range" && v === "custom" && !next.get("date")) {
        next.set("date", new Date().toISOString().split('T')[0]);
    }
    
    sync(next);
  };
  
  const setSort = (k: SortKey) => {
      let nextDir: "asc" | "desc" = "asc";
      if (k === "created") {
          if (sortKey === k) nextDir = sortDir === "asc" ? "desc" : "asc";
          else nextDir = "desc"; 
      } else {
        nextDir = sortKey === k && sortDir === "asc" ? "desc" : "asc";
      }
      setParam("sort", `${k}:${nextDir}`);
  };

  const setPage = (p: number) => setParam("page", String(Math.max(1, p)));
  
  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminListOrders();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { 
      load(); 
      const socket = io("http://localhost:4000");
      
      // Listen for NEW orders
      socket.on("order:new", (newOrder: Order) => {
          setRows(prev => [newOrder, ...prev]);
      });
      
      // Listen for UPDATED orders (from other admins)
      socket.on("order:updated", (updated: Order) => {
          setRows(prev => prev.map(o => o._id === updated._id ? updated : o));
      });

      return () => { socket.disconnect(); };
  }, [load]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    setBusy(id);
    try {
      await adminUpdateOrderStatus(id, status);
      toast({ title: "Order updated", description: `Status → ${status}`, variant: "success" });
      // Socket will handle reload
    } catch {
      toast({ title: "Failed to update order", variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  const totalOf = (o: Order) => (o as any).total ?? o.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const checkDateRange = (dateStr: string | undefined, range: string, customDateVal: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (range === "today") {
          return d >= todayStart;
      }
      if (range === "yesterday") {
          const yesterdayStart = new Date(todayStart);
          yesterdayStart.setDate(todayStart.getDate() - 1);
          return d >= yesterdayStart && d < todayStart;
      }
      if (range === "week") {
          const weekStart = new Date(todayStart);
          weekStart.setDate(todayStart.getDate() - 7);
          return d >= weekStart;
      }
      if (range === "custom" && customDateVal) {
           const [y, m, day] = customDateVal.split('-').map(Number);
           const rangeStart = new Date(y, m - 1, day);
           const rangeEnd = new Date(y, m - 1, day + 1);
           return d >= rangeStart && d < rangeEnd;
      }
      return true; 
  };

  const filtered = rows.filter((o) => {
    if (fStatus && o.status !== fStatus) return false;
    if (!checkDateRange(o.createdAt, fRange, fDate)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "total": cmp = totalOf(a) - totalOf(b); break;
      case "created": 
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      case "room": cmp = (a.roomNumber ?? "").localeCompare(b.roomNumber ?? ""); break;
      case "status": cmp = a.status.localeCompare(b.status); break;
      case "paid": cmp = Number(isSettled(a.status)) - Number(isSettled(b.status)); break;
      case "notes": cmp = getOrderNoteDetails(a).generalNote.localeCompare(getOrderNoteDetails(b).generalNote); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  const SortBtn: React.FC<{ k: SortKey; children: React.ReactNode }> = ({ k, children }) => (
    <button onClick={() => setSort(k)} className="inline-flex items-center gap-1 hover:text-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-colors">
      {children}
      <span className="text-[10px] text-zinc-400">
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "▵▿"}
      </span>
    </button>
  );

  const toggleRow = (id: string) => {
      setExpandedId(id === expandedId ? null : id);
  };

  if (loading && rows.length === 0) return <div className="p-10 text-center text-stone-500 font-serif animate-pulse">Synchronizing with Concierge Desk...</div>;
  if (error) return <p className="text-red-600 p-10">{error}</p>;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-serif text-stone-800 mb-2">Concierge Dashboard</h1>
            <p className="text-stone-500 font-light">Real-time overview of In-Residence & Dining requests.</p>
          </div>
          <div className="text-right">
             <div className="text-[10px] uppercase tracking-widest text-stone-400">Sorting By</div>
             <div className="text-sm font-bold text-stone-800">
                 {sortKey === "created" ? "Time Placed" : sortKey.toUpperCase()} ({sortDir === 'asc' ? 'Oldest First' : 'Newest First'})
             </div>
          </div>
      </div>

      <div className="mb-8 p-5 border border-stone-200 bg-white shadow-sm rounded-lg flex flex-wrap items-end gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Status</div>
          <select className="w-40 bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none" value={fStatus} onChange={(e) => setParam("status", e.target.value)}>
            <option value="">All Active</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Time Period</div>
          <div className="flex items-center gap-2">
             <select className="w-40 bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none" value={fRange} onChange={(e) => setParam("range", e.target.value)}>
               <option value="today">Today (Live)</option>
               <option value="yesterday">Yesterday</option>
               <option value="week">Last 7 Days</option>
               <option value="all">All History</option>
               <option value="custom">Specific Date...</option>
             </select>
             
             {fRange === 'custom' && (
                 <input 
                    type="date" 
                    className="bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none"
                    value={fDate}
                    onChange={(e) => setParam("date", e.target.value)}
                 />
             )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="room">Guest / Location</SortBtn></th>
              <th className="p-4 font-medium text-stone-500 w-[30%]"><SortBtn k="notes">Concierge Alert</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="total">Value</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="created">Time Placed</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="paid">Folio Status</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="status">Fulfillment</SortBtn></th>
              <th className="p-4 font-medium text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paged.map((o) => {
              const total = totalOf(o);
              const method = effectiveMethod(o);
              const { guestName, generalNote, isUrgent, fullNote, items, phoneExtracted } = getOrderNoteDetails(o);
              const isExpanded = expandedId === o._id;
              const timeAgo = getTimeAgo(o.createdAt);
              const isFresh = (timeAgo === "Just now" || (timeAgo.includes('m ago') && parseInt(timeAgo) < 15)) && !['Completed', 'Delivered', 'Cancelled'].includes(o.status);
              const settled = isSettled(o.status);
              const isCancelled = o.status === "Cancelled";

              return (
                <React.Fragment key={o._id}>
                  <tr className={`transition-all duration-200 ${isExpanded ? 'bg-stone-50/80' : 'hover:bg-stone-50'} ${isFresh ? 'bg-amber-50/40' : ''} ${isCancelled ? 'opacity-60' : ''}`}>
                    
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-serif ${method === 'room' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-300 text-stone-600'}`}>
                             {method === 'room' ? <i className="fas fa-bed"></i> : <i className="fas fa-utensils"></i>}
                          </div>
                          <div>
                             <div className="font-serif font-medium text-lg text-stone-900 flex items-center gap-2">
                                 {method === "room" ? `Room ${o.roomNumber}` : 'Dine-in'}
                                 {isFresh && <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest uppercase animate-pulse">New</span>}
                             </div>
                             <div className="text-xs text-stone-500 tracking-wide uppercase">
                                 {guestName}
                             </div>
                          </div>
                      </div>
                    </td>

                    <td className="p-4 align-top">
                        {generalNote !== '—' ? (
                           <div className={`text-xs leading-relaxed p-2 rounded ${isUrgent ? 'bg-red-50 text-red-800 border border-red-100' : 'text-stone-600'}`}>
                               {isUrgent && <i className="fas fa-bell mr-1 text-red-600 animate-pulse"></i>}
                               <span className={`italic ${isCancelled ? 'line-through' : ''}`}>"{generalNote}"</span>
                           </div>
                       ) : (
                           <span className="text-stone-300 text-xs italic">No special requests</span>
                       )}
                    </td>

                    <td className="p-4 align-top font-serif text-base text-stone-800">
                        ${Number(total).toLocaleString('en-US')}
                    </td>

                    <td className="p-4 align-top">
                        <div className={`text-xs font-medium uppercase tracking-wider ${isFresh ? 'text-emerald-600 font-bold' : 'text-stone-600'}`}>
                            {timeAgo}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                            {formatTime(o.createdAt)}
                        </div>
                    </td>

                    <td className="p-4 align-top">
                      <div className="flex flex-col items-start gap-1">
                        <span className={pill(o.status)}>
                            {o.status === 'Cancelled' ? "Voided" : (settled ? "Settled" : "Pending")}
                        </span>
                        {settled && !isCancelled && <span className="text-[9px] text-stone-400">Auto-charged to room</span>}
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      <select
                        className={`w-full px-3 py-1.5 text-xs font-semibold rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusClasses(o.status)}`}
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value as Order["status"])}
                        disabled={busy === o._id}
                      >
                        {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    <td className="p-4 align-top text-right">
                      <button 
                        onClick={() => toggleRow(o._id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-stone-200 text-stone-800' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                      >
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-stone-50/50 border-b border-stone-200 shadow-inner">
                      <td colSpan={7} className="p-6">
                        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                          {/* DETAILS CARDS... (Keeping the same layout as previous refined version) */}
                          <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                                <h4 className="font-serif text-stone-800 text-lg">Order Manifest</h4>
                                <span className="text-[10px] uppercase tracking-widest text-stone-400">Kitchen Ticket</span>
                            </div>
                            <ul className="space-y-4">
                              {items.map((item, index) => (
                                <li key={index} className="flex flex-col">
                                  <div className="flex justify-between items-baseline">
                                    <span className="font-medium text-stone-700 text-sm">
                                        <span className="text-stone-400 mr-2">{item.quantity}x</span>
                                        {item.name}
                                    </span>
                                    <span className="font-serif text-stone-800 text-sm">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                  {item.notes && item.notes.trim() !== "" && (
                                    <div className="mt-1.5 self-start bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded border border-amber-100 flex items-center gap-1.5">
                                        <i className="fas fa-pen text-[10px] opacity-50"></i>
                                        <span className="font-medium italic">{item.notes}</span>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center">
                                <span className="text-xs text-stone-400 uppercase tracking-widest">Total Amount</span>
                                <span className="font-serif text-xl text-stone-900">${totalOf(o).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
                                <h4 className="font-serif text-stone-800 text-lg">Guest Profile</h4>
                                <span className="text-[10px] uppercase tracking-widest text-stone-400">Registration</span>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase text-stone-400 tracking-widest mb-1">Name</label>
                                        <div className="text-stone-800 font-medium">{guestName}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-stone-400 tracking-widest mb-1">Residence</label>
                                        <div className="text-stone-800 font-medium text-lg font-serif">{o.roomNumber || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-stone-400 tracking-widest mb-1">Contact</label>
                                        <div className="text-stone-600 text-sm">{phoneExtracted}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-stone-400 tracking-widest mb-1">Service</label>
                                        <div className="text-stone-600 text-sm capitalize">{method === 'room' ? 'In-Room Delivery' : 'Restaurant Pickup'}</div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <div className="text-[10px] uppercase text-stone-400 tracking-widest mb-1">Order ID</div>
                                    <div className="text-xs font-mono text-stone-400 bg-stone-50 p-1 rounded border border-stone-100 truncate">{o._id}</div>
                                </div>
                            </div>
                          </div>
                          
                          <div className="bg-[#fffdf5] border border-stone-200 rounded-lg shadow-sm p-5 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-full -mr-8 -mt-8"></div>
                             <div className="flex items-center justify-between mb-4 border-b border-stone-200/50 pb-2 relative z-10">
                                <h4 className="font-serif text-stone-800 text-lg">Butler Instructions</h4>
                                <span className="text-[10px] uppercase tracking-widest text-stone-400">Requests</span>
                             </div>
                             <div className="relative z-10 min-h-[140px]">
                                 {fullNote !== "No detailed note was saved." ? (
                                     <div className="whitespace-pre-wrap text-sm text-stone-700 leading-relaxed font-serif">
                                         {fullNote}
                                     </div>
                                 ) : (
                                     <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60 mt-8">
                                         <i className="fas fa-feather-alt text-2xl mb-2"></i>
                                         <span className="text-xs italic">No special instructions logged.</span>
                                     </div>
                                 )}
                             </div>
                          </div>
                          
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {paged.length === 0 && (
              <tr><td className="p-12 text-center text-stone-400 italic font-serif" colSpan={7}>No active orders found in the queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-stone-400 uppercase tracking-widest">
            Showing {start + 1}-{Math.min(start + pageSize, sorted.length)} of {sorted.length} records
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded border border-stone-200 bg-white text-stone-500 hover:border-stone-400 disabled:opacity-30 transition"
            onClick={() => setPage(page - 1)} disabled={page <= 1}>
             <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <div className="px-4 text-sm font-serif text-stone-600">Page {page}</div>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-stone-200 bg-white text-stone-500 hover:border-stone-400 disabled:opacity-30 transition"
            onClick={() => setPage(page + 1)} disabled={start + pageSize >= sorted.length}>
             <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;