import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterMyArticles.css"; // Reuse styling

function AnmigamTempleBlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [languageFilter, setLanguageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (languageFilter) queryParams.push(`language=${languageFilter}`);
      if (statusFilter) queryParams.push(`status=${statusFilter}`);
      
      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
      const res = await API.get(`/api/anmigam/temple-blogs${queryString}`);
      setBlogs(res.data || []);
    } catch (error) {
      console.error("Error loading Temple Blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageFilter, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Temple Blog?")) return;
    try {
      await API.delete(`/api/anmigam/temple-blogs/${id}`);
      alert("Temple Blog deleted successfully!");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting Temple Blog:", error);
      alert(error.response?.data?.message || "Failed to delete temple blog");
    }
  };

  const handleAdminAction = async (id, action) => {
    try {
      if (action === "reject") {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return;
        if (!reason.trim()) {
          alert("Rejection reason is required");
          return;
        }
        await API.put(`/api/anmigam/temple-blogs/${id}/reject`, { reason });
      } else {
        await API.put(`/api/anmigam/temple-blogs/${id}/${action}`);
      }
      alert(`Temple Blog ${action}ed successfully!`);
      fetchBlogs();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(error.response?.data?.message || `Failed to ${action}`);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "published": return "badge-published";
      case "approved": return "badge-approved";
      case "submitted": return "badge-submitted";
      case "rejected": return "badge-rejected";
      case "draft": return "badge-draft";
      default: return "";
    }
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>Temple Blogs Management</h2>
        <div className="filter-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          
          <select 
            className="status-filter" 
            value={languageFilter} 
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>

          <select 
            className="status-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>

          <button 
            className="action-btn edit" 
            style={{ background: "var(--brand-gradient)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px" }}
            onClick={() => navigate("/admin/anmigam/temple-blogs/new")}
          >
            + Create Temple Blog
          </button>

        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading Temple Blogs...
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No Temple Blogs found.
          </div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>Blog Title</th>
                <th>Temple Name</th>
                <th>Location</th>
                <th>Language</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td className="article-title" style={{ fontWeight: 600 }}>{blog.title}</td>
                  <td>{blog.templeName || "-"}</td>
                  <td>{blog.location || "-"}</td>
                  <td>{blog.language === "ta" ? "Tamil" : "English"}</td>
                  <td>
                    <span className="reporter-name" style={{ fontWeight: 600 }}>
                      {blog.createdBy?.name || "Editor"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(blog.status)}`}>
                      {blog.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn edit" 
                      onClick={() => navigate(`/admin/anmigam/temple-blogs/edit/${blog._id}`)}
                      style={{ marginRight: "5px" }}
                    >
                      {role === "admin" && blog.status === "submitted" ? "Review" : "Edit"}
                    </button>

                    {role === "admin" && blog.status === "submitted" && (
                      <>
                        <button 
                          className="action-btn"
                          style={{ background: "#22c55e", color: "white", border: "none", padding: "6px 12px", marginRight: "5px" }}
                          onClick={() => handleAdminAction(blog._id, "approve")}
                        >
                          Approve
                        </button>
                        <button 
                          className="action-btn"
                          style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", marginRight: "5px" }}
                          onClick={() => handleAdminAction(blog._id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {role === "admin" && blog.status === "approved" && (
                      <button 
                        className="action-btn"
                        style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 12px", marginRight: "5px" }}
                        onClick={() => handleAdminAction(blog._id, "publish")}
                      >
                        Publish
                      </button>
                    )}

                    {(role === "admin" || (role === "editor" && blog.status === "draft")) && (
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(blog._id)}
                      >
                        Delete
                      </button>
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

export default AnmigamTempleBlogsList;
