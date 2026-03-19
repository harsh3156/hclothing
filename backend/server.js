// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import advertiseRoutes from "./routes/advertiseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

// ⭐ Prevent server from crashing on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('⚠️ UNCAUGHT EXCEPTION:', err.message, err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ UNHANDLED REJECTION:', reason);
});

const app = express();

// ⭐ Enhanced CORS configuration to allow Razorpay and other external services
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// ⭐ Serve static images properly
const __dirname = path.resolve();
app.use("/public/images", express.static(path.join(__dirname, "public/images")));
app.use("/public/ads", express.static(path.join(__dirname, "public/ads")));

// ⭐ Add middleware to set proper headers for static images
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  // ⭐ Disable sensor permissions to prevent warning
  res.header("Permissions-Policy", "accelerometer=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=()");
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is online"
  })
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ads", advertiseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);

// ⭐ Global Error Handler Middleware (must be after all routes)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`❌ Error: ${err.message}`);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
