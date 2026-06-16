import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { 
  FiPlusSquare, FiFileText, FiEdit3, FiUploadCloud, 
  FiXCircle, FiCheckCircle, FiBell, FiUser, FiLogOut 
} from "react-icons/fi";

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
        
        <div className="sidebar-section">NEWS</div>
        
        <NavLink className="sidebar-link" to="/reporter/create-news">
          <span className="link-icon"><FiPlusSquare /></span>
          Create News
        </NavLink>
        
        <NavLink className="sidebar-link" to="/reporter/drafts">
          <span className="link-icon"><FiFileText /></span>
          My Drafts
        </NavLink>
        
        <NavLink className="sidebar-link" to="/reporter/my-articles">
          <span className="link-icon"><FiEdit3 /></span>
          My Articles
        </NavLink>
        
        <div className="sidebar-section">STATUS</div>
        
        <NavLink className="sidebar-link" to="/reporter/submitted">
          <span className="link-icon"><FiUploadCloud /></span>
          Submitted News
        </NavLink>
        
        <NavLink className="sidebar-link" to="/reporter/rejected">
          <span className="link-icon"><FiXCircle /></span>
          Rejected News
        </NavLink>
        
        <NavLink className="sidebar-link" to="/reporter/published">
          <span className="link-icon"><FiCheckCircle /></span>
          Published News
        </NavLink>

        <div className="sidebar-section">ACCOUNT</div>
        
        <NavLink className="sidebar-link" to="/reporter/notifications">
          <span className="link-icon"><FiBell /></span>
          Notifications
        </NavLink>
        
        <NavLink className="sidebar-link" to="/reporter/profile">
          <span className="link-icon"><FiUser /></span>
          My Profile
        </NavLink>

        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            <span className="link-icon"><FiLogOut /></span>
            Logout
          </button>
        )}

      </div>

      {/* Small themed glowing globe visual at the bottom of the sidebar */}
      <div className="sidebar-globe-container">
        <div className="sidebar-glowing-globe"></div>
        <div className="sidebar-globe-grid"></div>
      </div>
    </div>
  );
}

export default ReporterSidebar;
