import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Room from "../models/Room";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface WantedRoom {
  title: string;
  type: string;
  maxOccupancy: number;
  pricePerNight: number;
  description: string;
  photos: string[];
  isAvailable: boolean;
  amenities: string[];
}


const baseURL = "/assets/room-images"; 

const WANT: WantedRoom[] = [
  
  { title: "Deluxe Ocean View", type: "Deluxe", maxOccupancy: 2, pricePerNight: 120, description: "Luxurious room with panoramic ocean view, private balcony, and premium amenities.", photos: [`${baseURL}/deluxe-ocean-view.jpg`], isAvailable: true, amenities: ["Free WiFi","Balcony","Smart TV","Mini Bar","Air Conditioning"] },
  { title: "Family Suite", type: "Suite", maxOccupancy: 4, pricePerNight: 200, description: "Spacious suite with two bedrooms, a cozy living area, and stunning resort views.", photos: [`${baseURL}/family-suite.jpg`], isAvailable: true, amenities: ["Free WiFi","Living Room","Smart TV","Mini Bar","Sofa Bed"] },
  { title: "Garden Bungalow", type: "Bungalow", maxOccupancy: 3, pricePerNight: 150, description: "Private bungalow surrounded by lush gardens — perfect for tranquility seekers.", photos: [`${baseURL}/garden-bungalow.jpg`], isAvailable: true, amenities: ["Garden View","Free WiFi","Terrace","Ceiling Fan","Mini Bar"] },
  { title: "Standard Twin", type: "Room", maxOccupancy: 2, pricePerNight: 95, description: "Modern twin room with minimalist decor and all-day comfort for travelers.", photos: [`${baseURL}/standard-twin.jpg`], isAvailable: true, amenities: ["Free WiFi","Work Desk","Kettle","Smart TV","Air Conditioning"] },
  { title: "Plunge Pool Villa", type: "Villa", maxOccupancy: 3, pricePerNight: 260, description: "Private villa with your own plunge pool, sun loungers, and elegant living space.", photos: [`${baseURL}/plunge-pool.jpg`], isAvailable: true, amenities: ["Private Pool","Terrace","Free WiFi","Sun Loungers","Outdoor Shower"] },
  { title: "Royal Suite", type: "Suite", maxOccupancy: 4, pricePerNight: 320, description: "Elegant suite with separate bedroom and living room, ideal for long stays.", photos: [`${baseURL}/royal-suite-living-room.jpg`], isAvailable: true, amenities: ["Ocean View","Bathtub","Free WiFi","Smart TV","Mini Bar"] },
  { title: "Presidential Room", type: "Suite", maxOccupancy: 4, pricePerNight: 420, description: "Top-tier suite with premium finishes, panoramic ocean views, and personalized service.", photos: [`${baseURL}/presidential-suite-living-room.jpg`], isAvailable: true, amenities: ["Panoramic View","Living Room","Bathtub","Free WiFi","Nespresso"] },
  { title: "Junior Suite", type: "Suite", maxOccupancy: 3, pricePerNight: 160, description: "Spacious Junior Suite with balcony and partial ocean view — perfect for couples.", photos: [`${baseURL}/JuniorSuite.jpg`], isAvailable: true, amenities: ["Balcony","Mini Bar","Free WiFi","Smart TV","Breakfast Included"] },
  { title: "Superior", type: "Room", maxOccupancy: 2, pricePerNight: 140, description: "Comfortable Superior room with elegant bathroom and peaceful resort view.", photos: [`${baseURL}/Superior.jpg`], isAvailable: true, amenities: ["City View","Free WiFi","Work Desk","Kettle","Air Conditioning"] },
];

async function seed() {
  const uri = process.env.MONGODB_URI as string;
  if (!uri) throw new Error("Missing MONGODB_URI in server/.env");

  await mongoose.connect(uri);
  console.log("Connected:", uri.replace(/\/\/.*@/, "//<credentials>@"));

  const del = await Room.deleteMany({});
  console.log(`Cleared rooms: deleted ${del.deletedCount}`);

  await Room.insertMany(WANT);
  const all = await Room.find().select({ title: 1 }).sort({ title: 1 }).lean();
  console.table(all);
  console.log(`Total rooms in DB: ${all.length}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("Seed error:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});