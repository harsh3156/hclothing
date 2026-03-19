import React, { useEffect, useState, useContext } from "react";
import { getProducts, deleteProduct } from "../api/products";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./ViewProducts.css";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Fetch products from API ---
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      alert("Failed to load product data");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Filtered products based on filters ---
  const filteredProducts = products
    .filter((p) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
      );
    })
    .filter((p) => {
      if (priceFilter === "All") return true;
      if (priceFilter === "Low") return p.price < 1000;
      if (priceFilter === "Medium") return p.price >= 1000 && p.price <= 5000;
      if (priceFilter === "High") return p.price > 5000;
      return true;
    })
    .filter((p) => {
      if (stockFilter === "All") return true;
      if (stockFilter === "InStock")
        return Object.values(p.size || {}).some((val) => val > 0);
      if (stockFilter === "OutOfStock")
        return Object.values(p.size || {}).every((val) => val === 0);
      return true;
    });

  // --- Handle Delete Product ---
  const handleDelete = async (id) => {
    if (!user) return alert("Login as admin to delete");
    if (window.confirm("Are you sure to delete this product?")) {
      try {
        await deleteProduct(id, user.token);
        fetchProducts();
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  // --- Download CSV ---
  const handleDownload = () => {
    const csvData = [
      ["Name", "Description", "Price", "Stock"].join(","),
      ...filteredProducts.map(
        (p) =>
          `${p.name},${p.description},${p.price},${JSON.stringify(p.size || {})}`
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
  };

  return (
    <div className="view-products">
      <h2>Manage Products</h2>

      {/* 🔍 Filters Section */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search by product name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          className="filter-select"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="All">All Prices</option>
          <option value="Low">Below ₹1000</option>
          <option value="Medium">₹1000 - ₹5000</option>
          <option value="High">Above ₹5000</option>
        </select>

        <select
          className="filter-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="All">All Stock</option>
          <option value="InStock">In Stock</option>
          <option value="OutOfStock">Out of Stock</option>
        </select>

        <button className="download-btn" onClick={handleDownload}>
          📥 Download CSV
        </button>
      </div>

      <p className="product-count">
        Showing {filteredProducts.length} of {products.length} total products.
      </p>

      {/* 🧾 Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Sizes / Stock</th>
            <th>Price</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="6">No products found for the current filters.</td>
            </tr>
          ) : (
            filteredProducts.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>
                  {p.size
                    ? Object.entries(p.size)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(", ")
                    : "-"}
                </td>
                <td>₹{p.price}</td>
                <td>
                  {p.image && (
                    <img
                      src={`http://localhost:5000/public/images/${p.image}`}
                      alt={p.name}
                      onClick={() => navigate(`/product/${p._id}`)}
                    />
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/admin/edit-product/${p._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewProducts;
