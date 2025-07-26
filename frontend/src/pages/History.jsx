import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/History.css";
import Sidebar from "../components/Sidebar";

const History = () => {
  const navigate = useNavigate();
  const [historyFiles, setHistoryFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHistoryFiles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/upload/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.files) {
          setHistoryFiles(data.files);
        } else {
          setHistoryFiles([]);
        }
      } catch (error) {
        console.error("Fetch history error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryFiles();
  }, [navigate]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className="history-container"
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        <h1>📂Your Upload History</h1>
        <section className="history-card">
          {loading ? (
            <p className="history-loading">Loading your files...</p>
          ) : historyFiles.length === 0 ? (
            <p className="history-empty">No files uploaded yet.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Uploaded At</th>
                  <th>Size (KB)</th>
                </tr>
              </thead>
              <tbody>
                {historyFiles.map((file, idx) => (
                  <tr key={idx}>
                    <td>{file.name}</td>
                    <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td>{file.size ? (file.size / 1024).toFixed(2) : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default History;
