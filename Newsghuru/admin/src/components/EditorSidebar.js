import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FiClock, FiCheckSquare, FiCheckCircle, FiXCircle, 
  FiBell, FiUser, FiLogOut, FiTv, FiLayers, FiPlusCircle,
  FiCamera, FiFolder, FiLayout
} from "react-icons/fi";

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
        
        <div className="sidebar-section">REVIEW QUEUE</div>
        
        <NavLink className="sidebar-link" to="/editor/pending">
          <span className="link-icon"><FiClock /></span>
          Pending Articles
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/review">
          <span className="link-icon"><FiCheckSquare /></span>
          Review Queue
        </NavLink>

        <div className="sidebar-section">CONTENT</div>

        <NavLink className="sidebar-link" to="/admin/categories">
          <span className="link-icon"><FiFolder /></span>
          Categories
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/homepage-builder">
          <span className="link-icon"><FiLayout /></span>
          Homepage Builder
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/shorts">
          <span className="link-icon"><FiTv /></span>
          Shorts Reels
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/photo-stories">
          <span className="link-icon"><FiCamera /></span>
          Photo Stories
        </NavLink>

        <div className="sidebar-section">ADVERTISEMENTS</div>

        <NavLink className="sidebar-link" to="/admin/ads/all">
          <span className="link-icon"><FiLayers /></span>
          All Advertisements
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/ads/add">
          <span className="link-icon"><FiPlusCircle /></span>
          Add Advertisement
        </NavLink>

        <div className="sidebar-section">STATUS</div>

        <NavLink className="sidebar-link" to="/editor/approved">
          <span className="link-icon"><FiCheckCircle /></span>
          Approved Articles
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/rejected">
          <span className="link-icon"><FiXCircle /></span>
          Rejected Articles
        </NavLink>

        <div className="sidebar-section">ACCOUNT</div>

        <NavLink className="sidebar-link" to="/editor/notifications">
          <span className="link-icon"><FiBell /></span>
          Notifications
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/profile">
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

export default EditorSidebar;
