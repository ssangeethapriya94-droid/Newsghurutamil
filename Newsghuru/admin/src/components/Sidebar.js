import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FaHome, FaClock, FaListAlt, FaCheckCircle, 
  FaFire, FaTags, FaImages, FaUsers, 
  FaBell, FaChartBar, FaCog, FaUserCircle, 
  FaSignOutAlt, FaShieldAlt, FaPlusSquare
} from "react-icons/fa";

function Sidebar({ isOpen }) {
  const navigate = useNavigate();

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

        <NavLink className="sidebar-link" to="/admin/analytics">
          <span className="link-icon"><FaChartBar /></span>
          Analytics
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