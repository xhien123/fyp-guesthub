import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminListRooms, adminDeleteRoom, adminUpdateRoom } from "../../../lib/api"; // Added adminUpdateRoom
import Pagination from "../../admin/Pagination"; 
import { TableSkeleton } from "../../../ui/Skeleton";
import { useToast } from "../../../ui/Toaster";
import { useConfirm } from "../../../ui/Confirm";

// --- Icons ---
const IconEdit = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconBed = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6h1v10H3v-1h16v1h-1V6h1a2 2 0 01-2 2v4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
const IconUser = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

type SortKey = "title" | "type" | "pricePerNight" | "maxOccupancy" | "beds" | "available";

const AdminRoomsList: React.FC = () => {
  const { toast } = useToast();
  const confirm = useConfirm();

  const [params, setParams] = useSearchParams();
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const fType = params.get("type") || "";
  const fAvail = params.get("avail") || "";
  const fMin = params.get("min") || "";
  const fMax = params.get("max") || "";
  
  const sortParam = params.get("sort") || "title:asc";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "10");

  const [sortKey, sortDir] = React.useMemo((): [SortKey, "asc" | "desc"] => {
    const [k, d] = sortParam.split(":");
    const key = (["title", "type", "pricePerNight", "maxOccupancy", "beds", "available"].includes(k) ? (k as SortKey) : "title");
    const dir = d === "desc" ? "desc" : "asc";
    return [key, dir];
  }, [sortParam]);

  const setParam = (key: string, val?: string) => {
    const next = new URLSearchParams(params);
    if (val && val.length) next.set(key, val); else next.delete(key);
    if (["type", "avail", "min", "max"].includes(key)) next.set("page", "1");
    setParams(next, { replace: true });
  };

  const setSort = (k: SortKey) => {
    const nextDir = sortKey === k && sortDir === "asc" ? "desc" : "asc";
    setParam("sort", `${k}:${nextDir}`);
  };

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
      const data = await adminListRooms();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Residence?",
      message: "This will permanently remove the room from inventory.",
      confirmText: "Delete Forever",
    });
    if (!ok) return;
    try {
      await adminDeleteRoom(id);
      toast({ title: "Residence removed", variant: "success" });
      await load();
    } catch {
      toast({ title: "Failed to delete", variant: "error" });
    }
  };

  // --- OPTIMISTIC TOGGLE FUNCTION ---
  const toggleAvailability = async (room: any) => {
    const originalAvailable = room.available;
    const newAvailableStatus = !originalAvailable;

    // 1. Instant UI Update
    setRows(currentRows => 
      currentRows.map(r => 
        r._id === room._id ? { ...r, available: newAvailableStatus } : r
      )
    );

    try {
      // 2. API Call
      await adminUpdateRoom(room._id, { available: newAvailableStatus });
      toast({
        title: newAvailableStatus ? "Residence Opened" : "Residence Stopped",
        description: `Availability updated for ${room.title}`,
        variant: "success",
      });
    } catch (err) {
      // 3. Rollback on Error
      setRows(currentRows => 
        currentRows.map(r => 
          r._id === room._id ? { ...r, available: originalAvailable } : r
        )
      );
      toast({ 
        title: "Update Failed", 
        description: "Could not update room status.", 
        variant: "error" 
      });
    }
  };

  // Filtering
  const filtered = rows.filter((r) => {
    if (fType && r.type !== fType) return false;
    if (fAvail) {
      const should = fAvail === "true";
      const isAvail = r.available ?? true; 
      if (isAvail !== should) return false;
    }
    const price = Number(r.pricePerNight ?? 0);
    if (fMin && price < Number(fMin)) return false;
    if (fMax && price > Number(fMax)) return false;
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    const occA = Number(a.maxOccupancy || a.maxGuests || 0);
    const occB = Number(b.maxOccupancy || b.maxGuests || 0);
    switch (sortKey) {
      case "title": cmp = String(a.title).localeCompare(String(b.title)); break;
      case "type": cmp = String(a.type).localeCompare(String(b.type)); break;
      case "pricePerNight": cmp = Number(a.pricePerNight ?? 0) - Number(b.pricePerNight ?? 0); break;
      case "maxOccupancy": cmp = occA - occB; break;
      case "beds": cmp = Number(a.beds ?? 0) - Number(b.beds ?? 0); break;
      case "available": cmp = Number(!!a.available) - Number(!!b.available); break;
      default: cmp = 0;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  // --- COMPONENTS ---
  const SortBtn: React.FC<{ k: SortKey; children: React.ReactNode }> = ({ k, children }) => (
    <button onClick={() => setSort(k)} className="inline-flex items-center gap-1 hover:text-stone-900 text-[10px] font-bold uppercase tracking-widest text-stone-500 transition-colors group">
      {children}
      <span className={`text-[10px] ${sortKey === k ? "text-stone-800" : "text-stone-300 group-hover:text-stone-400"}`}>
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "▵▿"}
      </span>
    </button>
  );

  const selectClass = "bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none min-w-[140px]";
  const inputClass = "bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none w-24";

  if (loading) return <TableSkeleton rows={8} cols={6} />;
  if (error) return <div className="p-12 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-serif text-stone-800 mb-2">Inventory Dashboard</h1>
          <p className="text-stone-500 font-light">Manage resort accommodations, pricing, and status.</p>
        </div>
        <div className="text-right flex flex-col items-end gap-4">
             <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-stone-400">Sorting By</div>
                <div className="text-sm font-bold text-stone-800">
                    {sortKey.toUpperCase()} ({sortDir === 'asc' ? 'Asc' : 'Desc'})
                </div>
             </div>
             <Link 
                to="/admin/rooms/new" 
                className="bg-stone-900 hover:bg-black text-white px-6 py-2.5 text-sm font-medium uppercase tracking-wider rounded-md shadow-lg shadow-stone-200 transition-all hover:-translate-y-0.5"
             >
                + New Residence
             </Link>
        </div>
      </div>

      <div className="mb-8 p-5 border border-stone-200 bg-white shadow-sm rounded-lg flex flex-wrap items-end gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Category</div>
          <select className={selectClass} value={fType} onChange={(e) => setParam("type", e.target.value)}>
            <option value="">All Types</option>
            <option>Standard</option>
            <option>Deluxe</option>
            <option>Suite</option>
            <option>Family</option>
            <option>Villa</option>
          </select>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Status</div>
          <select className={selectClass} value={fAvail} onChange={(e) => setParam("avail", e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Stopped</option>
          </select>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Price Range</div>
          <div className="flex items-center gap-2">
             <input type="number" className={inputClass} value={fMin} onChange={(e) => setParam("min", e.target.value)} placeholder="Min $" />
             <span className="text-stone-300">-</span>
             <input type="number" className={inputClass} value={fMax} onChange={(e) => setParam("max", e.target.value)} placeholder="Max $" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-medium text-stone-500 w-[30%]"><SortBtn k="title">Residence</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="type">Category</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="pricePerNight">Rate</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="maxOccupancy">Capacity</SortBtn></th>
              <th className="p-4 font-medium text-stone-500"><SortBtn k="available">Status</SortBtn></th>
              <th className="p-4 font-medium text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paged.map((r) => {
              const isAvailable = r.available ?? true;
              const photo = (r.photos && r.photos[0]) ? r.photos[0] : null;

              return (
                <tr key={r._id} className="hover:bg-stone-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-100 rounded-md overflow-hidden flex-shrink-0 border border-stone-200">
                            {photo ? (
                                <img src={photo} alt={r.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 text-[9px]">NO IMG</div>
                            )}
                        </div>
                        <div>
                            <div className="font-serif font-medium text-lg text-stone-900">{r.title}</div>
                            <div className="text-xs font-mono text-stone-400 bg-stone-50 inline-block px-1 rounded border border-stone-100">ID: {r._id.slice(-6)}</div>
                        </div>
                    </div>
                  </td>

                  <td className="p-4">
                      <span className="text-sm text-stone-600 font-medium">{r.type}</span>
                  </td>

                  <td className="p-4 font-serif text-base text-stone-800">
                    ${Number(r.pricePerNight ?? 0).toLocaleString()}
                  </td>

                  <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs text-stone-500">
                        <div className="flex items-center gap-2">
                            <IconUser />
                            <span>{r.maxOccupancy || r.maxGuests} Guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <IconBed />
                            <span>{r.beds} Beds</span>
                        </div>
                      </div>
                  </td>

                  <td className="p-4">
                    {/* SMOOTH TOGGLE SWITCH */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAvailability(r)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-200 ${
                          isAvailable ? "bg-emerald-500" : "bg-stone-300"
                        }`}
                        title={isAvailable ? "Click to Stop" : "Click to Activate"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                            isAvailable ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${isAvailable ? "text-emerald-600" : "text-stone-400"}`}>
                          {isAvailable ? "Active" : "Stopped"}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link 
                            to={`/admin/rooms/${r._id}/edit`} 
                            className="text-stone-400 hover:text-stone-900 transition-colors p-2 hover:bg-stone-100 rounded-full"
                            title="Edit Details"
                        >
                            <IconEdit />
                        </Link>
                        <button 
                            onClick={() => onDelete(r._id)} 
                            className="text-stone-300 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-full"
                            title="Delete Room"
                        >
                            <IconTrash />
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr><td className="p-12 text-center text-stone-400 italic font-serif" colSpan={6}>No inventory found matching your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination className="mt-6" page={page} pageSize={pageSize} total={sorted.length} onPage={setPage} onPageSize={setPageSize} />
    </div>
  );
};

export default AdminRoomsList;