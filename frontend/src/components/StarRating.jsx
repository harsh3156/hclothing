import React from "react";

const StarRating = ({ rating = 0, totalReviews = 0 }) => {
  if (!rating || rating <= 0) return null;
  const rounded = Math.round(rating); // show nearest whole-star as your home page does
  return (
    <div className="star-rating" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ color: "#FFD700", fontSize: 18 }}>
        {"★".repeat(rounded)}{"☆".repeat(5 - rounded)}
      </div>
      <div style={{ color: "#555", fontSize: 14 }}>
        {rating.toFixed(1)} / 5 {totalReviews ? `(${totalReviews})` : ""}
      </div>
    </div>
  );
};

export default StarRating;
