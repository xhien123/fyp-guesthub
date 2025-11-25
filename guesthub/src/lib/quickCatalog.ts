export type QA = { title: string; };
const guest = {
  how_login:   { title: "Log in / Register" },
  our_menu:    { title: "Our Menus" },
  about_us:    { title: "About Us" },
  contact:     { title: "Contact" },
} satisfies Record<string, QA>;

const member = {
  how_book_room:{ title: "Book a Room" },
  how_order_food:{title: "Order Food" },
  my_bookings:  { title: "My Bookings" },
  my_orders:    { title: "My Orders" },
  loyalty_points:{title:"Loyalty" },
} satisfies Record<string, QA>;

export function getQuickCatalog(isLoggedIn: boolean){ return isLoggedIn ? member : guest; }
