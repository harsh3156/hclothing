import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  submitOrderFeedback,
  getOrderByTrackingId,
} from "../controllers/orderController.js";

const router = express.Router();

// 🧾 User routes
router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/track/:trackingId", getOrderByTrackingId); // New public or protected route
router.put("/cancel/:id", protect, cancelOrder);

// ⭐ New: Submit feedback for delivered orders
router.post("/:id/feedback", protect, submitOrderFeedback);

// 👑 Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
