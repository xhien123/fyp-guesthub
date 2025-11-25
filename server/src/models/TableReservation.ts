import { Schema, model } from "mongoose";

const tableReservationSchema = new Schema({
  restaurant: { type: String, enum: ["Buffet", "Beach"], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  guests: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "19:00"
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Declined"],
    default: "Pending"
  },
}, { timestamps: true });

export default model("TableReservation", tableReservationSchema);
