import React, { useState, useEffect } from "react";
import { 
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
   FaNewspaper, FaClock, FaCheckCircle, FaUserTie, FaUserEdit, FaBolt 
} from "react-icons/fa";
import "../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

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
  const [loading, setLoading] = useState(true);
  const [isChartReady, setIsChartReady] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/news/admin/stats");
      if (res.data && res.data.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading && stats) {
      const timer = setTimeout(() => setIsChartReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

  if (loading || !stats) {
    return <div style={{ padding: "40px", color: "var(--text-muted)" }}>Loading Dashboard Stats...</div>;
  }

  const pendingCount = stats.pendingApproval || 0;
  const pendingArticles = stats.pendingArticles || [];
  const recentActivities = stats.recentActivities || [];
  const chartData = stats.weeklyStats || fallbackChartData;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Admin Overview</h2>
          <p className="text-muted">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/admin/pending")}>
          Review Pending ({pendingCount})
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><FaNewspaper /></div>
          <div className="stat-info">
            <h3>Total News</h3>
            <p>{stats.totalNews || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow"><FaClock /></div>
          <div className="stat-info">
            <h3>Pending Approval</h3>
            <p>{pendingCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><FaCheckCircle /></div>
          <div className="stat-info">
            <h3>Published</h3>
            <p>{stats.publishedNews || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><FaUserEdit /></div>
          <div className="stat-info">
            <h3>Reporters</h3>
            <p>{stats.totalReporters || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-indigo"><FaUserTie /></div>
          <div className="stat-info">
            <h3>Editors</h3>
            <p>{stats.totalEditors || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red"><FaBolt /></div>
          <div className="stat-info">
            <h3>Breaking News</h3>
            <p>{stats.breakingNewsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main-grid">
        
        {/* Chart Section */}
        <div className="dashboard-card chart-card">
          <h3>News Statistics (This Week)</h3>
          <div className="chart-container" style={{ width: '100%', height: 300, minHeight: 300 }}>
            {isChartReady && (
              <ResponsiveContainer width="99%" height="100%" initialDimension={{ width: 1, height: 1 }}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="submissions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSub)" name="Submissions" />
                  <Area type="monotone" dataKey="published" stroke="#10b981" fillOpacity={1} fill="url(#colorPub)" name="Published" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="dashboard-side-panels">
          
          <div className="dashboard-card snippet-card">
            <div className="card-header-flex">
              <h3>Pending Approval</h3>
              <span className="view-all" onClick={() => navigate("/admin/pending")}>View All</span>
            </div>
            <div className="snippet-list">
              {pendingArticles.length === 0 ? (
                <div style={{ padding: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
                  No articles pending approval.
                </div>
              ) : (
                pendingArticles.map(article => (
                  <div key={article.id} className="snippet-item" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/review/${article.id}`)}>
                    <div className="snippet-icon"><FaClock style={{color: '#f59e0b'}}/></div>
                    <div className="snippet-content">
                      <h4>{article.title}</h4>
                      <span>By {article.reporter} • {article.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-card snippet-card">
            <div className="card-header-flex">
              <h3>Recent Activities</h3>
            </div>
            <div className="snippet-list">
              {recentActivities.length === 0 ? (
                <div style={{ padding: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
                  No recent activities recorded.
                </div>
              ) : (
                recentActivities.map(act => (
                  <div key={act.id} className="snippet-item">
                    <div className="snippet-icon">
                      {act.type === "published" || act.type === "approved" ? (
                        <FaCheckCircle style={{color: '#10b981'}}/>
                      ) : act.type === "rejected" ? (
                        <FaBolt style={{color: '#ef4444'}}/>
                      ) : (
                        <FaUserEdit style={{color: '#8b5cf6'}}/>
                      )}
                    </div>
                    <div className="snippet-content">
                      <h4>{act.text}</h4>
                      <span>{act.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
