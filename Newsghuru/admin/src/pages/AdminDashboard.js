import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

import { 
  FiFileText, FiClock, FiCheckCircle, FiXCircle, 
  FiUsers, FiZap, FiPlusSquare, FiEye, FiMoreVertical, 
  FiArrowRight, FiList, FiSliders, FiTv, FiHeart, FiActivity,
  FiCamera
} from "react-icons/fi";
import "../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

// Suppress Recharts internal warning about initial dimensions
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  if (
    typeof args[0] === "string" &&
    args[0].includes("The width(-1) and height(-1) of chart should be greater than 0")
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const fallbackChartData = [
  { name: "Mon", submissions: 0, published: 0 },
  { name: "Tue", submissions: 0, published: 0 },
  { name: "Wed", submissions: 0, published: 0 },
  { name: "Thu", submissions: 0, published: 0 },
  { name: "Fri", submissions: 0, published: 0 },
  { name: "Sat", submissions: 0, published: 0 },
  { name: "Sun", submissions: 0, published: 0 },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChartReady, setIsChartReady] = useState(false);

  // Search & filter states for the table
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await API.get("/api/news/admin/stats");
      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data);
      }

      // Fetch all articles for the table
      const articlesRes = await API.get("/api/news/admin/articles");
      if (articlesRes.data && Array.isArray(articlesRes.data)) {
        setArticles(articlesRes.data);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && stats) {
      const timer = setTimeout(() => setIsChartReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

  if (loading || !stats) {
    return <div style={{ padding: "40px", color: "var(--text-muted)", fontWeight: 500 }}>Loading Dashboard...</div>;
  }

  const pendingCount = stats.pendingApproval || 0;
  const recentActivities = stats.recentActivities || [];
  const chartData = stats.weeklyStats || fallbackChartData;

  // News Overview Donut Data — brand theme colors
  const newsOverviewData = [
    { name: "Published", value: stats.publishedNews || 0, color: "#ea580c" },
    { name: "Pending",   value: stats.pendingApproval || 0, color: "#f59e0b" },
    { name: "Rejected",  value: stats.rejectedNews || 0, color: "#ef4444" }
  ].filter(item => item.value > 0);

  // Fallback if no news overview data exists
  const finalOverviewData = newsOverviewData.length > 0 ? newsOverviewData : [
    { name: "Published", value: 1, color: "#ea580c" },
    { name: "Pending",   value: 0, color: "#f59e0b" },
    { name: "Rejected",  value: 0, color: "#ef4444" }
  ];

  // Category stats data
  const finalCategoryStats = stats.categoryStats && stats.categoryStats.length > 0 
    ? stats.categoryStats 
    : [
        { category: "Politics", count: 0 },
        { category: "Sports", count: 0 },
        { category: "Cinema", count: 0 },
        { category: "Technology", count: 0 }
      ];

  const categoryChartColors = ["#ea580c", "#f59e0b", "#10b981", "#8b5cf6", "#6366f1", "#06b6d4"];

  // Table filtering logic
  const getStatusBadgeClass = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("publish")) return "badge-published";
    if (s.includes("pending")) return "badge-pending";
    if (s.includes("reject")) return "badge-rejected";
    return "badge-draft";
  };

  // Get categories list for select dropdown filter (safely parsed)
  const categoriesList = Array.isArray(articles)
    ? [...new Set(articles.map(a => a ? a.category : ""))].filter(Boolean)
    : [];

  const filteredArticles = Array.isArray(articles) ? articles.filter(article => {
    if (!article) return false;
    const title = article.title || "";
    const reporter = article.reporter || "";
    const editor = article.editor || "";
    const category = article.category || "";
    const status = article.status || "";

    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      editor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || category.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesStatus = true;
    const statusLower = status.toLowerCase();
    if (statusFilter === "published") matchesStatus = statusLower.includes("publish");
    else if (statusFilter === "pending") matchesStatus = statusLower.includes("pending");
    else if (statusFilter === "rejected") matchesStatus = statusLower.includes("reject");

    return matchesSearch && matchesCategory && matchesStatus;
  }) : [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      
      {/* Top Banner Overview */}
      <div className="dashboard-header-block">
        <div className="header-info">
          <h2>Dashboard Overview</h2>
          <p className="subtitle">Real-time statistics & workspace controls for Super Admin.</p>
        </div>
        <button className="primary-glow-btn" onClick={() => navigate("/admin/pending")}>
          Review Pending Queue ({pendingCount})
        </button>
      </div>

      {/* Modern 5-Grid Stat Cards */}
      <div className="stats-metric-grid">
        
        <div className="metric-card orange-glow">
          <div className="metric-icon-bg bg-orange">
            <FiFileText />
          </div>
          <div className="metric-details">
            <h3>Total News</h3>
            <p className="value">{stats.totalNews || 0}</p>
            <span className="trend-text green-trend">↑ 12.5% this month</span>
          </div>
        </div>

        <div className="metric-card yellow-glow">
          <div className="metric-icon-bg bg-yellow">
            <FiClock />
          </div>
          <div className="metric-details">
            <h3>Pending Approval</h3>
            <p className="value">{pendingCount}</p>
            <span className="trend-text green-trend">↑ 8.3% this month</span>
          </div>
        </div>

        <div className="metric-card green-glow">
          <div className="metric-icon-bg bg-green">
            <FiCheckCircle />
          </div>
          <div className="metric-details">
            <h3>Published News</h3>
            <p className="value">{stats.publishedNews || 0}</p>
            <span className="trend-text green-trend">↑ 15.3% this month</span>
          </div>
        </div>

        <div className="metric-card red-glow">
          <div className="metric-icon-bg bg-red">
            <FiXCircle />
          </div>
          <div className="metric-details">
            <h3>Rejected News</h3>
            <p className="value">{stats.rejectedNews || 0}</p>
            <span className="trend-text red-trend">↓ 3.1% this month</span>
          </div>
        </div>
        <div className="metric-card purple-glow">
          <div className="metric-icon-bg bg-purple">
            <FiUsers />
          </div>
          <div className="metric-details">
            <h3>Total Users</h3>
            <p className="value">{stats.totalUsers || 0}</p>
            <span className="trend-text green-trend">↑ 10.7% this month</span>
          </div>
        </div>

        <div className="metric-card yellow-glow" onClick={() => navigate("/admin/ads/all", { state: { statusFilter: "Pending Approval" } })} style={{ cursor: "pointer" }}>
          <div className="metric-icon-bg bg-yellow">
            <FiSliders />
          </div>
          <div className="metric-details">
            <h3>Pending Ads</h3>
            <p className="value">{stats.pendingAdvertisementsCount || 0}</p>
            <span className="trend-text green-trend">Needs admin review</span>
          </div>
        </div>

        <div className="metric-card purple-glow" onClick={() => navigate("/admin/shorts", { state: { statusFilter: "Pending Approval" } })} style={{ cursor: "pointer" }}>
          <div className="metric-icon-bg bg-purple">
            <FiTv />
          </div>
          <div className="metric-details">
            <h3>Pending Shorts</h3>
            <p className="value">{stats.pendingNewsShortsCount || 0}</p>
            <span className="trend-text green-trend">Needs admin review</span>
          </div>
        </div>

        <div className="metric-card orange-glow" onClick={() => navigate("/admin/photo-stories", { state: { statusFilter: "Pending Approval" } })} style={{ cursor: "pointer" }}>
          <div className="metric-icon-bg bg-orange">
            <FiCamera />
          </div>
          <div className="metric-details">
            <h3>Pending Stories</h3>
            <p className="value">{stats.pendingPhotoStoriesCount || 0}</p>
            <span className="trend-text green-trend">Needs admin review</span>
          </div>
        </div>

        <div className="metric-card orange-glow">
          <div className="metric-icon-bg bg-orange">
            <FiEye />
          </div>
          <div className="metric-details">
            <h3>Total Viewers</h3>
            <p className="value">{(stats.totalViewers || 0).toLocaleString()}</p>
            <span className="trend-text green-trend">Website visitors</span>
          </div>
        </div>

        <div className="metric-card purple-glow">
          <div className="metric-icon-bg bg-purple" style={{ position: "relative" }}>
            <FiUsers />
            <span style={{ fontSize: "9px", fontWeight: "800", position: "absolute", bottom: "2px", right: "2px", background: "rgba(139, 92, 246, 0.15)", color: "#7c3aed", padding: "1px 3px", borderRadius: "3px", border: "1px solid rgba(139, 92, 246, 0.25)" }}>EN</span>
          </div>
          <div className="metric-details">
            <h3>English Users</h3>
            <p className="value">{stats.englishUsers || 0}</p>
            <span className="trend-text green-trend">Registered in English</span>
          </div>
        </div>

        <div className="metric-card purple-glow">
          <div className="metric-icon-bg bg-purple" style={{ position: "relative" }}>
            <FiUsers />
            <span style={{ fontSize: "9px", fontWeight: "800", position: "absolute", bottom: "2px", right: "2px", background: "rgba(139, 92, 246, 0.15)", color: "#7c3aed", padding: "1px 3px", borderRadius: "3px", border: "1px solid rgba(139, 92, 246, 0.25)" }}>TA</span>
          </div>
          <div className="metric-details">
            <h3>Tamil Users</h3>
            <p className="value">{stats.tamilUsers || 0}</p>
            <span className="trend-text green-trend">Registered in Tamil</span>
          </div>
        </div>

        <div className="metric-card orange-glow">
          <div className="metric-icon-bg bg-orange" style={{ position: "relative" }}>
            <FiEye />
            <span style={{ fontSize: "9px", fontWeight: "800", position: "absolute", bottom: "2px", right: "2px", background: "rgba(234, 88, 12, 0.15)", color: "#ea580c", padding: "1px 3px", borderRadius: "3px", border: "1px solid rgba(234, 88, 12, 0.25)" }}>EN</span>
          </div>
          <div className="metric-details">
            <h3>English Viewers</h3>
            <p className="value">{(stats.englishViewers || 0).toLocaleString()}</p>
            <span className="trend-text green-trend">English portal visits</span>
          </div>
        </div>

        <div className="metric-card orange-glow">
          <div className="metric-icon-bg bg-orange" style={{ position: "relative" }}>
            <FiEye />
            <span style={{ fontSize: "9px", fontWeight: "800", position: "absolute", bottom: "2px", right: "2px", background: "rgba(234, 88, 12, 0.15)", color: "#ea580c", padding: "1px 3px", borderRadius: "3px", border: "1px solid rgba(234, 88, 12, 0.25)" }}>TA</span>
          </div>
          <div className="metric-details">
            <h3>Tamil Viewers</h3>
            <p className="value">{(stats.tamilViewers || 0).toLocaleString()}</p>
            <span className="trend-text green-trend">Tamil portal visits</span>
          </div>
        </div>

        <div className="metric-card yellow-glow">
          <div className="metric-icon-bg bg-yellow">
            <FiHeart />
          </div>
          <div className="metric-details">
            <h3>Subscribers</h3>
            <p className="value">{stats.subscribersCount || 0}</p>
            <span className="trend-text green-trend">Subscribed users</span>
          </div>
        </div>

      </div>

      {/* Redesigned Grid Layout with Charts on the Left to fill the Empty Space */}
      <div className="dashboard-grid-layout">
        
        {/* Left Column Area (Charts + Tables stacked beautifully) */}
        <div className="dashboard-left-stack">
          
          {/* Weekly stats trend graph */}
          <div className="dashboard-layout-card trend-graph-card">
            <h3>Weekly Statistics (Submissions vs Publications)</h3>
            <div className="area-chart-container" style={{ width: "100%", height: 250 }}>
              {isChartReady && (
                <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartColorOrange" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="chartColorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 13, fontWeight: 500 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 13, fontWeight: 500 }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.04)" vertical={false} />
                    <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", fontSize: "13.5px" }} />
                    <Area type="monotone" dataKey="submissions" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#chartColorOrange)" name="Submissions" />
                    <Area type="monotone" dataKey="published" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#chartColorGold)" name="Published" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category distribution donut chart */}
          <div className="dashboard-layout-card category-dist-card">
            <h3>Category Distribution</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "30px", width: "100%", height: "180px" }}>
              <div style={{ width: "40%", height: "100%", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={finalCategoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="category"
                    >
                      {finalCategoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryChartColors[index % categoryChartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="category-stats-legends" style={{ width: "60%" }}>
                {finalCategoryStats.map((entry, index) => (
                  <div key={entry.category} className="category-stat-row">
                    <span className="color-indicator" style={{ background: categoryChartColors[index % categoryChartColors.length] }}></span>
                    <span className="name">{entry.category}</span>
                    <span className="count">({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Published News Table Card */}
          <div className="dashboard-layout-card news-table-card">
            <div className="table-header-flex">
              <h3>Published News Manager</h3>
              <div className="table-filters">
                <input
                  type="text"
                  placeholder="Search news, reporter..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="search-field"
                />
                <select 
                  value={categoryFilter} 
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="dropdown-field"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
                <select 
                  value={statusFilter} 
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="dropdown-field"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>News Title</th>
                    <th>Reporter</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentArticles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">No news articles found matching filter criteria.</td>
                    </tr>
                  ) : (
                    currentArticles.map(article => (
                      <tr key={article.id}>
                        <td className="news-title-cell">{article.title}</td>
                        <td>
                          <span className="user-badge reporter-label">{article.reporter}</span>
                        </td>
                        <td>
                          <span className="category-label">{article.category}</span>
                        </td>
                        <td className="date-cell">{article.date}</td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600, color: "var(--accent-orange)" }}>
                            <FiEye size={13} /> {(article.views || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${getStatusBadgeClass(article.status)}`}>
                            {article.status && article.status.includes("Pending") ? "Pending Approval" : article.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell-flex">
                            <button className="icon-action-btn" onClick={() => navigate(`/admin/review/${article.id}`)} title="View Review Details">
                              <FiEye />
                            </button>
                            <button className="icon-action-btn" onClick={() => navigate(`/admin/review/${article.id}`)} title="More Options">
                              <FiMoreVertical />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            {totalPages > 1 && (
              <div className="table-pagination-block">
                <span className="pagination-info">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredArticles.length)} of {filteredArticles.length} items
                </span>
                <div className="pagination-buttons">
                  <button 
                    className="page-nav-btn" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                      key={i + 1} 
                      className={`page-num-btn ${currentPage === i + 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    className="page-nav-btn" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column Area (Side panels stacked) */}
        <div className="dashboard-side-flex">
          
          {/* Card: News Overview Circle Donut */}
          <div className="dashboard-layout-card overview-chart-card">
            <h3>News Summary Overview</h3>
            <div className="pie-chart-wrapper" style={{ height: 180, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={finalOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {finalOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center-label">
                <strong>{stats.totalNews || 0}</strong>
                <span>Articles</span>
              </div>
            </div>
            
            {/* Custom chart legends */}
            <div className="custom-legends-flex">
              <div className="legend-item"><span className="dot published-dot"></span> Published ({stats.publishedNews || 0})</div>
              <div className="legend-item"><span className="dot pending-dot"></span> Pending ({pendingCount})</div>
              <div className="legend-item"><span className="dot rejected-dot"></span> Rejected ({stats.rejectedNews || 0})</div>
            </div>
          </div>

          {/* Card: Quick Actions */}
          <div className="dashboard-layout-card quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              
              <div className="action-tile orange-tile" onClick={() => navigate("/admin/add-news")}>
                <div className="tile-icon-bg"><FiPlusSquare /></div>
                <span>Add News</span>
              </div>

              <div className="action-tile blue-tile" onClick={() => navigate("/admin/all-news")}>
                <div className="tile-icon-bg"><FiList /></div>
                <span>View All News</span>
              </div>

              <div className="action-tile yellow-tile" onClick={() => navigate("/admin/pending")}>
                <div className="tile-icon-bg"><FiClock /></div>
                <span>Pending Approval</span>
              </div>

              <div className="action-tile red-tile" onClick={() => navigate("/admin/breaking")}>
                <div className="tile-icon-bg"><FiZap /></div>
                <span>Breaking News</span>
              </div>

            </div>
          </div>

          {/* Card: Recent Activities Timeline */}
          <div className="dashboard-layout-card activities-timeline-card">
            <h3>Recent Activities</h3>
            <div className="activities-timeline">
              {recentActivities.length === 0 ? (
                <div className="no-activity">No recent activities available.</div>
              ) : (
                recentActivities.slice(0, 5).map((act, index) => (
                  <div key={act.id || index} className="timeline-item">
                    <div className="timeline-badge-line">
                      <div className="timeline-dot"></div>
                      {index !== 4 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <p className="activity-msg">{act.text}</p>
                      <span className="activity-time">{act.time}</span>
                    </div>
                  </div>
                ))
            )}
            </div>
            <div className="view-more-link" onClick={() => navigate("/admin/notifications")}>
              View All Activities <FiArrowRight />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
