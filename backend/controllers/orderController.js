import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendOrderConfirmationEmail } from "../utils/mailService.js";
import { generateTrackingId } from "../utils/trackingUtils.js";

// --- Helper for Status Restoration ---
const restoreStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    const sizeKey = item.selectedSize;

    if (product && product.size && product.size[sizeKey] !== undefined) {
      product.size[sizeKey] += item.quantity;
      await product.save();
    }
  }
};

// 🛒 Create a new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      items, 
      totalAmount, 
      deliveryAddress, 
      address, 
      recipientName, 
      recipientEmail, 
      recipientPhone, 
      paymentMethod 
    } = req.body;
    
    // Support both field names for flexibility
    const finalAddress = deliveryAddress || address;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items to order" });
    }

    const stockUpdatePromises = [];

    for (const item of items) {
      const productId = item.product?._id || item._id || item.product;
      if (!productId) {
        return res.status(400).json({ message: "Invalid product data (ID missing)" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found (ID: ${productId})` });
      }

      const sizeKey = item.selectedSize;

      if (!product.size || product.size[sizeKey] === undefined) {
        return res.status(400).json({
          message: `Invalid size "${sizeKey}" for ${product.name}`,
        });
      }

      if (product.size[sizeKey] < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} (Size: ${sizeKey}). Only ${product.size[sizeKey]} remaining.`,
        });
      }

      product.size[sizeKey] -= item.quantity;
      stockUpdatePromises.push(product.save());
    }

    await Promise.all(stockUpdatePromises);

    const order = new Order({
      user: userId,
      items,
      totalAmount,
      deliveryAddress: finalAddress,
      recipientName,
      recipientEmail,
      recipientPhone,
      paymentMethod,
      trackingId: generateTrackingId(),
      status: paymentMethod === "COD" ? "Confirmed" : "Pending",
    });

    await order.save();
    await Cart.deleteMany({ user: userId });

    // Send confirmation email for COD orders immediately
    if (paymentMethod === "COD") {
      const email = recipientEmail || req.user.email;
      sendOrderConfirmationEmail(email, {
        orderId: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        address: {
          name: recipientName || req.user.name,
          street: finalAddress,
          city: "", 
          state: "",
          pinCode: "",
          phone: recipientPhone || ""
        },
        paymentMethod: "Cash on Delivery",
        trackingId: order.trackingId,
      });
    }

    res.status(201).json({ message: "Order placed successfully ✅", order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// 🔍 Get order by Tracking ID
export const getOrderByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const order = await Order.findOne({ trackingId })
      .populate({
        path: "items.product",
        select: "name price image",
      })
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found with this tracking ID" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Get order by tracking ID error:", error);
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// 👤 Get user's own orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "items.product",
        select: "name price image",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to get user orders", error: error.message });
  }
};

// 👑 Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Failed to get all orders", error: error.message });
  }
};

// 🔄 Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Canceled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const originalStatus = order.status;

    if (status === "Canceled" && originalStatus !== "Canceled") {
      await restoreStock(order.items);
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

// ❌ Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (["Delivered", "Shipped", "Canceled"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    await restoreStock(order.items);
    order.status = "Canceled";
    await order.save();

    res.status(200).json({ message: "Order canceled successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

// ⭐ Submit feedback for delivered order (Only once) + Update product rating
export const submitOrderFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a rating between 1 and 5 stars" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
        status: "Delivered",
        "feedback.rating": { $exists: false },
      },
      {
        $set: {
          feedback: {
            rating,
            text: feedback || "",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    ).populate("items.product", "name price image");

    if (!updatedOrder) {
      const orderCheck = await Order.findById(id);
      if (!orderCheck) return res.status(404).json({ message: "Order not found" });
      if (orderCheck.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to review this order" });
      }
      if (orderCheck.status !== "Delivered") {
        return res.status(400).json({ message: `You can only review orders that have been delivered. Current status: ${orderCheck.status}` });
      }
      if (orderCheck.feedback && orderCheck.feedback.rating) {
        return res.status(400).json({ message: "Feedback already submitted for this order" });
      }
      return res.status(400).json({ message: "Order cannot be updated (check status or ownership)." });
    }

    // ⭐ Recalculate product rating after feedback
    for (const item of updatedOrder.items) {
      const productId = item.product._id;
      const allFeedbacks = await Order.find({
        "items.product": productId,
        "feedback.rating": { $exists: true },
      }).select("feedback.rating");

      const ratings = allFeedbacks.map(o => o.feedback.rating);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      await Product.findByIdAndUpdate(productId, {
        averageRating: avg.toFixed(1),
        totalReviews: ratings.length,
      });
    }

    res.status(200).json({
      message: "Feedback submitted successfully ✅",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ message: "Failed to submit feedback", error: error.message });
  }
};
