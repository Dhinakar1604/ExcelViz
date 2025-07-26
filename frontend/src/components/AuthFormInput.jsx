// src/components/AuthFormInput.jsx
import React from "react";

// src/components/AuthFormInput.jsx
const AuthFormInput = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default AuthFormInput;


