import React from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound: React.FC = () => {
  const loc = useLocation();
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-neutral-100 grid place-items-center text-2xl">
        404
      </div>
      <h1 className="text-2xl font-display font-semibold mb-2">
        Page not found
      </h1>
      <p className="text-neutral-700 mb-6">
        We couldn't find <code className="bg-neutral-100 px-1 rounded">{loc.pathname}</code>.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="rounded-xl bg-black text-white px-4 py-2">
          Go to Home
        </Link>
        <Link
          to="/rooms"
          className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
        >
          Browse Rooms
        </Link>
        <Link
          to="/menu"
          className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
        >
          See Menu
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
