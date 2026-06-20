import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterMyArticles.css"; // Reuse the styling

function AdminArticlesList({ defaultFilter = "pending" }) {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/news/admin/articles?filter=${filter}`);
      setArticles(res.data || []);
    } catch (error) {
      console.error("Error loading admin articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Published": return "badge-published";
      case "Pending Review": return "badge-pending";
      case "Draft": return "badge-draft";
      case "Pending Admin Verification": return "badge-approved";
      case "Rejected": return "badge-rejected";
      case "Submitted": return "badge-submitted";
      default: return "";
    }
  };

  // List unique categories for category filter
  const categoriesList = [...new Set(articles.map(a => a.category))].filter(Boolean);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.editor.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !categoryFilter || article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>
          {filter === 'pending' ? 'Pending Admin Approval' : 
           filter === 'published' ? 'Published News' : 'All News'}
        </h2>
        <div className="filter-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search news, reporter, editor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", fontSize: "14px" }}
          />

          <select
            className="status-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select className="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All News</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            Loading articles list...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            No articles found for this queue.
          </div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>News Title</th>
                <th>Reporter</th>
                <th>Editor</th>
                <th>Category</th>
                <th>Date</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td className="article-title">{article.title}</td>
                  <td><span className="reporter-name" style={{fontWeight: 600, color: 'var(--text-main)'}}>{article.reporter || "Reporter"}</span></td>
                  <td><span className="reporter-name" style={{fontWeight: 600, color: 'var(--accent-orange)', background: 'rgba(244, 180, 0, 0.15)'}}>{article.editor || "Editor"}</span></td>
                  <td><span className="category-tag">{article.category}</span></td>
                  <td>{article.date}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>
                      👁 {(article.views || 0).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(article.status)}`}>
                      {article.status === "Pending Admin Verification" ? "Pending Approval" : article.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {article.status === "Pending Admin Verification" ? (
                      <button 
                        className="action-btn edit" 
                        style={{background: 'var(--brand-gradient)', color: '#ffffff', border: 'none'}}
                        onClick={() => navigate(`/admin/review/${article.id}`)}
                      >
                        Verify
                      </button>
                    ) : (
                      <button 
                        className="action-btn" 
                        style={{background: 'var(--brand-gradient)', color: '#ffffff', border: 'none'}}
                        onClick={() => navigate(`/admin/review/${article.id}`)}
                      >
                        Preview
                      </button>
                    )}
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

export default AdminArticlesList;
