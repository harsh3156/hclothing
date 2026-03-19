import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCartAPI,
  removeFromCartAPI,
  updateCartAPI,
  clearCartAPI,
} from "../api/cart";
import { AuthContext } from "../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const navigate = useNavigate();

  // 🔹 Utility to check stock
  const getAvailableStock = (item) => {
    return (
      (item.selectedSize && item.product?.size && item.product.size[item.selectedSize]) ??
      item.product?.quantity ??
      0
    );
  };

  // 🔹 Totals (subtotal & total items)
  const { subtotal, totalItems } = useMemo(() => {
    if (!cart || !cart.items) return { subtotal: 0, totalItems: 0 };

    let total = 0;
    let count = 0;

    cart.items.forEach((item) => {
      total += item.product?.price * item.quantity;
      count += item.quantity;
    });

    return { subtotal: total, totalItems: count };
  }, [cart]);

  // 🔹 Load cart
  const loadCart = useCallback(async () => {
    if (!user) return;
    setLoadingCart(true);
    setGlobalError(null);
    try {
      const res = await getCartAPI(user.token);
      setCart(res.data || res);
    } catch (err) {
      console.error("Failed to load cart:", err.response?.data || err.message);
      setGlobalError("Failed to load cart. Please try again.");
    } finally {
      setLoadingCart(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadCart();
  }, [user, loadCart]);

  // 🔹 Update quantity
  const handleQuantityChange = async (itemId, newQty, availableStock) => {
    const currentItem = cart.items.find((item) => item._id === itemId);
    if (!currentItem || currentItem.quantity === newQty) return;

    if (newQty < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (newQty > availableStock) {
      alert(`Only ${availableStock} available in stock.`);
      newQty = availableStock;
    }

    // Update UI instantly
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item._id === itemId ? { ...item, quantity: newQty } : item
      ),
    }));

    setActionLoading((prev) => ({ ...prev, [itemId]: true }));

    try {
      await updateCartAPI(user.token, { itemId, quantity: newQty });
      await loadCart();
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("Failed to update quantity. Reverting...");
      await loadCart();
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // 🔹 Remove a single item
  const handleRemove = async (itemId) => {
    if (!window.confirm("Remove this item from your cart?")) return;

    setActionLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      await removeFromCartAPI(user.token, { itemId });
      await loadCart();
    } catch (err) {
      console.error("Remove error:", err.response?.data || err.message);
      alert("Failed to remove item.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // 🔹 Clear all items
  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;

    setLoadingCart(true);
    try {
      await clearCartAPI(user.token);
      await loadCart();
    } catch (err) {
      console.error("Clear error:", err.response?.data || err.message);
      alert("Failed to clear cart.");
    }
  };

  // 🔹 Checkout entire cart
  const handleCheckout = () => {
    if (!cart?.items?.length) {
      alert("Your cart is empty.");
      return;
    }

    navigate("/checkout", {
      state: {
        items: cart.items,
        subtotal,
      },
    });
  };

  // --- Render ---
  if (loadingCart) return <p className="loading">⏳ Loading your cart...</p>;
  if (globalError) return <p className="error">❌ {globalError}</p>;
  if (!cart || !cart.items?.length) return <p className="empty">🛒 Your cart is empty.</p>;

  return (
    <div className="cart-container">
      <h2>Shopping Cart ({totalItems} items)</h2>

      {cart.items.map((item) => {
        const availableStock = getAvailableStock(item);
        const isLoading = actionLoading[item._id];

        return (
          <div className="cart-item" key={item._id}>
            <img
              src={`http://localhost:5000/public/images/${item.product?.image}`}
              alt={item.product?.name}
              onClick={() => navigate(`/product/${item.product._id}`)}
              style={{ cursor: "pointer" }}
            />

            <div className="cart-details">
              <h4>{item.product?.name}</h4>
              <p>Size: {item.selectedSize || "N/A"}</p>
              <p>Price: ₹{item.product?.price}</p>
              <p>Subtotal: ₹{(item.product?.price * item.quantity).toFixed(2)}</p>
              <p className="stock">Available: {availableStock}</p>

              <div className="cart-actions">
                <label htmlFor={`qty-${item._id}`}>Quantity:</label>
                <input
                  id={`qty-${item._id}`}
                  type="number"
                  value={item.quantity}
                  min="1"
                  max={Math.min(availableStock, 99)}
                  disabled={isLoading}
                  onChange={(e) =>
                    handleQuantityChange(item._id, Number(e.target.value), availableStock)
                  }
                  onBlur={(e) =>
                    handleQuantityChange(item._id, Number(e.target.value), availableStock)
                  }
                />
              </div>

              <button
                className="remove-btn"
                onClick={() => handleRemove(item._id)}
                disabled={isLoading}
              >
                ❌ Remove
              </button>
            </div>
          </div>
        );
      })}

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <p>Total Items: {totalItems}</p>
        <p>Total Amount: ₹{subtotal.toFixed(2)}</p>
        <p className="shipping-note">Shipping and taxes calculated at checkout.</p>
      </div>

      <div className="cart-footer">
        <button
          className="clear-btn"
          onClick={handleClear}
          disabled={loadingCart || Object.values(actionLoading).some((v) => v)}
        >
          🧹 Clear Cart
        </button>

        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={!cart.items.length || Object.values(actionLoading).some((v) => v)}
        >
          💳 Proceed to Checkout (₹{subtotal.toFixed(2)})
        </button>
      </div>
    </div>
  );
};

export default Cart;
