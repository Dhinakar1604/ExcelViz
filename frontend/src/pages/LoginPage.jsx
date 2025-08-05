import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "../styles/LoginPage.css";
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        const token = data.token;
        const decoded = jwtDecode(token);
        const role = decoded.role || "user";
        const name = decoded.userName || decoded.name || "User";

        toast.success("Logged in successfully!", {
          style: {
            background: "#111111",
            color: "#ffffff",
            border: "1px solid #333",
            fontWeight: "bold",
            fontSize: "14px",
          },
        });

        setTimeout(() => {
          if (role === "admin") {
            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminName", name);
            localStorage.setItem("adminRole", "admin");
            navigate("/admin-dashboard");
          } else {
            localStorage.setItem("token", token);
            localStorage.setItem("userName", name);
            localStorage.setItem("userRole", "user");
            navigate("/dashboard");
          }
        }, 3000);
      } else {
        toast.error(`Login failed: ${data.message || "Invalid credentials"}`, {
          style: {
            background: "#1a1a1a",
            color: "#ff4d4f",
            border: "1px solid #660000",
            fontWeight: "bold",
          },
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("❌ Server error during login.", {
        style: {
          background: "#1a1a1a",
          color: "#ff4d4f",
          border: "1px solid #660000",
          fontWeight: "bold",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <header className="text-center mb-6 mt-4">
        <h1 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wide">
          📊 EXCEL VIZ
        </h1>
      </header>

      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="switch-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
