// src/pages/ContactUs.jsx
import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-container">
      <h2>Contact Us</h2>

      <div className="contact-info">
        <p><strong>Name:</strong> Harsh</p>
        <p><strong>Address:</strong> vivekanand college, Surat</p>
        <p><strong>Phone:</strong> 7575826485</p>
      </div>

      <div className="contact-map">
        <iframe
          title="Khodiar Nagar, Surat"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.227410346871!2d72.51112211488208!3d21.199783785948226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04fb8dff648fd%3A0x1d2efbbbe3708bb0!2sKhodiar%20Nagar%2C%20Surat%2C%20Gujarat%20395007!5e0!3m2!1sen!2sin!4v1695560076301!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactUs;
