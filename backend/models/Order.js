import mongoose from "mongoose";

// ⭐ Feedback schema (Star rating only — no written feedback)
const feedbackSchema = new mongoose.Schema({
    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                name: String,
                quantity: Number,
                price: Number,
                selectedSize: String,
            },
        ],
        totalAmount: { type: Number, required: true },
        status: { type: String, default: "Pending" },

        // 🚚 Shipping & Recipient Details
        recipientName: { type: String },
        recipientEmail: { type: String },
        recipientPhone: { type: String },
        deliveryAddress: { type: String },
        paymentMethod: { type: String },

        // ⭐ Feedback field (optional, only for rating)
        feedback: {
            type: feedbackSchema,
            required: false,
        },

        // ⭐ Razorpay Payment details
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },

    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
