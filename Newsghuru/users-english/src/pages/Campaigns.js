import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import { FaPlus, FaWallet, FaBullhorn, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import "../styles/CategoryPage.css";

const Campaigns = ({ openLoginPopup }) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("readerToken");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchMyCampaigns = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/ads/user-campaigns/my?language=en", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setCampaigns(res.data.campaigns || []);
          setWalletBalance(res.data.walletBalance || 0);
        }
      } catch (err) {
        console.error("Error fetching user campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCampaigns();
  }, [token]);

  if (!token) {
    return (
      <div className="cat-page-container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ background: "var(--card-bg, #fff)", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", maxWidth: "480px" }}>
          <FaBullhorn style={{ fontSize: "3rem", color: "var(--accent-orange, #ea580c)", marginBottom: "15px" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "10px" }}>Ad Campaign Dashboard</h2>
          <p style={{ color: "var(--text-muted, #666)", marginBottom: "25px" }}>Please login to manage your advertisement campaigns and submit new hostings.</p>
          <button
            style={{ background: "var(--brand-gradient, linear-gradient(135deg, #ea580c 0%, #d97706 100%))", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
            onClick={() => openLoginPopup && openLoginPopup()}
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status, rejectionReason, paymentStatus) => {
    switch (status) {
      case "Active":
        return <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><FaCheckCircle /> Active</span>;
      case "Pending Approval":
      case "Draft":
        return <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><FaClock /> Pending Approval</span>;
      case "Scheduled":
        return <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><FaClock /> Scheduled</span>;
      case "Rejected":
        return <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}><FaTimesCircle /> Rejected</span>;
      default:
        return <span style={{ background: "#f3f4f6", color: "#4b5563", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700" }}>{status}</span>;
    }
  };

  return (
    <div className="cat-page-container" style={{ padding: "30px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: "2px solid var(--border-color, #eee)", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary, #111)", marginBottom: "5px" }}>
            📢 Ad Campaign Manager
          </h1>
          <p style={{ color: "var(--text-muted, #666)", fontSize: "0.95rem" }}>
            Host your brand advertisements directly on NewsGhuru digital portal.
          </p>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {/* WALLET CARD */}
          <div style={{ background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)", color: "#fff", padding: "10px 20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 4px 15px rgba(234,88,12,0.35)" }}>
            <FaWallet style={{ fontSize: "1.5rem", color: "#fff" }} />
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.9)", fontWeight: "600" }}>Wallet Balance</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#fff" }}>₹{walletBalance.toLocaleString()}</div>
            </div>
          </div>

          {/* CREATE BTN */}
          <button
            onClick={() => navigate("/create-campaign")}
            style={{
              background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "20px",
              fontWeight: "700",
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(234,88,12,0.35)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(234,88,12,0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(234,88,12,0.35)";
            }}
          >
            <FaPlus /> Start New Campaign
          </button>
        </div>
      </div>

      {/* CAMPAIGNS LIST */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading your campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ background: "var(--card-bg, #fff)", padding: "50px", borderRadius: "16px", textAlign: "center", border: "1px dashed var(--border-color, #ccc)" }}>
          <FaBullhorn style={{ fontSize: "3.5rem", color: "#cbd5e1", marginBottom: "15px" }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "8px" }}>No Campaigns Found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>You haven't submitted any advertisement campaigns yet.</p>
          <button
            onClick={() => navigate("/create-campaign")}
            style={{
              background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "20px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(234,88,12,0.35)"
            }}
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {campaigns.map((ad) => (
            <div
              key={ad._id}
              style={{
                background: "var(--card-bg, #fff)",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid var(--border-color, #e2e8f0)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                alignItems: "center"
              }}
            >
              {/* Image Preview */}
              <div style={{ width: "120px", height: "80px", borderRadius: "8px", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                <img src={ad.image} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Details */}
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", margin: 0 }}>{ad.title}</h3>
                  {getStatusBadge(ad.status, ad.rejectionReason, ad.paymentStatus)}
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "8px" }}>
                  <span>🎯 Slot: <strong>{ad.position?.replace(/_/g, " ")}</strong></span>
                  <span>💰 Paid: <strong>₹{(ad.amountPaid || 0).toLocaleString()}</strong> ({ad.paymentMethod})</span>
                  <span>🌐 Target: <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>{ad.targetUrl}</a></span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  📅 Schedule: {new Date(ad.startDate).toLocaleDateString()} to {new Date(ad.endDate).toLocaleDateString()}
                </div>

                {/* Rejection notice and refund banner */}
                {ad.status === "Rejected" && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "6px", fontSize: "0.85rem", color: "#991b1b" }}>
                    <strong>Rejection Reason:</strong> {ad.rejectionReason || "Content did not meet portal advertising guidelines."}
                    {ad.paymentStatus === "Refunded" && (
                      <div style={{ marginTop: "4px", fontWeight: "700", color: "#166534", display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaCheckCircle /> ₹{(ad.amountPaid || 0).toLocaleString()} has been refunded to your digital wallet!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
