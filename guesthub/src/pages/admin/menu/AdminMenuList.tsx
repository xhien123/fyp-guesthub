import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminListMenuItems, adminDeleteMenuItem, adminUpdateMenuItem, fetchMenuCategories } from "../../../lib/api";
import Pagination from "../../admin/Pagination";
import { TableSkeleton } from "../../../ui/Skeleton";
import { useToast } from "../../../ui/Toaster";
import { useConfirm } from "../../../ui/Confirm";

type SortKey = "name" | "category" | "price" | "available" | "restaurant";

const SearchIcon = () => (
  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const FilterIcon = () => (
  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const AdminMenuList: React.FC = () => {
  const { toast } = useToast();
  const confirm = useConfirm();

  const [params, setParams] = useSearchParams();
  const [rows, setRows] = React.useState<any[]>([]);
  const [cats, setCats] = React.useState<Array<{ _id?: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const restaurant = params.get("restaurant") || "";
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  const fAvail = params.get("avail") || "";
  const sortParam = params.get("sort") || "name:asc";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "10");

  const [sortKey, sortDir] = ((): [SortKey, "asc" | "desc"] => {
    const [k, d] = sortParam.split(":");
    const key = (["name", "category", "price", "available", "restaurant"].includes(k) ? (k as SortKey) : "name");
    const dir = d === "desc" ? "desc" : "asc";
    return [key, dir];
  })();

  const setParam = (key: string, val?: string) => {
    const next = new URLSearchParams(params);
    if (val && val.length) next.set(key, val); else next.delete(key);
    if (["restaurant", "category", "q", "avail"].includes(key)) next.set("page", "1");
    setParams(next, { replace: true });
  };

  const setSort = (key: SortKey) => {
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setParam("sort", `${key}:${nextDir}`);
  };
  const setPage = (p: number) => setParam("page", String(Math.max(1, p)));
  const setPageSize = (s: number) => {
    const next = new URLSearchParams(params);
    next.set("pageSize", String(s));
    next.set("page", "1");
    setParams(next, { replace: true });
  };

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, categories] = await Promise.all([
        adminListMenuItems(),
        fetchMenuCategories().catch(() => []),
      ]);
      const catList = Array.isArray(categories) ? categories : categories?.categories ?? [];
      setCats(catList);
      setRows(Array.isArray(items) ? items : []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Dish?",
      message: "This will permanently remove this item from the menu.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await adminDeleteMenuItem(id);
      toast({ title: "Dish removed", variant: "success" });
      await load(); // Still need a full load after delete, as IDs might shift or order changes.
    } catch {
      toast({ title: "Failed to delete item", variant: "error" });
    }
  };

  const toggleAvailability = async (item: any) => {
    const originalAvailable = item.available;
    const newAvailableStatus = !originalAvailable;

    // OPTIMISTIC UPDATE: Update UI instantly
    setRows(currentRows =>
      currentRows.map(row =>
        row._id === item._id ? { ...row, available: newAvailableStatus } : row
      )
    );

    try {
      await adminUpdateMenuItem(item._id, { available: newAvailableStatus });
      toast({
        title: newAvailableStatus ? "Marked Available" : "Marked Unavailable",
        description: item.name,
        variant: "success",
      });
      // NO await load() here! UI already updated.
    } catch {
      // ROLLBACK: If API fails, revert UI state
      setRows(currentRows =>
        currentRows.map(row =>
          row._id === item._id ? { ...row, available: originalAvailable } : row
        )
      );
      toast({ 
        title: "Failed to update status", 
        description: `Could not change availability for ${item.name}. Please try again.`,
        variant: "error" 
      });
    }
  };

  const filtered = rows.filter((i: any) => {
    if (restaurant && i.restaurant !== restaurant) return false;
    if (category) {
      const matches =
        i.category === category ||
        i.category?._id === category ||
        i.category?.name === category;
      if (!matches) return false;
    }
    if (q) {
      const qq = q.toLowerCase();
      if (!i.name?.toLowerCase().includes(qq) && !i.description?.toLowerCase().includes(qq)) {
        return false;
      }
    }
    if (fAvail) {
      const should = fAvail === "true";
      if (!!i.available !== should) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name": cmp = String(a.name).localeCompare(String(b.name)); break;
      case "restaurant": cmp = String(a.restaurant).localeCompare(String(b.restaurant)); break;
      case "category": cmp = String(a.category?.name ?? a.category ?? "").localeCompare(String(b.category?.name ?? b.category ?? "")); break;
      case "price": cmp = Number(a.price ?? 0) - Number(b.price ?? 0); break;
      case "available": cmp = Number(!!a.available) - Number(!!b.available); break;
      default: cmp = 0;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);
  
  const totalCount = filtered.length;
  // Adjusted soldOutCount to consider both manual unavailability and zero quantity
  const soldOutCount = filtered.filter(i => !i.available || (i.quantity !== null && i.quantity !== undefined && i.quantity <= 0)).length;

  const SortBtn: React.FC<{ k: SortKey; children: React.ReactNode }> = ({ k, children }) => (
    <button onClick={() => setSort(k)} className="group inline-flex items-center gap-1 font-semibold text-xs uppercase tracking-wider text-neutral-500 hover:text-black transition-colors" title="Sort">
      {children}
      <span className={`text-[10px] transition-opacity ${sortKey === k ? "opacity-100 text-black" : "opacity-0 group-hover:opacity-50"}`}>
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    </button>
  );

  if (loading) return <TableSkeleton rows={8} cols={6} />;
  if (error) return <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>;

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 pb-6">
        <div>
          <h1 className="text-3xl font-display font-medium text-neutral-900 tracking-tight">Culinary Management</h1>
          <p className="text-neutral-500 mt-1">Orchestrate the dining experience across all venues.</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="hidden md:flex gap-6 text-sm px-4 py-2 bg-white border border-neutral-100 rounded-full shadow-sm text-neutral-600">
                <span>Total Items: <strong className="text-black">{totalCount}</strong></span>
                <span className="w-px h-4 bg-neutral-200"/>
                <span>Sold Out: <strong className="text-red-600">{soldOutCount}</strong></span>
             </div>
             <Link to="/admin/menu/new" className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10">
                <span>+ Create Dish</span>
            </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-1.5 bg-neutral-100/50 rounded-2xl border border-neutral-200/60 backdrop-blur-xl">
        <div className="relative group flex-1 min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black">
                <SearchIcon />
            </div>
            <input
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm"
            placeholder="Search by name or description..."
            defaultValue={q}
            onChange={(e) => setParam("q", e.target.value)}
            />
        </div>
        
        <div className="h-8 w-px bg-neutral-300/50 mx-1 hidden sm:block" />

        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><FilterIcon /></div>
            <select 
                className="pl-9 pr-8 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none appearance-none cursor-pointer shadow-sm hover:border-neutral-300 transition-colors min-w-[160px]" 
                value={restaurant} 
                onChange={(e) => setParam("restaurant", e.target.value)}
            >
                <option value="">All Restaurants</option>
                <option value="savory-sizzle">Savory Sizzle</option>
                <option value="vive-oceane">Vive Oceane</option>
            </select>
        </div>

        <select 
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none cursor-pointer shadow-sm hover:border-neutral-300 transition-colors" 
            value={category} 
            onChange={(e) => setParam("category", e.target.value)}
        >
            <option value="">All Categories</option>
            {cats.map((c) => (
            <option key={c._id ?? c.name} value={c._id ?? c.name}>{c.name}</option>
            ))}
        </select>

        <select 
            className={`px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none cursor-pointer shadow-sm transition-colors ${fAvail ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200 hover:border-neutral-300"}`}
            value={fAvail} 
            onChange={(e) => setParam("avail", e.target.value)}
        >
            <option value="" className="text-black bg-white">Status: All</option>
            <option value="true" className="text-black bg-white">Available Only</option>
            <option value="false" className="text-black bg-white">Unavailable Only</option> {/* Changed "Sold Out Only" to "Unavailable Only" for clarity */}
        </select>
      </div>

      <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50/50 border-b border-neutral-100">
            <tr>
              <th className="p-5 w-[40%]"><SortBtn k="name">Dish Profile</SortBtn></th>
              <th className="p-5"><SortBtn k="restaurant">Venue</SortBtn></th>
              <th className="p-5"><SortBtn k="category">Category</SortBtn></th>
              <th className="p-5"><SortBtn k="price">Price</SortBtn></th>
              <th className="p-5"><SortBtn k="available">Stock Status</SortBtn></th>
              <th className="p-5 text-right font-semibold text-xs uppercase tracking-wider text-neutral-500">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.map((it) => (
              <tr key={it._id} className="group hover:bg-neutral-50/50 transition-all duration-200">
                <td className="p-5">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 shadow-sm group-hover:shadow-md transition-all">
                         {it.photo ? (
                             <img src={it.photo} alt="" className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🍽️</div>
                         )}
                    </div>
                    <div className="pt-1">
                      <div className="font-display font-semibold text-lg text-neutral-900 group-hover:text-black transition-colors">{it.name}</div>
                      {it.description && <div className="text-xs text-neutral-500 line-clamp-1 max-w-[280px] mt-1 font-light">{it.description}</div>}
                    </div>
                  </div>
                </td>
                <td className="p-5 align-middle">
                    {it.restaurant === "savory-sizzle" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50/80 px-3 py-1 text-xs font-bold tracking-wide text-orange-800 border border-orange-100/50 shadow-sm">
                            🔥 Savory
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 px-3 py-1 text-xs font-bold tracking-wide text-blue-800 border border-blue-100/50 shadow-sm">
                            🌊 Oceane
                        </span>
                    )}
                </td>
                <td className="p-5 align-middle text-neutral-600 font-medium">{it.category?.name ?? it.category}</td>
                <td className="p-5 align-middle font-mono font-medium text-neutral-900 tracking-tight text-base">${Number(it.price ?? 0).toFixed(2)}</td>
                <td className="p-5 align-middle">
                  <div className="flex items-center gap-3">
                      {/* Toggle Button */}
                      <button
                        onClick={() => toggleAvailability(it)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 ${it.available ? "bg-emerald-500" : "bg-neutral-200"}`}
                        title={it.available ? "Click to mark Unavailable" : "Click to mark Available"}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${it.available ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                      
                      {/* BADGE LOGIC */}
                      {!it.available ? (
                          // Case 1: Manually Switched Off (Grey)
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-neutral-100 text-neutral-400 border border-neutral-200">
                              Unavailable
                          </span>
                      ) : (it.quantity !== null && it.quantity !== undefined && it.quantity <= 0) ? (
                          // Case 2: Stock hit 0 (Red)
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-100">
                              Sold Out
                          </span>
                      ) : (it.quantity !== null && it.quantity !== undefined) ? (
                          // Case 3: Specific Stock Left (Orange/Yellow)
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                              {it.quantity} Left
                          </span>
                      ) : (
                          // Case 4: Unlimited (Green) -> Now "In Stock"
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                              In Stock
                          </span>
                      )}
                  </div>
                </td>
                <td className="p-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                        <Link to={`/admin/menu/${it._id}/edit`} className="p-2 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-colors" title="Edit Dish">
                            <EditIcon />
                        </Link>
                        <button onClick={() => onDelete(it._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors" title="Delete Dish">
                            <TrashIcon />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                  <td className="p-16 text-center" colSpan={6}>
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-2xl mb-4">🥗</div>
                        <h3 className="text-neutral-900 font-medium mb-1">No dishes found</h3>
                        <p className="text-neutral-500 text-sm mb-6">Try adjusting your search or filters.</p>
                        <button onClick={() => {setParam("q", ""); setParam("restaurant", ""); setParam("category", ""); setParam("avail", "")}} className="text-sm font-medium text-black underline hover:opacity-70">
                            Clear all filters
                        </button>
                    </div>
                  </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
          <Pagination className="bg-white border border-neutral-200 rounded-xl shadow-sm px-2 py-1" page={page} pageSize={pageSize} total={sorted.length} onPage={setPage} onPageSize={setPageSize} />
      </div>
    </div>
  );
};

export default AdminMenuList;