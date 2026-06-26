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

  // Mega dropdown content cache
  const [megaMenuData, setMegaMenuData] = useState({});
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

  // Handle outside clicks
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

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("readerToken");
    localStorage.removeItem("readerData");
    if (onLogout) onLogout();
    navigate("/", { replace: true });
  };

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

  const trendingTopics = [
    "ஐபிஎல் கிரிக்கெட்",
    "தமிழகம்",
    "திரைப்படம்",
    "புதிய கல்வி கொள்கை",
    "வளர்ச்சி திட்டங்கள்",
    "விண்வெளி"
  ];

  const categoryEnglishMap = {
    breaking: "தற்போதைய செய்தி",
    tamil: "தமிழகம்",
    india: "இந்தியா",
    world: "உலகம்",
    business: "வணிகம்",
    sports: "விளையாட்டு",
    education: "கல்வி",
    politics: "அரசியல்",
    cinema: "சினிமா",
    tech: "தொழில்நுட்பம்",
    technology: "தொழில்நுட்பம்",
    anmigam: "ஆன்மீகம்"
  };

  const getCategoryLabel = (cat) => categoryEnglishMap[cat?.toLowerCase()] || cat;

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    saveRecentSearch(searchQuery.trim());

    // Category mapping via helper
    const getCategoryRouteFromTerm = (term) => {
      // Spiritual mappings
      if (/spiritual|spirituality|anmigam|ஆன்மீகம்|ஆன்மீக/i.test(term)) return "anmigam";
      if (/horoscope|astrology|rasi\s*palan|ஜோதிடம்|ஜோசியம்|ராசிபலன்|ராசி\s*பலன்/i.test(term)) return "anmigam/rasi-palan";
      if (/temple|kovil|temple\s*blogs|கோவில்|கோயில்/i.test(term)) return "anmigam/temple-blogs";

      // Regular category mappings
      if (/தற்போதைய|முக்கிய|breaking|latest\s*news/i.test(term)) return "latest-news";
      if (/தமிழகம்|tamil\s*nadu|tamilnadu|tamil/i.test(term)) return "tamil";
      if (/இந்தியா|india|national/i.test(term)) return "india";
      if (/உலகம்|world|international/i.test(term)) return "world";
      if (/வணிகம்|business|finance|markets/i.test(term)) return "business";
      if (/விளையாட்டு|sports/i.test(term)) return "sports";
      if (/கல்வி|education/i.test(term)) return "education";
      if (/அரசியல்|politics/i.test(term)) return "politics";
      if (/சினிமா|cinema|movies/i.test(term)) return "cinema";
      if (/தொழில்நுட்பம்|tech|technology/i.test(term)) return "tech";
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
      alert("தங்கள் உலாவியில் குரல் தேடல் வசதி இல்லை. (Speech recognition is not supported in this browser)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ta-IN"; // Tamil language code
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
    { name: "முகப்பு",          slug: "/",             icon: <FaHome /> },
    { name: "தற்போதைய செய்தி", slug: "/latest-news",   icon: <FaNewspaper /> },
    { name: "தமிழகம்",         slug: "/tamil",         icon: <FaMapMarkerAlt /> },
    { name: "இந்தியா",          slug: "/india",         icon: <FaFlag /> },
    { name: "உலகம்",            slug: "/world",         icon: <FaGlobe /> },
    { name: "வணிகம்",           slug: "/business",      icon: <FaBriefcase /> },
    { name: "விளையாட்டு",       slug: "/sports",        icon: <FaFutbol /> },
    { name: "கல்வி",            slug: "/education",     icon: <FaGraduationCap /> },
    { name: "அரசியல்",          slug: "/politics",      icon: <FaLandmark /> },
    { name: "சினிமா",           slug: "/cinema",        icon: <FaFilm /> },
    { name: "ஆன்மீகம்",          slug: "/anmigam",       icon: <FaOm /> },
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
            src="/NEWS GHURU LOGO PNG.png"
            alt="நியூஸ் குரு லோகோ"
            className="brand-logo-img"
          />
          <h1 className="brand-name-serif">நியூஸ் குரு</h1>
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
                    placeholder="செய்திகளைத் தேடுங்கள்..."
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
                title="குரல் தேடல்"
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
                    <h5 className="header-search-section-title">தேடல் முடிவுகள்:</h5>
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
                        <span>செய்திகள் எதுவும் கிடைக்கவில்லை</span>
                      </div>
                    )}
                  </div>
                )}

                {!searchQuery.trim() && (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="header-search-recent-section">
                        <h5 className="header-search-section-title">சமீபத்திய தேடல்கள்:</h5>
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
                      <h5 className="header-search-section-title">டிரெண்டிங் தலைப்புகள்:</h5>
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
            title="தேடுக"
          >
            <FaSearch />
          </button>

          {/* DARK MODE TOGGLE */}
          <button className="header-icon-btn header-theme-btn" onClick={() => setDarkMode(!darkMode)} title="தீம் மாற்றுக">
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
              title="சந்தா திட்டங்களைப் பார்க்கவும்"
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
                    {readerData?.name || "பயனர்"}
                  </div>
                  <button className="lang-item" onClick={() => { setShowProfileMenu(false); navigate("/bookmarks"); }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    புக்மார்க்குகள்
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

            {/* ANMIGAM CUSTOM DROPDOWN */}
            {hoveredCategory === "/anmigam" && item.slug === "/anmigam" && (
              <div className="anmigam-dropdown-panel">
                <NavLink to="/anmigam/rasi-palan" className="mega-dropdown-sublink" onClick={() => setHoveredCategory(null)}>
                  ராசி பலன்
                </NavLink>
                <NavLink to="/anmigam/temple-blogs" className="mega-dropdown-sublink" onClick={() => setHoveredCategory(null)}>
                  கோவில் பதிவுகள்
                </NavLink>
              </div>
            )}


          </div>
        ))}
      </nav>


    </div>
  );
};

export default Header;