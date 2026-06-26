import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function ReporterMyArticles({ defaultFilter = "all" }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      let statusParam = filter;
      if (filter === "all") statusParam = "";

      const res = await API.get("/api/news/reporter/my-articles", {
        params: { status: statusParam }
      });
      setArticles(res.data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const getStatusClass = (status) => {
    switch (status) {
      case "published": return "badge-published";
      case "pending_editor_review": return "badge-pending";
      case "draft": return "badge-draft";
      default: return "";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published": return "Published";
      case "pending_editor_review": return "Pending Review";
      case "draft": return "Draft";
      default: return status;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article? 🗑️")) return;

    try {
      await API.delete(`/api/news/${id}`);
      alert("Article deleted successfully! 🗑️");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      alert(error.response?.data?.message || "Failed to delete article ❌");
    }
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>My Articles</h2>
        <div className="filter-actions">
          <select className="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="submitted">Submitted / Pending</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            No articles found for this filter.
          </div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>News Title</th>
                <th>Category</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id || article.id}>
                  <td className="article-title">{article.title}</td>
                  <td><span className="category-tag">{article.category}</span></td>
                  <td>{new Date(article.createdAt || article.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(article.status)}`}>
                      {getStatusLabel(article.status)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit" onClick={() => navigate(`/reporter/edit-news/${article._id}`)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete(article._id)}>Delete</button>
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

export default ReporterMyArticles;
