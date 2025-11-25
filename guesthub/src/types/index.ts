export type ID = string;

export interface Room {
  _id: ID;
  title: string;
  type: string;
  pricePerNight: number;
  maxGuests: number;
  maxOccupancy?: number;
  beds: number;
  amenities: string[];
  photos?: string[];
  description?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = "user" | "admin";

export interface User {
  _id: ID;
  email: string;
  name?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus =
  | "Pending"
  | "Pending Verification" // <--- ADDED THIS
  | "Confirmed"
  | "Checked-in"
  | "Checked-out"
  | "Declined"
  | "Cancelled";

type EnhancementKey = "earlyCheckIn" | "lateCheckOut" | "airportTransfer";

export interface Booking {
  _id: string;
  user: string | User;
  room: string | { _id: string; title: string; pricePerNight?: number };
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  enhancements: Record<EnhancementKey, boolean>;
  financials: {
    baseRatePerNight: number;
    taxRate: number;
    taxAmount: number;
    subtotal: number;
    enhancementCost: number;
    totalPayable: number;
  };
  status: BookingStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingPayload {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  enhancements?: Record<EnhancementKey, boolean>;
  notes?: string;
}

export interface MenuCategory {
  _id: ID;
  name: string;
}

export type MealType =
  | "breakfast"
  | "lunch_dinner"
  | "food_dining"
  | "beverage_wine"
  | "beverage_wines";

export interface MenuItem {
  _id: ID;
  name: string;
  category: ID | MenuCategory | string;
  price: number;
  available?: boolean;
  isAvailable?: boolean;
  quantity?: number | null;
  photo?: string;
  imagePath?: string;
  description?: string;
  tags?: string[];
  mealType?: MealType;
  restaurant?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = "Received" | "Preparing" | "Ready" | "Delivered" | "Completed" | "Cancelled";

export interface OrderItem {
  _id?: ID;
  menuItemId?: ID;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  _id: ID;
  user?: ID | { _id: ID; email?: string };
  items: OrderItem[];
  total?: number;
  service?: "room_delivery" | "dine_in";
  method?: "pickup" | "room";
  payment?: "charge_to_room" | "pay_now" | "pay_at_restaurant";
  roomNumber?: string | null;
  note?: string;
  status: OrderStatus;
  paid: boolean;
  paidAt?: string | null;
  billedToFolio?: boolean;
  paymentRef?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
export type ApiResponse<T> = T | ApiError;