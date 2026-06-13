import React, { useState, useEffect } from 'react';
import { FaBell, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../config/api';
import '../styles/Topbar.css';

function Topbar({ toggleSidebar, role }) {
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/api/notifications');
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="topbar-right">
        <div className="current-role-badge">
          {role?.charAt(0).toUpperCase() + role?.slice(1)} Mode
        </div>

        <div className="notifications" onClick={() => navigate(`/${role}/notifications`)} title="Notifications">
          <FaBell />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>

        <div className="user-profile" onClick={() => navigate(`/${role}/profile`)} title="View Profile">
          <div className="avatar" style={{background: role === 'reporter' ? '#10b981' : role === 'editor' ? '#f59e0b' : '#2563eb'}}>
            {role === "reporter" ? "RP" : role === "editor" ? "ED" : "AD"}
          </div>
          <div className="user-info">
            <span className="user-name">
              {userName || (role === "reporter" ? "Reporter User" : role === "editor" ? "Editor User" : "Admin User")}
            </span>
            <span className="user-role">
              {role === "reporter" ? "News Reporter" : role === "editor" ? "Content Editor" : "Super Admin"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
