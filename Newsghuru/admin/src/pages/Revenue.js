import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
  FiDollarSign, FiTrendingUp, FiCreditCard, FiUsers, FiSearch, FiFilter, FiDownload, FiSliders 
} from "react-icons/fi";
import API from "../config/api";
import "../styles/ReporterMyArticles.css"; // Reuse table styling

function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [adPositionFilter, setAdPositionFilter] = useState("all");
  const [adLanguageFilter, setAdLanguageFilter] = useState("all");

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
    if (!data) return;

    if (activeTab === "advertisements") {
      if (!data.adTransactions) return;
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Transaction Date,Advertiser Name,Advertiser Email,Advertiser Phone,Campaign Title,Placement Slot,Language,Amount (INR),Payment Method,Payment Status\n";

      data.adTransactions.forEach(tx => {
        const date = new Date(tx.createdAt).toLocaleString();
        const advertiserName = tx.advertiserName || "N/A";
        const advertiserEmail = tx.advertiserEmail || "N/A";
        const advertiserPhone = tx.advertiserPhone || "";
        const title = tx.title || "N/A";
        const position = tx.position || "N/A";
        const language = tx.language === "en" ? "English" : tx.language === "ta" ? "Tamil" : "Both";
        const amount = tx.amount || 0;
        const method = tx.paymentMethod || "N/A";
        const status = tx.paymentStatus || "N/A";

        const row = [
          `"${date}"`,
          `"${advertiserName}"`,
          `"${advertiserEmail}"`,
          `"${advertiserPhone}"`,
          `"${title}"`,
          `"${position}"`,
          `"${language}"`,
          amount,
          `"${method}"`,
          `"${status}"`
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `NewsGhuru_Ad_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (!data.transactions) return;
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
    }
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

  const { 
    metrics, 
    adMetrics = { totalAdRevenue: 0, monthlyAdRevenue: 0, tamilAdRevenue: 0, englishAdRevenue: 0 }, 
    planDistribution, 
    monthlyTrends, 
    transactions, 
    adTransactions = [] 
  } = data;

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

  // Filter ad transactions
  const filteredAdTransactions = adTransactions.filter(tx => {
    const advertiserName = tx.advertiserName ? tx.advertiserName.toLowerCase() : "";
    const advertiserEmail = tx.advertiserEmail ? tx.advertiserEmail.toLowerCase() : "";
    const advertiserPhone = tx.advertiserPhone ? tx.advertiserPhone.toLowerCase() : "";
    const title = tx.title ? tx.title.toLowerCase() : "";

    const matchesSearch =
      advertiserName.includes(searchTerm.toLowerCase()) ||
      advertiserEmail.includes(searchTerm.toLowerCase()) ||
      advertiserPhone.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase());

    const matchesPosition = adPositionFilter === "all" || tx.position === adPositionFilter;
    const matchesLanguage = adLanguageFilter === "all" || tx.language === adLanguageFilter;

    return matchesSearch && matchesPosition && matchesLanguage;
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

      {/* SUBSCRIPTION REVENUE METRICS */}
      <h3 style={{ margin: "25px 0 10px 0", color: "var(--text-main)", fontWeight: 700, fontSize: "16px" }}>🎟️ Subscription Premium Revenue Metrics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", margin: "15px 0" }}>
        
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
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>Total Subscription Revenue</span>
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
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>Tamil Website Subs Revenue</span>
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
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>English Website Subs Revenue</span>
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
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Monthly Subs Revenue</span>
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

      {/* ADVERTISEMENT REVENUE METRICS */}
      <h3 style={{ margin: "25px 0 10px 0", color: "var(--text-main)", fontWeight: 700, fontSize: "16px" }}>📢 Advertisement Hosting Revenue Metrics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", margin: "15px 0" }}>
        
        {/* Total Ad Revenue */}
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
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: 600 }}>Total Advertisement Revenue</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "#ea580c", fontWeight: 800 }}>₹{(adMetrics.totalAdRevenue || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div style={{ background: "rgba(234, 88, 12, 0.15)", padding: "12px", borderRadius: "50%", color: "#ea580c", display: "flex", fontSize: "22px" }}>
            <FiDollarSign />
          </div>
        </div>

        {/* Monthly Ad Revenue */}
        <div style={{
          background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Monthly Ad Revenue</span>
            <h3 style={{ fontSize: "28px", margin: "6px 0 0 0", color: "white", fontWeight: 800 }}>₹{(adMetrics.monthlyAdRevenue || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "12px", borderRadius: "50%", color: "white", display: "flex", fontSize: "22px" }}>
            <FiTrendingUp />
          </div>
        </div>

        {/* Ad Revenue Split (Tamil / English) */}
        <div style={{
          background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "6px"
        }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Portal Ad Revenue Split</span>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700 }}>
            <span>Tamil Portal:</span>
            <span>₹{(adMetrics.tamilAdRevenue || 0).toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700 }}>
            <span>English Portal:</span>
            <span>₹{(adMetrics.englishAdRevenue || 0).toLocaleString("en-IN")}</span>
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

      {/* TRANSACTION TABS */}
      <div style={{ display: "flex", gap: "10px", margin: "25px 0 15px 0", borderBottom: "1.5px solid var(--border-color, #cbd5e1)", paddingBottom: "10px" }}>
        <button
          onClick={() => {
            setActiveTab("subscriptions");
            setSearchTerm("");
          }}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "subscriptions" ? "3px solid #ea580c" : "3px solid transparent",
            color: activeTab === "subscriptions" ? "#ea580c" : "var(--text-muted, #64748b)",
            fontWeight: "800",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.2s ease"
          }}
        >
          🎟️ Subscription Purchases
        </button>
        <button
          onClick={() => {
            setActiveTab("advertisements");
            setSearchTerm("");
          }}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "advertisements" ? "3px solid #ea580c" : "3px solid transparent",
            color: activeTab === "advertisements" ? "#ea580c" : "var(--text-muted, #64748b)",
            fontWeight: "800",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.2s ease"
          }}
        >
          📢 Advertisement Campaigns
        </button>
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
            placeholder={activeTab === "subscriptions" ? "Search by User, Email, Payment ID..." : "Search by Advertiser, Email, Campaign..."}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px", color: "var(--text-main)" }}
          />
        </div>

        {activeTab === "subscriptions" ? (
          /* Subscription Plan Filter */
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
        ) : (
          /* Advertisement Filters */
          <>
            {/* Position Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}><FiFilter /> Slot:</span>
              <select 
                value={adPositionFilter} 
                onChange={(e) => setAdPositionFilter(e.target.value)}
                className="dropdown-field"
                style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px" }}
              >
                <option value="all">All Slots</option>
                <option value="HEADER_BANNER">Header Banner</option>
                <option value="TOP_BANNER">Top Banner</option>
                <option value="SECTION_BANNER">Section Banner</option>
                <option value="FLOATING_ADVERTISEMENT">Floating Bar</option>
                <option value="SIDEBAR">Sidebar Widget</option>
                <option value="FOOTER_BANNER">Footer Banner</option>
                <option value="POPUP_ADVERTISEMENT">Popup Ad</option>
              </select>
            </div>

            {/* Language Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}><FiSliders /> Language:</span>
              <select 
                value={adLanguageFilter} 
                onChange={(e) => setAdLanguageFilter(e.target.value)}
                className="dropdown-field"
                style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "14px" }}
              >
                <option value="all">All Languages</option>
                <option value="ta">Tamil Portal</option>
                <option value="en">English Portal</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="table-container">
        {activeTab === "subscriptions" ? (
          filteredTransactions.length === 0 ? (
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
          )
        ) : (
          filteredAdTransactions.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No advertisement transactions found matching filters.</div>
          ) : (
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Advertiser Details</th>
                  <th>Campaign Title</th>
                  <th>Placement Slot</th>
                  <th>Portal</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Method</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--text-main)", display: "block" }}>
                          {tx.advertiserName}
                        </strong>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {tx.advertiserEmail} {tx.advertiserPhone && `| ${tx.advertiserPhone}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>{tx.title}</span>
                    </td>
                    <td>
                      <span className="category-tag">{tx.position}</span>
                    </td>
                    <td>
                      {tx.language === "en" ? (
                        <span style={{ background: "#e8f0fe", color: "#1a73e8", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, display: "inline-block" }}>
                          English
                        </span>
                      ) : tx.language === "ta" ? (
                        <span style={{ background: "#fdf0ea", color: "#ea580c", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, display: "inline-block" }}>
                          Tamil
                        </span>
                      ) : (
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, display: "inline-block" }}>
                          Both
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-main)" }}>
                      ₹{(tx.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-main)", fontWeight: 500 }}>
                      {tx.paymentMethod}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{
                        background: tx.paymentStatus === "Paid" ? "#e6f4ea" : tx.paymentStatus === "Refunded" ? "#feefe3" : "#f1f3f4",
                        color: tx.paymentStatus === "Paid" ? "#137333" : tx.paymentStatus === "Refunded" ? "#b06000" : "#3c4043",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        display: "inline-block"
                      }}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

    </div>
  );
}

export default Revenue;
