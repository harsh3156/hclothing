import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      selectedSize: { type: String },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
}, { timestamps: true });

// ✅ FIX: use default export here
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
