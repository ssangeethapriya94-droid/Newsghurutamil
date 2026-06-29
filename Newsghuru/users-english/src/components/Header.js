import React, { useState, useEffect, useRef } from "react";
import { 
  FaBars, FaSun, FaMoon, FaSearch, FaSignOutAlt,
  FaHome, FaNewspaper, FaMapMarkerAlt, FaFlag, FaGlobe, FaBriefcase,
  FaFutbol, FaGraduationCap, FaLandmark, FaFilm, FaOm,
  FaMicrophone, FaTimes, FaHistory
} from "react-icons/fa";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import API from "../config/api";
import DateBar from "./DateBar";
import AdZone from "./AdZone";
import "../styles/Header.css";

const Header = ({ setSidebar, darkMode, setDarkMode, openLoginPopup, onLogout, currentUser, visitorCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Navigation states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [hoveredCategory, setHoveredCategory] = useState(null);

  const profileRef = useRef(null);
  const navRef = useRef(null);
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const lastTouchTimeRef = useRef(0);

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



  // Load published news and recent searches for instant search dropdown
  useEffect(() => {
    if (showSearch) {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
      API.get("/api/news/published")
        .then((res) => {
          setAllNews(res.data || []);
        })
        .catch((err) => console.error("Error loading news for header search:", err));
    }
  }, [showSearch]);

  // Handle real-time matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const queryWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matched = allNews.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const desc = (item.shortDescription || item.description || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()).join(" ") : (item.tags || "").toLowerCase();
      const content = (item.content || "").toLowerCase();

      return queryWords.every(word => 
        title.includes(word) ||
        desc.includes(word) ||
        category.includes(word) ||
        tags.includes(word) ||
        content.includes(word)
      );
    });
    setSearchResults(matched);
  }, [searchQuery, allNews]);

  // Handle outside clicks to close profile menu & category hovers
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Handle outside clicks to close search bar
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close search bar on navigation
  useEffect(() => {
    setShowSearch(false);
    setSearchQuery("");
  }, [location.pathname]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    if (onLogout) onLogout();
    navigate("/", { replace: true });
  };

  const trendingTopics = [
    "IPL Cricket",
    "Tamil Nadu",
    "Cinema",
    "New Education Policy",
    "Development Schemes",
    "Space"
  ];

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    saveRecentSearch(searchQuery.trim());

    const getCategoryRouteFromTerm = (term) => {
      if (/spiritual|spirituality|anmigam/i.test(term)) return "anmigam";
      if (/horoscope|astrology|rasi\s*palan/i.test(term)) return "anmigam/rasi-palan";
      if (/temple|kovil|temple\s*blogs/i.test(term)) return "anmigam/temple-blogs";

      if (/breaking|latest\s*news/i.test(term)) return "latest-news";
      if (/tamil\s*nadu|tamilnadu|tamil/i.test(term)) return "tamil";
      if (/india|national/i.test(term)) return "india";
      if (/world|international/i.test(term)) return "world";
      if (/business|finance|markets/i.test(term)) return "business";
      if (/sports/i.test(term)) return "sports";
      if (/education/i.test(term)) return "education";
      if (/politics/i.test(term)) return "politics";
      if (/cinema|movies/i.test(term)) return "cinema";
      if (/tech|technology/i.test(term)) return "tech";
      return null;
    };

    const term = searchQuery.toLowerCase().trim();
    const route = getCategoryRouteFromTerm(term);
    if (route) {
      navigate(`/${route}`);
    } else {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      setIsListening(false);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
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
    { name: "Spiritual",     slug: "/anmigam",       icon: <FaOm /> },
  ];

  return (
    <div className="premium-header-container glass-panel">

      {/* LAYER 2: MAIN HEADER BAR */}
      <div className="header-main-bar">
        <div className={`brand-section ${showSearch ? "hide-on-mobile" : ""}`} onClick={() => navigate("/")}>
          <div className="menu-icon" style={{ fontSize: "1.4rem", marginRight: "12px", display: "flex", alignItems: "center" }} onClick={(e) => { e.stopPropagation(); setSidebar(true); }}>
            <FaBars />
          </div>
          <img
            src="/NEWS GHURU LOGO English.png"
            alt="News Ghuru Logo"
            className="brand-logo-img"
          />
          <h1 className="brand-name-serif">NEWS GHURU</h1>
        </div>

        {/* Center Section: Show search bar if active, else show ad banner on desktop */}
        {showSearch ? (
          <div className="header-search-center-wrap" ref={searchBarRef}>
            <div className="header-search-container">
              <form onSubmit={handleSearchSubmit} className="header-search-form">
                <div className="header-search-input-wrapper">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="header-search-input"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      className="header-search-clear-btn"
                      onClick={() => setSearchQuery("")}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <button type="submit" className="header-search-submit-btn">
                  <FaSearch />
                </button>
              </form>

              <button 
                type="button" 
                className={`header-search-mic-btn ${isListening ? "active" : ""}`}
                onClick={handleVoiceSearch}
                title="Voice Search"
              >
                <FaMicrophone />
              </button>

              <button 
                type="button" 
                className="header-search-close-mobile-btn"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Dropdown Suggestions under the search input */}
            {(searchQuery.trim() || recentSearches.length > 0 || trendingTopics.length > 0) && (
              <div className="header-search-suggestions-dropdown">
                {searchQuery.trim() && (
                  <div className="header-search-results-section">
                    <h5 className="header-search-section-title">Search Results:</h5>
                    {searchResults.length > 0 ? (
                      <div className="header-search-results-list">
                        {searchResults.slice(0, 8).map((item) => (
                          <div
                            key={item._id}
                            className="header-search-suggestion-item"
                            onClick={() => {
                              navigate(`/news/${item._id}`, { state: item });
                              saveRecentSearch(searchQuery.trim());
                              setShowSearch(false);
                              setSearchQuery("");
                            }}
                          >
                            <FaSearch className="suggestion-search-icon" />
                            <span className="suggestion-text">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="header-search-no-results">
                        <span>No articles found</span>
                      </div>
                    )}
                  </div>
                )}

                {!searchQuery.trim() && (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="header-search-recent-section">
                        <h5 className="header-search-section-title">Recent Searches:</h5>
                        <div className="header-search-results-list">
                          {recentSearches.map((term, index) => (
                            <div
                              key={index}
                              className="header-search-suggestion-item"
                              onClick={() => {
                                setSearchQuery(term);
                                setTimeout(() => searchInputRef.current?.focus(), 50);
                              }}
                            >
                              <FaHistory className="suggestion-search-icon" />
                              <span className="suggestion-text">{term}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="header-search-trending-section">
                      <h5 className="header-search-section-title">Trending Topics:</h5>
                      <div className="header-search-trending-chips">
                        {trendingTopics.map((term) => (
                          <span
                            key={term}
                            className="header-search-tag-chip"
                            onClick={() => {
                              setSearchQuery(term);
                              setTimeout(() => searchInputRef.current?.focus(), 50);
                            }}
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* HEADER ADVERTISEMENT BANNER */
          !readerData?.isPremium && (
            <div className="header-ad-zone">
              <AdZone position="HEADER_BANNER" />
            </div>
          )
        )}

        <div className={`main-bar-actions ${showSearch ? "hide-on-mobile" : ""}`}>
          {/* SEARCH OVERLAY TRIGGER */}
          <button 
            className="header-icon-btn header-search-btn" 
            onClick={() => {
              setShowSearch(!showSearch);
              setTimeout(() => {
                if (!showSearch && searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 50);
            }} 
            title="Search"
          >
            <FaSearch />
          </button>

          {/* DARK MODE TOGGLE */}
          <button className="header-icon-btn header-theme-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* LANGUAGE SWITCHER — switches to Tamil portal */}
          <a
            className="lang-portal-btn"
            href={process.env.REACT_APP_TAMIL_URL || "http://localhost:3004"}
            target="_blank"
            rel="noopener noreferrer"
            title="Switch to Tamil Website"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--brand-gradient, linear-gradient(135deg, #c2410c 0%, #f97316 100%))",
              color: "#fff",
              fontWeight: "800",
              fontSize: "0.95rem",
              fontFamily: "'Georgia', serif",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(234,88,12,0.45)",
              border: "2px solid rgba(255,255,255,0.25)",
              letterSpacing: "-0.5px",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.12)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(234,88,12,0.65)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(234,88,12,0.45)";
            }}
          >
            T
          </a>

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
                <div className="lang-menu" style={{ minWidth: "180px" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {readerData?.name || "User"}
                  </div>
                  <button className="lang-item" onClick={() => { setShowProfileMenu(false); navigate("/campaigns"); }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    📢 My Campaigns
                  </button>
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
      <nav className="mega-nav-bar" ref={navRef}>
        {categories.map((item, idx) => (
          <div 
            key={idx}
            className="mega-nav-item-wrapper"
            onTouchStart={() => {
              lastTouchTimeRef.current = Date.now();
            }}
            onMouseEnter={() => {
              if (item.slug === "/anmigam") {
                if (Date.now() - lastTouchTimeRef.current < 1000) return;
                setHoveredCategory("/anmigam");
              }
            }}
            onMouseLeave={() => {
              if (item.slug === "/anmigam") {
                if (Date.now() - lastTouchTimeRef.current < 1000) return;
                setHoveredCategory(null);
              }
            }}
            style={{ height: "100%", position: "relative" }}
          >
            {item.slug === "/anmigam" ? (
              <div
                className={`mega-nav-item ${
                  location.pathname.startsWith("/anmigam") ? "active" : ""
                }`}
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredCategory(hoveredCategory === "/anmigam" ? null : "/anmigam");
                }}
              >
                <span style={{ marginRight: "6px", display: "inline-flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
            ) : (
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
            )}

            {/* SPIRITUAL CUSTOM DROPDOWN */}
            {hoveredCategory === "/anmigam" && item.slug === "/anmigam" && (
              <div className="anmigam-dropdown-panel">
                <NavLink to="/anmigam/rasi-palan" className="mega-dropdown-sublink" onClick={() => setHoveredCategory(null)}>
                  Horoscope
                </NavLink>
                <NavLink to="/anmigam/temple-blogs" className="mega-dropdown-sublink" onClick={() => setHoveredCategory(null)}>
                  Temple Blogs
                </NavLink>
              </div>
            )}


          </div>
        ))}
      </nav>

      {/* Slide-down Search Bar & Dropdown Results */}

    </div>
  );
};

export default Header;