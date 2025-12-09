import dotenv from "dotenv";
import path from "path";
import * as fs from "fs"; 


const envPaths = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env")
];

let envLoaded = false;
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    envLoaded = true;
    break;
  }
}

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import authRouter from "./routes/auth";
import roomsRouter from "./routes/rooms";
import menuRouter from "./routes/menu";
import bookingsRouter from "./routes/bookings";
import ordersRouter from "./routes/orders";
import restaurantsRouter from "./routes/restaurants";
import tableReservationsRouter from "./routes/tableReservations";
import paymentsRouter from "./routes/payments";
import adminOrdersRoutes from "./routes/admin.orders";
import adminBookingsRoutes from "./routes/admin.bookings";
import inquiryRouter from "./routes/inquiryRoutes";
import chatRouter from "./routes/chat";
import adminChatRouter from "./routes/adminChat";
import adminRoomsRouter from "./routes/admin.rooms";
import adminMenuRouter from "./routes/admin.menu";
import adminInquiryRouter from "./routes/inquiryRoutes"; 

import { fingerprint } from "./middleware/fingerprint";
import { requireAuthOptional } from "./middleware/authOptional";

import Message from "./models/Message";
import Conversation from "./models/Conversation";

const app = express();
const PORT = Number(process.env.PORT || 4000);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.set("trust proxy", 1);
app.use(fingerprint);
app.use(requireAuthOptional);

const assetsPath = path.resolve(__dirname, "../../guesthub/src/assets");
app.use("/assets", express.static(assetsPath));

const server = http.createServer(app);
export let io: Server;
io = new Server(server, { 
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true 
  } 
});

app.set("io", io);

async function getUnreadCount() {
    return Conversation.countDocuments({ status: { $in: ["open", "pending"] } });
}

io.on("connection", (socket) => {
  socket.on("user:join", ({ conversationId }) => {
    socket.join(`c:${conversationId}`);
  });

  socket.on("admin:join", ({ conversationId }) => {
    socket.join(`c:${conversationId}`);
  });

  socket.on("admin:join:notifications", () => {
    socket.join("admin-notifications");
  });

  socket.on("user:message", async ({ conversationId, text, senderId }) => {
    if (!conversationId || !text) return;
    const trimmed = String(text).trim().slice(0, 4000);
    const saved = await Message.create({
      conversationId,
      senderType: "user",
      senderId,
      text: trimmed,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { lastMessageAt: new Date(), lastMessage: trimmed, status: "open" },
    });
    
    io.to(`c:${conversationId}`).emit("message:new", saved.toObject());

    const count = await getUnreadCount();
    io.to("admin-notifications").emit("chat:new-message", { unreadCount: count });
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/menu", menuRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/table-reservations", tableReservationsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/admin/chat", adminChatRouter);
app.use("/api", inquiryRouter);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/bookings", adminBookingsRoutes);
app.use("/api/admin/rooms", adminRoomsRouter);
app.use("/api/admin/menu", adminMenuRouter);
app.use("/api/admin/inquiries", adminInquiryRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error";
  res.status(status).json({ error: message });
});

async function start() {
  const uri = process.env.MONGODB_URI;
  
  if (!envLoaded) {
    console.error("CRITICAL: Could not find .env file!");
  }

  if (!uri) {
    console.error("MONGODB_URI is missing.");
  }

  try {
    if (uri) await mongoose.connect(uri);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Failed to start server:", e);
  }
}

start();

export default app;