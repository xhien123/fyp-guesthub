import React, { useState, useEffect, useRef } from "react";


import vivePoolView from "../../assets/viveonceane pics/vive pool view.jpg";
import viveOceaneHeroBg from "../../assets/viveonceane pics/Vive Oceane Hero background.jpg";
import viveBeachBar from "../../assets/viveonceane pics/vive beach bar.jpg";
import viveBeachBar2 from "../../assets/viveonceane pics/vive beach bar 2.jpg";
import dineInPhoto from "../../assets/Dine in photo.png";
import viveLogo from "../../assets/viveonceane pics/Vive logo.jpg";

const heroImages = [
  viveOceaneHeroBg,
  vivePoolView,
  viveBeachBar,
];

// --- ANIMATION COMPONENT ---
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
// --- END ANIMATION COMPONENT ---

const ViveOceane = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % heroImages.length
      );
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const googleMapsUrl = "https://www.google.com/maps/place/100+%C4%90%C6%B0%E1%BB%9Dng+v%C3%B5+nguy%C3%AAn+gi%C3%A1p,+Ph%C6%B0%E1%BB%9Bc+M%E1%BB%B9,+S%C6%A1n+Tr%C3%A0,+%C4%90%C3%A0+N%E1%BA%B5ng+550000,+Vietnam/@16.0530432,108.2458112,14z/data=!4m6!3m5!1s0x3142178c31cf210b:0x13879f269967ee46!8m2!3d16.0795826!4d108.2461285!16s%2Fg%2F11w7ghzzbs!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MTEwNS4wIKXMDSoASAFQAw%3D%3D";
  const mapEmbedUrl = "https://maps.google.com/maps?q=100+V%C3%B5+Nguy%C3%AAn+Gi%C3%A1p,+%C4%90%C3%A0+N%E1%BA%B5ng&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      
      <section
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-5xl md:text-6xl text-white font-extrabold tracking-wide drop-shadow-lg uppercase">
          Vive Océane
        </h1>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-10">
        
        <div className="md:col-span-2 space-y-8 text-gray-700 leading-relaxed">
          
          <AnimatedSection delayIndex={0}>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-zinc-900">
                VIVE OCÉANE
              </h2>
              <span className="block w-16 h-[3px] bg-zinc-900 mx-auto mt-3" />
            </div>
          </AnimatedSection>

          <AnimatedSection delayIndex={1}>
            <div className="flex justify-center">
              <img src={viveLogo} alt="Vive Océane logo" className="w-56 h-auto" />
            </div>
          </AnimatedSection>

          <AnimatedSection delayIndex={2}>
            <p className="italic text-lg text-center text-gray-800 font-serif">
              Vive Océane is the ultimate beach club for lovers of sun, sea, and contemporary luxury. It is an inspiring playground where our talented chefs infuse classic Western dishes with the vibrant flavors of Vietnam.
            </p>
          </AnimatedSection>

          <AnimatedSection delayIndex={3}>
            <h3 className="text-xl font-semibold text-[#993366]">Opening Hours:</h3>
            <ul className="list-disc pl-6 text-[#993366]">
              <li>Lunch & Dinner: 11:00 – 22:00 (Last order 21:30)</li>
              <li>Sunset Specials – Happy Hour: 17:00 – 19:00</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection delayIndex={4}>
            <div className="flex justify-center">
              <a
                href="http://localhost:5173/vive-oceane/menu"
                className="px-6 py-3 bg-[#78406f] text-white font-semibold uppercase hover:bg-[#5f2d58] transition"
              >
                View Menu
              </a>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delayIndex={5}>
            <figure className="my-8">
              <img 
                src={viveBeachBar2} 
                alt="Vive Océane Beach Bar Seating" 
                className="w-full h-auto shadow-xl object-cover" 
                loading="lazy"
              />
            </figure>
          </AnimatedSection>

          <AnimatedSection delayIndex={6}>
            <p>
              Nestled on the soft white sands of the Da Nang coastline, next to the shimmering pool, the Vive Océane space is ready to help you savor every moment. The beach bar is where you can sink your bare feet into the sand or relax on a stylish beanbag with a refreshing cocktail.
            </p>
            <p>
              Our indoor area offers a cool retreat with a modern, open-plan style. If the inviting sea breeze calls to you, choose a seat under a shaded coconut awning or a stylish canopy sofa to sip your favorite drink.
            </p>
            
            <h3 className="text-2xl font-bold text-zinc-900 mt-10">
              A Culinary Journey Inspired by the Ocean
            </h3>
          </AnimatedSection>
          
          <AnimatedSection delayIndex={7}>
            <figure className="my-8">
              <img 
                src={dineInPhoto} 
                alt="Vive Océane Signature Dish" 
                className="w-full h-auto shadow-xl object-cover" 
                loading="lazy"
              />
            </figure>
          </AnimatedSection>

          <AnimatedSection delayIndex={8}>
            <p>
              Drawing endless inspiration from the whispering East Sea, the menu at Vive Océane unfolds as a captivating culinary journey. Like discovering hidden treasures beneath the waves, each page of the menu invites you to explore bold, improvisational flavors. Indulge in a harmonious blend of Western European flair with unique local spices and ingredients, accompanied by our collection of creative cocktails, mocktails, and refreshing smoothies.
            </p>
            
            <p>
              Vive Océane Beach Lounge offers ultimate convenience with our integrated online ordering system. Whether you are lounging on a sunbed, swaying in a hammock, or chatting in your favorite spot, feel free to order what you like without having to move—unless it is for a celebratory toast!
            </p>
            
            <div className="py-4">
              <p className="text-2xl italic font-serif text-center text-zinc-900 font-medium">
                Savor the coast. Live the moment.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delayIndex={9}>
            <p className="text-center font-bold text-lg text-[#993366] pt-4">
              DAILY HAPPY HOUR: SUNSET SPECIALS FROM 17:00 – 19:00
            </p>
            <p className="text-center">
              Sip specially crafted drinks at tempting prices as the sun dips below the horizon.
            </p>
          </AnimatedSection>
        </div>

        
        <div className="bg-gray-50 p-6 shadow-sm border border-gray-200 h-fit sticky top-6">
          <AnimatedSection delayIndex={10}>
            <h3 className="text-xl font-bold text-[#78406f] flex items-center mb-3">
              <i className="fa-solid fa-location-dot mr-2" /> Location
            </h3>
            <p className="text-gray-700">
              <strong>VIVE OCÉANE beach lounge</strong>
              <br />
              Beach Terrace, Guesthub Beach Resort
              <br />
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:text-teal-800 underline">
                100 Võ Nguyên Giáp, Đà Nẵng, Việt Nam
              </a>
            </p>
            
            <div className="mt-4">
              <iframe
                title="Vive Océane Map"
                src={mapEmbedUrl}
                width="100%"
                height="250"
                className="border border-gray-200"
                loading="lazy"
              />
            </div>

            <h3 className="text-xl font-bold text-[#78406f] flex items-center mb-3 mt-6">
              <i className="fa-solid fa-phone mr-2" /> Contact & Reservations
            </h3>
            <p className="text-gray-700">
              <strong>Tel:</strong> +84 999999999
              <br />
              <strong>Email:</strong>{" "}
              <a href="mailto:tranhienELVIS@fpt.edu.vn" className="text-teal-700 hover:text-teal-800">
                tranhienELVIS@fpt.edu.vn
              </a>
            </p>
            
            <div className="mt-8">
              <a
                href="http://localhost:5173/contact" 
                className="block text-center px-6 py-3 bg-pink-700 text-white font-semibold uppercase hover:bg-pink-800 transition"
              >
                BOOK A TABLE NOW
              </a>
              <p className="text-xs text-center text-gray-500 mt-2">Contact us for large party reservations.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default ViveOceane;