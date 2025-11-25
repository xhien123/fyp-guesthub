import React from "react";
import { useNavigate } from "react-router-dom";
import { fetchMenuCategories, type MenuItemPayload } from "../../../lib/api";

type Props = {
  initial?: Partial<MenuItemPayload>;
  onSubmit: (payload: MenuItemPayload) => Promise<void>;
  submitting?: boolean;
};

const RESTAURANTS = [
  { label: "Savory Sizzle (Buffet)", value: "savory-sizzle" },
  { label: "Vive Oceane (Beach)", value: "vive-oceane" },
];

const MEAL_TYPES = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch & Dinner", value: "lunch_dinner" },
  { label: "Food Dining", value: "food_dining" },
  { label: "Beverages & Wines", value: "beverage_wine" },
];

const toCSV = (arr?: string[]) => (arr && arr.length ? arr.join(", ") : "");
const toArray = (csv: string) => csv.split(",").map((s) => s.trim()).filter(Boolean);

const AdminMenuForm: React.FC<Props> = ({ initial, onSubmit, submitting }) => {
  const navigate = useNavigate();
  const [cats, setCats] = React.useState<Array<{ _id?: string; name: string }>>([]);
  
  const [form, setForm] = React.useState<MenuItemPayload>({
    name: initial?.name ?? "",
    restaurant: initial?.restaurant ?? "savory-sizzle",
    mealType: initial?.mealType ?? "lunch_dinner",
    category: initial?.category ?? "",
    price: Number(initial?.price ?? 0),
    quantity: initial?.quantity ?? null,
    available: initial?.available ?? true,
    photo: initial?.photo ?? "",
    description: initial?.description ?? "",
    tags: initial?.tags ?? [],
  });

  const [tagsCSV, setTagsCSV] = React.useState<string>(toCSV(form.tags));

  React.useEffect(() => {
    (async () => {
      try {
        const data = await fetchMenuCategories();
        setCats(Array.isArray(data) ? data : data?.categories ?? []);
      } catch {
        setCats([]);
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "price" ? Number(value) : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MenuItemPayload = {
      ...form,
      tags: toArray(tagsCSV),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-6 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Dish Name</div>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border-b border-neutral-300 bg-transparent py-2 text-lg font-medium placeholder-neutral-400 focus:border-black focus:outline-none"
            placeholder="e.g. Truffle Risotto"
            required
          />
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Restaurant</div>
          <select
            name="restaurant"
            value={form.restaurant}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            required
          >
            {RESTAURANTS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Meal Period</div>
          <select
            name="mealType"
            value={form.mealType}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            required
          >
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Category</div>
          <select
            name="category"
            value={typeof form.category === 'object' ? (form.category as any)._id : form.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            required
          >
            <option value="" disabled>Select Category</option>
            {cats.map((c) => (
              <option key={c._id ?? c.name} value={c._id ?? c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Price ($)</div>
          <input
            type="number"
            min={0}
            step={0.5}
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            required
          />
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Daily Quantity <span className="font-normal text-neutral-400">(Empty = Unlimited)</span>
          </div>
          <input
            type="number"
            min={0}
            step={1}
            name="quantity"
            value={form.quantity ?? ""}
            onChange={(e) => {
                const val = e.target.value;
                setForm(prev => ({
                    ...prev,
                    quantity: val === "" ? null : parseInt(val)
                }))
            }}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="e.g. 5"
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Description</div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Ingredients, taste profile..."
          />
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Photo URL</div>
          <input
            name="photo"
            value={form.photo}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="https://..."
          />
        </label>

        <label className="block">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Tags</div>
          <input
            value={tagsCSV}
            onChange={(e) => setTagsCSV(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Spicy, GF, Vegan"
          />
        </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${form.available ? "bg-green-500" : "bg-neutral-200"}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.available ? "translate-x-6" : ""}`} />
          </div>
          <input type="checkbox" name="available" checked={!!form.available} onChange={handleChange} className="hidden" />
          <span className="text-sm font-medium text-neutral-700">
            {form.available ? "Item is Available" : "Sold Out (86'd)"}
          </span>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!submitting}
            className="rounded-xl bg-black px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Menu Item"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminMenuForm;