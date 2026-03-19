import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // ✅ Redirect to correct login page based on user type
    navigate(user?.isAdmin ? "/admin" : "/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">H ClothingS</div>

        {/* Guest Navbar (No User) */}
        {!user && (
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        )}

        {/* User Navbar */}
        {user && !user.isAdmin && (
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li className="dropdown">
              <span>Profile ▾</span>
              <ul className="dropdown-menu">
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </li>
            <li className="cart">
              <Link to="/cart">🛒 Cart</Link>
            </li>
          </ul>
        )}

        {/* Admin Navbar */}
        {user && user.isAdmin && (
          <div className="admin-logout">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
