import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

// ✅ Login user
export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Register user
export const register = async (name, email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      { name, email, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get all users (Admin only)
export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch users error:", error.response?.data || error.message);
    throw error;
  }
};

// ❌ Removed Delete User function
