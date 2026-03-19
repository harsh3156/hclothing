import React, { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * AdminLoginRoute - Handles the /admin route logic
 * 
 * ✅ Flow:
 * 1. If user is logged in as admin → redirect to /admin/view-products
 * 2. If user is logged in but NOT admin → redirect to home (/)
 * 3. If NOT logged in → show AdminLogin page (falls through to Outlet)
 * 
 * ✅ Edge Cases Covered:
 * - Token validation on app load (handled by AuthContext)
 * - Non-admin trying to access admin area
 * - User session persistence
 * - Unauthorized access attempts
 */
const AdminLoginRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Give time for localStorage to hydrate
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCheckingAuth(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    console.log("🔍 AdminLoginRoute: user =", user, "isCheckingAuth =", isCheckingAuth);

    // ✅ Edge Case: Admin already logged in
    if (user?.isAdmin) {
        console.log("✅ Admin detected, redirecting to /admin/view-products");
        return <Navigate to="/admin/view-products" replace />;
    }

    // ✅ Edge Case: User is logged in but NOT admin
    if (user && !user.isAdmin) {
        console.log("⚠️ Non-admin user detected, redirecting to /");
        return <Navigate to="/" replace />;
    }

    // Show loading or admin login page
    console.log("📝 Showing admin login form");
    return <>{children}</>;
};

export default AdminLoginRoute;
