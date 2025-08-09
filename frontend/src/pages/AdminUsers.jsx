import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminUsers.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data.users ? data.users : data);
      } catch (error) {
        console.error("[AdminUsers] Fetch error:", error);
        toast.error("Failed to fetch users", { theme: "dark" });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const openModal = (action, user) => {
    setModalAction(action);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token || !selectedUser) return;

    try {
      if (modalAction === "Delete") {
        const res = await fetch(
          `http://localhost:5000/api/admin/users/${selectedUser._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setUsers(users.filter((u) => u._id !== selectedUser._id));
          toast.success("User deleted successfully", { theme: "dark" });
        } else {
          toast.error("Failed to delete user", { theme: "dark" });
        }
      }

      if (modalAction === "Block") {
        const res = await fetch(
          `http://localhost:5000/api/admin/users/${selectedUser._id}/block`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setUsers(
            users.map((u) =>
              u._id === selectedUser._id ? { ...u, blocked: true } : u
            )
          );
          toast.success("User blocked successfully", { theme: "dark" });
        } else {
          toast.error("Failed to block user", { theme: "dark" });
        }
      }

      if (modalAction === "Unblock") {
        const res = await fetch(
          `http://localhost:5000/api/admin/users/${selectedUser._id}/unblock`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setUsers(
            users.map((u) =>
              u._id === selectedUser._id ? { ...u, blocked: false } : u
            )
          );
          toast.success("User unblocked successfully", { theme: "dark" });
        } else {
          toast.error("Failed to unblock user", { theme: "dark" });
        }
      }
    } finally {
      setModalOpen(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users-container">
      <h1>👥 Registered Users</h1>
      <div className="admin-users-card">
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? (
          <p className="history-loading">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="history-empty">No users found.</p>
        ) : (
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/admin-users/${user._id}`)}
                    >
                      View
                    </button>
                    <button
                      className={user.blocked ? "btn-unblock" : "btn-block"}
                      onClick={() =>
                        openModal(user.blocked ? "Unblock" : "Block", user)
                      }
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => openModal("Delete", user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              Are you sure you want to {modalAction.toLowerCase()}{" "}
              <strong>{selectedUser?.name}</strong>?
            </h3>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleConfirm}>
                Yes, {modalAction}
              </button>
              <button className="btn-cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        theme="dark"
      />
    </div>
  );
};

export default AdminUsers;
