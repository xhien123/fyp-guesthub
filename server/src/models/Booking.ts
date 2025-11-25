import { Schema, model, Types } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    room: { type: Types.ObjectId, ref: "Room", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    adults: { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, required: true, min: 0, default: 0 },
    financials: {
      baseRatePerNight: { type: Number, required: true },
      taxRate: { type: Number, default: 0.1 },
      taxAmount: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      enhancementCost: { type: Number, default: 0 },
      totalPayable: { type: Number, required: true },
    },
    enhancements: {
      earlyCheckIn: { type: Boolean, default: false },
      lateCheckOut: { type: Boolean, default: false },
      airportTransfer: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Pending Verification",
        "Confirmed",
        "Declined",
        "Checked-in",
        "Checked-out",
        "Cancelled"
      ],
      default: "Pending",
      index: true,
    },
    notes: { type: String },
    guestName: { type: String },
    guestEmail: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ checkIn: 1 });
bookingSchema.index({ checkOut: 1 });

export default model("Booking", bookingSchema);