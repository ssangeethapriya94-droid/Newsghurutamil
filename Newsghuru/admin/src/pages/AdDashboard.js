import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { 
  FiLayers, FiActivity, FiClock, FiXCircle, 
  FiMousePointer, FiEye, FiTrendingUp, FiPlusCircle 
} from "react-icons/fi";
import "../styles/AdminDashboard.css"; // Reuse dashboard metrics stylesheet

function AdDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/ads/analytics/dashboard");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error fetching analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Ad Analytics...</div>;
  }

  const summary = data?.summary || {
    totalAds: 0,
    activeAds: 0,
    scheduledAds: 0,
    expiredAds: 0,
    totalClicks: 0,
    totalImpressions: 0,
    ctrPercent: 0
  };

  const chartData = data?.dailyChartData || [];
  const performanceAds = data?.performanceAds || [];
  const mostViewedAds = data?.mostViewedAds || [];

  return (
    <div className="admin-dashboard-wrapper" style={{ padding: "0 0 30px 0" }}>
      
      {/* HEADER */}
      <div className="dashboard-header-block" style={{ marginBottom: "25px" }}>
        <div className="header-info">
          <h2>📊 Advertisement Dashboard</h2>
          <p className="subtitle">
            Overview of advertising campaigns, click rates, dynamic schedules, and viewer interactions.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/admin/ads/add")} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <FiPlusCircle /> Add Advertisement
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="stats-metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        <div className="metric-card ad-metric-card orange-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-orange">
            <FiLayers />
          </div>
          <div className="metric-details">
            <h3>Total Advertisements</h3>
            <p className="value">{summary.totalAds}</p>
          </div>
        </div>

        <div className="metric-card ad-metric-card green-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-green">
            <FiActivity />
          </div>
          <div className="metric-details">
            <h3>Active Now</h3>
            <p className="value">{summary.activeAds}</p>
          </div>
        </div>

        <div className="metric-card ad-metric-card yellow-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-yellow">
            <FiClock />
          </div>
          <div className="metric-details">
            <h3>Scheduled Future</h3>
            <p className="value">{summary.scheduledAds}</p>
          </div>
        </div>

        <div className="metric-card ad-metric-card red-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-red">
            <FiXCircle />
          </div>
          <div className="metric-details">
            <h3>Expired / Inactive</h3>
            <p className="value">{summary.expiredAds}</p>
          </div>
        </div>

        <div className="metric-card ad-metric-card purple-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-purple">
            <FiMousePointer />
          </div>
          <div className="metric-details">
            <h3>Total Click Events</h3>
            <p className="value">{summary.totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card ad-metric-card orange-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-orange">
            <FiEye />
          </div>
          <div className="metric-details">
            <h3>Total Impressions</h3>
            <p className="value">{summary.totalImpressions.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card ad-metric-card green-glow" style={{ cursor: "default" }}>
          <div className="metric-icon-bg bg-green">
            <FiTrendingUp />
          </div>
          <div className="metric-details">
            <h3>Average CTR</h3>
            <p className="value">{summary.ctrPercent}%</p>
          </div>
        </div>

      </div>

      {/* CHARTS ROW 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", marginBottom: "30px" }} className="dashboard-charts-grid-nested">
        
        {/* Daily Impressions & Clicks (Area Chart) */}
        <div className="dashboard-layout-card" style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "var(--text-main)" }}>📈 Daily Clicks & Impressions (Last 30 Days)</h3>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.04)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(tick) => tick.substring(5)} tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", fontSize: "12px" }} labelFormatter={(label) => `Date: ${label}`} />
                <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#06b6d4" fillOpacity={1} fill="url(#colorImpressions)" strokeWidth={2} />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ad Performance CTR comparison */}
        <div className="dashboard-layout-card" style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 15px 0", color: "var(--text-main)" }}>🔥 Top Performing Campaigns (CTR %)</h3>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <BarChart data={performanceAds} layout="vertical" margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.04)" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }} />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  width={110} 
                  tickFormatter={(tick) => tick.length > 15 ? tick.substring(0, 13) + ".." : tick} 
                  tick={{ fill: "var(--text-muted)", fontSize: 10.5, fontWeight: 500 }}
                />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", fontSize: "12px" }} formatter={(value) => `${value}%`} />
                <Bar dataKey="ctr" name="CTR Rate" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 2: MOST VIEWED ADS LIST */}
      <div className="dashboard-layout-card" style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "var(--text-main)" }}>🏆 Campaign Leaderboard (Most Viewed Advertisements)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="articles-table">
            <thead>
              <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px" }}>Ad Campaign Title</th>
                <th style={{ padding: "12px" }}>Advertiser Name</th>
                <th style={{ padding: "12px" }}>Location Placement</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Impressions</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Clicks</th>
                <th style={{ padding: "12px", textAlign: "center" }}>CTR Percentage</th>
              </tr>
            </thead>
            <tbody>
              {mostViewedAds.map((ad, idx) => (
                <tr key={ad._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>
                    <span style={{ color: "var(--text-muted)", marginRight: "8px" }}>#{idx + 1}</span>
                    {ad.title}
                  </td>
                  <td style={{ padding: "12px" }}>{ad.advertiserName}</td>
                  <td style={{ padding: "12px" }}>
                    <span className="category-label">{ad.position}</span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      background: ad.status === "Active" ? "rgba(16, 185, 129, 0.15)" : ad.status === "Scheduled" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: ad.status === "Active" ? "#10b981" : ad.status === "Scheduled" ? "#f59e0b" : "#ef4444",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: 600
                    }}>{ad.status}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{ad.impressions.toLocaleString()}</td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{ad.clicks.toLocaleString()}</td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "#10b981" }}>{ad.ctr}%</td>
                </tr>
              ))}
              {mostViewedAds.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>No active performance metrics recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default AdDashboard;
