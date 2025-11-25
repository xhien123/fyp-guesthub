import mongoose, { Schema, Document, Model } from "mongoose";

export type InquiryStatus = "New" | "Viewed" | "Resolved";

export interface InquiryDoc extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<InquiryDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["New", "Viewed", "Resolved"], default: "New", index: true }
  },
  { timestamps: true }
);

const Inquiry: Model<InquiryDoc> = mongoose.models.Inquiry || mongoose.model<InquiryDoc>("Inquiry", InquirySchema);
export default Inquiry;
