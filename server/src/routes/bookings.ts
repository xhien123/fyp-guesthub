import { Router } from "express";
import Booking from "../models/Booking";
import User from "../models/User";
import Room from "../models/Room";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const router = Router();

type RoomPriceType = { pricePerNight?: number | string; title?: string }; 

function getCapacity(room: any): number | undefined {
  return typeof room?.maxGuests === "number"
    ? room.maxGuests
    : typeof room?.maxOccupancy === "number"
    ? room.maxOccupancy
    : undefined;
}
function getAvailability(room: any): boolean | undefined {
  return typeof room?.available === "boolean"
    ? room.available
    : typeof room?.isAvailable === "boolean"
    ? room.isAvailable
    : undefined;
}

const ENHANCEMENT_PRICING = {
    earlyCheckIn: 50,
    lateCheckOut: 75,
    airportTransfer: 100,
};
const BASE_TAX_RATE = 0.1;

async function sendBookingMagicLink(email: string, link: string, name: string, roomName: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <div style="background-color: #1c1917; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">GuestHub Resort</h1>
        <span style="color: #a8a29e; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; display: block;">Reservation Concierge</span>
      </div>
      <div style="padding: 40px 30px; color: #44403c; line-height: 1.6;">
        <h2 style="font-family: 'Georgia', serif; color: #1c1917; font-size: 20px; margin-top: 0;">Verify Your Request</h2>
        <p>Dear ${name},</p>
        <p>We have received a request to reserve the <strong>${roomName}</strong>. To submit this request to our management team for final approval, please verify your email address below.</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${link}" style="background-color: #1c1917; color: #ffffff; padding: 15px 30px; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: bold; display: inline-block;">
            Verify Request
          </a>
        </div>
        <p style="font-size: 13px; color: #78716c;">Link expires in 1 hour.</p>
      </div>
      <div style="background-color: #f5f5f4; padding: 20px 30px; font-size: 12px; color: #57534e; border-top: 1px solid #e7e5e4;">
        <strong>🔒 BOOKING POLICIES</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #57534e;">
          <li style="margin-bottom: 5px;"><strong>Verification:</strong> This step ensures the security of your transaction.</li>
          <li style="margin-bottom: 5px;"><strong>Approval:</strong> Your booking is <strong>Pending</strong> until approved by management.</li>
        </ul>
        <br>
        <div style="text-align: center; opacity: 0.6; font-size: 10px;">
          &copy; ${new Date().getFullYear()} GuestHub Resort. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"GuestHub Reservations" <bookings@guesthub.com>',
    to: email,
    subject: "Action Required: Verify Booking Request",
    html: html,
  });
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { 
      roomId, checkIn, checkOut, 
      guests, adults = 1, children = 0, 
      notes, 
      enhancements = {},
    } = req.body ?? {};

    if (!roomId) return res.status(400).json({ error: "roomId is required" });
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut are required (YYYY-MM-DD)" });
    }

    const g = Number(guests);
    const a = Number(adults);
    const c = Number(children);
    if (!Number.isFinite(g) || g <= 0 || a < 1 || g !== a + c) {
      return res.status(400).json({ error: "Invalid guest count or breakdown" });
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    const numNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
    if (numNights <= 0) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    const roomData = (await Room.findById(roomId).lean()) as RoomPriceType | null; 
    
    if (!roomData) return res.status(404).json({ error: "Room not found" });
    const pricePerNight = Number(roomData.pricePerNight || 0);

    const roomSubtotal = pricePerNight * numNights;
    const taxAmount = roomSubtotal * BASE_TAX_RATE;
    
    let enhancementCost = 0;
    if ((enhancements as any).earlyCheckIn) enhancementCost += ENHANCEMENT_PRICING.earlyCheckIn;
    if ((enhancements as any).lateCheckOut) enhancementCost += ENHANCEMENT_PRICING.lateCheckOut;
    if ((enhancements as any).airportTransfer) enhancementCost += ENHANCEMENT_PRICING.airportTransfer;
    
    const totalPayable = roomSubtotal + taxAmount + enhancementCost;
    
    const booking = await Booking.create({
      room: roomId,
      checkIn,
      checkOut,
      guests: g,
      adults: a,
      children: c,
      notes,
      enhancements: enhancements,
      financials: {
        baseRatePerNight: pricePerNight,
        taxRate: BASE_TAX_RATE,
        taxAmount,
        subtotal: roomSubtotal,
        enhancementCost,
        totalPayable,
      },
      user: req.user!._id,
      status: "Pending Verification", 
    });

    const populated = await booking.populate({
      path: "room",
      select: "title description pricePerNight maxGuests maxOccupancy available isAvailable photos",
    });

    const capacity = getCapacity(populated.room);
    const available = getAvailability(populated.room);

    if (typeof capacity === "number" && g > capacity) {
      await booking.deleteOne();
      return res.status(400).json({ error: "Guests exceed room capacity" });
    }
    if (typeof available === "boolean" && !available) {
      await booking.deleteOne();
      return res.status(400).json({ error: "Room is not available" });
    }

    const token = jwt.sign(
      { bookingId: booking._id }, 
      process.env.JWT_SECRET!, 
      { expiresIn: "1h" }
    );

    const userDoc = await User.findById(req.user!._id);
    if (!userDoc) return res.status(401).json({ error: "User authentication failed" });

    let guestEmail = userDoc.email || ""; 
    let guestName = userDoc.name || "Valued Guest";
    
    try {
        const parsedNotes = JSON.parse(notes);
        if (parsedNotes.email) guestEmail = parsedNotes.email;
        if (parsedNotes.firstName && parsedNotes.lastName) guestName = `${parsedNotes.firstName} ${parsedNotes.lastName}`;
    } catch {}

    const verificationLink = `http://localhost:4000/api/bookings/verify-email?token=${token}`;
    
    await sendBookingMagicLink(guestEmail, verificationLink, guestName, roomData.title || "Residence");

    res.status(201).json({ message: "Verification sent", bookingId: booking._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create booking due to a server error." });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");

    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    
    const existing = await Booking.findById(decoded.bookingId);
    if (!existing) return res.status(400).send("Invalid booking.");

    if (existing.status !== "Pending Verification") {
       const htmlAlready = `
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
           <h1 style="color: #d97706;">Already Verified</h1>
           <p>This reservation has already been verified.</p>
           <p>You may close this window.</p>
        </div>
       `;
       return res.send(htmlAlready);
    }

    existing.status = "Pending"; 
    await existing.save();

    const htmlSuccess = `
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
         <h1 style="color: #15803d;">Verification Successful</h1>
         <p>Your booking request has been submitted to our team.</p>
         <p>Status: <strong>Pending Admin Approval</strong></p>
         <p style="font-weight: bold; margin-top: 20px;">Please close this window and return to your GuestHub tab.</p>
      </div>
    `;
    
    // Notify any listeners about the verification
    const io = req.app.get("io");
    if (io) io.emit("booking:updated", existing);

    res.send(htmlSuccess);

  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid or expired verification link.");
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const bookings = await Booking.find({ user: req.user!._id })
      .populate({
        path: "room",
        select: "title pricePerNight photos",
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

router.get("/me/active", requireAuth, async (req: AuthRequest, res) => {
  try {
    const active = await Booking.findOne({
      user: req.user!._id,
      status: { $in: ["Confirmed", "Checked-in"] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "room",
        select: "title description pricePerNight photos",
      });

    if (!active) return res.status(404).json({ error: "No active booking" });
    res.json(active);
  } catch {
    res.status(500).json({ error: "Failed to load active booking" });
  }
});

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const allBookings = await Booking.find({})
      .populate({
        path: "room",
        select: "title pricePerNight photos",
      })
      .sort({ createdAt: -1 });
    res.json(allBookings);
  } catch {
    res.status(500).json({ error: "Failed to load all bookings" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "room",
      select: "title description pricePerNight maxGuests maxOccupancy available isAvailable photos type beds",
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const ownerId =
      (booking.get && booking.get("user"))?.toString?.() ||
      (booking as any).user?.toString?.();

    if (req.user!.role !== "admin" && ownerId && ownerId !== String(req.user!._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(booking);
  } catch {
    res.status(500).json({ error: "Failed to load booking" });
  }
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Pending Verification", "Confirmed", "Checked-in", "Checked-out", "Declined", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate({
      path: "room",
      select: "title pricePerNight photos",
    });

    if (!updated) return res.status(404).json({ error: "Booking not found" });

    // --- REAL-TIME NOTIFICATION (Bookings) ---
    const io = req.app.get("io");
    if (io) {
      io.emit("booking:updated", updated);
    }
    // -----------------------------------------

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

router.patch("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const ownerId = (booking as any).user?.toString?.();
    if (ownerId !== String(req.user!._id)) {
      return res.status(403).json({ error: "Forbidden. You do not own this booking." });
    }
    
    const status = String(booking.status);
    if (status !== "Pending" && status !== "Confirmed" && status !== "Pending Verification") {
        return res.status(400).json({ error: `Cannot cancel a booking with status: ${booking.status}` });
    }

    booking.status = "Cancelled";
    await booking.save();

    // Notify admin if user cancels
    const io = req.app.get("io");
    if (io) {
      io.emit("booking:updated", booking);
    }
    
    res.json(booking);
  } catch(e) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;