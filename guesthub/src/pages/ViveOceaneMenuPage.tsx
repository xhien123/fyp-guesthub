import React from "react";
import { Link } from "react-router-dom";
import RestaurantMenu from "../components/layout/menu/RestaurantMenu";

const ViveOceaneMenuPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url("/src/assets/vive background pic for menupage.jpg")` }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-32">
        <Link
          to="/restaurants"
          className="text-base font-semibold tracking-wider text-sky-200 hover:text-sky-50 transition duration-300 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          The Resort Dining Collection
        </Link>

        <div className="mt-8 border-b border-sky-300/30 pb-6">
          <h1 className="text-8xl font-serif font-extralight tracking-tight text-white">
            Vive Océane
          </h1>
          <p className="mt-4 text-3xl font-light italic text-sky-200">
            A tranquil escape. Refined seafood and coastal specialties, kissed by the sea breeze.
          </p>
        </div>

        <div className="mt-16 rounded-xl bg-white/90 p-8 shadow-2xl">
          <RestaurantMenu
            restaurantKey="vive-oceane"
            isRoomService={false}
            mealTabs={[
              { key: "food_dining", label: "Culinary Selection" },
              { key: "beverage_wine", label: "Sommelier's Coastal List" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ViveOceaneMenuPage;
