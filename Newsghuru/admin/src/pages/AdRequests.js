import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import { FiCheck, FiX, FiRefreshCw, FiExternalLink, FiMail, FiPhone } from "react-icons/fi";
import "../styles/ReporterMyArticles.css";

function AdRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/ads/requests");
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error("Error fetching ad requests", err);
      alert("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await API.put(`/api/ads/requests/${id}/status`, { status });
      if (res.data.success) {
        alert(`Request status marked as ${status} successfully.`);
        fetchRequests();
      }
    } catch (err) {
      console.error("Error updating request status", err);
      alert("Failed to update status");
    }
  };

  const handleConvert = async (id) => {
    try {
      const res = await API.post(`/api/ads/requests/${id}/convert`);
      if (res.data.success) {
        // Save the prefill data to localStorage
        localStorage.setItem("convert_ad_prefill", JSON.stringify(res.data.prefill));
        alert("Converting request. Redirecting to advertisement creator...");
        navigate("/admin/ads/add");
      }
    } catch (err) {
      console.error("Error converting request", err);
      alert("Failed to convert request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return { background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0" };
      case "Rejected":
        return { background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5" };
      case "Pending":
      default:
        return { background: "#fffbeb", color: "#f59e0b", border: "1px solid #fde68a" };
    }
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <div>
          <h2>📥 Advertisement Inquiries & Requests</h2>
          <div className="header-subtitle">
            Review proposals submitted by companies seeking advertisement slots on NewsGhuru portals.
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: "20px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading ad inquiries...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No advertisement requests submitted yet.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>Company & Contact</th>
                <th>Contact Methods</th>
                <th>Requested Ad Type</th>
                <th>Proposal/Message</th>
                <th>Received Date</th>
                <th>Status</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)", display: "block" }}>{req.companyName}</strong>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Contact: {req.contactPerson}</span>
                      {req.website && (
                        <a 
                          href={req.website.startsWith("http") ? req.website : `http://${req.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "var(--accent-orange)", marginTop: "4px" }}
                        >
                          Visit Web <FiExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                      <FiMail size={12} style={{ color: "var(--text-muted)" }} />
                      <a href={`mailto:${req.email}`} style={{ color: "inherit" }}>{req.email}</a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <FiPhone size={12} style={{ color: "var(--text-muted)" }} />
                      <a href={`tel:${req.phone}`} style={{ color: "inherit" }}>{req.phone}</a>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">
                      {req.advertisementType}
                    </span>
                  </td>
                  <td style={{ maxWidth: "250px", fontSize: "12px", color: "var(--text-muted)" }}>
                    <div style={{ maxHeight: "80px", overflowY: "auto", whiteSpace: "pre-line" }}>
                      {req.message || <em style={{ color: "var(--text-muted)" }}>No description provided.</em>}
                    </div>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span style={{ 
                      ...getStatusColor(req.status),
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "inline-block"
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {req.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(req._id, "Approved")}
                            className="action-btn edit"
                            style={{ display: "inline-flex", alignItems: "center", gap: "3px", background: "#e6f4ea", color: "#137333", border: "1px solid #a7f3d0", padding: "4px 8px", borderRadius: "4px" }}
                            title="Mark as Approved"
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, "Rejected")}
                            className="action-btn delete"
                            style={{ display: "inline-flex", alignItems: "center", gap: "3px", background: "#fce8e6", color: "#c5221f", border: "1px solid #fca5a5", padding: "4px 8px", borderRadius: "4px" }}
                            title="Mark as Rejected"
                          >
                            <FiX /> Reject
                          </button>
                        </>
                      )}
                      
                      {req.status !== "Rejected" && (
                        <button
                          onClick={() => handleConvert(req._id)}
                          className="action-btn"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: "4px", fontWeight: 600, fontSize: "12px" }}
                          title="Convert to Campaign Campaign"
                        >
                          <FiRefreshCw size={12} /> Convert to Ad
                        </button>
                      )}
                    </div>
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

export default AdRequests;
