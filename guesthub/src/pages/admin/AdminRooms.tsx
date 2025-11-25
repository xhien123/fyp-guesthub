import React, { useEffect, useState } from "react";
import {
  adminListRooms,
  adminCreateRoom,
  adminUpdateRoom,
  adminDeleteRoom,
} from "../../lib/api";

// --- Minimalist Icons ---
const IconPlus = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconTrash = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const IconEdit = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const IconX = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// --- FORM CONFIG ---
const INITIAL_FORM_STATE = {
  title: "",
  type: "Villa",
  pricePerNight: "",
  maxGuests: "",
  beds: "",
  amenities: "",
  photos: "",
  description: "",
  available: true,
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal/Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Fetch rooms on load
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await adminListRooms();
      setRooms(data);
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the modal for CREATE
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
    setError("");
  };

  // Handle opening the modal for EDIT
  const handleOpenEdit = (room: any) => {
    setEditingId(room._id);
    setFormData({
      title: room.title,
      type: room.type,
      pricePerNight: String(room.pricePerNight),
      // FIX: Map DB 'maxOccupancy' to Form 'maxGuests'
      maxGuests: room.maxOccupancy 
        ? String(room.maxOccupancy) 
        : (room.maxGuests ? String(room.maxGuests) : ""),
      beds: String(room.beds),
      amenities: room.amenities ? room.amenities.join(", ") : "",
      photos: room.photos ? room.photos.join(", ") : "",
      description: room.description || "",
      available: room.available,
    });
    setIsModalOpen(true);
    setError("");
  };

  // --- SAVE LOGIC ---
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // FIX: Use 'any' to bypass TS error regarding maxOccupancy
      const payload: any = {
        title: formData.title,
        type: formData.type,
        pricePerNight: Number(formData.pricePerNight),
        // FIX: Map Form 'maxGuests' to DB 'maxOccupancy'
        maxOccupancy: Number(formData.maxGuests),
        beds: Number(formData.beds),
        amenities: formData.amenities
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        photos: formData.photos
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        description: formData.description,
        available: formData.available,
      };

      if (!payload.title || payload.pricePerNight <= 0) {
        setError("Please provide a title and a valid price.");
        return;
      }

      if (editingId) {
        await adminUpdateRoom(editingId, payload);
      } else {
        await adminCreateRoom(payload);
      }

      setIsModalOpen(false);
      loadRooms(); 
    } catch (err: any) {
      console.error("Error saving room:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || "Failed to save.";
      setError(serverMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await adminDeleteRoom(id);
      loadRooms();
    } catch (err) {
      console.error(err);
    }
  };

  // Minimalist Input Style
  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage resort accommodations and availability.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5"
        >
          <IconPlus size={20} /> Add Residence
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Syncing database...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Room Image Preview */}
              <div className="h-52 bg-slate-100 relative overflow-hidden">
                {room.photos && room.photos.length > 0 ? (
                  <img
                    src={room.photos[0]}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300 text-sm font-medium">
                    No Image Preview
                  </div>
                )}
                
                {/* Status Badge (Red/Green) */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${
                  room.available 
                    ? "bg-emerald-400 text-white border-emerald-500" 
                    : "bg-rose-500 text-white border-rose-600"
                }`}>
                  {room.available ? "Active" : "Stopped"}
                </div>
              </div>

              {/* Room Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{room.title}</h3>
                  <span className="text-slate-900 font-semibold bg-slate-50 px-2 py-1 rounded text-sm border border-slate-100">
                    ${room.pricePerNight}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-6">
                   <span className="flex items-center gap-1">
                     Guests: <span className="text-slate-900">{room.maxOccupancy || room.maxGuests || 0}</span>
                   </span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <span className="flex items-center gap-1">
                     Beds: <span className="text-slate-900">{room.beds || 0}</span>
                   </span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <span className="text-slate-900">{room.type}</span>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <IconEdit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <IconTrash size={18} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                    {editingId ? "Edit Residence" : "New Residence"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Configure pricing, capacity and visibility.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                >
                  <IconX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-6">
                
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Ocean Suite"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Type</label>
                    <select
                      className={inputClass}
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="Villa">Villa</option>
                      <option value="Suite">Suite</option>
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100/50">
                  <div>
                    <label className={labelClass}>Price ($)</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={formData.pricePerNight}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerNight: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Capacity</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={formData.maxGuests}
                      onChange={(e) =>
                        setFormData({ ...formData, maxGuests: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Beds</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={formData.beds}
                      onChange={(e) =>
                        setFormData({ ...formData, beds: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setFormData({...formData, available: !formData.available})}>
                  <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.available ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.available ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <div>
                      <div className="text-sm font-bold text-slate-900">Accepting Bookings</div>
                      <div className="text-xs text-slate-500">{formData.available ? "Room is visible on website" : "Room is hidden/under maintenance"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className={labelClass}>Amenities</label>
                    <textarea
                        rows={3}
                        placeholder="WiFi, Pool, AC..."
                        className={inputClass}
                        value={formData.amenities}
                        onChange={(e) =>
                        setFormData({ ...formData, amenities: e.target.value })
                        }
                    />
                    </div>
                    <div>
                    <label className={labelClass}>Photo URLs</label>
                    <textarea
                        rows={3}
                        placeholder="https://..."
                        className={`${inputClass} font-mono text-xs`}
                        value={formData.photos}
                        onChange={(e) =>
                        setFormData({ ...formData, photos: e.target.value })
                        }
                    />
                    </div>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5"
                  >
                    <IconCheck size={18} />
                    {editingId ? "Update Room" : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}