import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // 🔹 Load user + cart from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCart = localStorage.getItem("cart");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  // 🔹 Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 🧠 LOGIN
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 🧠 UPDATE USER
  const updateUserContext = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // 🧠 LOGOUT
  const logout = () => {
    setUser(null);
    setCartItems([]);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
  };

  // 🛒 ADD TO CART
  const addToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (i) =>
          (i.product._id || i.product) === (item.product._id || item.product) &&
          i.selectedSize === item.selectedSize
      );

      if (existingItem) {
        return prev.map((i) =>
          (i.product._id || i.product) === (item.product._id || item.product) &&
          i.selectedSize === item.selectedSize
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        return [...prev, item];
      }
    });
  };

  // 🗑️ REMOVE ONE ITEM
  const removeFromCart = (productId, selectedSize) => {
    setCartItems((prev) =>
      prev.filter(
        (i) =>
          (i.product._id || i.product) !== productId ||
          i.selectedSize !== selectedSize
      )
    );
  };

  // 🧹 CLEAR CART
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  // ✅ REMOVE ONLY ORDERED ITEMS (main fix)
  const removeOrderedItems = (orderedItems) => {
    setCartItems((prev) => {
      const updatedCart = prev.filter(
        (cartItem) =>
          !orderedItems.some(
            (ordered) =>
              (ordered.product._id || ordered.product) ===
                (cartItem.product._id || cartItem.product) &&
              ordered.selectedSize === cartItem.selectedSize
          )
      );

      // 🟢 Keep localStorage in sync
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      return updatedCart;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserContext,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        removeOrderedItems, // ✅ export this
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
