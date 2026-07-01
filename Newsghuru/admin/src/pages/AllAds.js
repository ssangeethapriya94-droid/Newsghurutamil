import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../config/api";
import { FiEdit, FiTrash2, FiPlus, FiExternalLink, FiSearch, FiSliders, FiFilter } from "react-icons/fi";
import { FaEye, FaTimes } from "react-icons/fa";
import "../styles/ReporterMyArticles.css"; // Reuse table styling

function AllAds() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState((location.state && location.state.statusFilter) || "all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [previewAd, setPreviewAd] = useState(null);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Decoded userId from JWT token
  let userId = "";
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      userId = JSON.parse(jsonPayload).userId;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/ads?language=${languageFilter}`);
      if (res.data.success) {
        setAds(res.data.ads);
      }
    } catch (err) {
      console.error("Error fetching advertisements", err);
      alert("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [languageFilter]);

  const handleToggleActive = async (id, title, currentState) => {
    try {
      const res = await API.put(`/api/ads/${id}/toggle`);
      if (res.data.success) {
        alert(`Advertisement campaign "${title}" ${!currentState ? "activated" : "deactivated"} successfully.`);
        fetchAds();
      }
    } catch (err) {
      console.error("Error toggling active state", err);
      alert("Failed to update active state");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the advertisement "${title}"?`)) {
      return;
    }

    try {
      const res = await API.delete(`/api/ads/${id}`);
      if (res.data.success) {
        alert("Advertisement campaign deleted successfully.");
        fetchAds();
      }
    } catch (err) {
      console.error("Error deleting advertisement", err);
      alert(err.response?.data?.message || "Failed to delete advertisement");
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      const res = await API.put(`/api/ads/${id}`, { status: "Pending Approval" });
      if (res.data.success) {
        alert("Advertisement submitted for approval successfully 🎉");
        fetchAds();
      }
    } catch (err) {
      console.error("Error submitting ad for approval", err);
      alert("Failed to submit advertisement");
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/api/ads/${id}/approve-campaign`);
      if (res.data.success) {
        alert(res.data.message || "Advertisement approved successfully!");
        fetchAds();
      }
    } catch (err) {
      console.error("Error approving ad", err);
      alert(err.response?.data?.message || "Failed to approve advertisement");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Please enter a reason for rejecting this advertisement campaign:");
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    try {
      const res = await API.put(`/api/ads/${id}/reject-campaign`, { rejectionReason: reason });
      if (res.data.success) {
        alert(res.data.message || "Advertisement rejected successfully.");
        fetchAds();
      }
    } catch (err) {
      console.error("Error rejecting ad", err);
      alert(err.response?.data?.message || "Failed to reject advertisement");
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await API.put(`/api/ads/${id}/publish`);
      if (res.data.success) {
        alert("Advertisement published and activated successfully!");
        fetchAds();
      }
    } catch (err) {
      console.error("Error publishing ad", err);
      alert("Failed to publish advertisement");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      const res = await API.put(`/api/ads/${id}/unpublish`);
      if (res.data.success) {
        alert("Advertisement unpublished and removed from panel successfully.");
        fetchAds();
      }
    } catch (err) {
      console.error("Error unpublishing ad", err);
      alert("Failed to unpublish advertisement");
    }
  };

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.advertiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ad.companyName && ad.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPosition = positionFilter === "all" || ad.position === positionFilter;
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
      case "Published":
        return { background: "#e6f4ea", color: "#137333", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Approved":
        return { background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Pending Approval":
        return { background: "#feefe3", color: "#b06000", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Scheduled":
        return { background: "#faf5ff", color: "#6b21a8", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Expired":
        return { background: "#fce8e6", color: "#c5221f", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Rejected":
        return { background: "#fee2e2", color: "#ef4444", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Draft":
        return { background: "#f1f3f4", color: "#3c4043", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Inactive":
      default:
        return { background: "#f1f3f4", color: "#3c4043", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return { color: "#ef4444", fontWeight: "bold" };
      case "Medium":
        return { color: "#3b82f6", fontWeight: "bold" };
      case "Low":
      default:
        return { color: "#6b7280", fontWeight: "bold" };
    }
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <div>
          <h2>📢 Advertisement Campaigns</h2>
          <div className="header-subtitle">
            Manage newspaper-style banner banners, click rates, active scheduling, and tracking indicators.
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", margin: "20px 0", background: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", alignItems: "center" }}>
        
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", background: "var(--input-bg)", border: "1.5px solid var(--input-border)", padding: "8px 12px", borderRadius: "12px", flex: "1", minWidth: "200px" }}>
          <FiSearch style={{ color: "var(--text-muted)", marginRight: "8px" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns, advertisers..."
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14.5px", color: "var(--text-main)" }}
          />
        </div>

        {/* Position Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}><FiFilter /> Position:</span>
          <select 
            value={positionFilter} 
            onChange={(e) => setPositionFilter(e.target.value)}
            className="dropdown-field"
            style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="all">All Positions</option>
            <option value="HEADER_BANNER">HEADER_BANNER</option>
            <option value="TOP_BANNER">TOP_BANNER</option>
            <option value="SIDEBAR">SIDEBAR</option>
            <option value="SECTION_BANNER">SECTION_BANNER</option>
            <option value="ARTICLE_ADVERTISEMENT">ARTICLE_ADVERTISEMENT</option>
            <option value="POPUP_ADVERTISEMENT">POPUP_ADVERTISEMENT</option>
            <option value="FLOATING_ADVERTISEMENT">FLOATING_ADVERTISEMENT</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}><FiSliders /> Status:</span>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dropdown-field"
            style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
            <option value="Inactive">Inactive</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Language Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}><FiSliders /> Language:</span>
          <select 
            value={languageFilter} 
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="dropdown-field"
            style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="all">All Languages</option>
            <option value="both">Both (Tamil + English)</option>
            <option value="ta">Tamil Only</option>
            <option value="en">English Only</option>
          </select>
        </div>

        {/* Add Ad Button */}
        {(role === "admin" || role === "editor") && (
        <button 
          onClick={() => navigate("/admin/ads/add")} 
          className="btn-primary" 
          style={{ padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "5px", marginLeft: "auto" }}
        >
          <FiPlus /> Add Campaign
        </button>
        )}

      </div>

      {/* TABLE */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading campaigns...</div>
        ) : filteredAds.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No advertisement campaigns found.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Banner</th>
                <th>Campaign Details</th>
                <th>Position</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Scheduling Dates</th>
                <th style={{ textAlign: "center" }}>Clicks</th>
                <th style={{ textAlign: "center" }}>Impressions</th>
                <th style={{ textAlign: "center" }}>CTR</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.map((ad) => {
                const imgUrl = ad.image.startsWith("http") ? ad.image : `${API.defaults.baseURL || "http://localhost:5000"}${ad.image}`;
                const adClickTrackUrl = `${API.defaults.baseURL || "http://localhost:5000"}/api/ads/${ad._id}/click`;
                const createdByStr = ad.createdBy ? (typeof ad.createdBy === "object" ? ad.createdBy._id : ad.createdBy) : "";
                const isOwnDraft = role === "editor" && createdByStr === userId;
                
                const canEdit = role === "admin" || (role === "editor" && isOwnDraft && (ad.status === "Draft" || ad.status === "Rejected"));
                const canDelete = role === "admin" || (role === "editor" && isOwnDraft && ad.status === "Draft");

                return (
                  <tr key={ad._id}>
                    <td>
                      <div style={{ width: "60px", height: "45px", borderRadius: "4px", overflow: "hidden", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
                        <img src={imgUrl} alt={ad.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px" }}>{ad.title}</span>
                          <span style={{
                            background: ad.language === "en" ? "#e0f2fe" : ad.language === "ta" ? "#fef3c7" : "#f1f5f9",
                            color: ad.language === "en" ? "#0369a1" : ad.language === "ta" ? "#b45309" : "#475569",
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            textTransform: "uppercase"
                          }}>
                            {ad.language === "en" ? "English" : ad.language === "ta" ? "Tamil" : "Both"}
                          </span>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                          Advertiser: <strong>{ad.advertiserName}</strong> {ad.companyName && `(${ad.companyName})`}
                        </span>
                        <span style={{ fontSize: "12px", display: "block", marginTop: "4px" }}>
                          💰 Paid: <strong style={{ color: "#ea580c" }}>₹{(ad.amountPaid || 0).toLocaleString()}</strong> ({ad.paymentMethod}) — <span style={{
                            color: ad.paymentStatus === "Paid" ? "#10b981" : ad.paymentStatus === "Refunded" ? "#f97316" : "#6b7280",
                            fontWeight: "bold"
                          }}>{ad.paymentStatus}</span>
                        </span>
                        {ad.rejectionReason && ad.status === "Rejected" && (
                          <span style={{ fontSize: "11px", color: "#ef4444", display: "block", marginTop: "2px" }}>
                            Rejection Reason: {ad.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{ad.position}</span>
                    </td>
                    <td>
                      <span style={getStatusStyle(ad.status)}>{ad.status || "Draft"}</span>
                    </td>
                    <td>
                      <span style={getPriorityStyle(ad.priority)}>{ad.priority}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      <div>
                        <strong>Start:</strong> {new Date(ad.startDate).toLocaleDateString()} at {ad.startTime}
                      </div>
                      <div>
                        <strong>End:</strong> {new Date(ad.endDate).toLocaleDateString()} at {ad.endTime}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{ad.clicks}</td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{ad.impressions}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#10b981" }}>{ad.ctr}%</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                        
                        {/* Toggle active state (Admin only) */}
                        {role === "admin" && (
                          <button
                            onClick={() => handleToggleActive(ad._id, ad.title, ad.isActive)}
                            title={ad.isActive ? "Deactivate Campaign" : "Activate Campaign"}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                              color: ad.isActive ? "#10b981" : "#94a3b8",
                              fontWeight: "bold",
                              padding: 0
                            }}
                          >
                            {ad.isActive ? "ON" : "OFF"}
                          </button>
                        )}

                        {/* Test Click Redirection */}
                        <a
                          href={adClickTrackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Test Target URL Redirection"
                          style={{ color: "#3b82f6", display: "flex", alignItems: "center" }}
                        >
                          <FiExternalLink />
                        </a>

                        {/* Preview Option Button */}
                        <button
                          onClick={() => setPreviewAd(ad)}
                          title="Preview Advertisement Campaign"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--accent-orange, #f97316)",
                            fontSize: "14px",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          <FaEye />
                        </button>

                        {/* Edit Button */}
                        {canEdit && (
                          <button
                            className="action-btn edit"
                            onClick={() => navigate(`/admin/ads/edit/${ad._id}`)}
                            title="Edit Campaign"
                          >
                            <FiEdit />
                          </button>
                        )}

                        {/* Delete Button */}
                        {canDelete && (
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(ad._id, ad.title)}
                            title="Delete Campaign"
                          >
                            <FiTrash2 />
                          </button>
                        )}

                        {/* Submit for Approval (Editor own drafts/rejected) */}
                        {role === "editor" && isOwnDraft && (ad.status === "Draft" || ad.status === "Rejected" || !ad.status) && (
                          <button
                            onClick={() => handleSubmitForApproval(ad._id)}
                            style={{
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          >
                            Submit
                          </button>
                        )}

                        {/* Admin Approvals & Publishing */}
                        {role === "admin" && ad.status === "Pending Approval" && (
                          <>
                            <button
                              onClick={() => handleApprove(ad._id)}
                              style={{
                                background: "#10b981",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(ad._id)}
                              style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {role === "admin" && ad.status === "Approved" && (
                          <button
                            onClick={() => handlePublish(ad._id)}
                            style={{
                              background: "#ea580c",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          >
                            Publish
                          </button>
                        )}

                        {role === "admin" && ["Active", "Scheduled", "Expired"].includes(ad.status) && (
                          <button
                            onClick={() => handleUnpublish(ad._id)}
                            style={{
                              background: "#6b7280",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          >
                            Unpublish
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* FULLSCREEN AD PREVIEW MODAL */}
      {previewAd && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            padding: "25px", borderRadius: "12px",
            width: "100%", maxWidth: "550px",
            border: "1px solid var(--border-color, #cbd5e1)",
            position: "relative",
            color: "var(--text-main, #000000)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <button
              onClick={() => setPreviewAd(null)}
              style={{
                position: "absolute", top: "15px", right: "15px",
                background: "none", border: "none", color: "var(--text-main, #000000)",
                fontSize: "20px", cursor: "pointer", zIndex: 10
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ color: "var(--text-main)", marginBottom: "15px", fontSize: "1.3rem", paddingRight: "30px", fontFamily: "var(--font-serif)" }}>
              📢 Ad Campaign Preview
            </h3>

            {/* Banner Image */}
            <div style={{ width: "100%", height: "200px", borderRadius: "8px", overflow: "hidden", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
              <img 
                src={previewAd.image.startsWith("http") ? previewAd.image : `${API.defaults.baseURL || "http://localhost:5000"}${previewAd.image}`} 
                alt={previewAd.title} 
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
              />
            </div>

            {/* Campaign Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", lineHeight: "1.6" }}>
              <div>
                <strong>Campaign Title:</strong> <span style={{ color: "var(--accent-orange, #f97316)", fontWeight: "bold" }}>{previewAd.title}</span>
              </div>
              {previewAd.companyName && (
                <div>
                  <strong>Company / Brand:</strong> {previewAd.companyName}
                </div>
              )}
              {previewAd.description && (
                <div>
                  <strong>Description:</strong> {previewAd.description}
                </div>
              )}
              <div>
                <strong>Position / Location:</strong> <span className="category-tag">{previewAd.position}</span>
              </div>
              <div>
                <strong>Priority:</strong> <span style={{ fontWeight: "bold", color: previewAd.priority === "High" ? "#ef4444" : previewAd.priority === "Medium" ? "#3b82f6" : "#6b7280" }}>{previewAd.priority}</span>
              </div>
              <div>
                <strong>Payment Details:</strong> <span style={{ color: "#ea580c", fontWeight: "bold" }}>₹{(previewAd.amountPaid || 0).toLocaleString()}</span> via <strong>{previewAd.paymentMethod}</strong> (<span style={{
                  color: previewAd.paymentStatus === "Paid" ? "#10b981" : previewAd.paymentStatus === "Refunded" ? "#f97316" : "#6b7280",
                  fontWeight: "bold"
                }}>{previewAd.paymentStatus}</span>)
              </div>
              <div>
                <strong>Target Link:</strong> <a href={previewAd.targetUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", wordBreak: "break-all" }}>{previewAd.targetUrl}</a>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "10px", paddingTop: "10px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--text-main)", fontSize: "14px" }}>Advertiser Information:</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                  <div><strong>Name:</strong> {previewAd.advertiserName}</div>
                  <div><strong>Phone:</strong> {previewAd.advertiserPhone}</div>
                  <div style={{ gridColumn: "span 2" }}><strong>Email:</strong> {previewAd.advertiserEmail}</div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "10px", paddingTop: "10px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--text-main)", fontSize: "14px" }}>Publication Timeline:</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                  <div><strong>Start:</strong> {new Date(previewAd.startDate).toLocaleDateString()} at {previewAd.startTime}</div>
                  <div><strong>End:</strong> {new Date(previewAd.endDate).toLocaleDateString()} at {previewAd.endTime}</div>
                </div>
              </div>

              {previewAd.rejectionReason && previewAd.status === "Rejected" && (
                <div style={{ borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.08)", padding: "10px", borderRadius: "4px", marginTop: "10px", color: "#f87171" }}>
                  <strong>Rejection Reason:</strong> {previewAd.rejectionReason}
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "25px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
              <button 
                onClick={() => setPreviewAd(null)}
                className="btn-secondary"
                style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px" }}
              >
                Close
              </button>

              {/* Submit for Approval (Editor own drafts/rejected) */}
              {role === "editor" && (previewAd.status === "Draft" || previewAd.status === "Rejected" || !previewAd.status) && (
                <button
                  onClick={() => {
                    handleSubmitForApproval(previewAd._id);
                    setPreviewAd(null);
                  }}
                  style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                >
                  Submit for Approval
                </button>
              )}

              {/* Admin Actions */}
              {role === "admin" && previewAd.status === "Pending Approval" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(previewAd._id);
                      setPreviewAd(null);
                    }}
                    style={{ background: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(previewAd._id);
                      setPreviewAd(null);
                    }}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                  >
                    Reject Campaign
                  </button>
                </>
              )}

              {role === "admin" && previewAd.status === "Approved" && (
                <button
                  onClick={() => {
                    handlePublish(previewAd._id);
                    setPreviewAd(null);
                  }}
                  style={{ background: "#ea580c", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                >
                  Publish Campaign
                </button>
              )}

              {role === "admin" && ["Active", "Scheduled", "Expired"].includes(previewAd.status) && (
                <button
                  onClick={() => {
                    handleUnpublish(previewAd._id);
                    setPreviewAd(null);
                  }}
                  style={{ background: "#6b7280", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                >
                  Unpublish Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllAds;
