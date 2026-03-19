import React, { useContext } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import OrderPage from "./pages/OrderPage";
import Checkout from "./pages/Checkout";

// Admin
import AdminHome from "./admin/AdminHome";
import AddProduct from "./admin/AddProduct";
import ViewProducts from "./admin/ViewProducts";
import EditProduct from "./admin/EditProduct";
import AdminOrders from "./admin/AdminOrders";
import Reports from "./admin/Reports";
import AdminAds from "./admin/AdminAds"; 
import ViewUsers from "./admin/ViewUsers";

// Route Protectors
import AdminLoginRoute from "./components/AdminLoginRoute";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * PrivateRoute - Protects user routes
 * ✅ Edge Cases:
 * - Admin accessing user-only routes → redirect to /admin/view-products
 * - User not logged in → redirect to /login
 * - Non-admin accessing protected routes → allow
 */
const PrivateRoute = ({ isAdminRequired }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdminRequired && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // ✅ Edge Case: Admin trying to access user routes
  if (!isAdminRequired && user.isAdmin) {
    return <Navigate to="/admin/view-products" replace />;
  }
  
  return <Outlet />;
};

/**
 * AdminRoute - Protects admin routes
 * ✅ Edge Cases:
 * - Non-admin accessing admin routes → redirect to home
 * - User not logged in → redirect to /admin
 */
const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  // Hide navbar on login/register/admin routes (admin has its own sidebar)
  const hideNavbar = ["/login", "/register"].includes(location.pathname) || 
                     location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* ========== Public Routes ========== */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />

        {/* ========== Protected User Routes ========== */}
        {/* ✅ Edge Case: Admin redirects to /admin/view-products */}
        <Route element={<PrivateRoute isAdminRequired={false} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* ========== Admin Routes (Consolidated) ========== */}
        <Route path="/admin">
          {/* Public Admin Entry (Login) */}
          <Route 
            index 
            element={
              <AdminLoginRoute>
                <AdminLogin />
              </AdminLoginRoute>
            } 
          />

          {/* Protected Admin Dashboard */}
          <Route element={<AdminRoute />}>
            <Route path="*" element={<AdminHome />}>
              <Route index element={<Navigate to="/admin/view-products" replace />} />
              <Route path="view-products" element={<ViewProducts />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit-product/:id" element={<EditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ads" element={<AdminAds />} />
              <Route path="users" element={<ViewUsers />} />
            </Route>
          </Route>
        </Route>

        {/* ========== 404 Not Found ========== */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer only for regular users */}
      {user && !user.isAdmin && <Footer />}

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}

export default App;
