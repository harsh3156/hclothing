import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  const features = [
    {
      title: "Quality Products",
      desc: "We carefully choose products that are stylish, reliable, and worth your money.",
      icon: "✨",
    },
    {
      title: "Fast Delivery",
      desc: "Quick and secure delivery so your shopping experience stays smooth and stress-free.",
      icon: "🚚",
    },
    {
      title: "Affordable Prices",
      desc: "Trendy and useful products at prices that fit your budget.",
      icon: "💸",
    },
    {
      title: "Customer Support",
      desc: "Friendly support team always ready to help you with your orders and queries.",
      icon: "💬",
    },
  ];

  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-overlay"></div>
        <div className="about-content">
          <span className="about-tag">Welcome to My E-commerce</span>
          <h1>Shopping Made Simple, Stylish & Smart</h1>
          <p>
            At My E-commerce, we believe online shopping should feel exciting,
            easy, and trustworthy. Our goal is to bring you quality products,
            great prices, and a smooth shopping experience all in one place.
          </p>

          <div className="about-buttons">
            <button className="primary-btn">Explore Products</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </div>

      <div className="about-section">
        <div className="about-box">
          <h2>Who We Are</h2>
          <p>
            We are a passionate team focused on creating a better online
            shopping experience for everyone. From fashion to lifestyle
            essentials, we aim to provide products that match your needs and
            style.
          </p>
          <p>
            Our platform is built with a customer-first mindset, where quality,
            convenience, and satisfaction always come first.
          </p>
        </div>

        <div className="about-stats">
          <div className="stat-card">
            <h3>10K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-card">
            <h3>500+</h3>
            <p>Premium Products</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
          <div className="stat-card">
            <h3>99%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Us</h2>
        <p className="features-subtitle">
          We combine quality, affordability, and convenience to give you the
          best shopping experience.
        </p>

        <div className="features-grid">
          {features.map((item, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-footer-card">
        <h2>Our Mission</h2>
        <p>
          To make online shopping more enjoyable, accessible, and reliable by
          offering excellent products with a modern and user-friendly
          experience.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;