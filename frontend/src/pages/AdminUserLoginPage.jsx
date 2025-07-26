import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/AdminUserLoginPage.css";

const AdminUserLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("role", data.user.role);
        navigate("/dashboard"); 
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin1-login-container">
      <div className="admin1-login-card">
        <h1>📊 ExcelViz</h1>
        <h2>🔒 User Login</h2>
        {error && <p className="admin1-login-error">{error}</p>}
        <form className="admin1-login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="User Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login as User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUserLoginPage;
