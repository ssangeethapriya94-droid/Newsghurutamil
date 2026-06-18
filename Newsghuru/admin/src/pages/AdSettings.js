import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import "../styles/ReporterCreateNews.css";

function AdSettings() {
  const [formData, setFormData] = useState({
    globalRotationInterval: 10,
    popupEnabled: true,
    popupDelay: 3,
    popupAutoClose: 10
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/ads/settings");
      if (res.data.success && res.data.settings) {
        setFormData({
          globalRotationInterval: res.data.settings.globalRotationInterval || 10,
          popupEnabled: res.data.settings.popupEnabled !== undefined ? res.data.settings.popupEnabled : true,
          popupDelay: res.data.settings.popupDelay !== undefined ? res.data.settings.popupDelay : 3,
          popupAutoClose: res.data.settings.popupAutoClose !== undefined ? res.data.settings.popupAutoClose : 10
        });
      }
    } catch (err) {
      console.error("Error fetching settings", err);
      setMessage({ type: "error", text: "Failed to load advertisement settings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      setSaving(true);
      const res = await API.put("/api/ads/settings", formData);
      if (res.data.success) {
        setMessage({ type: "success", text: "Global advertisement settings updated successfully! 🎉" });
        // Automatically hide success message after 4 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      }
    } catch (err) {
      console.error("Error saving settings", err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Ad Settings...</div>;
  }

  return (
    <div className="reporter-create-news">
      <div className="header-actions">
        <div>
          <h2>⚙️ Advertisement Settings</h2>
          <div className="header-subtitle">
            Configure global advertisement behaviors, rotation durations, popup conditions, and default delays.
          </div>
        </div>
      </div>

      {message.text && (
        <div style={{
          background: message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          borderLeft: `4px solid ${message.type === "success" ? "#10b981" : "#ef4444"}`,
          color: message.type === "success" ? "#10b981" : "#ef4444",
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "650px" }}>
        
        {/* ROTATION SETTINGS */}
        <div className="form-card" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: "var(--text-main)" }}>1. Ad Rotation Speed</h3>
          
          <div className="form-group">
            <label>Global Rotation Cycle Duration *</label>
            <span style={{ display: "block", color: "var(--text-muted)", fontSize: "12px", marginBottom: "8px" }}>
              Define the default rotation speed when multiple advertisements occupy the same layout slot.
            </span>
            <select 
              name="globalRotationInterval" 
              value={formData.globalRotationInterval} 
              onChange={handleInputChange}
              style={{ width: "100%" }}
            >
              <option value={10}>10 Seconds (Fast Rotation)</option>
              <option value={15}>15 Seconds</option>
              <option value={20}>20 Seconds</option>
              <option value={30}>30 Seconds (Slow Rotation)</option>
            </select>
          </div>
        </div>

        {/* POPUP AD SETTINGS */}
        <div className="form-card" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: "var(--text-main)" }}>2. Center Screen Popup Display</h3>
          
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <input
              type="checkbox"
              id="popupEnabled"
              name="popupEnabled"
              checked={formData.popupEnabled}
              onChange={handleInputChange}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <label htmlFor="popupEnabled" style={{ fontWeight: 600, cursor: "pointer", margin: 0, color: "var(--text-main)" }}>Enable Homepage Popup Advertisement</label>
          </div>

          {formData.popupEnabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", padding: "15px", background: "var(--bg-light)", borderRadius: "6px", border: "1px solid var(--border-color)", borderLeft: "4px solid #3b82f6" }}>
              <div className="form-group">
                <label>Popup Trigger Delay (Seconds)</label>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", marginBottom: "5px" }}>Time to wait after user lands on Homepage.</span>
                <input
                  type="number"
                  name="popupDelay"
                  value={formData.popupDelay}
                  onChange={handleInputChange}
                  min="0"
                  max="15"
                />
              </div>
              
              <div className="form-group">
                <label>Auto Close Duration (Seconds)</label>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", marginBottom: "5px" }}>Time before the popup automatically closes.</span>
                <input
                  type="number"
                  name="popupAutoClose"
                  value={formData.popupAutoClose}
                  onChange={handleInputChange}
                  min="3"
                  max="60"
                />
              </div>
            </div>
          )}
        </div>

        {/* SAVE BUTTON */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}>
            <FiSave /> {saving ? "Saving Settings..." : "Save Configuration"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AdSettings;
