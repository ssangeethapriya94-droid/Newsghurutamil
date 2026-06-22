import React, { useState } from "react";
import { FaHome, FaNewspaper, FaSearch, FaBookmark, FaBars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import SearchOverlay from "./SearchOverlay";

const MobileBottomNav = ({ setSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const isTabActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className="mobile-bottom-nav">
        <div 
          className={`mobile-nav-tab ${isTabActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <FaHome className="mobile-nav-icon" />
          <span>Home</span>
        </div>

        <div 
          className={`mobile-nav-tab ${isTabActive("/latest-news") ? "active" : ""}`}
          onClick={() => navigate("/latest-news")}
        >
          <FaNewspaper className="mobile-nav-icon" />
          <span>News</span>
        </div>

        <div 
          className="mobile-nav-tab"
          onClick={() => setSearchOpen(true)}
        >
          <FaSearch className="mobile-nav-icon" />
          <span>Search</span>
        </div>

        <div 
          className={`mobile-nav-tab ${isTabActive("/bookmarks") ? "active" : ""}`}
          onClick={() => navigate("/bookmarks")}
        >
          <FaBookmark className="mobile-nav-icon" />
          <span>Saved</span>
        </div>

        <div 
          className="mobile-nav-tab"
          onClick={() => setSidebar(true)}
        >
          <FaBars className="mobile-nav-icon" />
          <span>Menu</span>
        </div>
      </div>

      {/* FULLSCREEN SEARCH FOR MOBILE TABS */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
