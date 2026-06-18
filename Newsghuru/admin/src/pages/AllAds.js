import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../config/api";
import { FiEdit, FiTrash2, FiPlus, FiExternalLink, FiSearch, FiSliders, FiFilter } from "react-icons/fi";
import "../styles/ReporterMyArticles.css"; // Reuse table styling

function AllAds() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/ads");
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
  }, []);

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
      alert("Failed to delete advertisement");
    }
  };

  // Filter ads
  const filteredAds = ads.filter(ad => {
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
        return { background: "#e6f4ea", color: "#137333", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Scheduled":
        return { background: "#feefe3", color: "#b06000", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Expired":
        return { background: "#fce8e6", color: "#c5221f", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
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
          <h2>📢 All Advertisement Campaigns</h2>
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
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Add Ad Button */}
        <button 
          onClick={() => navigate("/admin/ads/add")} 
          className="btn-primary" 
          style={{ padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "5px", marginLeft: "auto" }}
        >
          <FiPlus /> Add Campaign
        </button>

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
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.map((ad) => {
                const imgUrl = ad.image.startsWith("http") ? ad.image : `${API.defaults.baseURL || "http://localhost:5000"}${ad.image}`;
                const adClickTrackUrl = `${API.defaults.baseURL || "http://localhost:5000"}/api/ads/${ad._id}/click`;
                
                return (
                  <tr key={ad._id}>
                    <td>
                      <div style={{ width: "60px", height: "45px", borderRadius: "4px", overflow: "hidden", background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
                        <img src={imgUrl} alt={ad.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "14px", display: "block" }}>{ad.title}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                          Advertiser: <strong>{ad.advertiserName}</strong> {ad.companyName && `(${ad.companyName})`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{ad.position}</span>
                    </td>
                    <td>
                      <span style={getStatusStyle(ad.status)}>{ad.status}</span>
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
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        
                        {/* Toggle active state */}
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

                        {/* Edit Button */}
                        <button
                          className="action-btn edit"
                          onClick={() => navigate(`/admin/ads/edit/${ad._id}`)}
                          title="Edit Campaign"
                        >
                          <FiEdit />
                        </button>

                        {/* Delete Button */}
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(ad._id, ad.title)}
                          title="Delete Campaign"
                        >
                          <FiTrash2 />
                        </button>

                      </div>
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

export default AllAds;
