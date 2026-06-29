import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiSave, FiCheckCircle, FiRefreshCw, FiLayers, FiAlertCircle } from "react-icons/fi";
import "../styles/AdminDashboard.css";

function AdPricingSettings() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/ads/pricing/all");
      if (res.data.success) {
        setPricing(res.data.pricing);
      }
    } catch (err) {
      console.error("Error fetching ad pricing", err);
      setMessage({ type: "error", text: "Failed to load advertisement pricing." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handlePriceChange = (slotId, field, newPrice) => {
    setPricing(prev => prev.map(item => item.slotId === slotId ? { ...item, [field]: newPrice } : item));
  };

  const handleTextChange = (slotId, field, val) => {
    setPricing(prev => prev.map(item => item.slotId === slotId ? { ...item, [field]: val } : item));
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const res = await API.put("/api/ads/pricing/update", { slotPricing: pricing }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "🎉 Advertisement banner slot prices saved and published live across both portals!" });
        setPricing(res.data.pricing);
      } else {
        setMessage({ type: "error", text: res.data.message || "Failed to update pricing." });
      }
    } catch (err) {
      console.error("Save pricing error:", err);
      setMessage({ type: "error", text: err.response?.data?.message || "Server error saving pricing changes." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Advertisement Slot Pricing Controls...</div>;
  }

  return (
    <div className="admin-dashboard-wrapper" style={{ padding: "0 0 40px 0" }}>
      {/* HEADER */}
      <div className="dashboard-header-block" style={{ marginBottom: "25px" }}>
        <div className="header-info">
          <h2>💰 Campaign Slot Pricing Manager</h2>
          <p className="subtitle">
            Configure live package prices and badges for advertisement banner slots across English and Tamil user portals.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="button" 
            onClick={fetchPricing} 
            className="btn-secondary" 
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FiRefreshCw /> Reset
          </button>
          <button 
            type="button" 
            onClick={handleSaveAll} 
            disabled={saving}
            className="btn-primary" 
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)", border: "none", padding: "10px 20px", borderRadius: "10px", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? <FiRefreshCw className="spin" /> : <FiSave />} Save All Prices
          </button>
        </div>
      </div>

      {/* NOTIFICATION MESSAGE */}
      {message.text && (
        <div style={{
          padding: "14px 18px",
          borderRadius: "10px",
          marginBottom: "25px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "600",
          background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
          borderLeft: message.type === "success" ? "5px solid #10b981" : "5px solid #ef4444",
          color: message.type === "success" ? "#065f46" : "#991b1b"
        }}>
          {message.type === "success" ? <FiCheckCircle style={{ fontSize: "1.2rem" }} /> : <FiAlertCircle style={{ fontSize: "1.2rem" }} />}
          {message.text}
        </div>
      )}

      {/* PRICING SLOTS CARDS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "25px" }}>
        {pricing.map((slot) => (
          <div 
            key={slot.slotId} 
            style={{ 
              background: "#fff", 
              borderRadius: "16px", 
              padding: "25px", 
              border: "1px solid #e2e8f0", 
              boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(234, 88, 12, 0.1)", color: "#ea580c", padding: "8px", borderRadius: "10px" }}>
                  <FiLayers size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{slot.nameEn}</h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>SLOT ID: {slot.slotId}</span>
                </div>
              </div>
            </div>

            {/* DURATION PRICE INPUT CONTROLS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1.5px solid #ea580c" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "800", display: "block", marginBottom: "6px", color: "#ea580c" }}>
                  Weekly Price (7 Days) *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>₹</span>
                  <input 
                    type="number" 
                    value={slot.priceWeekly !== undefined && slot.priceWeekly !== null ? slot.priceWeekly : (slot.price || 0)} 
                    onChange={(e) => handlePriceChange(slot.slotId, "priceWeekly", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "1.1rem",
                      fontWeight: "800",
                      color: "#ea580c",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "800", display: "block", marginBottom: "6px", color: "#0284c7" }}>
                  Monthly Price (30 Days)
                </label>
                {slot.slotId === "POPUP_ADVERTISEMENT" ? (
                  <div style={{ padding: "8px 10px", background: "#e2e8f0", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", color: "#64748b", textAlign: "center", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                    Weekly Only (N/A)
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>₹</span>
                    <input 
                      type="number" 
                      value={slot.priceMonthly || 0} 
                      onChange={(e) => handlePriceChange(slot.slotId, "priceMonthly", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "1.1rem",
                        fontWeight: "800",
                        color: "#0284c7",
                        outline: "none"
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ENGLISH / TAMIL DETAILS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "4px", color: "#475569" }}>English Label Name</label>
                <input 
                  type="text" 
                  value={slot.nameEn} 
                  onChange={(e) => handleTextChange(slot.slotId, "nameEn", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "4px", color: "#475569" }}>Tamil Label Name</label>
                <input 
                  type="text" 
                  value={slot.nameTa} 
                  onChange={(e) => handleTextChange(slot.slotId, "nameTa", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "4px", color: "#475569" }}>English Badge</label>
                  <input 
                    type="text" 
                    value={slot.badgeEn} 
                    onChange={(e) => handleTextChange(slot.slotId, "badgeEn", e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "4px", color: "#475569" }}>Tamil Badge</label>
                  <input 
                    type="text" 
                    value={slot.badgeTa} 
                    onChange={(e) => handleTextChange(slot.slotId, "badgeTa", e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px", textAlign: "right" }}>
        <button 
          type="button" 
          onClick={handleSaveAll} 
          disabled={saving}
          style={{ background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)", border: "none", padding: "14px 30px", borderRadius: "30px", color: "#fff", fontWeight: "800", fontSize: "1.1rem", cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 6px 20px rgba(234,88,12,0.35)" }}
        >
          {saving ? "Publishing Updates..." : "Save & Publish Pricing Live"}
        </button>
      </div>
    </div>
  );
}

export default AdPricingSettings;
