import axios from "axios";

// Base API URL
const BASE_URL = "http://localhost:5000/api/users";

// Create a pre-configured Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Helper function to create the Authorization header config
const getConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

// ---------------------------------------------
// --- AUTHENTICATION FUNCTIONS ---
// ---------------------------------------------

/**
 * ✅ Logs in a user.
 */
export const login = async (email, password) => {
    try {
        const response = await api.post("/login", { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Login failed.";
    }
};

/**
 * ✅ Registers a new user.
 */
export const register = async (name, email, password) => {
    try {
        const response = await api.post("/register", { name, email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Registration failed.";
    }
};

// ---------------------------------------------
// --- PROFILE MANAGEMENT ---
// ---------------------------------------------

/**
 * 👤 Fetches the current logged-in user's profile details.
 */
export const getProfile = async (token) => {
    try {
        const response = await api.get("/profile", getConfig(token));
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch profile.";
    }
};

/**
 * ✏️ Updates the current logged-in user's profile.
 */
export const updateProfile = async (profileData, token) => {
    try {
        const response = await api.put("/profile", profileData, getConfig(token));
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to update profile.";
    }
};

/**
 * 🔑 Updates user password.
 */
export const updatePassword = async (oldPassword, newPassword, token) => {
    try {
        const response = await api.put(
            "/password",
            { oldPassword, newPassword },
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to update password.";
    }
};

// ---------------------------------------------
// --- ADMIN FUNCTIONS ---
// ---------------------------------------------

/**
 * 🧑‍💻 Gets a list of all users (Admin only).
 */
export const getAllUsers = async (token) => {
    try {
        const response = await api.get("/", getConfig(token));
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch user list.";
    }
};
