import React from "react";
import type { MenuCategory } from "../../../types";

type Props = {
  categories: MenuCategory[];
  active?: string;
  onChange: (id: string) => void;
};

const CategoryChips: React.FC<Props> = ({
  categories,
  active = "all",
  onChange,
}) => {
  const all = [{ _id: "all", name: "All" } as MenuCategory, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((c) => {
        const key = c._id ?? c.name;
        const isActive = active === key;

        return (
          <button
            key={key}
            onClick={() => onChange(String(key))}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
