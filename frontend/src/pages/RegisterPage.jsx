import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleToggle = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Registering with:", formData);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful! Please login.", {
          style: {
            background: "#1f1f1f",
            color: "#00ffcc",
            border: "1px solid #333",
            fontWeight: "bold",
            fontSize: "14px",
          },
        });

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(`Registration failed: ${data.message || "Try again."}`, {
          style: {
            background: "#1f1f1f",
            color: "#ff4d4d",
            fontWeight: "bold",
            fontSize: "14px",
          },
        });
      }
    } catch (err) {
      console.error("❌ Server Error:", err);
      toast.error("❌ Server error. Please try again later.", {
        style: {
          background: "#1f1f1f",
          color: "#ff4d4d",
          fontWeight: "bold",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <header className="text-center mb-6 mt-4">
        <h1 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wide">
          📊EXCEL VIZ
        </h1>
      </header>

      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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

          {/* Role Toggle Section */}
          <div className="role-toggle-wrapper">
            <label className="role-toggle-label">Register As:</label>
            <div className="role-toggle-switch">
              <span
                className={`role-option ${formData.role === "user" ? "active" : ""}`}
                onClick={() => handleRoleToggle("user")}
              >
                User
              </span>
              <span
                className={`role-option ${formData.role === "admin" ? "active" : ""}`}
                onClick={() => handleRoleToggle("admin")}
              >
                Admin
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
