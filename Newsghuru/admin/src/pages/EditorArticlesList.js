import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterMyArticles.css"; // Reuse the styling

function EditorArticlesList({ defaultFilter = "pending" }) {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/news/editor/review-queue", {
        params: { status: filter }
      });
      setArticles(res.data || []);
    } catch (error) {
      console.error("Error fetching editor queue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const getStatusClass = (status) => {
    switch (status) {
      case "published": return "badge-published";
      case "pending_editor_review": return "badge-pending";
      case "pending_admin_verification": return "badge-approved";
      case "rejected": return "badge-rejected";
      case "admin_rejected": return "badge-rejected";
      case "draft": return "badge-draft";
      default: return "";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published": return "Published";
      case "pending_editor_review": return "Pending Review";
      case "pending_admin_verification": return "Pending Approval";
      case "rejected": return "Rejected";
      case "admin_rejected": return "Returned by Admin";
      case "draft": return "Draft";
      default: return status;
    }
  };

  // Determine the action label and button style for each article
  const getActionConfig = (article) => {
    if (article.status === "pending_editor_review") {
      return { label: "Review", isEdit: true };
    }
    // Both editor-rejected and admin-rejected articles can be edited and resubmitted to admin
    if (article.status === "rejected" || article.status === "admin_rejected") {
      return { label: "Edit & Resubmit", isEdit: true };
    }
    return { label: "View", isEdit: false };
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>
          {filter === 'pending' ? 'Pending Articles Queue' : 
           filter === 'approved' ? 'Approved Articles' : 
           filter === 'rejected' ? 'Rejected Articles' : 'All Articles'}
        </h2>
        <div className="filter-actions">
          <select className="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Articles</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected Articles</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            Loading queue...
          </div>
        ) : articles.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            No articles found for this queue.
          </div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th>News Title</th>
                <th>Reporter</th>
                <th>Category</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const actionConfig = getActionConfig(article);
                return (
                  <tr key={article._id}>
                    <td className="article-title">{article.title}</td>
                    <td>
                      <span className="reporter-name" style={{fontWeight: 600, color: 'var(--text-main)'}}>
                        {article.reporterId?.name || "Reporter User"}
                      </span>
                    </td>
                    <td><span className="category-tag">{article.category}</span></td>
                    <td>{article.submittedAt ? new Date(article.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(article.createdAt || article.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(article.status)}`}
                        style={article.status === 'admin_rejected' ? {background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b'} : {}}>
                        {getStatusLabel(article.status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn edit" 
                        style={{
                          background: actionConfig.isEdit ? 'var(--brand-gradient)' : '#64748b',
                          color: '#ffffff', 
                          border: 'none'
                        }}
                        onClick={() => navigate(`/editor/review/${article._id}`)}
                      >
                        {actionConfig.label}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EditorArticlesList;

