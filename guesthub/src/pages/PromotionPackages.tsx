import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import BackgroundImage from "../assets/promotion package background.png";
import PizzaMasterclass from "../assets/Kids & Family Pizza Masterclass.jpg";
import CoffeeMasterclass from "../assets/coffe making class.png";
import CookingClass from "../assets/Gourmet Cooking Class.jpg";
import MixologyClass from "../assets/Mixology Masterclass.jpg";
import YogaSession from "../assets/Sunset Yoga & Meditation.jpg";
import DinnerPhoto from "../assets/Dine in photo.png";
import SnorkelingTour from "../assets/Exclusive Guided Snorkeling Tour.jpg";
import SpaPromotion from "../assets/spa promotion.png";

interface PromotionPackage {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
  linkTo: string;
  image: string;
}

const PROMOTIONS: PromotionPackage[] = [
  {
    title: "Kids & Family Pizza Masterclass",
    description: "Join Chef Ramsay's team to learn the art of Italian pizza, from dough stretching to topping creation. A fun, hands-on experience for all ages!",
    icon: "🍕",
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    linkTo: "/contact",
    image: PizzaMasterclass,
  },
  {
    title: "Vietnamese Coffee Masterclass",
    description: "Master the art of the perfect 'cà phê sữa đá' (iced milk coffee) with our resident barista. A deep dive into Vietnamese bean varieties and brewing techniques.",
    icon: "☕",
    bgColor: "bg-amber-50",
    textColor: "text-amber-800",
    linkTo: "/contact",
    image: CoffeeMasterclass,
  },
  {
    title: "Gourmet Cooking Class 🧑‍🍳",
    description: "Master local cuisine with our Executive Chef. Dive into regional techniques, discover exotic ingredients, and create a multi-course masterpiece.",
    icon: "🧑‍🍳",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    linkTo: "/contact",
    image: CookingClass,
  },
  {
    title: "Mixology Masterclass 🍸 (18+)",
    description: "Craft signature cocktails with our expert mixologist. Must be 18+.",
    icon: "🍸",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    linkTo: "/contact",
    image: MixologyClass,
  },
  {
    title: "Sunset Yoga & Meditation 🧘‍♀️",
    description: "Rejuvenate your mind and body with a complimentary session for Elite Guests.",
    icon: "🧘‍♀️",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    linkTo: "/contact",
    image: YogaSession,
  },
  {
    title: "Private Beachside Dinner 🍽️",
    description: "Special 3-course menu for a romantic evening right on the sand. A must-try",
    icon: "🍽️",
    bgColor: "bg-stone-50",
    textColor: "text-stone-800",
    linkTo: "/contact",
    image: DinnerPhoto,
  },
  {
    title: "Exclusive Guided Snorkeling Tour 🐠",
    description: "Discover hidden coves and vibrant marine life on a guided, personalized tour. All equipment provided.",
    icon: "🐠",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-800",
    linkTo: "/contact",
    image: SnorkelingTour,
  },
  {
    title: "Rejuvenating Spa Indulgence",
    description: "A customized 90-minute spa package including a signature massage and herbal facial, designed for deep relaxation and revitalization.",
    icon: "💆‍♀️",
    bgColor: "bg-pink-50",
    textColor: "text-pink-800",
    linkTo: "/contact",
    image: SpaPromotion,
  },
  {
    title: "Local Market & Culinary Tour",
    description: "Explore the vibrant local market with our chef, followed by a special hands-on preparation of traditional Da Nang street food.",
    icon: "🍲",
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    linkTo: "/contact",
    image: DinnerPhoto,
  },
];

// --- ANIMATION COMPONENT ---
const STAGGER_DELAY = 100;

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

const PromotionPackages: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <img
          src={BackgroundImage}
          alt="Promotion Packages Background"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="font-serif text-6xl md:text-8xl font-thin italic text-white tracking-tight drop-shadow-lg mb-4">
              Exclusive Packages
            </h1>
            <p className="text-xl font-light text-white max-w-3xl mx-auto drop-shadow">
              Enhance your stay with our curated selection of masterclasses, dining, and adventure experiences.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROMOTIONS.map((promo, index) => (
            <AnimatedSection key={index} delayIndex={index}>
              <div
                className={`border border-stone-200 shadow-lg transition-shadow duration-300 hover:shadow-xl overflow-hidden`}
              >
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-48 object-cover"
                />
                <div className={`p-6 ${promo.bgColor}`}>
                  <h2 className="font-serif text-2xl font-semibold mb-3 text-stone-900">
                    {promo.title}
                  </h2>
                  <p className={`text-base mb-6 ${promo.textColor}`}>
                    {promo.description}
                  </p>
                  <Link
                    to={promo.linkTo}
                    className={`inline-block w-full py-3 text-sm font-semibold uppercase tracking-widest text-center transition-colors border border-stone-900 ${
                      promo.bgColor.includes('50')
                        ? 'bg-stone-900 text-white hover:bg-stone-800'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PromotionPackages;