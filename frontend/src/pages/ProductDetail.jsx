import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./ProductDetail.css";

// ⭐ Star Rating Component
const RatingStars = ({ rating, totalReviews = 0 }) => {
  const normalizedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="pd-stars">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="pd-star active">★</span>
      ))}
      {hasHalfStar && <span className="pd-star half">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="pd-star">☆</span>
      ))}
      <span className="pd-rating-value">
        ({normalizedRating.toFixed(1)}
        {totalReviews > 0 ? ` / ${totalReviews}` : ""})
      </span>
    </div>
  );
};

// 🌟 Confirmation Banner Component
const ConfirmationBanner = ({ message, isVisible, type = "success" }) => {
  if (!isVisible) return null;
  return (
    <div className={`pd-toast-banner pd-toast-${type}`}>
      <p>{message}</p>
      {type === "success" && (
        <Link to="/cart" className="pd-toast-link">
          View Cart →
        </Link>
      )}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [banner, setBanner] = useState({
    message: "",
    isVisible: false,
    type: "success",
  });

  const fallbackImage = "placeholder.png";
  const imageBaseUrl = "http://localhost:5000/public/images/";

  const showBanner = (message, type = "success") => {
    setBanner({ message, isVisible: true, type });
    setTimeout(() => {
      setBanner((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // 🧾 Fetch Product + Similar Products
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        const productData = res.data;
        setProduct(productData);

        // Image Handling
        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
          setAdditionalImages(productData.images.slice(1));
        } else if (productData.image) {
          setMainImage(productData.image);
          setAdditionalImages([]);
        } else {
          setMainImage(fallbackImage);
          setAdditionalImages([]);
        }

        // Select first available size
        if (productData.size && Object.keys(productData.size).length > 0) {
          const firstSize = Object.keys(productData.size).find(
            (key) => productData.size[key] > 0
          );
          setSelectedSize(firstSize || "");
        }

        // Fetch similar products
        const recommendedRes = await axios.get(
          `http://localhost:5000/api/products`
        );
        const filteredProducts = recommendedRes.data.filter(
          (p) => p._id !== productData._id
        );
        setSimilarProducts(filteredProducts.slice(0, 10));
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    setSelectedSize("");
    setQuantity(1);
    setMainImage("");
    setAdditionalImages([]);
    setBanner({ message: "", isVisible: false, type: "success" });
    fetchProductData();
  }, [id]);

  // 🛒 Add to Cart
  const handleAddToCart = async () => {
    if (!product || !product._id)
      return showBanner("Product data missing.", "error");

    if (!user) {
      alert("Please log in first.");
      return navigate("/login");
    }

    const sizesAvailable = product.size && Object.keys(product.size).length > 0;

    if (sizesAvailable && !selectedSize)
      return showBanner("Please select a size.", "error");

    const currentStock = sizesAvailable
      ? product.size?.[selectedSize]
      : product.quantity;

    if (currentStock < quantity || currentStock <= 0)
      return showBanner(
        `Stock not available or only ${currentStock} left.`,
        "error"
      );

    try {
      const result = await addToCart(product._id, quantity, selectedSize);
      if (result.success) showBanner(result.message, "success");
      else showBanner(`Error: ${result.message}`, "error");
    } catch (err) {
      console.error("Add to cart error:", err);
      showBanner("Unexpected error occurred.", "error");
    }
  };

  if (loading) return <div className="pd-status">Loading...</div>;
  if (!product) return <div className="pd-status error">Product not found.</div>;

  const availableSizes = Object.entries(product.size || {}).filter(
    ([, stock]) => stock > 0
  );

  const maxQuantity =
    availableSizes.length > 0 && selectedSize
      ? product.size[selectedSize]
      : typeof product.quantity === "number" && product.quantity > 0
      ? product.quantity
      : 0;

  const stockForDisplay =
    availableSizes.length > 0 && selectedSize
      ? maxQuantity
      : product.quantity ?? "N/A";

  return (
    <div className="pd-page">
      <ConfirmationBanner
        message={banner.message}
        isVisible={banner.isVisible}
        type={banner.type}
      />

      <div className="pd-card">
        {/* 🖼️ Image Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img
              src={`${imageBaseUrl}${mainImage}`}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${imageBaseUrl}${fallbackImage}`;
              }}
            />
          </div>

          {additionalImages.length > 0 && (
            <div className="pd-thumbnails">
              {additionalImages.map((imagePath, index) => (
                <img
                  key={index}
                  src={`${imageBaseUrl}${imagePath}`}
                  alt={`${product.name} thumbnail ${index + 2}`}
                  className={`pd-thumbnail-item ${
                    mainImage === imagePath ? "selected" : ""
                  }`}
                  onClick={() => setMainImage(imagePath)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${imageBaseUrl}${fallbackImage}`;
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 📝 Info */}
        <div className="pd-info">
          <h2 className="pd-name">{product.name}</h2>
          <h3 className="pd-price">₹{product.price?.toFixed(2)}</h3>

          {product.averageRating > 0 && (
            <div className="pd-rating">
              <RatingStars
                rating={product.averageRating}
                totalReviews={product.totalReviews}
              />
            </div>
          )}

          <p className="pd-description">{product.description}</p>

          {/* 👕 Size */}
          {availableSizes.length > 0 && (
            <div className="pd-input-group">
              <label htmlFor="size-select">Select Size:</label>
              <select
                id="size-select"
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setQuantity(1);
                }}
              >
                <option value="">Select size</option>
                {availableSizes.map(([size, stock]) => (
                  <option key={size} value={size}>
                    {size} (in stock: {stock})
                  </option>
                ))}
              </select>
              {availableSizes.length > 0 && !selectedSize && (
                <p className="pd-validation-hint">
                  Please select a size before adding to cart.
                </p>
              )}
            </div>
          )}

          {/* 🔢 Quantity (only show when stock available) */}
          {maxQuantity > 0 && (
            <div className="pd-input-group">
              <label htmlFor="quantity-input">Quantity:</label>
              <input
                id="quantity-input"
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  let newQty = Number(e.target.value);
                  if (newQty > maxQuantity) newQty = maxQuantity;
                  if (newQty < 1) newQty = 1;
                  setQuantity(newQty);
                }}
              />
            </div>
          )}

          {/* 🟢 Stock Status */}
          <p className="pd-stock">
            {maxQuantity > 0 ? (
              <>In Stock: {stockForDisplay}</>
            ) : (
              <span className="pd-out-of-stock">Out of Stock</span>
            )}
          </p>

          {/* 🛒 Add to Cart */}
          <button
            className="pd-add-btn"
            onClick={handleAddToCart}
            disabled={
              (availableSizes.length > 0 && !selectedSize) || maxQuantity === 0
            }
          >
            {maxQuantity === 0 ? "OUT OF STOCK" : "🛒 ADD TO CART"}
          </button>

          {!user && (
            <p className="pd-login-prompt">
              **You must be logged in to purchase.**
            </p>
          )}
        </div>
      </div>

      {/* 🛍️ Similar Products */}
      {similarProducts.length > 0 && (
        <div className="pd-similar-section">
          <h2 className="pd-similar-title">Recommended Products</h2>
          <div className="pd-similar-list">
            {similarProducts.slice(0, 10).map((recommended) => (
              <Link
                to={`/product/${recommended._id}`}
                key={recommended._id}
                className="pd-similar-item"
                onClick={() => window.scrollTo(0, 0)}
              >
                <div className="pd-similar-image">
                  <img
                    src={`${imageBaseUrl}${recommended.image}`}
                    alt={recommended.name}
                  />
                </div>
                <div className="pd-similar-info">
                  <p className="pd-similar-name">{recommended.name}</p>
                  <p className="pd-similar-price">
                    ₹{recommended.price?.toFixed(2)}
                  </p>
                  {recommended.averageRating > 0 && (
                    <RatingStars
                      rating={recommended.averageRating}
                      totalReviews={recommended.totalReviews}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
