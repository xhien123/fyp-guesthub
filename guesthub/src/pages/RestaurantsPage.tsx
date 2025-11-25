import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';


import vive1 from '../assets/viveonceane pics/vive seafood.jpg';
import vive2 from '../assets/viveonceane pics/vive local seafood cautch.jpg';
import vive3 from '../assets/viveonceane pics/Vive buffet out side.avif';
import vive4 from '../assets/viveonceane pics/vive grill buffe outside.jpg';

import savory1 from '../assets/Savory Sizzle pics/Savory sizzle breakfast.jpg';
import savory2 from '../assets/Savory Sizzle pics/Chefmakingpizzas.jpg';
import savory3 from '../assets/Food overview 1.png';
import savory4 from '../assets/Food overview 2.png';


import inRoomDiningImage from '../assets/Inroomdining.jpg';


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

const ImageCarousel: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="h-96 w-full relative">
      {images.map((imgSrc, index) => (
        <img
          key={index}
          src={imgSrc}
          alt={`${alt} - Slide ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-[1.03]'
          }`}
        />
      ))}
    </div>
  );
};

const InRoomDiningCTA = () => {
  return (
    <div className='mt-24'>
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-0 sm:p-0 lg:p-0">
        <div className="lg:flex lg:items-center">
          
          <div className="lg:w-1/2">
            <img 
              src={inRoomDiningImage} 
              alt="In-Room Dining Service" 
              className="h-96 w-full object-cover" 
            />
          </div>
          
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 text-center lg:text-left">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Prefer In-Room Dining?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Our full room service menu is available 24/7. Enjoy our signature dishes in the comfort of your suite.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center rounded-full border-2 border-teal-600 px-10 py-3 text-lg font-semibold text-teal-600 transition duration-300 hover:bg-teal-600 hover:text-white shadow-md"
            >
              View 24/7 Room Service Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const restaurants = [
  {
    id: 'vive-oceane',
    name: 'Vive Océane',
    tagline: 'Refined Coastal Cuisine',
    description: 'Experience the best of the sea at our signature ocean-view restaurant. Serving exquisite à la carte dishes focused on local, sustainable seafood, prepared with French techniques and Asian flair. An unforgettable fine dining experience.',
    cuisine: 'Seafood, French/Asian Fusion',
    dressCode: 'Smart Casual',
    linkType: 'View Menu', 
    actionPath: '/vive-oceane/menu', 
    images: [vive1, vive2, vive3, vive4],
  },
  {
    id: 'savory-sizzle',
    name: 'Savory Sizzle',
    tagline: 'Interactive International Buffet',
    description: 'A vibrant, all-day dining experience featuring live cooking stations and an extensive international buffet. Enjoy diverse flavors from around the globe, perfect for family meals and relaxed dining in a lively setting.',
    cuisine: 'International Buffet, Live Stations',
    dressCode: 'Resort Casual',
    linkType: 'View Menu',
    actionPath: '/savory-sizzle/menu',
    images: [savory1, savory2, savory3, savory4],
  },
];

const RestaurantsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <AnimatedSection delayIndex={0}>
          <div className="text-center mb-16">
            <p className="text-lg font-semibold text-teal-600 uppercase tracking-wider">
              Signature Dining
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              Explore Our Culinary World
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              From relaxed, all-day buffets to exquisite ocean-view dining, discover the distinct flavors of GuestHub Resort.
            </p>
          </div>
        </AnimatedSection>

        {/* Restaurant Cards */}
        <div className="space-y-24">
          {restaurants.map((rest, index) => (
            <AnimatedSection delayIndex={index + 1} key={rest.id}>
              <div
                className={`flex flex-col gap-10 lg:gap-16 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Image Section - NOW USING ImageCarousel */}
                <div className="lg:w-1/2 rounded-xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-[1.01]">
                  <ImageCarousel 
                      images={rest.images} 
                      alt={rest.name} 
                  />
                </div>

                {/* Content Section */}
                <div className="lg:w-1/2 flex flex-col justify-center">
                  <p className="text-sm font-medium text-teal-500 uppercase tracking-widest mb-1">
                    {rest.cuisine}
                  </p>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {rest.name}
                  </h2>
                  <p className="text-xl text-gray-600 italic mb-6">
                    "{rest.tagline}"
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {rest.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-700 mb-8 border-l-4 border-teal-500 pl-4">
                      <div>
                          <span className="block font-semibold">Style:</span>
                          {rest.cuisine}
                      </div>
                      <div>
                          <span className="block font-semibold">Attire:</span>
                          {rest.dressCode}
                      </div>
                  </div>

                  {/* Call-to-Action Link */}
                  <Link
                    to={rest.actionPath}
                    className="inline-flex items-center justify-center rounded-full bg-teal-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition duration-300 hover:bg-teal-700 w-full sm:w-auto"
                  >
                    {rest.linkType} for {rest.name}
                    <i className="fa-solid fa-arrow-right ml-3 text-sm"></i>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection delayIndex={restaurants.length + 1}>
          <InRoomDiningCTA />
        </AnimatedSection>

      </div>
      <div className="hidden">
      
      </div>
    </div>
  );
};

export default RestaurantsPage;