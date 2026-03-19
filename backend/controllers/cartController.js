// backend/controllers/cartController.js
import Cart from "../models/Cart.js";

import Product from "../models/Product.js";

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, selectedSize } = req.body;

    if (!productId) return res.status(400).json({ message: "ProductId required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // check stock
    if (selectedSize) {
      const available = product.size?.[selectedSize] ?? 0;
      if (available < quantity) return res.status(400).json({ message: "Insufficient stock for this size" });
    } else if ((product.quantity ?? 0) < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.selectedSize === selectedSize
    );

    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ product: productId, quantity: Number(quantity), selectedSize });

    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json({ message: "Added to cart", cart: populated });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cart item quantity
export const updateCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Validate against product stock
    const product = await Product.findById(item.product);
    const size = item.selectedSize;
    const available = size ? product.size?.[size] ?? 0 : product.quantity ?? 0;
    if (available < quantity) return res.status(400).json({ message: `Only ${available} available` });

    item.quantity = Number(quantity);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json({ message: "Updated", cart: populated });
  } catch (err) {
    console.error("updateCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json({ message: "Removed", cart: populated });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
