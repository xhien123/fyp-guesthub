import axios from "axios";
import type { MealType, Order as OrderT, Booking } from "../types";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || "http://localhost:4000",
  withCredentials: true,
});
export default api;

let redirectingOn401 = false;
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !redirectingOn401) {
      redirectingOn401 = true;
      window.dispatchEvent(new CustomEvent("auth:expired"));
      const here = window.location.pathname + window.location.search;
      const loginUrl = `/login?expired=1&returnTo=${encodeURIComponent(here)}`;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign(loginUrl);
      }
    }
    return Promise.reject(error);
  }
);

export type ID = string;

export type CartItem = {
  _id: ID;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  photo?: string;
};

export type RoomsQuery = {
  type?: string;
  min?: number;
  max?: number;
  occ?: number;
  amenities?: string[];
};

export type MenuQuery = {
  limit?: number;
  category?: string;
  search?: string;
  restaurant?: "savory-sizzle" | "vive-oceane";
  mealType?: MealType;
};

export type OrderService = "dine_in" | "room_delivery";
export type PaymentMethodFE = "charge_to_room" | "pay_now" | "pay_at_restaurant";

export type OrderItem = {
  _id: ID;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
};

export interface CreateOrderPayload {
  items: Array<OrderItem>;
  service: OrderService;
  payment: PaymentMethodFE;
  roomNumber?: string;
  note?: string;
  dineIn?: {
    date?: Date | string;
    guests?: number;
    notes?: string;
  };
}

export const extractId = (s: string): string => {
  const m = String(s).match(/[0-9a-fA-F]{24}$/);
  return m ? m[0] : s;
};

// --- AUTHENTICATION (UPDATED) ---

// Request 6-digit code via email
export async function sendVerificationCode(name: string, email: string) {
  const res = await api.post("/api/auth/send-code", { name, email });
  return res.data;
}

// Finalize registration with code
export async function registerVerified(payload: any) {
  const res = await api.post("/api/auth/register-verified", payload);
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}

