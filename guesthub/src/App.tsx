import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Rooms = lazy(() => import("./pages/Rooms"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const Menu = lazy(() => import("./pages/Menu"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Book = lazy(() => import("./pages/Book"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));
const BookingStatus = lazy(() => import("./pages/BookingStatus"));
const BookingCheckEmail = lazy(() => import("./pages/BookingCheckEmail")); 
const BookingSuccess = lazy(() => import("./pages/BookingSuccess")); 
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminRoomsList = lazy(() => import("./pages/admin/rooms/AdminRoomsList"));
const AdminRoomNew = lazy(() => import("./pages/admin/rooms/AdminRoomNew"));
const AdminRoomEdit = lazy(() => import("./pages/admin/rooms/AdminRoomEdit"));
const AdminMenuList = lazy(() => import("./pages/admin/menu/AdminMenuList"));
const AdminMenuNew = lazy(() => import("./pages/admin/menu/AdminMenuNew"));
const AdminMenuEdit = lazy(() => import("./pages/admin/menu/AdminMenuEdit"));
const RestaurantsPage = lazy(() => import("./pages/RestaurantsPage"));
const ViveOceane = lazy(() => import("./pages/restaurants/ViveOceane"));
const SavorySizzle = lazy(() => import("./pages/restaurants/SavorySizzle"));
const ViveOceaneMenuPage = lazy(() => import("./pages/ViveOceaneMenuPage"));
const SavorySizzleMenuPage = lazy(() => import("./pages/SavorySizzleMenuPage"));
const MeetingsWeddingsPage = lazy(() => import("./pages/MeetingsWeddingsPage"));
const PromotionPackages = lazy(() => import("./pages/PromotionPackages"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminChatWrapper = lazy(() => import("./pages/admin/AdminChatWrapper"));
const AdminChatList = lazy(() => import("./pages/admin/ChatList"));
const AdminChatThread = lazy(() => import("./pages/admin/ChatThread"));

const FAQs = () => (
  <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-3xl font-semibold">FAQs</h1>
  </div>
);
const Policies = () => (
  <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-3xl font-semibold">Policies</h1>
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/:id" element={<RoomDetails />} />
          <Route path="menu" element={<Menu />} />
          <Route path="dine-in" element={<Navigate to="/restaurants" replace />} />
          <Route path="booking" element={<Navigate to="/book" replace />} />
          
          <Route path="booking/verify" element={<BookingCheckEmail />} /> 
          <Route path="booking-success" element={<BookingSuccess />} /> 
          
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="contact" element={<Contact />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="restaurants/vive-oceane" element={<ViveOceane />} />
          <Route path="restaurants/savory-sizzle" element={<SavorySizzle />} />
          <Route path="savory-sizzle/menu" element={<SavorySizzleMenuPage />} />
          <Route path="vive-oceane/menu" element={<ViveOceaneMenuPage />} />
          <Route path="events/meetings-weddings" element={<MeetingsWeddingsPage />} />
          <Route path="events/promotion-packages" element={<PromotionPackages />} />
          <Route
            path="book"
            element={
              <ProtectedRoute>
                <Book />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id/status"
            element={
              <ProtectedRoute>
                <OrderStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings/:id/status"
            element={
              <ProtectedRoute>
                <BookingStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="rooms" element={<AdminRoomsList />} />
            <Route path="rooms/new" element={<AdminRoomNew />} />
            <Route path="rooms/:id/edit" element={<AdminRoomEdit />} />
            <Route path="menu" element={<AdminMenuList />} />
            <Route path="menu/new" element={<AdminMenuNew />} />
            <Route path="menu/:id/edit" element={<AdminMenuEdit />} />
            <Route path="chat" element={<AdminChatWrapper />}>
              <Route index element={<AdminChatList />} />
              <Route path=":id" element={<AdminChatThread />} />
            </Route>
            <Route path="*" element={<div className="p-6">Not found.</div>} />
          </Route>
          <Route path="faqs" element={<FAQs />} />
          <Route path="policies" element={<Policies />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;