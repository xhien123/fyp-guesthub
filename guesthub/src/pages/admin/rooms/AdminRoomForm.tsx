import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";




interface AdminRoomFormProps {
  initial?: any; 
  onSubmit: (data: any) => Promise<void>;
  submitting?: boolean;
}

export default function AdminRoomForm({ initial, onSubmit, submitting }: AdminRoomFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    type: "Villa",
    pricePerNight: "",
    maxGuests: "", 
    beds: "",
    amenities: "",
    photos: "",
    description: "",
    available: true,
  });

  useEffect(() => {
    if (initial) {
      setFormData({
        title: initial.title || "",
        type: initial.type || "Villa",
        pricePerNight: initial.pricePerNight ? String(initial.pricePerNight) : "",
        maxGuests: initial.maxOccupancy 
          ? String(initial.maxOccupancy) 
          : (initial.maxGuests ? String(initial.maxGuests) : ""),
        beds: initial.beds ? String(initial.beds) : "",
        amenities: initial.amenities ? initial.amenities.join(", ") : "",
        photos: initial.photos ? initial.photos.join(", ") : "",
        description: initial.description || "",
        available: initial.available ?? true,
      });
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload: any = {
      title: formData.title,
      type: formData.type,
      pricePerNight: Number(formData.pricePerNight) || 0,
      maxOccupancy: Number(formData.maxGuests) || 1,
      beds: Number(formData.beds) || 1,
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

    try {
      await onSubmit(payload);
    } catch (err: any) {
      console.error("Form Submission Error:", err);
      const serverMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            "Unknown server error";
      setError(serverMessage);
      window.scrollTo(0,0);
    }
  };

  const inputClass = "w-full bg-white border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all";
  const labelClass = "block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm">
        
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-display">
              {initial ? "Edit Residence" : "New Residence"}
            </h2>
            <p className="text-stone-500 text-xs mt-1">
              Configure room details, pricing, and availability.
            </p>
          </div>
          <div className="text-xs font-mono text-stone-400 bg-stone-50 px-2 py-1 rounded">
            {initial ? `ID: ${initial._id?.slice(-6)}` : "DRAFT"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded text-sm">
              {error}
            </div>
          )}

          {/* --- NEW STATUS TOGGLE SECTION --- */}
          {/* This replaces the old small checkbox */}
          <div 
            onClick={() => setFormData({ ...formData, available: !formData.available })}
            className={`group flex items-center gap-5 p-5 border rounded-lg cursor-pointer transition-all duration-300 ${formData.available ? "bg-emerald-50/30 border-emerald-100" : "bg-stone-50 border-stone-200"}`}
          >
             {/* The Switch UI */}
             <div className={`w-14 h-7 rounded-full relative transition-colors duration-300 shadow-inner ${formData.available ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${formData.available ? 'left-8' : 'left-1'}`}></div>
             </div>

             {/* The Text Description */}
             <div>
                <div className={`text-sm font-bold uppercase tracking-wide ${formData.available ? 'text-emerald-700' : 'text-stone-500'}`}>
                   {formData.available ? "Status: Active" : "Status: Stopped"}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                   {formData.available 
                     ? "Room is visible to customers and ready for booking." 
                     : "Room is hidden on the website. Customers cannot book it."}
                </div>
             </div>
          </div>
          {/* --------------------------------- */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Room Title</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Presidential Ocean Suite"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Villa">Villa</option>
                <option value="Suite">Suite</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 p-4 bg-stone-50 rounded-md border border-stone-100">
            <div>
              <label className={labelClass}>Rate (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  className={`${inputClass} pl-6`}
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Occupancy</label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Bed Count</label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Amenities</label>
              <textarea
                rows={4}
                placeholder="WiFi, Butler Service, Private Pool..."
                className={inputClass}
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              />
              <p className="text-[10px] text-stone-400 mt-1 text-right">Comma separated</p>
            </div>
            <div>
              <label className={labelClass}>Image Links</label>
              <textarea
                rows={4}
                placeholder="https://..."
                className={`${inputClass} font-mono text-xs`}
                value={formData.photos}
                onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
              />
              <p className="text-[10px] text-stone-400 mt-1 text-right">Comma separated</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Marketing Description</label>
            <textarea
              rows={3}
              className={inputClass}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-md transition-colors flex items-center gap-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-black rounded-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Processing..." : (
                <>
                   {initial ? "Save Changes" : "Create Room"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}