import express from "express";
import { createPaymentOrder, verifyPayment, getKey } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/get-key", protect, getKey);

export default router;