export async function register(name: string, email: string, password: string) {
  const res = await api.post("/api/auth/register", { name, email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post("/api/auth/logout");
  return res.data;
}

// --- PUBLIC CONTENT ---
export async function fetchRooms(params?: RoomsQuery) {
  const res = await api.get("/api/rooms", { params });
  return res.data;
}
export async function fetchRoom(idOrSlug: ID) {
  const id = extractId(idOrSlug);
  const res = await api.get(`/api/rooms/${id}`);
  return res.data;
}
export async function fetchMenuCategories(params?: MenuQuery) {
  const res = await api.get("/api/menu/categories", { params });
  return res.data;
}
export async function fetchMenuItems(params?: MenuQuery) {
  const res = await api.get("/api/menu/items", { params });
  return res.data;
}

// --- ORDERS (USER) ---
export async function placeOrder(payload: CreateOrderPayload) {
  const res = await api.post("/api/orders", payload);
  const data = res.data as any;
  return (data.order as OrderT) ?? (data as OrderT);
}
export async function fetchOrder(orderId: ID) {
  const res = await api.get(`/api/orders/${orderId}`);
  return res.data as OrderT;
}
export async function fetchMyOrders() {
  const res = await api.get("/api/orders/me");
  return res.data as OrderT[];
}
export const cancelOrder = async (id: string) => {
  const { data } = await api.patch(`/api/orders/${id}/cancel`);
  return data;
};

// --- ORDERS (ADMIN) ---
export async function adminListOrders() {
  const res = await api.get("/api/admin/orders");
  return res.data as OrderT[];
}
export async function adminUpdateOrderStatus(id: ID, status: OrderT["status"]) {
  const res = await api.patch(`/api/admin/orders/${id}/status`, { status });
  return res.data as OrderT;
}
export async function adminMarkOrderPaid(id: ID) {
  const res = await api.patch(`/api/admin/orders/${id}/markPaid`);
  return res.data as OrderT;
}

// --- BOOKINGS (USER) ---
export interface BookingPayload {
  roomId: ID;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults?: number;
  children?: number;
  enhancements?: Record<string, boolean>;
  notes?: string;
}
export async function createBooking(payload: BookingPayload) {
  const res = await api.post("/api/bookings", {
    ...payload,
    roomId: extractId(payload.roomId),
  });
  return res.data;
}
export async function fetchMyBookings() {
  const res = await api.get("/api/bookings/me");
  return res.data as Booking[];
}
export async function fetchMyActiveBooking() {
  const res = await api.get("/api/bookings/me/active");
  return res.data as Booking;
}
export const cancelMyBooking = async (id: string): Promise<any> => {
  const res = await api.patch(`/api/bookings/${id}/cancel`);
  return res.data;
};

// --- BOOKINGS (ADMIN) ---
export async function adminListBookings() {
  const res = await api.get("/api/admin/bookings");
  return res.data as Booking[];
}
export async function adminUpdateBookingStatus(id: ID, status: Booking["status"]) {
  const res = await api.patch(`/api/admin/bookings/${id}/status`, { status });
  return res.data as Booking;
}

// --- ROOMS (ADMIN CRUD) ---
export type RoomPayload = {
  title: string;
  type: string;
  pricePerNight: number;
  maxGuests: number;
  beds: number;
  amenities: string[];
  photos: string[];
  description?: string;
  available: boolean;
};

export const adminListRooms = async () => {
  const { data } = await api.get("/api/admin/rooms");
  return data;
};
export const adminFetchRooms = adminListRooms;

export const adminGetRoom = async (id: ID) => {
  const { data } = await api.get(`/api/admin/rooms/${id}`);
  return data;
};

export const adminCreateRoom = async (payload: RoomPayload) => {
  const { data } = await api.post("/api/admin/rooms", payload);
  return data;
};
export const adminUpdateRoom = async (id: ID, payload: Partial<RoomPayload>) => {
  const { data } = await api.put(`/api/admin/rooms/${id}`, payload);
  return data;
};
export const adminDeleteRoom = async (id: ID) => {
  const { data } = await api.delete(`/api/admin/rooms/${id}`);
  return data;
};

// --- MENU (ADMIN CRUD) ---
export type MenuItemPayload = {
  _id?: string;
  name: string;
  category: string | { _id: string; name: string };
  price: number;
  available?: boolean;
  quantity?: number | null;
  photo?: string;
  description?: string;
  tags?: string[];
  restaurant: string;
  mealType?: string;
};

export async function adminListMenuItems() {
  const res = await api.get("/api/menu/items", { params: { limit: 1000 } });
  return res.data.items || res.data;
}
export async function adminGetMenuItem(id: ID) {
  const res = await api.get(`/api/menu/items?limit=1000`);
  const items = res.data.items || [];
  const found = items.find((i: any) => i._id === id);
  if (!found) throw new Error("Item not found");
  return found;
}
export async function adminCreateMenuItem(payload: MenuItemPayload) {
  const res = await api.post("/api/admin/menu", payload);
  return res.data;
}
export async function adminUpdateMenuItem(id: ID, payload: Partial<MenuItemPayload>) {
  const res = await api.put(`/api/admin/menu/${id}`, payload);
  return res.data;
}
export async function adminDeleteMenuItem(id: ID) {
  const res = await api.delete(`/api/admin/menu/${id}`);
  return res.data;
}

// --- INQUIRIES (ADMIN) ---
export async function adminFetchInquiries() {
  const res = await api.get("/api/admin/inquiries");
  return res.data.inquiries;
}
export async function adminUpdateInquiryStatus(id: ID, status: string) {
  const res = await api.put(`/api/admin/inquiries/${id}`, { status });
  return res.data;
}
export async function sendResetCode(email: string) {
  const res = await api.post("/api/auth/forgot-password/init", { email });
  return res.data;
}


export async function completePasswordReset(payload: any) {
  const res = await api.post("/api/auth/forgot-password/complete", payload);
  return res.data;
}
// --- ADMIN SECURITY ---
export async function verifyAdminLogin(email: string, code: string) {
  const res = await api.post("/api/auth/admin/verify-login", { email, code });
  return res.data;
}