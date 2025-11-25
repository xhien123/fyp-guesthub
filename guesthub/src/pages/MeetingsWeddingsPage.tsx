import React, { useEffect, useRef, useState } from 'react';


import beachWeddingImage from '../assets/beachwedding image.jpg';
import lotusBallroomImage from '../assets/lotusballroom.jpg';
import outsideEventImage from '../assets/outside event.jpg'; 
import outsidePoolEventImage from '../assets/outside pool event.jpg'; 
import grandLawnTerraceImage from '../assets/grandlawn terrace.jpg'; 

const HERO_IMAGE_URL = outsideEventImage; 
const WEDDING_IMAGE_URL = beachWeddingImage;
const MICE_IMAGE_URL = lotusBallroomImage;
const OUTDOOR_IMAGE_URL = grandLawnTerraceImage;
const CUISINE_IMAGE_URL = outsidePoolEventImage;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const VENUES = [
  { name: 'Lotus Grand Ballroom', area: '1000+', theater: '1200', banquet: '720', ceiling: '8m', description: 'Our majestic, pillar-free main ballroom, featuring custom LED screens and dedicated VIP entrance, ideal for grand conventions and lavish galas.' },
  { name: 'Magnolia (Combined)', area: '255', theater: '270', banquet: '180', ceiling: '4m', description: 'Highly versatile, divisible into three sound-proof smaller meeting rooms, perfect for concurrent breakout sessions or mid-sized seminars.' },
  { name: 'Magnolia 1', area: '85', theater: '90', banquet: '60', ceiling: '4m', description: 'A flexible mid-sized room equipped with smart control systems for executive meetings or specialized training sessions.' },
  { name: 'Orchid', area: '48', theater: '40', banquet: '30', ceiling: '3m', description: 'The perfect sophisticated setting for an intimate board meeting, private dinner, or a VIP breakout session.' },
  { name: 'Grand Lawn Terrace', area: '1500+', theater: '—', banquet: '1000', ceiling: '—', description: 'Stunning outdoor space with panoramic ocean views, providing an unparalleled backdrop for cocktails, receptions, or exhibition tents.' },
];

const STAGGER_DELAY = 150;

interface AnimatedSectionProps {
  children: React.ReactNode;
  delayIndex: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, delayIndex }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delay = delayIndex * STAGGER_DELAY;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timeout = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
          return () => clearTimeout(timeout);
        }
      },
      { rootMargin: '0px', threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    
    const safetyTimeout = setTimeout(() => setIsVisible(true), delay + 1500); 

    return () => {
      if (ref.current) observer.unobserve(ref.current);
      clearTimeout(safetyTimeout);
    };
  }, [delayIndex]);

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-out 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      {children}
    </div>
  );
};

