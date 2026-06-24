import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterMyArticles.css"; // Reuse table styling

function AnmigamRasiPalanList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [languageFilter, setLanguageFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (languageFilter) queryParams.push(`language=${languageFilter}`);
      if (periodFilter) queryParams.push(`periodType=${periodFilter}`);
      if (statusFilter) queryParams.push(`status=${statusFilter}`);
      
      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
      const res = await API.get(`/api/anmigam/rasi-palan${queryString}`);
      setRecords(res.data || []);
    } catch (error) {
      console.error("Error loading Rasi Palan entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [languageFilter, periodFilter, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this horoscope record?")) return;
    try {
      await API.delete(`/api/anmigam/rasi-palan/${id}`);
      alert("Horoscope entry deleted successfully!");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(error.response?.data?.message || "Failed to delete record");
    }
  };

  const handleAdminAction = async (id, action) => {
    try {
      if (action === "reject") {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
          alert("Rejection reason is required");
          return;
        }
        await API.put(`/api/anmigam/rasi-palan/${id}/reject`, { reason });
      } else {
        await API.put(`/api/anmigam/rasi-palan/${id}/${action}`);
      }
      alert(`Horoscope ${action}ed successfully!`);
      fetchRecords();
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
        <h2>Rasi Palan Management</h2>
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
            value={periodFilter} 
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="">All Periods</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
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

          {role === "editor" && (
            <button 
              className="action-btn edit" 
              style={{ background: "var(--brand-gradient)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px" }}
              onClick={() => navigate("/admin/anmigam/rasi-palan/new")}
            >
              + Create Rasi Palan
            </button>
          )}

          {role === "admin" && (
            <button 
              className="action-btn edit" 
              style={{ background: "var(--brand-gradient)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px" }}
              onClick={() => navigate("/admin/anmigam/rasi-palan/new")}
            >
              + Add Rasi Palan (Direct)
            </button>
          )}

        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading records list...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No Rasi Palan records found.
          </div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>Date / Period</th>
                <th>Type</th>
                <th>Language</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const displayDate = new Date(record.date).toLocaleDateString();
                const displayEndDate = record.endDate ? ` to ${new Date(record.endDate).toLocaleDateString()}` : "";
                return (
                  <tr key={record._id}>
                    <td className="article-title" style={{ fontWeight: 600 }}>
                      {displayDate}{displayEndDate}
                      {record.dayName && <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>{record.dayName}</span>}
                    </td>
                    <td><span className="category-tag">{record.periodType.toUpperCase()}</span></td>
                    <td>{record.language === "ta" ? "Tamil" : "English"}</td>
                    <td>
                      <span className="reporter-name" style={{ fontWeight: 600 }}>
                        {record.createdBy?.name || "Editor"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn edit" 
                        onClick={() => navigate(`/admin/anmigam/rasi-palan/edit/${record._id}`)}
                        style={{ marginRight: "5px" }}
                      >
                        {role === "admin" && record.status === "submitted" ? "Review" : "Edit"}
                      </button>

                      {role === "admin" && record.status === "submitted" && (
                        <>
                          <button 
                            className="action-btn"
                            style={{ background: "#22c55e", color: "white", border: "none", padding: "6px 12px", marginRight: "5px" }}
                            onClick={() => handleAdminAction(record._id, "approve")}
                          >
                            Approve
                          </button>
                          <button 
                            className="action-btn"
                            style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", marginRight: "5px" }}
                            onClick={() => handleAdminAction(record._id, "reject")}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {role === "admin" && record.status === "approved" && (
                        <button 
                          className="action-btn"
                          style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 12px", marginRight: "5px" }}
                          onClick={() => handleAdminAction(record._id, "publish")}
                        >
                          Publish
                        </button>
                      )}

                      {(role === "admin" || (role === "editor" && record.status === "draft")) && (
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(record._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AnmigamRasiPalanList;
