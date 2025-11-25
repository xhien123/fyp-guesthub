import React from "react";
import { Link, NavLink, useSearchParams } from "react-router-dom";
import RestaurantMenu from "../components/layout/menu/RestaurantMenu";

// Your brand assets (adjust if paths differ)
import logoUrl from "../assets/Guesthub logo.jpg";
import oceanImg from "../assets/Beach view 2.jpg";
import grillImg from "../assets/viveonceane pics/vive grill buffe outside.jpg";

type RestaurantKey = "vive-oceane" | "savory-sizzle";

const THEMES: Record<
  RestaurantKey,
  {
    name: string;
    sub: string;
    bg: string;
    text: string;
    btnSolid: string;
    btnOutline: string;
    chip: string;
    socialTint: string;
    heroImg: string;
  }
> = {
  "vive-oceane": {
    name: "Vive Océane",
    sub: "Ocean Dining",
    bg: "bg-gradient-to-b from-sky-50 via-cyan-50 to-cyan-100",
    text: "text-cyan-900",
    btnSolid:
      "bg-cyan-700 text-white hover:bg-cyan-800 focus-visible:outline-cyan-700",
    btnOutline:
      "border border-cyan-700 text-cyan-700 hover:bg-cyan-50 focus-visible:outline-cyan-700",
    chip: "bg-cyan-800 text-white",
    socialTint: "hover:opacity-80",
    heroImg: oceanImg,
  },
  "savory-sizzle": {
    name: "Savory Sizzle",
    sub: "European Buffet",
    bg: "bg-gradient-to-b from-yellow-50 via-amber-50 to-amber-100",
    text: "text-amber-900",
    btnSolid:
      "bg-amber-700 text-white hover:bg-amber-800 focus-visible:outline-amber-700",
    btnOutline:
      "border border-amber-700 text-amber-700 hover:bg-amber-50 focus-visible:outline-amber-700",
    chip: "bg-amber-900 text-white",
    socialTint: "hover:opacity-80",
    heroImg: grillImg,
  },
};

const Menu: React.FC = () => {
  const [params] = useSearchParams();
  const rk = (params.get("restaurant") as RestaurantKey) || "savory-sizzle";
  const T = THEMES[rk];

  return (
    <div className={`min-h-screen ${T.bg}`}>
      {/* Header */}
      <header id="header" className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={logoUrl}
                alt="GuestHub Logo"
                className="h-10 w-10 rounded-sm object-cover"
              />
              <div className="leading-tight">
                <div className={`text-xl font-extrabold tracking-wide ${T.text}`}>
                  {T.name}
                </div>
                <div className="text-sm text-neutral-600">{T.sub}</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <a href="tel:+84900000000" className={`px-3 py-2 rounded-md text-sm font-medium ${T.btnOutline}`}>
                Call – +84 900 000 000
              </a>
              <a href="#reservation" className={`px-3 py-2 rounded-md text-sm font-semibold ${T.btnSolid}`}>
                Reservation
              </a>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <nav className="flex flex-wrap gap-4 text-sm font-medium text-neutral-700">
              <NavLink to="/" className="hover:underline">Home</NavLink>
              <a href="#about" className="hover:underline">About</a>
              <a href="#menu" className="hover:underline">Menu</a>
              <a href="#reservation" className="hover:underline">Reservation</a>
              <a href="#gallery" className="hover:underline">Gallery</a>
              <a href="#blog" className="hover:underline">Blog</a>
              <Link to="/contact" className="hover:underline">Contact</Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <a href="#" className={T.socialTint} aria-label="Instagram">
                <i className="fa-brands fa-instagram text-xl" />
              </a>
              <a href="#" className={T.socialTint} aria-label="Facebook">
                <i className="fa-brands fa-facebook text-xl" />
              </a>
              <a href="#" className={T.socialTint} aria-label="Twitter">
                <i className="fa-brands fa-x-twitter text-xl" />
              </a>
              <a href="#" className={T.socialTint} aria-label="Pinterest">
                <i className="fa-brands fa-pinterest text-xl" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Feature */}
      <section id="home" className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-14">
          <div className="order-2 md:order-1">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-[1px] w-10 bg-neutral-400" />
              <span className="uppercase tracking-widest text-xs text-neutral-500">
                Welcome to {T.name}
              </span>
              <span className="h-[1px] w-10 bg-neutral-400" />
            </div>
            <h1 className={`text-4xl font-extrabold leading-tight ${T.text}`}>
              A Delightful, Luxury 6-Star Dining Experience
            </h1>
            <p className="mt-4 max-w-xl text-neutral-700">
              Curated courses and signature beverages, served with ocean-front serenity
              at Vive Océane or the golden glow of Savory Sizzle.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#menu" className={`px-4 py-2 rounded-md text-sm font-semibold ${T.btnSolid}`}>
                Explore Menu
              </a>
              <a href="#reservation" className={`px-4 py-2 rounded-md text-sm font-medium ${T.btnOutline}`}>
                Book a Table
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
              <img
                src={T.heroImg}
                alt={T.name}
                className="h-72 w-full object-cover md:h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MENU – embeds your dynamic RestaurantMenu */}
      <section id="menu" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="h-[1px] w-10 bg-neutral-400" />
                <span className="uppercase tracking-widest text-xs text-neutral-500">
                  Menu
                </span>
                <span className="h-[1px] w-10 bg-neutral-400" />
              </div>
              <h2 className={`text-3xl font-bold ${T.text}`}>
                Courses & Signature Drinks
              </h2>
              <p className="mt-2 max-w-2xl text-neutral-700">
                Elegantly ordered: Starters → Entrées → Mains → Desserts, followed by
                Soft Drinks → Cocktails → Wines. Use filters to refine.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                to={`?restaurant=vive-oceane`}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${rk === "vive-oceane" ? T.chip : "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"}`}
              >
                Vive Océane
              </Link>
              <Link
                to={`?restaurant=savory-sizzle`}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${rk === "savory-sizzle" ? T.chip : "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"}`}
              >
                Savory Sizzle
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-1 md:p-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
              <RestaurantMenu restaurantKey={rk} isRoomService={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Reservation strip */}
      <section id="reservation" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
              <img
                src={rk === "vive-oceane" ? oceanImg : grillImg}
                alt="Reservation"
                className="h-72 w-full object-cover md:h-[420px]"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-[1px] w-10 bg-neutral-400" />
                <span className="uppercase tracking-widest text-xs text-neutral-500">
                  Reservation
                </span>
                <span className="h-[1px] w-10 bg-neutral-400" />
              </div>
              <h3 className={`text-3xl font-bold ${T.text}`}>Book your table now</h3>
              <form className="mt-6 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-800" placeholder="Name" />
                  <input className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-800" placeholder="Email" type="email" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-800" placeholder="Person" />
                  <input className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-800" placeholder="Timing" />
                  <input className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-800" type="date" />
                </div>
                <button type="button" className={`mt-2 rounded-md px-4 py-2 text-sm font-semibold ${T.btnSolid}`}>
                  Book a Table
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="GuestHub" className="h-10 w-10 rounded-sm object-cover" />
                <div>
                  <div className="text-lg font-extrabold tracking-wide">{T.name}</div>
                  <div className="text-sm text-neutral-600">{T.sub}</div>
                </div>
              </div>
              <div className="text-neutral-700">
                5 Rue Dalou, 75015 Paris<br />
                <a href="tel:+33156788956" className="underline">+33 156 78 89 56</a><br />
                <a href="mailto:benoit@mail.com" className="underline">benoit@mail.com</a>
              </div>
            </div>

            <div className="space-y-3">
              <div className="uppercase tracking-widest text-xs text-neutral-500">Newsletter</div>
              <p className="text-neutral-700">Join our list for updates, news & offers.</p>
              <form className="flex gap-2">
                <input type="email" placeholder="Email" className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-800" />
                <button type="button" className={`rounded-md px-4 py-2 text-sm font-semibold ${T.btnSolid}`}>
                  Subscribe
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <div className="uppercase tracking-widest text-xs text-neutral-500">Working Hours</div>
              <div className="text-neutral-700">
                <p><span className="font-medium">Mon – Fri:</span> 7:00 – 18:00</p>
                <p><span className="font-medium">Sat:</span> 7:00 – 18:00</p>
                <p><span className="font-medium">Sun:</span> 8:00 – 18:00</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-black/5 pt-6 text-sm text-neutral-600 md:flex-row">
            <p>© {new Date().getFullYear()} GuestHub — All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Styleguide</a>
              <a href="#" className="hover:underline">Licenses</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
