
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/login");
    onClose();
  };

  const handleAdminPanelClick = () => {
    localStorage.clear();
    navigate("/admin-login");
    onClose();
  };

  const handleAnalyzeClick = () => {
    navigate("/charts");
    onClose();
  };

  const handleSavedAnalysesClick = () => {
    navigate("/saved-analyses");
    onClose();
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>ExcelViz</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">✖</button>
      </div>
      <nav className="sidebar-nav">
        <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
        <Link to="/upload" onClick={onClose}>Upload File</Link>
        <Link to="/history" onClick={onClose}>History</Link>
        <button className="analyze-btn" onClick={handleAnalyzeClick}>
          Analyze
        </button>
        <button className="saved-analyses-btn" onClick={handleSavedAnalysesClick}>
          Saved Analyses
        </button>
        <button className="admin-panel-btn" onClick={handleAdminPanelClick}>
          Admin Panel
        </button>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
