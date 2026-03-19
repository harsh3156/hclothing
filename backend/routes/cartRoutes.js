import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.put("/update", protect, updateCart);
router.post("/remove", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;
