import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Products.css";

// --- Helper component to render stars based on rating ---
const RatingStars = ({ rating, totalReviews = 0 }) => {
  const normalizedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="product-stars">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star active">★</span>
      ))}
      {hasHalfStar && <span className="star half">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star">☆</span>
      ))}
      <span className="rating-value">
        ({normalizedRating.toFixed(1)}{totalReviews > 0 ? ` / ${totalReviews}` : ""})
      </span>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const navigate = useNavigate();
  useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const { data } = await axios.get("http://localhost:5000/api/products");
        if (Array.isArray(data)) setProducts(data);
        else {
          setApiError("Invalid product data received.");
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setApiError("Failed to load products. Check server connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Filter & Sort Logic
  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      let matchesPrice = true;
      const price = p.price;

      if (priceRange === "0-500") matchesPrice = price >= 0 && price <= 500;
      else if (priceRange === "500-1000") matchesPrice = price > 500 && price <= 1000;
      else if (priceRange === "1000-5000") matchesPrice = price > 1000 && price <= 5000;
      else if (priceRange === "5000-10000") matchesPrice = price > 5000 && price <= 10000;
      else if (priceRange === "10000-100000") matchesPrice = price > 10000 && price <= 100000;

      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating-desc") {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return ratingB - ratingA;
      }
      return 0;
    });

  if (loading) return <div className="loading-state">⏳ Loading products...</div>;
  if (apiError && products.length === 0)
    return <div className="error-state">❌ {apiError}</div>;

  const showNoResultsMessage = products.length > 0 && filteredAndSortedProducts.length === 0;

  return (
    <div className="shop-page">
      {/* Sidebar */}
      <div className="shop-filters">
        <h3>Filters</h3>
        <input
          type="text"
          placeholder="Search products..."
          className="shop-search-box"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Price Filter */}
        <div className="shop-price-filter">
          <h4>Price Range</h4>
          {[
            ["0-500", "₹0 - ₹500"],
            ["500-1000", "₹500 - ₹1000"],
            ["1000-5000", "₹1000 - ₹5000"],
            ["5000-10000", "₹5000 - ₹10000"],
            ["10000-100000", "₹10000 - ₹1,00,000"],
            ["all", "All"],
          ].map(([val, label]) => (
            <label key={val}>
              <input
                type="radio"
                name="price"
                value={val}
                checked={priceRange === val}
                onChange={(e) => setPriceRange(e.target.value)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Sort Filter */}
        <div className="shop-sort-filter">
          <h4>Sort By</h4>
          {[
            ["default", "Default"],
            ["price-asc", "Price: Low → High"],
            ["price-desc", "Price: High → Low"],
            ["rating-desc", "Rating: High → Low"],
          ].map(([val, label]) => (
            <label key={val}>
              <input
                type="radio"
                name="sort"
                value={val}
                checked={sortBy === val}
                onChange={(e) => setSortBy(e.target.value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="shop-section">
        <div className="shop-header-row">
          <h2>All Products ({filteredAndSortedProducts.length})</h2>
        </div>

        {apiError && products.length > 0 && <p className="error-message">⚠️ {apiError}</p>}

        <div className="shop-grid">
          {showNoResultsMessage ? (
            <p className="no-results-message">
              No products match your filters or search term.
            </p>
          ) : (
            filteredAndSortedProducts.map((p) => (
              <div
                key={p._id}
                className="shop-card"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                <img src={`http://localhost:5000/public/images/${p.image}`} alt={p.name} />
                <h3>{p.name}</h3>
                {p.averageRating ? (
                  <RatingStars rating={p.averageRating} totalReviews={p.totalReviews} />
                ) : (
                  <p className="no-rating">No ratings yet</p>
                )}
                <p className="shop-price">₹{p.price.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
