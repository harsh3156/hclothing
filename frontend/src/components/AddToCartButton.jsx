// src/components/AddToCartButton.jsx
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { addToCartAPI } from "../api/cart";

const AddToCartButton = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user) return alert("Please login");
    try {
      setLoading(true);
      await addToCartAPI(productId, 1, user.token);
      alert("Added to cart");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleAdd} disabled={loading}>{loading ? "Adding..." : "Add to Cart"}</button>;
};

export default AddToCartButton;
