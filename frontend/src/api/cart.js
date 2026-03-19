import axios from "axios";
const API_URL = "http://localhost:5000/api/cart";

export const addToCartAPI = async (token, data) => {
  const res = await axios.post(`${API_URL}/add`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getCartAPI = async (token) => {
  const res = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const removeFromCartAPI = async (token, data) => {
  const res = await axios.post(`${API_URL}/remove`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const clearCartAPI = async (token) => {
  const res = await axios.delete(`${API_URL}/clear`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateCartAPI = async (token, data) => {
  const res = await axios.put(`${API_URL}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
