import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [isOtpRequired, setIsOtpRequired] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleOtpChange = (e) => setOtp(e.target.value);

    // Initial Login Attempt (Step 1: Verify Password)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data } = await axios.post("http://localhost:5000/api/users/login", form);
            
            if (data.otpRequired) {
                setIsOtpRequired(true);
            } else if (data.token) {
                // Admin or user without OTP (though we set it for all users)
                login(data);
                navigate(data.isAdmin ? "/admin" : "/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    // OTP Verification (Step 2: Complete Login)
    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data } = await axios.post("http://localhost:5000/api/users/verify-otp-login", {
                email: form.email,
                otp,
            });

            if (data.token) {
                login(data);
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isOtpRequired ? "Verify OTP" : "Login"}</h2>
            {error && <p className="error">{error}</p>}
            
            {!isOtpRequired ? (
                <form onSubmit={handleLoginSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Checking..." : "Login"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleOtpVerify}>
                    <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "15px" }}>
                        Enter the 6-digit code sent to your email.
                    </p>
                    <input
                        type="text"
                        placeholder="6-digit OTP"
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength="6"
                        required
                        disabled={isLoading}
                        style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "5px" }}
                    />
                    <button type="submit" disabled={isLoading} style={{ backgroundColor: "#28a745" }}>
                        {isLoading ? "Verifying..." : "Verify & Login"}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setIsOtpRequired(false)} 
                        style={{ backgroundColor: "transparent", color: "#007bff", marginTop: "10px", border: "none" }}
                    >
                        Back to Login
                    </button>
                </form>
            )}

            <p className="register-link">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;