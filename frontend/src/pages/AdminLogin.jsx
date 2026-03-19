import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const AdminLogin = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);

    console.log("📄 AdminLogin component rendered, user =", user);

    // 🔹 Edge Case: If already logged in as admin, redirect
    useEffect(() => {
        if (user?.isAdmin) {
            console.log("🔄 Redirecting admin to /admin/view-products");
            navigate("/admin/view-products", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // ✅ Validation: Check if fields are not empty
            if (!form.email.trim() || !form.password.trim()) {
                setError("Email and password are required");
                setIsLoading(false);
                return;
            }

            // ✅ Validation: Basic email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email)) {
                setError("Please enter a valid email address");
                setIsLoading(false);
                return;
            }

            const { data } = await axios.post(
                "http://localhost:5000/api/users/login",
                form
            );

            // ✅ Edge Case: Check if login response is valid
            if (!data || !data.token) {
                setError("Invalid response from server");
                setIsLoading(false);
                return;
            }

            // ✅ Edge Case: Check if user is actually an admin
            if (!data.isAdmin) {
                setError("Admin access required. Please use the correct credentials.");
                setIsLoading(false);
                return;
            }

            login(data);
            navigate("/admin/view-products", { replace: true });
        } catch (err) {
            // ✅ Handle different error scenarios
            if (err.response?.status === 401) {
                setError("Invalid email or password");
            } else if (err.response?.status === 400) {
                setError(err.response?.data?.message || "Invalid credentials");
            } else if (err.response?.status === 500) {
                setError("Server error. Please try again later.");
            } else if (err.message === "Network Error") {
                setError("Network error. Please check your connection.");
            } else {
                setError(err.response?.data?.message || "Login failed. Please try again.");
            }
            console.error("Admin login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ backgroundColor: "#FFF", border: "3px solid red" }}>
            <h2>Admin Login</h2>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>
                Admin access only
            </p>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Admin Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem" }}>
                <a href="/" style={{ color: "#007bff", textDecoration: "none" }}>
                    Back to Home
                </a>
            </p>
        </div>
    );
};

export default AdminLogin;
