import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FaHome, FaTasks, FaClipboardCheck, FaCheckCircle, 
  FaTimesCircle, FaBell, FaUserCircle, FaSignOutAlt, FaPenNib
} from "react-icons/fa";

function EditorSidebar({ isOpen }) {
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
        
        <NavLink className="sidebar-link" to="/editor/dashboard">
          <span className="link-icon"><FaHome /></span>
          Dashboard
        </NavLink>

        <div className="sidebar-section">REVIEW QUEUE</div>
        
        <NavLink className="sidebar-link" to="/editor/pending">
          <span className="link-icon"><FaTasks /></span>
          Pending Articles
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/review">
          <span className="link-icon"><FaClipboardCheck /></span>
          Review Queue
        </NavLink>

        <div className="sidebar-section">STATUS</div>

        <NavLink className="sidebar-link" to="/editor/approved">
          <span className="link-icon"><FaCheckCircle /></span>
          Approved Articles
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/rejected">
          <span className="link-icon"><FaTimesCircle /></span>
          Rejected Articles
        </NavLink>

        <div className="sidebar-section">ACCOUNT</div>

        <NavLink className="sidebar-link" to="/editor/notifications">
          <span className="link-icon"><FaBell /></span>
          Notifications
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/profile">
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

export default EditorSidebar;
