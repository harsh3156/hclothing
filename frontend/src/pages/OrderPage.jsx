import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserOrdersAPI, cancelOrderAPI, submitFeedbackAPI } from "../api/orders";
import * as XLSX from "xlsx";
import "./OrderPage.css";

const OrderPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await getUserOrdersAPI(user.token);
      const sortedOrders = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Fetch orders failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: "Canceling..." } : order
      )
    );

    try {
      await cancelOrderAPI(user.token, orderId);
      alert("✅ Order canceled successfully.");
      fetchOrders();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to cancel order due to a server error.";
      alert(errorMessage);
      fetchOrders();
    }
  };

  const handleFeedbackSubmit = async (orderId, rating) => {
    try {
      await submitFeedbackAPI(user.token, orderId, { rating });
      alert("✅ Thank you for your rating!");
      fetchOrders();
    } catch (err) {
      console.error("Feedback error:", err);
      const msg = err.response?.data?.message || "Failed to submit rating.";
      alert(msg);
      throw new Error(msg);
    }
  };

  const handleExportExcel = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const data = order.items.map((item) => ({
      Name: item.product?.name || item.name,
      Size: item.selectedSize,
      Quantity: item.quantity,
      Price: item.product?.price || item.price,
      Total: (item.product?.price || item.price) * item.quantity
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order");
    XLSX.writeFile(workbook, `Order-${orderId}.xlsx`);
  };

  if (loading) return <p className="orders-page">Loading orders...</p>;
  if (!orders.length) return <p className="orders-page">No orders found</p>;

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <p><b>Order ID:</b> {order._id}</p>
              <p>
                <b>Status:</b>{" "}
                <span
                  className={`status-badge ${
                    order.status === "Delivered"
                      ? "delivered"
                      : order.status === "Canceled" ||
                        order.status === "Cancelled" ||
                        order.status === "Canceling..."
                      ? "canceled"
                      : "pending"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p className="order-total"><b>Total:</b> ₹{order.totalAmount}</p> 
            </div>

            <div className="order-items">
              {order.items.map((p, idx) => {
                const productData = p.product || p;
                const imgFile = productData.image;
                const name = productData.name;
                const price = productData.price;

                return (
                  <div key={idx} className="flex gap-3 items-center order-item">
                    {imgFile && (
                      <img
                        src={`http://localhost:5000/public/images/${imgFile}`}
                        alt={name}
                      />
                    )}
                    <div className="item-details">
                      <h4>{name || "Unknown Product"}</h4>
                      <p>Size: {p.selectedSize} | Qty: {p.quantity}</p>
                      <p>₹{price} × {p.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-actions">
              {order.status !== "Delivered" &&
                order.status !== "Canceled" &&
                order.status !== "Cancelled" &&
                order.status !== "Shipped" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(order._id)}
                    disabled={order.status === "Canceling..."}
                  >
                    {order.status === "Canceling..."
                      ? "Processing..."
                      : "Cancel Order"}
                  </button>
              )}

              {order.status === "Delivered" && (
                <>
                  <FeedbackSection order={order} onSubmit={handleFeedbackSubmit} />
                  <button
                    className="excel-btn"
                    onClick={() => handleExportExcel(order._id)}
                  >
                    Export Excel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ⭐ FeedbackSection: only star ratings (no text)
const FeedbackSection = ({ order, onSubmit }) => {
  const hasExistingFeedback = !!order.feedback && order.feedback.rating > 0;
  const [rating, setRating] = useState(order.feedback?.rating || 0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return alert("Please select a star rating.");
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(order._id, rating);
    } catch (e) {
      console.error("Rating submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingFeedback) {
    return (
      <div className="feedback-thanks">
        <h4>Your Rating:</h4>
        <p className="rating-display">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < order.feedback.rating ? "active" : ""}`}>
              ★
            </span>
          ))}
          ({order.feedback.rating}/5)
        </p>
      </div>
    );
  }

  return (
    <div className="feedback-section">
      <h4>Rate your order:</h4>
      <div className="stars">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <span
              key={starValue}
              className={`star ${starValue <= (hover || rating) ? "active" : ""}`}
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(rating)}
            >
              ★
            </span>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        className="feedback-submit"
        disabled={isSubmitting || !rating}
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
};

export default OrderPage;
