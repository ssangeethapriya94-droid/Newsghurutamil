import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiTrendingUp, FiMousePointer, FiEye, FiDownload, FiCalendar } from "react-icons/fi";
import "../styles/ReporterMyArticles.css";

function AdAnalytics() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState("Daily"); // Daily, Weekly, Monthly

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/ads");
      if (res.data.success) {
        setAds(res.data.ads);
      }
    } catch (err) {
      console.error("Error fetching ad data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Sort selectors
  const mostViewed = [...ads].sort((a, b) => b.impressions - a.impressions).slice(0, 5);
  const mostClicked = [...ads].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  const bestCTR = [...ads].sort((a, b) => b.ctr - a.ctr).slice(0, 5);

  const handleDownloadReport = () => {
    // Generate simple CSV content of all ads
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ad Title,Advertiser,Position,Priority,Status,Start Date,End Date,Impressions,Clicks,CTR %\n";
    
    ads.forEach(ad => {
      const row = [
        `"${ad.title}"`,
        `"${ad.advertiserName}"`,
        ad.position,
        ad.priority,
        ad.status,
        new Date(ad.startDate).toLocaleDateString(),
        new Date(ad.endDate).toLocaleDateString(),
        ad.impressions,
        ad.clicks,
        `${ad.ctr}%`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NewsGhuru_Ad_Report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>📈 Campaign Performance Analytics</h2>
          <div className="header-subtitle">
            Generate and export detailed performance audit reports on click counts, conversion rates, and banner visibility.
          </div>
        </div>
        <button 
          onClick={handleDownloadReport} 
          className="btn-primary" 
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
          disabled={ads.length === 0}
        >
          <FiDownload /> Export CSV Report
        </button>
      </div>

      {/* FILTER PERIOD */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "20px 0", background: "var(--card-bg)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <FiCalendar /> Report Period Scope:
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {["Daily", "Weekly", "Monthly"].map(period => (
            <button
              key={period}
              onClick={() => setReportPeriod(period)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: reportPeriod === period ? "1px solid var(--accent-orange)" : "1px solid var(--border-color)",
                background: reportPeriod === period ? "rgba(234, 88, 12, 0.15)" : "var(--card-bg)",
                color: reportPeriod === period ? "var(--accent-orange)" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {period} Report
            </button>
          ))}
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>
          * Calculated values represent total metrics aggregated for the selected period up to the current date.
        </span>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading analytical profiles...</div>
      ) : ads.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No advertisement campaign metrics logged.</div>
      ) : (
        <>
          {/* THREE COLUMN LEADERBOARD ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "30px" }} className="dashboard-charts-grid-nested">
            
            {/* MOST VIEWED */}
            <div style={{ background: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
              <h3 style={{ fontSize: "14px", color: "var(--text-main)", borderBottom: "2px solid #38bdf8", paddingBottom: "8px", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiEye style={{ color: "#38bdf8" }} /> Top 5 Most Viewed Ads
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {mostViewed.map((ad, idx) => (
                  <div key={ad._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < 4 ? "1px solid var(--border-color)" : "none" }}>
                    <div style={{ maxWidth: "70%" }}>
                      <span style={{ fontWeight: 600, fontSize: "13px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ad.position}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#0369a1" }}>{ad.impressions.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MOST CLICKED */}
            <div style={{ background: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
              <h3 style={{ fontSize: "14px", color: "var(--text-main)", borderBottom: "2px solid #a855f7", paddingBottom: "8px", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiMousePointer style={{ color: "#a855f7" }} /> Top 5 Most Clicked Ads
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {mostClicked.map((ad, idx) => (
                  <div key={ad._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < 4 ? "1px solid var(--border-color)" : "none" }}>
                    <div style={{ maxWidth: "70%" }}>
                      <span style={{ fontWeight: 600, fontSize: "13px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ad.position}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#7e22ce" }}>{ad.clicks.toLocaleString()} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BEST CTR */}
            <div style={{ background: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
              <h3 style={{ fontSize: "14px", color: "var(--text-main)", borderBottom: "2px solid #ec4899", paddingBottom: "8px", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiTrendingUp style={{ color: "#ec4899" }} /> Top 5 Best CTR Ads
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {bestCTR.map((ad, idx) => (
                  <div key={ad._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < 4 ? "1px solid var(--border-color)" : "none" }}>
                    <div style={{ maxWidth: "70%" }}>
                      <span style={{ fontWeight: 600, fontSize: "13px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ad.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ad.position}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#be185d" }}>{ad.ctr}% CTR</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* MASTER REPORT TABLE */}
          <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "var(--text-main)" }}>📄 Master Performance Audit Breakdown</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} className="articles-table">
                <thead>
                  <tr style={{ background: "var(--table-header-bg)" }}>
                    <th style={{ padding: "12px" }}>Ad Campaign Title</th>
                    <th style={{ padding: "12px" }}>Advertiser</th>
                    <th style={{ padding: "12px" }}>Position</th>
                    <th style={{ padding: "12px" }}>Priority</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Impressions</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Clicks</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>CTR %</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => (
                    <tr key={ad._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px", fontWeight: 600 }}>{ad.title}</td>
                      <td style={{ padding: "12px" }}>
                        <div>{ad.advertiserName}</div>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{ad.companyName}</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: "var(--badge-bg)", color: "var(--text-main)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>{ad.position}</span>
                      </td>
                      <td style={{ padding: "12px", fontWeight: 600, color: ad.priority === "High" ? "#ef4444" : ad.priority === "Medium" ? "#3b82f6" : "#6b7280" }}>{ad.priority}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: ad.status === "Active" ? "rgba(16, 185, 129, 0.15)" : ad.status === "Scheduled" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: ad.status === "Active" ? "#10b981" : ad.status === "Scheduled" ? "#f59e0b" : "#ef4444"
                        }}>{ad.status}</span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{ad.impressions.toLocaleString()}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{ad.clicks.toLocaleString()}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "#10b981" }}>{ad.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdAnalytics;
