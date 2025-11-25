import React from "react";
import { Link } from "react-router-dom";
import RestaurantMenu from "../components/layout/menu/RestaurantMenu";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams

const SavorySizzleMenuPage: React.FC = () => {
  const [params] = useSearchParams(); // Use useSearchParams to get current params
  const currentMealType = params.get("type"); // Get the active meal type from URL

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url("/src/assets/Savory Sizzle pics/Buffe restaurent hero background.jpg")` }}>
      <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[1px]"></div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28">
        <Link
          to="/restaurants"
          className="text-base font-semibold tracking-wide text-stone-200 hover:text-white transition duration-300 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Elite Dining
        </Link>

        <div className="mt-6 border-b border-stone-600 pb-5">
          <h1 className="text-7xl font-sans font-extrabold tracking-tighter text-white">
            Savory Sizzle
          </h1>
          <p className="mt-2 text-2xl font-normal text-amber-100/90">
            The resort’s signature all-day dining, focusing on refined European gastronomy.
          </p>
        </div>

        <div className="mt-14 rounded-xl bg-white/95 p-8 shadow-2xl">
          {currentMealType === "breakfast" && (
            <div className="mb-6 px-4 py-3 bg-amber-50 text-amber-900 rounded-lg text-sm font-medium">
              Menu changes daily, enjoy from 7:00 AM - 10:30 AM every day.
            </div>
          )}
          <RestaurantMenu
            restaurantKey="savory-sizzle"
            isRoomService={false}
            mealTabs={[
              { key: "breakfast", label: "Breakfast Selections" },
              { key: "lunch_dinner", label: "Signature À La Carte" },
             
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SavorySizzleMenuPage;
