import { Request, Response, NextFunction } from "express";
import Inquiry, { InquiryStatus } from "../models/Inquiry";

export const submitInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) return res.status(400).json({ error: "Missing required fields" });
    const created = await Inquiry.create({ name, email, subject, message });
    res.status(201).json({ ok: true, inquiry: created });
  } catch (e) {
    next(e);
  }
};

export const getInquiries = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ ok: true, inquiries: items });
  } catch (e) {
    next(e);
  }
};

export const updateInquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: InquiryStatus };
    if (!status || !["New", "Viewed", "Resolved"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const updated = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Inquiry not found" });
    res.json({ ok: true, inquiry: updated });
  } catch (e) {
    next(e);
  }
};
