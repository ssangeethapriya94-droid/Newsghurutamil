import React, { useState } from "react";
import "../styles/Header.css";
import { FaBars, FaSun, FaMoon, FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = ({ setSidebar, darkMode, setDarkMode, setAuthPopupVisible, onLoginSuccess, onLogout }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("readerToken");
  let readerData = null;
  try {
    const dataStr = localStorage.getItem("readerData");
    if (dataStr) {
      readerData = JSON.parse(dataStr);
    }
  } catch (e) {
    console.error("Error parsing readerData", e);
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    if (onLogout) {
      onLogout();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase().trim();

    const categoryMap = {
      "தற்போதைய செய்திகள்": "latest-news",
      "முக்கிய செய்திகள்": "latest-news",
      "breaking": "latest-news",
      "latest news": "latest-news",
      "தமிழகம்": "tamilnadu",
      "tamil": "tamilnadu",
      "tamilnadu": "tamilnadu",
      "இந்தியா": "india",
      "india": "india",
      "உலகம்": "world",
      "world": "world",
      "வணிகம்": "business",
      "business": "business",
      "விளையாட்டு": "sports",
      "sports": "sports",
      "கல்வி": "education",
      "education": "education",
      "அரசியல்": "politics",
      "politics": "politics",
      "சினிமா": "cinema",
      "cinema": "cinema",
      "தொழில்நுட்பம்": "tech",
      "technology": "tech",
    };

    const route = categoryMap[term] || term;
    navigate(`/${route}`);
    setShowSearch(false);
    setSearchTerm("");
  };

  if (showSearch) {
    return (
      <header className="header active-search-header">
        <form onSubmit={handleSearch} className="full-width-search">
          <button type="submit" className="full-search-btn">
            <FaSearch />
          </button>
          <input
            type="text"
            placeholder="தேடுக..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button type="button" className="full-close-btn" onClick={() => {
            setShowSearch(false);
            setSearchTerm("");
          }}>
            <FaTimes />
          </button>
        </form>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="menu-icon" onClick={() => setSidebar(true)}>
        <FaBars />
      </div>

      <div className="logo-section">
        <img
          src="/NEWS GHURU LOGO PNG.png"
          alt="logo"
          className="logo-image"
        />
        <h1 className="logo-title">நியூஸ் குரு</h1>
      </div>

      <div className="header-actions">
        <div
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>

        <div className="search-icon" onClick={() => setShowSearch(true)}>
          <FaSearch />
        </div>

        {token ? (
          <div className="auth-buttons">
            <div className="user-avatar" title={readerData?.name || "User"}>
              {getInitial(readerData?.name)}
            </div>
            <button className="auth-btn logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="auth-btn login-btn" onClick={() => setAuthPopupVisible(true)}>Login</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;