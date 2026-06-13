import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FaHome, FaPlusSquare, FaFileAlt, FaUserEdit, 
  FaUpload, FaTimesCircle, FaRegCheckCircle, 
  FaBell, FaUserCircle, FaSignOutAlt, FaBolt 
} from "react-icons/fa";

function ReporterSidebar({ isOpen }) {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      
      <div className="sidebar-logo-container">
        <div className="sidebar-logo">
          <img src="/NEWS GHURU LOGO PNG.png" alt="NewsGhuru" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="sidebar-title-text" style={{ textAlign: "center", marginTop: "10px" }}>
          <span className="logo-title" style={{ fontSize: "24px", display: "block" }}>நியூஸ் குரு</span>
        </div>
      </div>

      <div className="sidebar-content">
        
        <NavLink className="sidebar-link" to="/reporter/dashboard">
          <span className="link-icon"><FaHome /></span>
          Dashboard
        </NavLink>

        <div className="sidebar-section">NEWS</div>
        <NavLink className="sidebar-link" to="/reporter/create-news">
          <span className="link-icon"><FaPlusSquare /></span>
          Create News
        </NavLink>
        <NavLink className="sidebar-link" to="/reporter/drafts">
          <span className="link-icon"><FaFileAlt /></span>
          My Drafts
        </NavLink>
        <NavLink className="sidebar-link" to="/reporter/my-articles">
          <span className="link-icon"><FaUserEdit /></span>
          My Articles
        </NavLink>
        
        <div className="sidebar-section">STATUS</div>
        <NavLink className="sidebar-link" to="/reporter/submitted">
          <span className="link-icon"><FaUpload /></span>
          Submitted News
        </NavLink>
        <NavLink className="sidebar-link" to="/reporter/rejected">
          <span className="link-icon"><FaTimesCircle /></span>
          Rejected News
        </NavLink>
        <NavLink className="sidebar-link" to="/reporter/published">
          <span className="link-icon"><FaRegCheckCircle /></span>
          Published News
        </NavLink>

        <div className="sidebar-section">ACCOUNT</div>
        <NavLink className="sidebar-link" to="/reporter/notifications">
          <span className="link-icon"><FaBell /></span>
          Notifications
        </NavLink>
        <NavLink className="sidebar-link" to="/reporter/profile">
          <span className="link-icon"><FaUserCircle /></span>
          My Profile
        </NavLink>

        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            <span className="link-icon"><FaSignOutAlt /></span>
            Logout
          </button>
        )}

      </div>
    </div>
  );
}

export default ReporterSidebar;
