// src/context/CartContext.tsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { ID } from "../lib/api";
import type { MenuItem, BookingStatus } from "../types";
import api from "../lib/api";

export type CartItem = {
  _id: ID;
  name: string;
  price: number;
  quantity: number;
  photo?: string;
  notes?: string;
};

type Ctx = {
  items: CartItem[];
  totalQty: number;
  totalPrice: number;
  addItem: (item: MenuItem | CartItem, qty?: number, notes?: string) => void;
  removeItem: (id: ID, qty?: number) => void;
  clearCart: () => void;
  isGuestCheckedIn: boolean;
  bookingStatus: BookingStatus | null;
  reloadBookingStatus: () => Promise<void>;
  updateItemQty: (id: ID, qty: number) => void;
  setItemNote: (id: ID, notes: string) => void;
};

const CartContext = createContext<Ctx | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isGuestCheckedIn, setIsGuestCheckedIn] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(
    null
  );

  const totalQty = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  /**
   * Reload booking status for the current logged-in user.
   *
   * Rules:
   * - If there is at least one booking with status "Checked-in" and
   *   the current time is before that booking's check-out window ends,
   *   then isGuestCheckedIn = true and bookingStatus = "Checked-in".
   * - Otherwise, isGuestCheckedIn = false and bookingStatus is set to
   *   the "most relevant" upcoming stay (Pending/Confirmed) if any, or null.
   */
  const reloadBookingStatus = async () => {
    try {
      const res = await api.get("/api/bookings/me", { withCredentials: true });
      const raw = res.data;

      const list: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.bookings)
        ? raw.bookings
        : [];

      if (!Array.isArray(list) || list.length === 0) {
        setIsGuestCheckedIn(false);
        setBookingStatus(null);
        return;
      }

      const now = new Date();

      // 1. Find the most recent "Checked-in" booking
      const checkedInBookings = list
        .filter((b: any) => b.status === "Checked-in")
        .sort(
          (a: any, b: any) =>
            new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
        );

      if (checkedInBookings.length > 0) {
        const active = checkedInBookings[0];

        // Treat stay as active until the end of check-out day (local time).
        const cout = new Date(active.checkOut);
        const coutEnd = new Date(cout);
        coutEnd.setDate(coutEnd.getDate() + 1);
        coutEnd.setHours(0, 0, 0, 0);

        const stayIsActive = now < coutEnd;

        setIsGuestCheckedIn(stayIsActive);
        setBookingStatus((active.status as BookingStatus) || null);

        if (stayIsActive) {
          // Guest is currently in residence; nothing more to do.
          return;
        }
      }

      // 2. If no active Checked-in stay, surface the next upcoming booking
      //    (Pending / Confirmed) just for message context in popups.
      const upcoming = list
        .filter(
          (b: any) =>
            b.status === "Pending" ||
            b.status === "Confirmed" ||
            b.status === "Checked-in"
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
        );

      if (upcoming.length > 0) {
        setBookingStatus((upcoming[0].status as BookingStatus) || null);
      } else {
        setBookingStatus(null);
      }

      setIsGuestCheckedIn(false);
    } catch (err) {
      // On any error (not logged in, network, etc) treat as not checked-in.
      setIsGuestCheckedIn(false);
      setBookingStatus(null);
    }
  };

  useEffect(() => {
    reloadBookingStatus();
    // Optional: expose for manual debugging in the browser console
    (window as any).__reloadBookingStatus = reloadBookingStatus;
  }, []);

  const addItem = (item: MenuItem | CartItem, qty = 1, notes?: string) => {
    if (qty <= 0) return;

    const nextTotal = totalQty + qty;
    let finalQty = qty;
    if (nextTotal > 10) {
      const allowed = 10 - totalQty;
      if (allowed <= 0) return;
      finalQty = allowed;
    }

    setItems((prev) => {
      const id = (item as any)._id as ID;
      const idx = prev.findIndex((p) => p._id === id);
      if (idx >= 0) {
        const existing = prev[idx];
        const updatedQty = existing.quantity + finalQty;
        const copy = [...prev];
        copy[idx] = {
          ...existing,
          quantity: updatedQty,
          notes: notes !== undefined ? notes : existing.notes,
        };
        return copy;
      }
      return [
        ...prev,
        {
          _id: id,
          name: (item as any).name,
          price: Number((item as any).price ?? 0),
          quantity: finalQty,
          photo: (item as any).photo || (item as any).imagePath,
          notes,
        },
      ];
    });
  };

  const removeItem = (id: ID, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p._id === id);
      if (idx < 0) return prev;
      const cur = prev[idx];
      const newQty = cur.quantity - qty;
      if (newQty > 0) {
        const copy = [...prev];
        copy[idx] = { ...cur, quantity: newQty };
        return copy;
      }
      return prev.filter((p) => p._id !== id);
    });
  };

  const updateItemQty = (id: ID, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((it) => it._id !== id));
      return;
    }
    setItems((prev) => {
      const totalOther = prev
        .filter((it) => it._id !== id)
        .reduce((s, it) => s + it.quantity, 0);
      const capped = Math.min(qty, Math.max(0, 10 - totalOther));
      return prev.map((it) =>
        it._id === id ? { ...it, quantity: capped } : it
      );
    });
  };

  const setItemNote = (id: ID, notes: string) => {
    setItems((prev) =>
      prev.map((it) => (it._id === id ? { ...it, notes } : it))
    );
  };

  const clearCart = () => setItems([]);

  const value: Ctx = {
    items,
    totalQty,
    totalPrice,
    addItem,
    removeItem,
    clearCart,
    isGuestCheckedIn,
    bookingStatus,
    reloadBookingStatus,
    updateItemQty,
    setItemNote,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
