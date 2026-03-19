// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext"; // Assuming you have AuthContext for user/token
import {
  addToCartAPI,
  getCartAPI,

} from "../api/cart"; // Import your API functions

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Get user/token from AuthContext
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch the cart from the backend
  const loadCart = useCallback(async () => {
    if (!user?.token) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getCartAPI(user.token);
      // Backend returns { items: [] } if cart not found, or the full cart object
      setCart(res.cart || res); 
    } catch (err) {
      console.error("Failed to load cart:", err.response?.data || err.message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart on user change/login
  React.useEffect(() => {
    loadCart();
  }, [user, loadCart]);
  
  // --- CORE FIX FOR 400 ERROR ---
  const addToCart = async (productId, quantity = 1, selectedSize) => {
    if (!user?.token) return { success: false, message: "Authentication required." };
    
    // Data object matches the format your backend /api/cart/add expects
    const data = { productId, quantity, selectedSize }; 

    try {
      const res = await addToCartAPI(user.token, data);
      
      // Update local state with the new cart data from the server
      setCart(res.cart);
      
      return { success: true, message: res.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add to cart.";
      console.error("addToCart error:", errorMessage);
      
      // The 400 errors (ProductId required or Insufficient stock) will be here
      return { success: false, message: errorMessage };
    }
  };
  
  // Example integration for other functions (assuming they are now in the other component)
  // These should ideally use the loadCart function to refresh state after mutation.
  
  // Helper to calculate total (can be done on the frontend using the cart state)
  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };


  return (
    <CartContext.Provider
      value={{ 
        cart, 
        loading,
        addToCart, 
        loadCart, // Expose loadCart to allow manual refresh
        getCartTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};