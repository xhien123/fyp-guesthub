import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderItem {
  menuItemId?: Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderService = "room_delivery" | "dine_in";
export type OrderPayment = "charge_to_room" | "pay_now" | "pay_at_restaurant";
export type OrderStatus =
  | "Received"
  | "Preparing"
  | "Ready"
  | "Delivered"
  | "Completed"
  | "Cancelled"; 

export interface IOrder extends Document {
  user: Types.ObjectId | string;
  items: IOrderItem[];
  total: number;
  service: OrderService;
  payment: OrderPayment;
  roomBookingId?: Types.ObjectId | string | null;
  roomNumber?: string | null;
  note?: string;
  dineIn?: {
    date: Date;
    guests: number;
    notes?: string;
  };
  status: OrderStatus;
  paid: boolean;
  paidAt?: Date | null;
  billedToFolio?: boolean;
  paymentRef?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    service: { type: String, enum: ["room_delivery", "dine_in"], required: true },
    payment: {
      type: String,
      enum: ["charge_to_room", "pay_now", "pay_at_restaurant"],
      required: true,
    },
    roomBookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
    roomNumber: { type: String, default: null },
    note: { type: String, default: "" },
    dineIn: {
      date: { type: Date },
      guests: { type: Number, min: 1 },
      notes: { type: String },
    },
    status: {
      type: String,
      enum: ["Received", "Preparing", "Ready", "Delivered", "Completed", "Cancelled"],
      default: "Received",
    },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    billedToFolio: { type: Boolean, default: false },
    paymentRef: { type: String, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;