import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Register.css";

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleOtpChange = (e) => setOtp(e.target.value);

    // Initial Registration Attempt (Step 1: Send OTP)
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        let { name, email, password } = form;
        name = name.trim();
        email = email.trim();

        // Front-end validations
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            setError("Name should contain only letters.");
            setIsLoading(false);
            return;
        }

        if (!email.endsWith("@gmail.com")) {
            setError("Only Gmail addresses are allowed.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await axios.post("http://localhost:5000/api/users/register", {
                name,
                email,
                password,
            });

            if (data.success) {
                setIsOtpSent(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    // OTP Verification (Step 2: Complete Registration)
    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data } = await axios.post("http://localhost:5000/api/users/verify-otp-register", {
                ...form,
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
            <h2>{isOtpSent ? "Verify Email" : "Register"}</h2>
            {error && <p className="error">{error}</p>}
            
            {!isOtpSent ? (
                <form onSubmit={handleRegisterSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Gmail Address"
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
                        {isLoading ? "Sending OTP..." : "Register"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleOtpVerify}>
                    <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "15px" }}>
                        Enter the 6-digit code sent to <strong>{form.email}</strong>
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
                        {isLoading ? "Verifying..." : "Verify & Register"}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setIsOtpSent(false)} 
                        style={{ backgroundColor: "transparent", color: "#007bff", marginTop: "10px", border: "none" }}
                    >
                        Change Email / Back
                    </button>
                </form>
            )}

            <p className="register-link">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;
