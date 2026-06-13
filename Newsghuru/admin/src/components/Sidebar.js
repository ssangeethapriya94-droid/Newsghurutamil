import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FaHome, FaClock, FaListAlt, FaCheckCircle, 
  FaFire, FaTags, FaImages, FaUsers, 
  FaBell, FaChartBar, FaCog, FaUserCircle, 
  FaSignOutAlt, FaShieldAlt, FaPlusSquare, FaEnvelopeOpenText
} from "react-icons/fa";
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
          <span className="link-icon"><FaHome /></span>
          Dashboard
        </NavLink>

        <div className="sidebar-section">NEWS MANAGEMENT</div>
        
        <NavLink className="sidebar-link" to="/admin/add-news">
          <span className="link-icon"><FaPlusSquare /></span>
          Add News
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/pending">
          <span className="link-icon"><FaClock /></span>
          Pending Approval
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/all-news">
          <span className="link-icon"><FaListAlt /></span>
          All News
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/published">
          <span className="link-icon"><FaCheckCircle /></span>
          Published News
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/breaking">
          <span className="link-icon"><FaFire /></span>
          Breaking News
        </NavLink>

        <div className="sidebar-section">CONTENT</div>

        <NavLink className="sidebar-link" to="/admin/categories">
          <span className="link-icon"><FaTags /></span>
          Categories
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/media">
          <span className="link-icon"><FaImages /></span>
          Media Library
        </NavLink>

        <div className="sidebar-section">SYSTEM</div>

        <NavLink className="sidebar-link" to="/admin/users">
          <span className="link-icon"><FaUsers /></span>
          Users
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/contact-queries" style={{ position: "relative" }}>
          <span className="link-icon"><FaEnvelopeOpenText /></span>
          Contact Queries
          {unreadCount > 0 && (
            <span style={{
              background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "bold",
              padding: "2px 6px", borderRadius: "10px", marginLeft: "auto"
            }}>
              {unreadCount}
            </span>
          )}
        </NavLink>



        <div className="sidebar-section">ACCOUNT</div>

        <NavLink className="sidebar-link" to="/admin/notifications">
          <span className="link-icon"><FaBell /></span>
          Notifications
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/settings">
          <span className="link-icon"><FaCog /></span>
          Settings
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/profile">
          <span className="link-icon"><FaUserCircle /></span>
          My Profile
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="link-icon"><FaSignOutAlt /></span>
          Logout
        </button>

      </div>
    </div>
  );
}

export default Sidebar;