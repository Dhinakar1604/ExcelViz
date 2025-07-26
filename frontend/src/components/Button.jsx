
import React from "react";

const Button = ({ children, onClick, className, type = "button" }) => (
  <button
    onClick={onClick}
    type={type}
    className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition ${className}`}
  >
    {children}
  </button>
);

export default Button;
