import React from "react";
import { useSearchParams } from "react-router-dom";
import { adminListBookings, adminUpdateBookingStatus } from "../../lib/api";
import type { Booking } from "../../types";
import { useToast } from "../../ui/Toaster";
import { io } from "socket.io-client";

const STATUS: Booking["status"][] = [
  "Pending",
  "Confirmed",
  "Checked-in",
  "Checked-out",
  "Declined",
  "Cancelled",
];

type SortKey = "room" | "guests" | "checkIn" | "checkOut" | "status" | "notes";

const roomName = (r: Booking["room"]) => (typeof r === "string" ? r : r?.title) || "";

const getStatusClasses = (status: Booking["status"]) => {
  switch (status) {
    case "Checked-in": return "bg-teal-100 text-teal-700 border-teal-300";
    case "Confirmed": return "bg-green-100 text-green-700 border-green-300";
    case "Pending": return "bg-amber-100 text-amber-700 border-amber-300";
    case "Checked-out": return "bg-blue-100 text-blue-700 border-blue-300";
    case "Declined":
    case "Cancelled": return "bg-red-100 text-red-700 border-red-300";
    default: return "bg-stone-100 text-stone-700 border-stone-300";
  }
};

const getGuestNameAndDetails = (b: Booking) => {
    let name = "N/A";
    let email = "N/A";
    let phone = "—";
    let notes = "—";
    let details: any = {};

    try {
        const data = b.notes ? JSON.parse(b.notes) : {};
        name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || "Guest (ID needed)";
        email = data.email || "N/A";
        phone = data.phone || "—"; 
        notes = data.freeNotes || "—";
        details = data;
    } catch { }

    return { name, email, phone, notes, details };
};

