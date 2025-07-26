import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    navigate("/admin-login");
    onClose();
    
  };

 const handleGoToUserPanel = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    navigate("/admin-user-login"); 
    onClose();
};


  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>ExcelViz Admin</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">✖</button>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin-dashboard" onClick={onClose}>Dashboard</Link>
        <Link to="/admin-users" onClick={onClose}>Users</Link>
        <Link to="/admin-user-history" onClick={onClose}>User History</Link>
        <button className="user-panel-btn" onClick={handleGoToUserPanel}>
  Go to User Panel
</button>

      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
