import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts, updateProduct } from "../api/products";
import { AuthContext } from "../context/AuthContext";
import "./EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    size: { M: 0, L: 0, XL: 0, XXL: 0 },
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Load product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const allProducts = await getProducts();
        const product = allProducts.find((p) => p._id === id);
        if (!product) throw new Error("Product not found");

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          size: product.size || { M: 0, L: 0, XL: 0, XXL: 0 },
        });
      } catch (err) {
        alert("Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);

  // 🟢 Input Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    // ✅ Allow only letters, numbers, spaces, commas, dots, and hyphens
    if (name === "name" || name === "description") {
      const filteredValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
      setForm({ ...form, [name]: filteredValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSizeChange = (e) => {
    const { name, value } = e.target;
    const newValue = value === "" ? 0 : parseInt(value, 10);
    setForm({
      ...form,
      size: { ...form.size, [name]: isNaN(newValue) ? 0 : newValue },
    });
  };

  const handleFile = (e) => setImage(e.target.files[0]);

  // 🟢 Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Admin login required");

    const { name, description, price, size } = form;

    // --- Validation ---
    if (!name.trim() || !description.trim()) {
      setError("Name and Description are required.");
      return;
    }

    const validText = /^[a-zA-Z0-9\s,.-]+$/;
    if (!validText.test(name.trim())) {
      setError("Product Name can only include letters, numbers, commas, dots, and hyphens.");
      return;
    }

    if (!validText.test(description.trim())) {
      setError("Description can only include letters, numbers, commas, dots, and hyphens.");
      return;
    }

    // ✅ Ensure at least one letter in name & description
    if (!/[a-zA-Z]/.test(name)) {
      setError("Product Name must contain at least one letter.");
      return;
    }
    if (!/[a-zA-Z]/.test(description)) {
      setError("Description must contain at least one letter.");
      return;
    }

    // ✅ Ensure valid price
    if (price <= 0 || isNaN(price)) {
      setError("Price must be a valid positive number.");
      return;
    }

    // ✅ Ensure total stock > 0
    const totalStock = Object.values(size).reduce((a, b) => a + b, 0);
    if (totalStock <= 0) {
      setError("Total stock across all sizes must be greater than zero.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("size", JSON.stringify(size));
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      await updateProduct(id, formData, user.token);
      alert("✅ Product updated successfully!");
      navigate("/admin/view-products");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-product-container">
      <h2>Edit Product</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Enter product name (letters & numbers allowed)"
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          placeholder="Enter product description"
        />

        <label>Price (₹)</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          min="1"
          required
        />

        {/* 🧾 Size-wise stock fields */}
        <div className="size-group">
          <label><strong>Stock (per size):</strong></label>
          <div className="size-fields">
            {["M", "L", "XL", "XXL"].map((s) => (
              <div className="size-field" key={s}>
                <label>{s}</label>
                <input
                  type="number"
                  name={s}
                  value={form.size[s]}
                  onChange={handleSizeChange}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        <label>Product Image</label>
        <input type="file" name="image" onChange={handleFile} />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
