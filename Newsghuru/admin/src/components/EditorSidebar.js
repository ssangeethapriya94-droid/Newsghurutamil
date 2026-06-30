import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FiClock, FiCheckSquare, FiCheckCircle, FiXCircle, 
  FiBell, FiUser, FiLogOut, FiTv, FiLayers, FiPlusCircle,
  FiCamera, FiSun, FiChevronUp, FiChevronDown
} from "react-icons/fi";

function EditorSidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anmigamExpanded, setAnmigamExpanded] = useState(
    location.pathname.startsWith("/admin/anmigam")
  );

  useEffect(() => {
    if (location.pathname.startsWith("/admin/anmigam")) {
      setAnmigamExpanded(true);
    }
  }, [location.pathname]);

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

        <NavLink className="sidebar-link" to="/admin/shorts">
          <span className="link-icon"><FiTv /></span>
          Shorts Reels
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/photo-stories">
          <span className="link-icon"><FiCamera /></span>
          Photo Stories
        </NavLink>

        <div className="sidebar-link-group">
          <button 
            type="button"
            className={`sidebar-link ${location.pathname.startsWith("/admin/anmigam") ? "active" : ""}`} 
            onClick={() => setAnmigamExpanded(!anmigamExpanded)}
            style={{ 
              width: "100%",
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              cursor: "pointer",
              textAlign: "left",
              outline: "none",
              background: "none",
              border: "none",
              padding: "10px 16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="link-icon"><FiSun /></span>
              Anmigam
            </div>
            <span style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
              {anmigamExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </button>
          {anmigamExpanded && (
            <div className="sidebar-sublinks">
              <NavLink 
                className="sidebar-sublink" 
                to="/admin/anmigam/rasi-palan"
              >
                Rasi Palan
              </NavLink>
              <NavLink 
                className="sidebar-sublink" 
                to="/admin/anmigam/temple-blogs"
              >
                Temple Blogs
              </NavLink>
            </div>
          )}
        </div>

        <div className="sidebar-section">ADVERTISEMENTS</div>

        <NavLink className="sidebar-link" to="/admin/ads/all">
          <span className="link-icon"><FiLayers /></span>
          All Advertisements
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/ads/add">
          <span className="link-icon"><FiPlusCircle /></span>
          Add Advertisement
        </NavLink>

        <NavLink className="sidebar-link" to="/editor/sponsored-articles">
          <span className="link-icon"><FiCheckSquare /></span>
          🌟 Sponsored Articles
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
