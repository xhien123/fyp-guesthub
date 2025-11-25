import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchMenuCategories,
  fetchMenuItems,
  type MenuQuery,
} from "../../../lib/api";
import type { MenuCategory, MenuItem, MealType } from "../../../types";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../ui/Toaster";
import CategoryChips from "./CategoryChips";

const FALLBACK =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const toAbs = (p?: string) =>
  p ? (p.startsWith("http") ? p : `${API_BASE}${p}`) : "";

type SortKey = "price" | "name";
type SortDir = "asc" | "desc";

const parseSort = (val: string | null): [SortKey, SortDir] => {
  const [k, d] = (val || "price:asc").split(":");
  const key: SortKey = k === "name" ? "name" : "price";
  const dir: SortDir = d === "desc" ? "desc" : "asc";
  return [key, dir];
};

type RestaurantKey = "savory-sizzle" | "vive-oceane";

type MealTab = {
  key: "breakfast" | "lunch_dinner" | "food_dining" | "beverage_wine";
  label: string;
};

type Props = {
  restaurantKey: RestaurantKey;
  isRoomService?: boolean;
  mealTabs?: MealTab[];
};

const DEFAULT_TYPE: Record<RestaurantKey, "lunch_dinner" | "food_dining"> = {
  "savory-sizzle": "lunch_dinner",
  "vive-oceane": "food_dining",
};

const getRestaurantTabs = (key: RestaurantKey, customTabs?: MealTab[]) => {
  if (customTabs && customTabs.length > 0) return customTabs;
  if (key === "savory-sizzle") {
    return [
      { key: "breakfast", label: "Breakfast" },
      { key: "lunch_dinner", label: "Dining & Drinks" },
    ];
  }
  return [{ key: "food_dining", label: "All Day Dining" }];
};

const COURSE_ORDER = [
  "starter",
  "entree",
  "entrée",
  "appetizer",
  "small plates",
  "main",
  "mains",
  "secondi",
  "dessert",
  "desserts",
];

const DRINK_ORDER = [
  "soft drink",
  "soft drinks",
  "mocktail",
  "mocktails",
  "cocktail",
  "cocktails",
  "spirits",
  "beer",
  "wine",
  "wines",
  "beverages & wines",
];

const rankCategory = (name?: string) => {
  const n = (name || "").toLowerCase();
  const inList = (list: string[]) => {
    const i = list.findIndex((k) => n === k || n.includes(k));
    return i === -1 ? null : i;
  };
  const c = inList(COURSE_ORDER);
  if (c !== null) return c;
  const d = inList(DRINK_ORDER);
  if (d !== null) return 100 + d;
  return 1000;
};

const Qty: React.FC<{
  value: number;
  max?: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}> = ({ value, max = 99, onChange, disabled }) => (
  <div className="inline-flex items-center border border-stone-300 bg-white h-8">
    <button
      type="button"
      disabled={disabled || value <= 0}
      onClick={() => onChange(Math.max(0, value - 1))}
      className="px-3 h-full transition-colors hover:bg-stone-100 disabled:opacity-50 text-stone-600"
      aria-label="Decrease"
    >
      –
    </button>
    <div className="w-8 h-full flex items-center justify-center text-sm font-serif text-stone-900 border-x border-stone-100">
      {value}
    </div>
    <button
      type="button"
      disabled={disabled || value >= max}
      onClick={() => onChange(value + 1)}
      className="px-3 h-full transition-colors hover:bg-stone-100 disabled:opacity-50 text-stone-600"
      aria-label="Increase"
    >
      +
    </button>
  </div>
);

