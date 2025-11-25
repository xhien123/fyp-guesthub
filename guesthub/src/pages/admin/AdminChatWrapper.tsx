import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ChatList from "./ChatList";

const AdminChatWrapper: React.FC = () => {
  const location = useLocation();
  const isThreadOpen = location.pathname.split("/").length > 3;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-stone-50 overflow-hidden">
      <div
        className={`w-full md:w-96 flex-shrink-0 bg-white border-r border-stone-200 flex flex-col transition-all duration-300 ease-in-out ${
          isThreadOpen ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatList />
      </div>

      <div className={`flex-1 flex flex-col relative bg-stone-100/50 ${isThreadOpen ? "flex" : "hidden md:flex"}`}>
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-stone-400 font-serif italic">
              Loading concierge secure line...
            </div>
          }
        >
          <Outlet />
        </Suspense>

        {!isThreadOpen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-stone-50/50 backdrop-blur-sm z-10">
            <div className="w-16 h-16 mb-4 rounded-full bg-stone-200 flex items-center justify-center text-2xl text-stone-500">
              💬
            </div>
            <h3 className="font-serif text-xl text-stone-600 mb-1">Concierge Desk</h3>
            <p className="text-sm font-medium uppercase tracking-widest opacity-60">
              Select a guest from the inbox
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatWrapper;