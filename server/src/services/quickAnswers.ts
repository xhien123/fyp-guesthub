type QA = { title: string; text: string; href: string };
const guest: Record<string, QA> = {
  how_login:   { title: "Log in / Register", text: "Log in or create an account here:", href: "/login" },
  our_menu:    { title: "Our Menus",         text: "Explore our restaurants and menus:", href: "/dining" },
  about_us:    { title: "About Us",          text: "Discover our story:", href: "/about" },
  contact:     { title: "Contact",           text: "Get in touch:", href: "/contact" },
};
const member: Record<string, QA> = {
  how_book_room:{ title: "Book a Room",      text: "Start your booking:", href: "/booking" },
  how_order_food:{title: "Order Food",       text: "In-room dining / pickup:", href: "/dining/in-room" },
  my_bookings:  { title: "My Bookings",      text: "Upcoming & past bookings:", href: "/account?tab=bookings" },
  my_orders:    { title: "My Orders",        text: "Track food orders:", href: "/account?tab=orders" },
  loyalty_points:{title:"Loyalty",           text: "View tier & points:", href: "/account?tab=loyalty" },
};
export function getQuickCatalog(isLoggedIn: boolean){ return isLoggedIn ? member : guest; }
export function answerIntent(intent: string, isLoggedIn: boolean){
  const cat = getQuickCatalog(isLoggedIn);
  return cat[intent] || null;
}
