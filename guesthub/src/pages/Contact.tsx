import React, { useState } from "react";
import backgroundImage from "../assets/getintouch.webp";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface FormData {
  name: string;
  email: string;
  phone: string; 
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || `Submission failed with status: ${response.status}`);
      }
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center bg-stone-50 min-h-[600px] flex flex-col justify-center">
        <h1 className="text-5xl font-serif font-light text-stone-900 mb-6">Inquiry Received with Gratitude.</h1>
        <p className="text-xl text-stone-700 max-w-2xl mx-auto">
          **Thank you for entrusting us with your request.** A dedicated member of our **Bespoke Concierge Team** will personally review your details and contact you within 2 hours to begin curating your journey.
        </p>
        <p className="text-lg font-light text-stone-500 mt-10 italic">
          Your path to an exclusive experience at GuestHub Resort has officially begun.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section 
        className="relative py-24 md:py-40 bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-stone-900/60 backdrop-brightness-75"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-7xl md:text-9xl font-extralight mb-4 tracking-tight">Bespoke Inquiries</h1>
          <p className="text-2xl font-light max-w-4xl mx-auto">
            Connect directly with our dedicated team of personal planners. Every detail, from reservation to experience, is curated with exclusive attention.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-28 grid grid-cols-1 lg:grid-cols-5 gap-16">
        
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-4xl font-serif font-light text-stone-900 border-b-2 border-amber-600 pb-3">Exclusive Access</h2>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-stone-700 uppercase tracking-widest">Personal Concierge Desk</h3>
            <p className="text-stone-700 text-lg">
              **Direct Line (Worldwide):** <span className="font-serif text-xl text-amber-700 block mt-1">+84 236 XXX XXXX</span>
              <br />
              **Dedicated Email:** <a href="mailto:concierge@guesthub.com" className="underline text-amber-700 hover:text-stone-900 transition-colors">concierge@guesthub.com</a>
              <br />
              **Availability:** 24 Hours / 7 Days a Week
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-stone-700 uppercase tracking-widest">Our Sanctuary</h3>
            <p className="text-stone-700 text-lg">
              GuestHub Resort, <br />123 My Khe Beach Street, <br />Da Nang City, Vietnam
            </p>
            <a href="#" className="text-amber-700 font-medium hover:text-stone-900 transition-colors block mt-2">View on Map & Directions</a>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="text-xl font-semibold text-stone-700 uppercase tracking-widest">Media & Partnerships</h3>
            <p className="text-stone-700">
                For press releases, collaboration, or high-level business queries: <br />
                <a href="mailto:partners@guesthub.com" className="underline text-amber-700 hover:text-stone-900 transition-colors">partners@guesthub.com</a>
            </p>
          </div>

        </div>

        <div className="lg:col-span-3 bg-stone-50 p-8 md:p-12 shadow-xl">
          <h2 className="text-4xl font-serif font-light text-stone-900 border-b-2 border-amber-600 pb-3 mb-10">Begin Your Journey</h2>
          
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 font-medium rounded-lg shadow-sm">Submission Error: {error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-sm font-light text-stone-700 mb-2 uppercase tracking-wider">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required 
                className="w-full px-5 py-3 border-2 border-stone-300 focus:border-amber-700 focus:ring-amber-700 transition-all text-lg bg-white" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-light text-stone-700 mb-2 uppercase tracking-wider">Preferred Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required 
                className="w-full px-5 py-3 border-2 border-stone-300 focus:border-amber-700 focus:ring-amber-700 transition-all text-lg bg-white" />
            </div>
            {/* NEW PHONE FIELD ADDED HERE */}
            <div>
              <label htmlFor="phone" className="block text-sm font-light text-stone-700 mb-2 uppercase tracking-wider">Direct Phone Number (Optional but recommended for urgent requests)</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} 
                className="w-full px-5 py-3 border-2 border-stone-300 focus:border-amber-700 focus:ring-amber-700 transition-all text-lg bg-white" />
            </div>
            {/* END OF NEW PHONE FIELD */}
            <div>
              <label htmlFor="subject" className="block text-sm font-light text-stone-700 mb-2 uppercase tracking-wider">Nature of Inquiry</label>
              <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required 
                className="w-full px-5 py-3 border-2 border-stone-300 focus:border-amber-700 focus:ring-amber-700 transition-all text-lg bg-white appearance-none">
                <option value="" disabled>Select an exclusive area of interest...</option>
                <option value="Villa/Suite Reservation">Villa or Suite Reservation</option>
                <option value="Private Event/Wedding">Private Event or Wedding Planning</option>
                <option value="Bespoke Experience Design">Bespoke Experience Design (Dining, Tours)</option>
                <option value="General Concierge Request">General Concierge Request</option>
                <option value="Other">Other High-Value Inquiry</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-light text-stone-700 mb-2 uppercase tracking-wider">Detail Your Request</label>
              <textarea id="message" name="message" rows={6} value={formData.message} onChange={handleChange} required 
                className="w-full px-5 py-3 border-2 border-stone-300 focus:border-amber-700 focus:ring-amber-700 transition-all text-lg bg-white" />
            </div>
            <button type="submit" disabled={isSending} 
              className={`w-full py-4 font-semibold text-lg uppercase tracking-widest transition-all shadow-md hover:shadow-lg ${isSending 
                ? "bg-stone-300 text-stone-600 cursor-not-allowed" 
                : "bg-amber-600 text-white hover:bg-amber-700 hover:scale-[1.005]"}`}>
              {isSending ? "Dispatching to Concierge..." : "Curate My Experience"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;