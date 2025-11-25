import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import beachPic1 from '../assets/Beach front pic 1.png';
import buffetBg from '../assets/Savory Sizzle pics/Buffe restaurent hero background.jpg';
import roomsPic from '../assets/Rooms pic/rooms.webp';
import beachVillaView from '../assets/Beach villa view.jpg';

import foodOverview1 from '../assets/Food overview 1.png';
import foodOverview2 from '../assets/Food overview 2.png';
import recreational1 from '../assets/Recreational 1.jpg';
import recreational2 from '../assets/Recreational 2.png';
import recreational3 from '../assets/Recreational 3.jpg';

import dineInPhoto from '../assets/Dine in photo.png'; 
import ownerPhoto from '../assets/owner.jpg'; 

const SLIDES = [
  {
    src: beachPic1,
    alt: "GuestHub Beachfront View",
    sub: "Where Serenity Meets The Sea",
  },
  {
    src: buffetBg,
    alt: "Savory Sizzle Buffet Restaurant Background",
    sub: "Culinary Journeys",
  },
  {
    src: roomsPic,
    alt: "Luxury Villa Rooms Overview",
    sub: "Your Private Sanctuary",
  },
];

const REVIEWS = [
  {
    title: "Excellent Stay", 
    ratingImg: "https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/s5.0-20074-5.svg", 
    rating: "5.0",
    quote:
      "Our family's 1-night stay was wonderful, the staff was friendly, and my kids loved it. The pool is large and clean, and the two kids played happily and safely in the kid's club.",
    author: "Thao H",
    location: "Vietnam", 
  },
  {
    title: "Wonderful Retreat", 
    ratingImg: "https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/s5.0-20074-5.svg", 
    rating: "5.0",
    quote:
      "A wonderful retreat. The best breakfast I've ever had at a 5-star hotel. The restaurant staff is enthusiastic, and the food is diverse and delicious. A smooth experience.",
    author: "Thiet P",
    location: "Shenzhen",
  },
  {
    title: "Seamless Experience", 
    ratingImg: "https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/s4.5-20074-5.svg", 
    rating: "4.5",
    quote:
      "The GuestHub app made ordering and room requests very fast. The sea-view room is beautiful and quiet, with full amenities, and the staff provided enthusiastic support.",
    author: "Ninh Y",
    location: "Hanoi",
  },
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
        transition-all duration-1000 ease-out 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef<number | null>(null);

  const [reviewIdx, setReviewIdx] = useState(0);
  const reviewTimer = useRef<number | null>(null);

  useEffect(() => {
    heroTimer.current = window.setInterval(() => setHeroIdx((i) => (i + 1) % SLIDES.length), 6000);
    reviewTimer.current = window.setInterval(() => setReviewIdx((i) => (i + 1) % REVIEWS.length), 8000);

    return () => {
      if (heroTimer.current !== null) window.clearInterval(heroTimer.current);
      if (reviewTimer.current !== null) window.clearInterval(reviewTimer.current);
    };
  }, []);

  const majorTitleClass = "text-4xl font-serif font-light tracking-widest text-stone-900 md:text-5xl lg:text-6xl uppercase";
  const internalSectionTitleClass = "text-3xl font-serif font-light tracking-wider text-stone-900 text-center mb-6";

  return (
    <div className="bg-white text-stone-800">
      
      <div className="sr-only">
        <h1>GuestHub Beach Resort – Da Nang</h1>
      </div>

      <section aria-label="Resort slideshow" className="relative h-screen w-full overflow-hidden">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === heroIdx ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={s.src}
              alt={s.alt}
              className="w-full h-full object-cover animate-ken-burns"
              loading={i === 0 ? "eager" : "lazy"}
            />
            
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          </div>
        ))}

        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white px-4 pt-20">
          <motion.div
             key={heroIdx}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
          >
              <h2 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-6 text-amber-300 drop-shadow-md">
                {SLIDES[heroIdx].sub}
              </h2>
              <p className="text-5xl md:text-7xl lg:text-8xl font-serif font-thin italic leading-tight drop-shadow-lg">
                Beyond Expectation.
              </p>
              <p className="mt-6 text-lg md:text-xl font-light max-w-2xl mx-auto tracking-widest opacity-90 text-shadow-sm">
                Where Exclusive Serenity Meets Coastal Grandeur.
              </p>
              
              <div className="mt-10">
                <Link
                  to="/rooms"
                  className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out border border-white rounded-sm shadow-md group"
                >
                  <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-amber-600 group-hover:translate-x-0 ease">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                  <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease uppercase tracking-widest text-sm font-bold">
                    Secure Your Escape
                  </span>
                  <span className="relative invisible uppercase tracking-widest text-sm font-bold">Secure Your Escape</span>
                </Link>
              </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center space-x-3">
            {SLIDES.map((_, index) => (
                <button
                    key={index}
                    className={`h-1 rounded-full transition-all duration-500 ${
                        index === heroIdx ? 'bg-amber-400 w-12' : 'bg-white/40 w-4 hover:bg-white'
                    }`}
                    onClick={() => setHeroIdx(index)}
                    aria-label={`View slide ${index + 1}`}
                />
            ))}
        </div>

        <div className="absolute bottom-8 right-8 z-30 hidden md:flex flex-col items-center animate-bounce">
            <span className="text-[10px] uppercase tracking-widest text-white/80 mb-2">Scroll</span>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      <AnimatedSection delayIndex={0}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h2 className="text-xl font-semibold tracking-[0.3em] uppercase text-amber-600 mb-4">
            The Legacy of Ambition
          </h2>
          <p className="text-4xl font-serif font-light italic text-stone-900 leading-snug max-w-4xl mx-auto mb-16">
            GuestHub Beach Resort is not merely a place of rest, but the realization of a lifelong devotion to hospitality and service.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              <figure className="md:col-span-1 md:order-2">
                <div className="relative">
                    <div className="absolute inset-0 border border-amber-500 translate-x-4 translate-y-4 rounded-full opacity-50"></div>
                    <img
                        src={ownerPhoto}
                        alt="Portrait of GuestHub owner Tran Xuan Hien 'Elvis'"
                        className="relative z-10 w-full h-auto object-cover rounded-full shadow-xl aspect-square mx-auto md:max-w-xs transition-all duration-700"
                        loading="lazy"
                    />
                </div>
                <figcaption className="mt-8 text-lg font-serif font-semibold text-stone-900">
                    Tran Xuan Hien ('Elvis'), Founder
                </figcaption>
                <p className="text-sm text-stone-500 tracking-wider uppercase mt-1">Visionary & Master of Hospitality</p>
              </figure>

              <div className="md:col-span-2 md:order-1 text-left text-lg text-stone-600 leading-loose space-y-6 font-light">
                <p>
                    The foundation of this exclusive estate began with the vision of Tran Xuan Hien (known to friends as 'Elvis'). Despite his family's wish for him to pursue the steady path of IT, Elvis carried an intense, private passion for the art of hospitality.
                </p>
                <p>
                    Determined to master both worlds, he dedicated his youth to dual pursuits: studying Information Technology by day while working as a F&B attendant by night. It was here, serving guests directly, that he learned the true meaning of anticipatory service and refined his own philosophy on luxury.
                </p>
                <p>
                    The dream of creating a six-star coastal sanctuary, where technology seamlessly supported personalized human interaction, seemed distant until fate intervened. A surprising lottery win provided the seed capital, allowing Elvis to channel his life savings and dual expertise into founding GuestHub Beach Resort—a place where the warmth of Vietnamese service meets digital precision.
                </p>
              </div>
          </div>
        </section>
      </AnimatedSection>
      
      <hr className="max-w-7xl mx-auto border-stone-200" />
      
      <AnimatedSection delayIndex={1}>
        <section className="bg-white py-16">
          <ul className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <li className="py-4 group">
              <div className="w-16 h-16 mx-auto border border-stone-200 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 transition-colors">
                  <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-lg font-bold tracking-widest uppercase text-stone-900 mb-2">Anticipatory Service</h3>
              <p className="text-stone-500 font-light">Our commitment to 6-star tailored comfort, predicting needs before they arise.</p>
            </li>
            <li className="py-4 group">
              <div className="w-16 h-16 mx-auto border border-stone-200 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 transition-colors">
                  <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-lg font-bold tracking-widest uppercase text-stone-900 mb-2">Prime Oceanfront</h3>
              <p className="text-stone-500 font-light">Exclusive location on Vo Nguyen Giap with private beach access.</p>
            </li>
            <li className="py-4 group">
              <div className="w-16 h-16 mx-auto border border-stone-200 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 transition-colors">
                  <span className="text-2xl">🛏️</span>
              </div>
              <h3 className="text-lg font-bold tracking-widest uppercase text-stone-900 mb-2">Artisan Design</h3>
              <p className="text-stone-500 font-light">Modern architecture meets authentic local accents and sustainable materials.</p>
            </li>
          </ul>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={2}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-16">
            <h2 className={majorTitleClass}>Our Commitment to Excellence</h2>
            <p className="text-lg font-light text-stone-600 mt-6 max-w-3xl mx-auto">
              GuestHub Beach Resort is where modern luxury meets the timeless beauty of the Vietnamese coast. Every detail is crafted for your utmost comfort and seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              
              <h4 className={internalSectionTitleClass + " text-left"}>SEASIDE SANCTUARY</h4>
              <figure className="my-8 relative group overflow-hidden">
                <img
                  className="w-full rounded-sm shadow-xl transition-transform duration-1000 group-hover:scale-105"
                  src={beachVillaView}
                  alt="View from a beach villa room at Guesthub"
                  loading="lazy"
                />
              </figure>

              <p className="my-6 leading-loose text-lg font-light text-stone-700">
                Every room, from Deluxe Sea View to Family Suites, is a private connection to nature and the fresh sea breeze. Our rooms are designed for quiet contemplation. Daily gourmet breakfast, in-room dining, and dedicated online support ensure your vacation is effortlessly seamless.
              </p>

              <h4 className={`${internalSectionTitleClass} mt-20 text-left`}>CULINARY ARTISTRY</h4>
              <p className="my-6 leading-loose text-lg font-light text-stone-700">
                Delight in Vietnamese and International cuisine prepared by master chefs. Sip curated cocktails at our Lounge or enjoy the convenience of precision room service via the GuestHub platform.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                <figure className="relative overflow-hidden">
                  <img
                    className="w-full h-64 rounded-sm object-cover shadow-md hover:opacity-90 transition-opacity"
                    src={foodOverview1}
                    alt="Vietnamese and International cuisine plate"
                    loading="lazy"
                  />
                </figure>
                <figure className="relative overflow-hidden">
                  <img
                    className="w-full h-64 rounded-sm object-cover shadow-md hover:opacity-90 transition-opacity"
                    src={foodOverview2}
                    alt="Restaurant cocktail and lounge area"
                    loading="lazy"
                  />
                </figure>
              </div>
              <Link to="/restaurants" className="inline-flex items-center text-amber-700 font-serif text-lg hover:text-amber-900 transition-colors mt-4 group">
                Explore Our Menus 
                <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>

            <aside className="lg:col-span-4 space-y-12">
              <div className="bg-stone-50 p-8 border border-stone-100 shadow-lg">
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 tracking-widest uppercase border-b border-stone-200 pb-4">
                  Your Concierge
                </h3>
                <p className="text-stone-600 mb-6 font-light">
                  GuestHub Beach Resort<br />
                  101 Vo Nguyen Giap, Ngu Hanh Son, Da Nang.
                </p>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs uppercase text-stone-400 tracking-wider">Reservation Line</span>
                    <a href="tel:0999999999" className="text-lg font-serif text-stone-900 hover:text-amber-600 transition-colors">
                      +84 999 999 999
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs uppercase text-stone-400 tracking-wider">Email Enquiries</span>
                    <a href="mailto:tranelvishiengcd220415@fpt.edu.vn" className="text-sm font-medium text-stone-900 hover:text-amber-600 transition-colors break-all">
                      tranelvishiengcd220415@fpt.edu.vn
                    </a>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/place/100+%C4%90%C6%B0%E1%BB%9Dng+v%C3%B5+nguy%C3%AAn+gi%C3%A1p,+Ph%C6%B0%E1%BB%9Bc+M%E1%BB%B9,+S%C6%A1n+Tr%C3%A0,+%C4%90%C3%A0+N%E1%BA%B5ng+550000,+Vietnam/@16.0795877,108.2435536,17z/data=!3m1!4b1!4m6!3m5!1s0x3142178c31cf210b:0x13879f269967ee46!8m2!3d16.0795826!4d108.2461285!16s%2Fg%2F11w7ghzzbs!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-8 text-center py-3 border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors"
                >
                  Get Directions
                </a>
              </div>

              <div className="bg-stone-900 text-white p-8 shadow-2xl text-center">
                 <h4 className="font-serif text-2xl italic mb-2">Limited Offer</h4>
                 <p className="text-stone-400 text-sm mb-6">Experience the definition of luxury.</p>
                 <Link to="/book" className="block w-full py-3 bg-amber-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors">
                   Book Your Stay
                 </Link>
              </div>
            </aside>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={3}>
        <section className="bg-stone-100 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <h4 className="text-3xl font-serif font-light text-stone-900 uppercase tracking-wider">Amenities & Recreation</h4>
                <p className="text-stone-500 font-light max-w-md text-right mt-4 md:mt-0">Curated experiences designed to rejuvenate the mind, body, and spirit.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              <figure className="relative group overflow-hidden h-96">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={recreational1}
                  alt="Spa or relaxation area"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <figcaption className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-serif text-white tracking-widest uppercase border-b border-transparent group-hover:border-amber-400 pb-2 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">The Sanctuary Spa</span>
                </figcaption>
              </figure>
              <figure className="relative group overflow-hidden h-96">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={recreational2}
                  alt="Kids' play area"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <figcaption className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-serif text-white tracking-widest uppercase border-b border-transparent group-hover:border-amber-400 pb-2 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">The Explorer Club</span>
                </figcaption>
              </figure>
              <figure className="relative group overflow-hidden h-96">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={recreational3}
                  alt="Fitness room or gym equipment"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <figcaption className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-serif text-white tracking-widest uppercase border-b border-transparent group-hover:border-amber-400 pb-2 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">Signature Fitness</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={4}>
        <section className="bg-white">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                title: "Refined Dining",
                desc:
                  "Diverse and creative cuisine at 2 restaurants and 2 bars. Enjoy in open spaces or in your private villa.",
                to: "/restaurants/savory-sizzle",
                img: "https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/86/2025/06/23095408/Azure-Beach-Bar_Couple-Lifestyle-2_Pullman-Danang-Beach-Resort_5-Star-Hotels_Accor-Hotels-700x700.jpg",
              },
              {
                title: "Grand Receptions",
                desc:
                  "Flexible indoor and outdoor venues with modern equipment. Suitable for MICE and exclusive themed parties.",
                to: "/events/meetings-weddings",
                img: "https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/86/2025/06/23095058/Lotus-Ballroom_Banquet-Setup_Pullman-Danang-Beach-Resort_5-Star-Hotels_Accor-Hotels-700x700.jpg",
              },
              {
                title: "In-Villa Dining", 
                desc:
                  "Enjoy a diverse menu right in your room, with prompt and exceptionally attentive service.",
                to: "/restaurants", 
                img: dineInPhoto, 
              },
            ].map((i) => (
              <li 
                key={i.title} 
                className="relative group overflow-hidden aspect-[4/3] flex flex-col justify-end text-center" 
                style={{ backgroundImage: `url(${i.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-stone-900/70 transition-colors duration-500" />
                <div className="relative z-10 p-10 text-white w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="block text-2xl font-serif font-light tracking-widest mb-2 uppercase">
                    {i.title}
                  </span>
                  <hr className="mx-auto my-4 border-amber-500 w-0 group-hover:w-12 transition-all duration-500" />
                  <p className="text-sm font-thin line-clamp-3 mb-8 mx-auto max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{i.desc}</p>
                  <Link
                    to={i.to}
                    className="inline-block text-xs font-bold uppercase tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-stone-900 transition-colors duration-300"
                  >
                    Discover More
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </AnimatedSection>
      
      <AnimatedSection delayIndex={5}>
        <section className="relative w-full bg-stone-50 py-24"> 
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center"> 
            <h2 className={internalSectionTitleClass}>TESTIMONIALS</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-16"></div>
            
              <div className="relative overflow-hidden w-full h-full max-w-4xl mx-auto">
                  <div 
                      className="flex transition-transform duration-1000 ease-in-out" 
                      style={{ 
                        transform: `translateX(-${reviewIdx * (100 / REVIEWS.length)}%)`, 
                        width: `${REVIEWS.length * 100}%` 
                      }}
                  >
                      {REVIEWS.map((r, i) => (
                          <div key={i} className="flex-shrink-0 px-4" style={{ width: `${100 / REVIEWS.length}%` }}> 
                              <div className="text-center"> 
                                  <p className="text-6xl font-serif text-stone-300 mb-4">“</p>
                                  <p className="text-2xl md:text-3xl italic font-serif text-stone-800 font-light leading-relaxed mb-8">
                                      {r.quote}
                                  </p>
                                  <div className="flex flex-col items-center">
                                      <img
                                          src={r.ratingImg} 
                                          alt={`Tripadvisor rating ${r.rating} stars`}
                                          className="h-6 mb-3"
                                      />
                                      <p className="font-bold text-stone-900 uppercase tracking-widest text-sm">{r.author}</p>
                                      <p className="text-xs text-stone-500 mt-1 uppercase tracking-wide">{r.location}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              
              <div className="mt-12 flex justify-center space-x-3">
                  {REVIEWS.map((_, index) => (
                      <button
                          key={index}
                          className={`h-1 transition-all duration-500 ${
                              index === reviewIdx ? "bg-stone-800 w-12" : "bg-stone-300 w-6 hover:bg-stone-400"
                          }`}
                          onClick={() => setReviewIdx(index)}
                          aria-label={`View review ${index + 1}`}
                      />
                  ))}
              </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={6}>
        <section id="location" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <h3 className="text-4xl font-serif font-light text-stone-900 mb-6 uppercase tracking-wide">Destination</h3>
                <p className="text-lg font-light text-stone-600 mb-8 leading-relaxed">
                  Located on the pristine sands of Danang Beach, voted one of the six most attractive beaches on the planet by Forbes. A strategic gateway to three UNESCO World Heritage Sites.
                </p>
                <ul className="space-y-4 text-stone-800 font-light mb-10">
                    <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-500 mr-4"></span>
                        Da Nang International Airport (15 min)
                    </li>
                    <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-500 mr-4"></span>
                        Hoi An Ancient Town (30 min)
                    </li>
                    <li className="flex items-center">
                        <span className="w-2 h-2 bg-amber-500 mr-4"></span>
                        My Son Sanctuary (60 min)
                    </li>
                </ul>
                <a 
                  href="https://www.google.com/maps/place/100+V%C3%B5+Nguy%C3%AAn+Gi%C3%A1p,+An+H%E1%BA%A3i,+S%C6%A1n+Tr%C3%A0,+%C4%90%C3%A0+N%E1%BA%B5ng+550000,+Vietnam/@16.0795877,108.2435536,17z/data=!3m1!4b1!4m6!3m5!1s0x3142178c31cf210b:0x13879f269967ee46!8m2!3d16.0795826!4d108.2461285!16s%2Fg%2F11w7ghzzbs?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 border border-stone-900 text-stone-900 text-sm font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors"
                >
                  Explore Map
                </a>
            </div>
            <div className="relative h-[500px] w-full">
                 <iframe
                    title="Resort map"
                    className="w-full h-full border-0 shadow-2xl transition-all duration-1000"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=108.242%2C16.035%2C108.258%2C16.046&layer=mapnik"
                    loading="lazy"
                  />
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delayIndex={7}>
        <section className="bg-stone-900 py-16 border-t border-stone-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-8 md:mb-0">
                <h4 className="text-2xl font-serif text-white tracking-widest uppercase mb-2">GuestHub Resort</h4>
                <p className="text-stone-500 font-light">Da Nang, Vietnam</p>
            </div>
            <div className="flex gap-8">
              {[
                { alt: "facebook", href: "https://facebook.com", icon: "FB" },
                { alt: "instagram", href: "https://instagram.com", icon: "IG" },
                { alt: "youtube", href: "https://youtube.com", icon: "YT" },
              ].map((s) => (
                <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-white transition-colors font-serif text-lg">
                   {s.icon}
                </a>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};

export default Home;