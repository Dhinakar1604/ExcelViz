import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Admin login failed");
        return;
      }

      if (data.user.role !== "admin") { // ✅ FIXED HERE
        setError("Access Denied: Not an admin");
        return;
      }

      // Clear previous user tokens
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.user.name);
      localStorage.setItem("adminRole", data.user.role);

      navigate("/admin-dashboard");
    } catch (err) {
      console.error(err);
      setError("Server error during admin login");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1 className="app-title">📊ExcelViz</h1>
        <h2> 🔒  Admin Login</h2>
        {error && <p className="admin-login-error">{error}</p>}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
