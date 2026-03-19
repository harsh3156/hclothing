import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* 1. Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/products">Products</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>

          </ul>
        </div>

        {/* 2. Customer Service */}
        <div className="footer-section service">
          <h3>Customer Service</h3>
          <ul>
            <li>Track Order</li>
            <li>Shipping & Returns</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>

        {/* 3. Contact & Social Media */}
        <div className="footer-section contact">
          <h3>Contact Info</h3>
          <p>📧 Email: harshkaklotar09@gmail.com</p>
          <p>📞 Phone: 7575826485</p>
          <p>📍 Address: vivekanand college, Surat</p>

          <div className="social-icons">
            {/* For actual icons, you would use an icon library (e.g., FaFacebook) */}
            <a href="https://facebook.com" aria-label="Facebook"><span role="img" aria-label="Facebook">📘</span></a>
            <a href="https://twitter.com" aria-label="Twitter"><span role="img" aria-label="Twitter">🐦</span></a>
            <a href="https://instagram.com" aria-label="Instagram"><span role="img" aria-label="Instagram">📸</span></a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} My E-commerce. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;