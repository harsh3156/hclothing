import React from "react";
import "./CustomButton.css";

const CustomButton = ({ children, ...props }) => {
  return (
    <button {...props} className="custom-button">
      {children}
    </button>
  );
};

export default CustomButton;
