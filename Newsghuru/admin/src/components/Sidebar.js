import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FiGrid, FiFileText, FiClock, FiList, FiCheckCircle, 
  FiZap, FiFolder, FiImage, FiUsers, FiMail, 
  FiBell, FiSettings, FiUser, FiLogOut 
} from "react-icons/fi";
import API from "../config/api";

function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (localStorage.getItem("role") === "admin") {
      try {
        const res = await API.get("/api/contact/unread-count");
        if (res.data.success) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {
        console.error("Error fetching unread count", err);
      }
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]); // Refetch when navigating (e.g. after reviewing a query)

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      
      <div className="sidebar-logo-container">
        <div className="sidebar-logo">
          <img src="/NEWS GHURU LOGO PNG.png" alt="NewsGhuru" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="sidebar-title-text" style={{ textAlign: "center", marginTop: "10px" }}>
          <span className="logo-title" style={{ fontSize: "24px", display: "block" }}>நியூஸ் குரு</span>
        </div>
      </div>

      <div className="sidebar-content">
        
        <NavLink className="sidebar-link" to="/admin/dashboard">
          <span className="link-icon"><FiGrid /></span>
          Dashboard
        </NavLink>

        <div className="sidebar-section">NEWS MANAGEMENT</div>
        
        <NavLink className="sidebar-link" to="/admin/add-news">
          <span className="link-icon"><FiFileText /></span>
          Add News
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/pending">
          <span className="link-icon"><FiClock /></span>
          Pending Approval
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/all-news">
          <span className="link-icon"><FiList /></span>
          All News
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/published">
          <span className="link-icon"><FiCheckCircle /></span>
          Published News
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/breaking">
          <span className="link-icon"><FiZap /></span>
          Breaking News
        </NavLink>

        <div className="sidebar-section">CONTENT</div>

        <NavLink className="sidebar-link" to="/admin/categories">
          <span className="link-icon"><FiFolder /></span>
          Categories
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/media">
          <span className="link-icon"><FiImage /></span>
          Media Library
        </NavLink>

        <div className="sidebar-section">SYSTEM</div>

        <NavLink className="sidebar-link" to="/admin/users">
          <span className="link-icon"><FiUsers /></span>
          Users
        </NavLink>



        <NavLink className="sidebar-link" to="/admin/contact-queries" style={{ position: "relative" }}>
          <span className="link-icon"><FiMail /></span>
          Contact Queries
          {unreadCount > 0 && (
            <span style={{
              background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "bold",
              padding: "2px 6px", borderRadius: "10px", marginLeft: "auto",
              boxShadow: "0 0 8px rgba(239, 68, 68, 0.4)"
            }}>
              {unreadCount}
            </span>
          )}
        </NavLink>

        <div className="sidebar-section">ACCOUNT</div>

        <NavLink className="sidebar-link" to="/admin/notifications">
          <span className="link-icon"><FiBell /></span>
          Notifications
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/settings">
          <span className="link-icon"><FiSettings /></span>
          Settings
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/profile">
          <span className="link-icon"><FiUser /></span>
          My Profile
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="link-icon"><FiLogOut /></span>
          Logout
        </button>

      </div>

      {/* Small themed glowing globe visual at the bottom of the sidebar */}
      <div className="sidebar-globe-container">
        <div className="sidebar-glowing-globe"></div>
        <div className="sidebar-globe-grid"></div>
      </div>
    </div>
  );
}

export default Sidebar;