import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  submitOrderFeedback, // ⭐ new controller
} from "../controllers/orderController.js";

const router = express.Router();

// 🧾 User routes
router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.put("/cancel/:id", protect, cancelOrder);

// ⭐ New: Submit feedback for delivered orders
router.post("/:id/feedback", protect, submitOrderFeedback);

// 👑 Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
