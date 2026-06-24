import React, { useState, useEffect, useCallback } from "react";
import API from "../config/api";
import { FiClock, FiCheckCircle, FiSave, FiAlertCircle, FiSettings } from "react-icons/fi";
import "../styles/Account.css"; // Reuse Account styling

function EmailSchedule() {
  const [selectedLang, setSelectedLang] = useState("ta");
  const [scheduleType, setScheduleType] = useState("daily");
  const [time, setTime] = useState("10:00");
  const [dateTime, setDateTime] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [isSent, setIsSent] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/email-schedule");
      if (res.data && res.data.success) {
        const schedule = res.data.schedules[selectedLang];
        if (schedule) {
          setScheduleType(schedule.scheduleType || "daily");
          setTime(schedule.time || "10:00");
          setIsEnabled(schedule.isEnabled || false);
          setLastSent(schedule.lastSent);
          setIsSent(schedule.isSent || false);
          
          if (schedule.dateTime) {
            // Convert to local datetime-local format YYYY-MM-DDTHH:MM
            const dateObj = new Date(schedule.dateTime);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
            const dd = String(dateObj.getDate()).padStart(2, "0");
            const hh = String(dateObj.getHours()).padStart(2, "0");
            const min = String(dateObj.getMinutes()).padStart(2, "0");
            setDateTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
          } else {
            setDateTime("");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching email schedule:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedLang]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const payload = {
        scheduleType,
        time,
        isEnabled,
        dateTime: scheduleType === "one-time" ? new Date(dateTime).toISOString() : null
      };

      const res = await API.put(`/api/email-schedule/${selectedLang}`, payload);
      if (res.data && res.data.success) {
        alert(`${selectedLang === "en" ? "English" : "Tamil"} newsletter schedule updated successfully! 🚀`);
        fetchSchedule();
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert(err.response?.data?.message || "Failed to update schedule settings.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="account-page">
      <div className="account-header">
        <h1 className="account-title">Email Newsletter Scheduler</h1>
        <p className="account-subtitle">
          Configure a daily recurring schedule or a specific date and time to automatically trigger multilingual breaking news digests to subscribers.
        </p>
      </div>

      {/* Language Toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button
          type="button"
          className={`settings-tab ${selectedLang === "ta" ? "active" : ""}`}
          onClick={() => setSelectedLang("ta")}
          style={{ 
            padding: "10px 24px", 
            borderRadius: "8px", 
            border: "1px solid var(--border-color)", 
            cursor: "pointer", 
            fontWeight: 600, 
            fontSize: "14px", 
            background: selectedLang === "ta" ? "var(--accent-orange)" : "var(--card-bg)", 
            color: selectedLang === "ta" ? "#fff" : "var(--text-main)",
            transition: "all 0.2s"
          }}
        >
          🇮🇳 தமிழ் (Tamil) Newsletter
        </button>
        <button
          type="button"
          className={`settings-tab ${selectedLang === "en" ? "active" : ""}`}
          onClick={() => setSelectedLang("en")}
          style={{ 
            padding: "10px 24px", 
            borderRadius: "8px", 
            border: "1px solid var(--border-color)", 
            cursor: "pointer", 
            fontWeight: 600, 
            fontSize: "14px", 
            background: selectedLang === "en" ? "var(--accent-orange)" : "var(--card-bg)", 
            color: selectedLang === "en" ? "#fff" : "var(--text-main)",
            transition: "all 0.2s"
          }}
        >
          🇬🇧 English Newsletter
        </button>
      </div>

      <div className="cms-editor-container" style={{ maxWidth: "800px" }}>
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            Loading schedule configurations...
          </div>
        ) : (
          <div className="account-card" style={{ display: "block" }}>
            <form onSubmit={handleSave}>
              <div className="account-section-title">
                <FiSettings /> Scheduler Status & Switch
              </div>
              
              <div style={{ marginBottom: "24px", padding: "16px", background: "rgba(249, 115, 22, 0.05)", borderRadius: "8px", border: "1px solid rgba(249, 115, 22, 0.15)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontWeight: 600, color: "var(--text-main)" }}>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "var(--accent-orange)" }}
                  />
                  <span>Enable Auto-Scheduling for {selectedLang === "en" ? "English" : "Tamil"} Newsletter</span>
                </label>
                <p style={{ margin: "8px 0 0 32px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                  When enabled, the compiled 5 breaking news newsletter will be automatically triggered at the specified schedule below instead of sending immediately on publish.
                </p>
              </div>

              <div className="account-section-title">
                <FiClock /> Schedule Details
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)" }}>
                    Schedule Type
                  </label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-main)" }}
                  >
                    <option value="daily">Daily Recurring</option>
                    <option value="one-time">One-Time Date & Time</option>
                  </select>
                </div>

                {scheduleType === "daily" ? (
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)" }}>
                      Daily Run Time (24h Format)
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required={scheduleType === "daily"}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)" }}>
                      One-Time Target Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      required={scheduleType === "one-time"}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-main)" }}
                    />
                  </div>
                )}
              </div>

              <div style={{ padding: "16px", background: "var(--body-bg)", borderRadius: "8px", marginBottom: "30px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Last Newsletter Sent:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{formatDate(lastSent)}</span>
                </div>
                {scheduleType === "one-time" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Schedule Fired Status:</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, color: isSent ? "#10b981" : "#f59e0b" }}>
                      {isSent ? <FiCheckCircle /> : <FiAlertCircle />} {isSent ? "Sent Successfully" : "Pending Trigger"}
                    </span>
                  </div>
                )}
              </div>

              <div className="account-footer" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", background: "var(--accent-orange)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                >
                  <FiSave /> {saving ? "Saving..." : "Save Schedule Settings"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailSchedule;
