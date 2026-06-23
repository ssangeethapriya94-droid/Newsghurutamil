import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
  FiDollarSign, FiTrendingUp, FiCreditCard, FiUsers, FiSearch, FiFilter, FiDownload 
} from "react-icons/fi";
import API from "../config/api";
import "../styles/ReporterMyArticles.css"; // Reuse table styling

function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/api/subscription/admin/revenue");
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(res.data.message || "Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("Error fetching revenue data", err);
      setError("Server error while loading revenue details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const handleExportCSV = () => {
    if (!data || !data.transactions) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction Date,User Name,User Email,Website,Plan Name,Amount (INR),Payment ID,Order ID,Status\n";

    data.transactions.forEach(tx => {
      const date = new Date(tx.createdAt).toLocaleString();
      const userName = tx.userId ? tx.userId.name : "N/A";
      const userEmail = tx.userId ? tx.userId.email : "N/A";
      const lang = (tx.planId && tx.planId.language) || (tx.userId && tx.userId.language) || "ta";
      const website = lang === "en" ? "English" : "Tamil";
      const planName = tx.planId ? tx.planId.name : "N/A";
      const amount = tx.amount;
      const paymentId = tx.paymentId;
      const orderId = tx.orderId;
      const status = tx.status;

      const row = [
        `"${date}"`,
        `"${userName}"`,
        `"${userEmail}"`,
        `"${website}"`,
        `"${planName}"`,
        amount,
        `"${paymentId}"`,
        `"${orderId}"`,
        `"${status}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NewsGhuru_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "var(--text-muted)", fontWeight: 500 }}>Loading Revenue Dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--accent-red)" }}>
        <h3>Error Loading Page</h3>
        <p>{error}</p>
        <button onClick={fetchRevenueData} className="btn-primary" style={{ marginTop: "15px" }}>Retry</button>
      </div>
    );
  }

  const { metrics, planDistribution, monthlyTrends, transactions } = data;

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const userName = tx.userId ? tx.userId.name.toLowerCase() : "";
    const userEmail = tx.userId ? tx.userId.email.toLowerCase() : "";
    const paymentId = tx.paymentId.toLowerCase();
    const orderId = tx.orderId.toLowerCase();
    
    const matchesSearch = 
      userName.includes(searchTerm.toLowerCase()) ||
      userEmail.includes(searchTerm.toLowerCase()) ||
      paymentId.includes(searchTerm.toLowerCase()) ||
      orderId.includes(searchTerm.toLowerCase());

    const planName = tx.planId ? tx.planId.name : "";
    const matchesPlan = planFilter === "all" || planName === planFilter;

    return matchesSearch && matchesPlan;
  });

  // Color palette for Plan Distribution Pie Chart
  const COLORS = ["#ea580c", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="reporter-my-articles">
      
      {/* HEADER SECTION */}
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>💰 Revenue & Financial Audit Details</h2>
          <div className="header-subtitle">
            Monitor real-time premium subscription payments, transaction histories, and financial earnings.
          </div>
        </div>
        <button 
          onClick={handleExportCSV} 
          className="btn-primary" 
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
          disabled={transactions.length === 0}
        >
          <FiDownload /> Export Transactions CSV
        </button>
      </div>

      {/* METRIC CARDS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", margin: "25px 0" }}>
        
        {/* Metric 1: Total Revenue */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>Total Revenue</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "#ea580c", fontWeight: 800 }}>₹{(metrics.totalRevenue || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div style={{ background: "rgba(234, 88, 12, 0.15)", padding: "12px", borderRadius: "50%", color: "#ea580c", display: "flex", fontSize: "22px" }}>
            <FiDollarSign />
          </div>
        </div>

        {/* Metric 1b: Tamil Website Revenue */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>Tamil Website Revenue</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "#f97316", fontWeight: 800 }}>₹{(metrics.tamilRevenue || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div style={{ background: "rgba(249, 115, 22, 0.15)", padding: "12px", borderRadius: "50%", color: "#f97316", display: "flex", fontSize: "22px" }}>
            <FiDollarSign />
          </div>
        </div>

        {/* Metric 1c: English Website Revenue */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>English Website Revenue</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "#3b82f6", fontWeight: 800 }}>₹{(metrics.englishRevenue || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div style={{ background: "rgba(59, 130, 246, 0.15)", padding: "12px", borderRadius: "50%", color: "#3b82f6", display: "flex", fontSize: "22px" }}>
            <FiDollarSign />
          </div>
        </div>

        {/* Metric 2: Monthly Revenue */}
        <div style={{
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Monthly Revenue (June)</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "white", fontWeight: 800 }}>₹{(metrics.monthlyRevenue || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "12px", borderRadius: "50%", color: "white", display: "flex", fontSize: "22px" }}>
            <FiTrendingUp />
          </div>
        </div>

        {/* Metric 3: Active Premium Users */}
        <div style={{
          background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Active Subscriptions</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "white", fontWeight: 800 }}>{metrics.activeSubscriptions}</h3>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "12px", borderRadius: "50%", color: "white", display: "flex", fontSize: "22px" }}>
            <FiUsers />
          </div>
        </div>

        {/* Metric 4: Total Plans Sold */}
        <div style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Transactions Success</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "white", fontWeight: 800 }}>{metrics.totalPlansSold}</h3>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "12px", borderRadius: "50%", color: "white", display: "flex", fontSize: "22px" }}>
            <FiCreditCard />
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "30px" }} className="form-grid-nested">
        
        {/* Chart 1: Revenue Trends */}
        <div style={{ background: "var(--card-bg, white)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "var(--text-main)", fontWeight: 700 }}>Monthly Revenue Trend (INR)</h3>
          <div style={{ width: "100%", height: "260px" }}>
            {monthlyTrends && monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} stroke="var(--border-color)" />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} stroke="var(--border-color)" />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No trend data available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Plan Shares */}
        <div style={{ background: "var(--card-bg, white)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "var(--text-main)", fontWeight: 700 }}>Plan Distribution Sales Share</h3>
          <div style={{ width: "100%", height: "200px", position: "relative" }}>
            {planDistribution && planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Sales"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No plan data</div>
            )}
          </div>
          
          {/* Pie Legends */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            {planDistribution && planDistribution.map((entry, index) => (
              <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[index % COLORS.length] }}></span>
                <strong>{entry.name}:</strong> {entry.value}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FILTER & TABLE SECTION */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", margin: "20px 0", background: "var(--card-bg, white)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", alignItems: "center" }}>
        
        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", background: "var(--input-bg, #f8fafc)", border: "1.5px solid var(--input-border, #cbd5e1)", padding: "8px 12px", borderRadius: "12px", flex: "1", minWidth: "220px" }}>
          <FiSearch style={{ color: "var(--text-muted)", marginRight: "8px" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User, Email, Payment ID..."
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px", color: "var(--text-main)" }}
          />
        </div>

        {/* Plan Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}><FiFilter /> Plan Type:</span>
          <select 
            value={planFilter} 
            onChange={(e) => setPlanFilter(e.target.value)}
            className="dropdown-field"
            style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px" }}
          >
            <option value="all">All Plans</option>
            {planDistribution && planDistribution.map(plan => (
              <option key={plan.name} value={plan.name}>{plan.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="table-container">
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No transaction records found matching filters.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Subscriber Details</th>
                <th>Website</th>
                <th>Purchased Plan</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                    {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)", display: "block" }}>
                        {tx.userId ? tx.userId.name : <em style={{ color: "var(--text-muted)" }}>Deleted User</em>}
                      </strong>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {tx.userId ? tx.userId.email : "N/A"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {(() => {
                      const lang = (tx.planId && tx.planId.language) || (tx.userId && tx.userId.language) || "ta";
                      return lang === "en" ? (
                        <span style={{
                          background: "#e8f0fe",
                          color: "#1a73e8",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          English
                        </span>
                      ) : (
                        <span style={{
                          background: "#fdf0ea",
                          color: "#ea580c",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          Tamil
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <span className="category-tag" style={{ background: "rgba(234, 88, 12, 0.1)", color: "#ea580c" }}>
                      {tx.planId ? tx.planId.name : "N/A"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-main)" }}>
                    ₹{tx.amount}
                  </td>
                  <td style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {tx.paymentId}
                  </td>
                  <td style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {tx.orderId}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      background: "#e6f4ea",
                      color: "#137333",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "inline-block"
                    }}>
                      {tx.status}
                    </span>
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

export default Revenue;