const MenuCard: React.FC<{
  item: MenuItem;
  currentQty: number;
  addOrSetQty: (item: MenuItem, nextQty: number, currentQty: number) => void;
}> = ({ item, currentQty, addOrSetQty }) => {
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = React.useState(
    toAbs(item.photo) || toAbs((item as any).imagePath) || FALLBACK
  );

  const unavailable = !(
    typeof (item as any).available === "boolean"
      ? (item as any).available
      : (item as any).isAvailable
  );

  const maxStock = (item.quantity === null || item.quantity === undefined) ? 999 : item.quantity;
  const isLowStock = maxStock < 5 && maxStock > 0 && maxStock !== 999;

  const handleQtyChange = (next: number) => {
    if (unavailable) return;

    if (next > maxStock) {
      toast({
        title: "Limited Availability",
        description: `We apologize, but we currently have only ${maxStock} portions remaining of this dish.`,
        variant: "warning",
      });
      return;
    }

    const safe = Math.max(0, next);
    addOrSetQty(item, safe, currentQty);
  };

  return (
    <div className="group flex flex-col bg-white border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={imgSrc}
          alt={item.name}
          loading="lazy"
          onError={() => setImgSrc(FALLBACK)}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            unavailable ? "grayscale opacity-60" : ""
          }`}
        />
        
        {/* Luxury Overlay for Sold Out */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] border-stone-200 m-2 border">
            <span className="font-serif text-lg uppercase tracking-widest text-stone-900 border-b-2 border-stone-900 pb-1">
              Sold Out
            </span>
          </div>
        )}

        {/* Low Stock Warning - Minimalist */}
        {!unavailable && isLowStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-stone-900 text-white py-1 px-3">
            <p className="text-[10px] uppercase tracking-widest font-medium text-center">
              Limited: Only {maxStock} Remaining
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 gap-3">
        <div className="flex justify-between items-baseline gap-4">
          <h3 className="font-serif text-lg text-stone-900 leading-tight group-hover:text-stone-600 transition-colors">
            {item.name}
          </h3>
          <span className="shrink-0 font-sans text-sm font-medium text-stone-900">
            ${Number(item.price ?? 0).toFixed(2)}
          </span>
        </div>

        {item.description && (
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-light">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-100">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
            {currentQty > 0 ? "In Your Order" : "Quantity"}
          </span>
          <Qty
            value={currentQty}
            max={maxStock}
            onChange={handleQtyChange}
            disabled={unavailable}
          />
        </div>
      </div>
    </div>
  );
};

const MenuGrid: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  const cart = useCart();
  const { items: cartItems = [], totalQty = 0 } = cart;
  const addItem = cart.addItem;
  const updateItemQty = cart.updateItemQty;
  const removeItem = cart.removeItem;
  const { toast } = useToast();

  const getQtyInCart = React.useCallback(
    (id: string) => cartItems.find((x: any) => x._id === id)?.quantity ?? 0,
    [cartItems]
  );

  const applyQty = React.useCallback(
    (it: MenuItem, nextQty: number, curQty: number) => {
      const otherCount = totalQty - curQty;
      if (nextQty + otherCount > 10) {
        toast({
          title: "Order Limit",
          description:
            "For optimal service, we limit orders to 10 items.",
          variant: "warning",
        });
        return;
      }

      if (curQty === 0) {
        if (nextQty <= 0) return;
        if (addItem) {
          addItem(it, nextQty);
        }
      } else if (updateItemQty) {
        updateItemQty(it._id, nextQty);
      } else if (addItem && removeItem) {
        if (nextQty === 0) removeItem(it._id);
        else {
          const delta = nextQty - curQty;
          if (delta > 0) addItem(it, delta);
          else removeItem(it._id, -delta);
        }
      }

      toast({
        title: nextQty === 0 ? "Item Removed" : "Order Updated",
        description: nextQty === 0 ? it.name : `${it.name} × ${nextQty}`,
        variant: "success",
      });

      try {
        window.dispatchEvent(new CustomEvent("cart:bump"));
      } catch {}
    },
    [totalQty, toast, updateItemQty, addItem, removeItem]
  );

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <MenuCard
          key={it._id}
          item={it}
          currentQty={getQtyInCart(it._id)}
          addOrSetQty={applyQty}
        />
      ))}
    </div>
  );
};

const RestaurantMenu: React.FC<Props> = ({ restaurantKey, mealTabs }) => {
  const [params, setParams] = useSearchParams();
  const tabs = getRestaurantTabs(restaurantKey, mealTabs);
  const defaultType = DEFAULT_TYPE[restaurantKey];

  const type =
    (params.get("type") as "breakfast" | "lunch_dinner" | "food_dining") ||
    defaultType;

  const setType = (next: string) => {
    const sp = new URLSearchParams(params);
    sp.set("type", next);
    sp.delete("cat");
    sp.delete("q");
    setParams(sp, { replace: true });
  };

  const activeCat = params.get("cat") || "all";
  const qParam = params.get("q") || "";
  const [sortKey, sortDir] = parseSort(params.get("sort"));

  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [search, setSearch] = React.useState(qParam);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const setParam = React.useCallback(
    (key: string, val?: string) => {
      const sp = new URLSearchParams(params);
      if (val && val.length) sp.set(key, val);
      else sp.delete(key);
      setParams(sp, { replace: true });
    },
    [params, setParams]
  );

  const onCategoryChange = (v: string) => setParam("cat", v);
  const onSortChange = (v: string) => setParam("sort", v);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      if ((qParam || "") !== (search || "")) {
        setParam("q", search.trim() ? search.trim() : undefined);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [search, qParam, setParam]);

  React.useEffect(() => {
    (async () => {
      try {
        const isBreakfast = type === "breakfast";
        const payload: MenuQuery = {
          restaurant: restaurantKey,
          ...(isBreakfast ? { mealType: "breakfast" as MealType } : {}),
        };
        const cats = await fetchMenuCategories(payload).catch(() => []);
        const list = (Array.isArray(cats)
          ? cats
          : (cats as any)?.categories || []) as MenuCategory[];
        const ordered = [...list].sort((a, b) => {
          const ra = rankCategory(a?.name);
          const rb = rankCategory(b?.name);
          if (ra !== rb) return ra - rb;
          return String(a?.name || "").localeCompare(String(b?.name || ""));
        });
        setCategories(ordered);
      } catch {
        setCategories([]);
      }
    })();
  }, [restaurantKey, type]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isBreakfast = type === "breakfast";
      const payload: MenuQuery = {
        limit: 100,
        restaurant: restaurantKey,
        ...(isBreakfast ? { mealType: "breakfast" as MealType } : {}),
      };
      if (activeCat !== "all") payload.category = activeCat;
      if (qParam.trim()) payload.search = qParam.trim();

      const data = await fetchMenuItems(payload);
      const list = (Array.isArray(data)
        ? data
        : (data as any)?.items || []) as MenuItem[];

      const itemsOrdered = [...list].sort((a, b) => {
        const an =
          typeof a.category === "object" ? (a.category as any)?.name : "";
        const bn =
          typeof b.category === "object" ? (b.category as any)?.name : "";
        const ra = rankCategory(an);
        const rb = rankCategory(bn);

        if (ra !== rb) return ra - rb;

        if (sortKey === "price") {
          const cmp = Number(a.price ?? 0) - Number(b.price ?? 0);
          return sortDir === "asc" ? cmp : -cmp;
        }
        const cmp = String(a.name ?? "").localeCompare(String(b.name ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });

      setItems(itemsOrdered);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [restaurantKey, type, activeCat, qParam, sortKey, sortDir]);

  React.useEffect(() => {
    load();
  }, [load]);

  const title =
    restaurantKey === "savory-sizzle"
      ? "The World's Table"
      : "Oceanic Delights";

  const subTitle = restaurantKey === "savory-sizzle" 
    ? "Refined European Classics" 
    : "Fresh Local Seafood & Grill";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 bg-stone-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-6 gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 tracking-tight">
            {title}
          </h2>
          <p className="text-stone-500 text-sm tracking-wide uppercase font-medium">
            {subTitle}
          </p>
        </div>
        
        {/* Square Tabs */}
        <div className="flex border border-stone-300 bg-white">
          {tabs.map((t) => {
            const active = t.key === type;
            return (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  active
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="space-y-6">
        <div className="p-6 bg-white border border-stone-200 shadow-sm flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          
          {/* Chips Container - ensuring they flow nicely */}
          <div className="flex-1 w-full lg:w-auto">
             <CategoryChips
                categories={categories}
                active={activeCat}
                onChange={onCategoryChange}
             />
          </div>

          <div className="h-px w-full lg:w-px lg:h-10 bg-stone-200"></div>

          {/* Search & Sort - Square Inputs */}
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search menu..."
                    className="w-full bg-stone-50 border-b border-stone-300 px-0 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors rounded-none"
                />
            </div>
            
            <select
                className="bg-stone-50 border-b border-stone-300 py-2 pl-2 pr-8 text-sm text-stone-900 focus:border-stone-900 focus:outline-none cursor-pointer rounded-none min-w-[140px]"
                value={`${sortKey}:${sortDir}`}
                onChange={(e) => onSortChange(e.target.value)}
            >
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="name:asc">Name: A — Z</option>
                <option value="name:desc">Name: Z — A</option>
            </select>
            
            {qParam && (
                <button
                onClick={() => {
                    setSearch("");
                    setParam("q", undefined);
                }}
                className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 border-b border-transparent hover:border-stone-900 transition-all"
                >
                Clear
                </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
          <div className="py-20 text-center">
              <p className="font-serif text-xl text-stone-400 italic">Curating your experience...</p>
          </div>
      )}
      
      {error && (
          <div className="p-6 bg-red-50 border border-red-100 text-red-800 text-center font-medium">
              {error}
          </div>
      )}

      {!loading && !error && items.length > 0 && <MenuGrid items={items} />}

      {!loading && !error && items.length === 0 && (
        <div className="py-20 text-center border border-dashed border-stone-300">
          <p className="text-stone-500 font-serif text-lg italic">
            No culinary items found matching your selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;