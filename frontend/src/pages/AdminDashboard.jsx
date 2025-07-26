import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Admin");
  const [usersCount, setUsersCount] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedName = localStorage.getItem("adminName");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    setUserName(storedName || "Admin");

    const fetchAdminData = async () => {
      try {
        // Get user and upload counts
        const response = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch admin dashboard data");
        const data = await response.json();
        setUsersCount(data.users || 0);
        setFilesUploaded(data.uploads || 0);

        // Get all user uploads for admin dashboard
        const filesRes = await fetch("http://localhost:5000/api/admin/uploads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filesData = await filesRes.json();
        setRecentFiles(filesData.files || []);
      } catch (error) {
        console.error("[AdminDashboard] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    navigate("/admin-login");
  }, [navigate]);

  const filteredFiles = recentFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className="dashboard-container"
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        <header className="dashboard-header">
          <button
            className="menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#e2e8f0",
              marginRight: "10px",
            }}
          >
            ☰
          </button>
          <div className="logo-title">📊ExcelViz Admin</div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="dashboard-main">
          {loading ? (
            <p>Loading admin dashboard...</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "15px 0" }}>
                <input
                  type="text"
                  placeholder="Search uploaded files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "12px 20px",
                    width: "80%",
                    maxWidth: "700px",
                    borderRadius: "25px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#e2e8f0",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "0.3s",
                    boxShadow: "0 0 12px rgba(0,0,0,0.3)",
                  }}
                />
              </div>

              <h1>Welcome back, {userName}!</h1>
              <p>Here’s your admin overview of ExcelViz activity</p>

              <div className="stats-cards">
                <div
                  className="card upload-card"
                  onClick={() => navigate("/admin-uploads")}
                  style={{ cursor: "pointer" }}
                >
                  <h3>📥 Manage Uploads</h3>
                  <p>Review and manage user uploads.</p>
                </div>

                <div
                  className="card chart-card"
                  onClick={() => navigate("/admin-users")}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{usersCount}</h3>
                  <p>Users Registered</p>
                </div>

                <div className="card file-card">
                  <h3>{filesUploaded}</h3>
                  <p>Files Uploaded</p>
                </div>
              </div>

              <section className="recent-files-section">
                <h2>Recent Uploaded Files</h2>
                {filteredFiles.length === 0 ? (
                  <p>No matching files found.</p>
                ) : (
                  <table className="recent-files-table">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Date Uploaded</th>
                        <th>Size (KB)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file, index) => (
                        <tr key={index}>
                          <td>{file.name}</td>
                          <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                          <td>{file.size ? (file.size / 1024).toFixed(2) : "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </main>

        <footer className="dashboard-footer">
          © 2025 ExcelViz. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
