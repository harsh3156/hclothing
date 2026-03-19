import React from "react";
import "./CustomInput.css";

const CustomInput = ({ label, ...props }) => {
  return (
    <div className="custom-input">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
};

export default CustomInput;
