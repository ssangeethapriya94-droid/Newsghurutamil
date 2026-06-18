import React, { useState, useEffect, useRef } from "react";
import { 
  FaBars, FaSun, FaMoon, FaSearch, FaTimes, FaBell, 
  FaFacebookF, FaTwitter, FaYoutube, FaInstagram,
  FaCalendarAlt, FaChevronDown, FaClock, FaSignOutAlt, FaUserCircle,
  FaHome, FaNewspaper, FaMapMarkerAlt, FaFlag, FaGlobe, FaBriefcase,
  FaFutbol, FaGraduationCap, FaLandmark, FaFilm, FaOm
} from "react-icons/fa";
import { useNavigate, useSearchParams, NavLink } from "react-router-dom";
import API from "../config/api";
import SearchOverlay from "./SearchOverlay";
import DateBar from "./DateBar";
import "../styles/Header.css";

/* =========================================
   TAMIL CALENDAR UTILS
 ========================================= */
const thithis = [
  "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சடுத்து", "அஷ்டமி", 
  "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்தசி", "பௌர்ணமி", "அமாவாசை"
];
const natchathirams = [
  "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்",
  "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்",
  "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];
const yogams = ["சித்த யோகம்", "அமிர்த யோகம்", "மரண யோகம்"];
const karanams = ["பவம்", "பாலவம்", "கௌலவம்", "சைதுலை", "கரசை", "வனசை", "பத்திரை"];
const dailyThoughts = [
  "அன்பும் அறனும் உடைத்தாயின் இல்வாழ்க்கை பண்பும் பயனும் அது.",
  "விரோதம் தவிர்ப்பதுவே வாழ்வின் அமைதிக்கு வழி.",
  "கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.",
  "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு.",
  "ஒழுக்கம் விழுப்பம் தரலான் ஒழுக்கம் உயிரினும் ஓம்பப் படும்.",
  "இனிய உளவாக இன்னாத கூறல் கனிஇருப்பக் காய்கவர்ந் தற்று."
];
const dayOfWeekTimings = {
  0: { nallaNeramMorning: "07:30 AM - 08:30 AM", nallaNeramEvening: "03:30 PM - 04:30 PM", raghuKalam: "04:30 PM - 06:00 PM", yamagandam: "12:00 PM - 01:30 PM", kuligai: "03:00 PM - 04:30 PM", soolam: "மேற்கு", parigaram: "வெல்லம்", chandrashtamam: "பூராடம்" },
  1: { nallaNeramMorning: "06:30 AM - 07:30 AM", nallaNeramEvening: "04:30 PM - 05:30 PM", raghuKalam: "07:30 AM - 09:00 AM", yamagandam: "10:30 AM - 12:00 PM", kuligai: "01:30 PM - 03:00 PM", soolam: "கிழக்கு", parigaram: "தயிர்", chandrashtamam: "உத்திராடம்" },
  2: { nallaNeramMorning: "07:30 AM - 08:30 AM", nallaNeramEvening: "04:30 PM - 05:30 PM", raghuKalam: "03:00 PM - 04:30 PM", yamagandam: "09:00 AM - 10:30 AM", kuligai: "12:00 PM - 01:30 PM", soolam: "வடக்கு", parigaram: "பால்", chandrashtamam: "திருவோணம்" },
  3: { nallaNeramMorning: "09:00 AM - 10:30 AM", nallaNeramEvening: "04:30 PM - 05:30 PM", raghuKalam: "12:00 PM - 01:30 PM", yamagandam: "07:30 AM - 09:00 AM", kuligai: "10:30 AM - 12:00 PM", soolam: "வடக்கு", parigaram: "புளிதண்ணீர்", chandrashtamam: "அவிட்டம்" },
  4: { nallaNeramMorning: "09:00 AM - 10:30 AM", nallaNeramEvening: "04:30 PM - 05:30 PM", raghuKalam: "01:30 PM - 03:00 PM", yamagandam: "06:00 AM - 07:30 AM", kuligai: "09:00 AM - 10:30 AM", soolam: "தெற்கு", parigaram: "தயிர்", chandrashtamam: "சதயம்" },
  5: { nallaNeramMorning: "09:00 AM - 10:30 AM", nallaNeramEvening: "04:30 PM - 05:30 PM", raghuKalam: "10:30 AM - 12:00 PM", yamagandam: "03:00 PM - 04:30 PM", kuligai: "07:30 AM - 09:00 AM", soolam: "மேற்கு", parigaram: "சர்க்கரை", chandrashtamam: "பூரட்டாதி" },
  6: { nallaNeramMorning: "07:30 AM - 08:30 AM", nallaNeramEvening: "05:00 PM - 06:00 PM", raghuKalam: "09:00 AM - 10:30 AM", yamagandam: "01:30 PM - 03:00 PM", kuligai: "06:00 AM - 07:30 AM", soolam: "கிழக்கு", parigaram: "எண்ணெய்", chandrashtamam: "உத்திரட்டாதி" }
};

const getDynamicCalendarInfo = (targetDate) => {
  const dVal = targetDate.getDate();
  const dayVal = targetDate.getDay();
  const timings = dayOfWeekTimings[dayVal] || dayOfWeekTimings[0];
  return {
    ...timings,
    thithi: thithis[(dVal - 1) % thithis.length],
    natchathiram: natchathirams[(dVal - 1) % natchathirams.length],
    yogam: yogams[(dVal + dayVal) % yogams.length],
    karanam: karanams[(dVal * 2) % karanams.length],
    thought: dailyThoughts[(dVal - 1) % dailyThoughts.length]
  };
};

const Header = ({ setSidebar, darkMode, setDarkMode, openLoginPopup, onLogout, currentUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search & Navigation states
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Date / Time states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  // Mega dropdown content cache
  const [megaMenuData, setMegaMenuData] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Breaking updates loop in top strip
  const [topBreakingText, setTopBreakingText] = useState("சமீபத்திய செய்திகள்...");

  const dropdownRef = useRef(null);
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

  // Get active query date
  const getUrlDate = () => {
    try {
      const dateParam = searchParams.get('date');
      if (dateParam) {
        const d = new Date(dateParam);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const urlDate = getUrlDate();
  const displayDate = urlDate || currentTime;
  const calendarInfo = getDynamicCalendarInfo(displayDate);

  // Sync clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch top strip breaking news
  useEffect(() => {
    API.get("/api/news/category/breaking")
      .then(res => {
        if (res.data && res.data.length > 0) {
          setTopBreakingText(res.data[0].titleTa || res.data[0].title);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCalendarDropdown(false);
      }
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

  // Date Navigators
  const navigateToDate = (newDate) => {
    const dateString = newDate.toISOString().split('T')[0];
    navigate(`?date=${dateString}`, { replace: true });
    setShowCalendarDropdown(false);
  };

  const handlePrevDay = () => {
    const d = new Date(displayDate);
    d.setDate(d.getDate() - 1);
    navigateToDate(d);
  };

  const handleNextDay = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(displayDate);
    d.setDate(d.getDate() + 1);
    if (d <= today) navigateToDate(d);
  };

  const triggerPushPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      alert(`அறிவிப்புகள் அனுமதி நிலை: ${permission === "granted" ? "செயல்படுத்தப்பட்டது" : "நிராகரிக்கப்பட்டது"}`);
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
    { name: "ஆன்மீகம்",         slug: "/category/spiritual", icon: <FaOm /> },
  ];


  const tamilWeekDays = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];
  const formattedDate = `${displayDate.getDate()} ${displayDate.toLocaleString("ta-IN", { month: "long" })} ${displayDate.getFullYear()}`;
  const dayName = tamilWeekDays[displayDate.getDay()];

  return (
    <div className="premium-header-container glass-panel">
      {/* LAYER 1: TOP STRIP */}
      <div className="header-top-strip">
        <div className="top-strip-left">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>நேரலை</span>
          </div>
          <span>|</span>
          <span>சென்னை: 31°C ☀️</span>
          <span>|</span>
          {/* Detailed Calendar Popover Trigger */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <span 
              className="top-strip-link" 
              onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}
            >
              <FaCalendarAlt /> {formattedDate} ({dayName}) <FaChevronDown size={10} />
            </span>

            {showCalendarDropdown && (
              <div className="date-dropdown-menu" style={{ position: "absolute", top: "30px", left: 0, zIndex: 1100 }}>
                <div className="dinamalar-calendar-panel" style={{ width: "320px", padding: "16px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)" }}>
                  <div className="dc-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <button className="dc-nav-btn" onClick={handlePrevDay} style={{ background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", fontWeight: "700" }}>&lt; முந்தைய</button>
                    <span style={{ fontWeight: "700" }}>{displayDate.toLocaleDateString("en-GB")}</span>
                    <button className="dc-nav-btn" onClick={handleNextDay} style={{ background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", fontWeight: "700" }}>அடுத்த &gt;</button>
                  </div>
                  
                  <div className="dc-timings-section" style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "10px", fontSize: "0.8rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>நல்ல நேரம் (காலை):</span>
                      <span style={{ fontWeight: "600" }}>{calendarInfo.nallaNeramMorning}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>நல்ல நேரம் (மாலை):</span>
                      <span style={{ fontWeight: "600" }}>{calendarInfo.nallaNeramEvening}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>இராகு காலம்:</span>
                      <span style={{ fontWeight: "600" }}>{calendarInfo.raghuKalam}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>எமகண்டம்:</span>
                      <span style={{ fontWeight: "600" }}>{calendarInfo.yamagandam}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>திதி:</span>
                      <span style={{ color: "var(--accent-orange)", fontWeight: "600" }}>{calendarInfo.thithi}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>நட்சத்திரம்:</span>
                      <span style={{ color: "var(--accent-orange)", fontWeight: "600" }}>{calendarInfo.natchathiram}</span>
                    </div>
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "8px", fontStyle: "italic", textAlign: "center", color: "var(--text-secondary)" }}>
                      "{calendarInfo.thought}"
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="top-strip-center">
          ⚡ {topBreakingText}
        </div>

        <div className="top-strip-right">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="top-strip-link"><FaFacebookF /></a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="top-strip-link"><FaTwitter /></a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="top-strip-link"><FaYoutube /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="top-strip-link"><FaInstagram /></a>
          <span>|</span>
          <span className="top-strip-link" onClick={() => triggerPushPermission()}><FaBell /> அறிவிப்புகள்</span>
        </div>
      </div>

      {/* LAYER 2: MAIN HEADER BAR */}
      <div className="header-main-bar">
        <div className="brand-section" onClick={() => navigate("/")}>
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

        <div className="main-bar-actions">
          {/* SEARCH OVERLAY TRIGGER */}
          <button className="header-icon-btn" onClick={() => setShowSearchOverlay(true)} title="தேடுக">
            <FaSearch />
          </button>



          {/* DARK MODE TOGGLE */}
          <button className="header-icon-btn" onClick={() => setDarkMode(!darkMode)} title="தீம் மாற்றுக">
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
                userSelect: "none"
              }}
              title="நீங்கள் ஒரு பிரீமியம் உறுப்பினர்!"
            >
              PREMIUM 👑
            </div>
          ) : (
            <button 
              className="subscribe-header-btn" 
              style={{ 
                backgroundColor: "#22c55e", 
                color: "#fff", 
                border: "none", 
                padding: "8px 16px", 
                borderRadius: "var(--border-radius-sm)", 
                fontWeight: "700", 
                fontSize: "0.85rem",
                cursor: "pointer",
                marginRight: "10px",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2)",
                transition: "transform 0.15s ease"
              }} 
              onClick={() => navigate("/subscribe")}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
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
      <DateBar />

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
                    சமீபத்திய {item.name} செய்திகள்:
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
                          <div className="mega-dropdown-title">{article.titleTa || article.title}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ gridColumn: "span 4", color: "var(--text-muted)", fontSize: "0.88rem" }}>செய்திகள் ஏற்றப்படுகின்றன...</p>
                    )}
                  </div>
                </div>
                <div className="mega-dropdown-sidebar">
                  <h5 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", marginBottom: "10px" }}>பகுதிகள்:</h5>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                    <li style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => { navigate(item.slug); setHoveredCategory(null); }}>செய்தித் தொகுப்பு &rarr;</li>
                    <li style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => { navigate("/latest-news"); setHoveredCategory(null); }}>தற்போதைய நிகழ்வுகள்</li>
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