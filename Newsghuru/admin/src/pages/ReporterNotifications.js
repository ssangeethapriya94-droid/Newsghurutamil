import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaTrophy, FaUpload, FaEnvelope, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterNotifications.css";

function ReporterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchNotifications = async (p = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/api/notifications?page=${p}&limit=${limit}`);
      setNotifications(res.data.notifications || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(p);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this notification?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/api/notifications/${id}`);
      fetchNotifications(page);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/api/notifications/mark-read");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications read:", error);
    }
  };

  const formatNotifyTime = (createdAt) => {
    if (!createdAt) return "";
    const diffMs = new Date() - new Date(createdAt);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case "submitted": return "notify-submitted";
      case "changes": return "notify-changes";
      case "rejected": return "notify-rejected";
      case "approved": return "notify-approved";
      case "published": return "notify-published";
      case "contact": return "notify-contact";
      default: return "";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "submitted": return <FaUpload color="#64748b" />;
      case "changes": return <FaExclamationCircle color="#f59e0b" />;
      case "rejected": return <FaTimesCircle color="#ef4444" />;
      case "approved": return <FaCheckCircle color="#3b82f6" />;
      case "published": return <FaTrophy color="#10b981" />;
      case "contact": return <FaEnvelope color="#8b5cf6" />;
      default: return <FaCheckCircle />;
    }
  };

  const handleNotificationClick = (notification) => {
    const textLower = (notification.text || "").toLowerCase();
    const isAd = textLower.includes("advertisement") || textLower.includes("ad campaign");
    const isShort = textLower.includes("short reel") || textLower.includes("news short") || textLower.includes("shorts");
    const isPhotoStory = textLower.includes("photo story");

    if (notification.type === "contact" && role === "admin") {
      navigate("/admin/contact-queries");
    } else if (isAd) {
      navigate("/admin/ads/all");
    } else if (isShort) {
      navigate("/admin/shorts");
    } else if (isPhotoStory) {
      navigate("/admin/photo-stories");
    } else if (notification.type === "submitted") {
      if (role === "admin") navigate("/admin/pending");
      else if (role === "editor") navigate("/editor/pending");
    } else if (notification.type === "approved") {
      if (role === "admin") navigate("/admin/pending");
      else if (role === "reporter") navigate("/reporter/submitted");
    } else if (notification.type === "published") {
      if (role === "admin") navigate("/admin/published");
      else if (role === "editor") navigate("/editor/approved");
      else if (role === "reporter") navigate("/reporter/published");
    } else if (notification.type === "rejected" || notification.type === "changes") {
      if (role === "editor") navigate("/editor/rejected");
      else if (role === "reporter") navigate("/reporter/rejected");
    }
  };

  return (
    <div className="reporter-notifications">
      <div className="notifications-header">
        <h2>🔔 Notifications</h2>
        {notifications.length > 0 && (
          <button className="mark-read-btn" onClick={markAllAsRead}>Mark all as read</button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
            No new notifications.
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id || notification.id} 
              className={`notification-card ${notification.read ? "read" : "unread"} ${getNotificationClass(notification.type)}`}
              onClick={() => handleNotificationClick(notification)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
              <div className="notification-content">
                <p className="notification-text">{notification.text}</p>
                {notification.reason && (
                  <p className="notification-reason"><strong>Reason:</strong> {notification.reason}</p>
                )}
                <span className="notification-time">{formatNotifyTime(notification.createdAt || notification.date)}</span>
              </div>
              <div className="notification-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button 
                  className="delete-notify-btn" 
                  onClick={(e) => deleteNotification(e, notification._id || notification.id)}
                  title="Delete notification"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    padding: "8px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <FaTrash />
                </button>
                {!notification.read && <div className="unread-dot" style={{ position: "static", margin: 0 }}></div>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "25px" }}>
          <button 
            onClick={() => fetchNotifications(page - 1)} 
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
              cursor: page === 1 ? "not-allowed" : "pointer",
              borderRadius: "8px",
              fontWeight: "600",
              opacity: page === 1 ? 0.5 : 1,
              transition: "all 0.2s"
            }}
          >
            &larr; Previous
          </button>
          <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Page {page} of {totalPages}
          </span>
          <button 
            onClick={() => fetchNotifications(page + 1)} 
            disabled={page === totalPages}
            style={{
              padding: "8px 16px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              borderRadius: "8px",
              fontWeight: "600",
              opacity: page === totalPages ? 0.5 : 1,
              transition: "all 0.2s"
            }}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default ReporterNotifications;
