import React from "react";
import api from "../../../lib/api";
import type { MenuItem } from "../../../types";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../ui/Toaster";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

const toAbs = (p?: string) =>
  !p ? "" : p.startsWith("http") ? p : `${API_BASE}${p}`;

const MenuPicks: React.FC = () => {
  const [items, setItems] = React.useState<MenuItem[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { addItem } = useCart();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/api/menu/items", { params: { limit: 4 } });
        const list =
          (Array.isArray(res.data) ? res.data : res.data?.items) ?? [];
        setItems(list);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const add = (it: MenuItem) => {
    try {
      addItem(it, 1);
      toast({
        title: "Added to cart",
        description: it.name,
        variant: "success",
      });
      try {
        window.dispatchEvent(new CustomEvent("cart:bump"));
      } catch {}
    } catch {
      toast({ title: "Failed to add to cart", variant: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner />
        <span className="text-neutral-600">Loading picks…</span>
      </div>
    );
  }

  if (error) return <div className="text-danger">Error: {error}</div>;
  if (!items || items.length === 0)
    return <div className="text-neutral-600">No menu items found.</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.slice(0, 4).map((it) => {
        const img = toAbs(it.photo) || toAbs((it as any).imagePath);
        const available =
          typeof (it as any).available === "boolean"
            ? (it as any).available
            : (it as any).isAvailable;

        return (
          <div key={it._id} className="bg-white shadow p-4 border">
            {img ? (
              <img
                src={img}
                alt={it.name}
                className="aspect-[4/3] w-full object-cover mb-3"
              />
            ) : (
              <div className="aspect-[4/3] w-full bg-neutral-200 mb-3" />
            )}

            <h3 className="text-lg font-semibold">{it.name}</h3>

            {it.description && (
              <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                {it.description}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                ${Number(it.price ?? 0).toLocaleString()}
              </span>
              <Button
                variant={available ? "solid" : "ghost"}
                disabled={!available}
                className="text-sm"
                onClick={() => add(it)}
              >
                {available ? "Add" : "Sold out"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuPicks;
