// src/pages/admin/AdminHome.jsx
import React, { useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./AdminHome.css";

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { path: "/admin/add-product", label: "➕ Add" },
    { path: "/admin/view-products", label: "📦 Products" },
    { path: "/admin/orders", label: "🛒 Orders" },
    { path: "/admin/reports", label: "📊 Reports" },
    { path: "/admin/ads", label: "📢 Ads" },
    { path: "/admin/users", label: "👥 View Users" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="admin-home">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                location.pathname.includes(item.path) ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="sidebar-logout">
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminHome;
