import React from "react";
import { useCart } from "../../../context/CartContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CartDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { items, addItem, removeItem, clearCart, isGuestCheckedIn } = useCart();
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-96 h-full bg-white shadow-xl flex flex-col border-l border-neutral-200"
          >
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold tracking-wide">Your In-Room Order</h2>
              <div className="flex gap-3">
                {items.length > 0 && (
                  <button onClick={clearCart} className="text-sm text-red-600 hover:underline">
                    Clear
                  </button>
                )}
                <button onClick={onClose} className="text-neutral-600 hover:text-neutral-900">✖</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <p className="text-neutral-600">Your cart is empty.</p>
              ) : (
                items.map((i) => (
                  <div key={i._id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{i.name}</p>
                      <p className="text-sm text-neutral-500">${i.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => removeItem(i._id)} className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-sm active:scale-95">–</button>
                        <span className="w-6 text-center">{i.quantity}</span>
                        <button onClick={() => addItem(i)} className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-sm active:scale-95">+</button>
                      </div>
                    </div>
                    <div className="ml-3 font-medium">${(i.price * i.quantity).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t space-y-3 bg-neutral-50">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>

                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block w-full text-center rounded-none bg-[#0b1a2c] text-white py-3 font-semibold uppercase tracking-wider hover:bg-[#112f4c] active:scale-95"
                >
                  Proceed to Checkout
                </Link>
                
                <p className="text-xs text-center text-neutral-500 mt-2">
                  {isGuestCheckedIn
                    ? "You can charge this to your room account."
                    : "You will be prompted to confirm your stay on the next step."}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;