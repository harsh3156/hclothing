import axios from "axios";

const API = "http://localhost:5000/api/orders";

// 🟩 Create Order
export const createOrderAPI = async (token, data) => {
  const formattedItems = data.items.map((item) => ({
    product: item.product?._id || item._id || item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
  }));

  const missing = formattedItems.find((it) => !it.product);
  if (missing) {
    throw new Error("Invalid product data (ID missing)");
  }

  const payload = {
    items: formattedItems,
    totalAmount: data.totalAmount,
    address: data.address,
  };

  return axios.post(API, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 👤 Get user's own orders
export const getUserOrdersAPI = (token) =>
  axios.get(`${API}/myorders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// 👑 Admin: Get all orders
export const getAllOrdersAPI = (token) =>
  axios.get(API, { headers: { Authorization: `Bearer ${token}` } });

// 🔄 Admin: Update order status
export const updateOrderStatusAPI = (token, id, status) =>
  axios.put(
    `${API}/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );

// ❌ Cancel order
export const cancelOrderAPI = (token, id) =>
  axios.put(`${API}/cancel/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ⭐ Submit feedback after delivery
export const submitFeedbackAPI = (token, orderId, data) =>
  axios.post(`${API}/${orderId}/feedback`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
