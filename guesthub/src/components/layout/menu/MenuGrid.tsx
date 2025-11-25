import React from "react";
import type { MenuItem, BookingStatus } from "../../../types";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../ui/Toaster";
import { Link, useNavigate } from "react-router-dom";

import beachUrl from "../../../assets/Beach view 2.jpg";
import logoUrl from "../../../assets/Guesthub logo.jpg";

const FALLBACK =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const toAbs = (p?: string) => (p ? (p.startsWith("http") ? p : `${API_BASE}${p}`) : "");

const SidePopup: React.FC<{ open: boolean; onClose: () => void; status: BookingStatus | null }> = ({ open, onClose, status }) => {
  const [mounted, setMounted] = React.useState(open);
  const [phase, setPhase] = React.useState<"enter" | "leave">("enter");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setPhase("enter"));
    } else {
      setPhase("leave");
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const [, message, showContact, showViewBooking] = React.useMemo(() => {
    if (status === "Pending" || status === "Confirmed") {
        return [
            "In-Residence Dining Is Not Yet Active",
            `In-room dining is exclusively available for 'Checked-in' guests. Your booking is currently '${status}'. This feature will be available upon your arrival at the resort.`,
            false,
            true
        ];
    }
    return [
        "Book a Room to Order In-Room Dining",
        "In-room dining is an exclusive service for our checked-in guests. Please book a stay or check-in to your residence to proceed.",
        true,
        false
    ];
  }, [status]);

  if (!mounted) return null;

  const fadeOut = (cb?: () => void) => {
    setPhase("leave");
    setTimeout(() => {
      cb?.();
      onClose();
    }, 260);
  };

  const panelCls =
    "fixed right-6 top-24 z-[10001] w-[450px] max-w-[90vw] overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl transition-all duration-300 " +
    (phase === "enter"
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-3");

  const backdropCls =
    "fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm " +
    (phase === "enter" ? "opacity-100" : "opacity-0") +
    " transition-opacity duration-300";

  return (
    <>
      <button
        aria-label="Close popup"
        onClick={() => fadeOut()}
        className={backdropCls}
      />

      <div className={panelCls}>
        <div
          className="h-40 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${beachUrl})` }}
        />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logoUrl}
              alt="GuestHub logo"
              className="h-10 w-10 rounded-md object-cover"
            />
            <h3 className="text-2xl font-semibold text-teal-700">
              Book a Room First
            </h3>
          </div>

          <p className="text-[15px] leading-relaxed text-slate-700 mb-6">
            {message}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => fadeOut(() => navigate("/restaurants"))}
              className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              ← Back to Menu
            </button>

            <div className="grid grid-cols-2 gap-3">
              {showViewBooking && (
                <Link
                  to="/profile?sec=upcoming"
                  onClick={(e) => {
                    e.preventDefault();
                    fadeOut(() => navigate("/profile?sec=upcoming"));
                  }}
                  className="rounded-md bg-amber-700 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-600 transition"
                >
                  View My Booking
                </Link>
              )}
              {showContact && (
                 <Link
                  to="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    fadeOut(() => navigate("/contact"));
                  }}
                  className="rounded-md border border-teal-500 py-2.5 text-center text-sm font-medium text-teal-700 hover:bg-teal-50 transition"
                >
                  Contact Us
                </Link>
              )}
              {(showViewBooking && !showContact) ? null : ( // Handle case where both are false
                <Link
                  to="/"
                  onClick={(e) => {
                    e.preventDefault();
                    fadeOut(() => navigate("/"));
                  }}
                  className="rounded-lg bg-teal-600 py-2.5 text-center text-sm font-medium text-white hover:bg-teal-700 transition"
                >
                  Go Home
                </Link>
             )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Qty: React.FC<{ value: number; onChange: (n: number) => void; disabled?: boolean }> = ({
	value,
	onChange,
	disabled,
}) => (
	<div className="inline-flex items-center overflow-hidden rounded-md border">
		<button
			type="button"
			disabled={disabled || value <= 0}
			onClick={() => onChange(Math.max(0, value - 1))}
			className="px-3 py-1.5 transition-transform active:scale-95 disabled:opacity-50"
			aria-label="Decrease"
		>
			–
		</button>
		<div className="min-w-[2.5rem] px-3 py-1.5 text-center">{value}</div>
		<button
			type="button"
			disabled={disabled}
			onClick={() => onChange(value + 1)}
			className="px-3 py-1.5 transition-transform active:scale-95 disabled:opacity-50"
			aria-label="Increase"
		>
			+
		</button>
	</div>
);

const MenuCard: React.FC<{
	item: MenuItem;
	isGuestCheckedIn: boolean; // Retained for visual disability in other parts of the site if needed
	addOrSetQty: (item: MenuItem, nextQty: number, currentQty: number) => void;
	currentQty: number;
	onRequireBooking: () => void;
}> = ({ item, addOrSetQty, currentQty }) => { // Removed isGuestCheckedIn from destruction
	const [imgSrc, setImgSrc] = React.useState(
		toAbs(item.photo) || toAbs((item as any).imagePath) || FALLBACK
	);
	const unavailable = !(
		typeof (item as any).available === "boolean"
			? (item as any).available
			: (item as any).isAvailable
	);
	const showController = currentQty > 0;

	const handleAddInitial = () => {
		// NO CHECK HERE: Everyone can add items.
		if (unavailable) return;
		addOrSetQty(item, 1, currentQty);
	};

	const handleQtyChange = (next: number) => {
		// NO CHECK HERE: Everyone can adjust cart quantity.
		if (unavailable) return;
		addOrSetQty(item, next, currentQty);
	};

	return (
		<div className="group flex flex-col overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
			<div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
				<img
					src={imgSrc}
					alt={item.name}
					loading="lazy"
					onError={() => setImgSrc(FALLBACK)}
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
				/>
				{unavailable && (
					<div className="absolute left-3 top-3 rounded bg-neutral-900/85 px-2 py-1 text-xs font-semibold text-white">
						Sold Out
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-2 p-4">
				<div className="flex items-start justify-between gap-3">
					<h3 className="line-clamp-1 text-[15px] font-semibold tracking-[0.01em]">
						{item.name}
					</h3>
					<span className="shrink-0 font-medium">${Number(item.price ?? 0).toFixed(2)}</span>
				</div>
				{item.description && (
					<p className="line-clamp-2 text-[13px] leading-5 text-neutral-600">{item.description}</p>
				)}

				<div className="mt-auto flex items-center justify-between gap-3 pt-1">
					{showController ? (
						<Qty value={currentQty} onChange={handleQtyChange} disabled={unavailable} />
					) : (
						<div />
					)}

					{showController ? (
						<span className="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600">
							In cart
						</span>
					) : (
						<button
							onClick={handleAddInitial}
							className={`rounded-md px-4 py-2 text-sm font-medium transition ${
								unavailable
									? "cursor-not-allowed bg-neutral-200 text-neutral-500"
									: "bg-black text-white hover:bg-neutral-900 active:scale-95" // ALWAYS ACTIVE BUTTON
							}`}
						>
							Add to Cart
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

const MenuGrid: React.FC<{ items: MenuItem[] }> = ({ items }) => {
	const cart = useCart();
	const { items: cartItems = [], totalQty = 0, bookingStatus } = cart;
	const addItem = cart?.addItem;
	const updateItemQty = cart?.updateItemQty;
	const removeItem = cart?.removeItem;
	const { toast } = useToast();

	const [popup, setPopup] = React.useState(false);

	const getQtyInCart = React.useCallback(
		(id: string) => cartItems.find((x: any) => x._id === id)?.quantity ?? 0,
		[cartItems]
	);

	const applyQty = React.useCallback(
		(it: MenuItem, nextQty: number, curQty: number) => {
			const otherCount = totalQty - curQty;
			if (nextQty + otherCount > 10) {
				toast({
					title: "Cart limit reached",
					description: "Max 10 items per order. Please call reception for larger orders.",
					variant: "warning",
				});
				return;
			}

			if (updateItemQty) {
				updateItemQty(it._id, nextQty);
			} else if (addItem && removeItem) {
				if (nextQty === 0) removeItem(it._id);
				else {
					const delta = nextQty - curQty;
					if (delta > 0) addItem(it, delta);
					else removeItem(it._id, -delta);
				}
			} else if (addItem) {
				const delta = nextQty - curQty;
				if (delta > 0) addItem(it, delta);
				else if (delta < 0) {
					addItem({ ...it, quantity: 0 } as any, 0);
				}
			}

			toast({
				title: nextQty === 0 ? "Removed from cart" : "Updated cart",
				description: nextQty === 0 ? it.name : `${it.name} × ${nextQty}`,
				variant: "success",
			});
			try {
				window.dispatchEvent(new CustomEvent("cart:bump"));
			} catch {}
		},
		[totalQty, toast, updateItemQty, addItem, removeItem]
	);

	return (
		<>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((it) => (
					<MenuCard
						key={it._id}
						item={it}
						isGuestCheckedIn={false} // Placeholder, not used for add button anymore
						addOrSetQty={applyQty}
						currentQty={getQtyInCart(it._id)}
						onRequireBooking={() => setPopup(true)} // Retained for legacy compatibility if needed
					/>
				))}
			</div>
			{/* SidePopup is kept but only truly useful for telling users WHY checkout might fail */}
			<SidePopup open={popup} onClose={() => setPopup(false)} status={bookingStatus} />
		</>
	);
};
export default MenuGrid;