import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaTrophy, FaUpload, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterNotifications.css";

function ReporterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/notifications");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
    if (notification.type === "contact" && role === "admin") {
      navigate("/admin/contact-queries");
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
              style={{ cursor: "pointer" }}
            >
              <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
              <div className="notification-content">
                <p className="notification-text">{notification.text}</p>
                {notification.reason && (
                  <p className="notification-reason"><strong>Reason:</strong> {notification.reason}</p>
                )}
                <span className="notification-time">{formatNotifyTime(notification.createdAt || notification.date)}</span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReporterNotifications;
