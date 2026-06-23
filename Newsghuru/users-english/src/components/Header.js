import React, { useState, useEffect, useRef } from "react";
import { 
  FaBars, FaSun, FaMoon, FaSearch, FaSignOutAlt,
  FaHome, FaNewspaper, FaMapMarkerAlt, FaFlag, FaGlobe, FaBriefcase,
  FaFutbol, FaGraduationCap, FaLandmark, FaFilm, FaOm
} from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import API from "../config/api";
import SearchOverlay from "./SearchOverlay";
import DateBar from "./DateBar";
import AdZone from "./AdZone";
import "../styles/Header.css";

const Header = ({ setSidebar, darkMode, setDarkMode, openLoginPopup, onLogout, currentUser, visitorCount }) => {
  const navigate = useNavigate();

  // Search & Navigation states
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mega dropdown content cache
  const [megaMenuData, setMegaMenuData] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const profileRef = useRef(null);

  const token = localStorage.getItem("readerToken");
  const readerData = currentUser || (() => {
    try {
      const dataStr = localStorage.getItem("readerData");
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (e) {
      console.error("Error parsing readerData", e);
      return null;
    }
  })();

  // Handle outside clicks
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    if (onLogout) onLogout();
    navigate("/", { replace: true });
  };

  // Mega Navigation hover prefetcher
  const handleCategoryHover = (categorySlug) => {
    setHoveredCategory(categorySlug);
    if (categorySlug === "/" || categorySlug === "/latest-news") return;

    // Clean slug for API: "/tamil" -> "tamil", "/category/health" -> "health"
    const cleanCat = categorySlug
      .replace(/^\/category\//, "")
      .replace(/^\//, "");

    if (!megaMenuData[categorySlug]) {
      API.get(`/api/news/category/${cleanCat}`)
        .then((res) => {
          setMegaMenuData((prev) => ({
            ...prev,
            [categorySlug]: (res.data || []).slice(0, 4),
          }));
        })
        .catch((err) => console.error(`Error prefetching category ${cleanCat}:`, err));
    }
  };

  const categories = [
    { name: "Home",          slug: "/",             icon: <FaHome /> },
    { name: "Latest News",   slug: "/latest-news",   icon: <FaNewspaper /> },
    { name: "Tamil Nadu",   slug: "/tamil",         icon: <FaMapMarkerAlt /> },
    { name: "India",         slug: "/india",         icon: <FaFlag /> },
    { name: "World",         slug: "/world",         icon: <FaGlobe /> },
    { name: "Business",      slug: "/business",      icon: <FaBriefcase /> },
    { name: "Sports",        slug: "/sports",        icon: <FaFutbol /> },
    { name: "Education",     slug: "/education",     icon: <FaGraduationCap /> },
    { name: "Politics",      slug: "/politics",      icon: <FaLandmark /> },
    { name: "Cinema",        slug: "/cinema",        icon: <FaFilm /> },
  ];

  return (
    <div className="premium-header-container glass-panel">

      {/* LAYER 2: MAIN HEADER BAR */}
      <div className="header-main-bar">
        <div className="brand-section" onClick={() => navigate("/")}>
          <div className="menu-icon" style={{ fontSize: "1.4rem", marginRight: "12px", display: "flex", alignItems: "center" }} onClick={(e) => { e.stopPropagation(); setSidebar(true); }}>
            <FaBars />
          </div>
          <img
            src="/NEWS GHURU LOGO English.png"
            alt="News Ghuru Logo"
            className="brand-logo-img"
          />
          <h1 className="brand-name-serif">News Ghuru</h1>
        </div>

        {/* HEADER ADVERTISEMENT BANNER */}
        {!readerData?.isPremium && (
          <div className="header-ad-zone">
            <AdZone position="HEADER_BANNER" />
          </div>
        )}

        <div className="main-bar-actions">
          {/* SEARCH OVERLAY TRIGGER */}
          <button className="header-icon-btn header-search-btn" onClick={() => setShowSearchOverlay(true)} title="Search">
            <FaSearch />
          </button>

          {/* DARK MODE TOGGLE */}
          <button className="header-icon-btn header-theme-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* SUBSCRIBE BUTTON or PREMIUM BADGE */}
          {readerData?.isPremium ? (
            <div 
              className="premium-badge-header" 
              style={{ 
                background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", 
                color: "#fff", 
                padding: "6px 12px", 
                borderRadius: "20px", 
                fontWeight: "700", 
                fontSize: "0.78rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "4px",
                marginRight: "10px",
                boxShadow: "0 2px 8px rgba(234, 179, 8, 0.3)",
                userSelect: "none",
                cursor: "pointer"
              }}
              title="View subscription plans"
              onClick={() => navigate("/subscribe")}
            >
              PREMIUM 👑
            </div>
          ) : (
            <button 
              className="subscribe-header-btn" 
              style={{ 
                background: "var(--brand-gradient)", 
                color: "#fff", 
                border: "none", 
                padding: "8px 16px", 
                borderRadius: "var(--border-radius-sm)", 
                fontWeight: "700", 
                fontSize: "0.85rem",
                cursor: "pointer",
                marginRight: "10px",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                transition: "all 0.2s ease"
              }} 
              onClick={() => navigate("/subscribe")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(234, 88, 12, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(234, 88, 12, 0.3)";
              }}
            >
              SUBSCRIBE
            </button>
          )}

          {/* PROFILE SYSTEM */}
          {token ? (
            <div className="lang-dropdown-wrapper" ref={profileRef}>
              <div 
                className="user-avatar" 
                style={{ width: "38px", height: "38px", cursor: "pointer", background: "var(--brand-gradient)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: "700" }} 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {readerData?.name ? readerData.name.charAt(0).toUpperCase() : "U"}
              </div>
              {showProfileMenu && (
                <div className="lang-menu" style={{ minWidth: "160px" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {readerData?.name || "User"}
                  </div>
                  <button className="lang-item" onClick={() => { setShowProfileMenu(false); navigate("/bookmarks"); }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    Bookmarks
                  </button>
                  <button className="lang-item" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-red)" }}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="auth-btn login-btn" 
              style={{ background: "var(--brand-gradient)", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "var(--border-radius-sm)", fontWeight: "600", cursor: "pointer" }} 
              onClick={() => openLoginPopup && openLoginPopup()}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* LAYER 2.5: DATE BAR */}
      <DateBar visitorCount={visitorCount} />

      {/* LAYER 3: MEGA MENU NAVBAR */}
      <nav className="mega-nav-bar">
        {categories.map((item, idx) => (
          <div 
            key={idx}
            className="mega-nav-item-wrapper"
            onMouseEnter={() => handleCategoryHover(item.slug)}
            onMouseLeave={() => setHoveredCategory(null)}
            style={{ height: "100%" }}
          >
            <NavLink
              to={item.slug}
              className={({ isActive }) =>
                isActive ? "mega-nav-item active" : "mega-nav-item"
              }
              end={item.slug === "/"}
            >
              <span style={{ marginRight: "6px", display: "inline-flex", alignItems: "center" }}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </NavLink>

            {/* MEGA DROP DOWN PANEL */}
            {hoveredCategory === item.slug && item.slug !== "/" && item.slug !== "/latest-news" && (
              <div className="mega-dropdown-panel">
                <div>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: "14px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                    Latest {item.name} News:
                  </h4>
                  <div className="mega-dropdown-grid">
                    {megaMenuData[item.slug] && megaMenuData[item.slug].length > 0 ? (
                      megaMenuData[item.slug].map((article) => (
                        <div 
                          key={article._id} 
                          className="mega-dropdown-card"
                          onClick={() => {
                            navigate(`/news/${article._id}`, { state: article });
                            setHoveredCategory(null);
                          }}
                        >
                          <img src={article.image} alt={article.title} />
                          <div className="mega-dropdown-title">{article.title}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ gridColumn: "span 4", color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading news...</p>
                    )}
                  </div>
                </div>
                <div className="mega-dropdown-sidebar">
                  <h5 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", marginBottom: "10px" }}>Sections:</h5>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                    <li style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => { navigate(item.slug); setHoveredCategory(null); }}>News Collection &rarr;</li>
                    <li style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => { navigate("/latest-news"); setHoveredCategory(null); }}>Latest Events</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* FULLSCREEN SEARCH OVERLAY */}
      <SearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
    </div>
  );
};

export default Header;