const MeetingsWeddingsPage: React.FC = () => {
  const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      
      type: "Corporate Meeting",
      date: "",
      guests: "",
      duration: "Full Day",
      setup: "Round Tables (Banquet)",
      
      teaBreak: "AM & PM Breaks",
      dining: "International Buffet Lunch",
      beverage: "Standard Non-Alcoholic",
      
      details: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
        const formattedMessage = `
--- EVENT SPECIFICATIONS ---
Date Request: ${formData.date || "Not specified"}
Duration: ${formData.duration}
Guest Count: ${formData.guests}
Room Setup: ${formData.setup}

--- CULINARY & BANQUET REQUIREMENTS ---
Tea/Coffee Breaks: ${formData.teaBreak}
Lunch/Dinner Service: ${formData.dining}
Beverage Package: ${formData.beverage}

--- ADDITIONAL DETAILS ---
${formData.details}
        `.trim();

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone, 
            subject: `RFP Inquiry: ${formData.type} (${formData.guests} pax)`,
            message: formattedMessage
        };

        const response = await fetch(`${API_URL}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to submit inquiry");
        }

        setIsSubmitted(true);
        setFormData({ 
            name: "", email: "", phone: "", 
            type: "Corporate Meeting", date: "", guests: "", duration: "Full Day", setup: "Round Tables (Banquet)",
            teaBreak: "AM & PM Breaks", dining: "International Buffet Lunch", beverage: "Standard Non-Alcoholic", details: "" 
        });
    } catch (err) {
        setError("We encountered an issue sending your proposal. Please try again or contact our Sales Team directly.");
    } finally {
        setIsSending(false);
    }
  };

  const VenueTable = () => (
    <div className="shadow-2xl rounded-lg border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-teal-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Venue Name</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Area (m²)</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Ceiling Height</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Theater Cap.</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Banquet Cap.</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {VENUES.map((venue, index) => (
            <tr key={venue.name} className={index % 2 === 0 ? 'bg-white hover:bg-teal-50' : 'bg-gray-50 hover:bg-teal-50'}>
              <td className="px-4 py-3">
                <div className="text-sm font-bold text-gray-900">{venue.name}</div>
                <div className="text-xs text-gray-500 max-w-sm">{venue.description}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{venue.area}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{venue.ceiling || 'N/A'}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{venue.theater}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{venue.banquet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const SectionTitle = ({ children, color = 'text-gray-900' }: { children: React.ReactNode, color?: string }) => (
    <h2 className={`text-4xl lg:text-5xl font-extrabold ${color} mb-4 tracking-tight relative`}>
      <span className="relative">
        {children}
        <span className="absolute left-0 -bottom-2 h-1.5 w-16 bg-amber-500 rounded-full"></span>
      </span>
    </h2>
  );

  return (
    <div className="min-h-screen bg-white">
      <div 
        className="relative h-[85vh] w-full bg-cover bg-center flex items-center justify-center" 
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative text-center text-white p-6">
          <p className="text-xl uppercase tracking-[0.25em] mb-4 font-light text-amber-300">Signature Events by Guesthub</p>
          <h1 className="text-7xl md:text-9xl font-serif font-extrabold tracking-tight drop-shadow-2xl">
            Unforgettable Occasions
          </h1>
        </div>
      </div>

      <AnimatedSection delayIndex={0}>
        <section className="py-24 lg:py-40 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
              <div className="mb-12 lg:mb-0">
                <SectionTitle>
                  The Art of the Destination Wedding
                </SectionTitle>
                <p className="mt-8 text-xl text-gray-700 leading-relaxed">
                  Imagine exchanging vows barefoot on our pristine, private sands as the sun dips below the horizon. The Guesthub Beach Resort offers cinematic oceanfront settings and lush tropical gardens that transform your ceremony into an ethereal experience.
                </p>
                <p className="mt-4 text-xl text-gray-700 leading-relaxed">
                  Our certified wedding specialists offer full-service planning, covering everything from custom floral installations and ambient lighting design to seamless logistics for international guests. Choose from three distinct packages—the Sunset Serenity, the Imperial Gala, or a fully customized bespoke journey—to match your dream perfectly.
                </p>
                <a 
                  href="#contact"
                  className="mt-10 inline-block px-10 py-4 text-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition duration-300 shadow-2xl rounded-sm uppercase tracking-wider transform hover:scale-[1.02]"
                >
                  Request Our Digital Wedding Brochure
                </a>
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-3xl">
                <img 
                  className="object-cover w-full h-96 lg:h-[600px] transition duration-500 hover:scale-[1.03]" 
                  src={WEDDING_IMAGE_URL} 
                  alt="A beautiful beach wedding setup at sunset." 
                />
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={1}>
        <section className="py-24 lg:py-40 bg-teal-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
                  <div className="relative overflow-hidden rounded-xl shadow-3xl mb-12 lg:mb-0">
                      <img 
                        className="object-cover w-full h-96 lg:h-[600px] transition duration-500 hover:scale-[1.03]" 
                        src={OUTDOOR_IMAGE_URL} 
                        alt="Outdoor cocktail reception on a manicured lawn." 
                      />
                  </div>
                  <div>
                      <SectionTitle>
                          Al Fresco Events & Grand Receptions
                      </SectionTitle>
                      <p className="mt-8 text-xl text-gray-700 leading-relaxed">
                          For events that breathe, our Grand Lawn Terrace offers the largest uninterrupted ocean-view space in the region, perfect for high-profile product launches, spectacular gala dinners, or expansive cocktail receptions for up to 1,000 guests.
                      </p>
                      <p className="mt-4 text-xl text-gray-700 leading-relaxed">
                          We provide discreet, high-speed Wi-Fi access across all outdoor areas and can facilitate bespoke tenting and infrastructure to guarantee comfort regardless of the season. Embrace the natural beauty of the coast for your next major event.
                      </p>
                  </div>
              </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={2}>
        <section className="py-24 lg:py-40 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <SectionTitle>
                World-Class Meetings & Global Conventions
              </SectionTitle>
              <p className="mt-4 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Our facilities redefine MICE excellence. Host successful global forums and high-level incentives in our state-of-the-art Congress Centre, featuring smart technology, ergonomic design, and dedicated business concierge services. We guarantee seamless connectivity and privacy for all delegations.
              </p>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-start">
              <div className="mt-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2 border-teal-200">Our Premier Venues at a Glance</h3>
                <p className="text-lg text-gray-700 mb-8">
                  The majestic Lotus Grand Ballroom remains the pinnacle of luxury, offering over 1,000 sqm of versatile space. Every room is backed by 24/7 technical support and customizable seating layouts to suit any conference requirement.
                </p>
                <VenueTable />
              </div>
              <div className="mb-12 lg:mb-0 relative overflow-hidden rounded-xl shadow-3xl order-first lg:order-last">
                <img 
                  className="object-cover w-full h-96 lg:h-[550px] transition duration-500 hover:scale-[1.03]" 
                  src={MICE_IMAGE_URL} 
                  alt="A large, modern conference room set up in classroom style." 
                />
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
      
      <AnimatedSection delayIndex={3}>
        <section className="py-24 lg:py-40 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
              <div className="mb-12 lg:mb-0">
                <SectionTitle>
                  Gourmet Catering & Culinary Journeys
                </SectionTitle>
                <p className="mt-8 text-xl text-gray-700 leading-relaxed">
                  Elevate your event with dining curated by our Michelin-trained Executive Chef. We specialize in customized culinary experiences, from elaborate multi-course wedding banquets to healthy, focused coffee breaks for conference attendees.
                </p>
                <ul className="mt-6 space-y-3 text-lg text-gray-700 list-disc list-inside ml-4">
                    <li>Bespoke Menus: Featuring organic, locally-sourced ingredients.</li>
                    <li>International Specialization: Authentic Asian, European, and Fusion themes.</li>
                    <li>Dietary Management: Seamless accommodation for all dietary and allergen requirements.</li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-3xl">
                <img 
                  className="object-cover w-full h-96 lg:h-[550px] transition duration-500 hover:scale-[1.03]" 
                  src={CUISINE_IMAGE_URL} 
                  alt="A beautiful display of gourmet catered food." 
                />
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={4}>
        <section id="contact" className="py-24 lg:py-40 bg-stone-900">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-6xl font-extrabold text-white mb-6">
                Request for Proposal
                </h2>
                <p className="text-2xl text-stone-300 font-light">
                Tailored Solutions for Exceptional Events. 
                </p>
            </div>
            
            {isSubmitted ? (
                <div className="bg-white p-16 rounded-sm shadow-2xl border-t-8 border-amber-600 animate-in fade-in zoom-in duration-500 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-6">
                        <span className="text-amber-600 text-4xl">✨</span>
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">Request Received</h3>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Thank you for considering GuestHub Beach Resort. We have received your specifications and our Events Director will personally review your requirements.
                    </p>
                    <div className="mt-8 p-6 bg-stone-50 border border-stone-200 inline-block text-left rounded-lg">
                        <p className="text-stone-500 text-sm uppercase tracking-widest font-bold mb-2">Next Steps:</p>
                        <ul className="list-disc list-inside text-stone-700 space-y-2">
                            <li>A preliminary proposal will be sent within 24 hours.</li>
                            <li>Our culinary team will draft a sample menu based on your preferences.</li>
                        </ul>
                    </div>
                    <div className="mt-10">
                        <button 
                            onClick={() => setIsSubmitted(false)}
                            className="text-amber-700 font-semibold hover:text-amber-900 underline tracking-wide"
                        >
                            Submit another proposal
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white p-10 lg:p-14 rounded-sm shadow-4xl border-t-8 border-amber-600">
                    <div className="mb-10 pb-6 border-b border-gray-200">
                        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Planner Information</h3>
                        <p className="text-gray-500 text-sm">Please provide your direct contact details for our proposal delivery.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                            <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 bg-gray-50"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Business Email</label>
                            <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 bg-gray-50"/>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Direct Phone Number</label>
                             <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3 bg-gray-50"/>
                        </div>
                    </div>

                    <div className="mb-10 pb-6 border-b border-gray-200 mt-12">
                        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Event Logistics</h3>
                        <p className="text-gray-500 text-sm">Define the scope and scale of your occasion.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                         <div>
                            <label htmlFor="type" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Event Type</label>
                            <select id="type" name="type" required value={formData.type} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3">
                                <option>Corporate Meeting</option>
                                <option>Wedding Celebration</option>
                                <option>Gala Dinner</option>
                                <option>Product Launch</option>
                                <option>Incentive Group</option>
                                <option>Executive Board Meeting</option>
                                <option>Cocktail Reception</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preferred Date</label>
                            <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3"/>
                        </div>
                        <div>
                            <label htmlFor="guests" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Est. Attendees</label>
                            <input type="number" id="guests" name="guests" min="10" required value={formData.guests} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3"/>
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duration</label>
                            <select id="duration" name="duration" value={formData.duration} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3">
                                <option>Half Day (4 Hours)</option>
                                <option>Full Day (8 Hours)</option>
                                <option>Evening Only</option>
                                <option>Multi-Day Program</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="setup" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preferred Room Setup</label>
                            <select id="setup" name="setup" value={formData.setup} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3">
                                <option>Round Tables (Banquet Style)</option>
                                <option>Theater Style</option>
                                <option>Classroom Style</option>
                                <option>U-Shape / Hollow Square</option>
                                <option>Cocktail / Standing</option>
                                <option>Cabaret (Crescent Rounds)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-10 pb-6 border-b border-gray-200 mt-12">
                        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Culinary & Banquet Preferences</h3>
                        <p className="text-gray-500 text-sm">Curate the dining experience for your delegates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                             <label htmlFor="teaBreak" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tea/Coffee Breaks</label>
                             <select id="teaBreak" name="teaBreak" value={formData.teaBreak} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3">
                                 <option>None Required</option>
                                 <option>Welcome Coffee Only</option>
                                 <option>AM Break Only</option>
                                 <option>PM Break Only</option>
                                 <option>AM & PM Breaks</option>
                                 <option>Continuous Coffee Station</option>
                             </select>
                        </div>
                        <div>
                             <label htmlFor="dining" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Lunch / Dinner Style</label>
                             <select id="dining" name="dining" value={formData.dining} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3">
                                 <option>No Meal Required</option>
                                 <option>International Buffet</option>
                                 <option>Western Set Menu (3-Course)</option>
                                 <option>Asian Set Menu (Family Style)</option>
                                 <option>BBQ Buffet (Outdoor)</option>
                                 <option>Cocktail & Canapes</option>
                                 <option>Working Lunch Box</option>
                             </select>
                        </div>
                        <div>
                             <label htmlFor="beverage" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Beverage Package</label>
                             <select id="beverage" name="beverage" value={formData.beverage} onChange={handleChange} className="w-full border-gray-300 rounded-sm shadow-sm focus:ring-amber-500 focus:border-amber-500 p-3">
                                 <option>Standard Non-Alcoholic</option>
                                 <option>Standard (Beer & Soft Drinks)</option>
                                 <option>Premium (Wine, Beer, Soft Drinks)</option>
                                 <option>Open Bar (Spirits & Cocktails)</option>
                                 <option>Consumption Basis</option>
                             </select>
                        </div>
                    </div>

                    <div className="mt-8">
                        <label htmlFor="details" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Specific Vision & Notes</label>
                        <textarea 
                            id="details" name="details" rows={5} 
                            value={formData.details} onChange={handleChange}
                            placeholder="E.g., AV requirements, dietary restrictions, specific themes, accommodation needs..."
                            className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-3 px-4 text-lg focus:ring-amber-500 focus:border-amber-500"
                        ></textarea>
                    </div>

                    <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-end">
                        <button 
                            type="submit" 
                            disabled={isSending}
                            className={`px-10 py-4 bg-amber-600 text-white font-bold uppercase tracking-widest shadow-lg hover:bg-amber-700 transition transform hover:scale-[1.01] rounded-sm ${isSending ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isSending ? "Submitting RFP..." : "Request Proposal"}
                        </button>
                    </div>
                    
                    {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-center rounded">{error}</div>}
                </form>
            )}
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};

export default MeetingsWeddingsPage;