import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import Order from "../models/Order.js";
import { sendOrderConfirmationEmail } from "../utils/mailService.js";

// 1. Create Razorpay Order
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error while creating order" });
  }
};

// 2. Verify Razorpay Payment Signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, systemOrderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Validate signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the order in our system and update it
      const order = await Order.findById(systemOrderId);
      if (!order) {
          return res.status(404).json({ success: false, message: "Order not found in system." });
      }
      
      order.status = "Confirmed"; // Mark as paid/confirmed
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      
      await order.save();
      
      // ✅ Send Confirmation Email after successful payment
      sendOrderConfirmationEmail(order.recipientEmail, {
        orderId: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        address: {
          name: order.recipientName,
          street: order.deliveryAddress,
          city: "", 
          state: "",
          pinCode: "",
          phone: order.recipientPhone || ""
        },
        paymentMethod: "Online Payment (Razorpay)",
      });
      
      res.status(200).json({ success: true, message: "Payment verified successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature. Payment failed." });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Server error while verifying payment" });
  }
};

// 3. Send Razorpay Key ID to Frontend securely
export const getKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};