const AdminBookings: React.FC = () => {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const [rows, setRows] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const fStatus = params.get("status") || "";
  const fFrom = params.get("from") || "";
  const fTo = params.get("to") || "";
  const sortParam = params.get("sort") || "checkIn:desc";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "10");

  const [sortKey, sortDir] = React.useMemo((): [SortKey, "asc" | "desc"] => {
    const [k, d] = sortParam.split(":");
    const key = (["room", "guests", "checkIn", "checkOut", "status", "notes"].includes(k) ? (k as SortKey) : "checkIn");
    const dir = d === "asc" ? "asc" : "desc";
    return [key, dir];
  }, [sortParam]);

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (v && v.length) next.set(k, v); else next.delete(k);
    if (["status", "from", "to"].includes(k)) next.set("page", "1");
    setParams(next, { replace: true });
  };

  const setSort = (k: SortKey) =>
    setParam("sort", `${k}:${sortKey === k && sortDir === "asc" ? "desc" : "asc"}`);
  const setPage = (p: number) => setParam("page", String(Math.max(1, p)));
  const setPageSize = (s: number) => {
    const n = new URLSearchParams(params);
    n.set("pageSize", String(s));
    n.set("page", "1");
    setParams(n, { replace: true });
  };

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminListBookings();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { 
      load(); 
      
      const socket = io("http://localhost:4000");
      socket.on("booking:updated", (updated: Booking) => {
          setRows(prev => {
              const exists = prev.find(b => b._id === updated._id);
              if (exists) return prev.map(b => b._id === updated._id ? updated : b);
              return [updated, ...prev];
          });
      });
      
      return () => { socket.disconnect(); };
  }, [load]);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    try {
      await adminUpdateBookingStatus(id, status);
      toast({ title: "Booking updated", description: `Status → ${status}`, variant: "success" });
      // load is handled by socket now, but we can call it to be safe or just let socket update UI
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to update booking";
      toast({ title: msg, variant: "error" });
    }
  };

  const filtered = rows.filter((b) => {
    if (fStatus && b.status !== fStatus) return false;
    if (fFrom && new Date(b.checkIn) < new Date(fFrom)) return false;
    if (fTo && new Date(b.checkOut) > new Date(fTo)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "room": cmp = roomName(a.room).localeCompare(roomName(b.room)); break;
      case "guests": cmp = a.guests - b.guests; break;
      case "checkIn": cmp = new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(); break;
      case "checkOut": cmp = new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime(); break;
      case "status": cmp = a.status.localeCompare(b.status); break;
      case "notes": cmp = getGuestNameAndDetails(a).notes.localeCompare(getGuestNameAndDetails(b).notes); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  const SortBtn: React.FC<{ k: SortKey; children: React.ReactNode }> = ({ k, children }) => (
    <button onClick={() => setSort(k)} className="inline-flex items-center gap-1 hover:underline text-xs font-bold uppercase tracking-wider text-stone-600">
      {children}
      <span className="text-xs text-slate-500">
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "▵▿"}
      </span>
    </button>
  );
  
  const toggleRow = (id: string) => {
      setExpandedId(id === expandedId ? null : id);
  };


  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-zinc-800 mb-6">Guest Reservations</h1>

      <div className="mb-6 p-4 border border-stone-300 bg-white shadow-md flex flex-wrap items-end gap-4">
        <div>
          <div className="text-xs text-slate-600 mb-1">Status</div>
          <select className="border border-stone-300 px-3 py-2 text-sm" value={fStatus} onChange={(e) => setParam("status", e.target.value)}>
            <option value="">All</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-slate-600 mb-1">From (check-in)</div>
          <input type="date" className="border border-stone-300 px-3 py-2 text-sm" value={fFrom} onChange={(e) => setParam("from", e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-slate-600 mb-1">To (check-out)</div>
          <input type="date" className="border border-stone-300 px-3 py-2 text-sm" value={fTo} onChange={(e) => setParam("to", e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 overflow-x-auto p-0 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="text-left p-3"><SortBtn k="room">Residence / Guest</SortBtn></th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-stone-600">Contact Phone</th>
              <th className="text-left p-3 w-[20%]"><SortBtn k="notes">Guest Note</SortBtn></th>
              <th className="text-left p-3"><SortBtn k="checkIn">Check-in</SortBtn></th>
              <th className="text-left p-3"><SortBtn k="checkOut">Check-out</SortBtn></th>
              <th className="text-left p-3"><SortBtn k="status">Status</SortBtn></th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-100">
            {paged.map((b) => {
                const { name, email, phone, notes, details } = getGuestNameAndDetails(b);
                const statusClass = getStatusClasses(b.status);
                const isExpanded = expandedId === b._id;

                return (
                  <React.Fragment key={b._id}>
                    <tr className={`hover:bg-stone-50 transition-colors ${isExpanded ? 'bg-stone-100' : ''}`}>
                      <td className="p-3 pr-6">
                          <div className="font-semibold text-base text-stone-900">{roomName(b.room)}</div>
                          <div className="text-xs text-stone-600 pt-1">
                              Guest: <span className="font-medium text-stone-700">{name}</span>
                          </div>
                          <div className="text-xs text-stone-500">{email}</div>
                      </td>
                      <td className="p-3 text-stone-700 font-semibold whitespace-nowrap">
                          {phone !== "—" ? <a href={`tel:${phone}`} className="text-blue-700 hover:text-blue-500 underline">{phone}</a> : "—"}
                      </td>
                      <td className="p-3 text-xs text-amber-700 italic border-l-2 border-amber-500/50">
                          {notes !== "—" 
                            ? notes.substring(0, 50) + (notes.length > 50 ? '...' : '') 
                            : "No special requests."}
                      </td>
                      <td className="p-3 whitespace-nowrap text-stone-700">
                          {new Date(b.checkIn).toLocaleDateString()}
                          <div className="text-xs text-stone-500">({b.guests} Guests)</div>
                      </td>
                      <td className="p-3 whitespace-nowrap text-stone-700">
                          {new Date(b.checkOut).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                          <span className={`px-3 py-1 text-xs font-semibold tracking-wider border ${statusClass}`}>{b.status}</span>
                      </td>
                      <td className="p-3 space-y-2">
                        <button
                            onClick={() => toggleRow(b._id)}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition flex items-center gap-1"
                        >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px]`}></i>
                        </button>
                        <select
                          className="border border-stone-300 px-3 py-1.5 text-xs font-medium bg-white hover:border-amber-600 transition"
                          value={b.status}
                          onChange={(e) => updateStatus(b._id, e.target.value as Booking["status"])}
                        >
                          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                        <tr className="bg-stone-50 border-t border-b border-stone-300">
                            <td colSpan={7} className="p-6">
                                <h3 className="text-base font-bold text-stone-800 mb-3">Complete Guest Details & Preferences (Booking ID: {b._id.slice(-6)})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    
                                    <div className="border-r border-stone-200 pr-4">
                                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Identity</div>
                                        <p className="font-medium">{name}</p>
                                        <p className="text-sm text-stone-600">{email}</p>
                                        <p className="text-sm text-stone-600 mt-1">Phone: {phone || '—'}</p>
                                        <p className="text-xs text-stone-500 mt-1">Nationality: {details.country || '—'}</p>
                                    </div>
                                    
                                    <div className="border-r border-stone-200 pr-4">
                                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Party Size</div>
                                        <p className="font-medium">Adults: {details.adults || '—'}</p>
                                        <p className="font-medium">Children: {details.children || '—'} ({details.childrenAges?.join(', ') || 'N/A'})</p>
                                        <p className="text-xs text-stone-500 mt-1">Total Guests: {b.guests}</p>
                                    </div>

                                    <div className="border-r border-stone-200 pr-4 sm:col-span-1 md:col-span-1">
                                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Purchased Add-ons</div>
                                        {details.selectedAddOns && Array.isArray(details.selectedAddOns) && details.selectedAddOns.length > 0 ? (
                                            <ul className="text-sm space-y-1">
                                                {details.selectedAddOns.map((ao: string) => (
                                                    <li key={ao} className="text-teal-700 font-medium">✓ {ao.replace(/([A-Z])/g, ' $1').trim()}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-stone-500">None selected.</p>
                                        )}
                                    </div>
                                    
                                    <div className="sm:col-span-3 md:col-span-2">
                                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Concierge Notes (Priority)</div>
                                        <div className="bg-white border border-amber-300 p-3 text-sm text-stone-800 italic">
                                            {notes !== "—" ? notes : "No specific service notes provided."}
                                        </div>
                                        <p className="text-xs text-stone-500 mt-2">Loyalty Code: {details.loyalty || '—'}</p>
                                    </div>
                                    
                                </div>
                            </td>
                        </tr>
                    )}
                  </React.Fragment>
                );
            })}
            {paged.length === 0 && (
              <tr><td className="p-4 text-stone-600" colSpan={7}>No bookings match the current filter criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <div className="text-sm text-stone-600">
            Showing {start + 1} - {Math.min(start + pageSize, sorted.length)} of {sorted.length} entries.
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border border-stone-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-stone-100 transition"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <div className="text-sm font-semibold text-stone-700">Page {page}</div>
          <button
            className="rounded border border-stone-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-stone-100 transition"
            onClick={() => setPage(page + 1)}
            disabled={(page * pageSize) >= sorted.length}
          >
            Next
          </button>
          <div className="ml-4 text-sm">
            Per page:{" "}
            <select
              className="border border-stone-300 rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;