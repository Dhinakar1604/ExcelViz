import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "User");
  const [chartsCreated, setChartsCreated] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (!storedName || storedName === "undefined") {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const extractedName = payload.userName || payload.name || "User";
        setUserName(extractedName);
        localStorage.setItem("userName", extractedName);
      } catch (error) {
        console.error("Token decode error:", error);
        setUserName("User");
      }
    } else {
      setUserName(storedName);
    }

    const fetchDashboardData = async () => {
      try {
        const [filesRes, statsRes] = await Promise.all([
          fetch("http://localhost:5000/api/upload/recent-files", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/analysis/user-stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const filesData = await filesRes.json();
        const statsData = await statsRes.json();

        setRecentFiles(filesData.files || []);
        setFilesUploaded(filesData.files?.length || 0);
        setChartsCreated(statsData.chartsCreated || 0);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  }, [navigate]);

  const handleAnalyze = useCallback((file) => {
    navigate("/charts", {
      state: {
        fileId: file._id || file.id || null,
        fileName: file.name || null,
      },
    });
  }, [navigate]);

  const handleDelete = useCallback((file) => {
    setFileToDelete(file);
  }, []);

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/upload/${fileToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setRecentFiles((prev) => prev.filter((f) => (f._id || f.id) !== fileToDelete._id));
      setFilesUploaded((prev) => Math.max(prev - 1, 0));

      toast.success(`"File Deleted Successfully`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting file");
    } finally {
      setFileToDelete(null);
    }
  };

  const handleUploadClick = useCallback(() => navigate("/upload"), [navigate]);
  const handleFilesUploadedClick = useCallback(() => navigate("/History"), [navigate]);
  const handleChartsCreatedClick = useCallback(() => navigate("/saved-analyses"), [navigate]);

  const filteredFiles = recentFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className="dashboard-container"
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
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
          <div className="logo-title">📊ExcelViz</div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="dashboard-main">
          {loading ? (
            <p>Loading your dashboard...</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "15px 0" }}>
                <input
                  type="text"
                  placeholder="🔍 Search your uploaded files..."
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
              <p>Here's an overview of your Excel analytics</p>

              <div className="stats-cards">
                <div className="card upload-card" onClick={handleUploadClick} style={{ cursor: "pointer" }}>
                  <h3>📥 Upload Excel File</h3>
                  <p>Import and analyze new data easily.</p>
                </div>

                <div className="card chart-card" onClick={handleChartsCreatedClick} style={{ cursor: "pointer" }}>
                  <h3>{chartsCreated}</h3>
                  <p>Charts Created</p>
                </div>

                <div className="card file-card" onClick={handleFilesUploadedClick} style={{ cursor: "pointer" }}>
                  <h3>{filesUploaded}</h3>
                  <p>Files Uploaded</p>
                </div>
              </div>

              <section className="recent-files-section">
                <h2>Recent Files</h2>
                {filteredFiles.length === 0 ? (
                  <p>No matching files found.</p>
                ) : (
                  <table className="recent-files-table">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Date Uploaded</th>
                        <th>Size (KB)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file, index) => (
                        <tr key={index}>
                          <td>{file.name}</td>
                          <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                          <td>{file.size ? (file.size / 1024).toFixed(2) : "N/A"}</td>
                          <td>
                            <button className="analyze-btn" onClick={() => handleAnalyze(file)}>
                              Analyze
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(file)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </main>
        <footer className="dashboard-footer">© 2025 ExcelViz. All rights reserved.</footer>
      </div>

      {/* Inline Confirmation Modal */}
      {fileToDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          tabIndex={-1}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "90%",
              width: "400px",
              boxSizing: "border-box",
              color: "white",
            }}
          >
            <h3 id="delete-dialog-title">
              Are you sure you want to delete <strong>{fileToDelete.name}</strong>?
            </h3>
            <p>This action cannot be undone.</p>
            <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
              <button
                onClick={confirmDelete}
                style={{ background: "darkred", color: "#fff", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setFileToDelete(null)}
                style={{ padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
