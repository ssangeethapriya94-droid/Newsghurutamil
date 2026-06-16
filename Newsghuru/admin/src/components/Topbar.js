import React, { useState, useEffect } from 'react';
import { FiBell, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import API from '../config/api';
import '../styles/Topbar.css';

function Topbar({ toggleSidebar, role }) {
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
          <FiMenu />
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="topbar-right">
        <button
          className={`theme-toggle-pill${theme === 'light' ? ' light-active' : ''}`}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark/light mode"
        >
          {/* Moon icon */}
          <span className="toggle-icon toggle-moon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
            </svg>
          </span>
          {/* Sliding knob */}
          <span className="toggle-knob"></span>
          {/* Sun icon */}
          <span className="toggle-icon toggle-sun">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </button>

        <div className="notifications" onClick={() => navigate(`/${role}/notifications`)} title="Notifications">
          <FiBell />
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
