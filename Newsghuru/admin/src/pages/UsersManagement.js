import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // New User Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reporter");
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/users/list");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      alert("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !role) {
      alert("All fields are required to create a user");
      return;
    }

    try {
      await API.post("/api/users/create", {
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("reporter");
      alert("User created successfully 🎉");
      fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);
      alert(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim() || !editEmail.trim() || !editRole) {
      alert("Fields cannot be empty");
      return;
    }

    try {
      await API.put(`/api/users/${id}/role`, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole
      });
      setEditingId(null);
      alert("User account updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Update user error:", error);
      alert(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to delete the user account for "${userName}"?`)) {
      return;
    }

    try {
      await API.delete(`/api/users/${id}`);
      alert("User account deleted successfully 🗑️");
      fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const getRoleClass = (r) => {
    if (r === "admin") return "badge-published"; // green
    if (r === "editor") return "badge-approved"; // indigo
    return "badge-submitted"; // blue
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>👥 Users Management</h2>
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Manage Reporter, Editor, and Admin accounts.
        </div>
      </div>

      {/* CREATE ACCOUNT FORM */}
      <form onSubmit={handleCreate} style={{ display: "flex", gap: "12px", marginBottom: "30px", background: "var(--bg-light)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color)", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: "150px" }}>
          <label style={{ fontWeight: 600, fontSize: "13px" }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: "180px" }}>
          <label style={{ fontWeight: 600, fontSize: "13px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. reporter@newsghuru.com"
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: "150px" }}>
          <label style={{ fontWeight: 600, fontSize: "13px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "130px" }}>
          <label style={{ fontWeight: 600, fontSize: "13px" }}>System Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none", background: "white", color: "black", cursor: "pointer" }}
          >
            <option value="reporter">Reporter</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ height: "38px", background: "var(--primary-blue)", color: "white", border: "none", padding: "0 20px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
        >
          Create User
        </button>
      </form>

      {/* USER LIST TABLE */}
      <div className="table-container">
        {loading && users.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No users found.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id}>
                  <td>
                    {editingId === userItem._id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", width: "95%" }}
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{userItem.name}</span>
                    )}
                  </td>
                  <td>
                    {editingId === userItem._id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", width: "95%" }}
                      />
                    ) : (
                      <span>{userItem.email}</span>
                    )}
                  </td>
                  <td>
                    {editingId === userItem._id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
                      >
                        <option value="reporter">Reporter</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${getRoleClass(userItem.role)}`}>
                        {userItem.role.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === userItem._id ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => handleUpdate(userItem._id)}
                          style={{ color: "#10b981" }}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "15px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => startEdit(userItem)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(userItem._id, userItem.name)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UsersManagement;
