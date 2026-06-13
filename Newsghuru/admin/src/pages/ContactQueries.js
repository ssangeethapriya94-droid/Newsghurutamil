import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ContactQueries.css";
import { FaEnvelopeOpenText, FaTimes } from "react-icons/fa";

function ContactQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/contact");
      setQueries(res.data.data || []);
    } catch (error) {
      console.error("Fetch queries error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleMarkAsReviewed = async (id) => {
    try {
      await API.put(`/api/contact/${id}/review`);
      // Update local state
      setQueries(queries.map(q => q._id === id ? { ...q, status: "Reviewed" } : q));
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery({ ...selectedQuery, status: "Reviewed" });
      }
    } catch (error) {
      console.error("Review query error:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;
    try {
      await API.delete(`/api/contact/${id}`);
      setQueries(queries.filter(q => q._id !== id));
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error("Delete query error:", error);
      alert("Failed to delete query");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="contact-queries-page">
      <div className="header-actions">
        <div>
          <h2><FaEnvelopeOpenText /> Contact Queries & Subscriptions</h2>
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Manage messages and subscription requests from users.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading queries...</div>
      ) : queries.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", border: "2px dashed var(--border-color)", borderRadius: "8px" }}>
          No contact queries found.
        </div>
      ) : (
        <div className="table-container">
          <table className="queries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q._id}>
                  <td>{formatDate(q.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.category || "General"}</td>
                  <td>
                    <span className={`status-badge status-${q.status.toLowerCase()}`}>
                      {q.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn btn-view" onClick={() => setSelectedQuery(q)}>View</button>
                    {q.status === "Pending" && (
                      <button className="action-btn btn-review" onClick={() => handleMarkAsReviewed(q._id)}>Mark Reviewed</button>
                    )}
                    <button className="action-btn btn-delete" onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="query-modal-overlay" onClick={() => setSelectedQuery(null)}>
          <div className="query-modal-content" onClick={e => e.stopPropagation()}>
            <button className="query-modal-close" onClick={() => setSelectedQuery(null)}><FaTimes /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Query Details
            </h3>
            
            <div className="query-detail-item">
              <label>Name</label>
              <p>{selectedQuery.name}</p>
            </div>
            <div className="query-detail-item">
              <label>Email</label>
              <p>{selectedQuery.email}</p>
            </div>
            <div className="query-detail-item">
              <label>Phone</label>
              <p>{selectedQuery.phone || "N/A"}</p>
            </div>
            <div className="query-detail-item">
              <label>Category</label>
              <p>{selectedQuery.category || "General"}</p>
            </div>
            <div className="query-detail-item">
              <label>Message</label>
              <p>{selectedQuery.message || "No message provided."}</p>
            </div>
            
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              {selectedQuery.status === "Pending" && (
                <button className="action-btn btn-review" onClick={() => handleMarkAsReviewed(selectedQuery._id)}>
                  Mark as Reviewed
                </button>
              )}
              <button className="action-btn" style={{ background: "var(--bg-card)", color: "var(--text-main)", border: "1px solid var(--border-color)" }} onClick={() => setSelectedQuery(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactQueries;
