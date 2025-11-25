import React, { useState, useEffect, useRef } from "react";


import buffetBg from "../../assets/Savory Sizzle pics/Buffe restaurent hero background.jpg";
import savoryBreakfast from "../../assets/Savory Sizzle pics/Savory sizzle breakfast.jpg";
import foodOverview1 from "../../assets/Food overview 1.png";
import savoryLogo from "../../assets/Savory Sizzle pics/savory sizzle logo.jpg";

import headChefRamsay from "../../assets/Savory Sizzle pics/Savory sizzle head chef.jpg";
import chefCooking from "../../assets/Savory Sizzle pics/Savory sizzle chef making food.png";
import foodOverview2 from "../../assets/Food overview 2.png";

import coffeeClassImage from "../../assets/Savory Sizzle pics/Vietnamese-Coffee-Making-Class.png";
import pizzaClassImage from "../../assets/Savory Sizzle pics/Chefmakingpizzas.jpg";


const heroImages = [
  buffetBg,
  savoryBreakfast,
  foodOverview1,
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

const SavorySizzle: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % heroImages.length
      );
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      <section
        className="relative h-[80vh] flex flex-col items-center justify-center bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl text-white font-extrabold tracking-tight drop-shadow-lg uppercase">
            Savory Sizzle
          </h1>
          <p className="text-2xl md:text-3xl italic text-white/90 font-serif mt-4">
            The World's Table, Sizzled with Vietnamese Fire.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-12">
        
        <div className="md:col-span-2 space-y-12 text-gray-700 leading-relaxed">
          
          <AnimatedSection delayIndex={0}>
            <div className="text-center pb-8">
              <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-zinc-900">
                A Global Feast, Crafted with Local Passion
              </h2>
              <span className="block w-24 h-[4px] bg-[#993366] mx-auto mt-4" />
            </div>
          </AnimatedSection>

          <AnimatedSection delayIndex={1}>
            <div className="flex flex-col items-center justify-center space-y-6">
              <img 
                src={savoryLogo} 
                alt="Savory Sizzle logo" 
                className="w-48 h-auto" 
                loading="lazy"
              />
              <p className="text-xl font-serif text-center text-gray-800 italic max-w-2xl">
                Savory Sizzle is the culinary cornerstone of our resort, a signature buffet experience that transcends expectation, where every dish is a vibrant conversation between the world’s finest flavors and the unparalleled freshness of Vietnam.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delayIndex={2}>
            <h3 className="text-3xl font-bold text-zinc-900 pt-6 border-t border-gray-200">
              The Theatre of Taste
            </h3>
            <p>
              Step into the modern, open-kitchen ambiance of Savory Sizzle, an architectural masterpiece designed to elevate the buffet experience to an interactive, theatrical event. Our commitment to culinary excellence is showcased through an array of live cooking stations, where talented chefs prepare sizzling grills, authentic noodle dishes, and global favorites right before your eyes.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delayIndex={3}>
            <figure className="my-8">
              <img 
                src={chefCooking} 
                alt="Chef preparing food at a live cooking station" 
                className="w-full h-auto shadow-2xl object-cover" 
                loading="lazy"
              />
            </figure>
          </AnimatedSection>

          <AnimatedSection delayIndex={4}>
            <p>
              From the bounty of the Vietnamese coast to the rich spices of Asia and the classic techniques of Europe, our selection is a daily celebration of diversity. We ensure premium, locally-sourced ingredients are at the heart of everything we serve, creating a truly unforgettable dining journey for breakfast, lunch, and dinner.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delayIndex={5}>
            <div className="bg-gray-100 p-8 shadow-lg border-l-4 border-[#78406f]">
              <h3 className="text-3xl font-bold text-[#78406f] mb-4 uppercase tracking-wider">
                Meet Our Head Chef: Gordon Ramsay
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img 
                      src={headChefRamsay} 
                      alt="Head Chef Gordon Ramsay" 
                      className="w-32 h-32 md:w-40 md:h-40 object-cover shadow-md flex-shrink-0"
                      loading="lazy"
                  />
                  <p className="text-gray-800 italic">
                      "My culinary journey has taken me around the globe, but Vietnam holds a special place in my heart. The vibrancy of its herbs, the complexity of its broths, and the sheer freshness of the ingredients here are unmatched. At Savory Sizzle, I've channeled this passion, challenging my team to fuse world-class buffet standards with the soulful, uncompromising flavors of Vietnam. This isn't just a buffet; it's a taste of my favorite country, perfected."
                  </p>
              </div>
              
              <p className="mt-4 text-right font-semibold text-zinc-900">
                  — Chef Gordon Ramsay
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delayIndex={6}>
            <h3 className="text-3xl font-bold text-zinc-900 pt-6 border-t border-gray-200">
              Our Signature Offerings
            </h3>

            <div className="grid sm:grid-cols-2 gap-8">
              <figure>
                  <img 
                      src={foodOverview2} 
                      alt="Delicious Asian food presentation" 
                      className="w-full h-auto shadow-md object-cover" 
                      loading="lazy"
                  />
              </figure>
              <div>
                  <ul className="space-y-4 text-lg text-gray-700">
                      <li className="font-semibold text-zinc-900">The Ultimate Breakfast Spread:</li>
                      <p className="ml-4">Start your day with an exhaustive international and Asian breakfast, featuring freshly baked pastries, made-to-order eggs, and a dedicated, authentic Vietnamese Pho station.</p>
                      <li className="font-semibold text-zinc-900">Sizzling Dinner Themed Nights:</li>
                      <p className="ml-4">Experience our nightly themed dinners, from Mediterranean Grills to Vietnamese Street Food, curated by Chef Ramsay's team to ensure a new discovery with every visit.</p>
                      <li className="font-semibold text-zinc-900">Dessert Atelier:</li>
                      <p className="ml-4">Indulge in a spectacular dessert bar offering French patisserie, local sweet delicacies, and freshly prepared ice creams.</p>
                  </ul>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delayIndex={7}>
            <div className="flex justify-center pt-8">
              <a
                href="http://localhost:5173/savory-sizzle/menu"
                className="px-8 py-4 bg-[#78406f] text-white text-lg font-semibold uppercase tracking-wider shadow-xl hover:bg-[#5f2d58] transition duration-300 transform hover:scale-105"
              >
                View Our Full Menu & Pricing
              </a>
            </div>
            
            <div className="pt-16 border-t border-gray-200 mt-12">
              <h3 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-900 text-center mb-10">
                  Our Guests Also Love
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                  
                  <div className="border border-gray-200 overflow-hidden shadow-lg group hover:shadow-xl transition duration-300">
                      <img 
                          src={pizzaClassImage} 
                          alt="Chef teaching a pizza making class" 
                          className="w-full h-48 object-cover object-center transition duration-300 group-hover:scale-105" 
                          loading="lazy"
                      />
                      <div className="p-5">
                          <h4 className="text-xl font-bold text-[#78406f] mb-2">Kids & Family Pizza Masterclass</h4>
                          <p className="text-gray-600 mb-4">
                              Join Chef Ramsay's team to learn the art of Italian pizza, from dough stretching to topping creation. A fun, hands-on experience for all ages!
                          </p>
                          <a href="http://localhost:5173/events/promotion-packages" className="text-teal-700 font-semibold hover:text-teal-900 transition flex items-center">
                              Book Your Class 
                              <i className="fa-solid fa-arrow-right ml-2 text-sm" />
                          </a>
                      </div>
                  </div>

                  <div className="border border-gray-200 overflow-hidden shadow-lg group hover:shadow-xl transition duration-300">
                      <img 
                          src={coffeeClassImage} 
                          alt="Vietnamese Coffee dripping phin" 
                          className="w-full h-48 object-cover object-center transition duration-300 group-hover:scale-105" 
                          loading="lazy"
                      />
                      <div className="p-5">
                          <h4 className="text-xl font-bold text-[#78406f] mb-2">Vietnamese Coffee Masterclass</h4>
                          <p className="text-gray-600 mb-4">
                              Master the art of the perfect 'cà phê sữa đá' (iced milk coffee) with our resident barista. A deep dive into Vietnamese bean varieties and brewing techniques.
                          </p>
                          <a href="http://localhost:5173/events/promotion-packages" className="text-teal-700 font-semibold hover:text-teal-900 transition flex items-center">
                              Learn to Brew 
                              <i className="fa-solid fa-arrow-right ml-2 text-sm" />
                          </a>
                      </div>
                  </div>
              </div>
            </div>
          </AnimatedSection>
          
        </div>

        <div className="md:col-span-1">
          <AnimatedSection delayIndex={8}>
            <div className="bg-gray-50 p-6 shadow-lg border border-gray-200 h-fit sticky top-6">
                <h3 className="text-2xl font-bold text-[#78406f] flex items-center mb-4 border-b pb-2">
                    <i className="fa-solid fa-utensils mr-2" /> Essential Information
                </h3>
                
                <h4 className="text-xl font-semibold text-zinc-900 mb-2">Opening Hours:</h4>
                <ul className="list-none space-y-1 pl-0 text-gray-700 mb-6">
                    <li><strong className="text-black">Breakfast:</strong> 06:30 – 10:30</li>
                    <li><strong className="text-black">Lunch:</strong> 12:00 – 15:00</li>
                    <li><strong className="text-black">Dinner:</strong> 18:00 – 22:00</li>
                </ul>

                <h4 className="text-xl font-semibold text-zinc-900 mb-2">Location:</h4>
                <p className="text-gray-700 mb-6">
                    <strong>Savory Sizzle Buffet Restaurent</strong>
                    <br />
                    Ground Floor, Guesthub Beach Resort
                    <br />
                    100 Võ Nguyên Giáp, Đà Nẵng, Việt Nam
                </p>

                <h4 className="text-xl font-semibold text-zinc-900 mb-2">Contact & Reservations:</h4>
                <ul className="list-none space-y-1 pl-0 text-gray-700 mb-6">
                    <li><strong className="text-black">Tel:</strong> +84 999999999</li>
                    <li><strong className="text-black">Email:</strong> <a href="mailto:tranhienELVIS@fpt.edu.vn" className="text-teal-700 hover:text-teal-900 transition">tranhienELVIS@fpt.edu.vn</a></li>
                </ul>

                <div className="mt-4">
                    <a
                        href="http://localhost:5173/contact" 
                        className="block text-center px-6 py-4 bg-pink-700 text-white font-extrabold text-xl uppercase tracking-widest shadow-2xl hover:bg-pink-800 transition transform hover:scale-[1.02]"
                    >
                        RESERVE YOUR TABLE
                    </a>
                    <p className="text-sm text-center text-gray-500 mt-3">Advanced booking highly recommended.</p>
                </div>

                <div className="mt-8">
                    <iframe
                        title="Savory Sizzle Map"
                        src="https://maps.google.com/maps?q=pullman%20danang&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        width="100%"
                        height="250"
                        className="border border-gray-200"
                        loading="lazy"
                    />
                </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default SavorySizzle;