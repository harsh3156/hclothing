import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";

import { AuthContext } from "../context/AuthContext";
import "./Home.css";

// --- Rating Component ---
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
        ({normalizedRating.toFixed(1)}{totalReviews > 0 ? ` / ${totalReviews}` : ''})
      </span>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  
  const [productLoading, setProductLoading] = useState(true);
  const [adLoading, setAdLoading] = useState(true);
  const [productError, setProductError] = useState(null);
  const [adError, setAdError] = useState(null);
  
  const navigate = useNavigate();
  useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductLoading(true);
      setProductError(null);
      try {
        const { data } = await axios.get("http://localhost:5000/api/products");
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProductError("Invalid data format received for products.");
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProductError("Failed to load products. Check server connection.");
      } finally {
        setProductLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      setAdLoading(true);
      setAdError(null);
      try {
        const { data } = await axios.get("http://localhost:5000/api/ads");
        if (Array.isArray(data)) {
          setAds(data);
        } else {
          setAdError("Invalid data format received for ads.");
        }
      } catch (err) {
        console.error("Failed to fetch ads:", err);
        setAdError("Failed to load advertisements.");
      } finally {
        setAdLoading(false);
      }
    };
    fetchAds();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  return (
    <div className="main-container">

      {/* 🔹 Advertisement Slider Section */}
      <div className="ad-section">
        {adLoading ? (
          <div className="ad-loading">Loading advertisements...</div>
        ) : adError ? (
          <div className="ad-error">⚠️ {adError}</div>
        ) : ads.length > 0 ? (
          <div className="main-ad-slider">
            <Slider {...settings}>
              {ads.map((ad) => (
                <div key={ad._id} className="ad-slide-item">
                  <a href={ad.link || "#"} target="_blank" rel="noreferrer">
                    <img
                      src={`http://localhost:5000/public/images/ads/${ad.image}`}
                      alt="advertisement banner"
                    />
                  </a>
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="ad-empty">No current advertisements.</div>
        )}
      </div>

      {/* 🔹 Products Section */}
      <div className="products-section">
        <h2>Featured Products</h2>
        {productLoading ? (
          <div className="product-loading">⏳ Loading products...</div>
        ) : productError ? (
          <div className="product-error">❌ {productError}</div>
        ) : products.length > 0 ? (
          <>
            <div className="main-product-grid">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="main-product-card"
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  <img
                    src={`http://localhost:5000/public/images/${p.image}`}
                    alt={p.name}
                  />
                  <div className="card-details">
                    <h3>{p.name}</h3>
                    {p.averageRating !== undefined && p.averageRating > 0 ? (
                      <RatingStars
                        rating={p.averageRating}
                        totalReviews={p.totalReviews}
                      />
                    ) : (
                      <p className="no-rating">No ratings yet</p>
                    )}
                    <p className="product-price">₹{p.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Button to navigate to full Products page */}
            <div className="view-more-container">
              <button
                className="view-more-btn"
                onClick={() => navigate("/products")}
              >
                View All Products →
              </button>
            </div>
          </>
        ) : (
          <div className="product-empty">No products available at this time.</div>
        )}
      </div>
    </div>
  );
};

export default Home;
