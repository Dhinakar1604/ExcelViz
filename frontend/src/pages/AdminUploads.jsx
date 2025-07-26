import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminUploads.css";

const AdminUploads = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }

    const fetchUploads = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/uploads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUploads(data.files || []);
      } catch (error) {
        console.error("[AdminUploads] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, [navigate]);

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/uploads/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUploads(uploads.filter((file) => file._id !== fileId));
      } else {
        alert("Failed to delete file");
      }
    } catch (error) {
      console.error("[AdminUploads] Delete error:", error);
    }
  };

  const filteredUploads = uploads.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-uploads-container">
      <h1>📂Manage Uploads</h1>
      <input
        type="text"
        placeholder="Search files by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Loading uploads...</p>
      ) : filteredUploads.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>File Name</th>
              <th>Size (KB)</th>
              <th>Uploaded On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUploads.map((file) => (
              <tr key={file._id}>
                <td>{file.userName || "N/A"}</td>
                <td>{file.name}</td>
                <td>{(file.size / 1024).toFixed(2)}</td>
                <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                <td>
                <button
  className="delete-btn"
  onClick={() => handleDelete(file._id)}
>
  Delete
</button>

<button
  className="analyze-btn"
  onClick={() => navigate(`/analyze/${file._id}`)}
>
  Analyze
</button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUploads;
