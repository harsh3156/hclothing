import React, { useState, useContext } from "react";
import { addProduct } from "../api/products";
import { AuthContext } from "../context/AuthContext";
import "./AddProduct.css";

const AddProduct = () => {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    size: { M: 0, L: 0, XL: 0, XXL: 0 },
    image: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Input Handlers ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setError("");
    setSuccess("");

    if (name === "image") {
      setForm({ ...form, image: files[0] });
      return;
    }

    // ✅ Validation: Name & Description allow letters, numbers, spaces, commas, dots, hyphens
    if (name === "name" || name === "description") {
      const filteredValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
      setForm({ ...form, [name]: filteredValue });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSizeChange = (e) => {
    setError("");
    setSuccess("");
    const { name, value } = e.target;

    let newValue = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0) newValue = 0;

    setForm({
      ...form,
      size: { ...form.size, [name]: newValue },
    });
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- Validation ---
    if (!form.name.trim() || !form.description.trim() || form.price <= 0 || !form.image) {
      setError("Name, Description, Price (must be > 0), and Image are required.");
      return;
    }

    // ✅ Regex validation for Name & Description
    const nameRegex = /^[a-zA-Z0-9\s,.-]+$/;
    const descRegex = /^[a-zA-Z0-9\s,.-]+$/;

    if (!nameRegex.test(form.name.trim())) {
      setError("Product Name can only include letters, numbers, commas, dots, and hyphens.");
      return;
    }

    if (!descRegex.test(form.description.trim())) {
      setError("Description can only include letters, numbers, commas, dots, and hyphens.");
      return;
    }

    const totalStock = Object.values(form.size).reduce((a, b) => a + b, 0);
    if (totalStock <= 0) {
      setError("Total stock across all sizes must be greater than zero.");
      return;
    }

    if (form.image && !form.image.type.startsWith("image/")) {
      setError("The uploaded file must be an image (JPEG, PNG, etc.).");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("size", JSON.stringify(form.size));
      formData.append("image", form.image);

      const res = await addProduct(formData, user.token);

      setSuccess(`✅ ${res.data.message || `Product "${form.name}" added successfully!`}`);

      // Reset form
      setForm({
        name: "",
        description: "",
        price: 0,
        size: { M: 0, L: 0, XL: 0, XXL: 0 },
        image: null,
      });
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || "Failed to add product"}`);
    } finally {
      setLoading(false);
    }
  };

  // --- JSX ---
  return (
    <div className="add-product-container">
      <h2>📦 Add New Product</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="name">Product Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter product name (letters & numbers allowed)"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows="4"
        />

        <label htmlFor="price">Price (₹)</label>
        <input
          type="number"
          id="price"
          name="price"
          value={form.price}
          onChange={handleChange}
          min="1"
          required
        />

        <div className="size-group">
          <label><strong>Stock Count (Min: 0)</strong></label>
          <div className="size-fields">
            {Object.keys(form.size).map((sizeKey) => (
              <div className="size-field" key={sizeKey}>
                <label htmlFor={sizeKey}>{sizeKey}</label>
                <input
                  type="number"
                  id={sizeKey}
                  name={sizeKey}
                  value={form.size[sizeKey]}
                  onChange={handleSizeChange}
                  min="0"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <label htmlFor="image">Product Image</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleChange}
          required
        />

        {loading ? (
          <button type="button" disabled>Adding...</button>
        ) : (
          <button type="submit">Add Product</button>
        )}
      </form>
    </div>
  );
};

export default AddProduct;
